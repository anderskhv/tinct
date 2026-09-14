# Library recap layout — September 14, 2026

Reviewed: 2026-09-14

## Status and scope

Approved design implemented locally on `codex/library-recap-layout-0914`, based
on main `941eaa09f`. **Not deployed.** Independent review and coordinated release
remain next. Worktree: `/tmp/tinct-library-recap-layout-0914`.

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

Artifacts: shared repository `output/launch-week-library-wireframes/implementation/`
contains screenshots, both browser result files, build and test logs. Updated
proposal: `output/launch-week-library-wireframes/library-reading-now.html`.

## Release handoff and limits

No reader/audio/character/translation code changed. The Library boot helper is
also consumed by reader code; its added timestamp is optional and backwards
compatible. Build-generated sitemap date churn is excluded. Dependencies and
local environment are untracked convenience files, not part of the release.

The shared checkout's launch-week plan and PIPELINES contain the dated Library
checkpoint and Anders's strict instruction that all substantive work belongs to
subagents; root only structures feedback, assigns work and facilitates. Those
shared coordination edits preserve existing changes and are not bundled into
this isolated app commit. Release owner must update shipped product status only
after deployment and production verification.
