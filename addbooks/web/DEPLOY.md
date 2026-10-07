# Add a book + freepubs.fyi — deploy guide

This package builds two static outputs from one catalogue and one search engine
(`addbooks/site/search.js`, built by `addbooks/scripts/build-index`):

| Output | Where it goes | What it is |
|---|---|---|
| `dist/lab-addbook/` | `app/public/lab/addbook/` → **https://tinct.app/lab/addbook/** | The Add-a-book page: open your own PDF or EPUB, or search free public-domain books. Unlinked, `noindex`. |
| `dist/freepubs/` | Cloudflare Pages project → **https://freepubs.fyi** | SEO site: a page per popular book, author, topic and language, plus search. Links back to Tinct. Not deployed yet (release 1 ships the lab page only). |

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
node addbooks/web/test/e2e.mjs           # 80 browser checks under production CSP, chat and user-books APIs mocked (needs app/dist)
node addbooks/web/scripts/install.mjs    # copies into app/public/lab/addbook
```

`e2e.mjs` uses Chromium from `CHROMIUM_PATH`, else `/opt/pw-browsers/chromium`, else
Playwright's own, and prints its own sample PDF when `test/fixtures/sample.pdf` is missing.

Then release the app as usual from `app/` (`npm test`, `CI=true npm run build`,
`npm run verify-bundle`, then merge to `main`). The Worker serves `app/public/**` as
static assets, and `/lab` is the experiments namespace. To take the page down, delete
`app/public/lab/addbook` and redeploy. Release 1 also changed the app in three small
places: `/api/chat` accepts pictures (below), the sign-in page accepts `/lab/addbook/`
as a return target (`app/src/lab/labSignInReturn.ts`), and sign-out deletes the
`tinct-addbook` IndexedDB (`clearLocalUserData`).

How it fits the app:
- **Accounts:** reads the Supabase session that tinct.app already stores in
  localStorage (`sb-*-auth-token`). Opening your own PDF or EPUB needs an account:
  signed out, the "Your own book" door shows "Add books to your shelf with a free
  account." with Create account / Sign in (`/sign-in?…&returnTo=/lab/addbook/`).
  Searching free books stays open to everyone. A session whose token has lapsed still
  counts as the account (its files are tagged with it); the companion then uses the
  guest route until the reader signs in again on tinct.app.
- **Rights confirmation:** once per account, before its first file opens: a checkbox
  ("I have the right to add this file and to read and listen to it in Tinct. I'm
  responsible for what I upload and share (Terms §4).") and Continue. Kept in localStorage
  `tinct-addbook:rights:<user id>` as `{ at, v }`; a confirmation of an earlier wording
  (`v` other than `RIGHTS_VERSION` in `reader.js`) is asked again. Each upload sends it as
  `X-Rights-Version` / `X-Rights-At`, kept in the file's R2 metadata (`rightsVersion`, `rightsAt`).
- **Companion:** signed in → `POST /api/chat` with the Bearer token,
  using the user's normal allowance. Signed out or expired → `POST /api/lab-chat`
  (guest, per-IP, daily ceiling). Request shape: `companion.intent: 'ask'` with the
  selected passage in `companion.context.paragraphs`. Both are existing routes.
- **CSP:** runs under the production policy as-is. No inline scripts, no CDNs,
  `data:` images only, pdf.js worker same-origin (`vendor/pdfjs`, Apache-2.0).
- **Storage:** books are kept in the browser (IndexedDB `tinct-addbook`, owner-tagged by
  user id). Notes, highlights and the rights confirmation use localStorage keys
  `tinct-addbook:*`. The app's sign-out wipe (`clearLocalUserData`) removes both.
- **Your books in your account (release 2):** signed in, a file is uploaded in the
  background after it opens, to the private R2 bucket `tinct-user-books` (binding
  `USER_BOOKS`), so "Your books" lists it on the reader's other devices; opening it
  there downloads it and keeps it in IndexedDB. Removing a book deletes both copies.
  Sign-out leaves the account copies. See below.
- **EPUBs read in the Tinct reader:** an EPUB opened here (or from Your books) goes to
  `/reader?userBook=<first 24 hex digits of its SHA-256>` once its account copy is sent
  (waited for up to 10 s; a slower upload finishes on the next open). PDFs keep this
  page's view. See "EPUBs in the Tinct reader" below.

### EPUBs in the Tinct reader

Code: `app/src/lab/userBook/` (tests beside it), `node addbooks/web/test/e2e.mjs` (needs
the app build: `npm run build` in `app/`, served by `test/serve.mjs` at `/reader`).

- **Conversion** (`epubEdition.ts`, in the browser): spine order; chapters cut at the
  table of contents (EPUB 3 nav, else NCX; a short front matter joins the first chapter),
  else one per document; text only, as paragraphs; italics as the editions' `_…_`
  emphasis; subheadings, list items, labels, links and a chapter's subtitle and byline
  as the general chapter `kinds` and `links` (app/src/types/index.ts). Every picture that
  is not decoration (an ornament, divider, logo or icon, by name or by size) becomes a
  figure at its place (`figures`, app/src/lab/labFigures.ts); its image is kept beside the
  conversion on the same record (`figureImages`) and drawn through object URLs. The cover
  image is never a chapter or a figure: this page keeps a small copy of it on the record
  (`cover`, a data: URL) for Your books. Styles, scripts, footnote markers and tables'
  layout are dropped, and so is the source library's own matter: Project Gutenberg's header (through the
  START marker), END marker and licence (marked up, or by the plain-text markers),
  Standard Ebooks' imprint, colophon and uncopyright, and Wikisource's "About this
  digital edition" and credits pages.
  DRM is refused here before leaving the page (`TinctEpub.metadata`). The conversion is
  kept on the book's IndexedDB record (`edition`), redone when `USER_EDITION_CONVERTER` changes.
- **Reader:** `loadLabBookSource` reads `userbook-<hex>` ids from that conversion; no
  fetch. Hidden for user books: narration, Talk, Cast, Compare, editions, Catch me up,
  primers, book switcher, sharing, library progress. Summarize asks the companion to recap
  the chapter on screen. The back arrow (phone: menu → Your books) goes to `/lab/addbook/#books`.
- **Stays on this device** (not synced, cleared by sign-out): the place
  (`tinct-addbook:place:<hex>`), highlights and notes (`tinct-lab-highlights`, the cloud
  writer skips `userbook-` books), chat (`tinct:chat-history:userbook-<hex>`, same).
  Not recorded: position record, reading memory, reading year, library snapshot. No
  analytics event is sent while a user book is open, nor any naming one.
- **Companion** (`userBookContext.ts`): Ask, Explain and Define send the question or
  selection with a window of at most 9,000 characters around the reader's place (as this
  page's own view did; a figure is sent as its caption); a figure's Explain or Ask also
  sends its picture, signed in only, through the picture path below; "Recap this chapter" (Summarize, chapter end) sends the chapter,
  cut at 120,000 characters (as this page's Summarize). Never the book's id or edition,
  so the Worker answers from the text (no book lookups, no book id in the usage ledger),
  with its usual auth and limits.

### Your books in your account (release 2)

Worker: `app/src/worker/routes/userBooks.ts`, tests `app/src/worker.userBooks.test.ts`.
Every route needs a signed-in user; responses are `no-store`; anything not the caller's
is `404`.

| Route | |
|---|---|
| `GET /api/user-books` | The caller's books: `{books: [{id, name, title, author, type, size, sha256, createdAt}], limits}` |
| `POST /api/user-books` | Raw file body; `X-Book-Name`, `X-Book-Title`, `X-Book-Author` (percent-encoded). `201 {book}`, or `200 {book, existing: true}` when the account already has the same file |
| `GET /api/user-books/{id}` | The file, to its owner only |
| `DELETE /api/user-books/{id}` | Deletes it |

- **Keys:** `u/{userId}/{fileId}`, fileId 16 random bytes (hex). Metadata is the object's
  R2 customMetadata (percent-encoded, ASCII): written and deleted with the bytes, and
  R2 listing is strongly consistent, so there is no separate index to drift.
- **Checks:** type from the bytes (`%PDF-`, or a ZIP whose stored `mimetype` entry is
  `application/epub+zip`), else `415`. Limits (constants in `userBooks.ts`): 50 MB per
  file and 2 GB / 200 files per account (`413 file_too_large` / `413 account_full`),
  10 uploads per account per minute (`429`). Concurrent uploads can pass the account
  check together, so the totals can be exceeded by at most a few in-flight files.
- **Never shared, indexed or deduplicated across accounts;** the same file twice in one
  account is stored once.
- **Export and deletion:** the admin export lists the files (`r2.userBooks`, no bytes);
  account deletion removes everything under `u/{userId}/` (`docs/account-deletion.md`).
- **Takedown** (a rights holder writes to contact@tinct.app, as the privacy notice says):
  find the object in the Cloudflare dashboard (R2 → `tinct-user-books`), or ask for the
  account and use the admin export to identify the file id, then delete
  `u/{userId}/{fileId}`. The reader's browser copy goes when they remove it or sign out.
- **Before the first deploy:** the bucket must exist. Cloudflare dashboard → R2 Object
  Storage → Create bucket → name `tinct-user-books`, location Automatic, default storage
  class Standard → Create. Leave Public access disabled and add no custom domain or
  r2.dev URL. A deploy without the bucket fails, which is the safe failure.
- **Free books:** the page links to the source library's EPUB. The user downloads it,
  then opens it here (CSP blocks fetching other origins, by design). `?q=` and
  `?work=<id>` deep-link into search; freepubs.fyi uses `?work=`.
- **`?mode=file`:** the file step only ("Your own book": a PDF or EPUB), without the free-book
  door or its catalogue. The library's entries (My shelf's + tile, the + in the search field,
  "Add a PDF or EPUB") and the reader's way back from a user book (`/lab/addbook/?mode=file#books`)
  use it, since the library search already finds free books. Sign-in returns to it.

### Images to the companion (signed in only)

Signed in, a figure the reader snips from a PDF, or an image they attach, paste or drop
into the chat, goes to `/api/chat` with the question (`IMAGES_ENABLED = true` in
`src/js/reader.js`). `src/js/tinct-api.js` redraws each picture as PNG (JPEG for photos,
or when PNG is too large) of at most 1568 px on its long side and ≤ 1.2 MB, and sends the
last turn as `[...image blocks, {type: 'text', text}]`. Earlier turns stay text.

The Worker (`app/src/worker/routes/chat.ts`, `lib/chatImages.ts`) accepts only that: at
most 4 base64 `image/png`, `image/jpeg` or `image/webp` blocks of ≤ 1.5 MB decoded whose
bytes match their type, in the latest user turn; a request with pictures may be up to
8 MB (text-only requests keep the 500 KB cap). Anything else is `400
{error:'image_rejected'}`. `/api/lab-chat` refuses pictures with `400
{error:'images_unavailable'}`. Each picture adds about width × height / 750 input
tokens (≤ 1,600) to the cost estimate; the usage ledger records the provider's actual
input tokens, pictures included.

Signed out (or with a lapsed sign-in) the client does not send pictures: it answers
from the caption, the labels inside the figure and a rough text sketch, and says so.
A picture of the whole page with every PDF Explain/Ask (`PAGE_IMAGES` in `reader.js`)
stays off in release 1.

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

**freepubs.fyi is not deployed in release 1.** **Before announcing freepubs.fyi:** its "Read it with Tinct" links point at
`/lab/addbook/`. That makes the lab page public in practice, so install it on
tinct.app first, or build freepubs with `--tinct https://tinct.app/` until it is.

## Files

```
addbooks/web/
  src/              lab page source (index.html, js/, css/, vendor/)
  freepubs/         freepubs.fyi assets (site.css, find.js, favicon.svg)
  scripts/          build.mjs, install.mjs, build-freepubs.mjs, catalog.mjs
  test/             e2e.mjs, freepubs.mjs, serve.mjs (CSP + mocked chat), make-epub.mjs
  dist/             build output (gitignored)
```
