# Acceptance Record — The Sorrows of Young Werther (modern-en)

**Book ID:** `werther` (Goethe, *The Sorrows of Young Werther*)
**Edition:** `modern-en` — modern-English reading edition
**Structure:** 84 chapters (Preface; 82 dated epistolary letters; "The Editor
to the Reader" closing narrative), 354 paragraphs total.

## Source

`books/wip/green-werther/source.json` = the public-domain English
translation used as the locked fidelity anchor (mirrors
`app/public/data/editions/werther-original-en.json`). The translator is not
identified in `source.json` itself; no attribution metadata is present in
the file to credit. A German original (`werther-original-de.json`) also
exists among the app's editions but was not used as the anchor for this
review — per protocol, translation work is anchored to one identified
English source edition only.

## Candidate origin

Staged from the live app's modern-en edition files at
`books/wip/green-werther/candidate.json`. A separate staging directory,
`books/wip/werther/`, also exists from an earlier drafting effort; it was
independently confirmed byte-identical to the live modern-en file before
this review began, so it is not a separate content source — both point to
the same drafted text.

## Review coverage

| Stage | Scope | Result |
|---|---|---|
| Structural check | 84 chapters / 354 paragraphs, JSON validity, chapter numbering, paragraph-count parity with source | Pass |
| Round-1 accessibility review | All 84 chapters, full text, blind (candidate only, no source consulted) | Substantially accessible; unglossed period/currency terms (kreutzer, florins, ducats, duodecimo) and allusions (Melusina, Klopstock, Good Samaritan, Emilia Galotti) flagged as the only stumbling points |
| Round-1 fidelity review | All 354 paragraphs, in 4 packet files (Parts A–D), source vs. candidate, with neighboring context | 1 blocking defect (Ch. 84 para 87 — unlicensed "God's grace" simile addition) + 3 non-blocking notes (Ch. 23 para 1 invented garment detail + currency swap; Ch. 48 para 1 title downgrade "Chancellor"→"court councillor"; Ch. 64 final para added clause) |
| Fix pass | 4 flagged paragraphs corrected via `safe_replace`-equivalent exact-match edits | All 4 fixes applied |
| Fix verification (this pass, Part 1) | Ch. 23 p.1 (idx 1), Ch. 48 p.1 (idx 1), Ch. 64 final para (idx 6), Ch. 84 para 87 (idx 87) re-derived directly against `source.json` | All 4 confirmed clean: garment invention removed and "thalers"→"crowns" reverted; "court councillor"→"Chancellor" reverted (placeholder letters R—/J— left as harmless variants, as the review's optional-fix note allowed); added "She trusts me so!" clause removed, text now matches source exactly; the unlicensed "God's grace... holy and visible signs" simile fully removed, ending now paraphrases source's plain "grew fainter, and were at length effaced" with no added content |
| Accessibility glosses (this pass, Part 2) | Light in-line glosses applied at first occurrence for the 4 flagged currency/format terms, the Melusina allusion, and the Good Samaritan and Emilia Galotti references in Ch. 84 | 7 paragraphs edited (see list below); Klopstock (Ch. 12) left unglossed — the round-1 review flagged its ambiguity as likely deliberate (period readers vs. modern readers), and the existing text already glosses it one clause later ("At once I knew the magnificent ode in her mind") |
| Final whole-book fidelity re-read (Part 3, protocol step C) | All 84 chapters / 354 paragraphs read in full, source vs. candidate, side by side, in original order, for cross-boundary consistency (emotional arc, self-deception preserved, voice distinction, register shift in Ch. 84) | No new defects found; emotional arc, character voice distinction, and the letters→editorial register shift in Ch. 84 all hold up across the whole book |
| Fresh whole-book accessibility read (Part 3) | Candidate read in full during the same pass; confirmed the 7 gloss insertions read naturally in context and found no additional unglossed stumbling terms beyond those already identified in round 1 | Clean |
| Structure re-validation after edits | 84 chapters, 354 paragraphs, no empty/whitespace-only paragraphs, chapter numbering intact | Pass |

## Defect counts by round

- **Round 1 fidelity:** 1 blocking, 3 non-blocking (all 4 fixed and
  re-verified clean in this pass).
- **Round 1 accessibility:** 0 blocking; 8 flagged terms/allusions (7 now
  glossed; 1 — Klopstock — deliberately left as-is, see below).
- **This pass (final verification + whole-book re-read):** 0 new defects
  found, fidelity or accessibility.

## Deliberately preserved / not glossed

- **Klopstock (Ch. 12).** Left unglossed. The round-1 accessibility review
  flagged this as likely deliberate ambiguity — period readers would catch
  the reference instantly, modern readers are meant to feel Werther's
  excess a little from outside — and the sentence already glosses "a
  magnificent ode" one clause later. Adding an explicit gloss risked
  resolving an effect the source itself leaves implicit.
- **Ossian recitation (Ch. 84, paras 458–481 whole-book numbering).** Left
  as a distinct, more elevated register within the story (Werther
  performing his own translation of an older poem) — flagged in round 1 as
  dramatically correct, not a defect, and not altered here.
- **Ch. 48 placeholder-letter variants (N—→R—, I—→J—).** Left as-is per the
  round-1 review's own note that these carry no factual content (they are
  the book's standard device for suppressing real names); only the
  substantive title ("Chancellor") was restored.

## Paragraphs touched in this pass (Part 2 glosses only — Part 1 fixes were
already applied before this pass began)

1. Ch. 10, paragraph index 0 — kreutzer gloss.
2. Ch. 20, paragraph index 0 — florins gloss.
3. Ch. 50, paragraph index 0 — ducats gloss.
4. Ch. 37, paragraph index 0 — duodecimo gloss.
5. Ch. 4, paragraph index 0 — Melusina gloss.
6. Ch. 84, paragraph index 109 (whole-book) — Good Samaritan parable gloss.
7. Ch. 84, paragraph index 118 (whole-book) — Emilia Galotti gloss.

All edits made with exact-match, scoped string replacement (equivalent to
`content_edit_helpers.safe_replace`), reading the paragraph's exact current
text from `candidate.json` before each edit. Structure validated (chapter
count, paragraph count/order, no empty paragraphs) after edits.

## Final hash

```
sha256sum candidate.json
a87ec745866e26592189703bd0ef6cc13c957040ccc6c96ffef87ec8b602ada3  candidate.json
```

**Date:** 2026-09-21

**Verdict: ACCEPTED.** All review stages (structural, round-1 accessibility,
round-1 fidelity, fix pass, fix verification, final whole-book fidelity
re-read, final whole-book accessibility read) are complete and clean as of
the hash above. No further edits were made to `candidate.json` after this
hash was computed.
