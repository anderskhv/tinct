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
(pending push at time of writing). `app/.env` and all Cloudflare/R2 credentials remain absent here.

## Lane status

Status vocabulary: not started · implementing · tests passing · clean commit available · integrated · deployed · production verified · blocked.

| Lane | Branch / location | Status | Notes |
|---|---|---|---|
| 1 Voice V2 preview | `codex/claude-voice-v2-preview` @ `/home/user/tinct-wt/voice-v2` | implementing | Subagent running; `42a019f8` reference forwarded mid-flight. |
| 2 Word-timing canary | `codex/claude-word-timing-production` | blocked | No `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_R2_TOKEN` or R2 keys in this environment; no GPU; egress to tinct.app denied. Decision: Lane 2 runs on the Mac/RunPod via Codex using `codex/ref-word-timing-tooling` and the execution plan. Branch not created here. |
| 3 Reading memory + recap | `codex/claude-reading-memory-recap` @ `/home/user/tinct-wt/reading-memory` | implementing | Subagent running; `b4312203` reference forwarded mid-flight (design reference only). |
| 4 100-cover collection | artifact-only | blocked | No image-generation capability in this environment. Decision: generate where the pilot was made; control room reviews contact sheets and manifest once pushed under `artifacts/`. |
| 5 Integration + release | `codex/claude-convergence-integration` @ `/private/tmp/tinct-claude-convergence-integration` | not started | Worktree created at baseline. Deploy blocked here: wrangler unauthenticated, egress to api.cloudflare.com and tinct.app denied. Decision: Codex on the Mac deploys from a clean worktree of `codex/claude-convergence-integration`, then promotes to `codex/lab-convergence`. |

## Decisions

- Integration lane will push the integrated result to `codex/claude-convergence-integration` (a fast-forward of `codex/lab-convergence` + approved lane commits) rather than rewriting `codex/lab-convergence`, because deploy cannot run from this environment and the repo policy is never to push a convergence state that is not deployed.
