# Full-book editorial QA

**ACCEPTED (2026-10-02) — independent editorial review complete, all findings resolved.** The sections below are the original author review record; the independent review and its resolution follow at the end. Figures in the author sections describe the pre-review candidate; current figures are in “Independent review and acceptance”.

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

## Independent review and acceptance

An independent editorial review (separate reviewer, not the authoring agent) read the release-candidate modern-en (`4b8753a6…378f`) against the source, together with onboarding, threads and character cards, for meaning, accessibility, voice, character identity and spoiler gating. Its findings, all resolved on 2026-10-02 (details with before/after text in EDITORIAL-FIXES.md):

1. 2:3 duplicated “generosity” clause — fixed.
2. Lucy’s and Anne Steele’s ungrammatical speech had been normalised — restored, readably, at 35:4, 35:17, 38:22 and in Lucy’s letter 49:14, so Edward’s complaint about its style (49:18) makes sense.
3. Modern “Mrs. Dashwood” meaning Fanny in London (34:2, 34:4, 35:9, 35:15, 36:26, 36:28, 37:5, 37:7 ×2, 41:4) — now “Fanny”/“Mrs. John Dashwood” in narration and quoted naming, “your sister-in-law” in Lucy’s/Mrs. Jennings’s speech.
4. 44:55 conditional meaning, 36:26 awkward “herself”, 37:37 fragment — rewritten.
5. Threads: Elinor/Brandon ch30 (Brandon still believes Marianne was engaged), Lucy ch47, Anne ch32, Fanny ch36, Elinor ch20 (Willoughby, not Brandon) — corrected.
6. Unsupported “Fanny’s elder brother” — now “Mrs. Ferrars’s elder son” (onboarding cast, Edward card body and snapshots, threads Fanny ch3).
7. Missing progressive cards — added Willoughby (after ch30/31/44), Brandon (after ch39/50), Miss Grey as Willoughby’s wife (from 44:54 zero-based), Robert (after ch48), written strictly from the text and verified hidden before their gates.
8. Package records reconciled (this file, STATUS.md, EDITORIAL-FIXES.md, HANDOFF.md, release/HANDOFF.md, release/STATUS.md, validation-summary.json).
Nits: 20:22, 20:44, 30:22, 30:40, 35:21, 44:40, 29:15 (letter close restored verbatim), 50:18, meaningful italics restored across 80+ paragraphs (deliberately modernised foreign terms and stress already carried by syntax left as documented), Miss Williams card body, onboarding Fanny “Born a Ferrars” removed.

Gates rerun on the final text: whole-book PASS (0.482; 0/50 light/mechanical; 0/1,478 identical long; 0 scaffolding; 0 truncated quotations); batch gates 1–10, 1–12, 13–16, 13–22, 23–32, 33–42, 41–50 PASS; truncation audit 0; structure/alignment PASS (1,806 paragraphs, minimum word ratio 0.750, 106,113 words = 89.44%); shard equality PASS; character asset verifies in both editions (487/487 character-service tests plus in-memory gate checks).

Acceptance: **ACCEPTED, findings resolved**, against these exact hashes:
- original-en `26ccda9547c41d41a808e57c43834c4d9199f9164f7872e297cca4b73820d4c0`
- modern-en `789a6dfb5025e0b96604b0cf7c258c3444792c175d1e18f62969cbbd52412928`
- onboarding `d2e5e7810b9dcc7b6d6284210d135cfa3378c7d3b746a72f31ad0a0a1194c251`
- threads `212b6d4ef59e66d6aeb95089156dce373e552053994a5a37c217b213504d4305`
- characters `c968fe82a9cb09e0e129ba7a62e9ed85091222488e518358844c2918842d0c20`

Text acceptance is not publication; integration and release remain with Codex.
