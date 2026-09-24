# v2: re-verification of revised PATCH.json (7e28f1b0...); expects release at end of 22.34.
"""Independent verification of PATCH.json (does not use tools/apply_patch.py).
Writes the patched copy to review/patched-crime-and-punishment.v1.json and prints findings."""
import json, hashlib, copy, os, sys
from common import *

HERE = os.path.dirname(os.path.abspath(__file__))
REVIEW = os.path.dirname(HERE)
WIP = os.path.dirname(REVIEW)
E = editions()
raw = open(os.path.join(WIP, 'inputs', 'crime-and-punishment.v1.json'), 'rb').read()
print('baseline sha256', hashlib.sha256(raw).hexdigest())
base = json.loads(raw)
ser = lambda o: (json.dumps(o, indent=2, ensure_ascii=False) + '\n').encode('utf-8')
print('baseline re-serializes byte-identically:', ser(base) == raw)
patch = json.load(open(os.path.join(WIP, 'PATCH.json'), encoding='utf-8'))
print('patch baselineSha256 matches:', patch['baselineSha256'] == hashlib.sha256(raw).hexdigest())

# source fingerprints
for ed, f in [('original-en', 'source.json'), ('modern-en', 'baseline-live-modern-en.json')]:
    h = hashlib.sha256(open(os.path.join(WIP, 'inputs', f), 'rb').read()).hexdigest()
    print(ed, 'sourceSha256 matches input file:', base['editions'][ed]['sourceSha256'] == h)
print('candidate sha256', hashlib.sha256(open(os.path.join(WIP, 'inputs', 'candidate.json'), 'rb').read()).hexdigest())

def char(doc, ed):
    [c] = [c for c in doc['editions'][ed]['characters'] if c['id'] == 'svidrigailov']
    return c

# paragraph hash check on relevant paragraphs (assumes sha256 of normalized utf-8 text)
for ed in ('original-en', 'modern-en'):
    ph = base['editions'][ed]['paragraphHashes']
    ok = all(ph[str(ch)][pi] == hashlib.sha256(para(ed, ch, pi).encode()).hexdigest()
             for ch, pi in [(3, 38), (16, 73), (17, 49), (22, 31), (22, 34), (22, 37)])
    print(ed, 'paragraphHashes match normalized text at cited paragraphs:', ok)

# --- apply the patch by hand, not via generic path walking ---
patched = copy.deepcopy(base)
ops = patch['operations']
assert len(ops) == 4
for op in ops:
    ed = op['edition']
    assert op['path'][0:3] == ['editions', ed, 'characters'] and op['path'][3] == {'id': 'svidrigailov'}
    c = char(patched, ed)
    if op['op'] == 'replace':
        assert op['path'][4:] == ['snapshots', {'id': 'svidrigailov-1'}, 'body']
        [s] = [s for s in c['snapshots'] if s['id'] == 'svidrigailov-1']
        print(ed, 'old value equals baseline body:', s['body'] == op['old'])
        s['body'] = op['new']
    elif op['op'] == 'insert-after':
        assert op['path'][4:] == ['snapshots']
        ids = [s['id'] for s in c['snapshots']]
        assert op['absentBefore'] not in ids
        c['snapshots'].insert(ids.index(op['after']) + 1, copy.deepcopy(op['value']))
    else:
        sys.exit('unknown op')

out = ser(patched)
open(os.path.join(REVIEW, 'patched-crime-and-punishment.v1.json'), 'wb').write(out)
print('patched sha256', hashlib.sha256(out).hexdigest())
print('author-reported     c641a04992890b85707ae6e25afe03db48c73c751151eb8d0d5a94cc7c066245')
print('PATCH.json sha256', hashlib.sha256(open(os.path.join(WIP, 'PATCH.json'), 'rb').read()).hexdigest())

# --- structural diff: everything except the intended fields must be identical ---
def strip(doc):
    d = copy.deepcopy(doc)
    for ed in ('original-en', 'modern-en'):
        c = char(d, ed)
        c['snapshots'] = [s for s in c['snapshots'] if s['id'] != 'svidrigailov-2']
        for s in c['snapshots']:
            if s['id'] == 'svidrigailov-1':
                s['body'] = None
    return d
print('no change outside svidrigailov-1.body and new svidrigailov-2:', strip(base) == strip(patched))
for ed in ('original-en', 'modern-en'):
    b, p = char(base, ed), char(patched, ed)
    s1b, s1p = b['snapshots'][0], p['snapshots'][0]
    print(ed, 'snapshot-1 fields other than body unchanged:',
          {k: v for k, v in s1b.items() if k != 'body'} == {k: v for k, v in s1p.items() if k != 'body'})
    print(ed, 'firstMention/roleVisibleAt/name/subtitle unchanged:',
          all(b[k] == p[k] for k in ('firstMention', 'roleVisibleAt', 'kind', 'storyRole')))
    print(ed, 'snapshot-2 name/subtitle == snapshot-1:',
          p['snapshots'][1]['name'] == s1p['name'], p['snapshots'][1]['subtitle'] == s1p['subtitle'])
    print(ed, 'snapshot-2 body == old snapshot-1 body:', p['snapshots'][1]['body'] == s1b['body'])
    print(ed, 'snapshot keys identical:', set(p['snapshots'][1]) == set(s1b))

# --- runtime validity ---
key = lambda l: (l['chapterNumber'], l['paragraphIndex'], l.get('offset', l.get('throughOffset')))
for ed, src in (('original-en', 'original-en'), ('modern-en', 'modern-en')):
    c = char(patched, ed)
    fm = key(c['firstMention'])
    prev = None
    for s in c['snapshots']:
        a = key(s['availableAt'])
        L = u16len(para(src, a[0], a[1]))
        assert 0 <= a[2] <= L, (ed, s['id'], a, L)
        assert a >= fm, (ed, s['id'])
        if prev: assert a > prev, 'ordering'
        prev = a
        for ev in s['evidence']:
            k = key(ev); Le = u16len(para(src, k[0], k[1]))
            assert 0 <= k[2] <= Le and k <= a, (ed, s['id'], k, Le)
    print(ed, 'runtime validity (offsets in range, >= firstMention, strictly ordered, evidence <= availableAt): OK')

# --- paragraph-end offsets ---
print('\nparagraph-end UTF-16 lengths:')
spots = [(16, 73), (17, 49), (22, 31), (22, 34)]
for ed in ('original-en', 'modern-en', 'candidate'):
    print(' ', ed, {f'{c}.{p}': u16len(para(ed, c, p)) for c, p in spots})
for ed in ('original-en', 'modern-en'):
    s2 = char(patched, ed)['snapshots'][1]
    exp = [(e['chapterNumber'], e['paragraphIndex'], u16len(para(ed, e['chapterNumber'], e['paragraphIndex']))) for e in s2['evidence']]
    got = [key(e) for e in s2['evidence']]
    a = key(s2['availableAt'])
    print(ed, 'evidence at paragraph ends:', exp == got, '| availableAt at paragraph end:', a == (22, 34, u16len(para(ed, 22, 34))))
cc = patch['candidateCoordinates']
got = [key(e) for e in cc['evidence']]
exp = [(c, p, u16len(para('candidate', c, p))) for c, p in spots]
print('candidateCoordinates evidence correct:', got == exp, '| availableAt correct:', key(cc['availableAt']) == (22, 34, u16len(para('candidate', 22, 34))))

# first-mention text
for ed in ('original-en', 'modern-en'):
    fm = char(base, ed)['firstMention']; t = para(ed, 3, 38)
    print(ed, 'text ending at firstMention:', repr(u16slice(t, fm['offset'])[-30:]))
t = para('candidate', 3, 38); i = t.find('At first, indeed, Mr. Svidrigailov')
print('candidate 3.38 "Mr. Svidrigailov" ends at', u16len(t[:i + len('At first, indeed, Mr. Svidrigailov')]) if i >= 0 else 'not found (informational)')
