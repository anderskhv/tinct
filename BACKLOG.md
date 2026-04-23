# Tinct — Backlog

**Last updated:** 2026-04-20

---

## What's Built

| Feature | Status |
|---|---|
| Multiple editions (original, modern EN, modern DA) | Done (33 books) |
| Side-by-side reading (paragraph-aligned) | Done |
| AI chat (page-aware, self-aware about Tinct features) | Done |
| Cast (character tracker, spoiler-aware) | Done |
| Highlights (5 colors, cross-edition navigation) | Done |
| Notes & Feed (freeform, from-chat, AI cleanup, timeline) | Done |
| Reading journal (end-of-book AI summary) | Done |
| Chapter reflection prompts | Done |
| Audiobook player (R2-hosted, paragraph-sync, position restore) | Done |
| Onboarding (reading angle, edition picker) | Done |
| Dark mode | Done |
| Cross-device sync (Supabase real-time) | Done |
| Auth (email + Google OAuth) | Done |
| Mobile responsive (5-tab nav, tap-to-turn, chapter advance) | Done |
| Stripe billing (subscription $3/mo, chat packs $3/100) | Done (code still shows $5/mo — needs update) |
| 30-day free trial + trial expiry banner + email reminder (Brevo) | Done |
| Subscription management (cancel, resubscribe, message tracking) | Done |
| Deployed to tinct.app | Done |

## Current Sprint

### Design Refresh (IN PROGRESS — April 2026)
- [ ] Rebuild landing.html to match `Design refs/Tinct Landing v2.html`
- [ ] Update reader UX to match Variant D "The Hybrid" from `Design refs/Reader Variations.html`
- [ ] Apply new design tokens globally (teal accent, Playfair Display, EB Garamond, IBM Plex Mono)
- [ ] Update landing.html book count to 33 (currently shows 25)
- [ ] Update pricing to $3/mo everywhere (PricingModal.tsx + landing.html)

---

## Recently Completed (moved from Up Next)

### Offline Mode ✓
- DownloadManager.tsx built, service worker caching implemented

### Content Expansion ✓
- 33 public books registered in bookRegistry.ts

### Android App (IN PROGRESS)
- Capacitor build exists in `app/android/`
- Play Store listing drafted (PLAY-STORE-LISTING.md)
- [ ] E-ink optimizations
- [ ] Physical button support for page turning
- [ ] Submit to Play Store

---

## Up Next

### Onboarding Rebuild (April 2026)
- [x] Account Onboarding was skipped in favor of Book Onboarding per user-journey decisions. Existing 6-step design retained as optional tour reference (`Design refs/Account Onboarding.html`)
- [x] Build `BookOnboarding.tsx` component with 3-step (edition / angle / cast) + edition-only mode
- [x] Generate per-book onboarding content (about, 4 angle cards, 6 cast, opening text) for all 33 books via CLI — zero API spend
- [x] Fire onboarding modal on ALL entry points (direct, SEO, share links) — deep-link URL parser in `App.tsx`
- [x] Replace `AccountDecision` with `TierChooser` — tier chooser presents Premium/Free/Anonymous with Premium pre-selected
- [x] State-aware top banner — `TrialBanner` extended for anonymous + trial + expired states
- [x] Progress prompt at end of Chapter 1 (or page 20)
- [x] Contextual angle prompt on first Chat tap (wired into `Chat.tsx` welcome state)
- [ ] Book-onboarding touch-ups: delete duplicate `The Manual (Enchiridion).html`, rename generic `Book Onboarding.html` → `Book Onboarding - The Odyssey.html`, normalize angle numbering (1/2/3/4), rewrite 3 weak about-blurbs (Imitation, Jerusalem, Bible), rewrite ~4 weak angle cards, rebuild Art of War cast
- [ ] Apple OAuth — needs Apple Developer Program + Supabase config
- [ ] Runtime verification: smoke-test full journey end-to-end (landing → library → book → onboarding → reader → progress prompt → sign-up → tier chooser) with real figures

### Angle Iteration Chat (NEW — April 2026)
- [ ] After user submits reading angle, AI responds with "here's what you might notice with this angle" and iterates across 2–3 turns before user locks it in
- [ ] Free tier gets this specific chat (capped at ~5 messages) as taste of AI companion — low cost, high conversion signal
- [ ] In-book chat remains Premium ($3/mo)
- [ ] Angle locks into session + AI system prompt as usual

### SEO & Public Launch
- [ ] Meta tags, Open Graph, structured data on landing.html
- [ ] Google Search Console setup
- [ ] Content marketing (book summaries as SEO pages)

### More Languages
- [ ] German as first expansion (better LLM quality than Danish)
- [ ] EPUB import ("Your book, your way")

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
- [ ] German as expansion language (better LLM data = higher quality)

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
