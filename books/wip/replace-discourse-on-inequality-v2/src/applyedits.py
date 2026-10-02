#!/usr/bin/env python3
"""applyedits.py <editsfile> : blocks separated by lines '---'.
 'OLD\\n=>\\nNEW'  : single-line substring edit; OLD must occur exactly once across src/m*.txt.
 'P<ch>.<n>\\n=>\\nNEW' : replace whole paragraph n of chapter ch."""
import sys, glob, os, re
here = os.path.dirname(os.path.abspath(__file__))
files = {f: open(f, encoding='utf-8').read() for f in glob.glob(os.path.join(here, 'm[0-9]*.txt'))}
blocks = [b.strip('\n') for b in open(sys.argv[1], encoding='utf-8').read().split('\n---\n') if b.strip()]
bad = 0
for b in blocks:
    if '\n=>\n' not in b: print('BAD BLOCK', b[:60]); bad += 1; continue
    old, new = b.split('\n=>\n', 1)
    new = new.strip()
    m = re.fullmatch(r'P(\d+)\.(\d+)', old.strip())
    if m:
        ch, n = m.group(1), m.group(2)
        done = False
        for f in files:
            if re.fullmatch(rf'm{ch}[a-z]?\.txt', os.path.basename(f)):
                lines = files[f].split('\n')
                for i, l in enumerate(lines):
                    if l.startswith(n + '|'):
                        lines[i] = f'{n}|{new}'; files[f] = '\n'.join(lines); done = True
        if not done: print('NO PARA', old); bad += 1
        continue
    hits = [f for f, t in files.items() if t.count(old) >= 1]
    cnt = sum(files[f].count(old) for f in hits)
    if cnt != 1: print(f'COUNT {cnt} for: {old[:70]}'); bad += 1; continue
    files[hits[0]] = files[hits[0]].replace(old, new)
if bad: print('NOT APPLIED; fix', bad, 'problems'); sys.exit(1)
for f, t in files.items(): open(f, 'w', encoding='utf-8').write(t)
print('applied', len(blocks))
