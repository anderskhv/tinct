# Introducing Tinct image — September 14, 2026

Anders supplied a transparent 1484×1060 PNG showing the Tinct library on a laptop, Moby-Dick on an e-reader and voice chat on a phone, and requested using it in Introducing Tinct.

Use the supplied image unchanged in the existing brand reveal. Hide the old rendered screen overlays because the new image already contains its screens. Contain the image without distortion; preserve the restored story copy, original timing and other scenes. The exact PNG is saved under app/public/assets/about-v20/assets/introducing-tinct-20260914.png. The rerunnable import patch retains the substitution; CSS and module references share a new cache version.

Verification: 2240 tests, 7 focused About checks, build and verify-bundle passed. Desktop 1280×720 and phone 390×844 previews show all three devices and the original headline, with no browser warnings/errors. The image is a supplied promotional composition, not a newly verified feature claim.

App commit 213e9bb9 was reconciled with newer reader commit 0f2716e24 in merge 02c5c3209. [Deploy run 34840598079](https://github.com/anderskhv/tinct/actions/runs/34840598079) passed including the combined tests, build, bundle comparison and production smoke checks. Worker version: `58fd61b7-aea2-4770-afe4-e48c6dad03e1`. Final bundle `index-DhlcyghL.js` matches the production phone reader. Live About confirms the supplied 1484px image loaded, old overlays hidden, all devices visible on desktop/phone and no browser warnings/errors. Evidence: `output/tinct-about-condense-2026-09-14/reveal-desktop.png`, `reveal-phone.png`, `reveal-reader-phone.png`. No other story improvements are approved; today's rollback remains in effect.


## Arrow and image blending follow-up — September 14

Anders requested an arrow from the language headline toward the passage, and a less rectangular reveal image. Replace the upward in-page ornament with a measured SVG connector: on desktop it crosses the gap to the page edge near the passage; on phone it curves down the right side to the page top. Its geometry follows rendered headline/page bounds, resizing and animation, and it retains the original arrow visibility timing. Hide the old page ornament. Fade the supplied composition’s outer/tabletop edges with CSS masks and remove the rectangular sweeping highlight; preserve the original image file, copy and pacing.

Desktop and 390×844 phone previews verified arrow direction, text clearance, image blending and no browser errors. 2242 tests, 7 focused About checks, syntax check, build and verify-bundle passed. App commit e4a4df0ba was reconciled with newer chat changes in merge 7b3ac491b. [Deploy run 34841674051](https://github.com/anderskhv/tinct/actions/runs/34841674051) passed, including combined tests and production smoke checks. Worker version `b2fc338b-00d1-4686-a170-65e9627d9722`; production phone reader confirms bundle `index-BYI6Iqn0.js`. Live desktop and phone arrow checked with original ornament hidden and no browser errors. Live desktop reveal blending verified. Evidence under `output/tinct-about-condense-2026-09-14/`: `arrow-desktop.png`, `arrow-phone.png`, `blended-reveal-desktop.png`, `polish-reader-phone.png`. Next action: user review; no further story changes approved.


## Replacement supplied composition — September 14

Anders supplied a new version with its own dark vignette and softer tabletop. Replace the reveal with that PNG, unchanged, stored as introducing-tinct-20260914-v2.png. Ease the CSS bottom fade to the final 12% to preserve the devices and let the supplied vignette do the blending. Retain arrow fix, copy and timing. Desktop and phone previews verified; 2243 tests, 7 focused About checks, build and bundle verification passed. Deployment verification pending.
