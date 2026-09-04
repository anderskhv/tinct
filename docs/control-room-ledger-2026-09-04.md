# Tinct control-room ledger — 2026-09-04

Control room session: https://claude.ai/code/session_01GXmqM6Sj4F3tgUtr6DmuLN
Execution environment: Claude Code remote Linux container (not Anders's Mac).

## Baseline

| Item | Value |
|---|---|
| Clean production baseline | `origin/codex/lab-convergence` = `3888548da6d9bfe5c484e6227132203c30a1d9bb` ("Fix stale mobile word timing cache", 2026-09-04 18:45 +0200) |
| `origin/main` | `45a4252c` (ancestor of the baseline, 31 commits behind) |
| Baseline unit tests | 809/810 pass; `src/preReader/catalogue.test.ts` "offers only registered editions…" fails under the full run and passes in isolation (pre-existing slow test, not lane-caused) |

Reference commits requested but **not present on the remote** (exist only on Anders's Mac, unpushed):
`42a019f8` (explicit goodbye), `9684bd4eb31d` (word-timing tooling), `b4312203` (reading memory).
Mac-only paths requested but absent here: `~/.codex/artifacts/tinct-word-timing-recovery-2026-09-04/`,
`~/.codex/artifacts/tinct-cover-art-2026-09-04/`, `app/.env`.

## Lane status

Status vocabulary: not started · implementing · tests passing · clean commit available · integrated · deployed · production verified · blocked.

| Lane | Branch / location | Status | Notes |
|---|---|---|---|
| 1 Voice V2 preview | `codex/claude-voice-v2-preview` @ `/home/user/tinct-wt/voice-v2` | implementing | Subagent running. `42a019f8` unavailable; goodbye behavior derived from current baseline handling. |
| 2 Word-timing canary | `codex/claude-word-timing-production` | blocked | No `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_R2_TOKEN` or R2 keys in this environment; tooling commit `9684bd4eb31d` and EXECUTION-PLAN.md unavailable; Genesis pilots not in repo; no GPU; egress to tinct.app denied. Branch not created (nothing to commit). |
| 3 Reading memory + recap | `codex/claude-reading-memory-recap` @ `/home/user/tinct-wt/reading-memory` | implementing | Subagent running. `b4312203` unavailable; designed from current baseline. |
| 4 100-cover collection | artifact-only | blocked | No image-generation capability in this environment; art direction, pilot review and manifest live only on the Mac. |
| 5 Integration + release | `codex/claude-convergence-integration` @ `/private/tmp/tinct-claude-convergence-integration` | not started | Worktree created at baseline. Deploy blocked: wrangler unauthenticated, egress to api.cloudflare.com and tinct.app denied. |

## Decisions

- Integration lane will push the integrated result to `codex/claude-convergence-integration` (a fast-forward of `codex/lab-convergence` + approved lane commits) rather than rewriting `codex/lab-convergence`, because deploy cannot run from this environment and the repo policy is never to push a convergence state that is not deployed.
