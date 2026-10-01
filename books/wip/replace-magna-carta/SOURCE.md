# Source

Retrieved 2026-10-01.

William Sharp McKechnie, *Magna Carta: A Commentary on the Great Charter of King John, with an Historical Introduction*, second edition, Glasgow: James MacLehose and Sons, 1914. Sole translation/editorial baseline; no other translator or adapter is credited for this edition. Only his English charter translation is extracted, excluding all commentary, introductions, Latin, notes, and later digital editorial matter.

## Rights verification

- https://en.wikipedia.org/wiki/William_Sharp_McKechnie — exact supporting sentence: “McKechnie died on 2 July 1930.” Saved as `source/wikipedia-author.html`.
- https://en.wikisource.org/wiki/Author:William_Sharp_McKechnie — exact author heading: “William Sharp McKechnie (1863–1930)”. This page supplies a dated heading rather than a sentence. Saved as `source/wikisource-author.html`.

These are the two independently published records explicitly requested. Both identify the sole translator/editor as dying before 1955. No later human adaptation is used. The underlying charter is medieval. Eligibility is assessed against the assignment’s stated cutoff.

## Text acquisition and extraction

- https://staging.oll.libertyfund.org/titles/mckechnie-magna-carta-a-commentary — saved as `source/mckechnie-1914.html`. Main OLL endpoint returned HTTP 403; its publicly accessible staging counterpart supplied the edition.
- https://oll.libertyfund.org/titles/mckechnie-magna-carta-a-commentary — catalogue identifies McKechnie as editor and describes the Latin/English edition. No file downloaded from this blocked endpoint.

Preamble: HTML paragraph `McKechnie_0032_631`. Clauses 1–63: second paragraph following headings `lf0032_head_232` through `lf0032_head_294`, respectively. Removed footnote-link elements and page-break spans (`.pb`). Joined whitespace only. Split the final dating/witness formula beginning “Given under our hand” from clause 63. Prefixed clauses with their Arabic numbers; headings supply their numbering in the source. Corrected the evident dropped letter “this ou present Charter” to “this our present Charter” in clause 61. Curly quotation marks/apostrophes and source en dashes retained. Bracketed readings in the preamble and clause 39 are McKechnie’s, not added apparatus.

`source/clean-charter.json` preserves the cleaned translation, with 65 paragraphs: preamble, 63 consecutive clauses, concluding formula. Opening and ending verified against those source elements.

The assignment also requires rewording any paragraph flagged by its overlap checker, including original-en. Because verified 1914 wording itself triggers that gate, the edition candidate will be a transparently labelled McKechnie-derived adaptation at flagged coordinates, rather than a verbatim McKechnie edition. The unadapted extraction remains available separately for provenance. No protected wording is displayed or consulted.

## Raw download SHA-256

- `mckechnie-1914.html`: `75f5e61085f08a97c241bb74811738a6bec6089ba103bc88c795cdc65ea243b7`
- `wikipedia-author.html`: `d7ad3d126682508ba5654847e533d64132b14564b4ab73ebdc1cd817b2d6824b`
- `wikisource-author.html`: `d5d65491fca3c85b2d91ee039bb135badb35cc927c6aaef6f5414993a233bd4d`
