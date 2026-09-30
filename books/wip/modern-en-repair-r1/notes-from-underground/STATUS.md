# Repair status

All five books are complete as staged modern-English repairs. Each whole-book absolute-path similarity gate passes. No publication or deployment. Zero Anthropic API spend.

| Order | Book | Status | Final similarity | LIGHT + MECHANICAL | Identical long paragraphs |
| --- | --- | --- | --- | --- | --- |
| 1 | magna-carta | READY — PASS | 0.505 | 0% | 0% |
| 2 | communist-manifesto | READY — PASS | 0.491 | 0% | 2/194 (1.0%) |
| 3 | symposium | READY — PASS | 0.500 | 0% | 5/170 (2.9%) |
| 4 | kant-groundwork | READY — PASS | 0.546 | 0% | 1/180 (0.6%) |
| 5 | notes-from-underground | READY — PASS | 0.511 | 0% | 1/334 (0.3%) |

Commit checkpoints on `content/modern-en-repair-r1`:

- magna-carta: `70defe6ef63567ece8787f1f7ea1df36a74ba515`.
- communist-manifesto: `e36225328c6695401067373aecd3af71735338d2`.
- symposium: `c5945d4c63285b35f1e69ef871e90c5309a7b822`.
- kant-groundwork: `630c66b8d34c1b8738c1ce4cbe40bd3ce3139b10`.
- notes-from-underground: the commit containing this completed status and its HANDOFF.md.

Each book's HANDOFF.md records changed paragraphs, gate evidence, hashes, spot reads, and character-directory impact. Notes from Underground retains pre-existing short-paragraph and punctuation exceptions in protected REAL chapters 1–7; these are explicitly documented. Source-text issues and other preserved chapter exceptions are recorded in the relevant handoffs.

Resume point: none. No live edition, registry, script, test, or configuration edits are part of this repair. Use explicit r1 refs for Git operations because other tasks share this checkout.
