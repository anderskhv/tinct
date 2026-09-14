# About middle condensation — 14 September 2026

Anders approved the narrow middle cut in the marketing review conversation (“go”). Broader recommendations remain proposals.

## Change

Combine two questions into “Could AI help us read better things?”, remove the separate effortless-reading section and the bridge before the Tinct reveal, and shorten the question and bookshelf holds. Preserve opening, joke, overload, difficult-text overview and all six product demonstration durations. Stable scene indices preserve bookshelf animation; incoming transitions skip removed scenes in both directions. Version the stylesheet and module graph together for cached visitors. The import patch calls the new condensation script so a future import retains the cut.

Total scroll allocation falls from 5025 to 4415svh (12.1%). The middle between overload and the first demonstration falls from approximately 1778 to 1168svh (34.3%). These are scroll distances, not measured conversion or video retention improvements.

## Verification

- 2240 tests passed across 170 files; 10 focused About checks passed, including scene skipping, cache references and preserved demo durations.
- Build and verify-bundle passed. Patch rerun reports 0 legacy edits and leaves the new sequence intact.
- Local desktop 1280×720 and phone 390×844 checked: question, bookshelf, difficult-text overview, reveal and voice demonstration. No browser errors or horizontal overflow observed.
- Used a fresh reconciled clone of main a88bb9a7 because the shared checkout contains unrelated user changes. No shared app changes were reverted. Generated sitemap date-only changes excluded.
- Shared documentation checker rerun passed: 12 documents checked, 0 errors and 0 review reminders. This main checkout does not yet include that checker.

## Release

App commit 129581661ad9fcf86e4b8debf3411537c7ec6349 fast-forwarded to main after a fresh fetch. GitHub integration could not create a PR; existing authorized Git transport shipped the reconciled commit directly.

First deploy attempt succeeded, and CI verified the exact reader bundle `/assets/index-Di0fFhdR.js` byte-for-byte. Its immediate smoke test encountered a transient 404 in a configuration chunk; the identical production smoke test rerun locally passed all 15 checks. Retry 2 of [deploy run 34837258066](https://github.com/anderskhv/tinct/actions/runs/34837258066) succeeded, including all 15 smoke checks. Final Worker version: `14182541-c003-411a-af66-f1060e72bca8`; final reader bundle: `/assets/index-B6szcn32.js`, verified byte-for-byte by CI and confirmed after reloading the production phone reader.

Production About verified on desktop and 390×844 phone: new headline, eight sections, versioned stylesheet, correct shortened section heights, no horizontal overflow, and voice demonstration. Production `/lab/phone` rendered The Manual section 52 with the expected reader bundle and no browser warnings/errors. Screenshots saved in the shared workspace under `output/tinct-about-condense-2026-09-14/`: about-desktop.png, about-phone.png, about-phone-demo.png, reader-phone.png.

Next action: observe actual visitor response before further visual reconstruction. No conversion lift is claimed.
