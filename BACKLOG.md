# Tinct — Launch Backlog

**Last updated:** 2026-03-24

Gap analysis between the mission statement and what's built. Ordered by launch-critical first, then nice-to-have.

---

## What's Built

| Feature | Status |
|---|---|
| Multiple editions (original, modern, kids, verse) | Done (Odyssey: 6 editions, Ulysses: 5 editions) |
| Side-by-side reading (paragraph-aligned) | Done |
| AI chat (page-aware, reading-objective-aware) | Done |
| Cast (character tracker, spoiler-aware) | Done (Odyssey: 25 chars, Ulysses: 20 chars) |
| Highlights (5 colors, cross-edition navigation) | Done |
| Notes (freeform, from-chat, AI cleanup) | Done |
| Reading journal (end-of-book AI summary) | Done |
| Chapter reflection prompts | Done |
| Onboarding (reading angle) | Done |
| Dark mode | Done |
| Cross-device sync (Supabase) | Done |
| Auth (email + Google OAuth) | Done |
| Mobile responsive | Done |
| Deployed to tinct.ahvelplund.workers.dev | Done |

---

## Launch-Critical

### 1. Security Fixes (BLOCKING — do before any public launch)
- [ ] Rename `VITE_ANTHROPIC_API_KEY` → `ANTHROPIC_API_KEY` (VITE_ prefix exposes to client)
- [ ] Rotate Anthropic API key (treat current as compromised)
- [ ] Delete or gitignore `Passwords/Passwords` (plaintext Supabase DB password)
- [ ] Move `.env` to root `.gitignore`
- [ ] Add auth to `/api/chat` (currently anonymous users can run up bill)
- [ ] Fix rate limiting (in-memory resets on cold start = no rate limiting)
- [ ] Separate service role key from VITE_ vars

### 2. Pricing Infrastructure (replace current top-up model)
- [ ] Per-book Premium purchase ($3/book via Stripe Checkout)
- [ ] First-book-free logic (auto-grant Premium on first book added to library)
- [ ] Feature gating: free users see editions/highlights/sync, Premium features locked with upgrade prompt
- [ ] 200-message counter per book (decrement on each AI interaction)
- [ ] Message pack purchase ($3/100 messages, account-level balance)
- [ ] Usage UI: show remaining messages, prompt to top up when low
- [ ] Remove old top-up model ($2/$5/$10/$20 balance system)

### 3. Content — Minimum Library (at least 5-8 books at launch)
Currently: Odyssey (complete), Ulysses (complete), War and Peace (original only — no editions, no threads complete)

Books to add (all public domain, all need 5 editions + threads):
- [ ] War and Peace — complete remaining editions (modern-en, kids-en, modern-da, kids-da) + threads
- [ ] Dante — Inferno (or full Divine Comedy)
- [ ] Dostoevsky — Crime and Punishment or Brothers Karamazov
- [ ] Austen — Pride and Prejudice
- [ ] Plato — The Republic
- [ ] Shakespeare — Hamlet or Macbeth
- [ ] Bible — Genesis (or a larger selection)
- [ ] Brontë — Jane Eyre or Wuthering Heights

Each book requires: source text parsing, 4 edition generations (via CLI), threads data, book registry entry, visual QA. See Book Addition Checklist in CLAUDE.md.

### 4. Deploy to tinct.app
- [ ] DNS: point tinct.app to Cloudflare Workers (currently on workers.dev subdomain)
- [ ] SSL/TLS configured
- [ ] Verify production env vars (Supabase, Stripe, Anthropic)
- [ ] Test full user flow on production domain

### 5. Landing Page
- [ ] Marketing landing page at tinct.app (before the reader UI)
- [ ] Mission statement content adapted for web
- [ ] Feature showcase (screenshots/demo of editions, cast, AI chat)
- [ ] Pricing table (Free vs Premium)
- [ ] "Start reading" CTA → book store → onboarding
- [ ] SEO basics: meta tags, Open Graph, structured data

---

## Launch-Important (should have, but won't block launch)

### 6. Flashcards & Spaced Repetition
- [ ] Per-book flashcard generation (key characters, themes, vocabulary)
- [ ] AI-generated flashcards from highlights and notes
- [ ] Manual flashcard creation
- [ ] Spaced repetition scheduler (SM-2 or similar)
- [ ] Review UI (card flip, confidence rating)
- [ ] Gated behind Premium

### 7. Audiobook with Position Sync
- [ ] TTS generation per chapter per edition (or use browser TTS as MVP)
- [ ] Audio player UI (play/pause, scrub, speed control) — partially built
- [ ] Position sync: audio playback updates reading position and vice versa
- [ ] Paragraph-level sync markers
- [ ] Gated behind Premium

### 8. Offline Mode (PWA)
- [ ] Service Worker: cache app shell (HTML, CSS, JS, fonts)
- [ ] "Download for offline" button per book — caches all edition JSONs for that book
- [ ] Optional audio download — pre-cache audio files (warn about size: 50-200 MB/book)
- [ ] Download progress indicator + "Available offline" badge on book cards
- [ ] Offline-aware UI: chat tab shows "Offline — available when connected", hide sign-in
- [ ] Background sync: queue highlights/notes/position changes made offline, sync when reconnected
- [ ] Storage management UI: show cached books + size, ability to remove offline data
- [ ] `manifest.json` + install prompt ("Add to Home Screen") for mobile PWA experience

### 9. Android App (for e-readers)
- [ ] Capacitor or Android WebView wrapper around web app
- [ ] E-ink optimizations (no animations, high contrast, physical button support)
- [ ] Play Store listing
- [ ] Or: PWA with install prompt (lighter lift, works on Boox etc.)

---

## Post-Launch

### 10. Content Expansion
- [ ] Expand to 20-50 public domain books
- [ ] Copyrighted book strategy (publisher partnerships or user EPUB upload)
- [ ] More languages beyond English and Danish

### 11. B2B / Education
- [ ] Teacher landing page ("Assign The Odyssey on Tinct")
- [ ] Classroom pricing (per-student-per-book)
- [ ] Bulk book activation
- [ ] Reading progress dashboard for teachers

### 12. Social & Community
- [ ] Book clubs (shared reading, group highlights)
- [ ] Export highlights/notes as Markdown or PDF
- [ ] Reading statistics (books read, time spent)

### 13. Additional Reading Modes
- [ ] Bionic reading (bold first syllable)
- [ ] RSVP (rapid serial visual presentation)
- [ ] 3+ translation comparison mode

---

## Estimated Launch Effort

| Category | Items | Effort estimate |
|---|---|---|
| Security fixes | 7 items | 1-2 days |
| Pricing infrastructure | 7 items | 3-5 days |
| Content (5-6 more books) | ~6 books × editions + threads | 2-3 days per book (CLI generation) |
| Deploy to tinct.app | 4 items | Half day |
| Landing page | 6 items | 1-2 days |
| **Total to launch** | | **~3-4 weeks** |

Flashcards, audiobook, and Android app are launch-important but can follow in the first weeks after launch without embarrassment.
