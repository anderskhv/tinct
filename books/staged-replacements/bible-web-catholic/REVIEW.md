# Review record — WEB Catholic staging

**Outcome: ACCEPTED on 24 September 2026.** No blocking defects remain open.

Two reviewers with fresh context, who took no part in authoring the packet, checked it with their own code and their own downloads of the official sources.

| Review | Report | Result |
| --- | --- | --- |
| Wording, completeness and structure | [review/wording-and-completeness.md](review/wording-and-completeness.md) | **ACCEPT** |
| Esther/Daniel numbering and passage map | [review/esther-daniel-map.md](review/esther-daniel-map.md) | Initial REJECT (one blocking defect, B1), fixed, then **ACCEPT** on re-review |

## Wording and completeness

The reviewer re-downloaded the USFM, USFX, VPL and read-aloud archives. Their hashes equal the pins. The reviewer then wrote an independent USFM parser before reading `stage.py`. Results:

- **All 35,519 text keys, 0 mismatches.** These are the verses, superscriptions, `SIR.51.pre` and `SIR.PROLOGUE`. The comparison was made both against `verse-text.json` and against the text read back through the crosswalk spans. A weighted random sample of 326 verses was also checked on its own.
- Per-book word counts are equal: 859,933 words in total.
- Span coverage is complete, with no overlaps.
- The 29 empty verse slots are the same set in the source and the candidate.
- No editorial text leaked into the reading paragraphs, and no footnote text leaked either.
- The book order equals the official metadata list, and `ESG` and `DAG` keep their own codes.
- Revelation 22 contains no Gutenberg text.

The reviewer raised one should-fix: `REVIEW.md` and `SHA256SUMS` were missing. Both have since been added. The reviewer's notes have been folded into the README:
- the correct VPL count description
- two more glued-word source readings, kept verbatim
- the fact that no range labels appear in the text
- the presentation decisions for the integrator

## Esther/Daniel map

The reviewer checked every recorded location in `web-en` and `kjv-en` with its own parser: 1,042 checks, 0 mismatches. It also read Daniel 3:91–97 against `web-en`, `kjv-en` and BSB, and spot-checked 33 DAG rows. For Esther, it read all 19 flagged rows and 26 unflagged rows by hand. **No `hebrewRef` needed to change.**

| Finding | Resolution |
| --- | --- |
| **B1 (blocking)**: ESG 5:1–2 (Addition D, unbracketed in the source) looked like ordinary counterparts, so a partial highlight of addition text would have projected onto Hebrew Esther 5:1–2 | New kind `hebrew-tradition-counterpart-with-unbracketed-addition`, set to `projection: whole-verse-only`. Every row now carries an explicit `projection` rule, and the README has a projection table. |
| S1/S2: the method description implied similarity alignment for Esther | Note and docstring now say that DAG is aligned by similarity, while ESG records the source's stated numbering and scores it |
| S3: flagged-row count | Corrected to 17 + 2 = 19 |
| S4: `REVIEW.md` was missing | This file |
| N1: the versification check did not stop the script | `passage_map.py` now exits on a mismatch |
| N2: footnote key | `DAG.3.23` is now documented |
| N3: boundary overlaps | `boundaryNote` added on ESG 1:18, 9:16, 9:27 and 10:2 |
| N4: reverse direction and reading positions | `positionFallbackHebrewRef` added on addition rows; README guidance added |

One residual note, accepted: a partial highlight of an overlapping clause in a `boundaryNote` row lands on the principal counterpart verse. The README recommends chapter-level projection for Esther highlights.

## Integrity

`SHA256SUMS` covers every committed file in this folder. The candidate edition and its crosswalks did not change after review. Only the passage map was regenerated, to hash `8d55819e…2c28`.
