# Release packet: The Winter's Tale (Shakespeare), modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/winters-tale-modern-en/` |
| Candidate | `candidate.json`, sha256 `ed6f069e41b68ed0d99009e2cb8fe7d8f429b70ce7de87283cf3eb8f23031e24` |
| Replaces | served `winters-tale-modern-en.json`, sha256 `b85a81abca26b0a3d5ba2afe80e39afc13618c44b1de3addff024be57d53c346` |
| Baseline (original-en, unchanged) | sha256 `e725492b2ca705fc0dc46687b555a88e106100dff1b76a2cc0900473ea0b4295` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.589, light + mechanical 0/15 = 0.0%, identical long paragraphs 0/457 = 0.0%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py winters-tale --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (15 chapters, 911 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 1059 modern-en mentions: 921 unchanged, 138 moved (proposed re-anchors), 0 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 660 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
