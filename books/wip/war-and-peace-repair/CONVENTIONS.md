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
| Prince Andrew Bolkonski | Andrew, Prince Andrew, Bolkonski (cards + Maude) | Andrei, Bolkonsky |
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

**DECIDED 2026-09-18 (Anders):** the Cast tab (`war-and-peace-threads.json`) is legacy. The character cards (`app/public/data/characters/war-and-peace.v1.json`) are the reader-facing surface and use Maude's English forms (ids `andrew`, `nicholas-rostov`, `princess-mary`, `helene`, `old-prince-bolkonski`, `marya-dmitrievna`). The text follows the cards' English names. Surname spelling follows the cards and Maude: **Bolkonski**, Nesvitski is NOT adopted (cards do not name him; keep the text majority Nesvitsky). The table above is updated accordingly.

**Downstream dependency:** the character-card file pins `sourceSha256` and per-paragraph hashes of modern-en and anchors 8,466 mentions by chapter, paragraph index and UTF-16 offsets. Any accepted text change invalidates the offsets in that paragraph. The changed-passage records (same key: chapter number + paragraph index) are what the card re-anchoring job should consume, exactly as audio does.

## Diacritics

- Drop Maude's stress accents on Russian names and places (Natásha → Natasha, Borodinó → Borodino). They are pronunciation marks, not spelling.
- Keep genuine diacritics in non-Russian words and places: Schön Grabern, Olmütz, protégé, Hélène only when quoting French. **Proposal**; the baseline strips these inconsistently.

## Foreign language and footnotes

Maude prints French (and German/Italian) speech in the original with an asterisk footnote paragraph carrying the English. The baseline handles this three different ways (59 `[Speaking in French]` tags in chapters 1–39, 63 passages with French kept plus `*` footnote, 54 passages translated inline with the footnote slot left as a bare one-line paragraph such as "Kutuzov." or "Ours.").

**DECIDED 2026-09-18 (Anders): translate to English, with a short parenthesis marking that it was spoken in French.** The single convention is:

1. French (and German/Italian) speech is translated inline in the dialogue paragraph.
2. Where the source gives the passage in French (that is, wherever Maude prints French with a footnote, or says "in French"), the translated line carries the cue **(in French)** once, placed after the speech verb if there is one ("she said (in French)"), otherwise directly after the closing quotation mark. Not repeated for every sentence of a long French exchange: once per paragraph. No bracket tags, no "[Speaking in French]".
3. Original French is retained inline only where the wording itself is the point (a pun, a quoted maxim, verse, the 666 arithmetic in ch 186), immediately followed by the English.
4. Footnote-slot paragraphs are never deleted (they exist in original-en and modern-da and alignment depends on them). In modern-en the slot carries the original French, prefixed `*`, so a reader who wants the French has it and nothing is duplicated: main paragraph = English + (in French), slot = `* Contez nous çela, Vicomte.` Slots whose source footnote is not a translation but a gloss ("(Old style date.)", "An esaul is a captain of Cossacks") keep the gloss in parentheses.
5. Where the foreign wording stays inline under rule 3 and a slot exists, the slot keeps Maude's English footnote (`* <English>`) so the foreign text is not duplicated.
6. modern-da keeps its paragraph count; its slot convention is decided in the Danish workstream. Paragraph counts never diverge between editions.

Scripted pass to apply this across the 180 affected passages, then Gate B review of every touched paragraph, is queued as the "French pass" (see MODERN-EN-REPAIR-STATUS.md).

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
