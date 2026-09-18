# Whole-edition checks on the assembled file — 2026-09-18 (final for this session)

Assembled file: `war-and-peace-modern-en.assembled.json`, sha256 `3de767a73d7b065a4330d507f9d6f620026e6f471bcafd762fc9e3a6f7c7fc4c`. 47 accepted repair chapters (hash-checked against `repair/ACCEPTED.md`), 79 French-pass chapters (6 batches + marker and cue sweeps), 17 gloss slots normalised to the `* ` form. `ASSEMBLY.md` is rewritten by `assemble.py` on every run; this file holds the check results.

## `books/edition_checks.py war-and-peace --candidate assembled/…`

**0 BLOCK**, 365 chapters, 11,340 paragraphs, counts identical to the source in every chapter.

| Flag | Count | Where | Disposition |
|---|---|---|---|
| bracket-tag / footnote-slot-bare / footnote-orphan-marker / inline-marker-with-slot | 0 | — | French convention applied edition-wide; every slot paragraph begins `* ` |
| title-sequence / title-duplicate | 32 / 7 | source-side (final chapter of each Book carries the next Book's name) | structural repair of all three editions together (queue A); modern-en mirrors the source |
| long-sentence (>50 words) | 836 | Tolstoy's long sentences, retained where Gate A passed them | flag only |
| near-verbatim | 24 chapters | ch 154–278 | similarity note below |
| punct-parity | 10 | ch 28, 29, 32, 35, 53, 54, 69, 82, 113, 296 | all ten chapters passed Gate A; flag only |
| ratio-low | 2 | ch49 p51, ch324 p19 | flag only, both chapters passed Gate A |

## `books/classify-modern-en.py war-and-peace --gate`

GATE FAIL on the two criteria the live edition also fails: 25 LIGHT chapters (158–278 zone, similarity 0.85–0.94) and 4 "truncated quotation" hits (ch32 p110, ch51 p5, ch98 p5, ch286 p9; read against the source: stylistic ellipses in complete paragraphs, false positives). Weighted similarity 0.702, identical long paragraphs 0.7 percent, wrapped scaffolding 0: all pass. **Decided 2026-09-18 (Anders, option a, DECISIONS.md):** for a book whose source is a readable modern translation, a chapter that passed the two-gate procedure on its accepted hash is accepted regardless of the LIGHT bucket; the rule text in `books/AGENTS.md` and `books/CLAUDE.md` carries the exception. Every chapter of this edition has now either passed the Gate A scan, or passed Gate A on its accepted hash after Gate B.

## Changed-passage records (`assembled/changed-passages-*.json`)

| File | Old | Paragraphs | Chapters |
|---|---|---|---|
| `changed-passages-vs-main.json` | `origin/main` (the live edition; b269fb96 was never merged) | 2,120 | 244 |
| `changed-passages-vs-b269fb96.json` | branch worktree file (the 16-batch fidelity repair) | 1,179 | 183 |
| `changed-passages-vs-baseline-v2.json` | baseline v2 (consistency pass) | 774 | 120 |

Record shape = `pending_audio_regen` key plus old/new paragraph sha256. No structural changes. Audio untouched (Fish regenerates on demand once published); the character-card file consumes the same records for re-anchoring.

**Not applied to any live edition file. Publication is Codex's step.**
