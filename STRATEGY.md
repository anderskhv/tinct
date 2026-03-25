# Tinct — Strategy

**Last updated:** 2026-03-16

---

## Vision

Tinct is the reading platform for people who take books seriously. You already bought the book — Tinct gives you every way to experience it: read, listen, translate, annotate, discuss, reflect. One book, every format, every language, every device.

The platform is **content-agnostic**. It works with classics, the Bible, philosophy, contemporary fiction — anything worth reading deeply. A massive free library of public domain masterworks is the front door. Any EPUB you own is welcome.

**One sentence:** Your book, your way — read, listen, translate, and understand any book more deeply.

**Root mission connection:** Tinct serves Anders's core mission of spreading optimism about humanity by making the Western canon — the great works that shaped civilization — accessible, engaging, and alive for modern readers. The platform embodies the Deutsch principle that knowledge should be open and growing, not locked behind barriers.

---

## Positioning

### What Tinct Is
- The best way to read any book — read, listen, translate, annotate, discuss
- A massive free library of public domain classics (70,000+ books, zero cost)
- AI-powered book enhancement: editions, audiobook, character tracking, chat companion
- A place to build understanding over time (highlights, notes, reflections, reading journal)
- Open to any EPUB you own — "your book, your way"

### What Tinct Is NOT
- An ebook store (not Kindle — we don't sell books, we make them better)
- A read-it-later app (not Readwise — we go deep, not wide)
- A knowledge management system (not Notion — we serve the reading experience)
- A social platform (not Goodreads — this is personal)

### Nearest Comparison
**No Fear Shakespeare meets Audible meets Calibre.** Original text alongside modern/kids translations. AI audiobook generation. Works with books you already own. No Fear Shakespeare for everything, with an AI companion and an audiobook in every book.

### Key Differentiators
- **vs. Kindle:** Tinct enhances books — editions, translations, audiobook, AI companion. Kindle just displays them.
- **vs. Audible ($15-30/book):** Tinct generates audiobooks for $5-10 from any EPUB you own.
- **vs. Readwise ($10/month):** Tinct is free for public domain. Pay only per-book for AI enhancement.
- **vs. Calibre:** Calibre converts and manages. Tinct *understands* — editions, character tracking, chat, audiobook.

---

## Target Users

### Primary (Phase 1): Anders — book club reader
Reading The Odyssey with a book club. Wants to understand deeply, toggle between translations, take notes, reflect chapter by chapter. This is the design target.

### Secondary: People who want to read classics but find them intimidating
The Odyssey, the Bible, Dante, Dostoevsky — they want to read these but bounce off the archaic language. Modern translations, kids versions, and an AI companion that explains as you go lower the barrier.

### Tertiary: Serious readers who want more from their reading
Already read classics. Want to go deeper — annotate, debate, compare translations, build a reading journal over time.

---

## Product Architecture

### Reading Experience (Core)

**Text display:**
- Clean, beautiful typography (warm literary aesthetic, Poetry Editor lineage)
- Single-text default view
- Split pane: original left, chosen version right, paragraph-aligned (desktop)
- Chapter navigation with progress tracking

**Versions per book (pre-computed via Claude):**
- Original (public domain source text)
- Modern English translation
- Kids version (simplified, accessible)
- Modern Danish translation
- Kids Danish version
- More languages over time

**Reading modes (phased):**
- Normal text reading (Phase 1)
- Split pane with paragraph alignment (Phase 1)
- RSVP — Rapid Serial Visual Presentation (backlog)
- Audio — text read aloud with seamless text/audio toggle (backlog)

**Dark/light mode.** Desktop-first, coded mobile-ready from day one.

### AI Chat (Side Panel)

The AI is a **reading companion**, not a summarizer. It:
- Automatically explains highlighted text (assumes the user wants to understand it)
- Answers questions about the text, characters, themes, historical context
- Offers chapter reflection when the user turns a chapter (subtle inline button at chapter end + small prompt in chat — never a modal, never pushy)
- Is aware of which book, chapter, translation, and passage the user is reading
- Chat panel is always easy to hide/dismiss

### Notes & Annotation System

**Highlighting:**
- Select text → choose from 4-5 colors
- Highlighted text auto-triggers chat explanation
- All highlights visible in a notes panel

**Notes panel (right side, alongside or replacing chat):**
- View all highlights and annotations for the current chapter
- Write freeform notes
- "Copy to notes" button in chat — pushes any chat response into your notes
- AI cleanup: light (remove redundancies, improve clarity) or aggressive (restructure, condense)
- End-of-book summary generated from accumulated highlights and notes

**Navigation between panels:**
- Desktop: chat and notes as tabs or sections in the right panel
- Mobile (future): swipe between text, chat, notes, and split-pane as four views

### Content Library

**Phase 1:** The Odyssey (all versions) + 10-20 curated Western classics + the Bible
**Phase 2:** Expanded public domain library sourced from Project Gutenberg mirrors and Internet Archive
**Phase 2+:** Bookstore for copyrighted books (explore — not committed)

**User uploads (backlog):** Markdown and PDF import. Text extraction from PDFs (not PDF rendering). Chapter/heading detection. Full AI chat integration with uploaded content.

---

## Phases

### Phase 1a — The Odyssey Experience (Target: mid-April 2026)

**Goal:** Anders can read The Odyssey beautifully for his book club.

Deliverables:
- [ ] Reader with clean typography, chapter navigation
- [ ] Split pane with paragraph-level alignment (original + chosen version)
- [ ] Pre-computed versions: modern English, kids English, modern Danish, kids Danish
- [ ] Translation/version switcher (language + style)
- [ ] AI chat side panel (context-aware, highlight-to-explain)
- [ ] Highlighting with 4-5 colors
- [ ] Notes panel (freeform notes, copy-from-chat, view highlights)
- [ ] AI note cleanup (light/aggressive)
- [ ] Chapter reflection (inline button + chat prompt)
- [ ] Dark/light mode
- [ ] localStorage for all user data (highlights, notes, reading position)
- [ ] Deploy to tinct.app
- [ ] Visual QA: page-by-page screenshot review of every chapter in every version

**Not in 1a:** Auth, payments, mobile, audio, RSVP, other books, user uploads.

**Code with in mind:** Supabase migration, Stripe integration, mobile responsive, multi-book architecture.

### Phase 1b — Multi-Book + Auth (Target: May-June 2026)

**Goal:** 10-20 books available, user accounts, usage tracking.

Deliverables:
- [ ] Supabase: auth, user profiles, highlights/notes/progress sync
- [ ] 10-20 curated public domain books (all with pre-computed versions)
- [ ] Book library / shelf UI
- [ ] Stripe integration for token-based AI usage billing
- [ ] Transparent pricing (cost-plus markup, clearly communicated)
- [ ] Visual QA for every book (page-by-page screenshot review)
- [ ] Cross-device sync (reading position, highlights, notes)

### Phase 2 — Content Expansion (Post-summer 2026)

- Expanded public domain library (50-100+ books)
- User uploads (Markdown, PDF with text extraction)
- Bookstore exploration (publisher relationships, DRM, rights — requires dedicated strategy session)
- Mobile experience (swipe between text/chat/notes/split-pane)
- RSVP reading mode
- Audio (text-to-speech with text/audio toggle)
- End-of-book summary from accumulated notes
- Reading journal across books

### Phase 3 — Hardware (Long-term vision)

- Custom e-reader with voice interaction
- Kindle-quality screen + AI conversation
- Offline reading with sync
- **Parked until software product is validated.**

---

## Revenue Model

### Phase 1a: Free
No payments. No auth. Just the reading experience.

### Phase 1b: Token-based AI pricing
- Reading experience: **free** for all public domain books
- AI chat usage: **transparent cost-plus markup** on token consumption
- No subscription wall. No $10/month barrier.
- Users see what they're spending. We're honest about costs.
- Goal: sustainability, not profit maximization

### Phase 2+ (if bookstore):
- Modest margin on book sales (not competing on price, not gouging)
- Same token markup on AI features
- Explore but not committed

---

## Content Sourcing — Legal & Practical

### Project Gutenberg
- **Legal:** All PG books are public domain. Downloading, storing, redistributing, and even selling them is legal.
- **Practical:** PG has no public API. Scraping the main site gets your IP blocked. Must use mirrors or offline catalogs for bulk access.
- **Approach:** Use Gutendex API (gutendex.com) for metadata. Download texts from PG mirrors. Store locally. One-time operation per book.
- **No rate limit concerns** when using mirrors and offline catalogs.

### Internet Archive
- Also hosts public domain texts. Alternative/supplement to PG.
- Different terms — review before bulk access.

### Pre-computation Pipeline
1. Download original text from PG mirror
2. Parse into chapters (book-specific parser, like the existing Odyssey parsers)
3. Generate versions via Claude: modern EN, kids EN, modern DA, kids DA
4. Store all versions as static data
5. Visual QA: screenshot every page of every version, review for formatting issues
6. Estimated cost: **$200-350 for 20 books** (all versions, all languages)

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** CSS (custom, warm literary aesthetic)
- **AI:** Claude API (Sonnet for chat, Sonnet/Haiku for pre-computation)
- **Auth (Phase 1b):** Supabase Auth
- **Database (Phase 1b):** Supabase (highlights, notes, reading progress, user profiles)
- **Payments (Phase 1b):** Stripe (token-based metered billing)
- **Deployment:** tinct.app (Vercel or Cloudflare Pages — TBD)
- **QA:** Playwright for visual regression testing

---

## Design Principles

1. **Reading comes first.** The text is the hero. Everything else is in service of understanding.
2. **Available but not pushy.** AI chat, reflection prompts, annotations — all there when you want them, invisible when you don't.
3. **Beautiful typography.** If the reading experience isn't beautiful, nothing else matters.
4. **Warm, literary aesthetic.** Inherited from Poetry Editor. Not clinical, not techy.
5. **Desktop-first, mobile-ready.** Code responsively from day one, ship mobile experience in Phase 2.
6. **Free at the point of reading.** Never charge for access to public domain text.

---

## Quality Assurance

For every book added to the library:
1. Pre-compute all versions (modern EN, kids EN, modern DA, kids DA)
2. Load each version in the reader
3. Screenshot every chapter, every version
4. Review for: heading formatting, paragraph breaks, encoding issues, translation quality, split-pane alignment
5. Fix issues before publishing

This is non-negotiable. No book ships without visual QA.

---

## Mobile Vision (Backlog — Not Phase 1)

On mobile, the experience is four swipeable views:
1. **Text** (single version, full screen)
2. **Split pane** (original + version, stacked vertically or side by side)
3. **Chat** (AI companion, full screen)
4. **Notes** (highlights, annotations, freeform notes)

Swipe left/right to move between them. Reading progress syncs across all views. Seamless toggle between text and audio when audio is available.

---

## BYOB Model — "Your Book, Your Way" (2026-03-24 Strategy Session)

A potential pivot/expansion from "curated classics platform" to "the reading platform for any book."

### The Three-Tier Library

**Tier 1 — Free Library (public domain)**
- Project Gutenberg, Standard Ebooks, Internet Archive
- 70,000+ books. One-click add to library. Zero cost.
- Enhancement (AI editions, audiobook, threads) available for a fee.

**Tier 2 — Buy DRM-Free (legal, frictionless)**
- Search finds DRM-free editions available from Google Play, Smashwords/D2D, publisher-direct stores (Tor, etc.)
- "Available DRM-free from [store] for $X" → user buys → imports EPUB → Tinct enhances
- Affiliate revenue (5-7%) on referral

**Tier 3 — DRM'd Books (user's responsibility)**
- Affiliate links to Kindle/Kobo/Apple Books (5-7% commission)
- Tinct accepts any EPUB file. No questions asked.
- Tinct does NOT strip DRM, does NOT encourage circumvention, DOES link to Calibre as a general ebook management tool

### Revenue: Enhancement Layer (Per-Book)

Users pay for AI processing, not for content access:

| Enhancement | Cost to us | Charge to user |
|---|---|---|
| 4 AI editions (modern/kids × EN/DA) | ~$3-8 | $5-10 |
| AI audiobook (TTS generation) | ~$2-7 | $5-10 |
| Character tracker / threads | ~$0.50-1 | Included |
| AI chat | ~$0.01-0.03/msg | Included in tier or per-message |

Per-book "full enhancement" bundle: $8-15 to user, $5-10 cost. 30-60% gross margin.

### Audiobook Generation

- OpenAI TTS or Google WaveNet. Near-human quality. ~$2-7 per book.
- Generation takes 5-9 hours (background processing). Chapter-by-chapter delivery — Ch1 ready in ~30 min, rest follows.
- vs. Audible at $15-30/book — significant price advantage.

### Why This Works

1. **Solves the licensing problem entirely.** User owns the book. Tinct is a tool, not a distributor.
2. **Infinite catalog instantly.** Every EPUB ever published is compatible.
3. **Moat through accumulated data.** Editions, audiobook, notes, reading history — all private to the user, all sticky.
4. **Legal position is strong.** Same category as Calibre, Google Translate, a photo editor. Processing a file the user owns.

### Why This Might Not Work

1. **EPUB import friction.** Getting an EPUB file is not one-click for most people.
2. **Front-loaded cost.** User pays $8-15 before experiencing the value. Mitigation: "first chapter free."
3. **AI edition quality varies.** Pre-computed Odyssey editions are QA'd. Random user uploads won't be.
4. **Market size uncertainty.** Intersection of "reads ebooks" + "wants enhancement" + "can get EPUB" is unclear.

### Positioning Shift

From: "No Fear Shakespeare for everything, with an AI companion" (curated, controlled)
To: "The reading platform that works with books you already own" (open, user-driven)

These are not mutually exclusive. The curated public domain library IS Tier 1. BYOB is Tier 2-3 on top.

### Open Questions

1. How good is AI-generated audiobook quality for a full book? Need to prototype one.
2. What's the EPUB parsing reliability across sources? How messy is the real world?
3. Can we build a good search that finds EPUBs across free + DRM-free sources?
4. Pricing: per-book enhancement vs. subscription vs. hybrid?
5. RSVP should probably be dropped from backlog (research shows it doesn't work — no retention, comprehension drops at speed).

---

## Open Questions (To Revisit)

1. **BYOB feasibility:** Prototype the full flow — EPUB upload → parse → generate one edition + audiobook chapter. Test quality and timing.
2. **Book selection for Phase 1b:** Which 10-20 Western classics + Bible? Curate list.
3. **Deployment platform:** Cloudflare Workers (current).
4. **Audio implementation:** OpenAI TTS vs. Google WaveNet. Cost/quality tradeoff. Need prototype.
5. **Search/discovery:** How to build a meta-search across PG, Standard Ebooks, DRM-free stores.
