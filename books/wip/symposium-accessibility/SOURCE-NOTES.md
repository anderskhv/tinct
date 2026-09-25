# Source and structure notes (reported separately, not changed)

The assignment asks for structural and source defects to be reported separately from the rendering. This file does that and records the source variants that `books/CLAUDE.md` requires to be documented.

**Result.** This pass found no new structural or source defect. The paragraph structure, chapter boundaries and titles, and the original-en text are exactly those of the accepted completeness repair.

## 1. Source text (original-en, Jowett)

- **Not changed.** original-en stays at the completeness file, `3521a12d…95a6`.
- **The ten Gutenberg typographical slips** recorded in `../symposium-completeness-repair/source/SOURCE.md` stay reproduced verbatim in original-en; correcting them would be a separate source-emendation decision.
  - The final modern-en renders the intended sense at each slip in the running text: 1.40, 3.5, 3.9, 4.1, 5.4, 5.16, 7.62 and 8.29. For example, 8.29 separates the two questions, and 7.62 reads "one and the same".
  - The slips at 6.4 and 6.10 sit in Jowett's bracketed notes, which modern-en omits by convention.

## 2. Structure: observations, not defects

The assignment fixes paragraph order and count, so none of these was changed. Each is the source's own layout or an accepted decision.

| Where | Observation | Why it stays |
|---|---|---|
| 1.0 | The frame opens with no speaker label, while 1.8–1.11 use labels (Review 2 #1) | Jowett's own format: his labels begin at 1.8. The restored opening 1.0–1.8 is byte-identical to the accepted completeness text |
| 1.7 | One paragraph holds the end of the Glaucon conversation and the return to the present listener (Review 2 #2) | Jowett's paragraphing; the restored opening is protected |
| 7.0 | Socrates's first turn has no quotation marks, but his later questions (7.2–7.44) are quoted (Review 1B note 2; Review 2 #43) | 6.12 introduces it as a set speech ("Socrates then proceeded as follows:"), and set speeches are unquoted (STYLE §3.1). The 7.45 address "Agathon" marks the return to the set speech |
| 8.0 / 8.1 | Alcibiades's first words are split across two paragraphs | Pre-existing and already recorded by the completeness package. The continuation convention (STYLE §3) makes the split readable |

## 3. Source variants: where Jowett differs from Plato's Greek

The reviewers identified places where v1 had followed Plato's Greek (or a modern translation) instead of Jowett. Under the source policy (STYLE §1a), **the final text follows Jowett at every one**. They are recorded here as `books/CLAUDE.md` requires ("do not silently mix their readings; document substantive source variants").

The Greek readings are given as the reviewers reported them, with Stephanus references where they gave one. The lead did not consult the Greek independently.

| Where | Jowett (followed) | Greek reading, as reported | Review |
|---|---|---|---|
| 5.3 | "or if man came to man they might be satisfied" | adds "at least" (*goun*) | 1B #5 |
| 5.3 | "while they are young" | "boys" | 1B #6 |
| 7.47–7.48 | "on the birthday of Aphrodite"; Love "was born on her birthday" | "conceived" (*gennetheis*, 203c) | 1C #1, #28 |
| 7.51 | "All creation or passage of non-being into being is poetry or making" | every *cause* of such a passage (*aitia*, 205b–c) | 1C #8 |
| 7.54 | "But why of generation?" is Socrates's question, and the answer is tagged "she replied" | both lines are Diotima's (206e) | 1C #2 |
| 7.64 | What absolute beauty *is* not ("… or existing in any other being") | how it will *appear* to him (211a) | 1C #15 |
| 7.64 | "under the influence of true love" (a Jowett softening, kept) | "correct pederasty" (211b) | 1C #28 |
| 8.23 | "a figure which will appear to him to be a caricature" (rendered "He will think it a caricature") | "perhaps" (215a) | 1D #20 |
| 8.28 | "or in some other part" | "or whatever one should call it" (218a) | 1D #11 |
| 8.28 | "likely to understand him" (Jowett's hedge) | "will understand" | 1D #10 |
| 8.29 | "infinitely higher" | "vastly" | 1D #13 |
| 8.36 | "never touched in war" | "as a rule" (*schedon ti*, 221b) | 1D #2 |
| 8.37 | "the whole duty of a good and honourable man" | "consider" (222a) | 1D #18 |

Reviewers 1C (#28) and 1D (#20) also listed smaller Greek-derived wordings that changed little or no meaning. They were reverted to Jowett's wording as well, except for two syntax-only choices that the reviewer accepted: "what loves" (7.49) and "He will no longer be" (7.63). See `reviews/RESOLUTION.md`.

Review 1B (note 1) accepted seven more phrasings as faithful clarifications of Jowett's own meaning. None changes his meaning, so none is a source variant:

- 5.2 "toward the cut side";
- 5.3 "pursue males";
- 5.5 "never apart";
- 6.6 "partly playful and partly, in a modest way, serious";
- 6.10 "competing with your speeches";
- 7.14 "rather than 'probably'", which points back to Agathon's "Probably not" in 7.13;
- 7.40 "isn't what is good also beautiful?".

## 4. Documented editorial exceptions

These three places depart from a literal rendering of Jowett for clarity. Each is an explicit decision, listed in STYLE §1a, `CHANGES.md` and `reviews/RESOLUTION.md`:

1. **4.1, "under the rule of love".** Jowett's "his dominion" follows a sentence about Asclepius. Eryximachus's thesis in 4.0 is that love rules over all things.
2. **7.0, "that is, whose child Love is".** The phrase "the love of a father or the love of a mother" stayed opaque to the blind reader. The gloss states the reading that the sentence's own contrast requires: "is a father the father of something?".
3. **3.8, the gloss after 'uses base'.** The accepted C-06 wording is kept verbatim and followed by "would let anyone use him basely".
