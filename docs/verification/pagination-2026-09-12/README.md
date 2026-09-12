# Pagination verification — 2026-09-12

Built with `CI=true npm run build`, served from `app/dist`, driven with Playwright
(chromium 1194). `before-*` is the branch base (`7e8d54e25`, main after PR #53);
`after-*` is this branch.

## 1. Continuous page numbers on the desktop spread

The folio at the foot of each leaf, and the "% of book" in the footer.

| Case | Before | After |
| --- | --- | --- |
| Bible, Lamentations 3, 1920×1080 | `1`, `2` — 67% | `1,321`, `1,322` — 66% |
| Bible, Lamentations 3, 1440×900 | `1`, `2` — 67% | `2,400`, `2,401` — 66% |
| Bible, Jeremiah 50, 1920×1080 | `1`, `2` — 67% | `1,351`, `1,352` — 65% |
| Bible, Jeremiah 50, 1440×900 | `1`, `2` — 67% | `2,412`, `2,413` — 65% |
| Bible, Genesis 1 (chapter opening) | `1`, `2` — 0% | `1`, `2` — 0% |
| The Communist Manifesto, ch. 1 | `1` — 1% | `1` — 3% |
| Lamentations 3, smallest type (0.8) | `1`, `2` — 67% | `507`, `508` — 66% |
| Lamentations 3, largest type (2.2) | `1`, `2` — 67% | `3,950`, `3,951` — 66% |

The narrower window and the larger type both produce more pages, as a smaller
leaf should. The percentage is computed from the page and the total, so the two
figures are the same quantity and cannot disagree.

Walking 20 page turns from Psalm 495 onwards, across chapter boundaries, the
folio never repeats within a chapter and never goes backwards:

```
957 · 957 · 958,959 · 960 · 960 · 961 · 961 · 962 · 963 · 963 · 964,965
966 · 966 · 967,968 · 969 · 970 · 970 · 971 · 971 · 972
```

(A repeat across a boundary is a very short Psalm that occupies less than one
estimated page.)

## 2. The line lost at the foot of a column

Leftover space below the last line of each leaf, in pixels and in lines.
Negative means the painted column overflowed its box.

| Case | Before (left, right) | After (left, right) |
| --- | --- | --- |
| Lamentations 3, 1920×1080 | −8.3px (−0.25), −30.3px (−0.90) | +27.1px (0.81), +5.1px (0.15) |
| Lamentations 3, 1440×900 | +3.3px (0.10), −18.6px (−0.55) | +3.3px (0.10), +16.8px (0.50) |
| Jeremiah 50, 1920×1080 | −4.7px (−0.14), +5.1px (0.15) | +28.9px (0.86), +0.6px (0.02) |
| Jeremiah 50, 1440×900 | +24.2px (0.72), +6.8px (0.20) | +24.2px (0.72), +6.8px (0.20) |
| Genesis 1 (chapter opening) | −26.5px (−0.79), **+38.7px (1.15)** | +15.3px (0.45), +3.3px (0.10) |
| Manifesto ch. 1 (short book) | +6.4px (0.19), — | +6.4px (0.19), — |
| Lamentations 3, largest type | −30.5px (−0.54), −24.7px (−0.43) | +26.4px (0.46), +35.3px (0.62) |
| Lamentations 3, smallest type | +3.9px (0.19), chapter end | +3.9px (0.19), chapter end |

After the fix no column overflows, and no column is short by a whole line: every
leftover is under one line, and the two leaves of a spread are within one line
of each other.

A sweep of mid-chapter spreads before the fix found columns overflowing by up to
1.36 lines and columns short by 1.10 and 1.15 lines. After the fix the worst
mid-chapter leftover is 0.86 of a line.

## 3. Phone unchanged

`before-phone-lamentations-3-393x852.png` and `after-phone-lamentations-3-393x852.png`
are identical in layout. The per-chapter page numbering the phone uses is
untouched; only the "of book" estimate in the footer moves, because it is now
measured rather than guessed from the chapter index.

## Phone paragraph spacing (reported separately)

Measured paragraph gaps at 393×852, `/reader`, fresh profile per setting:

| Setting | Gap | `--lab-paragraph-gap` |
| --- | --- | --- |
| Compact | 2.2px | .08em |
| Standard | 7.7px | .28em |
| Generous | 15.1px | .55em |

Driven through the real UI (super menu → Settings → Advanced → Paragraph
spacing) the gap moves live without a reload: 7.7px → 15.1px → 2.2px. The same
figures hold in Pride and Prejudice and The Communist Manifesto, and on
`/lab/phone` and `/lab/reader`. Desktop is 1.8 / 6.4 / 12.5px at the three
settings. The control works; see the PR body for why it can look as though it
does not.
