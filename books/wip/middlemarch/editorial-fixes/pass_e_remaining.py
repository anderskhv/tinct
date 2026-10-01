"""Print remaining honorific deficits: original sentence(s) with the title and the best-matching modern sentence."""
import re, sys
from common import *
from pass_e_honorifics import sents, words, TITLE_RE
from pass_e_list import T, cnt

m = load(MOD); o = load(ORG)
lo = int(sys.argv[1]) if len(sys.argv) > 1 else 0
hi = int(sys.argv[2]) if len(sys.argv) > 2 else 10 ** 9
k = 0
for mc, oc in zip(m['chapters'], o['chapters']):
    for i, (b, a) in enumerate(zip(mc['paragraphs'], oc['paragraphs'])):
        ca, cb = cnt(a), cnt(b)
        if not any(cb[x] < ca[x] for x in ca):
            continue
        k += 1
        if k < lo or k > hi:
            continue
        print('=== #%d live %d:%d %s -> %s' % (k, oc['number'], i, dict(ca), dict(cb)))
        ms = sents(b)
        for s in sents(a):
            if T.search(s):
                ws = words(s)
                best = max(ms, key=lambda x: len(ws & words(x)) / (len(words(x)) + 1))
                print('  O:', s[:230])
                print('  M:', best[:230])
