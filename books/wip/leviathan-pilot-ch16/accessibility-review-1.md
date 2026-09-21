# Accessibility Review — Reviewer A (fresh read)

**Book/chapter:** Leviathan, Chapter 15 ("Of Other Laws of Nature") — pilot chapter labeled "16" in the file (`number: 16`, `title: "Chapter 15..."`)

**Coverage confirmed:** I read all 43 paragraphs in full, in order, indices 0–42 (paragraphs 1–43 as numbered in the JSON array). No source text or drafter notes were consulted — this is a cold read of the candidate only, judged purely as English prose.

---

## Paragraph-by-paragraph issues

**Paragraph 4** (the "Fool" passage) — several stacked problems in one paragraph:
- *"The fool has said in his heart that there's no such thing as justice"* — this is a direct echo of Psalm 14:1 ("The fool hath said in his heart, There is no God"). A general reader won't recognize the allusion, and without recognizing it, the repeated device later in the same paragraph — *"for this same fool has also said in his heart that there is no God"* — reads as a strange non-sequitur rather than the deliberate irony it is.
- *"The kingdom of God is taken by force"* — an unglossed biblical allusion (Matthew 11:12) dropped into the middle of an argument about opportunistic injustice. A reader who doesn't know the source will misread this as the narrator's own claim rather than a proverb being repurposed ironically.
- *"rather like a point of law in Coke's Commentary on Littleton, where he says that if the rightful heir to the crown is convicted of treason, the crown will still pass to him, and the conviction becomes void the instant it does."* — "Coke's Commentary on Littleton" is a specific 17th-century English legal text no general reader today will recognize, and the legal point itself (treason conviction voided by succession) is asserted with no framing for why it's relevant. This is a real stumbling block, not just unfamiliar-but-parseable vocabulary.
- Overloaded sentence: *"But he asks whether injustice — once it has set aside the fear of God (for this same fool has also said in his heart that there is no God) — might not sometimes agree with the reason that tells every man to pursue his own good, particularly when it leads to a benefit great enough to let a man ignore not just other people's scorn and abuse but their power as well."* Grammatically legal but has a parenthetical nested inside a subordinate clause inside the main clause; likely needs a second pass to parse who is doing what.

**Paragraph 12** — a likely grammatical defect, not just difficulty:
- *"but the damage falls on the stranger, to whom the servant owed nothing, and so could not have wronged."*
  "Could not have wronged" has no object and an ambiguous subject. Read literally, it seems to want either "...and so could not have been wronged" (passive, about the stranger) or "...and so [the servant] could not have wronged [him]" (active, with "him" dropped). As written it's an incomplete construction that will make readers stop and reread the sentence to recover the intended meaning. Worth flagging even though the surrounding example (master/servant/stranger, injury vs. damage) is otherwise the clearest illustrative passage in the chapter.

**Paragraph 14** — unglossed technical vocabulary:
- *"the first, they say, follows arithmetical proportion, the second geometrical proportion"* — "arithmetical proportion" and "geometrical proportion" are Aristotelian technical terms (equal difference vs. equal ratio) that are never explained. The paragraph goes on to critique the commutative/distributive framework built on these terms, but a reader who doesn't already know what "arithmetical" vs. "geometrical" proportion means mathematically will not be able to follow why the definitions being offered ("equal value of things exchanged" / "equal benefit to men of equal merit") correspond to those two labels at all. This is a genuine comprehension gap, not just unfamiliar phrasing.

**Paragraph 31** — overloaded sentence:
- *"And because, however willing people may be to observe these laws, questions can still arise about a man's action — first, whether it was done at all, and second, if it was done, whether it violated the law or not (the first kind of question being a question of fact, the second a question of right) — unless the parties to the dispute agree to abide by the judgment of a third party, they remain as far from peace as ever."*
  Two levels of parenthetical/em-dash interruption before the main clause resolves ("...they remain as far from peace..."). By the time the reader reaches the resolution, the initial "however willing people may be" clause has to be mentally reloaded. A natural break (e.g., turning the fact/right distinction into its own sentence) would fix this without losing content.

**Paragraph 22** — minor, not really a problem: the rhetorical triple negative *"they don't always — or even often, or hardly ever — come out the winners"* is a stylistic flourish that could cause a half-beat stumble, but it's deliberate and legible on a second look. Flagging only for completeness; I would not prioritize a fix here.

---

## Numbered-maxim structure and terminology consistency (explicitly requested)

This is **not consistent**, and it's a real reader-facing problem given the chapter is explicitly organized as an enumerated list.

- Laws 3 through 9 are explicitly numbered in prose and easy to track: "a third law" (¶1), "the fourth law of nature" (¶20 in text / index 19... — concretely: "fourth law" at index 19, "fifth law of nature is COMPLAISANCE" at index 20, "sixth law of nature" at index 21, "seventh law" (bracket + prose) at index 22–23, "eighth law of nature" at index 24, "ninth law of nature" at index 25.
- After the ninth law, the text silently drops ordinal numbering for a long stretch: "Another law follows from this one" (index 26, should be 10th), "Also, 'if a man is entrusted to judge...'" (index 27, should be 11th, this is where EQUITY is defined), "From this follows another law" (index 29, should be 12th), the by-lot law (index 30, should be 13th), the primogeniture/first-seizure material (indices 31–32, should be 14th), the safe-passage-for-mediators law (index 33, should be 15th), the submit-to-arbitrator law (index 34, should be 16th), the no-man-judge-in-own-case law (index 35, should be 17th) — none of these carry an explicit ordinal.
- Then, abruptly, a bracketed editorial note at index 36 says **"[The eighteenth law: no man should be judge who has in him a cause of bias.]"** — a specific number reappears out of nowhere. A reader who has been tracking "third... fourth... fifth... sixth... seventh... eighth... ninth" and then loses the thread for seven consecutive laws will be caught off guard by "eighteenth" and may reasonably wonder whether they missed something or whether laws were skipped/miscounted. (For what it's worth, "eighteenth" does match the traditional numbering of this particular law in the work overall, but nothing in this candidate re-orients the reader to how we got from 9 to 18.)
- The witnesses-in-fact-disputes law (index 38, traditionally 19th) is again unnumbered.

So: the small-caps defined-term convention (JUSTICE, COMPLAISANCE, SOCIABLE, EQUITY, ARBITRATOR) is applied consistently throughout and reads cleanly. But the ordinal numbering — the thing that actually signals "this is a list, here's where we are in it" — is applied only to the first seven-ish laws and the one bracketed "eighteenth," then abandoned everywhere else. For a chapter whose whole organizing structure is an enumerated list, this seams-showing pattern (consistent with having been assembled from packets that each handled part of the numbering differently) is worth fixing before this ships: either number every law explicitly, or drop numbering consistently and let the "law of nature" phrasing alone carry the structure.

---

## What's working well

- The stone-masonry metaphor for complaisance (index 20 — *"much like the stones gathered for building a structure"*) is vivid, fully modernized, and does real explanatory work; this is the best passage in the chapter.
- The master/servant/stranger example distinguishing injury from damage (index 15) is concrete and well-sequenced, aside from the one broken sentence noted above.
- The golden-rule condensation (index 40 — *"Do not do to another what you would not want done to yourself"*) lands cleanly and the surrounding scale/weighing metaphor is easy to follow.
- Latin terms (*in foro interno* / *in foro externo*, index 41) are glossed immediately and clearly at first use.
- Greek/technical terms elsewhere (*pleonexia*, *kleronomia*, *Prosopolepsia*, *commodi*) are all glossed inline at first mention — good, consistent handling.
- The overall argumentative throughline (justice → the Fool's objection → refutation → gratitude → complaisance → the run of remaining laws → natural law as science/conscience) is easy to follow at the paragraph level; most individual sentences, even long ones, resolve cleanly. The difficulty here is concentrated in a handful of identifiable spots, not smeared across the whole chapter.

---

## Verdict: needs targeted fixes

Most of the chapter's residual difficulty is unavoidable conceptual complexity — Hobbes's argument about covenants, the state of nature, and the origin of justice is genuinely dense material, and this rendering handles that density about as well as prose can. But there is a specific, avoidably-difficult residue that isn't just "hard ideas expressed clearly": the broken clause in paragraph 12 ("could not have wronged"), the unglossed technical pair "arithmetical/geometrical proportion" in paragraph 14, the unexplained Coke's-Commentary legal reference and biblical allusions in paragraph 4, the doubly-nested sentence in paragraph 31, and — most structurally — the numbering that tracks cleanly for the first seven-odd laws, disappears for a long stretch, then resurfaces once at "eighteenth" with no signpost. None of these require rewriting the chapter; they're each a local, fixable edit.

**Summary:** This is a strong modernization of dense material — the connecting logic between paragraphs is clear, the defined-term convention is applied consistently, and at least two passages (the stone metaphor, the master/servant example) are genuinely well done. The fixes needed are narrow and concrete rather than a broad-pass problem: one ambiguous/incomplete sentence, one unglossed technical-term pair, a couple of unexplained historical/legal references, one overloaded sentence, and a numbering scheme that should either be applied to every law in the chapter or dropped consistently rather than appearing for laws 3–9 and then again only at "eighteenth."
