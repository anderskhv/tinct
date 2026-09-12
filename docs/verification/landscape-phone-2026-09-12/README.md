# Tinct on a phone held in landscape — 2026-09-12

## The gate

Every rule added by this branch sits inside one media query, and nothing above
it was edited:

```css
@media (orientation: landscape) and (max-height: 500px) and (any-pointer: coarse)
```

The third condition is not decoration. A desktop window can legitimately be
under 500px tall; `any-pointer: coarse` is what keeps such a window out, while
still matching a touchscreen laptop lying alongside a phone. `any-pointer`
rather than `pointer` because the union is what we want: a device with both a
mouse and a finger still reports coarse among its pointers.

`media-query-gate.txt` proves the gate by evaluation, not by argument.

## Where the rules live

| File | Surfaces |
| --- | --- |
| `app/public/landing.html` | the landing page (`/`) |
| `app/public/lab/landscape-phone.css` (new, linked last in `app/public/lab/index.html`) | library, book page, edition picker, entry hero |
| `app/public/lab/sign-in/index.html` | sign-in and account |
| `app/src/lab/lab.css` | the reader's voice call and the V2 sheets |

## Folders

- `landscape-before/` — every surface on `origin/main` at 852x393 and 932x430
  with an iPhone user agent and DPR 3, and 780x360 with an Android one, all
  with touch and mobile emulation so the pointer reports coarse.
- `landscape-after/` — the same, with this branch applied.
- `unchanged-proof/` — portrait, tablet and desktop before and after, plus the
  evidence that they did not move. Start at its README.
- `shots.mjs` — the script that captures a set. The voice layer is stubbed the
  way `app/scripts/voice-surface-shots.cjs` stubs it; nothing in this run
  reaches `api.anthropic.com` or `api.openai.com`.

Serve a build and re-run with:

```
node /tmp/claude-0/serve-dist.mjs app/dist 4206
node docs/verification/landscape-phone-2026-09-12/shots.mjs <outDir> landscape|unchanged
```

## What was actually broken lying down

1. **Landing** — the hero is `height: 100dvh; overflow: hidden`, and under
   900px the pitch stacks into one ~683px column. Inside a 393px box the
   price, Start reading and the footer were clipped away with nothing to
   scroll. Worst of the four, since it is the front door.
2. **Book page** — `index.html` has a landscape block of its own at
   `max-height: 480px` that places children by grid line; `entry.css` loads
   after it and resets the grid to one column but not the children's
   placement. The stray `grid-column: 2` opened an implicit second column and
   *The Odyssey* rendered one letter per line on top of its own description.
3. **Voice call** — a centred flex column taller than its grid row overflows
   both ways, so "Listening." and "Ask about this page." were painted straight
   through the Mute / Transcript / End discs.
4. **Library, entry hero, sign-in** — nothing unreachable, but a landscape
   phone is wider than 601px and so was taking the roomy tablet spacing: the
   headline filled the screen and the shelf, the button or the form sat below
   the fold.

## What was deliberately left alone

- **Reader text.** Phone pagination is measured in a hidden copy of the
  passage (`.lab-page-measure` / `.lab-native-page-flow`) whose stage is
  `display: contents`, so a width or measure rule on the visible passage would
  not reach the copy and the two would disagree about where a page ends. The
  measure is wide lying down (~750px, around 70 characters), which is the one
  thing a landscape phone still does worse than upright — but the reading box
  already fills the short viewport with a real page of text, and the risk of
  silently breaking pagination is not worth the improvement. A safe version of
  this needs the measure copy and the visible passage constrained together.
- **`/about`** — two other workers were editing it during this change. It
  renders in landscape without clipping or horizontal scroll, so it was left
  untouched.
- **`/app.html`** (the older V1 React library) — renders in landscape without
  clipping or horizontal scroll; no change needed.
