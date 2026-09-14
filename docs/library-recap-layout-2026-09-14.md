# Library recap layout — September 14, 2026

Reviewed: 2026-09-14

## Status and scope

Approved design shipped in `63cf67c79` and production-verified on September 14.
[Deploy run 34834096441](https://github.com/anderskhv/tinct/actions/runs/34834096441)
passed its test, deploy, exact-bundle wait and production smoke steps. Production
served app bundle `index-BByW1_zt.js` and Library boot script
`library-boot.js?v=20260914-1` during the independent check.

Reading now and Finished use sentence-case headings. The selected book has one
smaller location and a relative “Last time you read” date derived from actual
reading records. A fixed three-line recap preview and affordance row preserve
Continue and surrounding section geometry whether recap content is empty,
pending, cached, unavailable or short. Expand reveals longer real recap content;
Collapse restores the preview. Selecting another book resets expansion. Long
book/location labels stay on one line with ellipsis and full DOM/title text.

First-paint snapshots use the same slot/order and carry an optional real activity
timestamp. Older snapshots show an unavailable date until confirmed records load;
the snapshot creation time is never substituted for reading activity. Existing
recap eligibility, cache keys, delayed requests and Continue position targets
are unchanged. A retained open recap remains closable after refresh/resize. The
confirmed caption sheds its loading class so Continue is no longer dimmed.

## Verification

- `npm test`: 170 files, 2,240 tests passed; focused Library suite 63 passed.
- `npm run build` and `npm run verify-bundle`: passed. Main bundle
  `index-DjOpNln_.js`; verification reported expected public values and no secrets.
- Reusable `app/scripts/check-library-recap-layout.cjs`: Chromium and WebKit,
  390×844, 1180×820 and 1440×900, dark/light OS preferences. Library retains its
  intentionally navy palette in both OS modes.
- Pending → no recap → long cached recap → explicit expand/collapse → switching
  from expanded → delayed short recap: Continue, caption, shelf and section
  geometry remained within one CSS pixel (observed unchanged within each run).
- A late response for the previously selected book did not paint into the new
  book. Same-caption refresh retained Collapse. Two mocked recap requests and
  zero reading-position writes per scenario. All APIs mocked and external
  requests blocked; no provider call or real account data used.
- Updated review artifact includes sample long/short/no-recap states with stable
  geometry. Production UI shows only real recap text.
- Independent release review repeated the 63 focused tests, all 2,240 app tests,
  build and bundle verification. It traced first-paint/hydrated parity, actual
  reading timestamps, recap keys and selection/refresh handlers and found no
  actionable regression or scope drift.
- The same Chromium/WebKit matrix then passed against `https://tinct.app` at
  390×844, 1180×820 and 1440×900. Pending, empty, long, short, stale-response,
  expand/collapse, refresh and book-switch checks all passed with stable collapsed
  geometry and zero mocked position writes.

Artifacts: shared repository `output/launch-week-library-wireframes/implementation/`
contains implementation screenshots, browser results, build and test logs.
`output/launch-week-library-wireframes/production/` contains the independent live
Chromium/WebKit screenshots and result files. Updated proposal:
`output/launch-week-library-wireframes/library-reading-now.html`.

## Release result and limits

No reader/audio/character/translation code changed. The Library boot helper is
also consumed by reader code; its added timestamp is optional and backwards
compatible. Build-generated sitemap date churn is excluded. Dependencies and
local environment are untracked convenience files, not part of the release.

The feature is released; no follow-up is required for the approved Library scope.
Slow authenticated startup remains a separately documented investigation and was
not changed by this release.
