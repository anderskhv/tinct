# Grimms’ Fairy Tales — review record

Reviewers were in-session helper agents (no external API, no paid service); a native Danish reader has **not** read the Danish edition.

## modern-en

- Rendered paragraph for paragraph from `original-en` in bundles of about 2,800 words by separate helper agents under written instructions, each bundle checked mechanically (paragraph count, `\n` line counts, quote marks, markers, length, similarity to source).
- Independent review in packets of about 5,200 words by fresh helper agents who judged every paragraph against its original for faithfulness (no omission, invention, reversal, softening) and for natural modern English. **89 paragraphs failed review** and were replaced with the reviewer’s minimal corrections. Replacements that restored single quotes inside verse were converted back to curly doubles.
- Consistency pass (US spelling, name swaps) and re-assembly.
- Gate `python3 books/classify-modern-en.py "$PWD/books/wip/grimms-fairy-tales/editions/grimms-fairy-tales" --gate`: **GATE PASS** (weighted similarity ≈ 0.598, 0 LIGHT/MECHANICAL chapters, 0 identical long paragraphs, 0 wrapped scaffolding, 0 truncated quotations), re-run on the staged files on 2026-10-19.

## modern-da

- Translated from the accepted `modern-en` (not from the English original) in bundles of about 2,800 words, one helper agent per bundle, under `TRANSLATE-DA-INSTRUCTIONS` (natural everyday Danish, fixed terms, same verse line counts, »…« marks). Each bundle passed a mechanical check.
- Independent review of every paragraph: **902 paragraphs reviewed, 108 failed** (about 11 %) and were replaced with the reviewer’s corrected paragraph; ids are in `review/danish-fixed-paragraphs.json`. Typical defects: word order after *så*, gender/agreement, anglicisms and calques, non-words, and a few omissions or added details. **The replacements themselves were not independently re-read.**
- Mechanical checks on the final file: same chapters and paragraphs as `modern-en`; `\n` counts equal paragraph by paragraph; no English quote marks, straight double quotes or `--`; dashes spaced.
- Name/term consistency applied by regex after review (see `DANISH-NOTES.md`).

## Open issues (not blockers for handoff, not fixed)

See `DANISH-NOTES.md`. In short: Danish verse is meaning-first and often unrhymed; the address forms *du / De / I* and the royal vocatives *Herre / Sire* vary between passages in the Arabian Nights; some folk-tale coinages are the helpers’ own.
