# War and Peace — Batch G INDEPENDENT REVIEW

Reviewer: independent adversarial pass (not the drafting pass).
Scope: chapters 147–164, 166, 167 (20 chapters; 165 excluded by brief).

Files reviewed:
- Source (ground truth): `full-batchG-source.json`
- Corrected: `full-batchG-corrected.json`
- Pre-fix current: `full-batchG-current-modern-en.json`
- Drafter's notes: `full-batchG-notes.md`

Method: (1) programmatic diff of corrected vs current across all chapters/paragraphs
and keys; (2) programmatic heuristics over corrected vs source — paragraph-count
parity, word-count ratio outliers, missing/added numerals, missing proper nouns,
short/parenthetical/placeholder paragraphs; (3) manual sentence-by-sentence read of
all ~620 paragraph pairs, side by side.

---

## 0. Scope discrepancy with the review brief (flag, not a text defect)

The brief asked me to check "Nicholas's return, the Mitenka confrontation, the wolf
hunt, 'Uncle's' house, Rostov finances, the Julie Karagina subplot, the Christmas
mummers, the Melyukovs' visit, and Nicholas's marriage declaration."

Only **one** of those (the Julie Karagina subplot, ch150) is in Batch G. The rest —
Nicholas's return, Mitenka, the wolf hunt, "Uncle's" house, Rostov finances, the
mummers, the Melyukovs, Nicholas's marriage declaration — are **Book Seven**
material and are **not in these files**. Batch G is Book Eight chs. 2–21 plus one
further chapter: the Bolkonsky/Rostov Moscow visit, the opera, Anatole's seduction
of Natasha, the failed abduction, and Pierre's declaration. Either the brief's scene
list belongs to a different batch, or a Book Seven batch still needs this treatment.
Worth resolving before this batch is signed off as "the 20 chapters."

Secondary flag: chapter 167 is titled `Book Nine (1812) — Chapter 22`. This is Book
Eight's chapter 22, not Book Nine's. **The same wrong title is in the source file**,
so it is not drift introduced by the modern-en rendering and I did not change it —
but it is a live mislabeling that will reach readers and should be fixed upstream.

---

## 1. Confirmed diff set: corrected vs current

Verified programmatically across all 20 chapters, all paragraphs, all object keys.

**Exactly one paragraph differs. Nothing else changed.**

| Chapter | Para | Change |
|---|---|---|
| 167 | 34 (last) | `twenty-two degrees of frost below zero` → `twenty-two degrees of frost, Fahrenheit,` |

- No chapter titles changed.
- No paragraph counts changed.
- No chapters added or removed.
- No other key added or removed.

Paragraph-count parity with source re-verified independently: **20/20 chapters match
exactly** (8, 51, 39, 27, 14, 26, 29, 23, 17, 16, 17, 27, 28, 74, 57, 36, 26, 36, 43, 36).

## 2. The claimed fix, verified against source

Source, ch167 ¶34 (Maude), verbatim:

> "Home!" said Pierre, and despite twenty-two degrees of frost Fahrenheit he threw
> open the bearskin cloak from his broad chest and inhaled the air with joy.

**The fix is correct.** The pre-fix text said "twenty-two degrees of frost below zero,"
which (a) invented "below zero," a claim the source does not make, and (b) dropped
"Fahrenheit," the word fixing the scale. "Degrees of frost" is degrees below the
freezing point, so the source means roughly 10°F; "twenty-two below zero" states
about −22°F. That is a real numeric/factual distortion of roughly 30 degrees, and
the drafter's diagnosis and minimal repair both hold. The corrected clause now
carries both the number and "Fahrenheit," and no other part of the paragraph or
chapter was touched.

Verdict on the drafter's one claim: **accurate, correctly scoped, keep it.**

## 3. Independent findings — all 20 chapters

I do **not** concur with "19 of 20 chapters sound." I found four further genuine
defects the drafting pass missed, two of them reader-visible, and one of them in a
category the drafter explicitly claimed to have checked and cleared.

### DEFECT 1 — MEDIUM — Ch150 ¶7 and ¶12: reader-facing placeholder text

| | ¶7 | ¶12 |
|---|---|---|
| **Source** | `* Death gives relief and death is peaceful. Ah! from suffering there is no other refuge.` | `*Poisonous nourishment of a too sensitive soul, Thou, without whom happiness would for me be impossible, Tender melancholy, ah, come to console me, Come to calm the torments of my gloomy retreat, And mingle a secret sweetness With these tears that I feel to be flowing.` |
| **Corrected** | `(French verse translated.)` | `(French verse translated.)` |

These are Boris's album verses to Julie. The source structure is: the French verse in
¶6/¶11, its footnoted English translation in ¶7/¶12. The modern edition translated
the French inline into ¶6/¶11 — which is a defensible choice — and then left the now
redundant footnote paragraphs as the literal string **"(French verse translated.)"**.

This is placeholder/scaffold text shipped as body copy. A reader of the Modern English
edition sees a bare editorial stub twice on one page. Word-count ratio flags this hard:
¶7 renders at 0.20 of source length, ¶12 at 0.07.

It is also internally inconsistent with how the same problem is handled elsewhere in
this very batch:
- Ch148 ¶4 keeps the footnote as real content: `* To force the barrier.`
- Ch155 ¶8 keeps it as real content: `(The French phrase means: "Are the pretty women.")`

Secondary loss in the same place: the French originals in ¶6 and ¶11 are gone
entirely, replaced by English. Elsewhere the batch preserves the French and footnotes
it (ch148 ¶3–4; ch155 ¶7–8). Tolstoy's French is a deliberate texture of the novel and
of this scene in particular — Boris courting in borrowed French sentiment.

**Recommended repair:** restore the ch148/ch155 pattern — French verse in ¶6/¶11 with
a marker, English translation as the ¶7/¶12 footnote. At minimum, ¶7 and ¶12 must
carry the actual English translation text, not the placeholder string.

### DEFECT 2 — MEDIUM-LOW — "Kargins": proper-noun corruption, 8 occurrences

The Karagin family is rendered **"Kargins"** (a dropped syllable, not an accent
normalization) in eight places, while the same family is rendered correctly as
**"Karagina"** elsewhere in the same batch.

Wrong (`Kargins`): ch150 ¶3 (×2), ¶14, ¶17 (×2), ¶19; ch153 ¶10; ch155 ¶4; ch160 ¶47.
Right (`Karagina`): ch149 ¶13, ¶17; ch156 ¶1.

Source is `Karágins` / `Karágina` throughout. Expected project normalization is
`Karagins` / `Karagina`. This is a corrupted proper noun, not a modernization choice,
and it is self-inconsistent within the batch.

Note this contradicts the drafter's note: *"All character-name spellings checked
against project convention… consistent throughout the batch; no violations found."*
That claim is false as written.

**Recommended repair:** `Kargins` → `Karagins` at all 8 sites.

### DEFECT 3 — LOW-MEDIUM — Ch153 ¶3: dropped clause and dropped sentence

**Source (end of paragraph):**
> The count got out helped by the footmen, and, **passing among men and women who
> were entering and the program sellers**, they all three went along the corridor to
> the first row of boxes. **Through the closed doors the music was already audible.**

**Corrected:**
> The count got out with the help of the footmen, and all three of them walked along
> the corridor to the first row of boxes.

Two source elements are gone: the crowd-and-program-sellers clause, and the entire
closing sentence about the music audible through the closed doors. The lost sentence
is not decorative — it is the sensory lead-in to the opera sequence, and the opera
sequence is the hinge of this whole batch. This is omission, not compression.

**Recommended repair:** restore both.

### DEFECT 4 — LOW — Ch154 ¶3 and ¶11: "adjutant" flattened to "officer"

Source ¶3: *"an exceptionally handsome **adjutant** approaching their box"* and
*"He was now in an **adjutant's** uniform with one epaulet and a shoulder knot."*
Corrected renders both as "officer" / "officer's uniform."

Anatole's adjutancy is a plot fact, not a costume detail — it is the post his father
bought him as the price of the Moscow exile, and the batch itself states this plainly
in ch156 ¶1, which correctly keeps *"as adjutant to the commander in chief."* Losing
the word in ch154 makes the first sighting less specific than the explanation that
follows it. "Adjutant" is not archaic English and needs no modernization.

**Recommended repair:** restore "adjutant" in both spots in ch154.

### Borderline items examined and rejected as non-defects

- **Ch167 ¶1** — `Count Peter Kirílovich` → `Count Bezukhov`, while ¶8 keeps
  "Peter Kirilovich." I concur with the drafter: inconsistent, not a fidelity defect;
  identity and meaning intact. Worth tidying if this file is reopened for Defects 1–4.
- **Ch161 ¶32** — `"ladykins" as he called the cocottes` → `women of pleasure`.
  Loses Balaga's coinage and the narrator's aside about it, but the referent survives.
  Stylistic, not a distortion.
- **Ch157 ¶10** — `her protégée` → `her new friend`. Slightly softens Helene's
  patronage over Natasha; does not alter any claim or event.
- **Ch161 ¶37** — `the front corner of the room` → `the icon corner`. Adds a gloss,
  but it is the correct gloss (the red/icon corner). Acceptable.
- **Ch148 ¶2** — "December 6" retained; the numeral heuristic flag was a false
  positive ("6th").
- **Ch148 ¶6** — `Buonaparte` → `Bonaparte`; `slave of Buonaparte` → `Bonaparte's
  lackey`. Within normalization and idiom range.
- **Ch148 ¶46** — "Roman Catholics" → "Catholics", "Pope's indulgence" → "papal
  dispensation", "Public Baths" → "public bathhouses". All preserve the claim.
- **Ch162 ¶12** — `sabretache and saber` → `saber pouch and sword`. Acceptable gloss.
- **Ch166 ¶5** — "Natasha's elopement" → "elopement attempt". Arguably *more*
  accurate to the events; the old prince is relaying an embellished rumor either way.
  Not flagged.
- All remaining accent/diacritic normalizations (Natásha→Natasha, Bolkónski→Bolkonsky,
  Hélène→Helene, Dólokhov→Dolokhov, Márya Dmítrievna→Marya Dmitrievna,
  Matrëna→Matrena, Iványch→Ivanich, Ilyníchna→Ilyinichna, Nikítski→Nikitsky,
  Podnovínski→Podnovinsky, Speránski→Speransky, Meshchérski→Meshchersky) are
  consistent and correct. Only `Kargins` (Defect 2) breaks the pattern.

### Per-chapter verdicts (independent)

| # | Book Eight ch. | My verdict |
|---|---|---|
| 147 | 2 | Sound |
| 148 | 3 | Sound |
| 149 | 4 | Sound |
| 150 | 5 | **Defective — Defect 1 (¶7, ¶12), Defect 2 (¶3, ¶14, ¶17, ¶19)** |
| 151 | 6 | Sound |
| 152 | 7 | Sound |
| 153 | 8 | **Defective — Defect 3 (¶3), Defect 2 (¶10)** |
| 154 | 9 | **Defective — Defect 4 (¶3, ¶11)** |
| 155 | 10 | **Defective — Defect 2 (¶4)** |
| 156 | 11 | Sound |
| 157 | 12 | Sound |
| 158 | 13 | Sound |
| 159 | 14 | Sound |
| 160 | 15 | **Defective — Defect 2 (¶47)** |
| 161 | 16 | Sound |
| 162 | 17 | Sound |
| 163 | 18 | Sound |
| 164 | 19 | Sound |
| 166 | 21 | Sound |
| 167 | (labeled Bk Nine) 22 | Sound *after* the applied Fahrenheit fix |

Fourteen of twenty chapters are clean. The Anatole/opera arc (150, 153, 154, 155)
plus 160 carry the remaining defects.

## 4. Final verdict

**The applied fix is verified and correct, and the diff is exactly as claimed — but
the batch is NOT clean and must not ship as-is.**

- Diff set: confirmed, exactly one paragraph (ch167 ¶34), nothing else touched.
- Fahrenheit fix: confirmed accurate against the Maude source.
- Drafter's "19 of 20 sound" claim: **not supported.** Six chapters carry defects, not
  one. Two of the four additional defects are reader-visible in the shipped text, and
  one falls in a category the drafter's notes explicitly certified as clear.

**Required before sign-off:**
1. Ch150 ¶7, ¶12 — remove the `(French verse translated.)` placeholders; restore real
   content following the ch148 ¶4 / ch155 ¶8 pattern. *(highest priority — placeholder
   text in shipped prose)*
2. `Kargins` → `Karagins`, 8 sites across ch150/153/155/160.
3. Ch153 ¶3 — restore the dropped clause and the dropped closing sentence.
4. Ch154 ¶3, ¶11 — restore "adjutant" / "adjutant's uniform".

**Also worth resolving outside this file:**
- The brief's scene list (Book Seven) does not match this batch's contents (Book
  Eight). Confirm the intended scope.
- Ch167's title says "Book Nine (1812) — Chapter 22" in the **source** file; it is Book
  Eight's chapter 22. Upstream fix.

Recommendation: return to the drafting lane for the four repairs, then re-review. The
placeholder strings in particular are the class of defect that a paragraph-count check
and a "reads fine" pass will never catch, and they are exactly what a reader notices.
