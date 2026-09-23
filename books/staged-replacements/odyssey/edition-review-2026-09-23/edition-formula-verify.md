# Edition formula edits + B20 ¶2 — independent verification (2026-09-23)

**Verdict: DEFECTS FOUND**

The mechanics are clean. All 19 edits apply exactly and nothing else changes. Every formula is Butler's at that place. Three edits (B16 ¶36, B18 ¶40, B21 ¶34) put a new "So he spoke" in front of a "so" that the paragraph already had as its consequence link. The result is a doubled *So … so* that appears nowhere else in the edition. Separately, Books 4, 7 and 8 render "Thus did they converse" as "So they talked together", while Books 14–24 use "So they talked". That is a minor inconsistency the edits did not create.

## 1. Mechanical check (from + listed replacements == to)

| Book | from → to | edits | old unique in ¶ (and in file) | other ¶ / title / number changed |
|---|---|---|---|---|
| 13 | v3 → v4 | ¶0, ¶4 | yes | none |
| 14 | v3 → v4 | ¶22 | yes | none |
| 15 | v4 → v5 | ¶19 | yes | none |
| 16 | v3 → v4 | ¶29, ¶36 | yes | none |
| 18 | v2 → v3 | ¶23, ¶40 | yes | none |
| 20 | v4 → v5 | ¶12, ¶14, ¶20, ¶31 | yes | none |
| 20 | v5 → v6 | ¶2 (×2) | yes | none |
| 21 | v3 → v4 | ¶34 | yes | none |
| 22 | v4 → v5 | ¶2, ¶18, ¶20 | yes | none |
| 23 | v2 → v3 | ¶14 | yes | none |

Every `from` file is identical to that Book's `candidate-accepted.json`, so the chain starts from the accepted text. Across all edited paragraphs the counts of “ ” ' " — : ; and spaced dashes are unchanged. No British spelling was added.

## 2. Per-edit reading against Butler

| Edit | Butler | New text | Result |
|---|---|---|---|
| B13 ¶0 | "Thus did he speak, and they all held their peace…" | "So he spoke, and everyone fell silent…" | OK |
| B13 ¶4 | "Thus did he speak. His hearers all of them approved…" | "So he spoke. Everyone approved his words…" | OK. The "so reasonably" later in the sentence is far enough away to be harmless. |
| B14 ¶22 | "Thus did they converse, and presently…" | "So they talked, and presently…" | OK |
| B15 ¶19 | "Thus did he speak, and they went on board even as he had said." | "So he spoke, and they did as he said and went aboard." | OK. ¶18 ends with Telemachus's orders. |
| B16 ¶29 | "Thus did they converse, and meanwhile the ship…" | "So they talked, and meanwhile the ship…" | OK. Butler's "and meanwhile" is restored. |
| **B16 ¶36** | "Thus did he speak, and his words pleased them well, so they rose forthwith" | "So he spoke, and his words pleased them well, so they rose immediately" | **DEFECT D1.** *So … so* in one sentence reads as a doubled construction when read aloud. |
| B18 ¶23 | "Thus did they converse. Eurymachus then came up…" | "So they talked. Then Eurymachus came forward…" | OK |
| **B18 ¶40** | "Thus did he speak, and his saying pleased them well, so Mulius…" | "So he spoke, and his words pleased them well. So Mulius…" | **DEFECT D2.** Two consecutive sentences open with "So". |
| B20 ¶12 | "Thus did she speak, and they did even as she had said" | "So she spoke, and they did exactly as she ordered." | OK. ¶11 ends with Eurycleia's orders. |
| B20 ¶14 | "Thus did they converse; meanwhile Melanthius…" | "So they talked. Meanwhile Melanthius…" | OK. "meanwhile" is restored, with no semicolon. |
| B20 ¶20 | "Thus did they converse. Meanwhile the suitors…" | "So they talked. Meanwhile the suitors…" | OK |
| B20 ¶31 | "Thus did he speak, and they all of them laughed heartily." | "So he spoke, and they all laughed heartily." | OK |
| **B21 ¶34** | "Thus did he speak, and they all of them laughed heartily, which put them in a better humour with Telemachus; so Eumaeus…" | "So he spoke, and they all laughed heartily, which put them in a better mood with Telemachus. So Eumaeus…" | **DEFECT D3.** Two consecutive sentences open with "So". |
| B22 ¶2 | "Thus they spoke, for they thought that he had killed Antinous by mistake" | "So they spoke, for they thought he had killed Antinous by accident" | OK. Butler's "for" is restored, and the sentence is clear aloud. ¶1 ends with the suitors' speech. |
| B22 ¶18 | "Thus did they converse. Meanwhile Melanthius…" | "So they talked. Meanwhile Melanthius…" | OK |
| B22 ¶20 | "Thus did he speak, and they did even as he had said" | "So he spoke, and they did exactly as he commanded." | OK |
| B23 ¶14 | "Thus did he speak, and they did even as he had said." | "So he spoke, and they did exactly as he had said." | OK. Butler's "did he speak" was previously rendered as "Thus he spoke". |
| B20 ¶2 (a) | "seeing what a number of them there always are" | "seeing how many of them there always are" | OK. "always" is restored. |
| B20 ¶2 (b) | "Supposing that with Jove's and your assistance I succeed in killing them, I must ask you to consider where I am to escape to from their avengers when it is all over." | "supposing that with Zeus's help and yours I succeed in killing them, I must ask you to consider where I am to escape to from their avengers when it is all over.”" | OK. It is faithful and grammatical. The colon before "supposing" was already in v5 and is not new. Quote balance is unchanged. |

### Fixes (exact old → new)

The old strings are each unique in their `to` file.

- **D1** — book16/candidate-v4.json ¶36
  old: `So he spoke, and his words pleased them well, so they rose immediately`
  new: `So he spoke, and his words pleased them well. They rose immediately`
- **D2** — book18/candidate-v3.json ¶40
  old: `pleased them well. So Mulius of Dulichium`
  new: `pleased them well. Then Mulius of Dulichium`
  (This follows the edition's own "So they talked. Then Eurymachus…" in B18 ¶23.)
- **D3** — book21/candidate-v4.json ¶34
  old: `in a better mood with Telemachus. So Eumaeus brought`
  new: `in a better mood with Telemachus. Then Eumaeus brought`

A scan of every current candidate (latest files, Books 1–24) finds no other paragraph with "So he/she/they spoke/talked … So …" or "So he spoke …, so …". These three constructions exist only because of this edit set.

## 3. Remaining formula inconsistencies, Books 1–24

I scanned every Butler "Thus did he/she/they speak|converse" and "Thus he/she/they spoke" against the latest candidate: the listed `to` files where edits apply, `candidate-accepted.json` for the other Books from 10 on, and the highest `candidate-vN.json` for Books 1–9. In all 37 places the formula is rendered "So he/she/they spoke" or "So they talked", with these exceptions:

- **I1 (minor, predates this edit set).** "Thus did they converse" is rendered **"So they talked together"** in three places, against "So they talked" in B14 ¶22, B15 ¶40, B16 ¶29, B17 ¶14, B18 ¶23, B20 ¶14/¶20, B22 ¶18, B23 ¶24 and B24 ¶7/¶12/¶25. Each old string occurs once in its file.
  - book04/candidate-v6.json ¶51: `So they talked together, and guests` → `So they talked, and guests`
  - book07/candidate-v3.json ¶27: `So they talked together.` → `So they talked.`
  - book08/candidate-v3.json ¶24: `So they talked together, but King Apollo` → `So they talked, but King Apollo`

  The edit files cite Books 4, 7 and 8 as the model for "So they talked", but those Books actually say "So they talked together". Either apply I1 or accept "together" as a Books 1–9 variant.
- B03 ¶37 is not a formula inconsistency. That `source-book3.json` paragraph is a garbled duplicate of ¶36: it contains ASCII quotes and modern wording. Its "Thus he spoke" is not Butler's. The candidate renders Butler's real ¶36 formula as "So he spoke".

No other Butler formula is still rendered inconsistently.

## Round 2 — fixes D1–D3 (edition-formula-fix.json)

| Book | from → to | ¶ | old unique (¶ / file) | result = from + that one replacement | title / number / other ¶ | punctuation counts in ¶ |
|---|---|---|---|---|---|---|
| 16 | v4 → v5 | 36 | 1 / 1 | yes | unchanged | unchanged |
| 18 | v3 → v4 | 40 | 1 / 1 | yes | unchanged | unchanged |
| 21 | v4 → v5 | 34 | 1 / 1 | yes | unchanged | unchanged |

Reading against Butler:

- **B16 ¶36** now reads "So he spoke, and his words pleased them well. They rose immediately and went to Odysseus’s house…". The doubled "so" is gone. Butler's consequence ("so they rose forthwith") still comes through from the order of the sentences, and nothing has been dropped.
- **B18 ¶40** now reads "So he spoke, and his words pleased them well. Then Mulius of Dulichium… mixed them a bowl…". There is no longer a run of two "So" sentences. The wording matches the edition's "So they talked. Then Eurymachus…" in B18 ¶23, and the rest of the paragraph still follows Butler.
- **B21 ¶34** now reads "…which put them in a better mood with Telemachus. Then Eumaeus brought the bow forward…". The next sentence begins "When he had done this", and the two read smoothly together. Butler's "; so Eumaeus" is kept as a sequence without the repeated "So".

A rescan of all current candidates finds no remaining "So he/she/they spoke/talked … So …" or "So he spoke …, so …" constructions. I1 ("So they talked together" in Books 4, 7 and 8) is kept as a Books 1–9 variant at the coordinator's decision, so it is no longer a defect.

**Verdict: VERIFIED CLEAN**
