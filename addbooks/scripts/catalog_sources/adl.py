"""Arkiv for Dansk Litteratur (Royal Danish Library, tekster.kb.dk): Danish classics.

Uses the published rights overview (https://tekster.kb.dk/pages/adl-overview-copyright) and indexes
only volumes marked FRI (text free of copyright). KB labels its digital edition CC BY-NC-SA;
volumes under DSL copyright or typesetting protection are excluded.
"""
import html
import re

from .common import clean, edition, integer, person

NAME = 'Arkiv for Dansk Litteratur'
URL = 'https://tekster.kb.dk/pages/adl-overview-copyright'


def fetch(fetcher, report):
    page = fetcher.bytes(URL, 'adl/copyright.html', timeout=180).decode('utf-8')
    body = page[page.find('<tbody class="cp">'):]
    editions, skipped = [], 0
    for _, row in re.findall(r'<tr class="(\w+)">(.*?)</tr>', body, re.S):
        cells = [clean(html.unescape(re.sub(r'<[^>]+>', '', c))) for c in re.findall(r'<td>(.*?)</td>', row, re.S)]
        href = re.search(r'href="([^"]+)"', row)
        if len(cells) < 7 or not href:
            continue
        if cells[0] != 'FRI':
            skipped += 1
            continue
        volume = href[1].rstrip('/').rsplit('/', 1)[-1]
        # "Title : subtitle. - 1919. Kbh., Gyldendal, 1918-19."
        title = re.split(r'\.\s+-\s+', cells[4], maxsplit=1)[0]
        title, _, subtitle = title.partition(' : ')
        imprint = re.search(r'\b(1[5-9]\d\d)\b', cells[4][len(title):])
        editions.append(edition(
            NAME, volume, title, id='adl:' + volume, subtitle=clean(subtitle) or None,
            sourceUrl='https://tekster.kb.dk' + href[1] if href[1].startswith('/') else href[1],
            authors=[person(cells[1].rstrip('.'), integer(cells[2]), integer(cells[3]))] if cells[1] else [],
            language=['da'], editionYear=int(imprint[1]) if imprint else None, quality='proofread',
            rights='Public-domain text (FRI); Royal Danish Library digital edition CC BY-NC-SA', licence='CC BY-NC-SA'))
    report['skippedProtected'] = skipped
    return editions
