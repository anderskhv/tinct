# Danish editions for the last two young readers books

**Assignment (Anders, 26 Nov 2026):** every book on the "For young readers" shelf is to be available in Danish. Six already are. This package adds `modern-da` for the two that were not:

| Book id | Danish title | Chapters | Paragraphs | Danish words |
|---|---|---|---|---|
| `the-secret-garden` | Den hemmelige have | 27 | 2,132 | 82,750 |
| `story-of-king-arthur-and-his-knights` | Historien om kong Arthur og hans riddere | 33 | 1,381 | 95,957 |

**Status:** content accepted by the two-pass review below. Not integrated, not published. No native Danish speaker has read either book.

**Instruction revision:** `origin/main` at `220cbcf59b` (books/BOOK-TASK-WORKFLOW.md, books/README.md, books/AGENTS.md, books/CLAUDE.md, docs/workflow-boundaries.md). The language scope there says Danish is not produced unless Anders reopens it; he did, for these two books, in the message above.

**Owned path:** `books/wip/young-readers-danish/` only. No application file is touched.

## Source

Each Danish edition is translated from the book's published `modern-en` edition on main (`app/public/data/editions/{id}-modern-en.json`; hashes in each book's `review/SHA256SUMS.txt`), with the published `original-en` beside it to settle meaning and tone. Both authors' works are in the public domain (Burnett died 1924, Pyle 1911). No existing Danish translation was consulted or copied.

## Method

1. Rules for every paragraph in `TRANSLATION-GUIDE.md`; names, fixed terms, verse and address forms per book in `review/GLOSSARY.md`.
2. Translation in the conversation, chapter by chapter, by nine translators working from the same guides (The Secret Garden in four batches, King Arthur in five). No API, no script, no outside service.
3. A mechanical check of every chapter against the English: same paragraph count, italics, line breaks, speech marks that follow the English, no English left, no sentence over 60 words, length within bounds.
4. Cross-batch decisions written down in `review/HARMONISE.md`.
5. A second reading of every paragraph against the English by nine reviewers who had not translated it (`REVIEW-GUIDE.md`), followed by the editor's decisions on the points they raised.

## What the review changed

- The Secret Garden: 126 of 2,132 paragraphs. King Arthur: 113 of 1,381. Every change, with before, after and reason, is in each book's `review/danish-fixed-paragraphs.json`.
- Meaning errors found and fixed: 8 in The Secret Garden, 6 in King Arthur (for example, sixteen shillings a week read as the rent; "little better than captives" turned into "a little better than captives").
- The rest are Danish wording, grammar and commas, names and terms brought into line across batches, and speech marks.

## Decisions a reader may notice

**Den hemmelige have**
- Yorkshire speech is warm, plain country Danish with no invented dialect spelling. Words the story itself explains stay: `wuthering`, `graidely`, `marred`; `wick` is "kvik".
- The robin is "rødhalsen" and is a "han". Dickon's animals are Sod, Kaptajn, Nød, Skal and Hop.
- "Magic" with a capital is "Magien" / "Magi" with a capital.
- The children say du; Mary and Colin say De to fru Medlock, hr. Craven and doktor Craven; servants say De to Colin.
- The rhyme (chapters 2, 4, 11) and the Doxology (chapter 26, five lines, fits the tune) are new verse; both deserve a native read.
- Distances are "engelske mil" the first time in a chapter; money stays English (shilling, pence, "en halv crown", "en sovereign").

**Historien om kong Arthur og hans riddere**
- `Sir` and `Lady` keep their capital; kong, dronning, hertug are lower case before a name. Names keep Pyle's spelling (Gawaine, Launcelot, Morgana le Fay). Where Pyle spells one man two ways the Danish uses one (Urien, Bodwain, Gaheris, Lamorack, Dornar).
- Everyone says du and I, kings included. The storyteller speaks to "I/jer".
- magic is "trolddom", an enchantress is a "troldkvinde", never "heks"; "forhekset" is kept for "bewitched".
- Pyle's own slips are translated as written (who is whose son, a tent's colour, a portcullis let down before a knight rides out). Two speeches the English forgot to close are closed (5:¶12, 25:¶41).

## Open points, honestly

- No native-speaker read. The six Danish young readers editions already published were released on the same footing.
- Chapter and paragraph numbers in the notes are chapter number : zero-based paragraph index.
- King Arthur 24:¶32 "to for en kvart penny" (two for a farthing) is exact but clumsy.
- King Arthur 9:¶12 follows the modern English "Happily" ("Heldigvis"); Pyle's "happily" may have meant "perhaps".
- The Secret Garden 15:¶8: Colin's nurse when he was small is "sygeplejerske", as everywhere else for his nurse.
- Martha's remarks about Indian servants (chapters 4, 5, 8) are translated plainly, as the English editions have them.

## Integration requirements (a separate, assigned step)

See `INTEGRATION.md`.
