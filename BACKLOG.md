# Tinct — Backlog

**Last updated:** 2026-04-29

---

## What's Built

| Feature | Status |
|---|---|
| 60 books in registry | Done |
| Multiple editions (original, modern EN, modern DA) | Done |
| Side-by-side reading (paragraph-aligned) | Done |
| AI chat (page-aware, self-aware about Tinct features) | Done |
| Cast (character tracker, spoiler-aware) | Done |
| Highlights (5 colors, cross-edition navigation) | Done |
| Notes & Feed (freeform, from-chat, AI cleanup, timeline) | Done |
| Reading journal (end-of-book AI summary) | Done |
| Chapter reflection prompts | Done |
| Audiobook player (R2-hosted, paragraph-sync, position restore) | Done |
| Book Onboarding v1 (3-step: edition / angle / cast) | Done — being replaced |
| **Feature Tour** (post-signup coachmark walkthrough, 10 steps) | Done (2026-04-29) |
| Dark mode | Done |
| Cross-device sync (Supabase real-time) | Done |
| Auth (email + Google OAuth) | Done |
| Mobile responsive (5-tab nav, tap-to-turn, chapter advance) | Done |
| Stripe billing ($3/mo + $3/100 chat packs) | Done |
| 30-day free trial + trial expiry banner + email reminder (Brevo) | Done |
| Subscription management (cancel, resubscribe, message tracking) | Done |
| Deployed to tinct.app | Done |

---

## Current Sprint — Book Onboarding v2 + Landing Page (April 2026)

### Book Onboarding v2 — SHIPPED 2026-04-29

**Goal:** Replace v1's 3-step flow with a 6-step flow that leads with substance ("why this is worth your time today") before asking the user to commit to an edition.

**New flow:**
1. About + Acclaim (verified primary-source endorsements)
2. Why It Still Matters (3 items in calibrated voice)
3. Pick edition (Compare defaults to inverse, not empty)
4. Cast
5. Reading angles (card-pick replaces AngleChat — simpler, free, no AI)
6. Account *(anonymous only)* — Feature Tour fires post-signup

**Status:** Live at https://tinct.app (commit f7b8eeb, version `d1a99346…`).
- [x] Voice calibrated on Niels Lyhne + Notes from Underground
- [x] JSON schema settled (`acclaim`, `whyItMatters`, drop `preReadingChat`)
- [x] All 60 books updated with new schema
- [x] BookOnboarding.tsx refactored — 6-step flow, Compare default = inverse, angle card-pick replaces AngleChat
- [x] CSS for new sections (acclaim, why-matters, angle-skip)
- [x] Build clean, 16/16 guard tests, 14/14 smoke tests
- [x] Deployed to production
- [ ] Acclaim follow-up: apply fact-checked quotes from research agent for the 46 books currently shipping with empty acclaim arrays. Agent was running at end of session.
- [ ] Cleanup: delete dead AngleChat helper + unbuilt manifesto HTML.

**Voice calibration (locked):**
- Lead with what the book deals with (book-focused, descriptive verbs: deals with, asks, follows, traces, casts off)
- ONE brief contemporary line per `whyItMatters` item
- Avoid: first-person plural commentary, aphorisms, "Both. Neither." parallelism, steelman bothsidesing
- Acclaim: primary-source quotes only, fact-checked against Wikipedia + original letters/essays

### Landing page update (NEXT — 2026-04-30)

Anders wants to bring the new onboarding feel to the landing page. Discussion topic for next session.

- [ ] Decide what from book onboarding (acclaim quotes? why-it-matters? aesthetic?) translates to landing
- [ ] Apply new design tokens (teal accent, Playfair / EB Garamond / IBM Plex Mono) if not already
- [ ] Update book count to 60 (currently shows 33)
- [ ] Update pricing references if any are stale

---

## Recently Completed

### Feature Tour ✓ (2026-04-29)
10-step coachmark walkthrough. Mobile + desktop orderings, conditional per tier, fires on first sign-up, replays from Settings.

### Bible Empty-Page Bug ✓ (2026-04-29)
`primaryData` cleared on bookId change so Reader shows spinner instead of stale paragraphs during book-switch.

### Pricing Consolidation ✓ (2026-04-21)
$5/mo references all updated to $3/mo across `TrialBanner.tsx`, `PricingModal.tsx`, `AccountDecision.tsx`, `UsageDashboard.tsx`, `worker.ts`.

### Offline Mode ✓
DownloadManager.tsx + service worker caching.

### Content Expansion (ongoing)
60 public books in `bookRegistry.ts`.

### Android App (IN PROGRESS)
- Capacitor build in `app/android/`
- Play Store listing drafted
- [ ] E-ink optimizations
- [ ] Physical button support for page turning
- [ ] Submit to Play Store

---

## Up Next (after Book Onboarding v2 ships)

### Angle Iteration Chat (NEW — April 2026)
After user picks a reading angle, AI responds with "here's what you might notice with this angle" and iterates over 2-3 turns before lock-in. Free tier gets this specific chat (capped at ~5 messages) as a taste of the AI companion — low cost, high conversion signal. In-book chat remains Premium.

### Account Onboarding manifesto — RETIRED
The unbuilt 6-step manifesto in `Design refs/Account Onboarding.html` is dropped. What we mean by "post-signup onboarding" is the Feature Tour. No further work needed here.

### SEO & Public Launch
- [ ] Meta tags, Open Graph, structured data on landing.html
- [ ] Google Search Console setup
- [ ] Content marketing (book summaries as SEO pages)

### More Languages
- [ ] German as first expansion (better LLM quality than Danish)
- [ ] EPUB import ("Your book, your way")

### Apple OAuth
- [ ] Apple Developer Program + Supabase config
- [ ] Wire Apple sign-in alongside Google

---

## Backlog (post-launch)

### Flashcards & Spaced Repetition
- [ ] AI-generated flashcards from highlights and notes
- [ ] Spaced repetition scheduler (SM-2)
- [ ] Review UI (card flip, confidence rating)
- [ ] Premium-gated

### Translation Quality
- [ ] Danish translation style guide (5 structural patterns identified from FoR comparison)
- [ ] Second-pass proofreading prompt for Danish
- [ ] German as expansion language

### B2B / Education
- [ ] Teacher landing page ("Assign The Odyssey on Tinct")
- [ ] Classroom pricing (per-student)
- [ ] Reading progress dashboard for teachers

### Social & Community
- [ ] Book clubs (shared reading, group highlights)
- [ ] Export highlights/notes as Markdown or PDF
- [ ] Reading statistics

### Additional Features
- [ ] Bionic reading mode
- [ ] 3+ translation comparison
- [ ] Email reminders for reading streaks
- [ ] Annual subscription option ($50/year)
