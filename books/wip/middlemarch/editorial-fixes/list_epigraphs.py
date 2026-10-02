from common import *
m = load(MOD); o = load(ORG)
for i, (oc, mc) in enumerate(zip(o['chapters'], m['chapters'])):
    op, mp = oc['paragraphs'], mc['paragraphs']
    assert len(op) == len(mp)
    out = []
    for k in range(min(4, len(op))):
        out.append((k, len(op[k]), '\n' in op[k], op[k] == mp[k], op[k][:50].replace('\n', '|')))
    print(oc['number'], out)
