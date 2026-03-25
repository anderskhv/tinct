# Book Factory — Tinct

This folder is the preparation workspace for adding new books to Tinct. Each book goes through a standardized pipeline from raw source text to fully registered, translated, audio-ready edition.

## Quick Start

Open Claude from this folder and say: **"add [book name]"**

The CLAUDE.md will guide the full pipeline:

1. **Structure discussion** — chapter division, editions, metadata (requires approval)
2. **Download source** — from Project Gutenberg or equivalent
3. **Parse to JSON** — using `parse-gutenberg.py` or custom parser
4. **Generate translations** — modern English + modern Danish via CLI (zero API spend)
5. **Register in app** — add to `bookRegistry.ts`
6. **Generate audio** — Edge TTS (free, no API key)
7. **Visual QA** — verify every chapter renders correctly

## Tools

- `parse-gutenberg.py` — Parses Gutenberg plain text into edition JSON. Run with `--help` for usage.
- `raw/` — Raw downloaded source texts go here, one subfolder per book.
- Per-book subfolders (e.g., `war-and-peace/`) — Custom parsers and editorial notes.

## Status

| Book | ID | Chapters | Editions | Status |
|------|----|----------|----------|--------|
| The Odyssey | odyssey | 24 | original-en, verse-en, modern-en, modern-da | Complete |
| Ulysses | ulysses | 18 | original-en, modern-en, modern-da | Complete |
| War and Peace | war-and-peace | 239 | original-en, modern-en (in progress) | In progress |
