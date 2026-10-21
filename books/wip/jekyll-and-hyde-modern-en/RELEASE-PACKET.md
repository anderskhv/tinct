# Release packet: jekyll-and-hyde, modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/jekyll-and-hyde-modern-en/` |
| Candidate | `candidate.json`, sha256 `640dc4ea5d7d56f4b015b000404b5275c5cf9223b9979ed6bfb3765155c4883d` |
| Replaces | served `jekyll-and-hyde-modern-en.json`, sha256 `7bcc0ee81b68635f017b8324fab9dc2e4cc3fc0febb827e0431ce876a2d0ac6b` |
| Baseline (original-en, unchanged) | sha256 `dc134b812fa478e45dfbe647db97ad0294463587b4b68a01a956f5c9fb34532b` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.701, light + mechanical 0/10 = 0.0%, identical long paragraphs 1/256 = 0.4%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py jekyll-and-hyde --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (10 chapters, 339 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 504 modern-en mentions: 272 unchanged, 232 moved (proposed re-anchors), 0 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 236 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
