# Heart of Darkness — READY

Content-only staged replacement. Completed 2026-09-30. Whole-book absolute-prefix gate **PASS**. This package is ready for integration review; nothing is published or deployed.

## Scope and provenance

Owned path: `books/wip/modern-en-repair-r2/heart-of-darkness/` only. The staged original is a byte-exact copy of `app/public/data/editions/heart-of-darkness-original-en.json`. The candidate began as a copy of the live modern edition. Both live baselines were verified against `221d6b78d950e36ed2b18fbe6fd800cdd7d44abc`, also the remote `main` tip verified with `git ls-remote` on 2026-09-30. No other task's changes are included.

Read a skim of `books/BOOK-TASK-WORKFLOW.md` and the Modern English section of `books/AGENTS.md`; the explicit user scope and reading restrictions control this assignment. No changes to app, registry, live editions, characters, scripts, tests, configuration or shared trackers. No Anthropic calls or spend. No publication, deployment, or narration.

## Changed chapters and paragraphs

All three baseline chapters were LIGHT, so all were rendered sentence by sentence:

- Chapter 1: paragraphs 1–74.
- Chapter 2: paragraphs 1–37.
- Chapter 3: paragraphs 1–87.

All 198 paragraph strings differ from the live-modern baseline; full one-based coordinates and measurements are in `paragraph-audit.json`. Exact short quoted utterances in chapter 3 paragraphs 43 and 45 retain the original words; their baseline-to-candidate difference is quotation typography. Embedded letters, the report's quoted claims, the extermination postscript and the repeated “The horror!” remain present. Dialogue is rendered as dialogue, not summarized. No REAL or REAL-HEAVY baseline chapter required preservation, since none existed.

Paragraph counts remain **74 / 37 / 87**. No merging, splitting, reordering, dropping or summarizing. Sections and chapter metadata remain identical to the copied live-modern structure. Every paragraph is at least 75% of source length using both whitespace and lexical word counts. Minimum whitespace ratio: **75.0%**. Minimum lexical ratio: **75.6%**. All **159** source exclamation marks remain, with exact counts in every corresponding paragraph.

The prose was authored directly in this task. Inline serialization and measurement only were used; no regex, dictionary pass or API generated the rendering. Length flags were individually revised against their complete source paragraphs.

## Before and after gates

| Metric | Published-file baseline | Final staged candidate |
| --- | --- | --- |
| Weighted similarity | 0.953 | 0.358 |
| LIGHT + MECHANICAL | 3/3 (100.0%) | 0/3 (0.0%) |
| Identical long paragraphs | 1/183 (0.5%) | 0/183 (0.0%) |
| Wrapped scaffolding | 0 | 0 |
| Truncated quotations detected | 0 | 0 |
| Result | FAIL | **PASS** |

Final chapter classifications and exact displayed scores are recorded in `gate-after.txt`; all three are REAL-HEAVY. The earlier chapter-1 checkpoint log is retained as `gate-chapter-1.txt`; it is not the final whole-book acceptance record. Baseline evidence is `gate-before.txt`.

Gate command:

```sh
python3 books/classify-modern-en.py /Users/andershvelplund/.codex/.chatgpt-projects/g-p-6aaba3f019a08191b14bfbdbdbb6d692/work/the-trial/books/wip/modern-en-repair-r2/heart-of-darkness/heart-of-darkness --gate
```

## Spot-read notes: first three paragraphs of three chapters

- Chapter 1, paragraphs 1–3: compared source and saved candidate. Preserved the Nellie, anchoring, full tide and wait for ebb; Thames, welded sea and sky, tanned barge sails and sprits, Gravesend and the brooding city; the Director's pilot-like trustworthiness and the contrast between estuary and workplace. Recast syntax retains the layered imagery.
- Chapter 2, paragraphs 1–3: compared source and saved candidate. Preserved Marlow's overhearing, the manager/uncle relationship, Kurtz's note verbatim, ivory and invoice, the three-hundred-mile return and four paddlers, labels for the clerk, quoted beacon passage, climate as threat, uncertain motive, and unequal shadows. New syntax preserves the sequence and the gap between overheard words and interpretation.
- Chapter 3, paragraphs 1–3: compared source and saved candidate. Preserved the harlequin's inexplicable survival, youth's glamour, selfless adventure and dangerous devotion; the becalmed-ships analogy, conversation versus monologue ambiguity, love in general and exclamations; the headman's look and the land's apparent darkness. The interpretation is not made more certain than Marlow's.

Further source comparison covered the attack, helmsman's death, the Society report and postscript, stake-heads, the Russian's disclosures, the night encounter, Kurtz's last words, competing memories of his talents, and the Intended's final encounter. Preserved names, allusions, period racial terms, specific weapons and objects, and the distinction between what Marlow sees, guesses, hears and cannot explain. The final lie, the African woman's echo in the Intended's gesture, and the framing return to the Thames remain intact.

## SHA-256

- Staged original: `9d7234592e087f7d60a6dd460551347da283d5225fdcf81099a4b78b62bcede8`
- Final staged modern: `abcf3c20a7d0b42c15ad3196032cea5a14a113f8cecea35c70d5af8023d4aebf`
- Live-modern baseline: `169c288c26f0c8c07be6d181855123cd982023a0b780262576944f5833afa435`

`SHA256SUMS` covers both edition JSON files.

## Characters and integration impact

`books/characters/heart-of-darkness/` **does not exist** in this checkout. No character file was edited. A future integration owner must assess existing runtime character-card quotations against the accepted text and use exact-text narration cache identity. This content-only READY status does not authorize or perform that integration.

## Known issues and delivery

No outstanding gate, paragraph alignment, minimum-length, exclamation-count, scaffolding or quotation-truncation flags. Automated checks do not replace the editorial reading noted above; this is not a claim of independent second-reader review.

The local checkout is shared and other sessions switched it to r4. Delivery therefore uses a separate Git index and an explicit r2 branch parent, leaving the active branch and shared index untouched. The content commit contains only this owned directory. Target branch: `content/modern-en-repair-r2`.

On Liberty and The Awakening remain separate, not-started books in the requested order. Their readiness is not implied by this package.
