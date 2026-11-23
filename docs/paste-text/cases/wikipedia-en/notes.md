# wikipedia-en — notes

Real Wikipedia article "Bletchley Park" (CC BY-SA 4.0; third-party for this repo, so excerpt only). Clipboard = `#firstHeading` + "From Wikipedia, the free encyclopedia" + the whole `#mw-content-text` (a select-all of the article body), ≈ 13k words before clean-up.

Rules tested:

- R12a `[edit]` links (`span.mw-editsection`, 44 of them) dropped from every heading.
- R12b Citation calls `sup.reference` / `sup.mw-ref` ("[1]", "[a]", "[citation needed]", "[clarification needed]") removed with no space left before punctuation.
- R12c Infobox (`table.infobox`), navboxes, hatnotes ("Main article: …", "For broader coverage …", "See also: …", "Further information: …"), coordinates, "From Wikipedia, the free encyclopedia" dropped.
- R12d Tail apparatus dropped from the first of: "See also", "Notes", "References", "Notes and references", "Bibliography", "Further reading", "External links" (≈ 6k words of references gone). Open question Q1/Q16: keep Wikipedia's explanatory notes?
- R20 Thumbnails → figures; captions are plain text (links inside captions flattened); the infobox image goes with the infobox.
- R14 Internal wiki links are http(s) links and are kept as links (open question Q17: keep or flatten internal encyclopaedia links? they are very dense).
- R30 ≈ 6,700 words after clean-up: `h2` → sections, `h3`/`h4` → subheadings (levels below two collapse).
- License: CC BY-SA requires attribution; front matter carries `license` so a private copy can show it.
