# Pinned sources

The character package is anchored to the **exact bytes of the four edition files as served**: `app/public/data/editions/bible-<key>.json`. The loader (`verifyCharacters` in `app/src/services/characters/characterCards.ts`) hashes the fetched file and compares it with `sourceSha256`, so these hashes are what has to stay identical.

| Edition key | Path (repo) | Bytes | SHA-256 (= package `sourceSha256`) | Chapters | Paragraphs |
|---|---|---|---|---|---|
| kjv-en | app/public/data/editions/bible-kjv-en.json | 4,514,903 | `53823ea3d19a3d7b986563f9fb7015be4a75bb102bd6e6a714ee64ceed0ff26e` | 1189 | 6,704 |
| web-en | app/public/data/editions/bible-web-en.json | 4,407,053 | `b0f491656782257e7b20f4a80add615cb363b8f324e54a4c1c457648328762aa` | 1189 | 6,704 |
| bsb-en | app/public/data/editions/bible-bsb-en.json | 4,606,248 | `8da0bc1ae32d9c2e05ba5811d953e24bdff8351913ad8f2199142ca0081c61d9` | 1189 | 38,464 |
| webc-en | app/public/data/editions/bible-webc-en.json | 5,055,438 | `695cff11f0ec1197edf3cc0aa975a7805ed7e36365001f9bfa1ac86703ac52d7` | 1328 | 10,618 |

## Baseline and instruction revision

- Work started from `origin/main` **`fe699e90d8e21a64b0a4ef81084fee48c04a5813`** (“Centre the reading table, show stored recaps at once, make an open recap easy to close (#260)”). The branch `claude/magical-lovelace-85vhtw` was created at that commit.
- `origin/main` was fetched again before handoff and had advanced to **`a9d3386a91163de3ed3170e0b36a24b91d18412b`** (2026-09-30, “Simple public URLs and removal of the legacy app and old /lab library (#261)”). Between the two commits the four edition files, `app/public/data/characters/bible.v1.json`, `app/src/services/characters/**` and every workflow document that governs this task are byte-identical, **except** `AGENTS.md` and `CLAUDE.md`, which only gained the public-URL note and the note that the legacy React `App` reader was deleted. Nothing in either change touches book-content rules, so the package stays valid on `a9d3386a`.
- Instruction files read for this assignment (revision `a9d3386a`; unchanged since `fe699e90` unless noted): `books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `books/AGENTS.md`, `books/CLAUDE.md`, `docs/workflow-boundaries.md`, `STRATEGY.md`, `AGENTS.md`/`CLAUDE.md` (changed as described above).
- Owned path: `books/wip/bible-characters-full/` only. No file outside that folder is changed by this branch.

## Per-chapter files

The reader also fetches `app/public/data/editions-chapters/bible-<key>/chNNNN.json`. Every chapter file in all four editions (kjv-en 1189, web-en 1189, bsb-en 1189, webc-en 1328 chapters) was compared with the full edition file: **0 paragraph differences**, so offsets valid for the full edition are valid for the chapter files.

## Numbering and native codes

- Chapter numbers in the package are the reader’s own running chapter numbers of each edition (KJV/WEB/BSB 1–1189; WEBC 1–1328 with the Catholic books after the Revelation chapter). Nothing is renumbered and no passage is substituted between editions.
- BSB stores one poetic line per paragraph (38,464 paragraphs); its paragraph indexes therefore differ from KJV/WEB and are never reused across editions. Cross-edition decisions were transferred by **verse identity** `(book, chapter, verse, name form, ordinal)`, not by paragraph index.
- WEBC uses its own chapter numbering for the Catholic books (`app/data/bible-webc-en.numbering.json` is the code map). Verse identity for the books shared with the other three editions was matched by book and chapter/verse; Catholic-only books were adjudicated in place.

