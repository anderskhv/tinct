# Release Packet — Jerusalem, modern-da whole-edition repair

Status: candidate, awaiting independent whole-edition review. Not
published. Explicitly authorized (Danish repair for Jerusalem named
directly in the assignment).

## What this fixes

The live Danish `modern-da` (18 chapters, 1787 paragraphs) had the same
structural split-quote defect the accepted English whole-edition repair
(`books/wip/jerusalem-completeness-repair/`) fixed: a parsing error split
one source chapter into a spurious 18th chapter, truncating chapter 9
mid-quote ("...er ENHED, ENHED!«") and starting a fake chapter 10 titled
"Enhed, enhed."

Beyond the structural fix, this repair also found that the Danish text
carried the SAME drop-and-fabricate content defect the English repair's
independent reviewers found and fixed — both at the exact locations
already known from the English review (chapter 3 paragraphs 16/35/36,
chapter 5 paragraphs 16/17/38-60 — 28 paragraphs), AND at 33 further
locations discovered by this repair's own whole-edition fidelity pass
that were not part of the known English-repair defect list (the Danish
translation evidently inherited these independently, or the Danish
translator's source had similar issues — not established which).

## Method

1. **Structural fix**: merged old chapter 10 into chapter 9 per
   `books/wip/jerusalem-completeness-repair/PARAGRAPH-MAP.json`,
   renumbered old chapters 11-18 down to 10-17, completed the split quote
   ("...er ENHED, ENHED, ENHED!«"), corrected the `sections` array
   ("Book Three" now `[9..17]`, was `[9..18]`).
2. **Targeted fidelity check** at the 28 paragraphs already known from the
   English repair's review history to have been drop-and-fabricate
   defects in the OLD English — checked whether Danish (translated
   independently, presumably before or alongside the old defective
   English) carried the same defect. It did, at all 28 locations. All 28
   retranslated fresh from the corrected English.
3. **Whole-edition fidelity sample**: a 100%-coverage automated
   length-ratio and digit-token scan across all 1787 paragraphs, plus a
   manual stride sample of ~25% (453 paragraphs) across all 17 chapters.
   Combined, this found **30 more severely truncated/fabricated
   paragraphs** (caught by the length-ratio scan, scattered across
   chapters 1, 3, 4, 5, 6, 7, 8) and **3 more subtler defects** (similar
   length but fabricated details — a dropped inheritance detail, a
   fabricated destination/count for two characters sent away, a
   fabricated physical description) found only by the manual read. All
   33 retranslated fresh from the corrected English.

**Total: 61 of 1787 paragraphs retranslated** (28 known + 30 from the
automated scan + 3 from the manual sample).

## Candidate

| Item | Value |
|---|---|
| `editions/jerusalem-modern-da.json` | sha256 `d1532785ab04f9f8fc70d1f77293b964ef273d93acb763624061f93beb62a69f` — 17 chapters, 1787 paragraphs, matching the accepted `jerusalem-modern-en.json` structure exactly |
| Replaces live sha256 | `c1552e9a9a3a311b75e1d83ee104ff33c71c1a538bf68fd4bfd5d4f000a78223` (18 chapters, 1787 paragraphs) |

Per-chapter paragraph counts verified programmatically to match
`jerusalem-modern-en.json` exactly across all 17 chapters (308, 63, 42,
202, 65, 149, 122, 236, 86, 95, 18, 20, 43, 112, 110, 21, 95 — total
1787). `sections` array corrected.

## What independent review should check

1. The merge seam (completed quote, no repetition/discontinuity) —
   independently re-derive from the corrected English.
2. All 61 retranslated paragraphs against the corrected English, for
   completeness and absence of remaining fabrication — this is the exact
   defect class the whole assignment targets, so apply full scrutiny, not
   a light pass.
3. A fresh, independent whole-edition fidelity sample of the REMAINING
   ~1726 untouched paragraphs (this package's own sample was ~25-30%
   manual plus 100% automated length/digit scan — independent review
   should not simply trust that scan's threshold choice; spot-check a
   meaningfully different sample, including some paragraphs the automated
   scan would have passed as "above threshold," to check for subtler
   fabrications the length heuristic can't catch).
4. Confirm final structure (17 chapters, 1787 paragraphs, `sections`
   corrected) matches the accepted English exactly.

## Scope note

Jerusalem is one of the books named directly in this assignment's Danish
authorization; no further scope decision is needed for this book
specifically. This package does not address `modern-da` for any other
book.
