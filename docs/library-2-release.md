# Library 2 final preview and cutover

Final test entry: https://tinct.app/lab/library_2/?preview=1

This combines the approved cinematic first visit and the approved bookshelf
for returning readers. Shelf study v3 remains unchanged as a design reference.
The preview link opts only that browser into the new `/` and `/library` entry
for seven days, so returning from `/reader` tests the complete journey. The
preview control after the hero offers actual history, a forced new-reader view,
a clearly labelled sample bookshelf, and Leave preview. Modes never seed or
clear reading history. Opening a real book still uses the production reader.

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
  changes. The one route adjustment selects a library asset for an opted-in
  reviewer; no credentials or permissions depend on the preview cookie.
- Initial scripts are external so the preview also runs under the public
  entry's existing strict Content Security Policy.

## After Anders says go

1. Set `LIBRARY_TWO_DEFAULT = true` in
   `app/src/worker/routes/libraryTwoRelease.ts`. Update the explicit rollout
   guard test to expect true; keep the false-argument rollback test.
2. Update the old-library expectations for `/`, `/library` and `/library/` in
   `worker.seo.test.ts` to the new library asset. `/lab/` stays available as
   a rollback/reference route. Keep held-edition and metadata tests intact.
3. Run focused library/route tests and cloud full test/build/verify-bundle.
   Merge through the serialized GitHub Actions release, wait for deploy smoke.
4. Verify a clean browser at `/` and `/library`, new and actual returning
   histories, Continue -> reader -> Library, explicit book/edition links,
   search/back, save/remove/reload, sign in/out, phone/tablet/desktop geometry,
   and live reader bundle versus the successful deploy job.

Rollback is the same default set back to false with its tests restored, followed
by the same release path. Guest and account shelves remain intact; no data
migration or deletion is required. Reviewers can additionally choose Leave
preview to remove their opt-in cookie.

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
Local artifacts and final release receipt: `app/artifacts/library-two-final/`.
