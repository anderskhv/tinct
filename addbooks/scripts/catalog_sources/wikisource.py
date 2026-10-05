"""Wikisource in twelve languages, enumerated through Wikidata (CC0 metadata).

Texts on Wikisource are public domain or freely licensed; transcriptions are CC BY-SA 4.0. The
builder's life+70 gate decides from Wikidata author/translator dates, so modern CC-licensed
works are excluded. Stage 1 lists items of book-like classes with a sitelink to each Wikisource;
stage 2 fetches details in batches. Subpages ("/"), parts (P361) and pieces published in a
periodical or collection (P1433) are skipped: the index is of whole books. EPUBs are generated
on demand by ws-export (https://ws-export.wmcloud.org/).
"""
import hashlib
import json
import re
import urllib.parse

from .common import clean, edition, integer, natural_person

NAME = 'Wikisource'
SPARQL = 'https://query.wikidata.org/sparql'
LANGUAGES = ['da', 'sv', 'no', 'nl', 'la', 'pt', 'es', 'it', 'fr', 'pl', 'de', 'en']
# Edition/translation, literary work, written work, book, novel, poem collection(s), play, ...
CLASSES = ['Q3331189', 'Q7725634', 'Q47461344', 'Q571', 'Q8261', 'Q25379', 'Q5185279', 'Q49084', 'Q1279564',
           'Q699', 'Q1372064', 'Q12106333']
VALIDATED, PROOFREAD = 'http://www.wikidata.org/entity/Q20748093', 'http://www.wikidata.org/entity/Q20748092'

STAGE1 = '''SELECT ?item WHERE {
  ?page schema:isPartOf <https://%s.wikisource.org/> ; schema:about ?item .
  ?item wdt:P31 wd:%s .
}'''
STAGE2 = '''SELECT ?item ?page ?title ?sitelinks ?badge
  (SAMPLE(?partOf) AS ?part) (SAMPLE(?pubIn) AS ?publishedIn)
  (GROUP_CONCAT(DISTINCT ?langCode; SEPARATOR=";") AS ?langs) (MIN(?pub) AS ?pubDate)
  (GROUP_CONCAT(DISTINCT ?workLabel; SEPARATOR=";;") AS ?workLabels)
  (GROUP_CONCAT(DISTINCT ?genreLabel; SEPARATOR=";;") AS ?genres)
  (GROUP_CONCAT(DISTINCT ?authorInfo; SEPARATOR=";;") AS ?authors)
  (GROUP_CONCAT(DISTINCT ?trInfo; SEPARATOR=";;") AS ?translators)
WHERE {
  VALUES ?item { %s }
  ?page schema:about ?item ; schema:isPartOf <https://%s.wikisource.org/> ; schema:name ?title .
  ?item wikibase:sitelinks ?sitelinks .
  OPTIONAL { ?page wikibase:badge ?badge }
  OPTIONAL { ?item wdt:P361 ?partOf } OPTIONAL { ?item wdt:P1433 ?pubIn }
  OPTIONAL { ?item wdt:P407/wdt:P218 ?langCode }
  OPTIONAL { ?item wdt:P577 ?pub }
  OPTIONAL { ?item wdt:P629 ?work . OPTIONAL { ?work rdfs:label ?workLabel FILTER(lang(?workLabel)="en") } }
  OPTIONAL { ?item wdt:P136 ?genre . ?genre rdfs:label ?genreLabel FILTER(lang(?genreLabel)="en") }
  OPTIONAL { ?item wdt:P50|wdt:P629/wdt:P50 ?a .
             OPTIONAL { ?a rdfs:label ?aL FILTER(lang(?aL)="en") } OPTIONAL { ?a rdfs:label ?aL2 FILTER(lang(?aL2)="%s") }
             OPTIONAL { ?a wdt:P569 ?ab } OPTIONAL { ?a wdt:P570 ?ad }
             BIND(CONCAT(COALESCE(?aL2, ?aL, ""),"|",COALESCE(STR(YEAR(?ab)),""),"|",COALESCE(STR(YEAR(?ad)),"")) AS ?authorInfo) }
  OPTIONAL { ?item wdt:P655 ?t .
             OPTIONAL { ?t rdfs:label ?tL FILTER(lang(?tL)="en") } OPTIONAL { ?t rdfs:label ?tL2 FILTER(lang(?tL2)="%s") }
             OPTIONAL { ?t wdt:P569 ?tb } OPTIONAL { ?t wdt:P570 ?td }
             BIND(CONCAT(COALESCE(?tL2, ?tL, ""),"|",COALESCE(STR(YEAR(?tb)),""),"|",COALESCE(STR(YEAR(?td)),"")) AS ?trInfo) }
}
GROUP BY ?item ?page ?title ?sitelinks ?badge'''


def _query(fetcher, query, cache):
    data = urllib.parse.urlencode({'query': query}).encode()
    body = fetcher.bytes(SPARQL, 'wikisource/' + cache, data=data, timeout=90,
                         headers={'Accept': 'application/sparql-results+json',
                                  'Content-Type': 'application/x-www-form-urlencoded'})
    return json.loads(body)['results']['bindings']


def _people(packed):
    people = []
    for chunk in (packed or '').split(';;'):
        name, _, rest = chunk.partition('|')
        birth, _, death = rest.partition('|')
        # Wikidata labels that are bare QIDs mean no usable name.
        if clean(name) and not re.fullmatch(r'Q\d+', clean(name)):
            people.append(natural_person(name, integer(birth), integer(death)))
    return people


def fetch(fetcher, report):
    fetcher.delay = max(fetcher.delay, 1.0)  # Wikidata allows 60 s of query time per minute.
    editions, counts, seen = [], {}, set()
    for lang in LANGUAGES:
        items = set()
        for cls in CLASSES:
            rows = _query(fetcher, STAGE1 % (lang, cls), 'ids-%s-%s.json' % (lang, cls))
            items |= {r['item']['value'].rsplit('/', 1)[1] for r in rows}
        items = sorted(items, key=lambda q: int(q[1:]))
        kept = 0
        for start in range(0, len(items), 200):
            batch = items[start:start + 200]
            values = ' '.join('wd:' + q for q in batch)
            key = hashlib.sha256(values.encode()).hexdigest()[:16]
            for r in _query(fetcher, STAGE2 % (values, lang, lang, lang), 'details-%s-%s.json' % (lang, key)):
                get = lambda k: r.get(k, {}).get('value')
                title = get('title') or ''
                if '/' in title or get('part') or get('publishedIn'):
                    continue
                qid = get('item').rsplit('/', 1)[1]
                if lang + ':' + qid in seen:  # one row per sitelink badge
                    continue
                seen.add(lang + ':' + qid)
                published = integer((get('pubDate') or '')[:5].rstrip('-')) if get('pubDate') else None
                authors, translators = _people(get('authors')), _people(get('translators'))
                # Wikidata editions sometimes list their translator under P50 as well.
                authors = [p for p in authors if p['name'] not in {t['name'] for t in translators}]
                badge = get('badge')
                editions.append(edition(
                    # Drop a disambiguating "(1862)" suffix and it.wikisource's "Opera:" namespace prefix.
                    NAME, lang + ':' + qid, re.sub(r'^Opera:', '', re.sub(r'\s*\([^)]*\)\s*$', '', title)),
                    id='ws:' + lang + ':' + qid, sourceUrl=get('page'),
                    epubUrl='https://ws-export.wmcloud.org/?format=epub&lang=' + lang + '&page=' + urllib.parse.quote(title.replace(' ', '_')),
                    authors=authors, translators=translators,
                    language=[l for l in (get('langs') or '').split(';') if l] or [lang],
                    firstPublishedYear=published if not translators else None,
                    altTitles=[t for t in (get('workLabels') or '').split(';;') if t and t != title],
                    subjects=[g for g in (get('genres') or '').split(';;') if g],
                    popularity=0, notability=integer(get('sitelinks')) or 0,
                    quality='proofread' if badge in (VALIDATED, PROOFREAD) else 'standard',
                    rights='Public-domain text; Wikisource transcription CC BY-SA 4.0', licence='CC BY-SA 4.0',
                    # Anonymous texts: only clearly old publications count as public domain.
                    pdAsserted=not authors and not translators and published is not None and published < 1900))
                kept += 1
        counts[lang] = {'candidates': len(items), 'books': kept}
        print('Wikisource ' + lang + ': ' + str(kept) + ' books from ' + str(len(items)) + ' items', flush=True)
    report['languages'] = counts
    return editions
