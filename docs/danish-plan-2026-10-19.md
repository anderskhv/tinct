# Danish: options and a plan (19 October 2026)

This is a plan for Anders to decide on, not a decision. Danish has been out of scope since 21 September (STRATEGY.md, "Language scope"), so going ahead means reopening that.

## Where Danish stands (origin/main, 19 October)

- **Editions:** 95 of the 110 live books have a `modern-da` edition on disk. Readers are offered only 4: To the Lighthouse, A Little Princess, Around the World in 80 Days and The Jungle Book. The list is `OFFERED_DANISH_EDITIONS` in `app/src/data/editionAvailability.ts`.
- **How the old Danish was made:**
  - It was translated from modern-en between March and June 2026, with `books/translate-da.py`.
  - Many of those modern-en chapters were still barely modernised at the time; the May audit found 539 such chapters.
  - The 4 offered editions were redone in October, paragraph for paragraph from the current modern-en, with reviewer passes.
- **Stale:** 29 books had their modern-en content repaired after the Danish was made.
- **Withheld as defective (9):** macbeth, as-you-like-it, faust-part-1, jerusalem, confessions, paradise-lost, heart-of-darkness, discourse-on-inequality, vindication. Each has missing passages or English left in.
- **Suspiciously short** next to modern-en: the-aeneid at 35% of the length, symposium 71%, phaedo 77%, the-republic 86%.
- **No Danish at all (15):** art-of-war, meditations, bacchae, medea, magna-carta, alice, wuthering-heights, middlemarch, sense-and-sensibility, the Bible, and 5 Conjecture Press books.
- **About 19 more modern-en repair packages** were accepted but not published. Publishing them makes those books' Danish stale too.
- **Book onboarding:** 88 Danish files exist (`app/public/data/onboarding/*.da.json`).
- **Audio:** Danish narration is off.
- **Interface:** there is no i18n system. Interface text is English and written inline in about 135 .tsx files, about 70 public JS files and the static HTML, a few thousand strings.
- **Companion:** no prompt sets a reply language. Simplify is fixed to "plain everyday English", and narration is English only.
- **Search:** the catalogue holds 2,520 Danish works (Kalliope 1,656, Runeberg 631, Wikisource 164, Gutenberg 69), but they are filtered out on purpose:
  - `IMPORT_LANGUAGES = ['en']` (`app/public/lab/public-books.js:85`);
  - "Not yet in Tinct" searches in English by default (`add-to-tinct.js:375,711`);
  - the language menu never offers Danish (`add-to-tinct.js:359`);
  - the Worker refuses to import non-English works (`publicBooks.ts:525,573`);
  - the download allowlist has no Kalliope or Runeberg, and only English Wikisource (`public-books.js:56-67`).

## Size

- **Current modern-en, all live books:** 8.5M words, plus about 0.8M for the Bible.
- **The minimum to make everything good:** retranslate the stale, withheld and short books (about 40) and fill the 15 gaps. That is about 4M words.
- **The 61 remaining books:** their Danish is not stale, but it is not proven good either.

## Repair or translate from scratch?

- **Translate from scratch** from the current modern-en for every stale, withheld, short or missing book. Repairing means reading every paragraph against a source that has changed, and the paragraph counts often differ, so it costs about as much as translating and is riskier.
  - Use the old Danish only as a glossary: names, terms, how quotations were rendered.
  - This is how the 4 offered editions were done.
- **Audit, then patch** the 61 books whose modern-en has not changed since their Danish:
  - Score each book automatically: English left in, length ratio, 1:1 paragraph alignment, `books/danish-lint.py` and `qa-danish-deep.py`.
  - A reviewer reads a sample of 30 paragraphs per book.
  - Books that pass ship as they are; books that fail are retranslated.
  - The audit takes about an hour and decides how much of the 61 survives.
- **Every new Danish edition records the modern-en hash it was made from.** When the English changes, the Danish shows as stale, as STRATEGY.md already requires.

## Options

1. **Danish editions only:**
   - Content work, plus one line per book in `OFFERED_DANISH_EDITIONS`.
   - Fastest. The interface stays English.
2. **Danish editions plus a Danish-aware companion** (recommended):
   - Content as in option 1.
   - Small Worker prompt changes: reply in the reader's language, and answer in Danish when the edition is Danish. Simplify and Define produce plain Danish on Danish text.
   - Dictation in Danish already exists.
   - Narration stays off; turning it on later is a spend decision.
3. **Option 2 plus Danish public-domain books:**
   - Open `IMPORT_LANGUAGES` to `da`, add Danish to the language menu, and make Danish searchable when the query looks Danish.
   - The 69 Danish Gutenberg works become importable straight away. Kalliope, Runeberg and Danish Wikisource each need an import adapter.
   - Golden Age Danish, in old spelling and with Danish quotations, would get a "modern Danish" edition, the way English books get modern English. That is a Danish-only reason to use Tinct.
4. **Real localization:**
   - Introduce copy tables and a language setting, move a few thousand strings into them, and translate them.
   - Also Danish landing and sign-in pages, Danish emails, and Danish SEO pages.
   - This is several days of code work on its own, so it should come after Danish content proves it gets read.

## Tomorrow, concretely (option 2)

0. **First (Anders):** reopen the Danish scope in STRATEGY.md, and decide whether to publish the about 19 pending modern-en repairs first or leave those books out of tomorrow.
1. **Audit:** one session, about an hour. Score all 95 existing Danish editions and produce three lists: ship, retranslate, missing.
2. **Translate:** parallel content sessions under `books/BOOK-TASK-WORKFLOW.md`.
   - Each session takes 3–5 books and translates paragraph for paragraph from the current modern-en.
   - An independent reviewer checks each paragraph.
   - Gates: no English left, 1:1 alignment, length ratio between 0.85 and 1.2, and lint clean.
   - Most read first: pride-and-prejudice, jane-eyre, frankenstein, crime-and-punishment, moby-dick, the-prince, candide, jekyll-and-hyde, meditations, alice, wuthering-heights.
3. **Integration:** one session, Claude-owned.
   - Add each passing book to `OFFERED_DANISH_EDITIONS`.
   - Refresh its Danish onboarding (`*.da.json`).
   - Make the companion follow the reader's language (option 2).
   - Run the pre-deploy checklist, then deploy.
4. **Native readers:** Anders and Danish friends read one chapter each of 5 books and report problems in the app.

## Throughput

- All generation runs in Claude sessions, never through the API, as CLAUDE.md requires.
- Translation alone is about 1.4 output tokens per Danish word, and review roughly doubles the cost.
- Measure words per hour in the first hour, then set the day's target from that.
- A realistic day: the audit, plus 20–40 books retranslated, depending on how many sessions run in parallel.
