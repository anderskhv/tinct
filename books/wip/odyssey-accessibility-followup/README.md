# Odyssey — accessibility follow-up for the ten lightly modernized Books

**Status: the accessibility repairs are complete and independently verified. The unchanged similarity gate still FAILS.** Whether to publish is an explicit decision for Anders (see `GATE-DISPOSITION.md`). This package is not published and not integrated.

## What this is

PR #163 holds the accepted modern-English Odyssey (`bd05c7f4…`) because the gate fails: weighted similarity 0.784, with 10/24 Books LIGHT. Books 3–10, 23 and 24 were flagged as lightly modernized. This package reviews exactly those Books for real comprehension barriers against Butler's complete text, repairs the genuine ones, and reports the unchanged gate result honestly.

- **Method** (`METHOD.md`):
  - A blind read of every paragraph by readers who saw only the modern text.
  - Source-aware adjudication of each reader's understanding against Butler.
  - Lead screening, then independent fidelity verification of every changed paragraph.
- **Result:**
  - 64 edits in 56 paragraphs: 60 in the ten Books, plus 4 consistency edits at 1.4, 2.23, 12.26 and 17.10.
  - Successor `db6bfd23e97e1fe2eb0b2ce9926c36a665a996cfb024796ee0903e935931c9ce`.
  - Structure, titles and the set of paragraphs changed against live are unchanged.
  - Card compatibility under PR #163's own procedure: 632 retained, 0 dropped.
- **Gate:** 0.783 and 10/24 LIGHT, so **FAIL**. The repairs fix comprehension; they do not, and were not meant to, rewrite Butler's register.
- **Books 3/4 join:** option A stands, as recorded (`OPTION-A-RECONCILIATION.md`).

## Files

| Path | What it holds |
|---|---|
| `RELEASE-PACKET.md` | Artifact, hashes, destination, what the integrator must re-pin in PR #163, and user-data and narration impact |
| `GATE-DISPOSITION.md` | Gate numbers before and after, Book-by-Book evidence, and the explicit decision with a recommendation |
| `OPTION-A-RECONCILIATION.md` | The option A vs B+ records, reconciled |
| `METHOD.md` | Scope, inputs and stages |
| `CHANGES.md` | Change ledger: every edit, its source (adjudicator, adjusted, or lead) and its reason; plus the one proposal withdrawn after verification |
| `edits.json` | The 64 edits in machine-readable form, with base pin and exact-once semantics |
| `edition/` | The successor edition; paragraph hashes (the TSV format PR #163 checks); the 56 changed paragraphs with before and after hashes |
| `card/character-card-impact-dryrun.json` | The read-only PR #163 card procedure on the successor |
| `gate/` | Outputs of the unchanged gate on `bd05c7f4…` and on the successor |
| `reviews/blind-read/` | The reader brief and ten blind-read files: paraphrase and barriers for every paragraph |
| `reviews/adjudication/` | The adjudication brief and ten adjudications: proposals, rejected barriers with reasons, reader errors |
| `reviews/screening/` | The lead's decision on every proposal, plus lead-added and consistency edits |
| `reviews/verification/` | The verification brief, the per-Book independent verification verdicts for rounds 1–3, and `SUMMARY.md` |

## Provenance and scope

- **Instruction revision:** main `1a7d89ebd816af8a2ac18239010c34fab4bf48c5`. The book-task workflow and AGENTS files were last changed at `ec11086e`.
- **Owned path:** `books/wip/odyssey-accessibility-followup/` only, on branch `claude/friendly-davinci-9ti52c`.
- **Inputs:**
  - `claude/odyssey-modern-en-completion` `0a76d6ce`: the candidate, GLOSSARY, PUNCTUATION and per-Book continuity rulings;
  - `7994156f`: option-A original-en;
  - main `1a7d89eb`: the live edition and card, the gate script and the re-anchor tool.
  All were read-only.
- **Rechecked before commit** at main `945e15b21` (2026-09-25). The live Odyssey editions, `books/classify-modern-en.py`, `app/scripts/prepare-reviewed-editions.py` and the instruction files are byte-identical to `1a7d89eb`. The new `docs/integration-backlog-2026-09-25.md` lists the Odyssey as a hold. This package supplies the two missing records it names: the gate disposition and the A-vs-B+ reconciliation.
- **Scripts not committed.** Scratchpad scripts applied the edits, built the packets and ran the checks. Under the book-task workflow no code goes in a content folder. `edits.json` fully determines the successor from `bd05c7f4…`.
- No app code, registry, live edition, card, audio, Danish work or shared tooling was touched. Nothing was merged or published.
