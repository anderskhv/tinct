# Release packet: the-republic, modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/the-republic-modern-en/` |
| Candidate | `candidate.json`, sha256 `2bc78ba1f33b207c52ee98dd47954c82c07afb11b3b70d60f6a41af18b675277` |
| Replaces | served `the-republic-modern-en.json`, sha256 `02082bbef9bf9026cdcdb11c0bc60e0e518a832d63f19dcbcab65ca794078f57` |
| Baseline (original-en, unchanged) | sha256 `338cc5908ed34b108c6775dad4e437feccb19ba86f6fdcd868ea5821d777b0a6` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.628, light + mechanical 0/10 = 0.0%, identical long paragraphs 0/2015 = 0.0%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py the-republic --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (10 chapters, 4308 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 193 modern-en mentions: 192 unchanged, 1 moved (proposed re-anchors), 0 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 218 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
