# Progress: Crime and Punishment modern-en repair

Every edit is recorded in `ledger/changes.jsonl`, with its round, coordinates, old and new text, reason, and before/after paragraph hashes. Each batch's reviews live in `rounds/bNN/`:

| File | Content |
|---|---|
| `F` | Source-based fidelity and repair review |
| `A` | Candidate-only accessibility review |
| `V` | Independent verification of every changed paragraph, plus source screening of the A proposals |
| `R` | Re-verification of wording authored by the verifier |

## Batches

| Batch | Chapters | Paras | F | A | V | R | Accepted |
|---|---|---|---|---|---|---|---|
| P0 | all (names, 8.120) | 279 changed | lead | — | covered by each batch V | — | applied |
| b01 | 1–6 | 340 | | | | | |
| b02 | 7–9 | 332 | 48 applied | | | | |
| b03 | 10–12 | 316 | | | | | |
| b04 | 13–14 | 364 | | | | | |
| b05 | 15–17 | 311 | | | | | |
| b06 | 18–20 | 360 | | | | | |
| b07 | 21–23 | 299 | | | | | |
| b08 | 24–25 | 315 | | | | | |
| b09 | 26–29 | 317 | | | | | |
| b10 | 30–31 | 280 | | | | | |
| b11 | 32–35 | 265 | | | | | |
| b12 | 36–38 | 269 | | | | | |
| b13 | 39–41 | 136 | | | | | |

## Lead decisions

- **7.82 "Them!"**
  - Garnett prints "Hey!". The b02 reviewer notes that "Them!" matches the Russian ("It's them") and is clearer, and that "Hey!" would read as the young man shouting.
  - The candidate's "Them!" is kept. It is not a fidelity defect against the meaning of the scene.
- **13.20 line break:** the live baseline has a line break inside the quoted song ("Oh, my handsome soldier,\nDon't beat me for nothing,"). This is pre-existing and left unchanged; the structure validator rejects only *new* newlines.
