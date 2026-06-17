# SEO page roadmap — all books

**Last updated:** 2026-06-17

This is the staged rollout plan for SEO companion pages across Tinct's full catalog. The Odyssey is the calibration. Every other book gets some form of SEO treatment, but the depth varies — see the "scope tiers" section below.

## Current state

- **Sitemap**: 3,965 URLs at https://tinct.app/sitemap.xml, auto-regenerated from `bookRegistry.ts` via `app/scripts/generate-sitemap.cjs` on every build.
- **Public book routes**: 100.
- **Generated book landing pages**: 100 / 100 at `/read/{bookId}`. These are crawler-visible static HTML pages, not empty SPA shells.
- **Per-book meta**: every generated book page has a unique title and description. Generated titles are capped at 60 chars and descriptions at 155 chars, except explicit hand-tuned marquee exceptions such as Odyssey.
- **Social cards**: generated book pages include `og:image`, `twitter:card`, and `twitter:image`; default image is `https://tinct.app/og-image.png`.
- **Full SEO page sets shipped**: 64 / 100 books.
- **Stub SEO summaries shipped**: 1 / 100 books.
- **Clean URL routing**: Worker serves static SEO HTML at `/read/{bookId}/summary`, `/themes`, `/chapters`, `/cast`, and `/chapter-N`.
- **Indexing guardrails**: unknown `/read/{bookId}` routes return `404 noindex`; `/data/editions/*.json` responses carry `X-Robots-Tag: noindex, noarchive`; unregistered book IDs are blocked.
- **GSC verified**: yes (`tinct.app`).
- **Bing**: IndexNow is configured and was successfully submitted on 2026-06-17. Bing crawl quota still needs a manual boost in Bing Webmaster Tools.
- **Latest production verification**: `/read/odyssey` returns the hand-tuned Odyssey title and a resolving `og:image` (`image/png`, HTTP 200).

## 2026-06-17 checkpoint

Shipped:

- 100-book registry is live, including Ivan Ilyich.
- Generated `/read/{bookId}/book.html` pages are committed for all 100 books and served at clean `/read/{bookId}` URLs.
- Generated metadata now uses CTR-oriented copy:
  - free/no-ads lead;
  - modern English compare;
  - AI companion;
  - Cast guide;
  - audio.
- Generated metadata caps:
  - title <= 60 chars for generated titles;
  - description <= 155 chars;
  - long titles switch to value-prop-first form, e.g. `Free Classic Reader: ... | Tinct`.
- Odyssey remains a hand-tuned marquee exception with the longer title:
  - `Read The Odyssey Online — Modern Translation, AI Companion, Audiobook | Tinct`.
- Generated static book pages now include Open Graph and Twitter card image tags.
- No `sitemap 2.xml` duplicate exists in the clean deploy worktree.
- Operational caveat: the primary local checkout was dirty and diverged at shutdown, and may still contain stale generated SEO files plus `app/public/sitemap 2.xml`. Treat `origin/main` or a fresh clean worktree as the reproducible SEO source before any deploy.

Deployment:

- Worker version: `1fece18c-5bf3-4f6a-9943-2ad629544477`
- Commit: `8c0ce4fba seo: add social cards to generated book pages`
- Smoke test: 15/15 passing.
- Verification gates: `npm run build`, `npm run verify-bundle`, and `npm test -- --run` passed before deploy.

## Next SEO moves

1. Build strategic translation-comparison pages. This is now the highest-leverage SEO work, not more basic plumbing.
   - Start with Crime and Punishment.
   - Target queries like `Crime and Punishment modern English`, `best translation of Crime and Punishment`, and `Crime and Punishment free online`.
   - The page should make Tinct the answer: original/public-domain text, modern English comparison, no ads, AI companion, Cast, audio.
2. Split the sitemap into a sitemap index:
   - static marketing/library;
   - book landing pages;
   - full-tier chapter/theme/cast pages;
   - future strategic pages.
3. Stabilize `lastmod` so it changes only when relevant content changes. Current regeneration can still churn dates if source mtimes move.
4. Add cacheable headers for SEO/static pages where safe. Avoid blanket `no-store` for crawler-facing static pages.
5. In Bing Webmaster Tools, manually raise crawl quota and resubmit/fetch the sitemap after the final travel deploy.
6. Consider promoting Ivan Ilyich from generated landing page to a Full or focused strategic page set. It is short, curriculum-friendly, and now has onboarding + threads.

## Scope tiers

Not every book deserves 28 pages of bespoke prose. Tier determines what gets built per book.

| Tier | Pages produced | When to use |
|---|---|---|
| **Full** | summary, chapters, themes, cast, chapter-N × N | Books with strong search demand AND ≤30 chapters AND a clear plot/argument |
| **Hub-only** | summary, themes, cast | Books with strong search demand but >50 chapters, OR books where chapter-by-chapter is impractical |
| **Stub** | summary only | Long-tail books — establishes the canonical URL, gives crawlers something to index, but no per-chapter rabbit hole |
| **Bible** | Bespoke schema, see "Bible" section | Schema is fundamentally different |

## Shipped full-tier books

These books currently have full static SEO page sets: `summary`, `themes`, `chapters`, `cast`, and `chapter-N` pages.

| Book ID | Status |
|---|---|
| antigone | Live |
| apology | Live |
| bacchae | Live |
| candide | Live |
| crime-and-punishment | Live |
| frankenstein | Live |
| gilgamesh | Live |
| hamlet | Live |
| iliad | Live |
| jane-eyre | Live |
| macbeth | Live |
| medea | Live |
| meditations | Live |
| midsummer | Live |
| niels-lyhne | Live |
| notes-from-underground | Live |
| odyssey | Live |
| oedipus-at-colonus | Live |
| oedipus-rex | Live |
| paradise-lost | Live |
| romeo-and-juliet | Live |
| symposium | Live |
| the-aeneid | Live |
| the-awakening | Live |
| the-republic | Live |
| the-tempest | Live |
| ulysses | Live |

## Shipped stub-tier books

These books currently have `summary.html` only:

`a-little-princess`, `aristotle-politics`, `beowulf`, `beyond-good-and-evil`, `bible`, `brothers-karamazov`, `communist-manifesto`, `confessions`, `crito`, `democracy-in-america`, `descartes-meditations`, `divine-comedy`, `faust-part-1`, `fear-and-trembling`, `federalist-papers`, `genealogy-of-morals`, `great-expectations`, `imitation-of-christ`, `jerusalem`, `magna-carta`, `moby-dick`, `nicomachean-ethics`, `on-liberty`, `oresteia`, `peloponnesian-war`, `phaedo`, `poetics`, `pride-and-prejudice`, `second-treatise`, `social-contract`, `the-art-of-war`, `the-histories`, `the-manual`, `the-prince`, `us-founding-documents`, `war-and-peace`.

## Historical note — Phase 2 generator-driven approach

Five books picked for completing the "marquee classics" set on the front of the catalog. All have onboarding + threads ready.

| Book | Tier | Chapters | Why |
|---|---|---:|---|
| The Iliad | Full | 24 | Companion to Odyssey; same Bronze Age register; high curriculum demand |
| Hamlet | Full | 20 | Most-searched Shakespeare play after Romeo and Juliet |
| Meditations | Full | 12 | "Stoicism" search demand; 12 books = small surface; concept cast |
| Frankenstein | Full | 28 | School staple; gothic register; clean source data |
| The Republic | Full | 10 | Plato's most-searched dialogue; manageable book count |

**Status (2026-05-08):** First attempt used five parallel general-purpose subagents, each writing the full 28-page set per book. All five hit the 600s stream watchdog and stalled mid-book — each agent only managed to land chapter-1 (good prose) before timing out. The output was unshippable: a partial book (1/28 chapters) on disk would either dilute the sitemap (URLs 404) or look like a half-built page set to crawlers.

**Lesson:** writing 28 HTML files of bespoke prose per book in one agent session is past the watchdog. The bottleneck wasn't prose quality — chapter-1's were on tone — it was the sheer volume of HTML chrome reproduction. Each agent re-typed the same `<style>` blocks, meta tags, prev/next nav, og tags, etc. for every chapter.

The original roadmap below is retained as process history. The generator-driven approach was the right direction: prose lives in `app/scripts/seo/{bookId}.cjs`, deterministic HTML comes from `app/scripts/build-seo-pages.cjs`, and the sitemap auto-detects files under `app/public/read/{bookId}/`.

Before adding or regenerating more pages, first:

1. QA the currently deployed 699-URL surface.
2. Map untracked SEO source files to deployed pages versus future work.
3. Commit source data in small batches only after review.

## Generator-driven approach

Before retrying Phase 2, build the missing infrastructure:

1. **Per-book content data file** at `app/scripts/seo/{bookId}-chapters.json` (or `.py`). The shape:
   ```json
   {
     "book": { "id": "iliad", "title": "The Iliad", "author": "Homer" },
     "groups": [{ "label": "Books 1-9 · Wrath", "chapters": [1,2,3,4,5,6,7,8,9] }, ...],
     "themes": [{ "slug": "menis", "title": "Rage", "essay": "..." }, ...],
     "cast": [{ "id": "achilles", "name": "Achilles", "role": "...", "body": "..." }, ...],
     "chapters": [{
       "n": 1, "title": "...", "hook": "...",
       "tour": "~115w pure storyline",
       "blurb": "~80-100w for chapters.html",
       "summary": ["~95w P1", "~95w P2", "~100w P3 with light analysis"],
       "appears": ["Achilles", "Agamemnon", "Apollo"],
       "themes": [["menis", "Rage"], ["honor", "Honor and timē"]]
     }, ...]
   }
   ```
2. **Generator script** at `app/scripts/build-seo-pages.cjs`. Reads the data file + the Odyssey HTML files as templates. Outputs all 28 HTML files for one book under `app/public/read/{bookId}/`. Adds the book's URL set to the sitemap auto-detect (already handled by `hasSeoPages(bookId)`).
3. **Per-book agent task is now**: write the data file (prose only, no HTML chrome). That's 5–8K words of prose in one shot — fits comfortably inside the watchdog. HTML scaffolding becomes deterministic.

This decouples prose-writing (subjective, slow, voice-sensitive) from HTML mechanics (boring, fast, deterministic). It also makes future books cheap.

**Order to ship Phase 2 v2:**
1. Build generator + data-file schema (1 commit, ~1–2 hours).
2. Use the existing Odyssey content to generate `odyssey-chapters.json` retroactively, then re-generate the Odyssey HTML and diff against the live versions to verify the generator faithfully reproduces hand-crafted output.
3. Spawn 5 focused subagents — each writes one book's data file. With watchdog-friendly scope.
4. Run generator on each. QA as before. Deploy.

## Phase 3 — next sprint (5 books)

Same Full tier. All have onboarding + threads. Picked for high curriculum search volume.

| Book | Chapters | Notes |
|---|---:|---|
| Romeo and Juliet | 25 | Most-searched Shakespeare play |
| Macbeth | 28 | Tragedy curriculum staple |
| Crime and Punishment | 41 | Long but high-demand; consider chapter-page batching |
| Jane Eyre | 38 | Same as above |
| Pride and Prejudice | 61 | Borderline — possibly Hub-only instead, with a "key chapter" subset |

## Phase 4 — Greek tragedy + short philosophy (8 books)

All Full tier; small chapter counts mean these go fast.

| Book | Chapters |
|---|---:|
| Oedipus Rex | 11 |
| Antigone | 11 |
| Oedipus at Colonus | 11 |
| Bacchae | 11 |
| Medea | 7 |
| Apology | 3 |
| Crito | 3 |
| The Tempest | 10 |

## Phase 5 — canonical philosophy (10 books, Hub-only candidates)

These books have onboarding but no threads. Threads are needed for the cast page; either generate them first or fall back to Hub-only.

| Book | Chapters | Threads? |
|---|---:|---|
| The Prince | 27 | No |
| Beyond Good and Evil | 11 | No |
| Genealogy of Morals | 4 | No |
| Nicomachean Ethics | 10 | No |
| Descartes Meditations | 9 | No |
| Confessions | 13 | No |
| The Art of War | 13 | No |
| Communist Manifesto | 5 | No |
| On Liberty | 5 | No |
| Social Contract | 48 | No |

**Decision needed before Phase 5 starts:** generate threads JSONs for these (cleaner cast pages) or accept Hub-only (no cast page). Threads generation is a separate writing job per book — roughly 1–2 hours of careful work each.

## Phase 6 — long classics, Hub-only (large chapter counts)

These books have great content but their chapter counts make per-chapter pages impractical. Hub-only first; consider per-chapter pages for a curated subset later.

| Book | Chapters | Strategy |
|---|---:|---|
| Brothers Karamazov | 96 | Hub + Volume-level pages (4 volumes) |
| Pride and Prejudice | 61 | Hub + per-chapter (it's iconic enough; revisit) |
| Great Expectations | 59 | Hub + per-volume (3 volumes) |
| Moby-Dick | 136 | Hub-only; chapter pages probably not worth it |
| War and Peace | 365 | Hub-only; consider per-Book pages (15 books) |
| Democracy in America | 96 | Hub-only |
| Imitation of Christ | 114 | Hub-only |
| Divine Comedy | 100 | Hub + per-canticle (Inferno/Purgatorio/Paradiso) |
| Beowulf | 43 | Full possibly OK; revisit |
| Peloponnesian War | 26 | Full OK |
| Federalist Papers | 85 | Hub-only; key papers (10, 51, 78) get individual treatment |

## Phase 7 — long-tail (Stub tier)

Anything not yet covered, plus newer additions to the registry. Stub = summary.html only, mostly auto-generated from the existing onboarding JSON. The point is to give every book a canonical URL with unique meta tags and at least one indexable summary page.

Books to handle in this phase: a-little-princess, faust-part-1, niels-lyhne, ulysses, paradise-lost, the-aeneid, candide, gilgamesh, the-awakening, magna-carta, us-founding-documents, fear-and-trembling, jerusalem, oresteia, midsummer, notes-from-underground, the-manual, the-histories, aristotle-politics, second-treatise, phaedo, symposium, poetics.

## Bible — separate strategy required

The Bible has 1,189 chapters across 66 books. The current `/read/bible/chapter-N` schema won't work — search intent is for `/genesis-1`, `/psalm-23`, `/john-3`, not numeric chapter indices. And 1,189 chapter pages would dilute the rest of the sitemap.

**Proposed approach:**
1. Hub pages: `/read/bible/summary`, `/read/bible/old-testament`, `/read/bible/new-testament`, `/read/bible/themes`, `/read/bible/cast` (key figures across the whole book).
2. Per-book pages: `/read/bible/genesis`, `/read/bible/exodus`, etc. — 66 pages, one per Bible book.
3. Per-chapter pages only for high-search-volume chapters: Genesis 1, Psalm 23, John 3, Romans 1, Revelation 22, the Sermon on the Mount, etc. Curated list of ~50 chapters max.
4. The reader's URL routing will need a mapping from `/read/bible/genesis-1` to chapter index 1; that's a worker change.

This is a separate project. Estimated 3–5 days of focused work; should NOT block Phase 2–6.

## Process notes

### Per-book content build cost
Hand-crafted (Anders) ≈ 6–10 hours per Full-tier book.
Subagent-assisted ≈ 1–2 hours per Full-tier book + 1 hour review.
Stub-tier ≈ 30 min per book (mostly mechanical).

### Sitemap auto-handling
`generate-sitemap.cjs` already detects `summary.html` per book and includes the right URLs. Adding a new book's SEO pages = drop the files in `app/public/read/{bookId}/`, run `npm run build` (which runs the sitemap generator via `prebuild`), deploy. No registry edits needed.

### Voice / quality gates
Every Full-tier build must pass the chapter-1 calibration check: re-read Odyssey chapter-4 before continuing past chapter-1. Length rule: chapter summary ≤ 30% over original brief. Tour cards: pure storyline, ~115 words, no bare "He" openings. Recorded in `docs/seo-pages-blueprint.md`.

### When to push back on a tier assignment
If during a Full build the agent (or human) finds the book genuinely doesn't have plot/argument structure that 24 separate ~290-word summaries can carry — drop to Hub-only and surface the decision in the commit. Better five great hubs than 24 padded chapter pages.

## Tracking

Open work as Phase-N branches or per-book commits. Don't bundle Phase 4 with Phase 5 — small ships, easy reverts.

After every phase ships, regenerate sitemap (`npm run sitemap` or `npm run build`), submit fresh sitemap fetch in GSC + Bing, and check Indexing > Pages a week later for crawl errors.

## QA log

### 2026-05-11 live sample

Checked 10 production pages: four chapter pages, three summaries, one themes page, one cast page, and one stub summary.

Passed:

- All 10 returned `200`.
- All 10 had non-generic `<title>` tags.
- All 10 had meta descriptions.
- All 10 had canonical URLs matching the requested clean URL.
- No sampled page had the `&amp;amp;` double-escape title bug after redeploy.

Residual gap:

- Summary pages include JSON-LD.
- Generated chapter, theme, and cast pages currently do not include JSON-LD. This is not blocking for indexing, but it is a good generator improvement before the next SEO expansion batch.
