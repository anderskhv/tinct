# news-guardian-review — notes

Real Guardian book review (third-party): excerpt only; full clipboard HTML in the scratchpad corpus. The selection includes the hero image above the headline and the "Explore more on these topics" block, comments stub and "Most viewed" heading below.

Rules tested:

- R23 Drop cap: `<span style="color:var(--drop-cap);font-weight:700">T</span>he poet laureate…` → "The poet laureate". The inline `font-weight:700` must **not** make the letter bold (drop-cap detection wins over R14a style mapping: a single letter span at the start of the first paragraph, followed directly by lowercase letters).
- R19 Quoted verse: `<p>` with one `<em>` per line separated by `<br/>` → one `line` paragraph per verse line, emphasis per line (`_…_` opens and closes on each line, never across a line break).
- R05 Kicker link "Review" above the h1 dropped; standfirst → subtitle; "Book of the day / Poetry" aside dropped.
- R06 Byline aside "Philip Terry Tue 20 Oct 2026 02.00 EDT Last modified on …" → author; dates dropped.
- R20 Hero image caption keeps the description and drops "Photograph: Fine Art Images/Heritage Images/Getty Images"; an inline image with no caption is kept as a figure.
- R11 "Explore more on these topics" + tag list, "Reuse this content", "Comments (…)", "Most viewed" dropped.
- R30 One section (≈ 1,200 words).

Spot check (outside the committed excerpt): the first quoted passage must come out as ten `line` paragraphs, each wrapped in its own emphasis, starting

```
_He witnessed great depths, saw the land’s bedrock._
_Astute in all subjects, wise in every matter,_
```

and the second passage's last line must be `_A turtle dove answered the cries of a pigeon._` (the source closes the italic before the full stop and opens a second `<em>` just for the ".": adjacent emphasis runs merge, so no `__` is left inside the line).
