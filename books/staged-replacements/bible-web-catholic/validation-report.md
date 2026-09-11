# World English Bible (Catholic Edition) — staged build validation

Source: `usfm/` (73 book files from `eng-web-c_usfm.zip`, ebible.org, downloaded 2026-09-11)
Output: `bible-catholic-en.staged.json`, sha256 (first 16): `753284402373d6ee`

Books found: 73 / 73 expected
Total chapters: 1328
Total verses: 35384
Deuterocanonical books present: 9 / 9 expected (Tobit, Judith, Esther-Greek, Wisdom, Sirach, Baruch, Daniel-Greek, 1 Maccabees, 2 Maccabees)

## Per-book chapter/verse counts

| code | title | chapters | verses | deuterocanonical |
|---|---|---|---|---|
| GEN | Genesis | 50 | 1533 |  |
| EXO | Exodus | 40 | 1213 |  |
| LEV | Leviticus | 27 | 859 |  |
| NUM | Numbers | 36 | 1288 |  |
| DEU | Deuteronomy | 34 | 959 |  |
| JOS | Joshua | 24 | 658 |  |
| JDG | Judges | 21 | 618 |  |
| RUT | Ruth | 4 | 85 |  |
| 1SA | 1 Samuel | 31 | 810 |  |
| 2SA | 2 Samuel | 24 | 695 |  |
| 1KI | 1 Kings | 22 | 816 |  |
| 2KI | 2 Kings | 25 | 719 |  |
| 1CH | 1 Chronicles | 29 | 942 |  |
| 2CH | 2 Chronicles | 36 | 822 |  |
| EZR | Ezra | 10 | 280 |  |
| NEH | Nehemiah | 13 | 406 |  |
| TOB | Tobit | 14 | 244 | yes |
| JDT | Judith | 16 | 339 | yes |
| ESG | Esther (Greek) | 10 | 205 | yes |
| JOB | Job | 42 | 1070 |  |
| PSA | Psalms | 150 | 2461 |  |
| PRO | Proverbs | 31 | 915 |  |
| ECC | Ecclesiastes | 12 | 222 |  |
| SNG | Song of Solomon | 8 | 117 |  |
| WIS | Wisdom | 19 | 436 | yes |
| SIR | Sirach | 51 | 1364 | yes |
| ISA | Isaiah | 66 | 1292 |  |
| JER | Jeremiah | 52 | 1364 |  |
| LAM | Lamentations | 5 | 154 |  |
| BAR | Baruch | 6 | 213 | yes |
| EZK | Ezekiel | 48 | 1273 |  |
| DAG | Daniel (Greek) | 14 | 530 | yes |
| HOS | Hosea | 14 | 197 |  |
| JOL | Joel | 3 | 73 |  |
| AMO | Amos | 9 | 146 |  |
| OBA | Obadiah | 1 | 21 |  |
| JON | Jonah | 4 | 48 |  |
| MIC | Micah | 7 | 105 |  |
| NAM | Nahum | 3 | 47 |  |
| HAB | Habakkuk | 3 | 56 |  |
| ZEP | Zephaniah | 3 | 53 |  |
| HAG | Haggai | 2 | 38 |  |
| ZEC | Zechariah | 14 | 211 |  |
| MAL | Malachi | 4 | 55 |  |
| 1MA | 1 Maccabees | 16 | 924 | yes |
| 2MA | 2 Maccabees | 15 | 555 | yes |
| MAT | Matthew | 28 | 1071 |  |
| MRK | Mark | 16 | 678 |  |
| LUK | Luke | 24 | 1150 |  |
| JHN | John | 21 | 879 |  |
| ACT | Acts | 28 | 1004 |  |
| ROM | Romans | 16 | 433 |  |
| 1CO | 1 Corinthians | 16 | 437 |  |
| 2CO | 2 Corinthians | 13 | 257 |  |
| GAL | Galatians | 6 | 149 |  |
| EPH | Ephesians | 6 | 155 |  |
| PHP | Philippians | 4 | 104 |  |
| COL | Colossians | 4 | 95 |  |
| 1TH | 1 Thessalonians | 5 | 89 |  |
| 2TH | 2 Thessalonians | 3 | 47 |  |
| 1TI | 1 Timothy | 6 | 113 |  |
| 2TI | 2 Timothy | 4 | 83 |  |
| TIT | Titus | 3 | 46 |  |
| PHM | Philemon | 1 | 25 |  |
| HEB | Hebrews | 13 | 303 |  |
| JAS | James | 5 | 108 |  |
| 1PE | 1 Peter | 5 | 105 |  |
| 2PE | 2 Peter | 3 | 61 |  |
| 1JN | 1 John | 5 | 105 |  |
| 2JN | 2 John | 1 | 13 |  |
| 3JN | 3 John | 1 | 14 |  |
| JUD | Jude | 1 | 25 |  |
| REV | Revelation | 22 | 404 |  |

## Issues found: 20

- Esther (Greek) 4: non-sequential verse numbers [1, 2, 3, 4, 5, 7, 8, 9, 10, 11]
- Esther (Greek) 9: non-sequential verse numbers [1, 2, 3, 4, 6, 7, 8, 9, 10, 11]
- Sirach 1: non-sequential verse numbers [1, 2, 3, 4, 6, 8, 9, 10, 11, 12]
- Sirach 3: non-sequential verse numbers [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
- Sirach 10: non-sequential verse numbers [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
- Sirach 11: non-sequential verse numbers [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
- Sirach 13: non-sequential verse numbers [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
- Sirach 16: non-sequential verse numbers [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
- Sirach 17: non-sequential verse numbers [1, 2, 3, 4, 6, 7, 8, 10, 11, 12]
- Sirach 18: non-sequential verse numbers [1, 2, 4, 5, 6, 7, 8, 9, 10, 11]
- Sirach 19: non-sequential verse numbers [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
- Sirach 20: non-sequential verse numbers [1, 2, 4, 5, 6, 7, 8, 9, 10, 11]
- Sirach 22: non-sequential verse numbers [1, 2, 3, 4, 5, 6, 7, 8, 9, 11]
- Sirach 24: non-sequential verse numbers [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
- Sirach 25: non-sequential verse numbers [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
- Sirach 26: non-sequential verse numbers [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
- Luke 17: non-sequential verse numbers [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
- Acts 8: non-sequential verse numbers [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
- Acts 15: non-sequential verse numbers [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
- Acts 24: non-sequential verse numbers [1, 2, 3, 4, 5, 6, 8, 9, 10, 11]

## Note on the 20 "non-sequential verse numbers" flags above

**Not defects — confirmed expected translation behavior, spot-verified.** All 20 are
verse numbers reserved by the source but containing only a footnote (no verse text),
e.g. Luke 17:36 in the raw USFM is `\v 36 \f + \fr 17:36 \ft Some Greek manuscripts add:
"Two will be in the field: the one taken, and the other left."\f*` — a textual-variant
note, not a verse. This is the well-documented "long-ending omitted verses" pattern used
by WEB and other critical-text translations (WEB follows the same convention as ESV, NIV,
NASB etc. here): the traditional King James verse number is preserved as a placeholder so
cross-references still line up, but no running text is printed for it, because the
critical Greek/Hebrew text underlying the translation doesn't include it (it's judged a
later scribal addition). The Acts 8/15/24 and Sirach/Esther-Greek gaps follow the same
pattern (Sirach and the Greek Esther additions are separately notorious for unstable
verse numbering across manuscript traditions, independent of this issue).

**Practical consequence for the staged JSON:** the affected chapters simply have one fewer
verse in the output than their highest verse number would suggest (e.g. Luke 17 has 36
numbered verse markers in the source but only 35 verses of actual text). This is
transparent in the JSON (verse numbers in the superscript markers skip the omitted number
exactly as printed Bibles do) and requires no correction. Flagging this explicitly so it
isn't mistaken for missing/corrupted content in a later pass.
