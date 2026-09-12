# Meditations (Marcus Aurelius) — staged modern-English replacement

Content-only staged work. Nothing here is registered, live, merged or deployed.
No app code, registry entries, served editions, audio or database records are
touched by this package.

**Status, 2026-09-12: the text is finished.** Twelve of twelve books are
accepted, the cross-book pass over all twelve is done, and the assembled edition
exists. What stands between this and integration is **Anders's two decisions, A1
and A2** (`00-progress-ledger.md`, "Needs Anders"), and the downstream work A1
implies, which is outside this package.

Start with `00-progress-ledger.md` (state, decisions, what needs Anders), then
`WORKFLOW.md` (the eight-step process, the source-verification method, and the
whole-work pass), then `PROVENANCE.md` (what the served file actually is, the
edition assessment, rights, and the staged corrected `original-en`).

- `meditations-original-en.staged.json` — George Long 1862, 12 books, 487
  paragraphs, one per numbered section, sha256 `7798607d…`. Built from
  `source/pg15877-long-1862.txt` by `scripts/build_original_en_from_pg15877.py`.
- `meditations-modern-en.staged.json` — **the assembled modern edition**, 12
  chapters, 487 paragraphs, 45,451 words, sha256
  `e2cc6090b4cde62db3f991dd5f6714c5d194232c499de3bbe8ddd04915803d10`. Built from
  the twelve accepted candidates by `scripts/assemble_modern_en.py`, which also
  asserts the whole-work invariants.
- `GLOSSARY.md` — stable renderings, fixed before drafting and corrected at the
  cross-book pass to describe the edition that exists.
- `PUNCTUATION.md` — the punctuation classes, collated across the twelve.
- `bookN/` — per-book drafting, review-packet, correction and acceptance files.

## The completion record

### 1. Twelve of twelve accepted

Each `bookN/ACCEPTANCE.md` names the accepted file and its hash. Every book went
through all eight steps of `WORKFLOW.md` and its own independent review round by
a separate session; **no drafter reviewed its own draft**. Across the twelve
rounds there was **one substantive finding in the whole work** (Book V), and the
last three books had none.

**Book XII, the last, was accepted on 2026-09-12** as `book12/candidate-v2.json`,
sha256 `8510a04f2294340b803446d01bb4699f1c956c05c970fc7631b04cefb44274a7`. Its
round-1 verdict was *accept after corrections*: 0 substantive, 11 minor, 6
optional. **All seventeen findings were answered and applied** — ten
substitutions in eight paragraphs and seven record corrections — and **every
substantive call the drafter made was confirmed**, including both departures from
PG's letters (XII.27 "Baiae", XII.29 "what"), XII.3's D11 route, XII.17's
whole-clause application of the textual-doubt class, XII.27's "[or Rufus at
Velia]", "pancratiast", XII.23's repairs, and D13 firing nowhere. The one ruling
against the draft, finding 4.1, rules a rule rather than an error, and the
candidate now keeps **none** of Long's ten "shall / shalt" in Book XII. Two
ledger changes came out of it: **D13**'s textual-doubt sentence widened to "a
word **or a clause**" (XI.26 and XII.17 are its only two instances in the work),
and the nine-space footnote-leak finding corrected to land in **XII.4, not
XII.3** — with its conclusion kept verbatim, because the conclusion is the point:
*a number taken from one book does not transfer; only the shape of the rule
does.*

### 2. The cross-book pass

No session had read the twelve together, and rules added at Books VIII–XI had
never been applied backwards over I–IX. The pass ran in the order the Book XII
reviewer set, and under its caution: **eleven closed acceptances are the asset,
so the work is by CLASS, in one pass, not by book.**

**a. Mechanical checks first, while nothing was edited.** `scripts/assemble_modern_en.py`
assembles the twelve and asserts, over all 487 paragraphs at once: twelve
chapters in the profile 17, 17, 16, 51, 36, 59, 75, 61, 42, 38, 39, 36; every
paragraph *n* of chapter *c* opening `n. ` with the same *n* as its source, and
index-for-index alignment with the staged original as a **pair**; the negative
invariants over the whole work (no square bracket, no cross-reference, no verse
or source citation, no dagger, no stray Greek, no thou-form or archaic
inflection the glossary bans, no illustration caption, no footnote-body string);
and **the apparatus arithmetic for the whole work, re-derived** from the 135
brackets in Long rather than inherited from twelve numerals — **89 whose words
stand** (86 supplements folded, V.28's bracketed fragment of Marcus kept
verbatim, and the two textual-doubt marks XI.26 and XII.17) and **46 dropped**
(45 under D11 and **one** under D13, X.23, still its only instance in the work),
reconciled book by book against each book's own record, with the 15 brackets
where the mechanical survival screen disagrees enumerated and explained.
**A finding of the reconciliation:** Books I–V never enumerated their bracket
dispositions with a total, because that discipline began at Book X (finding C1);
their triples are derived and recorded here.

**b. What the frequency table found.** `scripts/glossary_frequency.py` runs every
glossary row's left column and the dead-usage classes over all twelve
candidates. Three of the ledger's known items were **larger than recorded**
("such like" in three places and two spellings, not one; "several" twice in V.1,
not once; the third-person plain-future "shall" in four places, not three), and
it turned up seven more classes the ledger did not have — the "vexed / vexation"
row unapplied at I.15, Long's lowercase after his own question mark capitalised
eleven times in Books IV–VII, his comma before an em dash left standing twice in
Book VII, "toward"/"towards" split down the middle of the work, four words
spelled two ways, the last finite negative without do-support at IX.30, and a
formula Long repeats across books rendered two ways. It also **cleared** the
rows extended at Books VIII–XI: every one of them describes the accepted books
correctly, and the *daimōn* row corrected before Book XII reaches back to III.5
and III.16 exactly as it should.

**c. Record corrections that change no word.** `PUNCTUATION.md` is new: the ten
punctuation classes of the work, each with the ruling and the book that settled
it, collated for the first time from eleven separate `continuity.md` files, with
the derived whole-work table and a statement of that table's limits. The
**impressions / appearances** glossary row is corrected to describe the edition
(nine sections keep Long's "appearance(s)", three convert it, on a principle the
row did not state), the **"shall"** paragraph's closing claim is replaced by the
re-derived class, Long's **"wilt"** is given its own rule, and three rendering
rows are added for classes the v3 pass settled once.

**d. One v3 pass, eleven classes, decided once each** —
`scripts/build_v3_crossbook.py`, which applies all of them in a single change
set, asserts each class is empty afterwards, and writes one `candidate-v3.json`,
one `changes-v2-to-v3.md` and one hash per touched book. The accepted v2 files
are unchanged on disk.

| | Class | Where |
|---|---|---|
| A | "such like" / "suchlike" → "of that kind" | I.17, III.11, IX.1 |
| B | the plural distributive "several" → "separate" | V.1 ×2 |
| C | the third-person plain-future "shall" | III.9, VII.8, VII.24, **VII.68** |
| D | "adapted to" in the dead sense → "suited to" | V.8, VI.16, X.11 |
| E | Long's lowercase after his own question mark, restored | IV.20, V.5, V.11, V.23, V.28, VI.10 ×2, VI.44, VI.55, VII.18, VII.58 |
| F | the "vexed / vexation" row, applied where it was not | I.15 |
| G | Long's comma before an em dash, removed | VII.49, VII.55 |
| H | a formula Long repeats across books, rendered two ways | I.6, II.3, VIII.13 |
| I | one form of "toward" for the whole edition | 27 in 18 sections, VII–XII |
| J | Long's dangling relative at II.5, repaired | II.5 |
| K | one spelling of a word for the whole edition | VII.9, VII.13, VII.19, IX.40, X.8, X.23 |
| L | the last finite negative without do-support | IX.30 |

**The "shall" class was re-derived rather than re-asserted**, which is why it is
now empty and can be asserted as empty: VII.68 was on no list, and **VII.54**
("that nothing shall steal into them", a negative final clause, the VIII.32
shape) and **IX.29** ("They themselves shall judge", the emphatic third person,
the V.29 class) had never been classified either way and are **kept**, with the
reason recorded. Twenty-five occurrences stand in fifteen sections, each licensed
by a clause of the rule, and the build asserts that inventory.

**Two classes were found, recorded and deliberately NOT normalised**, both in
`PUNCTUATION.md` with the reasoning: the ~147 commas Books IV–VIII add round
Long's postpositive connectives ("Why, then, do you…"), where Books IX–XII follow
him — local pointing, semantically null, and normalising it would change over a
hundred marks in five books on no better ground than evenness, which Book IX's
finding 7.1 rules against; and the spaced em dashes inherited from verse joins at
VII.31, X.34 and XI.6.

**Two long-standing "Open, not blocking" items are now closed by decision, not by
silence:** II.5's dangling relative is **repaired** (class J, in the wording two
sessions had logged for this touchpoint), and XI.12's "nor sinks down" is
**kept**, because the honest repair ("nor sunk down") would make the soul's
sinking something done to it where Long's finite verb is intransitive — the
reasoning is at XI.12 in `book11/continuity.md` and was upheld at Book XI
acceptance.

**e. One continuous read of all twelve**, after the classes were applied. The
work reads as one self-address in one voice from I.1 to XII.36. No book reads as
a different translator's; the long argumentative sections still run long and the
runs of one-line meditations still change the tempo; Marcus's recurring images —
the three-part self, part and whole, the lists of the dead, the actor and the
stage — recur in the same words. **The read is what produced classes H, I, K and
L**, none of which a per-book flow read or a glossary sweep could have found,
which is the argument for doing it last and doing it at all.

**f. Everything re-asserted after the pass.** All three scripts pass: the
structure and alignment, the negatives, the bracket arithmetic, the "shall"
inventory, the dead-usage classes (all empty except the two ruled keeps of
"perchance" at IX.3 and XI.34), and the assertion that Long's lowercase after a
question mark now stands in **all 36** places he prints it.

### 3. The assembled edition

`meditations-modern-en.staged.json`, sha256 `e2cc6090…` — 12 chapters titled
`Book 1`…`Book 12`, **487 paragraphs** in the profile 17, 17, 16, 51, 36, 59, 75,
61, 42, 38, 39, 36, one per numbered meditation, each opening with its section
number, aligned 1:1 and index for index with `meditations-original-en.staged.json`.
45,451 words against Long's 46,058 — **ratio 0.9868**, and the shortfall is
apparatus: the dropped cross-references, verse and source citations, and the 46
dropped brackets. **44 paragraphs are byte-identical to Long**, each one a
paragraph where his English was already current.

### 4. What remains

1. **A1 and A2, for Anders** (`00-progress-ledger.md`, "Needs Anders"), unchanged
   since Book II and **both still standing**. **A1:** adopting the corrected Long
   `original-en` changes Meditations from 412 to 487 paragraphs with different
   boundaries; the served `modern-en`, `modern-da`, the R2 audio, the static
   `read/meditations` chapter pages and every saved reading position key on the
   old structure. Nothing here can be integrated until A1 is answered. **A2:** the
   registry's attribution is false today — "Long Translation (1862)" on a Casaubon
   text — and fixing it is app/registry work.
2. **The integration work A1 implies**, all of it outside this package: writing
   the assembled file to `app/public/data/editions/`, regenerating `modern-da`
   and the R2 audio against the 487-paragraph structure, rebuilding the static
   chapter pages, and migrating or resetting saved positions. `PROVENANCE.md` §5
   lists the consequences.
3. **Nothing else content-side.** There is no thirteenth book, no unanswered
   finding, and no open flagged decision in any of the twelve books.
