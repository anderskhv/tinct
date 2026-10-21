# standard-ebooks — notes

Public domain / CC0. Chapter I of Austen's *Persuasion* from Standard Ebooks' per-chapter page, copied with Select All (XHTML served as HTML; `epub:type` attributes; site nav header and prev/next footer). Input and full expected output are in this folder.

Rules tested:

- R03 Site `<header><nav>` and `<footer>` (Previous/Next chapter links) dropped.
- R03 exception: a `<header role="presentation">` **inside a `<blockquote>`** ("Elliot of Kellynch Hall.") is content — the header-drop rule only applies to page-level headers (outside `main`/`article`/`section` content or containing site navigation).
- R15 The Baronetage entry is a blockquote of two paragraphs; `<time>` and `<abbr>` inside are plain text.
- R30 `<h2 epub:type="z3998:ordinal z3998:roman">I</h2>` is chapter-like → section "1" (`chapter-title.js`).
- R31 No book title in the selection (the page `<title>` "Persuasion - I" is not on the clipboard): title empty; `title_from_source_url` and `author_from_source_url` show what a source URL would give. Open question Q23: read `text/x-moz-url` / CF_HTML `SourceURL` when the browser provides it?
- Hidden honeypot link ("Following this link will ban your IP for 24 hours", hidden by CSS on the live page) is not in the clipboard because browsers do not copy `display:none` text; if a paste ever contains it, the text rule drops it.
