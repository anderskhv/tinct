# Book 1 — independent review round 1

Findings: **`findings-v1.md`**. Verdict **Accept after corrections**: 1 standing
(book-wide), 3 substantive, 33 minor, 5 optional; 5 paragraphs with no material
issue at all. Every paragraph `B01-P001` through `B01-P032` has exactly one
entry, in order.

Reviewed 2026-09-12 by an independent reviewer session spawned by the
coordinator. This session did not draft the candidate, did not consult the
drafter, and made **no change to `candidate-v1.json`** or to any other file
outside this directory.

## What was checked

**Hashes, all four recomputed locally, all four match.**

| file | sha256 | matches |
|---|---|---|
| `book01/candidate-v1.json` | `8316ff76cdbb5d82a572bc58b9388dc76f8ab70deddec6e0dbf75f406b510db9` | `provenance.json`, `manifest.json`, `README.md`, and the assignment |
| `book01/source-book1.json` | `fd364c78c4e87d0c93e529aeaa42e13bc3677f21cc3b7143d1d43df76e64f1c4` | `provenance.json` |
| `app/public/data/editions/odyssey-original-en.json` | `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07` | `PROVENANCE.md` §1 and §4 |
| `source-texts/pg1727-butler-1900.txt` | `ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9` | `PROVENANCE.md` §1 and §4 |

**The `README.md` mechanical-check block was extracted and run verbatim** and
printed `OK — 32 paragraphs, manifest coverage exact, packets verbatim, ratio
0.943` plus the three expected hashes: source byte-identity to chapter 1 of the
served original, 32-to-32 paragraph alignment, exact manifest coverage, every
assigned paragraph reproduced verbatim in its packet, readable copy identical to
the JSON, ratio at or above 0.90, and the unclosed-quotation invariant.

**Five further mechanical checks of my own**, all reported in `findings-v1.md`:
per-paragraph word ratios for all 32; quotation balance per paragraph in both
files (exactly one unbalanced paragraph in each, the same one); a name-token
census over all 57 proper names (every one occurring the same number of times in
both files, with two intended exceptions); a formula census (all four instances
of Butler's "tell me, and tell me true" rendered identically, and the two other
fixed formulas likewise); and an archaism sweep (all eleven of Butler's dead
words and forms gone, none replaced by a different archaism).

**All eleven packets** read in order, three paragraphs at a time with the
`CONTEXT ONLY` neighbours, source beside candidate; then `candidate-v1-readable.md`
read straight through.

**Read before reviewing, in this order:** the package's `WORKFLOW.md`,
`GLOSSARY.md`, `PROVENANCE.md` and `00-progress-ledger.md`; then `book01/README.md`,
`review-instructions.md`, `continuity.md`, `provenance.json` and `manifest.json`.
The Meditations package's `WORKFLOW.md` and `README.md`, and its
`book11/review/findings-v1.md`, were read from
`origin/claude/meditations-modern-en-20260911-v2` for the method and the format.

**Only Butler was consulted for the text itself.** No in-copyright translation
was read, and no finding claims or denies an import on the basis of one.

## How the source was verified independently

The claim under test is that the staged `source-book1.json` contains Butler's
translation body for Book 1 and none of Project Gutenberg's apparatus. The
Meditations method says a re-run of the build proves nothing, and a
reconstruction sharing the build's blind spot proves nothing either. So:

1. **Every apparatus class in the raw range was enumerated first, against the
   raw lines, before any code was written.** PG #1727 lines 376 to 740 contain
   **zero indented lines** — which rules out the whole Meditations family of
   failures (footnote bodies, verse runs, illustration captions, unmarked
   continuations), since every one of them is defined by indentation. Zero
   square brackets, zero illustration markers, zero in-text Greek, zero daggers,
   zero underscores. Twenty-three short standalone flush-left lines, each
   checked by eye: twenty-one are paragraph-final wrapped lines, and the other
   two are `BOOK I` and the chapter heading, both outside the body range.
2. **One apparatus class exists in this range: sixteen bare-digit footnote
   references glued to the text** (`and the other East.1`, `Temesa4`,
   `middle Argos.”9`, `mine above all others 10—for it is I`, `cloisters11,`).
   This is the class that can vanish into a word and leave damage behind.
3. **The rule for that class was derived from a property the build does not
   use** — PG's own numbered footnote-entry list at line 10843 — rather than
   from digit pattern-matching, which is what any build would do. Over the whole
   translation body there are **187 digit runs, forming the sequence 1 to 187 in
   order with no repeats and no gaps**, against 186 bracketed entries numbered
   up to 187. The counts reconcile. That establishes as a **relation, not a
   constant**, that every digit run in Butler's body is a footnote reference and
   that Butler's body contains no digits of its own; Book 1 holds markers 1 to 16.
4. **The class's hardest cases were left in** rather than assumed away: the
   marker after a closing quotation mark, the marker preceded by a space and
   followed by an em dash, and the marker before a comma.
5. **Then the diff.** My reconstruction produced **32 paragraphs, all 32
   byte-identical to `source-book1.json`. Zero diffs.**

A byproduct worth recording: the staged `original-en` keeps PG's hard line wraps
as literal newlines inside every paragraph, and the candidate has none. That is
**correct** — the served `odyssey-modern-en.json` and `odyssey-modern-da.json`
contain zero embedded newlines across all 1,027 paragraphs, so the candidate
matches the convention of the file it replaces. My first reconstruction joined
lines with a space and differed from the staged file in all 32 paragraphs, which
is a useful demonstration that this check is capable of failing.

**Conclusion: the source claim holds.** No rebuild is needed.

## Next steps for the drafter

In this order, because the first one touches almost every file in the package.

1. **Apply standing finding S1 by script: the Roman-to-Greek name remap.** The
   complete table is in `findings-v1.md` — six rows, **46 substitutions across
   20 of the 32 paragraphs** — together with six hazards a naive find-and-replace
   would hit. Read those six before writing the script; the one that would
   actually fire is `Ops`, which is Greek already and which a general Roman-to-Greek
   deity list will try to turn into `Rhea`. Two open decisions to settle inside
   the same pass: the possessive form (`Odysseus's` recommended) and the nurse's
   spelling (`Eurycleia` recommended, to match the Cast's display name).
2. **Update the package's own records to match**, since S1 reverses a recorded
   decision: `GLOSSARY.md` (the naming decision, and the "son of Saturn" epithet
   row, which becomes "son of Cronus" — and settle *Cronus*, not the file's
   current *Cronos*), `PROVENANCE.md` §2 and §3, `00-progress-ledger.md` (D1
   reversed, A1 answered by the coordinator rather than deleted),
   `WORKFLOW.md`'s Names rule, `book01/continuity.md`, and
   `book01/review-instructions.md`.
3. **Apply the three substantive findings** — 4.1 (`unrighteously` restored),
   6.1 (`an eye of` restored, `his son` removed), 19.1 (`make` restored for
   `let`). Each is a one-clause change with the proposed wording given.
4. **Work the 33 minor findings.** They fall into four recurring classes and are
   probably faster to fix by class than by paragraph: concrete nouns softened
   (10.1 damask, 14.2 mountain, 17.2 over his ashes, 32.1 outer court, 7.1 oxen);
   qualifiers dropped (1.1 hero, 16.1 fine, 18.1 lay his hands about, 27.1 divine,
   19.2 in story, 25.1 not they); repetitions broken (13.1 longer purse,
   29.1 chief, 23.1 ills); and small additions or logic shifts (4.2, 5.1, 7.2,
   8.1, 9.1, 9.2, 12.1, 13.2, 14.1, 17.1, 24.1, 25.2, 30.1, 31.1). The five
   optional findings (2.1, 3.1, 21.1, 26.1, R5) are preferences; take or leave
   them, but record the disposition either way.
5. **Answer the four records findings** (R1 apostrophe typography, R2 spelling
   standard, R3 the unrecorded source crux at B01-P014, R4 the glossary's wrong
   citation). Each is a rule Book 2 will inherit, so settling them now is worth
   more than it costs. R1 and R2 would be well served by a `PUNCTUATION.md` for
   the package, on the Meditations model.
6. **Then the normal steps 6 to 8 of `WORKFLOW.md`:** write `candidate-v2.json`
   with every change listed by paragraph ID against the finding it answers,
   re-check each changed passage against Butler, note any finding not applied
   and why, read the whole Book for flow, and record `ACCEPTANCE.md` with the
   accepted hash.

Three drafter decisions were put to this review and all three are **upheld**:
the flagged minimum-ratio paragraph B01-P017 (complete; the low ratio is not
evidence of a defect), Butler's unclosed-quotation carry-over at B01-P018 into
B01-P019 (preserved correctly; do not touch it), and the D3 fold of `hecatomb`
(licensed and sound, with one caveat offered at optional finding 3.1). The
rulings are in `findings-v1.md`.
