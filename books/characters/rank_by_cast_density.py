#!/usr/bin/env python3
"""Rank every book by estimated named-person density using spaCy NER, to
prioritize the systematic "every named individual should be clickable"
pass. For each book: count distinct PERSON-entity surface forms in
original-en, then subtract surface forms already covered by an existing
character card's name/alias words, giving a rough "uncarded name variety"
score to sort by.
"""
import json
import re
from pathlib import Path
import spacy

ROOT = Path(__file__).resolve().parents[2]
EDITIONS_DIR = ROOT / 'app/public/data/editions'
CHARACTERS_DIR = ROOT / 'app/public/data/characters'

nlp = spacy.load('en_core_web_sm', disable=['lemmatizer', 'parser'])
nlp.max_length = 3_000_000


def known_name_words(book):
    path = CHARACTERS_DIR / f'{book}.v1.json'
    if not path.exists():
        return set()
    pkg = json.loads(path.read_text())
    ed = pkg['editions'].get('original-en') or next(iter(pkg['editions'].values()), {})
    words = set()
    for c in ed.get('characters', []):
        for s in c.get('snapshots', []):
            for w in re.split(r'\W+', s.get('name', '')):
                if w:
                    words.add(w.lower())
    return words


def main():
    results = []
    for ed_path in sorted(EDITIONS_DIR.glob('*-original-en.json')):
        book = ed_path.name[:-len('-original-en.json')]
        data = json.loads(ed_path.read_bytes())
        text = ' '.join(p for c in data['chapters'] for p in c['paragraphs'])
        known = known_name_words(book)
        doc = nlp(text)
        surface_forms = {}
        for ent in doc.ents:
            if ent.label_ != 'PERSON':
                continue
            key = ent.text.strip()
            if not key or not key[0].isupper():
                continue
            surface_forms[key] = surface_forms.get(key, 0) + 1
        uncarded = 0
        for name in surface_forms:
            words = re.split(r'\W+', name)
            if not any(w.lower() in known for w in words if w):
                uncarded += 1
        results.append((book, len(surface_forms), uncarded, len(known)))
        print(f'{book}\t{len(surface_forms)}\t{uncarded}\t{len(known)}', flush=True)
    results.sort(key=lambda r: -r[2])
    print('\n--- ranked by uncarded surface-form variety ---')
    for book, total, uncarded, known in results:
        print(f'{uncarded}\t{book}\t(total_forms={total}, known_cards={known})')


if __name__ == '__main__':
    main()
