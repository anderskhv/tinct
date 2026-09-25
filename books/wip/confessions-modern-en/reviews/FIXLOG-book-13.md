# Fix log — Confessions modern-en, Book 13

Source files: `parts/book-13/*.txt`. Each item was checked against Pusey (`show.py 13`) and O'Donnell's Latin (`latin/book13.txt`). ¶52 `GRATIAS TIBI DOMINE` was not touched and is still byte-identical to the served original.

| para | source (review #, quotes, charity) | action (applied/rejected/kept) | before → after (short) | reason |
|---|---|---|---|---|
| 3 | review #1 + quotes (0/2) | applied | `"Let there be light, and there was light,"` → unmarked | Pusey has no marks (§4). |
| 7 | quotes (0/2) | applied | `"Because Your love is shed abroad … given to us";` → unmarked | Pusey has no marks. |
| 7 | charity | applied | "a more excellent way, the way of charity" → "the way of love" | *supereminentem viam caritatis* is not a named principle, and the sentence has no *amor*/*dilectio* (its other two nouns are also *caritas*). §8 default. |
| 7 | charity | applied | "how charity lifts us up again" → "how love lifts us up again" | *sublevatione caritatis*, contrasted with *cupiditatis*. The *amores/amore* come in a later sentence, so there is no collision. §8 default. |
| 6 | charity | kept | "by our mother charity" | *per matrem caritatem* is the "mother Charity" named in the §8 exception. |
| 8 | review #2 + quotes (0/2) | applied | `said from the beginning, "Let there be light," and light` → unmarked | Pusey has no marks. |
| 9 | quotes (0/2) | applied | `said to me, "We will go up to the house of the Lord."` → unmarked | Pusey has no marks. |
| 10 | quotes (0/2) | applied | `You said, "Let there be light," and there was light` → unmarked | Pusey has no marks. |
| 12 | review #3 + quotes | applied | `"Holy, Holy, Holy … Father, Son, and Holy Spirit."` → unmarked | Pusey has no marks. |
| 12 | review #4 + quotes (0/6 total) | applied | `You said, "Let there be light": "Repent, … at hand."` → `You said, Let there be light: Repent, … at hand.` | Pusey has no marks. |
| 12 | review #5 | applied | "equal to You but made little for our sake" → "equal to You, but little for our sake" | The Latin *montem aequalem tibi sed parvum propter nos* has no verb, so "made" was a gloss. Logged in NOTES-13a. |
| 13 | quotes (0/12) | applied | 6 marked quotations (1 Cor 3:1; "When shall I come?"; Rom 12:2; 1 Cor 14:20; Gal 3:1; "Where is your God now?") → unmarked | Pusey has no marks. The stray comma after "When shall I come?" was also removed. |
| 14 | quotes (0/4) | applied | `"O my God, where are You?"` and `"Why are you sad, O my soul … lamp to your feet."` → unmarked | Pusey has no marks. |
| 15 | quotes (0/2) | applied | `"For heaven shall be folded up like a scroll"` → unmarked | Pusey has no marks. |
| 19 | quotes (0/2) | applied | `"Let the waters be gathered … dry land appear,"` → unmarked | Pusey has no marks. |
| 22 | quotes (0/4) | applied | `"All these," he says, "I have kept."` → `All these, he says, I have kept.` | Pusey: "All these (saith he) have I kept." has no marks. |
| 23 | quotes (0/2) | applied | `"Let there be lights in the firmament of heaven":` → unmarked | Pusey has no marks. |
| 24 | quotes (0/2) | applied | `He says, "Let the waters bring forth":` → unmarked | Pusey has no marks. |
| 35 | quotes (2/0) | applied (restored) | "we do find multitudes among creatures" → `we do find "multitude" among creatures` | Pusey marks the word "multitude" as the term under discussion. The same word is restored with his marks. Logged in NOTES-13b. |
| — | review "Renderer's Latin-driven departures" | checked / logged | — | ¶17, ¶21 (gifts list, *temporanea*), ¶45 and ¶46 were already logged under "Latin consulted". Newly logged in NOTES-13a: ¶21 *quo gaudet praedictus dies* → "in which the day just mentioned rejoices" (Pusey "which gladdens"). ¶17 "Your mercy, which proclaims…" matches Pusey's "announcing", so it is not a departure. The open issues for ¶17, ¶21 and ¶46 are marked as accepted by the reviewer. |

Quotes: every Book 13 paragraph now has the same count of `"` as Pusey. That is 0 everywhere except ¶35, which has 2. No differences were left standing on restructuring grounds.
Charity: Book 13 had 3 occurrences. 2 were changed (¶7 ×2) and 1 was kept (¶6, mother Charity). The text had no other *caritas* rendered as "charity".

## check.py

```
p 43 words  193-> 199 ratio 1.03 sim 0.53 archaic?:['tiniest']   (false positive)
p 52 words    3->   3 ratio 1.00 sim 1.00 IDENTICAL  <-- CHECK   (colophon GRATIAS TIBI DOMINE, verbatim by design, STYLE §5)
book 13: 53/53 paras, weighted sim 0.597 (target <=0.65), flagged 1
```
The only flag is ¶52, which is identical on purpose. Paragraphs 0–51 all pass: ratios are 0.8–1.35, sim is ≤ 0.75 (highest 0.73, at ¶12 and ¶22), and there are no THOU forms.
