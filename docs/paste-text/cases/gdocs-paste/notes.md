# gdocs-paste — notes

Synthetic, but byte-for-byte in the shape Google Docs writes to the clipboard (`text/html`): one outer `<b style="font-weight:normal" id="docs-internal-guid-…">`, every run a `<span>` with a full inline style, `<br>` between blocks, lists with `aria-level`.

Rules tested:

- R14a The outer `<b style="font-weight:normal">` is **not** bold: an element's `style` overrides its tag (`font-weight:400|normal` cancels `<b>`; `font-weight:700|bold|600+` on a span is bold; `font-style:italic` is italic). Without this rule the whole document comes out bold.
- R14b `vertical-align:super` digits after a full stop = a footnote call with no note on the clipboard (Docs does not copy footnote bodies): dropped. (Open question Q1: warn the reader that notes were not copied?)
- R14c Google redirect links `https://www.google.com/url?q=<target>&sa=D…` → the `q` target.
- R17a Title by style: a first paragraph at ≥ 1.6× the body font size (26pt vs 11pt) is the title even though it is a `<p>`; the next large grey paragraph (15pt, `#666666`) is the subtitle (Docs' "Subtitle" style). Author is taken from the subtitle only because it holds "Dr. <Name>"; weak — see Q6.
- R16 `aria-level="2"` / `margin-left` list item nests under the previous item; `list-style-type:lower-alpha` keeps its letter ("a."). Each `<li><p role="presentation">` is one item.
- R21 Docs table (inside `<div align="left">`, `<colgroup>` widths) → table; there is no header row in the source, so the first row becomes the header row of the GFM table only because GFM needs one (renderer note: the reader should not style it as a header — Q10).
- R19 `<br>` between blocks is a no-op (not an empty paragraph).
- R33 `white-space:pre-wrap` leading spaces ("    “He is still waiting…") are trimmed: indentation is not kept outside preformatted blocks.
- R33 The trailing `<br class="Apple-interchange-newline">` is ignored.
