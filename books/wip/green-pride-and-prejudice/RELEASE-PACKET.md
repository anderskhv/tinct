# Release Packet: Pride and Prejudice, modern-en

**Status:** accepted and ready for release handoff (see `ACCEPTANCE-RECORD.md`).

**Not published.** No live edition, character-card, audio, registry, application, tracker or instruction file was touched. Integration and publication belong to the coding and release agents. Under the 23 September text-release rule, this is a text release with the required character-card compatibility. It needs no Kokoro, GPU or TTS work and makes no audio change.

## Artifact

| Item | Value |
|---|---|
| Source (fidelity anchor) | `books/wip/green-pride-and-prejudice/source.json`, byte-identical to the served `app/public/data/editions/pride-and-prejudice-original-en.json`. sha256 `5a44024668550ab8cdae47579bd798b5b60c8e3e1401043b6d9f8777081760c6`. Project Gutenberg #1342 (1813) |
| Baseline (live, replaced) | `baseline-live-modern-en.json`. sha256 `d914bb2dc33dfb525d7c21b142cc1ae4ea85dcfdd84378c2a839c90d90c250e1` |
| Candidate | `books/wip/green-pride-and-prejudice/candidate.json` |
| **Accepted sha256** | `5ba867fe5e13a7c7c1f1f94946c6b6a575f342951467245a0d816723dd3f4c77` |
| Destination | `app/public/data/editions/pride-and-prejudice-modern-en.json`. Copy it byte for byte |
| Structure | 61 chapters and 2,060 paragraphs. Chapter numbers, titles and per-chapter counts are unchanged from live and from the source, so alignment with original-en (and modern-da) is intact |
| Per-paragraph hashes | `accepted-paragraph-hashes.tsv` (first 16 hex characters of each paragraph's sha256, keyed `chapter.index`). The file's sha256 is `9be292e952bb80363149946963390dfff1927cc47b0a7c0723550813d1b11928` |

## Changed passages

**222 of 2,060 paragraphs** differ from live. `CHANGED-PARAGRAPHS.md` lists each one with its old hash, its new hash, and every edit applied to it with its concrete reason. Locations (the paragraph index is 0-based):

ch1: 0; ch2: 8; ch3: 3,5,13; ch4: 4,10,11; ch5: 0; ch6: 1,8,9,15,21,35; ch7: 0; ch8: 0,15,42,58; ch9: 0,1,28,35; ch10: 14,45,52; ch11: 6,11,27; ch12: 0,1,2,5; ch13: 7,11,14,17,25; ch14: 13; ch15: 0,10; ch16: 1,2,15,20,25,32,36,39,55,56,58,59; ch17: 0; ch18: 13,49,58,62,66,74; ch19: 21; ch20: 0,29; ch21: 2,25; ch22: 1,2,4,12; ch23: 3,15; ch24: 2,14,22,23; ch26: 29; ch27: 22; ch28: 6; ch29: 9,14,37,40; ch30: 2,5,7; ch31: 2,11,12,28; ch32: 23; ch33: 0; ch34: 1,3,4,6,15,21,27,29; ch35: 1,3,4; ch36: 0,2,4,6,8,11; ch37: 3,9,11,16; ch38: 2,6,16; ch39: 0,13,14,18,21,24; ch40: 5,18,34; ch41: 13,15,21,24,25; ch42: 0,1,14; ch43: 53,57,58,60,64,73; ch44: 0,7,9,10,13,15; ch45: 0,7,9,14; ch46: 0,2,4,21,24,26,30,31; ch47: 2,9,11,15,47,49,68,73; ch48: 19,31,32; ch49: 3,17,41; ch50: 3,8,9,11,18,22; ch51: 3,35; ch52: 3,14,29,32,35; ch53: 17,26,39,48; ch54: 10,11,13,18; ch55: 17,19,20,21,46; ch56: 1,12,16,45,47,50,61,73; ch57: 4,13,19; ch58: 0,8,12,13,23; ch59: 10,26,34; ch60: 27; ch61: 4,5,9,11,12

Chapter 25 is unchanged. 10.10 and 47.8 were edited during review and then restored byte-for-byte to live.

## Integration items for the coding agent

1. **Character cards.** `pride-and-prejudice` is in `characterReleases` (revision `2026-09-12.1`). Its package `app/public/data/characters/pride-and-prejudice.v1.json` (`editions['modern-en']`) is pinned to the live bytes (`sourceSha256` `d914bb2d…`). The following need re-anchoring to the accepted hash, with the release revision bumped:
   - `sourceSha256`.
   - The paragraph hashes of the 222 changed paragraphs.
   - The **665 of 3,211 mentions** in changed paragraphs:
     - 379 still have their text at the same offset.
     - 284 have their text elsewhere in the same paragraph, so the offset moved.
     - 2 have text that no longer occurs, and both losses are correct:
       - 35.4 "Mr. Darcy" meant Darcy's *father* in the letter and is now "my father". The mention was attributed to `darcy`, so it should be dropped, not re-anchored.
       - 44.13 "Elizabeth" is now "them", because the source gives the anxiety to the Gardiners.
   - **20 character anchor fields** (`roleVisibleAt`, `firstMention`, `snapshots[].availableAt` and `evidence`) sit in the changed paragraphs 3.5, 5.0, 13.14 and 30.7, and their offsets need checking.

   Details are in `character-card-impact.json`. Card prose and original-edition data need no change.
2. **Audio.** There is no audio work in this release. Any narration synchronization follows the separately approved audiobook architecture (`docs/audiobook-architecture-2026-09-21.md`).
3. **Structural dependency (not blocking this text release).** Seven mid-sentence paragraph breaks are inherited from `original-en`: 3.3, 14.12, 22.3, 30.6, 36.3, 46.10 and 48.11. Fixing them needs a coordinated merge across every edition, the character cards and the audio. The details are in `ACCEPTANCE-RECORD.md`, under "Unresolved dependency".
4. **Verify after publication.**
   - The served sha256 must equal the accepted hash.
   - The counts must be 61 chapters and 2,060 paragraphs, with the per-chapter counts unchanged.
   - Check the reader's build-versioned edition URL, not the bare URL.

## Evidence

- `round0/`: the opening fix.
- `round1/`:
  - nine source-based fidelity reports (`fid1-*.md`, with `.json` proposals), each covering every paragraph and listing what the reviewer considered and left alone;
  - the lead's screening (`LEAD-SCREENING.md`);
  - the applied lists.
- `round2/`:
  - five candidate-only accessibility reports (`acc-*`);
  - three independent re-verifications of the round-1 changes (`reverify-r1-*`);
  - the lead's screening (`LEAD-SCREENING-R2.md`);
  - the applied lists.
- `round3/`: two re-verifications of the round-2 changes (`reverify-r2-*`), the screening and the applied list.
- `round4/`:
  - three final verifications of every changed paragraph (`final-verify-*`);
  - the check of the last three fixes (`final-verify-r5.md`);
  - the final applied list and the 47.8 net revert.
- `briefs/`: the exact reviewer briefs.
- `CONSISTENCY-CHECK.md`: whole-book mechanical and consistency checks.
- `CHANGED-PARAGRAPHS.md`, `accepted-paragraph-hashes.tsv` and `character-card-impact.json`: generated from the final bytes.
