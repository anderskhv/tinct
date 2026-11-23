# plain-hardwrap-72 — notes

Public domain. Gilman's "The Yellow Wallpaper" from Project Gutenberg's plain-text file (#1952): hard-wrapped at ≤ 72 columns, CRLF line ends, blank line between paragraphs, ≈ 6,100 words. Input (`input.txt`, CRLF kept) and full expected output are in this folder.

Rules tested:

- R02 CRLF → LF.
- R26a Unwrap: lines inside a paragraph are joined with one space; a blank line ends a paragraph. Em dashes at a join stay unspaced only when the source had no space (none of the line ends here falls on a dash; the joins are all plain spaces).
- R26 The many one-line paragraphs ("John laughs at me, of course, but one expects that in marriage.") stay separate paragraphs: a single line followed by a blank line is a paragraph, not verse.
- R31 Title from the first short line ("The Yellow Wallpaper") and author from the "By Charlotte Perkins Gilman" line that follows it; both removed from the body.
- R30 One section (no headings, no chapter marks).
- Gutenberg's licence header and footer are not in the paste (the selection starts at the title); if they were, R12f would drop the "*** START OF …" / "*** END OF …" blocks.
