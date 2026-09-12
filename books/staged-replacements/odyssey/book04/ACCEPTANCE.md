# The Odyssey, Book 4 — acceptance record

**Accepted 2026-09-12 at `candidate-v2.json`**, under `../WORKFLOW.md` step 8:
*accept only when no substantive issue remains.*

| | |
|---|---|
| Accepted file | **`candidate-v2.json`** |
| sha256 | **`b3bef2f3570009ef875a41567ecea85628b7883e3678e2bb226a51b49674c446`** |
| Readable copy | `candidate-v2-readable.md`, sha256 `5feb5f09c9eb7e34e54ed6d5d856abf778282d88c8dfe41da60e64149b2701f4` |
| Source | `source-book4.json`, sha256 `b4899064632724ca5847868fc28f4261a1693293405af0280911e508889eec70` — byte-identical to chapter 4 of `app/public/data/editions/odyssey-original-en.json`, sha256 `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07` |
| PG base text | `../source-texts/pg1727-butler-1900.txt`, sha256 `ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9` (Project Gutenberg #1727, Samuel Butler, 1900) |
| Frozen predecessor | `candidate-v1.json`, sha256 `9c7d54af4bc6e32fefe5d3946a08565820b76d3d3c58a9fc45ec138b912e6553` — **not edited**, with `candidate-v1-readable.md` and the 27 review packets (**D10**) |
| Review rounds applied | **1** |
| Second round | **Not run, and not required.** Round 1's single substantive finding was S-1, a Book-level finding about how much of Butler's syntax the draft moved; it is answered by measurement, not by judgement, and the measurement is now a gate the build itself enforces (below). Every minor finding is applied; five optional findings are declined, each asserted unchanged with its reason in `changes-v1-to-v2.md`. |
| Paragraphs | 81, one-to-one with the source, in order |
| Words | 8,045 against 8,042 — **ratio 1.0004** (v1 was 0.9999); lowest paragraph ratio **0.939** at B04-P006 |
| Butler token retention | **0.95872** (v1 was **0.95958**) |
| **Sentence-splitting rate** | **281 → 306 sentences, +8.9%** (v1 was +0.4%); **sixty-word sentences 17 → 3, 82% broken** (v1 broke 1 of 17) |
| Built by | `../scripts/build_book04_v2.py` |

All hashes, ratios, the retention figure and both sentence counts above were
**recomputed independently at acceptance**, not copied from the build's own
output, and the build was re-run to a byte-identical `candidate-v2.json`.

## Step 1 — the source, verified twice, by two different rules

**By this package**, `../scripts/verify_source_book4.py` — a *fourth* kind of
rule: needle-located and character-exact, using no heading, no Book number, no
`FOOTNOTES:` line and no digit. 81 of 81 paragraphs byte-identical after
removing only the 14 classified footnote markers; **8,042 words compared word
for word, 0 mismatches**; four negative controls fail as they should.

**By the round-1 reviewer**, `review/verify_source_book4_review.py` — a *fifth*
kind: global per-paragraph fingerprint alignment over the whole PG file, with
no anchor, no region and no needle. It confirms the same result and **adds a
property the package had not claimed**: each of the 81 served paragraphs
matches exactly one of PG's 1,382 blank-line blocks, and the 81 matches are
strictly consecutive (blocks 164–244). That is the paragraph-division claim now
recorded in `../PROVENANCE.md` §5 — records finding **R7**.

Two non-marker differences, both confirmed by both rules and neither a word:
B04-P001's Book-opening capitalization, and marker 44 being **space-set** in PG
rather than glued. Marker 48's removal leaves a line beginning with a space in
the served B04-P050; the served file is **faithful** there (PG minus the digits
is exactly that), the candidate prints one space, and both halves are asserted.

## Steps 4–5 — the review

Independent reviewer session; did not draft the candidate and did not consult
the drafter. `review/findings-v1.md`. 27 packets read in order with their
`CONTEXT ONLY` neighbours, then the candidate read straight through.
**Coverage complete**: every ID `B04-P001`…`B04-P081` carries exactly one
entry. Verdict **accept after corrections**: **1 substantive**, 16 minor,
11 optional, 7 records; 50 paragraphs with no material issue at all.

All five decisions the Book put to the reviewer were **upheld**: the three new
name rows (warrant corrected — R3), D12 class C at B04-P001 and B04-P052 with
`abode` → `home`, the B04-P040 quotation repair, and the one deliberate break
in the `heaven` census. The two further questions — `tell me truly` and
`sweet meats` — were upheld with records attached (R6, R4).

## Step 6 — the corrections, and what S-1 actually was

**42 substitutions in 31 of the 81 paragraphs**, every one listed in
`changes-v1-to-v2.md` with the finding it answers. Five findings declined, each
asserted unchanged.

**S-1 was the answer to the question this Book was sent to review with,** and
it deserves to be recorded as the reviewer proved it rather than as it was
first framed. The reviewer split the package's retention figure into a
vocabulary factor (`Rb`, a multiset intersection) and an order factor (`Ro`,
an LCS over that intersection), added a sentence-splitting rate, and calibrated
against the **98 accepted paragraphs of Books 1 v3, 2 v3 and 3 v2**. Its own
audit then **threw half the measure away**: in accepted work, chain load
predicts sentence splitting (Spearman ρ = **+0.380**, n = 98) and does **not**
predict order retention (ρ = **+0.048**). A demand measure that predicts
nothing in accepted work cannot convict a new draft, so only the C → ΔS channel
was allowed to ground the finding. That is the discipline that makes S-1
usable, and it is why this record states it: **the finding rests on sentence
division alone, and it could not convict on clause reordering.**

On the surviving channel it is decisive:

| | sentences src → cand | 60+ word sentences |
|---|---|---|
| accepted Book 1 v3 | 132 → 159 (**+20.5%**) | 10 → 0 (**100% broken**) |
| accepted Book 2 v3 | 137 → 159 (**+16.1%**) | 7 → 4 (**43%**) |
| accepted Book 3 v2 *(37 of 38 — the D14 splice excluded; R-1)* | 164 → 173 (**+5.5%**) | 9 → 6 (**33%**) |
| Book 4 **v1** | 281 → 282 (**+0.4%**) | 17 → 16 (**6%**) |
| Book 4 **v2, accepted** | **281 → 306 (+8.9%)** | **17 → 3 (82%)** |

Book 4's Butler carries the package's **densest** supply of sixty-word
sentences — 17 in 8,042 words, 2.11 per 1,000, against 1.95, 1.67 and 1.92 —
so v1 was the lightest hand in the package applied to the hardest source in it.
The vocabulary half of the drafter's defence was sound and the reviewer
reproduced it on an independent word list; the syntax half was not true.

**Twelve paragraphs were recast and one was deliberately left long.**

| paragraph | what was divided |
|---|---|
| B04-P009 | Butler's first semicolon in the 71-word opener. The **second** was divided and then reverted at the flow read (F-1): two sentences opening `But`. |
| B04-P011 | the Polybus catalogue, at both semicolons — three sentences, so the gifts arrive one group at a time |
| B04-P021 | at the hinge where the dead connective `for all which things` stood (finding 21.1), and again before `I was unhappy` |
| B04-P029 | the Pharos geography out of its em-dash parenthesis, three sentences; the division drops Butler's second `and` |
| B04-P035 | the 94-word instruction sentence, at two of Butler's own five semicolons |
| B04-P037 | the dash-parenthesis `who would go to bed with a sea monster if he could help it?` given its own sentence |
| B04-P040 | Proteus's conditions at Butler's semicolon; the division drops his `for`, the two sentences standing in sequence |
| B04-P041 | the clearest case in the Book — 89 words with two words changed — divided twice; longest survivor 55 words |
| B04-P045 | the old man's speech at Butler's second semicolon |
| B04-P050 | **twice**: the 61-word opening of Telemachus's reply, and the Lacedaemon/Ithaca contrast, where Butler's `whereas` becomes the plain modern `But` |
| B04-P064 | at the connective, which was also finding 64.2 |
| B04-P066 | Eurycleia's confession at Butler's `but` |
| **B04-P038** | **not divided.** Round 1 ruled its 105-word shape-changing sentence should stand — lion, dragon, leopard, boar, water, tree arriving without a stop is the sentence doing the work of the scene. The build **asserts** it stands and asserts it is still 100+ words. |

**No recast introduced wording that is not Butler's**, with the three
connective exchanges named above and in `changes-v1-to-v2.md`. That is why
retention barely moved: 0.95958 → **0.95872**. Round 1's B.7 said in terms that
a correction round of this content should barely move retention and that a
large move would mean something other than the finding had been done. It did
not move.

## Step 7 — the flow read

`flow-read.md`. All 81 paragraphs straight through, then nine targeted
re-reads. **One change (F-1, above)**; eight observations recorded and not
acted on, including the declined `was dissipated into thin air` and the
`morning … in the morning` echo at P017, which is the cost of rendering
Butler's `forenoon` correctly.

## What the checks now do that they did not

Round 1's section M was explicit that a **pure vocabulary swap satisfies every
check in the package perfectly**, because nothing in them counted a sentence.
`../scripts/build_book04_v2.py` adds four things, and `checks-v2.md` is its
report:

1. **Sentence counting and a splitting-rate gate.** The build fails if the
   candidate adds fewer than half the sentences the weakest accepted Book added
   (+5.5%), or if more than three quarters of the source's sixty-word sentences
   survive. **Book 4 v1 would have failed both.** The splitter is the
   reviewer's own, taken verbatim from `review/retention_measure.py`, so the
   numbers are comparable with the sheet's.
2. **One Butler word rendered two ways** — for every Butler word-type the
   candidate changes somewhere, the paragraphs where the same type is left
   alone. 104 rows, printed for a human to read and never asserted, because
   most of it is innocuous and that is exactly why nothing mechanical had
   caught `gave it me` kept beside `lent it him` repaired.
3. **Better than a byte-identical list.** The asserted list of identical
   paragraphs stops at Hamming distance zero, so B04-P041 — 89 words, two
   changed — passed it in v1. The build now reports every paragraph of 40+
   words within four word-level edits of Butler, **with its longest sentence**,
   which is what separates a paragraph that needed nothing from one that was
   only proof-read.
4. **The 81 per-paragraph word counts**, stored in `word-counts-v2.json` and
   asserted (records finding **R5**), so every shape of rewrap damage is one
   failing assertion instead of a formula check that happened to cover it.

## What remains open

- **Nothing substantive.** No finding of round 1 is unanswered; the five
  declined findings are optional, each asserted unchanged with a reason.
- **The declined five are preferences, not defects**: 39.1 (a correct but dated
  question mark), 49.1 and 72.1 (`drink offering`, `thole pins` — both now
  covered by the written compound rule rather than left silent), 80.1
  (`dissipated into thin air`), and the `morning … in the morning` half of
  17.1.
- **The measure's declared limit stands.** S-1 could convict on sentence
  division and not on clause reordering, because order retention predicts
  nothing in the accepted corpus. A draft that divides Butler's sentences and
  leaves every clause in his order will pass the new gate. Only a reader can
  see that, and the flow read is where it must be seen.
