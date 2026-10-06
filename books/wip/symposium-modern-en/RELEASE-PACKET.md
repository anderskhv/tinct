# Release packet: Symposium (Plato, Jowett), modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/symposium-modern-en/` |
| Candidate | `candidate.json`, sha256 `e4f94572995511b16096d9dd5d04752df8769c9584be457baf8d1a7e6a0355c2` |
| Replaces | served `symposium-modern-en.json`, sha256 `1e970b7beb3f098095ecf1a9fc7d78a8855d75e6ffc3bba14edc69db0e05374f` |
| Baseline (original-en, unchanged) | sha256 `3521a12d5d5acd6d4ac83f53747192c5ae592f7bf5e965c9c9bff881965495a6` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.696, light + mechanical 0/8 = 0.0%, identical long paragraphs 5/170 = 2.9%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py symposium --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (8 chapters, 226 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 531 modern-en mentions: 67 unchanged, 459 moved (proposed re-anchors), 5 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 217 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
