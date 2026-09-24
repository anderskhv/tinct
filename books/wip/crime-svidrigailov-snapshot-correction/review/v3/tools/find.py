"""Search a regex across an edition up to an optional (chapter, paragraph) limit, printing context."""
import re, sys
from texts import load, u16
ed, pat = sys.argv[1], sys.argv[2]
lim = tuple(map(int, sys.argv[3].split('.'))) if len(sys.argv) > 3 else (999, 0)
ctx = int(sys.argv[4]) if len(sys.argv) > 4 else 100
rx = re.compile(pat, re.I)
for c, paras in load(ed).items():
    for p, t in enumerate(paras):
        if (c, p) > lim: continue
        for m in rx.finditer(t):
            s = max(0, m.start()-ctx); e = min(len(t), m.end()+ctx)
            print(f'{c}.{p}@{u16(t[:m.end()])}: ...{t[s:e]}...')
