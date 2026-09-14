# Reader screenshot fixes — 14 September 2026

Reviewed: 2026-09-14

Status: deployed and production-verified on September 14 at app commit `219085187`. The separate character coverage, exact clipping and cold-start observations below remain open.

## Proven causes and changes

- Selection and audio color were applied to spans containing the separator before a word. Spaces now live outside the painted word spans in Read, Compare, audio and matching hidden measurement markup. The native fragment paginator shares the desktop measurement builder, including emphasis and verse units, so the measured text matches the visible text. The legacy unflagged DOM baseline was deliberately regenerated for this shared fix.
- The compact dictionary card inherited a bottom divider from its retired toolbar layout. That divider is removed only for compact definitions.
- A phone passage is a flex child with horizontal auto margins. Without an explicit width, a short final sentence shrank the page from 390px to 307.7px, centering the reading surface and leaving 41px edge margins outside its gesture handler. Phone passages now retain full width and border-box sizing. Desktop already specifies full width.
- Library handoffs without a comparison edition and older position records reset the stored Compare preference. Handoffs now preserve the preference; restored positions retain the latest settings choice, including None.
- Anders approved removing Show Compare during this task. Selecting a second edition now enables Compare; choosing None disables it. The primary edition is excluded from second-edition options. Changing the main edition to the comparison edition disables comparison. The existing internal preference remains to avoid unnecessary storage migration.

## Verification

- All 980 lab tests passed across 77 files, including selection/audio span boundaries, measured/painted verse spacing, old-position resume, Compare selection/None and existing position/navigation regressions.
- Production build and bundle verification passed with the required public environment values: `index-XNZtiVYo.js`. Normal chunk-size warning remains.
- `app/scripts/check-reader-feedback.cjs` ran against local Vite with every `/api/` request mocked to 404, so no chat, audio or account operations were invoked. Fifteen pages of The Republic Book 1 passed in WebKit at 390×650 and Chromium at 1440×950: no duplicate word anchors, no leading/trailing separator spaces, full phone page width, and minimum bottom clearance 28.95px mobile / 66.84px desktop. Compare survived handoff and reload. A short-sentence DOM clone tested the width regression without mutating React state; the real reader accepted a right-edge touch.
- Artifacts: `/tmp/tinct-reader-feedback-artifacts/results.json`, `phone-republic.png`, `desktop-republic.png`, `phone-short-tail.png`.
- Shared documentation checker: 12 checked, zero errors/reminders. Current main lacks the newer checker; used the existing shared checkout checker, so this is a check of those maintained notes rather than a claim that main has adopted them.

## Limits and next action

The exact reported Republic final-line clipping was not reproduced on the settled current build in the sampled pages. No speculative pagination algorithm change was made. A mid-sentence page end such as “Accordingly we went” is still allowed: it is not evidence that source words were lost. The screenshot font settings and actual Safari browser chrome cannot be reconstructed exactly from the images. The full-width correction addresses the separately reproduced centered-tail/dead-margin fault.

The older desktop traversal script counted newly word-addressed comparison text as primary words. With its selector corrected temporarily, its full chapter Read/Compare traversal passed, then its live-audio wait timed out under local Vite. That temporary script edit is not part of the change; the dedicated mocked check above is the reproducible validation.

The coordinated integration and release below supersede the local-only checkpoint above. Keep the exact clipping report open for fresh source/viewport evidence.


## Integrated chat fixes and release evidence

The coordinating task integrated reader changes with chat changes in
`88f64c5f0` and `811c6dc1e`, based on current main `2135e7e41`.
The model remains `claude-sonnet-5`, medium effort for typed replies.

- Await the book-grounded handler inside the route's try/catch; failed asynchronous
  calls previously bypassed its error response.
- Retry a rejected transient HTTP response once before answer text, respect short
  Retry-After cooldowns, and bound response headers/stream-idle waits to 30 seconds.
  Ambiguous network failures and backend requests after text are not replayed.
  Existing voice-hop retries remain separate and unchanged.
- Treat unexpected EOF and SSE error events as failures, retain a partial typed
  answer visibly without saving it as completed, and preserve the original user
  question during a manual retry. Failures before text remain uncharged.
- Return readable sanitized errors. Dark/light notice and retry use theme ink,
  with a 44px retry target. A mock service overload followed by success passed in
  mobile 390×844 and desktop 1180×820 layouts, with 11.53:1–17.95:1 contrast.
- Welcome relevant historical, theological and commentary questions, including
  named preachers; do not invent quotations or claim unperformed source searches.
  This changes the policy, not the model or available external research tools.
- Retain structured diagnostics (status, safe provider error type, provider request
  ID, whether text started), with automatic invocation logs disabled. No prompts,
  responses or credentials are added to these diagnostic events. Config checked
  against installed Wrangler 4.124.0 and current Cloudflare Workers Logs docs.

All **2,238 tests across 169 files passed** after integration. Production build and
bundle verification passed: `index-TMbh7_vS.js`. Standard chunk-size warnings and
jsdom canvas/navigation warnings remain; they do not fail these gates.
[Deployment run](https://github.com/anderskhv/tinct/actions/runs/34826851952).

Historical failure causes remain unproven: accessible Sept13 19:00–22:00 CPH
aggregate metrics show 3,157 invocations and zero runtime exceptions, but cannot
identify caught provider/HTTP failures. The current token cannot query retained
telemetry (403) or zone HTTP-status analytics. New diagnostics support future
investigation; no claim of measured improvement in live error rate is made.


## Production verification

[Run 34826851952](https://github.com/anderskhv/tinct/actions/runs/34826851952)
completed successfully, including 2,238 tests, build/bundle gates, a byte-for-byte
check of the deployed JavaScript, and all 15 production smoke checks. Live
`/lab/phone` serves **`index-DHPH4osN.js`**, matching that CI build. Local and CI
hashes differ because Vite stamps a per-build timestamp; the CI artifact is the
production reference. Worker version `121c889d-4079-44d4-92f2-e8a17c5879e9`.

- Live Republic traversal: 15 pages per surface in mobile WebKit and desktop
  Chromium. No duplicate anchors, clipped sampled ink or separator whitespace
  in word spans; minimum footer clearance 28.95px / 66.84px. Compare persisted
  through library entry and reload; full-width short-tail fixture and actual
  mobile right-edge tap passed.
- Live UI with mocked chat endpoints: mobile 390×844 `/lab/phone` and desktop
  1180×820 `/reader`, each in dark/light. Busy SSE notice, contrast, 44px retry,
  successful retry and single original question all passed. No real provider
  request was made; this establishes interface recovery, not live answer quality
  or an improved provider error rate.
- Durable local evidence: `/Users/andershvelplund/Documents/Projects/Tinct/output/launch-week-reader-fixes/production-reader/`,
  `production-chat/`, and `production-release.json` in the same parent directory.

## Remaining observations

The supplied 13.64-second recording is a cold navigation. At 11.50s its Luke 11
header appears over a blank body with provisional “1 / 2 of book · 50%”; at 12.00s
real text appears and the footer becomes “10,849 / 13,262 of book · 82%”. Theme
colors also flash around 10s. Track provisional progress/theme paint as a separate
cold-start issue. It contains no page-turn/Compare interaction and no clipped final
line, so does not resolve those screenshot questions.

Zedekiah, Themistocles and Euthydemus were separately diagnosed as missing content
entries/mentions in live packages, not stale hashes or broken click targets. No
character content was changed in this app release. Library mobile/desktop wireframes
remain proposals awaiting Anders's review; no library redesign was deployed.


Final live settings checks passed on `/lab/phone` at 390×844 and desktop `/reader`:
Show Compare is absent; choosing modern-en enables Compare; None disables it and
survives reload. The saved chapter/word remained exact (fixture locations 1/3:17
on mobile and 1/21:265 on desktop). Real desktop single-word lookup selected
exactly “these” without separator spaces; compact definition divider measured
0px. Screenshots/results are in the durable `production-settings/` artifact folder.
These UI checks use isolated browser fixtures and mocked API endpoints.


September 14 loading follow-up: Anders confirmed the recording demonstrates slow
returning-reader startup. Two narrow loading costs are now fixed; authenticated
recovery remains open. [Startup evidence and release](returning-reader-load-2026-09-14.md).
