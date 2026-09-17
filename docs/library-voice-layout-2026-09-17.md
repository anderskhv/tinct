# Library conversation layout — September 17, 2026

Status: cloud implementation; release acceptance pending.

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
