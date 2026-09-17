# Confessions — Modern English Repair — Progress Log

**Owner:** Claude (translation content agent), session branch `claude/friendly-albattani-qgyqfi`
**Scope:** Content only. No live edition files, app code, registry, audio, or defaults touched. All candidates staged under `books/wip/confessions-repair/`.
**Started:** 2026-09-17

## Source & treatment

- Source: `original-en` = Pusey (1838) translation, public domain, correctly attributed in `bookRegistry.ts` ("Pusey (1838)", translator Edward Bouverie Pusey, year 1838).
- Treatment: genuine modernization (not light word-swap). See CLAUDE.md session instructions for the full quality standard.
- 13 books total. Structural check: paragraph counts match `original-en` exactly in every book (no missing content structurally).

## Audit finding (2026-09-17, whole-book similarity scan)

Per-paragraph `difflib` similarity between `original-en` and current `modern-en`, all 13 books:

| Book | Paragraphs | Avg similarity | Near-identical | Verdict |
|---|---|---|---|---|
| 1 | 38 | 0.354 | 4/38 | genuinely modernized |
| 2 | 18 | 0.198 | 0/18 | genuinely modernized |
| 3 | 21 | 1.000 | 21/21 | **untouched passthrough — needs repair** |
| 4 | 31 | 1.000 | 31/31 | **untouched passthrough — needs repair** |
| 5 | 25 | 1.000 | 25/25 | **untouched passthrough — needs repair** |
| 6 | 27 | 1.000 | 27/27 | **untouched passthrough — needs repair** |
| 7 | 27 | 0.163 | 0/27 | genuinely modernized |
| 8 | 31 | 1.000 | 31/31 | **untouched passthrough — needs repair** |
| 9 | 38 | 1.000 | 38/38 | **untouched passthrough — needs repair** |
| 10 | 70 | 1.000 | 70/70 | **untouched passthrough — needs repair** |
| 11 | 41 | 0.242 | 0/41 | genuinely modernized |
| 12 | 42 | 1.000 | 42/42 | **untouched passthrough — needs repair** |
| 13 | 53 | 1.000 | 53/53 | **untouched passthrough — needs repair** |

9 of 13 books (3,4,5,6,8,9,10,12,13 — 396 of 462 paragraphs) need genuine modernization. Books 1, 2, 7, 11 are sound existing prose — preserve, do not rewrite.

**Danish (`modern-da`):** not touched this session per instruction. Will need re-translation from the repaired `modern-en` once books are accepted — flagged for later, not started.

## Book-by-book status

| Book | Draft (Sonnet) | Independent review (Opus) | Corrected | Verified | Accepted |
|---|---|---|---|---|---|
| 3 | frozen (sha256 9598b9ba…) | done — 53 findings (6 major, 12 moderate, 35 minor) | done — 18/21 paragraphs edited | done — 6/6 majors confirmed fixed; 5 new clause-level issues found and fixed directly (no further round) | **accepted** (sha256 c7a80e65…) |
| 4 | frozen (sha256 e5dd8853…) | done — 27 findings (1 major, 6 moderate, 20 minor; review's own summary table had an arithmetic error, 18→20) | done — 19/31 paragraphs edited | done — major + all 6 moderates confirmed fixed; 1 trivial spelling inconsistency found and fixed directly | **accepted** (sha256 52e0f9fc…) |
| 5 | frozen (sha256 810b5a38…) | done — 21 findings (1 major, 4 moderate, 16 minor); question-mark parity independently confirmed 18/18 | done — drafter's own change-list was wrong (cited nonexistent indices 25/26/28, missed idx 20); diffed the files directly: 16/25 paragraphs actually changed | done — major + all 4 moderates confirmed; paragraph 20's undocumented edit verified genuine (single-token quote-style fix, matches Mo4, matches source's own punctuation) | **accepted** (sha256 40c8f607…) |
| 6 | frozen (sha256 73bb3730…) | done — 32 findings (1 major, 3 moderate, 28 minor); question-mark parity independently confirmed 31/31 per-paragraph (drafter's own total of "32/32" was a notes arithmetic error) | done — 19/27 paragraphs changed, independently diffed and confirmed matching corrector's own claim | done — major + all 3 moderates confirmed, zero collateral edits (word-level diff traced every change to a finding); one ungrammatical seam in the review's own proposed wording (para 8) found and fixed directly | **accepted** (sha256 70b98614…) |
| 8 | frozen (sha256 50155610…) | done — 14 findings (2 major, 3 moderate, 9 minor); question-mark parity independently confirmed 54/54; "serenity"→"certainty" interpretive choice rejected (analysis below) | done — 13/31 paragraphs changed, independently diffed and confirmed matching corrector's claim exactly | done — both majors + all 3 moderates confirmed, zero collateral edits, whole-chapter intensity confirmed intact | **accepted** (sha256 55319d3f…) |
| 9 | frozen (sha256 76800a80…) | in progress (Opus) | — | — | — |
| 10 | queued | — | — | — | — |
| 12 | queued | — | — | — | — |
| 13 | queued | — | — | — | — |

## Book 3 — editorially accepted (2026-09-17)

- Candidate: `book03-candidate.json`, sha256 `9598b9ba4b1d1fec1f6d1ec2353a486ea244797d5f5d726232ab1d1017860e6e` (Sonnet draft, frozen).
- Review: `book03-review.md` — Opus, 53 findings (6 major, 12 moderate, 35 minor), packet-by-packet + whole-chapter read.
- Corrected: `book03-corrected.json`, `book03-corrections-log.md` — Sonnet, 18/21 paragraphs edited, all 6 majors + 4 flattened questions + systemic interpretive-connective additions fixed.
- Verification: `book03-verification.md` — Opus, independently re-derived from source (not drafter's log). All 6 majors confirmed fixed. Found 5 newly introduced issues (1 moderate blocking, 4 minor) plus 2 partial residuals (F8, F38) and one factual error in the corrections log's own reasoning (harmless — conclusion still correct).
- Final: `book03-accepted.json`, sha256 `c7a80e65a5c83b205f7808bfb05cdb2ba8472595dd0624482471cdd072716793` — the 5 verification-flagged clauses fixed directly (single-clause, source-anchored, no further review round per verifier's own recommendation). See `book03-final-fixes.md`.
- **Scope of "accepted":** this book only, one of 13 in Confessions. Not a whole-title acceptance. Verifier flagged two systemic drafting habits (flattened rhetorical questions; added interpretive connectives closing source ambiguity) as a standing watch-item for Books 4–13 — future review passes should check for these specifically, not assume they're isolated to Book 3.
- Danish (`modern-da`) not touched — flagged for later re-translation once more of the title is repaired.

## Book 4 — editorially accepted (2026-09-17)

- Candidate: `book04-candidate.json`, sha256 `e5dd88538342b951d5b3493d7f6f1919e2adbfd1f9ab32d9f617d5aecb37eb05` (Sonnet draft, frozen).
- Review: `book04-review.md` — Opus, 27 findings (1 major, 6 moderate, 20 minor — review's own summary table undercounted minors as 18, verifier caught and corrected the arithmetic).
- Corrected: `book04-corrected.json`, `book04-corrections-log.md` — Sonnet, 19/31 paragraphs edited: referent inversion in para 13, both flattened rhetorical questions restored (paras 9, 20 — despite the drafter's own notes falsely certifying no questions were flattened), imperative + quantifier error fixed (para 16), Hierius thread reconnected (para 22), phantasma consistency (paras 8/11), 20 minor fixes.
- Verification: `book04-verification.md` — Opus, independently re-derived every changed span from source rather than trusting the log. Major + all 6 moderates confirmed fixed. One trivial theater/theatre spelling inconsistency found, fixed directly (no further round needed).
- Final: `book04-accepted.json`, sha256 `52e0f9fc581c8045558b6f6ef2330651f1c33c04f2ae7a7a392b04e30151085f`.
- **Carry-forward finding:** drafter self-certification of "no flattened questions" was false in both Book 3 and Book 4. Per-paragraph question-mark parity against source is now a standing blocking mechanical gate for every future candidate and corrected file — do not trust drafter self-report on this.
- Danish not touched.

## Book 5 — editorially accepted (2026-09-17)

- Candidate: `book05-candidate.json`, sha256 `810b5a38410ea7684bf4bb3e17abab3de05fee38a70e69d99625a38d1960c67c` (Sonnet draft, frozen). Question-mark parity 18/18 achieved on first draft — the Book 3/4 flattening regression did not recur, confirming the carry-forward gate works.
- Review: `book05-review.md` — Opus, 21 findings (1 major, 4 moderate, 16 minor), including independent question-mark re-count. Major + 1 moderate were direction-inversions (source's stated position flipped) in paragraphs the drafter had not self-flagged as risky.
- Corrected: `book05-corrected.json`, `book05-corrections-log.md` — Sonnet, 16/25 paragraphs changed. **Process defect caught:** the drafter's own change-list report cited nonexistent paragraph indices (25/26/28 in a 25-paragraph file) and omitted an actually-changed paragraph (20). Caught by diffing the JSON directly rather than trusting the log — now standing practice.
- Verification: `book05-verification.md` — Opus, re-derived the true diff set independently (matched mine exactly), gave paragraph 20 priority scrutiny since it was undocumented — confirmed genuine (single-token quote-style fix required by the whole-file quote-convention finding, and matches Pusey's own punctuation). Major + all 4 moderates confirmed.
- Final: `book05-accepted.json`, sha256 `40c8f607927859ccc5586fbb462447193c79cabde308ea5b9311faeadbb206c2`.
- **Standing practice, carried forward:** never trust a drafter's or corrector's self-reported change-list — diff the JSON files directly, every time, for every book.
- Danish not touched.

## Book 6 — editorially accepted (2026-09-17)

- Candidate: `book06-candidate.json`, sha256 `73bb3730f7ce0ac95dc4d652c0607fef9de6ff683f7ce7424e19db7d56fc6ae7` (Sonnet draft, frozen).
- Review: `book06-review.md` — Opus, 32 findings (1 major, 3 moderate, 28 minor). Major was a 4th occurrence of the direction-inversion defect class (Books 4, 5, 6) — in a paragraph the drafter had explicitly polarity-checked but still missed.
- Corrected: `book06-corrected.json`, `book06-corrections-log.md` — Sonnet, 19/27 paragraphs changed (independently diffed by the orchestrator, confirmed exact match to the corrector's own claim — first clean self-report in this project after two prior books had reporting errors).
- Verification: `book06-verification.md` — Opus, re-derived diff set exactly, confirmed major + all 3 moderates fixed, word-level diff confirmed zero collateral edits (every change traces to a numbered finding). Found one ungrammatical seam — inherited from the review's own proposed wording, not invented by the corrector — in paragraph 8.
- Final: `book06-accepted.json`, sha256 `70b98614c8b54fe8eec3222e4f6a681143d8086f34b41a429acac4744b70af4d` — the paragraph 8 seam fixed directly.
- Danish not touched.

## Book 8 — editorially accepted (2026-09-17)

The conversion book — highest-stakes chapter reviewed so far.

- Candidate: `book08-candidate.json`, sha256 `50155610c6ac2bf48c8ee5c4b0b0af76ca0b43d209ff8da13d1ff46e9390d946` (Sonnet draft, frozen). Question-mark parity 54/54 achieved after drafter caught and self-corrected two compressed rhetorical-question pairs on its own mechanical check.
- Review: `book08-review.md` — Opus, 14 findings (2 major, 3 moderate, 9 minor). Both majors were direction-inversions in the two most consequential sentences in the book: the two-wills argument's own conclusion (para 22) and the closing clause about Monica's joy (para 31, wrongly attributed to grandchildren, contradicting the preceding clause). Reviewer also rejected the drafter's flagged "serenity"→"certainty" interpretive substitution near tolle-lege with a textual argument (Augustine already has certainty per paras 1/13/19; the deficit resolved at tolle-lege is affective peace, not more certainty).
- Corrected: `book08-corrected.json`, `book08-corrections-log.md` — Sonnet, 13/31 paragraphs changed (independently diffed by the orchestrator, confirmed exact match). Both majors fixed, all 3 moderates fixed including restoring "peace" in place of "certainty", 8/9 minors applied.
- Verification: `book08-verification.md` — Opus, re-derived diff set exactly, confirmed both majors + all 3 moderates fixed against source, zero collateral edits, whole-chapter read confirmed the garden weeping / two-wills imagery / tolle-lege scene all land at full intensity with no new seams.
- Final: `book08-accepted.json`, sha256 `55319d3f8939e9e7504eed1e393c0e0a89c86645bb61d9ed5214efd294de6719`.
- **Out-of-scope defect found, not fixed:** the live `app/public/data/editions/confessions-original-en.json` itself contains "often years" where it should read "ten years" (Book 8, likely an OCR error from the 1838 scan) — confirmed present in both the live file and our staged source copy. This is a live-edition file, out of scope for this content-only repair work; flagging for whoever owns that file. Our accepted Book 8 text deliberately keeps "ten years" (the evidently correct reading) rather than propagating the source typo, per the review's explicit recommendation — noted as a documented divergence from the (flawed) locked source, not a silent one.
- Danish not touched.

## Next action

Move to Book 9 (next untouched-passthrough book): draft → independent review → correct → verify. Standing gates: question-mark parity against source (mechanical, independently counted), direct JSON diffing for all change-list claims (never trust agent self-report), extra scrutiny on comparisons/causal claims/stated positions for direction-inversion (now confirmed in every one of Books 4, 5, 6, 8 — the dominant defect class in this project).

## Models actually used

- Drafting: Claude Sonnet (via Agent tool, `model: sonnet`)
- Independent review: Claude Opus (via Agent tool, `model: opus`) — to be run per book after drafting
- No paid Anthropic API calls used (agent-conversation generation only, per instruction).
