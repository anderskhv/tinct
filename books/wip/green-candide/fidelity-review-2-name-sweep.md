# Candide — Round-2 proper-noun / printed-form sweep (2026-09-23)

**Input:** `candidate.json` at the previously accepted hash
`a32b255597e5f0df7809c2a573a205f7b7dcd113276570abbdddb4e735deb641`.
**Output:** `candidate.json` at
`e7fd2a802ac233b8598ddccbb03cef8a4fc422fba2d67f6aa0387bee80ba2b25`.
**Source anchor:** `source.json` (unchanged; byte-identical to the served
`app/public/data/editions/candide-original-en.json`).

## Why this round was needed

This was a pre-publication check of the 2026-09-21 acceptance. It re-ran the
proper-noun check that caught 31 instances in The Prince and the Antonius
normalizations in Julius Caesar. That check was a per-paragraph
set-difference of capitalized tokens with fuzzy matching, plus a scan for
non-ASCII letters that do not appear in the aligned source paragraph. It found
an entire defect class in Candide that the round-1 packets had passed as
"ACCEPT AS-IS". The candidate had systematically normalized the source's
printed proper names toward modern or standard forms and added diacritics the
source does not print. Examples: Buenos Ayres→Buenos Aires (13 paragraphs),
Leibnitz→Leibniz, Abbe→Abbé, Perigordian→Périgordian, Giroflee→Giroflée,
Theatin→Theatine, Marchioness of Parolignac→Marquise de Parolignac,
Mahomet→Muhammad, Mequinez→Meknes, Palus Meotides→Sea of Azof, and
Abares→Abarians.

`books/AGENTS.md` (Modern English) forbids this: "Do not silently 'correct' a
source name, citation, or fact to its historically standard form — reproduce
the source exactly, even where it looks wrong", and "Preserve every … proper
noun, place name". The acceptance was therefore not supported for this class.
Only this class was reopened. Nothing else was re-litigated.

## Convention applied (documented, context-aware)

- **Reverted to the aligned source paragraph's printed form:** names of
  persons, places, peoples and demonyms, religious orders, works, and a
  named wine; forms of address or title used as a name (Sieur Gauchat,
  Marchioness of Parolignac, Abbe); and added diacritics. The same rule was
  applied to the two `auto-da-fé` occurrences, so all six now read
  `auto-da-fe`, matching the source and the candidate's other four.
- **Deliberately kept (ordinary-vocabulary modernization, not a name
  "correction"):** Mussulman→Muslim, Grey Friar→Franciscan friar,
  Iman→Imam, Boyard→Boyar, "St. Anthony/James/Ignatius"→"Saint …" (the
  saint's name is unchanged; only the abbreviation is expanded),
  'Sblood→Blood, possessive and typographic modernization, St. Mark's
  Piazza→St. Mark's Square, "clichés". Orphan footnote markers such as
  `[26]` are dropped: the source carries no note text for them to point to.
- **One accessibility gloss added with the restored name:** 12.11 "the
  Palus Meotides (the Sea of Azof)". It uses the source's own spelling of
  Azof from the same paragraph.

## Changes (candidate form → restored source form)

| Candidate had | Restored | Paragraphs | Locations (chapter.paragraph index, 0-based) |
|---|---|---|---|
| Antichrist | Anti-Christ | 2 | 3.7, 3.10 |
| Oporto | Opporto | 1 | 5.19 |
| Biscayan | Biscayner | 2 | 6.1×2, 8.7 |
| Compostela | Compostella | 2 | 7.1, 14.6 |
| Badajoz | Badajos | 1 | 10.1 |
| San Sacramento | San Sacrament | 1 | 10.6 |
| Salé | Sallee | 1 | 11.1 |
| Carrara | Carara | 2 | 11.1, 11.3 |
| Muhammad | Mahomet | 1 | 11.5 |
| Azov | Azof | 2 | 12.10, 12.11×2 |
| Kassel | Cassel | 1 | 12.16 |
| Leiden | Leyden | 1 | 12.16 |
| Wismar | Vismar | 1 | 12.16 |
| Robeck | Robek | 1 | 12.17 |
| Buenos Aires | Buenos Ayres | 13 | 13.2, 13.8, 14.32, 15.0, 16.11, 18.39, 19.12, 19.14, 19.16, 19.33, 22.74, 27.9, 28.1 |
| Figueroa | Figueora | 2 | 13.2, 13.4 |
| Ibarra | Ibaraa | 2 | 13.2, 13.4 |
| Tucumán | Tucuman | 2 | 14.0, 17.16 |
| Tyrolean | Tyrolese | 1 | 15.0 |
| Trévoux | Trevoux | 1 | 16.1 |
| Tetuán | Tetuan | 1 | 17.7 |
| Meknes | Mequinez | 1 | 17.7 |
| Saint-Germain | St. Germain | 1 | 21.4 |
| Saint-Marceau | St. Marceau | 1 | 22.2 |
| Abbé | Abbe | 23 | 22.7, 22.9, 22.16, 22.17, 22.19, 22.23, 22.25, 22.27, 22.30, 22.32, 22.34, 22.37, 22.39, 22.44, 22.66×2, 22.67, 22.71, 22.73, 22.80, 22.86, 22.90, 22.91, 24.1 |
| Périgord | Perigord | 1 | 22.7 |
| the Comédie | La Comedie | 1 | 22.7 |
| Périgordian | Perigordian | 8 | 22.16, 22.28, 22.32, 22.37, 22.66, 22.86, 22.90, 24.1 |
| Fréron | Freron | 1 | 22.27 |
| Faubourg Saint-Honoré | Faubourg St. Honore | 1 | 22.32 |
| Marquise de Parolignac | Marchioness of Parolignac | 2 | 22.32, 22.40 |
| Marquise | Marchioness | 6 | 22.34, 22.41, 22.43, 22.54, 22.57, 22.60 |
| Monsieur Gauchat | Sieur Gauchat | 1 | 22.37 |
| Mélanges | Melanges | 1 | 22.39 |
| Monsieur l'Abbé | Monsieur Abbe | 1 | 22.69 |
| Theatine | Theatin | 5 | 24.5×3, 24.9, 24.17, 24.19, 24.20 |
| Lacrima Christi | Lachrymae Christi | 1 | 24.9 |
| abbé | abbe | 1 | 24.13 |
| Giroflée | Giroflee | 7 | 24.16, 24.21, 24.24, 25.39, 30.5×2, 30.6, 30.29 |
| Theatines | Theatins | 1 | 24.21 |
| Aeneid | AEneid | 1 | 25.12 |
| Aeneas | AEneas | 1 | 25.12 |
| Brundisium | Brundusium | 1 | 25.14 |
| Antonines | Antoninuses | 1 | 25.24 |
| Ragotski | Ragotsky | 1 | 27.7 |
| Señor | Senor | 1 | 27.9 |
| Milos | Milo | 1 | 27.9 |
| Marseille | Marseilles | 1 | 28.3 |
| Leibniz | Leibnitz | 1 | 28.5 |
| Erzurum | Erzeroum | 1 | 30.1 |
| Mytilene | Mitylene | 1 | 30.1 |
| Baasha | Baasa | 1 | 30.25 |
| Elah | Ela | 1 | 30.25 |
| auto-da-fé | auto-da-fe | 2 | 13.1, 30.2 |
| Abarians | Abares | 2 | 2.18, 4.9 |
| Abarian | Abare | 1 | 3.1 |
| the Atlas Mountains | Mount Atlas | 1 | 11.5 |
| the Sea of Azof | the Palus Meotides (the Sea of Azof) | 1 | 12.11 |

Totals: 93 paragraphs changed, 131 occurrences. All edits were exact scoped
replacements. `content_edit_helpers.validate_structure()` and
`assert_only_changed()` passed on every chapter after each edit round.

## Independent verification

A separate verifier who did not make the edits checked the result in two
passes.

**Pass 1** covered the first 90 paragraphs:
- It confirmed token by token that every change is a name-form or diacritic
  reversion. No other word was added, removed or changed, and nothing was cut
  short.
- It confirmed that every restored form appears literally in the same source
  paragraph, and that no grammar broke.
- It found 5 remaining misses: Abarians ×3, Atlas Mountains, and Sea of Azof
  for Palus Meotides.

**Pass 2** covered those 5 fixes:
- It confirmed each was applied exactly, with the surrounding text untouched.
- It found the 12.11 gloss accurate. The gloss is recorded here as an
  editorial addition.
- It re-ran the whole-book sweep. Nothing remained except the kept vocabulary
  listed above.
- Structure was re-confirmed: 30 chapters, 709 paragraphs, titles unchanged,
  valid JSON, no empty paragraphs.

Verdict: **VERIFIED CLEAN.**
