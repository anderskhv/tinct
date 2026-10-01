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

Further fallback research on 2026-10-01 found a 1920 Smollett text explicitly described as specially revised by James Thornton; his death date is not independently cleared. The 1947 John Butt and 2006 Burton Raffel editions are ineligible under the assignment. The Boswell lead was a false bibliographical trail and has no verified Candide translation. These searches did not establish an additional eligible source.

The Edinburgh anonymous 1759 edition is a new eligible pre-1800 lead, but its preliminary first-chapter OCR sample fails at N=10 (2/3) and N=8 (3/3). The 1898 Walter Jerrold edition does not identify its translator and is not rights-cleared. A stronger lead is the 1897–1900 William Walton collection: its HathiTrust record credits Walton as translator, public-domain scans exist, and independent Century Association and Library of Congress records date him to 1843–1915. HathiTrust's one-page text-only viewer loaded in the browser, but its notice says not to save or redistribute the file; no Walton narrative text has been read or downloaded, so overlap remains untested. Further checks found a Google Books full-view record for Volume II, not Volume III, and the NYPL digital item is one illustration rather than page scans of the text. NYPL confirms the three-volume extent and Walton attribution, but offers no text pages for this set. Nourse remains the only source used in the pilot and fails the unchanged original overlap gate 8/8 at both N=10 and N=8. The package is incomplete; do not claim the source blocker is fixed unless a permitted, paragraph-screenable Walton Volume III or another eligible source passes.

## Further source screening after the previous checkpoint

The 1779 anonymous London edition, *Candidus; or, All for the Best*, is listed by Wellcome as “Newly translated from the French of M. de Voltaire” and dated 1779: https://wellcomecollection.org/works/hf429a5t. Its separate Part I scan/OCR is Internet Archive item `bim_eighteenth-century_candidus-or-all-for-th_voltaire_1779`. A conservative OCR-block screen (Part I only; spurious Part II excluded) covered 437 blocks and 35,247 words. It flagged 54/437 at N=10 and 118/437 at N=8. Chapter I alone passed (0/17 OCR blocks at both thresholds), which is only a pilot and does not validate the rest of the book. The 1760 Cooper and 1773 Edinburgh scans each produced an N=10 flag in a single chapter-wide screening unit (965 and 1,998 words, respectively); these are coarse rejection screens, not paragraph-gate outputs.

The 1888 Routledge *Candide* was considered but rejected before source use because Henry Morley is credited with an introduction only. George Saintsbury's contemporary *Life of Tobias George Smollett* says the translation in Morley's Universal Library is tempting to attribute to Smollett but that there is no proof and the attribution is unlikely. This does not clear an anonymous post-1800 translation. A brief search-result excerpt was visible before this attribution research was complete; it was not copied, transcribed, or used in either edition.

The 1945 A.B. Walkey lead might refer to Arthur Bingham Walkley (1855–1926), but no authority links the translation credit to him. The nearby 1922 catalogue record for *The History of Candide* says “Introduction signed: A.B. Walkley”; that is not translation evidence. The lead remains uncleared and no text was retrieved.

This expands the failed/ineligible list without changing the acceptance decision. Every rights-eligible candidate screened so far fails the original-text overlap rule; Walton remains the only identified rights-cleared candidate whose source overlap has not yet been tested. The package remains incomplete. No protected live text was viewed or read; the live files were accessed only through the unchanged coordinate-only checker.
