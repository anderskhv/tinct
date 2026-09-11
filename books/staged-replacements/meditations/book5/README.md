# Meditations, Book V — package (draft frozen, awaiting independent review)

Steps 1–3 of `../WORKFLOW.md` are done for Book V; step 4 (independent
review) is the coordinator's reviewer session, not this agent.

Step 1 confirmed the source: chapter 5 of the rebuilt staged Long (sha256
`b0ecf3da…`, D12), 36 paragraphs; V.8, one of the three paragraphs that had
carried a PG illustration caption before the rebuild, is clean. Seven dagger
marks in Book V of the PG text (V.9, V.12 ×4, V.28 ×2), matching
`../PROVENANCE.md` §4.

## Files

1. `source-book5.json` — Book 5 (V.1–V.36) extracted from
   `../meditations-original-en.staged.json` by `chapter.number == 5`,
   36 paragraphs, byte-identical to the staged original (Long 1862).
2. `candidate-v1.json` — the modern-English candidate, 36 paragraphs one-to-one
   with the source, same schema. **Frozen**: not edited after the packets were
   generated from it. Corrections go to `candidate-v2.json`.
3. `candidate-v1-readable.md` — the same text with `B05-Pnnn` IDs outside the
   prose.
4. `continuity.md` — glossary terms met in Book V (two rows added and two
   extended in `../GLOSSARY.md` before drafting), paragraph-level decisions,
   apparatus folded or dropped, unresolved source issues.
5. `provenance.json` — branch, hashes, source, generation setting.
6. `review-packets/packet-01.md … packet-12.md` — twelve packets of three
   paragraphs (36 = 12×3), each with one paragraph of context before and
   after marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check.

## Mechanical checks

```bash
cd books/staged-replacements/meditations
python3 - <<'PY'
import json, hashlib
src=json.load(open('book5/source-book5.json')); cand=json.load(open('book5/candidate-v1.json'))
st=json.load(open('meditations-original-en.staged.json'))
ch=next(c for c in st['chapters'] if c['number']==5)
assert src['paragraphs']==ch['paragraphs'] and len(cand['paragraphs'])==36
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(cand['paragraphs']))
assert not any('[Illustration' in p for c in st['chapters'] for p in c['paragraphs'])
man=json.load(open('book5/manifest.json'))
ids=[i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids==[f'B05-P{i:03d}' for i in range(1,37)]
md=open('book5/candidate-v1-readable.md').read(); assert all(p in md for p in cand['paragraphs'])
for e in man['packets']:
    t=open('book5/'+e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k=int(pid[-3:])-1; assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t
for k,s,c in [(8,'fail to obey reason, and thou wilt repose in it','fail to obey reason, and you will repose in it'),
              (11,'anything which should not be in harmony with what is really good','anything which should not be in harmony with what is really good'),
              (11,'Thus even the many perceive the difference.','Thus even the many perceive the difference.'),
              (27,'Neither tragic actor nor whore.','Neither tragic actor nor whore.')]:
    assert s in src['paragraphs'][k] and c in cand['paragraphs'][k]
assert 'gone out,...' in src['paragraphs'][28] and 'gone out,...' in cand['paragraphs'][28]
print('OK'); print(hashlib.sha256(open('book5/candidate-v1.json','rb').read()).hexdigest())
print(hashlib.sha256(open('meditations-original-en.staged.json','rb').read()).hexdigest())
PY
```

Expected: `9b061974…` (candidate v1, frozen) and `b0ecf3da…` (staged original).

## Next action

Coordinator: hand `review-instructions.md` and `review-packets/` to a fresh
independent-review session. Findings come back under `book5/review/`. This
agent then applies supported corrections to `candidate-v2.json`, verifies the
changed passages, reads the whole book for flow, and records acceptance in
`ACCEPTANCE.md` before starting Book VI.
