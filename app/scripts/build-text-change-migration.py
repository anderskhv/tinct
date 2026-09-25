#!/usr/bin/env python3
"""Coordinate map for an accepted text change that keeps paragraph structure.

usage: build-text-change-migration.py <bookId> <editionKey> <before.json> <revision>

Writes app/public/data/edition-migrations/<bookId>.{positions,highlights}.json in
the same format as build-coordinate-migrations.py (format of
app/src/data/editionCoordinateMigration.ts). Every paragraph whose text changed
gets a word-level alignment (difflib over whitespace tokens, the reader's token
space): the highlights map aligns equal runs exactly; the positions map places a
reading position proportionally within its paragraph. Paragraph
numbering is unchanged. Deterministic.
"""
import difflib
import hashlib
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'app', 'public', 'data', 'edition-migrations')


def dump(path, data):
    text = json.dumps(data, separators=(',', ':'), ensure_ascii=False) + '\n'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def main():
    book, edition, before_path, revision = sys.argv[1:5]
    after_path = os.path.join(ROOT, 'app', 'public', 'data', 'editions', f'{book}-{edition}.json')
    before_raw, after_raw = open(before_path, 'rb').read(), open(after_path, 'rb').read()
    before, after = json.loads(before_raw), json.loads(after_raw)
    counts = lambda e: {str(c['number']): len(c['paragraphs']) for c in e['chapters']}
    if counts(before) != counts(after):
        sys.exit('paragraph structure differs: use build-coordinate-migrations.py')
    entries = {}
    for old_ch, new_ch in zip(before['chapters'], after['chapters']):
        for index, (old, new) in enumerate(zip(old_ch['paragraphs'], new_ch['paragraphs'])):
            if old == new:
                continue
            a, b = old.split(), new.split()
            ops = [[tag, i1, i2, j1, j2] for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes()]
            entries[f"{old_ch['number']}.{index}"] = {
                'chapter': new_ch['number'], 'paragraph': index, 'operation': 'keep',
                'oldWords': len(a), 'newWords': len(b), 'oldChars': len(old), 'newChars': len(new),
                'words': ops, 'chars': [], 'oldText': old,
            }
    edition_map = {
        'beforeSha256': hashlib.sha256(before_raw).hexdigest(),
        'afterSha256': hashlib.sha256(after_raw).hexdigest(),
        'paragraphCountsBefore': counts(before),
        'paragraphCountsAfter': counts(after),
    }
    os.makedirs(OUT, exist_ok=True)
    for kind in ('positions', 'highlights'):
        # A reading place in rewritten text lands proportionally: one span per
        # paragraph keeps this map small. Highlights need the exact alignment.
        coarse = lambda e: {**{k: v for k, v in e.items() if k != 'oldText'}, 'words': [['replace', 0, e['oldWords'], 0, e['newWords']]]}
        kept = {key: (coarse(entry) if kind == 'positions' else entry) for key, entry in entries.items()}
        data = {'revision': revision, 'bookId': book, 'editions': {edition: {**edition_map, 'entries': kept}}}
        path = os.path.join(OUT, f'{book}.{kind}.json')
        print(os.path.relpath(path, ROOT), dump(path, data), os.path.getsize(path), f'{len(entries)} changed paragraphs')
    print('before', edition_map['beforeSha256'], 'after', edition_map['afterSha256'])


if __name__ == '__main__':
    main()
