# wh1 — Chapters I–XI

## Scope and validation

`parts/modern-en.wh1.json` is the authoritative rendering produced by this session. It has actual chapter numbers 1–11, no sections and no placeholders. The former partial `editions/wuthering-heights-modern-en.json` has been moved here to prevent it being mistaken for a complete edition. Historical review excerpts are audit snapshots only.

Full original: 34 chapters / 1,931 paragraphs. wh1: 11 chapters / 674 paragraphs / 37,860 words, against 40,510 source words in this range. All per-paragraph word ratios are at least 0.75. All source exclamation counts are preserved or exceeded per paragraph. Chapter numbers, titles and paragraph counts agree. Earlier passing Chapters 1–8 were not re-read or revised after the pace update; programmatic equality against their committed version passes.

## Blocking gate

`python3 books/classify-modern-en.py "$PWD/books/wip/wuthering-heights/review/batch-1-11/wuthering-heights" --gate --chapters 1-11`

Run once after completing the assigned range. Exit status 0: PASS, weighted similarity 0.487, light/mechanical 0/11, identical long paragraphs 1/529, no scaffolding or truncated quotations. The unchanged classifier accepts an absolute filename stem, so it reads explicit range excerpts without modifying scripts or writing live paths. The modern excerpt is byte-identical to the part. The one unchanged long paragraph is the quoted song at 9:23, retained as a literary quotation.

## Drafting review, latest chapters

Chapters 9–11 were read sentence by sentence while composing: Hindley’s threats and Heathcliff’s instinctive rescue; the exact point at which Heathcliff leaves Catherine’s confession; Nelly’s altered account of that point to Catherine; Catherine’s heaven dream, Milo allusion, foliage/rock distinction and “I _am_ Heathcliff!”; Heathcliff’s unexplained transformation; Catherine’s warning to Isabella; Joseph’s gambling account; Hareton’s learned speech; the three-way confrontation; and Nelly’s withholding of Catherine’s warning. The narration’s judgments and conjectures remain attributed to its narrators rather than converted into objective knowledge.

Joseph retains Yorkshire vocabulary, pronouns and syntax while opaque phonetic spellings become readable. Hareton’s childhood speech remains distinct. Lockwood’s self-regard and Nelly’s retrospective justifications are retained. No Anthropic or other generation API was used.

## Limits

A passing classifier is not independent editorial approval. Claude must assess fidelity and readability, and reconcile dialect policy across the separately rendered parts. Chapters 12–34 were neither rendered nor changed by this session after the ownership update. No whole-book pass or publication is claimed.
