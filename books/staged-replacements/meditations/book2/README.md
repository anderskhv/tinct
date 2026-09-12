# Meditations, Book II — pilot package (draft frozen, awaiting independent review)

Steps 1–3 of `../WORKFLOW.md` are done for Book II; step 4 (independent
review) is the coordinator's reviewer session, not this agent.

## Files

1. `source-book2.json` — Book 2 (II.1–II.17) extracted from
   `../meditations-original-en.staged.json` by `chapter.number == 2`,
   17 paragraphs, byte-identical to the staged original (Long 1862).
2. `candidate-v1.json` — the modern-English candidate, 17 paragraphs one-to-one
   with the source, same schema. **Frozen**: not edited after the packets were
   generated from it. Corrections go to `candidate-v2.json`.
3. `candidate-v1-readable.md` — the same text with `B02-Pnnn` IDs outside the
   prose.
4. `continuity.md` — glossary terms met in Book II, paragraph-level decisions,
   apparatus dropped, unresolved source issues.
5. `provenance.json` — branch, hashes, source, generation setting.
6. `review-packets/packet-01.md … packet-06.md` — five packets of three
   paragraphs and one of two (17 = 5×3 + 2), each with one paragraph of
   context before and after marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check.

## Mechanical checks

```bash
cd books/staged-replacements/meditations
python3 - <<'PY'
import json, hashlib
src=json.load(open('book2/source-book2.json')); cand=json.load(open('book2/candidate-v1.json'))
st=json.load(open('meditations-original-en.staged.json'))
ch=next(c for c in st['chapters'] if c['number']==2)
assert src['paragraphs']==ch['paragraphs'] and len(cand['paragraphs'])==17
man=json.load(open('book2/manifest.json'))
ids=[i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids==[f'B02-P{i:03d}' for i in range(1,18)]
md=open('book2/candidate-v1-readable.md').read(); assert all(p in md for p in cand['paragraphs'])
for e in man['packets']:
    t=open('book2/'+e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k=int(pid[-3:])-1; assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t
print('OK'); print(hashlib.sha256(open('book2/candidate-v1.json','rb').read()).hexdigest())
PY
```

## Next action

Coordinator: hand `review-instructions.md` and `review-packets/` to a fresh
independent-review session. Findings come back under `book2/review/`. This
agent then applies supported corrections to `candidate-v2.json`, verifies the
changed passages, reads the whole book for flow, and records acceptance in
`ACCEPTANCE.md` before starting Book I.

---

**Superseded by the cross-book v3 pass (2026-09-12).** Book II's accepted `candidate-v2.json` is unchanged on disk and keeps its hash; the current text of this book is **`candidate-v3.json`, sha256 `3006dfb3…`**, produced by `../scripts/build_v3_crossbook.py` as part of one change set across the whole work, ordered by class and not by book. `changes-v2-to-v3.md` lists this book's share of it with the class and the reason for each. The pass, its order, all eleven classes and the two it deliberately did not normalise are recorded in `../README.md`; the assembled edition built from the twelve v3 files is `../meditations-modern-en.staged.json`.
