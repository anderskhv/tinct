# Entry redesign — September 9, 2026

Implements the approved entry redesign handed off by the design task. Main-checkout brief: `docs/design/approved-entry-redesign-handoff-2026-09-09.md`. Unrelated main-checkout edits were preserved; app work is in the isolated reader-stabilization checkout.

## Changes

Desktop landing uses production covers in three quiet drifting columns, with pause, reduced-motion and visibility handling. Mobile does not create the decorative cover images. Removed the incorrect free/no-account disclosure without changing billing.

Desktop library has a compact header, expanding search, full featured synopsis and all 100 published books once in the shelf. Arrows, native scrolling and keyboard selection reach the catalogue; See full library opens the existing nine house rows. Mobile retains its existing library layout.

Introduction and edition selection are separate pages on both devices. The introduction expands the exact complete approved preface inline. The dedicated picker preserves two columns even at 360px, actual edition choices and single/Both semantics. Back preserves the selected pair. Matching source samples use complete paragraph boundaries; the reviewed Odyssey excerpt ends at its aligned Calypso boundary. Other unreviewed pairs retain complete shared paragraphs, which may exceed the approximate 40–60-word target rather than truncate a sentence or invent text.

Returning readers retain account-confirmed direct resume. No reader position writer, content text, billing rule, dependency or schema was changed. The latest character-copy/cache release and whole-library prefaces are retained.

## Verification

- 151 test files / 1,616 tests passed, including the nested static-preface routing regression.
- Local Chromium 1440×900 and 1920×1080, WebKit 390×844 and 360×844: entry flow, two-column picker, exact preface, single/Both, KJV + WEB pair and handoff, Back, all shelf items and house index.
- Motion/pause, shelf arrows, zero-result search/Escape, long complete Notes from Underground preface, overflow and absence of preface progress writes passed.
- Desktop and phone account fixtures on production passed pending account confirmation, newer cloud library, direct resume to Democracy in America at 2:4 and explicit Bible selection at 2:4. Fixtures intercept account writes; no real account or model API was used.

The first live entry check caught nested preface URLs being served as the reader SPA. The Worker static asset predicate now explicitly routes those JSON files to ASSETS; a regression covers this concrete production path. Final deployment and live visual evidence follow below.

Artifacts: `/Users/andershvelplund/.codex/visualizations/2026/09/09/tinct-entry-redesign/`.

## Final production release

Shipped from clean app commit `33606162` with Node 24 and the approved `npm run deploy` path after build and verify-bundle passed. Direct deployment succeeded; there is no GitHub Actions run for this release.

- Worker: `9a1ae6f7-0d15-4ea8-a009-64c7d0a84ed1`.
- Live bundle: `assets/index-B48GpBfm.js`.
- SHA256: `e2eb292329b08b9ad83ce005aa6fdd07fc94da1f2246bf2590e1634ff6cc8b7e`.
- Live bundle, entry CSS/runtime/model, Odyssey preface and the current versioned Awakening character asset match deployed files byte-for-byte.
- All four production entry viewport flows passed; Chromium desktop and WebKit small phone passed the additional motion, arrow, search and long-preface checks. Screenshots were inspected for landing, library, introduction and picker. `/lab/phone` was also captured.
- All 15 production smoke checks passed. The immediate first-deploy smoke hit the old HTML/new-assets propagation window; the final unqualified `/reader` URL and all asset checks passed after deployment settled.

Production account-resume fixtures passed before the final routing-only fix; that fix touches only `/lab/prefaces/*.json`. These are controlled browser account fixtures, not a physical-device or real-account test. No live AI call was made.

Browser scripts: `app/scripts/check-entry-redesign.cjs`, `check-entry-details.cjs`, `check-library-cross-device.cjs`. Evidence and logs are in the artifact directory above; `deployed-bytes.json` records exact hashes.
