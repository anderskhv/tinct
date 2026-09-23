# Batch b03: fidelity and repair review (Ch 10–12 = Part 2, Chapters 3–5)

Output: `rounds/b03/F.json`, with **238 proposals**. `apply.py … check --dry` reports: applied 238, rejected 0.

## Coverage

Every source and candidate pair was read in order. Adjacent paragraphs were checked for content that crossed a boundary.

- Ch 10: 10.0–10.121 (122)
- Ch 11: 11.0–11.77 (78)
- Ch 12: 12.0–12.115 (116)
- **Total: 316.** This matches the batch spec (122 + 78 + 116 = 316).

No cross-paragraph duplication or displacement was found. Alignment is one-to-one throughout.

## Findings summary

| Category | Count | Blocking |
|---|---|---|
| register (F3 contractions) | 192 | 0 |
| meaning | 14 | 2 |
| period | 10 | 0 |
| omission | 9 | 1 |
| invented | 4 | 0 |
| other (restored accent in fiancé/fiancée) | 4 | 0 |
| hesitation | 3 | 1 |
| certainty | 2 | 1 |
| **Total** | **238** | **5** |

### Blocking findings

- **10.90** "forgot it on purpose" turned the source's *as though* on purpose into a deliberate act. Restored "as though on purpose -- forgot it all at once".
- **10.118** "They'll be a long time getting rid of these people" reverses the source, "It will be long before **I** get rid of them."
- **11.51** Dropped the examiner's question "How could you be frightened, if you felt free from guilt?". Without it, Razumihin's next line ("that question was put literally in those words") points at nothing.
- **12.88** "reproach her for being your benefactress" reverses the source, "reproach her with **your** being **her** benefactor." Also restored "a beggar" (had been softened to "poor"), "delight in insulting him" (the invented "strange… provoking" is removed), and the accent in _fiancée_.
- **12.89** Luzhin's flustered "in a word... this arrow... in a word, your mamma..." had been smoothed.

### Other notable repairs

- **Ch 10, messenger scene:** restored "your mamma" in 10.17, 10.20 and 10.21. Razumihin's joke "'your mamma' is not bad either" mocks the messenger's quaint word and makes no sense with "mother". In 10.14 "more articulate" is now "smarter", because the source's "more intelligent" sets up 10.19's "you are an intelligent man too". In 10.17 an invented hesitation "a... lucid state" was removed.
- **Luzhin, 12.20, 12.24 and 12.29:** restored "your mamma", which triggers Razumihin's loud "Hm!" in 12.21.
- **11.63 and 11.64:** "honest truth" is now "holy truth". The source phrase is echoed ironically by Zossimov.
- **11.73:** restored Razumihin's self-correction "It's clear. At any rate, the direction … is clear". In 11.74 the jibe is again "*you're* too clever", aimed at Razumihin rather than the theory.
- **11.45:** restored "the track of the real man", which implies someone other than the painter.
- **Smaller drifts:**
  - 10.12: "nervous breakdown" is now "nervous nonsense" (F6), and "horseradish" is now "radish".
  - 10.33: removed the invented "he has things to do".
  - 10.48: "wild bewilderment" is now "stared wildly, with strained attention".
  - 10.76: Raskolnikov looks at *him*, not at the IOU.
  - 11.57: "talking in his sleep" is now "woken from a dream".
  - 11.77: "Ha!" is now "Ach!".
  - 12.74: "a university lecturer" is now "a lecturer in world history".
- **Deliberate repetitions restored:**
  - 10.63 "I know everything"
  - 10.73 "essentially, essentially an unaccountable character"
  - 11.67 "they certainly won't"
  - 12.69 "his first crime, … his first crime"

### F3 register (ch 11 and 12)

There are 192 contraction proposals. Contractions were applied only inside quoted dialogue and inner speech; narration was left untouched. Each proposal is a short span that is unique in its paragraph, and the proposals are ordered so they apply cleanly one after another after the content fixes in the same paragraph.

**Deliberately left uncontracted:**

- **All of Luzhin's speeches** (12.9–12.96: 12.9, 11, 13, 17, 24, 29, 31, 33, 37, 39, 41, 43, 45, 48, 52, 54, 56, 59, 70, 72, 74, 80, 82, 84, 87, 89, 91, 94, 96). His pompous stiffness is the point.
- **12.7** "Yes, I am Raskolnikov!" is an emphatic self-assertion.
- **11.49** "he would with someone else", because "he'd with" is ungrammatical.

## Considered and rejected

- **10.0** "fancied" is now "thought". It stays close enough in context: his sense of time is plainly uncertain.
- **10.25** "treacle" is now "honey", and **10.29** "How the devil" is now "How the hell". Both are acceptable modern equivalents.
- **10.71** "an... unusual character, let's say". The hesitation stands in for "so to speak"; it is acceptable.
- **10.111** "ashamed of the thing". The source's "bird's nest" refers to the cap, so the meaning holds.
- **11.49 and 11.51**
  - The nested quotation marks inside Dushkin's and Nikolay's testimony were removed. This is a readability choice; attribution is kept by "I asked", "he said", "Question:" and "Answer:".
  - "Widow So-and-so" became "a widow". This is minor and was left.
- **11.65** The trailing "?" on "They'd have just killed them…" keeps the source's incredulity.
- **12.0 and 12.27** "cabin" became "cramped little room", and Luzhin's clothing description is lightly condensed. The substance and irony are intact.
- **12.24 and 12.48** Luzhin's diction is plainer than Garnett's ("sojourning", "in full possession of the tidings"), but he still reads as stiff. Rewriting was not warranted under "no optional polishing".
- **12.49** "muttered" instead of "pronounced". This is consistent with Luzhin not catching the words in 12.50.
- **12.107** The candidate spells out "Raskolnikov's sister" and "Raskolnikov got a letter". This is a helpful clarification of an ambiguous "his", and it is accurate.

## Verdict

After these repairs the batch is faithful. The five blocking defects (two reversals, one dropped key question, one certainty drift, one smoothed stammer) are all fixed by local edits. Chapters 11 and 12 regain natural contractions, and Luzhin's register is preserved. No passage is left unresolved.
