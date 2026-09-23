# Re-verification r1-1: Pride and Prejudice (modern-en), chapters 1-31

## Coverage
- The input file (`reverify-r1-1.txt`) has 62 changed paragraphs.
- I verified all 62 and compared SOURCE, BASELINE and CANDIDATE for each one. Every CANDIDATE text in the input matches the current `candidate.json`.
- There is one JSON entry per paragraph in `reverify-r1-1.json`.

## Counts
- CLEAN: 61
- DEFECT: 1
- REVERT: 0

## Non-CLEAN items
- **[30.2] DEFECT.** A botched splice left a duplicated clause: "Until Elizabeth remembered that there might be that the family might have other church posts to hand out". The sentence is ungrammatical. The source says "there might be other family livings to be disposed of", meaning livings in the gift of Lady Catherine's family.
  - Fix: `that there might be that the family might have other church posts to hand out` becomes `that Lady Catherine's family might have other church posts to hand out`. This `old` string occurs exactly once in the candidate paragraph (checked with python3).

## Notes on borderline CLEAN calls
- **6.8 ("the card game Vingt-un")** and **7.0 ("entailed—legally bound to pass, …")**: these are short glosses for accessibility. Their punctuation is sound: the single dash in 7.0 runs to the end of the sentence.
- **14.13 ("Lydia yawned")**: in the period sense, "gaped" means yawned. This fits "monotonous solemnity" better than the baseline's astonishment reading.
- **16.20 ("disgracing his memory")**: "his" follows "his father's hopes", so it reads as the father. This is acceptable.
- **20.29 ("in York")**: this restores Austen's place name. The sense of distance still comes through.

## Minor pre-existing inconsistency (not a fidelity defect)
- **22.4**: Mr. Collins is still "neither clever nor pleasant" (source: "sensible"). 15.0 now correctly says "not a sensible man". This could be harmonized later. It is not flagged in the JSON.

## Overall verdict
The repairs are sound. 61 of 62 move the text toward Austen's meaning, irony or qualification without new defects. One paragraph (30.2) has a grammatical splice error. Apply the fix above.
