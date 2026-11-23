# blog-code-jvns — notes

Real blog post by Julia Evans (third-party; excerpt only), copied with **Select All** (Cmd/Ctrl+A) — so the clipboard holds the site header, navigation, post, archive link and footer.

Rules tested:

- R03 Select-all chrome: skip link "Skip to main content", site title `hgroup` ("Julia Evans" as an `h1` with a link!), header link list, nav, "Archives", footer credit and blogroll text dropped.
- R05 Two `h1`s: the site name (inside `<header>`, a link to the home page) and the post title. Title = the `h1` that is not inside a header/nav and not a link to `/`.
- R06 Tag "sqlite" and date "July 17, 2026" under the title → metadata.
- R18 `<pre><code>` blocks → fenced blocks, whitespace and `#` comment lines inside them verbatim (they must not become headings).
- R14 Inline `<code>` (also inside headings and links: "[`ANALYZE`](…)") kept.
- R17 `h3` post subheadings → subheadings; bold run-in "**way 2: litestream**" stays bold text, not a heading (it has a link and is part of a sentence-like label).
- R16 Ordered list kept.
- R30 One section (≈ 1,000 words).
