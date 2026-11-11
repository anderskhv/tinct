# Tinct — Strategy

**Last updated:** 2026-11-11 (positioning and launch plan approved by Anders; sections 1–11 rewritten). The dated sections directly below are earlier approved decisions and are unchanged.

The one-minute version is in [ELEVATOR-PITCH.md](./ELEVATOR-PITCH.md). The earlier emotional argument is in [MANIFESTO.md](./archive/old-docs/MANIFESTO.md). This document says what Tinct is, for whom, how it is described, and what happens next.

## Positioning in one paragraph

**Approved by Anders, 2026-11-11.** Tinct is the reader for hard texts. The promise is **"No text is beyond you."** The classics library is the free front door: it needs no upload, works in seconds, and is the one thing nobody else has. Reading your own books, papers and articles with the same margin is the paid depth. The product does both; the message leads with one. A stranger hears about a book they always meant to finish, and meets "bring your own" after the margin has earned their trust.

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

## 1. Mission

Deliver the world's best reading experience for texts that are worth the effort.

The books that shaped the West have been handed on for thirty centuries because each generation read them and argued with them. Today most readers who open Homer or Dostoevsky stop in the first fifty pages, and the same happens with a demanding modern book or a dense paper. The texts did not get worse. Reading them alone got harder to sustain. Tinct exists so that a willing reader finishes what they start and understands it.

---

## 2. Product

**One sentence:** Read the books you always meant to finish, in modern English beside the original, with a guide in the margin who knows your page. Then bring your own.

**The front door: the public library (free).**
- 114 books live on 11 Nov 2026: the Western canon, plus books published with their rights holders' permission (the Critical Rationalism shelf).
- A Tinct Modern English edition beside the original or a human translation, aligned so Compare shows the same passage.
- Primers, spoiler-safe character cards, highlights, notes and sync across devices.

**The depth: Premium ($5 a month).**
- The AI margin: explain, ask, summarize, catch me up, quiz, Talk. Metered as a monthly allowance shown as a usage bar.
- Narration that follows the text.
- Add any book: your own PDF, EPUB, pasted text or article, and books from Gutenberg and other free libraries, read with the same margin.

The pricing table at tinct.app/about is the source of truth for what each tier includes; keep this section in step with it.

**What Tinct is not:**
- A summary service. It supports reading the text; it does not replace it.
- An ebook store. It sells no books.
- A general "chat with your PDF" tool. Own documents are for reading start to finish, with the margin as help. The message never leads with them.
- A social network. Reading time and friends exist to bring readers back to a book, not as a feed.

---

## 3. Target reader

**They gave up on a book they still want to have read.** *War and Peace* at page seventy, the *Odyssey* at book three, *The Beginning of Infinity* at the chapter on quantum theory. They are adults with contested attention who believe there is something in these texts for them.

They arrive wanting a specific book, not a reading app. The entry is therefore always a book.

Evidence the audience exists (figures from April 2026, not reverified):
- [37.6% of US adults read a novel in 2022](https://www.publishersweekly.com/pw/by-topic/industry-news/bookselling/article/93659-nea-finds-worrying-drop-in-reading-participation.html), the lowest rate since tracking began in 1992.
- Daily reading time fell [43% over 20 years](https://pmc.ncbi.nlm.nih.gov/articles/PMC12496190/).
- [Audiobook sales grew strongly in 2024](https://www.publishersweekly.com/pw/by-topic/industry-news/publisher-news/article/97920-audiobook-sales-rose-13-in-2024-to-2-2-billion.html), and BookTok made *Pride and Prejudice* and *Wuthering Heights* mainstream reads again.

**What our own readers show (Supabase aggregates, 11 Nov 2026, Anders and test accounts excluded):** 39 accounts; 25 with recorded reading since 6 Sep; 15 of those read on one day only; 6 read on four or more days; median total reading nine minutes. The most-opened books are the *Odyssey* and the Bible. Readers start and are not pulled back. The sample is small because Tinct has not launched; it does not show whether the product retains.

---

## 4. Messaging

| Use | Words |
|---|---|
| Promise | No text is beyond you. |
| Under it | Read the books you always meant to finish, in modern English beside the original, with a guide in the margin who knows your page. |
| Second beat | Then bring your own. Any book, paper or article gets the same margin. |
| Launch headline | I put 114 classics into modern English, side by side with the originals, in a free reader. |

Rules:
1. **Lead with a book, never with the reader.** Every link, post and invitation names one book and lands on it (`/read/{bookId}`).
2. **Show the comparison.** The same passage in the original and in Modern English is the proof; use it wherever a picture is allowed.
3. **Ask for a commitment with a date.** "Read the *Odyssey* with me from 1 December" works where "try my app" does not. The invitations that worked so far (a book club, Anders's children) were people reading one book together.
4. **Own books are the second sentence.** Exception: an audience that arrives for a specific non-classic (the critical-rationalist community) is led with that book.

---

## 5. Competitive position

Prices and competitor details below were last checked in April 2026.

| Alternative | What it lacks |
|---|---|
| Project Gutenberg, Standard Ebooks | The text only. No modern edition, no help, no reason to come back. |
| Kindle and Audible | Sell the book twice; no modern edition, no margin. |
| SparkNotes, No Fear Shakespeare | Replace the reading, or cover Shakespeare only. |
| Rebind | Guided classics with celebrity commentary; a small catalogue. |
| AI document readers (Gloss and similar) | A margin for your own files; no library, no editions, nothing to read on arrival. |

**What is hard to copy:** the Modern English editions, aligned to their sources and reviewed book by book, with primers and spoiler-safe character cards. The margin itself can be copied; a reviewed library cannot be copied quickly. The margin reader for own books keeps a reader in Tinct after the first classic; it is not the reason they come.

---

## 6. Revenue model

**Free:** every book in the public library, original and modern editions side by side, highlights, notes and sync.
**Premium, $5 a month or $50 a year:** the AI margin (a monthly allowance, with top-ups), narration, and adding any book. New accounts get a free month without a card.

Priced near cost so price is never the barrier. That leaves no margin to buy readers, so growth has to come from channels that cost time rather than money (section 7).

Every signed-in account has Premium until **4 January 2027**. That date is the first real test of whether readers pay. Pricing does not change before 20 readers who are strangers to Anders have paid.

---

## 7. Launch plan — now to 4 January 2027

**The problem to solve:** readers open a book once and nothing brings them back. Features are frozen until the launch is out; the only building allowed is what this plan names, each as an explicitly assigned task.

**The one number:** of the readers who start a book, how many read again in their second week.

**Week of 11 November: learn and prepare.**
- Anders talks to the readers who came back on four or more days and to three who read once. Two questions: which book did you want to read, and what stopped or brought you back?
- Walk the signed-out first five minutes on a phone, from a `/read/odyssey` link to the first page turn, and fix only what blocks it.
- Record a 45-second screen capture: a hard passage, Modern English beside it, one question asked in the margin.

**Week of 18 November: the warm audiences, one book each.**
- Critical-rationalist chat: lead with the five Conjecture Institute books, free on Tinct with the publisher's permission, and "bring *The Beginning of Infinity* and read it with the same margin".
- N3Q chat and the book club: no general announcement. One invitation to the December read below.
- X (@FallibleMusings, 2,600 followers): the demo video pinned, then a recurring post three times a week: one passage, original against Modern English.

**1–24 December: "The Odyssey in 24 days".** One book of the poem a day, about half an hour in Modern English, ending on Christmas Eve. It is the most-opened book in the library. First version needs no code: a daily post with the day's link, and replies as the discussion. A daily email with the day's portion is the one build worth assigning if sign-ups justify it.

**Early December: Show HN,** with the launch headline, on a weekday when Anders is free for 72 hours. Product Hunt on a separate day.

**1 January: "War and Peace in a year".** 361 chapters, one a day. Announced to everyone who joined the December read.

**4 January: Premium ends for free accounts.** Count who pays.

**Targets for 4 January (first guesses, to be corrected by the first two weeks):** 300 accounts; 60 readers active in their second week; 100 people in the December read; 5 paying strangers.

**Not now:** new reader features, more books beyond those in progress, pricing changes, paid advertising, Android release, social features. [GROWTH-PLAN.md](./GROWTH-PLAN.md) keeps the longer list of ideas; where it disagrees with this section, this section wins.

---

## 8. Library

**Core:** the Western canon in original or authoritative English editions with a Tinct Modern English reading edition, as set out in the approved sections above. Use the registry and `books/wip_inventory.py` for current counts.

**Classics first, open to other books** (Anders, 2026-10-08). Other books join when their rights holders permit it; the first are the five Conjecture Institute books, published with Logan Chipkin's permission. They are never labelled public domain, keep their publisher and copyright lines, and get no Modern English edition when already written in modern English.

**Readers' own books** (reverses the April position that this was a separate product). Private to the reader, never part of the public library, covered by account export and deletion.

**Danish:** a few explicitly allowlisted Danish editions are offered as exceptions; the language scope above is otherwise unchanged.

**Out of scope:** kids editions as a separate line (dropped 2026-03-25).

---

## 9. Future bets — named, not committed

- **Reading programmes as a product:** daily portions, a guide's note and a cohort calendar, if the December and January reads retain.
- **Schools and book clubs:** group reading and teacher views. The strongest institutional route, and a different product surface.
- **Additional languages:** deferred, per the language scope.
- **Hardware and author-guided editions:** parked.

---

## 10. Open questions

1. **Does a dated group read bring readers back?** The December read answers this.
2. **Which door converts better for which audience,** a classic or their own book? Own-book reading time has been counted only since 10 Nov 2026.
3. **Will anyone pay at $5?** 4 January answers this.
4. **Is Tinct a business or a mission project priced at cost?** Decide after the first paying cohort, not before.

---

## 11. Design principles

1. **Reading comes first.** The text is the hero; everything else serves understanding.
2. **Available but not pushy.** The margin is there when wanted and invisible otherwise. The reading angle is free and always skippable.
3. **Never lose the reader's place.**
4. **Typography:** Playfair Display for titles, EB Garamond for book text, system UI for controls; never mono. Rules in `docs/design-system.md`.
5. **Honest editions.** Modern English serves comprehension. It does not editorialise, and provenance is recorded.
6. **Free at the point of reading.** Public-library text is never charged for.

---

## Appendix — Related documents

- [`ELEVATOR-PITCH.md`](./ELEVATOR-PITCH.md) — spoken version; to be brought in line with section 4.
- [`GROWTH-PLAN.md`](./GROWTH-PLAN.md) — longer list of growth ideas (June 2026).
- [`BACKLOG.md`](./BACKLOG.md), [`DECISIONS.md`](./DECISIONS.md), [`AGENTS.md`](./AGENTS.md), [`CLAUDE.md`](./CLAUDE.md).
