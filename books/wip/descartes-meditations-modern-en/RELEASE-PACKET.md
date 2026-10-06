# Release packet: Meditations on First Philosophy (Descartes, Veitch), modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/descartes-meditations-modern-en/` |
| Candidate | `candidate.json`, sha256 `584a1672898ec27470c8be0643d84c4c5a6db32c1422e03f52d90566cc552b37` |
| Replaces | served `descartes-meditations-modern-en.json`, sha256 `789863ff9c80db5b86ba5d351db4ad2b1067dab0539bd118a7d66a2aba65ea51` |
| Baseline (original-en, unchanged) | sha256 `98e410390472e0f6e3701987e10f2b44974cdac1e277ba4d520a9e959103961a` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.668, light + mechanical 0/9 = 0.0%, identical long paragraphs 0/144 = 0.0%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py descartes-meditations --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (9 chapters, 144 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 189 modern-en mentions: 4 unchanged, 183 moved (proposed re-anchors), 2 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 143 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
