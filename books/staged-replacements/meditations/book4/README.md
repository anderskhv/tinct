# Meditations, Book IV — package (draft frozen, awaiting independent review)

Steps 1–3 of `../WORKFLOW.md` are done for Book IV; step 4 (independent
review) is the coordinator's reviewer session, not this agent.

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
   folded or dropped, unresolved source issues.
5. `provenance.json` — branch, hashes, source, generation setting.
6. `review-packets/packet-01.md … packet-17.md` — seventeen packets of three
   paragraphs (51 = 17×3), each with one paragraph of context before and
   after marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check.

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
for k,s in [(17,'as Agathon says'),(18,'What is praise, except indeed so far as it has a certain utility?'),(18,'clinging to something else....'),
            (29,'I do not get the means of living out of my learning'),(33,'into whatever things she pleases'),
            (45,'we ought not to act and speak as if we were asleep, for even in sleep we seem to act and speak'),
            (45,'like children who learn from their parents, simply to act and speak as we have been taught'),
            (49,'Do not then consider life a thing of any value.'),
            (50,'For such a purpose frees a man from trouble, and warfare, and all artifice and ostentatious display.')]:
    assert s in src['paragraphs'][k] and s in cand['paragraphs'][k]
print('OK'); print(hashlib.sha256(open('book4/candidate-v1.json','rb').read()).hexdigest())
print(hashlib.sha256(open('meditations-original-en.staged.json','rb').read()).hexdigest())
PY
```

Expected: `d85924d1…` (candidate v1, frozen) and `b0ecf3da…` (staged original).

## Next action

Coordinator: hand `review-instructions.md` and `review-packets/` to a fresh
independent-review session. Findings come back under `book4/review/`. This
agent then applies supported corrections to `candidate-v2.json`, verifies the
changed passages, reads the whole book for flow, and records acceptance in
`ACCEPTANCE.md` before starting Book V.
