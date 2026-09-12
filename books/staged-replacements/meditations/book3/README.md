# Meditations, Book III — package (accepted as candidate v2)

All eight steps of `../WORKFLOW.md` are done for Book III. The accepted text is
`candidate-v2.json` (sha256 `b7038469…`), see `ACCEPTANCE.md`. Step 4
(independent review) was the coordinator's reviewer session, not this agent;
its findings are under `review/`.

## Files

1. `source-book3.json` — Book 3 (III.1–III.16) extracted from
   `../meditations-original-en.staged.json` by `chapter.number == 3`,
   16 paragraphs, byte-identical to the staged original (Long 1862).
2. `candidate-v1.json` — the modern-English candidate, 16 paragraphs one-to-one
   with the source, same schema. **Frozen**: not edited after the packets were
   generated from it. Corrections go to `candidate-v2.json`.
3. `candidate-v1-readable.md` — the same text with `B03-Pnnn` IDs outside the
   prose.
4. `continuity.md` — glossary terms met in Book III, paragraph-level decisions,
   apparatus folded, unresolved source issues.
5. `provenance.json` — branch, hashes, source, generation setting.
6. `review-packets/packet-01.md … packet-06.md` — five packets of three
   paragraphs and one of one (16 = 5×3 + 1), each with one paragraph of
   context before and after marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check, plus the
   v1 and v2 hashes.
9. `review/findings-v1.md` — the independent review of v1 (0 substantive, 12
   minor; Accept after corrections).
10. `candidate-v2.json`, `candidate-v2-readable.md`, `changes-v1-to-v2.md` —
    the corrected candidate, built by `../scripts/build_book3_v2.py` from the
    frozen v1; every change listed with the finding it answers.
11. `ACCEPTANCE.md` — accepted hash, findings applied / declined, flow read.

## Mechanical checks

```bash
cd books/staged-replacements/meditations
python3 - <<'PY'
import json, hashlib
src=json.load(open('book3/source-book3.json')); cand=json.load(open('book3/candidate-v1.json'))
st=json.load(open('meditations-original-en.staged.json'))
ch=next(c for c in st['chapters'] if c['number']==3)
assert src['paragraphs']==ch['paragraphs'] and len(cand['paragraphs'])==16
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(cand['paragraphs']))
man=json.load(open('book3/manifest.json'))
ids=[i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids==[f'B03-P{i:03d}' for i in range(1,17)]
md=open('book3/candidate-v1-readable.md').read(); assert all(p in md for p in cand['paragraphs'])
for e in man['packets']:
    t=open('book3/'+e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k=int(pid[-3:])-1; assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t
v2=json.load(open('book3/candidate-v2.json')); assert len(v2['paragraphs'])==16
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(v2['paragraphs']))
md2=open('book3/candidate-v2-readable.md').read(); assert all(p in md2 for p in v2['paragraphs'])
for k,s in [(2,'which is as much inferior as that which serves it is superior'),(3,'For the lot which is assigned to each man is carried along with him and carries him along with it.'),(10,'apportionment and spinning of the thread of destiny')]:
    assert s in src['paragraphs'][k] and s in cand['paragraphs'][k] and s in v2['paragraphs'][k]
print('OK'); print(hashlib.sha256(open('book3/candidate-v1.json','rb').read()).hexdigest())
print(hashlib.sha256(open('book3/candidate-v2.json','rb').read()).hexdigest())
PY
```

Expected: `7079d32b…` (v1, frozen) and `b7038469…` (v2, accepted).

## Next action

None for Book III. The thread continues with Book IV (`../book4/`).

---

**Superseded by the cross-book v3 pass (2026-09-12).** Book III's accepted `candidate-v2.json` is unchanged on disk and keeps its hash; the current text of this book is **`candidate-v3.json`, sha256 `548ae577…`**, produced by `../scripts/build_v3_crossbook.py` as part of one change set across the whole work, ordered by class and not by book. `changes-v2-to-v3.md` lists this book's share of it with the class and the reason for each. The pass, its order, all eleven classes and the two it deliberately did not normalise are recorded in `../README.md`; the assembled edition built from the twelve v3 files is `../meditations-modern-en.staged.json`.
