# Release packet: much-ado-about-nothing, modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/much-ado-about-nothing-modern-en/` |
| Candidate | `candidate.json`, sha256 `e93fb1e66e2c9dc2d7266357fe143cf44c4943847f81009b9b507425dd2859f1` |
| Replaces | served `much-ado-about-nothing-modern-en.json`, sha256 `3b92db2e6ffc9d6b06eb0e3e6b15edaba45f2ed3495ddb2cb999c5b10eddf1af` |
| Baseline (original-en, unchanged) | sha256 `dd00eb7a88235b9852807ce3d52b7bc5c99d2dd391816465e063fffd0d2c7628` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.681, light + mechanical 0/17 = 0.0%, identical long paragraphs 3/427 = 0.7%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py much-ado-about-nothing --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (17 chapters, 1118 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 1647 modern-en mentions: 1597 unchanged, 50 moved (proposed re-anchors), 0 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 97 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
