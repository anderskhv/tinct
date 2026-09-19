# Don Quixote — Batch J Content Fidelity Review

Scope: chapters 100–110 (Part II, chapters 48–58), `dq-batchJ-current-modern-en.json` checked paragraph-by-paragraph against `dq-batchJ-source.json`.

Paragraph counts verified programmatically to match the source exactly for all 11 chapters (18, 60, 52, 21, 20, 18, 30, 21, 15, 16, 37 — totaling 308 paragraphs) both before and after correction. `dq-batchJ-corrected.json` has the same array-of-11-chapters shape and identical paragraph counts.

## Per-chapter verdicts

- **Ch. 100 (Part 2, Ch. 48)** — Clean. Faithful modernization throughout, including the duenna/scratching-and-pinching episode. No fidelity issues found.
- **Ch. 101 (Part 2, Ch. 49)** — Clean. Sancho's rounds, the gambling-house dispute, the young man's riddle exchange, and the cross-dressed siblings episode all check out.
- **Ch. 102 (Part 2, Ch. 50)** — Clean. Page's visit to Teresa Panza, the duchess's and Sancho's letters, and the village reactions are all faithfully rendered.
- **Ch. 103 (Part 2, Ch. 51)** — Clean. The bridge/gallows riddle judgment, Don Quixote's letter of advice, and Sancho's reply letter are faithful, including the full text of both letters.
- **Ch. 104 (Part 2, Ch. 52)** — Clean. Doña Rodriguez's second appeal, the challenge to the farmer's son, and the two Teresa Panza letters are faithful.
- **Ch. 105 (Part 2, Ch. 53)** — Clean. The night assault/mock siege on Sancho, his resignation speech, and farewell to Dapple are faithful, including the proverbs.
- **Ch. 106 (Part 2, Ch. 54)** — Clean. The Ricote (Morisco) episode — his account of exile, his reasons for returning, the buried treasure offer, and Sancho's refusal — is faithful in all particulars (route through France/Italy/Germany, pilgrim disguise, names, sums of money, etc.).
- **Ch. 107 (Part 2, Ch. 55)** — Clean. Sancho's fall into the pit, his lament, the rescue by Don Quixote, and his speech to the duke and duchess are faithful.
- **Ch. 108 (Part 2, Ch. 56)** — **1 defect found and fixed** (see below).
- **Ch. 109 (Part 2, Ch. 57)** — Clean. Don Quixote's departure, Altisidora's verse laments (all four stanzas), and the kerchiefs/garters exchange are faithful.
- **Ch. 110 (Part 2, Ch. 58)** — Clean. The images-of-saints episode, the omens discourse, the pastoral-Arcadia shepherdesses episode, and the bull-drove stampede are all faithful.

## Defect found and fixed

### Chapter 108 (Part 2, Chapter 56), paragraph index 2

Description of Tosilos's horse was altered in two ways that distort the physical/comic detail of the passage: the coat color was changed to a different, incompatible descriptor, and the quantity of wool on its fetlocks was reduced by roughly two orders of magnitude, undercutting the comic image of a heavily shaggy draft horse.

- **Exact source text:** "The horse was a manifest Frieslander, broad-backed and flea-bitten, and with half a hundred of wool hanging to each of his fetlocks."
- **Exact defective text (before fix):** "The horse was plainly a Frieslander, broad-backed and dapple-grey, with half a pound of wool hanging from each fetlock."
- **Exact fix (after correction):** "The horse was plainly a Frieslander, broad-backed and flea-bitten, with half a hundredweight of wool hanging from each fetlock."
  - "dapple-grey" → "flea-bitten" (restores the source's coat description; flea-bitten grey is a distinct, recognized pattern from dapple-grey, and the swap changed a factual detail).
  - "half a pound" → "half a hundredweight" (restores the source's "half a hundred" — a period unit of measure, ~50 lb — modernized here as "hundredweight" rather than the source's literal "a hundred" for clarity, while preserving the same order of magnitude and the comic image of an absurdly hairy-legged horse; "half a pound" trivializes and distorts this).

No other dropped/invented clauses, meaning inversions, compressions, or name/place/object distortions were found in this batch. Comic violence, crude humor, and satire (e.g., Doña Rodriguez's flogging, Sancho's mock-siege drubbing, the bull stampede, Altisidora's mocking verses) were left intact and unsoftened, per instructions.
