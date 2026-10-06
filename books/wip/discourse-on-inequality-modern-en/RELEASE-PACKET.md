# Release packet: Discourse on Inequality (Rousseau, Cole), modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/discourse-on-inequality-modern-en/` |
| Candidate | `candidate.json`, sha256 `07d61b6e3daabbe3d82c788120c68ac5ff2fd40bb79ac336aaf2dee7b9e5f504` |
| Replaces | served `discourse-on-inequality-modern-en.json`, sha256 `78356e4ffdf62ec28c056fe871521967da428d31fafe694cad8b064f7019c62f` |
| Baseline (original-en, unchanged) | sha256 `d3e7e7975ac634b98f685abcd7f6aae64b3621a74db31e1d229f2b6cfc4ba3bd` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.713, light + mechanical 0/4 = 0.0%, identical long paragraphs 5/166 = 3.0%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py discourse-on-inequality --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (4 chapters, 170 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 69 modern-en mentions: 3 unchanged, 60 moved (proposed re-anchors), 6 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 167 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
