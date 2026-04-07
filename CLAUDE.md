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

**`generate-editions.cjs` must NOT be used for development.** To generate modern/kids editions: read each chapter in the CLI conversation, generate the translation, and write it to the JSON file. This is how Sojourners generated 21 event summaries, 33 character bios, and 12 era rewrites — all through CLI, zero API cost.

The API key exists **ONLY** for production user-facing features: the reader chat when a real user asks a question after deployment. Development-time content generation through API calls burns budget that funds the entire operation.

**Violating this rule is a firing offense for the CEO.**

---

## Auto-Documentation Rule

**Automatically update this file** when making decisions during conversations. When we settle on a design choice, product direction, architecture decision, or project standard, append it to the Decisions Log at the bottom. Use judgment — log things useful for future sessions, skip trivial one-off choices.

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
A content-agnostic deep reading platform. Not passive consumption — active wrestling with texts. Users read in multiple versions (original, modern, kids) and languages (English, Danish), debate and question through AI chat, highlight and annotate, and build understanding over time. Starting with The Odyssey, expanding to 10-20 Western classics + Bible.

**Full strategy:** See `STRATEGY.md`
**Prioritized work:** See `BACKLOG.md`

---

## Popperian Critique — March 5, 2026

### Critique 1: The Zero-Moat Problem
Public domain books are free and available everywhere. Project Gutenberg, Standard Ebooks, Internet Archive, and dozens of beautiful reader apps already serve this content. The *text itself* cannot be your competitive advantage because anyone can offer the same books. Your moat has to come entirely from the AI layer — and that layer is trivially replicable. Any competitor can wrap Claude or GPT around the same texts within a week.

**Implication**: The product must create value through *experience design* and *accumulated user data* (annotations, chats, takeaways), not through content access. Think hard about what makes the experience sticky enough that users wouldn't just paste a passage into ChatGPT.

### Critique 2: You May Be Solving a Problem Readers Don't Have
The Kindle's simplicity is a feature, not a bug. Deep reading requires sustained focus. A side panel with chat, analysis, annotations, multiple versions, and voice input could turn reading into a *fragmented, distracted* experience. Most serious readers of classics specifically seek *immersion*, not interruption.

**Counter-question**: Is your target user someone who *already reads* classics and wants more depth? Or someone who *doesn't yet* read them and needs the support? These are very different products. The first group may resent the scaffolding; the second may not be willing to read The Odyssey even with it.

### Critique 3: LLM Translations Are Not Good Enough (Yet)
Literary translation is one of the hardest creative tasks. Professional translators of The Odyssey (Fagles, Lattimore, Wilson) spend years on a single work, making deliberate choices about tone, register, rhythm, and cultural nuance. Current LLMs produce *functional* translations but not *literary* ones. A "contemporary English" version via Claude will read like a Wikipedia summary of Homer, not like Emily Wilson's Odyssey.

**Risk**: If users compare your LLM translation to a real one, your product loses credibility. The "kids version" is more defensible because no one expects literary artistry there, but the "modern English" version sets expectations it may not meet.

### Critique 4: Starting With One Book Makes the Product Unjustifiable
Who downloads an app to read one book? The Odyssey is ~130,000 words — a committed reader finishes it in a week or two. Then what? Even if the reading experience is magical, the product becomes useless after one book. You need at minimum 10-20 books ready at launch to give users a reason to *stay*.

**Suggestion**: Consider launching with a curated "canon starter pack" — perhaps 10 works across different eras: Homer, Virgil, Dante, Shakespeare (a play), Austen, Dostoevsky, a philosophical text (Plato's Republic), a religious text (Book of Genesis), an epic poem (Paradise Lost), and one more. This gives users a journey, not a one-off.

### Critique 5: The Revenue Model Is Absent
- Free books → no content revenue
- AI chat costs *you* money (Claude API calls per user)
- Hardware is capital-intensive with razor-thin margins
- EPUB bookstore means competing with Amazon, Apple, and Kobo simultaneously

You're building something that costs you money for every engaged user. The more someone uses the chat, the more it costs you. This is the classic AI product trap: your best users are your most expensive users.

**Question**: Is this a subscription product? An ad-supported product? A loss leader for hardware? The answer shapes everything about how you build it.

### Critique 6: The Hardware Vision Is a Distraction (For Now)
Building consumer electronics requires: industrial design, supply chain management, FCC certification, firmware engineering, manufacturing relationships, inventory management, and customer support infrastructure. Each of these is a company-sized problem. History is littered with failed e-readers (Nook, Kobo Aura, Remarkable's pivot struggles).

**Recommendation**: Keep this in the long-term vision document but do not let it influence any near-term decisions. Build a *software* product that works beautifully in a browser. If it succeeds, the hardware conversation becomes meaningful. If it doesn't, you've saved yourself millions.

### Critique 7: Dual-Version Display May Confuse More Than Clarify
Showing two versions of the text side by side (e.g., original + modern) sounds great in theory, but in practice: (a) it halves your readable area, (b) the eye constantly jumps between versions creating fatigue, (c) scholarly parallel-text editions exist and are used almost exclusively by academics, not general readers.

**Suggestion**: Make this a power-user feature, hidden by default. The default should be one version, beautifully displayed, with a quick-toggle to switch between versions rather than showing both.

### Critique 8: "Chat With Your Book" Already Exists
Readwise Reader, Kindle + ChatGPT, Notion AI + epub imports, and dozens of Chrome extensions already let you highlight text and ask an AI about it. The standalone chat-with-a-book experience is not novel. You need to articulate what makes *your* version 10x better.

**Possible differentiators that might actually work**:
- Pre-computed, book-specific analysis that's *always there* (not just on-demand)
- An annotation system that builds a personal "reading journal" over time
- The style/translation flexibility (if quality is high enough)
- A curated, opinionated experience rather than a generic AI wrapper

### Critique 9: Voice Input for Reading Is Awkward
Reading is typically done in silent, private contexts: bed, libraries, cafes, commutes. Speaking to your book is socially awkward in most reading contexts. The Kindle's lack of voice input is not a shortcoming — it reflects how people actually read.

**Counter-argument**: There are contexts where voice works — reading at home alone, studying at a desk. But this is a nice-to-have, not a core feature. Don't let it drive design decisions.

### Critique 10: The "Takeaways" Feature Assumes a Utilitarian View of Reading
Not everyone reads classics to extract "key takeaways." Many read for aesthetic pleasure, for the experience of encountering beautiful language, for escapism, or for the slow accumulation of wisdom that resists bullet-point summarization. A takeaways-oriented design might attract productivity-minded readers but alienate literary ones.

**Suggestion**: Frame this as a "reading journal" rather than "takeaways." The former invites reflection; the latter implies optimization.

---

## Strongest Counter-Arguments (Why It Might Work Anyway)

1. **The existing tools are all generic**: Nobody has built a *purpose-designed, book-specific* AI reading companion. The difference between "paste into ChatGPT" and a deeply integrated reading experience is the difference between a text editor and Google Docs.

2. **Classics are intimidating**: There's a real market of people who *want* to read The Odyssey but find it impenetrable. The kids/modern versions + contextual chat could genuinely unlock these texts for new audiences.

3. **The annotation/journal system could be genuinely sticky**: If you build something that accumulates value over time (your reading history, your annotations, your conversations with books), it becomes hard to leave.

4. **Personal project first = no market pressure**: Since you're building this for yourself initially, you can focus entirely on making the experience *right* without worrying about monetization or scale. Many great products started this way.

---

## Design Direction
- Inspired by Poetry Editor (poetryeditor.com) — warm, literary, clean
- Light mode default, dark mode available
- Free system fonts (no paid fonts)
- Collapsible right panel (like Poetry Editor's Analysis panel)
- Desktop-first

## Tech Stack
- React + TypeScript + Vite (same stack as Poetry Editor)
- Claude API for chat features
- Public domain texts from Project Gutenberg / Internet Archive
- Deployed via Cloudflare Workers

## Current State (March 2026)

### What Exists
- React 18 + TypeScript + Vite project scaffolded
- Components: Header, Reader, SidePanel, Chat
- Custom hook: `useClaude.ts` for Claude API communication
- The Odyssey: Butler (1900) and Pope (1726) translations, parsed from Project Gutenberg
- Warm literary CSS design (dark/light mode, chapter nav, translation switcher)
- Text selection popup ("Explain this" / "Ask about this")
- Annotation type defined but not implemented
- Playwright visual QA partially set up

### Strategic Decisions Made (2026-03-16)
All blocking questions answered — see `STRATEGY.md`:
- **Name/domain:** Tinct / tinct.app
- **Target audience:** Book club readers, classics-intimidated readers, serious deep readers
- **Content scope:** The Odyssey first → 10-20 Western classics + Bible
- **Revenue model:** Free reading, token-based AI pricing (cost-plus markup)
- **Ambition:** Commercial — sustainable business, not charity
- **Positioning:** "No Fear Shakespeare for everything, with an AI companion" — deep not wide (vs. Readwise)

### Current Phase: 1a — The Odyssey Experience
**Target: mid-April 2026** (Anders's book club deadline)
See `BACKLOG.md` for full task list.

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
2. `npx vite build` — must pass with zero errors
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
5. **If 2 fix attempts have failed on the same bug: STOP.** Enter plan mode. Re-trace the full data flow from scratch. Do not attempt a third fix without a new analysis.

---

## When Stuck (>2 failed attempts on same problem)

- **STOP coding immediately.** More code changes will make it worse.
- Add `console.log` at every stage of the data flow and read the actual browser console output.
- Document in a plan: what you tried, what happened, why it failed.
- If still stuck: tell Anders honestly. Say "I've tried X and Y, both failed because Z. I need to approach this differently." Do NOT try a third variation of the same approach.

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

## Task Management

1. **Plan First**: Write plan before starting implementation
2. **Verify Plan**: Check in before starting
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Note what was done
6. **Capture Lessons**: Update Decisions Log after corrections

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

## Collaboration Preferences

- **The user (Anders) is the product owner**: He has strong opinions about UX and product direction. Respect his instincts.
- **Show mockups before building**: For UI-heavy features, create an HTML mockup and iterate on feedback before writing production code.
- **Plan before code**: Enter plan mode for non-trivial tasks. Show the plan. Get approval. Then build.
- **Don't ask unnecessary questions**: Be autonomous on routine decisions.
- **Deep root-cause analysis before fixing**: Don't patch symptoms.

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
- [ ] `{bookId}-kids-en.json` — Kids English (ages 10-14, simplified, age-appropriate)
- [ ] `{bookId}-modern-da.json` — Modern Danish (Moderne Dansk)
- [ ] `{bookId}-kids-da.json` — Kids Danish (Dansk for Børn)
- [ ] All editions paragraph-aligned with original (same paragraph count per chapter)

### 3. Book Registry
- [ ] Book registered in `bookRegistry.ts` with all editions listed
- [ ] Edition metadata correct (key, language, style, label, aligned flag)
- [ ] `BOOKS` array includes the new book

### 4. Threads (Character Tracker)
- [ ] `{bookId}-threads.json` created with all major characters
- [ ] Each character has: id, name (en/da), epithet (en/da), role, wikipediaUrl, searchNames
- [ ] Per-chapter summaries in all 4 editions (modern-en, kids-en, modern-da, kids-da)
- [ ] `useThreads.ts` updated to load the new book's threads data

### 5. App Integration
- [ ] Book selectable in the UI (Header book selector)
- [ ] Chapter navigation works (correct labels, correct count)
- [ ] Edition switching works (language + style dropdowns)
- [ ] Split pane works with aligned editions
- [ ] Reading position persistence works per book
- [ ] Chat context uses correct book title/author
- [ ] Onboarding/reading angle works per book

### 6. Visual QA (Non-negotiable)
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
