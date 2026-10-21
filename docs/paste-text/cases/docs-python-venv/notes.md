# docs-python-venv — notes

Real Python documentation page for `venv` (PSF licence; third-party, excerpt only), Sphinx markup. Clipboard = `div.body` + footer.

Rules tested:

- R14 Sphinx cross-references `a.reference.internal` / `a.reference.external` are ordinary links (the class "reference" must not trigger the Wikipedia citation rule — class rules apply to `sup`/blocks, never to `<a>`).
- R17 Heading permalinks `a.headerlink` ("¶") dropped; `<code>` in headings → title "venv — Creation of virtual environments" (code markup not kept in titles).
- R18 `div.highlight pre` → fenced blocks, prompts (`$`, `>>>`, `c:\>`) kept as typed.
- R16 `ul.simple` lists, option lists, and `dl.py` API entries (class/method signatures as bold labels followed by descriptions).
- R28f Admonitions "See also", "Note", "Warning", "Availability" → quotes with a bold label; "Added in version 3.3.", "Changed in version 3.5:", "Deprecated since …" kept as text (they are content in docs).
- R11 Footer, "This script is also available for download", the separator `<hr>` under the title dropped.
- R30 ≈ 3,300 words: `h2` → sections.
