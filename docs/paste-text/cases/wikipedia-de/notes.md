# wikipedia-de — notes

Real German Wikipedia article "Fahrrad" (CC BY-SA; excerpt only). Same apparatus as `wikipedia-en` with German section names.

Rules tested:

- R29 Language detection → `de` (no `lang` on the clipboard fragment; detected from text). The detected language decides primer/quiz language and the reader's hyphenation.
- R12d German tail sections dropped from the first of: "Siehe auch", "Literatur", "Weblinks", "Einzelnachweise", "Anmerkungen" — the tail list must be per language (open question Q18: which languages do we ship lists for; English-only strategy means a fallback by position: trailing sections made only of lists of links/citations).
- R12c "Hauptartikel: …" hatnotes dropped.
- R20 Several thumbnails before the first paragraph stay as figures at the top of the first section.
- R14 `„…“` German quotes untouched.
- R30 ≈ 7,000 words: sections at `h2`, subheadings at `h3`/`h4`.
