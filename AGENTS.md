# Tinct Agent Instructions

## Automatic book-task routing — approved 2026-09-24

Requests to **add, onboard, prepare, translate, modernize or repair a book** activate the [content-only book workflow](books/BOOK-TASK-WORKFLOW.md), even when this session starts at the repository root. Read it and its required strategy references before editing. A request to add or finish a book is not authorization to change code, integrate the app, merge to main or deploy.

This is task-specific: Claude may implement and release code when Anders explicitly assigns a coding/release task, following current repository rules and serialized release ownership. Do not infer that assignment from a book request.

> **Language scope — 2026-09-21:** English is the current delivery strategy. Danish is no longer a launch, publication, translation, audio, QA or marketing requirement; older Danish tasks below are superseded. Keep future localization straightforward without starting another language rollout. See [the approved language strategy](STRATEGY.md#language-scope). Existing assets and historical findings are preserved; this note does not change shipped behavior.

## Scope

This repository is Tinct, a deep-reading platform for public-domain texts. It includes a React/Vite app, book edition data, QA tooling, Cloudflare deployment, Supabase auth/storage, Stripe billing, R2 audio, and Capacitor Android.

Use this file as the Codex source of truth. Older `CLAUDE.md` files may contain useful history, but they also include Claude-specific workflow rules that do not apply to Codex.

## Directories

- Git root: the current checkout root (`git rev-parse --show-toplevel`).
- App root: `app/` under that checkout.
- Book factory: `books/` under that checkout.
- QA tooling: `qa/` under that checkout.
- User-provided screenshots: `/Users/andershvelplund/Documents/Screenshots`. When Anders says to review or see screenshots, look there first.

### Cloud-first operation — approved September 16, 2026

New coding, tests, builds and generated assets belong in the Tinct cloud
coding environment. GitHub Actions remains the production release route.
The historical `/Users/andershvelplund/Documents/Projects/Tinct` tree and its
Documents siblings are preservation sources, not development destinations.
Do not install dependencies, build, fetch Git objects, create worktrees, or
write generated assets there. Read-only migration inspection and narrow
migration documentation updates are permitted. Do not delete historical files
until their unique contents and recovery have been verified.

For an explicitly needed local fallback, use the existing
`/Users/andershvelplund/Developer/Tinct` checkout outside iCloud; do not create
another full copy. A local fallback still requires the Mac to remain awake.
Existing tasks are not automatically migrated when a cloud environment is
created: preserve their unfinished work and resume it from remote branches.
Cloud setup and full migration are complete only after recorded remote
verification; do not infer completion from these instructions.

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

- Approved work continues through diagnosis, implementation, deployment, actual
  acceptance, correction of failures, and retest. Resume unfinished acceptance
  after interruptions and continue an approved reader queue without per-stage
  root or user handoffs. Routine environment repair and agent-created checkpoints
  are not user blockers. Stop only when the work is complete, an explicit budget
  or material token/spend limit is reached, or a genuine user decision or access
  dependency is required. Preserve scope, safety, pacing, and one serialized
  deployment owner. When a genuine blocker exists, every report to Anders includes
  a concise `Needs your decision` line with the concrete choice and recommendation;
  do not invent blockers or re-ask for already approved work.
- Until Tinct has more than 10 users, deploy-after-verify is the default. After `npm run build` and `npm run verify-bundle` pass, release by merging to `main`: the GitHub Actions deploy workflow (Node 24.13.0) runs the staged release described under Deploy flow. `npm run deploy` from `app/` remains only for the migrations fallback and emergencies. Do not ask first. Skip deploy only if Anders says local-only. Never run raw `wrangler` (deploy, versions, rollback); use the npm scripts. Never deploy from a dirty or unreconciled local checkout. Never deploy secrets. Never skip verify-bundle.
- Do not call Anthropic APIs during development. The production reader chat may use Claude, but development content generation must happen in the agent conversation and be written to files.
- While Anders assigns content work to Claude, Codex owns code and technical
  pipelines only. Codex does not author or semantically approve translations,
  character copy, narration, or other book content.
- Do not run `generate-editions.cjs` for development work.
- Keep app, content, and audio work separated as described in `docs/workflow-boundaries.md`.
- Preserve user changes. Never revert, reset, or clean unrelated files unless Anders explicitly asks.
- Prefer narrow fixes over broad rewrites, especially in reader, pagination, sync, auth, billing, and storage code.
- If a change touches position, pagination, sync, or chapter navigation, trace the actual data flow before patching.
- Automated browser checks must use an isolated headless context with audio muted or disabled. Do not take focus, navigate shared personal browser tabs, request microphone access, or produce audible playback. Physical or audible UI testing requires an explicitly agreed testing window.

## Verification

For app changes, use:

```bash
cd app
npm run build
npm run verify-bundle
```

After those gates pass, release by merging to `main`; GitHub Actions (Node 24.13.0) does the rest.

### Deploy flow (staged release)

`.github/workflows/deploy.yml` runs on every push to `main` (and manually):

1. `npm test`.
2. Choose mode. **Direct is the default**: `npm run deploy`, then acceptance on production. The version serving production is recorded first, and if any acceptance step fails after the deploy the workflow runs `npm run rollback` to it automatically (the job still ends red). Staged releases (steps 4–7) run only when requested with `mode=staged`: Cloudflare does not create preview URLs for a Worker with Durable Objects, and Tinct's Worker has four, so the staged path cannot test before promote today. Staged requests still fall back to direct when the Durable Object `migrations` or `app/wrangler.jsonc` changed. A migration change cannot be rolled back across; review it as such.
3. Record the version now serving production (used for rollback).
4. `npm run release:upload`: build, verify-bundle, clean-main check, then `wrangler versions upload`. The new version serves **no** traffic and gets a preview URL (`https://<8-char-version>-tinct.<subdomain>.workers.dev`).
5. Wait until the preview serves the exact built bundle, then run the pre-promote checks against it. Acceptance scripts read the target from `TINCT_ORIGIN` (default `https://tinct.app`), so one variable retargets them.
   Pre-promote: `smoke-test.sh`, Android publication, Omarchy, inline audio loading, reader panels, reader feedback, book transition, Shakespeare layout, hyphenation, Lighthouse and Symposium publication. These exercise the Worker, assets and reader, which the preview shares with production (same bindings, secrets and data).
6. Any failure before promotion stops the job. Production is untouched.
7. `npm run release:promote -- <version-id>` sends 100% of traffic to the version; the job waits for production to serve the new bundle.
8. Post-promote checks against `https://tinct.app`: smoke test, brand metadata (canonical URLs name the production host), production sign-in (Supabase redirect allow-list, cookies), Grok microphone recovery (only with `[reader-voice-qa]` in the commit message), featured preview and public library (hardcoded to production).
9. If any step after promotion fails, the job runs `npm run rollback -- <previous-version-id>` and still finishes red. Fix forward and push again.

Preview URLs are enabled in code (`"workers_dev": true, "preview_urls": true` in `app/wrangler.jsonc`), but Cloudflare returns none for a Worker with Durable Objects (confirmed on the first staged run, 2026-09-30). A staged request that gets no preview URL warns and deploys directly (after restoring the files the upload's build regenerated), so releases never stall. Staged becomes useful if the Durable Objects move to their own Worker.

### Rollback

```bash
cd app
npm run rollback                    # production returns to the previous deployment
npm run rollback -- <version-id>    # or to a specific version (`npx wrangler versions list` shows ids)
```

This wraps `wrangler rollback --yes` with the `.env` credential. Cloudflare refuses a rollback across a Durable Object migration; after a migration deploy, fix forward instead. Never run raw `wrangler`.

`npm run deploy` (build, verify-bundle, wrangler deploy) is the only approved direct deploy path. Do not run raw `wrangler deploy`.

**Deploy without your Mac:** add `CLOUDFLARE_API_TOKEN` (Workers deploy token) to GitHub Actions secrets and/or Cursor Cloud environment secrets. See `docs/cloud-deploy.md` and `.github/workflows/deploy.yml`.

### Completion checklist (mandatory unless Anders says local-only)

Do not ask Anders to deploy or to verify production. When app/lab work is done:

1. **Tests** — `npm test` (or focused `src/lab/` when lab-only).
2. **Build gates** — `npm run build` + `npm run verify-bundle` from `app/`.
3. **Deploy** — merge to `main` (GitHub Actions staged release). Use `npm run deploy` from `app/` only for the migrations fallback or an emergency, when the Cloudflare token is in the environment. Do not stop at “PR ready”; ship it.
4. **Confirm deploy** — wait for the `deploy` workflow to succeed (pre-promote and post-promote checks green, no rollback step run). Ignore non-blocking **Workers Builds: tinct** Cloudflare dashboard failures when GitHub `deploy` passed.
5. **Production verify on tinct.app** — open `https://tinct.app/reader` (mobile viewport ~390×844; `?layout=phone|desktop` forces a layout), not localhost only. Confirm:
   - JS bundle filename in HTML/Network matches the new `assets/index-*.js` from the deploy.
   - The specific change you shipped (e.g. Genesis 1 page 1: no mid-sentence cut, ink clears pagination bar).
   - Save a screenshot to walkthrough artifacts when visual.
6. **Report to Anders** — bundle hash, deploy run status, what you checked on production, and artifact path. Tell him private/incognito only if he wants to double-check on his phone.

Current caveat: plain `npx tsc --noEmit` is not a clean repo gate; it reports existing unrelated errors in legacy/worker files. Prefer the project build and focused tests until the TypeScript baseline is cleaned up.

## Voice (Talk)

Talk runs on xAI Grok native speech-to-speech (`grok-voice-latest`, voice `altair`)
over one browser WebSocket; see `docs/voice-grok-2026-09-18.md`.

- Worker secret `XAI_API_KEY` mints single-use client secrets at
  `/api/voice-session` (signed-in, charged) and `/api/lab-voice-session`
  (guest, rate limited). Never put the key in browser assets or logs.
- The runtime prompt is `GROK_VOICE_INSTRUCTIONS` in
  `app/src/voice/grokConfig.ts`. Keep it minimal; add a constraint only for a
  demonstrated issue. Reference text (position, excerpt, recent turns) is data
  appended under its own header, never instructions.
- No user-facing model selection or comparison lab. Rollback is a revert of the
  Grok commit; `OPENAI_API_KEY` remains for typed chat and source research.
- Real-provider check (bounded, a few cents): build, `npx wrangler dev` with
  `app/.dev.vars` holding `XAI_API_KEY`, then
  `node scripts/grok-voice-smoke.mjs http://127.0.0.1:8787 <question.wav> [resume.wav]`
  from `app/`. Headless, fake microphone, muted output. Against production use
  `https://tinct.app`. Mocked tests alone do not prove the provider connection.

## Narration and text publication

The authoritative runtime and approved next rollout are documented separately in
[Audio architecture](docs/audiobook-architecture-2026-09-21.md). The Grok implementation and release acceptance are recorded in
[Grok narration release](docs/grok-narration-2026-09-23.md). The production
configuration selects Grok for English narration; historical Google/Bella
paths remain rollback code and must not be selected as a failed-Grok fallback.

- Accepted text repairs ship with required character-card compatibility. Legacy
  Kokoro recordings, manifests and timing regeneration are not release
  prerequisites. A text-only release does not authorize GPU/TTS spend or voice
  changes.
- The separately approved Grok rollout uses Ara/Helios defaults and optional
  Orion/Eve, with five-minute openings in the two defaults for the ten exact
  books/default English editions in the architecture plan. Talk voices are a
  separate contract and remain unchanged.
- Preserve exact text/provider/model/voice/settings cache identity, timing
  validation, shared reuse, bounded scheduling, deduplication and spending
  ceilings. Follow the approved Play-only scheduling and preparation limits.
- Do not resume a Kokoro/RunPod backlog from historical notes. Retire legacy
  selection paths only through the approved migration; retain assets for
  rollback until acceptance and an exact cleanup inventory.
- Keep credentials in Worker/GitHub secrets and never print them. Real-provider
  generation and smoke checks require the audio task's explicit scope and budget;
  the authorized text release itself performs none.
- Historical Fish pilot and Kokoro documents remain evidence, not current
  provider or publication instructions. Follow the root cloud-first release
  and isolated, muted browser verification rules.

## Public URLs

Readers only ever see `/` and `/library` (the library), `/reader`, `/sign-in`, `/featured` (admin preview), `/read/{bookId}` (SEO pages), `/admin/metrics`, and API/asset paths. Never link, redirect, `location.assign` or pass a return URL to an asset-folder page such as `/lab/library_2/`, `/lab/sign-in/` or `/lab/phone`. The Worker serves `/library`, `/sign-in` and `/featured` from static assets with the URL unchanged, and answers the old `/lab` page URLs with a 308 to the canonical page (`legacyLabPageRedirect` in `app/src/lab/labRoute.ts`). `/reader?layout=phone|desktop` forces a layout for QA. The `/lab` namespace is free for future experiments. Supabase OAuth/email callbacks still name `/lab/sign-in` (the redirect the Worker forwards); move them to `/sign-in` once that URL is on Supabase's redirect allow-list.

The legacy React reader (`app/src/App.tsx`, `useReadingPosition`, `useReadingLog`, `readerSession`) was deleted on 2026-09-30. The live reader is `app/src/lab/LabApp.tsx` at `/reader`. The invariants below are the behavioural contract the old code enforced; they now apply to the lab position and sync code.

## Reader And Position Invariants

High-risk files (trace the data flow and run the matching tests before editing): `app/src/lab/LabApp.tsx`, `labPosition.ts`, `labPositionStore.ts`, `useLabPositionSync.ts`, `labReaderHandoff.ts`, `useLabReadingYear.ts` and `labReadingYear.ts`, `useLabHighlights.ts`, `useLabListen.ts`, `app/src/services/storage.ts`, `app/src/services/supabaseStorage.versioning.ts`, and the `/api/lab-position` route in `app/src/worker.ts`. Their tests sit beside them (`labPosition*.test.ts`, `useLabPosition*.test.tsx`, `labReadingYear.test.ts`, `supabaseStorage.versioning.test.ts`); run `npm test` from `app/` before and after.

These are production-critical:

- Position writes must keep `bookId`, `chapterNumber`, page, and paragraph data as a coherent tuple.
- The lab position store (`labPositionStore.ts`, synced by `useLabPositionSync.ts`) is the only source for persisted position tuples. Render state in `LabApp.tsx` must not be used as the persisted content tuple. Position is keyed per biblical book, local is truth and cloud is a signed-in backup (see the header of `labPosition.ts`).
- Any code path that changes `currentBookId` must re-derive chapter and saved position for the new book.
- Position writes must be suspended while overlays/auth/onboarding/loading states can expose stale reader state.
- Reading history/progress writes (including the reading-year data in `useLabReadingYear.ts`) must require a ready same-book location before touching `reading-log:*` or `progress:*`.
- User-data writes are versioned through `commit_user_data`; deletes are tombstone writes (`value: null`) so other devices receive the change.
- Backward chapter writes require a recent user-navigation signal.
- Positions loaded from storage/cloud must be validated against the actual book structure.
- Position writes must skip during the render where `bookId` just changed but chapter/paragraph state still belongs to the previous book.
- Chapter advance opens an unseen chapter at page 1 in Read and Compare. In desktop Read, when the outgoing right leaf already displayed the next chapter's opening, a forward page turn continues at the first unread source word (Anders, 2026-09-26). Never skip text that was not actually displayed.
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
- Anders prefers faithful previews of the actual result. Before presenting a
  faithful design preview, inspect the current phone and desktop components,
  styles and relevant state; preserve their surrounding copy, controls and
  layout unless the approved change says otherwise. Match the target viewport
  and theme, label placeholder or estimated data, and state intentional
  differences and verification limits. If the current UI cannot be inspected,
  label the work clearly as a rough concept sketch rather than implying fidelity.
- Reading position is sacred. View, edition, language, font, and layout changes must not lose the reader's place.
- The library taxonomy is Houses -> Shelves -> Books. Every production book must be classified into this taxonomy when it is added or registered.
- Default reader is a single edition. Split/Compare is opt-in and should sync roughly by paragraph/sentence within the same chapter.
- Mobile has five tabs: Read, Compare, Chat, Feed, Cast. Read and Compare are separate mounted reader views.
- Do not change the reader UX paradigm, pricing, content strategy, database schema, or external dependencies without asking Anders.

## Browser Cache Guidance For Anders

Anders's keyboard layout makes the usual browser shortcut unreliable. Do not default to telling him `Cmd+Shift+R`.

Recommended cache-busting guidance:

1. Open a private/incognito window.
2. In Chrome with DevTools open: right-click reload -> Empty Cache and Hard Reload.
3. In Safari: Develop -> Empty Caches, then reload.

For embedded iframes, private/incognito is the most reliable option.
