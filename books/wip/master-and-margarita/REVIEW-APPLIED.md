# Independent review: fixes applied (5 Nov 2026)

This file records how the eight independent reviews in `reviews/` were applied to `editions/master-and-margarita-modern-en.json` and `editions/master-and-margarita-modern-da.json`, and which book-wide decisions were made on top of them. Each fix was read against `editions/master-and-margarita-original-ru.json` before it was applied. No published translation was consulted. The Russian, the samples (`*.sample-*.json`) and the paragraph structure are unchanged.

## Review entries

The entries were applied in this order: revEN-A, B, C, D, then revDA-A, B, C, D. Before each replacement, the script checked that `old` occurred exactly once in its paragraph. Every one of the 244 entries matched exactly once, so none had to be applied by hand.

| Review | Scope | Entries | Applied | Rejected | Applied by hand | Adjusted after applying |
|---|---|---|---|---|---|---|
| revEN-A | EN ch. 1–9 | 18 | 18 | 0 | 0 | 0 |
| revEN-B | EN ch. 10–18 | 33 | 33 | 0 | 0 | 0 |
| revEN-C | EN ch. 19–25 | 14 | 14 | 0 | 0 | 0 |
| revEN-D | EN ch. 26–33 | 20 | 20 | 0 | 0 | 0 |
| revDA-A | DA ch. 1–9 | 42 | 42 | 0 | 0 | 0 |
| revDA-B | DA ch. 10–18 | 23 | 23 | 0 | 0 | 1 |
| revDA-C | DA ch. 19–25 | 47 | 47 | 0 | 0 | 2 |
| revDA-D | DA ch. 26–33 | 47 | 47 | 0 | 0 | 0 |
| **Total** | | **244** | **244** | **0** | **0** | **3** |

**Rejected:** none. No fix was clearly wrong against the Russian.

**Adjusted after applying:**
- revDA-B, 17:12: «om man så slog én ihjel!» became «om man så slog mig ihjel!». «хоть убей» is the speaker's own "kill me if you like", and the Danish idiom is «om man så slog mig ihjel».
- revDA-C, 21:18 and 21:70: the reviewer rendered хрипеть as «rallede». Decision 2g (below) makes хрип = «hæs», so these became «lød hæst» (the gramophone) and «sagde galten pludselig hæst og gryntede».
- revDA-B, 18:87: «Hr. kunstneren» later became «Hr. artisten» under decision 2g.

## Book-wide decisions

Each occurrence was checked in context against the Russian. The counts are the replacements made in addition to the review entries.

| # | Decision | EN | DA |
|---|---|---|---|
| a | **«зарезать» = killing with a knife.** EN "knife" / "be knifed", DA «stikke ihjel» (2:175 «stukket dig ned» → «stukket dig ihjel», so the chain uses one verb). Pilate's prediction (25:107, 25:118, 25:119: "he will be knifed tonight" / «han vil blive stukket ihjel i nat») and Aphranius's report (26:88: "he has been knifed" / «han er blevet stukket ihjel») now echo each other. Kept on purpose: the idiom «Хоть зарежьте!» (10:71: "Not if you cut my throat!" / «Om så I skærer halsen over på mig!»), the hog «Зарезать?» (22:122, "slaughtered" / «slagtes»), and the tram that «зарезало» Berlioz (8:51, 18:2–4). 23:78 already read "knife" / «stukket ned». | 10 (2:175, 26:88, 26:102, 26:109, 26:114, 26:227, 26:228, 26:229 ×2, 26:231), plus 5 review entries (25:107, 117, 118, 119; 26:66) | 5 (2:175, 25:107, 25:117, 25:118, 25:119), plus 10 review entries (all of ch. 26) |
| b | **"made sure" for «убедиться».** There were 11 uses after the reviews: 3 calques fixed by revEN-A (3:15, 4:17, 4:36), and 28:70 "to make sure that Dostoevsky is a writer" changed to "to be convinced", which also echoes the next sentence. Left alone, because the Russian means checking: 8:2, 9:69, 13:3, 19:142, 21:16, 26:87, 27:4. Also left: 1:119 («следя, чтобы») and 33:14 («добиваясь, чтобы»), which mean ensure. | 1 | – |
| c | **No grammatical gender in English pronouns.** A screen of every "she/her" sentence without a female referent found one more case: 32:1 death («она одна») "she alone" → "it alone". 2:3 (illness) and 2:71 (Banga) came from revEN-A. No other Banga or abstract-noun "she" was found. | 1 | – |
| d | **US spelling.** The review entries took care of lorries → trucks (17:104–105), moustached → mustached (14:7) and THEATRE → THEATER (10:11). The book-wide screen found more: "draughts" (the game) → "checkers" (17:94, 17:99), "long draughts" → "long drafts" (25:10), and "lift" → "elevator" (21:9). The only spelling exception is "rouble" (GLOSSARY). There were no other British spellings (-our, -re, grey, -ise, -ll-). Vocabulary that US readers also use (queue, pavement, autumn, tram) was left alone. | 4, plus 7 review entries | – |
| e | **"Professor" capitalised in direct address.** Two more cases besides revEN-A's 3:7, 3:21 and 3:32: 18:198 "Professor" and 18:202 "citizen Professor". "citizen" stays lower case in address, as elsewhere in the book. The rule has been added to GLOSSARY.md. | 2, plus 3 review entries | – |
| f | **Danish apostrophe: the straight `'` only.** The reviews fixed 16 curly apostrophes (12 by revDA-A, counting 8:59, and 4 by revDA-C). The global screen found one more, at 15:117 «hva’?». The edition now has no `’`. | – | 1, plus 16 review entries |
| g | **Danish terms.** «artist» for Woland as артист: 11 paragraphs in ch. 18 (18:87, 88, 98, 100, 108, 115, 118, 131, 135, 152, 159); гастролер «gæstekunstner» (12:12) and the actor Kurolesov «skuespiller» (ch. 33) are different words and stay. **боров = «galt»**: done by revDA-A (4:35) and revDA-C (17 entries, ch. 21–22, det → den); none was left. **хрип = «hæs»**: 6:77, 7:31, 9:90, 10:133, 14:20, 21:18, 21:70, 28:7, plus review entries 12:84, 22:45, 23:65; «rallen» in 18:152 (the death rattle of the dying, хрипы) and «hivende efter vejret» in 15:89 were kept. **шпага = «kårde»**: 22:73 (the chess bishop's sword), plus revDA-C's 22:46. **«husassistent»**: 17:22 «Husholdersken Grunja», plus revDA-C's 24:216. **Crowd address I/jer**: 10:133 (the bandits), 12:26 and 12:72 (Bengalsky to the audience), 23:114 (Woland's toast, «jeres skål»), 28:76 («Jeres medlemskort, borgere»), plus revDA-D's 27:97, 28:41 and 28:45. | – | 11 + 8 + 1 + 1 + 5 = 26 |
| h | **Other patterns named in the reviews.** Azazello's бельмо is «hvide hinde», not «grå stær», at DA 30:44, which is the same defect revEN-D fixed in EN. Banga's fear «гроза» was "thunderstorms" at EN 32:16 against "the storm" at 26:5; it is now "storms" (the DA side was fixed by revDA-D). EN 18:2 "run over by tram" → "by a tram". Left as they are: Koroviev's "long" / "lanky" (revEN-A calls it taste), the conversational «Åh» in Pilate's dialogue (ch. 25–26; only the invocations take «O»), and «stukket ned» in 23:78. | 2 | 1 |

## Totals

- **English:** 85 review entries and 20 book-wide changes. 98 paragraphs changed, in chapters 1–8, 10–19, 21–30, 32 and 33 (not 9, 20 or 31).
- **Danish:** 159 review entries and 33 book-wide changes. 174 paragraphs changed, in all 33 chapters.

## Validation

- Both editions load as JSON and have 33 chapters, with the same titles, sections and `sections[]` as before.
- Paragraph counts equal the Russian in every chapter. No paragraph is empty.
- Quote balance is unchanged. The set of paragraphs with unbalanced quotation marks is identical before and after (59 in each language: the known multi-paragraph speeches).
- Typography: there are no straight double quotes, no straight apostrophes in EN, and no curly apostrophes in DA.
- Echo checks all pass, in both languages: 1→2 (white cloak), 2→3 (ten o'clock), 15→16 (Bald Mountain), 18→19 (Follow me, reader!), 24→25 (the darkness), 26→27 (the dawn of the fifteenth of Nisan), and 32:33 against the last line of the Epilogue.
- The ch. 25 ↔ ch. 26 coded exchange: EN "he will be knifed tonight" / "he has been knifed"; DA «han vil blive stukket ihjel i nat» / «han er blevet stukket ihjel».

## For Anders

- The samples (`*.sample-ch1-2.json`, `*.sample-ch1.json`) were not touched, so they now differ from the full editions at the fixed lines. They are historical review files.
- Optional and not applied: the reviewers' choice of Koroviev's "long" (EN) and the remaining Britishisms of vocabulary ("queue", "pavement").
