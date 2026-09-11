# About page: phone fixes and desktop pass — September 11, 2026

Branch `claude/about-phone-fixes-20260911`, from `main` at `b1776ab7` (the coordinator's merge of the
About page, `a2c61c34`, plus two docs commits). Anders reported four things on https://tinct.app/about
from an iPhone (Safari, private mode). All four are fixed below, with the root cause for each, plus four
further problems the phone, tablet and desktop passes turned up. Every change is an anchored edit in
`app/scripts/patch-about-story.mjs` or a rule in `app/public/assets/about-v20/about-v21.css` (and the
behaviour script `about-v21.js`), so the next import of the Sites project re-applies it.

Evidence lives in `docs/verification/about-phone-fixes-2026-09-11/` (`before/` from `main`, `after/`
from this branch). The full scroll series (82 stops per viewport, eight viewports, 656 frames) was
captured but is too large for the repository; the curated set below has 15 stops per viewport covering
every scene, plus per-stop measurements in `after/after-report.json` and `before/before-report-main.json`.

## How it was verified

Playwright 1.56 with the sandbox's Chromium (`/opt/pw-browsers/chromium`). **WebKit is not installed in
this sandbox** (`/opt/pw-browsers` has Chromium only and `playwright install` is not allowed), so the phone
runs are Chromium with iPhone emulation (`isMobile`, `hasTouch`, iPhone UA, DPR 2), not Safari. Two iOS
behaviours Chromium cannot emulate were handled explicitly:

- **Large vs small viewport.** On iOS Safari `vh` is the *large* viewport (toolbar collapsed) while a
  `100svh` sticky stage is the *small* one. Issues 1 and 2 come from that difference. Chromium has
  `vh = svh`, so a *simulated* before-run pins the page's `vh`-sized heights to what Safari computes for a
  660 px small viewport (`--sim-ios` in the harness); the after-fix layout uses no `vh` at all, so the
  simulation is unnecessary for it.
- **Toolbar tint and over-scroll** cannot be screenshotted here; the fix is verified by computed style
  (every layer under the story reports `rgb(25, 20, 17)`) and by the `theme-color` meta.

Viewports: 390×844, 390×760, 430×932, 430×844 (light and dark `prefers-color-scheme`), 390×660 (an
iPhone's small viewport with Safari's bars showing), 1440×900, 1920×1080, 1024×768. Each run scrolls the
whole page in half-viewport steps, waits 700 ms per stop for the story's scroll-speed cap, screenshots,
and records: computed backgrounds of `html`, `body`, `.story-root` and the stage; the headline vs page
rectangles in the reading scenes; the pill's rectangle and opacity; whether the closing section's own
button is on screen while the pill is visible; horizontal overflow; console errors, page errors, failed
requests and 4xx responses.

Served locally from `app/public` (`/about` → `about.html`, as the Worker does). The one console error in
the whole series is the local static server's missing `/favicon.ico` on the first context of a run
(production serves it: 200).

## The four reported issues

### 1. Dark green band at the bottom of every screen

**Root cause.** The v20 build is the reader-era design: `:root{--background:#132b27}` and
`body{background:var(--background)}` (green), and the scrolling story container `.journey.story-root`
has `background:#132b27` with per-scene greens (`.journey[data-scene=books]{background:#284a3b}` …).
The bookshelf variant repaints `body` (`body:has(.story-root[data-bookshelf=true]){background:#191411}`)
and every *scene frame* inside the sticky stage in the story's dark brown, but not the story container
itself and not `html`. The sticky stage is `100svh` tall. On iOS Safari the visible area is taller than
that whenever the toolbar is collapsed, and the translucent toolbar shows what is under it, so the
container's green painted the bottom ~100–250 px at every scroll position. Before the fix the harness
reported `.story-root` = `rgb(19, 43, 39)` (green) at every stop on every viewport; `html` was
transparent. No `theme-color` meta existed, so Safari also tinted its bars from the green canvas.

**Fix.** `about-v21.css:9` paints `html`, `body` and `.journey.story-root[data-bookshelf=true]` in
`#191411` and removes the container's background transition; `patch-about-story.mjs:75` adds
`<meta name="theme-color" content="#191411">` to `about.html`. After: every layer reports
`rgb(25, 20, 17)` at all 656 stops.

### 2. "And a great book asks more of you." overlapped by the Hamlet page

**Root cause.** On ≤1024 px the narration was placed in percent of the scene
(`.reading-narration{bottom:72%}`) while the page stage was sized in `vh`
(`.reading-object-stage{top:62%;height:min(56vh,640px);transform:translateY(-50%)}`). The scene is
`100svh`; on iOS `vh` is the large viewport. With Safari's bars showing (svh ≈ 660, vh ≈ 780) the page is
437 px tall and its top lands at 62 % · 660 − 218 = 191 px, level with the headline's last line
(bottom 185 px). The narration's other beats overlap by 19 px in the simulation (`before/…language-overlap.png`,
`…character-overlap.png`); on a real iPhone with a smaller svh the overview line goes under the page as
Anders saw. Chromium at 390×844 cannot show it because there `vh = svh`.

**Fix.** `about-v21.css:112–118`: one unit system. The scene defines `--page-h:min(58%,640px)` and
`--page-foot:calc(60px + env(safe-area-inset-bottom,0px))`; the stage is pinned to the bottom
(`bottom:var(--page-foot); height:var(--page-h); transform:none!important`) and the narration ends
`32px` above it (`bottom:calc(var(--page-foot) + var(--page-h) + 32px)`), wider than the headline's
25 px entry slide. Nothing in the phone block uses `vh` any more (the test asserts it). The stage is a
size container and the passage text scales with it (`font-size:clamp(11px,3cqh,16px)`), so the Scene II
passage still fits on a 660 px screen (`after/phone-390x660-light-31-*.jpg`). Minimum headline-to-page
gap after, across all phone and tablet stops: 32 px on the overview beat, 7 px on the language and
character beats (the headline sliding in at low opacity), never negative.

### 3. The phone in the device mockup looked transparent

**Root cause.** `devices-transparent-v10.webp` has its three screens cut out (alpha 0); the lit screens
are separate pre-rendered layers (`screen-{desktop,eink,phone}-v1.webp`) whose opacity the story animates
one after another: desktop over progress .20–.32, e-reader .28–.40, phone .36–.48. The ensemble itself is
fully opaque from progress .28, so for a stretch of the beat the phone is a solid device with a hole in
it showing the dark ground (`before/phone-390x844-reveal-phone-screen-hole.jpg`). The phone lights last,
so it is the one that reads as see-through.

**Fix.** `patch-about-story.mjs:118`: the screens light while the ensemble is still fading in (desktop
.10–.20, e-reader .14–.24, phone .18–.28), so by the time the devices are solid every screen is lit; the
stagger is kept. After: `after/phone-390x844-light-39-*.jpg`, and the same on every viewport.

### 4. "Start reading" pill should be at the bottom on phones

**Fix.** `about-v21.css:27`: at ≤760 px the pill is `bottom:calc(14px + env(safe-area-inset-bottom,0px))`,
centred (`left:50%; transform:translateX(-50%)`), `top:auto`. Measured on every phone viewport: bottom
edge 14 px above the viewport bottom, centred (e.g. 148–242 px at 390 wide). Tablets and desktop keep the
top-right pill. `about-v21.js:31–41` hides the pill while either the footer **or the closing section's
own "Start reading" button** (`.final-read-link`) is on screen; the harness confirms the pill's opacity is
0 at every stop where that button is in view, on all eight viewports. The phone reading scenes reserve
`--page-foot` (60 px + safe area) under the page so the page never sits under the pill.

`env(safe-area-inset-bottom)` is 0 unless the viewport meta uses `viewport-fit=cover`; that meta was
left as is (changing it would extend the page under Safari's bars and is a bigger change than this task).
With bars showing the pill sits at the bottom of the layout viewport, above the toolbar; with bars
collapsed it sits above the home indicator strip Safari keeps.

## Further problems found and fixed during the passes

- **Talk panel clipped on short screens** (`before/phone-390x660-talk-panel-clipped-intermediate.png`,
  an intermediate state of this branch: after the stacking fix, at 660 px the panel's Mute/Transcript/End
  labels fell off its bottom). `about-v21.css:124–130`: the panel is capped to its page and its orbit,
  status word, question and controls scale in container units. After: `after/phone-390x660-light-44-*.jpg`.
- **Audio scene caption under the bottom pill** (`before/…audio-caption-under-bottom-pill-intermediate.png`,
  also intermediate: the portrait captions of the audio iframe sit at the bottom of the scene, where the
  pill now is). `patch-about-story.mjs:161` lifts the iframe's portrait captions to
  `bottom:max(84px,4vh + 56px)`. After: `after/phone-390x844-light-68-*.jpg`.
- **Tablet 1024×768: audio caption cut off at the left edge** — present on `main`
  (`before/tablet-1024x768-audio-caption-cut-left.jpg`). The audio iframe scales a 1000×625 world by
  `max(width/1000, height/625)`; a screen squarer than 1.6:1 scales by height, the world overflows the
  sides, and the captions at its left edge start off-screen. `patch-about-story.mjs:110`: screens with
  aspect below 1.6 keep the captions in the scene (as portrait already does), so their percentages are of
  the visible area. After: `after/tablet-1024x768-68-*.jpg`. 1440×900 (exactly 1.6) and 1920×1080 are
  unaffected.
- **Reveal ensemble height on phones** was `40vh` (large viewport on iOS); now `40svh`
  (`about-v21.css:57`) so it is measured like the scene that contains it.

## Observed and left unchanged

- **Hero copy window on phones.** The opening copy ("We live in the age of slop." → "And with AI, it's
  about to go…") scrolls through a window that ends at about 48 % of the viewport, with a hard edge: a
  headline crossing that line is cut mid-glyph for a moment (`after/hero-transition/hero-390x844-y1300.png`).
  This is the v20 build's phone treatment, identical on `main` and in the MKT branch's own screenshots,
  and it is a masked wipe rather than a card or image covering a headline. Changing it is a design
  decision for the page's owner; it is reported here, not changed.
- The local `/favicon.ico` 404 (production serves it).

## Desktop and tablet pass

1440×900 and 1920×1080 (Chromium, DPR 1), every scene in the half-viewport series and the full-scene
frames in `after/`: opening and slop feed, "And with AI", infinite/stop/better, the bookshelf, effortless,
difficult, the overview page with its three question cards, bridge ("So what could we do about it?"),
the reveal with three lit devices, Talk panel, language (single page, "Modern translation" label),
character (name highlighted, page receded), return (calendar over the page), audio scene (book, car,
couch captions), closing bookshelf with covers and pricing, footer. Findings per scene: nothing found —
no wrong-coloured bands or gaps at any edge (all four ground layers `rgb(25, 20, 17)` at every stop),
no headline overlapped or clipped (the reading scenes are side by side on desktop; the harness's vertical
overlap number is not meaningful there and every frame was inspected by eye), devices solid, pill
top-right and hidden while the closing button or the footer is on screen, no horizontal overflow, zero
console or page errors. The address-bar-collapsed case does not apply on desktop.

1024×768 (landscape tablet): the ≤1024 px single-page layout applies (the MKT branch's choice). Overview,
reveal, Talk, language, character, return, closing and footer are clean; the audio caption was cut off on
`main` and is fixed above.

Dark `prefers-color-scheme` (390×760, 430×844): identical to light; the page does not vary by scheme.

## Tests and gates

- `node scripts/about-story.test.mjs`: 7 tests pass (3 existing + 4 new: ground layers and theme-color;
  pill bottom-anchored on phones and hidden over the closing button; phone reading scenes free of `vh`
  with the page/narration stack; reveal lights every screen before the devices are solid).
- `node scripts/patch-about-story.mjs` twice: second run is a no-op (`0 edit(s) applied, 49 already in
  place`). Applied to the raw import (release commit `840b67fb`'s `about.html` and `assets/about-v20/`),
  it reproduces the checked-in `about.html`, story chunk, bootstrap payload, `audio-journey.html` and
  audio script byte for byte.
- `npm test`, `CI=true npm run build`, `CI=true npm run verify-bundle`: see the results section below.

## Landing and production

Filled in below after the merge and deploy.
