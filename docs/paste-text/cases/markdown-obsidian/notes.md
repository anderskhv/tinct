# markdown-obsidian — notes

Synthetic Obsidian note, copied from the editor (source mode), so the clipboard holds Markdown as `text/plain` only. The paste box must recognise it as Markdown (front matter fence, `#` headings, `- ` lists, `|` tables, `[[`).

Rules tested:

- R01 Markdown detection on `text/plain`: ≥ 2 Markdown signals in the first 40 lines (front matter, ATX heading, list marker, table row, `**`, `[[`). Without detection this paste would show literal `**` and `|`.
- R28a YAML front matter → metadata: `title`, `author`, `created` → date; `tags`, `aliases` dropped. Front matter is never shown as text.
- R28b The `# h1` equal to the front-matter title is not repeated in the body.
- R28c Wikilinks: `[[Homer]]` → "Homer", `[[The Iliad|Iliad notes]]` → "Iliad notes" (alias wins), plain text, not a link (there is no web address).
- R28d Inline tags `#classics #epic` dropped (a `#word` token preceded by space/start and not a heading). The trailing " · " left behind is trimmed.
- R28e Embeds `![[cyclops-krater.jpg|300]]` dropped (the file is not on the clipboard). Open question Q9: show a placeholder instead?
- R28f Callouts `> [!summary] In one line` → quote whose first line is the bold callout title; the callout type word itself ("summary", "quote") is dropped; an empty title would fall back to the capitalised type.
- R28g `==highlight==` → plain text (Tinct marks are the reader's own; pasted highlights are not imported as marks — open question Q8).
- R28h `%% comment %%` dropped.
- R14 `*x*` and `_x_` both → `_x_`; `**x**` kept.
- R16 Nested list indented by 4 spaces in the source → one level of nesting (2 spaces in expected); task list `- [x]` / `- [ ]` → `☑` / `☐` items.
- R21 GFM table kept; the column alignment row (`---:`) is not kept (the reader has no alignment).
- R22 `[^1]` call removed, definition moved to `### Notes` as `[1] …`.
- R30 One section (short); `##` become subheadings.
