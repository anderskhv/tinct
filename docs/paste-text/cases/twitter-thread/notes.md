# twitter-thread — notes

Synthetic X (Twitter) thread as `text/plain`, the way a drag selection over the conversation view comes out: every UI element on its own line, counts without labels. (The `text/html` flavour of the same selection is a wall of nested `div`/`span` with `data-testid`; the plain flavour is the more useful one here — see R01.)

Rules tested:

- R01 Flavour choice: when the HTML flavour has no block structure beyond `div`/`span` and the plain flavour has the same words, prefer the plain one (open question Q11).
- R25d Thread reassembly: recognise the repeating post header (display name line, `@handle` line, optional `·` line, date line) and keep only the post text that follows it; consecutive posts by the same handle are one text, one paragraph per post.
- R25e Drop counters (lines that are only a number with optional K/M suffix: replies, reposts, likes, bookmarks, views), "Views", "Show more", "Post", "See new posts", "Conversation".
- R25f Drop thread numbering: "1/6", "2/", "6/6" at the start or end of a post.
- R25g Stop at the first post by another author or at "Discover more" / "More replies" / "Sourced from across X".
- R31 Title: first post's first sentence, without the emoji and parenthetical, ≤ 12 words → "A thread on why I reread the same novel every January". Author "Noor Haddad (@noorreads)"; date from the first post's timestamp line ("9:04 AM · Jan 3, 2026").
- R14 A bare URL stays as text (the reader links bare addresses by itself).
- R33 Emoji are text and are kept (🧵, 👇).
- A blank line inside a post (post 4) keeps the paragraph break.
