# Tinct — Backlog

**Last updated:** 2026-04-05

---

## What's Built

| Feature | Status |
|---|---|
| Multiple editions (original, modern EN, modern DA) | Done (11 books) |
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
| Stripe billing (subscription $5/mo, chat packs $3/100, $5/200) | Done |
| 30-day free trial + trial expiry banner + email reminder (Brevo) | Done |
| Subscription management (cancel, resubscribe, message tracking) | Done |
| Deployed to tinct.app | Done |

## Current Sprint

### Offline Mode (IN PROGRESS)
- [ ] Service worker (cache-first for editions + audio)
- [ ] Download manager hook (useOffline)
- [ ] Download UI (per-book, per-chapter for large books)
- [ ] Offline banner ("Chat unavailable offline")
- [ ] Audio playback from cache when offline
- [ ] Cast available offline (already small static JSON)
- [ ] Position sync on reconnect (existing Supabase sync handles this)

---

## Up Next

### Android App
- [ ] Capacitor or TWA (Trusted Web Activity) wrapper
- [ ] E-ink optimizations (no animations, high contrast)
- [ ] Play Store listing
- [ ] Physical button support for page turning
- [ ] Or: PWA install prompt (lighter lift, works on Boox etc.)

### Landing Page
- [ ] Marketing landing page at tinct.app (before the reader UI)
- [ ] Feature showcase (screenshots of editions, cast, AI chat, audiobook)
- [ ] Pricing table (Free vs Premium)
- [ ] "Start reading" CTA → book store
- [ ] SEO: meta tags, Open Graph, structured data

### Content Expansion
- [ ] Expand to 20+ public domain books
- [ ] Visual QA for all books (non-negotiable)
- [ ] More languages (German as first expansion — better LLM quality than Danish)
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
