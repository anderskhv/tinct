# Release Packet — Strange Case of Dr Jekyll and Mr Hyde, modern-en

Status: **Accepted and ready for release handoff** (see `ACCEPTANCE-RECORD.md`).
Nothing here is published. No live edition, character-card, audio, registry or
application file was touched. The coding agent owns integration and publication.

## Artifact

| Item | Value |
|---|---|
| Source (fidelity anchor) | `books/wip/green-jekyll-and-hyde/source.json`. Byte-identical to the served `app/public/data/editions/jekyll-and-hyde-original-en.json`, the Gutenberg #43 text. One documented first-edition reading at ch. 10 ¶1 |
| Candidate | `books/wip/green-jekyll-and-hyde/candidate.json` |
| **Accepted sha256** | `f2cf24e93c77b354a9fa617d3440b6daaa09acd36e6fdb1df236469ac570a5ae` |
| Destination | `app/public/data/editions/jekyll-and-hyde-modern-en.json` (copy byte for byte) |
| Replaces live sha256 | `308ad53a5c88f4b7a8a6ec618d184d636f4e7884b5a897e9f6407cef9eb3e654` (kept as `baseline-live-modern-en.json`) |
| Structure | 10 chapters and 339 paragraphs. Chapter numbers, titles and per-chapter counts are unchanged, so alignment with original-en is intact |
| Per-paragraph hashes | `accepted-paragraph-hashes.tsv` |

## Changed passages (for audio and character cards)

**235 of 339 paragraphs** differ from live. Chapters 3–10 were rendered in full;
chapters 1–2 received local fixes only. `CHANGED-PARAGRAPHS.md` lists each
paragraph with its old and new hash and the reason. Locations (0-based):

ch1: 0,7,13; ch2: 0,2,8,9,12,15,24,36,49; ch3: 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16; ch4: 0,1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17; ch5: 0,2,3,4,5,6,7,8,9,10,11,12,14,15,16,17,18,19,20,21,23,24,25,26,28,29,30,32,34,35,37; ch6: 0,1,2,3,4,5,6,7,9,10,11,12; ch7: 0,1,2,3,4,5,6,7,8,9,10,11,13; ch8: 4,7,10,12,13,16,18,21,22,23,24,25,26,27,28,30,31,32,34,35,36,37,38,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,64,65,66,67,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,91,92,96,97,98; ch9: 0,2,3,4,5,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,25,26,27,28,29,30,31,32; ch10: 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27

## Integration items for the coding agent

1. **Character cards.** `jekyll-and-hyde` is in `characterReleases` (revision
   `2026-09-11.2`). `app/public/data/characters/jekyll-and-hyde.v1.json` is
   pinned to the live bytes (`sourceSha256` 308ad53a…). Re-anchor the source
   hash, the paragraph hashes, and the offsets of **409 of 505 mentions** that
   fall in changed paragraphs, then bump the revision.
   - Every mention's text still occurs in its paragraph, so only the offsets
     move (`character-card-impact.json`).
   - Check that no mention was anchored to the old word "cabinet" for Jekyll's
     room, which now reads "study".
2. **Audio.** English modern-en audio exists in R2. For example,
   `/api/audio-manifest?path=jekyll-and-hyde/modern-en/ch1/manifest.json`
   returns 200. The 235 changed paragraphs need regenerated audio and
   manifests, which in practice means chapters 3–10 in full plus the listed
   paragraphs in chapters 1–2. The same applies to any word-timing sidecars.
3. **Verify after publication.** The served sha256 must equal the accepted hash,
   with 10 chapters and 339 paragraphs and the per-chapter counts unchanged.

## Evidence

- `round1/`:
  - the ch 1–2 review and its proposals
  - the drafting brief, rules and per-chapter drafts
  - the drafting notes, which list glosses and passages kept close to source
- `round2/`:
  - three fresh fidelity reviews (`jek-fid2-*`) and the blind accessibility review (`jek-acc*`)
  - the applied lists (including the room convention)
  - the independent re-verification (`jek-reverify-R2.md`, which also covers R3) and the R3 fixes
