"""Litteraturbanken (Swedish): proofread e-texts with EPUBs and per-work licences.

Licences: https://litteraturbanken.se/red/etc/license/license.json. Only `cc-0` (CC0 edition of a
public-domain text) is indexed; copyrighted `lb-2-*` and editions with non-commercial or
no-derivatives terms (`lb-svs`, `lb-assv`, `lb-sa`, ...) are excluded.
"""
import urllib.parse

from .common import edition, integer, natural_person

NAME = 'Litteraturbanken'
API = 'https://litteraturbanken.se/api/list_all/etext?from={start}&to={end}&include=' + ','.join([
    'lbworkid', 'title', 'shorttitle', 'titleid', 'language', 'sort_date', 'imprintyear', 'keyword', 'texttype',
    'popularity', 'epub_popularity', 'license', 'has_epub', 'url', 'main_author', 'authors', 'proofread'])
# lb-svs/lb-assv editions carry non-commercial editorial matter, so only CC0 editions are used.
LICENCES = {'cc-0': ('PD', 'Public-domain text; Litteraturbanken edition CC0')}
LANG = {'swe': 'sv', 'fra': 'fr', 'eng': 'en', 'deu': 'de', 'ger': 'de', 'smi': 'smi', 'fin': 'fi', 'lat': 'la', 'dan': 'da', 'nor': 'no'}


def _person(p):
    return natural_person(p.get('full_name') or p.get('name_for_index', ''), integer((p.get('birth') or {}).get('plain')),
                          integer((p.get('death') or {}).get('plain')), p.get('other_name') or [])


def fetch(fetcher, report):
    rows, start = [], 0
    while True:
        page = fetcher.json(API.format(start=start, end=start + 500), 'litteraturbanken/etext-%d.json' % start)
        rows += page.get('data', [])
        start += 500
        if start >= page.get('hits', 0) or not page.get('data'):
            break
    editions, skipped, seen = [], 0, set()
    for r in rows:
        if r.get('license') not in LICENCES or r['lbworkid'] in seen:
            skipped += r.get('license') not in LICENCES
            continue
        seen.add(r['lbworkid'])
        licence, rights = LICENCES[r['license']]
        people = r.get('authors') or ([r['main_author']] if r.get('main_author') else [])
        main = r.get('main_author') or (people[0] if people else {})
        epub = None
        if r.get('has_epub') and main.get('authorid') and r.get('titleid'):
            epub = 'https://litteraturbanken.se/api/epub/' + urllib.parse.quote(main['authorid'] + '_' + r['titleid']) + '.epub'
        editions.append(edition(
            NAME, r['lbworkid'], r.get('title') or r.get('shorttitle'), id='lb:' + r['lbworkid'],
            sourceUrl='https://litteraturbanken.se' + urllib.parse.quote(r['url']) if r.get('url') else None, epubUrl=epub,
            authors=[_person(p) for p in people if p.get('type') in (None, 'author')],
            translators=[_person(p) for p in people if p.get('type') == 'translator'],
            language=[LANG.get(r.get('language'), r.get('language') or 'sv')],
            subjects=(r.get('keyword') or []) + ([r['texttype']] if r.get('texttype') else []),
            editionYear=integer((r.get('sort_date') or {}).get('plain')),
            popularity=0, notability=integer(r.get('popularity')) or 0,
            quality='proofread' if r.get('proofread') else 'standard', rights=rights, licence=licence,
            pdAsserted=r['license'] == 'cc-0'))
    report['skippedRestrictedLicence'] = skipped
    return editions
