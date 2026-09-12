# The Odyssey, Book 3 — package (frozen at candidate v1)

Steps 1–3 of `../WORKFLOW.md` are done for Book 3, and the step-4 artefacts
(packets, manifest, review instructions) are built. **Step 4 itself — the
independent review — has not run**: `candidate-v1.json` is frozen and the
packets are pushed. Book 3 was **not** self-reviewed and Book 4 was **not**
started.

**Step 1 was re-done from scratch for this Book, on the Book 2 *reviewer's*
kind of rule rather than the Book 2 drafter's — and it found a defect in the
served original.** `../scripts/verify_source_book3.py` decides nothing in
advance and strips nothing up front: it anchors structurally on `BOOK III` /
`BOOK IV` and **never on `FOOTNOTES:`** (which occurs twice in PG #1727 — line
75, indented, in the table of contents, and line 10843, the real section —
both asserted); it reads the file as **bytes** so universal-newline mode
cannot silently translate CRLF; it cuts paragraphs mechanically, so the count
of **38** is an *output*; and it diffs **with PG's apparatus still in**,
classifying every difference before removing anything.

**14 differences in 11 paragraphs. Twelve are footnote markers. Two are not:**

- **B03-P001** — the served file capitalizes Butler's lower-case `but`. PG
  opens Book III mid-printing, as it opens Book IV. No word changes.
- **B03-P038** — **the served `original-en` carries 196 words that PG does not
  have.** PG's Book III ends on a bare half-sentence whose other half opens
  PG's Book IV; the served file completes it with text taken **verbatim from
  the served `odyssey-modern-en.json`'s own paragraph 38**, and that text
  **duplicates the served paragraph 37**. The candidate renders **Butler's
  half-sentence and nothing else**. See `continuity.md`, "Base-text defects".

After removing only the apparatus: **36 of 38 paragraphs byte-identical, 4,690
words compared word-for-word over B03-P001…P037, zero mismatches**, and the
two that still differ are asserted to be exactly the two classified. **A rule
that stripped the apparatus before diffing would have hidden both.** Two
negative controls fail as they should.

`../scripts/scan_staged_original_vs_pg.py` then answered the obvious next
question over all 24 Books (1,027 paragraphs, 117,228 words): paragraph counts
match everywhere, and **B03-P038 is the only text-level difference in the
served file**. `../PROVENANCE.md` §4.

**Name forms are the Greek ones** (`../GLOSSARY.md`). **D13 fires for the
first time** — Butler's `Mycene` at B03-P024 is the city and becomes
`Mycenae`. **D12 class B fires for the first time** — `[on the embers]` at
B03-P001, mark dropped, words kept, flagged. Book 3 contains no class-C
bracket; the first is in Book 4, and **class C is open and blocks Book 4.**

## Files

1. `source-book3.json` — Book 3 extracted from
   `app/public/data/editions/odyssey-original-en.json` by `chapter.number
   == 3`, 38 paragraphs, byte-identical to the served original, keeping
   Butler's own chapter title.
2. `candidate-v1.json` — the modern-English candidate, 38 paragraphs
   one-to-one with the source, same schema (`number`, `title`, `paragraphs`).
   **Frozen**: not edited after the packets were generated from it.
   Corrections from review go to `candidate-v2.json`.
3. `candidate-v1-readable.md` — the same text with `B03-Pnnn` IDs outside the
   prose.
4. `continuity.md` — the source-verification rule, its audit and the two
   things it caught; names met in Book 3; the formulas fixed here and those
   carried from accepted Books 1 and 2; the per-paragraph decisions; the two
   word ratios and the retention measure; and the base-text defects.
5. `provenance.json` — branch, hashes, the verification record, word counts
   and retention, naming, punctuation, base-text defects, generation setting.
6. `review-packets/packet-01.md … packet-13.md` — thirteen packets (12×3 +
   1×2 = 38), each with one paragraph of context before and after marked
   `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim,
   including the **five things put to the reviewer explicitly**.
8. `manifest.json` — packet → paragraph-ID map with a coverage check, plus
   the v1 hash.

## Mechanical checks

```bash
cd books/staged-replacements/odyssey
python3 - <<'PY'
import json, hashlib, re, difflib
src  = json.load(open('book03/source-book3.json'))
cand = json.load(open('book03/candidate-v1.json'))
orig = json.load(open('../../../app/public/data/editions/odyssey-original-en.json'))
ch   = next(c for c in orig['chapters'] if c['number'] == 3)

# --- source integrity and alignment -----------------------------------------
assert src['paragraphs'] == ch['paragraphs'], 'source extraction not byte-identical'
assert src['title'] == ch['title'], 'source title not byte-identical'
assert len(cand['paragraphs']) == len(src['paragraphs']) == 38, 'paragraph count mismatch'
assert cand['title'] == ch['title'], 'no name in this title is a mapping row'
assert hashlib.sha256(open('book03/candidate-v1.json','rb').read()).hexdigest() == \
    '2f2cf21583e9de6f9da86565e9c3888f3380e574bb4a93cbd0b055535162aefa', 'v1 hash'

# --- packets cover every paragraph exactly once, verbatim -------------------
man = json.load(open('book03/manifest.json'))
ids = [i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids == [f'B03-P{i:03d}' for i in range(1, 39)], 'manifest coverage failed'
for e in man['packets']:
    t = open('book03/' + e['packet'], encoding='utf-8').read()
    for pid in e['assigned_paragraph_ids']:
        k = int(pid[-3:]) - 1
        assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t, f'{pid} not verbatim'

md = open('book03/candidate-v1-readable.md', encoding='utf-8').read()
assert all(p in md for p in cand['paragraphs']), 'readable md does not match the JSON'

ps = cand['paragraphs']
joined = '\n'.join(ps)
s = '\n'.join(src['paragraphs'])
def n(w, t=None):  return len(re.findall(r'\b' + w + r'\b', joined if t is None else t))

# --- names: every count matches the source, and every hazard holds ----------
assert (n('Odysseus'), n('Athena'), n('Zeus'), n('Poseidon')) == (7, 18, 8, 6)
assert (n('Ulysses', s), n('Minerva', s), n('Jove', s), n('Neptune', s)) == (7, 18, 8, 6)
for roman in ('Ulysses','Minerva','Jove','Neptune','Mercury','Saturn','Diana','Euryclea'):
    assert n(roman) == 0, f'Roman form survives: {roman}'
assert n('Rhea') == 0 and n('Helios') == 0 and n('Cronos') == 0
assert n('heaven') == n('heaven', s) == 12          # hazard 5: the metonym is untouched
assert n('Apollo') == 1 and n('Hades') == 1 and n('Amphitrite') == 1   # already Greek
# D13, first application: the CITY takes Mycenae; no bare Mycene in this Book
assert n('Mycenae') == 1 and n('Mycene') == 0 and 'he ruled in Mycenae' in joined
assert n('Mycene', s) == 1
assert n('Diomed') == 1                             # flagged, not corrected (D8 silent)
# D7 possessives, where Butler is inconsistent and the edition is not
assert joined.count('Telemachus’s') == 4
assert 'Achilles’s son Neoptolemus' in joined and 'Menelaus’s ship' in joined
assert not re.search('(Telemachus|Achilles|Menelaus)’(?!s)', joined)

# --- punctuation and spelling standards -------------------------------------
assert "'" not in joined and '"' not in joined, 'ASCII quote survives'
assert sum(p.count('“') for p in ps) == sum(p.count('“') for p in src['paragraphs']) == 42
assert sum(p.count('”') for p in ps) == sum(p.count('”') for p in src['paragraphs']) == 35
unbal = [i + 1 for i, p in enumerate(ps) if p.count('“') != p.count('”')]
assert unbal == [i + 1 for i, p in enumerate(src['paragraphs'])
                 if p.count('“') != p.count('”')] == [12, 13, 14, 15, 22, 23, 24], 'D4 x7'
for i in (12, 13, 14, 15, 22, 23, 24):
    assert ps[i].lstrip().startswith('“'), f'D4: B03-P{i+1:03d} must open its own mark'
for brit in ('grey','honour','harbour','marvelled','woollen','travelled','travelling',
             'favour','neighbour','colour','sceptr'):
    assert n(brit) == 0 or brit == 'sceptr', f'British spelling survives: {brit}'
assert 'sceptre' in ps[31]      # the object's ordinary English name, not a spelling variant

# --- D12 class B: the bracket mark dropped, Butler's words kept -------------
assert '[' not in joined and ']' not in joined, "Butler's bracket mark must be dropped"
assert 'burning the thigh bones on the embers' in ps[0], '…and its words kept'
assert '[on the embers]' in src['paragraphs'][0]

# --- formulas that repeat inside this Book, and must be identical ----------
assert joined.count('he is an excellent man') == 2                  # P002, P025
assert joined.count('honor of the Achaean name') == 2               # P011, P017
assert joined.count('the equal of the gods in counsel') == 2        # P012, P032
assert joined.count('When Dawn, the rosy-fingered child of morning, appeared') == 2
assert joined.count('readily enough') == 2                          # Butler's 'nothing loth'
assert joined.count('inner meats') == 3 and joined.count('outer meats') == 2
assert 'Nestor, the horseman of Gerene' in ps[7]
assert 'the Trito-born' in ps[29]
assert 'no mound heaped up for him' in ps[21]                       # Bk1/Bk2 'barrow' row
assert 'tell me truly' in ps[10] and 'So tell me truly, Nestor' in ps[20]

# --- formulas shared with accepted Books 1 and 2 ---------------------------
b1 = json.load(open('book01/candidate-v3.json'))['paragraphs']
b2 = json.load(open('book02/candidate-v2.json'))['paragraphs']
assert any('make yourself a name in story' in p for p in b1)
assert 'show your mettle and make yourself a name in story' in ps[15]
assert any('show your mettle, then, and make yourself a name in story' in p for p in b1)
assert any('tell me truly' in p for p in b1)
assert any('raise a mound to his memory' in p for p in b1 + b2)

# --- no archaism survived (a regression guard, not a check — records R3) ----
low = joined.lower()
for dead in (r'\bthereon\b', r'\bere long\b', r'\bwhereon\b', r'\bwhereupon\b',
             r'\bspunging\b', r'\bvictuals\b', r'\bnaughtiness\b', r'\bprating\b',
             r'hither and thither', r'\babode\b', r'save only', r'\bbade\b',
             r'\bmoodily\b', r'\bendowed\b', r'\btambour\b', r'\bsinglehanded\b',
             r'\bunblended\b', r'\bsteeds\b', r'\bamongst\b', r'\bbethought\b',
             r'\bfuddle\b', r'\baforetime\b', r'\bshewed\b', r'\bvouchsafe\b',
             r'\bhaply\b', r'nothing loth', r'knight of', r'public weal',
             r'privateering', r'elsewhither', r'\bthou\b', r'\bthy\b', r'\bthee\b'):
    assert not re.search(dead, low), f'archaism survives: {dead}'
assert not any(ps[i] == src['paragraphs'][i].replace('\n', ' ') for i in range(38))

# --- the B03-P038 defect: Butler's clause, and nothing of the splice --------
assert ps[37] == 'Now when the sun had set and darkness lay over the land,'
assert len(src['paragraphs'][37].split()) == 208 and len(ps[37].split()) == 12
for stolen in ('delicacies fit for princes', 'echoing portico', 'wheat lands',
               'It is getting late', 'libations have been made'):
    assert stolen in src['paragraphs'][37] and stolen not in joined, \
        f'a word of the served modern-en splice reached the candidate: {stolen}'

# --- alignment, newlines, ratios -------------------------------------------
assert not any('\n' in p for p in ps), 'candidate paragraph contains a newline'
sw = [len(p.split()) for p in src['paragraphs']]
cw = [len(p.split()) for p in ps]
ratio     = sum(cw) / sum(sw)
ratio_ex  = sum(cw[:-1]) / sum(sw[:-1])
assert abs(ratio - 0.9561) < 0.0005 and abs(ratio_ex - 0.9959) < 0.0005
assert 0.90 <= ratio <= 1.10

# --- the retention measure (Book 2 round 1), excluding B03-P038 ------------
NM = {'ulysses':'odysseus','minerva':'athena','jove':'zeus','neptune':'poseidon',
      'mercury':'hermes','saturn':'cronus','diana':'artemis','euryclea':'eurycleia',
      'mycene':'mycenae'}
def toks(t): return [NM.get(w, w) for w in re.findall(r'[a-z]+', t.replace('\n',' ').lower())]
a, b = toks(' '.join(src['paragraphs'][:-1])), toks(' '.join(ps[:-1]))
ret = sum(x.size for x in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_matching_blocks()) / len(a)
assert abs(ret - 0.895) < 0.001, f'retention {ret:.3f}'

print('OK — 38 paragraphs, coverage exact, packets verbatim, names and hazards held')
print('OK — ratio', f'{ratio:.4f}', '(excluding B03-P038:', f'{ratio_ex:.4f})',
      '| Butler token retention', f'{ret:.3f}')
for f in ('book03/source-book3.json','book03/candidate-v1.json',
          '../../../app/public/data/editions/odyssey-original-en.json'):
    print(hashlib.sha256(open(f,'rb').read()).hexdigest(), f)
PY
```

Expected:

```
OK — 38 paragraphs, coverage exact, packets verbatim, names and hazards held
OK — ratio 0.9561 (excluding B03-P038: 0.9959) | Butler token retention 0.895
a3dc00566e0f4517bc7fc68ca6b6dbb363a4e191bb175d1b5c1cabb420815e6a  book03/source-book3.json
2f2cf21583e9de6f9da86565e9c3888f3380e574bb4a93cbd0b055535162aefa  book03/candidate-v1.json
da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07  ../../../app/public/data/editions/odyssey-original-en.json
```

And the two source checks, which print their whole audit:

```bash
cd books/staged-replacements/odyssey
python3 scripts/verify_source_book3.py
# ends: OK — 36 of 38 paragraphs byte-identical after removing PG's 12 footnote
#       markers; 4690 words compared word-for-word over B03-P001..P037, 0
#       mismatches. …

python3 scripts/scan_staged_original_vs_pg.py   # read-only, all 24 Books
# ends: Paragraphs whose TEXT differs from PG: Book 3 ¶38 (+1147 chars)
```

To reproduce the package deterministically:

```bash
cd books/staged-replacements/odyssey
python3 scripts/build_book_package.py 3
```

## Next action

Independent review of `candidate-v1.json` (step 4), by a separate reviewer
session, following `review-instructions.md`. Findings go under
`book03/review/`. On findings: `candidate-v2.json` via a change script in the
established pattern, verification, flow read, `ACCEPTANCE.md` — steps 5–8.

**Book 4 is blocked** until the coordinator rules on decision **D12**'s class C
— the passages Butler brackets as afterthoughts or interpolations, of which
the first is at PG 1551 in Book 4. Books 1–3 contain none.
