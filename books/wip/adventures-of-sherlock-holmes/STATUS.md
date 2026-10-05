# READY — content package

- Original English: complete; 12 stories, 2,527 paragraphs, 104,347 words. Gutenberg #1661 Title/Author header, source bytes, openings/endings and rights evidence recorded.
- Modern English: all 12 stories independently accepted; 2,527 aligned paragraphs, 88,823 words. Every paragraph retains at least 75% of source words.
- Whole-book gate PASS: weighted similarity 0.484; zero LIGHT/MECHANICAL; 1/1,484 identical long paragraphs; no scaffolding or quotation-truncation flags.
- Batch gates PASS: 1–4, 3–6, 5–8, 7–9, 9–11, 10–12. Checkpoints pushed after gates. Historical snapshots retain their checkpoint text; the authoritative editions and final 10–12 snapshot include all final repairs.
- Onboarding: About, exactly 3 whyItMatters, 4 reading angles, 7 cast entries; acclaim omitted.
- Characters: accepted selected 23-identity proposal. Taxonomy: proposal only. Runtime generation and placement decisions belong to separate integration work.
- Content resume point: none. No unresolved editorial findings.
- Accepted hashes: MANIFEST.json. Alignment, lengths and changed paragraph coordinates: qa/alignment-and-length.json. Integration instructions: HANDOFF.md.
- Content branch only: no app, registry, live edition, scripts or config changes; no deployment, publication, narration generation or Anthropic API use.

## 2026-10-05: release assets completed and independently accepted

- **Branch:** `claude/sherlock-adventures-content`.
- **Characters:** 160 cards per edition, with 1,870 original and 1,863 modern UTF-16 mentions. Disguises, culprits and outcomes are gated at paragraph end. The six editorial checks are recorded in `books/characters/adventures-of-sherlock-holmes/README.md`. Revision `2026-10-05.2`.
- **Threads:** 106 characters and 129 story summaries, setup-only so the cast list is spoiler-safe.
- **Onboarding additions:** `openingText`; one verified primary-source acclaim (Stevenson to Doyle, 1893); recalibrated `whyItMatters`.
- **Introduction:** intro data, preface (160 words, `e94dfde2…4a0c`), hook, manifest entry, audio-eligibility and `characterReleases` snippets in `release/`.
- **Independent review:** ACCEPTED. 89 findings with no blockers; 87 resolved and 2 justified. The 4 recheck issues are fixed. See `EDITORIAL-FIXES.md` and `qa/character-review/`.
- **Gates:** all pass. Rebuild `--check`; app `verifyCharacters` (1,036 checks); vitest 514/514; JSON; whole-book gate 0.484.
- **Not yet done:** integration into `app/` paths, registry and shared files, and publication. These are listed in `release/HANDOFF.md`.
