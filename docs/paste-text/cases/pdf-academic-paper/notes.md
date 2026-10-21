# pdf-academic-paper — notes

Synthetic paper, written for this corpus, as `text/plain` the way macOS Preview / Chrome's PDF viewer put a drag selection over three pages on the clipboard: one line per printed line, no blank lines, ligature code points, running heads and page numbers inline. No HTML flavour exists for this paste. (Real PDFs go through Add a book's PDF path, `pdf-text.js`; this case is for people who paste from a PDF anyway.)

Rules tested:

- R02 Ligatures `ﬁ ﬂ ﬀ ﬃ ﬄ` → `fi fl ff ffi ffl` (NFKC on these code points only; full NFKC would also flatten superscripts and the `–` in page ranges is untouched).
- R27a Paragraphs without blank lines: a line ends a paragraph when it ends in `.?!:”)` and is clearly shorter than the text measure (< 85 % of the median line length), or when the next line is a heading. "say anything about it." ends one; "(d = 0.61), while … We" does not.
- R27b Hyphenated line ends: `compre-`/`hension` → "comprehension", `Parti-`/`cipants` → "Participants", `toge-`/`ther.` → "together.", `high-`/`lighting` → "highlighting". Keep the hyphen when the joined-with-hyphen form occurs elsewhere in the paste (`Ninety-`/`six` → "Ninety-six", because "Ninety-six adults" appears in 2.1) or when the next fragment starts with a capital or a digit.
- R27c Running heads and page numbers: lines that repeat at page breaks (`JOURNAL OF READING RESEARCH 14 (2025) 112–131`, an all-caps author or short-title line) and a bare number line between them are removed, and the sentence that was split by them is joined ("Less is known about" + "generative annotation").
- R27d Footnote call glued to punctuation: "2013).1 Less" → "2013). Less" when a line starting with "1 " follows later on the same page; that line and its continuation become note [1] under `### Notes` at the end of the section.
- R30 Numbered top-level headings ("1 Introduction", "2 Method", "3 Results") are chapter-like: each starts a section even though the paste is short; "2.1 …" are subheadings. "Abstract" is a heading by its exact text.
- R31 Title = the lines before the author line, joined ("…Habits and" + "Delayed Recall…"); author line "Maya Okafor1 and Lukas Brandt2" → affiliation digits removed; affiliation lines ("1 Department of …") dropped.
- R21/R27e A table flattened by the PDF viewer is not rebuilt: caption stays a paragraph and its rows are kept as lines. Figure caption with no image stays a paragraph.
- Hard part: "SD =" at a line end must join with a space, and "(M =" / "6.1" too; a numeric line start must not be taken as a page number when it continues a sentence ("2.4) than those…").
