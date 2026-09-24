"""Independent v3 verification of the Svidrigailov snapshot patches.

Offline, deterministic. Reads only files under the job's inputs/ and the two PATCH files.
Writes the patched copies into review/v3/.

Usage: python3 verify.py [--expect-a SHA] [--expect-b SHA] [--prior-patch-sha SHA]
Defaults are the hashes of the final (N1/N3) version.
"""
import copy, hashlib, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from texts import load, u16, BASE

V3 = os.path.join(BASE, 'review', 'v3')
FAIL = []

def check(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        FAIL.append(msg)

def sha(b):
    return hashlib.sha256(b).hexdigest()

def ser(obj):
    return (json.dumps(obj, indent=2, ensure_ascii=False) + '\n').encode('utf-8')

def loc(d):
    return (d['chapterNumber'], d['paragraphIndex'], d.get('offset', d.get('throughOffset')))

# ---------------------------------------------------------------- patch apply
def resolve(root, path):
    cur = root
    for comp in path:
        if isinstance(comp, dict):
            hits = [x for x in cur if x.get('id') == comp['id']]
            if len(hits) != 1:
                raise ValueError(f'path component {comp} matched {len(hits)} items')
            cur = hits[0]
        else:
            cur = cur[comp]
    return cur

def apply(card, patch):
    out = copy.deepcopy(card)
    for op in patch['operations']:
        assert op['path'][1] == op['edition'], op
        if op['op'] == 'replace':
            parent = resolve(out, op['path'][:-1])
            key = op['path'][-1]
            if parent[key] != op['old']:
                raise ValueError(f'old mismatch at {op["path"]}: {parent[key]!r}')
            parent[key] = op['new']
        elif op['op'] == 'insert-after':
            lst = resolve(out, op['path'])
            ids = [x['id'] for x in lst]
            if op['absentBefore'] in ids:
                raise ValueError(f'{op["absentBefore"]} already present')
            if op['value']['id'] != op['absentBefore']:
                raise ValueError('value id != absentBefore')
            lst.insert(ids.index(op['after']) + 1, copy.deepcopy(op['value']))
        else:
            raise ValueError(op['op'])
    return out

# ---------------------------------------------------------------- structural diff
def diff(a, b, path=()):
    out = []
    if type(a) != type(b):
        return [path]
    if isinstance(a, dict):
        if list(a.keys()) != list(b.keys()):
            out.append(path + ('<keys>',))
        for k in a:
            if k in b:
                out += diff(a[k], b[k], path + (k,))
    elif isinstance(a, list):
        # align lists of id-bearing dicts by id
        if a and all(isinstance(x, dict) and 'id' in x for x in a + b):
            ia = [x['id'] for x in a]; ib = [x['id'] for x in b]
            if ia != ib:
                out.append(path + ('<ids ' + ','.join(ia) + ' -> ' + ','.join(ib) + '>',))
            for x in a:
                y = [z for z in b if z['id'] == x['id']]
                if y:
                    out += diff(x, y[0], path + ('#' + x['id'],))
        else:
            if len(a) != len(b):
                out.append(path + (f'<len {len(a)}->{len(b)}>',))
            for i, (x, y) in enumerate(zip(a, b)):
                out += diff(x, y, path + (i,))
    elif a != b:
        out.append(path)
    return out

# ---------------------------------------------------------------- runtime model
def visible(char, cutoff):
    """Latest snapshot with availableAt <= cutoff; None before firstMention."""
    if cutoff < loc(char['firstMention']):
        return None
    best = None
    for s in char['snapshots']:
        if loc(s['availableAt']) <= cutoff:
            best = s
    return best

def validate(card, ed, text_ed, label):
    e = card['editions'][ed]
    texts = load(text_ed)
    # binding: paragraph hashes of the relevant paragraphs match the text used
    for c, p in [(3, 38), (16, 73), (17, 49), (22, 31), (22, 34)]:
        h = hashlib.sha256(texts[c][p].encode('utf-8')).hexdigest()
        check(e['paragraphHashes'][str(c)][p] == h, f'{label} {ed}: paragraphHash {c}.{p} matches {text_ed}')
    ch = [x for x in e['characters'] if x['id'] == 'svidrigailov'][0]
    fm = loc(ch['firstMention'])
    m = sorted((x for x in e['mentions'] if x['characterId'] == 'svidrigailov'),
               key=lambda x: (x['chapterNumber'], x['paragraphIndex'], x['startOffset']))[0]
    check((m['chapterNumber'], m['paragraphIndex'], m['endOffset']) == fm,
          f'{label} {ed}: firstMention {fm} = end of earliest bound mention {m["text"]!r}')
    t = texts[m['chapterNumber']][m['paragraphIndex']]
    check(t.encode('utf-16-le')[2*m['startOffset']:2*m['endOffset']].decode('utf-16-le') == m['text'],
          f'{label} {ed}: earliest mention span text matches source')
    prev = None
    for s in ch['snapshots']:
        a = loc(s['availableAt'])
        plen = u16(texts[a[0]][a[1]])
        check(0 <= a[2] <= plen, f'{label} {ed} {s["id"]}: availableAt {a} within paragraph (len {plen})')
        check(a >= fm, f'{label} {ed} {s["id"]}: availableAt not before firstMention')
        if prev:
            check(a > prev, f'{label} {ed} {s["id"]}: strictly after previous snapshot')
        prev = a
        for ev in s['evidence']:
            v = loc(ev)
            elen = u16(texts[v[0]][v[1]])
            check(v <= a, f'{label} {ed} {s["id"]}: evidence {v} not after availableAt')
            check(v[2] <= elen, f'{label} {ed} {s["id"]}: evidence {v} within paragraph (len {elen})')
            if s['id'] != 'svidrigailov-1':
                check(v[2] == elen, f'{label} {ed} {s["id"]}: evidence {v} is paragraph end')
        if s['id'] != 'svidrigailov-1':
            check(a[2] == plen, f'{label} {ed} {s["id"]}: availableAt is paragraph end ({plen})')
    return ch

def simulate(ch, text_ed, label):
    texts = load(text_ed)
    fm = loc(ch['firstMention'])
    L = lambda c, p: u16(texts[c][p])
    pts = [
        ('before first mention (3.38 @fm-1)', (3, 38, fm[2] - 1)),
        ('first mention (3.38 @fm)', fm),
        ('one unit before end of 3.38', (3, 38, L(3, 38) - 1)),
        ('end of 3.38', (3, 38, L(3, 38))),
        ('start of 3.39', (3, 39, 0)),
        ('16.73 end', (16, 73, L(16, 73))),
        ('17.49 end', (17, 49, L(17, 49))),
        ('21.2 end', (21, 2, L(21, 2))),
        ('22.2 end', (22, 2, L(22, 2))),
        ('one unit before end of 22.34', (22, 34, L(22, 34) - 1)),
        ('end of 22.34', (22, 34, L(22, 34))),
        ('22.35 start', (22, 35, 0)),
        ('41.7 end', (41, 7, L(41, 7))),
    ]
    rows = []
    for name, cut in pts:
        s = visible(ch, cut)
        rows.append((name, cut, s['id'] if s else '(no card)'))
        print(f'  {label:28s} {name:34s} {str(cut):18s} -> {s["id"] if s else "(no card)"}')
    return rows

# ---------------------------------------------------------------- main
import argparse
AP = argparse.ArgumentParser()
AP.add_argument('--expect-a', default='5e0a9ea5a121817b11f4667928bcc10cd60b25f27d9b2e209bc68f6d2ef12be4')
AP.add_argument('--expect-b', default='0e695a1296eae579b3477faf3f56e0176476b0915f0a9bff47391b94ada54676')
AP.add_argument('--prior-patch-sha', default=None,
                help='if given, PATCH.json minus the 3 metadata keys must serialize to this hash')
ARGS = AP.parse_args()

def main():
    base_path = os.path.join(BASE, 'inputs', 'crime-and-punishment.v1.json')
    staged_path = os.path.join(BASE, 'inputs', 'crime-and-punishment.v1.staged-01963b24.json')
    pA_path = os.path.join(BASE, 'PATCH.json')
    pB_path = os.path.join(BASE, 'PATCH-staged-01963b24.json')
    raw = {k: open(p, 'rb').read() for k, p in
           [('base', base_path), ('staged', staged_path), ('A', pA_path), ('B', pB_path)]}
    print('sha PATCH.json         ', sha(raw['A']))
    print('sha PATCH-staged       ', sha(raw['B']))
    check(sha(raw['base']).startswith('2125526c'), 'baseline card sha 2125526c')
    check(sha(raw['staged']).startswith('b4e2217d'), 'staged card sha b4e2217d')
    base = json.loads(raw['base']); staged = json.loads(raw['staged'])
    pA = json.loads(raw['A']); pB = json.loads(raw['B'])
    check(ser(base) == raw['base'], 'baseline card round-trips byte-for-byte under the serialization')
    check(ser(staged) == raw['staged'], 'staged card round-trips byte-for-byte under the serialization')
    check(pA['baselineSha256'] == sha(raw['base']), 'PATCH.json baselineSha256 = baseline')
    check(pB['baselineSha256'] == sha(raw['staged']), 'PATCH-staged baselineSha256 = staged card')

    # PATCH.json without the three new metadata keys reproduces 323e2f5c
    stripped = {k: v for k, v in pA.items() if k not in ('baseline', 'baselineInput', 'editionInputs')}
    print('PATCH.json minus metadata keys:', sha(ser(stripped)))
    if ARGS.prior_patch_sha:
        check(sha(ser(stripped)) == ARGS.prior_patch_sha,
              f'PATCH.json minus {{baseline, baselineInput, editionInputs}} serializes to {ARGS.prior_patch_sha[:8]}')

    # ---- apply A to baseline
    outA = apply(base, pA)
    dA = diff(base, outA)
    print('changed paths (A):'); [print('   ', '/'.join(map(str, d))) for d in dA]
    expected = set()
    for ed in ('original-en', 'modern-en'):
        pre = ('editions', ed, 'characters', '#svidrigailov', 'snapshots')
        expected |= {pre + ('<ids svidrigailov-1 -> svidrigailov-1,svidrigailov-2,svidrigailov-3>',),
                     pre + ('#svidrigailov-1', 'subtitle'), pre + ('#svidrigailov-1', 'body')}
    check(set(dA) == expected, 'A: only declared fields change (2 replaces + 2 inserts per edition)')
    bA = ser(outA)
    print('patched sha (A)        ', sha(bA))
    check(sha(bA) == ARGS.expect_a, f'A: patched sha = expected {ARGS.expect_a[:8]}')
    open(os.path.join(V3, 'patched-crime-and-punishment.v1.json'), 'wb').write(bA)

    # ---- apply B to staged
    outB = apply(staged, pB)
    dB = diff(staged, outB)
    check(set(dB) == expected, 'B: only declared fields change (2 replaces + 2 inserts per edition)')
    bB = ser(outB)
    print('patched sha (B)        ', sha(bB))
    check(sha(bB) == ARGS.expect_b, f'B: patched sha = expected {ARGS.expect_b[:8]}')
    open(os.path.join(V3, 'patched-crime-and-punishment.v1.staged-01963b24.json'), 'wb').write(bB)

    # ---- A vs B: ops identical except modern-en coordinates; B coords == candidateCoordinates
    for a, b in zip(pA['operations'], pB['operations']):
        if a['edition'] == 'original-en' or a['op'] == 'replace':
            check(a == b, f'A==B op {a["edition"]} {a["op"]} {a.get("value", {}).get("id", a["path"][-1])}')
        else:
            sid = a['value']['id']
            cc = pA['candidateCoordinates']['snapshots'][sid]
            check(b['value']['availableAt'] == cc['availableAt'] and b['value']['evidence'] == cc['evidence'],
                  f'B modern-en {sid} coords == PATCH.json candidateCoordinates')
            ra = {k: v for k, v in a['value'].items() if k not in ('availableAt', 'evidence')}
            rb = {k: v for k, v in b['value'].items() if k not in ('availableAt', 'evidence')}
            check(ra == rb, f'B modern-en {sid} wording/name/basis identical to A')
    check(len(pA['operations']) == len(pB['operations']) == 8, '8 operations each')

    # ---- names unchanged
    for lab, card in (('A', outA), ('B', outB)):
        for ed in ('original-en', 'modern-en'):
            ch = [x for x in card['editions'][ed]['characters'] if x['id'] == 'svidrigailov'][0]
            names = {s['name'] for s in ch['snapshots']}
            check(len(names) == 1, f'{lab} {ed}: one display name across snapshots {names}')

    # ---- runtime validity and simulation
    sims = {}
    for lab, card, eds in (('A', outA, [('original-en', 'original-en'), ('modern-en', 'modern-en')]),
                           ('B', outB, [('original-en', 'original-en'), ('modern-en', 'candidate')])):
        for ed, ted in eds:
            ch = validate(card, ed, ted, lab)
            sims[(lab, ed)] = simulate(ch, ted, f'{lab} {ed} ({ted})')
    # baseline for comparison
    for ed in ('original-en', 'modern-en'):
        ch = [x for x in base['editions'][ed]['characters'] if x['id'] == 'svidrigailov'][0]
        simulate(ch, ed, f'baseline {ed}')

    # ---- candidateCoordinates applied onto A modern-en == B modern-en svidrigailov (except firstMention anchors)
    chA = copy.deepcopy([x for x in outA['editions']['modern-en']['characters'] if x['id'] == 'svidrigailov'][0])
    for s in chA['snapshots']:
        if s['id'] in pA['candidateCoordinates']['snapshots']:
            s.update(copy.deepcopy(pA['candidateCoordinates']['snapshots'][s['id']]))
    chB = [x for x in outB['editions']['modern-en']['characters'] if x['id'] == 'svidrigailov'][0]
    check(chA['snapshots'][1:] == chB['snapshots'][1:], 'A+candidateCoordinates snapshots 2-3 == B modern-en snapshots 2-3')

    print('\nFAILURES:', len(FAIL))
    for f in FAIL:
        print('  ', f)
    return 1 if FAIL else 0

if __name__ == '__main__':
    sys.exit(main())
