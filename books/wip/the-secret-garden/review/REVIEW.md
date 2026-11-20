# The Secret Garden (Burnett) — review record

Reviewers were in-session helper agents (no external API, no paid service). A human English editor has **not** read this edition.

## modern-en

- Rendered paragraph for paragraph from `original-en` in bundles of at most about 3,000 words by separate helper agents under written instructions (modern clear English for a 12-year-old; sentences under about 30 words and never over 55); each bundle was checked mechanically (paragraph count, `\n` counts, `_` and curly-quote counts, sentence length, similarity to the source).
- Independent review of every paragraph in 24 packets by fresh helper agents, for faithfulness (no omission, invention, reversal, wrong referent), natural modern English and mechanics. **34 of 2,132 paragraphs failed** and were replaced with the reviewer’s minimal corrections (ids in `english-fixed-paragraphs.json`). Typical defects: invented or dropped details, garbled phrases, over-long sentences. **The replacements were not independently re-read.**
- Gate `python3 books/classify-modern-en.py "$PWD/books/wip/the-secret-garden/editions/the-secret-garden" --gate`: **GATE PASS** (weighted similarity 0.736 against the 0.75 limit), run after the review fixes on 2026-11-19.
- Sentence scan (own Python check): no sentence over 60 words in the final edition.

## Gates run

```sh
python3 books/classify-modern-en.py "$PWD/books/wip/the-secret-garden/editions/the-secret-garden" --gate   # GATE PASS (0.736)
for f in books/wip/the-secret-garden/editions/*.json books/wip/the-secret-garden/onboarding/*.json; do python3 -m json.tool "$f" >/dev/null; done
```

## Remaining issues

- No human editor read; reviewer replacements were not re-verified.
- No acclaim quote, characters or threads; onboarding is English only.
- Yorkshire dialect is mostly standardized in the modern edition.
