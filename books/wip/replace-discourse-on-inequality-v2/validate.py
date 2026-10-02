#!/usr/bin/env python3
"""Structural/paragraph gate for the two editions. Writes qa/validation.json, creates qa/typography-folded/ copies."""
import json, os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
E = os.path.join(here, 'editions')
o = json.load(open(os.path.join(E, 'discourse-on-inequality-original-en.json'), encoding='utf-8'))
m = json.load(open(os.path.join(E, 'discourse-on-inequality-modern-en.json'), encoding='utf-8'))
res = {'shape_ok': True, 'problems': []}
def bad(s): res['problems'].append(s)
for name, d in (('original', o), ('modern', m)):
    if set(d.keys()) != {'chapters', 'sections'} or d['sections'] != []: bad(f'{name}: shape keys')
    for i, c in enumerate(d['chapters'], 1):
        if set(c.keys()) != {'number', 'title', 'paragraphs'} or c['number'] != i: bad(f'{name}: chapter {i} keys/number')
if len(o['chapters']) != len(m['chapters']): bad('chapter count')
minratio = 9; tot_o = tot_m = 0
for ci, (a, b) in enumerate(zip(o['chapters'], m['chapters']), 1):
    if a['title'] != b['title']: bad(f'title differs ch{ci}')
    if len(a['paragraphs']) != len(b['paragraphs']): bad(f'para count ch{ci}')
    for pi, (p, q) in enumerate(zip(a['paragraphs'], b['paragraphs']), 1):
        for nm, t in (('o', p), ('m', q)):
            if '\n' in t or '\r' in t: bad(f'{nm} newline ch{ci}p{pi}')
            if re.search(r'[\[\]]', t): bad(f'{nm} bracket ch{ci}p{pi}')
            if not t.strip() or t != t.strip() or '  ' in t: bad(f'{nm} whitespace ch{ci}p{pi}')
            if not re.search(r'[.!?:;"\')]$', t): bad(f'{nm} ends mid-sentence? ch{ci}p{pi}: ...{t[-30:]}')
            if re.search(r'\.\.\.|…', t): bad(f'{nm} ellipsis ch{ci}p{pi}')
        r = len(q.split()) / len(p.split()); minratio = min(minratio, r)
        if r < 0.75: bad(f'short ch{ci}p{pi} {r:.2f}')
        if p.count('!') != q.count('!'): bad(f'exclamation ch{ci}p{pi} {p.count("!")} vs {q.count("!")}')
        if p == q: bad(f'identical ch{ci}p{pi}')
        tot_o += len(p.split()); tot_m += len(q.split())
res.update(chapters=len(o['chapters']), paragraphs=sum(len(c['paragraphs']) for c in o['chapters']),
           per_chapter=[[c['title'], len(c['paragraphs'])] for c in o['chapters']],
           original_words=tot_o, modern_words=tot_m, min_word_ratio=round(minratio, 3))
res['pass'] = not res['problems']
os.makedirs(os.path.join(here, 'qa', 'typography-folded'), exist_ok=True)
fold = lambda s: s.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
for fn in ('discourse-on-inequality-original-en.json', 'discourse-on-inequality-modern-en.json'):
    d = json.load(open(os.path.join(E, fn), encoding='utf-8'))
    for c in d['chapters']: c['paragraphs'] = [fold(p) for p in c['paragraphs']]
    json.dump(d, open(os.path.join(here, 'qa', 'typography-folded', fn), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(res, open(os.path.join(here, 'qa', 'validation.json'), 'w'), indent=1)
print(json.dumps(res, indent=1)[:1500])
sys.exit(0 if res['pass'] else 1)
