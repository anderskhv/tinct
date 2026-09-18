# War and Peace — Batch D Fidelity Check (Chapters 81–103, excluding already-checked)

Source: Maude translation (`full-batchD-source.json`)
Candidate checked: `full-batchD-current-modern-en.json`
Output: `full-batchD-corrected.json`

Method: every paragraph of every chapter read against the corresponding source paragraph in full.

## Paragraph-count verification (script-verified, source vs. corrected output)

| # | Title | Source paragraphs | Corrected paragraphs | Match |
|---|-------|-------------------:|----------------------:|:-----:|
| 81 | Book Four (1806) — Chapter 13 | 34 | 34 | ✅ |
| 82 | Book Four (1806) — Chapter 14 | 26 | 26 | ✅ |
| 83 | Book Four (1806) — Chapter 15 | 34 | 34 | ✅ |
| 84 | Book Five (1806-07) — Chapter 16 | 49 | 49 | ✅ |
| 85 | Book Five (1806-07) — Chapter 1 | 18 | 18 | ✅ |
| 86 | Book Five (1806-07) — Chapter 2 | 51 | 51 | ✅ |
| 87 | Book Five (1806-07) — Chapter 3 | 55 | 55 | ✅ |
| 89 | Book Five (1806-07) — Chapter 5 | 14 | 14 | ✅ |
| 90 | Book Five (1806-07) — Chapter 6 | 25 | 25 | ✅ |
| 91 | Book Five (1806-07) — Chapter 7 | 22 | 22 | ✅ |
| 92 | Book Five (1806-07) — Chapter 8 | 34 | 34 | ✅ |
| 93 | Book Five (1806-07) — Chapter 9 | 23 | 23 | ✅ |
| 95 | Book Five (1806-07) — Chapter 11 | 67 | 67 | ✅ |
| 96 | Book Five (1806-07) — Chapter 12 | 28 | 28 | ✅ |
| 97 | Book Five (1806-07) — Chapter 13 | 49 | 49 | ✅ |
| 98 | Book Five (1806-07) — Chapter 14 | 16 | 16 | ✅ |
| 99 | Book Five (1806-07) — Chapter 15 | 18 | 18 | ✅ |
| 100 | Book Five (1806-07) — Chapter 16 | 40 | 40 | ✅ |
| 101 | Book Five (1806-07) — Chapter 17 | 38 | 38 | ✅ |
| 103 | Book Five (1806-07) — Chapter 19 | 32 | 32 | ✅ |

All 20 chapters: paragraph counts match exactly (no merges, splits, reorders, or drops).

(Note: chapters 88, 94, and 102 are absent from this batch by design — excluded as already checked.)

## Chapter-by-chapter findings

**Chapter 81 (Book Four, Ch. 13 — Rostov's card game begins)** — Sound. Close paragraph-by-paragraph rendering of Dolokhov's supper and the start of the card game; all figures (800 rubles, the seven of hearts, the 1,600 rubles at stake) and the interior monologue about home life are preserved. No changes.

**Chapter 82 (Book Four, Ch. 14 — the loss reaches 43,000)** — Sound. All sums (43,000, the "21 rubles" overage), Dolokhov's baiting, and Nicholas's despair are intact. No changes.

**Chapter 83 (Book Four, Ch. 15 — home, Natasha's singing)** — Sound. Denisov's song, Natasha's barcarolle, and Nicholas's spiraling thoughts about the debt match the source closely. No changes.

**Chapter 84 (Book Five, Ch. 16 — confession to the count; Denisov's proposal)** — Sound. Nicholas's confession, the count's reaction, and Natasha/Denisov's proposal-and-refusal scene are faithfully rendered, including all dialogue. No changes.

**Chapter 85 (Book Five, Ch. 1 — Pierre at the Torzhok post station)** — Sound. Pierre's existential questioning, the postmaster, the Torzhok peddler woman, and the arrival of the Mason (Bazdeev) are all faithfully rendered. No changes.

**Chapter 86 (Book Five, Ch. 2 — the Mason's conversation with Pierre)** — **Defective (1 issue, fixed).**
- **Word substitution weakening the Mason's rebuke.** Source (Maude): *"Have you ever thought of your tens of thousands of **slaves**?"* Candidate had: *"Have you ever thought about your tens of thousands of **serfs**?"* This is the Mason's most pointed moral accusation against Pierre, and Tolstoy/Maude's choice of "slaves" (rather than the more neutral "serfs," which the book uses elsewhere) is a deliberate rhetorical escalation. Softening it to "serfs" blunts the accusation. Grep confirmed "slave" appears exactly once in the source chapter and zero times in the candidate.
  - **Fix applied:** restored "slaves" in that sentence, leaving the rest of the paragraph (already accurate) unchanged.

**Chapter 87 (Book Five, Ch. 3 — Pierre's Masonic initiation)** — Sound. The Willarski visit, the blindfolding, the skull/coffin/Gospel initiation-room scene, and the Rhetor's catechism are all rendered in full with no omissions. (The duplicated French/English footnote lines, e.g. "Delighted to see you..." appearing as their own paragraph entries, mirror the source's own footnote formatting and are not a defect — paragraph counts match.) No changes.

**Chapter 89 (Book Five, Ch. 5 — Prince Vasili's visit; Pierre leaves for his estates)** — Sound. Vasili's pressure campaign and Pierre's outburst ("Go! Please go!") are faithfully rendered. No changes.

**Chapter 90 (Book Five, Ch. 6 — society's reaction; Anna Pavlovna's soiree; Boris introduced to Helene)** — Sound. All the social/political commentary, Boris's careerism, and the Helene/Boris flirtation are intact. No changes.

**Chapter 91 (Book Five, Ch. 7 — Prince Hippolyte's joke; Helene summons Boris)** — Sound. The "pour le Roi de Prusse" joke and Helene's cryptic summons are faithfully rendered. No changes.

**Chapter 92 (Book Five, Ch. 8 — the Bolkonskis in 1806–07; the sick baby)** — Sound. Old Prince Bolkonski's new duties, Andrew and Mary's changed life, and the tense nursery scene over the feverish infant are all faithfully rendered, including the old prince's letter (Bennigsen, Eylau, Korchevo, Khandrikov). No changes.

**Chapter 93 (Book Five, Ch. 9 — Bilibin's letter; the child recovers)** — Sound. Bilibin's long satirical letter (Pultusk, Buxhowden, Bennigsen, the field marshal's furious order of the day, the marauding soldiers) is translated in full with all specific claims and figures preserved. The recovery scene with the baby is intact. No changes.

**Chapter 95 (Book Five, Ch. 11 — Pierre visits Andrew at Bogucharovo)** — Sound. This is a long, philosophically dense chapter (Pierre's Masonic optimism vs. Andrew's fatalism/serf debate). Checked closely line by line — all of Andrew's arguments (the "animal happiness," the hospital/medicine argument, the "human dignity, not the serfs' backs" conclusion) and Pierre's counter-arguments are faithfully and completely rendered. No changes.

**Chapter 96 (Book Five, Ch. 12 — the ferry conversation on faith and the soul)** — Sound. Pierre's argument for a future life and God, Andrew's counter-argument from grief, and Andrew's glimpse of the "everlasting sky" are all faithfully rendered. No changes.

**Chapter 97 (Book Five, Ch. 13 — Princess Mary's pilgrims, "God's folk")** — Sound. Pelageya's story about Kolyazin and the blind general, Pierre's skepticism and her outrage, and the reconciliation are all faithfully rendered. No changes.

**Chapter 98 (Book Five, Ch. 14 — old Prince Bolkonski meets Pierre)** — Sound. Mary's worry about Andrew, the old prince's gruff warmth toward Pierre, and the household's approval of him are faithfully rendered. No changes.

**Chapter 99 (Book Five, Ch. 15 — Rostov returns to the regiment)** — Sound. The "regiment as home" passage, the debt-repayment resolution, and the rescued Polish family/duel-averted episode are all faithfully rendered. No changes.

**Chapter 100 (Book Five, Ch. 16 — Denisov seizes the transport; the brawl)** — Sound. The dugout description, the seized wagons, Denisov's clash with the infantry officer, the beating of Telyanin, and the court-martial threat are all faithfully rendered (all sums, names, and plot beats intact). No changes.

**Chapter 101 (Book Five, Ch. 17 — the hospital)** — Sound. The grim hospital scene (the flippant doctor, the dying Cossack begging for water, the dead young soldier) is rendered in full, with no softening or omission of the disturbing details. No changes.

**Chapter 103 (Book Five, Ch. 19 — Tilsit)** — **Defective (1 issue, fixed).**
- **Omission of a specific claim + a garbled/invented substitute clause.** Source (Maude): *"...so that the latter knew his face, and all those at court, **far from cold-shouldering him as at first when they considered him a newcomer**, would now have been surprised had he been absent."* Candidate had: *"...so that the sovereign knew his face, and everyone at court would have been surprised if he had been absent, **rather than noticing his presence**."* The candidate dropped the specific claim that courtiers had initially snubbed Boris as a newcomer before fully accepting him — a meaningful biographical/social detail about Boris's rise — and replaced it with a vague, not-quite-equivalent tag ("rather than noticing his presence") not present in the source.
  - **Fix applied:** restored the "far from giving him the cold shoulder as they had at first when they considered him a newcomer" clause, keeping the rest of the (already faithful) sentence and paragraph unchanged.

## Summary

- **18 of 20 chapters sound** — no changes made.
- **2 of 20 chapters defective** — one fix applied to each (both are single in-sentence corrections, not rewrites): Chapter 86 ("slaves" restored) and Chapter 103 (dropped clause restored).
- No omitted paragraphs, invented dialogue/scenes, plot distortions, or character-name inconsistencies (Andrew/Mary/Helene/Nicholas spellings were already correct throughout) were found elsewhere in the batch.
- Paragraph counts verified by script to match the source exactly in all 20 chapters.
