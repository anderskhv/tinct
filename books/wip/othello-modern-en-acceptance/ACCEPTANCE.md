# Othello Modern English: acceptance record

**Result:** the acceptance pass is complete. Every outstanding requirement has been met with independent evidence.

- **Accepted content:** the modern-en **v2** text, its character-card block, and the changed-paragraph list.
- **Not accepted:** Parts A and B of the structural proposal and the Compare meaning units. These are proposals that need Anders's decision or Codex integration.
- **Not published.** Nothing in this folder is live.

## Inputs

| Input | Identity |
|---|---|
| Base package (owner's, untouched) | `books/wip/othello-modern-en/` on branch `claude/cool-galileo-tyen9m`, commit `15d3d67e53c32dc24e05679271997d7dd24f868a`. The branch head was re-checked on 2026-09-25 and has not changed |
| v1 candidate | `012ede1e45c1d3b0c51c791212971892b345092c658b06e4712aa69a1dd2083c` |
| Served original-en (baseline) | `a8e8ae40b054bce1b60dcba35fcd194f08e74829fcc0faa6665456f962b5d1df` |
| Live modern-en (to be replaced) | `5beb0f0093ef10f1d725b797c3eef7cdfe370b3d74be8738f4fd01431dbdb04d` |
| Source | Gutenberg #1531, `340a08eb95d6404c0834906eb7b899ec6503c609ca76eb5b7430bb100cd1e462` (provenance in the base package, `source/SOURCE.md`) |

## Outstanding requirements and how each was met

| # | Requirement | Evidence | Status |
|---|---|---|---|
| 1 | Reconcile the 36 reported editor edits with the 34 independently re-checked, including the late "beast with two backs — having sex" | `review/RECONCILIATION.md`. `editor-fixes.json` has 36 edits: 32 came from reviewer findings, all acted on, and 4 originated with the editor. The base re-check covered edits 1–34. Edits #35 (15.2 line 2) and #36 (1.33 gloss) had not been checked. G1 and RC2 now confirm 15.2 line 2. G1 revised the 1.33 gloss out of the text and RC1 accepted the removal. The base REVIEW-RECORD said "19 of 20 notes" were applied; in fact all 20 were | **Met** |
| 2 | Independently resolve the contested glosses | `review/GLOSS-DECISIONS.md` and `review/gloss-resolution.json`. G1 worked only from Schmidt, Onions and Furness and resolved 31 items: 17 KEEP, 11 REVISE, 3 OPEN. For each OPEN crux the choice is recorded. 17 v2 edits cite G1, and each was re-checked | **Met** |
| 3 | Blind comprehension review of representative complete scenes | `review/BLIND-TRIAGE.md`, with `review/blind-B1.md` to `blind-B3.md`. Three readers with no access to the original read five complete scenes: 1.1, 1.3, 3.3, 4.3 and 5.2. Ratings by ear were 3–4 out of 5. 49 v2 edits come from their points. The remaining obstacles are structural and are covered by requirement 4 | **Met** (see limits) |
| 4 | Separate source-verified correction proposal for the 43 spoken continuations bracketed as stage directions, covering both English editions | `structure/PROPOSAL.md` and `structure/part-a-brackets.proposed.json`, verified independently by SD1 (`review/brackets-verification.json`). A second proposal, Part B (`part-b-inline-directions.proposed.json`), covers the 34 inline directions the parser stripped. Both are **not applied** | **Met** (as a proposal) |
| 5 | Editorial validation of the meaning-based Compare alignment, beyond valid line-break offsets | `alignment/README.md`. Validators A1–A4 covered all 15 chapters: 457 verse speeches, 1,959 units and 32 long prose speeches. Their findings gave the unit re-cuts and 97 text edits. RC1 and RC2 found no unit problems in the re-cut units. There are 2,088 units in all, and the checks pass on the final v2 bytes | **Met** (as proposed data) |
| 6 | Verified character-link changes and final hashes | `CHARACTER-CARD-IMPACT.md`. The v2 block has 1,829 mentions: one dropped, with its reason given, and 246 re-anchored. It passes the `verifyCharacters` rules with no errors. `HASHES.sha256` lists every file | **Met** |

## Independent re-check of v2

Every v2 text edit (`CHANGES-v1-to-v2.md`) was re-checked by someone who neither proposed nor made it:

| Re-checker | Scope | Result |
|---|---|---|
| RC1 | 71 edits in chapters 1–8 | 71 accept |
| RC2 | 96 proposed edits in chapters 9–15 | 91 accept, 4 revise, 1 reject. The revised wording was applied. The reject (15.158 "defenseless") was not applied |
| RC1, final confirmation | The 7 items changed after the re-checks: the four RC2 revisions, the 15.158 reject, *endeavor* and *license* | 7 accept |

Of the 168 v2 edits, 166 have an RC1 or RC2 verdict. The other 2 (the spelling edits at 7.19 and 11.105) were confirmed in RC1's final confirmation.

## Similarity gate

This was the unmodified `books/classify-modern-en.py othello --gate`, run on a scratch copy of the repo layout. The output is in `gate/gate-output-v2.txt`.

```
weighted similarity : 0.479   (gate: <= 0.75)
light+mechanical    : 0/15 = 0.0%
identical long paras: 1/473 = 0.2%
GATE PASS
```

v1 scored 0.481. There was no waiver.

## Standard applied

The standard is `books/wip/shakespeare-calibration/STANDARD.md`. It was developed in this pass from Othello and tested on King Lear, Twelfth Night and The Merchant of Venice. Its core rules:

- A first-time **listener** understands what each speaker means and wants.
- Imagery, voice, qualifications and deliberate ambiguity survive.
- Modern sentences are natural and are mapped to the original by short units of meaning, not forced line order.

## Limits, stated plainly

- **No second blind read of v2 was run.** Independent fidelity re-checkers verified the v2 fixes. The recommended time for a fresh blind read is after integration, if Part A or B is adopted.
- **The validators and re-checkers are AI reviewers** working from public-domain annotation. Anders may wish to spot-read `review/GLOSS-DECISIONS.md` and the OPEN cruxes.
- **Stage directions stay byte-identical** to the served convention (Hamlet and Macbeth practice).

## Decisions for Anders

1. Adopt v2 as the Othello modern-en.
2. Part A (restore 45 bracketed speeches) and Part B (restore 34 stripped directions): yes or no for each.
3. Whether Compare should use the meaning units. This needs Codex's file or schema decision.
4. House style for stage directions across all plays. Unchanged here.

## Integration dependencies (Codex)

- Replace `app/public/data/editions/othello-modern-en.json` with `othello-modern-en.v2.candidate.json`. It is the same format as the live file: `json.dumps(indent=2, ensure_ascii=False)` with no trailing newline.
- In the same release:
  - replace `editions["modern-en"]` in `characters/othello.v1.json` with `othello-characters-modern-en.v2.proposed.json`;
  - bump `characterReleases.othello.revision`;
  - invalidate cached narration for the **1,032** paragraphs in `CHANGED-PARAGRAPHS.json` (`vsLive`).
- Do **not** ship the base package's v1 files (`012ede1e…`) or its v1 card block (`770c3fc3…`). v2 supersedes both.
- Part A or B, if adopted, changes `original-en` as well. Re-verify cards and recompute hashes on the combined result.
- modern-da is derived from the old modern-en and is out of scope (Danish is not a current requirement). This is recorded only.
