# The Wind in the Willows (Grahame) — review record

Reviewers were in-session helper agents (no external API, no paid service). A native Danish reader and a human English editor have **not** read these editions.

## modern-en

- Rendered paragraph for paragraph from `original-en` in 27 bundles of at most about 2,800 words by separate helper agents under written instructions; each bundle was checked mechanically (paragraph count, `\n` counts, `_` and curly-quote counts, length, similarity to the source).
- The first assembled file missed the similarity gate narrowly (weighted similarity 0.752 against the 0.75 limit). The 323 paragraphs closest to Grahame’s wording were re-rendered from the original by 11 further helper agents, with a stricter per-paragraph check.
- Independent review of every paragraph in 29 packets of about 4,200 words (original plus rendering) by fresh helper agents, for faithfulness (no omission, invention, reversal, softening, wrong referent), natural modern English and mechanics. **44 of 916 paragraphs failed** and were replaced with the reviewer’s minimal corrections (ids in `english-fixed-paragraphs.json`). Typical defects: invented details, lost puns and rhymes in Toad’s songs, wrong referents. **The replacements themselves were not independently re-read.**
- Gate `python3 books/classify-modern-en.py "$PWD/books/wip/wind-in-the-willows/editions/wind-in-the-willows" --gate`: **GATE PASS** (weighted similarity 0.621, 0/12 LIGHT/MECHANICAL chapters, 1/806 identical long paragraphs, 0 wrapped scaffolding, 0 truncated quotations), run on the staged files after the review fixes on 2026-11-19.

## modern-da

- Translated from the accepted `modern-en` (not from the original) in 27 bundles by separate helper agents under a written translation guide (natural everyday Danish, fixed terms, same verse line counts, »…« marks). Each bundle passed a mechanical check.
- Independent review of every paragraph in 30 packets: **916 paragraphs reviewed, 177 failed** (about 19 %) and were replaced with the reviewer’s corrected paragraph (ids in `danish-fixed-paragraphs.json`). Typical defects: gender and agreement errors, non-words, calques and anglicisms, plain “mil” for English miles, address forms, a few reversals or lost details. **The replacements were not independently re-read.**
- Mechanical checks on the final file: same chapters and paragraphs as `modern-en`; `\n` and `_` counts equal paragraph by paragraph; no English quote marks, straight quotes or `--`; dashes spaced. Three paragraphs (6:22, 9:22, 12:1) have a different number of » and « than the English has “ and ” because the original’s own quotation marks are unmatched there.

## Open issues (not blockers for handoff, not fixed)

See `DANISH-NOTES.md`. No acclaim quote, characters or threads; onboarding is English only.
