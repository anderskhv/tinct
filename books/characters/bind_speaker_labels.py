#!/usr/bin/env python3
"""Bind ALL-CAPS speaker-label occurrences of already-carded characters.

Finding: several Shakespeare-convention plays render each line's speaker
label in ALL CAPS (e.g. "ROSALIND. I pray thee..."). Most already-built
character packages in this library bind these correctly (checked: 23 of
27 plays surveyed have ~0% of these occurrences unbound). A handful never
got this binding at all: as-you-like-it (96% unbound), taming-of-the-shrew
(100%), the-tempest (100%), merry-wives-of-windsor (40%). This is not a
missing-character gap -- every character already has a card -- it is a
missing-occurrence-link gap at a huge scale (700-850 unbound label
instances per play).

For each existing character, adds their ALL-CAPS display name as a new
mention wherever it appears as a standalone word, skipping any span that
already has a mention (from either case) to avoid duplicates or ambiguity
with any existing narrower/lowercase binding at the same position.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def normalized(text):
    return re.sub(' {2,}', ' ', text.replace('\n', ' '))


def u16(text):
    return len(text.encode('utf-16-le')) // 2


def process(book):
    char_path = ROOT / f'app/public/data/characters/{book}.v1.json'
    pkg = json.loads(char_path.read_text())
    for ek in list(pkg['editions'].keys()):
        ed = pkg['editions'][ek]
        ed_path = ROOT / f'app/public/data/editions/{book}-{ek}.json'
        if not ed_path.exists():
            continue
        data = json.loads(ed_path.read_bytes())
        paras = {(c['number'], pi): normalized(p) for c in data['chapters'] for pi, p in enumerate(c['paragraphs'])}
        existing_spans = {(m['chapterNumber'], m['paragraphIndex'], m['startOffset'], m['endOffset']) for m in ed['mentions']}
        # Overlap index (not just exact spans): a label like "PAGE" must not be
        # bound inside an existing "MISTRESS PAGE" span of another character.
        taken = {}
        for (chn, pi, a, b) in existing_spans:
            taken.setdefault((chn, pi), []).append((a, b))

        # Longest display name first, so e.g. a two-word "PRINCE HAMLET" (if any)
        # would claim before a one-word "HAMLET" -- avoids double-claiming.
        chars_by_len = sorted(ed['characters'], key=lambda c: -len(c['snapshots'][0]['name']))
        added_total = 0
        for c in chars_by_len:
            name = c['snapshots'][0]['name']
            upper = name.upper()
            if len(upper) < 3 or not upper.isupper():
                continue
            pat = re.compile(r'(?<![A-Za-z])' + re.escape(upper) + r'(?![A-Za-z])')
            new_mentions = []
            for (chn, pi), text in paras.items():
                for m in pat.finditer(text):
                    key = (chn, pi, u16(text[:m.start()]), u16(text[:m.end()]))
                    if key in existing_spans or any(key[2] < b and key[3] > a for a, b in taken.get((chn, pi), [])):
                        continue
                    existing_spans.add(key)
                    taken.setdefault((chn, pi), []).append((key[2], key[3]))
                    new_mentions.append({'chapterNumber': chn, 'paragraphIndex': pi,
                                          'startOffset': key[2], 'endOffset': key[3],
                                          'text': m.group(), 'characterId': c['id'],
                                          'resolution': 'reviewed-speaker-label'})
            ed['mentions'].extend(new_mentions)
            added_total += len(new_mentions)
        ed['mentions'].sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
        print(book, ek, added_total, 'speaker-label mentions added')
    char_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    for book in sys.argv[1:]:
        process(book)
