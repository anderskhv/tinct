# Release packet: *The Brothers Karamazov*, modern-en repair

**Status: content accepted / handed off to Codex. NOT published.** Integration, app verification and serialized release belong to Codex.

## Package

- **Branch:** `claude/brothers-karamazov-modern-en`
- **Commit:** the commit that adds this file; its hash is given in the hand-off message. Nothing on the branch touches paths outside this folder.
- **Package path:** `books/wip/brothers-karamazov-modern-en/`
- **Candidate:** `candidate.json`, sha256 `0426f2f3629b48a14b9363add7bcc4e7be633b8ac4bdfc29557713bb563aaf0f`
- **Target live path:** `app/public/data/editions/brothers-karamazov-modern-en.json`. Replace it byte-for-byte with `candidate.json` (same serialization: indent 2, `ensure_ascii=False`, no trailing newline).
- **Expected live pre-image:** `5b2d957d5fdca2f1c6374afe61fd7a3e72e2316f06f5bc1f5796939485f91378`. If main's file differs, stop and reconcile; do not overwrite a newer change.
- **Fidelity anchor (unchanged, served original-en):** `app/public/data/editions/brothers-karamazov-original-en.json`, sha256 `b8ada3e43c6f997a0d55f77e1f22bb769f021071aaeff3d0cb25dcd1acb80736`
- **Instruction revision:** `origin/main` `791d2802`
- **Evidence:** `ACCEPTANCE-RECORD.md`, `GATE-OUTPUT.txt`, `STYLE-NOTE.md`, `reviews/` (76 first-round reviews with `fixes*.json`, three R2 verification records, the R3 recheck, the accessibility read, the four applied-fix logs, and 125 renderer notes), `changed-paragraphs.json`, `character-card-impact.json`

## Integration requirements

1. **Structure is unchanged.** 96 chapters and 5,836 paragraphs, with the same chapter numbers, titles, `section` labels and per-chapter paragraph counts as the served editions. No saved position, highlight, note or reading-log migration is needed, and the `aligned: true` flag stays correct. The registry needs no change; `wordCount` stays at about 349k (the candidate has 343,894 words).
2. **Re-run the gate in place** after copying: `python3 books/classify-modern-en.py brothers-karamazov --gate`. The expected result is weighted similarity 0.690, light+mechanical 0/96, identical long paragraphs 21/4,040, GATE PASS.
3. **Regenerate any derived runtime data** that embeds modern-en text (per-chapter splits, search index, bundles, SEO pages that quote the edition), if they exist for this book, using the normal tooling.
4. **Narration (Grok streaming).** 5,476 of the 5,836 modern-en paragraphs have changed text. Their coordinates are in `changed-paragraphs.json` (`changedParagraphsByChapter`: file chapter number → 0-based paragraph indices).
   - Cached speech for those paragraphs must not be served for modern-en. Invalidate by text, language, provider, model, voice and settings under the current cache contract.
   - The 360 unchanged paragraphs (short lines and headings) may reuse compatible cache entries.
   - Streaming continues as before. Do not queue full-audiobook generation or change voices. Keep legacy assets for rollback.
5. **modern-da is untouched.** After this change it no longer tracks modern-en. Do not mark it current against the new English. Do not generate a new Danish rendering; Danish is out of scope.
6. **Character cards (required, they ship with this repair).** `books/characters/brothers-karamazov/characters.v1.json` pins the live modern-en (`sourceSha256` `5b2d957d…`, `paragraphHashes`) and anchors 4,696 modern-en mentions by chapter, paragraph and UTF-16 offsets. `character-card-impact.json` has the details, and the counts are:
   - **72** mentions are in unchanged paragraphs and stay valid.
   - **902** are in changed paragraphs but keep their offset by chance. Their paragraph hashes still change.
   - **3,439** move. `mentionReAnchors` lists each with `newStartOffset` and `newEndOffset`, matched by occurrence order of the same text within the paragraph.
   - **279** are ambiguous: the number of occurrences of the mention text in the paragraph changed. `newCandidates` lists every occurrence; a person must choose.
   - **4** have text that no longer appears (`status: absent`); re-anchor by hand.
   - **60 character-level anchors** (`firstMention`, `roleVisibleAt`, snapshot `availableAt`, evidence `throughOffset`) are all in changed paragraphs. `characterAnchors` gives a proposed offset where the mention that ends at the old offset has a unique match (20 keep their offset, 36 move) and candidates for the 4 ambiguous ones.
   - Offsets are UTF-16 code units, as in the character file. `paragraphHashes` and `sourceSha256` for modern-en must be regenerated against the shipped candidate. Mention texts were not edited, so identities and `resolution` fields carry over. Character *content* (snapshots, bodies) was not reviewed or changed here.
7. **Onboarding, taxonomy and registry metadata:** no changes proposed.
8. **Do not mix the batch files into the runtime.** `batches/*.json` are the working sources and exist only for audit.

## Open issues carried to Codex / Anders

Details are in `ACCEPTANCE-RECORD.md` under "Open issues".

1. **No human read.** All renderers, reviewers and verifiers were agent sessions (separate sessions, not the renderer, but the same model family). A human spot-read of the Inquisitor, Zossima's talks, the Mitya chapters and the trial speeches is recommended before or soon after release.
2. **Accessibility read** covered nine excerpts (about 4% of the text), ratings 3–5. The 50 flagged passages are mostly difficulty inherited from Garnett and kept by design (no invented glosses).
3. **About 565 NIT-level observations** were deliberately not applied.
4. **Garnett oddities kept as served** (e.g. "provincial mayor" for Samsonov in ch12 p39; "Napoleon … father of the present one" in ch33) are listed in `reviews/renderer-notes/`. Unmistakable typos were corrected as listed in the acceptance record.
5. **modern-da staleness**, covered in item 5 above.
