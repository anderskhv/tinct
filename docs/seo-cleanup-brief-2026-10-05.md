# Coding task: remove AI summary pages and fix crawl hygiene

**Assigned by Anders, 2026-10-05.** This is an explicit coding and release task. Follow `AGENTS.md` (current rules, release ownership, deploy-after-verify with `npm run deploy` from `app/`, never raw Wrangler) and the Pre-Deploy Checklist in `CLAUDE.md`.

## Why

Search Console, 16 months: 36 clicks, ~9.5k impressions, avg position 34, CTR 0.4%. Google indexed **799** pages and left **3,880 unindexed**. Impressions peaked 10–24 July and collapsed around 25 July with no deploys in that window, so this is Google's judgment of the pages. The bulk of the site is AI-written chapter summaries, themes and cast pages. Anders's product rule: **no AI-generated filler on the public site.** Public pages are the book pages and Tinct's own pages, nothing more.

Since commit 791d2802 (#318), production also sends every `/read/{bookId}/chapter-N` (3,489 sitemap URLs) as a **302 to `/reader?book=…&chapter=N`, which is `noindex, noarchive`**. So ~91% of the sitemap now ends at a noindex page.

## Do

### 1. Remove the AI SEO page types
- Delete the generated static pages under `app/public/read/{bookId}/`: `summary.html`, `themes.html`, `cast.html`, `chapters.html`, `chapter-*.html`, and their per-page assets (`_tour.js`, `_seo-styles.css`) if nothing else uses them. This includes the `bible-*` directories that only hold summary pages.
- **Keep** `app/public/read/{bookId}/book.html` (served at `/read/{bookId}`) and the library hub `app/public/read/index.html`.
- Remove the generator inputs and scripts that only produce those pages (`app/scripts/build-seo-pages.cjs`, `app/scripts/seo/{bookId}.cjs` data files), but keep `app/scripts/seo/build-library-hub.cjs` if it builds the hub. Git history preserves everything. Grep after deletion (`CLAUDE.md` rule) for stale references in scripts, tests, the worker and `package.json`.

### 2. Redirects: every old URL lands on an indexable page in one hop
In `app/src/worker/routes/seo.ts` (clean-URL SEO routing, the `seoMatch` block):
- `/read/{bookId}/(summary|themes|cast|chapters)` → **301** to `/read/{bookId}`.
- `/read/{bookId}/chapter-N` → **301** to `/read/{bookId}` (replaces the current 302 to the noindex reader). Readers lose nothing: the book page opens the reader.
- The `.html` variants of those paths: also one 301 straight to `/read/{bookId}`, not a chain.
- Unknown book IDs keep returning the branded `404 noindex`.
- Cacheable redirect headers (e.g. `public, max-age=86400`), not `no-store`.

### 3. Internal links
- `app/public/read/index.html` (~60 links) and `app/public/landing.html` (~20 links) link to `/read/{bookId}/summary`. Point them at `/read/{bookId}`.
- Book pages (`book.html`) list chapter links as `/read/{bookId}/chapter-N`. Link those straight to the reader URL the worker would have used (`/reader?book={id}&chapter=N`), so there's no redirect hop. Fix this in the generator that writes `book.html`, then regenerate.
- No page may link to a removed URL. Verify with a grep over `app/public` and a crawl of the hub.

### 4. Sitemap
- `app/scripts/generate-sitemap.cjs`: emit only `/`, `/about`, `/read/`, and one `/read/{bookId}` per live, non-held book (plus any other genuine human pages like `/privacy`). No summary, themes, cast, chapters or chapter-N URLs.
- `lastmod` must reflect a real content change for that URL (stable across rebuilds with no content change). Today 3,729 of 3,829 URLs share one date.

### 5. Small fixes
- **Homepage headline:** `/` currently has two `<h1>`s and the first is the featured book ("Frankenstein"). Make the single `<h1>` about Tinct; the featured book title becomes an `h2` or similar. No visual change.
- **Danish claims:** remove "modern Danish" from the Odyssey `BOOK_META` description in `app/src/worker/routes/seo.ts` and from `app/public/llms.txt` / `llms-full.txt` (English-only since 2026-09-21; see `STRATEGY.md#language-scope`). Point the `llms*.txt` "Representative Books" at `/read/{bookId}`, not `/summary`. Check generated book meta (`app/src/data/bookMetaGenerated.ts`) for the same.
- **Caching:** static public HTML (`/read/{bookId}`, `/read/`, `/about`) is served with `cache-control: no-store`. Give it a short public cache (e.g. `public, max-age=300, stale-while-revalidate=86400`) unless a documented reason requires no-store; keep no-store for anything per-user.

## Do not
- Write, generate or regenerate any prose. No new summaries, descriptions, FAQ blocks or "SEO copy". If a book page's existing text looks generated and unreviewed, list it in the PR for Anders; don't rewrite it.
- Make edition texts crawlable or touch `robots.txt` rules for `/data/` (pending Anders's decision).
- Change reader behavior, routes under `/reader`, or reading-position code.

## Tests and verification
- Update `app/src/worker.seo.test.ts`: for a Googlebot user agent, each removed page type returns a single 301 to `/read/{bookId}`; `/read/{bookId}` returns 200 indexable HTML with a self-canonical; unknown book returns 404 noindex.
- Run `npm test`, `npm run build` (read the output), the committed-files-only build check, `npm run deploy`, and `./scripts/smoke-test.sh`.
- After deploy, with `curl -A "Googlebot"` confirm:
  `/read/odyssey/chapter-4`, `/read/odyssey/summary`, `/read/odyssey/summary.html`, `/read/crime-and-punishment/themes` → one 301 → `/read/{id}` → 200, no noindex;
  every URL in the live sitemap returns 200, no noindex, self-canonical.
- Submit the new sitemap via IndexNow; tell Anders to resubmit it in Search Console.

## Report back
PR link, the before/after sitemap URL count, the curl results above, and any book pages whose remaining text you flagged as possibly unreviewed AI copy.
