# Tinct control-room ledger — 2026-09-04

Control room session: https://claude.ai/code/session_01GXmqM6Sj4F3tgUtr6DmuLN
Execution environment: Claude Code remote Linux container (not Anders's Mac).

## Baseline

| Item | Value |
|---|---|
| Clean production baseline (session start) | `origin/codex/lab-convergence` = `3888548da6d9bfe5c484e6227132203c30a1d9bb` ("Fix stale mobile word timing cache", 2026-09-04 18:45 +0200) |
| Production baseline after release 1 | `origin/codex/lab-convergence` = `5a678f3c2b168f8cd5698ea56901858c733c0533` (Voice V2 preview), Worker `11fd329a-cf4b-4804-a784-928a1c95762f`, bundle `index-CyyvAuYh.js` |
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
| 1 Voice V2 preview | `codex/claude-voice-v2-preview` | **production verified** | `5a678f3c` deployed 20:47 UTC. Worker version `11fd329a-cf4b-4804-a784-928a1c95762f`, bundle `index-CyyvAuYh.js`. Production: `/lab/reader` → `data-voice-version=v1`, `/lab/reader?voice=v2` → `v2` (phone + desktop, no page errors), `/lab/phone?voice=v2` stays v1. Live mic/Realtime still needs a human device test. |
| 2 Word-timing canary | `codex/claude-word-timing-production` | implementing (R2 canary) | Offline half done (`d478e8b3`, `df82698f`). 2026-09-05: Anders provisioned `tinct-r2-words-2026-09` (R2 object read/write, bucket `tinct-audio`) as `CLOUDFLARE_R2_TOKEN` in the cloud environment. Fresh session running: known-object read test → no-overwrite upload of the two Genesis 1 pilots → GET/hash/schema/provenance verification → production `/api/audio-file` fetch → headless highlighting check at 1× and 2×. Still blocked: Genesis 1–10 GPU benchmark (RunPod) and human listening. |
| 3 Reading memory + recap | `codex/claude-reading-memory-recap` | implementing (round 2) | Round 1 `733e11cf` clean. Migration `20260904_reading_memory_sessions.sql` APPLIED to production Supabase by Anders 2026-09-05 (verified: table exists, anon denied). Owner decisions 2026-09-05: completion = last page reached (keep); 30-min gap = new resumed session (keep); summary AUTOMATIC once per closed session for signed-in readers, excerpt fallback (change); sign-in ADOPTS sessions recorded while signed out, and offline-while-signed-in stays signed-in with queued sync (change). Subagent implementing round 2. |
| 4 100-cover collection | artifact-only | blocked | The pilot was generated with Codex's built-in image tool (`render_pilot.py` only overlays type with Pillow). This environment has no image-generation tool, so the 92 remaining covers must be generated in Codex. Control room reviews contact sheets and manifest once pushed under `artifacts/`. |
| 5 Integration + release | `codex/claude-convergence-integration` | **deployed** | Integration verified (171 focused, 863 full, build, verify-bundle, phone/desktop matrix, A/B vs baseline identical). Deployed via `CI=true npm run deploy` from a fresh environment session at 20:47 UTC. Control room re-verified from a second container: bundle served as `text/javascript`, Supabase URL + anon key present in the `authCookie-*` chunk, chat API 401, audio manifest + sample OK. `codex/lab-convergence` fast-forwarded to `5a678f3c`. Smoke script `app/scripts/smoke-test.sh` reports 3 false negatives (expects `var|function|import` at bundle start and greps only `index-*.js` for Supabase); needs updating, not a production issue. |
| 6 Position flip-flop (issue D) | `codex/claude-lab-position-merge-gate` @ `/home/user/tinct-wt/position-merge` | implementing | Base `5a678f3c`. Cloud merge gated on a 2-entry fallback chapter list discards the cloud record and latches; plus immediate page-turn writes, keepalive PUT, merge-before-write, rev seeding. Regression test first. |
| 7 Reader chrome (issues A + C) | `codex/claude-lab-reader-chrome` @ `/home/user/tinct-wt/reader-chrome` | implementing | Base `5a678f3c`. Justify continued page tails (`text-align-last`, guarded); header title/chapter pill wake hidden controls. |
| 8 Chat keyboard (issue B) | `codex/claude-lab-chat-keyboard` @ `/home/user/tinct-wt/chat-keyboard` | implementing | Base `5a678f3c`. Synchronous focus from the Chat tab tap, reset window scroll on visual-viewport change, flush composer padding while keyboard open. |

## Decisions

- 2026-09-05 morning feedback (Anders): four lab phone-reader issues A–D investigated by a separate agent; Anders authorized "apply the best fixes and push to production". Fix lanes 6–8 created on the production baseline; Lane 5 integrates and deploys them as release 1.1 before release 2 (reading memory). The investigator's claim that production ran unpushed code was wrong: it compared against `main`; the deployed code is `codex/lab-convergence`.

- Integration lane will push the integrated result to `codex/claude-convergence-integration` (a fast-forward of `codex/lab-convergence` + approved lane commits) rather than rewriting `codex/lab-convergence`, because deploy cannot run from this environment and the repo policy is never to push a convergence state that is not deployed.
