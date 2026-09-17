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

## Diagnostic close-read audit (2026-09-17) — full findings

The mechanical 85%-ratio scan above was too loose (produces ~75% false positives on this book — Maude's Victorian prose legitimately compresses 5-15% under modernization). A close-read audit rescanned at <70% (real-damage territory) and close-read representative chapters. Findings:

**Real damage is narrowly concentrated in chapters 333–365 (33 chapters, Book Fifteen's essayistic chapters + both Epilogues), NOT the full 230-365 zone the mechanical scan suggested.** Chapters 230-323 (~94 chapters) are sound — close-read of the 4 worst-ratio chapters in that zone (280, 288, 291, 300) confirmed faithful modernization in every case.

**Failure mode: content-type-selective summarization, not run degradation.** The generator handled 330 chapters of narrative/dialogue reliably, then began summarizing (not translating) Tolstoy's long argumentative/philosophical paragraphs once the book turned into sustained philosophy-of-history essay (~ch 333 onward). Damage scales with paragraph length (0.1% severe-paragraph rate at <50 words, 3.3% at 300-349 words). Within damaged chapters, short narrative paragraphs are fine; only the long essayistic ones are gutted. NOT a gradual degrading-run pattern (ratios wobble, don't slide; the final chapters 363-364 are clean; worst chapter is 355, mid-book).

Specific defects found (severity: this is Tolstoy's central philosophical argument, not incidental prose):
- Ch 355 (worst in book, 1605→1025 words): 4 severe paragraphs. Drops the Thiers/Lanfrey historiography contrast and its conclusion; drops the Gervinus/Schlosser example + closing chiasmus, replaced with an invented summary clause; a real meaning inversion ("contradict themselves" → "is precisely the same thing... said"); and the single worst deletion found — Tolstoy's famous two-part satirical explanation of why historians overrate intellectual history, entirely removed.
- Ch 340: a direction inversion (movement's origin) plus removal of Tolstoy's entire moral indictment of Napoleon ("deceptions, robberies, and murders" replaced with anodyne "develop a leader").
- Ch 357: a straight inversion ("historians reply..." → "historians have no answer") plus deletion of a 50-year list of power transfers and its conclusion.
- Ch 361: a whole-paragraph substitution that reverses the argument's logical role.
- Ch 362: deletion of 7 consecutive illustrative examples plus an invented replacement sentence.
- Ch 353: a small but real invented plot event ("and he did" — Pierre contradicting Natasha — not in source).
- Ch 354, 359, 365: one severe paragraph each, same pattern (argument/example deleted, sometimes replaced with invented filler).
- Ch 356, 363: flagged by ratio scan but confirmed SOUND on close read — ratio flags are not self-validating even inside the damaged zone.

**Separate structural defect (previously unflagged): paragraph-alignment drift in 21 chapters.** Paragraph *counts* match everywhere (0 structural mismatches), but in these chapters content gets merged into one modern-en paragraph then re-split later, so modern paragraph index i corresponds to a DIFFERENT source paragraph than index i for a stretch: chapters 5, 19, 22, 31, 51, 55, 97, 100, 111, 142, 150, 172, 194, 204, 215, 236, 326, 336, 349, 350, 358. This breaks the app's paragraph-aligned split-pane reading view for these stretches (out of scope for me to fix in app code, but the CONTENT-side fix — re-splitting modern-en to match source paragraph boundaries — is content work). **Ch 358 has actual content loss from this**: the final source paragraph (Tolstoy's two numbered conditions on the necessity of historical events) falls off the end of a drift run and is completely missing from modern-en, not just misaligned.

**Cosmetic but reader-visible: character-name transliteration inconsistency across chapter boundaries** (looks like generation-batch seams, concentrated in EARLY chapters, unrelated to the tail damage): "Andrei" vs "Andrew" (Prince Andrew renamed mid-book in chapters 4-5, 25-27, 37, 64-65, 212 — 82 occurrences vs 958 "Andrew"), "Kutúzov" vs "Kutuzov" (chapters 38, 40-42), "Hélène" vs "Helene" (chapters 2-4, 50-51), "Nikolai" vs "Nicholas" (chapters 25, 28, 32, 36, 77, 279, 283, 308), "Marya" vs "Mary" (chapters 18-20, 151-167, 236, others). No actual renaming/garbling of characters — same person, inconsistent spelling choice, chapter-internally consistent.

**Also flagged, pre-existing, not a translation defect:** chapter titles 337 and 353 are mislabeled in the SOURCE file itself (says "First Epilogue — Chapter 20" while chapter 337 is actually in Book Fifteen; ch 353 says "Second Epilogue" but is First Epilogue 16) — both `original-en` and `modern-en` carry the same wrong title, a parsing artifact from original ingest. Not fixed here (would require touching the live original-en file, out of scope) — flagged for the content/app owner.

**`modern-da` not examined** — may share the same tail defect, worth scanning before any Danish work (which is out of scope for this session regardless, per standing instruction).

## Scope decision, revised with real data

Given the close-read audit: ~22-25 of the flagged chapters need real repair (all within 333-365), not the ~85 the mechanical scan suggested. This is now a bounded, realistic scope:

1. **Chapters 333-365 (33 chapters):** re-render from scratch, paragraph-for-paragraph, with explicit instruction to preserve every named example, numbered list, and concrete illustration in Tolstoy's essayistic passages — no summarization. This is the highest-value fix (it's Tolstoy's central argument).
2. **21 drift chapters:** re-split modern-en paragraph boundaries to match source. Ch 358's lost final paragraph must be restored as part of this.
3. **Name consistency:** mechanical normalize (Andrei→Andrew, Kutúzov→Kutuzov, Hélène→Helene, Nikolai→Nicholas, Marya→Mary) — safe, bounded, done below.

Given this session's remaining scope, item 3 is completed now (mechanical, low-risk, high reader-value). Items 1 and 2 are scoped and documented in detail above for continuation — 33 chapters of Tolstoy's densest philosophical prose is a substantial drafting task on its own (each needs the same draft→independent-review→correct→verify cycle used throughout this project) and is not something to rush through in the time remaining in this session. Recorded here as the next concrete action, not attempted partially.

## Repair units and status

| Unit | Status |
|---|---|
| Name-consistency mechanical normalization | **done** — `modern-en-name-normalized.json`, sha256 `06811d9d3cba80f54aceef3e877914809db61423797fd6da5f73562e73c8d271`. Whole-word regex replace (Andrei→Andrew 82, Kutúzov→Kutuzov 31, Hélène→Helene 45, Nikolai→Nicholas 12, Marya→Mary 113), verified: 365/365 chapter count match, all 365 per-chapter paragraph counts match source exactly (no structural drift introduced), zero remaining instances of any of the 5 inconsistent spellings. This is a full-file candidate (not per-chapter) — safe to promote as-is since it only touches 5 specific name strings, nothing else. |
| Batch A re-render (ch333-340) | **accepted** — `tail-batchA-accepted.json`, sha256 `25780e8cd683e1996e1c9ae0e690f0c8d1ca1144daf3fde41b157cf3df539999`. Review found 1 major, 2 moderate, 7 minor — all in narrative chapters 334-335 (a referent swap breaking a plot thread, a pronoun inversion, a dropped closing sentence). The 3 essay chapters (338-340, highest risk) came back completely clean: zero findings at moderate+, all 4 specific content-preservation claims confirmed, zero inversions across 19 argumentative constructions checked. 3 fixes applied directly and independently confirmed. |
| Batch B re-render (ch341-352) | drafted, `tail-batchB-candidate.json` — review in progress |
| Batch C re-render (ch353-365) | **accepted** — `tail-batchC-accepted.json`, sha256 `15fba6bb76c5060e14402b745d2236cf5986339f7f5a9e010266c08223a72c0f`. All 12 originally-documented defects (the worst-damaged zone in the book) confirmed genuinely fixed: Thiers/Lanfrey contrast, Gervinus/Schlosser + chiasmus, the book's single worst deletion (the two-part satirical explanation of why historians overrate intellectual history), the 50-year power-transfer chronology, all 7 illustrative examples in ch362, etc. But the reviewer's own independent read found 12 MORE issues beyond original scope: 2 major (an agent inversion in ch357 reversing who arrested whom, and a conditional flip in ch365's opening sentence that made the novel's closing chapter self-contradict in its first line), 1 moderate, 9 minor/trivial (including two proper-noun spelling inconsistencies with the rest of the book). All 12 fixed directly with source-confirmed text, verified: structural integrity + question-mark parity intact, exactly 12 paragraphs changed. Important process finding, carried forward: paragraph-count and question-mark parity cannot detect agent inversions or flipped conditionals — every batch needs a full independent paragraph-by-paragraph read regardless of a clean structural diff. |
| 21-chapter paragraph-alignment drift fix (incl. ch358 lost paragraph) | scoped, not started — next action after batch B accepted |

## Models used

- Mechanical audit: direct Python script (no model)
- Diagnostic close-read audit: Claude Opus
- Drafting/correction: Claude Sonnet
- Independent review/verification: Claude Opus
