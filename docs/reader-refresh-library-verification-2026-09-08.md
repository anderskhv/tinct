# Reader refresh and library follow-up — 8 September 2026

Code commit: `7fc2ea00`. Deployed through the approved `npm run deploy` path from a clean checkout; generated sitemap restored afterwards.

## Fixed

- V2 refresh: the native paginator selected an estimated page head instead of the persisted word. Reproduction: Genesis 1 at paragraph 5, word 117 showed “moveth upon the earth…” before reload, but “saw that it was good…” afterwards, although storage still contained 5:117. Restoration now carries the exact saved word into the measured map and starts a page there. V1 behavior stays gated out.
- Library: a hidden popular-books section retained its flex layout and blank space. Optional recap blocks also reserved three empty lines even when no recap would be requested or the request failed. Hidden sections now take no space, recaps appear only when text exists, and the first reading-now cover starts at the left content gutter.

## Verification

Full suite: 138 files / 1,520 tests passed, including V1 DOM snapshot. Build and bundle verification passed. Updated recap tests assert that absent text remains hidden and available text becomes visible.

`app/scripts/browser-reader-refresh.cjs` passed locally and on production in an isolated Chromium profile. It verifies three successive reloads with identical first text and paragraph/word position, then opens a library with four public-book positions. The first cover sits at 14px, the gap below Continue reading is 44px, hidden popular content occupies no space, and missing recap text occupies no space. No browser page errors. Recap API calls are intercepted; no development Anthropic calls occur.

Deployment version: `726b4c9c-eccb-4f2d-9312-32c8817bd8f4`.

Live bundle: `assets/index-7GXcCxGX.js`; exact byte match with the local deployed artifact.
SHA-256: `47a8f4501f0b8ca694ea4b7c99eb18ff7cfb2d2a032f7636eea8222f1e0489e2`.

Artifacts:
`/Users/andershvelplund/.codex/visualizations/2026/09/08/01a07ff0-a87f-7031-8b2f-d050d06d52bd/reader-refresh-production/`

Includes `report.json`, `bundle.json`, before/after screenshots for each reload and `library.png`.

## Open: Manage account

The reported inactive click was not reproduced. The reader link navigated to the expected sign-in page as a guest; on production with a simulated signed-in session and mocked Supabase responses, Manage account navigated to the account page and displayed the account controls. This does not verify Anders’s actual authenticated browser state. No speculative account-code change was made. Clarification requested: reader account menu or library account icon.
