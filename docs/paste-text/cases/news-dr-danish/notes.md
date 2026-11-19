# news-dr-danish — notes

Real DR (Danish Broadcasting Corporation) news article, Danish (third-party; excerpt only).

Rules tested:

- R29 Language → `da`. Danish must not be mistaken for Norwegian/German by a small stop-word detector ("og", "at", "det", "er", "ikke", "på", "kan" plus `æ ø å`).
- R05 Title in `<h1>` contains a bold prefix (`<strong>Ekspert: </strong>Sådan kan …`): the title is the plain text "Ekspert: Sådan kan hackere …"; bold is not kept in titles.
- R05 Section label link "Indland" above the title dropped; summary paragraph → subtitle.
- R06 "Af" / "Rosa Uldall" / "7 min. siden" (byline over three blocks) → author.
- R26h Danish quotation dash: paragraphs that start with "- " (DR's convention for direct speech) are paragraphs, not list items. Markdown output escapes them as `\- `; in Tinct's edition shape they are plain paragraphs with no `item` kind. Rule: a `<p>` that starts with a dash is never a list; only `<li>` (HTML) or a run of ≥ 2 dash lines without blank lines between them (plain text) is.
- R11 Trailing related-article card ("**Magasin advarer kunder…**") dropped.
- R20 Captions: "(Foto: © Thomas Traasdahl/Ritzau Scanpix)" credit removed.
