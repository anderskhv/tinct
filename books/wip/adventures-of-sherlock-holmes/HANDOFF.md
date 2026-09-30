# NOT READY — resumable content package

Repository: anderskhv/tinct
Branch: content/sherlock-adventures-codex
Instruction/base revision: ab3cc43f2687e6682833db6a66182d150788ffa4
Source checkpoint: 8f8427c9
Two-story checkpoint: cd6b55f3

Owned content paths only:
- books/wip/adventures-of-sherlock-holmes/
- books/raw/adventures-of-sherlock-holmes/

## Resume point

Resume modern-en at **story 3, A Case of Identity, paragraph 1**. Stories 1 and 2 are complete. Stop here at a chapter boundary under the request's token-limited checkpoint rule; do not fill the remaining chapters with original text or summaries. Stories 3–12 are absent from the modern edition, deliberately making the whole-book structure gate fail.

Read the original paragraph in full and render it sentence by sentence. Preserve one paragraph per source paragraph, every deduction, named detail, period assumption, and Watson's narrative voice. Require at least 75% of the source word count per paragraph as well as per story. No regex, dictionary substitutions, or mechanical passes for modernization. The JSON chunks under rendering/ are authored content checkpoints, not scripts; the edition JSON is the authoritative assembled candidate. Keep both consistent when repairing.

Next milestone: complete story 3 (or 4), create an exact completed-story QA snapshot pair containing stories 1–3 (or 1–4), run the existing classifier against its absolute prefix and push. Continue in groups of 3–4 stories. The first scheduled 3–4-story batch has not yet been reached; the two-story pass is an interim checkpoint only. Never claim the snapshot pass is the full-book pass.

The classifier checks total chapter/paragraph alignment before applying --chapters, so a 12-story original and 2-story partial modern file cannot pass even with --chapters 1-2. QA snapshot originals are exact subsets of the authoritative original; they are not substitutes for the full book.

## Source and structure

Project Gutenberg #1661, not #48320. Exact raw bytes and rights evidence are in books/raw/adventures-of-sherlock-holmes/SOURCE.md. Title/Author header verified. Source first committed and pushed before modern rendering. Original has 12 flat story chapters, 2,527 paragraphs, 104,347 whitespace-counted words. The existing English-original jekyll-and-hyde edition supplies the JSON shape.

Only three standalone internal Roman-numeral divisions in the first story were dropped. Chapter labels 7–12 omit the repeated “The Adventure of” prefix for concise titles. SOURCE-REVIEW.json preserves all literal source headings, exact reading boundaries, and independent review evidence. Every retained source paragraph maps one-to-one to original-en; no live reader positions exist to migrate for this new ID.

## Current evidence

- Original: independent source comparison passed for all 12 stories and 2,527 paragraphs.
- Modern story 1: 259 paragraphs, 7,924 / 8,518 source words.
- Modern story 2: 215 paragraphs, 7,939 / 9,105 source words.
- All completed paragraphs meet >=75%; full coordinates in qa/alignment-and-length.json.
- Completed-story similarity gate PASS: weighted 0.480, zero LIGHT/MECHANICAL stories, 1/255 identical long paragraphs, no wrapped scaffolding or truncated quotations.
- The single unchanged long paragraph is the royal letter in story 1 paragraph 22, whose word order is crucial evidence. Other literal literary quotations and names stay intact.
- Whole-book gate FAIL: 12 versus 2 chapters. Required story 3–4 batch gate pending.
- Original chronology inconsistencies and historical stereotypes remain; no silent editorial correction.
- Hashes: MANIFEST.json pins the exact content artifacts. No accepted whole-book modern candidate hash exists yet.

## Supporting proposals

Onboarding has About, exactly three whyItMatters entries, four reading angles, and seven cast entries. Acclaim is omitted. Characters/proposal.json supplies 23 selected identities and spoiler/alias decisions, not generated runtime data or an exhaustive mention inventory. Taxonomy.md proposes an accurate short-fiction/detective classification; the present Novels house and novel-only shelf labels need a separate integration decision. No invented canon/list membership.

## Remaining acceptance and integration

1. Render and review stories 3–12; recheck all repaired passages independently.
2. Pass 3–4-story gates and the full-book gate against the final absolute staged prefix. Finish completeness, alignment, length, name/detail and manual editorial reviews.
3. Refresh all hashes, changed paragraph coordinates and review records after edits. Update onboarding openingText only from the accepted opening if integration requires it; no scaffold opening is supplied now.
4. Resolve taxonomy placement and complete/validate runtime character coverage and reveal points under a separate integration assignment. No threads artifact is included; assess whether cross-story thread content is useful during acceptance, without creating app behavior.
5. Only after content acceptance may an authorised integration task copy accepted editions/onboarding, register the book, set defaults and true alignment flags, validate character links and current narration eligibility/cache keys, and run required app/release verification. This task grants no publication or deployment authorisation.

English content only. No Danish, narration generation, provider calls, Anthropic API, app edits, registry edits, scripts/config changes, merge to main, deploy, publication, or production asset uploads.
