# Batch N Fidelity Check Notes (chapters 308–329, excluding gaps)

Source: `full-batchN-source.json` | Candidate: `full-batchN-current-modern-en.json` | Corrected output: `full-batchN-corrected.json`

## Paragraph-count table (script-verified)

| Chapter | Title | Source paragraphs | Corrected paragraphs | Match |
|---|---|---|---|---|
| 308 | Book Fourteen — Ch. 10 | 47 | 47 | OK |
| 309 | Book Fourteen — Ch. 11 | 22 | 22 | OK |
| 311 | Book Fourteen — Ch. 13 | 14 | 14 | OK |
| 312 | Book Fourteen — Ch. 14 | 12 | 12 | OK |
| 313 | Book Fourteen — Ch. 15 | 25 | 25 | OK |
| 314 | Book Fourteen — Ch. 16 | 6 | 6 | OK |
| 315 | Book Fourteen — Ch. 17 | 7 | 7 | OK |
| 316 | Book Fourteen — Ch. 18 | 14 | 14 | OK |
| 317 | Book Fifteen — Ch. 19 | 30 | 30 | OK |
| 318 | Book Fifteen — Ch. 1 | 21 | 21 | OK |
| 319 | Book Fifteen — Ch. 2 | 23 | 23 | OK |
| 320 | Book Fifteen — Ch. 3 | 22 | 22 | OK |
| 321 | Book Fifteen — Ch. 4 | 18 | 18 | OK |
| 322 | Book Fifteen — Ch. 5 | 17 | 17 | OK |
| 323 | Book Fifteen — Ch. 6 | 21 | 21 | OK |
| 324 | Book Fifteen — Ch. 7 | 22 | 22 | OK |
| 326 | Book Fifteen — Ch. 9 | 30 | 30 | OK |
| 327 | Book Fifteen — Ch. 10 | 28 | 28 | OK |
| 328 | Book Fifteen — Ch. 11 | 13 | 13 | OK |
| 329 | Book Fifteen — Ch. 12 | 9 | 9 | OK |

(Verified by script: iterated both JSON files, asserted `chapter numbers` and `len(paragraphs)` match pairwise for all 20 chapters. All pass.)

## Chapter-by-chapter findings

**308 (Book Fourteen, Ch. 10) — DEFECTIVE (1 fix).** Character-name inconsistency: paragraph 36 (the fugue/music paragraph) read "Petya was as musical as Natasha, and more so than **Nikolai**" — source (Maude) uses "Nicholas." Per project convention (Nicholas, not Nikolai), fixed to "Nicholas." Rest of chapter (Pétya's night with Denisov and the Cossacks, the fairy-kingdom reverie) is a sound, faithful rendering.

**309 (Book Fourteen, Ch. 11) — SOUND.** The cavalry raid, Pétya's death, and Denísov's reaction are rendered faithfully and completely; no omissions, inventions, or distortions found.

**311 (Book Fourteen, Ch. 13) — SOUND.** Pierre's march and Karatáev's parable of the merchant are fully and accurately rendered, including all narrative beats (false accusation, exile, confession, the Tsar's pardon arriving after the old man's death).

**312 (Book Fourteen, Ch. 14) — SOUND.** The marshal's passing, Karatáev's execution (implied via the shot and the dog's howl), and Pierre's willed non-comprehension are all preserved faithfully.

**313 (Book Fourteen, Ch. 15) — SOUND.** Pierre's dream-vision of the "living globe," Karatáev's absence, the rescue by Cossacks, and Dólokhov's cold handling of prisoners are all rendered accurately. (Minor lexical simplification: source "knouted" → candidate "flogged" — same class of punishment, not a fidelity break, left unchanged per the no-reprose-for-polish rule.)

**314 (Book Fourteen, Ch. 16) — SOUND.** Berthier's report and the statistics on the French army's disintegration are rendered completely and accurately, including the quoted dispatch.

**315 (Book Fourteen, Ch. 17) — SOUND.** The "blindman's buff" extended metaphor and the account of the French retreat through Krásnoe/Orshá/Berëzina are faithfully rendered.

**316 (Book Fourteen, Ch. 18) — DEFECTIVE (1 fix).** Omission: in the paragraph quoting Napoleon's "Du sublime... au ridicule" remark, the source includes the narrator's aside "(he saw something sublime in himself)" — a meaningful editorial comment on Napoleon's self-regard. The candidate dropped this parenthetical entirely. Restored it: "'From the sublime (he saw something sublime in himself) to the ridiculous is but a step,' he said." Rest of the chapter (the critique of "greatness" as a historiographical excuse) is otherwise sound.

**317 (Book Fifteen, Ch. 19) — SOUND.** This long historiographical essay on why Napoleon wasn't captured is rendered completely, including all four numbered "senseless" and four numbered "impossible" arguments, the market-gardener analogy, Berthier/Chichagóv/Kutúzov material, and the closing whip-and-runner analogy.

**318 (Book Fifteen, Ch. 1) — DEFECTIVE (1 fix, consistency).** Naming: Dunyásha's line "about Peter Ilýnich" (referring to Pétya Rostóv's death) was rendered as "Pyotr Ilyich" in the candidate. Elsewhere the project's convention favors anglicized forms over Russian transliteration (Nicholas not Nikolai, Andrew not Andrei); fixed to "Peter Ilyich" to match. Substantively, Natásha's and Princess Mary's grief, the story of Prince Andrew's last days, and Natásha's imagined dialogue with him are all rendered faithfully and completely.

**319 (Book Fifteen, Ch. 2) — DEFECTIVE (1 fix, consistency, same issue as above).** Natásha's internal reference to "Peter Ilyich" was rendered "Pyotr Ilyich"; fixed for the same naming-consistency reason as chapter 318. The scene of the countess's collapse and Natásha's care for her is otherwise rendered fully and accurately.

**320 (Book Fifteen, Ch. 3) — SOUND.** Natásha's slow recovery and her deepening friendship with Princess Mary are rendered completely and faithfully.

**321 (Book Fifteen, Ch. 4) — SOUND.** Kutúzov's strategy of not blocking the French retreat, the statistics on Russian army attrition, and the account of Krásnoe (Miloradóvich, Toll's disposition, the 26,000 prisoners) are all rendered accurately.

**322 (Book Fifteen, Ch. 5) — SOUND.** The essay defending Kutúzov's historical reputation — his anecdotes, his consistent statements (Borodinó a "victory," the "golden bridge," etc.) — is rendered completely and faithfully.

**323 (Book Fifteen, Ch. 6) — SOUND.** Kutúzov's speech to the troops at Dóbroe, including his shift from formal to informal register and the "who asked them here" outburst, is rendered faithfully, preserving tone and content.

**324 (Book Fifteen, Ch. 7) — SOUND.** The bivouac scene (hauling the wattle fence, the sergeant major's rebuke, the officers' planned flank march) is rendered completely and accurately.

**326 (Book Fifteen, Ch. 9) — SOUND.** Ramballe and Morel's rescue by the Fifth Company, Morel's drunken singing of "Vive Henri Quatre," and the closing description of the stars are all rendered faithfully. (Minor lexical note: source's "wormwood grows on its own root" proverb becomes "even weeds grow from their own roots" — a slight image substitution but not a meaning distortion; left as a quality matter, not fidelity.)

**327 (Book Fifteen, Ch. 10) — SOUND.** The account of the Berëzina crossing's true significance, the staff's contempt for Kutúzov, his letter dismissing Bennigsen, and the Emperor's arrival at Vílna (including Kutúzov receiving the Order of St. George) are all rendered completely and accurately.

**328 (Book Fifteen, Ch. 11) — SOUND.** The account of Kutúzov's sidelining after the campaign's end — the Emperor's "old comedian" remark, the quiet reassignment of his staff, and the closing reflection on his death — is rendered faithfully.

**329 (Book Fifteen, Ch. 12) — SOUND.** Pierre's illness at Orël, his learning of Prince Andrew's and Hélène's deaths, and his growing sense of freedom and faith are all rendered completely and accurately (note: "Hélène" is already correctly spelled without the project's banned accent-retention issue — consistent with house style).

## Summary
- 20 chapters checked.
- 15 sound, unchanged.
- 5 defective, corrected: 308, 316, 318, 319 (naming/omission fixes), plus the two naming fixes in 318/319 counted as one issue type occurring in two chapters.
