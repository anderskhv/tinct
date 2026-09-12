# Ask fails on a withheld edition — 2026-09-12

## Confirmed

1. `migrateWithheldEdition()` (`app/src/data/withheldEditions.ts`) is called in exactly two
   places, both in `app/src/readerSession/reducer.ts` (`EDITION_READY`, `RESTORE_POSITION`).
   Nothing under `app/src/lab/` calls it. The lab is what is being demoed.

2. The Bible registry entry (`BIBLE` in `app/src/data/bookRegistry.ts`) now carries only
   `kjv-en` and `web-en`. `public/data/editions/bible-modern-en.json` and the
   `bible-modern-*` chapter shard directories are gone (commit 19cc4f74a).

3. Reader text does NOT break, which is why the bug looked chat-only.
   `LabApp.tsx` (~line 1090) validates the stored `prefs.primaryEdition` against
   `bookEditions` and silently substitutes `bookEditions[0]` (= `kjv-en`) for the LOAD,
   but `prefs.primaryEdition` itself is never rewritten. `readerEditionKey`
   (`LabApp.tsx:470`) is `prefs.primaryEdition`, and that is what `useLabAsk` puts in the
   ask context as `editionKey` and ships to `/api/chat` | `/api/lab-chat`. So the screen
   shows KJV while the request says `modern-en`.

4. Worker: `createBookRetrieval` builds `editionId = ${bookId}-${editionKey}`, fetches
   `/data/editions-chapters/bible-modern-en/manifest.json` then
   `/data/editions/bible-modern-en.json`. Both 404 → `loadIndex()` null →
   `read_chapter` / `find_in_book` return
   `{ content: 'The book text is not available right now.', isError: true }`.
   The first round has already streamed "Let me pull up the exact text…" and the turn
   then dies on the tool round. There was no fallback to an available edition.

5. Client latch: `useLabAsk.fail()` sets `notice`, and `notice` was only cleared by
   `dismissNotice()` or by starting another typed send. `retryTyped` is only offered
   while `failedTyped.userTurn.bookId` still matches the current book — change book and
   the retry affordance disappears with the notice still standing.

## Why the withheld editions are still offered (coordinator's item)

`app/public/lab/catalogue.json` is a build artifact generated from `BOOKS` by
`app/src/preReader/catalogue.ts` (vite plugin `lab-pre-reader-catalogue`). The
freshly-built artifact is already correct — the registry no longer has the editions.
But every fetch of it is cache-busted by a hand-maintained version string:

    public/lab/catalogue-runtime.js:1413   /lab/catalogue.json?v=20260910-availability-1
    public/lab/library-2-runtime.js:327    /lab/catalogue.json?v=20260910-availability-1
    src/labReadingMemory.ts:133            /lab/catalogue.json?v=20260907-4

The 2026-09-11 withdrawal did not bump it, so browsers and the CDN keep serving the
pre-withdrawal catalogue, which still lists `modern-en` / `modern-da` for the Bible.
Picking one there is what writes the stale `primaryEdition` into `tinct-lab-prefs`
in the first place. Fix = bump the version AND make the generator and the pickers
filter withheld editions so a stale artifact can never offer them again.
