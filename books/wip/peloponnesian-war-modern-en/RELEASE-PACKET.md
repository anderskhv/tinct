# Release packet: History of the Peloponnesian War (Thucydides, Crawley), modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/peloponnesian-war-modern-en/` |
| Candidate | `candidate.json`, sha256 `7343a0ac70f35635ac37d5fa6cb2429401cf572754a62891fe8dff24111f4fd6` |
| Replaces | served `peloponnesian-war-modern-en.json`, sha256 `c035038d032ca4ec110b18df43b68d5a15c33cfef7c934170699a51313b90f75` |
| Baseline (original-en, unchanged) | sha256 `e50ada55ab4db8be8238f5b201f241478ff145f75073b79e09af48472e5f3d6a` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.714, light + mechanical 0/26 = 0.0%, identical long paragraphs 4/991 = 0.4%, no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py peloponnesian-war --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (26 chapters, 998 paragraphs, same titles), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** 394 modern-en mentions: 49 unchanged, 344 moved (proposed re-anchors), 1 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file. Re-anchor using `character-card-impact.json`, regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates.
4. **Audio.** 980 paragraphs changed (`changed-paragraphs.json`). Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md` (review depth, silent source corrections, character coordinates not re-derived).
