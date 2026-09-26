# Release Packet — Confessions, modern-da Books 10-13 translation

Status: candidate, awaiting independent review. Not published. Authorized
under the 2026-09-26 assignment's explicit Danish-repair carve-out.

## What this fixes

`modern-da` Books 10–13 (206 paragraphs — Book 10: 70, Book 11: 41, Book
12: 42, Book 13: 53) were served as untranslated `[TBD]` placeholders, not
Danish text.

## Baseline

The accepted, complete `modern-en` (released in issue #192; no
completeness defect for this book per the audit).

## Candidate

| Item | Value |
|---|---|
| `editions/confessions-modern-da.json` | sha256 `1a0fad4ebb7be4c49d85f19254aa7fda8481bdd861ba8905ee56a959836383c8` — 13 chapters, same structure as live; only Books 10-13's 206 paragraphs replaced |
| Replaces live sha256 | `4935d43ca05f87da69b94c37d3b2079ed8591a7769cf45f57a213690ec0b19bb` |
| Baseline `modern-en` sha256 | `949e4f77fd317601cc39dc701cfbc3f5f82a5b5a842c34e93c9a6328ef78add7` |

## Verification performed

- Valid JSON.
- Paragraph counts per book (70/41/42/53, 206 total) match the English
  baseline exactly; Books 1-9 untouched (byte-identical to live).
- Scanned all 206 replaced paragraphs for `[TBD]`, empty strings, and
  leftover-English markers — none found.
- Spot-checked paragraph length ratios across all four books (Danish vs.
  English character counts): consistently ~90-110%, consistent with full
  translation rather than compression or truncation.
- Manually read a spread of paragraphs across all four books against the
  English, including the memory-analysis argument (Book 10), the
  time/eternity argument (Book 11), the Genesis matter/form allegory and
  multi-reading exegesis debate (Book 12), and the Trinity/creation-days
  allegory with Pauline quotations (Book 13) — confirmed the full
  theological argument, scriptural citations, and proper nouns (Karthago,
  Jerusalem, Athanasius, Alexandria, Onesiforos, Epafroditus, Elias, Esau,
  David, Tobias, Isak, Jakob, Moses) preserved.
- Style follows the register established by the already-accepted Book 9
  Danish text: capitalized Du/Din/Dig for God, semicolon-heavy periodic
  sentences, Danish quotation convention (»...«), idiomatic Danish syntax
  (verb-second order, connectives like "for", "dog", "så at sige") rather
  than an English-structure calque.

## What independent review should check

Read a substantial sample of the 206 replaced paragraphs against the
English baseline for completeness and fidelity — Augustine's theological
argumentation is dense and abstract, so check that reasoning chains and
scriptural citations survive intact, not just the surface prose. Confirm
Books 1-9 were left untouched and the register matches the accepted Book 9
Danish text.
