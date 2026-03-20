# Tinct — Backlog

**Last updated:** 2026-03-17

Items are grouped by phase and roughly priority-ordered within each group.

---

## Phase 1a — The Odyssey (Target: mid-April 2026)

### Infrastructure
- [x] Git init repository
- [x] Generalize data model: Book → chapters → versions (not hardcoded to Odyssey)
- [x] Multi-version architecture: original, modern EN, kids EN, modern DA, kids DA per book
- [x] Language switcher (English / Danish)
- [x] Version switcher (Original / Modern / Kids)
- [x] Static data storage for pre-computed versions
- [ ] Deploy to tinct.app

### Pre-computation (The Odyssey)
- [x] Download Butler (prose) and Pope (verse) originals
- [x] Generate modern English translation (chapter by chapter via Claude)
- [x] Generate kids English version
- [x] Generate modern Danish translation
- [x] Generate kids Danish version
- [x] Visual QA: screenshot every chapter × every version, review and fix
- [x] Fix generation failures (Ch4 all editions, Danish editions 50-64% missing → all fixed)
- [x] Fix Ch11 title parsing artifact (".88" removed)

### Reader
- [x] Split pane: original left, chosen version right, paragraph-aligned
- [x] Paragraph-level alignment between versions (mapping paragraphs across translations)
- [x] Clean typography
- [x] Chapter navigation (dropdown, arrows)
- [x] "Reflect on this chapter" inline button at end of chapter text
- [x] Scroll position persistence (localStorage)
- [x] Reading progress tracking per book (hook + header progress bar)
- [x] Split-pane pagination (page arrows, keyboard nav, click zones — matches single reader)
- [x] Prose newline normalization (Butler text no longer wraps word-by-word in split view)
- [x] Wider reading area (680px → 780px) with responsive chapter titles

### AI Chat
- [x] Context-aware: knows current book, chapter, translation
- [x] Auto-explain on highlight: when user highlights text, chat explains it automatically
- [x] Chapter reflection prompt support
- [x] Chat panel easy to show/hide
- [x] "Copy to notes" button on every assistant message
- [x] Page-aware: system prompt includes visible text on current page
- [x] Reading lens: user's reading objective woven into system prompt
- [x] Markdown rendering in chat (headings, bold, italic, bullet/numbered lists)
- [x] Warm welcome with chapter-specific greeting and suggestion chips
- [x] Proactive AI insights on page turns (rate-limited, probability-gated)

### Notes & Annotations
- [x] Text highlighting with color picker (5 colors)
- [x] Annotation: attach a note to a highlight
- [x] Notes panel (tab in right side panel)
- [x] View all highlights + notes for current chapter
- [x] Freeform note-taking (not tied to highlights)
- [x] AI note cleanup: light mode (fix writing, remove redundancy)
- [x] AI note cleanup: aggressive mode (synthesis to 30-50% length)
- [x] End-of-book summary generated from accumulated highlights/notes
- [x] Markdown rendering in notes (headings, bold, italic, lists)
- [x] Highlight offset fix (text matching now works with embedded newlines)

### Onboarding
- [x] Welcome overlay explaining features + reading angle input
- [x] Reading objective persists and feeds into AI system prompt
- [x] Objective editable post-onboarding via chat welcome

### Persistence (Phase 1a = localStorage)
- [x] Save highlights to localStorage
- [x] Save notes to localStorage
- [x] Save reading position to localStorage
- [x] Save preferences (language, version, dark mode) to localStorage
- [x] Code all persistence through an abstraction layer (easy swap to Supabase later)

### QA
- [x] Playwright visual QA setup (246 tests: 6 editions × 24 ch + 4 split combos × 24 ch + specials)
- [x] Page-by-page screenshot review for every version of The Odyssey (all pass)
- [x] Split-pane alignment verification (4 combos × 24 chapters = 96 screenshots, all pass)
- [x] Dark mode verification (single + split)
- [x] Onboarding overlay visual QA
- [x] Chat welcome with suggestion chips visual QA

### Security Audit Fixes (2026-03-20) — DO BEFORE DEPLOY

**Critical:**
- [ ] **Rename `VITE_ANTHROPIC_API_KEY` → `ANTHROPIC_API_KEY`** — `VITE_` prefix exposes to client bundle. One wrong import = key shipped to every browser.
- [ ] **Rotate Anthropic API key** — treat current key as compromised.
- [ ] **Delete or gitignore `Passwords/Passwords`** — contains Supabase DB password in plaintext, NOT gitignored.
- [ ] **Move `.env` to root `.gitignore`** — currently only in inner `.gitignore`.

**High:**
- [ ] **Add auth to `/api/chat`** — currently anonymous users can hit it and run up Anthropic bill.
- [ ] **Fix rate limiting** — in-memory rate limit resets on every Vercel cold start (effectively none). Use Redis or Supabase.
- [ ] **Separate service role key** — Supabase service role key (bypasses RLS) mixed with `VITE_` vars in same `.env`.

**Medium:**
- [ ] Add Content Security Policy headers
- [ ] Fix open redirect in Stripe checkout URLs
- [ ] Reduce error message verbosity (leaks internal details)

Full report: `SECURITY-AUDIT.md`

### Remaining for Phase 1a completion
1. **Deploy to tinct.app** — Vercel project setup, env vars for API key, push
2. **Polish pass** — test the full reading experience end-to-end as a real user:
   - Chapter titles: long titles on Butler could be shortened (e.g. "Book I — The Gods in Council")
   - Selection popup clipping: verify on all page positions
   - Chat/Notes tab visibility after extended use
   - Test on a second browser / incognito to verify fresh-user flow

---

## Phase 1b — Multi-Book + Auth (Target: May-June 2026)

### Content
- [ ] Curate list of 10-20 Western classics + Bible
- [ ] Download source texts from PG mirrors / Internet Archive
- [ ] Build chapter parsers per book (or generalize the parser)
- [ ] Pre-compute all versions for each book (modern EN, kids EN, modern DA, kids DA)
- [ ] Visual QA for every book (page-by-page screenshots)

### Library UI
- [ ] Book shelf / library view (home screen)
- [ ] Book detail page (description, available versions, start reading)
- [ ] Continue reading (jump back to last position)
- [ ] Search across library

### Auth & Database
- [ ] Supabase project setup
- [ ] Auth: email/password + magic link
- [ ] Migrate persistence layer from localStorage to Supabase
- [ ] Sync: highlights, notes, reading progress, preferences
- [ ] Cross-device sync

### Payments
- [ ] Stripe integration
- [ ] Token usage tracking per user
- [ ] Transparent pricing page (show cost breakdown)
- [ ] Metered billing: charge based on AI token consumption + modest markup
- [ ] Free tier: reading without AI chat costs nothing
- [ ] Usage dashboard: show users their AI spend

---

## Phase 2 — Content Expansion & Mobile (Post-summer 2026)

### Content
- [ ] Expand to 50-100+ public domain books
- [ ] Bookstore exploration: what does it take? (dedicated strategy session)
  - Publisher relationships
  - DRM requirements
  - Rights management
  - Payment splits
  - EPUB/format support

### User Uploads
- [ ] Markdown file import
- [ ] PDF text extraction (not rendering)
- [ ] Chapter/heading detection from uploaded files
- [ ] AI chat integration with user-uploaded content

### Mobile
- [ ] Responsive design (already coded mobile-ready)
- [ ] Four swipeable views: Text, Split Pane, Chat, Notes
- [ ] Touch-friendly highlighting
- [ ] Mobile-optimized typography
- [ ] Seamless desktop ↔ mobile experience (sync via Supabase)

### Reading Modes
- [ ] RSVP (Rapid Serial Visual Presentation) — one word at a time with emphasis
- [ ] Audio: text-to-speech with text/audio position sync
- [ ] Seamless toggle between text and audio (continue where you left off)

### Reading Journal
- [ ] Cross-book reading journal
- [ ] End-of-book summaries collected across all books read
- [ ] Reading statistics (books read, time spent, highlights made)

---

## Phase 3 — Hardware (Long-term, Parked)

- [ ] Research e-reader hardware market
- [ ] Voice interaction design (talk to your book)
- [ ] Offline-first architecture with sync
- [ ] E-ink display optimization
- [ ] Hardware partnerships or custom manufacturing

**Not actionable until software product is validated.**

---

## Ideas Parking Lot

Items captured but not yet prioritized or committed:

- Additional languages beyond English and Danish
- Community features (shared annotations, book clubs)
- Reading challenges / gamification
- Integration with external note-taking tools (Obsidian, Notion)
- Spaced repetition for key passages
- Author/character bios and relationship maps
- Timeline visualizations (especially for Bible, historical texts)
- Comparison mode: read same passage across 3+ translations
- Export highlights/notes as Markdown or PDF
