# About reading hierarchy

Reviewed: 2026-09-14

Anders approved the animated preview: the original question stays small and muted,
using the same EB Garamond font as the larger statements below it. Original copy
is unchanged. No extra labels, numbering, navigation or explanatory text.

## Implementation

Commit fcf79b78f scopes the layout to the better-reading scene. All three statements
share one fixed position. Scene progress selects one complete statement at .18,
.44 and .70; earlier statements disappear instantly. Reverse scrolling restores
the corresponding statement without timers or remount resets. The chapter grows
from 160 to 300svh to provide a question-only beat and readable statement holds.
The standalone preview used timed playback; production follows the existing
scroll interaction so the visitor controls pace.

The shared failure was equal visual weight and cumulative statement reveals,
which crowded mobile. The fix applies to desktop and phone, with shorter-screen
spacing. All other scenes retain their layout and timing.

## Verification

Nine focused About checks pass, including forward/reverse reveal boundaries.
Desktop 1280×720 and phone 390×844 inspected locally; each statement replaces the
previous one without shifting the question. Build and bundle verification pass.
The limited-worker local suite passed 2,251/2,252 tests; one unrelated Compare
test exceeded its five-second timeout under parallel load. That test passed in
isolation (261ms). CI passed all 2,252 tests in 175 files. The shared documentation
checker passed: 12 documents, zero errors or review reminders.

Deployment [34863106322](https://github.com/anderskhv/tinct/actions/runs/34863106322)
succeeded, including all 15 smoke checks. Release bundle index-CTq7jrxT.js was
byte-verified by CI; Worker version ff792b6c-b28f-4eb1-bb45-b9a77b843c3e.
The subsequent main deployment aa9e74ffd also passed (run 34863416826), retains
this About change, and serves index-Jn0bIL_p.js, observed in /lab/phone.

Production /about checked at 390×844 and 1280×720: quiet question, single large
statement, and original copy; mobile reader rendered at /lab/phone. An initial
browser DNS failure cleared in a fresh tab. Screenshots: output/about-reading-hierarchy/
production-mobile.png, production-desktop.png and production-reader.png.

Next: Anders reviews the live section's pacing; no further copy changes approved.
