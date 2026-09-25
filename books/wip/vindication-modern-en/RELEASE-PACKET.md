# Release packet: *A Vindication of the Rights of Woman*, modern-en repair

**Status: content accepted / handed off to Codex. NOT published.** Integration, app verification and serialized release belong to Codex.

## Package

- **Branch:** `claude/sleepy-hamilton-0f1kqi`
- **Commit:** see the handoff message. It is the commit that adds this file, and nothing else on the branch touches paths outside this folder.
- **Package path:** `books/wip/vindication-modern-en/`
- **Candidate:** `candidate.json`, sha256 `6a398f5b8be7c85ad6fafa8d1e414674bcd7f193daf129844b83ada8f9cb056a`
- **Target live path:** `app/public/data/editions/vindication-rights-of-woman-modern-en.json`. Replace it byte-for-byte with `candidate.json`.
- **Expected live pre-image:** `4e7e6143670a4ca29fa6f004587578e56102ac7b2f1b00814ddefb303084ba63`. If main's file differs, stop and reconcile; do not overwrite someone else's newer change.
- **Fidelity anchor (unchanged):** `vindication-rights-of-woman-original-en.json`, sha256 `3e168f00ba7901f8a31cc36902f0046e9555d6fd5245566c437b029331e91aac`
- **Evidence:** `ACCEPTANCE-RECORD.md`, `GATE-OUTPUT.txt`, `STYLE-NOTE.md`, `reviews/`, `changed-paragraphs.json`

## Integration requirements

1. **Structure is unchanged.** It has 15 chapters and 778 paragraphs, with the same chapter numbers and titles and the same per-chapter counts. No position, highlight, note or reading-log migration is needed, and the `aligned: true` flags stay correct. The registry needs no change; `wordCount` stays at about 84k.
2. **Re-run the gate in place** after copying: `python3 books/classify-modern-en.py vindication-rights-of-woman --gate`. The expected result is weighted similarity 0.698, light+mechanical 0/15, identical long paragraphs 1/747, GATE PASS.
3. **Regenerate any derived runtime data** that embeds modern-en text. That covers per-chapter splits, the search index and bundles, if they exist for this book, using the normal tooling.
4. **Narration (Grok streaming).** 752 of the 778 modern-en paragraphs have changed text (coordinates in `changed-paragraphs.json`).
   - Cached speech for those paragraphs must not be served for modern-en. Invalidate by text, language, provider, model, voice and settings under the current cache contract.
   - The 26 unchanged paragraphs may reuse compatible cache entries.
   - Streaming continues as before. Do not queue full-audiobook generation or change voices. Keep legacy assets for rollback.
5. **modern-da is untouched**, and after this change it no longer tracks modern-en. Do not mark it current against the new English. Do not generate a new Danish rendering; Danish is out of scope.
6. **Character cards:** none. The book is `not-started` in `books/characters/library-coverage.md`, so there are no mentions to re-key.
7. **Onboarding, taxonomy and registry metadata:** no changes proposed.

## Open issues carried to Codex / Anders

Details are in `ACCEPTANCE-RECORD.md` under "Open issues".

1. **Probable source misprint, ch7 p138.** "There is reason" should likely be "season". Confirm against a 1792 or 1796 printing and then fix both editions together. Other possible misprints are kept as printed.
2. **Review scope.** An independent sample of 43% of paragraphs, covering every chapter and every flagged passage, was reviewed. A full every-paragraph review and an accessibility read were not done.
3. **No `books/raw/` provenance** exists for this book.
4. **modern-da staleness**, covered in item 5 above.
