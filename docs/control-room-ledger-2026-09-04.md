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
| 3 Reading memory + recap | `codex/claude-reading-memory-recap` | clean commit available (release 2, awaiting rebase after release 1.1) | `733e11cf` + `52f98309` on `3888548d`. Round 2 implements Anders's decisions: automatic summary once per gap-closed session (signed-in only, ≤3 attempts, 1 h back-off, excerpt fallback, stored with provenance in the session so it syncs), sign-in adoption of `owner: null` sessions staged before `clearLocalUserData()` in `useStorageBootstrap.ts` (+14 lines, main-app seam — review at integration), other accounts' sessions never adopted or shown, offline-while-signed-in shows "Will sync when you're back online" with queued drain on `online`. Focused 190/190, full 892/893 (catalogue flake, passes alone), build + verify-bundle pass. Browser evidence 15/15 checks in `/home/user/tinct-wt/reading-memory-evidence/round2/`. Migration untouched (already applied). NOT verified: real Supabase round-trip, real `/api/chat`. |
| 4 100-cover collection | artifact-only | blocked | The pilot was generated with Codex's built-in image tool (`render_pilot.py` only overlays type with Pillow). This environment has no image-generation tool, so the 92 remaining covers must be generated in Codex. Control room reviews contact sheets and manifest once pushed under `artifacts/`. |
| 5 Integration + release | `codex/claude-convergence-integration` | implementing (release 1.1: fixes D, A+C, B) | Release 1 deployed (`5a678f3c`). Now cherry-picking `7fe2f14c` → `6c1d45de` → `58fac972` onto `5a678f3c`, full gates, browser matrix per fix, A/B vs baseline; then deploy via fresh environment session. |
| 6 Position flip-flop (issue D) | `codex/claude-lab-position-merge-gate` | clean commit available | `7fe2f14c` on `5a678f3c`, 8 files. Diagnosis held: cloud fetch gated on `chapters.length < 2` while the Bible fallback ships 2 Genesis chapters; `cloudDoneRef` latched before the merge. Fix: fallback marked `chaptersProvisional`, cloud fetch waits for the real manifest, latch only after merge, synchronous local write on page turn, hide-after-reading settles visited book, `keepalive` PUT, dirty flush on load/`online`, merge-before-write by time, rev seeded from store. Regression test fails on baseline, passes after. Focused 139/139, full 879/879, build + verify-bundle pass. Browser A/B: baseline flip-flops by fetch order; fixed build lands on Hebrews 3 in both orderings and stays. |
| 7 Reader chrome (issues A + C) | `codex/claude-lab-reader-chrome` | clean commit available | `6c1d45de` on `5a678f3c`, 5 files. A: continued page tails get `is-continued`; a pre-paint measurement marks `is-tail-full` only when the tail fills ≥ 0.8 of the column, and only those get `text-align-last: justify` (respects left-align preference). Page count and per-page words for Genesis 1 proven identical (9 pages) vs baseline build. C: title tap reveals hidden controls; chapter pill tappable while hidden and opens the picker. Focused 121/121, full 870/870, build + verify-bundle pass. Evidence in `/home/user/tinct-wt/reader-chrome-evidence/`. |
| 8 Chat keyboard (issue B) | `codex/claude-lab-chat-keyboard` | clean commit available | `58fac972` on `5a678f3c`, 7 files. Root cause confirmed: the Ask pane is conditionally mounted, so nothing could focus at tap time; fix uses `flushSync` + synchronous `focus({preventScroll})` in the tab handler, `scrollTo(0,0)` on visual-viewport resize/scroll while a text field is focused, composer padding flush under `has-phone-keyboard`. Focused 158/158, full 870/870, build + verify-bundle pass, 13/13 browser checks. NOT verifiable here: real iOS keyboard. |

## Decisions

- 2026-09-05 (Anders): "I'm the only real user, others have churned. Just deploy; prefer to test production until we can't do that any more." Control-room policy from here: every clean lane commit is integrated and deployed after `npm test`, `npm run build`, `npm run verify-bundle` pass; production is the test surface; long baseline A/B browser comparisons are dropped; release 2 (reading memory) deploys straight after rebase + gates. Exception: concepting. When Anders is exploring an idea rather than asking for a shipped change, do not build or deploy; if in doubt whether a message is concepting or an implementation request, ask first.

- 2026-09-05 morning feedback (Anders): four lab phone-reader issues A–D investigated by a separate agent; Anders authorized "apply the best fixes and push to production". Fix lanes 6–8 created on the production baseline; Lane 5 integrates and deploys them as release 1.1 before release 2 (reading memory). The investigator's claim that production ran unpushed code was wrong: it compared against `main`; the deployed code is `codex/lab-convergence`.

- Integration lane will push the integrated result to `codex/claude-convergence-integration` (a fast-forward of `codex/lab-convergence` + approved lane commits) rather than rewriting `codex/lab-convergence`, because deploy cannot run from this environment and the repo policy is never to push a convergence state that is not deployed.
