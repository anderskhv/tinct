# Batch C — Modern English Re-render Notes (Chapters 25–36)

## Paragraph-count verification (programmatic)

Ran against `bk-batchC-source.json` vs `bk-batchC-modern-en.json`:

| Ch | Title                          | Source paras | Output paras | Match |
|----|---------------------------------|:---:|:---:|:---:|
| 25 | I. Father Ferapont               | 67 | 67 | ✅ |
| 26 | II. At His Father's              | 43 | 43 | ✅ |
| 27 | III. A Meeting With The Schoolboys | 45 | 45 | ✅ |
| 28 | IV. At The Khokhlakovs'          | 69 | 69 | ✅ |
| 29 | V. A Laceration In The Drawing-Room | 64 | 64 | ✅ |
| 30 | VI. A Laceration In The Cottage  | 57 | 57 | ✅ |
| 31 | VII. And In The Open Air         | 45 | 45 | ✅ |
| 32 | I. The Engagement                | 97 | 97 | ✅ |
| 33 | II. Smerdyakov With A Guitar     | 67 | 67 | ✅ |
| 34 | III. The Brothers Make Friends   | 68 | 68 | ✅ |
| 35 | IV. Rebellion                    | 33 | 33 | ✅ |
| 36 | V. The Grand Inquisitor          | 56 | 56 | ✅ |
| **Total** | | **711** | **711** | ✅ |

File also validated with `python3 -m json.tool` (well-formed) and all 12 chapter objects carry the same `number`, `title`-pattern, and `section` shape as the source.

## Judgment calls

- **Name spelling convention**: standardized on the Constance Garnett source's forms but modernized two: "Zossima" → "Zosima" and "Father Païssy" → "Father Paissy" (dropped the diaeresis, which has no function in modern English typography). All other names kept exactly as in the source — Fyodor Pavlovitch, Dmitri Fyodorovitch, Ivan Fyodorovitch, Alexey/Alyosha, Grushenka, Katerina Ivanovna, Smerdyakov, Rakitin, Snegiryov, Ilyusha (source alternates "Ilusha"/"Ilyusha" — I used "Ilyusha" throughout for consistency), Krassotkin. Used "-vitch" patronymic ending throughout, not "-vich," matching the source and the rest of the existing modern-en edition (per the book's established convention).
- **"Madame Hohlakov" → "Madame Khokhlakov"**: modernized the transliteration of Хохлакова consistently (the source's "Hohlakov" is a dated transliteration that reads as a typo to contemporary eyes). Applied consistently across all instances in this batch, including the chapter title "At The Khokhlakovs'."
- **Verse/song passages** (Ch. 33 Smerdyakov's guitar songs, Ch. 30 the Pushkin-derived couplet, Ch. 36 the "no signs from heaven" and Tyutchev couplets): re-rendered for natural modern rhythm and rhyme rather than word-for-word, since these are already loose English verse translations in the source (not the original Russian), and a modernized register was more important than exact meter-matching. Preserved all imagery and meaning.
- **Chapter 35 ("Rebellion") and Chapter 36 ("The Grand Inquisitor")**: these are the most consequential chapters in the whole novel and among the most analyzed passages in world literature. I treated them with the highest fidelity — full-length paragraphs, no compression, careful attention to Ivan's philosophical argument (Euclidean geometry metaphor, the three temptations, "everything is permitted") and to the violent historical/anecdotal material about atrocities against children, which is core to Ivan's argument and is rendered faithfully and without softening, per the instructions not to sanitize. This content is Dostoevsky's own argument against theodicy, delivered as reported historical anecdote and invented parable — no graphic content was added beyond what the source already contains, and nothing was cut.
- **Dialogue register**: kept Fyodor Pavlovitch crude and self-mocking, Ivan cerebral and ironic (with the long philosophical monologues rendered as continuous, urgent argument rather than broken into artificially shorter modern sentences, since Ivan's run-on intensity is characterizational), Alyosha gentle and direct, Dmitri absent from this batch except by report, Smerdyakov fastidious/pretentious in his diction (kept his "the folks there and ours here," his contempt for "a wee bit," and his affectations intact — these are character notes, not incidental phrasing).
- **Captain Snegiryov's speech**: preserved his manic, cringing-to-defiant register and his repeated "sir" tic (explained in-text as a class-marker of his fall in status) rather than smoothing it into more even modern prose — this tic is thematically important (he explains it himself in Ch. 30) and Ivan/Alyosha's whole visit turns on reading his affect correctly.
- **French/German/Latin phrases** left untranslated in-line as in the source (_Merci, maman_; _c'est tragique_; _à propos_; Schiller's "Den Dank, Dame, begehr ich nicht"; _S'il n'existait pas Dieu, il faudrait l'inventer_; _auto-da-fé_; _ad majorem gloriam Dei_; _Dixi_), consistent with how an educated 19th-century Russian household would actually code-switch, and consistent with standard practice for this edition.
- **Units/measures/currency** (roubles, copecks, versts implied, "four pounds of bread," etc.) kept as in the source — not converted, since this is a historical-register modernization of prose, not a localization.
- **No paragraphs merged, split, reordered, or dropped.** Paragraph 44 in Ch. 30 (the two-line Pushkin-style verse fragment) was kept as its own paragraph, matching the source's structure exactly, even though it's only two lines.

## Scope confirmation

Per the Book Addition Checklist and `books/CLAUDE.md`, this session touched only:
- `books/wip/brothers-karamazov-repair/bk-batchC-modern-en.json` (created)
- `books/wip/brothers-karamazov-repair/bk-batchC-notes.md` (this file, created)

No other files were read for editing purposes beyond the read-only source `bk-batchC-source.json`, and nothing was committed or pushed, per instructions.
