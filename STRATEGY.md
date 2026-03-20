# Tinct — Strategy

**Last updated:** 2026-03-16

---

## Vision

Tinct is a reading platform that transforms how people engage with books. Not passive consumption — active wrestling. You read, you question, you debate, you annotate, you reflect. Every time you read, you learn more.

The platform is **content-agnostic**. It works with classics, the Bible, philosophy, poetry — anything worth reading deeply. The text is the starting point. The AI, the translations, the notes, and the reading modes are the tools that help you go deeper.

**One sentence:** Tinct makes deep reading accessible, interactive, and personal.

---

## Positioning

### What Tinct Is
- A purpose-built deep reading experience
- AI as a reading companion (not a summarizer)
- Multiple versions of the same text (original, modern, kids) in multiple languages
- A place to build understanding over time (highlights, notes, reflections)
- Free or near-free access to the world's greatest books

### What Tinct Is NOT
- A read-it-later app (not Readwise — we go deep, not wide)
- A generic ebook reader (not Kindle — we're interactive, not passive)
- A knowledge management system (not Notion — we serve the reading experience)
- A social platform (not Goodreads — this is personal)

### Nearest Comparison
**No Fear Shakespeare** — original text on the left, modern English on the right, paragraph-aligned. Tinct takes that concept and extends it to all classics, all languages, with AI chat and annotation. No Fear Shakespeare for everything, with an AI companion.

### Key Differentiator vs. Readwise Reader ($10/month)
Tinct is free for public domain books. You pay only for AI token usage, transparently priced at a modest markup over cost. The reading experience itself has no paywall.

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

## Open Questions (To Revisit)

1. **Bookstore feasibility:** What does it actually take? Publisher relationships, DRM, rights management, payment splits. Needs a dedicated strategy session.
2. **Book selection for Phase 1b:** Which 10-20 Western classics + Bible? Curate list.
3. **Deployment platform:** Vercel vs. Cloudflare Pages. Decide when deploying.
4. **Audio implementation:** Web Speech API vs. cloud TTS (ElevenLabs, etc.). Cost and quality tradeoffs.
5. **RSVP implementation:** Existing libraries vs. custom. UX for toggling between modes.
