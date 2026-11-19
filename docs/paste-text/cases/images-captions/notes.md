# images-captions — notes

Synthetic photo essay. Figures are written `![caption](src "alt")`: caption → `ChapterFigure.caption`, title string → `alt`.

Rules tested:

- R20a Lazy loading: `src` is an inline SVG placeholder (`data:image/svg+xml…`); the real file is in `data-src` / `data-srcset`. Use the widest srcset candidate (2048w).
- R20b Caption credit removal: a trailing `<em>Photo: …</em>`, "Photograph:", "Illustration by", "©", "Credit:" segment is cut from the caption; the rest is kept as plain text.
- R20c Emoji images (`img.emoji`, `s.w.org/images/core/emoji`) → their `alt` character inline ("📚"), not a figure.
- R20d Tracking pixels (1×1, `pixel.gif`, `/stats/`) dropped.
- R20e A picture standing alone in a `<p>` is a figure with no caption; its `alt` is kept as alt, never promoted to caption (alt text is description, not caption — open question Q4 for alt-only pictures).
- R20f Gallery: "1 / 3" counter and the next button dropped; each gallery item becomes a figure in order; an item with empty alt and no caption is still a figure.
- R20g Video embeds (`iframe`, `is-type-video`) are dropped together with their caption ("Watch: …").
- R20h A paragraph that is only a blanket photo credit ("All photographs © …") is dropped.
- R06 "Text and photographs by …" byline → author.
- Images are remote URLs: whether Tinct downloads and stores them as `asset:` figures at paste time, or drops them, is open question Q4. The expected output assumes they are kept.
