# Page-turn latency — 8 September 2026

User clarified that turning reader pages, rather than voice latency, must feel instant.

## Diagnosis and change

Production Republic chapter 1, Chromium 390×664 at 4× CPU throttle: eight page turns took 716–1,626ms before a further 190ms fade/slide. CPU profiling and timeline tracing identified repeated synchronous layout in the native visible-page growth loop. Even a fitting precomputed page was repeatedly expanded until overflow, then rolled back. This also changed subsequent page boundaries on navigation.

Native pages now accept a fitting precomputed page immediately. The overflow/shrink guard remains. The hidden native paginator is memoized so unrelated parent renders do not traverse the entire chapter. V2 omits the page-turn animation; direction state remains for reading-memory events. No persistence tuple or audio-seeking changes.

## Verification

Full suite: 141 files, 1,550 tests passed. Browser regression `app/scripts/check-page-turn-latency.cjs` asserts eight distinct non-animated pages remain stable after effects settle, then seven backward turns restore identical content. Local 4× CPU sample: 217,118,116,108,101,168,102,101ms (median 116ms). This is a controlled browser approximation, not physical iPhone timing.

Build/deployment and production verification pending.
