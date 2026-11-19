# Coding task: SEO fixes and modern-English chapter pages for every book

**Assigned by Anders, 16 Nov 2026.** This is an explicit coding and release task. Follow `AGENTS.md` and `books/BOOK-TASK-WORKFLOW.md` (release rules, serialized release ownership, deploy-after-verify).

## Decisions already made by Anders
- **Publish the modern English openly** as crawlable HTML, accepting that others can copy it.
- **Build the chapter pages for every book.** Every page is reachable by readers. **Only wave 1 is indexed by search engines**; later waves are switched on by config after Search Console results.
- **The edition note uses exact wording.** It must stay true for every book, so it does not mention human review.

## A. Quick fixes (ship first, separately)
1. **robots.txt.** Every `/read/{book}` page loads about 13 scripts and styles from `/lab/` (e.g. `/lab/display-profile.js`), but robots.txt has `Disallow: /lab` and `Disallow: /lab/`, so Googlebot renders the pages incomplete.
   - Allow those assets (e.g. `Allow: /lab/*.js`, `Allow: /lab/*.css`), or move shared assets out of `/lab/`.
   - Keep any `/lab` demo HTML out of the index with an `X-Robots-Tag: noindex` header.
   - Verify with a Googlebot user-agent fetch.
2. **Broken author image.** Every `/read/{book}` page has `<img src="assets/mary-shelley-portrait.jpg" alt="Mary Shelley…">`. It's a relative path that returns 404 (`/read/assets/…`), and it's the wrong author for every book except Frankenstein.
   - Use the correct author portrait where one exists; otherwise remove the image.
3. **Odyssey title.** It's a stale hand-tuned `BOOK_META` entry in `app/src/worker/routes/seo.ts` ("…Modern Translation, AI Companion, Audiobook | Tinct").
   - Match the other books: "The Odyssey in modern English, free to read | Tinct".
   - Remove promises of audio or AI from its description as well.
4. **Leftover Gutenberg underscores** (`_like that_`) in book-page text, seen in pride-and-prejudice and crime-and-punishment.
   - Render them as `<em>`.
   - Fix it in the generator or source, then grep every generated page.
5. **Related books.** Add a "Related books" block to each book page: same author first, then same shelf, 4–6 plain links, no generated prose.

## B. Chapter pages for every book
- **What they are:** static pages at `/read/{book}/chapter-N`, modelled on the Shakespeare scene pages (`/read/{play}/act-N-scene-M`). Each is the full chapter as real HTML, with the **modern English and the original public-domain translation side by side**, in the same design.
- **Behaviour to keep:**
  - The same attribution capture (`utm_*` and `gclid`).
  - The same hand-off to the live reader for Ask, Explain and Simplify.
  - Chapter navigation (previous, next, contents).
- **Which books:** every book that has a modern-English edition. The Shakespeare plays keep their scene pages. Exclude books on an edition or rights hold (`editionAvailability`).
- **The existing redirect:** `/read/{book}/chapter-N` currently returns a 301 to the book page, left over from the earlier SEO cleanup. Replace it with the new pages. Keep a 404 for chapter numbers that don't exist.
- **Indexing by allowlist:** create one config file listing indexable books (`app/src/data/seoIndexAllowlist.ts` or similar).
  - **Allowlisted books:** chapter pages are indexable, have a self-canonical, and are listed in the sitemap.
  - **All other books:** chapter pages are live for readers but carry `noindex, follow` (meta tag and `X-Robots-Tag`) and stay out of the sitemap.
- **Wave 1 allowlist (15 books):** crime-and-punishment, brothers-karamazov, anna-karenina, notes-from-underground, war-and-peace, ivan-ilyich, pride-and-prejudice, sense-and-sensibility, jane-eyre, wuthering-heights, middlemarch, moby-dick, frankenstein, great-expectations, heart-of-darkness.
- **Edition note** on every book page and chapter page. Use this wording exactly. Do not embellish, and do not add words like "reviewed", "edited" or "curated":
  > **How this edition was made.** Tinct's modern English is drafted with AI from {translator}'s public-domain translation ({year}), then checked by a separate AI review against that translation. The original is always beside it, and if you spot a mistake, tell us.

  For English-original books, where there is no translator, use: "Tinct's modern English is drafted with AI from {author}'s original text, then checked by a separate AI review against it. The original is always beside it, and if you spot a mistake, tell us."

  "Tell us" should link to the existing issue-report route, if one exists for readers. Fill translator, author and year from the registry. A book whose source is unknown cannot be allowlisted; list such books in the PR.
- **Book pages** show the first paragraph in both versions without scripts, plus links to all chapters.
- **Page titles:** "{Book}, Chapter N in modern English | Tinct", or the book's own chapter label where one exists.
- **No new prose.** Do not write descriptions, summaries or FAQs.

## C. Hub pages
- For example `/read/shelf/russian-novels` ("Russian novels in modern English") and `/read/shelf/english-novels`. Build them only from existing titles, covers and links, with a one-line heading and no generated prose.
- Hubs link to book pages. A hub is indexable only if it lists at least one allowlisted book.

## Verify before reporting
- **Googlebot fetch:**
  - `/read/moby-dick` shows the edition note and the first paragraph in both versions;
  - `/read/moby-dick/chapter-1` returns 200, shows the modern and original text as HTML, has a self-canonical, and has no noindex;
  - a chapter page of a book not on the allowlist (e.g. `/read/odyssey/chapter-1`) returns 200 with `noindex, follow`.
- **Sitemap:** chapter pages appear only for the 15 allowlisted books.
- **Attribution:** `?utm_source=test&gclid=x` on a chapter page survives the hand-off into the reader.
- **Release:** run tests, the build, the committed-files-only build, deploy, and the smoke test, per `AGENTS.md`.
- **Report:** the PR, the robots.txt diff, the fetch results, the page count (total, and indexable), and any books excluded for an unknown source.
