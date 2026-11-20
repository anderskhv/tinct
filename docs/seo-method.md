---
name: tinct-seo
description: Tinct's SEO method, adapted from OpenSEO's skills (MIT, github.com/every-app/open-seo). Use for any Tinct SEO audit, keyword or search-term analysis, page-to-keyword mapping, or "what should we do for search next" question.
---

# Tinct SEO method

Adapted from the OpenSEO agent skills (`seo-coach`, `seo-audit`, `keyword-research`, `keyword-clustering`; MIT licence, © 2026 Ben Senescu). OpenSEO's own tools need its MCP server and a paid DataForSEO key. Tinct has neither, so this version uses the data Tinct does have. Adding them is a spending decision for Anders.

## Data sources, in order of trust
1. **Tinct's own visitor data** (customer-success stream): what visitors did after landing (read ≥ 1 minute, accounts, return visits) by `utm_*`, `gclid` and landing page. The only source for "did it work". Ask for it by `utm_campaign` / `utm_content` / landing path.
2. **Google Search Console and Bing Webmaster:** real queries, impressions, clicks and position. Anders exports or screenshots them (Bing: Keyword report CSV). Google is the bigger market; Bing so far ranks Tinct higher.
3. **Google Ads search terms:** paid keyword research. It shows which intents click and, joined with (1), which ones read.
4. **Live fetches** of tinct.app pages (as Googlebot and Bingbot, and in a real browser through Playwright) to check status, title, canonical, robots, rendered text and attribution capture.
5. **Web search** for what currently ranks for a query. It is not Google itself, so treat it as a hint and confirm with Search Console.

Never invent volumes, positions or conversion rates. Write "unknown".

## Audit workflow
1. **Orient.** List Tinct's page families from the sitemap: book pages `/read/{book}`, chapter pages `/read/{book}/chapter-N`, scene pages `/read/{play}/act-N-scene-M`, shelf hubs `/read/shelf/*`, landing and about pages.
2. **Read real pages in each family.** Read at least two per family: the best performer and a typical one. Ask what the searcher wants and whether the page answers it at once. Check status, canonical, robots and noindex, internal links, and what a crawler sees without scripts.
3. **Shortlist 5–10 opportunities** across at least three kinds:
   - an underperforming page;
   - real demand with no page;
   - a winning page to protect;
   - an indexing or access defect;
   - helping visitors take the next step.
   For each, record the evidence (query, source, date, position or "not seen"), the proposed change, who searches and why they matter, the effort and the main uncertainty.
4. **Choose one to three.** Prefer a bounded fix to a demonstrated problem for searchers likely to read. A real indexing blocker or traffic loss jumps the queue. Every shortlisted item ends either as a recommendation or in a "What else we checked" table with a real reason.
5. **Size the benefit honestly.** Name the mechanism: a new ranking, a better position, or a better click-through at the same position. Volume is not visits. Label any position-one scenario as hypothetical.
6. **Review before reporting.** Argue for the strongest rejected option; check dates, geography and position conventions ("#10 (page 1)", "not in the first 20 results").

## Keyword and intent rules learned for Tinct (Nov 2026)
- **Target reading intent:** "read {book} online", "read {book} online free", "{book} full text", "{book} in modern English", "{book} chapter N", "{play} act N scene M". These produced the only ad visitors who read.
- **Structure intent is a real opening:** "how many chapters in {book}", "{book} chapter list". Answer with facts counted from the edition data (pill on the book page, "Chapter N of total" on chapter pages).
- **Do not chase** summary, analysis, themes, quiz, PDF or download searches. They bounce, and AI-written summary pages were what Google rejected (July 2026).
- **Land searchers in the text.** Every extra step loses "read it" searchers.
- **Map one intent to one page type** to avoid cannibalisation. Check in Search Console whether one query splits impressions across several URLs.
- **Brand ("tinct")** gets impressions but almost no clicks. That is an awareness problem, not a page problem.

## Content rules (binding)
- **No AI-generated filler prose** on public pages: no summaries, FAQs or "themes". Facts counted from data are fine.
- **The edition note uses Anders's approved wording only.** Never imply human review that did not happen.
- **Indexing is by allowlist** (`seoIndexAllowlist`). Add books in waves after checking Search Console results.

## Output
- **Lead with the answer:** one to three moves, short bullets, one idea each.
- **Then:** what else was checked, then evidence and dates.
- **Brief for the coder** as a paste-ready prompt. Site changes are coding tasks that follow `AGENTS.md` release rules.
- **Log durable findings** in `MARKETING.md` (lessons) or a dated `docs/` brief.

## Strategy (agreed with Anders, 19 Nov 2026)

1. **Goal:** search brings people to the text itself. Every public page either *is* the text or answers a factual question about the book.
2. **Page types:**
   - Chapter and scene pages are the core: the full text, Modern English by default, the original one tap away.
   - The book page opens straight into Chapter 1 (option B), with structure facts and the chapter list.
   - Hubs (`/modern-english`, `/read/shelf/*`) are navigation only.
3. **Searcher experience:**
   - Text first. No onboarding, sign-up or edition prompt before it.
   - The `Original | Modern | Both` switch: desktop top bar; phone under the heading. Shakespeare is side by side on desktop.
   - "Chapter N of total". At the end: "Continue reading", and "Your place is saved" (only if true).
4. **Targets:** reading searches, chapter and scene searches, famous passages (land on their scene, no extra pages), structure searches, category hubs, brand.
   **Not targeted:** summary, analysis, themes, quiz, PDF, download, "best translation".
5. **Indexing in waves via `seoIndexAllowlist`:**
   - Wave 1: 15 novels plus the Shakespeare scenes.
   - Wave 2: odyssey, oresteia, the-histories, master-and-margarita, beowulf.
   - After that, 20–30 books at a time, each wave only after the previous one does well in Search Console.
6. **Content:**
   - No AI prose. Facts counted from the data are fine.
   - The approved edition note only.
   - Titles by intent: Chapter 1 "Read {Book} online free…", other chapters "{Book}, Chapter N of {total}: full text…", book page "{Book}: all {total} chapters…".
7. **Technical:**
   - Static HTML with both texts present.
   - Canonical, a sitemap of indexable pages only, prev/next/contents/related links.
   - IndexNow on every deploy. Assets not blocked.
8. **Bing:** IndexNow, the free keyword tool (volumes for choosing waves), Site Scan, crawl control.
9. **Rhythm:**
   - Monthly Search Console and Bing review, plus customer-success read and return rates for search visitors.
   - A decision per wave.
   - Ads are search research only. Next test in January (see `docs/cmo-memory.md`).
10. **Not doing:** link buying, mass-generated pages, head-on "read hamlet" fights, PDF or summary pages, "AI" in titles.
