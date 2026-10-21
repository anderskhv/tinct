# gutenberg-chapter — notes

Public domain. Chapters I–II of *Pride and Prejudice* from Project Gutenberg's illustrated HTML (eBook #1342, the 1894 George Allen edition with Hugh Thomson's illustrations), cut from the page as a drag selection would copy it; image paths made absolute. Input and full expected output are in this folder.

Rules tested:

- R13a Print page numbers: `<span class="pagenum"><a id="page_2">{2}</a></span>` inside sentences and between paragraphs removed without leaving a space before the closing quote ("at last?”").
- R23 Drop caps two ways: a `<span class="letra">I</span>T is` (letter as text) and `<span class="letra"><img alt="M" …></span>R. BENNET` (letter as an image whose `alt` is the letter). Both are merged into the first word ("IT is", "MR. BENNET"); the drop-cap image is never a figure. No case normalisation of the small-caps lead-in (open question Q20).
- R20 Illustrations in `div.figcenter` with `div.caption` → figures with captions; the "[Copyright 1894 by George Allen.]" credit line inside the caption dropped.
- R20/R17 A headpiece illustration **inside** the `<h2>` (with its own caption "I hope Mr. Bingley will like it.") is taken out of the heading: heading text "CHAPTER II." and a figure right after the heading.
- R30 Chapter-like headings always start sections, even in a short paste. Section titles go through Tinct's `chapter-title.js` (`normalizeTitleList`), after removing a trailing full stop: "Chapter I." → "Chapter 1", "CHAPTER II." → "Chapter 2".
- R31 There is no book title in the selection and the first heading is a chapter heading: the title is left empty for the reader to fill (`title_from_source_url` shows what a source URL would give).
- R14 `<i>` emphasis; `M<sup>r.</sup>` superscript abbreviation in a caption → "Mr." (a `<sup>` that is not a number is text).
