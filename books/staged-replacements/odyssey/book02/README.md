# The Odyssey, Book 2 — package (frozen at candidate v1)

Steps 1–3 of `../WORKFLOW.md` are done for Book 2, and the step-4 artefacts
(packets, manifest, review instructions) are built. **Step 4 itself — the
independent review — has not run**: `candidate-v1.json` is frozen and the
packets are pushed. This task's brief scoped drafting to Book 2 and forbade
starting Book 3.

**Step 1 was re-done from scratch for this Book, not inherited from Book 1.**
`../scripts/verify_source_book2.py` reconstructs Book 2 from the raw Project
Gutenberg #1727 text by a rule devised here and audited against the raw lines
before it was trusted, then diffs against the staged original: **35 of 35
paragraphs byte-identical, zero diffs, 4,184 words compared word-for-word.**
Method, audit, the two things the audit caught, and two negative controls are
in `continuity.md` and `provenance.json`.

**Name forms are the Greek ones** (`../GLOSSARY.md`). Book 2 is the first Book
drafted under that decision from the start rather than remapped afterwards.

## Files

1. `source-book2.json` — Book 2 extracted from
   `app/public/data/editions/odyssey-original-en.json` by `chapter.number
   == 2`, 35 paragraphs, byte-identical to the served original, and keeping
   Butler's own chapter title.
2. `candidate-v1.json` — the modern-English candidate, 35 paragraphs
   one-to-one with the source, same schema (`number`, `title`, `paragraphs`),
   with the chapter title mapped to the Greek form. **Frozen**: not edited
   after the packets were generated from it. Corrections from review go to
   `candidate-v2.json`.
3. `candidate-v1-readable.md` — the same text with `B02-Pnnn` IDs outside the
   prose.
4. `continuity.md` — the source-verification rule and audit, names met in
   Book 2, the recurring formulas fixed here (including four carried over
   from accepted Book 1), the per-paragraph decisions, the word-ratio note,
   and the base-text defects.
5. `provenance.json` — branch, hashes, the verification record, word counts,
   naming and punctuation, base-text defects, generation setting.
6. `review-packets/packet-01.md … packet-12.md` — twelve packets (11×3 +
   1×2 = 35), each with one paragraph of context before and after marked
   `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check, plus
   the v1 hash.

## Mechanical checks

```bash
cd books/staged-replacements/odyssey
python3 - <<'PY'
import json, hashlib, re
src  = json.load(open('book02/source-book2.json'))
cand = json.load(open('book02/candidate-v1.json'))
orig = json.load(open('../../../app/public/data/editions/odyssey-original-en.json'))
ch   = next(c for c in orig['chapters'] if c['number'] == 2)

# --- source integrity and alignment -----------------------------------------
assert src['paragraphs'] == ch['paragraphs'], 'source extraction not byte-identical'
assert src['title'] == ch['title'], 'source title not byte-identical'
assert len(cand['paragraphs']) == len(src['paragraphs']) == 35, 'paragraph count mismatch'
assert cand['title'] == ch['title'].replace('Minerva', 'Athena'), 'candidate title not mapped'

# --- packets cover every paragraph exactly once, verbatim -------------------
man = json.load(open('book02/manifest.json'))
ids = [i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids == [f'B02-P{i:03d}' for i in range(1, 36)], 'manifest coverage failed'
for e in man['packets']:
    t = open('book02/' + e['packet'], encoding='utf-8').read()
    for pid in e['assigned_paragraph_ids']:
        k = int(pid[-3:]) - 1
        assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t, f'{pid} not verbatim'

md = open('book02/candidate-v1-readable.md', encoding='utf-8').read()
assert all(p in md for p in cand['paragraphs']), 'readable md does not match the JSON'

ps = cand['paragraphs']
joined = '\n'.join(ps)
def n(w): return len(re.findall(r'\b' + w + r'\b', joined))

# --- names: every count matches the source, and every hazard holds ----------
s = '\n'.join(src['paragraphs'])
def sn(w): return len(re.findall(r'\b' + w + r'\b', s))
assert (n('Odysseus'), n('Athena'), n('Zeus'), n('Eurycleia')) == (17, 8, 6, 2)
assert (sn('Ulysses'), sn('Minerva'), sn('Jove'), sn('Euryclea')) == (17, 8, 6, 2)
for roman in ('Ulysses','Minerva','Jove','Neptune','Mercury','Saturn','Diana','Euryclea'):
    assert n(roman) == 0, f'Roman form survives: {roman}'
assert n('Ops') == 1 and 'daughter of Ops, son of Pisenor' in joined   # hazard 1
assert n('Rhea') == 0 and n('Helios') == 0
assert n('Ilius') == 1 and n('Troy') == 1      # Butler's own two forms, both kept
assert n('Mycene') == 1                        # the woman, not the city

# --- punctuation and spelling standards -------------------------------------
assert "'" not in joined and '"' not in joined, 'ASCII quote survives'
assert sum(p.count('“') for p in ps) == sum(p.count('“') for p in src['paragraphs']) == 29
assert sum(p.count('”') for p in ps) == sum(p.count('”') for p in src['paragraphs']) == 28
unbal = [i for i, p in enumerate(ps) if p.count('“') != p.count('”')]
assert unbal == [5], 'D4: the only unbalanced paragraph must be B02-P006'
assert src['paragraphs'][5].count('“') != src['paragraphs'][5].count('”')
assert ps[6].lstrip().startswith('“'), 'D4: B02-P007 must open with its own mark'
assert ps[5].rstrip().endswith('’'), "Butler closes Penelope's inner quotation"
for brit in ('grey', 'honour', 'harbour', 'marvelled', 'woollen', 'travelled'):
    assert n(brit) == 0, f'British spelling survives: {brit}'
assert 'gray-eyed daughter of Zeus' in ps[33]

# --- base-text decision and the one gloss -----------------------------------
assert '[' not in joined and ']' not in joined, "Butler's bracket mark must be dropped"
assert 'do not hold back, my friends' in ps[3], "…and its words kept"
assert 'the Erinyes—the spirits of vengeance—to avenge her' in ps[7]

# --- formulas shared with accepted Book 1 -----------------------------------
b1 = json.load(open('book01/candidate-v2.json'))['paragraphs']
for frag in ('feeding off one man',
             'will settle the account with you in full',
             'there will be no one to avenge you',
             'a crew of twenty men',
             'raise a mound to his memory',
             'all the marriage gifts a beloved daughter deserves',
             'in low spirits',
             'outer court'):
    assert any(frag in p for p in b1), f'not in Book 1: {frag}'
    assert any(frag in p for p in ps), f'not in Book 2: {frag}'

# --- no archaism survived ----------------------------------------------------
low = joined.lower()
for dead in ('thereon','ere long','whereon','spunging','victuals','naughtiness',
             'prating','hither and thither','abode','save only','bade','moodily',
             'endowed','tambour','singlehanded','unblended','comeliness','steeds',
             'amongst','bethought','fuddle'):
    assert dead not in low, f'archaism survives: {dead}'
assert not any(ps[i] == src['paragraphs'][i].replace('\n', ' ') for i in range(35))

# --- alignment, newlines, ratio ---------------------------------------------
assert not any('\n' in p for p in ps), 'candidate paragraph contains a newline'
sw = sum(len(p.split()) for p in src['paragraphs'])
cw = sum(len(p.split()) for p in ps)
ratio = cw / sw
assert 0.90 <= ratio <= 1.10, f'word ratio {ratio:.4f} outside 0.90-1.10'

print('OK — 35 paragraphs, coverage exact, packets verbatim, names and hazards held, ratio', f'{ratio:.4f}')
for f in ('book02/source-book2.json','book02/candidate-v1.json',
          '../../../app/public/data/editions/odyssey-original-en.json'):
    print(hashlib.sha256(open(f,'rb').read()).hexdigest(), f)
PY
```

Expected:

```
OK — 35 paragraphs, coverage exact, packets verbatim, names and hazards held, ratio 0.9993
3cc4f38c171e0e1d72ad741e75c745b31c7f330dfb3ed79910832ae4d04714c7  book02/source-book2.json
2b5a0280719312bbabb214f0bcbf400cde62541ab7e9c892ce2c2b65bb4273ea  book02/candidate-v1.json
da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07  ../../../app/public/data/editions/odyssey-original-en.json
```

And the independent source check, which prints its whole audit:

```bash
cd books/staged-replacements/odyssey
python3 scripts/verify_source_book2.py
# ends: OK — all 35 paragraphs byte-identical, zero diffs; 4184 words compared word-for-word
```

To reproduce the package deterministically:

```bash
cd books/staged-replacements/odyssey
python3 scripts/build_book_package.py 2
```

(The build refuses to rebuild Book 1 without `--force`: its `candidate-v1.json`
is frozen at `8316ff76…` and is the record of what its review round reviewed.)

## Next action

Independent review of `candidate-v1.json` (step 4), by a separate reviewer
session, following `review-instructions.md`. Findings go under
`book02/review/`. On findings: `candidate-v2.json` via a change script in the
established pattern, verification, flow read, `ACCEPTANCE.md` — steps 5–8.
