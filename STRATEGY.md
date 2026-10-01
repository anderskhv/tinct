# Tinct — Strategy

**Last updated:** 2026-10-01. **Direction approved by Anders, 2026-10-01.** Pricing below is a proposed direction, not yet a decision; the live price stays $3/month until Anders decides.

This document replaces the April 2026 strategy. The full emotional argument is in [MANIFESTO.md](./archive/old-docs/MANIFESTO.md); the one-minute version is in [ELEVATOR-PITCH.md](./ELEVATOR-PITCH.md). The approved operational rules that the book pipeline depends on (language scope, adding books, edition defaults, featured ten) are kept unchanged under [Standing decisions](#standing-decisions).

---

## The strategy in one line

**Put everything on the classics reader. Win on public-domain ground, where Amazon won't fight. Make every campaign pay for itself. Deal with publishers only after a victory makes them come to us.**

## 1. Mission

**The best reading experience ever built, starting with the books that matter most.**

The books that shaped the West — Homer, Dante, Dostoevsky, Shakespeare, the Bible — survived thirty centuries because each generation read them, argued with them and handed them on. That chain is breaking: not because the books got worse, but because getting into them got harder. Old translations, confusing names, a first fifty pages most readers never get past.

Tinct repairs that. Every classic in an authoritative English edition, with a clear modern rendering beside it, a companion that knows your page, a cast that never spoils, and narration that picks up where you stopped reading.

"The best reading experience ever built" is the quality bar for every product decision. The classics are where we prove it. The goal is that, in time, any book is better read in Tinct — reached in stages, each one earned (see [The campaigns](#3-the-campaigns)).

## 2. Principles

Nine rules for how we compete. The labels are shorthand; the rule is what matters.

1. **Concentrate on the decisive point.** The decisive reader is the adult who gave up on *War and Peace* at page seventy and still wants to have read it. Every campaign serves them first. We do not open several fronts at once.
2. **Fight on ground we choose.** Public domain is our ground. Every Tinct feature is fully legal there, including Modern English editions, narration and cast cards. Amazon's strength — its catalogue — counts for nothing on it, and there is too little money in it for Amazon to build what we build.
3. **Move fast.** Ship weekly. The open library (Campaign 2) should take weeks, not quarters. Each January, books newly entering the US public domain are a yearly campaign and a yearly announcement.
4. **Live off the land.** Gutenberg, Standard Ebooks and readers' own files are our supply. We do not pay for supply lines (licensing) until revenue can carry them.
5. **Flank, never head-on.** We do not fight Kindle as a store. Amazon sells books; Tinct helps readers *finish* them. Bring-your-own-book turns other people's files into our supply.
6. **One engine, several units.** Curated Tinct editions, the open library and bring-your-own-book are separate offers on one reading engine. Each must stand on its own; each strengthens the engine for the others.
7. **The war pays for the war.** Reading is free. Every use of AI or voice covers its own cost (see [Pricing](#6-pricing--proposed-direction)).
8. **Publish the bulletin.** One number tells the story inside and outside the company: **books finished**. The manifesto is the argument; finished books are the proof.
9. **Never interrupt an enemy who is making a mistake.** Amazon shipped "Ask this Book" on licensed books without publisher permission and is in a dispute with the Authors Guild over it (per the [2026-10-01 research](docs/in-copyright-books-research-2026-10-01.md)). We do not copy that. When we approach publishers, we come as the respectful alternative.

## 3. The campaigns

Each campaign starts only when the previous one has met its gate. Gates are set with real data before a campaign starts and logged in `DECISIONS.md`.

| # | Campaign | What we do | Gate to move on |
|---|---|---|---|
| 1 | **Italy** — a small army, decisive wins, a reputation | Classics: ~100 curated books with every feature. Prove readers stay and finish. Fix pricing so engaged readers are profitable. | Retention and books-finished show readers come back for a second book; unit economics positive per reader. |
| 2 | **Austerlitz** — the decisive win on chosen ground | **Open library:** every suitable Standard Ebooks / Gutenberg title, mostly automated. Chat, Explain, live translate or simplify, Catch me up, narration. Modern English and cast cards stay with curated books. | Open-library readers convert and retain at an acceptable rate; per-reader AI cost within the allowance. |
| 3 | **Alliances** — expand by alliance, not conquest | **Bring your own book:** DRM-free EPUB first, PDF later as clearly labelled best effort. Live features on the reader's own file. | Measurable demand for non-classics; takedown process in place; costs covered by allowance and top-ups. |
| 4 | **Tilsit** — a treaty made from strength | **Publishers:** AI-enhanced editions with presses that grant AI rights (ONIX AI permission or contract addendum), independents first. Separate, higher-priced catalogue. | Only with users and evidence publishers want. |

### Feature availability by unit

| Feature | Curated classics | Open library | Bring your own book |
|---|---|---|---|
| Reading, highlights, notes, journal, sync | ✓ | ✓ | ✓ |
| Reviewed Tinct Modern E edition | ✓ | — | — |
| Cast cards, angles, Why it matters | ✓ | — | — |
| Chat, Explain, Catch me up | ✓ | ✓ | ✓ |
| Live page translate / simplify (not stored) | ✓ | ✓ | ✓ |
| Narration | ✓ shared cache | ✓ shared cache | per reader, uses allowance |
| Talk (voice) | uses allowance | uses allowance | uses allowance |

Narration is cheap when many readers share one cached recording and expensive when they don't: at the verified xAI rate of $15 per million characters, one uncached novel of ~500,000 characters costs about $7.50 to narrate. Uploaded books must therefore draw narration from the allowance. Cache by file fingerprint so readers who upload the same file share the work.

## 4. What we will not do

**Don't march on Moscow.** A licensed ebook store looks like the decisive victory ("have everything!") but its supply lines collapse. The [2026-10-01 in-copyright research](docs/in-copyright-books-research-2026-10-01.md) found:

- Big-publisher ebooks use agency pricing: we keep ~30%, can never undercut Amazon, and earn roughly $2–5 per sale. Android in-app billing takes about half of that.
- AI chat, recaps and cast tracking on licensed text need each publisher's permission. Modern English rewrites need a separate derivative licence. Narration needs audio rights, often held by someone else.
- A licensed subscription catalogue needs roughly $10–15/month and per-read or revenue-pool payouts that $3–5 cannot carry.

So, until Campaign 4's gate is met:

- No ebook store and no licensed catalogue. Affiliate links ("read next") are allowed as a free demand signal.
- No Danish or other language rollout (see [Language scope](#language-scope)).
- No kids editions (dropped 2026-03-25).
- No social reading platform. The relationship is between the reader and the book.
- No hardware.

## 5. Target reader

**Campaigns 1–2:** the adult who tried *War and Peace* and gave up at page seventy. They want to have read Homer. They respect Dostoevsky without having finished him. They are not professors or students paid to read; their time is constrained and their attention contested.

The audience is alive even as reading declines: [37.6% of US adults read a novel in 2022](https://www.publishersweekly.com/pw/by-topic/industry-news/bookselling/article/93659-nea-finds-worrying-drop-in-reading-participation.html), the lowest since 1992, while [audiobook sales grew sharply in 2024](https://www.publishersweekly.com/pw/by-topic/industry-news/publisher-news/article/97920-audiobook-sales-rose-13-in-2024-to-2-2-billion.html) and BookTok revived *Pride and Prejudice* and *Wuthering Heights*. The access mechanism is broken, not the appetite.

**Campaign 3 adds** a different reader: students, researchers and heavy readers with DRM-free EPUBs and PDFs. Marketing for bring-your-own-book must speak to them separately. Most people's purchased books are DRM-locked in Kindle or Apple Books and cannot be uploaded.

## 6. Pricing — proposed direction

**Status: proposed 2026-10-01, not decided, not implemented.** Shape is agreed in discussion; numbers wait for 2–4 weeks of data from the per-reader cost ledger (`app/src/worker/lib/aiUsage.ts`, shipped 2026-09-30).

- **Reading is free forever.** Every book, every edition, highlights, notes, journal, sync. Never charge for public-domain text.
- **Premium: $5/month, including a monthly AI allowance.** Marketing may describe it as "$10 of AI for $5"; inside the app, show the allowance as a simple gauge or in reader units ("about 40 min of Talk or 250 questions left"), never as a dollar balance while reading.
- **Top-ups from $5,** bought on the web. Purchased credit never expires; monthly allowance rolls over for one month.
- **Annual plan** at roughly $40–45/year.
- **Existing subscribers keep $3.**
- **Rule for setting the numbers:** allowance credit is priced above cost so that a reader who uses all of it is still profitable after Stripe, and the 90th-percentile reader is profitable.

Why $3 is too cheap: Stripe's 2.9% + $0.30 leaves about $2.61. The April estimate put full chat use at ~$2.80, and Talk at the verified $0.08 per minute adds $2.40 per half hour. Engaged readers — the ones we most want — cost more than they pay. $3 also signals a side project; comparable services sit at $8–12 (ElevenReader $11, Audible Plus ~$8, Kindle Unlimited ~$12).

Payment rules: buy on the web (Stripe), not through Google Play billing, which takes ~15%.

## 7. Competitive position

| Platform | What they offer | Where Tinct wins |
|---|---|---|
| Kindle (+ "Ask this Book", Recaps) | Largest catalogue, generic AI on licensed books | Reviewed modern editions, cast cards, angles; help finishing, not selling |
| ElevenReader | AI narration across a licensed catalogue (Bookwire, HarperCollins and others); $11/month | Reading-first experience; curated classics; lower price |
| Google Play Books "Expert Intelligence" | Publisher-approved AI Q&A on purchased books | Classics depth; independent of any store |
| Readwise Reader, Speechify, ChatGPT/Claude with a file | Generic upload + AI | The reading experience itself; curated classics as the flagship |
| Rebind | Celebrity author guides | Breadth, modern editions, price |
| Gutenberg, Standard Ebooks, Libby | Free text or loans | A reading platform, not an archive |

**The moat** is book-specific context that compounds with every curated book: reviewed Modern English, cast cards that respect spoilers, angles, chapter-aware answers. Generic AI-on-any-book is easy to copy; we use it to widen the library, not as the reason Tinct exists.

## 8. Measures

1. **Books finished per reader** — the mission metric and the public bulletin.
2. **Readers who start a second book** — the retention test for Campaign 1.
3. **AI and audio cost per reader** (median and 90th percentile) from the cost ledger — the pricing input.
4. **Paid conversion and margin per paying reader.**

## 9. Open questions

1. **Exact allowance and markup.** Set from ledger data; logged in `DECISIONS.md` when decided.
2. **Campaign 1 gate numbers.** What retention and books-finished level counts as "won"?
3. **Open-library quality floor.** Which automatic checks must a Standard Ebooks / Gutenberg title pass before it appears?
4. **Live simplify on uploaded in-copyright books.** Get a legal view before Campaign 3; on-demand translation is common practice, but a full simplified rendering sits close to a derivative work.
5. **Takedown process.** A registered DMCA agent and procedure before any upload feature ships.
6. **Growth channel.** SEO per-book pages remain the main channel; the yearly public-domain campaign and the books-finished bulletin are the new ones to test.

## 10. Design principles

1. **Reading comes first.** The text is the hero. Everything else serves understanding.
2. **The best reading experience ever built** is the bar for every reader decision.
3. **The reading angle is core, not premium.** Free for everyone, set before reading begins, never imposed.
4. **Available but not pushy.** AI, prompts and annotations appear when wanted and disappear when not. No dollar meters while reading.
5. **Beautiful typography.** Warm and literary: Playfair Display, EB Garamond, IBM Plex Mono.
6. **Honest translations.** Modern renderings serve comprehension; they do not editorialise or moralise.
7. **Free at the point of reading.** Premium pays for the enhancement layer, never for public-domain text.
8. **Never lose the reader's place.** Across devices, editions and views.

## 11. Future bets — named, not committed

- **School and book-club tier.** Group reading, teacher views, shared notes. Strongest distribution candidate after Campaign 2.
- **Author-guided editions.** A living author's conversation about a classic, turned into a companion. Interesting; not before the core is proven.
- **Additional languages.** Deferred; see [Language scope](#language-scope).
- **Hardware.** Parked indefinitely.

---

# Standing decisions

Approved operational rules, kept verbatim from the previous strategy. They are unchanged by the 2026-10-01 rewrite.

## Language scope

**Approved by Anders, 2026-09-21.** English is the current product and delivery strategy. Danish is no longer the strategy, a launch requirement or an automatically queued next language. This supersedes older EN/DA plans, Danish onboarding handoffs, translation/audio follow-ups, QA requirements, SEO mirrors and Danish-language launch campaigns.

- Prioritize English reading editions, modern-English renderings, narration, interface, onboarding and marketing. Original-language source texts and their provenance remain valid parts of the library.
- Do not commission new Danish translations, narration, localized onboarding, QA or SEO pages unless Anders explicitly reopens that scope. Finishing English work does not automatically reopen Danish. No next language or rollout date is committed.
- Preserve existing Danish/source-language texts, recordings and historical evidence. This decision does not authorize deleting assets, removing existing reader functionality or declaring old assets current and verified.

**Make later localization and translation easy as we do current work:**

- Keep interface locale, edition language and narration language distinct. Use explicit language identifiers and configurable language/voice mappings rather than hard-coded English-versus-Danish branches.
- Keep user-facing strings separable from interface logic, and use locale-aware formatting and pluralization where needed. Allow localized onboarding, metadata and SEO content later, with an explicit English fallback for interface copy.
- Preserve stable book, edition, chapter and paragraph identities, source-version provenance and cross-edition alignment. A future translation must track the source it translates; English edits must not silently leave a translation marked current.
- Treat narration providers and voices as configuration. Reuse stored audio and timings for the same spoken text, language, provider/model, voice and settings. Invalidate only affected speech chunks after text changes; preserve unchanged chunks and independent language/voice variants. Never silently play another language's recording for an edition.
- Enable future languages only with explicit scope, suitable voices, content rights and quality checks. Localized routes and search metadata should describe actual supported content.

This is a design direction for current work, not a request to implement a localization framework, change schemas or dependencies, generate translations, or deploy now. Concrete implementation remains subject to the relevant work plan. Other dated metrics and historical completion claims in this document have not been reverified by this language-scope update.

## Adding books — current delivery process

**Updated 2026-09-24.** Follow [Adding books](books/README.md): validate the source, prepare and independently review English editions, complete onboarding and character compatibility, then hand the accepted package to the coding agent for integration and publication.

Grok streaming and shared caching replace the former full-book audio-generation step. New books do not require Kokoro, Edge TTS, RunPod/GPU jobs, prerecorded audio, or legacy manifests/timings. Runtime narration eligibility and cache compatibility still require verification. Opening prewarming is separately scoped, not an automatic task for every book. Danish translation, narration and onboarding are not part of the current pipeline; preserve existing assets.

## Edition selection and reader defaults

**Approved by Anders, 2026-09-24.**

- Fetch the original-language text when a suitable, verifiable source is available. Document any availability gap; do not invent an original or silently substitute a translation.
- For works not originally written in English, fetch multiple good human English translations when available and permitted for Tinct's use. Select for fidelity, completeness and readability, not quantity. Record each translator, edition, provenance and rights evidence separately.
- Select and pin one authoritative human English baseline for Tinct Modern E. Other translations may inform review, but do not silently mix their readings; document substantive source variants.
- Default primary reading edition: **Tinct Modern E** (`modern-en`), once reviewed and accepted.
- Default Compare edition: **the most accessible suitable human English translation**, or **the English original** for works originally written in English. Record the editorial choice and its reason. A non-English original remains an optional edition, not the automatic comparison default for an English reader.
- Additional translations remain selectable. Preserve each translation's own text and paragraph structure; verify cross-edition mappings before marking it aligned. Do not force independent human translations into false paragraph equality.
- These are initial defaults, not instructions to overwrite readers' saved edition choices. App changes implementing them belong to the coding agent.

For an English-original work such as Virginia Woolf's *To the Lighthouse*, fetch the original English text; there is no separate English human translation to source. The intended reading pair is accepted Tinct Modern E as primary and Woolf's original as Compare. The original is the fetched source, not the only eventual reading edition. Preserve deliberate literary ambiguity and voice in any modernization.

## Featured ten-book selection

**Approved by Anders, 2026-09-23.** These ten books, in the supplied order, are the selection for the featured-book and opening-audio rollout. This supersedes the earlier suggestion to take the first ten entries from the existing 16-book popular shelf. Recording this decision does not itself change the live shelf or generate audio.

The assessments below are Anders’s supplied editorial rationale, preserved as given. They describe the value of modernization with the current source, not a blanket claim that every classic requires rewriting or that each modern edition has passed full quality acceptance.

| Book | Value of modernization | Rationale |
|---|---|---|
| Frankenstein | Helpful | The original is readable, but long sentences and older phrasing create friction, especially in audio. Our modernization appears worthwhile. |
| The Odyssey | High with our current source | It needs an English translation; how accessible it is depends on that translation. Modernizing our older English source offers substantial benefit. |
| Jekyll and Hyde | Helpful | Short doesn’t always mean easy: Victorian vocabulary, indirect phrasing and allusions can impede listening. Our version improves access. |
| Pride and Prejudice | Low–moderate | Already lively and understandable for many readers. Light explanations of social customs and unfamiliar words may help more than extensive rewriting. |
| Meditations | High with our current source | Older translation language and unexplained Stoic concepts obscure otherwise useful observations. A strong case for clearer English. |
| Crime and Punishment | Moderate; translation-dependent | An English translation is essential, but an older translation can still be readable. Target awkward language; preserve psychological detail and voice. |
| Jane Eyre | Helpful, selectively | Much of the original is engaging and clear. Some elaborate passages benefit from modernization, but our current losses show the danger of over-compression. |
| The Prince | Helpful with our current source | Clearer syntax and explanations of historical terms help. The political arguments themselves need not be simplified. |
| Julius Caesar | High | Shakespeare’s vocabulary, syntax and wordplay are real barriers. Modern English can make the drama immediately accessible. |
| Candide | Low–moderate; translation-dependent | Fundamentally brisk and readable in a good English translation. Historical references often need more help than the storytelling. |

Stable book IDs in the same order: `frankenstein`, `odyssey`, `jekyll-and-hyde`, `pride-and-prejudice`, `meditations`, `crime-and-punishment`, `jane-eyre`, `the-prince`, `julius-caesar`, `candide`.

Opening-audio planning follows [the audiobook plan](docs/audiobook-architecture-2026-09-21.md#approved-next-rollout--23-september-2026): Grok Ara and Helios, bounded opening preparation for this selection, then shared on-demand generation and caching. The previous deployed voice contract remains historical implementation evidence until the migration is implemented and verified.

---

## Appendix — Related documents

- [`docs/in-copyright-books-research-2026-10-01.md`](./docs/in-copyright-books-research-2026-10-01.md) — the research behind [What we will not do](#4-what-we-will-not-do).
- [`MANIFESTO.md`](./archive/old-docs/MANIFESTO.md) — the public argument for Tinct.
- [`ELEVATOR-PITCH.md`](./ELEVATOR-PITCH.md) — 60-second spoken version.
- [`BACKLOG.md`](./BACKLOG.md) — current work items and priorities.
- [`DECISIONS.md`](./DECISIONS.md) — the live decision log.
- [`books/README.md`](./books/README.md) — how books are added.
