"""Projekt Runeberg: Nordic texts (Swedish, Norwegian, Danish, Finnish, Icelandic).

Bulk title/author lists from https://runeberg.org/authors/ (built nightly). Runeberg also hosts
works still in copyright, so the builder applies life+70 to every author, co-author and
translator (https://runeberg.org/admin/copyright.html). Download URLs are never fetched
(robots.txt disallows /download.pl); editions link to the work's landing page.
"""
from .common import clean, decode_lines, edition, integer, natural_person, public_domain_cutoff

NAME = 'Projekt Runeberg'
BASE = 'https://runeberg.org/authors/'


def _rows(fetcher, name):
    for line in decode_lines(fetcher.bytes(BASE + name, 'runeberg/' + name)):
        if line and not line.startswith('#'):
            yield [clean(x) for x in line.split('|')]


def fetch(fetcher, report):
    fetcher.delay = max(fetcher.delay, 2)  # robots.txt Crawl-delay
    cutoff = public_domain_cutoff()
    people = {}
    for row in _rows(fetcher, 'a.lst'):
        if len(row) >= 7 and row[6]:
            name = clean(row[3] + ' ' + row[2]) if row[3] else row[2]
            people[row[6]] = natural_person(name, integer(row[0]), integer(row[1]))
    editions, skipped = [], 0
    for row in _rows(fetcher, 't.lst'):
        if len(row) < 5 or not row[1]:
            continue
        row += [''] * (9 - len(row))
        title, key, authors, languages, first = row[0].strip('"'), row[1], row[2].split(), row[3].split(), integer(row[4])
        creators = [people.get(k) for k in authors + row[6].split() + row[7].split()]
        translators = [people[k] for k in row[7].split() if k in people]
        def free(p):
            return p is not None and (p['deathYear'] is not None and p['deathYear'] < cutoff or
                                      p['deathYear'] is None and p['birthYear'] is not None and p['birthYear'] < cutoff - 100)
        clear = all(free(p) for p in creators) if creators else (first is not None and first < cutoff - 100)
        if not clear:
            skipped += 1
            continue
        editions.append(edition(
            NAME, key, title, id='rb:' + key, sourceUrl='https://runeberg.org/' + key + '/',
            authors=[people[k] for k in authors + row[6].split() if k in people], translators=translators,
            language=[{'nb': 'no', 'nn': 'no'}.get(l, l) for l in languages] or ['und'],
            originalLanguage=row[8].split()[0] if row[8].split() and row[8].split() != languages else None,
            firstPublishedYear=first, quality='standard',
            rights='Public domain (life+70 computed from Runeberg author data)', licence='PD'))
    report['skippedInCopyrightOrUnknown'] = skipped
    return editions
