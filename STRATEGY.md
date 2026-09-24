# Tinct — Strategy

**Last updated:** 2026-04-21

The full emotional argument is in [MANIFESTO.md](./archive/old-docs/MANIFESTO.md). The one-minute version is in [ELEVATOR-PITCH.md](./ELEVATOR-PITCH.md). This document is the strategic machinery behind both — what we're building, for whom, against whom, and how the economics work.

---

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

## 1. Mission

The books that shaped the West — Homer, Dante, Dostoevsky, Shakespeare, the Bible — have been passed hand to hand for thirty centuries. They survived because each generation read them, argued with them, and handed them on.

That chain is breaking. Not because the books got worse. Because accessing them got harder. The translations are a century old. The names are confusing. Most readers give up in the first fifty pages and go back to a feed that asks nothing of them.

**Tinct exists to repair this transmission mechanism.** Every classic in an authoritative English translation, with an AI companion and modern comparison translation to help you understand it. A character tracker that never spoils. An audiobook that picks up where you stopped reading. The books remain as interesting as they have always been. Tinct is the way back to them.

---

## 2. Product

**One sentence:** A new way to read the classics — every book in an authoritative English translation, with an AI companion, comparison translation, and audiobook that all read with you.

**Free (forever, no account required):**
- Every classic in an authoritative English translation, with a modern comparison translation for side-by-side comprehension
- Read on phone, tablet, desktop, or e-reader — cross-device sync with a free account
- Highlights, notes, reading journal that builds over time

**Premium — $3/month (first month free, no card required):**
- An AI companion that knows your current page and your reading angle
- A character tracker that shows who everyone is, only as far as you've read
- A synced audiobook that picks up where you stopped reading
- Reading journal export and search
- 200 AI chat messages per month (top-up packs: $3 / 100 messages, account-level balance)

**What Tinct is not:**
- An ebook store — doesn't sell books, doesn't compete with Amazon's catalogue
- A summary service — doesn't replace reading, supports it
- A social reading platform — the relationship is between reader and book, not reader and other readers
- Content-agnostic — built for the Western canon, not for whatever EPUB someone uploads

---

## 3. Target reader

Specific and recognisable:

**They tried to read *War and Peace* and gave up at page seventy.** They want to have read Homer. They respect Dostoevsky without having finished him. They believe there's something in these books they need — and they are tired of the cycle of opening, bouncing, giving up, reaching for the feed instead.

They are not literature professors. They are not undergraduates getting paid to read. They are adults whose time is constrained, whose attention is contested, and whose intuition keeps pulling them back to the books they couldn't quite finish.

**What the data says about the size of this audience:**
- [37.6% of US adults read a novel in 2022](https://www.publishersweekly.com/pw/by-topic/industry-news/bookselling/article/93659-nea-finds-worrying-drop-in-reading-participation.html) — the lowest rate since tracking began in 1992
- Daily reading time fell [43% over 20 years](https://pmc.ncbi.nlm.nih.gov/articles/PMC12496190/)
- English majors [down 33% since 2009](https://hechingerreport.org/proof-points-the-number-of-college-graduates-in-the-humanities-drops-for-the-eighth-consecutive-year)
- But: [audiobook sales grew 22.5% in 2024](https://www.publishersweekly.com/pw/by-topic/industry-news/publisher-news/article/97920-audiobook-sales-rose-13-in-2024-to-2-2-billion.html) — largest jump ever recorded
- And: BookTok revived *Pride and Prejudice* and *Wuthering Heights* as mainstream reads

**Interpretation:** The audience for classics is alive. The access mechanism is broken. The readers who would engage these books if engaging them felt possible are still there, and they are reachable. This is a repair job, not a revival.

---

## 4. Competitive position

No competitor offers a reading experience purpose-built for classics + AI + multiple editions at anywhere near Tinct's price.

| Platform | What they offer | Monthly cost |
|---|---|---|
| **Tinct** | Classics in authoritative translation + AI comparison translation, AI companion, audiobook, character tracker | **$3** |
| Kindle + Audible (full equivalent) | Classics reading + professional audio, no AI, no modern translation | ~$8–21 |
| Kindle Unlimited | Ebook library, no AI, no translations | $11.99 |
| Audible Plus | Classic audiobooks in catalogue, no text sync, no AI | $7.95 |
| Local book platforms (Saxo, Thalia, Fnac, Kobo Plus) | Big libraries including new copyrighted books, no AI, no modern translations | $10–20 |
| No Fear Shakespeare / SparkNotes | Side-by-side Shakespeare only, no AI | $2.08 annual |
| **[Rebind](https://rebind.ai/)** | AI companion with celebrity author guides (Atwood, Rushdie) — only true head-to-head competitor | Unlisted |
| Standard Ebooks / Project Gutenberg | Free public domain text, no reader app, no AI | Free |
| Library apps (Libby, Ereolen) | Free loans from real libraries | Free |

**The structural moats:**

- **Against free alternatives** (Gutenberg, Standard Ebooks, Libby): Tinct is a reading platform, not a text archive. Free works for the most motivated; it doesn't work for the reader who keeps giving up. The reading angle, the AI companion, the character tracker, the translations — these are the reasons a reader finishes the book at all.

- **Against Amazon:** Tinct is ~85% cheaper than the Kindle + Audible equivalent and offers what they don't (modern translations, AI companion, reading angle). Amazon has no incentive to build this — their model is selling you the book twice (Kindle + Audible), not helping you finish one.

- **Against local platforms:** Their advantage is new copyrighted books. The classics reader doesn't need those.

- **Against Rebind:** Tinct covers more books, has modern translations, and costs less. Rebind's advantage is celebrity author voices — a genuine marketing hook, but one that limits catalogue growth. They can only scale as fast as they can record conversations with living authors.

**The AI gap is the structural moat.** Any text reader can add an AI chat button. The moat is the book-specific context: reading angles, character trackers trained per book, chapter-aware responses, cast cards that respect spoilers. These compound with every book we add. A generic "ChatGPT your ebook" alternative will never have this context.

---

## 5. Revenue model

**Free** — every book, every edition, cross-device sync, highlights, notes, reading journal.
**Premium — $3/month** — AI companion (200 messages), audiobook, character tracker, journal export. First month free, no card required. Cancel anytime.

**Why $3:**
- **Less than a cup of coffee** — positions the price as trivial in the reader's head
- **Less than a single ebook on Kindle** — positions it as an obvious bargain
- 2–3× cheaper than Kindle Unlimited, Audible Plus, Scribd, Readwise
- 4–7× cheaper than local platforms (Saxo, Thalia, Fnac, Kobo Plus)
- Technically viable at ~70% chat utilisation (~$2.80 API cost + $0.40 Stripe; thin margin but sustainable)

**Mission-priced, not profit-maximised.** The lowest defensible price, because the mission is to remove barriers. If AI costs drop (they will), margins expand. If usage patterns require it, tiered pricing comes later. For now, tiny price is the whole point.

**Top-up packs** ($3 / 100 additional messages) handle the heaviest users without forcing a subscription upsell.

---

## 6. Library

**Current language scope:** original/authoritative English editions and modern-English reading editions, with aligned reading and narration where available. Danish coverage is not a publication requirement. Use the current registry and inventory tooling for book and audio coverage; the former April count and universal EN/DA completion claim are not a current inventory.

**End of 2026: 100+ titles.** Expansion across the Western canon — more Plato, more Shakespeare, additional 19th-century fiction (Flaubert, Austen, Dickens), more devotional/philosophical works (Calvin, Aquinas, early Christian writings), more 20th-century modernists where public domain permits.

**Long-term: the Western canon end-to-end.** Homer to Kafka, Genesis to the Church Fathers, Greek tragedy to Russian modernism. Anything that has survived a century of readers and still has something to give.

**Out of scope:**
- **Kids editions** — dropped 2026-03-25. Diluted the product without growing the audience.
- **Contemporary fiction / nonfiction** — not the mission.
- **User-uploaded EPUBs (BYOB)** — a separate product if we ever build it. Not a feature on the side.

---

## 7. Current phase — content expansion + launch

**Phase 1 (Dec 2025 – March 2026): Product — DONE.**
Reader, multi-edition, AI chat, highlights, notes, reading journal, character tracker, audiobook, auth (Supabase, Google OAuth), Stripe billing, cross-device sync, offline mode, Android wrap, 34 books live at tinct.app.

**Phase 2 (April 2026 – ongoing): Content expansion + design refresh + launch.**
- Design refresh per new design system (Playfair Display / EB Garamond / IBM Plex Mono, teal accent, refined layouts) — landing page, reader, onboarding
- Book additions: 50–100 more titles across the canon
- Onboarding overhaul centred on the reading angle — research confirmed personal connection before reading begins is the single strongest completion driver
- Marketing: manifesto goes public at `/about`, elevator pitch for live conversations, landing page aligned with both
- Growth channel: SEO-driven traffic to per-book landing pages, each with the reading-angle onboarding as conversion mechanism
- First paying users beyond friends and family

**Phase 3 (late 2026 / 2027): Scale.**
Decisions deferred until we get there: whether to raise price, introduce tiers, introduce additional target languages after explicit approval, explore B2B distribution (schools, book clubs). None of these are committed.

---

## 8. Future bets — named, not committed

**BYOB (Bring Your Own Book).** Expand from curated classics to any EPUB. The 2026-03-24 strategy session outlined a three-tier library model (free public domain / DRM-free / user's own files). Revisit only after the classics-only product retains users.

**Hardware.** Custom e-reader with voice interaction. Software must validate first. Currently parked indefinitely — building consumer hardware is company-scale work and a distraction from the real product.

**Additional languages.** Deferred, with no committed first language, cost estimate or launch sequence. Current work should preserve the localization and translation flexibility described in [Language scope](#language-scope).

**School / book-club tier.** Teacher dashboards, group reading, shared notes, angle suggestions for classrooms. Potentially the strongest distribution moat (institutional adoption) but requires a different product surface. The strongest candidate for Phase 3.

**Author-guided editions.** Rebind's celebrity-author approach at lower cost — pay a living author for a 2-hour conversation about a classic that influenced them, generate the AI companion from it. Interesting; distracting until core product is proven.

---

## 9. Open questions

**1. What's the launch floor for book count?**
Current thinking: 50 titles. Enough to feel like a library; not so many that QA becomes a bottleneck. 100+ by year end.

**2. What's the first real growth channel?**
- **SEO** — one landing page per book, indexable, converts via reading-angle onboarding. Most defensible long-term.
- **Twitter/X** — @FallibleMusings audience is the right demographic (Deutsch-adjacent, literary, optimistic-about-civilisation). Slower but pre-qualified.
- **Paid acquisition** — likely unprofitable at $3/mo. Deprioritised.
- **Word of mouth** — slow but compounds. Reading angle + character tracker are the kind of features readers tell each other about.

**3. What's the retention mechanism beyond the first book?**
- Reading journal, highlights, and character tracker build switching costs
- 50–100 book library gives runway
- No data yet — retention is the Phase 2 question to answer empirically

**4. What happens when AI costs drop 10×?**
Unit economics become trivial. $3/mo becomes a ~90% margin product. Good for Tinct. Likely within 18 months.

**5. How do we measure mission success?**
Not subscriber count alone. The better proxy: books finished per user. If a reader finishes three classics they'd never finished before, the transmission mechanism worked for them. Build telemetry to track this early.

---

## 10. Design principles

1. **Reading comes first.** The text is the hero. Everything else is in service of understanding.
2. **The reading angle is the product.** Not a feature — the mechanism that makes classics completable. Free for everyone. Set before reading begins.
3. **Available but not pushy.** AI chat, reflection prompts, annotations — present when you want them, invisible when you don't.
4. **Beautiful typography.** Warm, literary aesthetic. Playfair Display, EB Garamond, IBM Plex Mono. Not clinical, not techy.
5. **Honest translations.** Modern translations focus on comprehension. They do not editorialise or moralise. Readers get the author's mind, not the translator's.
6. **Free at the point of reading.** Never charge for access to public domain text. Premium is for the enhancement layer (AI, audio, cast), not the books themselves.
7. **Cross-device from day one.** Phone, tablet, desktop, e-reader. The reader's place in the book is always preserved.

---

## Appendix — Related documents

- [`MANIFESTO.md`](./archive/old-docs/MANIFESTO.md) — the public argument for Tinct. Goes live at `/about`.
- [`ELEVATOR-PITCH.md`](./ELEVATOR-PITCH.md) — 60-second spoken version for conversations.
- [`BACKLOG.md`](./BACKLOG.md) — current work items and priorities.
- [`CLAUDE.md`](./CLAUDE.md) — project CEO operating file.
- [`SESSION.md`](./SESSION.md) — current session state.
