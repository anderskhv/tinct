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

# Character, thread and intro review — 2026-10-05

Scope: new character cards (`books/characters/adventures-of-sherlock-holmes/`), threads, onboarding additions (openingText, acclaim, whyItMatters), introduction data and preface (`release/`). The authoring pass was done by twelve story readers working from complete readings of both editions; the review below was done by separate agents that wrote none of the reviewed content. No edition text was changed.

## Process

1. Six reviewers each covered two stories, reading both editions in full. They checked every card, snapshot gate, bound mention in context and cast-list thread for spoilers, accuracy, binding and usefulness. Brief: `qa/character-review/REVIEW-BRIEF.md`.
2. One reviewer covered the intro and onboarding. They verified the Stevenson quote verbatim against Gutenberg #637, the Doyle biography facts, the whyItMatters voice rules, the preface hash and word count, and that openingText is verbatim.
3. A separate rechecker verified that every applied fix resolved its finding and checked every new or moved snapshot against the text up to its gate. Record: `qa/character-review/recheck.json`.

## Findings and resolution

| Scope | Verdict | Blocker | Major | Minor | Applied | Justified, not applied |
|---|---|---:|---:|---:|---:|---|
| Stories 1–2 | accept-with-fixes | 0 | 0 | 14 | 14 | — |
| Stories 3–4 | accept-with-fixes | 0 | 0 | 14 | 13 | S4-08 (Baxter card would rest on external attribution; left unbound) |
| Stories 5–6 | accept-with-fixes | 0 | 0 | 11 | 11 | — |
| Stories 7–8 | accept-with-fixes | 0 | 0 | 17 | 16 | S7-08 (reviewer: acceptable as is) |
| Stories 9–10 | accept-with-fixes | 0 | 2 | 15 | 17 | — |
| Stories 11–12 | accept-with-fixes | 0 | 1 | 9 | 10 | — |
| Intro/onboarding | accept-with-fixes | 0 | 1 | 5 | 6 | — |

Exact problems, evidence and replacement text for every finding are in `qa/character-review/findings-*.json`. The principal corrections were:

- **Watson's card.** It is now neutral about his marriage. Some cases date from his bachelor days at Baker Street (8, 10, 11, 12) and others from after his marriage (S8-05, S10-01, S11-03, S12-05).
- **Snapshot gates moved later**, where a card ran ahead of the text:
  - Spaulding/Clay link, 2:205 → 2:208
  - Mary Sutherland, 3:13 → 3:17
  - Stark, 9:157 → 9:158
  - Roylott's full explanation, 8:248 → 8:250
  - Swamp adder split at 8:247 and 8:250
  - New intermediate snapshots for Hosmer Angel, Charles McCarthy, John Horner, Breckinridge, Merryweather, Toller, Julia Stoner and the maid Alice, so that first cards no longer carry later facts.
- **Thread fixes:**
  - The maid Alice no longer hints that she knew the plan (10).
  - The goose discovery is no longer telegraphed (7).
  - "One has now come to him" removed (5).
  - The King, the Count and Irene no longer jointly unmask the visitor (1).
  - Hosmer Angel's description is credited to Mary's advertisement (3).
- **Accuracy fixes:**
  - Lascar timing (6:212).
  - Burnwell transaction order (11:219).
  - Lucy Parr's movements (11:133).
  - Rucastle's confrontation (12:194).
  - Hayling "not heard of since".
  - Clay as a "passer of counterfeit coin".
  - Merryweather as chairman of the directors.
  - The St. Clair note credited to Mrs. St. Clair.
  - Mrs. Stoner's will condition.
- **Bindings added:** "Moran" at 4:135 (lodge-keeper); original-en "Your niece" 11:206 and "uncle" 11:127.

The recheck reported 87 resolved, 2 justified and 0 unresolved. It also found four issues introduced by the fixes:

| Issue | Severity | Correction |
|---|---|---|
| Charles McCarthy's 4:37 snapshot dropped his death | major | Restored his death |
| Mrs. Oakshott's "Maggie" released early | minor | Moved to 7:194 |
| Bradstreet's "ten-mile" circle released early | minor | Now "a circle … with Eyford at its centre" at 9:137 |
| Lucy Parr's 11:133 card contradicted 11:42 | minor | Corrected wording |

All four were corrected with the rechecker's exact text.

**Acceptance: ACCEPTED (independent editorial review, 2026-10-05).** Character content version is `2026-10-05.2`.

Gates rerun after the final fixes:
- deterministic rebuild with `--check`;
- in-memory app `verifyCharacters` on both editions, with 1,036 gate checks and 0 failures;
- character and reviewed-introduction vitest 514/514;
- all JSON parses;
- the threads schema;
- the preface hash and word count;
- the whole-book similarity gate on the live editions: PASS, 0.484.
