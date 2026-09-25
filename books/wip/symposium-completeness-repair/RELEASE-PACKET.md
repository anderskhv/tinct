# Release packet: Symposium completeness repair

**Status: CONTENT ACCEPTED, handed off to the coding agent. NOT PUBLISHED.** Nothing in this package has been integrated, deployed or merged. Publication means the coding agent integrating it and releasing it through the serialized deploy owner.

- **Package:** `books/wip/symposium-completeness-repair/` on branch `claude/kind-fermi-a2b3g0` (content commit in the handoff message).
- **Baseline:** `main` `38a97c6315fdad4fe01fe326c203f870e22e615b`, 2026-09-25.
- **Instruction revision used:** `books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `STRATEGY.md`, `AGENTS.md`, `books/AGENTS.md`, `books/CLAUDE.md` and `docs/workflow-boundaries.md`, all at `38a97c6315fdad4fe01fe326c203f870e22e615b`.
- **Owned path:** `books/wip/symposium-completeness-repair/` only.

## 1. What changes

| | original-en | modern-en |
|---|---|---|
| Restored opening, 1.0–1.8 (9 paragraphs) | Verbatim Jowett (PG #1600 dialogue ¶0–8) | New Modern English rendering, independently reviewed |
| Chapter 1 | 40 → 49 paragraphs; old 1.0–1.39 → 1.9–1.48 | same |
| Chapter 7/8 regroup | Old 7.69–7.114 → 8.0–8.45; old 8.0 → 8.46. Ch 7: 115 → 69; ch 8: 1 → 47 | same |
| Chapter 5 title | "Agathon & Aristophanes" → "Aristophanes's Speech" (C-04, separable) | unchanged (already "Aristophanes's Speech") |
| Other text | None: all 217 baseline paragraphs byte-identical | **C-06:** three existing sentences corrected for confirmed defects (3.3 garbled clause; 3.7 "which custom allows"; 3.8 "done his best" and 'uses base'). The other 214 baseline paragraphs are byte-identical |
| Paragraphs | 217 → 226 | 217 → 226 |

Details: `CHANGES.md` / `CHANGES.json` (ledger), `coverage/COVERAGE.md` (whole-book completeness), `mapping/MAPPING.md` (old→new).

## 2. Exact files and hashes

Copy these byte for byte. Do not re-serialize: both files use `indent=2`, UTF-8 and no trailing newline, the same as live.

| Destination (`app/public/data/editions/`) | Package file | sha256 | git blob | Bytes | Replaces live sha256 |
|---|---|---|---|---|---|
| `symposium-original-en.json` | `candidate/symposium-original-en.json` | `3521a12d5d5acd6d4ac83f53747192c5ae592f7bf5e965c9c9bff881965495a6` | `5d5be8c31348aa4fc6dd3be5b8a452dd137a375c` | 121,441 | `e2943777fd54eaaa0888076c5c03a9104bc1b1ffa681a5362ab114e327f797c0` |
| `symposium-modern-en.json` | `candidate/symposium-modern-en.json` | `1e970b7beb3f098095ecf1a9fc7d78a8855d75e6ffc3bba14edc69db0e05374f` | `8049f40fe1837595fcf0ceda718f2e51bedb632a` | 121,364 | `7816d1eb6ac9cc6d178c4c123bbeb8ad6daced1f7d7fc8c036f2bded3b8fcce8` |

- **C-04 variant.** To decline only C-04, the original-en variant with the old chapter-5 title has sha256 `0615b9566818ba69f8bc45dfdb5ef4c6d3f2300c947494fd29fe4590354c506a`. Every other record in this package applies unchanged to that variant.
- **Per-paragraph hashes.** `hashes/paragraph-hashes-original-en.tsv` and `hashes/paragraph-hashes-modern-en.tsv` give the sha256 of each raw UTF-8 paragraph, which is the character cards' `paragraphHashes` convention.
- **Source.** `source/pg1600.txt` has sha256 `8b5c599e…6d6f` and `source/pg1600-images.html` has `c69cb6e7…ce0d`; see `source/SOURCE.md`.

**Pre-flight.** Confirm that `main` still serves the baseline hashes in the last column, that `app/public/data/characters/symposium.v1.json` is still `83f8a6a9…8628`, and that no newer Symposium edition work has landed. If anything differs, stop and re-base the mapping. Do not overwrite newer work.

## 3. Ship together (one release)

These dependencies are hard. Shipping only some of them breaks the reader.

1. **Both English editions.** They share one chapter structure and are paragraph-aligned for Compare.
2. **The re-anchored character card** (`symposium.v1.json`) and a bumped `characterReleases.symposium.revision` (currently `2026-09-11.2`). `verifyCharacters` rejects the card when the edition sha256 or paragraph hashes differ, and the revision versions both fetch URLs. See `impact/IMPACT.md` §2 and `impact/character-card-impact.json`.
3. **User-data coordinate migration** for positions, highlights, notes, bookmarks, reading log, progress and paragraph-anchored chat or audio positions. It must run before bounds validation (`mapping/MAPPING.md`).
4. **Narration safety.** Before the new text is served, remove `symposium` from `RETAINED_BELLA_ORIGINAL_BOOKS` or block its chapters 1, 7 and 8. Also invalidate or rebuild any Grok edition or sparse seek maps for chapters 1, 7 and 8 of both English editions, and for modern-en chapter 3, whose paragraphs 3.3, 3.7 and 3.8 changed text (`impact/IMPACT.md` §6).
5. **Danish decision** (below). If Danish is left untouched, update its `aligned` flag or Compare behaviour as decided. It must not be presented as aligned to the new English chapter 1.

## 4. Steps for the coding agent

1. **Pre-flight** as in §2.
2. **Editions.** Copy the two candidate files and verify their sha256.
3. **Character card.**
   - Apply every coordinate move in `impact/character-card-impact.json` → `editions.<ed>.moves`: 222 mentions and 176 anchors in original-en, 220 mentions and 172 anchors in modern-en.
   - For modern-en, also apply `offsetChanges`: the Aristogeiton and Harmodius mentions in 3.3 and their eight anchor offsets (C-06).
   - Recompute `sourceSha256` (candidate hash) and `paragraphCount` (226).
   - Recompute `paragraphHashes` for chapters **1, 7 and 8 in original-en** and **1, 3, 7 and 8 in modern-en**. C-06 changes three chapter-3 paragraphs, and any stale chapter makes `verifyCharacters` reject the whole edition's card. The lists are `paragraphHashesChaptersToRecompute` in `impact/character-card-impact.json`; they are derived from a hash comparison. `chapterCount` stays 8.
   - Apply the proposed content additions (23 new mentions in original-en and 25 in modern-en; new characters `glaucon-questioner`, `phoenix` and `philip`; anchor re-selection for six characters) unless the conservative alternative in `impact/IMPACT.md` §2 is chosen.
   - `glaucon-informant` is optional.
   - Bump `contentVersion` and the release revision.
   - Verify that every mention resolves in the new text and that `verifyCharacters` accepts the card for both editions.
4. **User data.**
   - Implement the old→new remap from `mapping/paragraph-map.tsv`, keyed to the content revision (new sha256). Offsets are unchanged everywhere except modern-en 3.3, 3.7 and 3.8, which are projected through `mapping/changed-paragraph-ops.json`. Equal spans are exact; changed spans are approximate and keep their recovery tuple.
   - Keep recovery tuples for anything unresolved. Never reset a position because it failed validation before migration. Never move a precise annotation to a paragraph start.
   - Seed tests with old coordinates 1.0, 1.39, 7.68, 7.69, 7.114 and 8.0 (positions and highlights), plus a Danish position, and assert they land at 1.9, 1.48, 7.68, 8.0, 8.45 and 8.46 with identical offsets. The Danish position is unchanged unless Danish is restructured.
   - Add a modern-en highlight on "Harmodius" in 3.3 (old UTF-16 1046–1055), which must land at 1010–1019.
5. **Narration and caches** as in §3.4. Also treat modern-en 3.3, 3.7 and 3.8 as changed text.
   - No TTS generation, voice change or prewarming is authorised by this package.
   - Keep legacy assets for rollback, and do not select them for the changed chapters.
   - Content-addressed Grok chunks for unchanged paragraphs remain valid.
   - The nine new paragraphs per edition are uncached and prepare on Play.
6. **Cast threads.** Apply the recommended `glaucon` correction in `impact/proposed-threads-corrections.json`, and optional items as desired. The Danish thread string is flagged, not rewritten. No thread re-keying is needed.
7. **SEO.** Regenerate `app/public/read/symposium/book.html` with `app/scripts/generate-sitemap.cjs`, which embeds the chapter-1 opening and the chapter titles, and refresh sitemap `lastmod`. The chapter summaries already match the new structure.
8. **Checks and release.** Run the checks required by `AGENTS.md` (`npm test`, `npm run build`, `npm run verify-bundle`) and the isolated, muted reader verification:
   - Chapter 1 starts "Concerning the things about which you ask to be informed…" in original-en and "As for what you're asking about…" in modern-en.
   - Chapter 7 ends "…anything else which you please." and chapter 8 starts "When Socrates had done speaking…".
   - Compare view is aligned in chapters 1, 7 and 8.
   - Character cards open on Glaucon (1.1), Phoenix (1.0) and Alcibiades (1.0 and 8.0).
   - The Cast tab shows chapter-8 Alcibiades material only from chapter 8.
   - Seeded old positions restore to the migrated place.
   - Release only through the serialized deploy owner.

## 5. Do not

- Do not re-serialize or hand-edit the candidate texts.
- Do not publish only one English edition, or publish the editions without the card and migration.
- Do not discard or reset unresolved reader data, and do not snap precise annotations to paragraph starts.
- Do not let retained Bella or legacy per-paragraph audio play against changed chapters. Do not regenerate audio as part of this release.
- Do not generate Danish text or remove the Danish edition.
- Do not describe the chapter divisions as Plato's own. They are Tinct's editorial reading aids.

## 6. Needs your decision (Anders)

1. **Danish (`modern-da`).** It lacks the same opening and has the same chapter-7/8 problem, plus misaligned and condensed paragraphs of its own (`impact/modern-da-report.md`). Recommendation: keep the Danish text untouched and set `modern-da` `aligned: false` in the same release (option A in `impact/modern-da-report.md`). Danish stays readable as a primary edition, no Danish migration is needed, and nothing false is presented as aligned. Reopening Danish (translating the opening, re-segmenting chapter 3, correcting 2.7 and the omissions) is a separate scope decision.
2. **Symposium modern-en similarity gate.** `books/classify-modern-en.py` is a mandatory gate for modern-en handoff. It fails before and after this repair (0.877 → 0.866), because chapters 2 and 4–7 (and so the moved Alcibiades paragraphs in 8) are near-verbatim Jowett. They have been so since commit `67aa9c16`, which replaced a condensed free rendering. As instructed, this completeness repair does not rewrite clear passages. Recommendation: grant an explicit waiver for this repair, since it has no regression and restores a missing opening and correct structure, and open a separate modern-English assignment for those chapters if Symposium should meet the gate. Without a waiver, neither English edition can ship, because they share one structure.
3. **Character anchors.** Recommendation: adopt the proposed anchor re-selection, which follows the card convention. The conservative alternative keeps anchors at their moved coordinates and adds only mentions.
4. **C-04 title harmonization.** Recommendation: keep it. Declining it needs only the variant hash above.

## 7. Evidence

- `reviews/REVIEW-1-completeness-fidelity.md`: independent full-book completeness and fidelity review.
- `reviews/REVIEW-2-blind-reader.md`: blind Modern English reader.
- `reviews/REVERIFY.md` and `reviews/REVERIFY-DELTA.md`: independent re-verification of every change made after the reviews (v1→v2, v2→v3).
- `reviews/RESOLUTION.md`: how each finding was resolved.
- `ACCEPTANCE.md`: final acceptance record, verification results and remaining issues.
- `HASHES.sha256`: hash of every package file.
