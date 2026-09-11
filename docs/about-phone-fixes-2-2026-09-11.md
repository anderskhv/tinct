# About page — round 2 phone fixes, 2026-09-11

Anders, from the live page on his iPhone after round 1 (`docs/about-phone-fixes-2026-09-11.md`):
"Button should be at the bottom. And we should avoid having the question overlap the text it
concerns — otherwise damn solid." Done by the coordinator session; both changes live in the
override files that survive a re-import (`app/public/assets/about-v20/about-v21.css`,
`about-v21.js`); `node scripts/patch-about-story.mjs` is a no-op (49 edits already in place) and
`node scripts/about-story.test.mjs` passes 7/7.

## 1. The question cards no longer sit on the page text

**Before.** On phones and portrait tablets the overview beat's question cards were positioned
inside the page at 11 % / 46 % / 24 % of its height — over "Scene II." and the first lines
(`before-390x844-overview-a.png`: card 520–581 px inside the passage's 346–744 px).

**After** (`about-v21.css`, the "Round 2" block): the cards are anchored to the page's top edge
from above (`top:auto; bottom:calc(100% + 6px)`) and the narration steps up 84 px to leave a
band for them. The page keeps round 1's height and type scale, so the passage fits exactly as
before. Measured on the local build (Chromium, iPhone UA, DPR 2), cards vs passage text:

| viewport | card (px) | passage text (px) | headline (px) | gap card→text |
|---|---|---|---|---|
| 390×844 | 249–292 | 346–744 | 138–210 | 54 px |
| 390×660 (Safari bars showing) | 172–227 | 269–560 | 61–133 | 42 px |
| 430×932 | 286–329 | 383–832 | 175–247 | 54 px |

No overlap at any of the three; the headline clears the card by ≥ 39 px. The passage's
scroll/client heights are the same as round 1 (a 3–5 px footer overhang that was already there).

## 2. "Start reading" is at the bottom on every phone scene

**Before.** The bottom pill hid while the closing section's inline button was on screen, so the
pricing scene showed a mid-screen button above the covers and nothing at the bottom
(`before-390x844-pricing.png`, pill opacity 0).

**After.** On ≤ 760 px the pill stays through the closing section — `about-v21.js` now observes
only the footer on phones — and the section's inline button steps aside (`.final-read-link
{display:none}` on phones) so two "Start reading" controls are never stacked. The footer's link
is unchanged; tablets and desktop keep the top-right pill and the inline button (unchanged).
Measured: pill opacity 1 at the pricing and ending stops on all three phone sizes.

Evidence: `docs/verification/about-phone-fixes-2-2026-09-11/` (before/after PNGs at 390×844,
390×660, 430×932; `before-report.json` / `after-report.json` with the rectangles above).
Zero page errors in every run.
