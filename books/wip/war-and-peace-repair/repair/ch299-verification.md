Model: opus

# Chapter 299 — Book Fourteen (1812), Chapter 1 — independent verification

Verifier did not draft, review or correct this chapter. Files compared:
`ch299-candidate.json` (pre-correction), `ch299-corrected.json`, `ch299-corrections-log.md`,
`ch299-source.json` (Maude). Paragraph indices below are 0-based, matching the review and the log.

## 1. Diff vs log

Paragraphs that actually differ between candidate and corrected (computed by string comparison,
not read off the log): **0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13**. Unchanged: 9, 10.

Paragraphs with a log entry: **0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13**.

- Logged but not changed: none.
- Changed but not logged: none.
- Every log entry's `Before:` string is byte-identical to the corresponding candidate paragraph, and
  every `After:` string is byte-identical to the corresponding corrected paragraph (12/12).

No mismatch. The log is a faithful record of the file.

## 2. Per-change verdicts (re-derived from the source, not from the log)

| ¶ | Change | Source warrant | Verdict |
|---|---|---|---|
| 0 | "without further major engagements" → "without further conflicts"; "events" → "phenomena" | "the flight of the French without further conflicts … one of the most instructive phenomena in history" | Correct. Both restore source wording exactly; the ¶5 "historic phenomenon" callback is re-established. |
| 1 | "external activity of nations" → "of states and nations"; "political strength of states" → "of states and nations" | "the external activity of states and nations…"; "the political strength of states and nations increases or decreases" | Correct, both halves of the doublet restored. |
| 2 | "a kingdom" → "a kingdom and an entire nation"; "a reliable sign" → "an essential indication"; "it makes little sense" → "it is unintelligible"; "the army is destroyed outright" → "its army suffers a complete defeat" | "subjugates a kingdom and an entire nation of several millions"; "or at least an essential indication"; "it is unintelligible why…"; "if its army suffers a complete defeat" | All four correct and complete. "should force" (for source "oblige") survives; that was not a flagged row and carries the same claim. |
| 3 | Past tense → historical present ("is defeated / loses / grow / destroy") | "Austria loses its rights, and the rights and the strength of France increase. The victories … destroy the independent existence of Prussia." | Correct. The ¶3-¶4 rule/exception parallel is now grammatically intact ("Austria loses" … "the French win a victory"). No new drift. |
| 4 | "is simply impossible" → "is impossible" | "is impossible" | Correct; intensifier removed. |
| 5 | "dodge" → "expedient"; "their theories" → "their standards"; "a matter of national survival" → "a question of the life or death of their fatherland" | "the historians' usual expedient when anything does not fit their standards"; "it was a question of the life or death of their fatherland" | All three correct. Dry irony and the concrete "fatherland" restored. |
| 6 | "doesn't necessarily lead to a conquest" → "does not produce a conquest"; "a reliable indicator" → "an invariable indicator" | "the winning of a battle does not produce a conquest and is not even an invariable indication of conquest" | **MODERATE cleared.** The flat denial is restored, and the ¶2/¶6 "essential / invariable indication" pair is back. |
| 7 | "the surrounding districts" → "the district" | "the peasants of the district burned their hay" | Correct; scope narrowed back. |
| 8 | "who personally displayed no heroic feelings whatsoever" → "who in general personally displayed no heroic feelings" | "and in general personally failed to manifest any heroic feelings" | Correct; hedge restored, intensifier removed. |
| 11 | "the hunting of marauders" → "the capture of marauders" | "the capture of marauders" | Correct. |
| 12 | "as if there were rules" → "as if there were any rules"; "felt just as uneasy about" → "felt it was rather disgraceful to"; "elegant fencing positions … artful thrusts" → "the fencing positions—en quarte or en tierce, according to all the rules—and deliver an adroit thrust en prime"; "brutal simplicity, over and over" → "stupid simplicity, but consistently"; "+ and regardless of anything else" | "as if there were any rules for killing people"; "to some highly placed Russians it seemed rather disgraceful to fight with a cudgel"; "assume a pose en quarte or en tierce according to all the rules, and to make an adroit thrust en prime, and so on"; "with stupid simplicity, but consistently"; "without consulting anyone's tastes or rules and regardless of anything else" | **MAJOR substantially cleared, both MODERATEs cleared.** All three French fencing terms and "according to all the rules" are back in the source's order; the false equivalence ("just as") is gone and "disgraceful" restored; "stupid … but consistently" restored. One residual, below. |
| 13 | "bow" → "salute"; "simply pick up … and swing it" → "simply and easily pick up … and strike with it"; "outrage" → "resentment" | "salute according to all the rules of art"; "simply and easily pick up the first cudgel that comes to hand and strike with it"; "the feeling of resentment and revenge" | All three correct. The fencer's salute closes the metaphor chain opened at ¶9. |

No correction introduced a new claim, dropped a claim, or sharpened one. Nothing was merged, split or reordered.

## 3. New reader pass

Read end to end as a first-time reader. The argument tracks: rule (¶1–3) → exception (¶4–6) → cause
(¶7–8) → duel parable (¶9–10) → application (¶11–13). The restored historical present in ¶3 reads
naturally beside ¶4. The restored French fencing terms in ¶12 are the one place a reader may need
context; "the fencing positions—en quarte or en tierce, according to all the rules—" supplies enough
that the cudgel contrast lands, and the terms are the point of the satire. Mixed register in ¶6
("does not produce … isn't even") is audible but not unclear. No paragraph is harder to read than the
pre-correction candidate.

## 4. Structure and punctuation

- Paragraph count: source 14, candidate 14, corrected 14. Order unchanged; no empty paragraphs.
- `number` 299 and title "Book Fourteen (1812) — Chapter 1" identical across source, candidate and corrected.
- Question marks: per-paragraph counts match the source in all 14 paragraphs (¶5 carries the chapter's single "?"). Exclamation marks: zero in source and zero in corrected, all 14 paragraphs.
- No punctuation counts changed between candidate and corrected.
- Word count never falls below 0.80 of the source paragraph (lowest ¶3 at 0.80; chapter mean 0.90).

## 5. New findings

- **¶12, residual (MINOR).** The MAJOR row also named the dropped "and so on"; the corrected text ends
  the list at "an adroit thrust en prime" with no open-list marker, so the source's exemplary list still
  reads as exhaustive. This is neither logged as applied nor listed under "deliberately not applied".
  Same class as the "such as" → dash finding graded MINOR in ch314 ¶2. Not blocking; queue for the next pass.
- **¶12, cosmetic.** Restored French is given without a following English gloss, where CONVENTIONS.md §French
  point 3 asks for the original "immediately followed by the English". The preceding tag "the fencing positions"
  covers the sense. Left as the editor ruled; noted for the French pass.
- **¶5, cosmetic (carried).** Single quotes around 'not a historical phenomenon' remain, against CONVENTIONS.md
  ("straight double quotation marks … single quotes only for quotes within quotes"). Correctly logged as not
  applied; a scripted quote-style normalisation is already on the consistency backlog.
- **¶12, MINOR (carried, logged).** "The French complained that it wasn't fair play" still stands for
  "the complaints of the French as to the nonobservance of the rules". Deliberately not applied; acceptable.
- No MAJOR or MODERATE finding from `ch299-fidelity.md` remains outstanding.

Verification: ACCEPT
sha256: 36711ab9b5760b489bea09ee39d065ffbf82d769cf065325bf83c222280dba4c
