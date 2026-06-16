# Tinct Architecture Handoff — 2026-06-16

Audience: Anders and a future coding agent resuming after travel.

Purpose: preserve the current architecture state, production invariants, and recommended next moves. This is not a task list to execute blindly. For reader, position, pagination, sync, auth, billing, and storage, re-trace the live data flow before patching.

## Current Production Baseline

- Production app is deployed and smoke-tested as of 2026-06-16.
- Latest deploy for the mobile Library text-overlap fix:
  - Worker version: `a3717529-f6bb-4b1c-9b46-362bf085fd97`
  - Commit: `978e3a6e fix: prevent mobile library card text overlap`
  - Production smoke test: 15/15 passing.
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

1. Do not start with architecture work. First build and use the APK, and collect any field bugs from actual reading.
2. If reading position is stable in real use, keep the app as-is until there is a concrete bug or clearly bounded refactor.
3. If position issues remain, implement paragraph plus intra-paragraph offset from `docs/position-anchor-plan.md` before deeper Reader refactors.
4. Finish Slice 4 only in small pieces:
   - selection engine extraction first, if there is an active selection bug;
   - pagination extraction only with mobile and desktop screenshot/device verification.
5. Add a pre-deploy guard so staged book files cannot accidentally publish just because they exist in `app/public/data`.
6. Keep book production and app deployment work separated. Run `python3 books/wip_inventory.py` before making publication claims.

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
