"""Bokselskap.no (Norwegian): ~480 edited classics with EPUB, published with Nasjonalbiblioteket.

Terms (https://www.bokselskap.no/hjelp_om): free for private, non-commercial purposes. Letters are
skipped (they are listed as individual items); editions link to the book page and EPUB file.
"""
import html
import re

from .common import clean, edition, integer, natural_person

NAME = 'Bokselskap'
URL = 'https://www.bokselskap.no/boker'
EPUB = 'https://www.bokselskap.no/wp-content/themes/bokselskap2/tekster/epub/{}.epub'


def fetch(fetcher, report):
    page = fetcher.bytes(URL, 'bokselskap/boker.html', timeout=180).decode('utf-8')
    editions = []
    for cls, attrs, body in re.findall(r'<li class="(bok(?: brev)? visible)"([^>]*)>(.*?)</li>', page, re.S):
        if 'brev' in cls:
            continue
        data = {k: clean(html.unescape(v)) for k, v in re.findall(r'data-([a-z-]+)="([^"]*)"', attrs)}
        href = re.search(r'href="([^"]+)"', body)
        title = re.search(r'class="book_title">(.*?)</span>', body, re.S)
        cover = re.search(r"url\('([^']+)'\)", body)
        if not href or not title:
            continue
        title = clean(html.unescape(re.sub(r'<[^>]+>', '', title[1])))
        if 'TESTVISNING' in title.upper():
            continue
        slug = href[1].rstrip('/').rsplit('/', 1)[-1]
        authors = [natural_person(a) for a in re.split(r'\s*(?:,| og )\s*', data.get('forfatter', '')) if a]
        editions.append(edition(
            NAME, slug, title, id='bs:' + slug, sourceUrl=href[1], epubUrl=EPUB.format(slug),
            coverUrl=cover[1] if cover else None, authors=authors, language=['no'],
            firstPublishedYear=integer(data.get('utg-ar')) or None,
            subjects=[s for s in re.split(r',\s*', data.get('sjanger', '')) if s], quality='proofread',
            rights='Edited public-domain text; free for private, non-commercial use (Bokselskap)',
            licence='Free, non-commercial'))
    return editions
