# docs-list-heavy — notes

Synthetic Docusaurus page (the most common docs generator; Sphinx is covered by the real `docs-python-venv` case).

Rules tested:

- R12 Docs chrome: breadcrumbs, version badge, "On this page" button and the desktop table of contents, "Edit this page", "Last updated on …" (→ date), "Was this page helpful? Yes No", previous/next pagination.
- R17 Heading anchors: `a.hash-link` with a zero-width space and "Direct link to …" `aria-label` contributes nothing; heading text has no trailing `​` (U+200B) or `#`.
- R28f/R15 Admonition (`theme-admonition-note`) → quote with bold label "Note" (label capitalised; the icon SVG dropped).
- R16e Nested lists keep their nesting (two levels here; deeper levels flatten to two — Q15). A list item that contains a sub-list keeps its own text ("the file is one of:").
- R16b `<ol type="a">` → items labelled "a.", "b.", "c."; numbering of the outer list continues correctly after a nested list (3., 4.).
- R16c Emoji at item start kept (⚠️, ❌).
- R14 `<kbd>` → inline code.
- R18 Prism code block: one `<span class="token-line">` per line with `<br>` → fenced block with real newlines, language from `language-bash`; the "Copy" button inside the code container dropped.
- R16d Definition list `<dl>`: each `<dt>` becomes a bold label line and its `<dd>` the line right after it (label + value, the reader's `label` kind).
- R30 One section; h2 → subheadings.
