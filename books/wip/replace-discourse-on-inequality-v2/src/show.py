#!/usr/bin/env python3
"""show.py CH START END : print numbered original paragraphs (1-based)."""
import json, sys, os
here = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(here, '..', 'editions', 'discourse-on-inequality-original-en.json'), encoding='utf-8'))
ch, a, b = int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3])
for i, p in enumerate(d['chapters'][ch - 1]['paragraphs'], 1):
    if a <= i <= b:
        print(f'[{i}] ({len(p.split())}w, !={p.count("!")})', p, '\n')
