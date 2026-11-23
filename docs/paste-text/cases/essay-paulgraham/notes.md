# essay-paulgraham — notes

Real essay "How to Work Hard" (paulgraham.com; third-party, excerpt only). 1990s-style markup: nested layout `<table>`s, `<font>`, paragraphs separated by `<br><br>`, source text hard-wrapped at ≈ 70 columns inside the HTML, title only as an `<img alt>`.

Rules tested:

- R21d Layout tables (`width="435"`, one cell holding 3,000+ words) are unwrapped, never rendered as a table.
- R19 `<br><br>` = paragraph break; a single `<br>` would be a line break; newlines in the HTML source are just spaces.
- R31c Title from the title image's `alt` ("How to Work Hard") when there is no heading text; the image itself is dropped (it is text set as a picture). Date line "June 2021" → metadata.
- R15 `<blockquote>` inside a `<font>` inside a table cell → quote paragraphs between the surrounding prose (inline runs before and after it are separate paragraphs).
- R22 Note calls `[<a href="#f1n"><font color=#dddddd>1</font></a>]` removed together with their brackets; the "**Notes**" bold-only line becomes the `### Notes` heading; notes keep their printed "[n]" markers; a note's second paragraph stays.
- R14 Internal links to other essays on the same site are http(s) links → kept as links.
- "**Thanks** to …" bold lead-in paragraph stays a paragraph (bold lead-in, not a heading: it continues with normal text).
