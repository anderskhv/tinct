# Medea replacement handoff

STATUS: COMPLETE — content package only; not integrated or published.

- Branch: `content/replace-medea-codex`.
- Owned path: `books/wip/replace-medea/` only.
- Base: `95837141b` from fetched `origin/integration/release-candidate-6`.
- Instruction revision: remote main `72af4a8bee9de1d16d8f9051863a4f244151770a`; root/book AGENTS, book workflow, README, STRATEGY, books/CLAUDE and workflow boundaries reviewed. Explicit assignment authorizes Codex authorship and the requested overlap checker in this folder, superseding the general lane default.
- No PR, merge, deployment, app/live/registry/config/test/shared-script changes. No Anthropic API calls; generate-editions.cjs never run.

## Final editions

Verified baseline: Arthur S. Way, Macmillan 1894, volume I, Medea printed pp. 61–123. Author death evidence, attribution, retrieval URLs and raw-download hashes: SOURCE.md. Original is extracted from this source; modern is a fresh paragraph-by-paragraph rendering authored in the conversation, not a regex/dictionary rewrite. Batch text files exactly mirror the final modern paragraphs.

| Chapter | Title | Paragraphs |
|---|---|---:|
| 1 | Prologue | 21 |
| 2 | Parodos | 9 |
| 3 | First Episode | 28 |
| 4 | Second Episode | 21 |
| 5 | Third Episode | 65 |
| 6 | Fourth Episode | 31 |
| 7 | Exodos | 63 |

Both editions: 7 chapters, 238 paragraphs, no embedded newlines, empty paragraphs or missing speaker tags. Original 11,827 whitespace-delimited words; modern 12,717. Minimum per-paragraph modern/source ratio: 85.714%. Source exclamations 166; modern 167; every paragraph individually meets or exceeds the source count.

## Last gate run

Complete command outputs: gate-results.txt. Supplemental checks: validation.json.

- JSON/schema, chapter titles/numbers/counts and paragraph alignment: PASS.
- Unchanged classifier: PASS; weighted similarity 0.214, light/mechanical 0/7, identical long paragraphs 0/117, wrapped scaffolding 0, truncated quotations 0.
- Typography-folded scratch pair: PASS, same measurements.
- Exclamation and >=75% word-count gates: PASS in every paragraph.
- N=10 overlap: original 0/238; modern 0/238.
- N=8 overlap: original 1/238 (0.420%), modern 0/238. The original's only short shared run is 9 words in 1.15, independently present in the 1894 source; retained unchanged as the allowed short formula, below the strict 1% ceiling. Protected wording was never printed or inspected. The checker exits 1 for any N=8 hit; the assignment's explicit less-than-1% rule passes.
- Apparatus/odd-character scan: PASS. No square brackets, note headings, replacement characters, zero-width characters, control characters or line/page numerals in speech text. Preserved non-ASCII characters are legitimate diacritics, the œ ligature and em dashes. All paragraphs end in terminal punctuation; quotations are balanced.

## Completeness and editorial review

All 238 source speeches were read for the rendering, including the full messenger report, all choral odes, Medea's changes of mind and the closing exchange. All named people, places, divine invocations and arguments were retained. Source sequence was checked against the 1894 scan OCR; all substantive token differences were apparatus or OCR rather than missing speech. Title page and final printed page were visually checked. Final chorus and all closing exchanges are present. See SOURCE.md and source/ocr-comparison-full.json for extraction adjustments and evidence.

The final source includes the volume's own “empyreal” correction. The scan verified “I bid” at 7.62. Parenthetical stage directions and two terminal dashes were regularized without removing words. The seven-part scheme groups the children's return, Medea's internal struggle and the following chorus into Fourth Episode; Exodos begins with the wait for the messenger. Chorus speeches spanning strophe/antistrophe are single paragraphs, as allowed in the assignment. No modern editorial notes enter the reading text.

No protected live text was opened, read, copied or paraphrased. Only the excluded opening quoted in the user's own assignment was present in the prompt. Live access was confined to counts/newline inspection and the requested coordinate-only overlap checker. No unverified translation wording was accidentally consulted. The modern rendering was based on Way alone.

## Saved-place mapping and integration

structure-map.json maps every one of the 241 old paragraph coordinates to the new structure using chapter-index-preserving proportional counts. It is deliberately labelled low confidence: it cannot establish semantic equivalence, and chapter boundaries may differ. It is a best-effort count-based aid, not an exact quotation/highlight map. It covers both old English editions, which have identical counts. Do not claim exact reader-place preservation from this estimate alone.

All 238 new coordinates in both editions replace the old text. Integration and any character-reference or narration-cache migration belong to a later release task; this package makes no runtime changes. Danish remains untouched and is not certified by this package. Acceptance here means the requested replacement package and its gates are complete, not that protected live editions have been removed from production.

## Final SHA-256

- `editions/medea-original-en.json`: `f988ee4537a1b824f9526c580d8cb1fb7bc11315e16b6aff9177f91c00b5f3bb`
- `editions/medea-modern-en.json`: `573e56ea9bf089db0c9340edd70034a37e78ac4a07e9ca868ff11e5ca96a7e7b`
- `structure-map.json`: `9f3343d5c4f0773de8a94cf6d82a10bb3b80adaef57e1fa63f0a4a942378a7f3`
- `gate-results.txt`: `eb8ef1841faef1606be95cf017c1935d5effe7b21fe34dc7a9e40d1e09fda0fb`
- `validation.json`: `949bc3163f6db8e74a606102eb8112e0e529cad955c1ef2f405e4b3d8a489b44`
- `overlap-check.py`: `1adc8cd67d140d4b32ac1f0b2e155db5090d9f36ca967dd9450658b107481508`
- Unmodified classifier `books/classify-modern-en.py`: `950700285d86e2132cd4067969c68b575c8fb946f3f0fb8c97cae6471896e50b`
