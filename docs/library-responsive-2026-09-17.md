# Responsive landing and library — September 17, 2026

Status: deployed and production-verified.
[PR 98](https://github.com/anderskhv/tinct/pull/98), release commit
253f0b5ad3b96f8d9e2d8961dbd556b695aed202.

## Failure class and correction

Phone copy, covers and Start reading previously used independent absolute/fixed
viewport offsets. Short real-browser viewports overlapped them; taller previews
showed a large gap. Tablet artwork inherited conflicting intrinsic sizing.

The landing now puts copy, proportional animated covers and the action in one
content flow on phone and portrait tablet. Wider landscape screens use bounded
columns. Pause, reduced motion, offscreen/hidden pausing and orientation changes
are retained. Overflow scrolls rather than squeezing or overlapping content.

The library has a centred starter reel, full existing descriptions, a visible
estimated reading time and horizontal category rows. All 92 eligible books remain
under the nine existing Houses; taxonomy data is unchanged. Mouse dragging,
trackpad/native touch scrolling and keyboard access remain available. Mobile drops
the header and Popular choices label, reduces the heading and dock, and exposes
existing sign-in/account routes inside Search. Desktop keeps a discreet mark and
sign-in. Librarian replies reuse the existing safe Markdown renderer.

The approved [book preparation](library-preparation-polish-2026-09-17.md), edition
controls and reader position owners were not changed.

## Verification and release evidence

- [Final pre-merge cloud verification](https://github.com/anderskhv/tinct/actions/runs/35208170312):
  2,377 tests, build, bundle verification and documentation checks passed.
- [Production deployment](https://github.com/anderskhv/tinct/actions/runs/35208646130):
  Node 24.13.0, npm run deploy, exact served-byte bundle comparison, smoke test,
  reader/preparation acceptance and full responsive acceptance passed.
- Production bundle: /assets/index-4-GcCkqo.js.
- Both Chromium and WebKit covered 375x560, 390x660, 430x780, 820x1024,
  1180x720 and 1440x900. Phone/tablet contexts used mobile viewport, touch and 2x
  device scale. Checked overlap, cover proportions, estimates, retained description,
  shallow dock, category visibility, scrolling/drag, animation, reduced motion,
  tablet rotation and complete catalogue coverage.
- [Production screenshots and geometry](https://github.com/anderskhv/tinct/actions/runs/35208646130/artifacts/10491012240):
  entry-responsive/ and library-layout/ directories in the artifact.
- [Explicit reader-route review](https://github.com/anderskhv/tinct/actions/runs/35208774143):
  /lab/phone?chrome=v2 at 390x844 and /reader at 1440x900 served the exact bundle.
  Preface/character/edition expansion preserved frame bounds.
  [Reader screenshots](https://github.com/anderskhv/tinct/actions/runs/35208774143/artifacts/10490487700).
- Actual generated production screenshots were reviewed for mobile landing/library,
  tablet portrait/landscape, desktop and preparation.

WebKit initially needed frame-based waits for its first animation clock and
mobile resize events; probes now wait for actual transform/structure changes with
bounded timeouts rather than assuming a fixed short sleep.

## Limits and next action

All checks used isolated silent headless browsers, with microphone and model POST
requests blocked. This is not physical iPhone/iPad verification, nor live Chat/Talk
model testing. On the shortest viewport, lower catalogue content requires natural
scrolling; full descriptions are never truncated.

Previously reported preparation-chat suggestion submission and authentication
return continuity remain separate follow-ups. This responsive release does not
claim to fix those reader-owned paths. Next action: assess any further real-device
feedback against these saved screenshots and geometry.
