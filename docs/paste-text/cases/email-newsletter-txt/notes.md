# email-newsletter-txt — notes

Synthetic newsletter in the plain-text MIME part a mail client copies (Mailchimp's text conversion: `** ` headings, rules of dashes, links as `text ( url )`, numbered link references).

Rules tested:

- R26a Unwrap hard-wrapped prose (≈ 64–66 columns here) into paragraphs; keep line breaks in short-line blocks: the sign-off "Until next Sunday, / Ruth" is two lines (an address-like block: every line short and the first ends with a comma).
- R26b `** WORD` lines between dash rules are headings. ALL-CAPS headings are set in sentence case ("WHAT I READ" → "What I read") with the same normaliser as chapter titles; the numbering "1." is kept.
- R26c Lines of `-`, `=`, `_`, `*` (≥ 10) are rules, not text; the rule directly under the masthead and around headings disappears with the heading; nothing else becomes a scene break here.
- R26d Masthead: "** THE LONG SHELF" + "Issue 41 · Sunday 19 October 2026" → title "The Long Shelf — Issue 41" and date. (Open question Q6: newsletters have no natural title; is masthead + issue the right prefill?)
- R26e `*` / `-` bullets → items; `*Middlemarch*` (asterisks around one word or phrase, no spaces inside) → emphasis.
- R26f E-mail quote blocks `> …` stay quotes; `-- Name` attribution → `— Name` inside the quote.
- R26g Numbered link references `[1]` resolved: an item ending in `[n]` whose reference line `[n] https://…` exists becomes a link on the item text; the reference lines are removed.
- R10/R11 Footer from the `=====` rule down: "Forwarded this email? Subscribe…", "You are receiving this…", "Unsubscribe … | Update preferences", copyright, mailing address → dropped. Header "View this email in your browser ( … )" → dropped.
- R14 `text ( https://… )` inline link syntax → link (only in the dropped header/footer here).
- R31 Author from the sign-off name ("Ruth") — weak signal; open question Q6.
