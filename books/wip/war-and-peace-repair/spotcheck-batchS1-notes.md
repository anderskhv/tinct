# War and Peace — modern-en spot check, batch S1

Chapters checked (source of truth: Maude translation): 11, 23, 36, 63, 68, 78, 88.
Every paragraph of source was read against the corresponding modern-en paragraph in full.

## Script-verified paragraph-count table

| Chapter | Source paragraphs | Current modern-en | Corrected modern-en | Match |
|---|---|---|---|---|
| 11 | 17 | 17 | 17 | yes |
| 23 | 15 | 15 | 15 | yes |
| 36 | 70 | 70 | 70 | yes |
| 63 | 27 | 27 | 27 | yes |
| 68 | 43 | 43 | 43 | yes |
| 78 | 18 | 18 | 18 | yes |
| 88 | 12 | 12 | 12 | yes |

(Verified with a script diffing `len(chapter['paragraphs'])` between source and each candidate file; no merges, splits, reorders, or drops in any chapter.)

## Chapter 11 (Book One, 1805) — SOUND

No genuine defects found. All character actions, dialogue, and descriptive detail (Natasha's entrance, the count's greeting, Boris/Nicholas contrast, the doll-Mimi story) match the source. Names correctly normalized (Boris, Nicholas, Sonya, Natasha — no "Nikolai"/"Andrei"-style slips). No changes made.

## Chapter 23 (Book One, 1805) — SOUND

No genuine defects found. The death-scene staging (icons, priests, Prince Vasili's performance of piety, Anna Mikhaylovna's stage-managing, Lorrain's examination, the turning of the dying count, Pierre's reactions) all track the source faithfully, including the ambiguous/double-edged narration around Prince Vasili and the princess slipping out a back door. No changes made.

## Chapter 36 (Book Two, 1805, "Book Two — Chapter 8") — DEFECTIVE (one fix)

**Defect: character-name inconsistency.** Source (Maude): "**Nicholas** Rostóv turned away and, as if searching for something, gazed into the distance, at the waters of the Danube, at the sky, and at the sun." Candidate modern-en had: "**Nikolai** Rostov turned away and gazed into the distance..." — this is the one and only occurrence of "Nikolai" anywhere in the batch (confirmed by grep across the file), and it breaks the project's normalized spelling rule (Nicholas, not Nikolai), which the same chapter otherwise follows correctly everywhere else (e.g., "Rostov," "he asked Denisov," "Nicholas" is not used elsewhere in this chapter but "Rostov" surname is used consistently for him — only this one instance swapped in the given name as "Nikolai").

**Fix applied:** changed "Nikolai Rostov turned away" → "Nicholas Rostov turned away" in the corrected output. No other wording in that paragraph was touched.

Everything else in this long dialogue- and action-heavy chapter (the bridge crossing, Denisov's speech impediment rendering "wight"/"dwive"/"Miwonov", the colonel Bogdanich exchanges, Zherkov and Nesvitski's argument about firing the bridge, the artillery/grapeshot sequence, casualty counts, Rostov's famous "the sun, this water" interior monologue) was checked closely and is sound — no omissions, inventions, inversions, or factual distortions found.

## Chapter 63 (Book Three, 1805, "Book Three — Chapter 14") — SOUND

No genuine defects found. Checked closely for the march/fog/confusion sequence, the blame-the-Germans grumbling, the account of the action starting at the Goldbach Stream, and the extended Napoleon-at-Schlappanitz passage (his mood, the sun emerging from mist, the order to attack). Content, sequence, and character attributions all match. "Kutúzov"/"Kutuzov" correctly kept accent-free per project convention. No changes made.

## Chapter 68 (Book Four, 1806, "Book Four — Chapter 19") — SOUND

No genuine defects found. This chapter (Prince Andrew wounded on the Pratzen Heights, Napoleon's "fine death" remark, the prisoner interviews with Repnin and Sukhtelen, the icon returned to Andrew's chest, Andrew's "Great All or Nothing" interior monologue, Dr. Larrey's prognosis) matches the source closely. Names correctly normalized: "Andrew" (not "Andrei"), "Mary" (Princess Mary's icon, not "Marya"). No changes made.

## Chapter 78 (Book Four, 1806, "Book Four — Chapter 10") — SOUND

No genuine defects found. Checked the Dolokhov-duel aftermath, Mary Ivanovna's long defensive speech about her son, Dolokhov's own speech about loving few and despising most, the Rostov household's romantic atmosphere that winter, Natasha's suspicion of Dolokhov and her prediction he's in love with Sonya, and the closing paragraph on renewed war talk and Nicholas's plan to return to the regiment. All character motivations, claims, and sequence match the source; no invented dialogue or flipped claims. Names correctly normalized (Nicholas, Mary Ivanovna). No changes made.

## Chapter 88 (Book Five, 1806-07, "Book Five — Chapter 4") — SOUND

No genuine defects found. The Masonic initiation scene (Willarski leading Pierre in blindfolded, the "lesser light"/"full light" business, the altar with candlesticks, the trowel and three pairs of gloves and their symbolism, the statutes read aloud, Pierre's emotional reaction) matches the source in full, including the symbolic details (white apron, gloves for "her whom you shall honor most"). No dropped or invented content, no character/plot distortions. No changes made.

## Summary

- 6 of 7 chapters (11, 23, 63, 68, 78, 88) were fully sound; nothing changed.
- 1 chapter (36) had a single genuine defect: a name-normalization slip ("Nikolai Rostov" instead of "Nicholas Rostov"), fixed in place with no other wording altered.
- This confirms the project's prior finding that real defects can hide in unflagged paragraphs even within a mechanical scan's "unflagged" set — in this batch it was a single, isolated, low-frequency error rather than a systemic problem.
