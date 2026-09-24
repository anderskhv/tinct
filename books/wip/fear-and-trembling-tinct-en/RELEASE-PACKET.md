# Release Packet: Fear and Trembling, Tinct Modern English (translated from Danish)

Status: **the content is accepted and ready for the Codex handoff** (see `ACCEPTANCE-RECORD.md`). Nothing here is published. No live edition, registry, character-card, onboarding, threads, audio or application file was touched, and nothing was deployed. Codex owns integration and publication.

## Current release scope

This is a text release with the character-card compatibility it requires. It includes no GPU/TTS generation, no audio regeneration and no voice-architecture change. Legacy recordings are not a release prerequisite (see `books/CLAUDE.md` Audio Rules and the audiobook architecture document).

## Artifacts

| Item | Value |
|---|---|
| **modern-en candidate** | `candidate/fear-and-trembling-modern-en.candidate.json` |
| **Accepted sha256 (modern-en)** | `c48a325258381311e61ff70a2c9a3972e5e75cc1dac2b9b357e7022f85111fb8` |
| Destination | `app/public/data/editions/fear-and-trembling-modern-en.json` (copy byte for byte) |
| Replaces live sha256 | `152776f19e1b707b610d2bee033d6984ed0f1e26826b314e2d0541d9c0b49132` |
| **original-da candidate** | `candidate/fear-and-trembling-original-da.candidate.json`: the corrected, scan-verified Danish, aligned one to one with modern-en |
| **Accepted sha256 (original-da)** | `290fec6aa962cce75058c7c0286cc9a4c9aca00066be5cb535d528b7af2b8934` |
| Destination | `app/public/data/editions/fear-and-trembling-original-da.json` |
| Replaces live sha256 | `c61144bbf51a930748799d4ff30ff48031ee12452ada5eb5391f684e8961d63a` |
| Footnotes (18) | `candidate/footnotes.json`, sha256 `345f2eeeb3845fb0b1c663c8abac81d7a337c6cf19cba106795f232368b70b1e`. Each entry has an id, chapter, paragraph, marker, `anchorAfterEn`, `anchorOffsetUtf16`, English text, and the Danish anchor and text |
| Structural fields | `candidate/structure.json`, sha256 `60c309db…6c`: section numerals I–IV, rules and asterisms |
| Front matter | `front-matter.json`, sha256 `95e1934e…7c59`: subtitle, pseudonym, Hamann motto, "Problemata" part title |
| Structure | 8 chapters and **184** paragraphs (4/15/14/35/29/22/61/4), replacing the 232 served slots. About 43,700 English words |
| Per-paragraph hashes | `accepted-paragraph-hashes.tsv`: the first 16 hex characters of sha256 for both editions, keyed `chapter.index`, with the served slots each paragraph replaces |
| All hashes | `HASHES.txt` |

## What changes, and where it is documented

- **Every modern-en paragraph is new.** This is a fresh translation from the Danish, not a repair of the served text. `CHANGED-PARAGRAPHS.md` lists every final paragraph with the served slots it replaces, the structural relation and its hash.
- **Restored omissions** (`CHANGED-PARAGRAPHS.md` §A): the two Attunement weaning passages (final 2.7 and 2.10), the word *fatte* in P-II (6.6), the conjectural *i* in P-III (7.18), and the Attunement section numerals.
- **Footnotes** (`CHANGED-PARAGRAPHS.md` §B): all 18 are now separate records. The served editions were missing 5 of them entirely and 2 partly, had spliced 5 into the running text, and stood 8 as body paragraphs.
- **Structural changes** (`STRUCTURE-MAP.md` / `.json`): the served slots map as 132 identical, 82 joined, 9 split and 9 removed (footnote-only). Each has an explicit mapping, and the position-migration rule is included.

## Integration items for Codex

1. **Editions and labels** (`EDITION-PLAN.md`):
   - Serve the two candidates.
   - Label modern-en **"Tinct Modern English — translated from Danish"**.
   - **Retire `original-en`**. It is an AI translation mislabelled "Original (English)" and cannot align with the corrected structure.
   - `modern-da` also no longer aligns. Retiring it deletes an edition, so escalate that to Anders; the recommendation is to retire it.
2. **Position migration**: remap saved positions, highlights and notes with `STRUCTURE-MAP.json`, using the rule in `STRUCTURE-MAP.md`. Chapter numbers are unchanged. This is Tinct's core invariant, "never lose reading position", so please treat it as blocking.
3. **Footnote presentation**: Codex decides how to present the notes, both in the reader and in narration. The anchors are exact (UTF-16 offsets). The main text has no markers.
4. **Character cards**: `fear-and-trembling` is in `characterReleases` at revision `2026-09-12.1`. Its package `app/public/data/characters/fear-and-trembling.v1.json` (sha256 `9d9aa889…90dd`) is pinned to the old edition bytes and the 232-slot structure. Codex must:
   - re-anchor `modern-en` to the accepted hash (sourceSha256, paragraphCount 184, all paragraphHashes, every mention offset, and every firstMention, roleVisibleAt and snapshot availableAt);
   - drop the `original-en` card edition, or keep it only if that edition stays;
   - bump the revision.

   `character-card-impact.json` gives the proposed new coordinates for all 10 mentions: 7 found verbatim and 3 with the stated variant strings. Update the card, onboarding and threads wording as listed in `EDITION-PLAN.md` §3.7 ("Exordium" becomes "Attunement", "de Silentio" becomes "de silentio", "Preliminary Expostulation" becomes "Preliminary Expectoration").
5. **Audio**: the live modern-en has `hasAudio: true` on the old structure, so its paragraph audio no longer matches the text. Disable that audio for the new edition until the separately approved narration plan delivers matching audio. Do not regenerate legacy audio.
6. **Registry metadata**: `wordCount` is about 43,700. Edit "Johannes de Silentio" in the description to read "Johannes de silentio".
7. **Verify after publication**:
   - the served sha256 values equal the accepted hashes above;
   - the chapter and paragraph counts are 8 and 184 (4/15/14/35/29/22/61/4) in both editions;
   - the character package verifies against the new bytes;
   - a saved position from the old structure lands on the mapped paragraph.

## Evidence

- `ACCEPTANCE-RECORD.md`: source verification, review coverage without sampling, checks, rulings and kept difficulties.
- `PROVENANCE.md`: the source and its independence.
- `source/`: `SCAN-VERIFICATION.md`, `CORRECTIONS.md`, `PRINTED-PARAGRAPHS.md`, and the collation check.
- `reviews/`: the rounds run R1 fidelity → re-verification → readability → R2 → re-verification → R3 consistency → R3 re-verification (`R3-reverify.md`: "ready for handoff").
- `SIMILARITY.md`: the similarity diagnostic against the served English.
