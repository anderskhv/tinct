# Danish run, 21 October 2026: session prompts

**Scope cut on 21 Oct, after Coder's review, agreed with Anders:** run only Session 0 (the audit) and batches A and E. The output is content branches that never go live. English stays the strategy, and every queued English fix would mean redoing Danish. The other batches stay listed for later.

This uses Anders's spare usage before his free reset expires. Plan and background are in `docs/danish-plan-2026-10-19.md`.

Content only: each session produces a reviewed package on its own branch, and nothing is published. Publishing is one later integration session that adds each passing book to `OFFERED_DANISH_EDITIONS`.

**Left out on purpose:**
- **Shakespeare, Phaedo, Symposium, Discourse on Inequality, Democracy in America, Peloponnesian War, Utilitarianism, Descartes, Poetics, Genealogy:** they have Modern English repairs accepted but not published, so Danish made today would be stale at once.
- **The Bible.**
- **The Conjecture Press books.**

## Session 0: audit (run first, alongside the batches)

```
Danish audit (content only, follow books/BOOK-TASK-WORKFLOW.md). Anders reopened Danish for this run on 21 Oct 2026.

Score every existing modern-da edition in app/public/data/editions/ against the current modern-en of the same book, read-only. Measure:
- paragraph alignment 1:1 per chapter;
- the length ratio da/en per chapter;
- paragraphs left in English: detect them, and count those identical to modern-en;
- books/danish-lint.py and books/qa-danish-deep.py findings;
- whether the book's modern-en changed after the Danish was made: compare the git history of both files, using `git log --all`, because main was squashed on 26 Sep.

Then read a sample of 30 paragraphs per book against the English and judge fluency and accuracy.

Write books/wip/danish-audit-2026-10-21/REPORT.md with one row per book, verdict SHIP (good as is), RETRANSLATE or MISSING, and the evidence. Commit and push the report on its own branch. Do not edit any edition or app file.
```

## Translation batches (one session each, run in parallel)

Use the same prompt for every batch, changing only the book list:

```
Danish translation, content only. Follow books/BOOK-TASK-WORKFLOW.md and read its required references first. Anders reopened Danish for this run on 21 Oct 2026; STRATEGY.md has not been updated yet, so record this assignment in your handoff.

Books: <BATCH LIST>

For each book, make a new modern-da edition from the CURRENT modern-en on origin/main (app/public/data/editions/{book}-modern-en.json). Record that file's git blob hash as the source version.
- Translate paragraph for paragraph. Keep the same chapters, the same number of paragraphs per chapter, and the same order, so the reader can switch editions at any place.
- Use the old {book}-modern-da.json, if it exists, only as a glossary for names, places, recurring terms and quotations. Do not copy its sentences.
- Translate chapter titles too.
- Style: natural, present-day Danish for an adult reader, as if written in Danish.
  - Translate meaning, not words. Prefer verbs to nouns, and avoid anglicisms and English word order.
  - Keep the book's register: plain where the English is plain, formal where it is formal.
  - Use »…« for quotations and dialogue.
  - Keep the author's paragraphing, verse lines and emphasis.
  - Never summarise or skip anything, and never add anything.
- Work chapter by chapter. After each chapter, run a second, independent review pass (a subagent that sees only the English and your Danish) that checks every paragraph for meaning, omissions, English left in and stiff phrasing, then apply its fixes.
- Gates per book:
  - 1:1 paragraph alignment with modern-en;
  - zero paragraphs left in English;
  - da/en length ratio between 0.85 and 1.25 for every chapter (explain any outlier);
  - books/danish-lint.py clean.
- Put everything under books/wip/danish-2026-10-21-<batch name>/: the edition JSON in the same shape as the live files, the source hash, the review log, gate results and a short HANDOFF.md.
- Commit and push the package to your own branch after each finished book, so nothing is lost if the session ends. Do not touch app/**, the live edition files or the registry, and do not merge or deploy.
- Use subagents to translate chapters in parallel. Track words per hour and put the figure in HANDOFF.md.
```

## Batches (by interest to Danish readers, then size)

| Batch | Books | Why |
|---|---|---|
| A novels | pride-and-prejudice, jane-eyre, frankenstein, jekyll-and-hyde | stale |
| B novels | wuthering-heights, sense-and-sensibility, alice-in-wonderland | missing |
| C Russians and sea | crime-and-punishment, notes-from-underground, moby-dick | stale |
| D long | middlemarch | missing, about 316k words, a session of its own |
| E short classics | meditations, the-art-of-war, the-prince, candide, communist-manifesto | missing or stale, short |
| F essays | on-liberty, walden, heart-of-darkness, vindication-rights-of-woman | stale or withheld |
| G philosophy | beyond-good-and-evil, kant-groundwork, hume-enquiry, second-treatise, aristotle-politics | stale |
| H Kierkegaard and faith | fear-and-trembling, confessions | stale or withheld (Confessions Books 10–13 are placeholders) |
| I verse | the-aeneid, paradise-lost, faust-part-1, jerusalem | withheld or too short; verse lines kept as lines |
| J Greek plays | bacchae, medea | missing |

Batches A, B, E and C come first. If there's room, run D and I in parallel; they are the biggest.

## After the run (a later session, not today)

An integration session takes the audit's SHIP list and the passing packages, then:
- adds each book to `OFFERED_DANISH_EDITIONS`;
- refreshes `{book}.da.json` onboarding;
- runs the pre-deploy checklist and deploys.

Anders and Danish friends then read one chapter each of five books.
