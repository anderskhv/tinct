"""Pass D: list every paragraph where the modern text has fewer '!' than the original (live numbering)."""
import sys
from common import *
m = load(MOD); o = load(ORG)
n = 0
full = '--full' in sys.argv
for mc, oc in zip(m['chapters'], o['chapters']):
    for i, (b, a) in enumerate(zip(mc['paragraphs'], oc['paragraphs'])):
        if b.count('!') < a.count('!'):
            n += 1
            print('=== live %d:%d  orig!=%d mod!=%d' % (oc['number'], i, a.count('!'), b.count('!')))
            if full:
                print('ORG:', a)
                print('MOD:', b)
print('total', n)
