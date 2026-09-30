# Add books and bring-your-own-book (BYOB) — spec

Status: proposal, 30 September 2026. Documentation only. No code, schema,
dependency, pricing or deployment is authorized by this file; each build step
needs an explicit coding assignment from Anders.

## Goal

Let readers find any public-domain book, add it to Tinct themselves, and read
their own EPUBs in the Tinct reader — without waiting for the curated book
workflow.

## Book classes

| Class | Source | Visible to | Modern English | Audio | Chat / Talk | Label |
|---|---|---|---|---|---|---|
| Tinct Edition | Curated book workflow | Everyone | Yes (reviewed) | Play-only Grok, shared cache | Full | "Tinct Edition" |
| Catalog import | Gutenberg / public domain, self-added | Everyone (shared pool) | Optional, paid, machine-modernized, unreviewed | Play-only Grok, shared cache | Yes | "Original text" |
| Personal upload | User EPUB | Uploader only | **Never** | Play-only Grok, private per-user cache | Yes, private | "Your upload" |

Imported and uploaded books never enter `bookRegistry.ts` or the curated
taxonomy automatically. Curated promotion goes through the normal book workflow.

## Experience

- **Home: My shelf.** The existing My shelf (reading / to read / finished)
  gains an **Add a book** entry. Added catalog books and personal uploads
  appear on My shelf alongside curated books, with their class label.
- **One search.** Library search shows Tinct books first, then
  "Not in Tinct yet — free to add" with an **Add** action (adds to My shelf).
- **`tinct.app/addbooks`.** Direct link to the same catalog search plus the
  "Upload your EPUB" drop zone. Linked from My shelf, the empty-search state
  and marketing; every work also gets an indexable page for SEO.
- **Readiness.** Conversion takes seconds; the book appears on My shelf as
  soon as the structural QA gate passes. Low-scoring books are labelled
  "may render imperfectly" or fail with a clear message.

## Catalog breadth

Goal: the best place to find free, legally open books. Include every source we
can ingest legally; one entry per work, with the best available edition chosen
automatically (Standard Ebooks > Gutenberg > Wikisource > open-access
publisher file > scan).

| Phase | Sources |
|---|---|
| 1 | Standard Ebooks, Project Gutenberg (US) |
| 2 | Wikisource (whole books only), open-access books (DOAB/OAPEN, Open Textbook Library) |
| 3 | Internet Archive / HathiTrust public-domain full-view scans, behind the quality gate |
| 3 | Gutenberg Canada/Australia, Faded Page — region-gated (below) |

Rules per work in the index:

- **Public-domain status per region.** The shared pool shows a work only where
  it is public domain (at minimum US and EU/life+70). Works public domain in
  only some countries are hidden elsewhere.
- **Licence and permissions.** Creative Commons works record their licence:
  ND = no modern English; NC = no paid modernization or paywalled access.
- **Quality score** shown to readers ("Clean text" / "Scanned text, may
  contain errors").
- Other languages are indexed and labelled; the reader experience stays
  English-first per the language scope.

## Catalog import pipeline

1. Static catalog index (Gutenberg catalog feed; optionally Standard Ebooks)
   searched client-side. Only IDs from the index are accepted — never URLs.
2. Add creates a job; first request for a Gutenberg ID ingests it once into the
   shared pool; later users link to it (dedupe + popularity signal).
3. Ingest: fetch EPUB/HTML, strip Gutenberg header/footer and license, detect
   chapters, convert to the chapter-sharded edition format, write to R2.
4. Structural QA gate: chapter count/size, encoding, duplicate paragraphs,
   residual boilerplate, footnote/page-number markers (these would be read
   aloud by narration).
5. Cover: source cover if present, else a generated typographic cover.
6. Exclude titles flagged as restricted; provide a takedown path.
7. Per-user add limits and endpoint rate limits.

## Audio

Unchanged architecture (`docs/audiobook-architecture-2026-09-21.md`,
`docs/grok-narration-2026-09-23.md`): nothing generated on open, Play-only
synthesis with ~45 s rolling buffer, content-addressed shared cache, Durable
Object leases and spend ceilings. Catalog imports use it as-is.

Personal uploads: narration is allowed, fully private. Upload chunks use a
per-user cache namespace (the user ID is part of the cache identity), so an
upload never reuses or supplies recordings for any other account, even when
the text is identical. Per-user synthesis quota on top of the global ceilings.

## Modern English (catalog imports only)

- **Cost passthrough.** The requesting reader pays what generation costs us
  (measured tokens × current API price), shown before they confirm. No margin.
- Chapter-parallel generation; chapter 1 ready first, the rest unlocks while
  reading.
- **Default edition rule.** Until a modern edition exists, the default is the
  source text (the original, or for translated works the public-domain human
  translation). When the AI modern edition is complete it becomes the default
  for that book for everyone; the source text stays one toggle away. Labelled
  "AI modern English, unreviewed" until promoted through the curated workflow.
- One paid generation per work: later readers get the shared edition free.
- Never for personal uploads, or for CC-ND / CC-NC works.

## Personal uploads — liability posture (not legal advice)

Protection comes from hosting safe harbors (US DMCA, EU Digital Services Act),
which require acting as a passive host:

- Completely private: text, audio, chat context and any derived data are
  scoped to the uploader. No cross-user dedupe, cache reuse, indexing or search.
- No modern-English translation. Reading, highlights, notes, chat and private
  narration only.
- Terms: uploader warrants rights; notice-and-takedown process with a contact
  point; repeat-infringer policy; DMCA designated agent registration.
- DRM-protected files are rejected; no circumvention.
- Short legal consult before launch and before extending any processing.

## Reader invariants

Imported/uploaded books use namespaced IDs (`pd:<gutenbergId>`,
`user:<userId>:<hash>`) and must pass the same position/sync guards
(`src/lab/labPosition*`, `labPositionStore`) as curated books.

## Build order and rough effort

1. Merged search + `/addbooks` with catalog index — ~1 week.
2. Converter + QA gate + covers + catalog self-add into the shared pool, with
   audio and chat — ~2–3 weeks (converter tuning is the bulk).
3. Private EPUB upload with the liability safeguards — ~1–2 weeks.
4. Paid modern English for catalog books — after the spend/pricing decision.

## Open decisions for Anders

- Add limits per tier and whether self-add is Premium-only.
- Whether an unreviewed AI edition should become default before any spot check.
- Production spend category for passthrough modern English (price = cost, decided).
- New dependency for EPUB parsing (e.g. JSZip).
- Storage schema for jobs, user libraries and uploads.
