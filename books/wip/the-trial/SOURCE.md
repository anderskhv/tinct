# The Trial — source record

- Book ID: `the-trial`; checked 2026-09-30.
- Text transcribed by Project Gutenberg: Franz Kafka, **Der Prozess. Roman**, Berlin: Verlag Die Schmiede, **1925**, first edition, edited by Max Brod. The downloaded title page names publisher, place and year. Not a modern critical edition.
- Catalogue: https://www.gutenberg.org/ebooks/69327 (German; original publication 1925; US public-domain declaration; credits Jeroen Hellingman / Distributed Proofreaders, from Internet Archive / Canadian Libraries images).
- Exact downloaded URL: https://www.gutenberg.org/cache/epub/69327/pg69327-images.html
- Pinned raw file: `books/raw/the-trial/pg69327-images.html`
- SHA-256: `39806572aa000c1db7319503636a41505cc55ed7f9b01499070643ca7b5c23ec`.
- PG release 2022-11-11; header update 2024-10-19. Its corrections table is retained in the raw evidence. The edition follows those disclosed transcription corrections, not an independently reconstructed facsimile transcription. No claim of a complete scan-by-scan collation.
- German JSON SHA-256: `caf39bade270a8718f3867720b97533e25364c8948c2b8a7738a11f1d6138d0f`.

## Rights evidence and limits

Kafka died in 1924 (also recorded in PG author metadata). Denmark's copyright law §63 provides the life-plus-70-year term: https://www.retsinformation.dk/eli/lta/2023/1093 . EU Directive 2006/116/EC, Articles 1 and 8, supplies the harmonised term and calendar-year calculation: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32006L0116 . On that basis Kafka's own text is out of copyright in Denmark/EU; PG separately identifies this 1925 edition as public domain in the USA. These facts do **not** clear Brod's original editorial contributions in Denmark.

Brod died in 1968, as specified in Anders's approved brief: any qualifying original contribution may remain protected through 2038 (until 1 January 2039). **The PG colophon's Brod dates, 1880–1959, are erroneous and must not be used as rights evidence.** Brod's afterword and the cover art are excluded from the reading edition.

Brod's afterword, printed pp. 410–411, attributes chapter divisions and headings to Kafka, acknowledges editorial ordering, and discloses rearranging four lines in chapter 8 plus expanding abbreviations and correcting apparent slips. The exact scope and protectability of those changes is unresolved. The candidate preserves the requested ten-chapter 1925 sequence for review, but is **not cleared for publication** merely because neutral headings replace the printed ones.

Independent archival context: DLA Marbach records that Brod selected and ordered ten manuscript bundles and omitted six fragments: https://www.dla-marbach.de/presse/presse-details/news/pm-58-2013/ . The manuscript is held by DLA; its IIIF metadata was retrieved solely as provenance evidence, not used as a substitute text or modern critical edition:
https://digital.dla-marbach.de/viewer/api/v1/records/HS00213991/manifest/
Local file: `books/raw/the-trial/manuscript-manifest.json` (hash in SHA256SUMS). Individual manuscript title leaves have not yet been collated; see per-chapter decisions in HANDOFF.md.

Fischer's bibliographical page (metadata only, no edition text consulted) confirms the 1925 publication and exclusion of fragmentary chapters: https://www.franzkafka.de/werk/saemtliche-titel/der-process .

## Extraction

`original-de` follows the Werther/Faust German-edition key. Ten flat chapters, 140 reading paragraphs. One paragraph per prose-bearing direct HTML paragraph in source chapters ch1–ch10; removed page-number spans and collapsed HTML whitespace. One empty HTML paragraph in chapter 1 is a separator, not a reading paragraph, and was excluded. Paragraphs were otherwise neither merged nor split. Printed titles replaced by original neutral labels `Kapitel 1`–`Kapitel 10`; English labels `Chapter 1`–`Chapter 10`.

Title pages, contents, afterword, colophon, correction list, Gutenberg license/header/footer and page numbers remain outside the reading edition. PG's raw HTML is preserved unmodified for evidence. `source-boundaries.json` records every chapter's first and last paragraph. `QA.json` records counts and validation.

## English source policy

No third-party English translation was intentionally fetched or consulted. Disclosure: an unsolicited search-result snippet named a Parry translation and included a short English chapter label. The agent saw that snippet but did not open the result, retrieve translation prose, compare against it or use its wording. The session therefore cannot be described as having zero incidental exposure to English translation wording. `modern-en` is being rendered directly from the pinned German by Codex, sentence by sentence, one English paragraph per German paragraph. No translation script, translation API or Anthropic API is used. The German is the only textual comparison baseline.

Source extraction correction: the standalone asterisk between chapter 1 paragraphs 9 and 10 is a scene separator, not prose. Excluded from the paragraph array in both editions; scene break position retained here. Initial checkpoint 609d7699a included it as a paragraph; superseded by this correction.

Current English candidate (chapters 1–2 only) SHA-256: `9e6a8cace96071ffdb9d03a556bfe9a6be7383413c4912ec97e3fa89555b0669`. Remaining chapters have not been rendered.
