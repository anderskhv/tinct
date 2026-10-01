# Candide — incomplete research and pilot checkpoint

Branch: `content/replace-candide-codex`.
Base: fetched `origin/integration/release-candidate-6`, `95837141b`.
Policy reference inspected: `origin/main` at `72af4a8bee9de1d16d8f9051863a4f244151770a`, plus the assigned-base root/book instructions. The user's explicit Codex content assignment overrides the older role restriction; the user's owned path overrides general raw-source destinations. No instructions were treated as permission to publish.
Owned path: `books/wip/replace-candide/` only.

## Acceptance

**Not accepted. Not complete. Not suitable for integration.** Both edition filenames currently contain only a Chapter-I pilot, not thirty chapters. They are retained to make the source/gate incompatibility reproducible. No skipped chapter placeholders or copied-original modern paragraphs are included.

The 1759 anonymous Nourse second edition is rights-verified under the user's pre-1800 exception; see SOURCE.md for independent evidence and extraction conventions. Eight paragraphs were visually transcribed from printed pp. 1–4 and freshly rewritten sentence by sentence. No dictionary/regex modernization was used.

| Last pilot check | Result |
| --- | --- |
| JSON, equal chapter/paragraph counts, no empties | PASS: 1 chapter, 8 paragraphs each |
| Required complete structure | FAIL: 1 of 30 chapters |
| Per-paragraph words >=75% | PASS; details in pilot-validation.json |
| Per-paragraph exclamation preservation | PASS; all eight source counts are zero |
| Classifier | PASS: weighted similarity 0.279, 0% light/mechanical, 0% identical long paragraphs, no truncated quotations |
| Classifier after quote/apostrophe folding | PASS: weighted similarity 0.279 |
| Modern N=10 / N=8 overlap | PASS: 0/8 / 0/8 |
| Original N=10 / N=8 overlap | FAIL: 8/8 / 8/8 |
| Pilot terminal punctuation / empty/apparatus review | PASS |
| Complete-source opening/ending/completeness verification | NOT DONE beyond Chapter I |

Exact outputs are retained in `pilot-*.txt`. `pilot-validation.json` contains per-paragraph counts. Hashes are in `ARTIFACT-SHA256SUMS`, `source/downloads.json`, and `source/SHA256SUMS`.

The unchanged original fails the numeric overlap rule even though it was transcribed directly from a verified 1759 scan. Rewriting it to eliminate those matches would violate the separate verbatim-source requirement. No orthographic tricks, hidden characters, long-s tokenization tricks, paragraph splitting, or reference modifications were used to evade the gate. The checker is copied unchanged from the requested remote branch.

Fallback screening: the Smollett/Francklin-family sample flags at N=10; Rider's first three paragraphs pass N=10 but two flag at N=8, and whole-file OCR screening gives 31 flagged OCR blocks at N=10. Those OCR counts are preliminary, not source paragraph counts or full-book gate results. Boswell remains unverified under the required two-independent-source rule. Research does not prove that every possible historical translation fails; no such claim is made.

A targeted clarification about the original-only gate conflict was sent. It has not been answered at this checkpoint. Continue within the original restrictions unless the user explicitly changes them. Do not silently waive the original overlap rule or mislabel a paraphrase as the historical original.

## Protected-text handling and incidental exposure

The live edition text was never displayed, searched, quoted, or used for drafting. Live files were read only by the unchanged coordinate-only overlap tool and a count-only structure script. The count script printed chapter/paragraph counts only and did not read titles into the map. The Danish original file is absent at this base; the Danish modern file's counts were recorded without text inspection.

Bibliographic web searches unexpectedly returned short translator-wording snippets before all corresponding translators had been verified. These included Quote Investigator's comparison page, a 1759/1959 comparison in the Langille/Brooks review, Boswell chapter headings in Google Books search results, and one short body-text snippet from the excluded Fleming Online Library of Liberty result. A modern French/English PDF result displayed bibliography, not narrative text. Those results were not opened for translation text, downloaded as baselines, copied into the editions, or used to repair the source. This disclosure records the exposure without repeating the wording. Subsequent drafting relied solely on the visually checked Nourse scan.

Some catalogue IDs proved misleading: the Oxford volume XVIII was dramatic works (*Zara*), and microfilm volumes labelled 1765 print a 1780 title-page date. Raw research downloads are retained and explicitly excluded from the pilot; none was substituted silently for the selected source. Any future selected fallback requires its own full scan verification.

## Structure and integration

The three present live editions inspected by counts alone each have thirty chapters and matching count arrays. `structure-map.json` records those arrays and a provisional proportional mapping for the eight-paragraph Chapter-I pilot. Chapters II–XXX have null new counts/maps. This is not semantically verified saved-place migration and must not be shipped.

No live editions, app files, registry, shared scripts, tests, config, or synced project files were edited. No PR, merge, deploy, narration, generation script, or paid API call was performed. No subagent was used.

Remaining work: settle/select a source that can satisfy the unchanged requirements; transcribe/verify all thirty chapters; write every modern paragraph from that selected source; finish the map; rerun all full-book gates until they pass, without claiming completion from pilot results.
