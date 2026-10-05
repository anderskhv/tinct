# Sherlock Holmes release assets: STAGED; content ACCEPTED (independent review 2026-10-05)

- **Base:** `origin/main` at `df9f6d40f96bb4153285cf601fe4e4a7b1e30a7c`.
- **Live editions:** bytes unchanged.
- **Characters:** 160 cards per edition; 1,870 original and 1,863 modern mentions. Revision `2026-10-05.2`; asset SHA-256 `e21054b8…f30d3`.
- **Verification:**
  - Deterministic rebuild and `--check`.
  - App `verifyCharacters` in memory: both editions PASS, drift is rejected, 1,036 gate checks.
  - Vitest 514/514.
- **Threads:** 106 characters and 129 setup-only story summaries, keys 1–12.
- **Onboarding:** `openingText`, Stevenson acclaim, recalibrated `whyItMatters`, plus two corrections to pre-existing fields.
- **Intro:** intro data, preface, hook, manifest, audio-eligibility and `characterReleases` snippets.
- **Independent review:** ACCEPTED. See `../EDITORIAL-FIXES.md` and `../qa/character-review/`.
- **Resume point:** none for content. Integration and publication belong to Codex (see `HANDOFF.md`).
- **Scope kept:**
  - No app, registry, live-data, shared-file, test or config edits.
  - No deploy, merge, PR, narration or Anthropic API use.
