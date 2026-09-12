# Meditations, Book I — package (accepted as candidate v2)

All eight steps of `../WORKFLOW.md` are done for Book I. The accepted text is
`candidate-v2.json` (sha256 `07c7f4b6…`), see `ACCEPTANCE.md`. Step 4
(independent review) was the coordinator's reviewer session, not this agent;
its findings are under `review/`.

## Files

1. `source-book1.json` — Book 1 (I.1–I.17) extracted from
   `../meditations-original-en.staged.json` by `chapter.number == 1`,
   17 paragraphs, byte-identical to the staged original (Long 1862).
2. `candidate-v1.json` — the modern-English candidate, 17 paragraphs one-to-one
   with the source, same schema. **Frozen**: not edited after the packets were
   generated from it. Corrections go to `candidate-v2.json`.
3. `candidate-v1-readable.md` — the same text with `B01-Pnnn` IDs outside the
   prose.
4. `continuity.md` — glossary terms met in Book I, paragraph-level decisions,
   apparatus dropped, unresolved source issues.
5. `provenance.json` — branch, hashes, source, generation setting.
6. `review-packets/packet-01.md … packet-06.md` — five packets of three
   paragraphs and one of two (17 = 5×3 + 2), each with one paragraph of
   context before and after marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check, plus the
   v1 and v2 hashes.
9. `review/findings-v1.md` — the independent review of v1 (0 substantive, 19
   minor; Accept after corrections).
10. `candidate-v2.json`, `candidate-v2-readable.md`, `changes-v1-to-v2.md` —
    the corrected candidate, built by `../scripts/build_book1_v2.py` from the
    frozen v1; every change listed with the finding it answers.
11. `ACCEPTANCE.md` — accepted hash, findings applied / declined, flow read.

## Mechanical checks

```bash
cd books/staged-replacements/meditations
python3 - <<'PY'
import json, hashlib
src=json.load(open('book1/source-book1.json')); cand=json.load(open('book1/candidate-v1.json'))
st=json.load(open('meditations-original-en.staged.json'))
ch=next(c for c in st['chapters'] if c['number']==1)
assert src['paragraphs']==ch['paragraphs'] and len(cand['paragraphs'])==17
man=json.load(open('book1/manifest.json'))
ids=[i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids==[f'B01-P{i:03d}' for i in range(1,18)]
md=open('book1/candidate-v1-readable.md').read(); assert all(p in md for p in cand['paragraphs'])
for e in man['packets']:
    t=open('book1/'+e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k=int(pid[-3:])-1; assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t
v2=json.load(open('book1/candidate-v2.json')); assert len(v2['paragraphs'])==17
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(v2['paragraphs']))
md2=open('book1/candidate-v2-readable.md').read(); assert all(p in md2 for p in v2['paragraphs'])
for k,s in [(8,'form opinions without consideration'),(13,'consistency and undeviating steadiness'),(14,'humorous in an agreeable way.')]:
    assert s in src['paragraphs'][k] and s in v2['paragraphs'][k]
print('OK'); print(hashlib.sha256(open('book1/candidate-v1.json','rb').read()).hexdigest())
print(hashlib.sha256(open('book1/candidate-v2.json','rb').read()).hexdigest())
PY
```

Expected: `e1d816d3…` (v1, frozen) and `07c7f4b6…` (v2, accepted).

## Next action

None for Book I. The thread continues with Book III (`../book3/`).

---

**Superseded by the cross-book v3 pass (2026-09-12).** Book I's accepted `candidate-v2.json` is unchanged on disk and keeps its hash; the current text of this book is **`candidate-v3.json`, sha256 `c499b8dc…`**, produced by `../scripts/build_v3_crossbook.py` as part of one change set across the whole work, ordered by class and not by book. `changes-v2-to-v3.md` lists this book's share of it with the class and the reason for each. The pass, its order, all eleven classes and the two it deliberately did not normalise are recorded in `../README.md`; the assembled edition built from the twelve v3 files is `../meditations-modern-en.staged.json`.
