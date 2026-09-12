# Book VIII — independent review round 1

Step 4 and step 5 of `../../WORKFLOW.md` for Book VIII. Written by an
independent reviewer session spawned by the coordinator, which did not draft
the candidate and did not consult the drafter. Findings are in
`findings-v1.md`; this file records what was checked, what verified, and what
the drafter does next.

**Verdict: Accept after corrections.** 0 substantive, 4 minor (1.1, 7.1, 55.1,
58.1), 4 optional (1.2, 12.1, 41.1, 51.1). Every paragraph VIII.1–VIII.61 has
an entry, in order, exactly once: 7 carry a numbered finding and 54 record "No
material issue found."

## What was checked

- **All 21 packets**, in order, three paragraphs at a time with the supplied
  `CONTEXT ONLY` paragraphs, Long's 1862 text beside the candidate; then
  `../candidate-v1-readable.md` read straight through for flow.
- **A word-level token diff of all 61 paragraphs**, generated locally and read
  beside the packets, so every word Long has that the candidate does not — and
  the reverse — was inspected individually. Every difference in the book is
  explained by a documented decision. Nothing is missing and nothing is added.
- **The mechanical checks in `../README.md`**, re-run verbatim: printed `OK`
  and the three expected hashes.
- **The word ratio**, recomputed: 0.9921 overall (4,543 → 4,507 words),
  per-paragraph 0.889–1.047. The outlier VIII.8 (0.889) is ruled on — four of
  its six missing tokens are Long's `[or ability]` printed twice and dropped
  under D11, the other two are `nay even` → `indeed even`. No content is gone
  and no short meditation is expanded.
- **The glossary**, term by term across all 61 paragraphs, including the
  **extended nature-of-the-whole row** — applied at VIII.5, VIII.6 and VIII.35,
  and correctly kept apart at VIII.35 from Long's adjective phrase "the
  universal nature", which occurs in the same sentence.
- **The three dagger clauses** (VIII.35, VIII.38, VIII.51): located
  independently in the PG file, all three standing as Long has them with
  pronouns modernised and glossary renderings applied. One word changed inside
  the VIII.51 clause is raised as optional finding 51.1.
- **D11 and the bracket arithmetic**, recounted from the source rather than
  taken from `../continuity.md`: **22** brackets and **4** cross-references in
  Book VIII. 10 brackets dropped (9 distinct items; VIII.8's is the same
  bracket twice), 12 folded, of which 7 are marked **referent** under the VI.50
  and VII.2 rulings, and 4 cross-references dropped. 10 + 12 = 22. Every count
  in `../continuity.md` and in the review assignment is correct.
- **Import check**: every widely quoted sentence in the book (VIII.5, VIII.21,
  VIII.47, VIII.48, VIII.50, VIII.51, VIII.57, VIII.59) keeps a Long-specific
  turn. No other translation was consulted, so this is absence of evidence of
  import, not proof of its absence.

## Hashes verified

All recomputed locally with `sha256sum`; all match `../provenance.json`,
`../README.md` and the values given in the review assignment.

| File | sha256 |
|---|---|
| `../candidate-v1.json` (frozen) | `9f42a271ca37f1869612951cb4e8c50f06aea20d520bc0870d00daa41e48e906` |
| `../source-book8.json` | `c380295dedc9eb9b409564ef43db3c441dce343bcbff03224e829ba22ac4f6bf` |
| `../../meditations-original-en.staged.json` | `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830` |
| `../../source/pg15877-long-1862.txt` | `6584df7e90d6035eece30d8028527290bf2508076963ee0376cb41db9cf88d5b` |

Reviewed at branch `claude/meditations-modern-en-20260911-v2`, commit
`669b110b8`.

## Does the no-rebuild claim hold? Yes.

Checked three ways, because byte-identity alone proves only that the file
matches the script — which is exactly how three illustration captions survived
the first build and three flush-left footnotes survived the second.

1. **Reproduction.** `../../meditations-original-en.staged.json` was copied
   aside and `../../scripts/build_original_en_from_pg15877.py` re-run from the
   PG source. `cmp` clean, sha256 still `7798607d…`, `git status` reports no
   modification, 487 paragraphs, 12 chapters, and the script's own leftover
   line prints `[X] 0 plus 0 Greek 4 underscore 0 dbl-hyphen 0 illustration 0`.
   **Nothing anywhere in the file moved, so no accepted book is reopened.**
2. **Direct re-read of PG lines 4933–5418**, class by class, independently of
   the drafter's list:
   - **Nine footnotes, all indented, all already stripped.** Every indented
     line in the book was listed; there are exactly nine indented blocks, each
     opening with four spaces and a bracketed capital, at PG lines **4969,
     5045, 5131, 5160, 5218, 5223, 5277, 5396, 5414** — the nine claimed, at
     the lines claimed. Every other indented line is a continuation of one of
     those nine bodies. There is no tenth footnote and **no flush-left footnote
     opener anywhere in the book**, so the VII.45 defect does not recur. None
     of the nine bodies' contents appears in the staged file.
   - **The two flush-left bracket lines in VIII.41 are Long's own wrapping
     text, not footnote openers.** PG 5247 `[unconditionally, or without any
     reservation], certainly this obstacle` and PG 5249 `[into consideration]
     the usual course of things` were read in full context: the lines above
     them end `…thou wast making this effort absolutely` and `…But if thou
     takest`. Each bracket opens its line only because Long's line wrapped
     there. Neither is a bracketed single capital, and neither sits between
     sections, which is where Book VII's flush-left footnotes sat. **The
     drafter's judgement is right**, and this was the one place in Book VIII
     where the Book VII defect could plausibly have recurred.
   - **No illustration caption** in PG 4933–5418 (the nearest, PG 5628, is in
     Book IX); **no running head, no page number, no digits-only or all-caps
     line** except the `VIII.` header; **no verse and no verse citation at
     all**, confirmed against the build's own verse report, which lists
     sections in Books 5, 7, 10, 11 and 12 and none in Book 8.
   - **Two in-text `[Greek: …]` spans**, both at PG 5383–5384 (VIII.57); every
     other Greek span in the range is inside a footnote body and is stripped
     with it. **Three `+` dagger marks**, and only three, in VIII.35, VIII.38
     and VIII.51.
3. **Independent recount** of the brackets and cross-references (above), which
   reconciles exactly.

**Conclusion: the claim holds, and I would not rebuild.**

## Base-text decisions verified in the PG file

All six located and read at their cited lines, not taken on trust: PG 4943
`How thou shall seem`; PG 4958 `is **the** work of an intelligent living
being`; PG 4985 `to change them, to take, them away hence`; PG 5209 `Does
Panthea or Fergamus now sit by the tomb of Verus?`; PG 5265 `do **not**
consider`; PG 5272 `comformably to its proper constitution`. All six are
correctly handled; rulings are in `findings-v1.md`.

Standard Ebooks was **not** fetched for this review. The drafter's reports of
SE's readings are taken as reported and used only as corroboration; no ruling
here depends on an SE claim alone. The two PG-over-SE judgements (VIII.2,
VIII.44) are upheld on what PG itself prints plus the internal sense of each
passage, both of which settle the question without SE.

## Rulings on the three flagged decisions

All three go the drafter's way and should be moved in `../continuity.md` from
"flagged" to settled.

1. **VIII.37 "Pergamus" for PG's "Fergamus" — upheld.** "Fergamus" refers to
   nothing; F-for-P is the same mechanical class as the three other PG slips
   found within the same 486 lines; SE's "Pergamus" restores Long rather than
   importing an editor; and D6 makes PG the base text for *the text*, not a
   rule that typographic damage be reproduced — the package has already
   declined to reproduce a stray comma and a misprint in this same book. The
   departure is recorded in three places, which is the right answer to the
   collation objection.
2. **VIII.57's transliterated Greek — kept, on stronger grounds than the
   drafter claims.** The case is *not* weaker than VII.13's. Without
   `(aktines)` and `(apo tou ekteinesthai)`, Long's sentence is not an
   etymology but a tautology: no English speaker calls rays "Extensions", and
   Long coined that capitalised word only to expose the derivation of ἀκτῖνες
   from ἐκτείνεσθαι. The Greek is what makes the sentence a claim at all, and
   Long's own footnote on the passage — "A piece of bad etymology" — confirms
   that an etymological claim is what he took himself to be printing. The
   GLOSSARY exception covers this by its letter and by its rationale; SE's
   endnote is a choice available to an edition that has endnotes, which this
   one does not.
3. **"Effusion" / "effused" at VIII.51 and VIII.57 — kept.** Uncommon, not
   archaic; the VIII.57 argument is a three-times-repeated antithesis with
   "extension" that no plain substitute holds against three times (and
   "outpouring", the nearest, is already in use in the same sentence for a
   different word); and rendering it two ways across the two paragraphs would
   break D10 inside one book.

## Drafter's next steps (step 6 of `../../WORKFLOW.md`)

1. **Write `../candidate-v2.json`** — never edit v1 — applying or answering the
   four minor findings:
   - **7.1** VIII.7: restore Long's comma in "according to its worth, times,
     substance, cause, activity, and incident", *or* keep the em dash and
     record it in `../continuity.md` as a deliberate reading and correct the
     sheet's existing six-item note, which currently contradicts the candidate.
   - **1.1 / 55.1 / 58.1** — one decision, not three. The four archaic "shall"
     futures (VIII.1 "if you shall live", VIII.55 "he shall choose", VIII.58
     "if you shall have" / "if you shall acquire") break with six accepted
     books, in which Long's "thou shalt" is rendered "you will" or a plain
     present everywhere. Apply, or extend `../continuity.md`'s VIII.58 note to
     explain why Book VIII diverges. The interrogative "How then shall you
     possess" at VIII.51 may be taken with them or left.
2. **Answer the four optional findings** (1.2, 12.1, 41.1, 51.1) either way,
   recording each as considered. 41.1 in particular offers a fold as an
   alternative to the D11 drop; the drop is correctly classified and declining
   is a legitimate answer.
3. **Move the three flagged decisions to settled** in `../continuity.md`, with
   the VIII.57 reasoning strengthened as above so the question does not reopen
   at a later book.
4. **List every change by paragraph ID** with the finding it answers, re-check
   each changed passage against the source, and note any finding not applied
   and why (step 6).
5. **Read the corrected chapter continuously** for flow (step 7), then record
   acceptance in `../ACCEPTANCE.md` with the accepted file's hash, the review
   rounds applied, and what remains open (step 8).
6. No second review round is required for findings of this size unless the
   drafter's answers change a passage substantially.
7. **Do not rebuild the staged original** for Book VIII. The no-rebuild
   decision verifies clean and Book IX should get its own step-1 check on the
   same pattern — PG 5419 onward does contain an illustration caption at line
   5628.
