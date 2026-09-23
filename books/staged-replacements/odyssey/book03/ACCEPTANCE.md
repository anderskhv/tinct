# The Odyssey, Book 3 — acceptance record

**Accepted 2026-09-12 at `candidate-v2.json`**, under `../WORKFLOW.md` step 8:
*accept only when no substantive issue remains.*

| | |
|---|---|
| Accepted file | **`candidate-v2.json`** |
| sha256 | **`7095ef4f9925f284d3a31937d298b39766d619d8d5f2a01b61508c434989b905`** |
| Readable copy | `candidate-v2-readable.md` |
| Source | `source-book3.json`, sha256 `a3dc00566e0f4517bc7fc68ca6b6dbb363a4e191bb175d1b5c1cabb420815e6a` — byte-identical to chapter 3 of `app/public/data/editions/odyssey-original-en.json`, sha256 `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07` |
| PG base text | `../source-texts/pg1727-butler-1900.txt`, sha256 `ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9` (Project Gutenberg #1727, Samuel Butler, 1900) |
| Frozen predecessor | `candidate-v1.json`, sha256 `2f2cf21583e9de6f9da86565e9c3888f3380e574bb4a93cbd0b055535162aefa` — **not edited**, with `candidate-v1-readable.md` and the thirteen review packets (**D10**) |
| Review rounds applied | **1** |
| Second round | **Not run, and not required**: round 1 returned zero substantive findings, every paragraph-level finding it raised was applied, and none was declined. |
| Paragraphs | 38, one-to-one with the source, in order |
| Word ratio | **0.9559** (4,682 / 4,898); **0.9957 excluding B03-P038**; v1 was 0.9561 / 0.9959 |
| Butler token retention | **0.897** **on 37 of the 38 paragraphs** — B03-P038, the **D14** splice, excluded, because 196 of its 208 served source words are the replaced `modern-en`'s own ¶38 and this candidate renders Butler's 12; scoring against a source that is not the source measures the defect in the other file. On all 38: **0.86053**, sentences 176 → 174 (−1.1%), semicolons 41 → 32. The exclusion is correct; its silence was records finding **R-1** of Book 6's round 1. v1 was 0.895. Accepted Book 1 is 0.727 (corrected at R2, Book 4 round 1), accepted Book 2 is 0.902 |
| Built by | `../scripts/build_book3_v2.py` |

All hashes, ratios and the retention figure above were **recomputed
independently at acceptance**, not copied from the build's own output, and the
build was re-run to a byte-identical `candidate-v2.json`.

## Step 1 — the source, verified three times, by three different rules

**By this package**, `../scripts/verify_source_book3.py`: anchored structurally
on `BOOK III` / `BOOK IV` and never on `FOOTNOTES:` (which occurs twice in
PG #1727 — line 75, indented, in the table of contents, and line 10843, the
real section — both asserted); reads bytes, so universal-newline mode cannot
translate CRLF silently; cuts paragraphs mechanically, so the count of **38**
is an *output*; and diffs **with PG's apparatus still in**, classifying every
difference before removing anything. **14 differences in 11 paragraphs: twelve
footnote markers, and two that are not.** After removing only the apparatus,
**36 of 38 byte-identical, 4,690 words compared word-for-word over
B03-P001…P037, zero mismatches.** Two negative controls fail as they should.

**Across the whole served file**, `../scripts/scan_staged_original_vs_pg.py`:
all 24 Books, 1,027 paragraphs, 117,228 words. Paragraph counts match
everywhere and **B03-P038 is the only text-level difference in the file.**

**By the round-1 reviewer, on a third kind of rule** — anchorless and
digit-blind, so neither recorded trap can fire: it asks whether the served
Book 3 occurs as an exact contiguous token block in PG #1727, exactly once.
**4,730 tokens, one occurrence, PG lines 1123–1537, 37 of 38 paragraphs
matching in order with no gap**; all twelve digit runs in the located region
listed and confirmed ascending and glued; three negative controls fail.

Both non-marker differences are confirmed by all three: **B03-P001**, where the
served file capitalizes Butler's lower-case `but` (no word changes), and
**B03-P038**, where the served paragraph's last 196 words are not in the base
text at all.

## Steps 4–5 — the review

Independent reviewer session spawned by the coordinator; did not draft the
candidate and did not consult the drafter. `review/findings-v1.md`. Thirteen
packets read in order with their `CONTEXT ONLY` neighbours, then the candidate
read straight through. **Coverage complete**: every ID `B03-P001`…`B03-P038`
carries exactly one entry — a numbered finding or "No material issue found".

**Verdict: Accept after corrections.** *"This is the cleanest of the package's
three drafts, and nothing in it must be fixed before acceptance."*

| Severity | Count | Applied |
|---|---|---|
| substantive | **0** | — |
| minor | 18 paragraph-level | **18** |
| optional | 12 paragraph-level | **11**, plus 37.2, which proposes no change |
| records (outside the text) | 5 | **5** |
| no material issue | 12 paragraphs | — |

**Nothing was declined.** 37.2 is the twelfth optional finding and asks that
`sweetmeats` be **kept**, with its reason recorded; the build asserts the word
is still present rather than editing it.

## Step 6 — corrections applied

**32 substitutions in 27 of 38 paragraphs**, every one listed against its
finding in `changes-v1-to-v2.md`, which is generated from the build script's
own correction table and so cannot drift from the file. Retention rose, which
is the shape a correction round should have.

**Nineteen of the thirty-two put a word or a form of Butler's back** — his
hedge `try and find out`, his causal `accordingly`, his `likewise` as manner,
`sir strangers`' noun, the `honour to` idiom twice, `indeed`, the pluperfect
and the `then` that closes his `When … then` frame, `therefore` twice, `man`
the species, `his company`, his corrective `but` (as a semicolon), `cajoled`,
`batten upon` as `gorge`, the `suitors`/`wooers` variation, `all in due
course`'s `all`, and the article in `in the course of time`. Three are
standard-level (`twelvemonth` → `a year`; `towards` → `toward` twice;
`sceptre` → `scepter`), one is cross-Book (`mixing bowls` → `mixing-bowls`),
and one undoes a flattening the package itself introduced (below).

### Four things this round settled beyond Book 3's own text

1. **The "excellent man" warranty is not word for word in Butler** (finding
   2.2, records finding **R1**). B03-P002 is `he will tell no lies`; B03-P025
   is `he will tell **you** no lies`. v1 printed the second form in both
   places — the one place the package's consistency discipline was applied to
   a sameness Butler had not written. v2 prints each as he wrote it, and
   `../GLOSSARY.md` and `continuity.md`, which both asserted the two were word
   for word, are corrected.
2. **Decision D14** — where the served `original-en` is demonstrably not the
   base text, the candidate renders the base text (below, and ledger D14).
3. **Decision D12's class C is settled**, which **unblocks Book 4** and stops
   PG 5410 blocking Book 12: the mark is dropped, every word stands, nothing
   is recast across the bracket's boundaries, and every instance is recorded.
   Warrant, obligations, the six corrected instances and the four corrections
   to D12 as written are in `../GLOSSARY.md`.
4. **The archaism guard is strengthened** (records finding **R5**).
   `twelvemonth`, `twelve-month`, `towards` and the phrase `in course of time`
   join the dead-form list, the `sceptr` exemption is removed from the
   British-spelling assertion, and a **generalized cross-Book typographic
   drift check** is added — all in `../scripts/build_book3_v2.py`, which later
   Books inherit. **Book 4 therefore catches these forms itself.** The new
   drift check immediately found a third member of finding 27.1's drift in
   *accepted* Book 2, settled as a recorded successor
   (`../book02/candidate-v3.json`, `../book02/changes-v2-to-v3.md`) with Book
   2's accepted file and `ACCEPTANCE.md` byte-unchanged.

## Step 7 — the continuous flow read

`flow-read.md`. All 38 paragraphs read straight through, then eight targeted
re-reads against the source. **No further change.** The two warranties now
differ in exactly the one word Butler differs in and in no other; `decreed`
carries all three of his `counselled` with no near-synonym left competing
(`planned`, `resolved`, `ordained`: zero); the four restored connectives leave
the Book below Butler's own counts (`therefore` 3 against 4, `indeed` 3
against 3); both long speeches survive their D4 paragraph breaks with the
42/35 quotation-mark totals intact and the seven unbalanced paragraphs exactly
the source's seven. Two things the paragraph-level review did not state are
recorded there: Butler prints `sweet meats` **open**, so the kept `sweetmeats`
is a typographic normalization and not a substitution; and `companies`
(Butler's *guilds*) beside `companions` (his *company*) was read for confusion
and holds.

## The retention figure, 0.897 (on 37 of 38 — R-1) — what it reflects

**The source's own plainness, not a light touch.** Round 1 treated 0.895 as a
question rather than a pass and read the five least-changed paragraphs against
Butler line by line; the two ends of the table sort by exactly one thing,
whether the paragraph contains an archaism. Recomputed at acceptance on v2:

| least changed | | most rewritten | |
|---|---|---|---|
| B03-P034 | 0.975 | B03-P004 | 0.667 |
| B03-P015 | 0.974 | B03-P007 | 0.750 |
| B03-P023 | 0.964 | B03-P030 | 0.805 |
| B03-P019 | 0.950 | B03-P002 | 0.825 |
| B03-P010 | 0.950 | B03-P021 | 0.829 |

The least-changed are the **sacrifice** (anvil, hammer, tongs, ewer, basket,
axe, bucket, two layers of fat, five-pronged spits) and the **voyage
catalogues** (Tenedos, Lesbos, Psyra, Mimas, Euboea, Geraestus, Gortyn,
Phaestus) — where Butler is already plain modern narration and there is
nothing to modernize but connectives, all of which were in fact changed. The
most-rewritten are precisely the paragraphs carrying *thou/thee/thy*,
*vouchsafe*, *shewed*, *redoubtable*, *aforetime*, *the public weal* and
Butler's chained subordination. **That is the faithful-modernization pattern.**
A touch-up looks the opposite: there the archaism-heavy paragraphs are the
*lightly* touched ones, because the archaisms are what a touch-up leaves.

## B03-P038, and the repair the served file needs (D14, A3)

The candidate renders **Butler's twelve words and nothing else**:

> Now when the sun had set and darkness lay over the land,

against a served "original" paragraph of **208 words**, 196 of which are the
served `modern-en`'s own ¶38 spliced in to complete a half-sentence Butler
leaves open at the end of his Book III — text that also duplicates ¶37. The
cost is real and was not minimized at acceptance: in split view this will be
read as a bug, and it **is** a bug, in the other file. Ruling and reasoning:
`review/findings-v1.md` section C, ledger **D14**.

**The repair, prepared so that it is a one-line patch and not a research task.**
Replace the whole of chapter 3's paragraph 38 in
`app/public/data/editions/odyssey-original-en.json` with Butler's clause,
exactly:

```
Now when the sun had set and darkness was over the land,
```

Butler's own wording (PG line 1541). The served paragraph **already opens with
these fifty-six characters**, so the repair is a truncation: delete everything
after the comma. The modern edition renders the same clause
`…darkness lay over the land,`, matching its own rendering of it at B03-P037.

| | |
|---|---|
| File | `app/public/data/editions/odyssey-original-en.json` |
| sha256 **before** | `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07` — 637,591 bytes |
| sha256 **after** | `0cc76350232962d4c4f1cf1eb7216f14515fc1910f94f666695d2a595d4e6980` — 636,440 bytes |
| Paragraph counts | unchanged, 1,027 in the file and 38 in Book 3 — the paragraph stays, it is truncated |

Computed 2026-09-12 in a scratch copy by replacing the one JSON-encoded string
(it occurs exactly once in the file) and re-parsing. **The served file was not
written**, and nothing in this package is merged, registered or deployed.

**Fingerprint evidence, which settles the splice without reference to Project
Gutenberg at all** — re-verified at acceptance:

- Book 3 ¶38 is **the only paragraph in the entire 1,027-paragraph served
  `original-en` that contains an ASCII double quote.** It contains two; every
  other quotation mark in the file is typographic.
- The spliced text differs from the served **`modern-en`**'s own ¶38 by
  **exactly one substitution**: `covered` → `was over`. Someone edited two
  words of a 207-word modern paragraph and dropped it into the original.

That is corroboration of a completely different kind from a PG diff, and it is
recorded in `../PROVENANCE.md` §4 as well as here.

## Step 8 — what remains open

Nothing blocks acceptance. Recorded for later Books:

- **A3** — the served-file repair above. Outside this package's scope;
  escalated, prepared, and **not performed**.
- **Class-C brackets no longer block anything.** Book 4's first paragraph
  carries the poem's first instance (PG 1552, fn 36, **never closed**), and
  Book 4 ¶52 the second (PG 2067–2070, fn 49). Both are recorded under class
  C's obligations when Book 4 is drafted.
- **`Diomed`** (B03-P024) stands flagged and uncorrected: D8 is silent because
  the Cast has no display name for him. Beside `Ilius` and `Mycene` the woman.
- **`in due order`** is a Book 3 row, not a carried-over one (records finding
  **R2**); Book 2's `in due course` renders the *temporal* sense of the same
  Butler idiom, and the two senses stay distinct.
- **The archaism assert-list is a regression guard, not a check.** It caught
  nothing it was not told to catch, which is how four dated forms stood
  through a draft (R5). It is stronger now; it is still a guard.
- **Book 10's disposition** still needs a coordinator decision (ledger A2).

## Reproduction

```bash
cd books/staged-replacements/odyssey
python3 scripts/build_book_package.py 3      # the frozen v1 artefacts
python3 scripts/build_book3_v2.py            # v2 from v1, and the v2 gate
python3 scripts/verify_source_book3.py       # this package's source check
python3 scripts/scan_staged_original_vs_pg.py   # read-only, all 24 Books
python3 book03/review/verify_source_book3_review.py   # the reviewer's rule
```

`scripts/build_book3_v2.py` ends:

```
  candidate-v2.json sha256   7095ef4f9925f284d3a31937d298b39766d619d8d5f2a01b61508c434989b905
```

Nothing in this package is merged, registered or deployed.


---

## D20 backfill — NORM RATE, MOVE-GAP, and the basis (2026-09-12)

Added at Book 6's step 6, when **D20** made the semicolon-normalized splitting
rate and MOVE-GAP standard for every Book and asked that they be backfilled.
Nothing in this record is changed; this is added beside it. All of it is
produced by `python3 scripts/checks.py --all`, from the accepted file.

**Basis: 37 of 38 — B03-P038 excluded, the **D14** splice: 196 of the served source paragraph's 208 words are the replaced `modern-en`'s own ¶38 and the candidate renders Butler's 12. Scoring a candidate against a source that is not its source measures the defect in the other file. The exclusion is correct and was never stated; both bases are printed here.** — records finding **R-1** of Book 6's round 1. A figure without
the paragraph set it is computed over is not a figure, and the package
published one for three Books.

**The 37-of-38 exclusion is the whole of R-1.** On all 38 paragraphs the same measures give retention 0.86053, sentences 176 → 174 (−1.1%), semicolons 41 → 32, NORM RATE −5.1% and MOVE-GAP 0.02065 — and the D17 floor derived from a −1.1% rate would be negative, which is to say the gate would be vacuous. The exclusion is right; its silence was not.

| measure | value |
|---|---|
| Butler token retention (canonical, aggregate-join) | 0.89641 |
| bag retention (order-blind) | 0.91797 |
| **MOVE-GAP** (bag − order) | **0.02156** |
| displaced runs (the strict clause-movement witness) | 0 |
| sentences, source → candidate | 164 → 173 |
| splitting rate, raw (D17) | +5.5% |
| semicolon-normalized sentences | 203 → 205 |
| **NORM RATE** (D20) | **+1.0%** |
| semicolons, Butler → candidate (D19) | 39 → 32 |
| sentences grown into the 40s (D20 aligned gate; none past 50) | 3 |
| candidate sentences of 40 words or more (absolute) | 26 |

**MOVE-GAP is an upper bound on clause movement** — it counts any relocation of
a surviving token, phrase-internal ones included. The displaced-runs count is
the lower bound: a run of four or more consecutive Butler tokens, occurring
exactly once on each side, surviving verbatim outside the monotone alignment.

**NORM RATE** adds each text's own semicolon count to its own sentence count on
**both** sides, so a semicolon and a period score the same and converting one
into the other is worth exactly zero. It is what D19's count was for, and what
D17's raw rate is worth once the bookkeeping is priced out.

## Candidate-only accessibility review (2026-09-23)

The Book's latest file was reviewed. No edit was applied, and every finding has a reason recorded in `../edition-review-2026-09-23/books01-09-accessibility/SCREENING.md`.
