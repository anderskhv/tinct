from common import *
import re, collections
m = load(MOD); o = load(ORG)
tok = lambda src: collections.Counter(w.lower() for c in src['chapters'] for p in c['paragraphs'] for w in re.findall(r"[A-Za-z]+", p))
tm, to = tok(m), tok(o)
out = []
for w, c in sorted(tm.items()):
    if re.search(r'(vell|woolly|woollen|modell|cancell|levell|fuell|labell|counsell|ised|ising|isation|yse|ysed|ogue|tre|tres|ae|oe|ourab|ourit|ough$|nce$|ence$)', w) and w not in to:
        out.append('%s %d' % (w, c))
print('; '.join(out))
