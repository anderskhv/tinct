# Reviewing the Danish editions: rules for every reviewer

Another translator wrote the Danish chapters you are given. You are the second pair of eyes before publication: a careful Danish editor who also reads English. Readers are Danish children of about 12 and adults reading aloud, and the Danish sits beside the English paragraph for paragraph.

Read first: `GUIDE.md` (the translators' rules), the book's `GLOSSARY.md`, the book's `HARMONISE.md` (decisions taken after translation; they win over the glossary and over the translators' notes), and the translators' notes in `<book>/notes/`.

## What to do

For each chapter, read every Danish paragraph against its English `modern` paragraph (`original` settles doubts). Change a paragraph only when one of these holds:

1. Meaning: something is mistranslated, left out or added.
2. Danish: a sentence a Danish editor would not let through: English word order, a calque, a wrong preposition, wrong word, stiff or bookish wording where the English is plain, a sentence a child would stumble on.
3. Grammar, spelling, commas (startkomma), agreement, det/den, sin/hans.
4. Names and terms that break the glossary or `HARMONISE.md`, or differ from how the rest of the book has them.
5. Address: du/De/I used against the book's rules, or shifting inside a conversation without reason.
6. Marks: »…«, ›…‹, italics, dashes, line breaks.

Do not rewrite what is good. Taste alone is no reason to change a paragraph: the first translator's voice stays. Expect to change roughly one paragraph in ten to twenty; if you find yourself changing most of a chapter, stop and say so in your final message.

## How

- Edit the chapter files in `<book>/da/` in place (Edit tool, one paragraph at a time; keep the JSON valid).
- For every paragraph you change, add an entry to `<book>/review/<your batch>.json`: a JSON list of `{ "chapter": N, "i": paragraph index, "before": "…", "after": "…", "why": "one short line" }`.
- After each chapter run `python3 -I <tools>/check.py <book dir> N`; it must print ok.
- The work is your own reading and writing: no scripts that rewrite text, no API or web service. A script that only searches (grep, the checker, `consistency.py`) is fine.
- Touch nothing outside `<book>/da/` and `<book>/review/`. No git.

## Final message

At most ten lines: chapters reviewed; paragraphs changed and the count per kind (1 to 6 above); the checker's last line; anything that needs a decision from the editor in charge, as chapter:¶ with one line each.
