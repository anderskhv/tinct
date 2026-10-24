# Release packet: romeo-and-juliet, modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/romeo-and-juliet-modern-en/` |
| Candidate | `candidate.json`, sha256 `0f7f2f2fbfb6e17d1c070228df6ec190d05bac150eeb16b1d12dc99a24efe04b` |
| Replaces | served `romeo-and-juliet-modern-en.json`, sha256 `47fdf4f9a1b309f6747b48d00add73181cff9cd0a4c0063f81774a1a8a95bae6` |
| Baseline (original-en, unchanged) | sha256 `d7be46edc32ddbb1321be7655ff819bd43e349f6ac59ba8c990fbd236f9f9276` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.446, light + mechanical 0/25 = 0.0%, identical long paragraphs 1/456 = 0.2%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py romeo-and-juliet --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (25 chapters, 1062 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 1626 modern-en mentions: 1626 unchanged, 0 moved (proposed re-anchors), 0 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 1 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
