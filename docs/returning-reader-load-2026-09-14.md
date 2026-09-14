# Returning reader startup — 14 September 2026

Reviewed: 2026-09-14

Status: narrow fixes verified locally; production release pending.

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
location and write suppression must stay coherent. Next investigate a same-account
local preview with writes suspended, or instrument startup phases to identify
which wait actually occurs. No auth/position gate change is included here.
