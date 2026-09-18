# Helper v7 — restore-safe heading strip

v6 scoring is unchanged. The 0.85 gate, timestamps and emitted source words
do not change. No GPU run ships with this pin.

## Why v7 exists

Canary **35323671028** rejected `hume-enquiry/modern-en/7` on both arms with:

`processing_invariant_error` — `source/acoustic token mapping changed at index 1: source='I'`

That is raised in `trial.restore_source_tokens`, which incrementally re-runs
`clean_text` on source prefixes to prove a monotonic 0-or-1 map onto the
full-paragraph acoustic stream.

Hume ch7 p14 is numbered first-person prose:

`45. I shall add, by way of further confirmation of the foregoing theory…`

- The **full** paragraph is not a heading (219 words).
- The prefix **`45.`** is not a heading.
- The prefix **`45. I`** matches `HEADING_NUMBERED_ALLCAPS` (`\d+\.\s+[A-Z0-9 …]+`).
- v6 `clean_text("45. I")` therefore returns `""`, the prefix map goes
  `['45.']` → `[]`, and restore raises at `source='I'`.

This is a **v6 restore bug**, not bad chapter data. v5 completes the same
paragraph. The same class also crashes v6 restore on the prose fixtures v6
claimed to leave alone (`2. A heavy…`, `WORKING MEN OF ALL COUNTRIES, UNITE!`,
`I. Communism is already…`): a heading-shaped **prefix** of a non-heading
paragraph empties tokens that already mapped.

Tightening one heading regex is not enough. `Chapter`/`Part` prefixes and
3-word ALL-CAPS prefixes hit the same non-monotonic `clean_text`.

## Rule

Heading detection stays a **whole-paragraph** property.

- `clean_text(text)` (default `strip_headings=True`) still empties a
  heading-only paragraph, so manifesto ch4 p21 stays acoustic-empty and
  restores as zero-span source words.
- `restore_source_tokens` re-cleans prefixes with `strip_headings=False`.
- `_mark_structural_cues` still marks a whole-paragraph heading unspoken
  for scoring.

Frozen v6 is left as-is and still raises on Hume p14.

## Not in this pin

`notes-from-underground/modern-en/17` failed the 0.85 gate on ASR near-misses
(`fortnight`/`Fortnite`, `cellar`/`seller`). Those words are in the edition
(p19 `"A fortnight."`; p04/p40–p42 `cellar`). That is ASR vs script, not a
helper bug. Do not add brand/homophone maps. Do not lower 0.85. Park the
chapter; do not re-queue it unchanged.

See `test_normalisation_v3.py` class `HumeRestorePrefix`.
