"""Bibliothèque numérique romande (French): ~1,500 proofread ebooks with covers.

Terms (https://ebooks-bnr.com/): free download for non-commercial use. The bare-domain COPS
OPDS server lists every book per initial letter.
"""
import string

from .common import edition, natural_person
from .opds import entries

NAME = 'Bibliothèque numérique romande'
BASE = 'https://ebooks-bnr.com/opds/'


def fetch(fetcher, report):
    editions, seen = [], set()
    for letter in string.ascii_uppercase + '0':
        url = BASE + 'index.php?page=5&id=' + letter
        # The host answers 403 intermittently, so 403 is retried here.
        data = fetcher.bytes(url, 'bnr/letter-' + letter + '.xml', attempts=8, retry=(403, 429, 500, 502, 503, 504))
        for e in entries(data, BASE):
            uid = e['id'].replace('urn:uuid:', '')
            if not uid or uid in seen:
                continue
            seen.add(uid)
            editions.append(edition(
                NAME, uid, e['title'], id='bnr:' + uid, sourceUrl=e['html'] or 'https://ebooks-bnr.com/', epubUrl=e['epub'],
                coverUrl=e['cover'], authors=[natural_person(a) for a in e['authors']], language=e['language'] or ['fr'],
                subjects=[c for c in e['categories'] if not c.endswith('e') or not c[:-1].isdigit()],
                quality='proofread', rights='Public-domain text; free for non-commercial use (BNR)',
                licence='Free, non-commercial'))
    return editions
