# Reader polish — 9 September 2026

Shipped from the clean `Tinct-reader-stabilization` checkout. App commits
`e8061172` and `5aa81332`. The unrelated main checkout was preserved.

## Changes and root causes

- Mobile's hidden column flow prohibited word breaking while the visible leaf
  allowed hyphenation. This conservative map left one or two extra lines empty
  in reproduced Democracy in America pages. V2 now fits complete leaf fragments
  offscreen, using the same spacing, verse groups and hyphenation as the reader.
  The shared greedy fitter fills each leaf before publishing the map; page turns
  select an existing page, with the existing final overflow guard retained.
  A first fitting attempt exposed a second difference: whitespace belongs inside
  the visible Bible verse unit, unlike the column-flow copy. The fragment probe
  now matches that markup as well. V1 keeps its existing flow.
- Desktop side chevrons retain their central placement in smaller 40px circles.
  Each leaf has its own number. Compare footers identify Original/Read and Compare
  with edition names; the book percentage is outside the leaves, including during
  playback. The old playback rule hid the entire desktop progress rail.
- Desktop page turns strongly dim the header title, chapter and play/T controls,
  removing the chapter pill fill. The top or bottom area wakes the controls;
  the first pointer press on a quiet header only wakes it.
- Desktop audio is a compact translucent pill. Its paused close control is inside
  the same row, and turning a page dismisses paused controls. The existing anchor
  restoration handles the resulting layout change. Mobile paused transport
  behavior is preserved.
- Desktop current-word paint uses a visible warm wash and underline in both
  themes. Paragraph fallback now paints its actual active paragraph, with a slim
  marker. The audio pill identifies the narrated edition.
- V2 composer controls use equal 36px painted discs inside 44px targets, with
  consistent colors and 20px icons. The old Send/voice background shorthand also
  reset background-clip, making them appear larger than the microphone despite
  equal outer dimensions. Dictation retains its stop square; conversation mode
  stays hidden during dictation and draft editing and returns after sending.

## Verification

- 1,585 tests across 146 files passed; build and verify-bundle passed.
- Real-browser mobile chapter sweeps in Chromium and WebKit checked every source
  word exactly once, backward page identity, footer clearance, interior-page
  fullness and stable post-turn text. Democracy introduction: 5,570 words;
  Jeremiah 43: 473 words; Jeremiah 44: 1,258 words. Page counts differ by browser
  typography, as expected.
- Local desktop regression checked full Read/Compare coverage, paragraph alignment,
  cold-font first-paint stability, repeated refresh, speed controls and cover fit.
- Local WebKit fixture-account return first painted the correct saved word with
  delayed supporting data, a deliberately delayed position response, and a
  different book. No real account record was edited.
- Live tinct.app Chromium and WebKit checked circular controls, quiet/wake chrome,
  separate leaf numbers and book progress, Compare labels, all mobile word sweeps,
  dictation/draft/send transitions, equal control styling, actual Modern English
  audio advancing one highlighted word, speed changes, an in-pill close button,
  and dismissal on page turn. Both light and dark audio screenshots were inspected.
- Live WebKit Jeremiah 43–44 audio/pause/page/Compare/resize transitions passed
  on the initial polish deployment; the final follow-up only keeps the desktop
  rail visible during audio. Chapter-end Chat regression passed locally at normal
  phone, small phone with large text, and desktop sizes.
- Final production `/lab/phone` entry captured at 390×844. All 15 production smoke
  checks passed. AI/account endpoints in browser QA were intercepted; dictation
  events and Chat replies were fixtures, with public audio reads allowed.

## Deployment

Approved `npm run deploy` succeeded with Node 24; no GitHub Actions run was used.
Final Worker version: `6ab4c24a-2317-4884-9c2d-565d21efe29a`.
Live bundle: `assets/index-D64QsHqF.js`.
SHA256: `9cb85942f354e832b4fdf270c8390b77974d597bd3ff542131431958fd86af86`.
The bytes fetched from tinct.app match the deployed local build exactly.

Screenshots, browser results, bundle evidence and logs:
`/Users/andershvelplund/.codex/visualizations/2026/09/09/tinct-reader-polish/`.
Regression driver: `app/scripts/check-reader-polish.cjs`.

## Verification limits and remaining audio work

The reported Reeve/Bowen original text is paired with Modern English narration;
only Modern English is audio-enabled for Democracy in the current registry.
The chapter-1 Modern English timing sidecar exists and live desktop word following
was verified in both engines. Exact word following cannot truthfully be applied
across differing wording. Original text therefore keeps paragraph correspondence.
No timings were fabricated, no edition was switched automatically, and no audio
assets were generated. The separate English timing-readiness audit remains the
source for corpus repairs. Browser-engine checks do not certify physical iPhone
behavior or acoustic timing accuracy.
