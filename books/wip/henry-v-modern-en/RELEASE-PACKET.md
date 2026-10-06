# Release packet: Henry V (Shakespeare), modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/henry-v-modern-en/` |
| Candidate | `candidate.json`, sha256 `ec46baaf614b9f6d78b33c837eb77da6250ce8a108a6676928909c713ff0c04f` |
| Replaces | served `henry-v-modern-en.json`, sha256 `f2b9cab47fef45f65a6bb9b53aec30aaaaa33e9944de3e62ee482df133b9bb42` |
| Baseline (original-en, unchanged) | sha256 `c66a930a2d877fc78b00c4a793a4c63d550f2042609b51c922ec3d9a18da081b` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.597, light + mechanical 0/23 = 0.0%, identical long paragraphs 5/395 = 1.3%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py henry-v --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (23 chapters, 883 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 1324 modern-en mentions: 1026 unchanged, 266 moved (proposed re-anchors), 32 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 608 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
