# Release packet: war-and-peace, modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/war-and-peace-modern-en/` |
| Candidate | `candidate.json`, sha256 `16d0f165ce7cbbed2914ca5a5adacebe296b2f298670aac4604e35d7525f7e9f` |
| Replaces | served `war-and-peace-modern-en.json`, sha256 `d3ecdb9d013f45e5681b1c091b6a018564e33d7eab1072cb247c284698a5f3f6` |
| Baseline (original-en, unchanged) | sha256 `6112db117bbc36641e45240ff4a0ecd7d63a2975bdd691a6ad1624a6c6879864` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.682, light + mechanical 0/365 = 0.0%, identical long paragraphs 39/8595 = 0.5%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py war-and-peace --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (365 chapters, 11340 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 8466 modern-en mentions: 8024 unchanged, 440 moved (proposed re-anchors), 2 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 578 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
