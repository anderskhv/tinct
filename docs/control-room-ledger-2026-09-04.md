# Tinct control-room ledger — 2026-09-04

Control room session: https://claude.ai/code/session_01GXmqM6Sj4F3tgUtr6DmuLN
Execution environment: Claude Code remote Linux container (not Anders's Mac).

## Baseline

| Item | Value |
|---|---|
| Clean production baseline (session start) | `origin/codex/lab-convergence` = `3888548da6d9bfe5c484e6227132203c30a1d9bb` ("Fix stale mobile word timing cache", 2026-09-04 18:45 +0200) |
| Production baseline after release 1.1 | `origin/codex/lab-convergence` = `923873db` (Voice V2 preview + fixes D, A+C, B), Worker `1636d551-ff28-4ee3-9b63-c6002e2b5da1`, bundle `index-DZGQHspb.js`, deployed 2026-09-05 06:40 UTC |
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
| 2 Word-timing canary | `codex/claude-word-timing-production` | **production verified** (canary) / blocked (GPU benchmark) | Rerun 3 with `CF_R2_TOKEN` (custom token: Account · Workers R2 Storage · Edit): bucket metadata 200, known-object read OK, both Genesis 1 pilots uploaded with no-overwrite check, GET/hash/schema/provenance verified, production serves `bible/web-en/ch1/words.json` (72,454 B) and `bible/modern-en/ch1/words.json` (72,226 B) at 200, headless highlighting check passes at 1× and 2× (word identity follows media time; not perceptual). Report `5462d952`. Learned: R2-page tokens fail wrangler's REST path with 10000; a Workers R2 Storage token works. Rerun 2 accidentally used the 05:31 R2-page token. Remaining: Genesis 1–10 GPU calibration (GrokBot running it on RunPod, no upload), human listening pass. |
| 3 Reading memory + recap | `codex/claude-reading-memory-recap` | clean commit available (release 2, awaiting rebase after release 1.1) | `733e11cf` + `52f98309` on `3888548d`. Round 2 implements Anders's decisions: automatic summary once per gap-closed session (signed-in only, ≤3 attempts, 1 h back-off, excerpt fallback, stored with provenance in the session so it syncs), sign-in adoption of `owner: null` sessions staged before `clearLocalUserData()` in `useStorageBootstrap.ts` (+14 lines, main-app seam — review at integration), other accounts' sessions never adopted or shown, offline-while-signed-in shows "Will sync when you're back online" with queued drain on `online`. Focused 190/190, full 892/893 (catalogue flake, passes alone), build + verify-bundle pass. Browser evidence 15/15 checks in `/home/user/tinct-wt/reading-memory-evidence/round2/`. Migration untouched (already applied). NOT verified: real Supabase round-trip, real `/api/chat`. |
| 4 100-cover collection | artifact-only | blocked | The pilot was generated with Codex's built-in image tool (`render_pilot.py` only overlays type with Pillow). This environment has no image-generation tool, so the 92 remaining covers must be generated in Codex. Control room reviews contact sheets and manifest once pushed under `artifacts/`. |
| 5 Integration + release | `codex/claude-convergence-integration` | deployed (release 1.1) / implementing (release 2) | Release 1.1 `923873db` deployed 06:40 UTC via `CI=true npm run deploy`: Worker `1636d551-ff28-4ee3-9b63-c6002e2b5da1`, bundle `index-DZGQHspb.js`, 893 tests green, production checks v1/v2 + A/B/C ok; control room re-verified bundle from a second container; `codex/lab-convergence` fast-forwarded to `923873db`. Release 2 (reading memory) now being cherry-picked onto `923873db`. |
| 6 Position flip-flop (issue D) | `codex/claude-lab-position-merge-gate` | **production verified** | `7fe2f14c`, live as `b8f38e7d` in release 1.1. |
| 7 Reader chrome (issues A + C) | `codex/claude-lab-reader-chrome` | **production verified** | `6c1d45de`, live as `e583a419` in release 1.1; continued-tail class and title wake confirmed on tinct.app. |
| 8 Chat keyboard (issue B) | `codex/claude-lab-chat-keyboard` | **production verified** | `58fac972`, live as `923873db` in release 1.1; Chat tap focuses the composer on tinct.app (headless); real iOS keyboard pending Anders's phone. |

## Decisions

- 2026-09-05 (Anders): "I'm the only real user, others have churned. Just deploy; prefer to test production until we can't do that any more." Control-room policy from here: every clean lane commit is integrated and deployed after `npm test`, `npm run build`, `npm run verify-bundle` pass; production is the test surface; long baseline A/B browser comparisons are dropped; release 2 (reading memory) deploys straight after rebase + gates. Exception: concepting. When Anders is exploring an idea rather than asking for a shipped change, do not build or deploy; if in doubt whether a message is concepting or an implementation request, ask first.

- 2026-09-05 morning feedback (Anders): four lab phone-reader issues A–D investigated by a separate agent; Anders authorized "apply the best fixes and push to production". Fix lanes 6–8 created on the production baseline; Lane 5 integrates and deploys them as release 1.1 before release 2 (reading memory). The investigator's claim that production ran unpushed code was wrong: it compared against `main`; the deployed code is `codex/lab-convergence`.

- Integration lane will push the integrated result to `codex/claude-convergence-integration` (a fast-forward of `codex/lab-convergence` + approved lane commits) rather than rewriting `codex/lab-convergence`, because deploy cannot run from this environment and the repo policy is never to push a convergence state that is not deployed.
