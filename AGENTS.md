# Tinct Agent Instructions

## Scope

This repository is Tinct, a deep-reading platform for public-domain texts. It includes a React/Vite app, book edition data, QA tooling, Cloudflare deployment, Supabase auth/storage, Stripe billing, R2 audio, and Capacitor Android.

Use this file as the Codex source of truth. Older `CLAUDE.md` files may contain useful history, but they also include Claude-specific workflow rules that do not apply to Codex.

## Directories

- Git root: `/Users/andershvelplund/Documents/Projects/Tinct`
- App root: `/Users/andershvelplund/Documents/Projects/Tinct/app`
- Book factory: `/Users/andershvelplund/Documents/Projects/Tinct/books`
- QA tooling: `/Users/andershvelplund/Documents/Projects/Tinct/qa`
- User-provided screenshots: `/Users/andershvelplund/Documents/Screenshots`. When Anders says to review or see screenshots, look there first.

Run `git` commands from the repository root. Run `npm`, `npx`, Vite, and Wrangler commands from `app/`.

For a quick cross-workstream overview, read `PIPELINES.md` or run:

```bash
bash scripts/tinct-status.sh
```

For the post-travel resume plan across architecture, APK, SEO, and content,
read `docs/two-month-project-pipeline-2026-06-17.md` first. It is the current
high-level project pipeline as of the June 17, 2026 shutdown checkpoint.

For book publication/WIP inventory, do not answer from memory or stale markdown.
Run the current-file inventory instead:

```bash
python3 books/wip_inventory.py
python3 books/wip_inventory.py --audio   # when audio/R2 status matters
```

Interpretation rules:
- Published/live books are only entries in `app/src/data/bookRegistry.ts` `BOOKS`.
- Staged books are `Book` constants not included in `BOOKS`.
- Loose books are edition files with no registry constant.
- Ignore duplicate junk files such as `* 2.json` and `.bak` unless the app references them.

## Hard Rules

- Until Tinct has more than 10 users, deploy-after-verify is the default. After `npm run build` and `npm run verify-bundle` pass, deploy with `npm run deploy` from `app/` using the Node 24 nvm path. Do not ask first. Skip deploy only if Anders says local-only. Never run raw `wrangler deploy`. Never deploy from a dirty or unreconciled local checkout. Never deploy secrets. Never skip verify-bundle.
- Do not call Anthropic APIs during development. The production reader chat may use Claude, but development content generation must happen in the agent conversation and be written to files.
- Do not run `generate-editions.cjs` for development work.
- Keep app, content, and audio work separated as described in `docs/workflow-boundaries.md`.
- Preserve user changes. Never revert, reset, or clean unrelated files unless Anders explicitly asks.
- Prefer narrow fixes over broad rewrites, especially in reader, pagination, sync, auth, billing, and storage code.
- If a change touches position, pagination, sync, or chapter navigation, trace the actual data flow before patching.

## Verification

For app changes, use:

```bash
cd app
npm run build
npm run verify-bundle
```

After those gates pass, deploy with the Node 24 nvm install. Do not ask first unless Anders said local-only:

```bash
cd app
export PATH=/Users/andershvelplund/.nvm/versions/node/v24.13.0/bin:$PATH
npm run deploy
```

`npm run deploy` is the only approved deploy path because it chains build, bundle verification, and Wrangler. Do not run raw `wrangler deploy`.

Current caveat: plain `npx tsc --noEmit` is not a clean repo gate; it reports existing unrelated errors in legacy/worker files. Prefer the project build and focused tests until the TypeScript baseline is cleaned up.

## Reader And Position Invariants

These are production-critical:

- Position writes must keep `bookId`, `chapterNumber`, page, and paragraph data as a coherent tuple.
- ReaderSession is the source for persisted reader-state tuples. `App.tsx` owns a reducer-backed `readerSessionState` and passes that to `useReadingPosition` and `useReadingLog`; legacy reader page/chapter state may still drive rendering during migration, but it must not be used as the persisted content tuple.
- Any code path that changes `currentBookId` must re-derive chapter and saved position for the new book.
- Position writes must be suspended while overlays/auth/onboarding/loading states can expose stale reader state.
- Reading history/progress writes must require a ready same-book ReaderSession location before touching `reading-log:*` or `progress:*`.
- User-data writes are versioned through `commit_user_data`; deletes are tombstone writes (`value: null`) so other devices receive the change.
- Backward chapter writes require a recent user-navigation signal.
- Positions loaded from storage/cloud must be validated against the actual book structure.
- Position writes must skip during the render where `bookId` just changed but chapter/paragraph state still belongs to the previous book.
- Chapter advance always opens the next chapter at page 1 in both Read and Compare.
- Chapter retreat opens the previous chapter at the last page.
- Read/Compare paragraph sync is chapter-scoped. A sync signal from chapter N must never apply to chapter N+1.
- On mobile, hidden Read/Compare views must not commit shared `currentPage` or `totalPages`.
- Reader page/chapter navigation must not open Chat, Feed, or Cast.
- Chat history is book-scoped. Every persisted chat message must carry the `bookId` it was created under, and chat persistence must reject messages whose `bookId` does not match the target `chat-history:{bookId}` store.

If a rule seems redundant, write or run a focused regression before removing it. These rules exist because similar bugs have repeatedly returned.

## Bug Fix Protocol

For non-trivial bugs:

1. Reproduce or identify the concrete bad writer/path first.
2. Make the smallest fix that establishes an invariant.
3. Add or update a regression test when practical.
4. Build and verify before reporting done.
5. If two attempts fail, stop and instrument instead of trying a third guess.

## Product And UX Notes

- Tinct should feel warm, literary, clean, and focused.
- Reading position is sacred. View, edition, language, font, and layout changes must not lose the reader's place.
- The library taxonomy is Houses -> Shelves -> Books. Every production book must be classified into this taxonomy when it is added or registered.
- Default reader is a single edition. Split/Compare is opt-in and should sync roughly by paragraph/sentence within the same chapter.
- Mobile has five tabs: Read, Compare, Chat, Feed, Cast. Read and Compare are separate mounted reader views.
- Do not change the reader UX paradigm, pricing, content strategy, database schema, or external dependencies without asking Anders.

## Browser Cache Guidance For Anders

Anders uses a Danish Mac keyboard. Do not default to telling him `Cmd+Shift+R`.

Recommended cache-busting guidance:

1. Open a private/incognito window.
2. In Chrome with DevTools open: right-click reload -> Empty Cache and Hard Reload.
3. In Safari: Develop -> Empty Caches, then reload.

For embedded iframes, private/incognito is the most reliable option.
