# Henry IV, Part 1 (Shakespeare) — pinned source

- Book id: `henry-iv-part-1` (proposed; no collision with live ids on origin/main, checked 2026-11-26).
- Author: William Shakespeare (1564–1616). Date: c. 1597 (commonly cited; not stated in the file).
- Source: Project Gutenberg eBook #1516, the same Gutenberg Shakespeare series (#1500–#1545) as Tinct's live plays (e.g. Henry IV, Part 2 is #1518). On 2026-11-26 www.gutenberg.org answered HTTP 503, so the file was fetched from the Project Gutenberg mirror `https://gutenberg.pglaf.org/1/5/1/1516/1516-0.txt` (also reachable at aleph.pglaf.org and mirror.csclub.uwaterloo.ca/gutenberg). Title and author confirmed from the text.
- Pinned bytes: `books/raw/henry-iv-part-1/pg1516.txt` — 143,231 bytes, SHA-256 `5988b14c97c265822023e86e9e23aab32203aa1b8ea0aef1e03613660711289a`.
- Rights: Project Gutenberg public-domain text (author died 1616). Not a jurisdiction-specific review; confirm the catalogue entry when gutenberg.org is back.

## Reading structure

One reading unit per scene, titled `Act N, Scene M — location` from the Gutenberg scene headings (house format of the live Shakespeare plays). Speeches are `SPEAKER. text` with verse lines joined by spaces (no line breaks, as in the live plays); a speech that resumes after a stage direction continues without a tag; stage directions are their own paragraphs (Gutenberg text kept in original-en; bracketed plain English in modern-en, bracketed Danish in modern-da). Contents list and dramatis personae are excluded.

## Editions

| File | Units | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/henry-iv-part-1-original-en.json` | 19 | 953 | 25,405 | `e2023cddbec07777d1763f4fabc9c4f2abac190ce4f9cb5495ea96b50084f871` |
| `editions/henry-iv-part-1-modern-en.json` | 19 | 953 | 26,893 | `6030fb3ad043875e8a3ed1e6e938ae0f4fa4e18536ee5bf0c857e09693a32f7a` |
| `editions/henry-iv-part-1-modern-da.json` | 19 | 953 | 27,671 | `d1d77357ccb9782b4de1c45feaef3271a31b339164f007278625e76c8a82a6ef` |

- `original-en` is the Gutenberg text and the sole baseline.
- `modern-en` is a No Fear–style faithful modern prose rendering, paragraph for paragraph.
- `modern-da` is translated from the final `modern-en` (not from the original), paragraph for paragraph; speaker names stay in English capitals and generic role tags are Danish (e.g. KONGEN, VÆRTINDEN), per `review/REVIEW.md`.

Owned paths: `books/wip/henry-iv-part-1/` and `books/raw/henry-iv-part-1/`. No integration, registry change, narration or publication is part of this package.
