# Fix log — Confessions modern-en, Book 12

Source files: `parts/book-12/*.txt`. Each item was checked against Pusey (`show.py 12`) and O'Donnell's Latin (`latin/book12.txt`).

| para | source (review #, quotes, charity) | action (applied/rejected/kept) | before → after (short) | reason |
|---|---|---|---|---|
| 32 | review #1 | applied | "because they have a divine Spirit" → "because they are divinely inspired" | Latin *quia divini sunt* describes the men as inspired. It says nothing about "having" the Spirit, and the capital S misled. Logged in NOTES-12b under "Latin consulted". |
| 32 | review #2 + quotes (Pusey 4, cand. 6) | applied | `saying, "Moses did not think what you say, but what I say." For if` → no marks | Pusey leaves this first "Moses thought not…" unmarked. His other two quotations ("How know you…", "Moses meant not…") keep their marks. Count now 4 = Pusey. |
| 25 | review #3 / charity | rejected (kept) | "its end is charity, out of a pure heart" | 1 Tim 1:5 "the end of the commandment is charity" is the named principle, and §8 (revised) keeps it. |
| 30 | review #3 / charity | applied | "in the breadth of charity" → "in the breadth of love" | *in latitudine caritatis* is not a named principle, and nothing collides with it. §8 default. |
| 33 | review #3 / charity | rejected (kept) | "to the end of charity" | *usque ad finem caritatis* echoes 1 Tim 1:5 (the same formula as ¶25/¶39), which is the named-principle exception. |
| 33 | review #3 / charity | rejected (kept) | "these two precepts of charity" | §8 names "the two precepts of charity" as an exception. |
| 33 | review #3 / charity | rejected (kept) | "to offend charity itself, for whose sake he said everything" | This refers back to the two precepts / end of charity named just before, as the principle for whose sake Scripture speaks. Switching to "love" would break that reference. The paragraph also has "Let us love the Lord…" (*diligamus*). |
| 39 | review #3 / charity | rejected (kept) | "the end of the commandment, pure charity" | This is the 1 Tim 1:5 formula (*praecepti fine, pura caritate*), a named-principle exception. The same sentence group has "let us love one another, and together love You" (*diligamus*), so "love" would collide. |
| 8 | review B1 (judgment) | applied | "You In the Beginning created" → "You in the beginning created" | Coordinator's decision: in ¶8 the Latin (*cum te commemorat fecisse in principio caelum et terram*) cites the plain verse, and neither the Latin nor Pusey identifies the Beginning with Wisdom there. ¶7, part of the same argument, is already lowercase. §8 capitalizes only an explicit identification, which here comes in ¶6, ¶18, ¶23, ¶26 and ¶37. |
| 8 | review B2 (judgment) | applied | "created in the Beginning is some intellectual creature" → "in the beginning" | Same reasoning (*quod in principio fecisti*). |
| 14 | review B3 (judgment) | applied | "before any day, In the Beginning, You created" → "in the beginning" | Same reasoning (*fecisti ante omnem diem in principio caelum et terram*): the plain verse, with no identification with Wisdom. NOTES-12a open issue updated. |
| 27 | review B4 | applied | fifth opinion "In the Beginning God made" → "In the beginning" | This is explicitly the "at the very start" reading (*in ipso exordio*). The first four Word readings keep the capital. |
| 29 | review B5 | applied | objector's "In the Beginning God made" → "In the beginning" | The objector quotes the plain verse. |
| 31 | review B6 | applied | "when he wrote, In the Beginning God made" → "In the beginning" | The plain verse as Moses wrote it. |
| 37 | review B7 | applied | "fixes his mind on the words In the Beginning God made" → "In the beginning" | The plain words both readers look at. The capital stays in "Wisdom, the Beginning" and in "In the Beginning to mean 'In Your Wisdom…'". |
| 37 | review B8 | applied | "by Beginning understands the start" → "by beginning" | The "at first" reader (*principium intellegit exordium*). |
| 38 | review B9 | applied | "understands In the Beginning He made only as if" → "In the beginning" | Explicitly the "at first" reading. |
| — | review "unlogged but correct" | checked | — | The reviewer's verified points (¶5, 10, 15, 17, 26, 29) were already in NOTES-12a/12b under "Latin consulted", so nothing new was added. The ¶32 Latin fix was added to NOTES-12b. NOTES-12b "Pusey kept on purpose" was updated for the Genesis 1:1 capitalization and the charity decisions. |

Quotes: `quotes.txt` lists only ¶32 for Book 12, and that is handled above. After the fix, every Book 12 paragraph has the same count of `"` as Pusey.
Charity: Book 12 had 6 occurrences. 1 was changed (¶30) and 5 were kept (¶25, ¶33 ×3, ¶39), all under the named-principle exception.

## check.py

```
p 38 words  646-> 702 ratio 1.09 sim 0.56 archaic?:['art']   ("art" = craft; false positive)
book 12: 42/42 paras, weighted sim 0.528 (target <=0.65), flagged 0
```
