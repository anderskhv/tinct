# Middlemarch — session A

ORIGINAL READY

Original commit: `57bc3147ee91befe5385eb31bbde0a55bc0c58ad`
Branch: `content/middlemarch-codex-a`

Validated Gutenberg 145 Title/Author. Complete original: Prelude + 86 chapters + Finale, 88 flat units, 4,674 paragraphs. Book ranges and source SHA-256 in SOURCE.md. Source CRLF/trailing whitespace retained byte-for-byte in raw download.

Modern-en: NOT READY. Session A owns Prelude and chapters 1–12 in `parts/modern-en.mm-a.json`; rendering begins next. No other session files edited. Nothing published.

## Session mm-c — DONE through 37

- Branch: `content/middlemarch-codex-mm-c`, based on source branch commit `d67f0de0906b674e0a66487a54776676ad88a567` after verifying `ORIGINAL READY`.
- Owned content: `books/wip/middlemarch/parts/modern-en.mm-c.json`. Only this file and this session's status section changed.
- **DONE through 37**: chapters **27–37**, all **624** original paragraphs, original chapter numbers and titles, unchanged `chapters`/`sections` schema.
- This continuation appended chapters **34–37** only: **311** paragraphs (45, 53, 101, 112), with all five epigraph paragraphs preserved verbatim. Chapters **27–33** remain unchanged from checkpoint commit `1367c1b8`.
- Chapters **38–40 belong to another session in a separate file**. They were not touched and are not a resume assignment for mm-c.
- Read-only batch gate, chapters **34–37**: **PASS**; weighted similarity **0.415**; LIGHT/MECHANICAL **0/4**; identical long paragraphs **5/277** (preserved epigraphs); wrapped scaffolding **0**; truncated quotations **0**.
- Read-only whole-part gate, chapters **27–37**: **PASS**; weighted similarity **0.417**; LIGHT/MECHANICAL **0/11**; identical long paragraphs **5/548**; wrapped scaffolding **0**; truncated quotations **0**.
- Each gate ran once using the existing `books/classify-modern-en.py` main function with absolute-path JSON inputs and matching source chapters supplied in memory. No gate copies, script changes, or application outputs. Displayed chapter labels are positional; the candidate retains real chapter numbers **27–37**.
- Structure checks passed for chapter numbers, titles, paragraph counts, nonempty strings, preserved epigraphs, and unchanged chapters 27–33. All paragraphs below 75% of source word count were inspected: natural compression, no missing content. Manual first/middle/last chapter spot-read complete. `git diff --check` passed.
- Candidate SHA-256: `778f1802913fc0d12d788373853ab09491c3ba40318307f662ed4713a9f653d8`.
- Not published. This assigned part is complete; integration and final book acceptance remain separate work.
