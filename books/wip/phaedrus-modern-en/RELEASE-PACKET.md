# Release packet: phaedrus, modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/phaedrus-modern-en/` |
| Candidate | `candidate.json`, sha256 `5ad44b8b4dbd819c14936e91514f25d8f02a0c81f728ae7d666adaedf8e9575b` |
| Replaces | served `phaedrus-modern-en.json`, sha256 `a246a86ca83ff33521735c1ff70681037ed4d956f87e71d0812ddf864979e06c` |
| Baseline (original-en, unchanged) | sha256 `687f5a5e9b73892ce4226633fa3371ba3394bc728edbed38d6147303df6c542c` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.708, light + mechanical 0/6 = 0.0%, identical long paragraphs 4/249 = 1.6%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py phaedrus --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (6 chapters, 408 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 657 modern-en mentions: 635 unchanged, 22 moved (proposed re-anchors), 0 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 41 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
