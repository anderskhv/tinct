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
Local file: `books/raw/the-trial/manuscript-manifest.json` (hash in SHA256SUMS). Seven manuscript title leaves were subsequently inspected; see the per-chapter evidence and decisions in HANDOFF.md.

Fischer's bibliographical page (metadata only, no edition text consulted) confirms the 1925 publication and exclusion of fragmentary chapters: https://www.franzkafka.de/werk/saemtliche-titel/der-process .

## Extraction

`original-de` follows the Werther/Faust German-edition key. Ten flat chapters, 140 reading paragraphs. One paragraph per prose-bearing direct HTML paragraph in source chapters ch1–ch10; removed page-number spans and collapsed HTML whitespace. One empty HTML paragraph in chapter 1 is a separator, not a reading paragraph, and was excluded. Paragraphs were otherwise neither merged nor split. Printed titles replaced by original neutral labels `Kapitel 1`–`Kapitel 10`; English labels `Chapter 1`–`Chapter 10`.

Title pages, contents, afterword, colophon, correction list, Gutenberg license/header/footer and page numbers remain outside the reading edition. PG's raw HTML is preserved unmodified for evidence. `source-boundaries.json` records every chapter's first and last paragraph. `QA.json` records counts and validation.

## English source policy

No third-party English translation was intentionally fetched or consulted. Disclosure: an unsolicited search-result snippet named a Parry translation and included a short English chapter label. The agent saw that snippet but did not open the result, retrieve translation prose, compare against it or use its wording. The session therefore cannot be described as having zero incidental exposure to English translation wording. `modern-en` is being rendered directly from the pinned German by Codex, sentence by sentence, one English paragraph per German paragraph. No translation script, translation API or Anthropic API is used. The German is the only textual comparison baseline.

Source extraction correction: the standalone asterisk between chapter 1 paragraphs 9 and 10 is a scene separator, not prose. Excluded from the paragraph array in both editions; scene break position retained here. Initial checkpoint 609d7699a included it as a paragraph; superseded by this correction.

Current complete English edition: **10 chapters / 140 paragraphs / 74,070 words**. SHA-256: `cb956f19857689fd14a2e7e929802134b1960841a4299bc5923d42ada84e16a2`. Three authorised parallel Codex writers completed chapters 7–9, followed by primary-agent opening review and targeted independent reviews. No external translation service or translation script was used.

## Manuscript-title audit evidence

DLA manuscript `HS00213991` was inspected only for title provenance, not substituted for the 1925 reading text. METS metadata: https://digital.dla-marbach.de/viewer/metsresolver?id=HS00213991 (local `manuscript-mets.xml`). The archive's modern divider at canvas 1 mentions the ordering of the 1990 critical edition; that divider was observed and retained as evidence, but neither that edition's text nor its ordering was used. Canvas 3 is the untitled opening manuscript page. These are pinned as `manuscript-0001.jpg` and `manuscript-0003.jpg`.

Seven retained title images correspond to canvases 53, 79, 119, 131, 163, 223 and 259. Their original download URLs follow this exact pattern, substituting the four-digit canvas number:
`https://digital.dla-marbach.de/viewer/api/v1/records/HS00213991/files/images/HS00213991_0053.tif/full/!400,400/0/default.jpg`
Local filenames are `manuscript-title-NNNN.jpg`; hashes are in SHA256SUMS. The Kafka labels and later chapter-number annotations are distinguished; the latter are not evidence of Kafka's ordering. Full-resolution follow-up retrieval timed out; no claim of palaeographic certification is made. Temporary thumbnails and contact sheets were removed after inspection.

DLA's archival account distinguishes the opening-text bundle from nine bundles with cover leaves: https://www.dla-marbach.de/presse/presse-details/news/pm-58-2013/ . Its exhibition account attributes the short bundle labels to Kafka: https://www.dla-marbach.de/museen/literaturmuseum-der-moderne/wechselausstellungen/stimmen-zu-den-ausstellungen/der-ganze-prozess-7-november-2013-bis-9-februar-2014/ . The writing exhibit corroborates `Im Dom`: https://www.literatursehen.com/themenseite/schreiben/ .

For chapter 4, Alexander Honold's scholarly contribution in the Swiss Literary Archives volume *Kafka verschrieben*, p. 30 n. 32, identifies the manuscript bundle as `B’s Freundin`; only provenance commentary was consulted, not a modern edition's reading text: https://www.nb.admin.ch/dam/snl/de/dokumente/literaturarchiv/publikationen/kafka_verschrieben.pdf . For chapter 10, DLA's exhibition text identifies the manuscript ending as `Ende`: https://www.dla-marbach.de/fileadmin/redaktion/Museen/Literaturmuseum_der_Moderne/Wechselausstellungen/Archiv/2013_FINDEN/Ausstellung_Kafkas_Maeuse.pdf . These corroborations are not represented as direct inspection of those two title leaves.
