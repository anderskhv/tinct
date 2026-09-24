# Isolated content follow-up — 23 September 2026

**Status: editing and author source-check complete; staged for independent content review. Not published and not independently accepted.** No shared repository, branch, live edition, application file, release tracker or audio asset was modified. This package does not replace or delay the coding agent's accepted Frankenstein/Jekyll release.

## Completed scope

| Book | Changed paragraphs | Scope |
|---|---:|---|
| The Prince | 29 | Focused accessibility pass through printed Chapters XV–XVIII (reader sections 16–19), the sampled Bologna account at 26.7, and the final verse at 27.13–14. Foreign quotations retained and explained; aligned verse rendered in contemporary English. Three source-logic discrepancies corrected. |
| Julius Caesar | 2 | Three short clarifications: public good, public treasury, Lupercal festival. |
| Jekyll and Hyde | 1 | Clarify Hyde's angry facial expression at 10.24. |

This is **not** a new full-book accessibility certification of The Prince. Other chapters are untouched apart from the listed later passages. The previous broad “done” designation should not be interpreted as an independent endorsement of every unchanged paragraph.

## Important fidelity corrections in The Prince

Coordinates are one-based reader section.paragraph. Section 19 is printed Chapter XVIII.

- **19.12:** source: “the few find a place there only when the many have no ground to rest on.” Accepted baseline: “the few find no place there when the many have no ground to rest on.” Candidate restores the source's condition: “the few find a place only when the many have no ground to stand on.” This is a source-relative meaning reversal, not an optional stylistic preference.
- **19.13:** restore loss of reputation **and** kingdom; baseline changed the conjunction to **or**.
- **17.5:** restore becoming poor **or** despised; baseline changed that conjunction to **and**.

All qualifications, examples and arguments in the changed paragraphs were checked against the English source. Quoted Latin and Italian are preserved. Their new explanations are confined to their meaning, not imported narrative. Old names are not globally normalized or reverted. The Jekyll 10.2 as/for source decision is untouched.

## Verification performed

- All three baselines match the previously accepted SHA-256 values exactly.
- JSON parses and full-edition assembly succeeds.
- Chapter numbers, titles, paragraph counts and other JSON metadata unchanged.
- Only the 32 declared paragraphs differ; every other paragraph is identical to its pinned baseline.
- Full candidate and per-paragraph hashes recorded.
- All 32 changed paragraphs compared to the English source during author review, with main examples, conditions, negation and contrasts checked. This is the editing author's review, not a separate reviewer.
- No changed prose paragraph of at least 30 source words falls below 75% of source length; this is a screening result, not the basis for the fidelity judgment.
- The retained Latin/Italian quotations at Prince 18.4, 19.3 and 19.5 are checked verbatim against baseline.
- The Cicero gloss was checked against the public-domain text of De Officiis I.34: [Loeb 1913 transcription](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cicero/de_Officiis/1B*.html).
- The Lupercal clarification accords with [the Shakespeare teaching edition's festival note](https://myshakespeare.com/node/3067). Brutus's public-good rationale is consistent with [Folger's discussion](https://www.folger.edu/explore/shakespeares-works/julius-caesar/julius-caesar-a-modern-perspective/).

## Review and release handoff

1. A fresh content reviewer should compare every changed paragraph with its source and neighbors, then read the changed candidate prose alone for accessibility. Review packets include source, baseline and candidate, with edit reasons. Do not substitute application tests for this editorial check.
2. Reverify any resulting edits and regenerate hashes. Until then these are staged author-reviewed candidates, not independently accepted replacements.
3. The coding agent remains the sole integration/deployment owner. Apply this as a later narrow release, using the baseline hashes to detect intervening text changes. If the live baseline differs, reconcile the affected passages; never overwrite newer text wholesale.
4. Re-anchor character mentions in changed paragraphs against the applicable reviewed package. No new identity/alias approvals are supplied. Do not invent them. This local package does not claim a verified character-card impact map.
5. Preserve the current voice architecture. No Kokoro, GPU work, audio generation or legacy-manifest prerequisite is part of this follow-up.
6. Verify actual versioned reader URLs after any eventual release, not stale unversioned CDN URLs.

For each book: `candidate.json`, `baseline.json`, `source.json`, `CHANGED-PARAGRAPHS.md`, `changes.json`, `candidate-paragraph-hashes.tsv`, and `manifest.json` are provided. The top-level manifest records all exact hashes. `assemble.py` only assembles and verifies these local artifacts; it is not repository tooling or an application change.
