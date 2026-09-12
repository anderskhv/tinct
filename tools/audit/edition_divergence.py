#!/usr/bin/env python3
"""Measure how much each book's modern-en edition actually differs from its original-en.

A modern edition that leaves long paragraphs byte-identical (after punctuation
normalisation) is not a modern edition -- it is the original with light
substitutions. Short paragraphs are excluded because "Yes." is legitimately
identical in any rendering; only paragraphs of 25+ words carry signal.

Usage: python3 tools/audit/edition_divergence.py [threshold-percent]
"""
import glob
import json
import os
import re
import sys

EDITIONS = 'app/public/data/editions'
MIN_WORDS = 25
MIN_SAMPLE = 20


def paragraphs(path):
    try:
        doc = json.load(open(path))
    except Exception:
        return None
    chapters = doc.get('chapters') or doc
    if not isinstance(chapters, list):
        return None
    out = []
    for chapter in chapters:
        if not isinstance(chapter, dict):
            return None
        for para in chapter.get('paragraphs', []):
            out.append(para if isinstance(para, str) else para.get('text', ''))
    return out


def normalise(text):
    for curly, plain in (('’', "'"), ('‘', "'"), ('“', '"'), ('”', '"')):
        text = text.replace(curly, plain)
    return re.sub(r'\s+', ' ', text).strip()


def main():
    threshold = float(sys.argv[1]) if len(sys.argv) > 1 else 20.0
    rows = []
    for original in sorted(glob.glob(f'{EDITIONS}/*-original-en.json')):
        book_id = os.path.basename(original)[: -len('-original-en.json')]
        modern = f'{EDITIONS}/{book_id}-modern-en.json'
        if not os.path.exists(modern):
            continue
        left, right = paragraphs(original), paragraphs(modern)
        if not left or not right or len(left) != len(right):
            continue
        pairs = [(a, b) for a, b in zip(left, right) if len(normalise(a).split()) >= MIN_WORDS]
        if len(pairs) < MIN_SAMPLE:
            continue
        verbatim = sum(1 for a, b in pairs if normalise(a) == normalise(b))
        rows.append((book_id, 100.0 * verbatim / len(pairs), verbatim, len(pairs)))

    rows.sort(key=lambda r: -r[1])
    flagged = [r for r in rows if r[1] >= threshold]
    print(f'{len(rows)} books compared, {len(flagged)} at or above {threshold:.0f}% verbatim\n')
    for book_id, pct, verbatim, total in rows:
        if pct >= threshold:
            print(f'  {pct:5.1f}%  {book_id}  ({verbatim}/{total} substantial paragraphs verbatim)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
