# Book XII round-1 independent review — what was checked, and how

Findings: `findings-v1.md`. Reconstruction script: `verify_book12_source_review.py`.
This is the review of the **last book of the Meditations and of this package**, so
the last section below is the cross-book assessment the assignment asked for.

**Verdict: accept after corrections.** 0 substantive, 11 minor, 6 optional,
23 paragraphs with no material issue.

## Hashes, all recomputed locally, all matching

| File | sha256 | Result |
|---|---|---|
| `book12/candidate-v1.json` | `8665adc87689b8a97c26e6b16277a9c7132aa9d92762c71a702322f04e71863c` | matches the assignment, `provenance.json`, `README.md` |
| `book12/source-book12.json` | `1e7a003b8c43d502b4e5e10e3a1603e9512a3a56d5f6e9fb3b71901e4510032f` | matches; byte-identical to chapter 12 of the staged original |
| `meditations-original-en.staged.json` | `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830` | unchanged; 487 paragraphs, 12 chapters, profile 17, 17, 16, 51, 36, 59, 75, 61, 42, 38, 39, **36** |
| `source/pg15877-long-1862.txt` | `6584df7e90d6035eece30d8028527290bf2508076963ee0376cb41db9cf88d5b` | matches |

The mechanical-check block in `book12/README.md` was extracted and run verbatim.
It printed `OK` and the three expected hashes. **The bracket assertion passes:
4 folds + 7 D11 drops + 1 textual mark = 12**, asserted from the enumerated list
against the source's own count of `[`, so a numeral cannot drift from the list.
The "shall" assertions, the thou-form regexes, the base-text assertions, the
punctuation tallies and the five byte-identical paragraphs all pass.

Note for v2: the punctuation assertion compares *net* comma counts per paragraph,
and so cannot see a paragraph that removes one comma and adds another. Book XII
has one — XII.2, finding 2.1. Comparing comma *positions* would catch it.

## How the source verification was tested independently

The assignment required deriving the no-rebuild result by a rule different again
from both the build's and the drafter's, before opening the drafter's script.
Two kinds had already been used on this range: the build's `[A-D]`-opener state
machine, and the drafter's per-block indentation profile. I wrote a **third that
uses no indentation magnitude at all**.

> Every flush-left line is body; a flush-left line opening `N. ` starts a section,
> any other continues the one before. Each maximal run of indented lines is
> decided by **sentence continuity in the body accumulated so far**: if that body
> breaks off mid-sentence (ends in `,` `;` or `:`) the run is Long's verse and is
> joined into the paragraph; otherwise it is apparatus and is dropped. D14's
> typographic-only rules are reproduced; Long's `+` daggers are deliberately left
> in so a documented dagger surfaces as a diff rather than being assumed away.

The range was located by the script itself (`XII.` at 6817, `INDEXES.` at 7175,
found as bare Roman-numeral lines, not read out of the documentation).

**Result: 36 paragraphs, one differing paragraph — XII.16 — differing only by the
single `+` at PG 6963.** Three rule sets of three kinds now reproduce the staged
Book XII to the byte. The rules were then audited class by class against the raw
range, and every count agrees with the drafter's: eleven indented four-space
footnote openers; zero flush-left openers; eleven in-text markers (ten flush-left
plus one at the end of the indented verse line 6866) reconciling exactly; one
verse run at three spaces joined into XII.3; no caption; four `[Greek: …]` spans,
none in the body; one dagger; D14 firing at no line and reproduced anyway.

### My first rule was wrong, and that is the point of writing one

My first continuation test was the negative one: *join the run if the preceding
body does not end in terminal punctuation*. XII.17's body ends
`[For let thy efforts be--][B]`, with no terminal punctuation, because Long's
Greek breaks off there. So the rule joined the footnote run at PG 6969–6974 and
leaked `The interpreters translate (Greek: gorgos) … There is something wrong
here, or incomplete.` straight into XII.17. The staged file was right and my rule
was wrong; tightening the test to the positive form — *ends in `,` `;` or `:`,
i.e. a sentence actually in flight* — fixed it.

That failure is a different failure from the nine-space one, and the two together
say the same thing about the method.

## What the nine-space footnote means for the verification method

**Confirmed, with one correction.** PG 6886 is the second half of footnote [A]'s
body and is indented **nine** spaces; the maximal indented run at 6883–6888 has
the profile {4, 9}. I did not reason about what the Book XI reviewer's rule would
have done — I implemented it (split into blank-line-separated blocks, drop the
blocks whose lines are indented four, join any other indented block into the
paragraph before it) and ran it on the range. It keeps PG 6886 and leaks
`[Greek: Sphairos kykloteres monie perigethei gaion.]` **into XII.4**, not XII.3:
the block stands between the end of XII.4 at PG 6881 and the start of XII.5 at
PG 6890. The section number is wrong in four documents — `PROVENANCE.md` §4,
`book12/README.md`, `book12/continuity.md` and `book12/review-instructions.md`
(finding **C1**). Nothing else about the finding changes.

**What it means for the method, stated for the package rather than for this book.**

1. **The drafter's conclusion is right and should be preserved verbatim: a number
   taken from one book does not transfer; only the shape of the rule does.** Every
   rule that has failed in this package failed the same way — it encoded a
   *contingent fact about one range* as if it were a *property of the text*. The
   build encoded "footnotes are indented" and Book VII's three flush-left footnote
   bodies walked through it. The build encoded "apparatus does not look like body"
   and Book IV's three illustration captions walked through it. The Book XI
   reviewer's rule encoded "footnote runs are four spaces" and Book XII's
   nine-space continuation would have walked through it. My own first rule encoded
   "a finished sentence ends in a period" and Long's broken XII.17 walked through
   it. Four failures, one shape.
2. **So the reconstruction's value is not that it agrees, but that it is derived
   differently and can therefore disagree.** Two rules that agree because they
   encode the same contingent fact prove nothing, which is the Book X reviewer's
   point; two rules that agree after being derived from unrelated properties of
   the text are strong evidence, which is the Book XI reviewer's. Book XII now has
   three, from three unrelated properties: opener tokens, indentation magnitude,
   and sentence completion. That is as strong as this check gets, and the package
   should not ask for a fourth.
3. **A rule should be stated as a *relation*, never as a *constant*.** "Indented
   four or more, then checked by content" is a relation (apparatus is set in from
   the measure); "indented four" is a constant. The same applies to "short
   flush-left lines" (the drafter counts twenty-four, I counted twenty-seven with a
   different length threshold — nothing turns on it here, but a class whose size
   depends on the reviewer's threshold should carry the threshold in its statement).
4. **Every such audit must be run against the raw text, not against the
   reconstruction's output.** Both real defects in this package's history were
   invisible in output-to-output comparison and visible in a class-by-class audit
   of the raw range. That ordering — audit the rules, then look at the diff — is
   what `verify_book12_source.py` and `verify_book12_source_review.py` both do, and
   it should be written into `WORKFLOW.md` step 1 rather than left to be rediscovered
   from four `PROVENANCE.md` paragraphs.

## Rulings recorded in `findings-v1.md`

| Question | Ruling |
|---|---|
| XII.27 "Briae" → **Baiae** | **Confirmed.** Briae names nothing; Baiae belongs in a list of five retreats beside Capreae; `Br`/`Ba` is an ordinary slip. |
| XII.29 "that is its material" → **what** | **Confirmed, on the stronger evidence of the two.** "That" turns the second member of a three-member series of questions into an assertion identifying a thing with its matter — the identity the meditation exists to deny — and strands the elided verb of the third member. |
| Both, or only one? | **Both.** They are independent, each meets the threshold on its own evidence, and the *number* of departures in a book is a symptom, not a standard. |
| XII.3 "[to the god that is within thee]" under D11 | **Confirmed**, route and outcome. The VII.17 route is declined: VII.13/VII.17 keep Long's Greek because the meditations *are* arguments about the Greek words; XII.3 contains no such argument, and "daemon" has been "the god within" in eleven accepted books. |
| XII.17 "[For let thy efforts be—]" as textual doubt | **Confirmed, and D13's wording supports the extension.** Its Book XI amendment rules in terms that the test is "voice and subject, **not length**"; a class that changed at some unstated number of words would be the defect that amendment forbids. Recommend D13's sentence be widened at acceptance to "a word **or a clause**" (finding C3). |
| XII.4 "shall" beside "will" | **Ruled for "will" in both** (finding 4.1, minor). The rule's licence for first-person "shall" is that it is current English *in its own right*; in a two-member comparison whose other member has just taken "will", it reads as marking a difference the sentence denies. |
| XII.27 "[or Rufus at Velia]" under D11 | **Confirmed.** D11 reaches an alternative *construal*: Long's own "or" is inside the bracket, and unlike the XI.26/XII.17 class the words cannot stand as text once the mark is removed. |
| "Pancratiast" at XII.9 | **Confirmed.** Long's text, glossed by its own contrast with the gladiator; X.9 "Mimi" and XI.2 "pancratium" precedents. |
| XII.23's two resumptive repairs | **Allowed.** But `continuity.md`'s ground for them — "no word is added or dropped" — is false: the resumptive "he" goes in each. Finding 23.1. |
| The five added commas | **Four earned, one not** (XII.15's second, finding 15.1). And there are **six**, not five: XII.2's is unrecorded (finding 2.1). |
| D13 fires nowhere in Book XII | **Agreed, tested bracket by bracket.** All twelve classified independently; not one speaks about Long's handling of the Greek. X.23 remains D13's only instance in the work, and the rule is not idle for that — it is what stopped a Books XI–XII drafter folding such a bracket. |
| IX.1 "such like", V.1 "several" stay closed | **Agreed** — and both are larger than recorded. See below. |

## Next steps

1. Book XII step 6: `candidate-v2.json` applying the eleven minor findings (nine
   text, two records), with the six optional findings taken or declined with a
   reason; then steps 7 and 8 (`ACCEPTANCE.md`).
2. Corrections to the record that do not touch the candidate: **C1** in four
   documents, **C2** in `continuity.md`, **2.1**, **14.1**, **23.1** and **27.1**
   in `continuity.md`, and **C3** in the ledger's D13 row at acceptance.
3. Then the package has no further book, and the whole-work pass below is all
   that stands between the finished text and Anders's A1/A2 decisions.

---

# Cross-book assessment: what a pass over all twelve will owe

The drafter's starting list is five ledger items plus two inconsistencies found
while drafting XII, plus a glossary frequency table over all twelve candidates.
That list is right as far as it goes. I ran the frequency table rather than
recommending it, over the latest candidate of every book (v2 for Books I–XI,
v1 for Book XII), and **it does not go far enough**: three of the seven known
items are larger than recorded, and it turns up at least four more. What follows
is what I found, then what else I would want checked, then the order.

## A. The known items, re-derived — three of them are bigger than the ledger says

| Item | Ledger says | What the twelve candidates actually contain |
|---|---|---|
| **"such like"** | one place, IX.1 | **three**: I.17 "suchlike show", III.11 "suchlike coincidence and chance", IX.1 "such like successions" — and in **two spellings**, which XI.1 and XII.2 render "of that kind". |
| **plural distributive "several"** | one place, V.1 | **two, both in V.1**: "their several parts of the universe" and "those who love their several arts". The paragraph reference is right, the count is one short. |
| **third-person plain-future "shall"** | three: III.9, VII.8, VII.24 | those three are real (I re-derived them), but the class needs re-deriving rather than re-asserting. Scanning every "shall" in the twelve candidates finds **VII.68** "and the use shall say to that which falls under the hand" — a third-person plain future not on the list — and two that need an explicit classification: **VII.54** "that nothing shall steal into them" and **IX.29** "They themselves shall judge". V.29, VIII.32 and X.36 are correctly kept (emphatic, and the negative consecutive). The Book VIII round-1 finding once asserted there were none of this class; the ledger now says three; a mechanical re-derivation is the only way to stop the number moving again. |
| II.5 dangling relative; XI.12 "nor sinks down" | as recorded | as recorded; nothing to add. |

## B. Four more the sweep should carry, found by running the table

1. **"adapted to" in the dead sense.** Four places: V.8 "a thing adapted to procure health", VI.16 "should be adapted to the work", X.11 "nothing is so much adapted to produce magnanimity", XII.34 "most adapted to move us to contempt of death". Finding 34.1 proposes "best suited to" at XII.34; the decision should be taken for all four at once, because the live modern sense of "adapted" is *altered to fit* and X.11 and XII.34 are the two where a reader is most likely to take it that way.
2. **The "impressions / appearances" row under-describes the edition.** The row keeps "appearances" only "where Long means outward looks (I.15, I.16)". The candidates in fact keep it at **I.16, I.17, III.16 and VI.16** — and III.16 and VI.16 are the *technical* sense, kept because Long puts both English words in one sentence ("to receive impressions of forms by means of appearances", "the receiving of impressions by the appearances of things") so they cannot both be "impressions". That is a good decision with no rule behind it. It is exactly the class of correction made for the *daimōn* row before Book XII: a row that under-describes the edition should be corrected to describe it, not left for a later reader to call an inconsistency.
3. **Rows extended at Books VIII–XI cannot have been applied in Books I–IX, and only some of them were checked backwards.** The *daimōn* row was corrected backwards at Book XII and III.16 was found already right. No comparable backward check is recorded for the rows extended at Book VIII ("the nature of the universal"), Book IX ("divinity" as a modified count noun), Book X ("political animal", "common advantage", "a good daemon") or Book XI ("rational soul", "common advantage"). I spot-checked these and found no violation — VI.44 "a deity without forethought" and IX.1 "the highest divinity"/"the same divinity" are the sanctioned modified count uses; every "the universal X" in the candidates (VII.10, IX.28, IX.29, X.7, XII.32) is adjectival, not the bare noun the row governs; I.17's "in a manner that befits a ruler" is not Long's hedge and is rightly untouched — but **a spot check is not the sweep**, and the sweep should assert each extended row against all twelve candidates mechanically, from the row's own left column.
4. **Punctuation classes decided per book should be re-derived across books.** Two are already visible. The subject–verb comma is removed at XII.2 and XII.16 and *added* at XII.15 (finding 15.1) — the same construction, two ways, in one book. Lowercase after Long's question mark is kept at XII.15, XII.33, VIII.17, VIII.36, IX.40, X.1, X.24 and X.30, and capitalised at XII.36 twice (finding 36.1). Both classes are decided book by book in eleven `continuity.md` files and have never been collated.

## C. What else I would want checked across the twelve read together

5. **Build one assembled `modern-en` and assert it against the staged original as a pair**, not book by book: 487 paragraphs, twelve chapters, the profile 17, 17, 16, 51, 36, 59, 75, 61, 42, 38, 39, 36, every paragraph *n* of chapter *c* opening `n. ` with the same *n* as its source, and index-for-index alignment. This is the one check no per-book acceptance can make, and everything downstream (audio, character cards, saved positions) keys on it.
6. **Assert the negative invariants over the assembled file in one pass:** no `[`, no `(i. `-style cross-reference, no verse or source citation, no `+`, no `[Greek:`/`(Greek:` outside the two sanctioned VII.13/VII.17 places and VIII.57, no thou-form or archaic inflection, no `[Illustration`, no footnote-body string. Each book asserts these for itself today; nothing asserts them for the work.
7. **Re-derive the apparatus arithmetic for the whole work** the way Book X's finding C1 forced it to be done per book — from an enumerated list of every bracket in the staged original, classified fold / D11 / D13 / textual mark, summing to the source's own count. Twelve books of separately-asserted numerals are not the same as one assertion over 487 paragraphs, and D13 having fired exactly once (X.23) in the whole work is a claim worth proving rather than inheriting.
8. **A single continuous read of the whole work for voice**, which no session has done. Every book has had step 7's flow read; the drift a flow read cannot catch is drift *between* books — the twelve were drafted over two days by several sessions under a glossary that grew as it went, and Book I was drafted after Book II. In particular: Marcus repeats himself deliberately across books (the same images of the whole and the part, the same three-part self, the same lists of the dead), and those repetitions only land if the recurring phrasing is identical. A sweep keyed on glossary rows will not find a repeated *image* rendered two ways.
9. **Reconcile the "Open, not blocking" list against what a v3 would actually change**, and close it. It currently holds items of three different kinds — real inconsistencies (such like, several), stylistic reproductions of Long that were deliberately kept (II.5, XI.12), and a rule divergence (the "shall" futures). A single v3 touchpoint across the twelve is the cheapest way to clear all of them, and it is cheaper than eleven reopened acceptances.
10. **Record the verification method itself in `WORKFLOW.md`.** The strongest thing this package built is not any book; it is the audit-the-rules-then-diff method that four reviewers converged on, and it currently exists only as four paragraphs of `PROVENANCE.md` §4 narrating how it was discovered. Step 1 of `WORKFLOW.md` should state it as a procedure.

## D. How I would order the work

1. **Mechanical first, while nothing is being edited.** Assemble the twelve into one `modern-en`, run the structural and negative assertions (items 5 and 6), and run the glossary frequency table from every row's left column against all twelve candidates (items 1, 3, A). This is cheap, it is the part that cannot be done by reading, and its output is the worklist for everything after. Do it before any wording is changed, so the table describes a fixed state.
2. **Then the record corrections that change no word** (item 2, the under-describing rows; C1 and C2 from this review; the ledger's D13 widening). These make the glossary and ledger describe the edition that exists, which is the precondition for judging any remaining divergence.
3. **Then one v3 pass over the divergences the table found** (items A, B1, B4, and the "Open, not blocking" list), as a single change set across whichever books it touches, with one hash change per book and one combined acceptance note — not eleven reopened acceptances. Order the changes by class, not by book, so the same decision is taken once.
4. **Then the continuous read for voice** (item 8), last, because it is the only step that needs the text to be final, and because it is the only step that will find something no check can specify in advance.
5. **Then re-run step 1's assertions** against the assembled file, record the whole-work hash, and hand A1 and A2 to Anders with the finished text behind them.

One caution on ordering: **do not let the v3 pass reopen accepted books one at a time.** Eleven acceptances exist and their value is that they are closed. A whole-work touchpoint that changes several books at once, under one recorded decision per class, keeps that value; a sequence of single-book reopenings dissolves it, and the II.5 precedent was set precisely to avoid that.
