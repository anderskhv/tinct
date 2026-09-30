# Verification record

Instruction revision: origin/main `fe699e90d8e21a64b0a4ef81084fee48c04a5813` (fetched 2026-09-30). Read: `books/BOOK-TASK-WORKFLOW.md` (blob 945ecf3a, sha256 98fab28a…0e4e), `books/README.md` (f229d0fd), `STRATEGY.md` (8f562f54), `AGENTS.md` (cc1ac8d8), `books/AGENTS.md` (a8d7a93a), `books/CLAUDE.md` (0f7c6de3), `docs/workflow-boundaries.md` (c973e111). Owned path: `books/wip/moby-dick-character-rulings/` only; branch `claude/moby-dick-character-rulings` off `52c72004`. Untouched: `green-moby-dick/`, `moby-dick-structural/`, all of `app/`. No scripts, code or tests were added; analysis used throw-away read-only scripts outside the repo.

## Pinned inputs
| Input | sha256 |
|---|---|
| baseline-live-modern-en.json | `2ab04dd727bbe5804b7acf1d05f578cfed5aef17c08d7d72b6db9101f8c1763c` (= package pin) |
| candidate.json | `1a3f31bbe6bb4bea415a29b509c81f303074bc858854c7bc00a49e8b68ffd52c` |
| moby-dick.v1.json (origin/main) | `dccdb35d2c4d2cfc7e1c8faba22807c1754cdaf356127f9229c836502fe34019` |

## Mechanical checks (all pass on the final RULINGS.json)
- All 1,779 old links: text equals baseline slice at old coordinates.
- All KEEP/RE-POINT targets: text equals candidate slice at new coordinates, in the same paragraph as the old link, no overlaps, no two links on one token, target text is a permitted form of the character's own name.
- 457 links in unchanged paragraphs: paragraph strings byte-identical baseline vs candidate.
- 1,614 changed paragraphs / 2,432 total; per-paragraph counts equal old/new.
- Each character's earliest link is still its introduction anchor; introduction anchors for queequeg, father-mapple, peleg, pip moved within the same paragraph; no name occurs before its anchor in baseline or candidate (0/0 for all 15, and 0/0 for "White Whale"/"Moby Dick" before ch36 p25).
- Structural package: text equal to candidate shifted by −1 in ch56/57/73, identical elsewhere; all 36 mentions there re-expressed under `structuralPackage`.

## Independent review
Ruler: this session's lead. Reviewers: twelve separate subagent instances (never the ruler), two rounds over all 1,322 links in changed paragraphs (every KEEP, RE-POINT and DROP; six slices by chapter range). Untouched links in unchanged paragraphs were checked mechanically (byte-identical paragraphs).
- **Round 1** (`review/round1-reviewer*.json`): 1,322 verdicts. Two ruling changes came out of it: L0699 and L0835 became DROP (both re-flagged by round 2); L0698 was accepted by round 1 with a "loose match" note. Five sheets returned all-AGREE within under a minute each, so a second, stricter round was run.
- **Round 2** (`review/round2-reviewer*.json`): fresh reviewers were required to quote old/new context for each non-KEEP entry, and each sheet had deliberately wrong rulings planted (34 in total: duplicate/wrong-clause targets, identity swaps, false drops; key in `review/round2-canary-key.json`). **All 34 planted errors were caught, with no other false alarms on genuine entries except L0698, L0699 and L0835**, which matched round 1. Round-2 sheets contained the pre-adjudication rulings for those three; verdicts for canary ids in round 2 are on corrupted rulings and are recorded as such in RULINGS.json.
- Adjudicated by the ruler after review: L0698, L0699, L0835 → DROP (final: 959 RE-POINT / 323 KEEP / 40 DROP). The final rulings were re-verified mechanically; the three changed entries were each independently flagged by a reviewer, and no reviewer saw a ruling in its final form beyond that.
- Residual risk: reviewers agreed with the ruler on moderate-confidence calls (e.g. L0700 ch44 p11, ch111 p3 drop). Slot-based re-points inside recast paragraphs were read clause by clause; none of the ~30 lightly-recast ones was flagged.

## Package files
| File | sha256 |
|---|---|
| `RULINGS.json` | `5e82c62d117908c800d0ccdd02e6ea8db49e0a285c2dcc7b8f87e2493542c2c2` |
| `RULINGS.md` | `1d6ac8a79c4bc6768984624e54adac8f6fa6c78712c4214f0fc0e97246a3bbcb` |
| `INTEGRATION-NOTES.md` | `9fbe730f36b77072d534800ad9a8408a99a1963fd9a8502edf72ef5291dcd803` |
| `optional-new-occurrences.json` | `9da6a5f13b115150891a788b9b6ca184a2db6c58d26c2be83c366a8b4a71ba4c` |
| `paragraph-hash-updates.tsv` | `4d9a353cef26b5fa81a95b61a6f1b0f5d29d78bd838a8e9d35e543a888cef47e` |
| `review/round1-reviewer1.json` | `295776751c3b00cb5762297404c072b7e676e777505b406ed005bdd199b3533a` |
| `review/round1-reviewer2.json` | `9e2cb96f7be5981e5a85dc192d23e86f519e6c61aa5fb9111676648f8e667241` |
| `review/round1-reviewer3.json` | `eaf3e17f13105fbc30fcc85f590c34b11a042b4acd9693f0d5162383430326d6` |
| `review/round1-reviewer4.json` | `9dff8bd9d1cb0346185f1731f3fe0ff4f89ea27e11612eebb726ce2587783257` |
| `review/round1-reviewer5.json` | `396c7703358241cc817ac2c6f018681755befd24fc39dd3adb4de640cf794185` |
| `review/round1-reviewer6.json` | `1f220046a80d914acec645dfed1f6831255a631b600b1a96f5da1c2afe97b3e8` |
| `review/round2-canary-key.json` | `0f254c10215fa8c4452de85fbb2e4854a989bc813ec4f02963ac0d3a7d622bf6` |
| `review/round2-reviewer1.json` | `9b2a206c63cb07d2ddfcec21169100a9696db85b50babc3b12fcc9c59e5904ad` |
| `review/round2-reviewer2.json` | `aa9bdcde1825725a311f63d33f6489f3533a4a3944165069a33fe0f7de3b44eb` |
| `review/round2-reviewer3.json` | `d155dfb2d5af9939b09dbae64e9755a418eee11b9c3e400627bef532b4dcb520` |
| `review/round2-reviewer4.json` | `adb89754f799de94f3ed53830b07ab191aadc8388533357f170586f16e328b16` |
| `review/round2-reviewer5.json` | `7c86ea64f479a4d794df3ad07c70bbef51428d9096624d186f12b23c1e678de6` |
| `review/round2-reviewer6.json` | `9274e2d43bdc292479b0c9e42e30e697c88854671e452661aaf47cda6826d87b` |
