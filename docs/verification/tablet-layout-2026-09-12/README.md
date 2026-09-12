# Tablet layout fixes — 2026-09-12

Two fixes in the shipping reader (`app/src/lab/LabApp.tsx` + `app/src/lab/lab.css`,
the `/reader` route — chrome v2, the current shipping reader per `AGENTS.md`'s
production-verify instructions), found by the 2026-09-11 QA sweep
(`docs/verification/qa-desktop-tablet-2026-09-11/`), plus a re-check of two
findings that sweep marked "verified OK."

All screenshots: Chromium via Playwright, iPad/iPhone user agent + touch,
served from a local static build (`npm run build` + a plain static file
server) — no production traffic, no network calls, zero Anthropic API spend.
Audio playback for the speed-popover screenshots is stubbed locally (a fake
manifest + a synthesized silent WAV served via Playwright route interception)
purely to exercise the "now playing" UI state; nothing reaches R2 or any real
audio host.

## 1. Chat/Talk panel on an upright tablet — `chat-panel/`

Before: at 768x1024 and 820x1180 (portrait, `is-phone` because of
`LAB_PHONE_QUERY`), the Chat/Talk sheet stretched edge-to-edge exactly like a
phone — a wall of bare paper around a composer glued to the bottom.

After: the sheet keeps its full height (there's no second leaf to dock beside
here — that's the desktop spread's trick, seen unaffected in
`t1024l-landscape-companion-unaffected.png` / `t1180l-landscape-companion-unaffected.png`),
but the conversation itself is capped at a 640px measure and centred, with a
border on both sides, so it reads as a placed panel rather than a blown-up
phone screen. Gated on `700px <= width <= 1024px` AND `min-height: 620px` so
it never catches a landscape phone (852x393 matches the width band but is
short — see `unchanged-proof/`).

## 2. Audio speed popover overlap — `speed-popover/`

Before (`t1180l-speed-overlap.png`): with the popover open during playback,
its bottom edge (`bottom: 88px`) landed inside the book-progress line's own
box — measured via `getBoundingClientRect()`: popover bottom at 732px,
progress line spanning 725-743px in an 820px-tall viewport. The popover's
rounded corners let the "0% of book" text show through the gap the radius
leaves outside the rectangle (`t1180l-speed-crop-clearance.png` zooms on
this in the fixed version instead — no more text under the corner).

After: raised to `bottom: 112px`. Re-measured: popover bottom at 708px,
17px clear of the progress line's top edge. Checked at 1024x768, 1366x1024
and 1440x900 too — plenty of headroom at every one, no regression.

## 3. Re-verified still-OK findings — `reading-page/`

- Portrait tablets (768x1024, 820x1180) read at a sensible column width
  (commit `9df37b5e`'s "Tablets (2026-09-11)" fix in `lab.css`, untouched by
  today's change) — still holds.
- Landscape tablets (1024x768, 1180x820, 1366x1024) get the two-leaf desktop
  spread with sane margins, no giant gutters — still holds.
- No horizontal scroll (`document.documentElement.scrollWidth <=
  clientWidth`) at any of the five tablet sizes, or at phone/desktop sizes,
  checked programmatically alongside every screenshot in this set.

## Nothing broke elsewhere — `unchanged-proof/`

`p393` (phone portrait), `p852l` (phone landscape) and `d1440` (desktop) Chat
screenshots are **byte-identical** before/after (`Buffer.compare() === 0`).
Reading-page and pre-chat-open screenshots showed an unrelated, pre-existing
top-right icon flicker that reproduces run-to-run on the *same* unmodified
baseline build (confirmed by rerunning the baseline twice) — a timing race
in the app unrelated to this CSS change, not a regression it introduced.
