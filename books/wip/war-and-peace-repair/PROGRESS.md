# War and Peace — Modern English Repair — Progress Log

**Owner:** Claude (translation content agent), session branch `claude/friendly-albattani-qgyqfi`
**Scope:** Content only. No live edition files, app code, registry, audio, or defaults touched. All candidates staged under `books/wip/war-and-peace-repair/`.
**Started:** 2026-09-17

## Source & treatment

- Source: Aylmer & Louise Maude translation (public domain, Project Gutenberg #2600), 365 chapters, 561,695 words. `original-en` = this translation (already in readable English, like Jane Eyre — not archaic like Confessions).
- `modern-en` is NOT a passthrough. Random 15-chapter sample shows genuine modernization throughout (avg paragraph similarity 0.36–0.75, word ratios mostly 0.87–1.00). Same pattern as Jane Eyre: real work has been done, defects (if any) are local, not wholesale.
- Book's `books/war-and-peace/STATUS.md` (stale, references retired `kids-en`/`kids-da` schema and claims "0/365 chapters" for modern-en despite a full modern-en.json existing and being live — do not trust it as source of truth, confirmed by earlier reconnaissance in this session).

## Mechanical audit (2026-09-17) — full 365-chapter word-ratio scan

Ran myself (no agent needed for the mechanical pass): for every chapter, flagged any paragraph where a source paragraph ≥25 words has modern-en word count <85% of source. Computed % of paragraphs flagged per chapter.

- **Structural integrity: perfect.** 0 chapter/paragraph-count mismatches across all 365 chapters.
- **55 of 365 chapters have >15% of their paragraphs flagged** (full list in git history of this file / rerun the scan — scan script embedded in commit message). Two clusters:
  - **Scattered early flags:** chapters 6, 26, 29, 45, 49-53, 94, 102 — isolated, moderate flag rates (15-26%).
  - **Heavy concentration in chapters 217, 230-365** (Books Thirteen–Fifteen and both Epilogues — the last ~85 of 365 chapters, i.e. roughly the last quarter of the novel): flag rates climbing as high as 58-67% in some chapters (280, 288, 291, 300, 340, 354, 355). This strongly resembles the Jane Eyre pattern (damage concentrated in the book's tail — likely a generation run that degraded toward the end of the book), but at much larger scale.

**KNOWN LIMITATION carried forward from the Jane Eyre repair pass, applies with full force here:** word-ratio scanning only catches omission. It is structurally blind to invented text of equal-or-greater length than what it replaced. The 55-chapter list above is a LOWER BOUND on damage, not a complete map. Chapters outside this list have NOT been close-read and may still contain isolated invented/distorted paragraphs, exactly as happened repeatedly during Jane Eyre's repair (chapters flagged for 1 paragraph turned out to have 3; "sound" neighbors of flagged paragraphs turned out to have their own separate defects).

## Scope decision — honest given book size

At 365 chapters / 561,695 words, this book is ~14x the length of the largest single unit handled so far in this session (Confessions Book 10, 70 paragraphs) and ~9x Jane Eyre's 38 chapters. A Jane-Eyre-style "audit every chapter closely, fix everything found" pass is not realistic to complete in this session. Treatment:

1. Diagnostic close-read audit (Opus, in progress) of a representative sample from the heaviest-damage zone (chapters 280-365, the tail) plus a few scattered-flag chapters (6, 49-53) to characterize severity and decide whether the tail needs full re-render (Confessions-style) or targeted spot-repair (Jane-Eyre-style).
2. Repair the highest-value/highest-damage chapters first, following the same draft → independent review → correct → verify discipline as every other book in this project — but this will NOT reach full-book completion in this session. Progress will be recorded honestly per unit, same as every other book, and the session will hand off a clear "what's done / what's left" picture rather than a false completeness claim.
3. Danish not touched, per standing instruction.

## Repair units and status

(populated once the diagnostic audit returns and repair units are scoped)

## Models used

- Mechanical audit: direct Python script (no model)
- Diagnostic close-read audit: Claude Opus
- Drafting/correction: Claude Sonnet
- Independent review/verification: Claude Opus
