# Accessibility Review (Reviewer A) — "Strange Case of Dr Jekyll and Mr Hyde", Modern English candidate

## Coverage

Read the entire `candidate.json` at `/home/user/tinct-fj/books/wip/green-jekyll-and-hyde/candidate.json` start to finish, all 10 chapters, every paragraph, in full (no sampling). No source/original text, no baseline, and no notes/review files were opened.

Paragraph counts read, by chapter (0-indexed paragraph arrays, as referenced in the findings file):

| Chapter | Title | Paragraphs read |
|---|---|---|
| 1 | Story of the Door | 28 (0–27) |
| 2 | Search for Mr. Hyde | 50 (0–49) |
| 3 | Dr. Jekyll Was Quite at Ease | 17 (0–16) |
| 4 | The Carew Murder Case | 18 (0–17) |
| 5 | Incident of the Letter | 38 (0–37) |
| 6 | Remarkable Incident of Doctor Lanyon | 13 (0–12) |
| 7 | Incident at the Window | 14 (0–13) |
| 8 | The Last Night | 99 (0–98) |
| 9 | Dr. Lanyon's Narrative | 34 (0–33) |
| 10 | Henry Jekyll's Full Statement of the Case | 28 (0–27) |
| **Total** | | **339 paragraphs** |

Note on process: the candidate file appeared to be under live, concurrent revision during this review (several small wordings — e.g. "gray"→"grey", "silverware"→"tableware", "press"→"cabinet"/"study" — differed between an early full read and a later re-read of the same paragraphs). To avoid reporting stale findings, the whole file was re-read fresh partway through the review, and every "old" quote in the findings file was verified against the live file content with a Python substring check immediately before writing this report.

## Findings

5 findings, 1 blocking, 4 non-blocking. Full detail with exact quotes, suggested rewrites, and reasoning in `jek-acc.json`. Summary:

1. **Ch. 2, ¶0 (BLOCKING, category: aloud)** — The will's key clause ("if Henry Jekyll... should die... but also that in case of... disappearance... the said Edward Hyde should step into the said Henry Jekyll's shoes...") is delivered as one long legalistic sentence with a "not only/but also" structure, a string of academic-title abbreviations, and repeated "the said X" legal phrasing. This sentence is the reader's first statement of the central plot premise (Hyde inherits on Jekyll's death *or* disappearance) — the whole of Utterson's dread for the rest of the book depends on the reader having caught it. Heard aloud once, it's genuinely easy to lose which condition triggers what.
2. **Ch. 2, ¶12 (non-blocking, archaic)** — "strange preference or bondage (call it which you please)": "bondage" now reads first as slavery/restraint (or its sexual sense) to a contemporary reader, a jarring momentary misdirect in a sentence not about either.
3. **Ch. 4, ¶0 (non-blocking, archaic)** — "she had a romantic streak" — used in the old sense of fanciful/sentimental, but a modern reader will default to the love-related sense, and nothing romantic (in that sense) follows.
4. **Ch. 10, ¶0 (non-blocking, archaic)** — "Profound a double-dealer as I was, I was never in any sense a hypocrite" — an inverted "as...as" construction with the leading "As" dropped; parses awkwardly on first hearing, easily mistaken for a sentence fragment.
5. **Ch. 10, ¶9 (non-blocking, consistency)** — "Men have hired hitmen before now" — "hitmen" is 20th-century American gangster slang, out of step with the otherwise formal, reflective Victorian-modernized register of Jekyll's confession; the only place in the book this modern a word choice appears.

## What's working well

- The narration outside Jekyll's confession (chapters 1–9) reads cleanly and naturally aloud; dialogue is easy to follow, and Poole's voice (Ch. 8) in particular is vivid and well-differentiated from Utterson's.
- Every archaic or obscure allusion I checked (Cain's heresy, Damon and Pythias, Dr. Fell, "Queer Street," "pede claudo," the Philippi earthquake, the writing on the wall) is glossed in-line well enough that a reader doesn't need to recognize the reference to follow the sentence — nice, consistent handling of this throughout.
- No ambiguous Jekyll/Hyde "he" pronoun problems found anywhere, including in the dense final chapters where the narration splits into describing both as separate entities (Ch. 10, the "For Jekyll... Hyde's hatred of Jekyll..." passage) — the prose consistently uses the names, not bare pronouns, at exactly the points where ambiguity could arise.
- No archaic diction (thee/thou/hath-type constructions) survives anywhere in the candidate — the modernization is thorough on that front.
- House style (curly quotes, British spelling: colour/favour/neighbour/recognise/practising/centred/cheque/grey, etc.) is applied consistently across all 10 chapters; found no straight quotes and no American spelling variants anywhere in the text.
- Chapter 10 (Jekyll's confession) is inherently the densest, most abstract chapter in the book — long, semicolon-chained, introspective sentences are part of its deliberate register as a first-person philosophical confession, and most of them, while demanding, are followable on a normal read/listen. Only the two specific items above (¶0's inverted syntax, ¶9's "hitmen") stood out as genuine friction rather than intentional density.

## Verdict

**BLOCKING FINDINGS** — one genuine comprehension blocker (Ch. 2, ¶0), plus four minor, non-blocking polish items. The book is otherwise substantially accessible; fixing the will sentence in Chapter 2 is the only item I'd treat as necessary before sign-off.
