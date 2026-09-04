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
| 1 Voice V2 preview | `codex/claude-voice-v2-preview` @ `/home/user/tinct-wt/voice-v2` | clean commit available | `5a678f3c`, one commit on `3888548d`, 17 files, all under `app/src/`. Focused 57/57, full 863/863, build + verify-bundle pass (`index-Dn1xA6cG.js`). Browser smoke: 7 routes, `/lab/reader`→v1, `/lab/reader?voice=v2`→v2, `/lab`, `/lab/phone`, `/lab/desktop` stay v1. `42a019f8` needed no porting (its controller lines already in baseline). Diagnostics from `6858fbd5` skipped (no server/DB change). NOT verified: live mic/Realtime audio. Control-room diff review: additive, V2 branches gated on `isV2()`, 7 controller lines replaced by gated equivalents; no forbidden files. Handed to Lane 5. |
| 2 Word-timing canary | `codex/claude-word-timing-production` @ `/home/user/tinct-wt/word-timing` | clean commit available (offline part) / blocked (R2 + GPU part) | Pushed `d478e8b3` (tooling cherry-pick of `9684bd4e`, conflicts resolved to tooling verbatim) + `df82698f` (`docs/word-timing-canary-2026-09-04.md`). Both Genesis 1 pilots validated offline: 100% token coverage (738/738 WEB, 735/735 Modern), 0 timing defects, provenance present, SHA-256 recorded. Tooling tests 2+9+3+4 pass. Four-shard plan balanced to ~440.5 h each; calibration batch Genesis 1–10 WEB+Modern (20 chapters). No app/src changes. Blocked: upload, R2 GET verification, 1×/2× production highlighting check, GPU benchmark. Unblock: dedicated least-privilege R2 object read/write token on a RunPod GPU pod. Tooling defects noted in the doc (no post-upload GET/hash, no true no-overwrite guard). |
| 3 Reading memory + recap | `codex/claude-reading-memory-recap` @ `/home/user/tinct-wt/reading-memory` | clean commit available (release 2, not yet integrated) | `733e11cf`, one commit on `3888548d`, 25 files (+2564/−1): new `app/src/readingMemory/*`, `LabApp.tsx` +16 lines (observer only), `public/lab/index.html` recap card, `vite.config.ts` entry, migration `app/supabase/migrations/20260904_reading_memory_sessions.sql` (additive table + RLS + trigger projection from `user_data` key `reading-memory`; NOT applied anywhere). Focused 48/48, full 858/858, build + verify-bundle pass. Browser evidence: Genesis 1 unfinished (phone + desktop) shows truthful location + exact excerpt; completed chapter shows finish date. NOT verified: real Supabase sync, migration on a live DB, live summary button. Owner decisions listed in the lane report (completion signal = forward turn onto final rendered page; single versioned `user_data` row; summary opt-in button; 30-min gap = new session). Needs migration review by Anders before integration. |
| 4 100-cover collection | artifact-only | blocked | The pilot was generated with Codex's built-in image tool (`render_pilot.py` only overlays type with Pillow). This environment has no image-generation tool, so the 92 remaining covers must be generated in Codex. Control room reviews contact sheets and manifest once pushed under `artifacts/`. |
| 5 Integration + release | `codex/claude-convergence-integration` @ `/private/tmp/tinct-claude-convergence-integration` | implementing (integrating Lane 1) | Subagent fast-forwarding `5a678f3c` onto baseline, running focused + full tests, build, verify-bundle, phone/desktop browser checks of V1 and V2, and an A/B regression against the baseline build. Deploy blocked here until Anders adds `CLOUDFLARE_API_TOKEN` and egress for api.cloudflare.com / tinct.app to the environment; fallback is Codex on the Mac (step 3). |

## Decisions

- Integration lane will push the integrated result to `codex/claude-convergence-integration` (a fast-forward of `codex/lab-convergence` + approved lane commits) rather than rewriting `codex/lab-convergence`, because deploy cannot run from this environment and the repo policy is never to push a convergence state that is not deployed.
