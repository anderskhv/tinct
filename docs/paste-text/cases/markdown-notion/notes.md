# markdown-notion — notes

Synthetic Notion page in Notion's Markdown export dialect (what "Copy as Markdown" and the Markdown export produce in 2026).

Rules tested:

- R28i Notion property block: the run of `Key: value` lines directly under the `# h1` ("Created by", "Created time", "Last edited time", "Tags") is page metadata, not text. "Created by" → author, "Created time" → date; the rest dropped. Rule: a block of ≥ 2 consecutive `Word(s): value` lines immediately after the title, whose keys match Notion's property names or appear in the same block, is metadata.
- R28f `<aside>` callout → quote; the emoji icon stays as the first character (it is the callout's label).
- R28j `<details><summary>` toggle → the summary as a bold label paragraph followed by its content (toggles are always expanded).
- R28k Links to `notion.so` pages and relative export links (`Untitled%20….csv`) → plain text; a link-only paragraph to an export file ("Untitled") is dropped. External http(s) links would be kept.
- R28l Mentions `@Priya Nair`, `@November 4, 2026` → plain text without `@`; the double spaces Notion leaves after mentions collapse (R33).
- R16 Task list items with two spaces after `]` → ☐/☑ items.
- R19/R33 `---` thematic break → `* * *`.
- R21 Table kept.
- R30 One section (short).
