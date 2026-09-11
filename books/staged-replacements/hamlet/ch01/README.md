# Hamlet, Act 1 Scene 1 — package (candidate v1, frozen)

Steps 1–4 of `../WORKFLOW.md` are done for this scene. Step 4 (independent
review) is the coordinator's reviewer session, not this agent, and has not
yet run — this package stops at "push and stop" per the workflow.

Step 1 confirmed the source: chapter 1 of the served
`hamlet-original-en.json` (sha256 `77f9bf6e…`), 71 paragraphs, matches
Project Gutenberg ebook #1524 verbatim everywhere sampled. See
`../PROVENANCE.md`.

## Files

1. `source-ch01.json` — Act 1 Scene 1 (71 paragraphs) extracted from the
   served `hamlet-original-en.json` by `chapter.number == 1`, byte-identical
   to the served file.
2. `candidate-v1.json` — the modern-English candidate, 71 paragraphs
   one-to-one with the source, same schema (`{"number","title","section",
   "paragraphs"}`). **Frozen**: not edited after the packets were generated
   from it. Corrections will go to `candidate-v2.json`.
3. `candidate-v1-readable.md` — the same text with `C01-Pnnn` IDs outside
   the prose.
4. `continuity.md` — glossary terms met in this scene (both `../GLOSSARY.md`
   tables started here), paragraph-level decisions, stage-direction
   handling, two open judgment calls, and confirmation of no base-text
   defects.
5. `provenance.json` — branch, hashes, source, generation setting, word
   counts and ratio.
6. `review-packets/packet-01.md … packet-24.md` — twenty-four packets of
   three paragraphs each (23×3 + 1×2 = 71), each with one paragraph of
   context before and after marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions,
   verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check, plus
   the v1 hash.

## Mechanical checks

```bash
cd books/staged-replacements/hamlet
python3 - <<'PY'
import json, hashlib
src = json.load(open('ch01/source-ch01.json'))
cand = json.load(open('ch01/candidate-v1.json'))
served = json.load(open('../../../app/public/data/editions/hamlet-original-en.json'))
ch1 = next(c for c in served['chapters'] if c['number'] == 1)

assert src['paragraphs'] == ch1['paragraphs']
assert len(cand['paragraphs']) == 71 == len(src['paragraphs'])

# stage directions verbatim; speaker labels identical
for s, c in zip(src['paragraphs'], cand['paragraphs']):
    if s.startswith('['):
        assert s == c, (s, c)
    else:
        assert s.split('.', 1)[0] == c.split('.', 1)[0], (s, c)

# word ratio, no expansion
src_words = sum(len(p.split()) for p in src['paragraphs'])
cand_words = sum(len(p.split()) for p in cand['paragraphs'])
ratio = cand_words / src_words
assert ratio >= 0.90, ratio

man = json.load(open('ch01/manifest.json'))
ids = [i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids == [f'C01-P{i:03d}' for i in range(1, 72)]

md = open('ch01/candidate-v1-readable.md').read()
assert all(p in md for p in cand['paragraphs'])

for e in man['packets']:
    t = open('ch01/' + e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k = int(pid[-3:]) - 1
        assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t

print('OK — 71 paragraphs, ratio', round(ratio, 4))
print('source hash', hashlib.sha256(open('ch01/source-ch01.json','rb').read()).hexdigest())
print('candidate hash', hashlib.sha256(open('ch01/candidate-v1.json','rb').read()).hexdigest())
print('manifest hash', hashlib.sha256(open('ch01/manifest.json','rb').read()).hexdigest())
PY
```

Expected: `OK — 71 paragraphs, ratio 1.0036`, source hash `4cce71c4…`,
candidate hash `ea6280a7…`, manifest hash `465077f1…`.

## Next action

Independent review of `candidate-v1.json` per `review-instructions.md` and
the packets in `review-packets/`. This agent does not review its own draft.
