"""Wolne Lektury (Polish): public-domain and freely licensed books with EPUBs.

https://wolnelektury.pl/info/prawa/ — every work is public domain or under a free licence; the
foundation's editorial additions are CC BY-SA 3.0 / Free Art Licence. Contemporary works carry
their own licence, read from the dc:rights header of the book's source XML.
"""
import re

from .common import clean, edition, licence_from_text, natural_person

NAME = 'Wolne Lektury'
API = 'https://wolnelektury.pl/api'
LANG = {'pol': 'pl', 'ger': 'de', 'deu': 'de', 'lit': 'lt', 'fre': 'fr', 'fra': 'fr', 'eng': 'en', 'lat': 'la',
        'rus': 'ru', 'ukr': 'uk', 'epo': 'eo', 'ita': 'it', 'spa': 'es', 'heb': 'he', 'yid': 'yi', 'csb': 'csb'}


def _rights(fetcher, slug):
    head = fetcher.bytes('https://wolnelektury.pl/media/book/xml/' + slug + '.xml', 'wolnelektury/xml/' + slug + '.head',
                         headers={'Range': 'bytes=0-12287'}).decode('utf-8', 'ignore')
    match = re.search(r'<dc:rights(?:\s[^>]*)?>(.*?)</dc:rights>', head, re.S)
    licence = re.search(r'<dc:rights\.license(?:\s[^>]*)?>(.*?)</dc:rights\.license>', head, re.S)
    return clean(match[1]) if match else '', clean(licence[1]) if licence else ''


def fetch(fetcher, report):
    fetcher.delay = max(fetcher.delay, 0.15)
    parents = fetcher.json(API + '/parent_books/', 'wolnelektury/parent_books.json')
    editions, skipped = [], 0
    for item in parents:
        slug = item['slug']
        detail = fetcher.json(API + '/books/' + slug + '/', 'wolnelektury/books/' + slug + '.json')
        translators = [natural_person(t['name']) for t in detail.get('translators', [])
                       if t.get('name') and t['name'] != 'tłumacz nieznany']
        rights, licence = 'Public domain (Wolne Lektury)', 'PD'
        if item.get('epoch') == 'Współczesność' or translators:
            # Modern works and 20th-century translations may carry a free licence instead.
            text, url = _rights(fetcher, slug)
            rights = text or rights
            licence = licence_from_text(url + ' ' + text) or ('PD' if re.search(r'domena publiczna', text, re.I) else None)
            if not licence:
                skipped += 1
                continue
        epochs = [e['name'] for e in detail.get('epochs', [])]
        genres = [g['name'] for g in detail.get('genres', [])]
        kinds = [k['name'] for k in detail.get('kinds', [])]
        editions.append(edition(
            NAME, slug, detail.get('title') or item['title'], id='wl:' + slug,
            sourceUrl=detail.get('url') or item['url'], epubUrl=detail.get('epub') or None,
            coverUrl=item.get('simple_thumb') or None,
            authors=[natural_person(a['name']) for a in detail.get('authors', []) if a.get('name')],
            translators=translators, language=[LANG.get(detail.get('language'), detail.get('language') or 'pl')],
            subjects=kinds + genres + epochs, quality='proofread', rights=rights, licence=licence,
            pdAsserted=licence == 'PD'))
    report['skippedUnclearRights'] = skipped
    return editions
