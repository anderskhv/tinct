# Library: the search drawer replaces "The search and all 100 books are further down."

Branch `claude/library-search-reveal-20260911`, 2026-09-11. Not merged, not
deployed — the coordinator reviews and lands it.

## The ask

Under the "Pick your first book" hero on `/library` the page said, in a
plain sentence, that the search and the rest of the library were further
down. Anders asked for a better reveal of the search than saying it. The
chosen design: show the search itself. The sentence goes; the real search
field peeks up at the foot of the hero, the top of it visible above a
hairline and lit faintly from below, like the top of a drawer. Touching it
opens the drawer and the page glides to it with the field focused.

## What the reader sees now

**Phone and upright tablet (under 900px).** Under the hero — the popular row
for a new reader, the Reading-now recap for a returning one — the top of the
search field shows: its top rule, the magnifier, the italic placeholder
*Search 90 books…* whole, then a hairline where the drawer's edge cuts it,
with a faint light rising from that edge. The "All books" index follows as
before. A tap (or a Tab onto the field) opens the drawer: over 520ms with a
slow ease the drawer runs to the field's full height, the edge and the light
fade, and the page glides so the field sits at the top of the screen with
the index under it. The field has focus from inside the tap, so the keyboard
opens; typing filters as it always did. Once opened, the drawer stays open
for the browser session: Back from a book page and a reload find it open,
from the first frame, with no jump.

**Desktop and landscape tablet (900px and up).** The same field sits in the
same drawer at the foot of the hero, under "See full library →", peeking the
same way; hover brightens the light and the edge. A click (or Tab onto it)
hands the field to the header slot — the desktop search exactly as it was,
open and focused — and opens the full library under it, the view "See full
library" opens. Escape closes the header search as before and the field
returns to its drawer. On a wide screen the drawer only ever peeks: the
desktop's open home for the search is the header.

**Reduced motion.** No height transition, no glide: the drawer is open and
the page is at the field at once.

## Design points, and how each is met

| Point | How |
|---|---|
| The sentence goes | `popularLead()` no longer carries `more`; the `<p data-popular-lead-more>` and its CSS are gone. Test updated. |
| The actual field peeks, top ~60% | The field is wrapped in `.lib-search-drawer` (`index.html:152`). Closed, the drawer is 39px tall (46px from 601px) with `overflow:hidden`: top rule + padding + the placeholder to just under its baseline, 39 of 61px = 64%. The cut lands under the baseline so no letter is cut. (`index.html:1006`–1011) |
| Faint glow / hairline | `::before` is a light rising from the drawer's edge (`rgba(244,237,223,.075)`, brighter on hover), `::after` is the hairline at the cut with a soft spill under it. Both fade out as the drawer opens. (`index.html:1013`–1019) |
| Placeholder from the model | `searchPlaceholder()` now ends with an ellipsis: `Search 90 books…`. 90 is the model's `publishedCount` (listable books in the catalogue); the old sentence's "100" was a literal and did not match the index's own count of 90. (`library-model.js:333`) |
| One field, not two | The same `#library-search-input` throughout. `arrangeSearch()` moves the one `.lib-search` between the drawer and the header slot per `searchDrawerState()`. (`catalogue-runtime.js:187`, `library-model.js:355`) |
| Tap glides to the library with the field focused | `revealSearch()` (`catalogue-runtime.js:226`): animates the drawer's height, scrolls to `searchRevealScrollTop()` (28px above the field), keeps the focus the `<label>` tap gave the input. So the page can always bring the field to the top, an opening/open drawer gives the index a minimum height of the rest of a screen (`index.html:1038`). |
| Keyboard works | The input in the closed drawer is tabbable; `focusin` on it opens the drawer (`catalogue-runtime.js:1385`). The field wears the library's own focus ring (`.lib :focus-visible`). Enter and Space are not needed: focus is the trigger, and the field is a text input. |
| Search, results, All books unchanged | The index markup is byte-identical before and after (see below). Desktop header search and full-library view unchanged; the drawer hides with the hero in full-library and searching views (`entry.css:99`). |
| `prefers-reduced-motion` | Height transition and fades are off, the scroll is `auto`. (`index.html:1040`, `catalogue-runtime.js` `reducedMotion()` branch) |
| Signed-out / signed-in / recap hero | The drawer is static markup between the recap and the popular section and the index, so it sits under whichever hero shows. The boot paint (`library-boot.js`) and the recap reconciliation (`labReadingMemory.ts`) are untouched; neither touches the drawer. |
| No flicker / jump | A fresh visit paints the drawer closed from the first frame (static `data-search-drawer="peek"`). A revisit in the same session: `library-boot.js:478` stamps `html[data-lab-search-revealed]` before the first paint, the CSS opens the drawer from that, and the runtime confirms with the same height. Measured: 90 frames from commit, drawer height `peek:61` → `open:61`, no other value. |

## Decisions

1. **The peek is the real field in place, not a mock.** The field already
   sat between the hero and the index on phone widths; wrapping it in a
   clipped drawer keeps one element and one focus path (the `<label>` tap
   focuses the input inside the gesture, which is what opens a phone
   keyboard). No second control, no hand-off timing.
2. **The cut is at the placeholder's baseline, not through the letters.**
   "Top ~60%" of the field is the padding, the rule and the line down to the
   baseline: 64%. Cutting glyphs would read as a rendering bug on a page
   whose standard is no surprises.
3. **Desktop keeps its header search and full-library view exactly; the
   drawer is only the closed field's home there.** Opening hands the field
   to the header (existing `toggleSearch`) and opens the full library
   (existing `navigateView('library-index')`). Moving the desktop's open
   search into the flow would have changed behaviour the brief said to keep.
4. **Upright tablets (601–899px) now carry the drawer at the hero's foot.**
   The field used to `order:-1` itself to the top of the page there, a
   leftover from when 601px was "desktop". Today's tablet commit made
   upright tablets the phone surface; the drawer follows that.
5. **Once opened, the drawer stays open for the browser session**
   (`tinct:lab-search-revealed`, same pattern as the popular row's
   once-per-session reveal). Back from a book page or a reload after opening
   it must not close it on the reader; a new session peeks again.
6. **The index gets a minimum height while the drawer is opening or open**
   so the glide can always bring the field to the top of the screen. The
   house list alone is shorter than a phone screen; without this the field
   stopped 140px down. The minimum is sized to the drawer's *peek* height
   because a smooth scroll is clamped to the page as it is when asked.
7. **The count in the placeholder is the model's, 90.** The retired sentence
   said 100, a literal; the index head says 90. One truth.

## Files

- `app/public/lab/library-model.js` — `popularLead()` without `more`;
  `searchPlaceholder()` with ellipsis; new `SEARCH_REVEAL_SESSION_KEY`,
  `searchDrawerState()`, `searchRevealed()`, `markSearchRevealed()`,
  `searchRevealScrollTop()`.
- `app/src/preReader/libraryModel.test.ts` — updated lead/placeholder
  assertions; new `search drawer` describe (4 tests).
- `app/public/lab/index.html` — markup (`:152`), drawer CSS
  (`:1006`–1042), the 601px block without `order:-1` and without the
  `.lib-popular-more` size; cache-bust bumps for `library-boot.js`,
  `entry.css`, `catalogue-runtime.js`.
- `app/public/lab/entry.css` — drawer hidden in full-library / searching
  views on desktop; `.lib-popular-more` reference removed.
- `app/public/lab/catalogue-runtime.js` — `arrangeSearch()` rewritten around
  the drawer, `revealSearch()`, click and `focusin` triggers,
  `renderPopularLead()` without `more`, `restoreLibrary()` marks the reveal
  when a query is restored, `library-model.js` import bumped.
- `app/public/lab/library-boot.js` — reads the session key and stamps
  `html[data-lab-search-revealed]` before the first paint.

## Verification

Chromium from `/opt/pw-browsers` via Playwright. WebKit is not installed in
this sandbox and `playwright install` is forbidden, so the 390×844 runs use
Chromium with the iPhone user agent, touch, `isMobile` and 2× scale rather
than WebKit. Two builds served by a small static server mirroring the
Worker's lab routing: `main` (`before-*`) and this branch (`after-*`).
Returning readers seeded from a `tinct-lab-position` record with four books
(Meditations at Book 3 as the hero).

Screenshots in `docs/verification/library-search-reveal-2026-09-11/`:

- `before-{new,returning}-{390x844,430x932,768x1024,1024x768,1440x900,1920x1080}.png` — as on `main`.
- `after-…png` — the hero with the peeking drawer; `…-tapped.png` — after
  the tap, the drawer open and the field focused; `…-typed.png` — after
  typing `odys`, one result.
- `after-fullpage-new-1024x768.png` — at 1024×768 the hero is taller than the
  viewport, so the drawer sits below the fold; the full page shows it.
- `detail-peek-390.png`, `desktop-1440-hover.png` — the cut and the light,
  close up; hover on desktop.
- `phone-390-opening-200ms.png` — a frame mid-glide (the blank band above
  the field in this frame is a capture artefact of the smooth scroll;
  `elementFromPoint` there returned `div.lib-caption`, the hero's caption).
- `phone-390-open-settled.png`, `phone-390-keyboard-tab.png`,
  `phone-390-back-with-query.png`,
  `phone-390-revisit-open-from-first-paint.png`,
  `desktop-1440-after-escape-and-back.png`.
- `*-dark.png` and `*-rm-tapped.png` — `prefers-color-scheme: dark` and
  `prefers-reduced-motion: reduce`. The library wears one ground; at
  390×844 the dark and light renders are byte-identical, and the
  reduced-motion tapped state matches the animated one once settled.
- `before-results.json`, `after-results.json`, `extras-results.json` —
  the probes below.

Probes (`after-results.json`, `extras-results.json`):

| Check | Result |
|---|---|
| "All books" markup, before vs after, every seed × viewport × theme × motion (24 pairs) | identical hash in all 24 |
| Phone tap: drawer `peek` (39px) → `opening` → `open` (61px), field focused | yes, all phone/tablet-upright sizes |
| Field's top after the glide | 28px at 390, 430, 768 (new and returning) |
| Typing after the tap | `odys` → 1 result, `data-searching=true` |
| Desktop click: field in header slot, focused, full-library view, URL `?view=library-index` | yes at 1024, 1440, 1920 |
| Desktop Escape → field back in the (hidden) drawer, toggle focused; "← Book selection" → drawer visible, peeking; header toggle still opens the search | yes |
| Phone Tab onto the field | opens the drawer, glides, focused |
| Back with a query | drawer open, `odys` restored, 1 result |
| Same-session revisit | `html[data-lab-search-revealed]` stamped; drawer heights across the first 90 frames: `peek:61`, `open:61` — no jump |
| Fresh visit first 90 frames | `peek:39` only |
| Resize 1440 → 390 → 1440 | one field; peek 39px narrow, 46px wide |
| Page errors | none (the harness's `/api/lab-recap` 503 is the stub, not the page) |

Gates:

- `cd app && npm test` — 156 files, 1902 tests, green.
- `CI=true npm run build` — clean.
- `CI=true npm run verify-bundle` — passes (placeholder `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` / `VITE_AUDIO_BASE_URL` in the sandbox, as in
  earlier verifications; nothing deployed).

Not covered here: a real iOS keyboard (no WebKit in the sandbox). The focus
is taken inside the tap on the `<label>`, the path that opens the keyboard;
the glide runs after with `preventScroll` on the programmatic focus so the
two do not fight. Worth one look on a phone before landing.
