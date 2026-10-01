# Middlemarch — content package merged (Claude, 2026-09-30)

- original-en: Gutenberg 145, 88 flat units (Prelude 0, chapters 1–86, Finale 87), 4,674 paragraphs.
- modern-en: merged from parts mm-a (0–12), mm-b (13–26), mm-c (27–37), mm-c2 (38–40), mm-d (41–54), mm-e (55–68), mm-f (69–87). 88 chapters, 4,674 paragraphs, aligned with original-en.
- Whole-book gate: PASS (weighted similarity 0.479; light+mechanical 0/88; identical long paragraphs 36/4078 = 0.9%; scaffolding 0; truncated quotations 0).
- Onboarding and characters proposal from session mm-f. Independent editorial review: PENDING. Published: NO.

## Release assets — 2026-10-01

- Branch: `content/release-assets-middlemarch-codex`; base `8cfe39e709250a7c53942dcb6a582b360d132335` (`origin/integration/release-candidate-2`, fetched).
- STAGED, not public. Current live numbering supersedes historical source numbering above: Prelude 1; remaining units 2–87; Finale 88.
- Item 1 COMPLETE: 21 character records in both editions; 6,483 original / 6,113 modern mentions; eight paragraph-end spoiler gates per edition.
- Verification: character-service suite 497/497 PASS (6 files); direct Middlemarch runtime verification PASS with in-memory registration only; hashes, UTF-16 anchors and gate boundaries PASS.
- Generic baseline compiled, then reviewed assembly via `build_reviewed.compile_package` and the per-book `bind` function. Final asset is the reviewed assembly.
- Items 2–4 pending. No shared registry changes, publication, deployment, PR, narration or API generation.
