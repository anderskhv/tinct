# Danish editions for two young readers books: rules for every translator

You translate chapters of a classic children's book into Danish for Tinct, a reading app. The Danish edition sits beside the English one, paragraph for paragraph, so a reader can compare them and switch between them without losing their place. A Danish 12-year-old must be able to read it with pleasure, and so must an adult reading aloud.

## The files

- Source: `<book>/en/chNN.json` holds `number`, `title`, `originalTitle` and `paragraphs`, each `{ "i", "modern", "original" }`.
- Translate the `modern` text. Use `original` (the author's own wording) only to settle meaning and tone. Never translate the old-fashioned wording of `original` instead of `modern`.
- Write `<book>/da/chNN.json` as `{ "number": N, "title": "…", "paragraphs": ["…", "…"] }`: plain strings, UTF-8, one Danish paragraph for each English one, same order, same count.
- Write the whole chapter yourself with the Write tool. Do not script the translation and do not call any API or outside service.
- After each chapter run `python3 -I <tools>/check.py <book dir> N` and fix everything it reports. It must print `ok` for every chapter of yours before you finish.

## What must hold for every paragraph

1. Everything in the English paragraph is in the Danish one, and nothing else is. No summaries, no explanations, no notes, no dropped clauses.
2. Sentences follow the English closely enough that a reader comparing the two columns finds the same thing on the same line. You may split or join sentences inside a paragraph where Danish needs it. No sentence over 60 words.
3. Natural, living Danish. Read each paragraph as a Danish child's book: if it sounds translated, rewrite it. Prefer plain words. Avoid English word order, "som" chains, and calques such as "på samme tid", "i orden til", "gjorde sin vej".
4. Spelling after Retskrivningsordbogen. Comma before subordinate clauses (startkomma), used the same way throughout.
5. Speech: `»…«`. A quote inside speech: `›…‹`. Where a speech runs over several paragraphs, `»` opens every paragraph and `«` closes only the last, exactly as the English does with “ and ”. Comma and full stop go inside the closing mark as in `»Det ved jeg,« sagde hun.`
6. `_italics_` marks stay around the same words. Line breaks (`\n`) in verse, songs and inscriptions stay, with the same number of lines.
7. Dashes stay as `—` where the English has them, written the way the English writes them. No `...` unless the English has it.
8. No English left in the text, apart from names and the few words the book's own guide says to keep.
9. Measures: mile → mil, feet → fod, inches → tommer, yards → meter where the number is rough ("a few yards" → "et par meter"), acres → tønder land. Money stays: pund, shilling, pence.
10. Titles of chapters are translated; keep quotation marks as »…« where the English title has them.

## Names and fixed terms

Follow the book's own guide (`sg/GLOSSARY.md` or `ka/GLOSSARY.md`) exactly: other translators are working on other chapters of the same book and the names must match. If you meet a name, place or recurring term the guide does not cover, choose the most natural Danish, and list it in your notes file with the English beside it.

## Your notes

When you are done, write `<book>/notes/<your batch>.md`: at most 30 lines. List (a) every name or recurring term you had to decide yourself, English = Danish; (b) paragraphs you are unsure about, as chapter:¶ with one line why; (c) verse you translated, as chapter:¶. Nothing else.

## Your final message

Three lines: chapters done, the checker's last line, and the path of your notes file.
