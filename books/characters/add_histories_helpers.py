#!/usr/bin/env python3
"""Shared helper for the-histories batch: like add_entity.bind() but can
exclude specific (chapterNumber, paragraphIndex) pairs known to refer to
a different, same-named person -- Herodotus reuses names heavily across
generations and unrelated figures (two Aristodemoi, two Hegesistratoi,
two Lycurgoi, etc.), so a bare-name bind risks conflating them.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def normalized(text):
    return re.sub(' {2,}', ' ', text.replace('\n', ' '))


def u16(text):
    return len(text.encode('utf-16-le')) // 2


def bind_excluding(book, edition_key, aliases, exclude_paragraphs=frozenset(), only_paragraphs=None):
    path = ROOT / f'app/public/data/editions/{book}-{edition_key}.json'
    if not path.exists():
        return None
    data = json.loads(path.read_bytes())
    patterns = [re.compile(r'(?<!\w)' + re.escape(a) + r'(?!\w)') for a in aliases]
    mentions = []
    for c in data['chapters']:
        for pi, p in enumerate(c['paragraphs']):
            key = (c['number'], pi)
            if key in exclude_paragraphs:
                continue
            if only_paragraphs is not None and key not in only_paragraphs:
                continue
            text = normalized(p)
            candidates = []
            for pat in patterns:
                for m in pat.finditer(text):
                    candidates.append((m.start(), m.end()))
            chosen = []
            for a, b in sorted(set(candidates), key=lambda z: (-(z[1] - z[0]), z[0])):
                if any(a < cb and b > ca for ca, cb in chosen):
                    continue
                chosen.append((a, b))
            for a, b in sorted(chosen):
                mentions.append({'chapterNumber': c['number'], 'paragraphIndex': pi,
                                  'startOffset': u16(text[:a]), 'endOffset': u16(text[:b]),
                                  'text': text[a:b], 'resolution': 'reviewed-name'})
    mentions.sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
    return mentions


def add_entity_excluding(book, eid, name, subtitle, body, role, kind, aliases,
                          editions=('original-en', 'modern-en'), exclude_paragraphs=frozenset(),
                          only_paragraphs=None, strict_editions=('original-en',)):
    char_path = ROOT / f'app/public/data/characters/{book}.v1.json'
    pkg = json.loads(char_path.read_text())
    for ek in editions:
        if ek not in pkg['editions']:
            continue
        ed = pkg['editions'][ek]
        assert eid not in {c['id'] for c in ed['characters']}, f'{eid} already exists in {ek}'
        existing_spans = {(m['chapterNumber'], m['paragraphIndex'], m['startOffset'], m['endOffset']) for m in ed['mentions']}
        mentions = bind_excluding(book, ek, aliases, exclude_paragraphs, only_paragraphs)
        if mentions is None:
            continue
        if not mentions:
            if ek in strict_editions:
                assert mentions, f'no matches for {eid} in {ek}'
            print(book, ek, eid, 'WARNING: no matches, skipping this edition')
            continue
        collisions = [m for m in mentions if (m['chapterNumber'], m['paragraphIndex'], m['startOffset'], m['endOffset']) in existing_spans]
        assert not collisions, f'{eid} in {ek} collides with existing mentions: {collisions[:3]}'
        for m in mentions:
            m['characterId'] = eid
        first = mentions[0]
        point = {'chapterNumber': first['chapterNumber'], 'paragraphIndex': first['paragraphIndex'], 'offset': first['endOffset']}
        ed['characters'].append({
            'id': eid, 'kind': kind, 'storyRole': role,
            'roleVisibleAt': point, 'firstMention': point,
            'snapshots': [{
                'id': eid + '-1', 'availableAt': point, 'name': name, 'subtitle': subtitle, 'body': body,
                'evidence': [{'chapterNumber': first['chapterNumber'], 'paragraphIndex': first['paragraphIndex'], 'throughOffset': point['offset']}],
                'editorialBasis': 'Reviewed baseline identity at first mention; excludes paragraphs known to refer to a different same-named figure.',
            }],
        })
        ed['mentions'].extend(mentions)
        ed['mentions'].sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
        print(book, ek, eid, len(mentions), 'mentions added')
    char_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')
