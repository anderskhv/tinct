# acc-A1: readability and listening review, Part I (The Window, ch. 1–19)

Reviewer role: a first-time adult reader and listener. I read only the candidate text (`editions/to-the-lighthouse-modern-en.json`). I did not open the original or the source folder.
Findings: `acc-A1.json` (75 entries: 3 blocking, 72 recommended; 41 of the recommended are mechanical dash fixes). `loc` = `chapter.paragraphIndex`, with the index starting at 0.

## Coverage

I read all 19 chapters in full and in order, 346 paragraphs in total: ch. 1 (28), 2 (2), 3 (9), 4 (19), 5 (12), 6 (28), 7 (9), 8 (7), 9 (16), 10 (18), 11 (5), 12 (12), 13 (3), 14 (10), 15 (1), 16 (12), 17 (78), 18 (13), 19 (27). I also ran a script over ch. 1–19 to look for straight quotes, doubled words, stray markup, spacing and dash style, and unbalanced quotation marks.

Note: the edition file was being edited by another pass while I reviewed it. One finding (1.5 "follow" → "chase") had already been fixed and was dropped. One `find` string (17.20) was updated to match the current text. Every `find` in the JSON was checked against the file as it stood when the JSON was written, and each one occurs exactly once in its paragraph.

## Overall assessment

The text reads well. Most paragraphs can be read aloud without trouble: long sentences have been broken up, the glosses are short and fit the prose (Army and Navy Stores, Balliol, Reform Bill, Grisons, Bœuf en Daube), and the free indirect style survives. The mechanical scan found no straight quotes, no stray markup other than the intended `_italics_`, and no accidental doubled words. The "had had" instances are correct grammar. The quotation marks that look unbalanced in 10.8 and 10.10 are the normal convention for a quotation that runs across paragraphs.

The problems left are small and fall into four groups:

1. **Pronouns with no clear owner at a scene or viewpoint change.** A new chapter or paragraph opens on a bare "he", "she" or "it" that points to the wrong person: 2.0, 4.0, 7.4, 11.4, 14.9 (watch vs. brooch), 17.29, 17.37, 8.0, 9.7, 17.22. None of these is Woolf's deliberate ambiguity. They are grammar problems, and naming the person fixes them.
2. **Archaic or dropped-in words that mislead rather than just sound old.** "fell as a thunderbolt" (6.3), "forlorn hope" (6.26), "Lily had her sense of her back" (9.8), "every feeling felt for yourself" (16.9), "He was done" (4.10), "Prolegomena" (1.9).
3. **Inconsistent terms and refrains.** "Stormed at by/with" (3.7 vs 6.3); "spray" vs "sprig" (6.4–6.6); "chemist" vs "pharmacist" for Tansley's father (1.20 vs 17.24); the drain-digger in 1.27 becomes "the man in the drainpipe" in 17.9; "the thing is made that endures" becomes "remains forever after" (17.56); "yellow bee" vs "honey bee" (17.66 vs 19.1). Check that last one against the source before changing it. Two more are noted here but not flagged, because they may be Woolf's own and the verse rule applies. The "And all the lives we ever lived" lines are set as two lines in 17.68 and three lines in 19.2. The tablecloth mark is called a flower, then a sprig, then a leaf (17.4, 17.10, 17.32).
4. **Chapters 18–19 were styled differently.** They use spaced em dashes (" — ", 41 times) and hyphenated nouns like "drawing-room" and "smoking-room". Chapters 1–17 and the brief use closed dashes and "drawing room". Listeners won't notice this, but readers will. It can be fixed mechanically.

Not flagged, on purpose: the period attitudes ("Chinese eyes"), the Mildred/cook and Marie/Marthe maid names, "Finlay", and Tansley's age of thirteen vs fifteen. The source appears to carry these, and a modern edition should not resolve them. I also left alone the open questions that belong to the book: "Nobody ever looked so sad" (5.7), "Had he blown his brains out" (5.8), and whose voice is speaking in 14.5.

**Verdict:** Part I is fit for readers and listeners once the three blocking fixes are made (6.3, 9.8, 14.9). The pronoun-anchor fixes are the most valuable of the recommended changes for anyone listening to the narration.
