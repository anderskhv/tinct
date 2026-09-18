# Batch P — Close-Read Notes

Full paragraph-by-paragraph check of all 19 chapters against `full-batchP-source.json`
(Maude translation, locked ground truth). 9 paragraph edits made across 5 defects, all
in `full-batchP-corrected.json`. Paragraph counts unchanged in every chapter (verified
programmatically). No re-translation for prose-quality reasons — only content-fidelity
fixes.

## Per-chapter verdict

| Ch  | Title                                    | Verdict |
|-----|-------------------------------------------|---------|
| 15  | Book One — Ch 15 (Anna Mikhaylovna at Bezukhov's) | Defective — 1 footnote-apparatus defect |
| 33  | Book Two — Ch 5 (Rostov/colonel dispute)  | Sound |
| 49  | Book Three — Ch 21 (Tushin's battery, night retreat) | Sound |
| 50  | Book Three — Ch 1 (Prince Vasili maneuvers Pierre) | Sound |
| 61  | Book Three — Ch 12 (council of war at Kutuzov's) | Sound |
| 69  | Book Four — Ch 1 (Rostov's homecoming)    | Defective — 1 footnote-apparatus defect |
| 108 | Book Six — Ch 2 (Prince Andrew at Otradnoe) | Sound |
| 131 | Book Six — Ch 25 (Princess Mary's letter) | Sound |
| 195 | Book Ten — Ch 5 (retreat past Bald Hills) | Sound |
| 200 | Book Ten — Ch 10 (Princess Mary and Dron) | Sound |
| 231 | Book Eleven — Ch 2 (historiographical essay) | Sound |
| 242 | Book Eleven — Ch 13 (Rostovs packing, wounded arrive) | Sound |
| 250 | Book Eleven — Ch 21 (retreat through Moscow, looting) | Sound |
| 254 | Book Eleven — Ch 25 (Rostopchin and Vereshchagin) | Defective — 1 dropped sentence |
| 280 | Book Thirteen — Ch 1 (flank march essay)  | Sound |
| 288 | Book Thirteen — Ch 9 (Napoleon's decrees) | Defective — 1 footnote-apparatus defect |
| 291 | Book Thirteen — Ch 12 (Pierre in captivity) | Sound |
| 292 | Book Thirteen — Ch 13 (French evacuation begins) | Sound |
| 300 | Book Fourteen — Ch 2 (guerrilla-war essay) | Defective — 1 footnote-apparatus defect |

## Defects found and fixed

### 1. Chapter 15, paragraphs 15–16 — orphaned footnote gloss
**Source (para 15):** `"Prince, humanum est errare, * but..." replied the doctor, swallowing his r's, and pronouncing the Latin words with a French accent.`
**Source (para 16):** `* To err is human.`

**Defective current text (para 15):** `"Prince, to err is human, but..." replied the doctor, swallowing his r's and pronouncing the Latin words with a French accent.` — the Latin was translated inline but the `*` footnote marker was dropped, leaving the footnote paragraph (para 16) reading as an orphaned, unmarked restatement: `The original Latin footnote: To err is human.`

**Fix:** Restored the `*` marker in the body after the translated phrase, and normalized the footnote paragraph back to plain apparatus form:
- Para 15 → `"Prince, to err is human, * but..." replied the doctor, swallowing his r's and pronouncing the Latin words with a French accent.`
- Para 16 → `* To err is human.`

### 2. Chapter 69, paragraphs 19–20 — orphaned footnote gloss
**Source (para 19):** `"Here he is... our own... Kólya, * dear fellow... How he has changed!... Where are the candles?... Tea!..."`
**Source (para 20):** `* Nicholas.`

**Defective current text (para 19):** `"Here he is... our own boy... Kolya, sweetheart... How he's changed!... Where are the candles?... Tea!..."` — the source's inline `*` marker after "Kólya" was dropped. Para 20 was expanded into an explanatory sentence (`* Kolya is the familiar form of Nicholas.`) rather than reading as apparatus tied to a marker in the body.

**Fix:**
- Para 19 → `"Here he is... our own boy... Kolya, * sweetheart... How he's changed!... Where are the candles?... Tea!..."`
- Para 20 → `* Nicholas.`

### 3. Chapter 288, paragraphs 8–9 — orphaned footnote gloss
**Source (para 8):** `...Napoleon decreed that all the troops in turn should enter Moscow à la maraude * to obtain provisions for themselves...`
**Source (para 9):** `* As looters.`

**Defective current text (para 8):** `...Napoleon decreed that all troops should take turns entering Moscow to forage—'à la maraude'—so the army could provide for itself.` — no `*` marker after the retained French phrase. Para 9 read as a freestanding parenthetical (`(That is, as looters.)`) instead of apparatus keyed to the body.

**Fix:**
- Para 8 → `...entering Moscow to forage—'à la maraude' *—so the army could provide for itself.`
- Para 9 → `* As looters.`

### 4. Chapter 300, paragraphs 3–4 — orphaned footnote gloss
**Source (para 3):** `...Les gros bataillons ont toujours raison. *`
**Source (para 4):** `* Large battalions are always victorious.`

**Defective current text (para 3):** `...'Big battalions are always right.'` (inline translation, no marker). Para 4 read as a freestanding parenthetical (`(Large battalions are always victorious.)`) restating the same French quote in slightly different words — a near-duplicate translation with no apparatus link to the body.

**Fix:**
- Para 3 → `...'Big battalions are always right.' *`
- Para 4 → `* Large battalions are always victorious.`

### 5. Chapter 254, paragraph 45 — dropped clause
**Source:** `"Hit him with an ax, eh!... Crushed?... Traitor, he sold Christ.... Still alive... tenacious... serves him right! Torture serves a thief right. Use the hatchet!... What—still alive?"`

**Defective current text:** `"Hit him with an ax, eh!... Crushed?... Traitor, he sold Christ... Still alive... stubborn... serves him right! Use the hatchet!... What—still alive?"` — the sentence "Torture serves a thief right." (a proverb-like line in the crowd's jeering at Vereshchagin's lynching) was dropped entirely between "serves him right!" and "Use the hatchet!"

**Fix:** Restored the sentence: `"...serves him right! Torture serves a thief right. Use the hatchet!..."`

## Items checked and judged not to be defects

- **Ch 61, para 10** — source's "attack the enemy's latter wing" (referring back to "his right" wing mentioned earlier in the same sentence) is rendered as "attack the enemy's right wing" in the current text. This is a correct resolution of the antecedent, not an inversion.
- **Ch 108, para 0** — "the Ryazán estate of which he was trustee" is rendered as "his son's Ryazan estate." Confirmed against established plot (the estate belongs to Prince Andrew's son Nikolenka; Andrew is trustee) — accurate, not a distortion.
- **Ch 69, para 65** — source's rhetorical opener "Why, you remember before you went away?..." is compressed into the following sentence in the current text, losing the direct question form but preserving all content. Judged a prose-compression choice, not a fidelity break — left unchanged per instructions not to re-translate for prose-quality reasons.
- **Ch 49, para 3 and Ch 250, para 1** — flagged by an automated length-ratio scan as heavily compressed, but reviewed and found to preserve all substantive content (no dropped facts, names, or clauses) — left unchanged.
- Names throughout: Andrew, Nicholas, Mary, Kutuzov, Helene, Peter-house-convention spellings and de-diacritized Russian names (Miloradovich, Przhebyshevsky, Dokhturov, Kirsten, etc.) already conform to house style across all 19 chapters — no corrections needed.
- No meaning inversions, numeric/date/rank distortions, or other invented content found in any of the 19 chapters beyond the 5 items above.
