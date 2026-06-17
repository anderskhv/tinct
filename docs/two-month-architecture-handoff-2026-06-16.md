# Tinct Architecture Handoff — 2026-06-16

Audience: Anders and a future coding agent resuming after travel.

Purpose: preserve the current architecture state, production invariants, and recommended next moves. This is not a task list to execute blindly. For reader, position, pagination, sync, auth, billing, and storage, re-trace the live data flow before patching.

## Current Production Baseline

- Production app is deployed and smoke-tested as of 2026-06-17.
- Latest deploy:
  - Worker version: `0d9dcf58-b4fc-4fe9-9576-52aa42f2db49`
  - Commit: `395a6bfcc landing: show 100 books`
  - Production smoke test: 15/15 passing.
  - Full app verification before deploy: `npm run build`, `npm run verify-bundle`, and `npm test -- --run` all passed.
- Android test APK built from this deployed source:
  - `/Users/andershvelplund/Desktop/Tinct-test-2026-06-17.apk`
  - Size: about 224 MB.
- IndexNow was submitted after deploy:
  - 3,964 URLs from `app/public/sitemap.xml`
  - key file verified at `https://tinct.app/5a6b72273730443da563f8cf68e1519c.txt`
  - IndexNow response: HTTP 200.
- Important count caveat:
  - The deployed clean worktree generated 99 book landing pages.
  - The landing page says "100 books" because Anders requested that copy.
  - Ivan Ilyich exists as committed local book work in the main repo, but those commits are not in remote `main` or the APK listed above.
  - As of this handoff, `https://tinct.app/read/ivan-ilyich` returns 404 and `ivan-ilyich` is not in the deployed sitemap.
  - First follow-up: reconcile and publish the Ivan Ilyich commits, or change the landing copy back to match the deployed registry.
- Werther is live. Audio manifests for `original-en` and `modern-en` chapters 1-84 were checked through the Worker before publication.
- Treasure Island modern-en repair work must not be assumed live. A WIP commit was kept out of production and preserved on branch `preserve/treasure-island-wip-e341bc5e`. There may also be local uncommitted Treasure Island edits in `app/public/data/editions/treasure-island-modern-en.json`.

## What Was Stabilized

### Reader and Sync

- `readerSession` is now the source for persisted content-tuple writes during reading.
- Position, progress, and reading-log writes must derive from the coherent tuple:
  - `bookId`
  - `chapterNumber`
  - page
  - paragraph data
- Mobile Read and Compare views are separate mounted reader surfaces. Hidden views must not commit shared `currentPage` or `totalPages`.
- Read/Compare paragraph sync is chapter-scoped. A signal from chapter N must never apply to chapter N+1.
- The recent mobile restore bugs were caused by treating a chapter-level `scrollFraction` as cross-edition truth. It is layout- and edition-specific.

### Worker

- Worker route split is mostly complete.
- `app/src/worker.ts` should remain the shell: redirects, bot block, CORS preflight, shared auth/rate-limit helpers, route dispatch, scheduled trigger wiring, and static/SEO fallback.
- Route modules live under `app/src/worker/routes/`.
- Shared Worker helpers live under `app/src/worker/lib/`.

### Reader.tsx Split

- Slice 4 is half-done.
- Extracted into `app/src/components/reader/`:
  - `selectionGeometry.ts`
  - `useDefine.ts`
  - `issueReport.ts`
  - `SelectionPopup.tsx`
- The fragile remaining areas are the selection engine and pagination. These should only be touched with focused tests and device verification.

## Important Recent Bug Fixes

- Removed service-worker tab-focus reload.
- Fixed blank chat pane caused by over-filtering chat history to the current chapter.
- Fixed mobile viewport thrash by moving shell sizing from `100dvh` to `100svh`.
- Suppressed highlight-popup flash caused by native selection events after tapping an existing highlight.
- Fixed mobile Read/Compare flutter and refresh-to-chapter-start loops by preferring paragraph restore over cross-edition fraction restore.
- Fixed Library selection scroll behavior.
- Fixed mobile Library card text overlap by constraining search-result cards and text width.
- Improved preface/cast overlay readability and made the Danish translation toggle more visible.
- Made desktop split/Compare reading use more of the available wide screen by raising the split content cap on desktop. This was a CSS-only width change; paragraph pairing/alignment logic was not touched.
- Made reader edition choices per-book so opening from SEO defaults to original English + modern English split view, while choices made in one book do not bleed into another.
- Added a collapsible Key Figures reminder in Cast and linked those figures to their normal Cast cards.
- Improved generated book SEO landing pages so their layout matches the curated SEO chapter pages more closely.
- Updated the public landing page copy to say "100 books".

## Position Anchor Direction

The current long-term direction is paragraph-first anchoring with content-local intra-paragraph refinement:

- Persist `chapterNumber`, `paragraphIndex`, and an optional `charOffset`.
- Derive `paragraphFraction = charOffset / paragraphLength` when needed.
- Same edition restore:
  - use `charOffset` inside the paragraph for exact page recovery.
- Cross edition restore:
  - use `paragraphIndex` as the stable anchor;
  - use `paragraphFraction * targetParagraphLength` as a best-effort intra-paragraph refinement.
- Keep `scrollFraction` as legacy fallback, progress signal, and regression guard only. Do not rely on it across editions.

This matters because some books have very long paragraphs. Paragraph-only anchoring can land the reader at the start of a multi-page paragraph. Paragraph plus intra-paragraph offset is the better model.

Open implementation questions:

- Store both `charOffset` and `paragraphFraction`, or store `charOffset` only and derive fraction at read time?
- Is page-granular restoration inside a paragraph enough, or should restoration target an exact DOM range where practical?
- How long should paragraph restore retry before falling back to legacy `scrollFraction`?
- Should position capture happen on every write or only after layout is settled?

See `docs/position-anchor-plan.md` for the detailed proposal.

## Critical Invariants To Preserve

- Reading position is sacred. View, edition, language, font, layout, refresh, and mobile tab changes must not lose the reader's place.
- Any code path that changes `currentBookId` must re-derive chapter and saved position for the new book.
- Position writes must be suspended while overlays/auth/onboarding/loading states can expose stale reader state.
- Reading history/progress writes must require a ready same-book `readerSession.location`.
- User-data writes are versioned through `commit_user_data`; deletes are tombstone writes (`value: null`) so other devices receive the change.
- Backward chapter writes require a recent user-navigation signal.
- Positions loaded from storage/cloud must be validated against the actual book structure.
- Chapter advance opens the next chapter at page 1.
- Chapter retreat opens the previous chapter at the last page.
- Reader page/chapter navigation must not open Chat, Feed, or Cast.
- Chat history is book-scoped. Every persisted chat message must carry the `bookId`.

## Recommended Next Moves After Travel

1. Reconcile the Ivan Ilyich / 100-book state before making any publication claim:
   - local main contains committed Ivan Ilyich work;
   - remote `main`, production, and the APK currently do not;
   - either merge/publish Ivan Ilyich with full verification or change the landing count back to match the live registry.
2. Do not start with architecture work. First install and use `/Users/andershvelplund/Desktop/Tinct-test-2026-06-17.apk`, and collect any field bugs from actual reading.
3. If reading position is stable in real use, keep the app as-is until there is a concrete bug or clearly bounded refactor.
4. If position issues remain, implement paragraph plus intra-paragraph offset from `docs/position-anchor-plan.md` before deeper Reader refactors.
5. Finish Slice 4 only in small pieces:
   - selection engine extraction first, if there is an active selection bug;
   - pagination extraction only with mobile and desktop screenshot/device verification.
6. Add a pre-deploy guard so staged book files cannot accidentally publish just because they exist in `app/public/data`.
7. Continue the SEO roadmap from strategy-level pages, not more plumbing:
   - translation-comparison pages are the next high-leverage item;
   - start with `Crime and Punishment in modern English` / `best translation of Crime and Punishment`;
   - then scale to Russians and epics.
8. Keep book production and app deployment work separated. Run `python3 books/wip_inventory.py` before making publication claims.

## SEO And Bing Crawl Capacity

Bing Webmaster Tools reported "Limited crawl capacity on website" in June 2026. The useful comparison was Poetry Editor, which has roughly 15k pages and does not show the same warning. Page count and raw server speed are probably not the main cause.

The stronger diagnosis:

- Tinct reader/book URLs currently return mostly identical React shell HTML.
- The real book text is loaded client-side from `/data/*.json`.
- `/data/` is intentionally blocked in `robots.txt`, so crawlers that do not spend JavaScript rendering budget see very little unique page body content.
- This makes thousands of `/read/...` URLs look thin or duplicate to Bing, which is exactly the kind of site where Bing rations crawl capacity.
- Poetry Editor pages include substantial unique poem/analysis text in raw HTML, so they are cheap and valuable for crawlers to fetch.

Do not respond by blocking the useful `/read/...` URLs. The better roadmap item is to make those URLs crawler-useful.

Recommended scope:

Completed before travel:

- Book landing pages are now served from explicit prerendered assets instead of generic shells.
- Generated book landing pages have crawler-visible book descriptions, edition links, and internal links.
- Generated book landing page layout was adjusted to match the better curated SEO chapter-page style.
- IndexNow was run manually after the final 2026-06-17 deploy.

Remaining scope:

1. Split the sitemap into a sitemap index with separate static/book/chapter sitemaps.
2. Keep sitemap `lastmod` stable unless content actually changes.
3. Change SEO/static page cache headers away from blanket `no-store` where safe.
4. Add strategic translation-comparison pages. This is likely higher leverage than more technical SEO cleanup.
5. Raise Bing crawl quota in Webmaster Tools as a harmless operational step, but treat it as secondary.

This is comeback-roadmap work, not an emergency travel fix.

## Commands To Re-Establish Confidence

From repo root:

```bash
bash scripts/tinct-status.sh
python3 books/wip_inventory.py
python3 books/wip_inventory.py --audio
```

For app verification:

```bash
cd app
export PATH=/Users/andershvelplund/.nvm/versions/node/v24.13.0/bin:$PATH
npm test -- --run
npm run build
npm run verify-bundle
bash scripts/smoke-test.sh
```

For deploys, only after Anders explicitly asks:

```bash
cd app
export PATH=/Users/andershvelplund/.nvm/versions/node/v24.13.0/bin:$PATH
npm run deploy
```

For Android test APK builds:

```bash
cd app
export PATH=/Users/andershvelplund/.nvm/versions/node/v24.13.0/bin:$PATH
npm run build:android
cd android
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="/Users/andershvelplund/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
./gradlew assembleDebug
```

Expected debug APK output:

```text
app/android/app/build/outputs/apk/debug/app-debug.apk
```

## Known Local Worktree Caveat

At the time this handoff was written, there were untracked book-production scripts/WIP folders and a tracked local edit to:

```text
app/public/data/editions/treasure-island-modern-en.json
```

Do not delete or revert those without Anders explicitly asking. If building a release/test artifact that should match production, temporarily isolate those changes or build from a clean worktree.
