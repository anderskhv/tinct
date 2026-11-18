"""usage: showm.py unit:para ...  -- modern text only (live numbering, 0-based)"""
import sys
from common import *
m = load(MOD)
for a in sys.argv[1:]:
    u, i = map(int, a.split(':'))
    print('=== %d:%d' % (u, i))
    print(m['chapters'][u - 1]['paragraphs'][i])
