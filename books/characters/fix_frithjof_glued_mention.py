#!/usr/bin/env python3
"""Fix a real bug found via real-browser verification: niels-lyhne's
Frithjof first occurs as "...the pastor's Frithjof--and the hoop was..."
-- the name is glued directly to an em-dash with no following space. The
reader's word tokenizer (which splits on whitespace only) therefore
treats "Frithjof--and" as a single tap target, wider than the mention
(which correctly covers only "Frithjof"), so a tap there could never
resolve to the character card no matter how the mention is written.

Checked every other Frithjof occurrence in the book: this is the only one
glued to a non-space character this way (one other, "Frithjof's", is a
normal possessive that the reader already strips before matching, not a
problem). Removes this one unmatchable mention and moves
firstMention/roleVisibleAt/snapshot availableAt to the next earliest
(clickable) occurrence instead of leaving the card anchored to a mention
nobody can ever successfully tap.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'niels-lyhne'


def point_key(p):
    return (p['chapterNumber'], p['paragraphIndex'], p['offset'])


def mention_key(m):
    return (m['chapterNumber'], m['paragraphIndex'], m['startOffset'], m['endOffset'])


def mention_end_point(m):
    return (m['chapterNumber'], m['paragraphIndex'], m['endOffset'])


def process():
    path = ROOT / f'app/public/data/characters/{BOOK}.v1.json'
    pkg = json.loads(path.read_text())
    for ek, ed in pkg['editions'].items():
        c = next(c for c in ed['characters'] if c['id'] == 'frithjof')
        mentions = [m for m in ed['mentions'] if m['characterId'] == 'frithjof']
        mentions.sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
        glued = mentions[0]
        assert glued['chapterNumber'] == 3 and glued['paragraphIndex'] == 2, f'{ek}: unexpected first mention {glued}'
        ed['mentions'] = [m for m in ed['mentions'] if m is not glued]
        remaining = [m for m in ed['mentions'] if m['characterId'] == 'frithjof']
        earliest = min(remaining, key=mention_end_point)
        new_point = {'chapterNumber': earliest['chapterNumber'], 'paragraphIndex': earliest['paragraphIndex'], 'offset': earliest['endOffset']}
        c['firstMention'] = new_point
        c['roleVisibleAt'] = new_point
        c['snapshots'][0]['availableAt'] = dict(new_point)
        c['snapshots'][0]['evidence'][0] = {'chapterNumber': new_point['chapterNumber'], 'paragraphIndex': new_point['paragraphIndex'], 'throughOffset': new_point['offset']}
        print(BOOK, ek, 'removed glued mention', mention_key(glued), '-> firstMention now', new_point)
    path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    process()
