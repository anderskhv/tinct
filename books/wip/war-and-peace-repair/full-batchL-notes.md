# Batch L — Fidelity Check Notes (Chapters 260–282 range, 20 chapters)

Source: Maude translation (`full-batchL-source.json`)
Candidate: current modern-en (`full-batchL-current-modern-en.json`)
Output: `full-batchL-corrected.json`

Every paragraph of every chapter was read against the source in full.

## Summary

- **17 of 20 chapters sound** — no defects found, no changes made.
- **3 of 20 chapters defective** — one genuine fidelity defect each, fixed in the corrected output.

## Chapter-by-chapter findings

### Chapter 260 (Book Eleven, Ch. 31) — SOUND
Natasha's vigil, the family bedding down at the burning cottage, her night visit to Prince Andrew. Close, accurate rendering throughout. No changes.

### Chapter 262 (Book Eleven, Ch. 33) — SOUND
Pierre's morning, the assassination attempt setup, rescuing the child from the fire. No changes.

### Chapter 263 (Book Twelve, Ch. 34) — SOUND
Pierre returns the child, intervenes for the Armenian woman, is arrested. No changes.

### Chapter 264 (Book Twelve, Ch. 1) — DEFECTIVE
**Meaning inversion.** Source (para 18): "'The path to Warsaw, perhaps,' Prince Hippolyte remarked loudly and unexpectedly. Everybody looked at him, **understanding** what he meant." The irony of the passage is that the room performed understanding of a witticism that in fact meant nothing — confirmed by the next two sentences ("Prince Hippolyte himself glanced around with amused surprise. He knew no more than the others what his words meant"). The candidate read: "Everybody looked at him, **not understanding** what he meant" — flipping the claim to its literal opposite and flattening Tolstoy's irony into a redundant statement.
**Fix applied:** restored "understanding what he meant" to match the source.

### Chapter 265 (Book Twelve, Ch. 2) — SOUND
News of Borodino reaches Petersburg, Helene's death, Rostopchin's dispatch. No changes.

### Chapter 266 (Book Twelve, Ch. 3) — SOUND
Michaud reports the fall of Moscow to Alexander. No changes.

### Chapter 267 (Book Twelve, Ch. 4) — SOUND
Essay on private vs. public interest during the war; Nicholas Rostov sent to Voronezh. No changes.

### Chapter 268 (Book Twelve, Ch. 5) — SOUND
Nicholas at the governor's party; the governor's wife plays matchmaker; Nicholas confides about Sonya and Princess Mary. No changes.

### Chapter 269 (Book Twelve, Ch. 6) — SOUND
Princess Mary's inner conflict; her first meeting with Nicholas in Voronezh. No changes.

### Chapter 270 (Book Twelve, Ch. 7) — SOUND
Nicholas and Princess Mary meet again after the thanksgiving service; Sonya's letter releasing Nicholas from his engagement. No changes.

### Chapter 271 (Book Twelve, Ch. 8) — SOUND
Background on Sonya's letter; the mirror-prophecy scene with Natasha; Sonya writes to Nicholas. No changes.

### Chapter 272 (Book Twelve, Ch. 9) — SOUND
Pierre in custody, first interrogation. No changes.

### Chapter 273 (Book Twelve, Ch. 10) — SOUND
Pierre led past the ruined Moscow to Davout for interrogation. No changes.

### Chapter 274 (Book Twelve, Ch. 11) — SOUND
The mock/real execution of the five prisoners; Pierre a horrified witness. No changes.

### Chapter 275 (Book Twelve, Ch. 12) — DEFECTIVE
**Omitted content (censorship).** Source (para 51): Karataev addresses the dog, "Now you've curled up and got warm, you **daughter of a bitch**!" The candidate silently truncated this to "you daughter of a..." — dropping the actual word Tolstoy wrote (in a passage the Maude translation renders unbowdlerized) and replacing it with an ellipsis, which is a content omission, not a paraphrase.
**Fix applied:** restored "daughter of a bitch!" to match the source's Maude wording.

### Chapter 276 (Book Twelve, Ch. 13) — SOUND
Description of Platon Karataev — his roundness, character, way of speaking. No changes.

### Chapter 277 (Book Twelve, Ch. 14) — SOUND
Princess Mary's journey to Yaroslavl; arrival at the Rostovs'; reunion with Natasha. No changes.

### Chapter 278 (Book Twelve, Ch. 15) — SOUND
Princess Mary's visit to the dying Prince Andrew; his detachment from the living. No changes.

### Chapter 279 (Book Thirteen, Ch. 16) — DEFECTIVE
**Character-name inconsistency.** Prince Andrew's young son is called "little Nicholas" consistently throughout this chapter (e.g., paras 8, 31, 40) and across the book per project convention (Nicholas, not Nikolai). Para 45 broke that pattern: "**Little Nikolai** cried because his heart was torn by painful confusion" — an internally inconsistent and off-convention spelling appearing nowhere else in the chapter.
**Fix applied:** changed "Little Nikolai cried" to "Little Nicholas cried."

### Chapter 282 (Book Thirteen, Ch. 3) — SOUND
Reorganization of the Russian staff; the Emperor's rebuking letter to Kutuzov; the Cossack scouting report that precipitates Tarutino. No changes.

## Paragraph-count verification (script-checked)

| Chapter | Source paragraphs | Corrected paragraphs | Match |
|---|---|---|---|
| 260 | 37 | 37 | ✓ |
| 262 | 43 | 43 | ✓ |
| 263 | 38 | 38 | ✓ |
| 264 | 27 | 27 | ✓ |
| 265 | 14 | 14 | ✓ |
| 266 | 32 | 32 | ✓ |
| 267 | 22 | 22 | ✓ |
| 268 | 40 | 40 | ✓ |
| 269 | 16 | 16 | ✓ |
| 270 | 28 | 28 | ✓ |
| 271 | 31 | 31 | ✓ |
| 272 | 10 | 10 | ✓ |
| 273 | 31 | 31 | ✓ |
| 274 | 19 | 19 | ✓ |
| 275 | 53 | 53 | ✓ |
| 276 | 12 | 12 | ✓ |
| 277 | 49 | 49 | ✓ |
| 278 | 45 | 45 | ✓ |
| 279 | 47 | 47 | ✓ |
| 282 | 9 | 9 | ✓ |

All 20 chapters: paragraph counts match exactly; JSON validated with `json.tool`.
