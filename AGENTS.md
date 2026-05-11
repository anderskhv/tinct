# Tinct Agent Instructions

## Scope

This repository is Tinct, a deep-reading platform for public-domain texts. It includes a React/Vite app, book edition data, QA tooling, Cloudflare deployment, Supabase auth/storage, Stripe billing, R2 audio, and Capacitor Android.

Use this file as the Codex source of truth. Older `CLAUDE.md` files may contain useful history, but they also include Claude-specific workflow rules that do not apply to Codex.

## Directories

- Git root: `/Users/andershvelplund/Documents/Projects/Tinct`
- App root: `/Users/andershvelplund/Documents/Projects/Tinct/app`
- Book factory: `/Users/andershvelplund/Documents/Projects/Tinct/books`
- QA tooling: `/Users/andershvelplund/Documents/Projects/Tinct/qa`

Run `git` commands from the repository root. Run `npm`, `npx`, Vite, and Wrangler commands from `app/`.

## Hard Rules

- Do not deploy unless Anders explicitly asks.
- Do not call Anthropic APIs during development. The production reader chat may use Claude, but development content generation must happen in the agent conversation and be written to files.
- Do not run `generate-editions.cjs` for development work.
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

Use the Node 24 nvm install for Wrangler deploys:

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
- Any code path that changes `currentBookId` must re-derive chapter and saved position for the new book.
- Position writes must be suspended while overlays/auth/onboarding/loading states can expose stale reader state.
- Backward chapter writes require a recent user-navigation signal.
- Positions loaded from storage/cloud must be validated against the actual book structure.
- Position writes must skip during the render where `bookId` just changed but chapter/paragraph state still belongs to the previous book.
- Chapter advance always opens the next chapter at page 1 in both Read and Compare.
- Chapter retreat opens the previous chapter at the last page.
- Read/Compare paragraph sync is chapter-scoped. A sync signal from chapter N must never apply to chapter N+1.
- On mobile, hidden Read/Compare views must not commit shared `currentPage` or `totalPages`.
- Reader page/chapter navigation must not open Chat, Feed, or Cast.

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
