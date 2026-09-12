# About page: the reveal's device illustration — September 12, 2026

Branch `claude/about-illustration-20260912b`, from `main` at `3d26cdca`.

## How the illustration is composed

Four images stacked inside `.device-canvas`, all 1536 x 1024, in this order:

1. `assets/about-v20/assets/devices-transparent-v10.webp` — one photograph of three devices on a
   transparent ground: a laptop, an e-reader and a phone. **The device frames, including every
   bezel, live only here.** The three screens are not cut out of it; they are filled flat (the
   laptop's and phone's cream, the e-reader's grey), which is what the reveal shows while the
   ensemble is fading in.
2. `screen-desktop-v1.webp`, 3. `screen-eink-v1.webp`, 4. `screen-phone-v1.webp` — one lit screen
   each, pre-projected onto its four screen corners with the same homography the story used to apply
   live in CSS, then flattened to a transparent full-frame layer. The story fades them in one after
   another over the reveal's scroll progress.

So each screen layer is painted **over** the photo, and a screen layer that overruns its own screen
paints over whatever device is in front of it. That is the mechanism behind two of the four
problems below.

`scripts/render-about-reveal-screens.mjs` renders layers 2-4 (Playwright + Chromium).
`scripts/retouch-about-devices.py` is the one-off retouch of layer 1.

## What changed, per object

| object | before | after |
| --- | --- | --- |
| laptop | silver machine; the photo's cream screen fill showed as a bright hairline along the top and left of the lit screen | midnight body — deck, trackpad, front lip and lid edges through a tone curve that keeps blacks black and holds the specular edges; screen fill repainted in the library screen's navy, so no white edge |
| e-reader | a 640x968 screenshot cropped 25 px each side by object-fit:cover; menu button; active chapter pill; justified text with gaps; "[Exit.]" at the foot | drawn at the layer's own 360x620; no menu button; pill in its resting state; e-ink greys; ragged right; the opening of Moby-Dick chapter 1 |
| phone | top left corner missing — the laptop's screen layer painted the library across it | the phone's body is cut out of the laptop's layer, and the photo's repaint keeps a matching hole, so the frame and its highlight survive |
| composite | — | no white fringes, no transparent bites, no halo where the layers overlap; the light still comes from the upper left on all three |

## Bytes

| file | before | after |
| --- | --- | --- |
| devices-transparent-v10.webp | 628,310 | 53,764 |
| screen-desktop-v1.webp | 38,604 | 37,098 |
| screen-eink-v1.webp | 31,656 | 27,632 |
| screen-phone-v1.webp | 15,020 | 14,710 |
| **total** | **713,590** | **133,204** |

The photo was lossless WebP (VP8L) and is now lossy at quality 90; the alpha edges were compared at
5x and show no fringing. The illustration is 580 KB lighter.

## How it was verified

- **Each object alone, at high zoom**, composited in Python over the story's ground (`#191411`) and
  over magenta to expose any transparent bite: `before-*.jpg` / `after-*.jpg` in this directory.
- **The scene in the page** (`*-scene.jpg`), Playwright with the sandbox's Chromium at 1440x900 and
  393x852, DPR 2, `reducedMotion: 'no-preference'` — headless Chromium otherwise forces reduce and
  the story never runs at all. Two things make this scene awkward to catch, and both were worked out
  the hard way: the story clamps how fast its progress may follow the scroll, so the page has to be
  *walked* in small steps (110 px) rather than jumped to, and the same scroll position is not the
  same picture twice; and its scene frames stack, so an "opaque" ensemble can still be behind a
  later scene. The harness therefore shoots *during* the walk, at every stop where the ensemble's
  whole opacity chain is 1 and all three screens are lit, and the frame kept here was chosen from
  those candidates. Before and after are at 27,610 / 27,830 (desktop) and 27,390 / 27,280 (phone) —
  the same beat, within one 110 px step.
- `node scripts/about-story.test.mjs`: 7 tests pass. No asset path changed, so the existence check
  in `patch-about-story.mjs` needed no edit.
- No page errors at any stop, either viewport.
