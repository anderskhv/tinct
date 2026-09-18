#!/usr/bin/env python3
"""Check every CASES row in app/scripts/verify-character-fixes.cjs resolves to a mention.

The browser suite asserts (and aborts the whole run) on a row whose
(book, edition, chapterHint, characterId) has no mention, so run this
before launching it.
"""
import json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
src = (ROOT / 'app/scripts/verify-character-fixes.cjs').read_text()
rows = re.findall(r"^\s*\['([^']+)',\s*'([^']+)',\s*(\d+|undefined),\s*'([^']+)',\s*(?:'[^']*'|undefined),\s*'([^']+)'\]", src, re.M)
bad = 0
cache = {}
for book, ed, hint, cid, label in rows:
    if book not in cache:
        cache[book] = json.loads((ROOT / f'app/public/data/characters/{book}.v1.json').read_text())
    e = cache[book]['editions'].get(ed)
    if not e:
        print('NO EDITION', label, book, ed); bad += 1; continue
    ms = [m for m in e['mentions'] if m['characterId'] == cid and (hint == 'undefined' or m['chapterNumber'] == int(hint))]
    if not ms:
        print('NO MENTION', label, book, ed, cid, 'hint', hint); bad += 1
    elif not any(c['id'] == cid for c in e['characters']):
        print('NO CHARACTER', label, book, ed, cid); bad += 1
print(len(rows), 'rows,', bad, 'bad')
sys.exit(1 if bad else 0)
