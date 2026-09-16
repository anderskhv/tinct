# Selection and explanation stability — 16 September 2026

Anders reported physical Safari selection handles over Tinct's yellow highlight,
page/edition movement while highlighting, stacked Chat/Talk actions and an
explanation that moved when loading finished.

## Mechanism and correction

The prior refinement enabled selectable text for WebKit CSS Highlight painting,
but cancelling pointer events did not reliably suppress native touch selection.
The reader now owns single-touch defaults through non-passive touchstart/touchmove
listeners and cancels selectstart during a custom gesture. Native callouts and
browser panning are disabled on the selectable paginated surface, independently
of whether Compare is enabled. A stale native range within the passage is cleared
when the hold claims selection. Continuous range painting and keyboard selection
remain. Controls and hearing/word-seek surfaces are excluded.

The selection handler explicitly called page navigation when a drag reached the
outer 20 pixels. That path is removed: a claimed selection cannot turn pages or
swap editions. Quick swipes retain their existing navigation behavior. The old
cross-page-selection regression is deliberately replaced with the new invariant.
The legacy reader DOM baseline changes only by the selection-ownership class;
this protection applies to the shared reader, not only Chrome V2.

Explain reserves a 34dvh / 285px reading area from loading through completion,
with overflow scrolling. Chat and Talk occupy equal columns on one row. Full
Markdown and exact explanation handoff remain unchanged.

Browser event reference: [MDN touch events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
and [touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action).

## Verification

184 test files / 2,334 tests pass; build and bundle verification pass.
Local Chromium injected touch input and WebKit phone checks exercise Job 6 WEB:
both edges reached during a held selection, unchanged reader text/edition/scroll,
empty native selection, continuous highlight ranges, identical popup bounds at
loading and completion, horizontal actions, formatted overflowing content.
Desktop Chromium and phone WebKit regression checks also pass recolor-and-close,
note persistence, exact explanation in Chat history and immediate draft clearing.
All companion responses were mocked; audio was disabled and no microphone used.

Evidence and repeatable browser script: `output/selection-stability-2026-09-16/`.
Physical iOS Safari's native selection UI cannot be certified by headless WebKit;
this supersedes the prior report's assumption that pointer prevention alone
suppressed it. No book content was changed.

Deployment and production acceptance pending.
