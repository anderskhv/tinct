# Review record: *The Iliad*, Tinct Modern English

## Process

1. **Rendering.** 50 batches (≤ ~4,200 source words each, chapter-bounded) were rendered by separate sub-agents working only from the served Butler text (`source-original-en.json`) and `STYLE-NOTE.md`. Four pilot batches (Book 1 first half, Book 2 first part, Book 16 last part, Book 24 first part) were first rendered too close to Butler (similarity 0.80–0.88) and were re-rendered against a stricter closeness target before the other 46 were started. Each renderer ran the validator (structure, forbidden Roman names, straight quotes, contractions, archaisms, British spelling, length ratio) and reported its judgement calls. `batches/` holds the renderers' accepted output exactly as delivered, before review.
2. **Independent fidelity review, round 1.** 24 reviewers, one per Book, none of whom rendered any text. Each read **every** paragraph of its Book, source beside candidate (`reviewed` in each `reviews/bookNN.json` lists all indices; coverage was asserted programmatically against the paragraph counts: 1,137 of 1,137). Checks: omission, reversal, names/genealogies, flattened similes, softened or sharpened violence, added facts, epithet/formula consistency, archaism and clarity, truncation, quotation handling.
3. **Fixes.** Every major and minor finding carried a complete replacement paragraph; all 71 were applied (`review-fixes/round1.json`; 70 changed text, 1 matched the existing text).
4. **Independent recheck, round 2.** Three fresh reviewers (neither renderers nor round-1 reviewers) rechecked all 70 changed paragraphs against source (`reviews/r2-1.json`, `r2-2.json`, `r2-3.json`). Five were not OK; their corrections were applied (`review-fixes/round2.json`: Book 16 ¶8, ¶12, ¶24; Book 22 ¶29; Book 24 ¶41).
5. **Final reading of the five round-2 corrections** was done by the package owner against the source; they were **not** independently rechecked a third time.
6. **Automated checks** on the final candidate: structure against both served editions, serialization, whole-poem and per-Book similarity gates, truncation audit, forbidden-name sweep, straight-quote and contraction sweep (all in `GATE-OUTPUT.txt` or reported in `ACCEPTANCE-RECORD.md`).

## Findings

| | Count |
|---|---|
| Major | 3 (Book 7 ¶18 "grazed" for "gashed"; Book 8 ¶15 Hector's "flinching" reversal; Book 22 ¶23 Achilles' comparison lost) |
| Minor | 68 |
| Notes (no action, reviewer judged the reading acceptable) | 43, listed in `first-round-notes-no-action.json` |
| Round-2 not OK | 5 (all corrected) |

By Book (paragraphs read / minor / major / notes): the per-Book JSON files carry the counts; the whole-poem totals are above. No reviewer found omitted passages, wrong genealogies, or softened violence at "major" level beyond the three listed; the Catalogue of Ships (Book 2), the arming and battle scenes, the funeral games (Book 23) and Priam’s ransom (Book 24) were read in full and kept complete.

## Not done

- No separate general-reader accessibility read apart from the fidelity/clarity reviewers' own judgement.
- Round-2 recheck covered only the paragraphs changed by round 1. Paragraphs with no first-round finding were read once.
