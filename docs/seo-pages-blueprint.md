# SEO page blueprint — adding a new book

A reusable recipe for the per-book SEO page set first built for The Odyssey.

## What you ship per book

Five static HTML page types under `app/public/read/{bookId}/`:

| URL                                 | File                  | Purpose                                                                 |
|-------------------------------------|-----------------------|-------------------------------------------------------------------------|
| `/read/{bookId}/summary`            | `summary.html`        | Hub page. Story recap, click-through tour of all chapters, themes, key figures, "Go deeper" cards. Owns `{book} summary`, `what is the {book}` queries. |
| `/read/{bookId}/themes`             | `themes.html`         | Long-form analysis of the book's central themes (~5 sections). Owns `{book} themes`, `{book} analysis`, `{theme} in {book}`. |
| `/read/{bookId}/chapters`           | `chapters.html`       | Chapter index — every chapter title links to its dedicated page below. Owns `{book} chapter summary`, `{book} book by book`. |
| `/read/{bookId}/cast`               | `cast.html`           | All characters with anchored cards (`#char-{slug}`). Owns `{book} characters`, individual character names. |
| `/read/{bookId}/chapter-N`          | `chapter-{N}.html`    | One per chapter. Long summary + "Appears" chips linking to cast anchors + theme chips linking to themes-page anchors + prev/next nav. Owns `{book} chapter N summary`. |

These are static HTML. They sit inside the SPA's `public/` so Vite/Cloudflare serve them without execution. Clean URLs (no `.html`) are produced by the worker rewrite at `app/src/worker.ts`.

The reader itself remains the React SPA at `/read/{bookId}` — these pages are *funnels into* it, not replacements for it.

## Required source content per book

Most of this already exists in `app/public/data/onboarding/{bookId}.json` and `app/public/data/editions/{bookId}-*.json`. You also need to write some new prose specifically for the SEO pages.

| Block                    | Source                                                  | Used by                                              |
|--------------------------|----------------------------------------------------------|------------------------------------------------------|
| Title, author, era       | `bookRegistry.ts` + `{bookId}.json`                      | All 5 page types                                     |
| About / story recap      | `{bookId}.json` `about` field                            | Summary page                                         |
| Why it matters (3 items) | `{bookId}.json` `whyItMatters`                           | Themes preview on summary (compact form)             |
| Cast (6 figures)         | `{bookId}.json` `cast`                                   | "Key figures" section on summary                     |
| Full cast                | `{bookId}-threads.json` (extended for SEO)               | `cast.html`                                          |
| Glance lines (per chap)  | NEW: write one connective sentence per chapter           | Tour rail on summary, glance rail on chapter pages   |
| Hook (per chap)          | NEW: write one italicized teaser per chapter             | Top of each chapter page                             |
| Long summary (per chap)  | NEW: 3–4 paragraph chapter summary, ~290 words (see length rule) | Body of each chapter page                            |
| Themes (5 essays)        | NEW: write 3–5 paragraph essay per theme                 | `themes.html`                                        |
| Appears + Themes per chap | NEW: list of character names + theme slugs per chapter  | "Appears" / "Themes" chips on chapter pages          |

Total NEW writing for a 24-chapter book: ~24 hooks, ~24 long summaries, ~24 connective glance lines, ~5 theme essays. Allow a writing session per book.

## Architectural pieces (already in place)

These exist for any book; you only need to register the new book.

1. **Worker route extension** — `app/src/worker.ts` already matches `/read/{bookId}/(summary|chapters|cast|themes|chapter-\d+)` for clean URLs. No worker change required to add a new book to that route.

2. **BOOK_META map** — `app/src/worker.ts` has a `BOOK_META: Record<string, {title, description, image?}>` constant. Add an entry per book to give the SPA shell at `/read/{bookId}` book-specific meta tags for crawlers (titles like "Read The Odyssey Online — Modern Translation, AI Companion, Audiobook").

3. **App.tsx deep-link** — the `?chapter=N&edition=X` URL-param consumer is book-agnostic. No change.

4. **Vite dev middleware** — `app/vite.config.ts` mirrors the worker rewrite for local dev. Already book-agnostic.

5. **Sitemap** — `app/public/sitemap.xml` lists URLs explicitly. Append the new book's 28 URLs.

## Step-by-step recipe

1. **Confirm the source data exists.**
   - `bookRegistry.ts` has the book registered.
   - `app/public/data/onboarding/{bookId}.json` has `about`, `whyItMatters`, `cast`.
   - `app/public/data/editions/{bookId}-modern-en.json` has the chapter list.

2. **Write the per-chapter content.** Create a Python data file at `app/scripts/seo/{bookId}-chapters.py` modeled on the Odyssey generator. The shape is:

   ```python
   GLANCE = ["one connective sentence per chapter", ...]      # len = N
   CHAPTERS = [
     {"n": 1, "title": "...", "hook": "...", "summary": ["para 1", "para 2", "para 3"],
      "appears": ["Character A", "Character B"], "themes": [("slug", "Label")]},
     ...
   ]
   ```

   Keep the connective tone — each card should pick up where the last left off so click-through reads as one story. The existing `app/public/read/odyssey/chapter-*.html` are the reference for length and density.

   **Length rule (Anders, 2026-05-08):** chapter summaries should run roughly **30% longer than the brief blurb on `chapters.html`**, never more. The Odyssey calibration is ~225 words → ~290 words target. Long enough to add one or two specifics that the index couldn't carry (a named drug, a small but vivid detail, the contrast that makes the chapter mean something), short enough that scrolling through all 24 still feels like a continuous storyline rather than a textbook.

3. **Write the themes essay.** A new `themes.html` mirroring the Odyssey structure: 5 themed sections, each ~3–5 paragraphs, with "where to follow it" links to the chapter pages where the theme manifests.

4. **Write the cast page.** Mirror `cast.html`. Group by mortal/god/creature. Each card has `id="char-{slug}"` so chapter-page chips can deep-link. Spoiler-aware language.

5. **Write the summary page.** Hub page with the tour carousel, themes preview, key figures. Mirror `summary.html` structure exactly — same CSS classes, same JS for the carousel. Tour cards link to `/read/{bookId}?chapter=N&edition=modern-en` to deep-link the SPA reader to that chapter in modern English, bypassing onboarding.

6. **Write the chapters index.** Mirror `chapters.html`. List all chapters in part-headings; each chapter title links to the dedicated `chapter-N.html` page.

7. **Generate the chapter pages.** Run the Python generator from step 2. Outputs N HTML files into `app/public/read/{bookId}/`.

8. **Register in `BOOK_META`.** In `app/src/worker.ts`:

   ```typescript
   const BOOK_META: Record<string, { title: string; description: string; image?: string }> = {
     odyssey: { ... existing ... },
     {bookId}: {
       title: 'Read {Book} Online — ... | Tinct',
       description: 'Read {Book} free online. ...',
     },
   }
   ```

9. **Add sitemap entries.** Append 4 + N URLs to `app/public/sitemap.xml`.

10. **QA pass.** See checklist below.

11. **Deploy.** Standard `npm run deploy`. The worker route + dev middleware already handle the new book's URLs without further changes.

## QA checklist (before merging a new book's SEO set)

- [ ] All 4 + N URLs return 200 in dev (`/read/{bookId}/summary`, `/themes`, `/chapters`, `/cast`, `/chapter-1`...`/chapter-N`).
- [ ] Tour carousel on summary page advances through all N cards. Counter and progress bar update. Arrow keys work.
- [ ] Tour card "Read Chapter N in the reader →" deep-links to `/read/{bookId}?chapter=N&edition=modern-en` and the SPA opens at chapter N without showing book onboarding.
- [ ] Chapter page "Read the full book for free →" (top CTA) links to plain `/read/{bookId}` — should fire onboarding for new readers.
- [ ] Chapter page "Read Chapter N in the reader →" (end CTA) deep-links to that chapter.
- [ ] Cast chips on chapter pages anchor correctly to `/read/{bookId}/cast#char-{slug}`. Each character card has the matching `id`.
- [ ] Theme chips on chapter pages anchor to `/read/{bookId}/themes#{slug}`. Each theme h2 has the matching `id`.
- [ ] No Roman numerals anywhere. Use Arabic ("Chapter 5", not "Book V").
- [ ] No "blue link" pattern — borders/underlines only where the design system allows.
- [ ] Section order on summary: Story → Tour → Key themes → Key figures → Go deeper. (Per Anders, 2026-05-05.)
- [ ] Top CTA text is "Read the full book for free →" everywhere except the chapter-page end CTA which is chapter-specific.
- [ ] Build passes with `git stash && npm run build && git stash pop`. Stale dist is the failure mode — verify `dist/assets/index-*.js` timestamp.

## Architecture decisions worth remembering

These were settled during the Odyssey build (2026-05-05):

- **Static HTML, not React.** Each page is a single self-contained file with inlined CSS — Google can crawl + render it fast, and there's no SPA boot cost on first paint. The cost is duplicated CSS across pages; accepted tradeoff.
- **Clean URLs, not `.html` extensions.** Worker rewrites `/read/{bookId}/{type}` to `/read/{bookId}/{type}.html` before falling through to the SPA. Vite dev middleware mirrors this so local dev matches production.
- **Reader meta-tag injection at `/read/{bookId}`.** The SPA shell at `app.html` has a generic title; the worker fetches `app.html`, replaces the `<title>` and adds `<meta name="description">` + OG tags from the `BOOK_META` map, and serves the rewritten HTML. Crawlers get book-specific meta; users still get the SPA.
- **Deep-link query params bypass onboarding.** `?chapter=N` and `?edition=X` on `/read/{bookId}` mark the book as onboarded, set chapter and edition state, then strip the params from the URL. Used by tour cards on summary and end CTAs on chapter pages — chapter-specific entry points.
- **Top CTA stays generic.** Anders, 2026-05-05: "any link that's not specific to a chapter, it should start with the book onboarding (unless already onboarded)." Top CTAs go to plain `/read/{bookId}`.
- **"Chapter" terminology, not "Book".** Mixed usage was confusing. We standardised on Chapter 1..N everywhere except in literary citations (`Iliad`, `Odyssey` themselves remain books).
- **Five themes per book is the working number.** It fits a 2-column grid on desktop with one item alone in row 3, and matches the cognitive load of an essay-length analysis page. Adjust per book if the literature has a different natural shape.

## Reference: where the Odyssey artifacts live

- Static HTML: `app/public/read/odyssey/{summary,themes,chapters,cast,chapter-1..24}.html`
- Source data (existing onboarding + editions): `app/public/data/onboarding/odyssey.json`, `app/public/data/editions/odyssey-*.json`
- Sitemap: `app/public/sitemap.xml`
- Worker meta + route: `app/src/worker.ts` (search for `BOOK_META` and `seoMatch`)
- Deep-link consumer: `app/src/App.tsx` (search for `deepLinkConsumedRef`)
- Dev middleware: `app/vite.config.ts` (search for `seoMatch`)
- Deploy script: `app/scripts/seo-deploy.sh`
