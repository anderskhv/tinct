#!/usr/bin/env python3
"""Coordinate maps for an in-place replacement of a book's text by an unrelated
translation (different wording AND different paragraph structure).

usage: build-replacement-migration.py <bookId> <structure-map.json> <before-dir> <revision> [<edition> ...]

Editions default to original-en and modern-en. <before-dir> holds
<bookId>-<edition>.before.json (the live files before the swap); the new files
are read from app/public/data/editions. <structure-map.json> is the content
package's counts-only proportional map (any of the four layouts the Codex
packages used is accepted; it is cross-checked against the real before/after
paragraph counts and against the proportional rule).

Writes app/public/data/edition-migrations/<bookId>.{positions,highlights}.json
in the format of app/src/data/editionCoordinateMigration.ts. Every old
paragraph gets an entry (a missing entry would mean "unchanged coordinate"),
operation `renumber`, and one `replace` word span, so a reading place lands
proportionally inside the mapped paragraph (status `approximate`) and a
highlight can never be proven exact: it stays unresolved and recoverable with
its own quote and note. Old paragraph text is deliberately NOT embedded (the
replaced translation must not stay in published data); highlight migration
cannot succeed across unrelated wording, so it is not needed.
Deterministic.
"""
import hashlib
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'app', 'public', 'data', 'edition-migrations')
EDITIONS = os.path.join(ROOT, 'app', 'public', 'data', 'editions')


def dump(path, data):
    text = json.dumps(data, separators=(',', ':'), ensure_ascii=False) + '\n'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def utf16(text):
    return len(text.encode('utf-16-le')) // 2


def proportional(old_count, new_count):
    """0-based, half-up, endpoint preserving. The rule the packages state."""
    if old_count <= 1 or new_count <= 1:
        return [0] * old_count
    return [(2 * i * (new_count - 1) + (old_count - 1)) // (2 * (old_count - 1)) for i in range(old_count)]


def package_map(smap, edition):
    """chapter number -> list of 0-based new paragraph index per old index, from whichever layout the package used."""
    result = {}
    if 'oldEditions' in smap:  # the-art-of-war
        for ch in smap['oldEditions'][edition]['chapters']:
            result[ch['oldChapter']] = ch['newParagraphIndexByOldIndex']
    elif 'map' in smap:  # magna-carta: 1-based paragraph, single chapter
        for row in smap['map']:
            result.setdefault(row['old']['chapter'], []).append(row['new']['paragraph'] - 1)
    else:  # medea, bacchae: per chapter paragraph lists, 1-based
        for ch in smap['chapters']:
            rows = ch.get('paragraphMap') or ch['paragraphs']
            result[ch['oldChapter']] = [r['newParagraph'] - 1 for r in rows]
    return result


def main():
    book, map_path, before_dir, revision, *editions = sys.argv[1:]
    editions = editions or ['original-en', 'modern-en']
    smap = json.load(open(map_path))
    os.makedirs(OUT, exist_ok=True)
    out = {}
    for edition in editions:
        before_raw = open(os.path.join(before_dir, f'{book}-{edition}.before.json'), 'rb').read()
        after_raw = open(os.path.join(EDITIONS, f'{book}-{edition}.json'), 'rb').read()
        before, after = json.loads(before_raw), json.loads(after_raw)
        old_counts = {c['number']: len(c['paragraphs']) for c in before['chapters']}
        new_counts = {c['number']: len(c['paragraphs']) for c in after['chapters']}
        if sorted(old_counts) != sorted(new_counts):
            sys.exit(f'{book}/{edition}: chapter numbers differ; this tool keeps chapter identity')
        given = package_map(smap, edition)
        entries = {}
        for old_ch in before['chapters']:
            number = old_ch['number']
            targets = given[number]
            if len(targets) != old_counts[number]:
                sys.exit(f'{book}/{edition} ch {number}: package map covers {len(targets)} of {old_counts[number]} old paragraphs')
            rule = proportional(old_counts[number], new_counts[number])
            if targets != rule:
                # Magna Carta's package used floor rather than half-up; accept any monotone in-range map.
                if any(b < a for a, b in zip(targets, targets[1:])) or any(not 0 <= t < new_counts[number] for t in targets):
                    sys.exit(f'{book}/{edition} ch {number}: package map is not monotone/in range')
            new_ch = next(c for c in after['chapters'] if c['number'] == number)
            for index, old_text in enumerate(old_ch['paragraphs']):
                target = targets[index]
                old_words, new_words = len(old_text.split()), len(new_ch['paragraphs'][target].split())
                entries[f'{number}.{index}'] = {
                    'chapter': number, 'paragraph': target, 'operation': 'renumber',
                    'oldWords': old_words, 'newWords': new_words,
                    'oldChars': utf16(old_text), 'newChars': utf16(new_ch['paragraphs'][target]),
                    'words': [['replace', 0, old_words, 0, new_words]], 'chars': [],
                }
        out[edition] = {
            'beforeSha256': hashlib.sha256(before_raw).hexdigest(),
            'afterSha256': hashlib.sha256(after_raw).hexdigest(),
            'paragraphCountsBefore': {str(k): v for k, v in old_counts.items()},
            'paragraphCountsAfter': {str(k): v for k, v in new_counts.items()},
            'entries': entries,
        }
        print(book, edition, 'before', out[edition]['beforeSha256'], 'after', out[edition]['afterSha256'], len(entries), 'old paragraphs mapped')
    for kind in ('positions', 'highlights'):
        path = os.path.join(OUT, f'{book}.{kind}.json')
        print(os.path.relpath(path, ROOT), dump(path, {'revision': revision, 'bookId': book, 'editions': out}), os.path.getsize(path))


if __name__ == '__main__':
    main()
