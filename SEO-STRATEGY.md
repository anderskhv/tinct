# Tinct SEO Strategy

**Last updated: 2026-05-11**

---

## The honest baseline

Tinct is a new domain (DR ~0). The canonical query "read The Odyssey online for free" is owned by Project Gutenberg, Standard Ebooks, Internet Archive, Wikipedia, Perseus Digital Library, MIT Classics, and Goodreads — all DR 80–95 with 15–25 years of backlinks. **Breaking top 10 for that query is not achievable in 12–18 months even with perfect SEO.**

Don't fight that battle. Fight the ones Tinct can actually win.

---

## The four tiers of query winnability

### Tier 1 — Long-tail per-book queries (win 3–6 months)

**Intent:** reader who already wants to read the book, looking for help or understanding.

Examples:
- "The Odyssey Book 9 summary"
- "best first translation of The Odyssey"
- "Odyssey character guide"
- "understand The Odyssey while reading"
- "The Odyssey modern English online"

Volume per query: 50–500/mo. Competition: DR 10–30 (SparkNotes, niche blogs, CliffsNotes). Tinct's angle is *intent match*: these readers want to understand and read, not download a .txt.

**Current shipped surface:** 63 public book routes, 27 full SEO page sets, 36 stub summary pages, and 699 sitemap URLs. This is now broader than the original 33-book phase-1 plan; future work should focus on quality control, Search Console feedback, and selective category pages rather than blind page-count expansion.

### Tier 2 — Category / reading-guide queries (win 6–12 months)

**Intent:** reader at the decision point, picking what to read and where to read it.

Examples:
- "how to read Homer in order"
- "what to read after The Odyssey"
- "Russian literature reading order"
- "best Dostoevsky to start with"
- "beginner's guide to Dante"

Volume: 500–5,000/mo. Competition: mid. Tinct's angle: honest opinionated guides, not listicles.

### Tier 3 — "AI reading companion" category (flag to plant)

**Intent:** reader looking for a new way to engage with books.

Examples:
- "AI for reading classics"
- "chat with books AI"
- "AI reading companion"
- "discuss classic books with AI"
- "ChatGPT for reading fiction"

Volume: 100–1,000/mo each, growing fast. **Competition is low** — the market is generic ChatGPT wrappers and Readwise's AI add-on, none purpose-built for classic literature. **This is the only category Tinct can genuinely own**, and owning it is more strategically valuable than ranking for any individual book.

### Tier 4 — Brand queries (byproduct, 12–18 months)

"Tinct review", "Tinct vs Readwise", "is Tinct worth it". Only relevant once demand exists. Don't plan for these directly.

---

## How to evaluate any new query (30-second filter)

Manually, in incognito:

1. Search the query. Check top 10.
2. Check each result's **Domain Rating** via https://ahrefs.com/website-authority-checker (free). If top 10 is DR 80+, give up. If *anything* in top 10 is DR <30, Tinct can compete there in 6–12 months.
3. Check **search intent match** — would a reader landing on Tinct actually be served? If no (they just wanted the .txt), skip. If yes (they want to understand / read better / compare), it's winnable.
4. Volume via Google Keyword Planner (free with a Google Ads account). 100+/mo = worth a page. <50 = skip unless strategic.

Don't pay for Ahrefs/SEMrush yet. The free checks give 80% of the signal.

---

## Language expansion

### Danish — winnable, in phase 1

Competition in Danish is much thinner than English:
- `adl.dk` — Danish state-funded Danish-original literature archive. Narrow scope.
- `Project Runeberg` — Nordic PD archive. Dated, not heavily ranking.
- `gutenberg.org` — has some Danish texts but not canonically Danish-branded.

Danish *translations* of world classics (Homer, Dante, Dostoevsky) are mostly locked behind paid publishers (Gyldendal, Rosinante) or library systems. Tinct's Danish modern editions have no real "free online" competitor for these translations.

**Query equivalents:**
- "Læs Odysseen online gratis"
- "Odysseen moderne dansk"
- "Karakterer i Odysseen"
- "Homer på dansk"

**Cost:** near-zero. Tinct already has Danish editions for every book. Mirror the English page structure in Danish.

**TAM:** small absolute volume but easy rankings + builds local brand in Tinct's home market. Worth shipping.

### Other languages — blocked until translation coverage

| Language | Dominant PD competitor | Winnability | Blocker |
|---|---|---|---|
| German | `Projekt Gutenberg-DE`, `Zeno.org` | Medium | No German editions |
| French | `gallica.bnf.fr` (BNF) | Very hard | No French editions |
| Spanish | `Biblioteca Virtual Miguel de Cervantes` | Hard | No Spanish editions |
| Italian | `LiberLiber` | Medium | No Italian editions |
| Portuguese | `Domínio Público` | Medium | No Portuguese editions |
| Russian | `Lib.ru` | Hard | No Russian editions |
| Japanese | `Aozora Bunko` | Very hard | No Japanese editions |

**Rule:** never target a language query without actual content in that language. Ranking and bouncing = Google penalty.

Revisit once translation expansion is a committed product decision.

---

## Execution plan and current status

### Phase 1 — Per-book pages (English)

**Status: substantially shipped.**

Production currently has:

- 63 public book directories under `/read/{bookId}`
- 27 Full-tier books with `summary`, `themes`, `chapters`, `cast`, and `chapter-N` pages
- 36 Stub-tier books with `summary` pages only
- 699 URLs in `https://tinct.app/sitemap.xml`
- Unique generated meta for every `/read/{bookId}` route

The original Danish mirror plan has not shipped. Do not add Danish SEO pages until the English set is quality-audited and Search Console shows useful query data.

### Phase 2 — Technical hygiene

**Status: mostly shipped, with ongoing guardrails.**

- `sitemap.xml` is generated on every build from `bookRegistry.ts` plus static SEO files.
- `robots.txt` exposes the sitemap and blocks `/data/`, `/api/`, and bulk AI/scraper user agents.
- Static SEO pages have canonical tags, Open Graph/Twitter tags, and Schema.org where generated by the SEO builders.
- Worker route handling serves clean URLs for `/read/{bookId}/summary`, `/themes`, `/chapters`, `/cast`, and `/chapter-N`.
- `/read/{bookId}` routes get injected book-specific title/description from generated metadata.
- Unknown `/read/{bookId}` routes now return `404` with `X-Robots-Tag: noindex, noarchive`.
- `/data/editions/*.json` is kept out of the index with `X-Robots-Tag: noindex, noarchive`, and unregistered book IDs are blocked.

Remaining hygiene:

- Run a live SEO audit script before sitemap resubmission.
- Keep the untracked SEO source-data pile out of commits until it is mapped to deployed pages or future work.
- Update this strategy after the first Search Console data arrives.

### Phase 3 — Category + reading-guide content (months 2–3)

Hand-written guides, one per week:
- "How to read Homer in order"
- "What to read after The Odyssey"
- "Beginner's guide to Dante"
- "Best Dostoevsky to start with"
- "Russian literature reading order"
- "Reading ancient epics in translation"

Target: 8–10 guides by month 3.

### Phase 4 — AI reading companion category (months 2–4, parallel)

Canonical pages for the category Tinct can own:
- "AI reading companion" — what it is, how Tinct does it differently
- "How to read classics with AI" — practical guide
- "Chat with The Odyssey" / "Chat with Dante" — per-book AI landing pages
- Compare against generic chat ("why ChatGPT isn't enough for reading classics")

Paired with external content: Twitter threads, HN posts, Reddit r/books contributions, book-newsletter outreach.

### Phase 5 — Backlink building (ongoing)

Goal: 5–10 legitimate high-DR backlinks in year 1.

Tactics:
- Post in r/books, r/literature, r/classicliterature — contribute genuinely, link when relevant
- HN Show submissions — specific posts, not "look at my site"
- Guest write for book newsletters
- Twitter engagement with classics community

**Never:**
- Buy backlinks (Google penalty)
- Comment-spam
- Submit to low-quality link directories

---

## The trap to avoid: AI-generated content farms

Google's Helpful Content Update (rolled out 2024, refined 2025–2026) specifically penalizes new domains that ship hundreds of thin templated pages. This is a real risk for Tinct because the temptation is exactly to generate 99 pages in a batch.

**Defenses:**
1. Every summary page is substantively written — 400+ words of real insight, not templated filler. Books Tinct knows deeply (Odyssey, Dante, Dostoevsky, etc.) get the best summaries; less-canonical books (Niels Lyhne, Enchiridion) get shorter, more careful summaries rather than padded ones.
2. Chapter and cast pages use *unique structured data* (per-book character lists, real chapter titles from the editions) — not filler.
3. Eyeball-check a handful of generated pages before full deploy. Quality gate, not a ship-at-scale blind push.

---

## Measurement

**Google Search Console (free, mandatory) — weekly for first 3 months, monthly after.**

Three things to watch:
- **Impressions rising** for targeted long-tail queries
- **CTR** — if impressions are high but CTR is 1–2%, the meta title/description is weak; rewrite
- **Queries you weren't targeting but showing up in GSC** — these are gifts. Create dedicated pages for them.

Also:
- Check weekly that no core pages are blocked by `robots.txt` or marked `noindex` accidentally
- Monitor Core Web Vitals — Tinct's reader is fast, but SEO pages need to stay that way
- After every SEO batch, run a live sample audit across full/stub pages before requesting reindexing.

---

## The Tinct-specific SEO truth

Your real competitive advantage is the **accumulated-user-data flywheel** (Popperian Critique #1): annotations, chats, reading journal, finished books. SEO traffic fills the funnel, but retention and "finish the book" are where Tinct wins.

Treat SEO as top-of-funnel only. Don't warp the product to optimize for it. Don't chase Google's content preferences at the expense of the reading experience.

---

## Current next actions

1. QA a representative sample of deployed SEO pages: full chapter pages, summaries, themes, cast, and stubs.
2. Add a small repeatable SEO audit script that checks sitemap URLs, required metadata, unknown-route 404s, and `/data` noindex headers.
3. Resubmit `https://tinct.app/sitemap.xml` in Google Search Console after QA passes.
4. Set up Bing Webmaster Tools by importing from Google Search Console.
5. Review untracked `app/scripts/seo/*.cjs` files in batches. Commit only source files that correspond to deployed pages or explicitly approved future work.

Do not expand to more SEO pages until the existing 699-URL surface has been checked for quality and indexing behavior.
