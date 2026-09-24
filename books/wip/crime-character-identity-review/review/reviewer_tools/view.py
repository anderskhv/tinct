import json, sys, re, os
sys.path.insert(0, os.path.dirname(__file__))
from align import build, entries, nt, TOK
W = int(os.environ.get('W', 180))
def win(s, a, b, w=W):
    return ('…' if a - w > 0 else '') + s[max(0, a - w):a] + '⟦' + s[a:b] + '⟧' + s[b:b + w] + ('…' if b + w < len(s) else '')
def normwin(s): return [nt(t) for t in TOK.findall(s)]
sel = sys.argv[1:]
for e in entries:
    if sel and e['entryId'] not in sel and not any(e['entryId'].startswith(x) and x.endswith('*') for x in sel): continue
    r = build(e)
    m = r['mapped']
    lw = win(r['L'], r['ps'], r['pe'])
    print(f"=== {e['entryId']} {e['characterId']} ch{e['chapterNumber']} p{e['paragraphIndex']} live@{e['old']['startOffset']} '{e['old']['text']}'  occ_in_cand={len(r['occ'])}")
    if m:
        a, b = m['py']; cw = win(r['C'], a, b)
        same = normwin(lw) == normwin(cw)
        print(f"  -> cand {m['startOffset']}-{m['endOffset']} '{m['text']}' {'[window identical mod spelling]' if same else ''}")
        if not same: print('  L:', lw)
        print('  C:', cw)
    else:
        print('  L:', lw); print('  op', r['op'])
    import re as _re
    from align import NAMEPAT
    locc=[m.start() for m in _re.finditer(NAMEPAT[e['characterId']], r['L'])]
    lr = next((i for i,x in enumerate(locc) if x<=r['ps']<x+30), None)
    cr = next((i for i,o in enumerate(r['occ']) if m and o[0]==m['startOffset']), None)
    print(f"  rank live {lr}/{len(locc)} -> cand {cr}/{len(r['occ'])}; src occ {len(r['socc'])}")
