# Meditations, Book VI — package (accepted as candidate v2)

All eight steps of `../WORKFLOW.md` are done for Book VI. The accepted text is
`candidate-v2.json` (sha256 `8ee718d5…`), see `ACCEPTANCE.md`. Step 4
(independent review) was the coordinator's reviewer session, not this agent;
its findings are under `review/`.

Step 1 confirmed the source: chapter 6 of the rebuilt staged Long (sha256
`b0ecf3da…`, D12), 59 paragraphs; no `[Illustration` anywhere in the file.
Three dagger marks in Book VI of the PG text (VI.38, VI.41, VI.50), matching
`../PROVENANCE.md` §4. Two base-text defects found and recorded (VI.41 "wilt
not blame", VI.49 "dissatisfied. I suppose"), each checked against Standard
Ebooks' Long and confirmed by the reviewer against the PG file by line.

## Files

1. `source-book6.json` — Book 6 (VI.1–VI.59) extracted from
   `../meditations-original-en.staged.json` by `chapter.number == 6`,
   59 paragraphs, byte-identical to the staged original (Long 1862).
2. `candidate-v1.json` — the modern-English candidate, 59 paragraphs one-to-one
   with the source, same schema. **Frozen**: not edited after the packets were
   generated from it. Corrections went to `candidate-v2.json`.
3. `candidate-v1-readable.md` — the same text with `B06-Pnnn` IDs outside the
   prose.
4. `continuity.md` — glossary terms met in Book VI (one row added and two
   extended in `../GLOSSARY.md` before drafting), paragraph-level decisions,
   apparatus folded or dropped (seven cross-references, four D11 drops, eight
   folds after v2), unresolved source issues; updated at acceptance where a
   finding reversed or recorded a decision, and with the reviewer's rulings
   on the base-text defects and the bracket decisions.
5. `provenance.json` — branch, hashes, source, generation setting, review
   round, v2 hash.
6. `review-packets/packet-01.md … packet-20.md` — twenty packets of three
   paragraphs (59 = 19×3 + 2), each with one paragraph of context before and
   after marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check, plus the
   v1 and v2 hashes.
9. `review/findings-v1.md` — the independent review of v1 (0 substantive, 3
   minor; Accept after corrections; rulings on the base-text defects and the
   bracket decisions).
10. `candidate-v2.json`, `candidate-v2-readable.md`, `changes-v1-to-v2.md` —
    the corrected candidate, built by `../scripts/build_book6_v2.py` from the
    frozen v1; every change listed with the finding it answers.
11. `ACCEPTANCE.md` — accepted hash, findings applied, flow read.

## Mechanical checks

```bash
cd books/staged-replacements/meditations
python3 - <<'PY'
import json, hashlib, re
src=json.load(open('book6/source-book6.json')); cand=json.load(open('book6/candidate-v1.json'))
st=json.load(open('meditations-original-en.staged.json'))
ch=next(c for c in st['chapters'] if c['number']==6)
assert src['paragraphs']==ch['paragraphs'] and len(cand['paragraphs'])==59
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(cand['paragraphs']))
assert not any('[Illustration' in p for c in st['chapters'] for p in c['paragraphs'])
man=json.load(open('book6/manifest.json'))
ids=[i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids==[f'B06-P{i:03d}' for i in range(1,60)]
md=open('book6/candidate-v1-readable.md').read(); assert all(p in md for p in cand['paragraphs'])
for e in man['packets']:
    t=open('book6/'+e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k=int(pid[-3:])-1; assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t
v2=json.load(open('book6/candidate-v2.json')); assert len(v2['paragraphs'])==59
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(v2['paragraphs']))
md2=open('book6/candidate-v2-readable.md').read(); assert all(p in md2 for p in v2['paragraphs'])
for k,s,c in [(37,'by virtue of the active movement and mutual conspiration and the unity of the substance','by virtue of the active movement and mutual conspiration and the unity of the substance'),
              (40,'we do much injustice because we make a difference between these things','we do much injustice because we make a difference between these things'),
              (49,'if the things to which thou wast moved are [not] accomplished.','if the things to which you were moved are not accomplished.')]:
    assert s in src['paragraphs'][k] and c in cand['paragraphs'][k] and c in v2['paragraphs'][k]
for cc in (cand, v2):
    assert not any('[' in p or re.search(r'\((?:i|ii|iv|vi|vii|viii|ix|xi)\. ', p) for p in cc['paragraphs'])
print('OK'); print(hashlib.sha256(open('book6/candidate-v1.json','rb').read()).hexdigest())
print(hashlib.sha256(open('book6/candidate-v2.json','rb').read()).hexdigest())
PY
```

Expected: `78fbe619…` (v1, frozen) and `8ee718d5…` (v2, accepted); the staged
original is `b0ecf3da…`.

## Next action

None for Book VI. The thread continues with Book VII (`../book7/`).
