#!/usr/bin/env python3
"""Add Meriones to the Iliad character package without touching the rest
of the file. The Iliad's released package uses per-edition alias sets
(original-en's Pope-style translation uses Roman divine names; modern-en
uses Greek names) that build_generic.py's single shared-alias-per-entity
model cannot reproduce -- rebuilding the whole file via build_generic.py
silently drops 9 entities from modern-en. This script only adds the one
new entity, leaving every existing character/mention untouched.
"""
import hashlib, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CHAR_PATH = ROOT / 'app/public/data/characters/iliad.v1.json'


def normalized(text):
    return re.sub(' {2,}', ' ', text.replace('\n', ' '))


def u16(text):
    return len(text.encode('utf-16-le')) // 2


def bind(book_id, edition_key):
    path = ROOT / f'app/public/data/editions/{book_id}-{edition_key}.json'
    data = json.loads(path.read_bytes())
    pattern = re.compile(r'(?<!\w)Meriones(?!\w)')
    mentions = []
    for c in data['chapters']:
        for pi, p in enumerate(c['paragraphs']):
            text = normalized(p)
            for m in pattern.finditer(text):
                mentions.append({'characterId': 'meriones', 'chapterNumber': c['number'],
                                  'paragraphIndex': pi, 'startOffset': u16(text[:m.start()]),
                                  'endOffset': u16(text[:m.end()]), 'text': text[m.start():m.end()],
                                  'resolution': 'reviewed-name'})
    return mentions


def main():
    pkg = json.loads(CHAR_PATH.read_text())
    for ek in ('original-en', 'modern-en'):
        ed = pkg['editions'][ek]
        assert 'meriones' not in {c['id'] for c in ed['characters']}
        mentions = bind('iliad', ek)
        assert mentions, f'no matches in {ek}'
        first = mentions[0]
        point = {'chapterNumber': first['chapterNumber'], 'paragraphIndex': first['paragraphIndex'], 'offset': first['endOffset']}
        ed['characters'].append({
            'id': 'meriones', 'kind': 'person', 'storyRole': 'supporting',
            'roleVisibleAt': point, 'firstMention': point,
            'snapshots': [{
                'id': 'meriones-1', 'availableAt': point, 'name': 'Meriones', 'subtitle': '',
                'body': "A Cretan captain who leads troops alongside Idomeneus, described as a peer of the war-god Ares in prowess. He fights among the more prominent Greek warriors throughout the battles.",
                'evidence': [{'chapterNumber': first['chapterNumber'], 'paragraphIndex': first['paragraphIndex'], 'throughOffset': point['offset']}],
                'editorialBasis': 'Reviewed baseline identity at first mention; no concealed identity or later plot development.',
            }],
        })
        ed['mentions'].extend(mentions)
        ed['mentions'].sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
        print(ek, len(mentions), 'mentions added')
    CHAR_PATH.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()
