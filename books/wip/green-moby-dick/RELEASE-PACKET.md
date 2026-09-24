# Release Packet — Moby-Dick, modern-en

**Status:** Accepted and ready for release handoff (see `ACCEPTANCE-RECORD.md`).
- Nothing here is published.
- No live edition, character card, audio, registry, application or shared tracker file was touched.
- Publication and integration belong to the publishing agent.

## Current release scope

This is a text release plus the character-card compatibility it requires. In line with the 23 September 2026 handoff rule (`books/TRANSLATION_PROTOCOL.md`), legacy Kokoro recordings, manifests and timings are **not** release prerequisites. This work performed no GPU/TTS generation, audio regeneration or voice change. Future narration and synchronization follow `docs/audiobook-architecture-2026-09-21.md`.

## Artifact

| Item | Value |
|---|---|
| Source (fidelity anchor) | `books/wip/green-moby-dick/source.json`. Byte-identical to served `app/public/data/editions/moby-dick-original-en.json`, sha256 `30974242d9ee3eae074671da0b424c0ef5d8b00258acf43cf27d92905136c952`. Melville 1851, Project Gutenberg #2701 |
| Candidate | `books/wip/green-moby-dick/candidate.json` |
| **Accepted sha256** | **`1a3f31bbe6bb4bea415a29b509c81f303074bc858854c7bc00a49e8b68ffd52c`** |
| Destination | `app/public/data/editions/moby-dick-modern-en.json` (copy byte for byte; the serialization matches the live file: 2-space indent, UTF-8, no trailing newline) |
| Replaces live sha256 | `2ab04dd727bbe5804b7acf1d05f578cfed5aef17c08d7d72b6db9101f8c1763c` (kept as `baseline-live-modern-en.json`) |
| Per-chapter split files | `app/public/data/editions-chapters/moby-dick-modern-en/` is derived from the edition. The publisher must regenerate it with the project's existing build step, not by hand |
| Structure | 136 chapters and 2,432 paragraphs. Chapter numbers, titles and per-chapter paragraph counts are unchanged from live and from the source, so paragraph alignment with original-en is intact |
| Per-paragraph hashes | `accepted-paragraph-hashes.tsv` (first 16 hex characters of sha256, keyed `chapter.index`) |

## Changed passages

**1,614 of 2,432 paragraphs** differ from live. `CHANGED-PARAGRAPHS.md` lists each one with:
- its old and new hash;
- every round that touched it;
- the stated reason for each change (from `ledger.jsonl`).

Locations (0-based paragraph index):

ch1: 0,1,2,3,4,5,6,8,9,10,11,12,13; ch2: all 12; ch3: 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,18,19,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72; ch4: all 7; ch5: 0,1,2,3,4,5,6,7; ch6: 1,2,3,4,5,6,7,8; ch7: 1,5,6,7,9; ch8: all 7; ch9: 0,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,22,23,24,25; ch10: 0,1,2,3,6,7,8,9; ch11: all 4; ch12: 1,2,3,4,5,6,7; ch13: all 15; ch14: 1,2,3,4; ch15: all 16; ch16: 0,1,2,3,4,5,6,14,15,23,24,25,26,28,34,40,42,43,45,52,53,54,55,57,58,62,63,64,65,66,67,71,80,81; ch17: 0,2,3,4,5,11,16,22,23,25,28; ch18: 4,8,10,11,12,14,21,23,24,25; ch19: 1,10,13,22,26,28,33,34; ch20: 1,2,4,5,6; ch21: 2,8,12,20,22,24,25,37; ch22: 3,8,9,10,13,14,16,19; ch23: 1,2,3; ch24: 2,5,7,8,9,10,12,13,14,16,17,18,19,21,22; ch25: all 4; ch26: 0,2,3,4,5; ch27: 0,1,3,5,7,8; ch28: all 7; ch29: 0,1,2,3,4,9; ch30: 0,1,2; ch31: 1,6; ch32: 0,1,3,5,6,8,9,10,11,13,14,15,16,20,21,22,23,24,25,26,27,28,30,31,32,33,34,35,36,39,40,41,42,43,45,46; ch33: 1,2,3,4,5,6; ch34: all 11; ch35: 1,2,3,4,5,6,8,10,11,12; ch36: 3,9,12,20,27,30,32,36,39,41,44,45,47,49,50; ch37: 2,4; ch38: 3; ch39: 2,3; ch40: 3,5,7,8,11,12,15,17,20,22,25,26,27,34,35,38,49,50; ch41: 1,2,3,4,5,6,7,8,10,11,12,16,17,18,19,20,21,22,23; ch42: 2,3,4,5,6,7,8,9,10,12,13,16,17,18,19,20,23,24,27,28,30; ch43: 0,1,2,3,8,11; ch44: 0,2,3,4,5,6,8,9,10,11; ch45: 0,2,3,4,5,6,7,8,9,10,11,12,15,17,18,19,20,21,23,24; ch46: 0,1,2,3,5; ch47: 1,2,12,13; ch48: 0,3,4,11,12,17,19,20,22,23,28,29,30,31,33,34,36,37,38,39,40,46,47,48,49,50; ch49: 0,6,7; ch50: 3,5,6,7; ch51: 1,2,4,6,8,9,10; ch52: 0,1,3,4,7; ch53: 0,1,2,3,4,5,6,8; ch54: 2,3,4,5,6,8,9,10,11,12,13,16,17,18,19,21,22,23,28,31,32,34,39,40,47,48,49,53,54,55,56,57,60,64,66,67,68,69,76,77,78,79,85,86,87,88,89,96,97,98,101,103,106,107,109,110; ch55: all 14; ch56: 1,2,3,4,5,6,7,8; ch57: 1,2,3,5,6,7,8,9,10,11; ch58: 2,3,4,5,6,8,9,10,11; ch59: 1,2,3,4,5,6,10,11,12; ch60: 1,2,3,4,5,6,7,8,9; ch61: 0,1,2,3,4,5,7,8,9,10,11,12,14,15,16,17,18,19,20,21; ch62: 1,2,3,4; ch63: all 5; ch64: 0,1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,18,20,21,23,25,28,30,32,34,36,38,40,42,44,48,50,51,52,53,54,55,57,58; ch65: all 7; ch66: all 5; ch67: 1,2; ch68: all 8; ch69: 1,2,3,4,5; ch70: 0,1,2,3,4,5,6,10; ch71: 0,1,2,3,4,5,6,7,8,14,15,16,17,18,19,21,23,27,28; ch72: 0,1,2,3,4,5,6,7,8,9,10,11,15,17,19; ch73: 1,2,3,4,5,6,7,8,10,11,19,23,25,26,31,33,40,41,42; ch74: 0,1,2,4,5,6,7,8,9,10,11,13; ch75: all 11; ch76: all 4; ch77: 1,2,3,4,5,6; ch78: 0,1,2,3,4,7,10,11,12,13,14; ch79: all 6; ch80: all 7; ch81: 1,2,6,11,12,16,17,20,22,24,28,29,35,38,41,44,45,46; ch82: 1,2,3,4,5,7,8; ch83: all 5; ch84: all 8; ch85: all 12; ch86: 1,3,4,10,12,13,14; ch87: 0,1,2,3,4,5,6,7,10,12,13,14,15,17,18,19,20,21,25,26,27,28,30,32,33,34; ch88: 0,2,3,4,5,6,7,8,9; ch89: 0,1,2,6,7,8,9,10,11,13,14,15,16; ch90: 1,2,3,12,16,17,18,19,20; ch91: 1,2,3,4,6,15,18,19,24,26,27,29,31,35,37,39,43,44,46,47,49; ch92: 0,1,2,4,5,6; ch93: 1,2,5,6,8,9,10,13; ch94: 0,2,3,4,5,7,8,9,10,11,12; ch95: 1,2; ch96: 1,2,4,5,6,8,9,10,11; ch97: 0,2; ch98: 0,1,2,3,5,6,7; ch99: 0,1,2,4,6,7,8,10,11,12; ch100: 2,4,6,7,8,9,13,17,19,20,23,24,26,27,29,35,37,41,42; ch101: 0,1,2,3,4,5,7,8,9,10,11,12; ch102: all 14; ch103: all 11; ch104: all 11; ch105: 0,1,2,4,5,6,7,8,9,10,11,12,13,14; ch106: 1,2,3,4,5; ch107: 0,1,3,4; ch108: 1,2,5,6,8,12,14,15,16,17,27,28,30,31,34,36; ch109: 0,1,2,4,5,6,9,11,12,13,14,16,17,18,19; ch110: all 19; ch111: all 4; ch112: all 8; ch113: 0,3,9,11,13,15,16,17,19,21,22,23,24,25,26,27; ch114: 0,2,3,4,5,6,7,9; ch115: 0,1,2,3,4,5,12,13; ch116: all 7; ch117: 1,2,3,4,5,8,10,11,13,14; ch118: 0,1,2,3,4,5,6; ch119: 0,1,2,3,8,11,13,14,17,18,19,21,23,24,25,29,30,31,32,33,34,36,37,38,39; ch120: 1,6; ch121: 0,1,2,4; ch123: 0,1,2,3,4,6,7,8,10,11; ch124: 0,1,3,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20; ch125: 0,2,3,4,5,12,13,14,16,17,18,19,21,22,23,25,26,27; ch126: 0,1,2,3,4,5,6,7,12,16,18; ch127: 0,1,3,5,7,8,9,11,12,13,19,20,22; ch128: all 19; ch129: 1,2,3,4,5,7,9; ch130: all 15; ch131: 0,1,2,3,4,5,6,7,9,10,11; ch132: 0,1,2,3,4,5,6,7,11,12,13,14,15,16,18; ch133: 0,1,3,7,8,11,14,15,16,17,18,19,20,22,23,24,25,26,27,28,29,31,32,33,39,40,41,42,44,49,50; ch134: all 47; ch135: 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,25,26,27,28,29,30,31,32,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61; ch136: 2

Chapters with no changed paragraph: 122

## Integration items for the publishing agent

1. **Character cards.**
   - `moby-dick` is in `characterReleases` at revision `2026-09-12.1` (`app/src/services/characters/characterCards.ts`).
   - The package `app/public/data/characters/moby-dick.v1.json` → `editions.modern-en` is pinned to the live bytes (`sourceSha256` `2ab04dd7…`).
   - Re-anchor the following to the accepted hash, then bump the release revision:
     - `sourceSha256`
     - the `paragraphHashes` of the changed paragraphs
     - the offsets of **1,322 of the 1,779 modern-en mentions**, which fall in changed paragraphs
     - **14** character `roleVisibleAt`/`firstMention` anchors in changed paragraphs
   - **7 mentions** have text that no longer occurs in its paragraph. Re-anchor or drop each:
     - 48.23 and 48.34 "Daggoo": the live text had silently replaced the source's "the negro" with the name. Lead decision 1 restores the source's wording.
     - 33.6 "Captain Ahab", 50.6 "Fedallah", 64.8 "Stubb", 111.3 "Moby Dick", 123.3 "Ahab": the faithful rendering now uses a pronoun or other reference, as the source does.
   - Details are in `character-card-impact.json`. The original-en side of the package is unaffected, because the source is unchanged.
2. **Audio.** Existing legacy recordings and timings for modern-en no longer match 1,614 paragraphs. Per the current release rule, do not regenerate them or block this text release on them. The current narration plan owns synchronization.
3. **Verify after publication:**
   - served sha256 = `1a3f31bbe6bb4bea415a29b509c81f303074bc858854c7bc00a49e8b68ffd52c`
   - 136 chapters and 2,432 paragraphs, with per-chapter counts unchanged
   - `python3 books/classify-modern-en.py moby-dick --gate` → **GATE PASS**
4. **Separate structural ticket.** Do not bundle it with this release. See `STRUCTURAL-HANDOFF.md`: three chapter-title wrap fragments (56.0, 57.0, 73.0), and the missing Etymology and Extracts. Both require a coordinated renumbering across all editions.

## Evidence

- `STYLE-BRIEF.md` and `prompts/`: the exact instructions given to every repair editor, reviewer and verifier.
- `round1/`: 22 repair proposals and reports, covering every chapter; ch76 was repaired by the lead.
- `round2/`:
  - 22 independent fidelity reviews (`*-fid`) and 22 candidate-only accessibility reviews (`*-acc`)
  - `SCREENING-LOG.md` (lead screening decisions)
  - `b76-acc-screening.md`
- `round3/`: 22 independent re-verifications of the round-2 changes.
- `sweep/`: the name (decision 7), "quarter-deck" and species-capitalization sweeps.
- `round4/`:
  - modernization-depth pass (`M-TARGETS.json`, `m1`–`m5` modernize/fid/acc)
  - `SCREENING-R4.md`
- `round5/`: final independent verification of every late change (`v1`–`v4`), the lead fixes and the `v5` micro-check.
- `ledger.jsonl`: every applied change, with its round, file, old and new hash, reason and category.
- `STRUCTURAL-HANDOFF.md`: source-level defects outside this scope.
