# long-chapter-15k — notes

Public domain. Part I of Conrad's *Heart of Darkness* (Project Gutenberg #219), ≈ 14,300 words, with the book title, byline, the printed contents table and the separators in front of it. Input and full expected output are in this folder.

Rules tested:

- R32c Size: ≈ 90 kB of HTML, one heading. The clean-up must be linear-time and finish in well under a second on a phone; the paste box must not truncate.
- R12e Printed contents (`<h2>Contents</h2>` + a table whose cells are only internal `#` links "I", "II", "III") dropped, and its `<hr>` separators with it.
- R05/R06 `<h1>Heart of Darkness</h1>` → title; `<div class="h2">by Joseph Conrad</div>` → author ("by " stripped).
- R30 The part heading "I" is chapter-like: one section titled "1" by `chapter-title.js`. Open question Q21: should a 14k-word section be split further for the margin view (by scene breaks, or every ≈ 4–5k words at a paragraph boundary)? Tinct's built-in editions keep a chapter whole, so the expected output keeps one section.
- R19 Source line breaks inside `<p>` are spaces.
