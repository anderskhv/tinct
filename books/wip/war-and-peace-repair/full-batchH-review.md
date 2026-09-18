# Batch H — Independent Adversarial Review (Chapters 168–187)

Reviewer: independent second pass. Scope: chapters 168–187 (War and Peace, Book Nine 1812, Ch. 1–20).

Files reviewed:
- Source: `full-batchH-source.json` (Maude)
- Corrected: `full-batchH-corrected.json`
- Pre-fix: `full-batchH-current-modern-en.json`
- Drafter's notes: `full-batchH-notes.md`

Method: (1) full programmatic diff of corrected vs current; (2) verification of the claimed fix against source and against in-batch usage; (3) my own paragraph-by-paragraph read of all 20 chapters (461 paragraph pairs) against the Maude source, including 173 (47 paras), 178 (19 paras, the war-council chapter), 185 (24 paras, the liturgical passage) and 187 (85 paras, the Rostov dinner); (4) targeted scans for paragraph-count drift, word-count outliers, inserted parentheticals, dropped proper nouns and dropped numerals.

---

## 1. Confirmed diff set

Programmatic diff of `corrected` vs `current-modern-en`, comparing chapter numbers, titles and every paragraph:

- **Chapter count:** 20 vs 20, identical numbering and titles.
- **Paragraph counts:** identical in all 20 chapters (no merges, splits, reorders or drops).
- **Exactly one paragraph differs: chapter 186, paragraph index 13.**
  - Only substring changed: `the Ostrovnoe engagement` → `the Ostrovna affair`
  - Everything else in that paragraph is byte-identical.
- **No other chapter, title or paragraph was touched.**

The drafter's claim "exactly one chapter changed" is **confirmed**. Nothing was silently altered elsewhere.

## 2. Verification of the fix

Source, ch.186 para 13 (Maude):

> "…awarded a St. George's Cross of the Fourth Class for courage shown in **the Ostróvna affair**, and in the same order the name of Prince Andrew Bolkónski…"

In-batch usage of the place name (all occurrences, all three files):

| File | Ch. | Para | Rendering |
|---|---|---|---|
| source | 181 | 0 | Ostróvna |
| source | 182 | 10 | Ostróvna |
| source | 186 | 13 | Ostróvna |
| current (pre-fix) | 181 | 0 | Ostrovna |
| current (pre-fix) | 182 | 10 | Ostrovna |
| current (pre-fix) | 186 | 13 | **Ostrovnoe** ← the defect |
| corrected | 181 / 182 / 186 | — | Ostrovna / Ostrovna / **Ostrovna** |

The fix is **correct and correctly scoped**. "Ostrovnoe" was the sole outlier against both the source and the edition's own usage two chapters earlier; the corrected form matches both. The rest of the paragraph (St. George's Cross, Fourth Class, Nicholas Rostov, Prince Andrew's regimental appointment) matches the source.

## 3. Structural verification (my own)

Paragraph counts, source vs corrected, all 20 chapters:

168:20/20, 169:18/18, 170:21/21, 171:30/30, 172:19/19, 173:47/47, 174:28/28, 175:29/29, 176:19/19, 177:11/11, 178:19/19, 179:22/22, 180:26/26, 181:19/19, 182:11/11, 183:8/8, 184:10/10, 185:24/24, 186:16/16, 187:85/85. **All match.**

Chapter-level word-count ratio (modern/source) ranges 0.95–1.00 — no chapter is condensed. Paragraph-level outlier scan (ratio <0.72 or >1.35) surfaced only four paragraphs, all of them short footnote or one-line items where the ratio is meaningless (171.14, 171.22, 173.26, 185.4). No paragraph is a summary, a stub or placeholder text.

Numeral scan: no numbers dropped or altered (only comma/punctuation differences). Proper-noun scan: no named person, place, regiment or work dropped; all apparent "missing" capitals are explained by the edition's systematic conventions (`-ski` → `-sky` transliteration, Thee/Thou → You, glossed French, sentence restarts).

## 4. Independent chapter-by-chapter findings

- **168 (Ch.1)** — Sound. The free-will/causation essay is rendered in full, including the apple passage, the "hive life" argument and the *Quos vult perdere dementat* epigraph (kept in Latin, with the footnote glossed inline).
- **169 (Ch.2)** — Sound. Dresden, the Niemen crossing, the drowning Uhlans, the Legion of Honor order. Two small nuance notes below (N1, N2).
- **170 (Ch.3)** — Sound. Vilna, the Bennigsen ball, Boris overhearing the Emperor. Alexander's letter to Napoleon is complete and accurate.
- **171 (Ch.4)** — Sound. Balashev's departure, the hussar picket, Murat. Footnote glosses handled per batch convention.
- **172 (Ch.5)** — Sound. The Davout/Arakcheev parallel, the barrel-and-door table, the four days of detention.
- **173 (Ch.6)** — **Read in full (47 paragraphs).** Sound. Napoleon's outburst is complete: the eighteen-month complaint, the Prince of Baden line, the Moldavia/Wallachia and Gulf of Bothnia passage, the roll-call of Steins/Armfeldts/Bennigsens/Wintzingerodes, the Bagration assessment, the 530,000 figure, the Swedish/Bernadotte jibe, the Dvina/Dnieper threat, the quivering left calf. Nothing dropped, nothing invented. One word-choice note (N3).
- **174 (Ch.7)** — Sound. The dinner, the "Holy Moscow"/churches exchange, the Poltava riposte, the ear-pull.
- **175 (Ch.8)** — Sound. Andrew's pursuit of Kuragin, Bald Hills unchanged, the quarrel with the old prince, the Bluebeard scene, Princess Mary's plea. One gloss note (N4).
- **176 (Ch.9)** — Sound. All nine parties are present, in order, with their full membership and arguments, including the eighth "drone" party's five illustrative careerists and the ninth party's letter via Shishkov.
- **177 (Ch.10)** — Sound. Pfuel's entrance and the national-self-assurance passage (French/English/Italian/Russian/German) are complete and in order.
- **178 (Ch.11)** — **Read in full; one genuine defect (D1 below).** Otherwise sound: the Armfeldt/Toll/Paulucci proposals, Pfuel's outburst, the polyglot collapse of the council, and Andrew's long interior monologue on military genius are all complete. The Schön Grabern / Austerlitz numerical comparison is preserved correctly. See D1 and N5.
- **179 (Ch.12)** — Sound. Nicholas's letters, the retreat, the "drunken camp" at Sventsiany, Zdrzhinski's Raevsky story and Nicholas's silent rebuttal.
- **180 (Ch.13)** — Sound. The tavern, Mary Hendrikhovna, the samovar, the "Kings" game, the doctor's return.
- **181 (Ch.14)** — Sound. The march to Ostrovna, the sunrise, the Uhlan charge.
- **182 (Ch.15)** — Sound. Rostov's charge, the capture of the dimpled officer, the moral nausea, the St. George's Cross.
- **183 (Ch.16)** — Sound. The essay on doctors is complete, including the child-and-bump analogy and the ruble-seventy-kopeck detail.
- **184 (Ch.17)** — Sound. Natasha's devotions with Agrafena Ivanovna, the week of Matins, the communion.
- **185 (Ch.18)** — Sound. **I checked the entire liturgical passage clause by clause.** The prayer for deliverance from invasion is complete and in order: Amalek/Midian/Goliath, the bow of brass, the spear and shield, the dust-before-the-wind image, the clean-heart petition, the closing doxology. Thee/Thou modernized to You throughout, consistently, with no petition added or dropped.
- **186 (Ch.19)** — Defect fixed as claimed (see §2). Two additional minor notes (N6, N7) below — neither is a fidelity defect, but the drafter did not notice them.
- **187 (Ch.20)** — **Read in full (85 paragraphs).** Sound in substance: the solfa scene, Natasha's question about Bolkonsky's forgiveness, Pierre's suppressed declaration, Petya's plea, the manifesto reading, Shinshin's needling, the closing "Pierre made up his mind not to go to the Rostovs' any more." No paragraph dropped, no dialogue turn reassigned. Three small notes (N8–N10).

---

## 5. Additional genuine defect found

### D1 — Chapter 178 (Book Nine Ch.11), paragraph index 16: invented editorial gloss inside Prince Andrew's interior monologue. **Severity: low–moderate. Recommend fixing.**

Source:

> "The best generals I have known were, on the contrary, stupid or absent-minded men. **Bagratión was the best**, Napoleon himself admitted that."

Corrected/current modern-en:

> "The best generals I have known were, on the contrary, stupid or absent-minded men. **Bagration (Pyotr Bagration) was the best** — Napoleon himself admitted it."

`(Pyotr Bagration)` has no counterpart in the source. It is an inserted editorial name-gloss, and it is inserted *inside a character's first-person interior monologue*, where an encyclopedic parenthetical is doubly out of register — Prince Andrew would not gloss the first name of a general he has served alongside. It is also inconsistent with the rest of the batch: Bagration is named without gloss at 173.32 and 176.6, and no other figure in these 20 chapters receives a first-name parenthetical.

This is the same defect class the drafter was hunting (invented/inserted content), and it was missed. My parenthetical-insertion scan across all 461 paragraph pairs found only two non-conventional insertions — this one and N6 — so the problem is isolated, not systemic.

**Suggested fix:** delete the parenthetical, leaving "Bagration was the best — Napoleon himself admitted it."

---

## 6. Minor notes (nuance drift; not defects, no fix required)

These are recorded so a future pass does not re-discover them as "new". None of them omits, inverts or invents content.

- **N1 — 169.4:** The source's French parentheticals `(les Cosaques)` and `(Moscou, la ville sainte)` are dropped rather than glossed. Consistent with this edition's de-Frenchifying convention; loses a little of Tolstoy's bilingual texture.
- **N2 — 169.13:** "impel them to insane **self-oblivion**" → "drive them to insane **self-sacrifice**." Near-synonymous in context (the drowning Uhlans) but a real shade of difference: self-forgetting vs. self-immolation.
- **N3 — 173.32:** "that **monstrous** crowd" → "that **ridiculous** crowd." Softens Napoleon's contempt from grotesque to merely absurd.
- **N4 — 175.4:** "just as **the little princess** used to do" → "just as **his late mother** used to do." Factually correct (Lise is little Nicholas's mother) and clearer for a modern reader, but it substitutes an explanation for Tolstoy's epithet.
- **N5 — 178.16:** "I remember his **limited**, self-satisfied face" → "his **smug**, self-satisfied face." The source uses *limited* here and again four sentences later ("He should be **limited**…"); the modern text renders the second as "narrow-minded," so the deliberate verbal echo in Andrew's argument is lost.
- **N6 — 186.9 / 186.10:** The modern text glosses `quarante-deux` inline as `(forty-two)` **and** retains the source's separate footnote paragraph `* Forty-two.` at 186.10, so the gloss is duplicated. Also, that retained footnote keeps the bare `*` marker, unlike the batch's convention elsewhere of rewriting footnotes as `(The French phrase means: "…")`. Cosmetic inconsistency, not a fidelity loss.
- **N7 — 186.13:** "a regiment of **Chasseurs**" → "a regiment of **light infantry**." Defensible modernization, but it drops the proper unit designation of the regiment Prince Andrew commands for the remainder of the novel.
- **N8 — 187.57:** Source is elliptical with no subject — "Not a patriot at all, but simply…" The modern text supplies a first person twice: "**I'm** not a patriot at all, **I'm** simply…", resolving an ambiguity Tolstoy left open. The first-person reading is the likelier one (Shinshin has just redirected his jab at Natasha), so this is an interpretive choice rather than an error.
- **N9 — 187.60:** "Never mind what it's **for**…" → "Never mind what it **says**…" Shifts the count's dismissal from the manifesto's *purpose* (Pierre has just flagged the phrase "for consultation") to its *wording*. Slightly blunts the exchange.
- **N10 — 187.63:** "looked up **to heaven**" → "looked up **at the ceiling**." Literalizes a gesture of appeal to God into a physical glance.
- **N11 — 181.11, 182.0 (pattern):** Tolstoy's narratorial "our Uhlans / our infantry / our guns" is consistently rendered "the Russian Uhlans / the Russian infantry / the Russian guns." Applied uniformly and defensible for a modern reader, but it removes the narrator's implied Russian first person.

---

## 7. Verdict

- **Diff set:** confirmed — exactly chapter 186, paragraph 13, one substring, nothing else.
- **Claimed fix:** confirmed correct against the Maude source and against in-batch usage at 181.0 and 182.10.
- **Drafter's "19/20 sound" claim:** **not fully accurate.** Chapter 178 carries a genuine inserted-content defect (D1) that the first pass missed.
- **Structural integrity:** clean. No merges, splits, reorders, drops, summaries, stubs or placeholders anywhere in the 20 chapters. No proper nouns or numerals lost.
- **Overall:** the batch is in good shape — 18 of 20 chapters are clean on my read, chapter 186 is correctly repaired, and chapter 178 needs one small deletion.

**Status: NOT clean as submitted. One fix required (D1, chapter 178 paragraph 16: delete `(Pyotr Bagration)`).** After that deletion, I consider the batch acceptable; the remaining items (N1–N11) are nuance-level and do not warrant changes.
