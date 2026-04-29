# Archive

Files moved here are not active in the project but preserved in case they're useful for reference or recovery. **Don't run code from here without checking it's still relevant** — much of it is intentionally retired.

## Folders

### `build-artifacts/`
Heavy binaries that don't belong in the repo or working tree:
- `tinct-debug-2026-04-28.apk` — old Android debug build (54 MB)
- `test.wav` — test audio sample
- `ChatGPT Image Apr 17, 2026 at 01_43_47 PM.png` — random ChatGPT-generated image (3.5 MB)

### `research-notes/`
One-off content drafts kept for traceability:
- `War and Peace — Chapter 1 — Modern Danish.md`, `Modern English.md`, `Original English.md` — early translation reference exports

### `old-scripts/`
One-off content-prep scripts that are no longer used. **Do not run** — most have been superseded:
- `convert-to-json.cjs`, `inject-chapter.cjs`, `inspect-ch24.cjs` — old chapter-data utilities
- `test-back-chapter.cjs`, `test-chapter-back.cjs` — earlier debug scripts
- `generate-editions.cjs` — **explicitly forbidden** for development use per CLAUDE.md (would burn API budget). Kept here only for historical reference.

### `old-docs/`
Strategy / audit / research documents that are no longer active references:
- `AGENTS.md` — pre-2026-04-29 copy of CLAUDE.md (since compressed); kept until we're sure nothing depends on it
- `CONTENT-AUDIT-BRIEF.md`, `CONTENT-AUDIT-PROMPT.md` — old auditing prompts
- `ELEVATOR-PITCH-v1.md` — superseded by current `ELEVATOR-PITCH.md` at root
- `MANIFESTO.md`, `Mission statement.md` — early brand docs
- `RETRO-2026-03-22.md`, `SESSION-SUMMARY-2026-04-27.md`, `TEST-DAY-2026-04-27.md` — historical session/test logs
- `SECURITY-AUDIT.md` — older security audit; current is `SECURITY-AUDIT-2026-04-27.md` at root
- `TINCT-KIDS-CONCEPT.md` — kids editions concept (kids editions permanently dropped per CLAUDE.md)

### `kids-editions/`
Pre-existing archive of kids-edition content from before the kids editions were dropped (2026-03-25 decision). Untouched by the 2026-04-29 cleanup.

## Restoring something
`mv archive/<folder>/<file> .` — moves it back to the root. Or pick a more appropriate destination.

## Cleanup history
- **2026-04-29 evening** — major cleanup. Deleted iCloud sync-conflict duplicates (`*\ 2.*` files in root, `app/scripts/`, and `qa/`). Moved 17 root-level files into the four new subfolders above.
