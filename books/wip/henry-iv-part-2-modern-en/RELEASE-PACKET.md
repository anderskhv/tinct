# Release packet: Henry IV, Part 2 (Shakespeare), modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/henry-iv-part-2-modern-en/` |
| Candidate | `candidate.json`, sha256 `d183d462a261483ab01b3f575bd700ea53cd3ff6ecab7bff3d2d4b7e1d421fc1` |
| Replaces | served `henry-iv-part-2-modern-en.json`, sha256 `5488605e212b451b6693e21690babd7690cb5f295a62ffac479519cb394cd203` |
| Baseline (original-en, unchanged) | sha256 `5312386825366dc9945e915fa5474a680d89fcc2dbceb740f84288a4f5e2f38c` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.610, light + mechanical 0/19 = 0.0%, identical long paragraphs 7/445 = 1.6%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py henry-iv-part-2 --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (19 chapters, 1081 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 1547 modern-en mentions: 981 unchanged, 469 moved (proposed re-anchors), 97 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 900 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
