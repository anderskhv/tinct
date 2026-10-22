# Moby-Dick — modern-da review log (danish-2026-10-21-c)

Source: `app/public/data/editions/moby-dick-modern-en.json` on origin/main e8b2703325, blob be7c38ad6dc2ff0c4ff775b7bdd12099f8dea29a (see SOURCE-HASH.txt; still the current blob at origin/main cc159cabd2).
Glossary only: old live `moby-dick-modern-da.json` (names and fixed terms, see GLOSSARY.md). No sentences copied.

## Review method actually used
- Translator pass: paragraph by paragraph by Claude (this session). 136 chapters (135 + epilogue), 2,432 paragraphs, about 208,000 Danish words from about 212,000 English.
- Second pass: **not independent.** This run had no subagent tool, so the required independent reviewer (sees only EN + DA) could not be run. The second pass was done by the same translator: after every batch, automated checks for alignment, English residue and per-chapter length ratio, plus danish-lint and spot re-reads. **The independent review is still outstanding** and must happen before acceptance.
- Throughput was very high (chapters 1–136 in about 2 h 45 min), so the reviewer should expect single-pass drafting errors: dropped articles, odd collocations and the occasional over-literal line.

## Editorial decisions
- Titles: "Kapitel N — Titel"; epilogue "Epilog — Dramaet er forbi". Ship-meeting chapters: "Pequod møder X".
- Address: Ismael says du to the reader; the crew use du/I among themselves. De is used only for the Limeño Spaniards (ch54) and Bunger (ch100). Speakers keep "sir"; "Mr." becomes "hr.".
- Quotation marks are »…«, with ›…‹ for nested quotes. Each paragraph of a continued multi-paragraph speech opens with ». Dashes are "–". The `_x_` emphasis is kept exactly where EN has it.
- Units are converted to metric for modern readers:
  - feet → metres
  - inches → centimetres
  - gallons → litres
  - pounds → kilo
  - miles → sømil or kilometres
  - leagues → kilometres (ch123 "tusinder af kilometer"; ch134 "fem hundrede og sytten og en kvart kilometer" for "ninety-three leagues and a quarter")

  Historical lists and quotations keep pund. **The reviewer should confirm this policy is wanted.**
- Dialect: Queequeg speaks a broken pidgin ("ham", "mig", "-e" verb forms). Fleece speaks a dialect ("medkræ", "mig siger", "ved Gu'", "massa Stubb").
- Fixed terms (see GLOSSARY.md for the full list):
  - kaskelot, rethval, harpunér, bådfører
  - lukaf/bakken, skansedæk, spæk, spermacet, ambra, kogeværk, flænsning, gam
  - Fast-Fish = fast fisk, Loose-Fish = løs fisk
  - fyrretøndestyre, søbo (Lakeman), kanalmand (Canaller)
  - Sankt Elms ild (corpusants)
  - brit = krill
- "To lower" (the boats) is "sætte bådene ud" in the early chapters (26–93) and "fire ned" in chapters 128–135. Both are idiomatic. **Flag:** the reviewer may want to unify them.
- ch131: the ship name Delight is followed by the gloss »Fryd«, so the irony of "misnamed" survives. This is a two-word addition. **Flag:** remove it if strict no-additions applies.
- ch136 epigraph: own rendering of Job 1:15 in capitals, as in the source.
- Kept faithful to the source despite oddities:
  - ch57 title truncation ("…i jernplade; i" with ¶1 "sten; i bjerge; i stjerner.")
  - ch73 title split (¶1 "om ham.")
  - ch48 ¶31 "Stubb, tredjestyrmanden" (a source error)
  - ch76 "Lais"
- Spelling normalisations: Leeuwenhoek, Salomonøerne, Mendaña, Figueroa, Dürer, Heidelberg, Pontoppidan, Galápagosøerne, Tarquinius, Antiochos.
- "Coke-upon-Littleton" is rendered as "næveretten som juridisk lærebog".

## Fixes applied during self-review
- Typos and grammar:
  - ch27 "nabaøen"
  - ch29 cannon "wad" → "proppe forladning"; "dit hundehus"
  - ch41 fireoghalvfjerdser
  - ch42 luller, "et New England-føl"
  - ch47 lommetyverier
  - ch48 "voksede til et hyl"
  - ch51 "helt rank"
  - ch64 "et anretterbord"
  - ch74 "et faldgitter"
  - ch87 "Et af disse små spædbørn"
  - ch108 "et lille ciffer"
  - ch110 "et grønt plettet firben"
  - ch126 "vuggende dynge"
  - ch130 "kun syntes"
  - ch133 "friskede"
  - ch135 Stubb »Stå mig ikke bi«
  - ch136 "sunkne", and "det" for the ship
- ch88: "firsindstyvetøndestyr" changed to "fyrretøndestyr". It had mistranslated "forty".
- DOUBLE-FILLER lint hits ("det det", "til til", "den den") rephrased in ch28, 48, 68, 78, 81, 94, 96, 108 and 110.
- ch116 ¶5–¶7: an opening » added to the continued speech.
- ch115 title made "Pequod møder Bachelor" to match the text.

## Gate results
See GATES.txt.
- 136/136 chapters aligned 1:1 with EN.
- Zero English-residue paragraphs.
- Per-chapter da/en character ratio 0.937–1.101, all inside 0.85–1.25.
- danish-lint: 0 issues.
