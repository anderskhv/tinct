# Tinct SEO Strategy

**Last updated: 2026-06-10** (first GSC/Bing data review; mediocre→exceptional thesis added)

---

## 2026-06-10 — First data, and what it changes

### The numbers (GSC + Bing Webmaster, screenshots reviewed 2026-06-10)

| | Tinct (Google) | Poetry Editor (Google) | Poetry Editor (Bing) | Tinct (Bing) |
|---|---|---|---|---|
| Clicks (~3 mo) | 6 | 55 | **320** | sitemap submitted 6/5, still processing |
| Impressions | 2,050 | 32,000 | 87,500 | — |
| Avg position | **19.2** | 60.1 | — | — |

Reality check vs this doc's plan: the surface shipped at **3,956 URLs** (not the 699 this doc froze at — commits e17ab3c3/1fe14c1d, May 11–13), so the "do not expand" rule was overtaken by events. The response is to strengthen, not expand further.

### What the data says
1. **Branded failure:** "tinct" (75 impr) + "tinct ai" (55 impr) = **0 clicks**. People search for us by name and don't click. Causes: contested dictionary-word SERP, no WebSite/Organization schema, broken og:image. Easiest traffic there is, currently lost.
2. **Long-tail discovery works:** chapter-level queries ("mitya's great secret… received with hisses", "crime and punishment summary") are exactly the May surface being found. Avg position 19.2 = page 2 — visible to Google, invisible to humans. Page 2 → page 1 is links + internal structure, not content.
3. **Bing is the proof:** Poetry Editor takes 85% of its search clicks from Bing (320 vs 55). Tinct's Bing onboarding is 5 days old. Bing's own recommendations for tinct.app: "limited crawl capacity" (high — boost quota via their console) and "no inbound links from high-quality domains" (the shared bottleneck across both sites).
4. **Position 19 vs Poetry Editor's 60** validates this doc's quality-over-quantity bet. Hand-written pages outrank templated ones per unit of authority.

Mechanical fixes (og:image, soft-404s, internal-link hub, lastmod, JSON-LD, committing the 4,894 uncommitted SEO files) are tracked as **Phase 5 in REMEDIATION-PLAN.md** — execution items, not strategy.

---

## Mediocre → exceptional: the thesis

Competent SEO (the Phase 5 fixes) gets Tinct to par. Par on a DR-0 domain ≈ a trickle. Exceptional requires owning things nobody else has. Tinct has four such assets; the strategy is to press them, hard, instead of spreading effort across generic SEO.

### 1. The modern translations ARE the moat — surface them (biggest lever)
Everyone in the May surface's query space competes on *summaries* (SparkNotes, LitCharts, DR 80+, unbeatable head-on). But nobody — not Gutenberg, not Standard Ebooks, not SparkNotes — has **free, full, modern-English translations of the classics, paragraph-aligned with the originals**. That's millions of words of content unique on the internet, currently invisible behind robots-blocked JSON.

- New page type: **translation-comparison pages** — "{Book} in modern English" / "which translation of {Book} should I read", showing the famous opening passage original-vs-modern side by side, then "keep reading free →" into the app. Translation-choice queries are high-volume for the Russians and epics ("best translation of Crime and Punishment" etc.), the intent match is perfect, and Tinct is *itself an answer* to the question, not a reviewer of other people's answers.
- This doc's old fear ("don't compete with Gutenberg for the .txt") doesn't apply: Gutenberg can't serve "modern English" queries at all.
- Optionally later: full-text modern-edition reading pages per chapter (the maximal version). Start with comparison pages — cheaper, higher intent.

### 2. Own Danish outright (small market, total victory)
Every book already has a Danish modern edition; competition is paid publishers and library logins. Nobody serves "Forbrydelse og straf på moderne dansk" free online. A Danish mirror of the SEO surface + hreflang gets actual #1 positions — and #1 positions anywhere create the authority and backlink seeds (Danish gymnasium teachers, dansk litteratur blogs, biblioteker) that lift the English surface too. This is the cheapest path from "ranks nowhere" to "ranks first for something."

### 3. Win AI search before Google (the 2026 channel)
Tinct's exact customer asks ChatGPT/Claude/Perplexity "what's the easiest way to read Dostoevsky" — and Tinct currently **403s their crawlers**. Poetry Editor already runs the opposite posture (permissive robots + llms.txt). Recommendation: open GPTBot/ClaudeBot/PerplexityBot on the static SEO pages, add llms.txt + llms-full.txt describing the catalog and the modern editions, keep /data/ and /api/ blocked. The moat is the product (positions, chat, journal, audio), not the corpus — the corpus is public domain anyway. Being the cited answer for "read classics in modern English, free" in AI assistants is winnable NOW while incumbents' ad models keep them hostile to AI crawlers. (Decision required — reverses a deliberate block. Tracked as Phase 5.7.)

### 4. CTR as positioning: the anti-SparkNotes
Where Tinct does reach page 1, the title must win the click against ad-farms. SparkNotes/LitCharts SERP results read corporate and load like billboards. Tinct's differentiators belong IN the meta title/description: **free, no ads, beautiful, read the actual book — not just the summary**. Rewrite titles/descriptions for every query family already showing impressions in GSC (start with "crime and punishment summary/synopsis", the Karamazov chapter queries, "divine read online"). At 2,050 impressions, +1pp CTR ≈ 4x current clicks — and CTR compounds as impressions grow.

### What exceptional does NOT mean
- Not more chapter pages (3,956 URLs on DR-0 is already at Helpful-Content risk; consolidate before expanding).
- Not chasing "read X online free" head queries (this doc's Tier analysis stands).
- Not warping the product for Google (flywheel section below stands).

### Sequencing
1. Phase 5 mechanical fixes (par) → 2. Translation-comparison pages for the 10 books with the strongest translation-query volume (Russians + epics + Dante) → 3. Danish mirror for the same 10 → 4. AI-crawler opening + llms.txt (pending decision) → 5. CTR rewrite pass from GSC query data → 6. The Tier 3 "AI reading companion" guides (unchanged from Phase 4 below) → backlinks throughout (Show HN for the modern-translations angle is a genuinely strong submission: "I translated 33 classics into modern English and built a free reader").

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

> **2026-06-10:** The beyond-search growth strategy (product moments, launches, press, budget) now lives in `GROWTH-PLAN.md`. This doc stays scoped to the search harvest.

## Current next actions (updated 2026-06-10)

Superseded items: Bing Webmaster is set up (sitemap submitted 6/5, processing); the audit script exists (`app/scripts/audit-seo.cjs`); the 699-URL freeze was overtaken (surface is 3,956 URLs).

1. Execute REMEDIATION-PLAN.md Phase 5 (og:image, soft-404s, commit SEO tree, lastmod, JSON-LD, internal-link hub, Bing crawl-quota boost, IndexNow run).
2. Record GSC Pages indexed-vs-discovered ratio here weekly — the health metric for the May expansion. If Google indexes <30% after 4 more weeks, consolidate (noindex the weakest chapter-page tiers) rather than wait.
3. Anders decides: AI-crawler policy (Phase 5.7) — recommended: open + llms.txt.
4. Build the first 3 translation-comparison pages (Crime and Punishment, The Odyssey, The Brothers Karamazov) and measure for 4 weeks before scaling to 10.
5. Danish mirror pilot: same 3 books, hreflang paired with the English pages.
6. CTR rewrite pass on the query families already showing impressions (GSC Queries → every query with >10 impressions and 0 clicks).
7. Backlinks: draft the Show HN post ("modern translations of 33 classics, free reader") — the strongest single authority play available; coordinate with marketing lead.

No further page-count expansion until the indexed-ratio (item 2) supports it.
