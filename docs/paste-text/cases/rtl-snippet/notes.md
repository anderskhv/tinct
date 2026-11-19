# rtl-snippet — notes

Synthetic page mixing right-to-left Hebrew (Genesis 1:1–3, consonantal Masoretic text, public domain) with English (KJV, public domain). In `expected.md`, `<!-- dir=rtl lang=he -->` marks the next paragraph's direction and language; it stands for a per-paragraph `dir` the reader would need (Tinct editions have no such field today — open question Q14).

Rules tested:

- R29a Document language is the majority by words: `en` (`languages` lists every language found).
- R29b Paragraph direction: a paragraph whose first strong directional character is Hebrew/Arabic is `rtl` (Unicode bidi "first strong" rule, as `dir="auto"` does), whether or not the source had `dir="rtl"` — the last paragraph has no markup at all and still starts with Hebrew.
- R29c A short RTL run inside an LTR paragraph (`<span dir="rtl">תהו ובהו</span>`) stays inline; the paragraph stays LTR. The renderer must isolate it (`<bdi>` / `unicode-bidi: isolate`) so the parenthesis after it does not jump; the clean-up only keeps the run's text.
- R29d Hebrew text is never changed: no NFC/NFKC that would reorder points, no removal of `׃` (sof pasuq) as "punctuation noise".
- R22h Unlinked `<sup>` verse numbers at the start of a paragraph are kept as text ("1 …"), not dropped as footnote calls: only linked or note-shaped superscripts are calls.
- R15 Each `<p>` in a blockquote is its own quote paragraph.
