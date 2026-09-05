# Tinct control-room ledger — 2026-09-04

Control room session: https://claude.ai/code/session_01GXmqM6Sj4F3tgUtr6DmuLN
Execution environment: Claude Code remote Linux container (not Anders's Mac).

## Baseline

| Item | Value |
|---|---|
| Clean production baseline (session start) | `origin/codex/lab-convergence` = `3888548da6d9bfe5c484e6227132203c30a1d9bb` ("Fix stale mobile word timing cache", 2026-09-04 18:45 +0200) |
| Production baseline after release 2.1 | `origin/codex/lab-convergence` = `08f47288` (+ sentence-level follow for weak paragraphs), Worker `0943b5f0-f1a0-4dbb-be64-5d75ae3bf2dd`, bundle `index-C5ArRbVl.js`, deployed 2026-09-05 08:04 UTC |
| Production baseline after release 2 | `origin/codex/lab-convergence` = `ef6ba7ec` (+ reading memory recap), Worker `c3e3e696-6aaf-408f-9a25-c848a552dcd1`, bundle `index-DWzW5uk-.js`, deployed 2026-09-05 07:08 UTC |
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
| 2 Word-timing canary | `codex/claude-word-timing-production` | **production verified** (canary) / blocked (GPU benchmark) | Rerun 3 with `CF_R2_TOKEN` (custom token: Account · Workers R2 Storage · Edit): bucket metadata 200, known-object read OK, both Genesis 1 pilots uploaded with no-overwrite check, GET/hash/schema/provenance verified, production serves `bible/web-en/ch1/words.json` (72,454 B) and `bible/modern-en/ch1/words.json` (72,226 B) at 200, headless highlighting check passes at 1× and 2× (word identity follows media time; not perceptual). Report `5462d952`. Learned: R2-page tokens fail wrangler's REST path with 10000; a Workers R2 Storage token works. Rerun 2 accidentally used the 05:31 R2-page token. Calibration measured (`b8d23149`): ≈20× real time on an RTX 4090, 18/18 sidecars valid, 3 genealogy chapters under the 85 % gate. Decisions 2026-09-05: no Danish; four Community pods (~$40); GrokBot launched Shards 1–4 (Secure Cloud; Community had no capacity) but every upload failed 403: the RunPod secret held the 53-char `cfat_` account token, not the working custom token. Pods stopped; Anders rolling the custom token into the RunPod secret and the Claude env, then relaunch. Anders: "Build 1 and 2" → Lanes 9 and 10. |
| 3 Reading memory + recap | `codex/claude-reading-memory-recap` | **production verified** | Live in release 2 (`ef6ba7ec`): 976/976 tests, production recap card shows a truthful location and exact KJV excerpt after real page turns, fresh context shows no card, `/lab/reading-memory.js` 200. Still unexercised by any lane: real signed-in sync/adoption and the automatic summary via the live Worker (Anders tests in production). |
| 4 100-cover collection | Codex on the Mac, `codex/claude-cover-collection` | implementing (v2 reference set under review) | Anders switched art direction to painterly full-bleed after seeing Codex's newer artworks (Frankenstein lab, Odyssey ship). Codex pushed `f0cd8af6`: v2 reference set for 10 titles, `render_v2.py`, three contact sheets incl. a v1-vs-v2 thumbnail proof on the dark library. Control-room review: direction approved; thumbnails hold on dark; fixes before the remaining 88: title/author scrim boxes read as grey slabs (use soft gradient or none), 4/10 figure compositions and 4/10 window/doorway framings breach the one-third rule (Meditations repeats the Frankenstein recipe), Pride and Prejudice weak at thumbnail. |
| 5 Integration + release | `codex/claude-convergence-integration` | deployed (releases 1, 1.1, 2, 2.1) | Release 2.1 `08f47288` deployed 08:04 UTC: Worker `0943b5f0-f1a0-4dbb-be64-5d75ae3bf2dd`, bundle `index-C5ArRbVl.js`; control room re-verified bundle; `codex/lab-convergence` fast-forwarded. |
| 6 Position flip-flop (issue D) | `codex/claude-lab-position-merge-gate` | **production verified** | `7fe2f14c`, live as `b8f38e7d` in release 1.1. |
| 7 Reader chrome (issues A + C) | `codex/claude-lab-reader-chrome` | **production verified** | `6c1d45de`, live as `e583a419` in release 1.1; continued-tail class and title wake confirmed on tinct.app. |
| 8 Chat keyboard (issue B) | `codex/claude-lab-chat-keyboard` | **production verified** | `58fac972`, live as `923873db` in release 1.1; Chat tap focuses the composer on tinct.app (headless); real iOS keyboard pending Anders's phone. |
| 9 Whisper text biasing | `codex/claude-word-timing-production` | clean commit available | `f5b23de7`. `--bias-text {off,prompt,hotwords,both,auto}` in the generator; `auto` cascades both → hotwords → plain with an echo guard and a plain cross-check. Measured on CPU: Genesis 5 WEB 83.5→97.7 %, Genesis 10 WEB 90.5→99.1 %, Genesis 10 Modern 87.5→99.5 %, all paragraphs ≥ 0.85; Genesis 2 control unchanged/improved. Default stays `off` (identical call to the running pods); `auto` costs 1–2.3× wall, so it is the second-pass mode for chapters under the gate. Additive provenance `alignment.bias`. Tests 21/21, 13/13, 2/2. Not listened to by a human. |
| 10 Reader sentence fallback | `codex/claude-lab-follow-fallback` | **production verified** | Live in release 2.1 (`08f47288`): 987/987 tests, production Genesis 1 still word-level (ratio 1.0), zero page errors. A genuine sub-0.85 chapter arrives with the Lane 9 second pass. |

## Decisions

- 2026-09-05 (Anders): "I'm the only real user, others have churned. Just deploy; prefer to test production until we can't do that any more." Control-room policy from here: every clean lane commit is integrated and deployed after `npm test`, `npm run build`, `npm run verify-bundle` pass; production is the test surface; long baseline A/B browser comparisons are dropped; release 2 (reading memory) deploys straight after rebase + gates. Exception: concepting. When Anders is exploring an idea rather than asking for a shipped change, do not build or deploy; if in doubt whether a message is concepting or an implementation request, ask first.

- 2026-09-05 morning feedback (Anders): four lab phone-reader issues A–D investigated by a separate agent; Anders authorized "apply the best fixes and push to production". Fix lanes 6–8 created on the production baseline; Lane 5 integrates and deploys them as release 1.1 before release 2 (reading memory). The investigator's claim that production ran unpushed code was wrong: it compared against `main`; the deployed code is `codex/lab-convergence`.

- Integration lane will push the integrated result to `codex/claude-convergence-integration` (a fast-forward of `codex/lab-convergence` + approved lane commits) rather than rewriting `codex/lab-convergence`, because deploy cannot run from this environment and the repo policy is never to push a convergence state that is not deployed.
