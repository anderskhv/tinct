"""Fail-closed Danish eligibility for the pinned text-only import pilot."""
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / 'app/src/addbooks/danishRights.json'

def eligible(review, year=None):
    year = year if year is not None else datetime.now(timezone.utc).year
    if not isinstance(review, dict) or type(year) is not int:
        return False
    if (review.get('reviewStatus') != 'eligible-under-policy'
            or review.get('basis') != 'named-contributors-life-plus-70'
            or review.get('contributorsComplete') is not True
            or review.get('editionAuditComplete') is not True
            or review.get('specialCasesResolved') is not True
            or review.get('scope') != 'original-text-only'
            or not review.get('evidence')
            or not re.fullmatch('[a-f0-9]{64}', review.get('sourceSha256', ''))
            or not re.fullmatch('[a-f0-9]{64}', review.get('editionSha256', ''))):
        return False
    people = review.get('contributors', [])
    return bool(people) and all(
        p.get('name') and p.get('role') and p.get('evidence')
        and type(p.get('deathYear')) is int and p['deathYear'] <= year - 71
        for p in people)

def require_review(book_id, edition_key, source_url, source_sha256):
    manifest = json.loads(MANIFEST.read_text())
    if manifest.get('jurisdiction') != 'DK' or manifest.get('policyVersion') != 1:
        raise ValueError('Danish rights policy missing or unsupported')
    record = next((r for r in manifest['editions'] if r['bookId'] == book_id and r['editionKey'] == edition_key), None)
    if not eligible(record):
        raise ValueError('Edition excluded: Danish rights evidence missing, unresolved, or term not expired')
    if record['sourceUrl'] != source_url or record['sourceSha256'] != source_sha256:
        raise ValueError('Edition excluded: source differs from Danish rights review')
    return record
