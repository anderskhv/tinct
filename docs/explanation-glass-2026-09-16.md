# Compact explanation and glass controls — 16 September 2026

Anders approved subtle popup translucency and rounded Chat/Talk controls inspired
by the introduction panel, then requested four initial text lines and a top
expand control filling the reader screen.

The shared reader popups use a 96% paper tint with backdrop blur, keeping text
legible even where browser blur compositing differs. Chat/Talk remain side by
side with centered icons, pill borders, a soft gradient and subtle inset/shadow.
Explanation loading and content reserve four 18px/1.4 lines plus padding. Overflow
still scrolls. Expand fills the viewport inside a 12px inset; Reduce restores
the compact card without regenerating the explanation. Its original anchor is
preserved while expanded; the expanded overlay sits above reader controls.
Selection gestures and reading position behavior remain unchanged.

Verification: 184 files / 2,334 tests pass; build and bundle verification pass.
Headless Chromium touch and WebKit 390×844 check stable loading/ready bounds,
four-line height, full-screen expansion, exact collapse restoration, paragraph
formatting, selection locking and horizontal actions. Desktop Chromium and phone
WebKit check recolor/save/close, Chat context and immediate draft clearing.
Light and dark screenshots were inspected. API replies are mocked; no microphone
or audible playback is used. Physical iOS compositing remains unverified.
Evidence: `output/explanation-glass-2026-09-16/`.

Production commit `6140233a`; bundle `index-CEa4QOMr.js`.
[Deploy 35089934678](https://github.com/anderskhv/tinct/actions/runs/35089934678)
passed, including exact-bundle comparison and smoke tests. Production phone
Chromium/WebKit acceptance passed loading expansion/collapse, ready expansion/
collapse, fixed geometry and four-line height. Desktop/light and phone Chat,
formatting and recolor regressions passed on tinct.app. Screenshots and production
JSON are saved in the evidence directory.

Documentation check: 12 maintained historical files, zero errors/reminders.
The newly merged cloud-first/archive policy prevents writing generated assets or
product updates into the historical Documents tree. Its product brief therefore
still describes the preceding release; this tracked report owns the current
follow-up behavior until documentation migration reconciles that brief.

Next action: this visual feedback batch is deployed and production-accepted;
no user deployment or routine acceptance action remains.
