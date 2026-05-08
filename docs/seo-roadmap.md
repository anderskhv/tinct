# SEO page roadmap — all books

**Last updated:** 2026-05-08

This is the staged rollout plan for SEO companion pages across Tinct's full catalog. The Odyssey is the calibration. Every other book gets some form of SEO treatment, but the depth varies — see the "scope tiers" section below.

## Current state

- **Sitemap**: 94 URLs at https://tinct.app/sitemap.xml, auto-regenerated from `bookRegistry.ts` via `app/scripts/generate-sitemap.cjs` on every build.
- **Per-book meta**: every `/read/{bookId}` URL has unique `<title>` and `<meta description>`, derived from the registry by the same script.
- **Full SEO page sets shipped**: Odyssey only (1 / 63 books, 28 pages).
- **GSC verified**: yes (`tinct.app`).
- **Bing**: not yet — import-from-GSC pending.

## Scope tiers

Not every book deserves 28 pages of bespoke prose. Tier determines what gets built per book.

| Tier | Pages produced | When to use |
|---|---|---|
| **Full** | summary, chapters, themes, cast, chapter-N × N | Books with strong search demand AND ≤30 chapters AND a clear plot/argument |
| **Hub-only** | summary, themes, cast | Books with strong search demand but >50 chapters, OR books where chapter-by-chapter is impractical |
| **Stub** | summary only | Long-tail books — establishes the canonical URL, gives crawlers something to index, but no per-chapter rabbit hole |
| **Bible** | Bespoke schema, see "Bible" section | Schema is fundamentally different |

## Phase 1 — done

| Book | Tier | Pages | Status |
|---|---|---|---|
| The Odyssey | Full | 28 | Live |

## Phase 2 — this PR (in flight)

Five books picked for completing the "marquee classics" set on the front of the catalog. All have onboarding + threads ready.

| Book | Tier | Chapters | Why |
|---|---|---:|---|
| The Iliad | Full | 24 | Companion to Odyssey; same Bronze Age register; high curriculum demand |
| Hamlet | Full | 20 | Most-searched Shakespeare play after Romeo and Juliet |
| Meditations | Full | 12 | "Stoicism" search demand; 12 books = small surface; concept cast |
| Frankenstein | Full | 28 | School staple; gothic register; clean source data |
| The Republic | Full | 10 | Plato's most-searched dialogue; manageable book count |

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
