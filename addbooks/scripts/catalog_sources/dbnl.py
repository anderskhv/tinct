"""DBNL (Digitale Bibliotheek voor de Nederlandse Letteren): public-domain collection CSV.

https://www.dbnl.org/letterkunde/pd/index.php states the listed titles are public domain and
may be used for any purpose. Only this one published list is fetched; EPUBs and text pages are
never crawled (robots.txt disallows crawling), so editions link to the landing page only.
"""
import collections
import csv
import io

from .common import edition, integer, natural_person

NAME = 'DBNL'
URL = 'https://www.dbnl.org/extern/titels_pd.php'


def fetch(fetcher, report):
    text = fetcher.bytes(URL, 'dbnl/titels_pd.csv').decode('utf-8-sig')
    if text.startswith('sep='):
        text = text.split('\n', 1)[1]
    rows = collections.defaultdict(list)
    for row in csv.DictReader(io.StringIO(text), delimiter='|'):
        if row.get('ti_id'):
            rows[row['ti_id'].strip()].append(row)
    editions = []
    for ti_id, group in rows.items():
        first = group[0]
        people, genres = {}, set()
        for row in group:
            name = ' '.join(x.strip() for x in (row['voornaam'], row['voorvoegsel'], row['achternaam']) if x and x.strip())
            if row['pers_id'] and name:
                people[row['pers_id']] = natural_person(name, integer(row['jaar_geboren']), integer(row['jaar_overlijden']))
            if row.get('genre', '').strip():
                genres.add(row['genre'].strip())
        editions.append(edition(
            NAME, ti_id, first['titel'], id='dbnl:' + ti_id,
            sourceUrl='https://www.dbnl.org/titels/titel.php?id=' + ti_id,
            # DBNL lists no role column: translators cannot be told apart from authors.
            authors=list(people.values()), language=['nl'],
            firstPublishedYear=integer(first['_jaar']) if (first['druk'] or '').startswith('1ste') else None,
            subjects=sorted(genres), quality='proofread',
            rights='Public domain (DBNL Collectie publiek domein)', licence='PD', pdAsserted=True))
    report['rows'] = sum(len(g) for g in rows.values())
    return editions
