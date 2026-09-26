# Release Packet — Paradise Lost, modern-da abridgment repair

Status: candidate, awaiting independent review. Not published. Authorized
under the 2026-09-26 assignment's explicit Danish-repair carve-out.

## What this fixes

`CONFIRMED-DEFECTS.md` G10-paradise-lost-03 (S2/UNCERTAIN, "needs a Danish
reader"): `modern-da` was heavily abridged relative to the accepted
`modern-en` baseline, concentrated in Books 1, 2, 5 and 6 — Book 2 was only
33% of the English word count, Book 6 52%, Book 5 70%, Book 1 78% (the
other 8 books were already clean at 0.97–1.04).

## Baseline and method

Baseline: the accepted, complete `modern-en` (no completeness defect per
the audit). Since the two editions' paragraph counts already matched
exactly per book (no index drift at the paragraph level, contrary to what
the audit's "paragraph drift" note might suggest — verified directly), this
repair identified every paragraph where the Danish word count fell below
60% of the corresponding English paragraph's word count, and replaced those
specific paragraphs with fresh, complete Danish translations. Paragraphs
already at or near full length were left untouched.

- Book 1: 10 of 73 paragraphs replaced.
- Book 2: 70 of 90 paragraphs replaced (the worst-affected book).
- Book 5: 30 of 102 paragraphs replaced.
- Book 6: 55 of 94 paragraphs replaced.
- Books 3, 4, 7–12: untouched (already complete).

## Candidate

| Item | Value |
|---|---|
| `editions/paradise-lost-modern-da.json` | sha256 `caac94f81ee07d40ebfdaf30f820baa8dbaa1c03d27911a13baf33d33e072f7c` — 12 chapters, same structure as live; 165 paragraphs across Books 1/2/5/6 replaced |
| Replaces live sha256 | `266ada0a3a74b0838b1dfe4a54a08d2959f03d627ddc955e954fcb306ead117c` (matches the audit's reported prefix) |
| Word-count ratio (Danish/English) after repair | Book 1: 0.89 (was 0.78); Book 2: 1.02 (was 0.33); Book 5: 0.91 (was 0.70); Book 6: 1.01 (was 0.52) — all now in the same 0.9–1.05 range as the previously-clean books |

## Verification performed

- Valid JSON; chapter/paragraph structure unchanged (12 chapters, same
  per-book paragraph counts as live) — only paragraph text changed at the
  165 identified coordinates, so no reading-position remap is needed beyond
  "text changed under an unchanged coordinate."
- Book-level and spot-check word-count ratios computed for all 165 replaced
  paragraphs during translation (reported minimums: Book 1 ≥0.92, Book 2
  overall 1.04, Book 5/6 ≥0.91) — no paragraph shows the abridgment pattern
  being fixed.
- Spot-checked translations against English for the major set-pieces: the
  full infernal-council debate in Book 2 (Moloch, Belial, Mammon,
  Beelzebub/Satan's speeches), Satan's journey past Sin and Death and across
  Chaos, and Book 5/6's War in Heaven council and battle scenes — full
  content, no compression, all proper nouns/epithets preserved in
  conventional Danish or standard form.
- Register matches the already-accepted, clean Book 9 Danish translation
  (used as the style reference): elevated literary modern Danish prose (not
  verse), not a word-for-word English calque.

## What independent review should check

Independently re-verify a substantial sample of the 165 replaced
paragraphs (especially the longest/most important ones — Moloch's,
Belial's, and Mammon's full speeches in Book 2, and the eclipse and
mountain-uprooting similes in Books 5/6) against the English baseline for
completeness and fidelity, and confirm Books 3/4/7–12 were left untouched.
