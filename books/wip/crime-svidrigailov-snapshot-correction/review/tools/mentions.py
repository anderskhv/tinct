"""List every paragraph mentioning Svidrigailov / Marfa / relevant keywords, per edition, up to a chapter limit."""
import sys, re
from common import *
E = editions()
ed = sys.argv[1]; pat = re.compile(sys.argv[2], re.I); maxch = int(sys.argv[3]) if len(sys.argv) > 3 else 99
width = int(sys.argv[4]) if len(sys.argv) > 4 else 160
for c in E[ed]['chapters']:
    if c['number'] > maxch: break
    for i, _ in enumerate(c['paragraphs']):
        t = para(ed, c['number'], i)
        for m in pat.finditer(t):
            s = max(0, m.start()-width); print(f"{c['number']}.{i} @{u16len(t[:m.start()])}: ...{t[s:m.end()+width]}...")
