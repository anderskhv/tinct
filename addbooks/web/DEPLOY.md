# Add a book + freepubs.fyi — deploy guide

This package builds two static outputs from one catalogue and one search engine
(`addbooks/site/search.js`, built by `addbooks/scripts/build-index`):

| Output | Where it goes | What it is |
|---|---|---|
| `dist/lab-addbook/` | `app/public/lab/addbook/` → **https://tinct.app/lab/addbook/** | The Add-a-book page: open your own PDF or EPUB, or search free public-domain books. Unlinked, `noindex`. |
| `dist/freepubs/` | Cloudflare Pages project → **https://freepubs.fyi** | SEO site: a page per popular book, author, topic and language, plus search. Links back to Tinct. |

No npm dependencies. Node 22+ and Python 3.10+. Nothing here calls a paid API at build time.

## 1. Build the catalogue (once, then refresh monthly)

From the repository root:

```sh
./addbooks/scripts/build-index            # first run downloads the public catalogues, 10–30 min
./addbooks/scripts/build-index --offline  # later runs reuse addbooks/.cache/
node addbooks/scripts/test-search.mjs     # ranking checks against the real catalogue
```

The output is `addbooks/site/data/index.json.gz`. It is gitignored. Copyright gate: every
creator died more than 70 years ago, or the text is anonymous and from before 1900.

## 2. tinct.app/lab/addbook

```sh
node addbooks/web/scripts/build.mjs      # -> addbooks/web/dist/lab-addbook (catalogue ≈ 5 MB gzip)
node addbooks/web/test/e2e.mjs           # 24 browser checks under production CSP, chat API mocked
node addbooks/web/scripts/install.mjs    # copies into app/public/lab/addbook
```

Then release the app as usual from `app/` (`npm test`, `CI=true npm run build`,
`npm run verify-bundle`, `npm run deploy`). **No app source changes are needed.** The
Worker already serves `app/public/**` as static assets, and `/lab` is the experiments
namespace. To take the page down, delete `app/public/lab/addbook` and redeploy.

How it fits the app:
- **Accounts:** reads the Supabase session that tinct.app already stores in
  localStorage (`sb-*-auth-token`). Signed in → `POST /api/chat` with the Bearer token,
  using the user's normal allowance. Signed out or expired → `POST /api/lab-chat`
  (guest, per-IP, daily ceiling). Request shape: `companion.intent: 'ask'` with the
  selected passage in `companion.context.paragraphs`. Both are existing routes.
- **CSP:** runs under the production policy as-is. No inline scripts, no CDNs,
  `data:` images only, pdf.js worker same-origin (`vendor/pdfjs`, Apache-2.0).
- **Storage:** books stay in the browser (IndexedDB `tinct-addbook`, owner-tagged by
  user id). Notes and highlights use localStorage keys `tinct-addbook:*`, which the
  app's sign-out wipe already covers.
- **Free books:** the page links to the source library's EPUB. The user downloads it,
  then opens it here (CSP blocks fetching other origins, by design). `?q=` and
  `?work=<id>` deep-link into search; freepubs.fyi uses `?work=`.

### Known limitation: images to the companion

`/api/chat` accepts text only, so snipping a figure and asking about it sends the
caption and nearby text, not the picture (`IMAGES_ENABLED = false` in
`src/js/reader.js`). To enable images later, the Worker's chat validator needs to
accept content blocks of type `image` (base64 PNG/JPEG, ≤ 5 MB, ≤ 4 per request) and
pass them through to the provider. Then set `IMAGES_ENABLED = true`. This is a
separate, reviewed Worker change and is not part of this package.

## 3. freepubs.fyi (separate Cloudflare Pages project)

```sh
node addbooks/web/scripts/build-freepubs.mjs   # -> addbooks/web/dist/freepubs (~17,700 files, ~280 MB)
node addbooks/web/test/freepubs.mjs            # 16 browser checks: pages, JSON-LD, search, sitemaps, phone, CSP
```

Options: `--origin` (default `https://freepubs.fyi`), `--tinct` (default
`https://tinct.app/lab/addbook/`), `--max-files` (default 19,000, below Cloudflare
Pages' limit of 20,000 files per deployment), `--max-books` (default 12,000).

Deploy (one-time setup, then one command per refresh). This is a separate project
from the Tinct app, so the app's "never raw wrangler" rule does not apply here.
The command is Pages, not the app Worker:

```sh
npx wrangler pages project create freepubs --production-branch main   # once
npx wrangler pages deploy addbooks/web/dist/freepubs --project-name freepubs --branch main
```

Then, in the Cloudflare dashboard: Pages → freepubs → Custom domains → add
`freepubs.fyi` (plus `www.freepubs.fyi` with a redirect to the apex). In
Google Search Console, add the domain property and submit
`https://freepubs.fyi/sitemap.xml`.

What the site contains:
- `/books/<title>-<id>/`: the most-read books. Each has a templated description, facts,
  schema.org `Book` and `BreadcrumbList` JSON-LD, a direct EPUB link to the library
  (`rel=nofollow`), a source link, more by the author and more in the topic, and a
  "Read it with Tinct" link (`?work=<id>&utm_source=freepubs`). Books on Tinct link
  to `/read/<tinctId>` instead.
- `/authors/<name>/`, `/topics/<topic>/`, `/languages/<language>/` and index pages.
- `/search/`: the same worker and ranking as the lab page, over every book (`noindex`).
- `sitemap.xml` (index) plus `sitemap-N.xml`, `robots.txt`, `404.html`, and `_headers` with a
  strict CSP (no inline scripts or styles).
- No hosting of books, no ads, no tracking.

**Before announcing freepubs.fyi:** its "Read it with Tinct" links point at
`/lab/addbook/`. That makes the lab page public in practice, so install it on
tinct.app first, or build freepubs with `--tinct https://tinct.app/` until it is.

## Files

```
addbooks/web/
  src/              lab page source (index.html, js/, css/, vendor/)
  freepubs/        freepubs.fyi assets (site.css, find.js, favicon.svg)
  scripts/          build.mjs, install.mjs, build-freepubs.mjs, catalog.mjs
  test/             e2e.mjs, freepubs.mjs, serve.mjs (CSP + mocked chat), make-epub.mjs
  dist/             build output (gitignored)
```
