# markdown-readme — notes

Synthetic README in GitHub's dialect (raw view copied as `text/plain`), mixing Markdown with inline HTML.

Rules tested:

- R28m Inline HTML inside Markdown is parsed as HTML and cleaned by the same rules: the centred logo `<img>` and the badge row (`img.shields.io`, `/badge.svg`, links wrapping only images) are dropped as decoration (R20: images inside links in a row of ≥ 2 image-only links = badges).
- R05 Title from `<h1>` inside HTML ("marginalia").
- R12 A "Table of contents" heading followed only by in-page `#anchor` links is dropped with its list (printed contents, like `dropPrintedContents` for EPUBs).
- R18 Fenced code keeps its info string (`bash`, `markdown`) and its content verbatim — including Markdown syntax inside the fence, which must **not** be parsed (the `## Middlemarch` line is not a heading, `*here*` is not emphasis).
- R28f GitHub alert `> [!WARNING]` → quote with bold label "Warning".
- R14 Relative links (`CONTRIBUTING.md`, `LICENSE`) are not web links → plain text.
- R11 Trailing `---` + `<sub>` credit line ("Made with ☕ by …") dropped as footer: a final small-text block after a thematic break that contains only credits/links.
- R16 `*` bullets → items.
- R31 No author anywhere → empty (never "inesv" from a footer link).
- R30 One section.
