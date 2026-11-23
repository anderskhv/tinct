# substack-acx — notes

Real Substack post (Astral Codex Ten, ≈ 10,700 words; third-party): excerpt only. The clipboard is the whole `<article>` from title to the Previous/Next row.

Rules tested:

- R05 Title from `h1.post-title`; the subtitle `h3` is literally "..." → dropped (a subtitle with no letters is not a subtitle).
- R06 Author link and date row dropped from the body (author metadata).
- R07 Like/comment/restack counts and "Share" in header and footer dropped; "Previous / Next" dropped.
- R22 Substack footnotes: `a.footnote-anchor` calls removed; `div.footnote` bodies (with `a.footnote-number`) collected at the end of the last section as `### Notes` `[1]…[4]`.
- R25 Embedded post (a tweet card rendered by Substack: name, `@handle`, text, quoted reply, "10:44 PM · Sep 26, 2026 · 456K Views", "552 Replies · 344 Reposts · 2.82K Likes") → a quote with an attribution line; counts and timestamp dropped.
- R15 Quoted blocks from the letter being answered (bold numbered claims in `<blockquote>`) kept as quotes with their bold.
- R20 Captioned images (`captioned-image-container`): figure with caption when there is one; a caption that is only "(source)" link text is dropped to an empty caption (open: keep "source" links?).
- R30 Long paste: the `##` headings split it into sections ("Four Arguments Against Superintelligence", …); the text before the first one is a section named after the title.
- R32 ≈ 10.7k words: a single paste this long must not hit a size limit (fixture for performance too).
