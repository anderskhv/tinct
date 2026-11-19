# poem-verse — notes

Public domain. Keats, "Ode to a Nightingale", from Project Gutenberg #23684 (an annotated school edition): verse set as `div.poem > div.stanza > span.iN` lines with `<br>`, indentation classes, margin line numbers, inline print page numbers. Input and full expected output are in this folder.

Rules tested:

- R19a Verse: every `<span class="i0|i1|i2|i3">…<br></span>` is one line (`line` kind); every `div.stanza` boundary is a blank line between stanzas. Line breaks must survive.
- R19b Indentation classes (`i1`–`i3`) are not kept (Tinct's line kind has no indent) — open question Q22.
- R13b Margin line numbers `<span class="linenum"><a …>10</a></span>` removed from the ends of lines 10, 20, 30…
- R13a Print page markers `[<a href="images/108.png">108</a>]` (links to page scans) removed, including the ones before the title and at the start of a stanza-number line.
- Stanza numbers ("1.", "2.") stay as their own short paragraphs (escaped `1\.` in Markdown so they are not list items).
- R30 The `h2` title "ODE TO A NIGHTINGALE." is the only heading → section title and book title; normalised to "Ode to a Nightingale" by `chapter-title.js`.
- R31 No author in the selection → empty (the book's author, Keats, is not invented).
