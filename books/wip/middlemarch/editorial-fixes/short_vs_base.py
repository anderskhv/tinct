"""Compare paragraphs under 0.70 of source words now vs the pre-fix baseline (git HEAD at branch start)."""
import json
from common import *
BASE = '/tmp/claude-0/-home-user-tinct/b146a23a-d0c5-56ff-ad5d-602fa4f6e9ef/scratchpad/base-modern.json'
b = json.load(open(BASE, encoding='utf-8')); m = load(MOD); o = load(ORG)


def short(mod):
    s = set()
    for mc, oc in zip(mod['chapters'], o['chapters']):
        for i, (x, a) in enumerate(zip(mc['paragraphs'], oc['paragraphs'])):
            wa = len(a.split())
            if wa >= 20 and len(x.split()) / wa < 0.70:
                s.add((oc['number'], i))
    return s


sb, sm = short(b), short(m)
print('baseline', len(sb), 'now', len(sm), 'new:', sorted(sm - sb), 'resolved:', sorted(sb - sm))
