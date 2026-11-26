# Richard II (Shakespeare) — pinned source

- Book id: `richard-ii` (proposed; no collision with live ids on origin/main, checked 2026-11-26).
- Author: William Shakespeare (1564–1616). Date: c. 1595 (commonly cited; not stated in the file).
- Source: Project Gutenberg eBook #1512, the same Gutenberg Shakespeare series (#1500–#1545) as Tinct's live plays (e.g. Henry IV, Part 2 is #1518). On 2026-11-26 www.gutenberg.org answered HTTP 503, so the file was fetched from the Project Gutenberg mirror `https://gutenberg.pglaf.org/1/5/1/1512/1512-0.txt` (also reachable at aleph.pglaf.org and mirror.csclub.uwaterloo.ca/gutenberg). Title and author confirmed from the text.
- Pinned bytes: `books/raw/richard-ii/pg1512.txt` — 132,231 bytes, SHA-256 `935b3a4da9aac4bd0ba44e7be960150f4d3cab0585b540cd0e8ef4b49823450d`.
- Rights: Project Gutenberg public-domain text (author died 1616). Not a jurisdiction-specific review; confirm the catalogue entry when gutenberg.org is back.

## Reading structure

One reading unit per scene, titled `Act N, Scene M — location` from the Gutenberg scene headings (house format of the live Shakespeare plays). Speeches are `SPEAKER. text` with verse lines joined by spaces (no line breaks, as in the live plays); a speech that resumes after a stage direction continues without a tag; stage directions are their own paragraphs (Gutenberg text kept in original-en; bracketed plain English in modern-en, bracketed Danish in modern-da). Contents list and dramatis personae are excluded.

## Editions

| File | Units | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/richard-ii-original-en.json` | 19 | 697 | 23,074 | `53c576d92b328e6b95bd9c7fca83e7b4d2fc4731e90aca20ad9541234fcaf1e2` |
| `editions/richard-ii-modern-en.json` | 19 | 697 | 25,421 | `74ee8588896c384d24a40f1b8a0094a2fa7973109aef2aa71392afe15fb0baf1` |
| `editions/richard-ii-modern-da.json` | 19 | 697 | 25,965 | `5d333ff78710b6c78952b55e7538989bb7bfa8d123d42bc21d8778a49ee94acb` |

- `original-en` is the Gutenberg text and the sole baseline.
- `modern-en` is a No Fear–style faithful modern prose rendering, paragraph for paragraph.
- `modern-da` is translated from the final `modern-en` (not from the original), paragraph for paragraph; speaker names stay in English capitals and generic role tags are Danish (e.g. KONGEN, VÆRTINDEN), per `review/REVIEW.md`.

Owned paths: `books/wip/richard-ii/` and `books/raw/richard-ii/`. No integration, registry change, narration or publication is part of this package.
