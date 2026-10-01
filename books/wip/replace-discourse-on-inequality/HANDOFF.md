# Replacement package — incomplete, acceptance conflict

Branch: content/replace-discourse-on-inequality-codex
Base: origin/integration/release-candidate-6 at 95837141bd77d34dd2fdd854e9f82ab44695c0c3, fetched before branching.
Instruction revision: origin/main 72af4a8bee9de1d16d8f9051863a4f244151770a, plus explicit user assignment (which authorizes Codex content authorship and limits all writes to this package).
Owned path: books/wip/replace-discourse-on-inequality/.

## Acceptance conflict requiring a decision

The requested authentic parsed 1761 original itself fails the mandatory zero-overlap test. Last run: 111/216 paragraphs flagged at N=10; 137/216 at N=8. An earlier extraction with the colon-introduced verse separated had 112/217 at N=10; that structural issue is repaired, and only the last counts apply.

This test detects shared wording, not its historical origin. Overlap with a later text does not establish that the older source was copied from that later text. I have not read the protected reference wording. Rewriting the authentic 1761 original to remove these overlaps would make it an adaptation, inconsistent with the requirement to supply the clean parsed free text. I have therefore left its wording intact instead of manufacturing a pass. No STATUS: COMPLETE claim is made.

A clarification has been requested: retain the authentic original and apply strict overlap acceptance to the modern rewrite, or explicitly authorize an adaptation in place of the historical original. The first option is recommended. No permission to relax a gate is presumed.

## Artifacts and counts

- editions/discourse-on-inequality-original-en.json: extracted candidate, 8 chapters, 216 paragraphs, 47,718 whitespace-delimited words.
- dedication-modern-draft.json: fresh sentence-by-sentence Dedication draft, 23 paragraphs, 3,630 words. This is only chapter 1, not a completed modern edition.
- batch-qa/dedication-original-en.json and dedication-modern-en.json: aligned chapter-1 test pair.
- No final editions/discourse-on-inequality-modern-en.json exists; no original text was copied into unrendered slots.
- SOURCE.md and source-manifest.json: rights evidence, exact source URLs, retrieval dates, hashes and transcription decisions.
- structure-map.json: counts-only provisional positional estimates, explicitly low-confidence and not safe for automatic migration. Old EN and modern-DA structures each have 4 chapters with 26, 25, 52, 67 paragraphs. Original-DA file absent at this base. No protected titles or paragraphs were printed or inspected.

New chapter paragraph counts: [23, 13, 1, 1, 7, 51, 59, 61].

## Last gate runs

Full original: JSON valid; no empty or unterminated paragraphs; no square brackets or Textual note; non-ASCII characters limited to Æ, â, æ, é and em dash. Original independence FAIL, as recorded above. Full-book alignment, similarity, length and exclamation gates are NOT RUN / NOT COMPLETE because modern rendering is incomplete.

Dedication batch only: both ordinary and typography-folded unchanged classifier PASS; weighted similarity 0.136; light/mechanical 0%; identical long paragraphs 0%; wrapped scaffold 0; truncated quotations 0. Every paragraph meets the 75% word-count minimum and exclamation-preservation check. N=10 and N=8 both zero of 23 flagged. Logs in batch-qa/; dedication-validation.json is the structural/length/punctuation result. These are batch results, not whole-book acceptance.

Independent reviewer read all 23 paragraphs, then rechecked rewritten paragraphs. Corrected its findings: preserve conditional happiness in paragraph 20; retain the source's gendered effeminacy criticism in paragraph 21; avoid narrowing strictness and indulgence merely to judgment in paragraph 19. Latest p19 uses the reviewer's proposed wording. No other material fidelity issues were reported. Further chapters have not been reviewed or rendered.

## Exposure disclosure

A broad attribution search accidentally returned snippets of Ian Johnston's 2013 revision of his 2006 translation at https://web.viu.ca/johnstoi/rousseau/seconddiscourse.htm . Some English wording in those snippets was visible. That page was not opened, downloaded, copied or used as a source. The search also returned bibliographical material from a Cole collection, but no Cole passage from the Discourse was deliberately opened or read. Searches were subsequently narrowed to edition/authority records. Existing protected app editions were accessed only by the required coordinate-only overlap tool and counts-only structure inspection. No protected reference wording was exposed through those tools.

## Remaining work

Resolve the original-edition acceptance contradiction. Then verify the full extraction against scan/transcription boundaries, render chapters 2–8 (193 paragraphs) sentence by sentence, preserve notes and Latin quotations, review and iterate all gates, and rerun the whole-book final gates. Do not mark complete until the agreed criteria genuinely pass.

No deployment, merge, PR, narration, external generation API or generate-editions.cjs run. All tracked additions confined to the owned folder. No app, registry, live edition, shared script, test or configuration edits.

## Candidate hashes

- Original SHA-256: `e4fab465b31c21985b641996bfd3b0fe117ec691e335159a96ccdc54512e1cbe`
- Dedication draft SHA-256: `4c4a96020222b3585318fd4de1c8f4672927ba35dd17539349f91f8b7ea69fe7`
- Overlap tool SHA-256: `1adc8cd67d140d4b32ac1f0b2e155db5090d9f36ca967dd9450658b107481508`
- Structure map SHA-256: `654862e771717f18ec93bb190436213c1986f16fc0e6c617acabb345535852d0`
