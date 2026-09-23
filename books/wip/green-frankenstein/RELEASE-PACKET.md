# Release Packet — Frankenstein, modern-en

Status: **Accepted and ready for release handoff** (see `ACCEPTANCE-RECORD.md`).
Nothing here is published. No live edition, character-card, audio, registry or
application file was touched. The coding agent owns integration and publication.

## Current release scope — 23 September 2026

Anders's explicit instruction supersedes the earlier audio regeneration requirement: publish the accepted text with required character-card compatibility. Legacy Kokoro recordings, manifests and timings are not release prerequisites. This text release performs no GPU/TTS generation, audio regeneration or voice-architecture change. The separately approved [audiobook migration](../../../docs/audiobook-architecture-2026-09-21.md) governs future synthesis, exact text/audio identity, acceptance and cleanup.

The original review package and artifact-relative paths below are pinned at [source commit 668985bf35e4](https://github.com/anderskhv/tinct/tree/668985bf35e4ff284bd1f60649b653257b4f9f6b/books/wip/green-frankenstein). Candidate bytes/hashes and historical review evidence are unchanged. Publication verification is recorded separately; acceptance is not a claim that the migration has shipped.

## Artifact

| Item | Value |
|---|---|
| Source (fidelity anchor) | `books/wip/green-frankenstein/source.json`. Byte-identical to the served `app/public/data/editions/frankenstein-original-en.json`. 1831 text, Project Gutenberg #84 |
| Candidate | `books/wip/green-frankenstein/candidate.json` |
| **Accepted sha256** | `a99352b3bf5f9d1f7a78970b658f2a35722a2b5031d4037a398d284c6ab390ff` |
| Destination | `app/public/data/editions/frankenstein-modern-en.json` (copy byte for byte) |
| Replaces live sha256 | `a3550019107ecb1f2de9e296c8a18b7077bf5c39c6469ae7668d8aac87de44c8` (kept as `baseline-live-modern-en.json`) |
| Structure | 28 chapters and 764 paragraphs. Chapter numbers, titles and per-chapter paragraph counts are unchanged from live and from the source, so paragraph alignment with original-en is intact |
| Per-paragraph hashes | `accepted-paragraph-hashes.tsv` (first 16 hex characters of the sha256, keyed `chapter.index`) |

## Changed passages and character compatibility

**301 of 764 paragraphs** differ from live. `CHANGED-PARAGRAPHS.md` gives each
one with its old hash, new hash and the reason for the repair. Location list
(0-based paragraph index):

ch1: 1,3,4,6,8,9,10; ch2: 3,4,5,6,7,8; ch3: 3,6; ch4: 3,4,5,11,18,23,27,30,33,35,36,38; ch5: 0,2,5,6,7,8,9,10; ch6: 1,3,4,5,6,7,8,9,12,13,14; ch7: 0,1,2,3,4,5,7,8,9,12,15,16,17; ch8: 1,3,4,5,7,8,10,11,13; ch9: 2,3,7,8,10,14,15,18,20,21,24; ch10: 4,5,7,8,9,14,15,17,21,22; ch11: 9,22,27,28,29,30,31,33,46; ch12: 0,1,2,5,8,10,30,31; ch13: 2,4,5,6,8,9,11,12,13,14,15; ch14: 0,2,3,4,6,7,11,13,14,16; ch15: 0,2,8,9,10,12,13; ch16: 4,8,10,14,16; ch17: 0,14,16; ch18: 0,1,8,9,14,15,17,19; ch19: 1,2,3,4,5,8,9,10,11,12,30,32,37; ch20: 5,6,7,11,12,15,17,20,35,36; ch21: 0,4,6,7,8,9,10,11,17,19,20; ch22: 0,2,3,4,6,7,8,9,10,12,14,15,16,17,20,21,22; ch23: 6,7,8,9,10,12,13,14,15,17,18; ch24: 0,1,2,3,7,11,17,18,19,22,24,30,35,36; ch25: 1,10,11,13,15,17,19,20,25,42,46,47,48; ch26: 0,3,13,14,18,19,23,28,32,34,35; ch27: 1,6,7,8,9,10,12,13,14,15,16,17,18,21,23,26,27; ch28: 4,8,9,10,11,12,13,15,16,17,18,21,24,25,28,29,34,43,45,46,47,54,60,62,63,64,65,68,70,71,72,74,75,78

## Integration items for the coding agent

1. **Character cards.** `frankenstein` is in `characterReleases` (revision
   `2026-09-12.1`). Its package `app/public/data/characters/frankenstein.v1.json`
   is pinned to the live bytes (`sourceSha256` a3550019…). The following must be
   re-anchored to the accepted hash, and the release revision bumped:
   `sourceSha256`, the paragraph hashes of the changed paragraphs, and the
   offsets of **248 of 518 mentions** that fall in changed paragraphs.
   - 35 of those mentions have text that no longer occurs in its paragraph. The
     narrators' epithets were restored: "the creature" ×28 and "the monster" ×6
     now read fiend, demon, wretch, being, and so on in those places. There is
     also "the old man" ×1.
   - These need re-anchoring to the new epithet or dropping. Details are in
     `character-card-impact.json`.
2. **Audio scope.** Earlier legacy-manifest observations are historical. Do not regenerate Kokoro audio or timings or block this accepted text release on them. This handoff is text plus required character compatibility only; the separate current narration plan owns synchronization and provider work.
3. **Verify after publication.** The served sha256 must equal the accepted hash,
   and the chapter and paragraph counts must be 28 / 764 with the per-chapter
   counts unchanged.

## Evidence

- `round1/`: the four repair-review packets, with each reviewer's report
  including what was considered and rejected, plus the lead's applied lists,
  the name sweep and the verse modernization.
- `round2/`: four fresh fidelity reviews (`frank-fid2-*`), two blind
  accessibility reviews (`frank-acc-*`), the applied lists, the independent
  re-verification report (`frank-reverify-R2.md`, which also covers R3) and
  the R3 fixes.
- `ACCEPTANCE-RECORD.md`: full coverage, conventions, rejected proposals, and
  the note on the unavailable Astra findings.
