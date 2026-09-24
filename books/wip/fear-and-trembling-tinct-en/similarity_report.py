#!/usr/bin/env python3
"""Diagnostic (report only): word-token similarity of the candidate modern-en against the served
original-en and modern-en, using the metric of books/classify-modern-en.py (SequenceMatcher ratio on
word tokens, length-weighted). Served 232-slot text is regrouped into the final 184-paragraph
structure via STRUCTURE-MAP.json (joined slots concatenated; a split slot's final paragraphs are
compared as one unit). Low similarity is expected: the candidate is a new translation from Danish,
not a modernization of the served English. Writes SIMILARITY.md.
"""
import json, os, collections
from difflib import SequenceMatcher
H = os.path.dirname(os.path.abspath(__file__)); ED = os.path.join(H, '..', '..', '..', 'app/public/data/editions')
cand = json.load(open(os.path.join(H, 'candidate/fear-and-trembling-modern-en.candidate.json')))
smap = json.load(open(os.path.join(H, 'STRUCTURE-MAP.json')))['map']
def sim(a, b):
    return 1.0 if a == b else SequenceMatcher(None, a.split(), b.split(), autojunk=False).ratio()
# units: groups of final paragraphs <-> groups of served slots (connected components)
parent = {}
def find(x):
    parent.setdefault(x, x)
    while parent[x] != x: parent[x] = parent[parent[x]]; x = parent[x]
    return x
def union(a, b): parent[find(a)] = find(b)
for r in smap:
    s = ('s',) + tuple(r['served']); find(s)
    for f in r['final']: union(s, ('f',) + tuple(f))
comp = collections.defaultdict(lambda: {'s': [], 'f': []})
for x in list(parent):
    comp[find(x)][x[0]].append(x[1:])
out = ['# Similarity diagnostic (report only)', '', 'Metric: the word-token SequenceMatcher ratio from `books/classify-modern-en.py`, length-weighted. The served text is regrouped into matching units via `STRUCTURE-MAP.json`. Footnote-only served slots are grouped with nothing, so they are excluded. Buckets are ≥0.97 MECHANICAL, ≥0.85 LIGHT, ≥0.50 REAL, <0.50 REAL-HEAVY.', '',
       'The candidate is a new translation from the Danish, so similarity to the served English is expected to be low. A high value in any unit would suggest the candidate was derived from the served text.', '']
for ed in ['original-en', 'modern-en']:
    srv = json.load(open(os.path.join(ED, f'fear-and-trembling-{ed}.json')))
    S = {(c['number'], i): p for c in srv['chapters'] for i, p in enumerate(c['paragraphs'])}
    C = {(c['number'], i): p for c in cand['chapters'] for i, p in enumerate(c['paragraphs'])}
    per = collections.defaultdict(lambda: [0.0, 0.0]); high = []; ident = 0; units = 0
    for g in comp.values():
        if not g['f'] or not g['s']: continue
        a = ' '.join(S[k] for k in sorted(g['s'])); b = ' '.join(C[k] for k in sorted(g['f']))
        v = sim(a, b); w = max(len(a.split()), 1); ch = sorted(g['f'])[0][0]
        per[ch][0] += v * w; per[ch][1] += w; units += 1
        if a == b and len(a) >= 80: ident += 1
        if v >= 0.85: high.append((sorted(g['f']), round(v, 3)))
    tot = sum(x[0] for x in per.values()) / sum(x[1] for x in per.values())
    out += [f'## Candidate vs served `{ed}`', '', '| Ch | Similarity |', '|---|---|']
    out += [f'| {ch} | {per[ch][0]/per[ch][1]:.3f} |' for ch in sorted(per)]
    out += ['', f'Length-weighted overall: **{tot:.3f}**. Units compared: {units}. Byte-identical long units: {ident}. Units ≥0.85: {high or "none"}.', '']
    print(ed, round(tot, 3), 'identical', ident, 'high', high)
open(os.path.join(H, 'SIMILARITY.md'), 'w').write('\n'.join(out) + '\n')
