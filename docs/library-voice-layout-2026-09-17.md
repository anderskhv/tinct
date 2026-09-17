# Library conversation layout — September 17, 2026

Status: shipped on tinct.app; release receipt below.

Reported failure class: the library mounts LabVoiceCall outside the reader's
.lab[data-chrome-version="v2"] styling scope. The component renders, but its
stage, connection line and round controls appear unstyled on all viewports.
Its fixed 520px wrapper also fights the available phone height.

The fix owns call layout inside the library only. Desktop keeps a bounded glass
voice window and the existing chat window. Mobile Chat and Talk fill the visible
viewport, hide the dock, lock background scrolling and keep Close/End available.
The viewport follows keyboard/browser-chrome resizing. Recommended books occupy
their own scrollable space rather than covering voice controls. Escape closes
and stops voice; existing voice sessions and the ten-interaction policy are unchanged.

A faint rule before Browse the library separates discovery from catalogue shelves.

Acceptance: tests, build, verify-bundle, docs and silent Chromium/WebKit at phone,
tablet and desktop sizes. Browser call checks disable audio and microphone; they
verify real call markup/layout, not live model or physical-device behaviour.
Production release must confirm exact bundle and repeat the live matrix.

## Release receipt

- [PR #104](https://github.com/anderskhv/tinct/pull/104), merged as
  `f439bfb8c5ffc625c05de323e6e6538d54da92fa`.
- [Pre-release verification](https://github.com/anderskhv/tinct/actions/runs/35224754135):
  2,390 tests, documentation checks, build and verify-bundle passed.
- [Production deployment and acceptance](https://github.com/anderskhv/tinct/actions/runs/35225461477)
  records the exact deployed bundle hash and byte-for-byte served-bundle check,
  smoke test and repeat of the full responsive browser matrix.
- Screenshots: artifact `production-library-preparation`, paths
  `entry-responsive/*-library-chat.png` and `*-library-talk.png`.
  Sizes: 375×560, 390×660, 430×780, 820×1024, 1180×720, 1440×900;
  Chromium and WebKit, plus a 420px keyboard-height chat check.
- Call screenshots intentionally show a disconnected state: microphone/audio
  are disabled and POST requests blocked. Connected controls and session cleanup
  have controlled component coverage; this is not a live voice-service test.
- No physical-device acceptance claimed. No reader position or voice model changes.

Next action: no additional work queued; address any concrete physical-device
follow-up without changing the reader's existing voice or position behaviour.
