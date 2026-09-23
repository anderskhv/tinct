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
| P0 | all (names, 8.120) | 279 changed | lead | — | covered by each batch V | — | accepted |
| b01 | 1–6 | 340 | 85 applied | 8 | 67 checked, 2 defects | lead | accepted |
| b02 | 7–9 | 332 | 48 applied | 13 | 71 checked, 3 defects | R clean | accepted |
| b03 | 10–12 | 316 | 238 applied | 7 | 131 checked, 2 defects | lead | accepted |
| b04 | 13–14 | 364 | 186 applied | 9 | 139 checked, 2 defects | lead | accepted |
| b05 | 15–17 | 311 | 160 applied | 15 | 129 checked, 1 defect | lead | accepted |
| b06 | 18–20 | 360 | 120 applied | 12 | 89 checked, 7 defects | R, then lead | accepted |
| b07 | 21–23 | 299 | 124 applied | 14 | 87 checked, 5 defects | R, then lead | accepted |
| b08 | 24–25 | 315 | 130 applied | 8 | 88 checked, 2 defects | R clean | accepted |
| b09 | 26–29 | 317 | 139 applied | 10 | 99 checked, 1 defect | lead | accepted |
| b10 | 30–31 | 280 | 71 applied | 5 | 63 checked, 3 defects | R, R2, then lead | accepted |
| b11 | 32–35 | 265 | 113 applied | 10 | 106 checked, 1 defect | lead | accepted |
| b12 | 36–38 | 269 | 51 applied | 12 | 106 checked, 0 defects | R, then lead | accepted |
| b13 | 39–41 | 136 | 71 applied | 8 | 55 checked, 4 defects | R, then lead | accepted |
| assembly | all | 17 edits | lead | — | V-assembly (2 defects fixed) | R-assembly clean | accepted |

## Lead decisions

- **7.82 "Them!"**
  - Garnett prints "Hey!". The b02 reviewer notes that "Them!" matches the Russian ("It's them") and is clearer, and that "Hey!" would read as the young man shouting.
  - The candidate's "Them!" is kept. It is not a fidelity defect against the meaning of the scene.
- **13.20 line break:** the live baseline had a line break inside the quoted song. The source has none, and it was the only one in the edition. The b04 verifier removed it (round b04-AV), so the edition now has 0 newlines. The structure validator was relaxed to allow newlines already in the baseline, so that it would not block every batch before this ruling.

**Final:** `candidate.json` sha256 `18be4155497ebdf78013d1a26ce2fad86839aaa00c036cf9970954af550888eb`. **ACCEPTED — ready for release handoff.** See `ACCEPTANCE-RECORD.md` and `RELEASE-PACKET.md`.
