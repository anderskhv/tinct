#!/usr/bin/env python3
"""Assemble modern-en from src/m<chapter>*.txt batch files (lines 'n|paragraph') and validate paragraph-level rules.
Writes editions/discourse-on-inequality-modern-en.json only when every chapter is complete; always prints problems."""
import json, os, re, glob, sys
here = os.path.dirname(os.path.abspath(__file__))
orig = json.load(open(os.path.join(here, '..', 'editions', 'discourse-on-inequality-original-en.json'), encoding='utf-8'))['chapters']
out = []; complete = True; probs = 0
for ci, oc in enumerate(orig, 1):
    paras = {}
    for f in sorted(glob.glob(os.path.join(here, f'm{ci}*.txt')), key=lambda x: (len(x), x)):
        if not re.fullmatch(rf'm{ci}[a-z]?\.txt', os.path.basename(f)): continue
        for line in open(f, encoding='utf-8').read().split('\n'):
            if not line.strip(): continue
            m = re.match(r'(\d+)\|(.*)$', line)
            if not m: print('BAD LINE', f, line[:50]); probs += 1; continue
            n = int(m.group(1))
            if n in paras: print('DUP', ci, n); probs += 1
            paras[n] = m.group(2).strip()
    n_exp = len(oc['paragraphs'])
    missing = [i for i in range(1, n_exp + 1) if i not in paras]
    if missing:
        complete = False
        print(f'ch{ci} {oc["title"]}: {len(paras)}/{n_exp} done; first missing {missing[:1]}')
    plist = []
    for i in range(1, n_exp + 1):
        p = paras.get(i)
        if p is None: plist.append(''); continue
        o = oc['paragraphs'][i - 1]
        ow, mw = len(o.split()), len(p.split())
        if mw < 0.75 * ow: print(f'SHORT ch{ci} p{i}: {mw}/{ow} = {mw/ow:.2f}'); probs += 1
        if p.count('!') != o.count('!'): print(f'EXCL ch{ci} p{i}: {p.count("!")} vs {o.count("!")}'); probs += 1
        if re.search(r'[\[\]\n]|\.\.\.|…', p) and not re.search(r'[\[\]\n]|\.\.\.|…', o): print(f'BRACKET/ELLIPSIS ch{ci} p{i}'); probs += 1
        if not re.search(r'[.!?:;"\')”]$', p): print(f'ENDS? ch{ci} p{i}: ...{p[-40:]}'); probs += 1
        plist.append(p)
    out.append({'number': ci, 'title': oc['title'], 'paragraphs': plist})
print('problems:', probs, 'complete:', complete)
if complete and probs == 0 or '--force' in sys.argv:
    json.dump({'chapters': out, 'sections': []}, open(os.path.join(here, '..', 'editions', 'discourse-on-inequality-modern-en.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('wrote modern-en')
