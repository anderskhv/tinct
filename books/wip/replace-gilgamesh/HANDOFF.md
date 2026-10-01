# Handoff — complete

Muss-Arnolt (1901) is the approved base. Thompson remains rejected because its complete edition credits Johannes Friedrich (d. 1972). Contributor date evidence and source extraction details are in SOURCE.md.

The current prompt from `origin/claude/busy-fermi-111knc:books/wip/replacement-prompts/06-gilgamesh.md` exempts authentic public-domain `original-en` from gate (d). The exact branch version of `overlap-check.py` is included. It was run only on `modern-en`, against both live English references, with `--allow` pointing to this package's `original-en`.

Both editions contain 12 tablets and 75 aligned paragraphs. Per-tablet paragraph counts are 2, 11, 2, 5, 2, 8, 1, 2, 5, 7, 22 and 8. Tablet VII contains its printed catchword only; Tablets IV, VII and VIII have sparse fragments in this source selection. The source's lost lines remain marked as printed; editorial commentary was not turned into source text.

Final gates (`gates-last-run.txt`):
- Raw classifier: PASS; weighted similarity 0.365; 0/12 light or mechanical; 0/71 identical long paragraphs; no truncated quotations.
- Typography-folded classifier: PASS; same metrics.
- Modern-only overlap: N=10 0/75; N=8 0/75 (0%, below 1%).
- JSON structure/alignment: 12 tablets; 75 paragraphs; no empty paragraphs; every modern paragraph meets the 75% word floor and preserves per-paragraph exclamation counts; terminal punctuation and OCR-character checks pass.

`structure-map.json` uses only chapter and paragraph counts from protected editions; its proportional within-tablet paragraph mappings are marked low confidence. No protected text was read outside the authorized coordinate-only overlap tool and count-only mapping. No live edition, app, registry, script, test, or configuration was edited. `generate-editions.cjs` was not run; no PR was created.

During the superseded Thompson investigation, OCR wording from a passage credited to a Hittite translator was seen before the following attribution disclosed Friedrich. A scan batch also displayed that passage and the start of the next credited section. This exposure is recorded per the task rule. No Thompson wording was carried into the accepted editions; rejected drafts and raw Thompson files were removed from the current package. Earlier commits on this branch retain those superseded research artifacts. No Colavito text or website, Heidel, Sandars, George, Mitchell, or other modern translation was consulted.

SHA-256 values for final editions, map, gates and checker are in artifact-hashes.json. Raw download hashes and retrieval URLs are in source/download-manifest.json.
