#!/usr/bin/env python3
"""Add new alias mentions to an EXISTING character (e.g. a spelling variant
or surname the original build missed -- "Bonaparte"/"Buonaparte" for a
napoleon card only bound to "Napoleon"). Unlike add_entity.py this does not
create a new character; unlike bind_speaker_labels.py this takes an
explicit alias list rather than deriving it from the card's own name.

Bakes in, from the start, the firstMention/roleVisibleAt/snapshot
availableAt correction that fix_first_mention_regression.py had to apply
reactively earlier this session: if any new mention lands earlier than the
character's current firstMention, moves firstMention, roleVisibleAt, and
the earliest snapshot's availableAt back to match. Every character in this
library has firstMention == roleVisibleAt == earliest snapshot availableAt
before this runs (a checked invariant); asserts that going in and preserves
it going out.

New mentions are deduped against existing spans (skipped, not overwritten)
and against each other the same longest-span-wins way add_entity.py does,
so overlapping aliases never produce two mentions for the same word.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def normalized(text):
    return re.sub(' {2,}', ' ', text.replace('\n', ' '))


def u16(text):
    return len(text.encode('utf-16-le')) // 2


def point_key(p):
    return (p['chapterNumber'], p['paragraphIndex'], p['offset'])


def mention_end_point(m):
    return (m['chapterNumber'], m['paragraphIndex'], m['endOffset'])


def bind_new_spans(edition_json_path, existing_spans, aliases):
    data = json.loads(edition_json_path.read_bytes())
    patterns = [re.compile(r'(?<!\w)' + re.escape(a) + r'(?!\w)') for a in aliases]
    new_mentions = []
    for c in data['chapters']:
        for pi, p in enumerate(c['paragraphs']):
            text = normalized(p)
            candidates = []
            for pat in patterns:
                for m in pat.finditer(text):
                    candidates.append((m.start(), m.end()))
            chosen = []
            for a, b in sorted(set(candidates), key=lambda z: (-(z[1] - z[0]), z[0])):
                if any(a < cb and b > ca for ca, cb in chosen):
                    continue
                key = (c['number'], pi, u16(text[:a]), u16(text[:b]))
                if key in existing_spans:
                    continue
                chosen.append((a, b))
            for a, b in sorted(chosen):
                new_mentions.append({'chapterNumber': c['number'], 'paragraphIndex': pi,
                                      'startOffset': u16(text[:a]), 'endOffset': u16(text[:b]),
                                      'text': text[a:b], 'resolution': 'reviewed-alias'})
    return new_mentions


def add_aliases(book, char_id, aliases, editions=('original-en', 'modern-en')):
    char_path = ROOT / f'app/public/data/characters/{book}.v1.json'
    pkg = json.loads(char_path.read_text())
    for ek in editions:
        ed = pkg['editions'].get(ek)
        if not ed:
            continue
        c = next((c for c in ed['characters'] if c['id'] == char_id), None)
        assert c is not None, f'{char_id} not found in {book}/{ek}'
        assert c['roleVisibleAt'] == c['firstMention'], f'{book}/{ek}/{char_id}: roleVisibleAt != firstMention, needs manual review'
        earliest_snap = min(c['snapshots'], key=lambda s: point_key(s['availableAt']))
        assert point_key(earliest_snap['availableAt']) == point_key(c['firstMention']), f'{book}/{ek}/{char_id}: earliest snapshot != firstMention, needs manual review'

        existing_spans = {(m['chapterNumber'], m['paragraphIndex'], m['startOffset'], m['endOffset']) for m in ed['mentions']}
        ed_path = ROOT / f'app/public/data/editions/{book}-{ek}.json'
        if not ed_path.exists():
            continue
        new_mentions = bind_new_spans(ed_path, existing_spans, aliases)
        if not new_mentions:
            print(book, ek, char_id, 'no new mentions (already fully bound?)')
            continue
        for m in new_mentions:
            m['characterId'] = char_id
        ed['mentions'].extend(new_mentions)
        ed['mentions'].sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))

        fm = point_key(c['firstMention'])
        all_mentions = [m for m in ed['mentions'] if m['characterId'] == char_id]
        earliest = min(all_mentions, key=mention_end_point)
        if mention_end_point(earliest) < fm:
            new_point = {'chapterNumber': earliest['chapterNumber'], 'paragraphIndex': earliest['paragraphIndex'], 'offset': earliest['endOffset']}
            c['firstMention'] = new_point
            c['roleVisibleAt'] = new_point
            earliest_snap['availableAt'] = dict(new_point)
            print(book, ek, char_id, len(new_mentions), 'mentions added; firstMention moved to', new_point)
        else:
            print(book, ek, char_id, len(new_mentions), 'mentions added; firstMention unchanged')
    char_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')
