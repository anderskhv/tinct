# Optional prefaces — implementation and verification

Approved scope: [preface handoff](design/preface-handoff-2026-09-09.md).

The Odyssey, The Awakening, Niels Lyhne, War and Peace, Symposium and the Bible use the exact approved
English text from `docs/design/approved-prefaces/`. Runtime `.txt` files are
byte-for-byte copies; tests validate their wording and paragraph boundaries
against those sources. Canonical Odyssey ID is `odyssey`, not `the-odyssey`.
The final Symposium and Bible revisions were added after explicit approval in the source task. Other books have no preface entry.

The fresh cover shows an opening-sentence excerpt, Read preface (English), and
Begin reading. Reopened covers show Continue reading. Readers can reopen a
supported cover through “Cover and preface” in the existing contents panel without
navigating away from their current chapter. The desktop excerpt sits beside the
actual cover image; phones stack it below. The dedicated “Before you begin” view
uses the reading font, text size, line spacing and theme, with Tinct attribution,
Back to cover and a final Begin/Continue button. Native modal focus containment
keeps its scrolling and keys outside the source reader; browser Back and Escape
return through the cover. Reload opens the saved reader, never the essay.

The document receives no source location setters, Chat hook, or audio source.
Opening from the reader pauses existing audio and keeps its playback position.
The reader stays mounted; preface visibility suspends position/library-boot writes,
reading-memory tracking and keyboard page turns. Fresh Begin uses the existing
cover exit; reopening/Continue only closes the document and retains the tuple and
Compare state. No new storage schema, dependency, content generation or LLM call.

Local tests: 148 files / 1,596 tests pass. Browser checks cover all six books on
WebKit phone 390×844, small phone 360×640 with 1.8 text scaling and dark theme,
and Chromium desktop 1440×950. Fresh entry, optional preface, browser Back,
Begin, resumed cover, Continue and reload passed. Both engines also passed
Compare with explicit saved chapter 2 / paragraph 1 / word 5, browser Back from
preface through cover, unchanged persisted progress while scrolling, and absence
on unsupported Democracy in America. A saved library handoff from Odyssey to The
Awakening restored the new book/chapter and loaded only its approved preface. Production evidence follows after deployment.

## Production verification — shipped September 9

Approved content commit `91eeea2e`; reader integration `9887e6b9`; final cover
loading fix `b1427456`. Shipped from the clean reader-stabilization worktree using
Node 24 and the approved `npm run deploy`, including build and verify-bundle.
The shipping worktree uses the existing CI public-client configuration fallback;
verify-bundle passed and detected no leaked secrets. This was a successful direct
npm deployment, not a GitHub Actions run.

Final Worker version: `1df754ac-79cc-4827-b4e1-1cb987822090`.
Final bundle: `assets/index-CHvyqncq.js`.
SHA256: `8d1bf3b8629313388e37d0919959711ab3a165d31a55fca0666c9d64b587fb5f`.
Live downloaded bytes match the deployed build. All 15 smoke checks passed.

- All six books passed the full live cover/preface/Begin/resume/Continue/reload
  flow in 18 configurations: WebKit phone, WebKit small phone with large text
  and dark theme, and Chromium desktop. Each actual cover decoded successfully.
  A visual check caught image-loading layout collapse; explicit 540×810 intrinsic
  dimensions now reserve space. The final desktop Bible screenshot confirms it.
- Live Compare, saved location, browser Back through cover, absence on unsupported
  books, no persisted progress changes during preface scrolling, and cross-book
  library handoff passed in both engines. The exact resumed tuple stayed at
  Odyssey chapter 2 / paragraph 1 / word 5, including after reload from the preface.
- Actual Odyssey original-English audio played, then paused on opening the cover.
  The instrumented real Audio element retained its source and `currentTime=24.69`
  through preface viewing and Continue; reader place stayed chapter 1 / `1:76`.
- Native dialog Tab containment, Escape to cover then reader, restored keyboard
  focus, and unchanged location passed live. `/lab/phone` was also opened and
  captured; the feature itself belongs to current V2 `/reader`.

All browser contexts used isolated storage, with account/AI routes blocked.
There were no model calls, credit charges, production-account writes or bulk
preface generation. Physical devices and live authenticated cross-device sync
were not independently retested in this release; the existing sync contracts
remain unchanged and the document explicitly suspends their writes.

Screenshots, results, bundle fingerprint and verification logs:
`/Users/andershvelplund/.codex/visualizations/2026/09/09/tinct-prefaces/`
