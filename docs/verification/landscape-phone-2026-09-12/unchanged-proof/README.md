# Did portrait, tablet and desktop change? No.

Three pieces of evidence, in order of how much they settle.

## 1. The gate cannot match anything but a phone lying down

`../media-query-gate.txt` evaluates the exact query used by all four
stylesheets with `window.matchMedia`, on ten emulated devices and windows:

```
(orientation: landscape) and (max-height: 500px) and (any-pointer: coarse)
```

It matches on the three landscape phones and on nothing else — not a phone
upright, not an iPad in either orientation, not a desktop window, not a
half-width desktop window, and not even a deliberately short 1440x420 desktop
window, which the coarse-pointer condition excludes. No existing rule was
edited in any of the four files; every change is a new rule inside that query.

## 2. 44 of 56 screenshots are pixel-identical

`baseline-origin-main/` is every surface rendered on `origin/main`;
`after-change/` is the same surfaces with this branch applied, same build
pipeline, same Playwright run, at 393x852 portrait, 768x1024 and 1024x768
tablet, and 1440x900 desktop. `pixel-comparison.txt` has the per-file result.

File hashes are not a useful test here: PNG encoding is not byte-stable, and
16 files have different SHA-256s with zero different pixels.

## 3. The 12 that differ are two animated surfaces, and they match once frozen

The remaining differences are all on `app` (the entry hero runs a light and
cover animation) and `reader-call-*` (the voice orb is a live canvas). Two
captures of one *identical* build differ in 13 of these 56 files, and for the
call shots that same-build noise is as large as the cross-build difference.

`animated-surfaces-frozen/` settles it: both surfaces captured with
`prefers-reduced-motion: reduce`, which stops both animations, on a build of
`origin/main` and on a build of this branch. Under that the capture is
deterministic (two runs of one build are pixel-identical), and every one of
the eight before/after pairs is pixel-identical.
