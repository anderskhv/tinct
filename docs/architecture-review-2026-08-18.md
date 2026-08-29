# Tinct Architecture Review — 2026-08-18

## 0. Framing note

CLAUDE.md's "Current State" is stamped `Last verified: 2026-04-20` — four months stale, in direct violation of its own rule ("Last verified date >7 days old → read the actual code, don't trust docs"). SESSION.md is stamped `2026-04-29`, also stale, despite the project's own rule that "a session that ends without updating SESSION.md is a bug." Concretely: CLAUDE.md says "33 public books"; the registry actually has **100**. Two internal docs (`docs/architecture-stabilization.md`, `docs/two-month-architecture-handoff-2026-06-16.md`) from June are the *actual* current source of truth on architecture state, and they're more accurate than CLAUDE.md itself.

Everything below is based on reading the live code as of today, cross-checked against those two docs and git log.

## 1. High-level system shape

Real data flow, not aspirational:

- **Client (React/Vite SPA)** — reads book text from static `/public/data/editions/*.json` (167MB, 415 files, fetched directly by the browser, not proxied), talks to the **Cloudflare Worker** (`src/worker.ts`, 183 lines) for `/api/*` (chat, billing, audio, admin), and talks to **Supabase directly from the browser** for auth + user-data CRUD + Postgres Realtime (the Worker is *not* in the path for normal storage reads/writes — only `verifyUser()`/`verifySiteAdmin()` calls Supabase server-side, for admin/billing routes).
- **Cloudflare Worker** — thin router (`worker.ts`) dispatching to 11 route modules in `src/worker/routes/*`. Handles: Claude API proxy (`chat.ts`, KV-backed rate limiting), Stripe billing (`billing.ts`), R2 audio serving with byte-range support (`audio.ts`), SEO static-page generation/serving (`seo.ts`, 429 lines), issue-report/patch pipeline (three files, ~1350 lines — readers flag text errors, AI evaluates, auto-patches editions), scheduled email jobs (cron).
- **Supabase** — `user_data` table (key/value with `rev` column) via `commit_user_data()` RPC for optimistic-concurrency writes, Realtime for cross-device push, Auth (email + Google OAuth). Client mirrors every cloud read/write into `localStorage` as a synchronous cache (`SupabaseStorageProvider`).
- **R2** — audio files, served through the Worker (deliberate — R2 bucket isn't public yet, "make private" audit item still open).
- **Stripe** — Checkout + client portal + webhook, all server-side in `billing.ts`.
- **Capacitor/Android** — wraps the same Vite build; `CAPACITOR=true` env flag changes the build target, no separate codepath.

Sound and conventional shape. Worth naming: the browser talks to Supabase directly for the bulk of app state, and to the Worker only for AI/billing/audio/admin. Reasonable split (Supabase RLS authorizes user_data), but two different network dependency chains both have to be healthy for the app to feel correct — a Supabase outage degrades differently (via localStorage fallback) than a Worker outage (chat/audio/billing hard-fail). No unified health/circuit-breaker layer; each hook does its own fallback.

## 2. State management architecture — the real story

**App.tsx: 3,959 lines, 39 `useEffect`, 31 `useState`, 43 `useCallback`, 21 `useMemo`.** Textbook god-object by line/hook count. The more important finding: the project has **two parallel state-authority systems for the same data**, mid-migration between them.

1. **Old system** — ad-hoc React state in App.tsx (`currentChapter`, `currentPage`, `lastParagraphIndex`), persisted via `useReadingPosition`/`useReadingLog`, protected by *heuristic, timing-based guards* in `useReadingPosition.guards.ts` — grace windows, shape-sniffing (`isDefaultishPosition`), "how long ago did the user navigate" checks. These guards exist because the underlying state has no single canonical writer — the code has to *guess* which write is real by shape and timing.

2. **New system** — `readerSession`, a proper reducer (`src/readerSession/reducer.ts`, 215 lines) with a typed event union, an explicit `revision` counter, and a `status` state machine. Well-designed: `isValidLocation()` validates against actual book structure, `withLocation()` is a single controlled transition function.

The catch, confirmed by `docs/architecture-stabilization.md` and Invariant #1 in CLAUDE.md: **the reducer only owns the persisted-write path.** Rendering is still driven by legacy App.tsx state, synchronized by hand. That's why CLAUDE.md needs 9 numbered invariants and guard-file comments like "if this looks unnecessary, run the tests before deleting" — the invariants compensate for two sources of truth instead of one.

**Evidence this is still live, not solved:** the three most recent commits — dated **yesterday and today** (Aug 17–18) — `Fix reader persistence and offline recovery`, `Harden early Bible position recovery`, `Gate focus refresh by time away` — all touch `useReaderController.ts`, `useReadingPosition.guards.ts`, `readerSession/positionSync.ts`. Each adds new guard/grace-window logic rather than removing the dual-source problem. Two months after the June "stabilization" effort, still generating patches today.

`useReaderController.ts` (724 lines) is the extraction-in-progress meant to eventually own this — real, positive progress already pulled out of App.tsx. But App.tsx still owns overlay/auth/onboarding orchestration, ~10+ modal booleans, edition switching, and the wiring between hooks. **No test file exists for App.tsx itself** — only the extracted pure logic is unit-tested; orchestration is validated purely by manual QA.

**Verdict:** not incoherent, but genuinely mid-migration, paying the cost of running two systems at once. The system being migrated *toward* is sound; the part still partially in production is the fragile part, and it's the part generating bugs this week.

## 3. Storage/sync layer — the strongest-engineered part of the codebase

`services/supabaseStorage.ts` (885 lines) + `supabaseStorage.versioning.ts` (tested) is genuinely well done:

- **Optimistic concurrency via `commit_user_data(p_expected_rev)`** — correct pattern for multi-device sync, not naive last-write-wins. Conflict → adopt server row rather than blind retry.
- **Legacy fallback** for environments where the RPC doesn't exist yet (error codes 42703/42883/PGRST202/204) — falls back to plain upsert. Sane hedge against partial migrations.
- **Two-phase init** — fetches only what's needed to pick the right book/chapter before render, backfills the rest. Good perf instinct.
- **Same-tab fanout via `BroadcastChannel`**, separate from cross-device Realtime, with sender-id echo suppression and a time window to avoid "my own write bounces back and overwrites itself." Most hand-rolled sync layers miss this; here it's explicit and commented.
- **Tombstone deletes** (`value: null`) so Realtime UPDATE events carry deletions cross-device.
- **Retry + persistent pending-write queue**, replayed on `online` or next successful write.

The cited 2026-05-06 bug (anonymous-mode localStorage cache surviving sign-out, polluting the next account) was a real gap — the mirror-cache had no lifecycle tied to auth identity — and the fix (`clearLocalUserData()` + `tinct:last-user-id` guard) is the correct fix, not a band-aid. This is hand-rolled, but hand-rolled *well* — every edge case it handles traces to a documented incident. The one area of the codebase to point to as genuinely well-designed, not damned by faint praise.

## 4. Content/editions pipeline

`bookRegistry.ts`: 3,271 lines, 100 `Book` constants + a `BOOKS` array literal listing all 100 on one very long line. Scales fine as data volume (book #101 ≈ 15 lines), but the single-file, single-array structure has a real ceiling: every book-registration touches the same `BOOKS = [...]` line — merge-conflict-prone once more than one session is adding books concurrently (which is exactly how the "Books CEO" workflow operates). Not a runtime problem yet; an active nuisance by 150-200 books.

`public/data/editions/`: 167MB across 415 files (static, not bundled into JS — confirmed). `editionLoader.ts` already implements chapter-sharded and windowed loading for large books (Bible editions are 4.3/4.2/4.0/3.8MB each) — the team already solved "don't load a 4MB JSON in one fetch." Worth a quick audit of whether *all* long books use sharding or only some, but this is a solved problem, not a risk.

**SEO/content mismatch** (open, from the June handoff): `/read/...` URLs serve a mostly-empty React shell because book text loads client-side from `/data/*.json`, deliberately blocked in `robots.txt`. Bing flagged "Limited crawl capacity" as a result. Structural reason organic growth may underperform page count — partially addressed (100 book landing pages exist) but chapter-level pages are not.

## 5. Worker/backend architecture — the cleanest part of the codebase

`worker.ts` (183 lines): canonical-domain redirect, bot-block, CORS preflight, plain `switch` dispatch, shared `verifyUser`/`verifySiteAdmin`/`checkRateLimit` helpers passed explicitly into route handlers (not a framework, not middleware chains). Easy to read and test in isolation — every route module has a matching test file. The extraction from a monolithic worker.ts into 11 route modules + shared `worker/lib/` helpers was done incrementally, each slice shipped and tested separately, and is essentially complete. Rate limiting fails open (KV unavailable → allow) — correct tradeoff for a reading app, not a security-critical one.

No real coupling concerns. `issueReports.ts`/`issueReview.ts`/`issueStatus.ts` (1,345 lines combined) form a mini sub-application (reader-flagged errors → AI eval → patch → audio regen) — a lot of surface area for a secondary feature, worth an "is this earning its complexity" gut-check eventually, but well-isolated and doesn't leak into other routes.

## 6. Testing architecture

32 test files. Coverage breakdown:

- **Worker routes**: 11 of 11 route modules tested — the best-isolated part of the codebase, well covered.
- **Reading-position guard logic**: `useReadingPosition.guards.test.ts` (656 lines), `useReaderController.test.ts` (1,011 lines — largest test file in the repo), `readerSession/*.test.ts` (4 files, ~950 lines), plus guard tests for reading-log/library/chat-history. "Extract pure logic, test the pure logic" applied consistently — the right response to a UI-heavy codebase.
- **Not tested at all**: `App.tsx` (3,959 lines, 39 effects) — zero coverage, validated only by manual Pre-Deploy Checklist. `Reader.tsx` (1,631) and `SplitReader.tsx` (1,280) — the pagination/selection engine, explicitly flagged in the June handoff as "the fragile remaining areas... should only be touched with focused tests and device verification" — have only partial coverage via extracted pieces, not the pagination logic itself (still "Not started" for extraction per the same doc).

The guard tests are genuinely load-bearing — they pin exact regression scenarios (B1, B19, B21) by name, and the comments explicitly anticipate and warn against the failure mode that caused past regressions. Mature defensive documentation. The gap is orchestration-layer coverage (App.tsx, Reader.tsx pagination), not quality of what exists.

## 7. Tech debt inventory

- **TODO/FIXME/HACK/XXX**: essentially none — 1 hit in all of `src/` (`App.tsx:3261`, matches the documented account-deletion gap). Debt is tracked in BACKLOG.md/DECISIONS.md instead of code comments, and it shows — unusually clean.
- **Dead code**: `AccountDecision.tsx` — retained but unrendered, as CLAUDE.md says. The AngleChat dead code flagged in the 2026-04-29 SESSION.md appears already removed (DECISIONS.md logs the cleanup commit).
- **Largest files**: `libraryTaxonomy.ts` (4,109 lines — data, not logic, expected for a 100-book taxonomy), `bookRegistry.ts` (3,271), `BookOnboardingPreface.tsx` (1,837), `Reader.tsx` (1,631), `SplitReader.tsx` (1,280), `supabaseStorage.ts` (885), `BottomBar.tsx` (831), `Chat.tsx` (827). None alarming except Reader/SplitReader — exactly what the team's own docs flag as the next fragile extraction target.
- **Stripe keys commented out in `.env`** — documented gap, unverified whether it still blocks prod checkout (not checked; out of scope for a read-only review).

## 8. Deployment/build architecture

Disciplined, and every piece of ceremony traces to a named past incident:

- The `npm run build` html-swap (`mv dist/index.html dist/app.html && cp dist/landing.html dist/index.html`) is *why* raw `vite build`/`wrangler deploy` are banned — skipping it serves the wrong shell to signed-out users.
- `scripts/verify-bundle.cjs` checks the built bundle actually contains the Supabase URL/JWT/audio-route strings, and separately scans for leaked-secret patterns — both checks cite the specific outage/leak that caused them, including a defensive check inherited from a **Poetry Editor** API-key leak even though Tinct's Worker-proxy architecture shouldn't be exposed to the same bug class. Good cross-project learning encoded as an automated check.
- The mandatory `git stash && npm run build && git stash pop` step exists because "remote builds nearly always fail because of an untracked file imported by src/" — real, encoded pain from CI/deploy mismatches.
- `wrangler.jsonc` is minimal and clean; `run_worker_first: true` so redirect/bot-block/SEO logic runs before static assets.

The ceremony (6-step checklist, smoke-test script, no-raw-wrangler rule) is high relative to a typical Vite+CF-Workers project, but proportionate to the incident history behind it — scar tissue actually preventing repeat injuries, not process for its own sake.

## 9. Scalability/maintainability risks, in priority order of when they'll bite

1. **The App.tsx / readerSession dual-source problem will keep generating bugs until the "full render inversion" happens.** Explicitly deferred future work per the team's own docs; three fresh commits in the last 48 hours show it's still active cost. Every new reader feature (more languages, more edition types, marketplace-adjacent features) that touches "what chapter/paragraph is the user at" has to thread through both the reducer and the legacy state, risking invariant #10, #11, etc. The one item that will structurally worsen, not just persist, as features are added.

2. **`Reader.tsx`/`SplitReader.tsx` pagination and the selection engine are explicitly flagged by the team's own architecture doc as fragile and under-extracted.** Any feature that changes how paragraphs render (new language typography, a 4th edition type, richer annotation UI) runs directly into this. Second half of Slice 4, still "Not started" as of June — confirmed still true today.

3. **`bookRegistry.ts`'s single-array-of-100-constants structure** becomes an actual bottleneck (not just ugly) somewhere between 150-250 books given the stated ~22 WIP-books pace — a textbook merge-conflict generator once more than one session adds books concurrently, which the "Books CEO" delegation model makes a real, not hypothetical, scenario.

4. **Doc staleness is itself a scaling risk.** CLAUDE.md/SESSION.md are the project's memory across sessions/agents; four months stale means any future session that trusts them at face value makes decisions on wrong premises. Cheap to fix, worth fixing before it causes a real mistake.

## If I had to fix three things first

1. **Finish or formally shelve the readerSession render-inversion.** Right now the project pays the *cost* of a migration (9+ invariants, heuristic guards, three patch commits this week) without the *benefit* (a single source of truth that doesn't need heuristics). Either commit time to finish Slice 4 — make readerSession drive rendering, delete legacy `currentChapter`/`lastParagraphIndex` state — or explicitly decide "good enough, stop touching it" and redirect the guard-patching energy elsewhere. The worst outcome is indefinite partial migration, paying both costs forever.

2. **Reconcile CLAUDE.md/SESSION.md with reality, then enforce "update SESSION.md every session" going forward.** Update Current State (100 books not 33, readerSession migration status, note the June docs exist and are more current). An hour of work that de-risks every future session.

3. **Extract pagination out of `Reader.tsx`/`SplitReader.tsx` with tests, before the next edition-type or language feature lands on top of it.** The team's own docs already identify this as the next fragile target and the last unstarted piece of the extraction plan. Cheaper to do now, with a plan already written in `architecture-stabilization.md`, than under pressure once a new feature needs to touch pagination unsafely.
