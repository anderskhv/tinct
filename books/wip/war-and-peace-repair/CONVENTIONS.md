# War and Peace — modern-en conventions

Established 2026-09-18 before the accessibility pilot. Drafters and reviewers follow this file. Items marked **DECISION NEEDED** are proposals awaiting Anders; until decided, drafters leave the existing handling in a chapter unchanged.

## Source and provenance

- Fidelity anchor: `app/public/data/editions/war-and-peace-original-en.json` — Aylmer and Louise Maude translation (Project Gutenberg #2600), 365 chapters, 11,340 paragraphs. sha256 `6112db117bbc36641e45240ff4a0ecd7d63a2975bdd691a6ad1624a6c6879864`.
- Baseline candidate: `war-and-peace-modern-en.json` at commit b269fb96 (the 16-batch fidelity repair), sha256 `4b3147a1982590e0d604a96941e5de8cb4e1555d614d67393b9d66b5da02c539`.
- Chapter identity is verified by the `number` field and opening sentence, never by title alone (see title defects below).
- Do not import wording or details from Pevear/Volokhonsky, Briggs, Garnett or the Russian. Maude is the only source.

## Character names (by identity, never blind replacement)

The modern-en text uses Maude's anglicised forms without stress accents. Majority spellings in the baseline are the standard.

| Character | Standard form | Do not use |
|---|---|---|
| Prince Andrew Bolkonsky | Andrew, Prince Andrew, Bolkonsky | Andrei, Bolkonski |
| Nicholas Rostov | Nicholas | Nikolai, Nikolái |
| Princess Mary Bolkonskaya | Princess Mary, Mary | Marya (for her) |
| Marya Dmitrievna Akhrosimova | Marya Dmitrievna | Mary Dmitrievna |
| Other patronymic "Marya X" (Antonovna, Fedorovna, Lvovna…) | Marya X | — |
| Helene Kuragina (Bezukhova) | Helene | Hélène, Ellen |
| Kutuzov | Kutuzov | Kutúzov |
| Nesvitsky | Nesvitsky | Nesvitski |
| Kozlovsky, Kamensky | -sky | -ski |
| Cyril Vladimirovich Bezukhov (Pierre's father) | Cyril | Kirill |
| Anna Mikhaylovna Drubetskaya | Mikhaylovna | Mikhailovna |
| Boris Drubetskoy | Drubetskoy | Drubetskoi |
| Compans (French general) | Compans | Campan |

Rules: "Marya" is correct for every character except Princess Mary Bolkonskaya. Forms of address (Prince, Count, Princess, "Your Excellency", "mon cher") are kept; briefly cue their meaning only where a new reader would otherwise be lost. Denisov's r-to-w speech impediment is preserved in every line he speaks and in proper nouns inside his speech.

**DECISION NEEDED (cross-surface):** the Cast tab (`war-and-peace-threads.json`) uses Russian forms (Prince Andrei Bolkonsky, Nikolai Rostov, Princess Marya, Hélène) while the reading text uses Maude's anglicised forms. Options: (a) align the cast file to the text, (b) align the text to the cast (a whole-book rename touching ~2,000 occurrences plus modern-da), (c) keep both and rely on the cast file's `searchNames`. Recommendation: (a).

## Diacritics

- Drop Maude's stress accents on Russian names and places (Natásha → Natasha, Borodinó → Borodino). They are pronunciation marks, not spelling.
- Keep genuine diacritics in non-Russian words and places: Schön Grabern, Olmütz, protégé, Hélène only when quoting French. **Proposal**; the baseline strips these inconsistently.

## Foreign language and footnotes

Maude prints French (and German/Italian) speech in the original with an asterisk footnote paragraph carrying the English. The baseline handles this three different ways (59 `[Speaking in French]` tags in chapters 1–39, 63 passages with French kept plus `*` footnote, 54 passages translated inline with the footnote slot left as a bare one-line paragraph such as "Kutuzov." or "Ours.").

**DECISION NEEDED — proposed single convention:**

1. Ordinary French dialogue is translated inline in the dialogue paragraph.
2. The fact that French is spoken is kept only where it matters (the source says so, or the switch is a social signal), as a light in-narrative cue: `she said in French`. No bracket tags.
3. Original French is retained inline only where the wording itself is the point (a pun, a quoted maxim, verse, the 666 arithmetic).
4. Footnote-slot paragraphs are never deleted (they exist in original-en and modern-da and alignment depends on them). The slot carries the original French, prefixed `*`, so the reader who wants it has it and nothing is duplicated: main paragraph = English, slot = `* Contez nous çela, Vicomte.`
5. Any change to the slot convention is applied to modern-da in the same pass, never to one edition alone.

Until approved, drafters do not change French handling or slot paragraphs in a chapter.

## Typography

- Straight double quotation marks for dialogue; single quotes only for quotes within quotes.
- Unspaced em dashes.
- Verse stays as verse (line breaks preserved as in the baseline).

## Chapter titles

modern-en titles mirror the source titles exactly. The source has a known parsing defect: the final chapter of each Book carries the next Book's name (chapters 28, 49, 68, 84, 106, 132, 145, 167, 190, 229, 263, 279, 298, 317, 337, 353). This is a **structural repair of original-en and modern-da together**, not something a drafter fixes in modern-en alone.

## Known defects in the baseline, reverified 2026-09-18 and classified

| Defect | Class | Evidence | Action |
|---|---|---|---|
| Duplicate title "Book Two — Chapter 1" (ch 28 and 29), duplicate "Chapter 5" (32, 33), no Chapter 2 | structural | `edition_checks.py` title-diff/title-duplicate flags; introduced by the early-flags batch | Restore modern-en titles to mirror source for ch 28–33; fix the source mislabel of ch 28 in the structural repair above |
| 16 book-final chapters mislabelled in source | structural (source) | title-sequence flags | Separate repair, all three editions |
| Single-quote dialogue in ch 283, 285, 286, 289, 292, 293, 295, 296, 302, 303, 305, 306, 307, 308, 309 | consistency | quote-style flags | Convert to double quotes, scripted, then verify no quote-within-quote damage |
| Bolkonski (27), Nesvitski (21), Hélène (37, ch 50–51), Kozlovski, Kamenski, Kirill (4), Mikhailovna (1), Andrei (1, ch 212) | consistency | name-variant flags | Fix by character identity per the table above; never global replace |
| Three French conventions; 33 bare footnote-slot lines; 10 tags mid-sentence; 4 duplicated translations | consistency | footnote-slot-bare and bracket-tag flags | Await French decision, then one scripted pass plus review |
| Em-dash spacing alternates by chapter; diacritics stripped from Olmütz, Schön Grabern | consistency | close-read | Scripted normalisation after the diacritics decision |
| Minor fidelity drift, 1–4 items in about half of chapters (dropped clause, softened word, added flourish); one grammar error ch 203 p38 | fidelity | 24-chapter independent close-read 2026-09-18 | Caught by the fidelity gate as chapters pass through the accessibility procedure; not a separate pass |
| Essays ch 338–365 faithful but structurally unchanged (mean sentence 23.5 words, 164 sentences over 50 words); ch 154–278 largely near-verbatim Maude | accessibility | sentence and similarity metrics | The accessibility procedure, essays and mid-book first |
| modern-da chapters 218, 220, 223, 226, 229, 340, 344, 350 run under 80 percent of source length | fidelity (Danish) | ratio scan | Danish workstream, separate |
