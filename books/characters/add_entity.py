#!/usr/bin/env python3
"""Add ONE new entity to an existing character package via bare-name regex
binding in every edition, without touching any existing character or
mention. Safe for books whose released package uses per-edition alias
sets that build_generic.py's single shared-alias-per-entity model can't
reproduce (rebuilding the whole file risks silently dropping entities
whose only alias differs by edition -- see iliad's Roman/Greek divine
names for a real example this session hit).

Usage: define BOOK, ID, NAME, ROLE, KIND, BODY, ALIASES below and run.
Only binds bare-word matches of each alias; does not touch existing
mentions/characters; asserts no id or span collision before writing.
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def normalized(text):
    return re.sub(' {2,}', ' ', text.replace('\n', ' '))


def u16(text):
    return len(text.encode('utf-16-le')) // 2


def bind(book_id, edition_key, aliases):
    path = ROOT / f'app/public/data/editions/{book_id}-{edition_key}.json'
    if not path.exists():
        return None
    data = json.loads(path.read_bytes())
    patterns = [re.compile(r'(?<!\w)' + re.escape(a) + r'(?!\w)') for a in aliases]
    mentions = []
    for c in data['chapters']:
        for pi, p in enumerate(c['paragraphs']):
            text = normalized(p)
            for pat in patterns:
                for m in pat.finditer(text):
                    mentions.append({'chapterNumber': c['number'], 'paragraphIndex': pi,
                                      'startOffset': u16(text[:m.start()]), 'endOffset': u16(text[:m.end()]),
                                      'text': text[m.start():m.end()], 'resolution': 'reviewed-name'})
    mentions.sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
    return mentions


def add_entity(book, eid, name, subtitle, body, role, kind, aliases, editions=('original-en', 'modern-en')):
    char_path = ROOT / f'app/public/data/characters/{book}.v1.json'
    pkg = json.loads(char_path.read_text())
    for ek in editions:
        if ek not in pkg['editions']:
            continue
        ed = pkg['editions'][ek]
        assert eid not in {c['id'] for c in ed['characters']}, f'{eid} already exists in {ek}'
        existing_spans = {(m['chapterNumber'], m['paragraphIndex'], m['startOffset'], m['endOffset']) for m in ed['mentions']}
        mentions = bind(book, ek, aliases)
        if mentions is None:
            continue
        assert mentions, f'no matches for {eid} in {ek}'
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
                'editorialBasis': 'Reviewed baseline identity at first mention; no concealed identity or later plot development.',
            }],
        })
        ed['mentions'].extend(mentions)
        ed['mentions'].sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
        print(book, ek, eid, len(mentions), 'mentions added')
    char_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')
