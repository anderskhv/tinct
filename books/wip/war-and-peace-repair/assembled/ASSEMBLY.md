# Assembled staged edition

- Output: `assembled/war-and-peace-modern-en.assembled.json` sha256 `0700e3ffc81a6cf2380dd9eea177652f67ad465fcae5491724e90269e68c20be`
- Baseline v2: `consistency/modern-en-consistency-candidate.json` sha256 `99ff04d45d06f0e50247243cf1cc5e6205938c1ee2961178df6b3d70f1212383`
- Accepted repair chapters merged (43): [168, 176, 191, 196, 209, 215, 217, 231, 236, 245, 252, 256, 258, 264, 265, 267, 274, 280, 282, 288, 290, 294, 297, 298, 299, 314, 315, 320, 321, 322, 327, 335, 338, 339, 340, 351, 353, 355, 357, 358, 360, 361, 363]
- Accepted French batches merged: [1, 2, 3, 4, 5, 6] → chapters (79): [1, 2, 3, 4, 5, 6, 7, 10, 12, 15, 16, 18, 19, 20, 21, 24, 26, 27, 28, 30, 31, 32, 37, 38, 39, 40, 41, 43, 48, 51, 53, 64, 66, 69, 72, 74, 76, 79, 85, 90, 97, 103, 111, 113, 115, 117, 121, 126, 127, 139, 146, 148, 150, 155, 169, 171, 186, 189, 197, 206, 207, 213, 235, 248, 255, 257, 262, 263, 266, 277, 278, 300, 302, 305, 307, 312, 313, 316, 326]
- Paragraphs overridden: 761 (repair 513, french 248)
- Not applied to any live edition file.

## Whole-edition checks on the assembled file (2026-09-18)

`books/edition_checks.py war-and-peace --candidate assembled/war-and-peace-modern-en.assembled.json`: **0 BLOCK**, 365 chapters, 11,340 paragraphs, paragraph counts identical to the source in every chapter. Remaining flags, all pre-existing and all in the "flags, not gates" class:

| Flag | Count | Where | Disposition |
|---|---|---|---|
| bracket-tag / footnote-slot-bare / footnote-orphan-marker | 0 | — | French convention applied across the edition (79 French-pass chapters + 7 drafted-overlap chapters) |
| title-sequence / title-duplicate | 32 / 7 | source-side: the final chapter of each Book carries the next Book's name | structural repair of all three editions together (queue A); modern-en titles mirror the source exactly |
| long-sentence (>50 words) | 836 | mostly chapters 1–153 (not yet scanned) and retained cumulative sentences | flag only; Gate A decides per chapter |
| near-verbatim | 24 chapters | ch 154–278 | see the similarity-gate note below |
| punct-parity | 10 | ch 28–113 (baseline v2, unscanned zone) and ch 296 | queue for the chapters 1–153 scan |
| ratio-low | 2 | ch49 p51, ch324 p19 | flag only; both under 0.70 by a few words |

`books/classify-modern-en.py war-and-peace --gate` (run against the assembled file through a scratch editions dir): **GATE FAIL**, identical in kind to the live edition on `origin/main` (which also fails). Weighted similarity 0.702 (gate ≤ 0.75, pass); identical long paragraphs 0.7 percent (pass); wrapped scaffolding 0 (pass); **light+mechanical 25/365 = 6.8 percent (gate ≤ 5 percent)** and **4 "truncated quotations"**. The four truncation hits (ch32 p110, ch51 p5, ch98 p5, ch286 p9) were read against the source: each is a stylistic ellipsis in a paragraph that is complete, not an elided quotation; false positives of the ellipsis heuristic. The 25 LIGHT chapters (similarity 0.85–0.94: 158, 168, 169, 170, 173, 175, 181, 183, 185, 255, 260, 261, 263, 265, 266, 267, 269, 270, 271, 272, 273, 274, 276, 277, 278) are the near-verbatim Maude zone. Nine of them have been through the two-gate procedure and passed Gate A on the accepted hash (168, 265, 267, 274 by drafting; 169, 255, 263, 266, 277, 278 by the French pass only, with the scan's Gate A PASS). This is a policy conflict between the classifier's "modern-en must differ from the source" rule and "repair only what needs repairing": recorded for Anders in `MODERN-EN-REPAIR-STATUS.md`.

## Changed-passage records

| File | Old | Paragraphs | Chapters |
|---|---|---|---|
| `changed-passages-vs-main.json` | `origin/main` (the live edition; b269fb96 was never merged) | 2,109 | 245 |
| `changed-passages-vs-b269fb96.json` | branch worktree file (the 16-batch fidelity repair) | 1,166 | 182 |
| `changed-passages-vs-baseline-v2.json` | baseline v2 (consistency pass) | 761 | 118 |

Record shape matches the `pending_audio_regen` key plus old/new sha256. Audio is not touched; Fish regenerates on demand once the edition is published. The character-card file (`app/public/data/characters/war-and-peace.v1.json`) pins per-paragraph hashes and mention offsets: the same records are its re-anchoring input.

**Not applied to any live edition file. Publication is Codex's step after Anders decides the similarity-gate question.**
