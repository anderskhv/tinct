# Structure map: served 232 slots → final 184 printed paragraphs

Machine-readable version: `STRUCTURE-MAP.json`, built by `source/build_structure_map.py`. All indexes are 0-based, matching the reader's `paragraphIndex`.

**Why the structure changes.** The served editions (original-da, original-en, modern-en and modern-da, all 232 slots) inherited their paragraph boundaries from OCR. The 1895 printing was checked page by page (`source/SCAN-VERIFICATION.md`, `source/PRINTED-PARAGRAPHS.md`), which showed three problems:
- slots split at page breaks in the middle of a paragraph;
- footnote text left standing as body paragraphs;
- two passages missing altogether: the Attunement's weaning passages.

Forcing the corrected text into the 232 slots would misstate the book. The candidate therefore follows the printed paragraphing, as STYLE §B requires.

| Relation | Served slots | Meaning |
|---|---|---|
| identical-extent | 132 | one slot = one printed paragraph |
| joined | 82 | several slots form one printed paragraph (a page-break run-on in the OCR); each slot maps to the same final ¶ |
| split | 9 | one slot holds a printed paragraph break, or a restored weaning passage, and maps to two final ¶ |
| removed | 9 | the slot held only a footnote; the note now sits in `candidate/footnotes.json`, attached to the final ¶ shown |

| Chapter | Served | Final |
|---|---|---|
| 1 Preface | 5 | 4 |
| 2 Attunement (served: Exordium) | 13 | 15 |
| 3 Eulogy on Abraham | 17 | 14 |
| 4 Preliminary Expectoration | 42 | 35 |
| 5 Problema I | 32 | 29 |
| 6 Problema II | 29 | 22 |
| 7 Problema III | 88 | 61 |
| 8 Epilogue | 6 | 4 |
| **Total** | 232 | 184 |

## Every non-identical slot

| Served ch.¶ | Final ch.¶ | Relation | Detail |
|---|---|---|---|
| 1.0 | 1.0 | joined | final ¶0 = served slots 0–1 (page-break run-on in print) |
| 1.1 | 1.0 | joined | final ¶0 = served slots 0–1 (page-break run-on in print) |
| 2.6 | 2.6, 2.7 | split | restored weaning passage from this slot now forms its own paragraph ¶7 |
| 2.8 | 2.9, 2.10 | split | restored weaning passage from this slot now forms its own paragraph ¶10 |
| 3.1 | 3.1 | joined | final ¶1 = served slots 1–2 (page-break run-on in print) |
| 3.2 | 3.1 | joined | final ¶1 = served slots 1–2 (page-break run-on in print) |
| 3.3 | 3.2, 3.3 | split | printed paragraph break inside the served slot |
| 3.6 | 3.6 | joined | final ¶6 = served slots 6–7 (page-break run-on in print) |
| 3.7 | 3.6 | joined | final ¶6 = served slots 6–7 (page-break run-on in print) |
| 3.11 | 3.10 | joined | final ¶10 = served slots 11–12 (page-break run-on in print) |
| 3.12 | 3.10 | joined | final ¶10 = served slots 11–12 (page-break run-on in print) |
| 3.15 | 3.13 | joined | final ¶13 = served slots 15–16 (page-break run-on in print) |
| 3.16 | 3.13 | joined | final ¶13 = served slots 15–16 (page-break run-on in print) |
| 4.4 | 4.4 | joined | final ¶4 = served slots 4–5 (page-break run-on in print) |
| 4.5 | 4.4 | joined | final ¶4 = served slots 4–5 (page-break run-on in print) |
| 4.7 | 4.6, 4.7 | split | printed paragraph break inside the served slot |
| 4.8 | 4.8 | joined | final ¶8 = served slots 8–10 (page-break run-on in print) |
| 4.9 | 4.8 | joined | final ¶8 = served slots 8–10 (page-break run-on in print) |
| 4.10 | 4.8 | joined | final ¶8 = served slots 8–10 (page-break run-on in print) |
| 4.11 | 4.9 | joined | final ¶9 = served slots 11–12 (page-break run-on in print) |
| 4.12 | 4.9 | joined | final ¶9 = served slots 11–12 (page-break run-on in print) |
| 4.18 | 4.15, 4.16 | split | printed paragraph break inside the served slot |
| 4.19 | 4.16 | joined | final ¶16 = served slots 18–20 (page-break run-on in print) |
| 4.20 | 4.16 | joined | final ¶16 = served slots 18–20 (page-break run-on in print) |
| 4.21 | 4.17 | joined | final ¶17 = served slots 21–23 (page-break run-on in print) |
| 4.22 | 4.17 | joined | final ¶17 = served slots 21–23 (page-break run-on in print) |
| 4.23 | 4.17 | joined | final ¶17 = served slots 21–23 (page-break run-on in print) |
| 4.32 | 4.26 | joined | final ¶26 = served slots 32–33 (page-break run-on in print) |
| 4.33 | 4.26 | joined | final ¶26 = served slots 32–33 (page-break run-on in print) |
| 5.20 | 5.20 | joined | final ¶20 = served slots 20–21 (page-break run-on in print) |
| 5.21 | 5.20 | joined | final ¶20 = served slots 20–21 (page-break run-on in print) |
| 5.25 | 5.24 | joined | final ¶24 = served slots 25–26 (page-break run-on in print) |
| 5.26 | 5.24 | joined | final ¶24 = served slots 25–26 (page-break run-on in print) |
| 5.30 | 5.28 | joined | final ¶28 = served slots 30–31 (page-break run-on in print) |
| 5.31 | 5.28 | joined | final ¶28 = served slots 30–31 (page-break run-on in print) |
| 6.2 | 6.2 | joined | final ¶2 = served slots 2–3 (page-break run-on in print) |
| 6.3 | 6.2 | joined | final ¶2 = served slots 2–3 (page-break run-on in print) |
| 6.11 | 6.10 | joined | final ¶10 = served slots 11–14 (page-break run-on in print) |
| 6.12 | 6.10 | joined | final ¶10 = served slots 11–14 (page-break run-on in print) |
| 6.13 | 6.10 | joined | final ¶10 = served slots 11–14 (page-break run-on in print) |
| 6.14 | 6.10 | joined | final ¶10 = served slots 11–14 (page-break run-on in print) |
| 6.16 | 6.12 | joined | final ¶12 = served slots 16–17 (page-break run-on in print) |
| 6.17 | 6.12 | joined | final ¶12 = served slots 16–17 (page-break run-on in print) |
| 6.20 | 6.15 | joined | final ¶15 = served slots 20–21 (page-break run-on in print) |
| 6.21 | 6.15 | joined | final ¶15 = served slots 20–21 (page-break run-on in print) |
| 6.24 | 6.18 | joined | final ¶18 = served slots 24–25 (page-break run-on in print) |
| 6.25 | 6.18 | joined | final ¶18 = served slots 24–25 (page-break run-on in print) |
| 7.4 | 7.4 | joined | final ¶4 = served slots 4–5 (page-break run-on in print) |
| 7.5 | 7.4 | joined | final ¶4 = served slots 4–5 (page-break run-on in print) |
| 7.14 | 7.13 | joined | final ¶13 = served slots 14–15 (page-break run-on in print) |
| 7.15 | 7.13, 7.14 | split | printed paragraph break inside the served slot |
| 7.16 | (note → 7.13) | removed | slot contained only footnote text (n7.15a); the note is attached to final ¶13 |
| 7.17 | 7.14 | joined | final ¶14 = served slots 15–18 (page-break run-on in print) |
| 7.18 | 7.14 | joined | final ¶14 = served slots 15–18 (page-break run-on in print) |
| 7.19 | 7.15 | joined | final ¶15 = served slots 19–21 (page-break run-on in print) |
| 7.20 | (note → 7.15) | removed | slot contained only footnote text (n7.19a); the note is attached to final ¶15 |
| 7.21 | 7.15 | joined | final ¶15 = served slots 19–21 (page-break run-on in print) |
| 7.22 | 7.16 | joined | final ¶16 = served slots 22–24 (page-break run-on in print) |
| 7.23 | (note → 7.15) | removed | slot contained only footnote text (n7.19a); the note is attached to final ¶15 |
| 7.24 | 7.16 | joined | final ¶16 = served slots 22–24 (page-break run-on in print) |
| 7.25 | 7.17 | joined | final ¶17 = served slots 25–26 (page-break run-on in print) |
| 7.26 | 7.17 | joined | final ¶17 = served slots 25–26 (page-break run-on in print) |
| 7.27 | 7.18 | joined | final ¶18 = served slots 27–29 (page-break run-on in print) |
| 7.28 | (note → 7.18) | removed | slot contained only footnote text (n7.27a); the note is attached to final ¶18 |
| 7.29 | 7.18 | joined | final ¶18 = served slots 27–29 (page-break run-on in print) |
| 7.33 | 7.22 | joined | final ¶22 = served slots 33–34 (page-break run-on in print) |
| 7.34 | 7.22, 7.23 | split | printed paragraph break inside the served slot |
| 7.35 | 7.24 | joined | final ¶24 = served slots 35–37 (page-break run-on in print) |
| 7.36 | (note → 7.23) | removed | slot contained only footnote text (n7.34a); the note is attached to final ¶23 |
| 7.37 | 7.24, 7.25 | split | printed paragraph break inside the served slot |
| 7.38 | (note → 7.25) | removed | slot contained only footnote text (n7.37a); the note is attached to final ¶25 |
| 7.39 | 7.25 | joined | final ¶25 = served slots 37–39 (page-break run-on in print) |
| 7.40 | 7.26 | joined | final ¶26 = served slots 40–41 (page-break run-on in print) |
| 7.41 | 7.26 | joined | final ¶26 = served slots 40–41 (page-break run-on in print) |
| 7.43 | 7.28 | joined | final ¶28 = served slots 43–44 (page-break run-on in print) |
| 7.44 | 7.28 | joined | final ¶28 = served slots 43–44 (page-break run-on in print) |
| 7.47 | 7.31 | joined | final ¶31 = served slots 47–48 (page-break run-on in print) |
| 7.48 | 7.31 | joined | final ¶31 = served slots 47–48 (page-break run-on in print) |
| 7.49 | 7.32 | joined | final ¶32 = served slots 49–51 (page-break run-on in print) |
| 7.50 | (note → 7.31) | removed | slot contained only footnote text (n7.47a); the note is attached to final ¶31 |
| 7.51 | 7.32 | joined | final ¶32 = served slots 49–51 (page-break run-on in print) |
| 7.54 | 7.35 | joined | final ¶35 = served slots 54–55 (page-break run-on in print) |
| 7.55 | 7.35 | joined | final ¶35 = served slots 54–55 (page-break run-on in print) |
| 7.61 | 7.41 | joined | final ¶41 = served slots 61–62 (page-break run-on in print) |
| 7.62 | 7.41 | joined | final ¶41 = served slots 61–62 (page-break run-on in print) |
| 7.70 | 7.49 | joined | final ¶49 = served slots 70–72 (page-break run-on in print) |
| 7.71 | 7.49 | joined | final ¶49 = served slots 70–72 (page-break run-on in print) |
| 7.72 | 7.49 | joined | final ¶49 = served slots 70–72 (page-break run-on in print) |
| 7.76 | 7.53 | joined | final ¶53 = served slots 76–77 (page-break run-on in print) |
| 7.77 | 7.53, 7.54 | split | printed paragraph break inside the served slot |
| 7.78 | 7.55 | joined | final ¶55 = served slots 78–80 (page-break run-on in print) |
| 7.79 | (note → 7.54) | removed | slot contained only footnote text (n7.77a); the note is attached to final ¶54 |
| 7.80 | 7.55 | joined | final ¶55 = served slots 78–80 (page-break run-on in print) |
| 7.82 | 7.57 | joined | final ¶57 = served slots 82–84 (page-break run-on in print) |
| 7.83 | (note → 7.56) | removed | slot contained only footnote text (n7.81a); the note is attached to final ¶56 |
| 7.84 | 7.57 | joined | final ¶57 = served slots 82–84 (page-break run-on in print) |
| 8.0 | 8.0 | joined | final ¶0 = served slots 0–1 (page-break run-on in print) |
| 8.1 | 8.0 | joined | final ¶0 = served slots 0–1 (page-break run-on in print) |
| 8.4 | 8.3 | joined | final ¶3 = served slots 4–5 (page-break run-on in print) |
| 8.5 | 8.3 | joined | final ¶3 = served slots 4–5 (page-break run-on in print) |

## Restored and structural paragraphs in the final text

| Final ch.¶ | What |
|---|---|
| 2.3 | section heading I. (structural field); divider before: rule |
| 2.5 | divider before: asterism |
| 2.6 | section heading II. (structural field) |
| 2.7 | restored passage (absent from all served editions): yes; divider before: asterism |
| 2.8 | section heading III. (structural field) |
| 2.10 | restored passage (absent from all served editions): yes; divider before: asterism |
| 2.11 | section heading IV. (structural field) |
| 2.13 | divider before: asterism |
| 2.14 | divider before: rule |
| 3.13 | divider before: asterism |
| 4.2 | footnote(s) n4.2a |
| 4.17 | footnote(s) n4.21a, n4.22a |
| 5.28 | footnote(s) n5.31a |
| 6.18 | footnote(s) n6.24a |
| 7.13 | footnote(s) n7.15a |
| 7.14 | footnote(s) n7.15b |
| 7.15 | footnote(s) n7.19a |
| 7.18 | footnote(s) n7.27a |
| 7.22 | footnote(s) n7.33a |
| 7.23 | footnote(s) n7.34a |
| 7.25 | footnote(s) n7.37a |
| 7.31 | footnote(s) n7.47a |
| 7.39 | divider before: rule |
| 7.46 | footnote(s) n7.67a |
| 7.54 | footnote(s) n7.77a |
| 7.56 | footnote(s) n7.81a |
| 8.3 | footnote(s) n8.5a, n8.5b |

## Position migration for Codex

The rule for moving a saved reading position from the served structure `(chapter, served index)` to the final structure:
- **identical-extent or joined:** move to the single final ¶. A joined slot lands at the start of the joined paragraph, which is at most one page of text earlier.
- **split:** move to the first final ¶ listed.
- **removed** (footnote-only slot): move to the final ¶ carrying that note.

Chapter numbers 1–8 are unchanged, so chapter-level data (threads summaries, chapter progress) needs no remapping. Paragraph-level data does:
- positions;
- highlights and notes;
- character mentions (see `character-card-impact.json`);
- paragraph audio.
