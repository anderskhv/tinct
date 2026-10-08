# Conjecture Institute books: content package (October 2026)

Owner request (Anders, 8 Oct 2026): add five Conjecture Institute / Conjecture Press books to the public library with their real covers. They go in House **Philosophy**, on a new shelf **Critical Rationalism**. Logan Chipkin has granted permission. These books are in copyright; they are not public-domain texts.

Branch `content/conjecture-books`, cut from `origin/main` at `02c613d836`. Content-only, following `books/BOOK-TASK-WORKFLOW.md`.

| Book id | Title | Author / editor | Year | Chapters | Paragraphs | Words | Figures |
|---|---|---|---|---|---|---|---|
| `the-sovereign-child` | The Sovereign Child | Aaron Stupple (with Logan Chipkin) | 2025 | 15 | 733 | 55,213 | 0 |
| `lords-of-the-cosmos` | Lords of the Cosmos | Arjun Khemani and Logan Chipkin | 2025 | 30 | 800 | 44,090 | 11 |
| `bold-conjectures-volume-1` | Bold Conjectures, Volume I: Select Interviews of David Deutsch | ed. Logan Chipkin | 2025 | 26 | 2,254 | 141,161 | 0 |
| `bold-conjectures-volume-2` | Bold Conjectures, Volume II: Essays Across Physics | ed. Logan Chipkin | 2026 | 18 | 1,222 | 74,611 | 18 |
| `the-farthest-reaches` | The Farthest Reaches | Brett Hall | 2026 | 25 | 382 | 39,924 | 1 |

## Layout

```
README.md                 this file
SOURCE.md                 source EPUB provenance, SHA-256, identification, covers
CONVERSION.md             conversion method, verification results, text-quality notes
INTEGRATION.md            what Codex needs to do (registry, taxonomy, shelf, covers, figures)
taxonomy-proposal.json    new shelf definition + LIBRARY_BOOK_META proposals
package-summary.json      per-book counts and hashes of committed files
rights/permission.md      permission GRANTED (text record), rights holders, covered uses
<book-id>/
  <book-id>-original-en.json   edition candidate (the only edition)
  cover.jpg                    real cover from the EPUB, full EPUB resolution
  figures/                     figure images referenced by the edition
  onboarding.json              onboarding in the current schema (acclaim empty)
  metadata-proposal.json       registry/metadata proposal
  qa/                          preconversion log, structure ops, app + strict verification, validation
```

Not included, by instruction or policy: modern-en editions, narration or audio, Danish, character sidecars, SEO pages, and the source EPUBs (hashes are pinned in SOURCE.md).
