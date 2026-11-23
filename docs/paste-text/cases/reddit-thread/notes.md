# reddit-thread — notes

Synthetic thread in new-Reddit custom-element markup (`shreddit-post`, `shreddit-comment`, slots). Old Reddit and Discourse forums need the same decisions with different selectors.

Rules tested:

- R25a Thread shape: the post body is the main text under the post title; each top-level comment becomes a subheading with the commenter's name followed by the comment; a reply (depth ≥ 1) becomes a quote whose first line is the bold name. Deeper nesting is flattened to one quote level. (Open question Q7: keep comments at all? Keep usernames?)
- R06 Post author/date from attributes (`author`, `created-timestamp`) → metadata; "r/books", "9 days ago", "Join", flair "Discussion" dropped.
- R07 Action rows (scores "1.8K", "921", "Reply", "Award", "Share", "Vote") dropped; "OP" kept as a marker in the reply label.
- R25b Deleted/removed comments (`[deleted]` author with `[removed]` body) dropped entirely.
- R25c Edit noise: a final paragraph starting "Edit:" that only thanks for awards/upvotes is dropped; "Edited 8d ago" meta dropped. (A substantive "Edit:" is kept — open question Q7.)
- R10/R08 "Sort by", "Search Comments", "More replies", "Promoted" ad dropped.
- R14 Emphasis in comments kept.
- R30 One section.
