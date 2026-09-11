# Macbeth, Act 1 Scene 2 — package (frozen v1, awaiting review)

Steps 1–3 of `../WORKFLOW.md` are done for this scene. `candidate-v1.json`
(sha256 `17ba47fc5c12df039d9c57e46a893de92b20f58f82a8abc3272055086380a0c8`)
is frozen. Step 4 (independent review) is next: a separate reviewer session,
not this drafting task.

Step 1 confirmed the source: this scene's content matches PG #1533/#100
word-for-word except one missing unattributed line ("Who comes here?") —
see `../PROVENANCE.md` §3. 22 paragraphs: 4 stage directions and 18 speeches
by Duncan, Malcolm, the Soldier, Lennox, and Ross.

## Files

1. `source-ch02.json` — Act 1 Scene 2, extracted verbatim from
   `app/public/data/editions/macbeth-original-en.json` (`chapters[1]`), 22
   paragraphs, byte-identical to the served chapter.
2. `candidate-v1.json` — the modern-English candidate, 22 paragraphs
   one-to-one with the source, same schema (`number`, `title`, `section`,
   `paragraphs`). **Frozen**: not edited after the packets were generated
   from it. Corrections go to `candidate-v2.json`.
3. `continuity.md` — glossary terms met in this scene, paragraph-level
   decisions, and the one known source anomaly (the missing line).
4. `provenance.json` — branch, hashes, source identification pointer, word
   counts.
5. `review-packets/packet-01.md … packet-08.md` — seven packets of three
   paragraphs plus one packet of the final paragraph (22 = 7×3 + 1), each
   with one paragraph of context before (and after, where one exists)
   marked `CONTEXT ONLY`. No self-review verdicts.
6. `review-instructions.md` — the independent-review instructions,
   verbatim.
7. `manifest.json` — packet → paragraph-ID map with a coverage check, plus
   the v1 hash.

## Mechanical checks

```bash
cd books/staged-replacements/macbeth
python3 - <<'PY'
import json, hashlib
src = json.load(open('ch02/source-ch02.json'))
cand = json.load(open('ch02/candidate-v1.json'))
served = json.load(open('../../../app/public/data/editions/macbeth-original-en.json'))
assert src == served['chapters'][1]
assert len(cand['paragraphs']) == 22 == len(src['paragraphs'])
def label(p):
    if p.startswith('['):
        return p
    return p.split('.', 1)[0]
for s, c in zip(src['paragraphs'], cand['paragraphs']):
    assert label(s) == label(c), (s, c)
assert src['paragraphs'][0] == cand['paragraphs'][0]
assert src['paragraphs'][9] == cand['paragraphs'][9] == '[Exit Captain, attended.]'
assert src['paragraphs'][10] == cand['paragraphs'][10] == '[Enter Ross and Angus.]'
assert src['paragraphs'][-1] == cand['paragraphs'][-1] == '[Exeunt.]'
man = json.load(open('ch02/manifest.json'))
ids = [i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids == [f'B02-P{i:03d}' for i in range(1, 23)]
for e in man['packets']:
    t = open('ch02/' + e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k = int(pid[-3:]) - 1
        assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t
sw = sum(len(p.split()) for p in src['paragraphs'])
cw = sum(len(p.split()) for p in cand['paragraphs'])
print('OK, word ratio', round(cw/sw, 3))
print(hashlib.sha256(open('ch02/candidate-v1.json','rb').read()).hexdigest())
PY
```

Expected: `17ba47fc5c12df039d9c57e46a893de92b20f58f82a8abc3272055086380a0c8`
(v1, frozen).

## Next action

Waiting on the coordinator: independent review of this scene
(`review-instructions.md`, `review-packets/`, 8 packets). See
`../00-progress-ledger.md`.
