#!/usr/bin/env python3
"""Uncarded-name candidate scan for one book: spaCy PERSON entities in
original-en minus anything already matching an existing card's name or an
existing mention's text. Prints "surface form<TAB>count" sorted by count.
Usage: scan_candidates.py BOOK [--min N] [--edition original-en]
"""
import json
import re
import sys
from pathlib import Path

import spacy

ROOT = Path(__file__).resolve().parents[2]


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    book = args[0]
    min_count = int(next((a.split('=')[1] for a in sys.argv if a.startswith('--min=')), 2))
    edition = next((a.split('=')[1] for a in sys.argv if a.startswith('--edition=')), 'original-en')
    nlp = spacy.load('en_core_web_sm', disable=['lemmatizer', 'parser'])
    nlp.max_length = 20_000_000
    pkg = json.loads((ROOT / f'app/public/data/characters/{book}.v1.json').read_text())
    ed = pkg['editions'][edition]
    known = set()
    for c in ed['characters']:
        for s in c['snapshots']:
            known.update(w.lower() for w in re.split(r'\W+', s['name']) if w)
    for m in ed['mentions']:
        known.update(w.lower() for w in re.split(r'\W+', m['text']) if w)
    data = json.loads((ROOT / f'app/public/data/editions/{book}-{edition}.json').read_bytes())
    text = ' '.join(p for c in data['chapters'] for p in c['paragraphs'])
    names = {}
    for start in range(0, len(text), 500_000):
        for ent in nlp(text[start:start + 500_000]).ents:
            if ent.label_ == 'PERSON':
                names[ent.text.strip()] = names.get(ent.text.strip(), 0) + 1
    uncarded = [(n, c) for n, c in names.items()
                if n and not any(w.lower() in known for w in re.split(r'\W+', n) if w)]
    uncarded.sort(key=lambda x: -x[1])
    print(f'{len(uncarded)} uncarded surface forms')
    for n, c in uncarded:
        if c >= min_count:
            print(f'{n}\t{c}')


if __name__ == '__main__':
    main()
