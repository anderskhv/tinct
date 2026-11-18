# Release packet: Poetics (Aristotle, Butcher), modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/poetics-modern-en/` |
| Candidate | `candidate.json`, sha256 `c14bf2d099284fad9b2801ba2272ef92ce9be3ba3e1eb43dfa789febd2f17323` |
| Replaces | served `poetics-modern-en.json`, sha256 `20c7f0695e0360b9ea800ae11c0720bfe38d1e7e85b828d0a19bed542a9b175e` |
| Baseline (original-en, unchanged) | sha256 `00113ffc33cceda9f2e3efd76a4e2c6f0d058b0174554248beba39c82354dd27` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.669, light + mechanical 0/26 = 0.0%, identical long paragraphs 1/126 = 0.8%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py poetics --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (26 chapters, 130 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 221 modern-en mentions: 7 unchanged, 213 moved (proposed re-anchors), 1 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 128 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
