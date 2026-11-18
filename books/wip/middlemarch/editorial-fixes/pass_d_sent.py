"""For each flagged paragraph print only the original sentences containing '!' and the best-matching modern sentence."""
import re, sys
from common import *
m = load(MOD); o = load(ORG)


def sents(t):
    return [s for s in re.split(r'(?<=[.!?:;])[”’]?\s+|(?<=[.!?])[”’]\s+', t) if s]


def words(s):
    return set(re.findall(r"[a-z]+", s.lower()))


start = int(sys.argv[1]) if len(sys.argv) > 1 else 0
end = int(sys.argv[2]) if len(sys.argv) > 2 else 10 ** 9
k = 0
for mc, oc in zip(m['chapters'], o['chapters']):
    for i, (b, a) in enumerate(zip(mc['paragraphs'], oc['paragraphs'])):
        if b.count('!') < a.count('!'):
            k += 1
            if k < start or k > end:
                continue
            print('=== #%d live %d:%d orig!=%d mod!=%d' % (k, oc['number'], i, a.count('!'), b.count('!')))
            ms = sents(b)
            for s in sents(a):
                if '!' in s:
                    ws = words(s)
                    best = max(ms, key=lambda x: len(ws & words(x)) / (len(words(x)) + 1))
                    print('  O:', s)
                    print('  M:', best)
