# Book X — independent review round 1

`findings-v1.md` is the review of `book10/candidate-v1.json` (frozen, sha256
`95ce5f7c…`). Written by an independent reviewer session spawned by the
coordinator, on branch `claude/meditations-modern-en-20260911-v2` at commit
`9301fad45`, in a separate worktree. The reviewer did not draft the candidate,
did not consult the drafter, and changed nothing outside this directory.

**Verdict: Accept after corrections.** 0 substantive, 6 minor (five
paragraph-level, one chapter-level), 5 optional, 29 paragraphs with no material
issue. Every one of X.1–X.38 has exactly one entry, in order.

## What was checked

- **Hashes.** All four recomputed locally and all four match: candidate
  `95ce5f7c67cb2ba7a2403c95d0b97b85827c35f4ab375cb98f5fbe9a11995c5d`,
  `source-book10.json` `db635cde6d55681018839d302ebd165c329f265a27275b5c4a574256aeca7f8c`,
  staged original `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830`
  (487 paragraphs, profile 17, 17, 16, 51, 36, 59, 75, 61, 42, **38**, 39, 36),
  PG base `6584df7e90d6035eece30d8028527290bf2508076963ee0376cb41db9cf88d5b`.
  `git status` clean.
- **The mechanical-check block in `book10/README.md`**, re-run verbatim: `OK`
  plus the three expected hashes.
- **All thirteen packets, in order**, three paragraphs at a time with the
  supplied `CONTEXT ONLY` neighbours, Long beside the candidate; then
  `candidate-v1-readable.md` read straight through for voice and pacing.
- **A token-level diff of all thirty-eight paragraphs**, read difference by
  difference. Every difference is accounted for by a documented decision. The
  complete set of words the candidate uses that occur nowhere in Long's Book X
  is eleven, all documented.
- **All eighteen square brackets re-extracted from the source** and classified
  one at a time, rather than the counts being trusted.
- **All twenty-three of Long's "shall / shalt"**, audited one at a time against
  the widened rule.
- **Ratios recomputed**: book 0.9943, minimum 0.88 at X.23, maximum 1.077 at
  X.29; and the five byte-identical paragraphs checked individually against the
  accessibility standard.

## The no-rebuild claim: how the reconstruction itself was tested

The claim holds. It was **not** tested by re-running either script, and it was
not tested by trusting `scripts/verify_book10_source.py`'s output either — a
reconstruction that shares a blind spot with the build proves nothing, so the
reconstruction's **rules** were audited against the raw PG range first.

Three of its rules can fail silently; each was checked against PG 5866–6374
directly:

1. **Footnote consumption could swallow Long's own indented verse.** Every
   maximal indented run in the range was listed independently with its
   indentation profile. There are **twelve**: eleven footnote runs, all bodies
   indented four spaces (the footnote-[B] Odyssey quatrain at seven, *inside*
   run 6009–6036), and one run at **6305–6307 indented five spaces with no
   footnote opener**, not adjacent to any footnote run (nearest before ends
   6269, nearest after opens 6319). So Long's Homer couplet cannot have been
   swallowed, and it is present in both reconstruction and staged text. The two
   verse blocks are separated by indentation *and* by containment, not by a
   guess — which is precisely the point the assignment asked about.
2. **The "join an unnumbered block onto the previous one" rule could absorb a
   page number, running head or catchword rather than expose it.** It cannot
   hide one — absorbed text would show as inserted words in the diff, and none
   did — and independently there is **no standalone short flush-left line in the
   range at all**. (The package says "exactly one, the `X.` header"; the header
   is at 5865, just *outside* the reviewed range. Inside it the count is zero.
   No consequence.)
3. **A flush-left footnote body of the VII.45 kind would be read as Long's
   text.** That is what makes the method strong, and it is a genuine test: such
   a body would have appeared as inserted words or an inserted paragraph. None
   did.

Marker arithmetic was recounted from the raw text: **16** `[A-D]` markers in
flush-left lines, **1** more at the end of the indented verse line 6306
(`So is the race of men."[A]`), and **17** indented footnote openers at exactly
the lines the package names. 16 + 1 = 17 markers for 17 footnotes in eleven
runs — the drafter's class-by-class account is exactly right, including the
seventeenth marker inside the verse, which is the detail the assignment singled
out.

Running the script then reproduces its claim: **38 paragraphs, count match, four
differing paragraphs — X.9, X.19, X.25, X.31 — each differing only by one `+`**,
the four dagger marks `PROVENANCE.md` §4 documents as deliberately removed.
Range boundaries confirmed by eye (5865 `X.`, 5868 the unnumbered opening, 6368
the last words of X.38, 6370 the closing footnote, 6375 `XI.`).

**No rebuild is needed; no accepted book is reopened.**

## Rulings the drafter asked for

| Item | Ruling |
|---|---|
| X.23 translator's note dropped as apparatus | **Upheld** — and it needs its own ledger row (**D13**), because D11 covers only alternative renderings. Finding 23.1. |
| X.21 "[is wont]" folded, not dropped | **Confirmed** — the meditation *is* the double sense; the VII.13 / VIII.57 principle. Execution needs a small typographic repair, finding 21.1. |
| X.2 "[social]" and X.33 "[order]" dropped under D11 | **Both right**, and the test ("does the meditation's point survive the drop?") is principled. **One inconsistency found**: X.15's "[political community]" is the same shape and was folded — finding 15.1. |
| X.15 "Let me see" → "Let men see" | **Upheld.** Four converging grounds; same class as VIII.37 and IX.34. |
| X.9 "Mimi" kept untranslated | **Upheld**, and **no** gloss exception is warranted. |
| X.32 vocative-comma imperative | **Rejected.** IX.40's vocative earned its place by a contrast that X.32 does not have, and "You, only" invites the misparse "only you". Proposed: "Only determine to live no longer unless you are such." Finding 32.1. |
| X.25 Long's comma inside the dagger clause | **Confirmed, keep it.** It closes a long relative subject, misleads no one, and falls at a dagger. |
| X.6 and X.36, PG right against Standard Ebooks | **Both confirmed.** |
| "thou are" slip in both base texts | Correctly invisible after the thou-rule; recording it anyway is right. |
| X.27 PG's Latin name forms | **Confirmed** under D6 (IX.29 precedent). |
| SE's five typographic breaks | **Confirmed ignored** — none is a section break; 38 is the standard count and alignment is a hard constraint. |
| The "shall" audit (23: 6 kept, 17 removed) | **Consistent in all three kinds.** X.11 and X.32 are plain futures, not deliberative questions; X.1's positive consecutive clause is correctly distinguished from X.36's negative one. Book X adds no new case to the three already open in the ledger. |
| Word ratio 0.994, minimum 0.88 at X.23 | **Ruled**: the 0.88 is entirely the nine-word dropped note; without it X.23 is 1.02. No compression anywhere. |
| Five byte-identical paragraphs | **Right.** Each checked individually: no thou-form, no archaic inflection, no glossary term, no bracket, no dagger-affected wording. |

## Next steps for the drafter (step 6)

Write `candidate-v2.json`; do not touch `candidate-v1.json`.

1. **21.1 (minor)** — X.21: move the gloss outside the quotation —
   `…that "this or that loves"—is wont—"to be produced?"` — or record in
   `continuity.md` why the dashes stand inside.
2. **32.1 (minor)** — X.32: `Only determine to live no longer unless you are
   such.`
3. **15.1 (minor)** — X.15: either drop "[political community]" under D11
   (`…as in a state.`) or keep the fold and add one sentence distinguishing it
   from X.2's "[social]". Either is defensible; deciding them differently
   without a stated reason is not.
4. **23.1 (minor)** — add **D13** to `00-progress-ledger.md` and cite it, not
   D11, at X.23.
5. **C1 (minor, records)** — correct **sixteen → fifteen** folds in
   `continuity.md` (twice), `README.md` (three places, including the check
   block's comment), `review-instructions.md` and `00-progress-ledger.md`. If
   15.1 is taken, the counts become fourteen folded, three D11 drops, one
   translator's note.
6. **1.1 (minor)** — record the X.1 comma removal in `continuity.md` and in the
   punctuation tally (five removed, not four).
7. **Optional, drafter's discretion** — 9.1 (X.9 "gravity"; the reviewer would
   leave it), 33.1 (X.33 em dashes round "our life"), 34.1 (X.34's inherited
   spaced dashes — record only, change nothing), 36.1 (X.36 "by him" →
   "beside him"), 36.2 (X.36 "some one" → "someone", or name it as following
   PG's letters).

Then steps 7 and 8: continuous flow read of v2, and `ACCEPTANCE.md` with the
accepted hash, the round applied, and anything left open.
