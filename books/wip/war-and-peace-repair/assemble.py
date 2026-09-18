#!/usr/bin/env python3
"""Assemble the staged War and Peace modern-en edition: baseline v2 + accepted repair chapters + accepted French chapters.

Merge is by paragraph index, never by whole chapter, so that consistency-pass changes in baseline v2 survive where a
repair or French file was drafted from the same baseline. Order of precedence per paragraph:
  1. accepted repair chapter (repair/chN-<accepted file>.json, from repair/ACCEPTED.md)
  2. accepted French chapter (french/chN-french-r2.json if present, else chN-french.json, for accepted batches)
  3. baseline v2 (consistency/modern-en-consistency-candidate.json)
A repair chapter and a French chapter never both apply to one chapter (drafted chapters were excluded from French batches).
Outputs: assembled/war-and-peace-modern-en.assembled.json, assembled/ASSEMBLY.md, and changed-passage records.
"""
import json, re, hashlib, subprocess, sys
from pathlib import Path
R = Path(__file__).resolve().parent
ROOT = R.parents[2]
base = json.load(open(R/'consistency/modern-en-consistency-candidate.json'))['chapters']
src = json.load(open(ROOT/'app/public/data/editions/war-and-peace-original-en.json'))['chapters']

def sha(p): return hashlib.sha256(open(p,'rb').read()).hexdigest()

# accepted repair chapters: rows "| N | file | hash |" where Gate A column is not "pending"
repair = {}
for line in open(R/'repair/ACCEPTED.md'):
    m = re.match(r'\|\s*(\d+)\s*\|\s*(ch\d+-[\w.-]+\.json)\s*\|\s*([0-9a-f]{64})\s*\|(.*)', line)
    if not m: continue
    n, f, h, rest = int(m.group(1)), m.group(2), m.group(3), m.group(4)
    if 'pending' in rest.lower(): continue
    p = R/'repair'/f
    if sha(p) != h: sys.exit(f'HASH MISMATCH for accepted ch{n}: {f} is not the accepted version')
    repair[n] = json.load(open(p))
# accepted French batches: from french/ACCEPTED.md rows "| batch | chapters | review | ACCEPT ..."
french = {}
acc_batches = set()
for line in open(R/'french/ACCEPTED.md'):
    m = re.match(r'\|\s*(\d+)\s*\|', line)
    if m and 'ACCEPT' in line and 'ANOTHER' not in line: acc_batches.add(int(m.group(1)))
for b in acc_batches:
    inv = json.load(open(R/f'french/batch{b}-inventory.json'))
    for ch in inv['chapters']:
        for name in (f'ch{ch}-french-r2.json', f'ch{ch}-french.json'):
            p = R/'french'/name
            if p.exists(): french[ch] = json.load(open(p)); break
# also chapters fixed only in the round-two sweep (ch30 etc.) if listed
sweep = R/'french/SWEEP-ACCEPTED.json'
if sweep.exists():
    for ch in json.load(open(sweep)):
        p = R/f'french/ch{ch}-french-r2.json'
        if p.exists(): french[ch] = json.load(open(p))

out, changed = [], []
for c, s in zip(base, src):
    n = c['number']; paras = list(c['paragraphs'])
    over = repair.get(n) or french.get(n)
    kind = 'repair' if n in repair else ('french' if n in french else None)
    if over:
        assert over['number'] == n and len(over['paragraphs']) == len(paras), f'ch{n} paragraph count mismatch'
        for i, p in enumerate(over['paragraphs']):
            if p != paras[i]: paras[i] = p; changed.append((n, i, kind))
    assert len(paras) == len(s['paragraphs'])
    out.append({'number': n, 'title': c['title'], 'paragraphs': paras})
(R/'assembled').mkdir(exist_ok=True)
outp = R/'assembled/war-and-peace-modern-en.assembled.json'
json.dump({'chapters': out}, open(outp, 'w'), ensure_ascii=False)
h = sha(outp)
by = {}
for n, i, k in changed: by.setdefault(k, set()).add(n)
open(R/'assembled/ASSEMBLY.md', 'w').write(f"""# Assembled staged edition

- Output: `assembled/war-and-peace-modern-en.assembled.json` sha256 `{h}`
- Baseline v2: `consistency/modern-en-consistency-candidate.json` sha256 `{sha(R/'consistency/modern-en-consistency-candidate.json')}`
- Accepted repair chapters merged ({len(repair)}): {sorted(repair)}
- Accepted French batches merged: {sorted(acc_batches)} → chapters ({len(french)}): {sorted(french)}
- Paragraphs overridden: {len(changed)} (repair {len([x for x in changed if x[2]=='repair'])}, french {len([x for x in changed if x[2]=='french'])})
- Not applied to any live edition file.
""")
print('assembled', h[:16], 'repair chapters', len(repair), 'french chapters', len(french), 'paragraphs overridden', len(changed))
