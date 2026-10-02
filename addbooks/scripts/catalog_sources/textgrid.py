"""TextGrid Repository, Digitale Bibliothek: the CC BY 3.0 DE edition of Zeno.org's literature.

Licence: https://textgrid.de/ueber-textgrid/die-digitale-bibliothek-bei-textgrid/ (markup and
metadata CC BY 3.0 DE, credited TextGrid; underlying texts public domain). Zeno.org itself
forbids automated copying, so it is never contacted.

Editions in TextGrid are very granular (single poems, sayings, letters). The builder walks each
author collection and emits a book per prose/drama edition, but one book per folder of short
pieces (Gedichte, Märchen, Briefe ...), whose EPUB the aggregator also produces.
"""
import collections
import hashlib
import re
import urllib.parse
import xml.etree.ElementTree as ET

from .common import clean, edition, person

NAME = 'TextGrid'
API = 'https://textgridlab.org/1.0/tgsearch-public'
PROJECT = 'TGPR-372fe6dc-57f2-6cd4-01b5-2c4bbefcfd3c'
NS = {'tg': 'http://textgrid.info/namespaces/metadata/core/2010',
      'tgs': 'http://www.textgrid.info/namespaces/middleware/tgsearch'}
EDITION = 'text/tg.edition+tg.aggregation+xml'
SHORT_FORMS = re.compile(r'gedicht|lyrik|lieder|ballade|sonett|epigramm|sprüche|spruch|aphoris|fabel|märchen|sage|'
                         r'legende|anekdot|brief|schwänk|schwank|rätsel|xenien|parabel|kalender|rezension|tagebuch', re.I)
RIGHTS = 'Public-domain text; TextGrid markup and metadata CC BY 3.0 DE (credit: TextGrid)'


def _get(fetcher, url):
    key = 'textgrid/' + hashlib.sha256(url.encode()).hexdigest()[:24] + '.xml'
    return ET.fromstring(fetcher.bytes(url, key, timeout=90))


def _text(node, path):
    return clean(node.findtext(path, '', NS))


def _objects(root):
    for result in root.findall('tgs:result', NS):
        node = result.find('tg:object', NS)
        if node is not None:
            yield node


def _collections(fetcher):
    start, found = 0, []
    while True:
        query = urllib.parse.urlencode({'q': 'project.id:' + PROJECT + ' AND format:"text/tg.collection+tg.aggregation+xml"',
                                        'limit': 200, 'start': start})
        page = list(_objects(_get(fetcher, API + '/search?' + query)))
        found += page
        if len(page) < 200:
            return found
        start += 200


def _year(notes):
    # "Erstdruck: Leipzig (Weygand) 1774" or "Entstanden 1805, Erstdruck in: ..., 1808".
    match = re.search(r'(?:Erstdruck|Uraufführung|Erstausgabe)[^.;]*?\b(1[0-9]{3})\b', notes)
    return int(match[1]) if match else None


def _translator(notes):
    match = re.search(r'[Üü]bers(?:\.|etzung|etzt)(?: v\.| von| durch)?\s+([A-ZÄÖÜ][^,;:()]+?)(?:[.,;(]|$)', notes)
    return [person(clean(match[1]))] if match else []


def _walk(fetcher, uri, genre, found, author, depth=0):
    for node in _objects(_get(fetcher, API + '/navigation/agg/' + uri)):
        fmt = _text(node, 'tg:generic/tg:provided/tg:format')
        child = _text(node, 'tg:generic/tg:generated/tg:textgridUri')
        title = _text(node, 'tg:generic/tg:provided/tg:title')
        if fmt == EDITION:
            if title.startswith('Biographie') or re.match(r'^(\d+\.|\[)', title):
                continue
            found.append({'uri': child, 'title': title, 'genre': genre,
                          'author': _text(node, 'tg:edition/tg:agent') or author,
                          'notes': _text(node, 'tg:generic/tg:provided/tg:notes')})
        elif fmt and 'aggregation' in fmt and depth < 6:
            if SHORT_FORMS.search(title):
                found.append({'uri': child, 'title': title, 'genre': title, 'author': author, 'notes': ''})
            else:
                _walk(fetcher, child, title, found, author, depth + 1)


def fetch(fetcher, report):
    fetcher.delay = max(fetcher.delay, 0.2)
    editions, authors_by_collection = [], collections.Counter()
    for node in _collections(fetcher):
        title = _text(node, 'tg:generic/tg:provided/tg:title')
        uri = _text(node, 'tg:generic/tg:generated/tg:textgridUri')
        # Collection titles are "Goethe: Werke" or "Kleist, Heinrich von".
        author = title.split(':', 1)[0] if ':' in title else title
        found = []
        _walk(fetcher, uri, None, found, author)
        authors_by_collection[title] = len(found)
        for item in found:
            uid = item['uri'].replace('textgrid:', '')
            notes = item['notes']
            name = item['author']
            subtitle = None
            if SHORT_FORMS.search(item['title']) and item['genre'] == item['title']:
                subtitle = 'Sammlung'
            editions.append(edition(
                NAME, uid, item['title'], id='tg:' + uid, subtitle=subtitle,
                sourceUrl='https://textgridrep.org/browse/' + item['uri'],
                epubUrl='https://textgridlab.org/1.0/aggregator/epub/' + item['uri'],
                authors=[person(name)] if name else [], translators=_translator(notes),
                language=['de'], firstPublishedYear=_year(notes),
                subjects=[item['genre']] if item['genre'] else [], quality='proofread',
                rights=RIGHTS, licence='CC BY 3.0 DE'))
    report['collections'] = len(authors_by_collection)
    return editions
