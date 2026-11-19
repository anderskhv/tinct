# medium-post — notes

Synthetic, modelled on Medium's obfuscated-class markup (2025–26). Selection runs from the "Member-only story" label to the "More from…" rail.

Rules tested:

- R03/R07 Drop "Member-only story", the author row ("Follow", avatar image, `·`), "7 min read", clap/response counts ("1.2K", "38"), "Save", "Listen", "Share". These have no semantic tags, only `data-testid` and short text, so the text rule (R07: short block whose whole text is a known control word or a count) is what catches them.
- R05 Title from `h1.pw-post-title`; the `h2.pw-subtitle-paragraph` directly under it becomes `subtitle`.
- R06 Author from the byline link; date from `storyPublishDate` text ("Mar 3, 2026" → 2026-03-03).
- R20 Hero image: the `<picture>`'s widest `srcset` candidate wins over `src`; the caption "Photo by Ana Ruiz on Unsplash" is a pure credit line, so the figure has no caption (credit-only captions are dropped, R20).
- R15 First blockquote (`nt nu nv`, normal quote) is kept. The second blockquote (`pa pb pc`, Medium's pull quote) repeats sentences from the paragraph just above it: dropped as a pull quote (R15: a quote whose words are ≥ 80 % contained in the preceding 3 paragraphs).
- R16 Ordered list kept with numbers; bold lead-ins inside items kept.
- R18 `<pre>` with a `<span>` inside → fenced block; `&gt;` decoded; fixed width only here.
- R11 Tags ("Reading", "Productivity", "Books"), footer claps, "Written by…", follower counts, bio, "Responses (38)", "More from Theo Marsh" dropped. Note that "Written by Theo Marsh" and "More from…" are `<h2>`s: trailing-chrome detection must run before heading → section logic.
- R30 One section (short paste).
