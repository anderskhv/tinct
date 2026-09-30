# The Trial — NOT READY

- Branch: `content/the-trial-codex`.
- Base/current-main instruction revision: `221d6b78d` (fetched 2026-09-30).
- Commit: initial original checkpoint is the commit introducing this file; exact checkpoint hash will be recorded in the next content checkpoint. `git log -- books/wip/the-trial` resolves package commits without a self-referential hash.
- Owned paths only: `books/wip/the-trial/`, `books/raw/the-trial/`.
- Original: ten flat chapters, 141 paragraphs; counts 21 / 28 / 11 / 8 / 3 / 4 / 28 / 10 / 18 / 10.
- Original structural QA passed; JSON valid; no empty reading paragraphs; chapter openings/endings retained; no apparatus. See QA.json and source-boundaries.json.
- Pinned hashes: SOURCE.md and SHA256SUMS.
- Modern English: not yet started at this checkpoint. Resume chapter 1, paragraph 1.

## Chapter-title provenance and proposed decisions

The 1925 afterword attributes the headings collectively to Kafka. This is Brod's testimony, not independent authentication of each printed heading's exact wording. DLA confirms Kafka's bundles and Brod's ordering. No individual title leaf has yet been collated. None of the printed headings is carried into the candidate; the neutral labels below require Anders's editorial approval. Unverified attribution must not become an assertion of Kafka authorship.

| Chapter | Printed heading, for provenance only | Attribution evidence / uncertainty | Candidate labels DE / EN |
|---|---|---|---|
| 1 | Verhaftung · Gespräch mit Frau Grubach · Dann Fräulein Bürstner | Brod's general attribution; composite wording not independently verified; possibly editorial | Kapitel 1 / Chapter 1 |
| 2 | Erste Untersuchung | Brod's general attribution to Kafka; exact manuscript wording unverified | Kapitel 2 / Chapter 2 |
| 3 | Im leeren Sitzungssaal · Der Student · Die Kanzleien | Brod's general attribution; composite wording not independently verified | Kapitel 3 / Chapter 3 |
| 4 | Die Freundin des Fräulein Bürstner | Brod's general attribution; exact title and expansions unverified; possibly editorial | Kapitel 4 / Chapter 4 |
| 5 | Der Prügler | Brod's general attribution to Kafka; exact manuscript wording unverified | Kapitel 5 / Chapter 5 |
| 6 | Der Onkel · Leni | Brod's general attribution; composite wording not independently verified | Kapitel 6 / Chapter 6 |
| 7 | Advokat · Fabrikant · Maler | Brod's general attribution; composite wording not independently verified | Kapitel 7 / Chapter 7 |
| 8 | Kaufmann Block · Kündigung des Advokaten | Brod's general attribution; exact manuscript wording unverified; known rearrangement of four lines in body | Kapitel 8 / Chapter 8 |
| 9 | Im Dom | Brod's general attribution to Kafka; DLA's writing page independently identifies the manuscript bundle with this name | Kapitel 9 / Chapter 9 |
| 10 | Ende | Brod's general attribution to Kafka; exact manuscript wording unverified | Kapitel 10 / Chapter 10 |

Chapter 9 corroboration: https://www.literatursehen.com/themenseite/schreiben/ . Source/rights references are in SOURCE.md.

## Open decisions and limits

1. Approve neutral numbered labels; complete individual manuscript-title attribution before accepting the provenance audit.
2. Resolve Brod's arrangement and textual interventions for Denmark/EU. The 1925 source is verified, but the whole edited edition is not certified free of protected editorial contributions. Replacing headings does not resolve ordering or chapter 8's rearrangement. Do not publish this package pending resolution.
3. Retain ten main chapters only. The six additional manuscript fragments are absent from the 1925 source; do not fetch a later critical edition to fill them. Brod identifies chapter 8 itself as almost finished. No claim that Kafka completed the novel.
4. `modern-en` is a Tinct rendering from the German without a human English baseline, so English readers have only the German to compare against. Do not create or imply an `original-en` edition. The user's 2026-09-30 decision supersedes the normal English-human-baseline requirement and cross-language similarity gate.
5. No third-party English translation of The Trial was fetched, read or consulted. No Anthropic API spend, app/registry edits, publication or narration generation.

## Integration

Content proposal only. Future integration must use `original-de` and `modern-en`, preserve flat chapter/paragraph identities, and wait for full bilingual QA and rights/editorial acceptance. Onboarding, character and taxonomy proposals are pending at this checkpoint.
