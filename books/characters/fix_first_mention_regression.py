#!/usr/bin/env python3
"""Fix a real bug found via real-browser verification (not caught by round-trip
validation): bind_speaker_labels.py / bind_mww_short_labels.py added new
ALL-CAPS/short-form mentions (mostly "Enter X" stage directions, which often
occur earlier in the text than a character's first *spoken/narrated* mention)
without recomputing each character's firstMention/roleVisibleAt. The app
deliberately refuses to reveal a card before its own recorded firstMention
(spoiler-safety gate in releasedCard()), so any new mention earlier than the
stored firstMention silently fails to resolve and falls through to dictionary
lookup -- exactly the class of bug the brothers-karamazov overlap bug was:
invisible to offset/text round-trip checking, only surfaced by tapping the
actual word in the actual reader.

For every character, if any mention (old or newly added) starts before the
recorded firstMention, move both firstMention and roleVisibleAt back to that
earliest mention's point (using its endOffset, the same convention
add_entity.py and the original build tooling use). Every affected book here
has firstMention == roleVisibleAt on every character before this fix, so
moving both together preserves that invariant. snapshot availableAt values
are never moved earlier than a snapshot's own recorded point, and the
verifier requires snapshot.availableAt >= firstMention, which remains
satisfied since firstMention only moves earlier.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BOOKS = ['as-you-like-it', 'taming-of-the-shrew', 'the-tempest', 'merry-wives-of-windsor']


def point_key(p):
    return (p['chapterNumber'], p['paragraphIndex'], p['offset'])


def mention_end_point(m):
    return (m['chapterNumber'], m['paragraphIndex'], m['endOffset'])


def process(book):
    path = ROOT / f'app/public/data/characters/{book}.v1.json'
    pkg = json.loads(path.read_text())
    total_fixed = 0
    for ek, ed in pkg['editions'].items():
        for c in ed['characters']:
            fm = point_key(c['firstMention'])
            mentions = [m for m in ed['mentions'] if m['characterId'] == c['id']]
            earliest_m = min(mentions, key=mention_end_point, default=None)
            if earliest_m is None:
                continue
            earliest = mention_end_point(earliest_m)
            if earliest < fm:
                new_point = {'chapterNumber': earliest_m['chapterNumber'],
                             'paragraphIndex': earliest_m['paragraphIndex'],
                             'offset': earliest_m['endOffset']}
                assert c['roleVisibleAt'] == c['firstMention'], f'{book}/{ek}/{c["id"]}: roleVisibleAt != firstMention, needs manual review'
                c['firstMention'] = new_point
                c['roleVisibleAt'] = new_point
                total_fixed += 1
                print(book, ek, c['id'], 'firstMention/roleVisibleAt moved to', new_point, '(was', fm, ')')
    path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')
    print(book, total_fixed, 'characters fixed')


if __name__ == '__main__':
    for b in BOOKS:
        process(b)
