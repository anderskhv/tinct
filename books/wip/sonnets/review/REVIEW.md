# Shakespeare's Sonnets — review record

Reviewers were in-session helper agents (no external API, no paid service). No human editor and no native Danish reader has read these editions.

## modern-en
- Rendered from `original-en` in bundles of about 3,000 words under a written No Fear–style instruction; each bundle passed a mechanical check (paragraph count, speaker tags preserved, bracketed stage directions, no underscores or line breaks, curly-quote counts, ≥70% length, per-paragraph similarity ≤0.8, sentences ≤55 words).
- Independent review of every paragraph against the original in 6 packets: **5 of 308 paragraphs failed** and were replaced with the reviewer's minimal correction (ids in `english-fixed-paragraphs.json`): misread Elizabethan grammar, lost puns, reversed meanings, garbled sentences. Replacements were not re-read.
- Gate `python3 books/classify-modern-en.py "$PWD/books/wip/sonnets/editions/sonnets" --gate`: **GATE PASS** (weighted similarity 0.396).

## modern-da
- Translated from `modern-en` in bundles under a written guide (idiomatic modern Danish, du/De by rank, English-form names, Danish role tags per tagmap, »…«, spaced dashes); each bundle passed a mechanical check.
- The Danish was drafted before the English review fixes; the Danish review packets were built against the final English, and reviewers were told to bring any paragraph that followed older English wording into line.
- Independent review of every paragraph in 6 packets: **43 of 308 paragraphs failed** and were replaced (ids in `danish-fixed-paragraphs.json`): gender/agreement, calques, non-words, du/De slips, a few older-English carry-overs. Replacements were not re-read.

## Remaining issues
- No human editor or native Danish read. Reviewer replacements not re-verified.
- No acclaim quote; cast and angles written for onboarding but not fact-checked by a human.
