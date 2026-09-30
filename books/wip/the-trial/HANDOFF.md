# The Trial — NOT READY

- Branch: `content/the-trial-codex`.
- Base/current-main instruction revision: `221d6b78d`, fetched 2026-09-30.
- Initial source checkpoint: `609d7699a`; validated source correction: `5025ea671`.
- Chapters 1–2 content: `2628fd0aa`; earlier handoff: `17e742c09`; chapters 3–5 checkpoint: `d1ee250f1`.
- Latest English content checkpoint: `069e5205c73235927205953b28bd33bae2c122e9` (recorded in the subsequent handoff-only commit).
- Owned paths only: `books/wip/the-trial/`, `books/raw/the-trial/`.
- German: **10 chapters / 140 paragraphs**, counts 20 / 28 / 11 / 8 / 3 / 4 / 28 / 10 / 18 / 10.
- Modern English: **7 of 10 chapters**, complete chapter numbers **1, 2, 3, 4, 5, 6, 10**; **84 paragraphs**, counts 20 / 28 / 11 / 8 / 3 / 4 / 10. No incomplete or placeholder chapter in the edition.
- **Outstanding: chapters 7–9, 56 paragraphs, 35,308 German words. Resume chapter 7, paragraph 1. Chapter 10 is already done: do not overwrite it during continuation.**
- The request to reach 10/10 is **not achieved**. This checkpoint stops at completed chapter boundaries because the remaining full chapters exceed the turn's remaining output budget. An optional request for permission to use parallel writing agents received no answer during the turn; no agents were spawned.
- Onboarding, character proposal and taxonomy proposal supplied; not registered or published.
- German SHA-256: `caf39bade270a8718f3867720b97533e25364c8948c2b8a7738a11f1d6138d0f`.
- English SHA-256: `97aa57b5f8ecf8a16bc18f9c88339731852e1e789adb578bb2dfe66d0edecb0d`.
- All package and raw evidence hashes pinned in SHA256SUMS.

## QA output

- PASS: JSON parsing for all package JSON; original retains the validated ten-chapter source extraction.
- PASS: all **84 completed pairs** have matching chapter numbers and paragraph counts; zero empty/stub paragraphs; zero ratio flags outside 0.60–2.00; zero supplementary German-function-word scan hits.
- PASS: first three English paragraphs of **each completed chapter (1–6,10)** spot-read against German. Chapters 7–9 pending, not passed. In chapter 5 this covers the whole chapter; in chapter 6 the third paragraph completes the study/Leni scene.
- PASS: new chapter openings/endings checked against German. All authored paragraph text follows the supplied source in order, without paragraph mergers, splits, summaries or deliberate omissions.
- FAIL / INCOMPLETE: whole-book chapter and paragraph equality, German 10/140 versus English 7/84. No book-level readiness or alignment claim.
- PASS: onboarding has exactly three whyItMatters, four angleCards, cast, About, and no acclaim field.
- Review level: authoring-agent self-review and opening spot checks only; no independent literary acceptance. Ratio details: paragraph-ratios.json; summary: QA.json.
- Changed coordinates in this continuation: every paragraph of chapters 3, 4, 5, 6 and 10. Chapters 1–2 unchanged.

## Translation-provenance disclosure

No English translation was intentionally fetched or used as a baseline. However, a broad German provenance search returned an unsolicited Reddit result snippet naming a Parry translation and quoting a short English chapter label. **I saw that snippet.** I did not open the result, retrieve translation prose, compare against it, or use its wording. Do not describe this session as having zero incidental exposure to English translation wording. No Wyllie, Muir or other English edition was opened or downloaded.

`modern-en` is a **Tinct rendering from the German without a human English baseline, so English readers have only the German to compare against**. Every English paragraph was composed directly by the authoring agent from its German counterpart, not by a translation script, regex, translation API or another model call. Python was used only for source extraction, serialising authored strings and QA.

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

1. Approve the proposed neutral labels and complete the individual manuscript-title attribution audit. Collective attribution by Brod does not authenticate each printed wording.
2. Resolve Brod's arrangement and textual interventions for Denmark/EU. The German source is verified as a transcription of the 1925 first edition, but the entire edited edition is not certified free of protected original editorial contributions. Neutral headings do not clear ordering or the four-line rearrangement in chapter 8. Do not publish pending resolution.
3. Keep the ten main chapters only for now. Six additional manuscript fragments are absent from the 1925 source; do not fetch a modern critical edition to fill them. Brod identifies chapter 8 itself as nearly finished. The novel is not represented as completed by Kafka.
4. Finish modern-en chapters 7–9 and the same QA for each; then require identical whole-book counts and a full acceptance review. The approved cross-language QA replaces the similarity gate.
5. Character JSON is a proposal, not runtime characters.v1 data. Actual first-mention offsets, per-edition paragraph hashes, spoiler-aware snapshots and name disambiguation remain for completed-text integration.

## Source variations and rendering decisions

- Chapter 1: source describes the spectator's beard first as reddish, later as fair; retained.
- Chapters 1–2: Hasterer / Hesterer retained as printed. Do not silently harmonise.
- Chapter 2: K. says his arrest was about ten days earlier; retained despite surrounding scheduling tensions.
- Chapter 3 opens with Sunday evening and then says he goes on Sunday; the source chronology is retained.
- Chapter 6 contrasts name day in Erna’s letter with birthday in K.’s reflections; retained.
- Chapter 6: the uncle is Karl in paragraph 1 and introduces himself as Albert in paragraph 2. Use neutral display name in proposed cast; retain source variants when rendering.
- Legal terms used so far: Kanzleidirektor = chief clerk; Armenadvokat = lawyer for the poor; Auskunftgeber = information officer; Beweisanträge = applications for evidence to be taken; Wächter = guard; Aufseher = supervisor; Untersuchungsrichter = examining magistrate; Staatsanwalt = public prosecutor; Prokurist = authorised signatory (erster Prokurist = chief authorised signatory); Untersuchung = examination; Verhör = questioning; Verfahren = proceedings; Prozeß = case or proceedings according to context. Preserve the distinction between accusation, arrest and guilt; do not make the narrator certify K.'s conclusions.
- Chapter 1 scene break: standalone asterisk after prose paragraph 9 is not a reading paragraph; an empty HTML paragraph is also excluded. Initial extraction counted the asterisk; checkpoint 5025ea671 corrected it. Scene-break position is recorded in QA.json.

## Integration and workspace notes

Content proposal only. No app/registry edits, no publication, narration or Anthropic API spend. No original-en file. No modern critical text used. Onboarding uses the existing fields; estimated reading time is approximate for the eventual full book.

The first checkout, `work/the-trial`, was switched externally to another task's branch during writing. The source checkpoints were already pushed. A separate checkout, `work/the-trial-content-isolated`, now owns this branch; the unfinished English draft was copied intact and continued there. The earlier checkout still contains a stale, untracked English draft within this task's allowed folder; it was left untouched to avoid disrupting the other task. **Only this branch's committed package is authoritative.** All commits here are restricted to the two owned content paths.
