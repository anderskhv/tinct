# Danish retranslation 2 — Jekyll and Hyde, Great Expectations, The Prince

Content only. Nothing is integrated into the app, the registry or any live data file.

## What is here
| Book | File | Paragraphs | Words | Live Danish words |
|---|---|---|---|---|
| Jekyll and Hyde | `books/wip/jekyll-and-hyde/editions/jekyll-and-hyde-modern-da.json` | 339 | 25,245 | 24,511 |
| Great Expectations | `books/wip/great-expectations/editions/great-expectations-modern-da.json` | 3835 | 184,284 | 182,528 |
| The Prince | `books/wip/the-prince/editions/the-prince-modern-da.json` | 254 | 29,120 | 28,289 |

SHA-256 values are in `SHA256SUMS.txt`. Each file replaces the live `*-modern-da.json`. Paragraphs, chapters and chapter numbers match the live `*-modern-en.json` one to one. Chapter titles are the live Danish titles ("Dr." in the Jekyll titles became "Doktor", "mr." became "Mr.").

## How it was made
1. The live modern-en edition was split into 97 bundles of about 2,500 words (jek 11, gex 74, pri 12) and translated by helper agents (no API spend).
2. Titles and terms were normalised by regex: Mr./Mrs./Miss stay English; "neger" and "Negro-head" removed (tobacco is "sort pibetobak"); Jekyll's bare "hr." became "sir"; The Prince's place names were harmonised to Danish forms (Italien, Napoli, Milano, Grækenland, Genova, Rom ...), against the older "keep English place names" glossary line, because the translators had mixed both.
3. Every paragraph went through an independent review (jek 20, pri 21, gex 127 packets). 651 paragraphs failed (jek 63, pri 75, gex 513) and each got a minimal replacement from the reviewer. All replacements are applied.
4. Consistency regexes after the review: "miss" → "Miss"; "markerne" → "marsken" (the marshes); Hovedgaden/Højgaden → High Street; jagtkniv → foldekniv; kontorchef → kontorist; transportabel ejendom → flytbar ejendom; unmarked "mil" → "engelske mil"; "studerekammer" → "arbejdsværelse" (Jekyll); Jaggers's → Jaggers'.
5. Checks: paragraph and chapter counts equal the English; no straight or English quotes, no `--`; `\n`, `_` and `[n]` counts match; no "neger"; no "Hr./Fru + name". Open-quote counts differ in 9 Jekyll and 33 Great Expectations paragraphs; these are multi-paragraph speeches and letters that follow the English.

## Problems found in the process
- The reviewer of gex-da-P107 attached the 50:42 fix to 50:32. I checked every replacement against its source paragraph (word overlap) and re-keyed that one. Every other flagged replacement was a short dialogue line.
- No reviewer fix was re-reviewed after it was written.
- Several translators and reviewers read the fixed-terms list differently (Mr. vs hr., place names, du/De). The regexes above settled what could be settled mechanically.

## Open points for a human or native read
- No native Danish read-through has been done.
- The Prince addresses the reader as "du" in most chapters (the English says "you"). The glossary asked for impersonal "man"/"fyrsten"; some reviewers changed a few passages to "man", so the book is mixed. Pick one.
- Great Expectations du/De: Wemmick–Pip is "De" in Little Britain and in some Walworth passages, "du" in others. Jaggers–Pip is "du" in the early chapters and "De" in some later ones. Joe–Pip is "De" in "sir" mode. Camilla and the Pockets switch between du and De to Miss Havisham. One rule per pair is still needed.
- Great Expectations terms still mixed: "bål" (bonfire) is used for hearth fires in places, "Den Gamle" and "Aldrende" for the Aged, "postkontoret" and "postkassen" for Wemmick's mouth, "Hævneren". Joe's dialect is rendered as plain Danish in most chapters.
- "sir" is kept in English in most places and "hr."/"min herre" in a few.
- "Doktor"/"doktor" casing and "Mr. Hyde" are consistent, but "Master Hyde" and the Jekyll "hr." cases were only fixed by regex.
