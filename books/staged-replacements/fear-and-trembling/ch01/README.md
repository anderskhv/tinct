# Fear and Trembling, Chapter 1 (Forord / Preface) — package (frozen candidate v1)

Steps 1–3 of `../WORKFLOW.md` are done for Chapter 1. The frozen candidate is
`candidate-v1.json` (sha256 `f19ac0c1…`). Step 4 (independent review) is the
coordinator's reviewer session, not this agent — this task does not review
its own draft.

Step 1 (book-level, done once in `../PROVENANCE.md`): the served
`original-en` is not a real historical translation — its own 2026-05-04
commit message says it is an AI paraphrase "in a Lowrie/Hannay-adjacent
register." Rights verdict: UNCERTAIN. The candidate is drafted from the
public-domain Danish original instead (`../PROVENANCE.md` §1–2). Danish and
served English are chapter- and paragraph-count identical throughout the
book (232/232, `../PROVENANCE.md` §3), so drafting from Danish carries no
split-view alignment consequence.

## Files

1. `source-ch01.json` — Chapter 1 ("Forord"), 5 paragraphs, extracted from
   `../../../../app/public/data/editions/fear-and-trembling-original-da.json`
   by `chapters[0]`, byte-identical to the served Danish.
2. `candidate-v1.json` — the modern-English candidate, 5 paragraphs one-to-one
   with the source, same schema (`number`, `title`, `paragraphs`). **Frozen**:
   not edited after the packets were generated from it. Corrections go to
   `candidate-v2.json`.
3. `candidate-v1-readable.md` — the same text with `C01-Pnnn` IDs outside the
   prose.
4. `continuity.md` — every paragraph-level decision (foreign-language
   insertions kept, proper-noun renderings, OCR corrections to the quoted
   Latin, deliberate departures from wording surfaced in the provenance
   search), the general voice/form rules this chapter establishes for the
   rest of the book, and unresolved source issues.
5. `provenance.json` — branch, hashes, source, generation setting.
6. `review-packets/packet-01.md` (C01-P001–P003), `packet-02.md`
   (C01-P004–P005) — with one paragraph of context before/after marked
   `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check, plus
   the v1 hash.

## Mechanical checks

```bash
cd books/staged-replacements/fear-and-trembling
python3 - <<'PY'
import json, hashlib
src = json.load(open('ch01/source-ch01.json'))
cand = json.load(open('ch01/candidate-v1.json'))
da = json.load(open('../../../app/public/data/editions/fear-and-trembling-original-da.json'))
ch = da['chapters'][0]
assert ch['title'] == 'Forord'
assert src['paragraphs'] == ch['paragraphs']
assert len(cand['paragraphs']) == 5
man = json.load(open('ch01/manifest.json'))
ids = [i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids == [f'C01-P{i:03d}' for i in range(1, 6)]
md = open('ch01/candidate-v1-readable.md').read()
assert all(p in md for p in cand['paragraphs'])
for e in man['packets']:
    t = open('ch01/' + e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k = int(pid[-3:]) - 1
        assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t
print('OK')
print(hashlib.sha256(open('ch01/source-ch01.json', 'rb').read()).hexdigest())
print(hashlib.sha256(open('ch01/candidate-v1.json', 'rb').read()).hexdigest())
PY
```

Expected: `b2cfeafa…` (source), `f19ac0c1…` (candidate v1, frozen).

## Next action

Waiting on the coordinator: independent review of Chapter 1. Chapters 2–8
(Exordium through Epilogue, 227 more paragraphs) are not started.
