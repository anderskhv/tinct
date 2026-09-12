# Meditations, Book IV — package (accepted as candidate v2)

All eight steps of `../WORKFLOW.md` are done for Book IV. The accepted text is
`candidate-v2.json` (sha256 `20d2b4df…`), see `ACCEPTANCE.md`. Step 4
(independent review) was the coordinator's reviewer session, not this agent;
its findings are under `review/`.

Step 1 also found and fixed a defect in the staged original: three Project
Gutenberg illustration captions (IV.20, V.8, IX.21) had survived the build.
The build script now strips them and the staged file was rebuilt (sha256
`7bf2d1b1…` → `b0ecf3da…`); chapters 1–3 are byte-identical before and after.
See `continuity.md` (Source) and `../PROVENANCE.md` §4.

## Files

1. `source-book4.json` — Book 4 (IV.1–IV.51) extracted from
   `../meditations-original-en.staged.json` by `chapter.number == 4`,
   51 paragraphs, byte-identical to the (rebuilt) staged original (Long 1862).
2. `candidate-v1.json` — the modern-English candidate, 51 paragraphs one-to-one
   with the source, same schema. **Frozen**: not edited after the packets were
   generated from it. Corrections go to `candidate-v2.json`.
3. `candidate-v1-readable.md` — the same text with `B04-Pnnn` IDs outside the
   prose.
4. `continuity.md` — glossary terms met in Book IV (five new rows added to
   `../GLOSSARY.md` before drafting), paragraph-level decisions, apparatus
   folded or dropped, unresolved source issues; updated at acceptance where a
   finding reversed or recorded a decision.
5. `provenance.json` — branch, hashes, source, generation setting, review
   round, v2 hash.
6. `review-packets/packet-01.md … packet-17.md` — seventeen packets of three
   paragraphs (51 = 17×3), each with one paragraph of context before and
   after marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check, plus the
   v1 and v2 hashes.
9. `review/findings-v1.md` — the independent review of v1 (0 substantive, 8
   minor; Accept after corrections).
10. `candidate-v2.json`, `candidate-v2-readable.md`, `changes-v1-to-v2.md` —
    the corrected candidate, built by `../scripts/build_book4_v2.py` from the
    frozen v1; every change listed with the finding it answers.
11. `ACCEPTANCE.md` — accepted hash, findings applied / declined, flow read.

## Mechanical checks

```bash
cd books/staged-replacements/meditations
python3 - <<'PY'
import json, hashlib
src=json.load(open('book4/source-book4.json')); cand=json.load(open('book4/candidate-v1.json'))
st=json.load(open('meditations-original-en.staged.json'))
ch=next(c for c in st['chapters'] if c['number']==4)
assert src['paragraphs']==ch['paragraphs'] and len(cand['paragraphs'])==51
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(cand['paragraphs']))
assert not any('[Illustration' in p for c in st['chapters'] for p in c['paragraphs'])
man=json.load(open('book4/manifest.json'))
ids=[i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids==[f'B04-P{i:03d}' for i in range(1,52)]
md=open('book4/candidate-v1-readable.md').read(); assert all(p in md for p in cand['paragraphs'])
for e in man['packets']:
    t=open('book4/'+e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k=int(pid[-3:])-1; assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t
v2=json.load(open('book4/candidate-v2.json')); assert len(v2['paragraphs'])==51
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(v2['paragraphs']))
md2=open('book4/candidate-v2-readable.md').read(); assert all(p in md2 for p in v2['paragraphs'])
for k,s in [(17,'as Agathon says'),(18,'What is praise, except indeed so far as it has a certain utility?'),(18,'clinging to something else....'),
            (29,'I do not get the means of living out of my learning'),(33,'into whatever things she pleases'),
            (45,'we ought not to act and speak as if we were asleep, for even in sleep we seem to act and speak'),
            (45,'like children who learn from their parents, simply to act and speak as we have been taught'),
            (49,'Do not then consider life a thing of any value.'),
            (50,'For such a purpose frees a man from trouble, and warfare, and all artifice and ostentatious display.')]:
    assert s in src['paragraphs'][k] and s in cand['paragraphs'][k] and s in v2['paragraphs'][k]
print('OK'); print(hashlib.sha256(open('book4/candidate-v1.json','rb').read()).hexdigest())
print(hashlib.sha256(open('book4/candidate-v2.json','rb').read()).hexdigest())
print(hashlib.sha256(open('meditations-original-en.staged.json','rb').read()).hexdigest())
PY
```

Expected: `d85924d1…` (v1, frozen), `20d2b4df…` (v2, accepted) and `b0ecf3da…`
(staged original).

## Next action

None for Book IV. The thread continues with Book V (`../book5/`).

---

**Superseded by the cross-book v3 pass (2026-09-12).** Book IV's accepted `candidate-v2.json` is unchanged on disk and keeps its hash; the current text of this book is **`candidate-v3.json`, sha256 `e75f9a5c…`**, produced by `../scripts/build_v3_crossbook.py` as part of one change set across the whole work, ordered by class and not by book. `changes-v2-to-v3.md` lists this book's share of it with the class and the reason for each. The pass, its order, all eleven classes and the two it deliberately did not normalise are recorded in `../README.md`; the assembled edition built from the twelve v3 files is `../meditations-modern-en.staged.json`.
