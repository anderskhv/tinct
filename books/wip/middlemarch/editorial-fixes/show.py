"""usage: show.py unit:para [unit:para ...]  (live numbering, 0-based paragraph index) -- prints original/modern pairs"""
import sys
from common import *
m = load(MOD); o = load(ORG)
for a in sys.argv[1:]:
    u, i = map(int, a.split(':'))
    print('=== live %d:%d' % (u, i))
    print('ORG:', o['chapters'][u - 1]['paragraphs'][i])
    print('MOD:', m['chapters'][u - 1]['paragraphs'][i])
