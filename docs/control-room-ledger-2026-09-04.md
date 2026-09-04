# Tinct control-room ledger — 2026-09-04

Control room session: https://claude.ai/code/session_01GXmqM6Sj4F3tgUtr6DmuLN
Execution environment: Claude Code remote Linux container (not Anders's Mac).

## Baseline

| Item | Value |
|---|---|
| Clean production baseline | `origin/codex/lab-convergence` = `3888548da6d9bfe5c484e6227132203c30a1d9bb` ("Fix stale mobile word timing cache", 2026-09-04 18:45 +0200) |
| `origin/main` | `45a4252c` (ancestor of the baseline, 31 commits behind) |
| Baseline unit tests | 809/810 pass; `src/preReader/catalogue.test.ts` "offers only registered editions…" fails under the full run and passes in isolation (pre-existing slow test, not lane-caused) |

Reference commits were initially absent from the remote (unpushed on Anders's Mac). Anders pushed them
on 2026-09-04 evening: `42a019f8` → `origin/codex/ref-explicit-goodbye`, `9684bd4e` →
`origin/codex/ref-word-timing-tooling`, `b4312203` → `origin/codex/ref-reading-memory`. Both running lanes
were notified. The Mac-only artifact folders are being published as `codex/ref-artifacts-2026-09-04`
(pushed; 42 files, pilots and plans included). `app/.env` and all Cloudflare/R2 credentials remain absent here.

## Lane status

Status vocabulary: not started · implementing · tests passing · clean commit available · integrated · deployed · production verified · blocked.

| Lane | Branch / location | Status | Notes |
|---|---|---|---|
| 1 Voice V2 preview | `codex/claude-voice-v2-preview` @ `/home/user/tinct-wt/voice-v2` | implementing | Subagent running; `42a019f8` reference forwarded mid-flight. |
| 2 Word-timing canary | `codex/claude-word-timing-production` @ `/home/user/tinct-wt/word-timing` | implementing (offline part) / blocked (R2 + GPU part) | Subagent cherry-picks tooling `9684bd4e` onto baseline, validates the two Genesis 1 pilots offline, and writes the four-shard plan. Upload, R2 verification, production highlighting check and GPU benchmark are blocked here: no R2 token, no GPU, egress to tinct.app denied. Per EXECUTION-PLAN.md a dedicated least-privilege R2 object read/write token must be provisioned first (the Workers deploy token fails R2 with error 10000). |
| 3 Reading memory + recap | `codex/claude-reading-memory-recap` @ `/home/user/tinct-wt/reading-memory` | implementing | Subagent running; `b4312203` reference forwarded mid-flight (design reference only). |
| 4 100-cover collection | artifact-only | blocked | The pilot was generated with Codex's built-in image tool (`render_pilot.py` only overlays type with Pillow). This environment has no image-generation tool, so the 92 remaining covers must be generated in Codex. Control room reviews contact sheets and manifest once pushed under `artifacts/`. |
| 5 Integration + release | `codex/claude-convergence-integration` @ `/private/tmp/tinct-claude-convergence-integration` | not started | Worktree created at baseline. Deploy blocked here: wrangler unauthenticated, egress to api.cloudflare.com and tinct.app denied. Decision: Codex on the Mac deploys from a clean worktree of `codex/claude-convergence-integration`, then promotes to `codex/lab-convergence`. |

## Decisions

- Integration lane will push the integrated result to `codex/claude-convergence-integration` (a fast-forward of `codex/lab-convergence` + approved lane commits) rather than rewriting `codex/lab-convergence`, because deploy cannot run from this environment and the repo policy is never to push a convergence state that is not deployed.
