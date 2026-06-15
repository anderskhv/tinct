# Architecture Stabilization

Status: active WIP, last updated 2026-06-15.

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
2. Extract a reader controller. **Not started.**
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

The latest deployed cleanup is `446a0a7d`, deployed as Worker version `dcc1800e-5655-49a5-af27-64ae00c2180a` with live bundle `index-BV7spGUm.js`.

## Current State

`app/src/worker.ts` is now smaller but still owns large domains:

- `/api/chat`
- issue reporting and AI evaluation/review flows
- admin issue dashboard
- admin metrics
- scheduled anomaly email
- SEO/static asset routing and SPA fallback

Already extracted route modules live under `app/src/worker/routes/`:

- `audio.ts`
- `billing.ts`
- `editionPatches.ts`
- `issueStatus.ts`

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

Do not start with reader state unless Anders explicitly wants the higher-risk phase.

Good next backend cleanup options:

1. Extract admin metrics route.
   - Medium risk, mostly isolated.
   - Keep `verifySiteAdmin`, `formatSupabaseIn`, and metrics email exclusion helpers either injected or moved together.
2. Extract admin issue/review route.
   - Higher risk because it includes anonymous user content, HTML forms, patch writes, and reviewer email links.
   - Re-audit escaping while moving.
3. Extract SEO/static routing.
   - Medium risk but broad surface; needs existing `worker.seo.test.ts` coverage after every step.

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
