# AI-Enhanced Reading Platform — Tinct

## Organization

This project is part of Anders's portfolio, managed by `claude.md` (Group CEO) at the Documents root. This CLAUDE.md is the project CEO — it owns this project end-to-end.

**IMPORTANT: You are a project CEO, NOT the Group CEO.** Do NOT run the session protocol from the root claude.md (no Garmin sync, no calendar check, no morning check-in, no time tracking). That is handled by the Group CEO in the root Documents folder. You focus only on this project's code and tasks.

**Functional experts available on request** (load when needed):
- `../../agents/design.md` — UX/UI standards, visual consistency, house design language
- `../../agents/marketing.md` — Growth strategy, positioning, launch planning
- `../../agents/deutsch.md` + `../../agents/deutsch-condensed.md` — David Deutsch philosophical advisor

**Screenshots folder:** `../../Screenshots/` — Anders drops screenshots here for review. Use the Read tool to view them (it handles images natively). When asked to "check the screenshot" or "look at this", check this folder for the latest files.

When Anders says "consult the design lead" or "what would marketing say?", load the relevant file.

---

## Working Directory — CRITICAL

**Git root:** `/Users/andershvelplund/Documents/Projects/Tinct` — ALL git commands run here.
**Build/deploy root:** `/Users/andershvelplund/Documents/Projects/Tinct/app` — `npx vite build` and `npx wrangler deploy` run here.

The git repo is at `Tinct/` and the app source code is in `Tinct/app/`. One repo, one remote (`https://github.com/anderskhv/tinct.git`).

**Rule:** `git *` → run from `Tinct/`. `npm *`, `npx *`, `wrangler *` → run from `Tinct/app/`.

**IMPORTANT:** Never use `cd <path> && git ...` — this triggers a security prompt Anders must approve. Use `git -C /Users/andershvelplund/Documents/Projects/Tinct ...` instead. For inline Python, avoid `#` comments in multiline strings (write to a temp file instead).

---

## API Cost Rule — HARD BAN

**ZERO Anthropic API spend during development. No exceptions.**

All content generation — book editions, translations, chapter summaries, any text produced by Claude — must happen through the CLI conversation and be written to files. **Never** run scripts that call `api.anthropic.com` during development.

**`generate-editions.cjs` must NOT be used for development.** To generate modern editions (modern-en, modern-da): read each chapter in the CLI conversation, generate the translation, and write it to the JSON file. This is how Sojourners generated 21 event summaries, 33 character bios, and 12 era rewrites — all through CLI, zero API cost.

The API key exists **ONLY** for production user-facing features: the reader chat when a real user asks a question after deployment. Development-time content generation through API calls burns budget that funds the entire operation.

**Violating this rule is a firing offense for the CEO.**

---

## Auto-Documentation Rule

**Automatically update this file** when making decisions during conversations. When we settle on a design choice, product direction, architecture decision, or project standard, append it to the Decisions Log at the bottom. Use judgment — log things useful for future sessions, skip trivial one-off choices.

**Process rules (added 2026-04-20 after a stale-docs incident):**
- Log decisions at the moment they are made, not at end of day.
- SESSION.md is a **current-state snapshot**, not a changelog. Fully overwrite it at end of each session.
- The "Current State" section below has a "Last verified" date. If it is more than 7 days old, read the actual code before trusting it — don't rely on docs alone.
- When Anders confirms a change (pricing, scope, feature), update the relevant memory file in the same turn.
- **If a session ends without updating SESSION.md and this Current State section, the next session MUST do it before any other work. A stale SESSION.md is a bug.**

---

## Decision Logging

Every time you encounter a decision that requires Anders's input — or that you *choose* to escalate rather than handle yourself — log it to `DECISIONS.md` in this project root.

Format (append a new row each time):

| Date | Decision | Category | Escalated? | Reasoning |

**Categories:** `architecture`, `design`, `content`, `deploy`, `delete`, `scope`, `external`, `spend`

**Rules:**
- Log BEFORE asking Anders. The act of logging forces you to articulate what you need and why.
- If you decide something yourself within your existing permissions, still log it as `Escalated? No` — we want to see the full decision landscape, not just escalations.
- One line per decision. Keep it tight.
- "Reasoning" = why you escalated (or why you felt safe deciding alone).

This log will be reviewed weekly by Group CEO and Anders to tune your autonomy level.

---

## Project Overview
A content-agnostic deep reading platform. Not passive consumption — active wrestling with texts. Users read in multiple editions (original, modern EN, modern DA) and debate through AI chat, highlight and annotate, and build understanding over time. 33 books live as of April 2026, expanding to 100+ Western classics + Bible.

**Full strategy:** See `STRATEGY.md`
**Prioritized work:** See `BACKLOG.md`

---

## Design Direction
- Warm, literary, clean aesthetic — light mode default, dark mode available
- Desktop-first, mobile 5-tab swipeable layout
- **New design system (2026-04-20):** Playfair Display (headlines), EB Garamond (body), IBM Plex Mono (UI chrome) — loaded via Google Fonts
- **New palette:** `--paper: #ece7db`, `--ink: #0b0b0b`, `--accent: #1f4a5c` (deep teal replaces previous gold `#8b6b3a`)
- Design references: `Design refs/Tinct Landing v2.html` (landing) + `Design refs/Reader Variations.html` (reader)
- Canonical reader pattern: Variant D "The Hybrid" from Reader Variations.html
- Collapsible right panel (Chat | Feed | Cast tabs)

## Tech Stack
- React + TypeScript + Vite (same stack as Poetry Editor)
- Claude API for chat features
- Public domain texts from Project Gutenberg / Internet Archive
- Deployed via Cloudflare Workers

## Current State (April 2026)
**Last verified against codebase: 2026-04-20**

### What's Built & Deployed
- **33 public books** registered in `bookRegistry.ts` (+ 1 copyright-protected local-only)
- **3 editions per book:** original-en, modern-en, modern-da (kids editions permanently dropped)
- Fully paginated reader (CSS multi-column) + split pane (paragraph-aligned)
- Side panel: **Chat | Feed | Cast** (3 tabs — Feed = reading journal + highlights + notes + chats; Cast = character tracker)
- Audio: paragraph-level playback, speed control, auto-advance, R2-hosted
- Auth: Supabase email + Google OAuth
- Billing: Stripe Checkout, 30-day free trial, Premium $3/mo (see Decisions Log)
- Offline: DownloadManager.tsx, service worker caching
- Android: Capacitor build in `app/android/`, Play Store listing drafted
- Landing page: static `app/public/landing.html` (served at `/`, logged-out users only)
- Mobile: 5-view swipeable layout (Read / Compare / Chat / Feed / Cast)
- Highlights (5 colors), notes, reading journal, proactive AI insights
- Dark mode, e-ink mode, font/size selector

### Deployed
- Production: https://tinct.app (and https://tinct.ahvelplund.workers.dev)
- Last confirmed deploy: 2026-03-26

### Current Sprint (April 2026)
Design refresh — landing page + reader UX rebuild to match new design system.
See `Design refs/` folder at project root.

### Known Code Gaps
- Account deletion backend stub (TODO comment in App.tsx)
- Audio edition preference callback stub (TODO in App.tsx ~line 1193)
- Stripe keys not in .env (commented out) — production checkout may need re-verify
- AccountDecision.tsx retained but no longer rendered — clean up in a later pass

---

## Error Handling & Resilience

- **Never stop on errors.** Work around issues and continue.
- **If Claude API fails**: Degrade gracefully — reading experience should work without AI features.
- **Keep working through blockers**: Don't stop on API issues or minor problems.

## Working Style

- **Be autonomous** — don't ask permission on routine decisions
- **Be concise** — short answers, no fluff
- **Verify before presenting** — never tell Anders something works unless you've tested it yourself. `vite build` passing is NOT testing. Testing means running the app and checking the actual behavior.

---

## Pre-Deploy Checklist (MANDATORY — never skip)

Every deploy MUST follow this sequence. No exceptions.

1. `cd tinct && npm run dev` — open localhost:3001 in browser, manually verify the change works
2. `npx vite build` — must pass with zero errors. **Check the output for any stack traces or errors even if exit code is 0.** A build that prints errors but still exits 0 can leave stale files in `dist/`.
2b. **Verify build is fresh:** `ls -la dist/assets/index-*.js` — the timestamp must match the build you just ran. If it's old, `rm -rf dist && npx vite build` and try again.
3. After any variable/function removal: `grep -r "removedThing" src/` — verify no stale references
4. **Before committing:** run `git status` and check for untracked files that your code imports. If `src/` imports a file that shows as "untracked" or "not staged", you MUST add it. The local build passes because the file exists on disk — but the remote build will fail because it's not in git. **This has broken production before.**
5. **Before pushing:** run `git stash && npx vite build && git stash pop` to verify the build passes with ONLY committed files. If this fails, you have a missing file.
6. `npx wrangler deploy` — from the `app/` directory
7. **Run the post-deploy smoke test:** `./scripts/smoke-test.sh` — this verifies 8 critical checks:
   - Homepage loads
   - JS bundle contains Supabase URL (auth works)
   - JS bundle contains R2 URL (audio works)
   - `/api/chat` endpoint responds (chat works)
   - Audio manifest and sample file load from R2
   - CSS loads
   **If any test fails, revert and fix before moving on.**
8. Open production URL — verify no white screen, test the specific change

**If you deployed a broken site:** revert the code change, rebuild, redeploy IMMEDIATELY. Fix second, restore service first.
**If a remote build fails (Cloudflare):** the cause is almost always a file that exists locally but wasn't committed. Run `git status` and check imports.

---

## Bug Fix Protocol (MANDATORY for any bug that has failed a fix attempt before)

1. **NEVER attempt a fix without first understanding the full data flow.** Trace the actual execution path — don't pattern-match a plausible fix.
2. **Write a test (Playwright or manual verification steps) that reproduces the bug BEFORE writing any fix code.**
3. **After editing: grep for ALL references to any removed/renamed variable, function, or type.** The most common bug is removing a declaration but leaving references in dependency arrays, imports, or other files.
4. **Run the reproduction test — it must pass before deploying.**
5. **If 2 fix attempts have failed on the same bug: STOP.** Add `console.log` at every stage of the data flow and read the actual browser console output. Enter plan mode and document what you tried, what happened, why it failed. If still stuck, tell Anders honestly: "I've tried X and Y, both failed because Z. I need to approach this differently." Do NOT try a third variation of the same approach.

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately

### 2. Subagent Strategy
- Use subagents to keep main context window clean
- Offload research and exploration to subagents
- **Subagents must never stop on permission errors.** If a tool is denied, the agent must try alternative tools (Read/Write instead of Bash, `python3 -c` instead of scripts, Glob/Grep instead of find/rg). If truly stuck after 2 alternatives, explain what was tried and ask Anders for help — don't just report "I need permission" and stop.

### 3. Self-Improvement Loop
- After ANY correction from the user, update the Decisions Log with the pattern

### 4. Verification Before Done
- Never mark a task complete without proving it works
- **"Proving it works" means:** running the dev server, navigating to the feature, and confirming the expected behavior with your own eyes (screenshot or curl). A passing build is necessary but NOT sufficient.

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- Skip this for simple, obvious fixes

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it
- But ALWAYS verify the fix works before telling Anders it's done
- Zero context switching required from the user

## Core Principles

- **Simplicity First**: Make every change as simple as possible.
- **No Guesswork**: Find root causes. No temporary fixes.
- **Minimal Impact**: Changes should only touch what's necessary.
- **Grep after deletion**: Every time you remove a variable, function, type, or import — grep the entire `src/` directory for remaining references before building.
- **Test before deploy**: Every single time. No exceptions. Ever.
- **Never lose reading position**: Any view change (single↔split, edition change, language change, font change) must preserve the reader's current position. Save scrollFraction before the change and restore it after. This is non-negotiable — losing someone's place in a book is the worst UX failure a reader app can have.

---

## Autonomy Framework

**Pre-authorized (just do it):**
- Git commits — if build passes AND you've verified the change works locally, commit
- **"Push" always means: git push + `cd tinct && npx wrangler deploy`.** Never push to GitHub without also deploying to Cloudflare Workers. They are one action.
- Bug fixes and code corrections — fix them, but verify locally before telling Anders
- Deploy — ONLY after completing the Pre-Deploy Checklist above (all 8 steps including smoke test)
- Running and acting on test results — fix what fails
- Content generation within established patterns (book text versions, chapter metadata)
- Prioritization between backlog items
- Routine refactoring that doesn't change behavior

**Still escalate:**
- Deleting books or features (reducing scope)
- Changing the reading experience UX paradigm (split pane, chat placement)
- Database schema changes
- Spending money (Claude API calls beyond dev/test, services)
- New external dependencies
- Changes to pricing model or content strategy
- Show mockups before building UI-heavy features

**The rule:** If the backlog says do it, the tests pass, and the pattern is established — execute and report results. Don't ask.

---

## Decisions Log

<!-- Append new decisions here as they're made during conversations -->
<!-- Format: **[Category]**: Description of the decision and rationale -->

**[Design Direction]**: Warm, literary, clean aesthetic inspired by Poetry Editor. Light mode default, dark mode available. Free system fonts. Collapsible right panel.

**[Translation Display 2026-03]**: Single version displayed with quick-toggle to switch — NOT dual side-by-side display. Dual display rejected as confusing and fatiguing for general readers.

**[Naming 2026-03]**: "Reading journal" NOT "takeaways" — invites reflection, not optimization.

**[Voice Input 2026-03]**: Downgraded to nice-to-have. Not a core feature. Reading is typically silent/private.

**[Popperian Critique 2026-03-05]**: 10-point critique written challenging project assumptions. Counter-arguments documented. Blocking decisions identified. Project paused for strategic reflection.

**[Strategy Locked 2026-03-16]**: All blocking questions resolved. Tinct is a content-agnostic deep reading platform. Free reading + token-based AI pricing. The Odyssey first, then 10-20 classics + Bible. STRATEGY.md and BACKLOG.md created.

**[Content Model 2026-03-16]**: Pre-compute all versions via Claude (modern EN, kids EN, modern DA, kids DA). Store as static data. ~$200-350 for 20 books. One-time cost, lowest per-user cost long-term.

**[Split Pane 2026-03-16]**: Paragraph-level alignment required (No Fear Shakespeare style). Hard but non-negotiable.

**[Notes System 2026-03-16]**: Full scope: highlighting (4-5 colors), auto-explain on highlight, copy-from-chat, freeform notes, AI cleanup (light/aggressive), end-of-book summary. No simplification.

**[Chapter Reflection 2026-03-16]**: Subtle inline button at end of chapter text + small prompt in chat. Never a modal, never pushy. Chat always easy to hide.

**[Persistence 2026-03-16]**: Phase 1a = localStorage. Code through abstraction layer for easy Supabase migration. Supabase + auth in Phase 1b.

**[Mobile 2026-03-16]**: Not Phase 1a. Code mobile-ready. Mobile UX = four swipeable views: text, split pane, chat, notes.

**[Pricing 2026-03-16]**: Phase 1a free. Phase 1b adds Stripe with transparent token-based metered billing. No usage caps — but don't stay free too long. Readwise at $10/month is the competitive gap.

**[QA Standard 2026-03-16]**: Every book, every version must be visually QA'd page by page via screenshots before shipping. Non-negotiable.

**[Domain 2026-03-16]**: tinct.app (already purchased).

**[Onboarding 2026-03-17]**: Single-screen overlay (not wizard). Explains features, collects optional reading angle. Feeds into AI system prompt. Editable post-onboarding from chat welcome.

**[Chat Markdown 2026-03-17]**: Full markdown rendering in chat and notes — headings (h1-h3), bold, italic, bullet lists, numbered lists. Claude responses look formatted, not raw.

**[Page-Aware Chat 2026-03-17]**: System prompt includes visible text from current page. Chat knows what the reader is looking at without being asked.

**[Proactive Insights 2026-03-17]**: AI checks for connections to reading angle on page turns. Rate-limited (5min gap, max 3/session, 25% probability). Non-intrusive bottom-right notification with Discuss/dismiss.

**[Split Pane Pagination 2026-03-17]**: Split reader now paginates like single reader (CSS multi-column, page arrows, keyboard nav, click zones). No more infinite scroll.

**[Prose Newlines 2026-03-17]**: Butler prose text had embedded \n from Project Gutenberg. Auto-detected as prose (avg line >60 chars) and collapsed to spaces. Pope verse preserved. Fixed highlight offset matching too.

**[Panel UX 2026-03-17]**: Removed redundant "Chat" header inside Chat component — panel tabs (Chat | Notes) are the navigation. "Clear" button only shows when messages exist.

**[Deep Cleanup 2026-03-17]**: Changed from "restructure and condense" to "synthesize to 30-50% length". Light cleanup keeps structure; deep cleanup is a true synthesis.

**[Threads Feature 2026-03-19]**: Character tracker called "Threads" — third tab in side panel alongside Chat and Notes. Per-character, per-chapter summaries in 4 editions (modern-en, kids-en, modern-da, kids-da). Spoiler-aware: shows only up to current reading chapter, with "reveal later" toggle. Runtime mention scanning from loaded edition text. Wikipedia links per character. 25 characters for The Odyssey including gods, mortals, and creatures. All content generated via CLI, zero API calls. Filter by role (All/Mortals/Gods/Creatures). Click chapter labels to navigate. Data stored in odyssey-threads.json, lazy-loaded.

---

## Book Addition Checklist

When adding a new book to the library, ALL of the following must be completed before considering the book "done":

### 1. Source Text
- [ ] Obtain original text (Project Gutenberg or equivalent public domain source)
- [ ] Parse into edition JSON format: `{bookId}-original-en.json`
- [ ] Verify chapter/episode structure, titles, and paragraph count
- [ ] Remove Project Gutenberg metadata/boilerplate from text

### 2. All Editions (generated via CLI — ZERO API spend)
- [ ] `{bookId}-modern-en.json` — Modern English (accessible contemporary prose)
- [ ] `{bookId}-modern-da.json` — Modern Danish (Moderne Dansk)
- [ ] All editions paragraph-aligned with original (same paragraph count per chapter)

**Kids editions are permanently out of scope. Never add kids-en or kids-da.**

### 3. Book Registry
- [ ] Book registered in `bookRegistry.ts` with all editions listed
- [ ] Edition metadata correct (key, language, style, label, aligned flag)
- [ ] `BOOKS` array includes the new book

### 4. Book Onboarding Content (required for every book)
The onboarding modal shows for all entry points — direct navigation, SEO traffic, everything. It is the product's first impression and the mechanism that drives completion. Every book must have this content defined before it ships.

**Content to write (generate via CLI conversation, never via API script):**
- [ ] **About text** — 2 paragraphs: what the book is actually about, plainly stated
- [ ] **Why it still matters** — 3 items: specific to this book, no generic observations. Each item must have an *italic title* and 2–3 sentences of substance.
- [ ] **Reading angles** — 4 suggested angles shown as clickable cards in Step 3. Each is derived from the "why it matters" items. Format: `italic title + 2 sentences explaining what the reader will notice with this angle`. These are free for all users.
- [ ] **Cast** — 6 key figures: name, role tag (mono uppercase), 2-sentence description. No spoilers beyond what's established early. Characters + concepts both allowed (e.g. "The Inner Citadel" for Meditations).
- [ ] **Pre-reading chat responses** — 3 themed responses keyed to likely reader questions (each 3–5 substantial paragraphs, book-specific, at the quality level of the Odyssey Greek/Christian ethics response) + 1 fallback response. Topics should match what real readers bring to this particular book.
- [ ] **Opening background text** — The actual opening lines of the book (shown blurred behind the modal). 3–5 sentences.
- [ ] **HTML onboarding file** — Written to `Design refs/Book Onboarding - [Title].html` using the Odyssey file as template.

**The reading angle is free for everyone.** It is not a premium feature. It is the core mechanism that increases completion rates. The extended pre-reading chat (Step 5) is premium.

**Flow order:**
1. Edition setup (mandatory)
2. What you're about to read + Why it matters
3. Your reading angle (free — 4 suggested cards + custom text)
4. Meet the cast
5. Extended pre-reading chat (premium)

### 5. Threads (Character Tracker)
- [ ] `{bookId}-threads.json` created with all major characters
- [ ] Each character has: id, name (en/da), epithet (en/da), role, wikipediaUrl, searchNames
- [ ] Per-chapter summaries in 2 editions (modern-en, modern-da)
- [ ] `useThreads.ts` updated to load the new book's threads data

### 6. App Integration
- [ ] Book selectable in the UI (Header book selector)
- [ ] Chapter navigation works (correct labels, correct count)
- [ ] Edition switching works (language + style dropdowns)
- [ ] Split pane works with aligned editions
- [ ] Reading position persistence works per book
- [ ] Chat context uses correct book title/author
- [ ] **Onboarding modal fires for all entry points** (direct nav, SEO landing, share links)
- [ ] Reading angle stored in user session and injected into AI system prompt
- [ ] Onboarding can be dismissed at any step ("Start reading now →")

### 7. Visual QA (Non-negotiable)
- [ ] Every edition, every chapter visually checked via dev server screenshots
- [ ] Text renders correctly (no missing content, no broken paragraphs)
- [ ] Chapter navigation works end-to-end
- [ ] Split pane alignment verified
- [ ] Dark mode checked

### The Rule
**Do not mark a book as "added" until every checkbox is complete.** Partial additions (e.g., original text only) are work-in-progress, not done.

**[Ulysses Added 2026-03-19]**: James Joyce's Ulysses added as the second book. 18 episodes, 7,148 paragraphs. 5 editions (original-en, modern-en, kids-en, modern-da, kids-da), all paragraph-aligned. 20 characters in threads. Book selector in header. Visual QA passed (34 Playwright tests). All content generated via CLI, zero API spend.

**[Monetization Infrastructure 2026-03-20]**: Full billing stack implemented. Supabase auth (email + Google OAuth), token-based balance system ($2 free tier, $5/$10/$20 top-ups), Stripe Checkout integration, usage tracking with atomic balance deduction. API endpoints: chat.ts (auth + balance check + rate limiting), create-checkout.ts, webhook.ts, balance.ts. Frontend: AuthModal, BalanceIndicator (header), UsageDashboard (top-up flow). Supabase migration SQL created. Storage abstraction updated for conditional localStorage/Supabase. Dev mode works without Supabase configured (all free). Env vars needed for production: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.

**[Pricing Model Revised 2026-03-24]**: Two tiers, per-book. First book = Premium free. Free: all editions, side-by-side, highlights, cross-device sync. Premium ($3/book): cast, 200 AI messages, intelligent notes, audiobook, reading journal, flashcards, chapter reflection prompts. Beyond 200 messages: $3 per 100 extra messages (account-level balance, carries across books). At ~$0.02/message API cost, that's ~50% markup. Replaces previous token-balance top-up model. Billing infrastructure needs update: per-book purchase flow via Stripe, 200-message counter per book, message pack purchases, first-book-free logic.

**[Features To Build 2026-03-24]**: Flashcards & spaced repetition (per-book vocabulary/concepts, review scheduling). Audiobook with position sync (TTS or pre-generated, syncs to reading position). Chapter reflection prompts (AI-generated prompts gated behind Premium tier). Per-book purchase flow (replace top-up model with $3/book Stripe checkout). Message pack purchase ($3/100 messages, account-level balance).

**[Kids Editions Dropped 2026-03-25]**: Kids editions (kids-en, kids-da) permanently removed from scope for all books. Never discuss, generate, or reference. Editions are now 3 per book: original-en, modern-en, modern-da. All checklists and scripts updated accordingly.

**[Pricing Final 2026-04-20]**: Premium is $3/month (confirmed by Anders). Replaces all previous pricing discussions ($5/mo, per-book $3, etc.). PricingModal.tsx and landing.html still show $5/mo — needs code update.

**[Subscription Model 2026-04-20]**: Three tiers in PricingModal: (1) No account — read only, (2) Free account — reading features + 30-day Premium trial, (3) Premium $3/mo — AI chat (200 msgs/mo), audiobook, Cast, offline, reading journal.

**[Content Expansion 2026-04-20]**: 33 public books registered in bookRegistry.ts as of April 2026. Target is 100+ books. "Content Expansion" sprint is complete for the initial push; ongoing as new books are added.

**[Android App 2026-04]**: Capacitor build started, `app/android/` directory exists. Play Store listing drafted (PLAY-STORE-LISTING.md). E-ink optimizations in scope for Android.

**[Offline Mode 2026-04]**: DownloadManager.tsx built, service worker caching implemented. Offline sprint is done.

**[Reading Angle — Core Feature 2026-04-20]**: Reading angle is free for all users (not premium). It fires on all entry points including SEO traffic. It is the primary completion-rate mechanism — research confirms personal connection before reading begins is the #1 driver of book completion. The extended pre-reading chat (Step 5) remains premium. Angle is stored in session and injected into AI system prompt so mid-read chat references it. Book Addition Checklist updated to require 4 angle cards per book.

**[Onboarding Entry Point 2026-04-20]**: Onboarding modal shows for ALL entry points — direct navigation, SEO landing pages, share links, everything. Users can dismiss at any step with "Start reading now →". This is intentional: Tinct's differentiation is the onboarding experience, not just text access. SEO visitors who see it immediately understand they are somewhere different from Project Gutenberg.

**[Design Refresh 2026-04-20]**: Full design system refresh in progress. New design refs at `Design refs/` folder. Landing page: `Tinct Landing v2.html`. Reader: `Reader Variations.html`, canonical = Variant D "The Hybrid". New palette: --paper #ece7db, --ink #0b0b0b, --accent #1f4a5c. New fonts: Playfair Display, EB Garamond, IBM Plex Mono (Google Fonts). Accent color changes everywhere — reader and landing must be consistent.

**[Account Onboarding Rewrite 2026-04-21]**: Account Onboarding reduced to 6 steps, copy rewritten in manifesto voice. Step sequence: (1) Your angle — "What draws you in?", (2) Modern/original/both with split-pane toggle note, (3) The guide — "Who was Menelaus again?" (Chat + Cast folded into one step), (4) Audiobook continuity — "Pick up where you stopped reading" (NEW step; audiobook gets its own beat per manifesto), (5) The journal — highlights + Feed, (6) Preferences + pricing close — "The books are still here" with $3/mo + first-month-free beat. Old "Welcome to Tinct" dead-end step removed; pricing merged into final preferences step. Ref: `Design refs/Account Onboarding.html`.

**[Angle Skip Option 2026-04-21]**: Reading angle remains the pitched default but must never feel imposed. Two moves: (a) Account Onboarding Step 1 copy ends with "Or skip — the book works either way"; (b) Book Onboarding angle step gets a fifth equal-weight card "Just start reading" that clears the angle. Reading angle stays free for all users and remains the #1 completion-rate mechanism.

**[Angle Iteration Feature — FUTURE 2026-04-21]**: New feature idea (not yet built): when the user submits a reading angle, the AI responds conversationally ("That's a strong angle — here's what you might notice...") and iterates across a few turns before the angle is locked in. Gives the user a chance to refine before reading starts. **Free tier gets this specific chat** (capped at ~5 messages) as a taste of the AI companion — cost is low, conversion signal is high. In-book chat remains Premium. Logged to BACKLOG.md.

**[User Journeys v1 — Approved 2026-04-21]**: Two-path user flow spec approved. Ref: `Design refs/User Journeys.html`. Journey A (Direct-to-Book, SEO/shared links): one-screen edition picker (reuse Book Onboarding Step 1) → reader → state-aware top banner → progress prompt at end of Chapter 1 (or page 20 if long) → sign-up modal → TierChooser. Journey B (Library-First): landing → library → full 3-step Book Onboarding → TierChooser (if no account) → reader. Four locked-in principles: no hard gates, don't describe local storage, no-downside Premium (defaulted), three tiers always (Premium/Free/Anonymous). Sign-up supports Google (live), Apple (deferred — needs Apple Developer config), Email magic link. Account Onboarding (the 6-step tour) is NOT the critical path — optional from Settings only.

**[Landing Page Auth Redirect — CRITICAL 2026-04-21]**: Signed-in users must NEVER see the landing page. Added auth-check script at top of `app/public/landing.html` that inspects localStorage for a valid Supabase session token and redirects to `/read` before the page renders. This is a hard rule — any regression is a P0 bug.

**[Pricing Consolidated 2026-04-21]**: All $5/mo references updated to $3/mo across `TrialBanner.tsx`, `PricingModal.tsx`, `AccountDecision.tsx`, `UsageDashboard.tsx`, `worker.ts`. Chat pack $5/200 messages stays (separate product). Landing.html already clean.

**[TierChooser Component 2026-04-21]**: New `app/src/components/TierChooser.tsx` replaces the AccountDecision modal in `App.tsx`. Three options: Premium (pre-selected, 30 days free, auto-cancels), Free account, Anonymous. Wired to route both Premium and Free selections through AuthModal signup — the existing TierContext defaults all new accounts to the 30-day trial. AccountDecision.tsx file retained but no longer rendered; clean up in a later pass. CSS appended to `index.css`.

**[Security & Efficiency Audit — 2026-04-21]**: Full security + efficiency scan completed by parallel agents. Low-risk fixes shipped:
- **Anti-scrape**: Rate-limiting added to `/data/*.json` (30 req/60s per IP), `/api/audio-manifest`, `/api/audio-file`, `/api/edition-patches`. Path validation added to audio proxies (rejects path traversal, only `{bookId}/{edition}/{file}` pattern). `bookId`/`editionKey` whitelisted on patches endpoint against injection via Supabase `eq.` filter.
- **robots.txt**: Created with AI-training crawler opt-outs (GPTBot, ClaudeBot, CCBot, Google-Extended, PerplexityBot, etc.). Disallows `/data/`, `/api/`, `/audio/`.
- **Cleanup**: Deleted 31 macOS/iCloud sync-conflict duplicates (26 in `app/src/`, 5 at `app/` root: capacitor/vite/wrangler/package config dupes). Added `*\ 2.*` glob to `.gitignore`.
- **Open items** (need Anders): (1) Make R2 bucket `pub-c34df89c...` private and bind to worker via `env.R2_BUCKET.get()` to close direct-access bypass — requires Cloudflare dashboard change. (2) Hero images (`hero-bg.png` 3.5 MB, `hero-devices.png` 361 KB) → convert to WebP for ~800 KB+ gzip savings on landing. (3) Lazy-load SettingsSheet/PricingModal/UsageDashboard/BookStore/TierChooser via `React.lazy()` — ~30-40 KB JS gzip deferred. (4) Minify static JSON via Vite plugin — ~10-15 KB gzip on edition loads.

**[User-Journey Build Phase 2 — 2026-04-21]**: Core components for the new journey flow are built and wired:
- `BookOnboarding.tsx` — 3-step modal (edition → angle → cast). Supports `mode='full'` and `mode='edition-only'` for direct-to-book users. Loads per-book JSON from `/data/onboarding/{bookId}.json`. Blurred opening text behind the modal. Dismissible at any step via "Start reading now ×".
- `ProgressPrompt.tsx` — inline floating card that appears for anonymous users at end of Chapter 1 (or page 20 fallback). Triggers sign-up modal. Dismissal persists per-book via localStorage.
- `ContextualAnglePrompt.tsx` — renders inline in the Chat welcome state when no reading angle is set. Wired through `SidePanel.tsx` → `Chat.tsx`.
- `TrialBanner.tsx` — extended with anonymous-state banner ("Save your place across devices — AI companion, audiobook, Feed. Free account →"), no pricing. Premium-trial state updated to "Cancels automatically."
- **Deep-link URL parsing** added to `App.tsx` mount — `/read/{bookId}` = full mode, `/{bookId}` = edition-only mode. Worker's existing SPA fallback already serves these paths.
- Per-book content for all 33 books extracted from `Design refs/Book Onboarding - *.html` into `/data/onboarding/{bookId}.json` via CLI agent. Zero API spend. Each file has: title, author, era, length, estimatedTime, openingChapterLabel, openingText, about, 4 angleCards, 6 cast.
- Apple OAuth deferred pending Apple Developer Program + Supabase config.
