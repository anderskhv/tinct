#!/usr/bin/env python3
"""Bind extra alias spans onto an EXISTING character, restricted by paragraph.

Same contract as add_aliases.add_aliases, but takes exclude_paragraphs /
only_paragraphs like add_histories_helpers.bind_excluding, for names that
refer to the character only in some paragraphs (e.g. "Lord" addressed to
The Lord in the Prologue in Heaven, but "Lord Baron" elsewhere).

Skips any span overlapping an existing mention of any character, and moves
firstMention / roleVisibleAt / earliest snapshot back if a new mention is
earlier than the recorded first mention.
"""
import json
from pathlib import Path

from add_histories_helpers import bind_excluding
from add_aliases import point_key, mention_end_point

ROOT = Path(__file__).resolve().parents[2]


def add_aliases_restricted(book, char_id, aliases, exclude_paragraphs=frozenset(), only_paragraphs=None,
                           editions=('original-en', 'modern-en')):
    char_path = ROOT / f'app/public/data/characters/{book}.v1.json'
    pkg = json.loads(char_path.read_text())
    for ek in editions:
        ed = pkg['editions'].get(ek)
        if not ed:
            continue
        c = next((c for c in ed['characters'] if c['id'] == char_id), None)
        assert c is not None, f'{char_id} not found in {book}/{ek}'
        assert c['roleVisibleAt'] == c['firstMention'], f'{book}/{ek}/{char_id}: roleVisibleAt != firstMention'
        earliest_snap = min(c['snapshots'], key=lambda s: point_key(s['availableAt']))
        assert point_key(earliest_snap['availableAt']) == point_key(c['firstMention']), f'{book}/{ek}/{char_id}: earliest snapshot != firstMention'

        found = bind_excluding(book, ek, aliases, exclude_paragraphs, only_paragraphs)
        if found is None:
            continue
        taken = {}
        for m in ed['mentions']:
            taken.setdefault((m['chapterNumber'], m['paragraphIndex']), []).append((m['startOffset'], m['endOffset']))
        new_mentions = []
        for m in found:
            spans = taken.get((m['chapterNumber'], m['paragraphIndex']), [])
            if any(m['startOffset'] < b and m['endOffset'] > a for a, b in spans):
                continue
            m['characterId'] = char_id
            new_mentions.append(m)
            taken.setdefault((m['chapterNumber'], m['paragraphIndex']), []).append((m['startOffset'], m['endOffset']))
        if not new_mentions:
            print(book, ek, char_id, 'no new mentions')
            continue
        ed['mentions'].extend(new_mentions)
        ed['mentions'].sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
        fm = point_key(c['firstMention'])
        earliest = min((m for m in ed['mentions'] if m['characterId'] == char_id), key=mention_end_point)
        if mention_end_point(earliest) < fm:
            new_point = {'chapterNumber': earliest['chapterNumber'], 'paragraphIndex': earliest['paragraphIndex'], 'offset': earliest['endOffset']}
            c['firstMention'] = new_point
            c['roleVisibleAt'] = new_point
            earliest_snap['availableAt'] = dict(new_point)
            print(book, ek, char_id, len(new_mentions), 'mentions added; firstMention moved to', new_point)
        else:
            print(book, ek, char_id, len(new_mentions), 'mentions added; firstMention unchanged')
    char_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')
