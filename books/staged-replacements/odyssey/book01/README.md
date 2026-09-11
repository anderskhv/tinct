# The Odyssey, Book 1 — package (frozen at candidate v1)

Steps 1–3 of `../WORKFLOW.md` are done for Book 1. Step 4 (independent
review) has not run yet: `candidate-v1.json` is frozen and packets are
pushed. This task's brief scoped drafting to Book 1 only.

Step 1 confirmed the source directly against Project Gutenberg #1727
(Samuel Butler, 1900): 32 paragraphs, byte-identical opening, no boilerplate
(`../PROVENANCE.md`).

## Files

1. `source-book1.json` — Book 1 extracted from
   `app/public/data/editions/odyssey-original-en.json` by `chapter.number
   == 1`, 32 paragraphs, byte-identical to the served original.
2. `candidate-v1.json` — the modern-English candidate, 32 paragraphs
   one-to-one with the source, same schema (`number`, `title`,
   `paragraphs`). **Frozen**: not edited after the packets were generated
   from it. Corrections (if any come back from review) go to
   `candidate-v2.json`.
3. `candidate-v1-readable.md` — the same text with `B01-Pnnn` IDs outside
   the prose.
4. `continuity.md` — names met in Book 1 (all Butler's own forms, per
   `../GLOSSARY.md`), paragraph-level decisions, the preserved
   unclosed-quotation convention at source paragraphs 17–18, and unresolved
   source issues.
5. `provenance.json` — branch, hashes, source, generation setting.
6. `review-packets/packet-01.md … packet-11.md` — eleven packets (10×3 +
   1×2 = 32), each with one paragraph of context before and after marked
   `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions,
   verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check, plus
   the v1 hash.

## Mechanical checks

```bash
cd books/staged-replacements/odyssey
python3 - <<'PY'
import json, hashlib
src = json.load(open('book01/source-book1.json'))
cand = json.load(open('book01/candidate-v1.json'))
orig = json.load(open('../../../app/public/data/editions/odyssey-original-en.json'))
ch = next(c for c in orig['chapters'] if c['number'] == 1)

assert src['paragraphs'] == ch['paragraphs'], 'source extraction not byte-identical'
assert len(cand['paragraphs']) == len(src['paragraphs']) == 32, 'paragraph count mismatch'

man = json.load(open('book01/manifest.json'))
ids = [i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids == [f'B01-P{i:03d}' for i in range(1, 33)], 'manifest coverage failed'

md = open('book01/candidate-v1-readable.md', encoding='utf-8').read()
assert all(p in md for p in cand['paragraphs']), 'readable md does not match candidate-v1.json'

for e in man['packets']:
    t = open('book01/' + e['packet'], encoding='utf-8').read()
    for pid in e['assigned_paragraph_ids']:
        k = int(pid[-3:]) - 1
        assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t, f'{pid} not reproduced verbatim in its packet'

src_words = sum(len(p.split()) for p in src['paragraphs'])
cand_words = sum(len(p.split()) for p in cand['paragraphs'])
ratio = cand_words / src_words
assert ratio >= 0.90, f'overall word ratio {ratio:.3f} below 0.90'

# Butler's own unclosed quotation at the source-paragraph-18/19 break
# (B01-P018 / B01-P019) is preserved
assert not src['paragraphs'][17].rstrip().endswith('”') and not cand['paragraphs'][17].rstrip().endswith('”')
assert src['paragraphs'][18].lstrip().startswith('“') and cand['paragraphs'][18].lstrip().startswith('“')

print('OK — 32 paragraphs, manifest coverage exact, packets verbatim, ratio', f'{ratio:.3f}')
print('source-book1.json sha256  ', hashlib.sha256(open('book01/source-book1.json','rb').read()).hexdigest())
print('candidate-v1.json sha256  ', hashlib.sha256(open('book01/candidate-v1.json','rb').read()).hexdigest())
print('odyssey-original-en.json sha256', hashlib.sha256(open('../../../app/public/data/editions/odyssey-original-en.json','rb').read()).hexdigest())
PY
```

Expected: `fd364c78…` (source-book1.json), `8316ff76…` (candidate-v1.json,
frozen), `da03f6ac…` (served odyssey-original-en.json, unchanged).

## Next action

Independent review of `candidate-v1.json` (step 4), by a separate reviewer
session, following `review-instructions.md`. Findings go under
`book01/review/`. On findings: `candidate-v2.json`, verification, flow read,
`ACCEPTANCE.md` — steps 5–8.
