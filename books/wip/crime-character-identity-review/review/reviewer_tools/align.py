"""Independent reviewer tool: recompute live mention -> candidate span alignment.
Reads only inputs/ and evidence/entries.json (for entry IDs and live offsets).
Offsets are UTF-16 code units after normalization."""
import json, re, difflib, sys, os
BASE = os.path.join(os.path.dirname(__file__), '..', '..')
I = lambda p: os.path.join(BASE, p)

def norm(t): return re.sub(r' {2,}', ' ', t.replace('\n', ' '))
def u16(s): return len(s.encode('utf-16-le')) // 2

live = json.load(open(I('inputs/baseline-live-modern-en.json')))
cand = json.load(open(I('inputs/candidate.json')))
src = json.load(open(I('inputs/source.json')))
pkg = json.load(open(I('inputs/crime-and-punishment.v1.json')))['editions']['modern-en']
entries = json.load(open(I('evidence/entries.json')))
chars = {c['id']: c for c in pkg['characters']}

def para(ed, ch, p):
    c = [x for x in ed['chapters'] if x['number'] == ch][0]
    return norm(c['paragraphs'][p]) if p < len(c['paragraphs']) else None

# UTF-16 offset <-> python index
def py_from_u16(s, off):
    n = 0
    for i, chr_ in enumerate(s):
        if n >= off: return i
        n += 2 if ord(chr_) > 0xFFFF else 1
    return len(s)
def u16_from_py(s, i): return u16(s[:i])

TOK = re.compile(r"[\wï]+|[^\w\s]", re.U)
def toks(s): return [(m.group(), m.start(), m.end()) for m in TOK.finditer(s)]
def nt(w):
    w = w.lower().replace('ï', 'i')
    w = re.sub(r'itch$', 'ich', w); w = re.sub(r'itchs$', 'ichs', w)
    return {'sonia': 'sonya', 'dounia': 'dunya', 'razumihin': 'razumikhin', 'zametov': 'zamyotov',
            'sofya': 'sofya', 'dunechka': 'dunya', 'dounechka': 'dunya'}.get(w, w)

NAMEPAT = {
 'svidrigailov': r"Svidriga[iï]lov|Arkady Ivanovi?t?ch",
 'dunya': r"Dounia|Dunya|Dunechka|Dounietchka|Avdotya Romanovna|Avdotia Romanovna",
 'razumikhin': r"Razumi?k?hin|Razumihin",
 'sonya': r"Sonia|Sonya|Sofya Semyonovna|Sofya Semyonovna|Sofia Semyonovna|Sonetchka|Sonechka",
 'ilya-petrovich': r"Ilya Petrovi?t?ch|Gunpowder|assistant superintendent|lieutenant",
 'luzhin': r"Pyotr Petrovi?t?ch|Luzhin|P[eë]tr Petrovitch",
 'raskolnikov': r"Raskolnikov|Rodion Romanovi?t?ch|Rodya|Rodion",
 'porfiry': r"Porfiry|Porfiry Petrovi?t?ch",
 'katerina-ivanovna': r"Katerina Ivanovna",
 'zamyotov': r"Zam[yë]?[oe]tov|Zametov",
}

def build(e):
    ch, p = e['chapterNumber'], e['paragraphIndex']
    L, C = para(live, ch, p), para(cand, ch, p)
    S = para(src, ch, p)
    so, eo = e['old']['startOffset'], e['old']['endOffset']
    ps, pe = py_from_u16(L, so), py_from_u16(L, eo)
    ok = L[ps:pe] == e['old']['text']
    # also verify against package mention list
    inpkg = any(m['characterId'] == e['characterId'] and m['chapterNumber'] == ch and m['paragraphIndex'] == p
                and m['startOffset'] == so and m['endOffset'] == eo and m['text'] == e['old']['text'] for m in pkg['mentions'])
    lt, ct = toks(L), toks(C)
    sm = difflib.SequenceMatcher(None, [nt(t[0]) for t in lt], [nt(t[0]) for t in ct], autojunk=False)
    idx = [i for i, t in enumerate(lt) if t[1] >= ps and t[2] <= pe]
    mapped = None; op = None
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if i1 <= idx[0] < i2:
            op = (tag, i1, i2, j1, j2)
            if tag == 'equal' and idx[-1] < i2:
                a = ct[j1 + idx[0] - i1][1]; b = ct[j1 + idx[-1] - i1][2]
                mapped = {'startOffset': u16_from_py(C, a), 'endOffset': u16_from_py(C, b), 'text': C[a:b], 'py': (a, b)}
            break
    occ = [(u16_from_py(C, m.start()), u16_from_py(C, m.end()), m.group()) for m in re.finditer(NAMEPAT[e['characterId']], C)]
    socc = [(m.start(), m.group()) for m in re.finditer(NAMEPAT[e['characterId']], S or '')] if S else []
    return dict(L=L, C=C, S=S, ps=ps, pe=pe, ok=ok, inpkg=inpkg, mapped=mapped, op=op, occ=occ, socc=socc, lt=lt, ct=ct)

if __name__ == '__main__':
    out = []
    for e in entries:
        r = build(e)
        out.append(dict(entryId=e['entryId'], characterId=e['characterId'], ch=e['chapterNumber'], p=e['paragraphIndex'],
                        old=e['old']['text'], oldStart=e['old']['startOffset'], ok=r['ok'], inpkg=r['inpkg'],
                        mine={k: v for k, v in (r['mapped'] or {}).items() if k != 'py'} if r['mapped'] else None,
                        tool=(e.get('mapped') or None) and {k: e['mapped'][k] for k in ('startOffset', 'endOffset', 'text')},
                        opTag=r['op'][0] if r['op'] else None, occ=r['occ']))
    json.dump(out, open(os.path.join(os.path.dirname(__file__), 'my_alignment.json'), 'w'), indent=1, ensure_ascii=False)
    from collections import Counter
    print('offset ok', Counter(o['ok'] for o in out), 'in pkg', Counter(o['inpkg'] for o in out))
    print('mine mapped', Counter(bool(o['mine']) for o in out))
    dis = [o for o in out if (o['mine'] and o['tool'] and (o['mine']['startOffset'], o['mine']['endOffset']) != (o['tool']['startOffset'], o['tool']['endOffset'])) or bool(o['mine']) != bool(o['tool'])]
    print('disagree with tool mapped:', len(dis))
    for o in dis: print(o['entryId'], o['mine'], o['tool'], o['opTag'])
