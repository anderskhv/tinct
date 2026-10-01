# Middlemarch — integration notes (2026-09-30)

Branch `integration/new-books-alice-wh-middlemarch`. Staged only: the `MIDDLEMARCH` constant is in `app/src/data/bookRegistry.ts` but not in `BOOKS`.

## Chapter numbering: the Prelude is unit 1, not 0

The source package numbered the units Prelude = 0, chapters I–LXXXVI = 1–86, Finale = 87. The reader cannot hold chapter 0: `labPosition.ts` coerces it to 1, `labReaderHandoff.ts`, `labChatHistory.ts`, `chapterChatPrompt.ts`, `issueReports.ts` and `readerBoot.ts` reject or drop numbers below 1, and the edition splitter names shards `ch0000`. Changing that is a cross-cutting reader change, so the editions were renumbered instead:

| Unit | Source number | Live number |
| --- | --- | --- |
| Prelude | 0 | 1 |
| Chapter N (I–LXXXVI) | N | N + 1 |
| Finale | 87 | 88 |

Applied uniformly to `middlemarch-original-en.json`, `middlemarch-modern-en.json` and both `editions-chapters/middlemarch-*` shard sets. Titles are unchanged (`Book I: Miss Brooke — Chapter I` is unit 2). Paragraph text and counts are byte-for-byte the accepted package (88 units, 4,674 paragraphs). Any future character sidecar, threads file, SEO page or highlight migration must use the live numbers; `characters/middlemarch.proposal.json` has no coordinates yet, so nothing in it needs converting.

If Anders prefers to keep Eliot's numbering, the alternative is reader support for chapter 0, which is a code task of its own.

## Not done

Character sidecar (`app/public/data/characters/middlemarch.v1.json` and a `characterReleases` entry), cover art, SEO pages, `audioAvailability.json` entries, reading-list membership (none recorded), review by Anders.
