# Library and preparation polish — September 17, 2026

Anders approved the compact animated preparation mockup and production release.
Released in [PR 96](https://github.com/anderskhv/tinct/pull/96), commit
98b805afaa43ee3813768ecbe831670c4c3c3657, on top of completed reader work at 93f55e8.
Earlier unmerged PR 95 is superseded and closed.

## Failure class and correction

Retired library CSS hid desktop captions and clipped covers; immediate pointer
capture swallowed book clicks; a small philosophy sample replaced the full index.
The library now exposes all 92 eligible books across nine existing Houses, grouped
by Shelves. Reel capture starts only after a drag threshold. Mouse clicks,
horizontal wheel/trackpad input, keyboard selection and vertical page scrolling
are verified. The hero uses continuous background treatment and uncropped covers.

Preparation previously enlarged portrait artwork to a blurry landscape and used
content-driven centered bounds that moved when expanded. The approved dark frame
has stable dimensions and one scroll area, left-aligned preface text, collapsed
Characters with individual introductions, and all existing Primary, Secondary/None
and Audiobook controls. Cover artwork animates from its displayed position on
entry, with reduced-motion support. Cover-screen buttons are more compact.
Existing Chat/Talk callbacks, edition persistence, reading position and narration
remain in their existing owner paths.

## Verification

- [Pre-merge cloud verification](https://github.com/anderskhv/tinct/actions/runs/35200465864):
  2,377 tests passed; build and bundle verification passed; explicit documentation
  check passed; phone 390x844 and desktop 1440x900 browser checks passed.
- [Production deployment](https://github.com/anderskhv/tinct/actions/runs/35200796146):
  Node 24.13.0, approved npm run deploy path, exact served-byte bundle comparison,
  production smoke and live browser acceptance passed.
- Production bundle: /assets/index-IbdNB-Q0.js.
- [Final visual review](https://github.com/anderskhv/tinct/actions/runs/35201489716):
  explicit /lab/phone?chrome=v2 and /reader verified that exact bundle. Plain
  /lab/phone selects legacy chrome, so the current-chrome flag is required.
- [Screenshots and acceptance JSON](https://github.com/anderskhv/tinct/actions/runs/35201489716/artifacts/10488357695):
  artifacts/library-layout/{phone,desktop}.png, cover, preparation,
  preface-expanded, options, catalogue and last-category screenshots.
- Reviewed the actual cloud-generated phone and desktop library/preparation images.
  Assertions confirm all catalogue IDs, uncut centered hero, no horizontal page
  overflow, real pointer entry into a book, and identical frame bounds after
  preface, Characters and edition expansion.

All browser checks used isolated headless Chromium with audio and microphone
disabled. This validates controls and navigation, not physical-device gestures or
a new live voice conversation. Existing voice/Chat behavior was not rewritten.

Status: deployed and production-verified. No remaining correction identified in
the approved scope; further visual changes should follow new feedback.
