# Batch M fidelity check — chapters 283–307 (20 chapters, excluding already-checked)

Source: Maude translation (`full-batchM-source.json`)
Candidate: current modern-en (`full-batchM-current-modern-en.json`)
Output: `full-batchM-corrected.json`

## Summary

- **17 of 20 chapters: SOUND** — no genuine fidelity defects found. Left unchanged.
- **3 of 20 chapters: DEFECTIVE** — genuine defects found and fixed.

Defective chapters: 283, 305, 306.

## Paragraph-count verification (script-verified)

All 20 chapters match source paragraph count exactly, verified by script before finishing (see `python3` check below reproduced from the session):

| Chapter | Title | Source paragraphs | Corrected paragraphs | Match |
|---|---|---|---|---|
| 283 | Book Thirteen — Ch. 4 | 22 | 22 | ✅ |
| 284 | Book Thirteen — Ch. 5 | 5 | 5 | ✅ |
| 285 | Book Thirteen — Ch. 6 | 22 | 22 | ✅ |
| 286 | Book Thirteen — Ch. 7 | 18 | 18 | ✅ |
| 287 | Book Thirteen — Ch. 8 | 6 | 6 | ✅ |
| 289 | Book Thirteen — Ch. 10 | 22 | 22 | ✅ |
| 293 | Book Thirteen — Ch. 14 | 25 | 25 | ✅ |
| 294 | Book Thirteen — Ch. 15 | 8 | 8 | ✅ |
| 295 | Book Thirteen — Ch. 16 | 27 | 27 | ✅ |
| 296 | Book Thirteen — Ch. 17 | 20 | 20 | ✅ |
| 297 | Book Thirteen — Ch. 18 | 11 | 11 | ✅ |
| 298 | Book Fourteen — Ch. 19 | 12 | 12 | ✅ |
| 299 | Book Fourteen — Ch. 1 | 14 | 14 | ✅ |
| 301 | Book Fourteen — Ch. 3 | 11 | 11 | ✅ |
| 302 | Book Fourteen — Ch. 4 | 39 | 39 | ✅ |
| 303 | Book Fourteen — Ch. 5 | 30 | 30 | ✅ |
| 304 | Book Fourteen — Ch. 6 | 27 | 27 | ✅ |
| 305 | Book Fourteen — Ch. 7 | 38 | 38 | ✅ |
| 306 | Book Fourteen — Ch. 8 | 24 | 24 | ✅ |
| 307 | Book Fourteen — Ch. 9 | 44 | 44 | ✅ |

(A Python script loaded both `full-batchM-source.json` and the corrected output, compared `len(paragraphs)` per chapter number, and asserted equality — assertion passed with no errors before this file was written.)

## Per-chapter findings

### Chapter 283 (Book Thirteen — Ch. 4) — DEFECTIVE
**Defect: character-name inconsistency.** Source (Maude): *"Bravo, Nicholas Iványch!"* The modern-en candidate rendered this as *"Bravo, Nikolai Ivanych!"* — converting "Nicholas" to "Nikolai," which directly contradicts the project's mandated normalized spelling ("Nicholas not Nikolai"). This is the only occurrence of "Nikolai" (or "Andrei"/"Marya") anywhere in the batch (verified by script).
**Fix applied:** paragraph restored to *"'Ha, ha, ha! Bravo, Nicholas Ivanych! Ha, ha, ha!'"*
Rest of the chapter (Ermolov's evasiveness, the officer's search for him, the party at Échkino, the Konovnítsyn remark) is faithful and left unchanged.

### Chapter 284 (Book Thirteen — Ch. 5) — sound, unchanged.
Kutúzov's rage at the failed dawn muster is rendered faithfully; no omissions, inventions, or inversions.

### Chapter 285 (Book Thirteen — Ch. 6) — sound, unchanged.
Orlóv-Denísov's raid, the Polish deserter's offer, the Cossacks' plunder-over-pursuit, Bagovút's death — all faithful, numbers (fifteen hundred prisoners, thirty-eight guns) preserved correctly.

### Chapter 286 (Book Thirteen — Ch. 7) — sound, unchanged.
Kutúzov's restraint, Ermólov's remark, the "diamond decoration"/"hundred thousand rubles" rewards, and the parallelogram-of-forces passage are all faithfully rendered.

### Chapter 287 (Book Thirteen — Ch. 8) — sound, unchanged.
Napoleon's position in Moscow and the list of squandered options are faithful; no defects found.

### Chapter 289 (Book Thirteen — Ch. 10) — sound, unchanged.
The catalogue of failed Napoleonic orders (military, diplomatic, legal, administrative, religious, commercial, theatrical, financial) and the quoted dispatches are all faithfully preserved, including the wounded-animal simile at the end.

### Chapter 293 (Book Thirteen — Ch. 14) — sound, unchanged.
Pierre's march with the prisoners through the baggage trains, the looted-goods commentary, and his interior "immortal soul" monologue are faithful throughout.

### Chapter 294 (Book Thirteen — Ch. 15) — sound, unchanged.
The account of Dokhtúrov's understated career (Austerlitz, Smolénsk, Borodinó) is faithful; no invented or dropped claims.

### Chapter 295 (Book Thirteen — Ch. 16) — sound, unchanged.
Bolkhovítinov's night ride and the waking of Shcherbínin/Konovnítsyn are faithfully rendered.

### Chapter 296 (Book Thirteen — Ch. 17) — sound, unchanged.
Kutúzov's sleepless reflection ("apple should not be plucked while it is green," the wounded-beast reasoning) and the news of Napoleon's departure from Moscow are faithful.

### Chapter 297 (Book Thirteen — Ch. 18) — sound, unchanged.
The account of the army's "chemical elements of dissolution," the Málo-Yaroslávets council, and "le hourra de l'Empereur" are faithfully rendered (French phrases translated inline for the modern edition without loss of meaning).

### Chapter 298 (Book Fourteen — Ch. 19) — sound, unchanged.
The "promised land"/Smolénsk analogy and the melting-snow simile are faithful; Kutúzov's restraint of the army is preserved.

### Chapter 299 (Book Fourteen — Ch. 1) — sound, unchanged.
The historiographical argument (army victories vs. national subjugation), the Karp-and-Vlas passage, and the rapier/cudgel duel analogy are all faithfully rendered with no invented or dropped claims.

### Chapter 301 (Book Fourteen — Ch. 3) — sound, unchanged.
The rise of partisan warfare, Davýdov's role, and the Denísov/Dólokhov convoy-ambush setup are faithful; numbers (fifteen hundred French, two hundred Cossacks) preserved.

### Chapter 302 (Book Fourteen — Ch. 4) — sound, unchanged.
Pétya Rostóv's arrival and Denísov's exchanges with the esaul are faithfully rendered.

### Chapter 303 (Book Fourteen — Ch. 5) — sound, unchanged.
The reconnaissance of the French camp and the Tíkhon Shcherbáty backstory are faithful.

### Chapter 304 (Book Fourteen — Ch. 6) — sound, unchanged.
Tíkhon's comic account of his failed capture is faithfully rendered.

### Chapter 305 (Book Fourteen — Ch. 7) — DEFECTIVE
**Defect: garbled/misaligned footnote content (broken text).** The source uses a French-dialogue-plus-footnote-translation convention across several short paragraphs when Pétya greets the captured French drummer boy:
- Source para "Ah, c'est vous!... Voulez-vous manger?... Entrez, entrez." (French, with two footnote markers)
- Source footnote 1: *"Ah, it's you! Do you want something to eat? Don't be afraid, they won't hurt you."*
- Source footnote 2: *"Come in, come in."*
- Source: drummer boy's *"Merci, monsieur"* + footnote *"Thank you, sir."*

The modern-en candidate correctly folded the French dialogue into a single translated line ("'Ah, it's you!' said Petya. 'Are you hungry?...Come in, come in.'"), but the paragraph immediately following it — which should hold the footnote translation for the *first* French quote ("Do you want something to eat? Don't be afraid, they won't hurt you.") — instead contained a stray duplicate of the *unrelated, later* footnote: `"('Thank you, sir.')"`. This left the "Thank you, sir" footnote effectively appearing twice (once misplaced, once correctly, later) while the actual first-quote footnote content was dropped entirely — a genuine omission masked by a duplicate.
**Fix applied:** replaced the misplaced paragraph with the correct footnote content: `"('Do you want something to eat? Don't be afraid, they won't hurt you.')"`. The paragraph count and the surrounding paragraphs (including the deliberately redundant "(Come in, come in.)" and "(Thank you, sir.)" footnotes elsewhere in the same passage, which are a consistent, paragraph-preserving convention used throughout this batch for French-to-English footnote pairs) are otherwise unchanged.
Rest of the chapter (Pétya's raisins/flints/knife generosity, his sentimental attachment to Vincent Bosse) is faithful.

### Chapter 306 (Book Fourteen — Ch. 8) — DEFECTIVE
**Defect: garbled/ambiguous sentence (broken text creating a meaning risk).** Source: *"You send a hundred men away, and thirty get there."* — a clear statement that of a hundred men sent under escort, only thirty survive/arrive. The modern-en candidate rendered this as: *"You send off a hundred and thirty arrive."* With no comma and the dropped word "men," this reads naturally as "a hundred and thirty [i.e., 130] arrive" — the opposite of Dólokhov's point (that escorted transfers are effectively lethal for most prisoners). This is a fidelity-threatening ambiguity/omission, not merely a style issue.
**Fix applied:** restored to *"You send off a hundred men, and thirty arrive."*, removing the ambiguity while keeping the existing modern-en wording as the base.
Rest of the chapter (Dólokhov's cold interrogation of Denísov about the prisoner "receipts," Pétya's insistence on joining the reconnaissance) is faithful.

### Chapter 307 (Book Fourteen — Ch. 9) — sound, unchanged.
The night ride into the French camp, the sentinel challenge, and Dólokhov's interrogation of the French officers are faithfully rendered. The French-dialogue-plus-parenthetical-translation convention here (e.g. "'Who goes there?'" followed by "('Who goes there?')") is applied consistently throughout the chapter and does not misalign source content the way chapter 305's did — left unchanged as an intentional, paragraph-preserving rendering pattern, not a fidelity defect.

## Fixes applied (summary)

1. **Ch. 283** — "Nikolai Ivanych" → "Nicholas Ivanych" (name-normalization rule: Nicholas not Nikolai).
2. **Ch. 305** — misplaced duplicate footnote → correct footnote translation restored ("Do you want something to eat? Don't be afraid, they won't hurt you.").
3. **Ch. 306** — "You send off a hundred and thirty arrive." → "You send off a hundred men, and thirty arrive." (removed ambiguity/omission that reversed the apparent meaning).

All other content in all 20 chapters is unchanged from the current modern-en edition.
