# Release packet: *The Iliad*, modern-en repair

**Status: content accepted / handed off to Codex. NOT published.** Integration, app verification and serialized release belong to Codex.

## Package

- **Branch:** `claude/iliad-modern-en`
- **Commit:** see the handoff message (the commit that adds this file; nothing else on the branch touches paths outside this folder).
- **Package path:** `books/wip/iliad-modern-en/`
- **Candidate:** `candidate.json`, sha256 `5719267ee36dca311bb8d74f25ff58994b8dd84fb12cd2f958ece794bb5dc880`
- **Target live path:** `app/public/data/editions/iliad-modern-en.json`. Replace byte-for-byte with `candidate.json`.
- **Expected live pre-image:** `d424a2e68fd2e302781a4f2ecd4ce3f85ff84c7b80f35b066a32f342cd59fa75`. If main’s file differs, stop and reconcile.
- **Fidelity anchor (unchanged):** `iliad-original-en.json`, sha256 `3ba331f36cb935cb861bedb51994a4d410cda83013ba8c63bb04a126bb45e86c`
- **Evidence:** `ACCEPTANCE-RECORD.md`, `GATE-OUTPUT.txt`, `STYLE-NOTE.md`, `reviews/`, `review-fixes/`, `changed-paragraphs.json`, `character-card-impact.json`. `batches/` holds the renderers’ unreviewed output; the candidate is those batches plus `review-fixes/round1.json` and `round2.json` (and Proserpine → Persephone).

## Integration requirements

1. **Structure is unchanged:** 24 chapters, 1,137 paragraphs, identical numbers, titles and per-chapter counts. No position, highlight, note or reading-log migration is needed; `aligned` flags stay correct. Registry unchanged.
2. **Re-run the gate in place:** `python3 books/classify-modern-en.py iliad --gate`. Expected: weighted similarity 0.681, light+mechanical 0/24, identical long paragraphs 3/1,124, GATE PASS. `python3 books/audit-truncation.py iliad en` expects 0 (the script’s hard-coded edition path is a Mac path; run it against the repo copy).
3. **Regenerate derived runtime data** that embeds modern-en text (per-chapter splits, search index, bundles, if any).
4. **Characters:** all modern-en mentions and anchors in `app/public/data/characters/iliad.v1.json` need re-anchoring and refreshed paragraph hashes; see `character-card-impact.json`. Character files were not edited here. Cast data (`iliad-threads.json`) and onboarding are unchanged and still use the same Greek names.
5. **Narration (Grok streaming):** 1,129 of 1,137 modern-en paragraphs changed text (`changed-paragraphs.json`). Cached speech for those must not be served for modern-en; invalidate by text, language, provider, model, voice and settings under the current cache contract. The 8 unchanged paragraphs may reuse compatible entries. Streaming continues as before. Do not queue full-audiobook generation or change voices; keep legacy assets for rollback.
6. **modern-da is untouched**, and no longer tracks modern-en. Do not generate a new Danish rendering.
7. **Onboarding, taxonomy, registry metadata:** no changes proposed.

## Open issues

See `ACCEPTANCE-RECORD.md`, "Open issues" (Butler’s Book 8 argument slip, Alexandrus→Paris decision, garbled source sentences, review depth, possessive style, modern-da staleness, provenance not re-verified).
