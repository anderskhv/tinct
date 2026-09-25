#!/usr/bin/env python3
"""Publish the accepted structural coordinate maps for the reader.

Input: books/wip/structure-migration-20260924/<book>.json, verified against
the sha256 recorded in its SUMMARY.json. Output, per book, under
app/public/data/edition-migrations/:

  <book>.positions.json   word ops only: moves reading places (small)
  <book>.highlights.json  word ops + old paragraph text: moves highlights,
                          which must match their full quote exactly

Character ops are dropped: the reader stores word coordinates only.
Run from the repository root. Deterministic; re-running is a no-op.
"""
import hashlib
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'books', 'wip', 'structure-migration-20260924')
OUT = os.path.join(ROOT, 'app', 'public', 'data', 'edition-migrations')


def dump(path, data):
    text = json.dumps(data, separators=(',', ':'), ensure_ascii=False) + '\n'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def main():
    summary = json.load(open(os.path.join(SRC, 'SUMMARY.json')))
    os.makedirs(OUT, exist_ok=True)
    for item in summary:
        book = item['book']
        raw = open(os.path.join(SRC, f'{book}.json'), 'rb').read()
        digest = hashlib.sha256(raw).hexdigest()
        if digest != item['sha256']:
            sys.exit(f'{book}: map sha256 {digest} does not match SUMMARY {item["sha256"]}')
        source = json.loads(raw)
        for kind in ('positions', 'highlights'):
            editions = {}
            for key, edition in source['editions'].items():
                entries = {}
                for coord, entry in edition['entries'].items():
                    out = {k: entry[k] for k in ('chapter', 'paragraph', 'operation', 'oldWords', 'newWords', 'oldChars', 'newChars', 'words')}
                    out['chars'] = []
                    if kind == 'highlights':
                        out['oldText'] = entry['oldText']
                    entries[coord] = out
                editions[key] = {k: edition[k] for k in ('beforeSha256', 'afterSha256', 'paragraphCountsBefore', 'paragraphCountsAfter')}
                editions[key]['entries'] = entries
            data = {'revision': source['revision'], 'bookId': book, 'sourceSha256': digest, 'editions': editions}
            path = os.path.join(OUT, f'{book}.{kind}.json')
            print(f'{os.path.relpath(path, ROOT)} {dump(path, data)} {os.path.getsize(path)}')


if __name__ == '__main__':
    main()
