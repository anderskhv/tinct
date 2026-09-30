# The Trial — CONTENT COMPLETE / READY FOR ANDERS’S REVIEW

- Branch: `content/the-trial-codex`; base/current-main revision `221d6b78d`, fetched 2026-09-30.
- Authoritative checkout: `work/the-trial-content-isolated`.
- Initial source checkpoint `609d7699a`; validated source correction `5025ea671`.
- Earlier English checkpoints: `2628fd0aa` (1–2), `d1ee250f1` (3–5), `069e5205c73235927205953b28bd33bae2c122e9` (6,10); prior handoff `ae21fc0596cd75a8517ed8a552f84e989c9a764c`.
- Final content checkpoint: recorded after commit below.
- Owned paths only: `books/wip/the-trial/`, `books/raw/the-trial/`.
- **German and modern-en: ten complete chapters / 140 paragraphs each**, counts 20 / 28 / 11 / 8 / 3 / 4 / 28 / 10 / 18 / 10. No missing, partial or placeholder chapters. English: **74,070 words**.
- Onboarding, character proposal, taxonomy proposal, source evidence, reproducible QA and hashes supplied. No remaining translation resume point.
- German SHA-256: `caf39bade270a8718f3867720b97533e25364c8948c2b8a7738a11f1d6138d0f`.
- English SHA-256: `cb956f19857689fd14a2e7e929802134b1960841a4299bc5923d42ada84e16a2`.
- Raw 1925 transcription SHA-256: `39806572aa000c1db7319503636a41505cc55ed7f9b01499070643ca7b5c23ec`.
- SHA256SUMS pins every package and retained raw evidence file, excluding itself.

## QA output

**PASS**: JSON validity; identical ten chapter numbers and all 140 paragraph positions; no empty/stub/copied-German paragraphs; no supplementary German-word scan hits; no English/German word ratios outside 0.60–2.00. Observed minimum **0.9237**, maximum **1.2432**. No ratio exceptions required inspection.

**PASS**: the German edition compared exactly against all 140 extracted source paragraphs after the documented apparatus/separator removals. Chapter openings and endings verified. First three English paragraphs of **every chapter** spot-read against the German; primary agent independently checked those of chapters 7–9.

**PASS**: independent second-agent comparisons of complete paragraphs 7:23,28; 8:8,10; 9:12,15,16. These include the painter’s legal remedies, Block’s humiliation, the parable and competing interpretations. Corrections applied: removed an unsupported cotton-fibre detail; clarified ending representation; replaced literal calques about advice and adulthood; corrected the scope of “after all”; rendered *haarfein* as subtle rather than equally balanced; made court-file traffic and the attendant’s dismissal precise. Legal distinctions remain actual acquittal / apparent acquittal / protraction.

**PASS**: onboarding has About, exactly three whyItMatters, four angleCards, cast, and no acclaim. Its openingText equals the first English paragraph. Character/taxonomy files remain proposals.

Reproduce automated checks: `python3 books/wip/the-trial/validate.py`. Output: `qa-output.txt`; structured results: `QA.json`; every pair’s word counts: `paragraph-ratios.json`. The approved cross-language QA replaces the similarity gate. Review means complete authoring self-review plus the specified independent spot checks, **not** an independent second reading of every paragraph or an objective literary “10/10” certification.

## Translation-provenance disclosure

No English translation was intentionally fetched or used as a baseline. However, an earlier broad German provenance search returned an unsolicited Reddit result snippet naming a Parry translation and quoting a short English chapter label. **I saw that snippet.** I did not open the result, retrieve translation prose, compare against it, or use its wording. Do not describe this session as having zero incidental exposure to English translation wording. No Wyllie, Muir or other English edition was opened or downloaded.

`modern-en` is a **Tinct rendering from the German without a human English baseline, so English readers have only the German to compare against**. Every English paragraph was composed directly by Codex authoring agents from its German counterpart. Anders’s follow-up authorised parallel completion of chapters 7–9. No translation script, regex translation, translation API or Anthropic spend was used. Python handled extraction, serialisation of authored prose, applying specific reviewed editorial corrections and QA.

## Chapter-title provenance and decisions for Anders

Brod’s 1925 afterword attributes headings collectively to Kafka. DLA confirms Kafka’s short labels on manuscript bundles; seven title leaves were inspected directly, supplementing this general testimony. The table separates observed labels from inferences about the printed edition. Exact punctuation, later numbering and expansion must not be attributed to Kafka solely on Brod’s testimony. **All ten reading units retain the independently written neutral labels `Kapitel N` / `Chapter N`; approve this consistent treatment.**

| Chapter | Printed heading, provenance only | Evidence and attribution decision | Candidate DE / EN |
|---|---|---|---|
| 1 | Verhaftung · Gespräch mit Frau Grubach · Dann Fräulein Bürstner | Manuscript opening at DLA canvas 3 is untitled; DLA identifies this bundle by its opening sentence. Treat the printed composite as editorial/Brod-supplied, not verified Kafka wording; do not reuse. | Kapitel 1 / Chapter 1 |
| 2 | Erste Untersuchung | Kafka bundle label visible at canvas 53; printed wording corroborated. Use neutral label for consistency. | Kapitel 2 / Chapter 2 |
| 3 | Im leeren Sitzungssaal · Der Student · Die Kanzleien | Three-part Kafka label visible at canvas 79. Words corroborated, printed separators are editorial presentation. Use neutral label. | Kapitel 3 / Chapter 3 |
| 4 | Die Freundin des Fräulein Bürstner | Scholarly manuscript account identifies `B’s Freundin`. Printed expanded wording appears editorial/Brod’s expansion; do not reuse. This leaf was not directly inspected. | Kapitel 4 / Chapter 4 |
| 5 | Der Prügler | Kafka label visible at canvas 119; printed wording corroborated. Use neutral label. | Kapitel 5 / Chapter 5 |
| 6 | Der Onkel · Leni | Two-part Kafka label visible at canvas 131; printed words corroborated. Use neutral label. | Kapitel 6 / Chapter 6 |
| 7 | Advokat · Fabrikant · Maler | Three-part Kafka label visible at canvas 163; words corroborated. Use neutral label. | Kapitel 7 / Chapter 7 |
| 8 | Kaufmann Block · Kündigung des Advokaten | Two-part Kafka label visible at canvas 223; words corroborated. Body’s four-line rearrangement remains a separate Brod issue. Use neutral label. | Kapitel 8 / Chapter 8 |
| 9 | Im Dom | Kafka label visible at canvas 259 and corroborated by DLA’s writing exhibit. Use neutral label. | Kapitel 9 / Chapter 9 |
| 10 | Ende | DLA’s manuscript exhibition identifies the ending chapter by this name, supporting Kafka origin alongside Brod’s general testimony. This title leaf was not directly inspected. Use neutral label. | Kapitel 10 / Chapter 10 |

Evidence URLs and retained image details are in SOURCE.md; image and metadata hashes are in SHA256SUMS. Low-resolution cover inspection is not claimed as expert handwriting authentication. Two editorial-title inferences are explicitly identified rather than guessed to be Kafka’s wording.

## Remaining approvals and known limits

1. **Content is complete; publication is not authorised or cleared.** Anders must approve the neutral-label decisions above and the ten-unit selection. No further translation is missing.
2. Resolve Brod’s arrangement and original textual interventions for Denmark/EU before any publication. Verified 1925 source provenance and neutral headings do not by themselves clear ordering or the four-line rearrangement in chapter 8. The candidate intentionally preserves the requested 1925 sequence for review; no legal conclusion of full editorial clearance is claimed.
3. Six additional manuscript fragments are absent from this source and remain omitted. Do not fetch a modern critical edition to fill them. Brod describes chapter 8 as nearly finished; the novel is not represented as completed by Kafka.
4. Character JSON remains a proposal. Runtime first-mention offsets, per-edition paragraph hashes, spoiler-aware snapshots and name disambiguation belong to later integration, which was not authorised in this content-only task.

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
