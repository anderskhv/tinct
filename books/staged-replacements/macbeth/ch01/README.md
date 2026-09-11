# Macbeth, Act 1 Scene 1 — package (frozen v1, awaiting review)

Steps 1–3 of `../WORKFLOW.md` are done for this scene. `candidate-v1.json`
(sha256 `21304f136f17739972fdb7a1f898927a0b06dfc597e0c731a7c3255bf0d394a5`)
is frozen. Step 4 (independent review) is next: a separate reviewer session,
not this drafting task.

Step 1 confirmed the source: this scene's content matches PG #1533/#100
word-for-word except the served scene title ("A Desert Place" vs. PG's "An
open Place") — see `../PROVENANCE.md` §3. 12 paragraphs, 2 stage directions
and 10 speeches across three Witches.

## Files

1. `source-ch01.json` — Act 1 Scene 1, extracted verbatim from
   `app/public/data/editions/macbeth-original-en.json` (`chapters[0]`), 12
   paragraphs, byte-identical to the served chapter.
2. `candidate-v1.json` — the modern-English candidate, 12 paragraphs
   one-to-one with the source, same schema (`number`, `title`, `section`,
   `paragraphs`). **Frozen**: not edited after the packets were generated
   from it. Corrections go to `candidate-v2.json`.
3. `continuity.md` — glossary terms met in this scene, paragraph-level
   decisions, and the one known source anomaly (scene title).
4. `provenance.json` — branch, hashes, source identification pointer, word
   counts.
5. `review-packets/packet-01.md … packet-04.md` — four packets of three
   paragraphs (12 = 4×3), each with one paragraph of context before and
   after marked `CONTEXT ONLY`. No self-review verdicts.
6. `review-instructions.md` — the independent-review instructions,
   verbatim.
7. `manifest.json` — packet → paragraph-ID map with a coverage check, plus
   the v1 hash.

## Mechanical checks

```bash
cd books/staged-replacements/macbeth
python3 - <<'PY'
import json, hashlib
src = json.load(open('ch01/source-ch01.json'))
cand = json.load(open('ch01/candidate-v1.json'))
served = json.load(open('../../../app/public/data/editions/macbeth-original-en.json'))
assert src == served['chapters'][0]
assert len(cand['paragraphs']) == 12 == len(src['paragraphs'])
# speaker labels / stage directions identical where source has them
def label(p):
    if p.startswith('['):
        return p
    return p.split('.', 1)[0]
for s, c in zip(src['paragraphs'], cand['paragraphs']):
    assert label(s) == label(c), (s, c)
assert src['paragraphs'][0] == cand['paragraphs'][0] == '[Thunder and Lightning. Enter three Witches.]'
assert src['paragraphs'][-1] == cand['paragraphs'][-1] == '[Exeunt.]'
man = json.load(open('ch01/manifest.json'))
ids = [i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids == [f'B01-P{i:03d}' for i in range(1, 13)]
for e in man['packets']:
    t = open('ch01/' + e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k = int(pid[-3:]) - 1
        assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t
sw = sum(len(p.split()) for p in src['paragraphs'])
cw = sum(len(p.split()) for p in cand['paragraphs'])
print('OK, word ratio', round(cw/sw, 3))
print(hashlib.sha256(open('ch01/candidate-v1.json','rb').read()).hexdigest())
PY
```

Expected: `21304f136f17739972fdb7a1f898927a0b06dfc597e0c731a7c3255bf0d394a5`
(v1, frozen).

## Next action

Waiting on the coordinator: independent review of this scene
(`review-instructions.md`, `review-packets/`, 4 packets). See
`../00-progress-ledger.md`.
