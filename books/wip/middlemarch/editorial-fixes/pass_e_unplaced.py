"""After the automatic pass: list remaining deficits where the modern paragraph still mentions the bare surname."""
import re, sys
from common import *
from pass_e_honorifics import process, TITLE_RE

m = load(MOD); o = load(ORG)
n_all = n_name = 0
for oc, mc in zip(o['chapters'], m['chapters']):
    for i, (a, b) in enumerate(zip(oc['paragraphs'], mc['paragraphs'])):
        new, applied, unplaced = process(a, b, None)
        for t, nme, d in unplaced:
            n_all += 1
            ctxs = []
            for mm in re.finditer(r'(?<![A-Za-z])' + re.escape(nme) + r'(?![A-Za-z])', new):
                pre = new[max(0, mm.start() - 22):mm.start()]
                if re.search(r'(Mr\.|Mrs\.|Miss|Sir|Dr\.)\s*$', pre):
                    continue
                ctxs.append(new[max(0, mm.start() - 35):mm.end() + 25].replace('\n', ' '))
            if ctxs:
                n_name += 1
                print('live %d:%d %s %s %s' % (oc['number'], i, t, nme, d))
                for c in ctxs:
                    print('      ...%s...' % c)
print('unplaced', n_all, 'with bare name still present', n_name)
