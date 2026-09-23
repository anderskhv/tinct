# Release Packet — Jane Eyre, modern-en

Status: **Accepted and ready for release handoff** (see `ACCEPTANCE-RECORD.md`).

Nothing here is published. No live edition, character-card, audio, registry or application file was modified. The coding agent owns integration and publication.

## Release scope

This is a text replacement plus the character-card compatibility it requires. It involves no GPU/TTS generation, audio regeneration or voice-architecture change. Legacy Kokoro recordings, manifests and timings are **not** release prerequisites. Future narration synchronization follows the separately approved [audiobook architecture](../../../docs/audiobook-architecture-2026-09-21.md).

## Artifact

| Item | Value |
|---|---|
| Candidate | `books/wip/green-jane-eyre/candidate.json` |
| **Accepted sha256** | `5e270560909297f7f9ccb4e0914a79923b29471008b23e1e70a251a882dce7d7` (1,035,217 bytes) |
| Destination | `app/public/data/editions/jane-eyre-modern-en.json`. Copy byte for byte; do not re-serialize |
| Replaces live sha256 | `bbfe4c30163ecf07291e2fa5faef69d1e57348644afe2ab0dfc96edff3cecad0`, kept as `baseline-live-modern-en.json` (live at main `b792a83b`) |
| Source (fidelity anchor, unchanged) | `source.json`, byte-identical to the live `app/public/data/editions/jane-eyre-original-en.json`, sha256 `055aad5e04c0c9dbb32969c57cbcc54aa5e00c012256cd3debbce0577cbe5f96`. Project Gutenberg #1260 |
| Structure | 38 chapters and 4,047 paragraphs. Chapter numbers, titles and per-chapter paragraph counts are unchanged from live and from the source, so alignment with original-en is intact. The schema and serialization are the same as the live file |
| Per-paragraph hashes | `accepted-paragraph-hashes.tsv`: first 16 hex characters of the sha256 of each paragraph's UTF-8 text, keyed `chapter.index` (chapter 1-based, paragraph 0-based) |
| Similarity gate | `books/classify-modern-en.py jane-eyre --gate` → **PASS** (weighted similarity 0.687) |

Other derived files: `app/public/data/editions-chapters/` has **no** `jane-eyre-modern-en` shard directory. I searched for every baseline paragraph opening across `app/public/read/jane-eyre/`, `app/scripts/seo/jane-eyre.cjs`, onboarding, threads and the preface. The only modern-en text quoted there is paragraph 26.25 ("The marriage cannot go on…"), in `chapter-26.html` and the SEO script, and that paragraph is **unchanged**. So the edition file and the character card are the only files to update.

## Changed paragraphs

**537 of 4,047 paragraphs** differ from live. `CHANGED-PARAGRAPHS.md` gives each one with its old hash, new hash and every reason. Locations (chapter: 0-based paragraph indexes):

ch1: 0,2,5,6,7,9,23,24,25,38; ch2: 4,18,21,25,29,31,42; ch3: 12,14,18,20,31,40,45,75,77,82,85,86; ch4: 0,1,5,9,10,11,13,14,20,21,52,57,65,70,82,84,94,96; ch5: 0,1,17,40,49,51,53,97,110; ch6: 2,8,29,41,49,63,64; ch7: 6,7,8,10,20,28,29,48,55; ch8: 0,12,26,28,48,50,51,57,59,60; ch9: 0,1,2,8,9,12,27,42,59,60; ch10: 0,3,5,6,8,33,45,49,55,82; ch11: 1,26,43,44,46,61,72,76,81,82,83,84,101,109,113,118,119,122,123; ch12: 1,2,7,8,11,12,37,54,55,57,64; ch13: 13,20,29,45,46,74,91,98,106,107,108,115,118; ch14: 8,19,24,27,32,41,44,47,48,55,56,58,60,62,78,80,91,100,102,107; ch15: 2,4,7,8,11,13,22,32,35,41,51,68,72; ch16: 1,20,27,30,75,76; ch17: 0,1,11,22,29,32,40,49,59,63,68,72,79,80,81,85,86,100,108,125,130,138; ch18: 2,10,15,19,27,34,43,45,54,58,61,90,91,95; ch19: 43,58,74,76,82,89,96,123; ch20: 9,20,49,54,65,67,72,86,90,95,102,103,104,111,113,134,148,149,151,153,155; ch21: 0,8,14,21,40,42,103,118,125,127,128,129,132,143,152,153,154,155,159,168,179,192; ch22: 16,17,18,22,35; ch23: 3,13,16,43,47,48,49,53,56,93,103,110,112,113; ch24: 2,9,12,21,27,37,41,54,67,74,89,96,98,125,126,127,129,131,137,148,150,169,171,172,173,177,181; ch25: 0,4,22,56,58,61,64,85; ch26: 22,27,49,51,69,78,79,83,85,88,89; ch27: 5,13,26,27,54,65,71,76,87,91,97,100,104,105,127,130,131,132,133,150,153,157,158,159,160,161; ch28: 3,14,17,47,58,61,64,66,68,97,112; ch29: 5,14,20,21,60,65,103,106,121; ch30: 11,22,30,46,50,55,61,63,68; ch31: 7,20,23,24,38,41,45; ch32: 2,4,5,16,19,28,42,59,66; ch33: 36,48,64,90,91,92,97,110,120,142; ch34: 1,25,27,30,32,34,61,64,76,125,142; ch35: 1,2,3,6,11,30,38,41,67,71,74,75,80,82,83,85,87,88,96,97; ch36: 5,12,13,18,19,21,23,26,27,35,46,48,50,52,72; ch37: 0,1,2,3,6,7,8,9,10,11,13,15,19,23,24,30,48,50,53,57,59,62,63,66,71,72,76,81,85,86,91,92,93,96,100,104,105,109,110,111,112,113,114,115,116,117,118,126,143,144,173,188,194,195,201,232,239,241,247,248,249,250,256,257,258; ch38: 1,4,6,10,12,13,19,20,21

## Integration items for the coding agent

1. **Replace the edition.** Copy `candidate.json` to `app/public/data/editions/jane-eyre-modern-en.json` byte for byte. Confirm that the sha256 equals the accepted hash and that the counts are 38 chapters and 4,047 paragraphs with per-chapter counts unchanged.

2. **Character cards (required).** `app/public/data/characters/jane-eyre.v1.json` (contentVersion `2026-09-12.1`) has a `modern-en` edition pinned to the live bytes (`sourceSha256` bbfe4c30…). Its `paragraphHashes` are the full sha256 of the raw paragraph text, and its offsets are in UTF-16 code units. Details are in `character-card-impact.json`. Re-anchor the following, then bump the release revision:
   - `sourceSha256`.
   - The `paragraphHashes` of the 537 changed paragraphs.
   - **330 of 1,491 mentions**, the ones that fall in changed paragraphs:
     - 207 still have the same text at the same offsets.
     - 120 have text that still occurs in the paragraph but at a new offset, so re-anchor them by occurrence.
     - **3 have text that no longer occurs.** Two are "Jane Eyre" at 37.57, where the baseline's invented "Jane Eyre—Jane Eyre" line was replaced by the source's "What, Janet! Are you an independent woman?". The third is "Eliza" at 21.154, where Eliza's reported speech is now first-person, "Georgiana and I". Re-anchor these to the new wording where a safe mapping exists, or drop them.
   - **9 character anchors** in changed paragraphs: `roleVisibleAt`, `firstMention` and `snapshot[0].availableAt` for mrs-reed (1.0), miss-scatcherd (5.97) and grace-poole (11.113).
   - The `original-en` card edition is unaffected, because the source bytes are unchanged.

3. **Audio scope.** Do not regenerate Kokoro audio or timings, and do not block this text release on legacy audio. Paragraph changes are listed above for current cache and synchronization handling under the approved narration architecture.

4. **Verify after publication.** The served sha256 must equal the accepted hash. Verify the reader's build-versioned edition URL and the character card's revision-versioned source, not only bare URLs.

## Remaining dependency (non-blocking for this text)

- **Gutenberg caption and duplicate paragraphs in `original-en`.** These are 4.83, 12.46, 15.45, 18.92, 19.78, 25.83, 28.6, 28.51, 28.117, 33.92, 34.114, 36.53 and 38.17. Each repeats a neighbouring line and is kept as its own paragraph in the source. The candidate mirrors each one for alignment, so readers and listeners meet the line twice.
  - Removing them is a structural change to **both** editions, and to card anchors and any paragraph-indexed user data such as positions, highlights and notes. It belongs to the source and app owner and is **not** part of this release.
  - If it is done later, note 36.52/36.53. The candidate ends 36.52 at Bertha's leap, and 36.53 carries "The next moment she lay smashed on the pavement". Removing 36.53 would therefore require appending that sentence to modern 36.52.
- **31.20 source reading.** Gutenberg's "imposed the determination" is rendered "opposed", as the next clause requires. See `ACCEPTANCE-RECORD.md`. No action is needed for this release.

## Evidence

- `prior-repair/`: the recovered 2026-09-17 chapter repairs (27 tail, 35–38) with their notes and verification. The accepted-file hashes are listed in the acceptance record.
- `round1/`: 20 source-based repair reviews (`r1-B*.json` / `.md`), the lead's applied lists (`r1-B*-applied.json`) and the diacritic sweep.
- `round2/`: 20 fresh fidelity reviews (`r2f-*`), 10 candidate-only accessibility reviews (`r2a-*`), and the merged decision log (`r2-applied.json`).
- `round3/`: 4 re-verification reports covering all 137 R2 changes (`r3-V1..V4`), the final re-verification (`r3-V5-final`, `r3-V6-21.179.md`), and the applied log (`r3-applied.json`).
- `CHANGED-PARAGRAPHS.md`, `accepted-paragraph-hashes.tsv`, `character-card-impact.json`.
