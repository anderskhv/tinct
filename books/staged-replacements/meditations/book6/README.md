# Meditations, Book VI — package (draft frozen, awaiting independent review)

Steps 1–3 of `../WORKFLOW.md` are done for Book VI; step 4 (independent
review) is the coordinator's reviewer session, not this agent.

Step 1 confirmed the source: chapter 6 of the rebuilt staged Long (sha256
`b0ecf3da…`, D12), 59 paragraphs; no `[Illustration` anywhere in the file.
Three dagger marks in Book VI of the PG text (VI.38, VI.41, VI.50), matching
`../PROVENANCE.md` §4. Two base-text defects found and recorded (VI.41 "wilt
not blame", VI.49 "dissatisfied. I suppose"), each checked against Standard
Ebooks' Long.

## Files

1. `source-book6.json` — Book 6 (VI.1–VI.59) extracted from
   `../meditations-original-en.staged.json` by `chapter.number == 6`,
   59 paragraphs, byte-identical to the staged original (Long 1862).
2. `candidate-v1.json` — the modern-English candidate, 59 paragraphs one-to-one
   with the source, same schema. **Frozen**: not edited after the packets were
   generated from it. Corrections go to `candidate-v2.json`.
3. `candidate-v1-readable.md` — the same text with `B06-Pnnn` IDs outside the
   prose.
4. `continuity.md` — glossary terms met in Book VI (one row added and two
   extended in `../GLOSSARY.md` before drafting), paragraph-level decisions,
   apparatus folded or dropped (seven cross-references, five D11 drops, seven
   folds), unresolved source issues, and the three bracket decisions flagged
   for the reviewer (VI.43, VI.45, VI.50).
5. `provenance.json` — branch, hashes, source, generation setting.
6. `review-packets/packet-01.md … packet-20.md` — twenty packets of three
   paragraphs (59 = 19×3 + 2), each with one paragraph of context before and
   after marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check.

## Mechanical checks

```bash
cd books/staged-replacements/meditations
python3 - <<'PY'
import json, hashlib
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
for k,s,c in [(37,'by virtue of the active movement and mutual conspiration and the unity of the substance','by virtue of the active movement and mutual conspiration and the unity of the substance'),
              (40,'we do much injustice because we make a difference between these things','we do much injustice because we make a difference between these things'),
              (49,'if the things to which thou wast moved are [not] accomplished.','if the things to which you were moved are not accomplished.')]:
    assert s in src['paragraphs'][k] and c in cand['paragraphs'][k]
import re
assert not any('[' in p or re.search(r'\((?:i|ii|iv|vi|vii|viii|ix|xi)\. ', p) for p in cand['paragraphs'])  # no brackets, no cross-references
print('OK'); print(hashlib.sha256(open('book6/candidate-v1.json','rb').read()).hexdigest())
print(hashlib.sha256(open('meditations-original-en.staged.json','rb').read()).hexdigest())
PY
```

Expected: `78fbe619…` (candidate v1, frozen) and `b0ecf3da…` (staged original).

## Next action

Coordinator: hand `review-instructions.md` and `review-packets/` to a fresh
independent-review session. Findings come back under `book6/review/`. This
agent then applies supported corrections to `candidate-v2.json`, verifies the
changed passages, reads the whole book for flow, and records acceptance in
`ACCEPTANCE.md` before starting Book VII.
