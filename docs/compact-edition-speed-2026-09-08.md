# Compact edition selection and speed dismissal — 8 September 2026

Edition samples are capped at 28 words and three visible lines, reducing to two lines on short phones and one in landscape. Restore the single-viewport book page; shrink cover/description on short screens and retain both full-width actions. Side-by-side samples still update with the selected editions. Browser layout assertions cover The Republic at 390×664, 390×844, 375×600, 320×568, 844×390 and 1423×772.

V2 playback speed has a Done button. Tapping outside or pressing Escape dismisses the popover without changing speed or pausing audio. Regression covers all three dismissal paths. V1 snapshot preserved. Full suite: 141 files / 1,549 tests passed; build and bundle verification passed.

Production verification follows below.

Deployed via npm run deploy: Worker a88d2f45-120b-4448-a675-f1cbf6391d4e. Production bundle `/assets/index-FOAGQlyr.js`, SHA256 `fd1041b9eeb3e999c14d0e5245e48b6892b74f5e5c5fc671940c15ef2c0d2f30`, matches local bytes. Production Republic page layout passed all six viewport checks. Screenshots: `/Users/andershvelplund/.codex/visualizations/2026/09/08/01a07ff0-a87f-7031-8b2f-d050d06d52bd/compact-editions`. Signed-in library regression shows all three finished books; reader document/body/theme color match.

Live Chromium playback verification passed: changed to 1.75×, closed with Done, reopened, and dismissed by tapping the chapter heading. Selected speed remained 1.75×. Speed-open and speed-dismissed screenshots saved alongside the edition-layout images.

Follow-up: slider tick labels now follow the numeric 0.5–3 range (0%, 20%, 60%, 100%) rather than equal spacing. Uses the existing V2 20px thumb so label centres account for its travel inset.

Speed-label correction deployed: Worker 4e9fc63c-455d-4400-a480-a0e6bde939ab, bundle index-CPuU_rcb.js, SHA256 5374ceb7b18655980df9d639b639de8b18e7984da922d7c8113d71baa26f6298 (live/local match). Live 390×664 browser check: 1× label centre 102.04px, expected thumb centre 102.14px; within 0.1px. Done and outside dismissal remain working. All 1,549 tests and build gates passed. Screenshot: `/Users/andershvelplund/.codex/visualizations/2026/09/08/01a07ff0-a87f-7031-8b2f-d050d06d52bd/compact-editions/speed-aligned.png`.
