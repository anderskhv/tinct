# CMO memory: Tinct marketing state

**Read this first in any marketing, SEO or growth conversation with Anders. Update it at the end of each one** (overwrite stale lines, keep it short). Last updated: 19 Nov 2026 (evening).

## How Anders likes to work
- **Plain language, short answers,** a clear recommendation rather than a survey of options. "Explain like I'm 13" when he asks.
- **The Google Ads interface is in Danish:** give click paths with the Danish labels. Answer in Danish when he writes Danish.
- **He wants honesty, including "this is a waste of time".** No AI slop on the site, ever.
- **Spending, pricing and new external services are his decisions.** Code changes go to the coder as paste-ready prompts.

## The goal
**100 fans** (people who read in at least 2 different weeks, or finish a book). Visitors are not the goal. Fans today: **2–5** (as of 18 Nov).

## Live experiments and dates
| What | Status | Next check |
|---|---|---|
| Google Ads "hamlet angles" + "Moby Dick" | Landing on scene/book pages, `utm_term={keyword}` in the campaign suffix, pdf/download negatives, Moby ads without the word "Dick" (appeal rejected). 16–19 Nov: ~DKK 460, 25 real visitors, 3 read ≥ 1 min, 0 accounts. Only "read X online / full text" searches produced readers. | **24 Nov:** screenshot + customer-success numbers. **30 Nov:** decide. Continue only if ≤ DKK 50 per engaged reader; stop at DKK 500 spent with no reader. Recommended: only "read it" keywords, DKK 50/day total. Card payment was declined 18 Nov: Anders to fix. |
| SEO chapter/scene pages | Live (#838, #839): all books, wave 1 (15 novels) indexed, hubs `/read/shelf/*`. Hamlet 3.1 confirmed indexed 16 Nov. Requested indexing for the top 12 URLs. | **Mid-Dec:** Search Console → which wave 1 pages get impressions; then decide wave 2 (Odyssey first). |
| Bing | Ranks Tinct position 6–8 on 517 queries (19 Nov), 2% click-through. | With the Google check. |

## Briefs waiting for the coder (check whether shipped)
- **Allowlist:** odyssey, oresteia, the-histories, master-and-margarita, beowulf. Structure line "38 chapters" on book pages, "Chapter N of total" on chapter pages, plain-HTML chapter lists.
- **Titles by intent:** "Read {Book} online free" on the first chapter, "all N chapters" on the book page. Curly quotes in the modern column. "Continue reading" at the end of chapters.
- **`/modern-english` hub** listing every modern edition.
- **Search landing (decided 19 Nov: option B):** the book page `/read/{book}` opens straight into Chapter 1 text; chapter-1 URL canonical to the book page; the cinematic hero stays in library/app.
- **Chapter pages (approved mockups 19 Nov):** single column Modern English by default; desktop switch `Original | Modern | Both` in the top bar (italic serif, approved exception); phone `Modern English | Original` under the heading; Shakespeare keeps side by side on desktop; "Chapter N of total"; "Continue reading" + "Your place is saved on this device" (only if true); edition note now says "The original is one tap away". Brief given in chat 19 Nov; not shipped yet.

## Decisions made (do not reopen)
- Publish modern-English text openly as crawlable HTML, by allowlist waves.
- **Edition note wording is fixed:** "drafted with AI from {translator}'s public-domain translation ({year}), then checked by a separate AI review…". Never claim human review.
- No AI summaries, FAQs or "themes" pages. Facts counted from data are fine.
- **Headline:** "No text is beyond you." Subheading built on "Read the books you thought were too hard, with help right on the page…"
- Keep the name Tinct for now (rename explored: no candidate Anders loved; the naming-story research is in `reports/Tinct naming story.md`).

## Ads test planned
- January, after the new landing ships: one "read-online" campaign, 8–10 books (one ad group each, chosen from Bing keyword volumes), landing in Chapter 1, DKK 50/day, ~DKK 700. Success: ≥ 25% read ≥ 1 min; rank books by cost per engaged reader. Needs: Anders sends Bing Keyword Research volumes for 15–20 candidates.

## Open ideas, not yet done
- **Founding Readers** (first 100 get Premium free for a year, in exchange for feedback). Pricing decision, pending.
- **Talk to the 2–5 fans:** why they came back, what nearly stopped them, who else they know.
- **First reading group** ("Hamlet in 4 weeks" or "Odyssey in 6 weeks"); 3–5 book clubs; teachers and homeschool groups; LinkedIn.
- **Launch video** (92s, Suno music: check the licence before posting). Post on Anders's X and LinkedIn as the reveal. Make a 20–25s cut for Reddit.
- **"Why I left" X post:** drafts in `docs/x-post-ideas.md`.
- **SEO tooling:** the OpenSEO method is adapted in `docs/seo-method.md`. Claude SEO plugin (free) suggested for Anders's Mac. DataForSEO only as a $1 test.

## Where the details live
`MARKETING.md` (Reddit rules, review checklist, lessons log §8) · `docs/seo-method.md` (method + SEO strategy, see 'Strategy' section) · `docs/google-ads-plan-2026-11.md` · `docs/seo-chapter-pages-brief-2026-11-16.md` · `docs/x-post-ideas.md` · `GROWTH-PLAN.md` · `STRATEGY.md`
