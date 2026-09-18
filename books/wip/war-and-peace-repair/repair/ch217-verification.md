Model: opus

# Chapter 217 (Book Ten — Chapter 27) — independent verification

Verifier did not draft, review or correct this chapter. Paragraph indices are 0-based, matching the fidelity review and the corrections log.

Files compared:
- source: `ch217-source.json`
- pre-correction candidate: `ch217-candidate.json`
- corrected: `ch217-corrected.json`
- log: `ch217-corrections-log.md`
- context: `ch217-fidelity.md`

## 1. Diff vs log

Independently computed diff (candidate vs corrected), 0-based:

`[1, 3, 4, 7, 11, 17, 21, 22, 23, 24, 25, 26, 27]` — 13 paragraphs changed.

Log entries: ¶1, ¶3, ¶4, ¶7, ¶11, ¶17, ¶21, ¶22, ¶23, ¶24, ¶25, ¶26, ¶27 — 13 entries.

**Exact match.** No logged change is missing from the file; no changed paragraph is unlogged. No blocking mismatch.

## 2. Per-change verdicts (re-derived from source, not from the log)

### ¶1 — PASS
"nor any special effort on the part of the Emperor and his marshals, nor any need for that supreme quality called genius" → "nor any **particular care or trouble** ... nor **was there any need of that special and supreme** quality called genius". Source exact on both halves. The candidate had merged two nouns into one and, more damagingly, moved "special and" off "genius", which is where Tolstoy's irony sits — the whole sentence is mocking the idea that anything special was required.

### ¶3 — PASS
"placed by the next morning" → "**set up by the morrow**". Source exact. "By the morrow" is the source's term and is the deadline as Napoleon gave it; "the next morning" invents a time of day the source does not specify.

### ¶4 — PASS
"the battle plan was written down" → "**the dispositions for the battle** were written down". Source exact. This restores the chapter's controlling term. The word matters structurally: ¶5, ¶21, ¶22 and ¶27 all turn on "the disposition(s)", and the chapter's argument is about that document specifically. "Battle plan" broke the chain at its first appearance.

### ¶7 — PASS
"bombard the enemy's battery" → "**overwhelm with shellfire** the enemy's battery". Source exact. Confirmed the corrector's secondary reasoning: the source reserves "bombard" for its own use at ¶11 ("the battery that is to bombard the entrenchment on the left"), so the candidate's flattening had collided two distinct verbs into one. Both now sit where the source puts them.

### ¶11 — PASS
"General Fouche" → "General **Fouché**". Source exact. Diacritic restored.

### ¶17 — PASS on the change made; residual MINOR noted
"Morand's and Gerard's divisions" → "Morand's and **Gérard's** divisions". The diacritic is correctly applied and matches the chapter's form at ¶25/¶26/¶27.

*Residual MINOR (inherited, non-blocking):* the source reads "**Gibrard's**" at this one location — it says "Gérard" at ¶25, ¶26 and ¶27 but "Gibrard" here. The name-form harmonization was inherited from the candidate, not introduced by this pass; the correction only added the accent. The fidelity review grades it MINOR and marks it "Inherited", and the log declines it with stated reasoning (the editor's instruction covered accents, not name forms, and reintroducing an isolated variant against the chapter's otherwise-consistent form was judged riskier than leaving it). I agree that is defensible for a modern reading edition, and it is plainly not MAJOR or MODERATE. Flagged so it is on the record: corrected has four "Gérard", source has three plus one "Gibrard".

### ¶21 — PASS
- "very **vague** and confused" → "very **obscure** and confused". Source exact, and it matters: "obscure" means unintelligible, which is the charge Tolstoy repeats verbatim at ¶26 ("this unintelligible sentence"). "Vague" is a different and weaker accusation.
- "**consisted of** four directives" → "**related to Napoleon's orders to deal with** four points". Source exact. Relation is not composition — the source says the dispositions bore on four points, not that they were made of four items.

*Minor readability note (inherited, non-blocking):* the restored clause puts "Napoleon's" twice in quick succession ("awe of Napoleon's genius, related to Napoleon's orders"), because the candidate had already expanded the source's "his genius" to "Napoleon's genius". That expansion is inherited and untouched here; the doubling is mildly clunky but not unclear.

### ¶22 — PASS
Four restorations, each checked:
- "Fouche's" → "**Fouché's**". Source exact.
- "102 in all" → "**102 guns** in all". Source exact; the noun keeps the count unambiguous after an intervening list.
- "bombard the Russian flèches and redoubts" → "**shower shells on** the Russian flèches and redoubts". Source exact, consistent with the ¶7 fix.
- "the shells **could not reach**" → "the **projectiles did not carry to**". Source exact. This is the meaningful one: the source states a fact about what happened, the candidate's modal turned it into a claim about capability. The following clause ("those 102 guns shot into the air") depends on the flat statement of fact.

### ¶23 — PASS
"because Poniatowski, advancing through the wood, met Tuchkov" → "advancing **on the village** through the wood". Source exact. The restoration matters because Tolstoy's method here is to repeat the order's own wording back when showing it fail; without "on the village" the echo was gone and the paragraph lost its point.

### ¶24 — PASS
"it had to re-form under grapeshot—**something Napoleon hadn't foreseen**" → "under grapeshot, **of which Napoleon was unaware**". Source exact. This is the chapter's load-bearing distinction: ignorance of what was happening, not a failure of prediction. The source keeps the two apart deliberately — ¶27 uses "unforeseen and not heard of" for the other case, and the chapter's closing argument rests on Napoleon being unable to *know* the course of the battle. Correctly restored.

### ¶25 — PASS
"Gerard's" → "**Gérard's**". Source exact.

### ¶26 — PASS
- "the Viceroy **(Eugène de Beauharnais)**" → "the Viceroy". Source exact. This is the substantive fix. The source calls him "the vice-King" five times (¶16, ¶17, ¶25, ¶26, ¶27) and never names him anywhere in the chapter. The parenthesis inserted external historical knowledge as though it were in the text. Verified removed, and confirmed by whole-chapter search: "Beauharnais" and "Eugène" now appear zero times in the corrected file, matching the source's zero.
- "to execute **it**" → "to execute **the orders given him**". Source exact. The candidate's "it" narrowed the referent to the single unintelligible sentence just quoted; the source means the whole body of orders he was working from.
- "Gerard's" → "**Gérard's**". Source exact.

### ¶27 — PASS
- "like the rest of **the plan**" → "like the other parts of **the disposition**"; "not a single order in **the plan**" → "not one of the orders in **the disposition**". Source exact on both. Restores the chapter's refrain, consistent with the ¶4 fix.
- "he could not **follow the battle's progress**" → "he could not **know the course of the battle**". Source exact, and it is the chapter's closing claim — it pairs with the ¶24 "unaware" fix. "Follow the progress" is about attention; "know the course" is about knowledge, which is Tolstoy's actual thesis.
- "Gerard's" → "**Gérard's**". Source exact.

## 3. Read as a new reader

All thirteen corrected paragraphs read clearly. The chapter is measurably more coherent than the candidate, because three of the fixes restore terms the argument depends on: "disposition(s)" now runs unbroken from ¶4 through ¶27, "obscure" at ¶21 now sets up "unintelligible" at ¶26, and "unaware" at ¶24 now sets up "could not know the course of the battle" at ¶27. Under the candidate those three chains were each broken at one link, and the closing argument arrived unprepared. Nothing was made harder to read in exchange. The only mild roughness is the doubled "Napoleon's" at ¶21, noted above and inherited.

## 4. Structure and punctuation

- Paragraph count: source 28, candidate 28, corrected 28. Match.
- Order preserved; no paragraph moved.
- No empty or whitespace-only paragraphs.
- `number` (217) and `title` ("Book Ten (1812) — Chapter 27") identical across all three files.
- Per-paragraph `?` and `!` parity against source: **no discrepancies in any of the 28 paragraphs.**
- Diacritic audit across the whole chapter, corrected vs source: Fouché 2/2, Eckmühl 2/2, flèches 2/2, méthode 1/1, Beauharnais 0/0, Eugène 0/0 — all matching. Gérard 4 vs source's 3 + 1 "Gibrard", per the inherited ¶17 note in §2. No unaccented variants (Fouche, Gerard, Eckmuhl, fleches, methode) remain anywhere in the file.

## 5. Findings

- No MAJOR findings outstanding (the fidelity review recorded none).
- Both MODERATE findings (¶24 "unaware", ¶26 Beauharnais + "the orders given him") are resolved and re-derived as correct against the source. The editor-ruled diacritic restorations (¶11, ¶17, ¶22, ¶25, ¶26, ¶27) are complete and verified chapter-wide.
- Residual MINOR, inherited and non-blocking: ¶17 "Gibrard's" → "Gérard's" name harmonization (§2); ¶21 doubled "Napoleon's" (§2).
- The log's "Declined findings" section is accurate: the declined items (¶2 clause emphasis, ¶17 Gibrard, ¶20 "(New Style)", ¶7/¶11 Compans form) are all genuinely absent from the diff, and none is MAJOR or MODERATE.

Verification: ACCEPT
sha256: 9a0a4dbfeeb0a59d203ea28a7f5cae764e62dfd5373affb01238ed180a74f06e
