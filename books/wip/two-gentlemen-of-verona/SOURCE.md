# The Two Gentlemen of Verona (Shakespeare) — pinned source

- Book id: `two-gentlemen-of-verona` (proposed; no collision with live ids on origin/main, checked 2026-11-26).
- Author: William Shakespeare (1564–1616). Date: c. 1590 (commonly cited; not stated in the file).
- Source: Project Gutenberg eBook #1509, the same Gutenberg Shakespeare series (#1500–#1545) as Tinct's live plays (e.g. Henry IV, Part 2 is #1518). On 2026-11-26 www.gutenberg.org answered HTTP 503, so the file was fetched from the Project Gutenberg mirror `https://gutenberg.pglaf.org/1/5/0/1509/1509-0.txt` (also reachable at aleph.pglaf.org and mirror.csclub.uwaterloo.ca/gutenberg). Title and author confirmed from the text.
- Pinned bytes: `books/raw/two-gentlemen-of-verona/pg1509.txt` — 103,013 bytes, SHA-256 `82547da476f34f0adad8bf91ea443592d1da3aeaaa656458a8da36540f3f4bfe`.
- Rights: Project Gutenberg public-domain text (author died 1616). Not a jurisdiction-specific review; confirm the catalogue entry when gutenberg.org is back.

## Reading structure

One reading unit per scene, titled `Act N, Scene M — location` from the Gutenberg scene headings (house format of the live Shakespeare plays). Speeches are `SPEAKER. text` with verse lines joined by spaces (no line breaks, as in the live plays); a speech that resumes after a stage direction continues without a tag; stage directions are their own paragraphs (Gutenberg text kept in original-en; bracketed plain English in modern-en, bracketed Danish in modern-da). Contents list and dramatis personae are excluded.

## Editions

| File | Units | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/two-gentlemen-of-verona-original-en.json` | 20 | 991 | 18,132 | `b088b6b59911cda6e14ba114bb9775cf46e05a5aeada3c2bc3a9cc53f41d93c6` |
| `editions/two-gentlemen-of-verona-modern-en.json` | 20 | 991 | 19,641 | `07686be55b1a6500758d9ce12f633cbf51099134a45683ce803737a1fb5afc85` |
| `editions/two-gentlemen-of-verona-modern-da.json` | 20 | 991 | 20,807 | `de3648d2d9b7577842b38604f8292d98a6c514d170401a9dd4fa8499a54df506` |

- `original-en` is the Gutenberg text and the sole baseline.
- `modern-en` is a No Fear–style faithful modern prose rendering, paragraph for paragraph.
- `modern-da` is translated from the final `modern-en` (not from the original), paragraph for paragraph; speaker names stay in English capitals and generic role tags are Danish (e.g. KONGEN, VÆRTINDEN), per `review/REVIEW.md`.

Owned paths: `books/wip/two-gentlemen-of-verona/` and `books/raw/two-gentlemen-of-verona/`. No integration, registry change, narration or publication is part of this package.
