# Source provenance: Plato, *Symposium*, trans. Benjamin Jowett (PG #1600)

## Pinned files

| File | Retrieved from | Retrieved (UTC) | Server `Last-Modified` | Bytes | sha256 |
|---|---|---|---|---|---|
| `pg1600-images.html` | https://www.gutenberg.org/cache/epub/1600/pg1600-images.html | 2026-09-25 09:50:31 | Tue, 01 Sep 2026 14:20:01 GMT | 226,817 | `c69cb6e73dbf4c855a5e9f4b01d838445c7ad2dc069a1fa3ce8b8163a2fece0d` |
| `pg1600.txt` | https://www.gutenberg.org/cache/epub/1600/pg1600.txt | 2026-09-25 09:50:32 | Tue, 01 Sep 2026 14:20:00 GMT | 200,974 | `8b5c599ea734ff0f5e8d83f399dead8c796800897b107c8d53fa909f74a05d6f` |

Both files are stored here byte for byte, with the Project Gutenberg licence intact. `https://www.gutenberg.org/ebooks/1600.txt.utf-8` redirects to the same `pg1600.txt` and returned identical bytes.

## Identity and rights

The Gutenberg header reads `Title: Symposium`, `Author: Plato`, `Translator: Benjamin Jowett`, `Release date: January 1, 1999 [eBook #1600]`, `Most recently updated: November 7, 2008`, `Credits: Produced by Sue Asscher, and David Widger`. This matches the live registry edition label `Jowett (1871)` (`app/src/data/bookRegistry.ts`, `SYMPOSIUM.editions[original-en]`).

Jowett died in 1893 and the translation is in the public domain. Project Gutenberg distributes the eBook "for the use of anyone anywhere in the United States and most other parts of the world at no cost and with almost no restrictions whatsoever".

## What counts as the dialogue

Both files contain three layers. Only the third is reading text.

1. **Gutenberg boilerplate.** This is the header before `*** START OF THE PROJECT GUTENBERG EBOOK SYMPOSIUM ***` and everything from `*** END OF THE PROJECT GUTENBERG EBOOK SYMPOSIUM ***` onward, including the licence. It is excluded.
2. **Jowett's introductory essay.** It runs from `INTRODUCTION.` ("Of all the works of Plato the Symposium is the most perfect in form…") to "…the desire to bring together in a series the memorials of the life of Socrates." That is 52 paragraphs. It is Jowett's commentary, not Plato, and is excluded.
3. **The dialogue.** It begins after the second heading `SYMPOSIUM`.
   - Two front-matter lines come first: `PERSONS OF THE DIALOGUE: Apollodorus, who repeats to his companion the dialogue which he had heard from Aristodemus, and had already once narrated to Glaucon. Phaedrus, Pausanias, Eryximachus, Aristophanes, Agathon, Socrates, Alcibiades, A Troop of Revellers.` and `SCENE: The House of Agathon.` These are Jowett's dramatis personae. They are not spoken text and are not included. This follows every Tinct Jowett edition: Phaedrus, Phaedo, Crito and Republic Book 1 all begin with the first spoken line.
   - The spoken dialogue has **180 paragraphs and 22,077 words**. It runs from "Concerning the things about which you ask to be informed I believe that I am not ill-prepared with an answer…" to "…In the evening he retired to rest at his own home."

## HTML and TXT agree

Each file was parsed independently: HTML `<p>` blocks in one case, blank-line paragraphs in the other. Both yield the same 182 blocks: the two front-matter lines plus 180 dialogue paragraphs. After normalising whitespace, they are identical except in one respect. The HTML prints U+2014 `—` wherever the TXT prints `--`. The HTML dialogue has no other non-ASCII character and no inline markup.

The live `original-en` edition is pure ASCII and uses `--`, so the restored passages use the TXT form. `coverage/passage-coverage.tsv` records a hash of each dialogue paragraph in both forms.

## Jowett's inline notes

The Gutenberg text keeps Jowett's footnotes inline in parentheses. Examples are `(compare Prot.)`, `(A fragment of the Sthenoaoea of Euripides.)` and `(supra Will you have a very drunken man? etc.)`. The restored opening contains one of these, a note on Glaucon's greeting: `(Probably a play of words on (Greek), 'bald-headed.')`, where `(Greek)` appears to mark Greek type that the transcription does not reproduce.

The live `original-en` keeps all 20 other inline notes verbatim, so the restored note is also kept verbatim. The live `modern-en` omits all 20, and the Republic modern edition also dropped Jowett's comparable pun note (Republic 7.257). The restored modern paragraph therefore omits this note too. See `CHANGES.md`, change C-02.

## Upstream typographical slips (reproduced, not corrected)

These are Gutenberg transcription slips. The live `original-en` reproduces them exactly, and this repair does not change them:

- "Here Phaedrus interrupted them, saying: not answer him, my dear Agathon". This is source dialogue paragraph 74, candidate 5.16. "Do" appears to be missing.
- "A fragment of the Sthenoaoea of Euripides" (candidate 6.4). Sthenoboea is meant.
- "Hyppolytus" (candidate 6.10). Hippolytus is meant.
- "the love of the heavenly godess" (candidate 3.9). The word should be "goddess".

Correcting them would be a separate, owner-approved source-emendation decision.
