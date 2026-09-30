# Editorial checkpoint notes

Status: NOT READY. Author-reviewed draft Chapters 1–5; no independent approval.

## Source and structure

The original uses the existing plain-text parser and its blank-line paragraph boundaries. Chapter headings are matched as complete lines so that the contents list does not become a second set of chapters. The 27 resulting units retain their internal document headings and dates. Only ornamental asterisk separators and post-novel apparatus were removed after parsing; source-structure.json supplies the paragraph map. Gutenberg's source text, including front matter, remains available verbatim in raw.txt.

The final NOTE is narrative content, not an editorial footnote: it remains in Chapter 27 through the signature JONATHAN HARKER. Publisher adverts beginning after THE END are not part of the novel. The authorial prefatory statement is preserved separately; there are no invented prose chapters.

## Completed rendering

Every paragraph in Chapters 1–5 was composed against its source, with headings and signatures kept as separate aligned paragraphs where the baseline has them. No regex/dictionary rewriting or model API calls were used. The SHA-pinned checkpoint has 261/261 paragraph alignment and no paragraph below the user's 75% length threshold. Short headings, salutations and signatures are intentional, not stubs. Unchanged short paragraphs and the embedded Hamlet quotation are listed explicitly in changed-paragraphs.json.

Specific fidelity choices:

- Preserve the foreign names, foods, travel times and distances in Jonathan's opening, including Buda-Pesth, Klausenburgh, Golden Krone, Golden Mediasch, Cszeks, Ordog, pokol, stregoica, vrolok and vlkoslak. The narrator's period judgements are not endorsed or corrected in the rendering.
- Preserve the German line from Burger's Lenore, its translation, the Hamlet quotation, the Turkish proverb, and the quoted welcome maxim. Do not silently correct Stoker's allusions.
- Keep the Count's catalogue of peoples, battles and ancestors, including Mohács. These are his claims, not a newly fact-checked history.
- Retain Chapter 4's dated-letter inconsistencies, the changing window directions, the locked doors, all fifty boxes and the unresolved key. No editorial plot repair is inserted.
- Keep Lucy's reference to Desdemona and the source's racial description, Quincey's seven young women with lamps, and Lucy's contradictory comments about Arthur's slang. No historical or Biblical correction replaces them.
- Retain Seward's Latin and add brief English equivalents within the same paragraph, without deleting the allusions; preserve Romæ. Renfield's notes remain an attributed nineteenth-century clinical observation, not a modern diagnosis.

Length flags were inspected and resolved before the accepted checkpoint snapshots: Chapter 2 paragraph 15; Chapter 3 paragraphs 11–12; Chapter 4 paragraph 30; Chapter 5 paragraph 27. The final per-paragraph audit contains no remaining flags. Whole-book fidelity, later dialect voices, independent reading and release acceptance remain outstanding.

## Metadata

Onboarding contains no invented acclaim and no external review quotations. The three whyItMatters and four reading angles are editorial readings grounded in the novel, not claims of historical reception. Cast and character descriptions are proposals; sourceChapters in the character proposal identify places to review and are not exhaustive mention indexes.
