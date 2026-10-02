"""Pass E: per-paragraph honorific comparison (Mr./Mrs./Miss/Sir before a capitalised name), original vs modern."""
import re, sys, collections
from common import *
m = load(MOD); o = load(ORG)
T = re.compile(r'\b(Mr\.|Mrs\.|Miss|Sir)\s+(?=[A-Z])')


def cnt(t):
    return collections.Counter(x.group(1) for x in T.finditer(t))


def main():
    rows = []
    unit_tot = collections.defaultdict(lambda: [0, 0])
    for mc, oc in zip(m['chapters'], o['chapters']):
        for i, (b, a) in enumerate(zip(mc['paragraphs'], oc['paragraphs'])):
            ca, cb = cnt(a), cnt(b)
            ta, tb = sum(ca.values()), sum(cb.values())
            unit_tot[oc['number']][0] += ta
            unit_tot[oc['number']][1] += tb
            if any(cb[k] < ca[k] for k in ca):
                rows.append((oc['number'], i, dict(ca), dict(cb)))
    return rows, unit_tot


if __name__ == '__main__':
    rows, ut = main()
    print('paragraphs with fewer honorifics:', len(rows))
    tot = collections.Counter()
    for u, i, ca, cb in rows:
        for k in ca:
            tot[k] += max(0, ca[k] - cb.get(k, 0))
    print('missing by type:', dict(tot))
    worst = sorted(((v[0] - v[1], u, v) for u, v in ut.items()), reverse=True)[:20]
    print('units (diff, unit, [orig, mod]):', worst)
    if '--rows' in sys.argv:
        for r in rows:
            print(r)
