# Othello Modern English: acceptance pass (successor package)

This folder completes the acceptance requirements left open on the Othello modern-en re-render. It is a **successor** to the owner's package at `books/wip/othello-modern-en/` (branch `claude/cool-galileo-tyen9m`, commit `15d3d67e`). That package is untouched; everything here is new.

**Status:** content accepted, **not published**.

- **Accepted content:** the v2 text, its character-card block and the changed-paragraph list.
- **Proposals, not accepted:** the structural repair (Parts A and B) and the Compare meaning units.

This is a content-only package. No app code, registry, live edition, live character card, shared tooling, Danish or audio was touched.

Read first: `ACCEPTANCE.md`, the requirement-by-requirement record, decisions and integration dependencies.

## Deliverables

| File | What it is | SHA-256 |
|---|---|---|
| `othello-modern-en.v2.candidate.json` | **Accepted** modern-en v2. It has 15 chapters and 1,391 paragraphs, 1:1 with the served editions, and is a drop-in replacement for the live file | `ed1e3ebbdbcb7f17cf637f1d04e678f0cccb6ff4ab9916131aaf837a4b7cb3d1` |
| `othello-characters-modern-en.v2.proposed.json` | Replacement for `editions["modern-en"]` in `characters/othello.v1.json`, re-anchored to v2 and verified. It must ship with v2 | `0ee43da59d8a8d4a168e940961fbbbf2e829c37ee82ef508ec64e71aa5acfa38` |
| `CHANGED-PARAGRAPHS.json` | `vsLive`: the 1,032 paragraphs whose narration cache must be invalidated. `vsV1`: the 132 paragraphs this pass changed | `6b3157fd13ccd3f172967139ab3baddce2851ae5ddc1c465220a8fbff10835f8` |
| `CHANGES-v1-to-v2.json` / `.md` | All 168 edits, each with before and after, source, reason and independent re-check verdict | `02fdbe8716b1ca9f0b65805c856105d3c338b64485b70d8501c4b31552ec4675` (json) |
| `CHARACTER-CARD-IMPACT.md` | Card changes from v1 to v2, and their validation | |
| `structure/` | **Proposal:** Part A (45 bracketed speeches) and Part B (34 stripped directions), source-verified and not applied. See `structure/PROPOSAL.md` | A `9dd277c1…`, B `5c25d0a0…` |
| `alignment/` | **Proposal:** Compare meaning units (2,088 units) and unit lineation for v2, validated. See `alignment/README.md` | units `371bfe03…`, lines `bf7cb681…` |
| `review/` | The full record of the independent reviews, listed below | |
| `gate/gate-output-v2.txt` | Similarity gate: 0.479, PASS | `fdcc50f5…` |
| `HASHES.sha256` | SHA-256 of every file in this folder | |

## Review record (`review/`)

| File | Reviewer and role |
|---|---|
| `RECONCILIATION.md` | Reconciles the 36 base editor edits with the 34 re-checked |
| `gloss-resolution.json`, `GLOSS-DECISIONS.md` | G1: independent resolution of 31 contested glosses from Schmidt, Onions and Furness |
| `align-A1.json` to `align-A4.json` | A1–A4: validators of the Compare units, covering all 15 chapters |
| `blind-B1.md` to `blind-B3.md`, `BLIND-TRIAGE.md` | B1–B3: blind readers of five complete scenes, and the editor's triage |
| `brackets-verification.json` | SD1: independent source verification of Part A |
| `recheck-RC1.json`, `recheck-RC2.json`, `recheck-final-RC1.json` | RC1 and RC2: independent re-check of every v2 edit, plus the final confirmation |
| `briefs/` | The briefs each reviewer worked from |

Every reviewer was an independent agent with a single role. None edited the text. The editor (this pass's assembler) triaged the findings and made the edits, and the re-checkers then verified every edit.

## Base package documents that still apply

The base package's `HANDOFF.md`, `review/REVIEW-RECORD.md`, `review/RENDER-BRIEF.md` and `source/SOURCE.md` describe how v1 was made, and they remain valid as history. Their references to v1 files and hashes are **superseded** by this folder for release purposes.
