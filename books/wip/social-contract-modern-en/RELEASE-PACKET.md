# Release packet: *The Social Contract*, modern-en repair

**Status: content accepted / handed off to Codex. NOT published.** Integration, app verification and serialized release belong to Codex.

## Package

- **Branch:** `claude/social-contract-modern-en`
- **Commit:** see the handoff message. It is the commit that adds this file; everything on the branch is confined to this folder.
- **Package path:** `books/wip/social-contract-modern-en/`
- **Candidate:** `candidate.json`, sha256 `0dc94d4f767fb769ffd6ecafb1434b05e3631c96953b2ffb453aafa520f1fd11` (same serialization as the live file)
- **Target live path:** `app/public/data/editions/social-contract-modern-en.json`. Replace it byte-for-byte with `candidate.json`.
- **Expected live pre-image:** `cf7facb77bfc5bafc99cb4d7a236fd4f59d5f9ffc4554c6f063ee8daae273843` (the served modern-en at main `791d2802`). If main's file differs, stop and reconcile; do not overwrite a newer change.
- **Fidelity anchor (unchanged):** `social-contract-original-en.json`, sha256 `7bf5ababb7c4dfe1cec0230d44f64960d8b447c4802b6a716b52d770a5854157`
- **Evidence:** `ACCEPTANCE-RECORD.md`, `GATE-OUTPUT.txt`, `STYLE-NOTE.md`, `reviews/`, `changed-paragraphs.json`, `character-impact.json`

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity **0.633** (was 0.843), light + mechanical **0/48** (was 19/48), identical long paragraphs **0/483** (was 5/483), wrapped scaffolding 0, truncated quotations 0. **GATE PASS.** Per-batch runs (ch 1–9, 10–21, 22–39, 40–48, 1–24, 25–48) all pass at 0.629–0.641. `audit-truncation.py` (en): 0 hits.

## Integration requirements

1. **Structure is unchanged.** 48 chapters, 491 paragraphs, same chapter numbers, titles, per-chapter counts and `sections`. No position, highlight, note or reading-log migration is needed. The registry needs no structural change; `wordCount` is about 41.9k now (was about 43.2k), so adjust it only if the registry stores a modern-en-specific figure.
2. **Re-run the gate in place** after copying: `python3 books/classify-modern-en.py social-contract --gate`. Expected: weighted similarity 0.633, light + mechanical 0/48, identical long paragraphs 0/483, GATE PASS.
3. **Regenerate derived runtime data** that embeds modern-en text (per-chapter splits, search index, bundles, edition difficulty) with the normal tooling. `app/src/lab/editionDifficulty.ts` and `app/src/data/editionAvailability.json` reference this book; the edition-difficulty figures will change.
4. **Narration (Grok streaming).** 489 of the 491 modern-en paragraphs have changed text (`changed-paragraphs.json`).
   - Cached speech for those paragraphs must not be served for modern-en. Invalidate by text, language, provider, model, voice and settings under the current cache contract.
   - The two unchanged paragraphs (ch22 p23, ch26 p10) may reuse compatible entries.
   - Streaming continues as before. Do not queue full-audiobook generation or change voices. Keep legacy assets for rollback.
5. **modern-da is untouched** and no longer tracks modern-en. Do not mark it current. Do not generate a new Danish rendering; Danish is out of scope.
6. **Character cards: re-anchoring required.** A released package exists: `app/public/data/characters/social-contract.v1.json` (revision `2026-09-11.2` in `characterCards.ts`), reviewed against modern-en `cf7facb7…73843`. `books/characters/library-coverage.md` still lists the book as `not-started`, which does not match the released package. This file was **not** edited. Impact on its `modern-en` edition (96 characters, 178 mentions), computed by `character-impact.json` against the candidate:
   - `sourceSha256` and all 491 `paragraphHashes` for modern-en are stale and must be regenerated; bump the release revision so readers stop using the immutable old URL.
   - **178 mentions** are anchored by UTF-16 offset in old paragraphs. None sits in an unchanged paragraph. 17 still have their text at the old offset; **156 contain the name in the new paragraph at a different offset** (the new offsets, with the nth-occurrence guess, are listed under `mentions_needing_reanchor`; when a name occurs more than once in a paragraph check which occurrence is meant); **5 no longer match the name text** because of spelling normalization: `balboa` ch9 p3 ("Nuñez Balbao" → Balboa), `borgia` ch27 p16 ("Cæsar Borgia" → Caesar Borgia), `caesar` ch31 p14 ("Julius Cæsar" → Julius Caesar), `caesar` ch45 p7 and ch47 p40 ("Cæsar" → Caesar). Update the mention `text` along with the offsets.
   - **288 position-gate points** (`roleVisibleAt`, `firstMention` and snapshot `availableAt`) fall in paragraphs whose text changed and must be re-derived from the re-anchored mentions (`gate_points_in_changed_paragraphs`).
   - Both the changed text and the changed offsets mean the character-card verification (hash check) will refuse the old package against the new modern-en until it is regenerated. Do not publish the new modern-en text without the regenerated package, or accept the verified-cards fallback.
   - Character identity decisions are unaffected: the same people are named in the same paragraphs; this is an offset and hash migration, not a content change.
7. **Onboarding, taxonomy and registry metadata:** no changes proposed. Onboarding (`social-contract.json`) was not reviewed; confirm it does not quote exact modern-en wording.

## Open issues carried to Codex / Anders

Details are in `ACCEPTANCE-RECORD.md` under "Open issues".

1. **Source paragraph fragments** (about 38+ paragraphs; footnote-tail debris from the parser). Kept 1:1 as fragments. A structural repair of original-en and modern-en together needs an explicit mapping and is a separate authorized change.
2. **Editorial residue** in Cole's text (ch12 p5 "Rousseau quotes the Italian."); footnote markers without footnote text.
3. **Review scope.** Every paragraph was independently reviewed (491/491) and every edit re-verified; a separate candidate-only accessibility read was not run.
4. **No `books/raw/` provenance** folder exists for this book.
5. **modern-da staleness** (see item 5 above).
6. **Character-card package** is stale relative to the candidate and library-coverage is inaccurate (see item 6 above).
