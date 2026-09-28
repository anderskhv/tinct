# Library 2 public cutover — approved 2026-09-28

Public entries: https://tinct.app/ and https://tinct.app/library
Review controls: https://tinct.app/lab/library_2/?preview=1

Anders approved the public switch on 2026-09-28. New readers receive the
cinematic signature-book scenes; returning readers receive the morning,
afternoon, evening or night room with their currently reading books on the
table. The bookshelf remains parked at `/lab/library_2/shelf-study/` and
`/lab/library_2/?view=shelf` for later development, not the default experience.

The bare homepage resumes a recent signed-in reader (within three days) when
this device has a matching account-owned settled position. `/library` always
opens the library, as do explicit book links and review modes. The reader
continues to resolve the exact saved edition and position. Missing, stale or
unconfirmed local hints fall through to the library. The existing per-session
discovery view remains stable after a new reader returns from their first book.

Reader asset warming is enabled publicly by the same rollout flag, at idle and
low priority. The room and the selected public cover load before other library
assets. Save Data and offline mode disable this warmup. This reduces the return
journey's wait; a first visit on a new device can still require network loading.

## Data and scope

- Reading and Finished use the existing `libraryTwoReading` adapter. Continue
  uses its exact edition/location session handoff; the library never writes a
  reading position or completion mark.
- Recaps use the same cache, one-hour absence and just-left-reader rules.
- To read uses a guest device shelf or an account-scoped device mirror plus
  `library-shelf:<bookId>` rows in existing `user_data`. Writes use revision-
  checked `commit_user_data`, removals use tombstones. Offline actions retry
  on load/reconnection. A changed viewer reloads before showing another shelf.
- The old unscoped `tinct-library-2-to-read` list is preserved as guest data;
  it is not silently assigned to a different signed-in account.
- Book introduction, search, categories, librarian and the first-visit scenes
  stay in library_2. Edition choices now reflect actual discoverable catalogue
  editions, not the old prototype's hardcoded Danish/audio/secondary options.
- Whole-book discovery holds and edition recovery remain in existing routes
  and the production handoff. No content, audio, reader or auth implementation
  changes. The route adjustment selects the approved library publicly; no credentials
  or permissions depend on the preview cookie.
- Initial scripts are external so the preview also runs under the public
  entry's existing strict Content Security Policy.

## Release and rollback

`LIBRARY_TWO_DEFAULT` in `app/src/worker/routes/libraryTwoRelease.ts` enables
both the public route and reader warming. The route tests cover default public
access, exact preview-cookie opt-in during rollback, and the false-flag fallback.
The homepage keeps its canonical/indexable metadata; `/library` stays noindex.
`/lab/` remains the existing library and `/reader` remains the production reader.

Run focused entry/route/warmup tests, then cloud full test/build/verify-bundle.
The old-layout regressions remain on `/lab/?view=library`;
`check-library-public.mjs` covers the new public entry in Chromium and WebKit,
including Back, an empty cached shelf followed by actual history, and exact
Continue handoff. Release through the serialized GitHub Actions deploy and confirm the deployed
bundle and no-cookie public entry, returning table and reader round trip.

Rollback sets the same default back to false with its guard tests updated,
followed by the same release path. Guest and account shelves remain intact;
no data migration or deletion is required. Preview opt-in remains available
when rolled back. This release does not change reader position writers.

Overnight visual polish is separately queued in
[issue #220](https://github.com/anderskhv/tinct/issues/220): natural water motion
for Odyssey/C&P and catalogue cover quality. It does not gate this cutover.

## Verification evidence

Focused tests cover account isolation, guest legacy preservation, offline
replay, conflict revisions, remote tombstones, exact saved edition/location,
no position writes, routing opt-in, public default and rollback. Browser
acceptance uses isolated muted Chromium and WebKit, not personal browser tabs.
WebKit visual evidence uses video frames because screenshot capture changes
nested 3D compositing in the local automation build.

The working-copy full build cannot finish in the established sparse local
checkout (missing generated `public/read/index.html` and content fixtures).
Full test/build/verify-bundle gates run on the complete cloud CI checkout.
Local artifacts and final release receipt: `app/artifacts/library-two-public/` (this release) and
`app/artifacts/library-two-final/` (earlier acceptance).
