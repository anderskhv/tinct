# arxiv-html — notes

Real arXiv HTML (LaTeXML) rendering of "Attention Is All You Need" (1706.03762v7; third-party, excerpt only). Clipboard = the whole `<article>`.

Rules tested:

- R05/R06 Title from `h1.ltx_title_document`; the author block (`ltx_authors`, names with "thanks:" footnotes, affiliations, e-mails) → author list, dropped from the text. The permission line above the title ("Provided proper attribution is provided, Google hereby grants…") dropped as front matter before the title.
- R14d MathML: inline `<math alttext="h_{t}">` → `$h_{t}$` (the TeX alt text), not the presentation-MathML token soup ("h t h_{t}" on separate lines). Display equations (`ltx_equation`) → their own paragraph in `$…$`. Open question Q19: render TeX, keep as code, or crop like the PDF path does?
- R12b Citation calls `<cite>[<a href="#bib.bib13">13</a>]</cite>` removed with their brackets and the space before them.
- R17 `h6` "Abstract" is a section heading; numbered `h2`/`h3`/`h4` ("3.2.1 Scaled Dot-Product Attention") → sections and subheadings; `h5` paragraph headings ("Encoder:", "Residual Dropout") → bold run-in labels.
- R21 Data tables (`ltx_tabular`) → tables with their captions; figures with captions (`Figure 1: …`).
- R12d "References" section dropped (open question Q16 — for papers the reference list may matter).
- R30 Numbered sections are chapter-like → sections.
