# Architecture Stabilization

Status: active WIP, last updated 2026-06-16.

Tinct has strong production invariants around reader position, storage, sync, and routing. The next cleanup goal is to move those invariants out of oversized orchestration files without changing behavior.

## Principles

- Extract behavior unchanged before redesigning behavior.
- Move one domain at a time.
- Keep existing guard tests and comments during extraction.
- For reader position, add tests or instrumentation before changing logic.
- Stop and instrument if an extraction changes observable behavior unexpectedly.

## Order

1. Extract signed-in storage bootstrap from `App.tsx`. **Done.**
   - Owns provider install, Supabase critical init, local mirror fallback, migration, online retry, and restore-readiness gates.
   - Leaves reader/book restore adoption in `App.tsx` for now.
2. Extract a reader controller. **Started.**
   - Owns book/chapter/page/session state, saved position, book switching, and remote/cloud adoption.
3. Continue readerSession migration. **Not started.**
   - Make readerSession the only persisted content tuple input.
4. Split `Reader.tsx` by behavior. **Not started.**
   - Start with pagination/navigation extraction and preserve behavior.
5. Split `worker.ts` by route group. **In progress.**
   - Move routes mechanically with existing tests after each group.
6. Split CSS by surface opportunistically. **Only dead CSS cleanup so far.**
   - Avoid broad visual churn.

## Completed Slices

`useStorageBootstrap` extracts storage provider lifecycle state from `App.tsx` while preserving the existing public state shape:

- `storageReady`
- `cloudRestoreSettled`
- `supabaseInitTick`
- `supabaseProviderRef`
- `localFirstFromCacheRef`

Reader position restore and adoption remain in `App.tsx` until they can be moved behind a reader-controller boundary.

Worker route extraction shipped in several small deployable commits:

- `7ed229ee` — extracted audio routes.
- `9e06cd15` — extracted edition patch route.
- `d5f6158d` — extracted issue status routes.
- `a7abb1d4` — extracted billing routes.
- `506c442c` — extracted angle-chat route, then superseded by cleanup below.
- `446a0a7d` — removed legacy angle-chat/onboarding code and fixed library selection scroll-to-top.
- 2026-06-16 — extracted admin metrics route to `worker/routes/adminMetrics.ts`, with route-level tests.
- 2026-06-16 — extracted admin issue dashboard route to `worker/routes/adminIssues.ts`, with route-level tests.
- 2026-06-16 — extracted approve/reject review route to `worker/routes/issueReview.ts`, keeping paragraph lookup, patch writes, audio regen, and email helpers injected from `worker.ts`.
- 2026-06-16 — extracted issue reporting and AI evaluation pipeline to `worker/routes/issueReports.ts`, preserving existing helper tests and adding route-level report tests.
- 2026-06-16 — extracted Brevo email sending plus scheduled lifecycle/anomaly email workflow to `worker/routes/emails.ts`, with route-level tests.
- 2026-06-16 — extracted SEO/static routing, bot blocklist, IndexNow verification, JSON asset cache handling, and SPA fallback to `worker/routes/seo.ts`, preserving `serveSpaWithMetaForTest` and extending SEO route tests.
- 2026-06-16 — extracted `/api/chat` to `worker/routes/chat.ts`, keeping auth/rate-limit injected from the Worker entry point and adding focused tests for auth, rate limits, trial quota, prompt validation, Anthropic payload capping, and quota charging.

The latest deployed cleanup is Worker version `a2f07370-6513-41d5-97c1-cfa526a00973` with live bundle `index-BFv1_ZTF.js`.

Reader controller extraction started with a mechanical state boundary:

- 2026-06-16 — added `hooks/useReaderController.ts` to own `currentBookId`, derived `book`, `savedPos`, `currentChapter`, `currentPage`, `totalPages`, and `readerKey`, while leaving existing App navigation/cloud-adoption behavior unchanged.
- 2026-06-16 — added `hooks/useReaderController.test.ts` to pin initial persisted book/chapter restore, invalid saved chapter fallback, and the setter surface App currently depends on.
- 2026-06-16 — moved `handleBookChange` into `useReaderController`, with injected refs for chat clearing, stale edition-data reset, target-paragraph reset, and perf marker reset. Added regression coverage for same-book URL refresh and cross-book saved-position adoption.
- 2026-06-16 — moved the direct `currentBookId` change guard into `useReaderController`, preserving the cloud-sync bypass invariant that any book-id change re-derives saved position, resets page/totalPages, clears stale reader surfaces, marks cloud-loaded/user-nav state, resets per-book reading angle, and remounts the reader. Added a direct `setCurrentBookId` regression.
- 2026-06-16 — moved startup cloud/current-book restore into `useReaderController`, preserving cloud book adoption, local-first cloud correction, winner selection, restore-settled behavior, and later App consumers of `hasRestoredFromCloud`. Added controller tests for cloud-current-book adoption and local-first position correction.
- 2026-06-16 — moved the focus/visibility Supabase refresh and remote-position adoption fallback into `useReaderController`, preserving debounce, visibility/auth/storage gates, cloud-current-book switching, same-book ahead/chapter-different adoption, behind-position no-op logging, and focused tests for same-book focus adoption plus cloud-current-book switch.
- 2026-06-16 — moved real-time remote-position adoption into `useReaderController`, preserving the `RESTORE_POSITION` readerSession payload while returning the handler to `useRemoteSync`. Added a controller test that remote positions update saved position, chapter/page/totalPages/readerKey, target paragraph, and dispatch the restore event.
- 2026-06-16 — migrated `useReadingLog` chapter-transition tracking to initialize from the first persistable readerSession location instead of legacy `currentChapter`, with a pure transition helper and guard tests so stale legacy chapter state cannot become the previous chapter baseline before readerSession is ready.
- 2026-06-16 — extracted the `useReadingPosition` progress-write decision into a pure `buildReadingProgressUpdate` guard, keeping completion semantics unchanged while making the readerSession-derived progress chapter explicit and covered by regression tests.
- 2026-06-16 — moved core next/previous chapter transitions into `useReaderController`, including readerSession dispatch, user-nav marking, saved-position updates, reader remounts, nav debug logging, and chapter-advance progress completion via `buildReadingProgressUpdate`. App now only wraps those transitions for mobile nav locking and Read/Compare sync cleanup.
- 2026-06-16 — moved explicit chapter selection into `useReaderController`, preserving page reset, target-paragraph jumps, readerSession `USER_SELECT_CHAPTER` dispatch, user-nav marking, saved-position updates, reader remounts, and nav debug logging. App still owns back-position capture, edition preference switching, visible-paragraph hinting, and Read/Compare sync cleanup.
- 2026-06-16 — moved the core back-position return into `useReaderController`, preserving target-paragraph clearing, `USER_SELECT_CHAPTER` dispatch, user-nav marking, saved-position scrollFraction restore, and reader remount semantics. App still owns edition preference restore and clearing the back-position UI affordance.
- 2026-06-16 — moved invalid-position and blank-reader recovery reset mechanics behind `useReaderController.resetInvalidPosition`, preserving corrupted `position:{bookId}` deletes, saved-position clearing, target-paragraph clearing, page reset, optional total-page gating, and reader remount behavior while leaving loaded-edition detection in App.

## Current State

`app/src/worker.ts` now owns the Worker shell: canonical redirect, bot block, CORS preflight, shared auth/rate-limit helpers, route dispatch, scheduled trigger wiring, and static/SEO fallback. The large route domains have been split into route modules.

Already extracted route modules live under `app/src/worker/routes/`:

- `audio.ts`
- `adminIssues.ts`
- `adminMetrics.ts`
- `billing.ts`
- `chat.ts`
- `emails.ts`
- `editionPatches.ts`
- `issueReports.ts`
- `issueReview.ts`
- `issueStatus.ts`
- `seo.ts`

Shared Worker helpers live under `app/src/worker/lib/`:

- `responses.ts`
- `supabase.ts`
- `security.ts`
- `html.ts`

## Last User-Visible Fix

When a book is selected from the library/store, the app now scrolls to the top after closing the store. The bug was that selecting a book could reveal new UI near the top while the viewport stayed at the scrolled library position where the click happened.

Test next time:

- Open Library.
- Scroll down.
- Click a book.
- Confirm the newly opened book/preface is visible from the top.

## Removed Legacy

Removed in `446a0a7d`:

- `/api/angle-chat` route and tests.
- `app/src/worker/routes/angleChat.ts`.
- dead `AngleChat` helper inside `BookOnboarding.tsx`.
- unused `ContextualAnglePrompt.tsx`.
- unused classic `Onboarding.tsx`.
- orphaned angle-chat/contextual prompt CSS.

Compatibility code intentionally kept:

- old URL/share fallbacks in `worker.ts`.
- legacy audio path support.
- storage migration keys such as `tinct-book-onboarded-*`.
- Supabase legacy write fallback.

Do not remove these without a specific compatibility audit.

## Next Good Slice

The Worker route split is done enough to move on. The reader controller owns the basic state tuple, user-driven book switching, direct book-id change recovery, startup cloud/current-book restore, focus/visibility position adoption, real-time remote-position adoption, core chapter next/previous transitions, explicit chapter selection, back-position return, and invalid-position/blank-reader reset mechanics. The next ambitious extraction is remaining direct chapter setter consolidation:

1. Replace remaining user-visible direct `setCurrentChapter` paths with controller helpers where safe.
   - Keep `useReadingPosition` and `useReadingLog` wired to `readerSessionState.location`.
   - Start with deep-link chapter application and onboarding/current-book jump paths.
   - Leave pure recovery guards and render-time bounds clamps alone unless the reset semantics are fully covered.
   - Add focused regression coverage before replacing any direct setter that can affect persisted position.

Avoid touching next unless specifically scheduled:

- reader position restore/adoption.
- pagination and page measurement.
- mobile hidden Read/Compare sync.
- Supabase storage write semantics.

## Verification Baseline

For app changes:

```bash
cd app
export PATH=/Users/andershvelplund/.nvm/versions/node/v24.13.0/bin:$PATH
npm test -- --run
npm run build
npm run verify-bundle
```

For deploys, only run after Anders asks:

```bash
cd app
export PATH=/Users/andershvelplund/.nvm/versions/node/v24.13.0/bin:$PATH
npm run deploy
```

Before deploy, keep ignored duplicate public JSON files out of `app/public/data` because Vite uploads public files even when git ignores them:

```bash
rm -rf /tmp/tinct-public-duplicate-json && mkdir -p /tmp/tinct-public-duplicate-json
find app/public/data -name '* 2.json' -print0 | while IFS= read -r -d '' f; do
  target="/tmp/tinct-public-duplicate-json/$f"
  mkdir -p "$(dirname "$target")"
  mv "$f" "$target"
done
```

Restore them after deploy:

```bash
if [ -d /tmp/tinct-public-duplicate-json/app/public/data ]; then
  (cd /tmp/tinct-public-duplicate-json && find app/public/data -type f -print0) | while IFS= read -r -d '' f; do
    mkdir -p "$(dirname "$f")"
    mv "/tmp/tinct-public-duplicate-json/$f" "$f"
  done
fi
```

## Open Question: Book Work Polluting The App Worktree

Question from Anders: is it possible to avoid adding/generating books polluting the app worktree?

Yes. The cleanest pattern is to separate the book production workspace from published app state.

Recommended Tinct pattern:

1. Keep WIP books outside tracked app paths.
   - Use `books/wip/` for drafts, generated intermediates, QA notes, audio manifests, and experiments.
   - Only copy into `app/public/data/**` and update `app/src/data/bookRegistry.ts` when publishing.
2. Add or preserve ignored staging folders.
   - `books/wip/`
   - `books/generated/`
   - optionally `app/public/data/_staging/`
3. Generate into `/tmp`, `books/wip/`, or another ignored path first.
4. Do not update registry/taxonomy/onboarding/threads/sitemap/generated meta until publish.
5. Add a narrow promote/publish script with dry-run:

```bash
books/publish_book.py treasure-island --dry-run
books/publish_book.py treasure-island
```

The script should copy only approved final files into tracked app paths, update registry/taxonomy only when requested, then run validation.

6. Consider a separate git worktree for noisy content work:

```bash
git worktree add ../Tinct-content content/work
```

Best current recommendation: make `books/wip/` the default generation target, keep it ignored, and add a narrow "promote to app" step. Do not let normal book generation write directly into `app/public/data/**`.
