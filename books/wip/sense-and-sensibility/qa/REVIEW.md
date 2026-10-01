# Full-book editorial QA

Candidate complete; independent acceptance pending. This is an author review record, not an independent reviewer’s approval.

## Structural and automated checks

Both editions: 50 sequential flat chapters, empty sections, 1,806 nonempty paragraphs. Chapter numbers, titles, order and paragraph counts agree. The source has 118,639 whitespace-delimited words; modern-en has 106,042 (89.38%). Every individual paragraph meets the 75% floor, including short dialogue; minimum ratio 0.75000. See alignment-and-length.json for every pair and hash.

The original body was compared chapter by chapter with all 50 raw body sections, ignoring whitespace and excluding headings and the three documented end markers. No source prose was removed or corrected. Original SHA-256: 26ccda9547c41d41a808e57c43834c4d9199f9164f7872e297cca4b73820d4c0.

All JSON parses. Edition objects match the English-original novel shape: chapters with number/title/paragraphs and sections: []. No empty paragraphs, missing chapters, filler chapters or Gutenberg apparatus. All 18 paragraphs shorter than 20 characters were manually checked: complete dialogue, letter signatures/closing, or narrative transitions. See short-paragraph-review.json.

Final classifier gates: 1–10 PASS (0.454), expanded 1–12 PASS (0.454), interim 13–16 PASS (0.495), 13–22 PASS (0.485), 23–32 PASS (0.487), 33–42 PASS (0.491), 41–50 PASS (0.458). The final ten-chapter batch deliberately overlaps chapters 41–42. All paired slices were refreshed against the final candidate after editorial corrections and gated again. The original checkpoint history remains in Git.

Whole-book gate PASS: weighted similarity 0.475; 0/50 LIGHT/MECHANICAL chapters; 0/1,478 identical long paragraphs; zero wrapped scaffolding or flagged truncated quotations. Existing audit-truncation.py reports zero flags across all 50 chapters. The additional strict check covers even the under-20-word paragraphs omitted by that script. No tool was modified; absolute staged prefixes were used.

## Author editorial review

Every paragraph was read against its source during fresh sentence-by-sentence authorship. No dictionary/regex modernization, source-copy filler, or generation API was used. Parsing and diagnostic checks did not generate the modern prose.

A separate final author spot-read checked the first three paragraphs of chapters 1, 25 and 50: inheritance restrictions and legal interests, the London invitation and travel arrangements, and Mrs. Ferrars’s figurative extinction/resurrection of her sons. The first and last paragraphs of every chapter are paired in modern-boundaries.json for review; source-boundaries.json retains the original boundary evidence.

Proper-name diagnostics were manually inspected. Many lexical flags were identity-preserving forms (Elinor for Miss Dashwood, Edward for Mr. Ferrars), capitalization, expanded honorifics, or singular/plural forms. Final corrections restored explicit Brandon/Marianne/Lucy Steele names and locations at Barton Park, Berkeley Street, Cleveland and the cottage; retained the source’s Cassino and Holburn spellings; and restored the emphasis on “her” in 8:9. The 13 changed paragraphs in this final editorial pass are 8:9, 12:10, 16:14, 21:5, 28:2, 32:19, 35:20, 40:31, 42:11, 43:17, 49:31, 49:34 and 50:7 (one-based). All affected batches and the whole book passed again.

Period money, manners, courtship restrictions, literary and colonial references, named places, letters, and the narrative’s irony remain. Earlier checks covered Cowper/Scott/Pope, Hamlet, East Indies/nabobs/gold mohrs/palanquins, Queen Mab, the cancelled outing, Allenham, and the full diminishing-gift argument. Later authorship checks covered Lucy’s secrecy and manipulation, the rejection correspondence, the two Elizas and Brandon’s attributed account, the duel, the offered living and proposal misunderstanding, the illness and recovery, Willoughby’s self-serving defence, the Ferrars marriage confusion, and the closing satire. Speculation remains attributed: Mrs. Jennings’s paternity claim is not a narrative fact, nor is Willoughby’s account endorsed. Historical step-family terms are clarified in their actual context. Interrupted speech remains interrupted; no intentional abridgment of quoted content.

## Supporting content

Onboarding has About, exactly three whyItMatters entries (each with one brief “Today:” line), four reading angles, and eleven cast entries. No acclaim field. The opening excerpt exactly matches original-en chapter 1 paragraph 1. Reading time is an estimate.

All 24 character evidence quotations match their original-en coordinates. Identity review distinguishes the Dashwoods, Edward/Robert, Anne/Nancy/Lucy, and the two Elizas. Fanny’s Ferrars disclosure is gated after chapter 3. Miss Williams keeps that initial display name through chapter 13; her full name/history wait until chapter 31. Mrs. Brandon is context-sensitive across the elder Eliza’s retrospective history and Marianne’s marriage. Proposed cards use conservative completed-chapter gates; runtime offsets and exact in-chapter display remain future integration work.

Taxonomy and metadata remain proposals. No unsupported acclaim or named canon membership is asserted.

## Remaining acceptance requirement

The mandatory book workflow requires independent reviews. No independent semantic/accessibility or character/spoiler review has occurred. The session prohibits spawning reviewer agents without explicit authorization; a request was presented and remains unanswered. These author checks and automated results must not be represented as independent acceptance. The complete candidate is ready for that review; acceptance status remains NOT READY until it is completed and findings resolved.

Modern candidate SHA-256: c86c2708f95b94c9bd8eecb54873cfe988f00ede3853a10c42c04a28316df512.
