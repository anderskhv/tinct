"""Pass A: restore every epigraph paragraph verbatim from original-en.

Live units 2..87 open with an epigraph (unit 1 = Prelude and 88 = Finale have none).
Epigraph = paragraph 0, plus following paragraphs that are speaker-tagged continuations
(2_d Gent), verse continuations (contain a newline, short, directly after an epigraph
paragraph) or explicit translations/continuations listed in EXPLICIT.
"""
import sys
from common import *

EXPLICIT = {3: [1], 47: [1], 55: [1, 2]}


def epigraph_count(unit, op):
    if unit in (1, 88):
        return 0
    k = 1
    while k < min(4, len(op)):
        p = op[k]
        ok = (p.startswith('2_d Gent') or
              (unit in EXPLICIT and k in EXPLICIT[unit]) or
              ('\n' in p and len(p) < 700 and k <= 2 and p[0] in '“‘’"ABCDEFGHIJKLMNOPQRSTUVWXYZ'))
        if not ok:
            break
        k += 1
    return k


def main(write):
    m = load(MOD); o = load(ORG)
    changed = []
    total_epi = 0
    for oc, mc in zip(o['chapters'], m['chapters']):
        u = oc['number']
        k = epigraph_count(u, oc['paragraphs'])
        total_epi += k
        for i in range(k):
            if mc['paragraphs'][i] != oc['paragraphs'][i]:
                changed.append((u, i))
                if write:
                    mc['paragraphs'][i] = oc['paragraphs'][i]
    print('epigraph paragraphs:', total_epi, 'changed:', len(changed))
    print('units changed:', sorted({u for u, _ in changed}))
    if write:
        save_mod(m)


if __name__ == '__main__':
    main('--write' in sys.argv)
