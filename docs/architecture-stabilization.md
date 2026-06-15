# Architecture Stabilization

Status: started 2026-06-15.

Tinct has strong production invariants around reader position, storage, sync, and routing. The next cleanup goal is to move those invariants out of oversized orchestration files without changing behavior.

## Principles

- Extract behavior unchanged before redesigning behavior.
- Move one domain at a time.
- Keep existing guard tests and comments during extraction.
- For reader position, add tests or instrumentation before changing logic.
- Stop and instrument if an extraction changes observable behavior unexpectedly.

## Order

1. Extract signed-in storage bootstrap from `App.tsx`.
   - Owns provider install, Supabase critical init, local mirror fallback, migration, online retry, and restore-readiness gates.
   - Leaves reader/book restore adoption in `App.tsx` for now.
2. Extract a reader controller.
   - Owns book/chapter/page/session state, saved position, book switching, and remote/cloud adoption.
3. Continue readerSession migration.
   - Make readerSession the only persisted content tuple input.
4. Split `Reader.tsx` by behavior.
   - Start with pagination/navigation extraction and preserve behavior.
5. Split `worker.ts` by route group.
   - Move routes mechanically with existing tests after each group.
6. Split CSS by surface opportunistically.
   - Avoid broad visual churn.

## Current First Slice

`useStorageBootstrap` extracts storage provider lifecycle state from `App.tsx` while preserving the existing public state shape:

- `storageReady`
- `cloudRestoreSettled`
- `supabaseInitTick`
- `supabaseProviderRef`
- `localFirstFromCacheRef`

Reader position restore and adoption remain in `App.tsx` until they can be moved behind a reader-controller boundary.
