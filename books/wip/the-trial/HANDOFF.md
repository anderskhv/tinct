# The Trial — independence retest

- Status: **independence retest — incomplete; not cleared for publication**.
- Branch: `content/the-trial-codex`.
- Scope: only `books/wip/the-trial/`. No app/registry changes, publication, or Anthropic API spend.
- Instruction revision: `origin/main` at `5f3770c408917f621aa8e5aba341ec23446593ff`; explicit user repair instructions govern this direct-from-German work.
- Baseline: `aab318b7acfdc9251fd085e7cb2361b0ab6eee76`.
- Rights note and unmodified checker: `origin/claude/busy-fermi-111knc` at `333aef81b250e5b03ed113e069decf2e36c59e67`.

| Coordinate-only overlap | Before / 140 | After chapters 1–3 / 140 |
|---|---:|---:|
| N=10 | 83 | 54 |
| N=8 | 116 | 71 |

Chapters **1–3: zero N=10 and zero N=8 flags**. Re-rendered all 45 initially flagged paragraphs: 1:1–20; 2:2,3,4,7,8,9,11,12,13,14,16,17,22,28; 3:1–11. Sentence-by-sentence from German, with further German-based revision of residual candidate passages. Reference translation handled only inside the supplied checker; never opened, printed, searched, or read by the agent. No English translation consulted.

## Resume

**Chapter 4, paragraph 1.** Chapters 4–10 remain: **54 paragraphs at N=10, 71 at N=8**. Exact coordinates: `review/remaining-n10.json`, `review/remaining-n8.json`. Next batch: chapters 4–6; retest at both thresholds after each chapter/batch. Whole-book target: zero N=10 and fewer than 1% at N=8, with any N=8 remainder limited to unavoidable dialogue formulas. Target not yet met. Stopped at chapter boundary for the turn's token limit.

## QA and pins

- PASS: 10 chapters, 140 aligned paragraphs; counts 20/28/11/8/3/4/28/10/18/10; neutral labels unchanged.
- PASS: JSON, no empty/stub/copied-German paragraphs, no German function-word scan hits.
- PASS: per-paragraph English/German word ratios 0.8462–1.1979, within 0.60–2.00; no ratio flags. English words: 72,668.
- German SHA-256 unchanged: `caf39bade270a8718f3867720b97533e25364c8948c2b8a7738a11f1d6138d0f`.
- Current English SHA-256: `a64f34adc82295ac1c60c66216be410b651d6e84db902e57416a9d79927ba03d`.
- Checker SHA-256: `b303bfda2efc3869fd5489f47b2a7095e2fb7536449ee0fc7a81891ea9cc1d86`.
- `QA.json`, `qa-output.txt`, `paragraph-ratios.json`, and `SHA256SUMS` refreshed. Hash manifest covers package files and retained raw evidence; excludes itself.
- Staged onboarding opening synchronised with 1:1. Any later integration must invalidate cached speech/character offsets for changed paragraphs.
- Reproduce structure QA: `python3 books/wip/the-trial/validate.py`.
- Reproduce overlap: `python3 books/wip/the-trial/review/overlap-check.py books/wip/the-trial/editions/the-trial-modern-en.json --n 10` (then `--n 8`). Nonzero exit is expected while flags remain.
- Review here is author self-review, not an independent second reading. Earlier review claims apply only to their earlier text.

## Retained source/rights decisions

German source, ten-unit selection, neutral `Kapitel N` / `Chapter N` labels, and all source variants remain unchanged. Brod arrangement/intervention clearance is still open; six source-absent fragments remain omitted. No human English baseline supplied. Historical source/provenance decisions and the earlier incidental English-title snippet disclosure are preserved in `review/HANDOFF-before-independence-retest.md`; its old acceptance claims and candidate hash are superseded.
