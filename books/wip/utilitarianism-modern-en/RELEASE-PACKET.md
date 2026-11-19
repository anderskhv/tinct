# Release packet: Utilitarianism (Mill), modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/utilitarianism-modern-en/` |
| Candidate | `candidate.json`, sha256 `534c43afa8af1f7dea12997361cd568a0569261d241e72c3fd6f961950a26fa1` |
| Replaces | served `utilitarianism-modern-en.json`, sha256 `7457e909ce911b5043c692ccf51e7ce30266b5824aec22c10997931dfb737361` |
| Baseline (original-en, unchanged) | sha256 `29360c7dbdc7de58c0b4e5794df9dfca5b9ca0199644499f45663130ea3c3acf` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.721, light + mechanical 0/5 = 0.0%, identical long paragraphs 0/94 = 0.0%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py utilitarianism --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (5 chapters, 94 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 42 modern-en mentions: 0 unchanged, 42 moved (proposed re-anchors), 0 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 94 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
