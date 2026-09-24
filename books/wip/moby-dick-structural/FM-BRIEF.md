# Front matter (Etymology and Extracts): modern-en brief

Read `/home/user/tinct/books/wip/green-moby-dick/STYLE-BRIEF.md` in full first. It is read-only here. Its conventions and Lead decisions 1–8 govern this work too, and the rules below add to them. Never edit anything under `books/wip/green-moby-dick/`, which is frozen.

## Files (in `books/wip/moby-dick-structural/`)

- `front-matter.original-en.json`: the fidelity anchor. Shape: `{"frontMatter":[{"id":"etymology","title","paragraphs"},{"id":"extracts","title","paragraphs"}]}`. The text is Project Gutenberg #2701 lines 336–843, with three evidenced emendations listed in `evidence/emendations.json`. The coordinates are `etymology.i` and `extracts.i`, both 0-based.
- The candidate is `front-matter.modern-en.json`, which has the same shape. **Only the lead writes it.** Agents write proposal files.

## What the modern rendering must do

Keep **one output paragraph per source paragraph**, in the same order, with each output starting with the same content as its source. The unit titles are "Etymology" and "Extracts".

1. **The narrator's own prose** is the Usher sketch (etymology.1), the Sub-Sub-Librarian preface (extracts.1–2) and the subtitles. Give it a full sentence-by-sentence modern rendering with everything kept: humour, "poor devil", "grub-worm", "Vaticans and street-stalls", "higgledy-piggledy", "gospel cetology", "Pale Sherry", Hampton Court, the Tuileries, Gabriel, Michael and Raphael, "splintered hearts … unsplinterable glasses". The narrator's thee/thou/ye become "you" (edition practice).
2. **Quoted prose** covers the dictionary entries, Hackluyt, and the prose extracts from travellers, naturalists, histories, newspapers and whaling narratives. Render it in modern English sentence by sentence, as the edition did for quoted prose in the body (Chace, Wafer). Keep every fact, number, name and image; don't compress.
3. **Scripture and verse quoted verbatim** covers Genesis, Job, Jonah, Psalms, Isaiah, Matthew and so on, plus poets such as Spenser, Milton, Waller, Cowley, Pope, Thomson, Cowper and Falconer, and the whaling songs. Apply **Lead decision 8**: keep the archaic pronouns and verb forms ("thou hast", "maketh"). Modernize only obsolete *spellings* ("ſ" or "then" for "than", if any appear) and punctuation conventions, and keep the wording. The lines stay as the source joins them.
4. **Attributions** (the "—_Author_." lines): keep the author and work names exactly as printed (decision 3), for example "Hackluyt", "Purchas", "Other or Octher's verbal narrative", "Colnett's Voyage for the Purpose of Extending the Spermacetti Whale Fishery". Render them as `— Author.` with a spaced em dash and no underscores.
5. **The Etymology word list** (etymology.5): keep every headword exactly, including the Hebrew and Greek letters and the capitals (for example "WHŒL" as printed; keep the invisible right-to-left marks around the Hebrew exactly as in the source string). Render each language label in plain modern English. "Fegee" becomes "Fijian" (decision 7). Keep the rest as the standard English language names: Hebrew, Greek, Latin, Anglo-Saxon, Danish, Dutch, Swedish, Icelandic, English, French, Spanish, "Erromangoan" (keep as printed; there is no settled modern form). Keep the format `WORD, Language.`, one entry after another, in the source's order.
6. **Dictionary abbreviations** ("Sw. and Dan.", "Dut. and Ger.", "A.S.") may be spelled out for clarity: Swedish and Danish, Dutch and German, Anglo-Saxon. Foreign words (hval, hvalt, Wallen, Walw-ian) stay exactly, without underscores.
7. **Elision marks** `* * *` or `* * * * *` inside quotations stay as printed.
8. **Conventions:** straight quotes and apostrophes, spaced em dash, no underscores, American spelling for ordinary words. A quoted title's own spelling is kept (decision 7's quoted-document exception).
9. Never add glosses beyond a few accurate words where a term would stop a reader and nothing nearby explains it. Never explain the joke.

## Proposal format

Same as STYLE-BRIEF, with ids `etymology.N` and `extracts.N`: `{"batch","role","reviewed":[...ids],"items":[{"id","severity","category","reason","new"}]}`. For the modern rendering, **every** paragraph needs an item, because the candidate starts empty. Validate the JSON before finishing.
