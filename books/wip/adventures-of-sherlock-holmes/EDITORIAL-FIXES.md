# Adventures of Sherlock Holmes: editorial fixes to modern-en (2026-10-01)

Mechanical fixes applied to the accepted package text before it was copied to `app/public/data/editions/adventures-of-sherlock-holmes-modern-en.json`. Package modern SHA-256 `06c86bf1984363f278cccfedd66c8da1acaf8ae845f8b739d6cd377e20c0142f` (HANDOFF.md `06c86bf1…0142f`); live modern SHA-256 `ab3db4de18d6e7ba480e4c325e952a4c9c904546e7c51d751d0a464df6b25b5b`. The original is byte-identical to the package (`7e9fd4f88f86853ca0428b45fb64ea0e410b37dea5c190711d217cb8fd71e2ed`). Chapter and paragraph counts are unchanged (12 chapters, 2,527 paragraphs); the whole-book gate still passes.

## Straight apostrophes converted to curly

317 straight apostrophes (U+0027) became U+2019, so the modern text matches the original's typography: 311 inside words (contractions and possessives), 4 on word-final plural possessives (1:34 horses', 3:31 and 3:34 gasfitters', 5:147 authorities'), 3:82 '77, and 5:178 _Lone Star_'s. Quotation marks were left alone.

Eight straight single quotation marks were deliberately NOT converted because they are quotation marks, not apostrophes: 2:48 (open and close), 2:68 (four), 5:49 (open and close). The original uses curly single quotes there. They remain a typography inconsistency for a later pass.

## Exclamation marks restored (per-paragraph count of '!' against original-en)

15 paragraphs had fewer '!' than the original. Each was restored by hand on the clause that carried it, then the check was re-run until none remained (0 paragraphs with fewer '!' than the original).

| Story:paragraph | Before | After |
|---|---|---|
| 2:213 | ...Alas, I can already... | ...Alas! I can already... |
| 4:162 | ...The cry was intended... | ...The ‘Cooee!’ was intended... |
| 4:209 | ...Yet my reputation and my daughter could both be saved... | ...Yet my reputation and my daughter! Both could be saved... |
| 5:74 | ...Tut, tut!... | ...Tut! tut!... |
| 7:103 | ...Ah, yes, I see.... | ...Ah! yes, I see.... |
| 7:141 | ...Now look at the other page, written in red.... | ...Now, then! Look at the other page, written in red.... |
| 7:185 | ...Think of my father and mother!... | ...Think of my father! Of my mother!... |
| 8:153 | ...What foolish builder, for instance, would put a ventilator into the next room when the same effort could have made an opening to the fresh air outside?... | ...For instance, what a fool a builder must be to put a ventilator into the next room when the same effort could have made an opening to the fresh air outside!... |
| 9:84 | ...“‘Ah,’ he replied... | ...“‘Ah!’ he replied... |
| 10:21 | ...Well, none of this tells us much.... | ...Ha! Well, none of this tells us much.... |
| 10:56 | ...Quite right, quite right!... | ...Quite right! quite right!... |
| 11:41 | ...Now, alas, it is too late... | ...Now, alas! it is too late... |
| 11:118 | ...Ah, that must be him.... | ...Ah! that must be him.... |
| 11:196 | ...Owe?”... | ...Owe!”... |
| 12:9 | ...care for fine distinctions in analysis and deduction?... | ...care for fine distinctions in analysis and deduction!... |

Notes: 4:162 restores the quoted call as the original's Cooee! (the modern had replaced it with "the cry"); 8:153 and 12:9 keep the original's exclamatory sentence where the modern had turned it into a question; 4:209 restores the broken-off exclamation "my reputation and my daughter!" before "Both could be saved".
