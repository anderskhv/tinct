# Crime and Punishment — modern-da review log (danish-2026-10-21-c)

Source: `app/public/data/editions/crime-and-punishment-modern-en.json` on origin/main e8b2703325, blob 914f64f98e773404302b0fcd911303bdca8f92ff (see SOURCE-HASH.txt).
Glossary only: old live `crime-and-punishment-modern-da.json` (names and terms, see GLOSSARY.md). No sentences copied.

## Review method actually used
- Translator pass: paragraph by paragraph, chapter by chapter, by Claude (this session). 41 chapters, 3,904 paragraphs, about 200,500 Danish words.
- Second pass: **not independent.** This run had no subagent tool, so the required independent reviewer (sees only EN + DA) could not be run. Second pass done by the same translator: automated per-paragraph checks after every chapter (alignment, English-residue detector, per-paragraph length-ratio flag <0.70 or >1.60 for paragraphs over 150 chars — zero flags), danish-lint after every chapter, and re-reading while drafting. **Independent review remains outstanding** before acceptance.

## Editorial decisions
- Chapter titles: "Første del, kapitel N" … "Sjette del, kapitel N", "Epilog, kapitel N"; sections "Første del" … "Sjette del", "Epilog".
- Address forms: family members du; strangers, officials, Porfirij ↔ Raskolnikov, Svidrigajlov ↔ everyone, Luzjin ↔ everyone, Razumikhin → the ladies: De. Raskolnikov ↔ Sonja: De up to and including part 4 ch4 (Lazarus reading); from part 5 ch4 (the confession) Raskolnikov says du; Sonja says De until his confession and du from »Der er ingen – ingen i hele verden nu, der er så ulykkelig som du!« (part 5 ch4 ¶75), mirroring the Russian switch. Flag for reviewer.
- Bible verses (John 11, part 4 ch4): own translation in a traditional church register; not copied from the copyrighted Bibelselskabet 1992 text.
- Songs and verse (Katerina Ivanovna's songs, Lermontov's "I middagsheden, i Dagestans dal"): own renderings; French/German lines kept as in EN.
- Amalia Ivanovna's broken Russian rendered as broken Danish word order ("kusken ville ham dræbe").
- Floor numbers kept literal from EN ("fourth floor" → "fjerde sal"), consistent through the book.
- Translator's notes present in EN (part 6 ch2 ¶21, part 6 ch8 ¶43) translated as "Oversætterens note: …" to keep 1:1 alignment.
- Luzjin's "Why on earth was I such a Jew?" and the narrator's description of the Jewish fireman (part 6 ch6) kept faithful to the source; not softened. Flag for reviewer/Anders if editorial policy differs.
- "Explosive Lieutenant" = Krudtløjtnanten (glossary). Ellipses normalised to "…" with a preceding space (Danish convention); EN "...." rendered as " …".
- Italic markup `_…_` kept exactly where EN has it.

## Fixes applied during self-review
- Fillers flagged by danish-lint (DOUBLE-FILLER "det det", "en en") rephrased in ch4, ch11, ch21, ch27, ch32, ch35, ch37.
- ch21 " ..." → " …" (SPACE-BEFORE-PUNCT); whole book normalised afterwards.
- ch24/ch26 "gransker/gransked" → "granskede"; ch30 "ødelagte" → "ødelagde", "skræmmende likt" → "mindede skræmmende meget om"; ch34 floor number made literal ("anden sal"); ch41 passive "blev ikke kunnet lide" rephrased.

## Gate results
See GATES.txt. 41/41 chapters aligned 1:1 with EN; zero English-residue paragraphs; every chapter da/en character ratio between 0.992 and 1.062 (all inside 0.85–1.25, no outliers). danish-lint: 39 hits, all STRAY-UNDERSCORE false positives on italic markup copied from EN (e.g. `»_Pan_`, `_Vater aus Berlin_`), the same pattern the live old DA file produces.
