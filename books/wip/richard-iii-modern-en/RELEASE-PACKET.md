# Release packet: Richard III (Shakespeare), modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/richard-iii-modern-en/` |
| Candidate | `candidate.json`, sha256 `ef3386e3688784603bb96438d431c5c4dbb951faefa8015d5b4d8ea858a6a764` |
| Replaces | served `richard-iii-modern-en.json`, sha256 `30204ef16006235b5dfad0a5281469da176f220f6b89e97f071efb523ce56b6f` |
| Baseline (original-en, unchanged) | sha256 `891ead74f6cbcfa6acd05afc92b3e7798c4aa2105a1e7011086e8b2853e3a449` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.608, light + mechanical 0/25 = 0.0%, identical long paragraphs 0/562 = 0.0%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py richard-iii --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (25 chapters, 1420 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 1879 modern-en mentions: 1470 unchanged, 367 moved (proposed re-anchors), 42 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 964 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
