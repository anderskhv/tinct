# Shakespeare's Sonnets (Shakespeare) — pinned source

- Book id: `sonnets` (proposed; no collision with live ids on origin/main, checked 2026-11-26).
- Author: William Shakespeare (1564–1616). Date: 1609 (commonly cited; not stated in the file).
- Source: Project Gutenberg eBook #1041, the same Gutenberg Shakespeare series (#1500–#1545) as Tinct's live plays (e.g. Henry IV, Part 2 is #1518). On 2026-11-26 www.gutenberg.org answered HTTP 503, so the file was fetched from the Project Gutenberg mirror `https://gutenberg.pglaf.org/1/0/4/1041/1041-0.txt` (also reachable at aleph.pglaf.org and mirror.csclub.uwaterloo.ca/gutenberg). Title and author confirmed from the text.
- Pinned bytes: `books/raw/sonnets/pg1041.txt` — 100,225 bytes, SHA-256 `d758217844bce61db92d6faeb1d082ddbf9c534a155c6c788318ef7a324bee39`.
- Rights: Project Gutenberg public-domain text (author died 1616). Not a jurisdiction-specific review; confirm the catalogue entry when gutenberg.org is back.

## Reading structure

Structure: 8 reading units by traditional grouping; each sonnet is two paragraphs, a heading paragraph `Sonnet N` (Danish `Sonet N`) and the poem (original with line breaks; modern editions as one prose paragraph). Sonnet 99 has 15 lines and 126 has 12, as in the source.

## Editions

| File | Units | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/sonnets-original-en.json` | 8 | 308 | 17,825 | `d5d815e234fa10514c3ed8aac1ee69fe42bb4511b2832e95b087d38cd23a635e` |
| `editions/sonnets-modern-en.json` | 8 | 308 | 20,336 | `6e57e4c835311137d79371b81c1a4759bf269726f2305c111e8c67dea5320f4c` |
| `editions/sonnets-modern-da.json` | 8 | 308 | 20,753 | `c3766d084b3a60f8b7f04e80cc7e874f737ff2e6b7c9bbfb24fb58d254b86e94` |

- `original-en` is the Gutenberg text and the sole baseline.
- `modern-en` is a No Fear–style faithful modern prose rendering, paragraph for paragraph.
- `modern-da` is translated from the final `modern-en` (not from the original), paragraph for paragraph; speaker names stay in English capitals and generic role tags are Danish (e.g. KONGEN, VÆRTINDEN), per `review/REVIEW.md`.

Owned paths: `books/wip/sonnets/` and `books/raw/sonnets/`. No integration, registry change, narration or publication is part of this package.
