# Style note: *War and Peace* (Tolstoy), Tinct Modern English, targeted repair

- **Book:** `war-and-peace`  **Edition:** `modern-en`  **Date:** 2026-10-06

Applies to every renderer, reviser and reviewer of this repair. It governs only the 25 chapters listed in `slices.json` (source chapters in `src/`: 158, 168, 169, 170, 173, 175, 181, 183, 185, 255, 260, 261, 263, 265, 266, 267, 269, 270, 271, 272, 273, 274, 276, 277, 278, by file `number`). All other chapters of the served modern-en are already modernized and are not touched. Your job is to bring these 25 chapters up to the level of the rest.

**Fidelity anchor:** `served-original-en.json`, the Maude translation as served (Louise and Aylmer Maude, 1922-23 text). The edition is a *modernization of that English*, not a new translation. No other translation or the web is used. In the served live modern-en these 25 chapters stayed near-copies of the Maude text (often only spelling and quote marks changed). The modernized chapters of the live modern-en are the house standard: read three or four of them (for example ch 1, ch 102, ch 158's neighbors) before you start, and match them.

## Voice and sentences

- Tolstoy is plain, concrete, ironic and unhurried; his battle and history prose is argumentative. Keep that. The target register is the modernized chapters: natural contemporary narrative English, not slangy, **contractions allowed** (the live modern-en uses them freely, in narration as well as speech: "didn't", "he'd", "I'm").
- Replace 1920s diction and syntax with the everyday modern equivalent: "did not condescend to prepare" becomes "did not bother preparing"; "the freedom of their conduct" becomes "the looseness of their behavior"; "put that question" becomes "asked that question". Recast passive and participial chains into active clauses; split sentences of more than about 45 words at a natural joint, keeping Tolstoy's connectives (but, for, yet, and so, although).
- Use the same mechanics as the modernized chapters: reorder clauses, swap nouns and verbs for current ones, join or break with a dash. Do not reword clear modern-sounding phrases just to move the number.
- **Depth requirement.** Word-sequence similarity of each chapter to the served original should land at about **0.60-0.72** (the modernized chapters sit at 0.56-0.67). Every paragraph longer than about 25 words must differ visibly from the source in wording and rhythm, not only in a few synonyms. Short paragraphs, names-only lines and pure dialogue tags may stay close. Never go below 0.50 by paraphrasing away imagery or by condensing, and never go above 0.75.

## Force

Keep every hedge, irony and judgment exactly as strong or mild as written ("seemed", "perhaps", "it was as if", "evidently"). Do not soften Tolstoy's authorial verdicts on history, free will, Napoleon, Kutuzov or generals; do not sharpen them either. Keep repetition he uses for effect (the recurring phrases in battle and history passages).

## No additions

No commentary, glosses, notes, headings, bracketed text or modern framing. Period references may be clarified in a few words inside the sentence only where the text supports it. **Do not add** the "[Speaking in French]" / "[speaking in German]" tags that appear in the first chapters of the live modern-en: they are an addition and are not used here. If the source paragraph already contains a bracket, keep it exactly.

## Structure 1:1

365 chapters in the book; you render only the 25 listed, each as one array. Output paragraph N renders source paragraph N of that slice (`start`..`start+count-1`), with the same paragraph count; never merge, split, reorder, drop or invent one. Chapter titles ("Book Eight (1811 - 12) — Chapter 12" and the rest) are not part of your output and stay as served. Output length is normally at least 85% of the source word count.

## Names and forms (match the modernized chapters exactly)

Russian names are written **without accents**, as the live modern-en does everywhere else. Do not re-add stress marks (Rostóv).

| Source | Render |
|---|---|
| Natásha, Rostóv, Sónya, Pétya, Dólokhov, Dénisov, Kutúzov, Bagratión, Márya Dmítrievna, Kurágin, Bezúkhov, Bolkónski, Karatáev, Timókhin, Balashëv | Natasha, Rostov, Sonya, Petya, Dolokhov, Denisov, Kutuzov, Bagration, Marya Dmitrievna, Kuragin, Bezukhov, Bolkonski, Karataev, Timokhin, Balashev (ë becomes e) |
| Hélène, Véra, Métivier | Helene, Vera, Metivier |
| Prince Andrew, Nicholas, Princess Mary, Pierre, Boris, Berg | keep exactly: **Prince Andrew, Nicholas, Princess Mary** (never Andrey, Nikolai, Marya for these); Pierre; "Mary" alone for Princess Mary |
| Count / Countess / Prince / Princess + surname | keep: "Count Rostov", "Countess Bezukhova", "Prince Vasili". "The old count", "the little princess", "the old prince" keep their lower case. Feminine surnames keep -a (Bezukhova, Rostova) |
| diminutives and endearments (Nikolenka, Mitenka, Papa, my dear, darling, dear fellow) | keep as the source has them; do not regularize or replace with a different diminutive |
| Your Excellency, Your Highness, Your Majesty, Sire, sire | keep capitalization and wording as printed; do not turn into "sir" |
| Mademoiselle Bourienne, Mademoiselle George, Monsieur, Madame | keep as printed; "M." forms as printed |
| Mosc[o]w, Smolensk, Borodino, the Berezina and all place names | as printed minus accents |
| rouble(s) | "ruble(s)" is the dominant form in the live modern-en (156 vs 76): use **ruble(s)**. Versts, cossacks (capital C where printed), hussars, kvass, pelisse-type words: keep a unit or garment word when it is the item; modernize only if a plain word is exact |

Patronymics stay as printed: "Ilya Andreevich" style forms become accent-free ("Ilya Andreevich"); never shorten a patronymic form of address into a first name, and never expand one.

## Foreign words and French dialogue

The source prints most French speech already in English, with short French phrases left inline (mon cher, mais, Mon Dieu, à propos, enfant terrible). Keep any French phrase inline as printed, **with accents on French words** (Mademoiselle, à propos stays à propos); the accent-removal rule above covers Russian names only. Do not translate a French phrase the source left in French; do not add French to English speech. French or German names of people (Metivier, Wolzogen, Barclay de Tolly, Berthier) keep the source spelling minus accents on stress marks only.

## Technical and period terms: one rendering, kept stable

| Term | Rule |
|---|---|
| military ranks and offices (adjutant, aide-de-camp, commander-in-chief, general of infantry, colonel, cornet, orderly) | keep the rank; "aide-de-camp" as printed; "the commander-in-chief" for Kutuzov in 1812, never "supreme commander" |
| the army, the militia, the Guards, the Semenov / Pavlograd regiments, hussars, dragoons, cuirassiers | keep names and capitalization as in the modernized chapters |
| "the Emperor" (Alexander), "the Tsar" | keep whichever the source uses; do not swap |
| Buonaparte / Bonaparte / Napoleon | keep the source's form of the moment (Buonaparte in hostile Russian mouths becomes "Bonaparte" as in the live modern-en); "the French", "the enemy" as printed |
| God, Providence, "the Lord", providential | keep; Tolstoy's capitalization is kept |
| the history chapters (power, causes, the "will of a nation", "the elements", "the infinitely small") | keep the argument's terms stable within a chapter: render "power", "cause", "freedom", "necessity", "historians" the same way every time. Never turn "freedom" into "free will" or the reverse |
| "dear fellow", "my dear sir", "old man", "my boy" | modern equivalents of equal warmth and formality ("my dear fellow" is already used by the modernized chapters) |
| archaic: "whilst", "amongst", "to-day", "to-morrow", "shew" | spell as in the live modern-en: while, among, today, tomorrow |

## Quotations and letters

Spoken dialogue, letters, orders and dispatches in these chapters are modernized like narration (the modernized chapters do this), keeping meaning, tone, rank and formality. An official order or a document the narrative quotes verbatim keeps its numbers, dates, places and unit names untouched. Scripture or a proverb in the source keeps its wording. Inner thoughts (italic-free in the source) are modernized as speech.

## Typography (the live modern-en convention, verified)

- **Double quotes:** straight " ", used for speech and quotation; a quote nested inside uses straight single quotes ' '. No curly quotes remain (the source uses curly; the live modern-en converted them).
- **Apostrophes:** straight '.
- **Dashes:** spaced em dash " — " (the live modern-en normalizes "—" this way); no en dashes; a hyphen stays in compounds. Source "--" becomes " — ".
- **Ellipses:** the source's "..." is kept as three periods where speech trails off; do not add any.
- **Spelling:** American (color, honor, toward, among). "Count/Prince" and similar titles capitalized as in the source.
- No newlines inside a paragraph.

## Things that must not happen

1. A paragraph left identical or nearly identical to the source (apart from quote marks and accents), unless it is a very short tag or a name list.
2. Russian names re-accented, "Natásha"-style forms, or mixed forms in one chapter (Rostóv and Rostov, Andrew and Andrey).
3. Added "[Speaking in French]" tags, headings, explanations, or merged or split paragraphs.
4. Condensed paragraphs that drop an image, a detail of the field, a name, a figure, a time or a unit.
5. Contemporary slang or anachronism ("okay", "guys", "stuff" as a noun of rank) and phrases foreign to the register of the modernized chapters.
6. Changed facts: who speaks, who is addressed, direction, numbers, dates, the order of events, a battle position, a regiment.
7. Softened or sharpened authorial judgment in the history and philosophy chapters.
