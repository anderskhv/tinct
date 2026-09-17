#!/usr/bin/env python3
"""Close the modern-en alias gap left by add_war_and_peace_minor_figures.py
and its follow-up: 59 characters that bound fine in original-en had zero
matches in modern-en because that translation strips diacritics (and
sometimes transliterates further, e.g. -ski -> -sky, Vólkonski ->
Volkonsky) rather than reusing the original-en spelling the candidate
list was built from. Re-adds each of those 59 characters to modern-en
only, using the same id/name/body/role as their original-en record, with
a modern-en-specific alias verified by hand against that edition's actual
text.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'war-and-peace'

# id -> modern-en alias (surname-only, diacritic-stripped, and hand-verified
# against the actual modern-en text; overridden where the translation uses
# a different transliteration entirely, e.g. -ski -> -sky).
MODERN_ALIAS_OVERRIDES = {
    'suvorov': 'Suvorov',
    'raevski': 'Raevsky',
    'vyazmitinov': 'Vyazmitinov',
    'magnitski': 'Magnitsky',
    'kaysarov': 'Kaisarov',
    'peter-nikolaevich': 'Nikolaevich',
    'theodore-ivanych': 'Ivanych',
    'narishkin': 'Naryshkin',
    'volkonski': 'Volkonsky',
    'dmitri-vasilevich': 'Vasilevich',
}

TITLES = {'prince', 'count', 'countess', 'general', 'captain', 'colonel', 'dr.', 'dr',
          'field', 'marshal', 'major-general', 'm.', 'monsieur', 'grand', 'duke',
          'sergey', 'kuzmich', 'daniel', 'agrafena', 'pelageya', 'matrena'}


def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')


def main():
    char_path = ROOT / f'app/public/data/characters/{BOOK}.v1.json'
    pkg = json.loads(char_path.read_text())
    orig = pkg['editions']['original-en']
    modern_ids = {c['id'] for c in pkg['editions']['modern-en']['characters']}
    modern_data = json.loads((ROOT / f'app/public/data/editions/{BOOK}-modern-en.json').read_bytes())
    modern_text = ' '.join(p for c in modern_data['chapters'] for p in c['paragraphs'])

    missing = [c for c in orig['characters'] if c['id'] not in modern_ids]
    print(len(missing), 'characters missing from modern-en')

    for c in missing:
        cid = c['id']
        snap = c['snapshots'][0]
        if cid in MODERN_ALIAS_OVERRIDES:
            alias = MODERN_ALIAS_OVERRIDES[cid]
        else:
            words = [w for w in strip_accents(snap['name']).replace(',', '').split() if w.lower().strip('.') not in TITLES]
            alias = words[-1] if words else strip_accents(snap['name'])
        count = len(re.findall(r'(?<![A-Za-z])' + re.escape(alias) + r'(?![A-Za-z])', modern_text))
        if count == 0:
            print(f'SKIP {cid}: alias {alias!r} has zero matches in modern-en, needs manual lookup')
            continue
        add_entity(BOOK, cid, snap['name'], snap.get('subtitle', ''), snap['body'], c['storyRole'], c['kind'],
                   [alias], editions=('modern-en',), strict_editions=('modern-en',))


if __name__ == '__main__':
    main()
