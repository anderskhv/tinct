"""Ebooks libres et gratuits (French): ~3,250 proofread public-domain ebooks.

Terms (https://www.ebooksgratuits.com/index.php): free use for non-commercial purposes. Indexed
as metadata with a link to the landing page; "auteur contemporain" texts are excluded.
"""
import re

from .common import edition, person
from .opds import entries

NAME = 'Ebooks libres et gratuits'
FEED = 'https://www.ebooksgratuits.com/opds/feed.php?mode={mode}&page={page}'


def fetch(fetcher, report):
    # The popularity-ordered feed gives a rank; convert it into a small bounded score.
    rank = {}
    for page in range(60):
        batch = list(entries(fetcher.bytes(FEED.format(mode='rate', page=page), 'ebooksgratuits/rate-%d.xml' % page), FEED))
        if not batch:
            break
        for e in batch:
            rank.setdefault(e['id'], len(rank))
    editions, skipped = [], 0
    for page in range(60):
        batch = list(entries(fetcher.bytes(FEED.format(mode='all', page=page), 'ebooksgratuits/all-%d.xml' % page), FEED))
        if not batch:
            break
        for e in batch:
            if re.search(r'contemporain|n.étant pas libre de droits', e['content'], re.I):
                skipped += 1
                continue
            book = re.search(r'book=(\d+)', e['id'])
            if not book:
                continue
            position = rank.get(e['id'])
            editions.append(edition(
                NAME, book[1], e['title'], id='elg:' + book[1], sourceUrl=e['html'] or e['id'], epubUrl=e['epub'],
                authors=[person(a) for a in e['authors']], language=e['language'] or ['fr'], subjects=e['categories'],
                popularity=0 if position is None else max(0, 3000 - position),
                quality='proofread', rights='Public-domain text; free for non-commercial use (Ebooks libres et gratuits)',
                licence='Free, non-commercial'))
    report['skippedContemporary'] = skipped
    return editions
