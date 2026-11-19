# A Wonder Book and Tanglewood Tales (Hawthorne) — review record

Reviewers were in-session helper agents (no external API, no paid service); a native Danish reader has **not** read the Danish edition.

## modern-en

- Rendered paragraph for paragraph from `original-en` in bundles of about 2,800 words by separate helper agents under written instructions, each bundle checked mechanically (paragraph count, `\n` counts, quote marks, markers, length, similarity to the source).
- Independent review in packets of about 5,200 words by fresh helper agents who judged every paragraph against its original for faithfulness (no omission, invention, reversal, softening) and for natural modern English. **63 of 1591 paragraphs failed review** and were replaced with the reviewer’s minimal corrections.
- Gate `python3 books/classify-modern-en.py "$PWD/books/wip/wonder-book-and-tanglewood-tales/editions/wonder-book-and-tanglewood-tales" --gate`: **GATE PASS** (weighted similarity 0.647, 0/14 LIGHT/MECHANICAL chapters, 2/1401 identical long paragraphs, 0 wrapped scaffolding, 0 truncated quotations), run on the staged files on 2026-10-21.

## modern-da

- Translated from the accepted `modern-en` (not from the English original) in bundles of about 2,800 words, one helper agent per bundle, under a written translation guide (natural everyday Danish, fixed terms, same verse line counts, »…« marks). Each bundle passed a mechanical check.
- Independent review of every paragraph: **1591 paragraphs reviewed, 296 failed** (about 18 %) and were replaced with the reviewer’s corrected paragraph; ids are in `review/danish-fixed-paragraphs.json`. Typical defects: word order after *så*, gender/agreement, anglicisms and calques, non-words, unmarked English miles, and a few omissions or added details. **The replacements themselves were not independently re-read.**
- Mechanical checks on the final file: same chapters and paragraphs as `modern-en`; `\n` counts equal paragraph by paragraph; no English quote marks, straight double quotes or `--`; dashes spaced.
- Name/term consistency applied by regex after review (see `DANISH-NOTES.md`).

## Open issues (not blockers for handoff, not fixed)

See `DANISH-NOTES.md`. Danish verse is meaning-first and often unrhymed; address forms *du / De / I* vary between passages; some coinages are the helpers’ own.
