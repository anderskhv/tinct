# Chapter-end card on one desktop page

Reviewed: 2026-09-14

Status: deployed and production-verified at app commit `8c1214d45`.

Anders reported the dedicated Hebrews 1 chapter-end card crossing the desktop
spread gutter. He approved leaving the facing page blank and required minimal
pagination risk. The next-chapter preview suggestion is not part of this fix.

## Cause and scope

The dedicated end-screen wrapper used full width with a 560px maximum and auto
margins, centering it across both leaves. A desktop-spread-only CSS rule now sets
its width to at most one leaf using the existing gutter variable and aligns it
with the left leaf. The facing leaf remains blank.

The six-line app change touches no React logic, source measurement, page map,
position persistence, chapter transition or inline end-card placement. The normal
end card that fits beside/after the last text continues to use its existing leaf.
Phone and Compare layouts are excluded by the desktop-spread selector.

## Verification

- Reproduced the dedicated end screen with real Hebrews 1 text at 1440×795.
  Original card bounds: x440–1000, crossing the gutter at x720.
- Browser regression compares the old wrapper style with the corrected style on
  the same reader. Every visible word anchor, page boundary and end-screen
  transition is identical at 1440×795, 1440×950, 1024×768 and mobile WebKit 390×844.
- Corrected dedicated card lies wholly inside the left leaf and fits vertically.
  Back returns to exactly the same source words; Forward reopens the end screen;
  Continue opens Hebrews 2 at word 0:0. Mobile follows four unchanged text pages.
- All 2,239 tests in 170 files passed; build and bundle verification passed,
  local bundle `index-B8JuvvZN.js`. Existing bundle-size and jsdom warnings remain.
- Reusable check: `app/scripts/check-chapter-end-leaf.cjs`. API/auth requests are
  intercepted in isolated browser fixtures; no provider or real-account writes.
- Local evidence: `output/chapter-end-single-page/local/results.json` and
  `1440-795-after.png`. No claim of universal zero risk is made; the patch is
  confined to presentation and the sampled pagination/navigation checks pass.

## Production verification

[Deployment run 34829365444](https://github.com/anderskhv/tinct/actions/runs/34829365444)
succeeded, including all 2,239 tests, build/bundle gates, exact deployed JavaScript
verification and all 15 smoke checks. Live bundle: **`index-CZkux1Sk.js`**.
Worker version: `6a04a71b-b803-4627-8d41-ef958740539b`.

The same four browser scenarios passed against production, including `/lab/phone`
at 390×844. Every scenario served the CI bundle above. The desktop dedicated card
is entirely within the left leaf, the facing leaf is blank, and before/after
word maps and Back/Continue checks pass. API/account traffic remained intercepted.
Live screenshots and results: `output/chapter-end-single-page/production/`,
including `1440-795-after.png` and `results.json`.

No remaining action for this scoped layout fix. A next-chapter preview would be
separate work because it would involve source and navigation behavior.
