# Reader and library fixes from device QA — implementation and verification (2026-09-18)

Branch: `claude/tinct-reader-library-fixes-xami59`, on main `be12cf5e`.
Screenshots, the two verification scripts and their logs:
`docs/verification/reader-library-fixes-2026-09-18/`.

Scope: the ten fixes reported from an iPhone Safari QA session (cherry-picked
from `claude/screenshots-nxxjy9`, `35ddc45f` and `83a09ec7`), plus the two
library decisions taken on 2026-09-18: a five-line featured description and a
Continue-reading card whose size does not depend on whether a recap exists.
Hyphenation is a separate branch and is not touched here.

## Gates

- `npm test`: 192 files / 2405 tests green.
- `npm run build` with only committed files, then `npm run verify-bundle`: pass.
- `npx tsc --noEmit`: the same 198 pre-existing error lines as main, none new.
- `scripts/check-library-layout.mjs` and `scripts/check-entry-responsive.mjs`
  (the `verify` workflow's browser acceptance) pass locally against the build.
- `python3 scripts/check-docs.py`: pass.

## What changed beyond the two cherry-picked commits

Four of the ten fixes turned out not to work in the production reader
(`data-chrome-version="v2"`) because a v2 rule out-specified the fix. Each is
now corrected at the rule that actually applies:

| Item | What was wrong after the cherry-pick | Fix |
|---|---|---|
| 5 Chat input with a highlight attached | `.lab[data-chrome-version="v2"] .lab-ask-composer.is-multiline .lab-ask-input` set `min-height: 28px` over the 44px floor. | The v2 rule carries the 44px floor. |
| 11 Companion panel resize | The v2 desktop-paging rules set the panel width outright (`50%`, and `calc(50% - inset)` for chat), so the width the drag stored in `--lab-companion-width` was ignored. | Both rules read the variable with 50% as the fallback. |
| 4 Note panel | Note mode switched the popup from the palette's max-content pill to the 344px frame with different padding, so the pill re-centred and the dots shifted 2–3px; the note row also lacked the palette's "+" so it was narrower. | Note mode uses the pill's frame and padding; the row carries the same "+" as a pressed control that closes the note. |
| 10 Featured description | The clamp was written against `[data-popular-blurb]` and lost to `library-glass.css` (`display:block; overflow:visible; line-clamp:unset`), so over-long copy spilled. | The clamp selector carries `.lib .lib-caption .lib-lede`. |

## Library: featured block (decision: five lines)

`public/lab/index.html`, `public/lab/catalogue-runtime.js`.

- The description is a five-line preview at every breakpoint
  (`--lib-feat-lines: 5`), with its line-height set in the same rule so the
  reserved height and the clamp count the same lines.
- Under it an affordance row is always laid out (18px). It says Expand only
  when the description is cut (`scrollHeight > clientHeight`), Collapse while
  open, and nothing otherwise; empty it is not a control. Measured on render
  and on resize. Switching books resets an expanded description.
- The title is one line for every book: `fitFeaturedTitle` steps the font
  size down on an inner span (to 60% at most) for a title that would wrap, so
  the heading's box is the same height whatever the book. At 390pt six titles
  step down (to 17–21px); at 320pt fourteen. None is cut at 320pt or wider.
- A short, wide viewport (`min-width: 601px and max-height: 760px`, a tablet
  held sideways) keeps the first shelf in view under the featured block with a
  tighter main gap, a 15px preview and a tighter Browse label. Without it the
  `verify` workflow's "first category visible before dock" assertion fails at
  1180×720; main passes it there only because Frankenstein's copy is four
  lines.
- Every one of the 101 catalogue descriptions and titles was pushed through
  the block in Chromium and WebKit at 320, 390 and 1280pt: block height,
  Browse-the-library position and first-shelf position are identical for all
  of them, and Expand appears exactly when the copy is cut (67 of 101 at
  320pt, 37 at 390pt, 1 at 1280pt).

## Library: Continue-reading card (decision: same size with or without a recap)

`src/labReadingMemory.ts`, `src/preReader/libraryRecap.ts`,
`src/lab/labLibraryBoot.ts`, `public/lab/library-boot.js`,
`public/lab/index.html`.

- The "so far" block is always laid out at the same size (three lines and an
  affordance row). Until a recap exists it shows the aside, in the muted
  voice, not as a control; a recap replaces it in place with the three-line
  preview and Expand/Collapse.
- The aside (`heroAside`) costs nothing: it is built from the catalogue the
  library already holds. It says what the rest of the card does not — the
  chapter's own name when the label compacts it away ("Chapter 3" →
  "The Spouter-Inn"), the author, and for books whose chapters have no name
  the chapter count ("Various · 1,189 chapters").
- All three paints build the same block: the hydrated render, and the boot
  snapshot and skeleton paints. The snapshot gains `hero.aside`; a
  reader-place fold keeps it only for the same chapter.
- Measured in Chromium and WebKit at 320, 390 and 1280pt with a seeded
  returning reader (Moby Dick at chapter 3, The Odyssey at book 3): card,
  caption and block heights are identical with and without a cached recap,
  and switching the focused book leaves them unchanged.

## Verification of the ten fixes

"Automated" means an isolated, muted headless browser driving synthetic touch
pointer events against the built bundle, in both Chromium (mobile emulation)
and WebKit at 390×844. That exercises the handlers under each engine's own
layout; it is not the iOS gesture stack. **No physical iPhone was used.**

| # | Reported | Implementation | Automated result (Chromium and WebKit) | Physical iPhone |
|---|---|---|---|---|
| 1 | Explanation card had no close | Expanded, ⤢ becomes Close and calls `onClose` (`dismissPopup`); collapses if none is given | Card shows "Expand explanation"; expanded it reads "Close explanation"; Close dismisses card and popup | not done |
| 2 | Highlights notched at verse numbers | Separator moved into the following word's span; `.lab-verse-unit` on the baseline, no padding | Separator confirmed in the next span; painted highlight starts 0px from the marker, level top and bottom | not done |
| 3 | Colour picker stayed open | `pickColor` applies and dismisses | Picking a colour closes the popup and the word carries the highlight class | not done |
| 4 | Note panel a different box | Note reuses the palette pill and row; field animates open beneath | Dots at identical offsets before and after; popup same width and place; field 230px wide, nothing overflows the frame | not done |
| 5 | Chat input unreachable with a highlight | 44px floor on the v2 composer field; press on the composer focuses it | Field 44px with the attachment; press on composer padding focuses the input | not done |
| 7 | Short trailing lines hard to select | Drag prefers the line the finger is in | Dragging into the ragged end of a paragraph's last visual line selects exactly that line's words and none below | not done |
| 8 | Short words would not start a selection | Pointer-down resolves to the nearest word of the touched line | Long-press beside "In", off its box, selects "In" and opens the popup; a touch outside any line starts nothing | not done |
| 9 | Hero showed a void | Block always present with the aside; Continue above it | See the card section above | not done |
| 10 | Featured descriptions moved the shelf | Five-line block, Expand row, one-line title | See the featured section above | n/a (layout) |
| 11 | Voice pill / companion panel | Draggable pill (`useDraggableSurface`, 23 unit tests); resizable panel | Desktop: dragging the divider 574→785px, arrow keys widen it, clamped to 30–70%. The pill needs a live call and was not driven in a browser | not done |

Item 6 is the hyphenation work and lives on its own branch.

## Limitations

- No physical device. Items 2, 5, 7 and 8 are iOS Safari touch behaviours;
  the automated runs prove the handler logic under WebKit layout, not the
  gesture stack.
- The voice pill drag (item 11) is unit-tested only; it needs a live call.
- WebKit occasionally misses a synthetic long-press when the machine is
  loaded (the timer is 160ms); the script waits 450ms and retries once.
- The aside fills one of the block's three lines; the other two stay quiet.
  Lowering `--lib-recap-lines` to 2 would tighten the card if that is
  preferred.

## Reproducing

From `app/` after `npm run build` (Chromium via `PW_EXE`, WebKit via
`ENGINE=webkit`; `S` is a folder for screenshots, `PORT` a free port):

```
PW_EXE=/opt/pw-browsers/chromium-1194/chrome-linux/chrome S=/tmp/shots PORT=4182 \
  node ../docs/verification/reader-library-fixes-2026-09-18/check-library-stable-layout.mjs
ENGINE=webkit S=/tmp/shots PORT=4191 \
  node ../docs/verification/reader-library-fixes-2026-09-18/check-reader-touch-fixes.mjs
```
