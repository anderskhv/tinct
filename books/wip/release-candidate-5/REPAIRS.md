# release-candidate-5: two repaired modern-en editions (walden, on-liberty)

Sources: `content/modern-en-repair-r9` (walden), `content/modern-en-repair-r10` (on-liberty). Integrated with
`prepare-modern-en-repairs.py --mappings books/wip/release-candidate-5/approved-mention-mappings.json` and
`build-text-change-migration.py` (before = origin/main's file, revision `text-2026-10-01.1`).

| Book | changed paragraphs | mentions before -> after | cards anchored |
|---|---|---|---|
| walden | 499 | 27 -> 26 | 8/8 |
| on-liberty | 126 | 76 -> 75 | 33/33 |

Remaining dropped mentions: walden brister-freeman 14:3 (repair uses "he"), on-liberty jesus 2:37 ("the sayings of Christ" -> "his sayings").

Not integrated by decision (2026-10-01): social-contract and discourse-on-inequality (G. D. H. Cole 1913 base text, rights unresolved for Denmark/EU).

Notes: the walden candidate puts verse lines on separate lines inside one paragraph (196 `\n`; the original has none, the live
modern had none). Paragraph counts, chapters and metadata equal the live edition. Walden/on-liberty have no '!' shortfalls.
