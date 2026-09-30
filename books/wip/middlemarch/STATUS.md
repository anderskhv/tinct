# Middlemarch — session A

ORIGINAL READY

Original commit: `57bc3147ee91befe5385eb31bbde0a55bc0c58ad`
Modern session-A content commit: `0214df1ae4f5bd0273e5475c1ca6f2528f8c1e10`
Branch: `content/middlemarch-codex-a`

## Completed

- `SOURCE.md`: Gutenberg 145 Title/Author validated; provenance, source SHA-256, and chapter ranges for all eight Books recorded.
- `editions/middlemarch-original-en.json`: complete original, 88 flat units (Prelude number 0, chapters 1–86, Finale number 87), 4,674 paragraphs; empty sections. Book names in chapter titles; epigraphs retained with chapters; boilerplate excluded.
- Full original reading text matches source ignoring whitespace; Roman chapter labels independently verified sequential I–LXXXVI. Raw download retains source bytes, including CRLF/trailing whitespace.
- `parts/modern-en.mm-a.json`: Prelude + chapters 1–12, 13 units, 801 paragraphs. Real source numbers 0–12 and matching titles. Sentence-by-sentence rendering; no placeholder chapters. Every paragraph retains at least 75% of source word count; source exclamation-mark counts preserved. Foreign-language epigraphs retained.
- Both edition JSON files parsed successfully; complete paragraph alignment checked.

## Gate

PASS on Prelude + chapters 1–12 (reading-unit indices 1–13), using the unchanged repository classifier and absolute-path baseline/candidate excerpts. One batch gate for this session's 12 numbered chapters plus Prelude.

- Weighted similarity: 0.517 (limit 0.75).
- Light/mechanical: 0/13.
- Identical long paragraphs: 1/630 (0.2%; foreign-language epigraph).
- Wrapped scaffolding: 0; truncated quotations: 0.
- Full command/output: `qa/mm-a-gate.txt`.
- Source/candidate/tool hashes, counts, structural checks: `qa/mm-a-validation.json`.
- Modern part SHA-256: `66bb5228646eda5606065ada307301b00a38c5e9029fe41f411c0f943bef1966`.

## Handoff / remaining work

Session A's assigned rendering is complete. Modern-en whole book: NOT READY. Resume whole-book rendering at Chapter 13 (Book II: Old and Young); chapters 13–86 and Finale are outside session A. Assemble the complete modern edition only after all parts exist, then run the whole-book gate and editorial acceptance review. No integration or publication performed. Only session A's Middlemarch content/source/status/gate files were changed.
