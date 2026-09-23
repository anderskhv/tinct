# Edition colon edits — independent verification (2026-09-23)

**Verdict: VERIFIED CLEAN**

Scope: 14 edits in `edition-colon-edits.json` (book02 v7→v8, book11 v4→v5, book20 v6→v7), checked against PUNCTUATION.md §6 (colon added only to introduce a list; Butler's marks kept) and Butler's `source-bookN.json`. The `paragraph` field is a 0-based index into `paragraphs`. Every edit falls in that paragraph.

## 1. Integrity
| File pair | title | number | paragraph count | each old string unique in from-file | from + listed replacements == to-file |
|---|---|---|---|---|---|
| book02 v7→v8 (3 edits) | same | same | 35 = 35 (source 35) | yes, each occurs 1× | yes |
| book11 v4→v5 (3 edits) | same | same | 54 = 54 (source 54) | yes, each occurs 1× | yes |
| book20 v6→v7 (8 edits) | same | same | 36 = 36 (source 36) | yes, each occurs 1× | yes |

No other changes. The key sets are identical.

## 2. Per-edit checks
The curly-quote counts (“ ” ‘ ’) in the paragraph are the same before and after for all 14 edits. No spaced dash, comma splice or new mark was introduced.

| # | Book/para | New | Butler at that place | Grammar / notes |
|---|---|---|---|---|
| 1 | B02 p6 | `understand it—‘Send` | `understand—‘Send` (dash) | OK. The dash is unspaced and matches Butler's own. |
| 2 | B02 p14 | `answered him, “Mentor` | `answered him saying, “Mentor` | OK |
| 3 | B02 p26 | `spoke fondly to him, “My dear` | `spoke fondly to him, saying, “My dear` | OK |
| 4 | B11 p29 | `among them, “My friends` | `among them, “My friends,” said he` (comma) | OK |
| 5 | B11 p39 | `spoke mournfully, ‘Odysseus` | `spoke piteously, saying, ‘Ulysses` | OK |
| 6 | B11 p52 | `spoke sorrowfully, ‘Poor Odysseus` | `spoke piteously, saying, ‘My poor Ulysses` | OK |
| 7 | B20 p5 | `prayed to Artemis, “Great` | `prayed to Diana saying, “Great` | OK |
| 8 | B20 p6 | `and prayed, “Father Zeus` | `and prayed, saying “Father Jove` | OK |
| 9 | B20 p7 | `spoke to her master, “Father Zeus` | `gave the sign to her master. “Father Jove,” said she` | OK. Butler's full stop works because his tag "said she" follows. The modern text has no tag, so a comma introducing the speech is the correct equivalent. |
| 10 | B20 p11 | `called the maids, “Come` | `called the maids and said, “Come` | OK |
| 11 | B20 p14 | `taunting Odysseus. “Are you` | `gibing at Ulysses. “Are you` (full stop) | OK. The full stop matches Butler, and the quotation stands as its own sentence. |
| 12 | B20 p16 | `his right hand. “Good day` | `right hand; “Good day` (semicolon) | OK. The full stop follows the edition's no-semicolon-before-quote practice, and the quotation is a complete sentence. |
| 13 | B20 p27 | `angrily to Ctesippus, “It’s` | `fiercely to Ctesippus, “It is` (comma) | OK |
| 14 | B20 p28 | `both will accept. ‘As long` | `commend itself to both. ‘As long` (full stop) | OK. This is a nested ‘…’ inside “…”, and the quote balance is intact. |

## 3. Whole-set scan: colon immediately before “ or ‘
Files scanned: book01 v4, book02 v8, book03 v3, book04 v6, book05 v4, book06 v4, book07 v3, book08 v3, book09 v4, book11 v5, book20 v7, and `candidate-accepted.json` for Books 10, 12–19 and 21–24. Paragraph counts match the source in all 24 Books. Pattern: `:\s*[“‘]`.

The scan found 3 occurrences. All 3 are Butler's own colons at the same place, so they are kept under §6:
- B09 p23: `as plausibly as I could: ‘Cyclops` (Butler: `as plausibly as I could: ‘Cyclops`)
- B10 p45: `man by man: ‘You must not` (Butler: `man by man: ‘You must not`)
- B17 p6: `Piraeus spoke first: “Telemachus,”` (Butler: `Piraeus was first to speak: “Telemachus,”`)

There are no colons before a quotation that Butler's paragraph lacks. No defects were found.
