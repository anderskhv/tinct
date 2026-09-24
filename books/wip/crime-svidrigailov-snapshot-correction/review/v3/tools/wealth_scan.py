"""Scan paragraphs that mention Svidrigailov / his household (or are his dialogue in ch.21) up to 22.34 for wealth/poverty terms."""
import re, sys
from texts import load, u16
ed = sys.argv[1] if len(sys.argv) > 1 else 'original-en'
terms = re.compile(r"\b(rich|wealth\w*|fortune|estates?|propert\w*|landowner|money|thousand|debts?|prison|means|well[- ]off|poor|revenue|income|rouble\w*|ruble\w*|forests?|meadows|provided for|inheritance|left him)\b", re.I)
T = load(ed)
def relevant(c, p, t):
    if re.search(r'svidriga', t, re.I): return True
    if c == 3 and p == 38: return True
    if c == 21: return True   # the Svidrigailov visit chapter
    if c == 22 and p <= 34: return True
    return False
for c in sorted(T):
    for p, t in enumerate(T[c]):
        if (c, p) > (22, 34): continue
        if not relevant(c, p, t): continue
        for m in terms.finditer(t):
            s = max(0, m.start() - 90); e = min(len(t), m.end() + 90)
            print(f'{c}.{p}@{u16(t[:m.start()])}: {t[s:e]!r}')
