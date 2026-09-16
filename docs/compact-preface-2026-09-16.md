# Compact preparation preface — September 16, 2026

Status: shipped in `4e01f2b6`, bundle `index-DNd1pbmk.js`.
[Deploy 35108491609](https://github.com/anderskhv/tinct/actions/runs/35108491609)
passed tests, build, bundle verification, exact production bundle comparison and
all 15 smoke checks.

The desktop breakpoint forced all preface paragraphs open and removed its
disclosure button. Long prefaces therefore forced scrolling before the reader
chose to expand anything. Desktop now starts with the same three-line preview
as mobile and offers the same expand/collapse control. The shared scroll area
explicitly allows flex shrinking; expanded content stays inside the frame while
the navigation buttons remain visible. Existing preface text, editions and
reading-position behavior are unchanged.

Production acceptance: Great Expectations at 1440×900 and 1024×680 in Chromium,
390×844 in WebKit, and The Histories at 1440×780 in Chromium. All default panels
fit without scrolling. All expanded panels remain within the viewport, with
bottom edition controls reachable and no document overflow. At 1024×680 the
default content previously exceeded its scroll area by 435 pixels; it now fits.

Evidence: `output/compact-preface-2026-09-16/acceptance.json` and screenshots
in the same local artifact directory. Tests used isolated headless browsers,
muted audio, and blocked chat/voice provider calls. Physical native select-menu
appearance was not changed or tested.

Documentation checker: 12 maintained files, zero errors or review reminders.
The historical Documents product brief remains archived and untouched under the
cloud-first preservation policy; this report records the shipped change.
No further action required for the reported overflow.
