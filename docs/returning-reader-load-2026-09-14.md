# Returning reader startup — 14 September 2026

Reviewed: 2026-09-14

Status: two narrow fixes deployed and production-verified at app commit `aa4c459fd`.
The broader authenticated-return delay remains open.

## Evidence and changes

Anders clarified that the supplied recording demonstrates slow loading after time
away. At 11.50 seconds the Luke 11 header is visible with blank text and provisional
progress; at 12.00 seconds the passage and real progress arrive. The recording
alone cannot separate network, token refresh, cloud position, and rendering delays.

Two avoidable costs were reproduced:

- The root page loads its font stylesheet before its synchronous returning-reader
  redirect. A controlled browser test delaying only that stylesheet by 1,000ms
  delayed the old redirect to 1,016ms. Moving the stylesheet after the existing
  boot script lets the redirect happen at 11ms while CSS is still pending.
  Inline background styles remain first. New visitors and signed-out Library
  still receive their styles, cached snapshot and sign-in affordance.
- Character validation starts complete source-edition downloads for both Bible
  editions even when Compare is disabled. The unused KJV response transferred
  1,290,847 bytes (4,514,903 decoded). The comparison character hook now receives
  no book when Compare is off. Primary character validation and enabled Compare
  retain their existing behavior; this changes no text or character content.

A live-browser baseline on a simulated slower mobile connection showed first
visible passage at 6.40s cold and 0.96s warm; unthrottled measurements were 0.59s
and 0.32s. Fixture: Chromium 390×844, 150ms latency, 200,000 B/s download, CPU 4×,
Bible WEB, Compare off, isolated saved-location handoff, API/auth traffic blocked.
These are single lab samples, not Anders's connection or an authenticated return.
They establish a cold/warm gap, not the cause of his full recorded wait.

## Verification

- All 2,239 tests across 170 files passed, including the new no-unused-edition
  fetch regression and existing Compare, position and navigation tests.
- Controlled entry browser checks cover recent-reader redirect with slow CSS,
  ordinary redirect, new visitor, and signed-out Library.
- Production build and bundle verification passed: `index-B0TU8_sE.js`.
  The existing large-chunk warning remains.
- Reusable check: `app/scripts/check-returning-entry.cjs`.
- Durable baseline: `output/launch-week-load-performance/reader-load-baseline.json`.
  Controlled entry evidence: `output/launch-week-reader-fixes/returning-entry/`.

## Unresolved path and next action

Known-user session recovery allows up to 12 seconds; authenticated cloud position
fetch allows another 10 seconds. Chrome v2 deliberately keeps the passage hidden
until initial position resolution. The ordinary 3-second fallback is disabled on
that path. These are code-path limits, not measured attribution of the recording.
Do not remove that gate or display a guessed chapter: account ownership, saved
location and write suppression must stay coherent. Next instrument auth, position request, required text, font/pagination readiness
and first visible passage separately. Record milliseconds and categorical outcomes
only, excluding account/book IDs, positions, content, tokens and full URLs.
No auth/position gate change is included here.

The read-only follow-up found that `initialPositionResolved` controls display,
write permission and late-cloud reconciliation together. Showing interactive
local text without separating these would allow a later jump or stale write.
Completion writes also need their own suspension guard. Existing regressions in
`useLabPositionSync.test.tsx` at lines 678 and 703 protect account separation and
stale first paint; their direct-token harness needs a stalled `getSession` case
before auth recovery changes. A local preview is a larger design change.


## Production release

[Deploy run 34828517729](https://github.com/anderskhv/tinct/actions/runs/34828517729)
succeeded with 2,239 tests, build/bundle gates, exact deployed JavaScript byte
comparison and all 15 production smoke checks. Live bundle: **`index-eT11vyxd.js`**.
Worker version: `5466f87a-3ca3-4b9e-b139-94585f344d87`. Local and CI hashes differ
because the build includes a timestamp; the CI bundle is the production reference.

Live browser verification passed on `/lab/phone` at 390×844 and `/reader` at
1440×950. Luke 11 text rendered, primary character validation still requested WEB,
and neither surface requested the unused KJV source. The root's live HTML places
boot before font CSS. API and auth requests were blocked in these isolated
fixtures; this is not an authenticated-return or live character-content test.
Screenshots: `output/launch-week-load-performance/production/phone.png` and
`desktop.png`; machine-readable checks: `production/verification.json`.

Post-release measurements using the same cold/warm setup were 0.52s / 0.26s
unthrottled and **6.12s / 0.95s** throttled. No unused comparison source request
occurred in any of the four runs. The small first-passage timing change is within
single-run variation and is not evidence that the long startup issue is solved.
The dominant throttled entry JavaScript download still took about 3.54s; auth and
cloud wait phases were excluded by this fixture. Remaining work stays open.
Evidence is in `output/launch-week-load-performance/after/reader-load-baseline.json`.
