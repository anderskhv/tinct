# Release Packet — Bible `web-en` Revelation 22: removal of Project Gutenberg boilerplate

Prepared: 24 September 2026 · Content-only handoff for Codex

**Status: ready for Codex integration once [REVIEW.md](REVIEW.md) records acceptance.** Nothing here is published. No live edition, shard, character-card, registry, audio, app or shared-tooling file was changed. Codex owns integration and publication.

## Prior work checked

No accepted cleanup existed. The BSB staging package (`codex/bsb-staging-20260921`, README "Verified delivery") reported that "Existing WEB Revelation 22 contains appended Gutenberg boilerplate". It flagged the chapter's 21 verse mappings as unsafe and left WEB unchanged. No branch, PR or `books/` record repairs it. A whole-edition scan finds Gutenberg text only in this one paragraph (chapter 1189, paragraph 4). Across the repository the text appears only in the live edition, its `ch1189.json` shard and `qa/reports/structural-report.json`, which is historical output and not changed here.

## Pinned inputs

| Item | SHA-256 |
| --- | --- |
| Live `app/public/data/editions/bible-web-en.json` (baseline) | `46d206635dc79214cb29a8b27f392f3d4a5f856bdedb3441315973f542c4eeae` (4,425,337 bytes) |
| Live `app/public/data/editions-chapters/bible-web-en/ch1189.json` (baseline) | `e8bb0cb2b076ebd6ce8ccac5dd97d1f5ef16050140b1e6907b0b2208e7c6d6e0` (21,214 bytes, copied as `out/baseline-ch1189.json`) |
| Source: Project Gutenberg eBook #8294, *The World English Bible (WEB), Complete*, `https://www.gutenberg.org/cache/epub/8294/pg8294.txt` (the header's Title line and eBook number were checked) | `abf7c2da851fc68e770a5f88d3dcea650115c0daa0f0a56f54418d282d4afe7d` |

The live `web-en` is the classic WEB from that Gutenberg text. The eBible WEB Catholic and WEB Updated texts differ in wording, so they are **not** used to verify it.

## The exact change

Chapter 1189 (Revelation 22), paragraph index 4, originally 18,247 UTF-16 units:

- **Kept**, units 0–67: `²¹ The grace of the Lord Jesus Christ be with all the saints. Amen.`
- **Removed**, units 67–18,247: one separator space, then the full trailer text from `*** END OF THE PROJECT GUTENBERG EBOOK THE WORLD ENGLISH BIBLE (WEB), COMPLETE ***` to the end of the paragraph. That is 18,179 characters, stored verbatim in `out/removed-text.txt` (SHA-256 `fd4d478b…d1bc`).

Paragraph SHA-256 changes from `9401d3e2b93bbcd8d8fe83d45d721161c60d84ded7632d06ff9125af2c881e01` to `7c307a62d147383da90c83e5e6e87e264fd507448cc58f28247dcb65a5134f34`.

The following do not change:
- the other four paragraphs of the chapter
- the paragraph count (5)
- chapter numbers and titles
- every other chapter
- the verse labels

The byte diff against the live edition is a single contiguous deletion immediately after `Amen.`.

`prepare.py` confirms the boilerplate before it cuts:
1. The END marker occurs exactly once in the paragraph.
2. The removed text, with whitespace normalised, equals the Gutenberg file from its END marker to the end of the file.
3. The removed text contains no verse label.
4. The kept text ends at the close of verse 21.

## Verse preservation and mapping for Codex

All 21 verses are present, and their wording is unchanged. Each verse was compared with the Gutenberg source. The Gutenberg file carries inline `{…}` apparatus. The original `web-en` import had already removed it, so the comparison removes it too. In this chapter that is verse 1, `{TR adds "pure"}`. Each verse's span is identical in the baseline and the candidate. The only difference is that verse 21's end, which in the baseline ran on into the trailer, is now the end of the paragraph.

Chapter number 1189. Offsets are UTF-16 and end-exclusive. `start`–`end` covers the verse text only. `label` is where the superscript verse number starts.

| Reference | ¶ | label | start | end | | Reference | ¶ | label | start | end |
|---|---|---|---|---|---|---|---|---|---|---|
| REV.22.1 | 0 | 0 | 2 | 111 | | REV.22.12 | 2 | 189 | 192 | 282 |
| REV.22.2 | 0 | 112 | 114 | 326 | | REV.22.13 | 2 | 283 | 286 | 366 |
| REV.22.3 | 0 | 327 | 329 | 438 | | REV.22.14 | 2 | 367 | 370 | 507 |
| REV.22.4 | 0 | 439 | 441 | 505 | | REV.22.15 | 2 | 508 | 511 | 647 |
| REV.22.5 | 0 | 506 | 508 | 633 | | REV.22.16 | 3 | 0 | 3 | 154 |
| REV.22.6 | 1 | 0 | 2 | 175 | | REV.22.17 | 3 | 155 | 158 | 318 |
| REV.22.7 | 1 | 176 | 178 | 267 | | REV.22.18 | 3 | 319 | 322 | 480 |
| REV.22.8 | 1 | 268 | 270 | 430 | | REV.22.19 | 3 | 481 | 484 | 657 |
| REV.22.9 | 1 | 431 | 433 | 604 | | REV.22.20 | 3 | 658 | 661 | 748 |
| REV.22.10 | 1 | 605 | 608 | 702 | | REV.22.21 | 4 | 0 | 3 | **67** (baseline: 18,247) |
| REV.22.11 | 2 | 0 | 3 | 188 | | | | | | |

The machine-readable version, with per-verse text hashes, is `out/change-record.json` → `verseMapping`.

**BSB crosswalk:** the staged BSB verse crosswalk is pinned to the baseline `web-en` hash. After publication, rebuild or revalidate it against the candidate hash. The 21 Revelation 22 mappings that were flagged unsafe should then become exact reference matches. This packet does not modify BSB staging.

## Candidate files

| File | SHA-256 | Destination |
| --- | --- | --- |
| `out/bible-web-en.candidate.json` | `b0f491656782257e7b20f4a80add615cb363b8f324e54a4c1c457648328762aa` (4,407,053 bytes) | `app/public/data/editions/bible-web-en.json`, copied byte for byte |
| `out/ch1189.candidate.json` | `df0f57ab799913a44cfd951941e310fbdaa5142392c0ea019cb888d3475d9614` (2,930 bytes) | Expected output of the existing shard tooling for chapter 1189 |

Both candidates keep the baseline serialisation (the edition uses 2-space indentation; the shard is compact with a trailing newline). The shard manifest's `paragraphCount` for chapter 1189 stays at 5.

## Character-card compatibility (`app/public/data/characters/bible.v1.json`, `web-en`)

- `sourceSha256`: `46d20663…eeae` → `b0f49165…62aa`.
- `paragraphHashes["1189"][4]`: `9401d3e2…1e01` → `7c307a62…4f34`. The other hashes are unchanged.
- The chapter has 4 mentions. All four still resolve with **unchanged offsets**. That includes `jesus` at ¶4 25–30, which is inside the kept text. **0 offsets need to change**, and no mention falls in the removed text.

## Audio

This text release requires no audio action. It does not authorise synthesis. `web-en` has `hasAudio: true`. Any existing narration or word-timing sidecar for Revelation 22 may include the trailer or be aligned to it. Under the current [audio architecture](../../../docs/audiobook-architecture-2026-09-21.md), cache identity follows the exact text, so the changed paragraph hash must not reuse stale audio for ¶4. This note is for the audio owner to act on.

## Codex integration checklist

1. Before copying, confirm that the live edition hash is still `46d20663…eeae`. If it is not, stop and re-run `prepare.py`, which refuses to run against a changed baseline.
2. Copy the candidate edition. Regenerate the Bible `web-en` shards with the existing tooling and confirm that `ch1189.json` equals `out/ch1189.candidate.json`.
3. Apply the character-card hash updates above, then bump the revision under the existing release convention.
4. After deployment, verify that the served, build-versioned edition and `ch1189.json` match the hashes above and that Revelation 22 still has 5 paragraphs and 21 verse labels.

## Reproduce

```bash
python3 prepare.py --gutenberg-txt pg8294.txt   # read-only against live files; writes ./out
sha256sum -c SHA256SUMS
```
