# Release packet: *Democracy in America*, modern-en repair

## Package

| | |
|---|---|
| Branch | `claude/inspiring-ritchie-zi00fu` |
| Folder | `books/wip/democracy-in-america-modern-en/` |
| Candidate | `candidate.json`, sha256 `3d9feeb1806b7c463ba243ffd575c9e4888d4f23c991d415cac8aee5fd79981b` |
| Replaces | served `democracy-in-america-modern-en.json`, sha256 `347cc8f0729f7fe0520163d153554a78e36d82e87b8c59777f4745a74e545662` |
| Baseline (original-en, unchanged) | sha256 `9fbec200460aebc0c454ac87814dd7c13d93a1eff0c4c467078591c3bd5f35a4` |
| Status | content accepted / handed off, **not published** |

## Whole-book gate (unmodified `books/classify-modern-en.py`, scratch mirror; full output in `GATE-OUTPUT.txt`)

Weighted similarity 0.726 (was 0.897), light + mechanical 0/96 (was 57/96), identical long paragraphs 73/2112 = 3.5% (was 194/2112), no truncated quotations, no scaffolding. **GATE PASS.** After integration, re-run `python3 books/classify-modern-en.py democracy-in-america --gate`.

## Integration requirements

1. Replace the served modern-en with `candidate.json` byte for byte. Structure is 1:1 with the served editions (96 chapters, 2,258 paragraphs, same titles and `sections`), so no place, highlight or note migration is needed.
2. Regenerate any chapter shards for this edition from the new file.
3. **Character cards.** Re-anchor the 11 modern-en mentions using `character-card-impact.json` (9 moved, 2 unchanged; proposed slices verified against the candidate). Regenerate `paragraphHashes`/`sourceSha256` for modern-en and bump the card revision. Check snapshot and reveal-point coordinates for the 10 characters.
4. **Audio.** 2,109 paragraphs changed (`changed-paragraphs.json`), which is nearly the whole book. Invalidate stale prepared or cached narration for this edition. Keep fresh Grok streaming; no batch regeneration.
5. **modern-da** is stale against the new English. Do not present it as tracking the new modern-en, and do not generate new Danish.
6. Compare/alignment: paragraph counts equal original-en, so aligned Compare is unaffected.

## Open issues carried forward

See `ACCEPTANCE-RECORD.md`: review depth, per-batch gating not re-run, possible remaining 'State' capitalization, character snapshot coordinates not re-derived, no raw provenance folder, tool notes.
