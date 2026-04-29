# AI-Enhanced Reading Platform — Tinct

## Organization

Project CEO for Tinct. Group CEO is `../../CLAUDE.md` — that handles session protocol (Garmin, calendar, morning check-in). You handle this project's code and tasks.

**On-request advisors:** `../../agents/design.md`, `../../agents/marketing.md`, `../../agents/deutsch.md` (+ `deutsch-condensed.md`). Load when Anders says "consult the design lead" or "what would marketing say?"

**Screenshots:** `../../Screenshots/` — Read tool handles images natively. Most recent files first.

**Reference docs:** `STRATEGY.md` (positioning), `BACKLOG.md` (prioritized work), `Design refs/` (current visual specs). `DECISIONS.md` is the live decision log.

---

## Working Directory — CRITICAL

- **Git root:** `/Users/andershvelplund/Documents/Projects/Tinct` — all `git *` commands run here.
- **Build/deploy root:** `/Users/andershvelplund/Documents/Projects/Tinct/app` — all `npm *`, `npx *`, `wrangler *` run here.

One repo, one remote (`https://github.com/anderskhv/tinct.git`).

**Never use `cd <path> && git ...`** — security prompt. Use `git -C /Users/andershvelplund/Documents/Projects/Tinct ...`. For inline Python, write to a temp `.py` file rather than using `#` comments in heredocs.

---

## API Cost Rule — HARD BAN

**Zero Anthropic API spend in development. No exceptions.**

All content (editions, translations, summaries, onboarding, threads) is generated through this CLI conversation and written to files — never via scripts that call `api.anthropic.com`. **`generate-editions.cjs` is forbidden for development use.** The API key exists only for the prod reader chat. Violating this is a firing offense for the CEO.

---

## Auto-Documentation & Decision Logging

**Auto-update this file** when a decision is made (design, product, architecture, project standard). Append to the Decisions Log. Use judgment — log what's useful for future sessions, skip trivia.

**Process rules:**
- Log decisions at the moment they're made, not at end of day.
- SESSION.md is a current-state snapshot, not a changelog. Overwrite at end of session.
- Current State section has a "Last verified" date. >7 days old → read the actual code, don't trust docs.
- A session that ends without updating SESSION.md and Current State is a bug; next session must fix it before any other work.

**`DECISIONS.md`** (separate file) holds the live decision log. Format: `| Date | Decision | Category | Escalated? | Reasoning |`. Categories: `architecture`, `design`, `content`, `deploy`, `delete`, `scope`, `external`, `spend`. Log BEFORE asking Anders — even if you decide alone, log it as `Escalated? No`. Reviewed weekly to tune autonomy.

---

## Project Overview

A content-agnostic deep reading platform. Active wrestling with texts: multi-edition reading (original / modern EN / modern DA), AI chat, highlighting, journaling. 33 books live, expanding to 100+ Western classics + Bible.

---

## Design Direction

- Warm, literary, clean. Light mode default; dark mode + e-ink mode available.
- Desktop-first; mobile = 5-tab swipeable layout (Read / Compare / Chat / Feed / Cast).
- **Type:** Playfair Display (headlines), EB Garamond (body), IBM Plex Mono (UI chrome) — Google Fonts.
- **Palette:** `--paper: #ece7db`, `--ink: #0b0b0b`, `--accent: #1f4a5c` (deep teal).
- Canonical reader pattern: Variant D "The Hybrid" from `Design refs/Reader Variations.html`. Landing: `Design refs/Tinct Landing v2.html`.
- Default reading view = single edition with quick-toggle. Split pane is an opt-in toggle, paragraph-aligned.

---

## Tech Stack

React + TypeScript + Vite. Claude API for chat. Public-domain texts (Project Gutenberg / Internet Archive). Cloudflare Workers deploy. Supabase auth + storage. Stripe billing. R2 for audio. Capacitor for Android.

---

## Current State

**Last verified against codebase: 2026-04-20**

**Built & deployed:**
- 33 public books in `bookRegistry.ts` (+ 1 copyright-protected local-only).
- 3 editions per book: original-en, modern-en, modern-da.
- Paginated reader (CSS multi-column) + opt-in split pane (paragraph-aligned).
- Side panel: Chat | Feed | Cast (Feed = journal+highlights+notes+chats; Cast = character tracker, formerly "Threads").
- Audio: paragraph-level playback, speed control, auto-advance, R2-hosted.
- Auth: Supabase email + Google OAuth (Apple OAuth deferred — needs Apple Developer config).
- Billing: Stripe Checkout, Premium **$3/mo**, 30-day free trial, three tiers (Anonymous / Free account / Premium).
- Offline: DownloadManager + service worker caching.
- Android: Capacitor build in `app/android/`, Play Store listing drafted (`PLAY-STORE-LISTING.md`).
- Landing: static `app/public/landing.html` (logged-out users only — signed-in users redirect to `/read` before render).
- Highlights (5 colors), notes, reading journal, proactive AI insights, dark/e-ink/font controls.

**Production:** https://tinct.app + https://tinct.ahvelplund.workers.dev. Last confirmed deploy: 2026-03-26.

**Current sprint:** Design refresh — landing page + reader UX rebuild to new design system.

**Known gaps:**
- Account deletion backend stub (TODO in App.tsx).
- Audio edition preference callback stub (App.tsx ~1193).
- Stripe keys commented out in .env — verify prod checkout.
- AccountDecision.tsx retained but unrendered — clean up later.

---

## Operating Rules

**Be autonomous, be concise, verify before claiming done.**

- **Verification means running it.** A passing build is necessary but not sufficient. "Done" = dev server up, feature exercised in a browser, expected behavior confirmed with your own eyes (screenshot/curl).
- **Never lose reading position.** Any view change (single↔split, edition, language, font) must save scrollFraction and restore. Losing someone's place is the worst possible UX failure.
- **Grep after deletion.** Remove a variable/function/type/import → grep `src/` for stale references before building. The most common bug is removing a declaration but leaving references in dep arrays, imports, or other files.
- **Plan mode for non-trivial work.** 3+ steps or any architectural decision. Re-plan immediately if things go sideways.
- **Subagents for research/exploration** to keep main context clean. Subagents must never stop on permission errors — try alternative tools (Read/Write vs Bash, `python3 -c` vs scripts, Glob/Grep vs find/rg). Stuck after 2 alternatives → ask Anders.
- **Demand elegance** for non-trivial changes — pause and ask "is there a more elegant way?". Skip for simple fixes.
- **Self-improvement:** after any user correction, append the pattern to the Decisions Log.
- **Errors don't stop you.** Work around. Reading must degrade gracefully if Claude API fails.

---

## Pre-Deploy Checklist (MANDATORY)

1. `npm run dev` — open localhost:3001, manually verify the change.
2. `npm run build` — must pass with zero errors. **Read the output for stack traces even if exit code is 0.** Stale `dist/` is the failure mode: verify the timestamp on `dist/assets/index-*.js` matches; if not, `rm -rf dist && npm run build`. **Always `npm run build`, never raw `npx vite build`** — the npm script does the index/landing swap that prod needs.
3. **Build with only committed files:** `git stash && npm run build && git stash pop`. If this fails, you have an uncommitted file that `src/` imports — `git status` to find it. *(This has broken prod before. Remote builds nearly always fail because of an untracked file imported by `src/`.)*
4. `npm run deploy` — chains build → verify-bundle → wrangler. **Never run raw `wrangler deploy`** — it skips the verify step.
5. **Smoke test:** `./scripts/smoke-test.sh` — 8 checks (homepage, JS bundle has Supabase + R2 URLs, /api/chat responds, audio manifest + sample, CSS). Any failure → revert and fix.
6. Open the production URL and exercise the specific change.

**If you deployed a broken site:** revert + redeploy first, diagnose second. Service first.

---

## Bug Fix Protocol (mandatory after any failed first attempt)

1. Trace the actual data flow before patching — don't pattern-match a plausible fix.
2. Write a reproduction (Playwright or manual steps) **before** the fix.
3. After editing: grep for ALL references to any removed/renamed symbol — especially in dep arrays, imports, other files.
4. Reproduction must pass before deploy.
5. **Two failed attempts = STOP.** Add `console.log` at every stage, read the actual browser console. Plan-mode document what you tried and why each failed. Tell Anders honestly. Do NOT try a third variation of the same approach.

---

## Invariants (DO NOT VIOLATE)

These rules exist because their absence caused recurring sync bugs (B1, B19, B21 from 2026-04-27 test day, the Apr 23 `tinct-current-book` regression, and 2026-04-25 chat divider pollution). Every rule has a unit test in `app/src/hooks/useReadingPosition.guards.test.ts`. **If a rule looks unnecessary, run the tests before deleting anything.** "This seems redundant" is the exact thought that historically bites us.

1. **Position writes always carry matching `bookId` + `chapterNumber` as a tuple.** Never compose from separate sources. `useReadingPosition.saveNow` reads both from `stateRef.current` in one snapshot.
2. **Any code path that changes `currentBookId` must trigger chapter re-derivation.** The `bookId`-change effect in `App.tsx` re-derives chapter/savedPos/targetParagraphRef and bumps readerKey. Cloud-sync paths set `currentBookId` and rely on this effect — don't replace it with handler-side logic.
3. **Position writes are blocked while overlay/auth/onboarding is in front of the reader.** The `writeSuspended` parameter on `useReadingPosition` is computed from those overlay states. Heartbeats/visibility writes during overlays risk capturing default in-memory state (B19).
4. **Backward chapter writes require a recent user-nav signal.** `shouldBlockRegression` (in `useReadingPosition.guards.ts`) gates `saveNow`. Page-change effect calls `markUserNav` so legitimate user backward nav (prev-chapter, TOC) widens the window.
5. **Audio playback rate has exactly one source of truth: `useAudioSpeed`.** Persisted via storage layer. `applyTo(audioElement)` must run on every audio creation AND every `play` event — DOM resets to 1.0 on certain transitions. Set, never increment.
6. **Position validates against book structure on read.** `primaryData` validation effect checks chapter AND paragraph bounds. Out-of-range = pre-Phase-1 cross-book bleed → reset position AND delete the storage key (so cloud cache doesn't resurrect it).

**Test gate:** `npm test` runs guards in <1s. Run before changing `useReadingPosition.ts`, `useAudioSpeed.ts`, or position-related effects in `App.tsx`. If tempted to "fix the test to match the new behavior" — stop, the test is what's protecting you.

---

## Autonomy Framework

**Pre-authorized (just do it):**
- Git commits when build passes AND change verified locally.
- **"Push" = `git push` + `npm run deploy`.** Always both. Never push to GitHub without deploying to Cloudflare. Always deploy after local verification — don't ask.
- Bug fixes / code corrections (verify locally before reporting).
- Deploy — only after the full Pre-Deploy Checklist.
- Running tests and acting on results.
- Content generation within established patterns (book editions, chapter metadata, onboarding JSON).
- Backlog prioritization, routine refactors that don't change behavior.

**Escalate:**
- Deleting books or features (scope reduction).
- Changing reading-experience UX paradigm (split pane, chat placement).
- Database schema changes.
- Spending money (Claude API beyond dev/test, services).
- New external dependencies.
- Pricing or content-strategy changes.
- UI-heavy features → show mockups before building.

**Rule:** Backlog says do it + tests pass + pattern established → execute and report. Don't ask.

---

## Book Addition Checklist

A book is "added" only when every box below is checked. Partial additions are work-in-progress.

**1. Source text** — public-domain original parsed into `{bookId}-original-en.json`, chapter structure verified, Project Gutenberg boilerplate stripped.

**2. All editions** (CLI-generated, zero API spend):
- `{bookId}-modern-en.json` — accessible contemporary English.
- `{bookId}-modern-da.json` — Moderne Dansk.
- All paragraph-aligned with original.
- **Kids editions are permanently out of scope. Never generate kids-en or kids-da.**

**3. Book registry** — entry in `bookRegistry.ts` with all editions, correct metadata (key, language, style, label, aligned), included in `BOOKS` array.

**4. Onboarding content** at `/data/onboarding/{bookId}.json` (CLI-generated):
- **About** — 2 paragraphs, plainly stated.
- **Why it still matters** — 3 items, each with *italic title* + 2-3 sentences. Specific to this book, no generic observations.
- **Reading angles** — 4 cards derived from "why it matters", each with *italic title* + 2 sentences explaining what the reader will notice. **Free for all users** — this is the #1 completion-rate mechanism, not a premium gate. A 5th equal-weight card "Just start reading" clears the angle (skip option).
- **Cast** — 6 figures (characters or concepts, e.g. "The Inner Citadel" for Meditations): name, mono-uppercase role tag, 2-sentence description. No spoilers beyond what's established early.
- **Pre-reading chat responses** — 3 themed responses (each 3-5 substantial paragraphs, book-specific, at the quality of the Odyssey Greek/Christian ethics response) + 1 fallback. Premium feature.
- **Opening background text** — 3-5 sentences of the actual opening (shown blurred behind modal).
- **HTML mirror** at `Design refs/Book Onboarding - {Title}.html` from the Odyssey template.

**Flow:** (1) Edition setup → (2) About + Why → (3) Angle (free, skip option present) → (4) Cast → (5) Extended pre-reading chat (premium).

**5. Cast / threads** — `{bookId}-threads.json` with major characters: id, name (en/da), epithet (en/da), role, wikipediaUrl, searchNames; per-chapter summaries in modern-en + modern-da. Loader is convention-based (`useThreads.ts` fetches `/data/editions/{bookId}-threads.json` for any bookId) — no code change needed; just drop the JSON in.

**6. App integration** — Book selectable in header, chapter nav works (correct labels and count), edition switching works, split pane verified with aligned editions, position persistence per book, chat context uses correct title/author, onboarding fires for ALL entry points (direct nav, SEO landing, share links), reading angle stored in session and injected into AI system prompt, dismissable at any step ("Start reading now →").

**7. Visual QA** (non-negotiable) — Every edition, every chapter checked via dev-server screenshots. Text renders correctly, chapter nav end-to-end, split-pane alignment, dark mode.

---

## Decisions Log

Active product policy. Older implementation logs and superseded decisions live in git history.

- **[Translation Display]** — Single edition with quick-toggle is the default. Split pane is opt-in, not the default view. Dual side-by-side rejected as fatiguing.
- **[Naming]** — "Reading journal" not "takeaways" (invites reflection, not optimization). Side-panel tab is "Cast" (formerly "Threads").
- **[Voice Input]** — Nice-to-have, not core. Reading is silent/private.
- **[QA Standard]** — Every book, every edition, visually QA'd page-by-page via screenshots before shipping. Non-negotiable.
- **[Domain]** — `tinct.app`.
- **[Onboarding Entry Point]** — Onboarding modal fires for ALL entry points (direct nav, SEO, share links). This is intentional — it's Tinct's differentiation from Project Gutenberg. Dismissable at any step.
- **[Reading Angle is core, not premium]** — Free for all users. The #1 completion-rate mechanism — research confirms personal connection before reading begins is the top driver of book completion. Stored in session, injected into AI system prompt so mid-read chat references it. Skip option offered ("Just start reading" 5th card; "Or skip — the book works either way" copy in Account Onboarding Step 1) — pitched as default but never imposed.
- **[Pricing]** — Premium **$3/mo**, 30-day free trial (auto-cancels). Three tiers in PricingModal: Anonymous (read-only) / Free account (reading features + 30-day Premium trial) / Premium ($3/mo: AI chat 200 msgs/mo, audiobook, Cast, offline, reading journal). Chat-pack overflow $5/200 messages stays as a separate product.
- **[Kids Editions Dropped]** — Permanently out of scope. Never generate, reference, or discuss kids-en/kids-da.
- **[Landing Page Auth Redirect — P0]** — Signed-in users must NEVER see the landing page. Auth-check script at top of `app/public/landing.html` inspects the Supabase session token and redirects to `/read` before render. Any regression is a P0 bug.
- **[User Journeys v1]** — Two paths. Journey A (direct-to-book / SEO): edition picker → reader → state-aware top banner → end-of-chapter-1 progress prompt → sign-up → TierChooser. Journey B (library-first): landing → library → 3-step Book Onboarding → TierChooser → reader. Four locked principles: no hard gates, don't describe local storage, no-downside Premium (defaulted), three tiers always. URL parsing: `/read/{bookId}` = full mode, `/{bookId}` = edition-only mode. Account Onboarding (6-step tour) is optional, available from Settings — NOT critical path.
- **[Books CEO Scope Lockdown]** — `books/CLAUDE.md` is content-only. May only touch `app/public/data/editions/{bookId}-*.json`, `app/public/data/onboarding/{bookId}.json`, `app/public/audio/{bookId}/`, `app/src/data/bookRegistry.ts` (registration only), and `books/**`. Everything else is OFF-LIMITS. Publish via `npm run deploy` only — raw `vite build` and `wrangler deploy` are forbidden (skip the html swap and verify-bundle steps; cause repeated prod outages).
- **[Open Audit Items]** — Awaiting Anders: (1) make R2 bucket private + bind to worker via `env.R2_BUCKET.get()`; (2) convert hero images to WebP (~800 KB gzip savings); (3) `React.lazy()` SettingsSheet/PricingModal/UsageDashboard/BookStore/TierChooser (~30-40 KB deferred); (4) minify static JSON via Vite plugin (~10-15 KB).
- **[Angle Iteration — FUTURE, not built]** — When user submits a reading angle, AI responds conversationally and iterates over a few turns before lock-in. Free tier gets ~5 messages of this as taste of the AI companion (in-book chat remains Premium). Logged to `BACKLOG.md`.
