# Handoff

STATUS: COMPLETE

Branch: content/replace-the-art-of-war-codex. Base: origin/integration/release-candidate-6, 95837141b. Owned path: books/wip/replace-the-art-of-war/ only. Instruction revision consulted: origin/main 72af4a8be. Explicit assignment controls content authorship, source paths, and scope.

## Deliverables and counts

13 chapters in each edition, 385 paragraphs in each; chapter counts: 21, 17, 23, 19, 20, 31, 31, 16, 60, 33, 72, 18, 24. Original candidate: 8,329 whitespace-delimited words. Modern: 8,284. Minimum paragraph length ratio: 75.76%. Both editions contain zero exclamation marks; per-paragraph preservation passes.

## Final gates

- JSON, chapter/paragraph alignment, nonempty text: PASS.
- Unchanged classifier: PASS, weighted similarity 0.235; 0% light/mechanical chapters; 0% identical long paragraphs; zero truncated quotations and scaffolding.
- Classifier on typography-folded copies: PASS with the same outputs. Source and modern both use straight quotes/apostrophes.
- N=10: original 0/385, modern 0/385: PASS.
- N=8: original 3/385 (0.7792%), modern 0/385: PASS against the assignment's less-than-1% rule. The checker itself exits 1 for any match; its unchanged exit code is recorded without disguising it. The assignment allows these short formulaic eight-word matches.
- Length, exclamations, source apparatus, brackets, non-ASCII/OCR debris and paragraph endings: PASS. Source list and speech lead-ins retain terminal colons; all modern paragraphs end in a sentence terminator.
- Raw gate outputs and edition hashes: qa/final-gates.json and adjacent logs. Folded test copies are in qa/folded/.

## Editorial decisions and limitations

IMPORTANT: original-en contains two deliberate wording departures at 9:31 and 12:8, required to meet the requested original N=8 gate. Those changes follow the assignment's express instruction to re-render flagged paragraphs. Therefore label it an edited Calthrop source, not an exact historical transcription. The complete verbatim wording remains in source/calthrop-verbatim-extracted.json; precise changes are in qa/source-departures.json. No approval of the optional alternative was assumed.

All source paragraphs were read during sentence-by-sentence modern composition. Original extraction was compared in full against the selected Gutenberg section. All 13 chapter boundaries and openings/endings are recorded in qa/source-boundaries.json. Independent scan OCR supports completeness; printed opening, middle sample, ending and title page were visually checked. The printed "frought" is restored at 7:6, excluding the modern transcriber's correction. Footnotes, introductions, Wutzu, advertisements and transcription notes are excluded. Paragraph-final :-- is cleaned to a colon without merging source paragraphs.

Calthrop's unusual readings are retained, including 8:6's assertion about the Nine Changes and Five Advantages, and 7:26's rest/fatigue order. No correction from remembered translations was made. The final modern snake comparison at 11:34 was rewritten after the coordinate-only overlap check flagged its initial wording. No protected reference wording or other translator's wording was accidentally seen.

The initial partial-batch classifier attempt encountered the unchanged classifier's NameError on unequal unfinished chapter counts. Once all chapters were drafted and aligned, both final full-book runs passed without any tooling edits. No semantic review by a separate human or agent is claimed.

## Reader-position integration

structure-map.json maps the 445 old paragraphs to 385 new ones using chapter ordinal and proportional zero-based paragraph position. It contains no protected titles or wording. Original-en, modern-en and modern-da existed with 13 chapters and 445 paragraphs each; original-da was absent. The mapping is approximate, not semantic. Retain old saved coordinates for rollback. Integrator should review character references and exact text cache identities. No application integration, publication, new Danish edition, or audio generation was performed.

## Scope and provenance

Only the assigned package is changed. The overlap checker is an unchanged copy of the explicitly requested tool from origin/claude/busy-fermi-111knc (resolved revision 41dd1ea4d at fetch time). Protected live files were accessed only through that checker and a counts-only structure script. No protected paragraphs were displayed. No Anthropic API spend; the forbidden generator was never run. No deployment, merge or PR.

## SHA-256

- the-art-of-war-modern-en.json: `a19820ebde2ad3a2d0b394cd7dd40e03148584335e46a7846816b352111ce5ce`
- the-art-of-war-original-en.json: `0b646eba758fdd45220cf72d4048b2a6fd0a36e4a2ff8a9f4aeda1ebe5d3f733`
- structure-map.json: `8a21fe20910b320bb93208e8e425383010c0a80e56963b73bd2131ee4a9a141d`
- overlap-check.py: `1adc8cd67d140d4b32ac1f0b2e155db5090d9f36ca967dd9450658b107481508`
