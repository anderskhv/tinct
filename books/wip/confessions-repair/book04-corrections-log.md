# Confessions Book 4 — corrections log

Source of findings: `book04-review.md` (25 findings: 1 major, 6 moderate, 18 minor).
Base file: `book04-candidate.json` (frozen, untouched).
Output: `book04-corrected.json`.

Method: surgical, targeted string substitutions only. No paragraph was rewritten wholesale; only the spans identified by the review were changed. Paragraphs with no confirmed finding were left byte-identical to the candidate.

## Paragraphs changed: 19 / 31

0, 2, 3, 4, 5, 7, 8, 9, 11, 12, 13, 16, 17, 20, 21, 22, 26, 29, 30

## Paragraphs untouched: 12 / 31

1, 6, 10, 14, 15, 18, 19, 23, 24, 25, 27, 28

(Para 18 has a sub-threshold observation in the review — "espoused" → "was joined to" loses the marriage verb — but the review explicitly does not count it as a finding and only suggests it as "worth restoring." Declined per the task's instruction not to rewrite paragraphs without a confirmed finding.)

---

## Major (1) — addressed

**Para 13.** Inverted referents for "well-pleased / displeased."
- Before: "…except from you when you please him, to you when you displease him?" (wrongly makes the man the one who is pleased/displeased, God the one doing the pleasing)
- After: "…except from you in your kindness to you in your anger?" (restores God as the one whose kindness/anger the man moves between)

---

## Moderate (6) — all addressed

1. **Para 9** — flattened rhetorical question (the meditation's governing question).
   - Before: "…so that you can tell me why weeping is sweet to the miserable." (statement)
   - After: "…— will you tell me why weeping is sweet to the miserable?" (restored as a question; question-mark count now matches source, 6→6)

2. **Para 20** — flattened rhetorical question (self-interrogation frame for the Hierius passage).
   - Before: "…and I had heard some of his words, which pleased me." (statement)
   - After: "…and for some words of his I had heard that pleased me?" (restored as a question; count now matches source, 2→2)

3. **Para 16, finding (a)** — imperative dissolved into an added "rather than" clause.
   - Before: "Why then be turned inside-out and follow your flesh — rather than have it turned around to follow you?"
   - After: "Why then be perverted and follow your flesh? Let it be converted instead, and follow you." (restores the question + separate imperative structure and the perverted/converted wordplay)

4. **Para 16, finding (b)** — quantifier error contradicting the syllable-timing example.
   - Before: "…made up of many parts, none of which exist all at once…" (says each part individually fails to exist all at once — wrong claim)
   - After: "…made up of many parts that do not all exist at the same time…" (correct claim: not all parts coexist simultaneously)

5. **Para 22** — broken thread back to para 20's "love of the praiser kindles love" conclusion.
   - Before: "…that I had loved him more for the sake of the men who praised him than for the very qualities he was praised for…" (reads as social deference, not about *love*)
   - After: "…that I had loved him more because of the love of the men who praised him than for the very qualities he was praised for…" (restores the connective thread to para 20)

6. **Paras 8/11** — inconsistent rendering of *phantasma*.
   - Para 8 before: "the shadow-thing she was being told to trust in" → after: "the phantom she was being told to trust in" (now matches para 11's existing "a mere phantom", which was left as-is)

---

## Minor (18) — 18 addressed, 1 declined with reason

1. **Para 0** — "the food that never runs out" (supply claim) → "the food that never perishes" (imperishability claim, matches source).
2. **Para 0** — "so that in the factory of their stomachs they could manufacture…" (purpose clause, drops material relation) → "— food out of which, in the factory of their stomachs, they would manufacture…" (restores "out of which").
3. **Para 2** — "commit a kind of adultery against you" (softened + hedge added) → "commit fornication against you" (restores biblical term, drops invented hedge).
4. **Para 2** — internal inconsistency "feed on wind" vs. later "feed the wind" → first instance changed to "feed the wind" to match the deliberate callback.
5. **Para 3** — "Christian and true religion" (inconsistent with para 30's "piety," and *pietas* ≠ *religio*) → "Christian and true piety."
6. **Para 3** — "a broken and humbled heart" (loses Ps. 51 "contrite") → "a broken and contrite heart."
7. **Para 4** — "as a man of some standing" (status claim, not what *gravis* means) → "being a serious man" (character claim).
8. **Para 4** — "that chance, spread throughout…" (drops *vis*, the causal force) → "that the force of chance, spread throughout…"
9. **Para 5** — "holy caution" (reads as ordinary prudence) → "holy fear" (reverent fear of God, the actual referent).
10. **Para 7** — "a startling, sudden independence" (turns *libertas* into autonomy-from-Augustine) → "a startling, sudden boldness" (frankness of speech, the correct sense).
11. **Para 11** — "I had neither rest nor sense" (sanity/judgment claim, redundant with "fell apart") → "I had neither rest nor counsel" (*consilium* = course of action/resolve).
12. **Para 12** — "the seeds of other griefs" (softer metaphor not in source; seeds may not germinate) → "the causes of other griefs" (source's actual claim).
13. **Para 13 (same paragraph as the major finding)** — "your law waiting in his own punishment" (invented "waiting" image) → "your law in his own punishment."
14. **Para 17** — "you who have turned away" (descriptive, softer, pre-empts the following "Where are you going?") → "you transgressors" (restores the moral/legal charge).
15. **Para 21** — "a beast-fighter in the arena" (wrong venue) → "a beast-fighter in the theatre" (matches Augustine's consistent theatre vocabulary elsewhere in Book 4).
16. **Para 22 (same paragraph as the moderate finding)** — "people with opinions" (nearly contentless) → "people who deal only in opinion" (*opinionative* = those who trade in mere opinion vs. truth).
17. **Para 26** — "and my bones did not yet exult, since they had not yet been humbled" (adds "my" not in source, converts relative clause to explicit causal "since") → "and the bones that had not yet been humbled did not exult" (restores relative-clause form and "the bones").
18. **Para 29** — "so fine a portion of my own being" (breaks the Prodigal Son/Luke 15 allusion — *substantia* is the inheritance/portion of goods, confirmed three clauses later by "far country" and "prostitutes") → "so good a portion of my inheritance."
19. **Para 30, finding (a)** — "A perversity too great to measure!" (invented "to measure") → "Too great a perversity!"
20. **Para 30, finding (b)** — "we ourselves are the ones turned aside" (added emphasis not in source) → "we are turned aside."

**Declined (1):**
- **Para 30, finding (c)** — question-mark count mismatch (2→3): the candidate adds a "?" to "Or what hindrance was a far slower wit to your little ones…?" where Pusey punctuates it as a statement. The review itself flags this as *not* the documented failure mode (a statement being flattened) but the reverse — a statement rendered as a genuine rhetorical question — and explicitly states "this is defensible… No correction required." Declined; left as-is.

---

## Mechanical re-checks (run against `book04-corrected.json`)

- **Paragraph count:** 31 / 31. PASS.
- **Archaism sweep** (`thou|thee|thy|thine|verily|doth|didst|hast|hath|whence|whither|wherefore|unto|nay|yea|shalt`, case-insensitive, word-boundary): **0 hits**. PASS.
- **Question-mark parity, flagged paragraphs:**
  - Para 9: source 6, corrected 6 (was 5 in candidate). Fixed. PASS.
  - Para 20: source 2, corrected 2 (was 1 in candidate). Fixed. PASS.
  - Para 30: source 2, corrected 3 (unchanged from candidate) — retained per the review's explicit "no correction required" note. Documented, not a regression.
- **Word-count ratio floor** (corrected/source per paragraph): checked all 31 paragraphs; no paragraph fell below 1.00 (i.e., no evidence of clause-dropping introduced by the corrections). PASS.
