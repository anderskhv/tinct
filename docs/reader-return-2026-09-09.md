# Verified return and recent chapter positions — 9 September 2026

Anders approved both changes in the reader task: speed up resolving the latest saved position before painting, and offer an optional return button when explicitly opening a recently read chapter. He rejected painting stale local progress first and notifying/moving the reader later.

## Behavior

- The new reader still resolves account ownership and reconciles local/account position before first paint. A slow online GET no longer triggers the old three-second stale-page fallback. Failed/offline requests retain the existing recovery behavior; network availability and delivery of another device's writes still matter.
- Chapter identity can be validated directly from the edition manifest, without waiting for the local chapter's content and supporting data. A newer resume in a different library book uses that book's manifest.
- V2 source loads return primary text and explicitly selected Compare text first. Audio-follow metadata and cast arrive afterward. Supplemental results apply only to the exact source that requested them; primary paragraph identity remains stable, so hydration cannot repaginate the reader.
- The incoming cloud paragraph/word is installed with its destination chapter, not before the outgoing chapter finishes measurement. A controlled browser test of the preceding live build reached Proverbs 17 at 0:0 instead of the saved 3:7; this release preserves 3:7 on first paint.
- Explicit chapter selection starts at page one. A small **Continue from last position** pill appears for unfinished chapters visited within seven days, when a nonzero position is known for the current edition. Explicit verse, highlight and conversation links bypass the offer. Moving to another page dismisses it. The button uses existing whole-page navigation and keeps the saved word within the natural page.
- Up to 64 recent chapter bookmarks are stored in an optional `recentChapters` map in the existing position record. Both local and server merges retain newer per-chapter positions. No database migration or additional endpoint. Old clients omitting the field cannot erase it. Merely selecting a chapter at zero does not replace a useful bookmark. Existing per-book pins supply compatible recent positions; earlier chapter history cannot be reconstructed where no pin remains.

## Validation

- Full suite: 141 files / 1,565 tests passed; the additional authenticated endpoint round-trip regression also passed (1,566 total tests).
- Build and verify-bundle passed. Targeted typecheck showed only the existing unrelated baseline diagnostics after correcting the new loader union type.
- `app/scripts/check-reader-return.cjs`: real book assets and layout, intercepted fixture account requests and writes. Slow supporting data, a four-second position response, and a cross-library resume all paint the expected chapter/word first. Late supplemental data does not change it. Chromium and WebKit passed locally.
- Controlled before/after experiment held audio/cast responses: preceding production build painted only after release (~2.4s), development build painted the verified position while they remained pending (~1.3s). This demonstrates dependency removal, not a real-world speedup percentage or like-for-like production benchmark.
- `app/scripts/check-recent-chapter.cjs`: phone/desktop chapter selection, optional return, and preservation across reload. The script types real key events because instantaneous WebKit fill during startup did not reliably reach the controlled input.
- Existing WebKit audio/Compare full-chapter transition check passed with deferred supporting data.
- Chrome DevTools MCP was not available; used the repository's Playwright browser harness and network interception rather than claiming Core Web Vitals measurements.

Deployment and production verification: pending.
