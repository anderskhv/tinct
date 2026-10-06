# Release packet: Coriolanus (Shakespeare), modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/coriolanus-modern-en/` |
| Candidate | `candidate.json`, sha256 `eb92b14b1f870f3a6aa35a9b62890da8ae7163982548f990a5e3694da315fe69` |
| Replaces | served `coriolanus-modern-en.json`, sha256 `cb7175962445184e3d28082130a5eee53b66dee497c1f92d9d516f512de8b488` |
| Baseline (original-en, unchanged) | sha256 `d0381f3053901dbbf81876e9ef4ce8a4dd2829d40c50c3b199a959c5da8468da` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.593, light + mechanical 1/29 = 3.4%, identical long paragraphs 18/564 = 3.2%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py coriolanus --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (29 chapters, 1379 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 1587 modern-en mentions: 1148 unchanged, 408 moved (proposed re-anchors), 31 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 1105 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
