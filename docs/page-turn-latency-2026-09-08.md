# Page-turn latency — 8 September 2026

User clarified that turning reader pages, rather than voice latency, must feel instant.

## Diagnosis and change

Production Republic chapter 1, Chromium 390×664 at 4× CPU throttle: eight page turns took 716–1,626ms before a further 190ms fade/slide. CPU profiling and timeline tracing identified repeated synchronous layout in the native visible-page growth loop. Even a fitting precomputed page was repeatedly expanded until overflow, then rolled back. This also changed subsequent page boundaries on navigation.

Native pages now accept a fitting precomputed page immediately. The overflow/shrink guard remains. The hidden native paginator is memoized so unrelated parent renders do not traverse the entire chapter. V2 omits the page-turn animation; direction state remains for reading-memory events. No persistence tuple or audio-seeking changes.

## Verification

Full suite: 141 files, 1,550 tests passed. Browser regression `app/scripts/check-page-turn-latency.cjs` asserts eight distinct non-animated pages remain stable after effects settle, then seven backward turns restore identical content. Local 4× CPU sample: 217,118,116,108,101,168,102,101ms (median 116ms). This is a controlled browser approximation, not physical iPhone timing.

Build and verify-bundle passed. Deployed with npm run deploy (success): Worker `b5ffb4a3-e56c-429e-bedf-dd7adc028e82`, bundle `index-D4Bx4MJZ.js`, SHA256 `33e170a11896b86e2028b38669d0a128e102907724a31a6c806e145eb292c6a1`. Live/local asset hashes match.

Production mobile regression passed: 204,108,97,98,99,165,105,96ms at 4× CPU throttle, median 105ms versus baseline median about 1.2s. Forward/backward content checks passed. Screenshot: `/Users/andershvelplund/.codex/visualizations/2026/09/08/01a07ff0-a87f-7031-8b2f-d050d06d52bd/compact-editions/page-turns-mobile.png`.

Production desktop at 1440×900 and 4× CPU throttle: eight page turns 17–24ms, median 22ms. All pages nonempty; forward/backward content stable. Desktop's paragraph-sized pages can legitimately be shorter than the mobile test's 40-character assertion, so the adapted desktop check uses nonempty text. Screenshot: same artifact directory, `page-turns-desktop.png`.
