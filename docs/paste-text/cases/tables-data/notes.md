# tables-data — notes

Synthetic page with three kinds of `<table>`: a data table with a two-row header, a layout table, and a key/value table.

Rules tested:

- R21a Data table → table. `<caption>` becomes a paragraph immediately before the table (the reader's "label" kind), not a table row.
- R21b Two-row header with `colspan`/`rowspan` is flattened into one header row; a spanned group label is prefixed to its sub-columns ("Length: Words", "Length: Chapters").
- R21c `<tfoot>` rows stay as the last body rows; a `colspan="2"` cell becomes the cell plus an empty cell.
- R21d Layout table (attribute `width="100%"`, one row, cells that each hold block content such as `<p>`) is unwrapped: each cell's paragraphs in reading order.
- R21e Key/value table (`<th>` in the first column of every row, no header row) stays a two-column table; the GFM header line is synthetic (see Q10).
- R14 Emphasis and `code` inside cells kept.
- R09 Table tools row ("Download CSV · Sort", internal `#` links only) dropped.
- Wide tables: the reader needs horizontal scroll or a stacked layout on phones; not a clean-up question, but this case is the fixture for it.
