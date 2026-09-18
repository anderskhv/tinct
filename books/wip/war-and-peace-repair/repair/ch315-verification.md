Model: opus

# Chapter 315 — Book Fourteen (1812), Chapter 17 — independent verification

Verifier did not draft, review or correct this chapter. Files compared:
`ch315-candidate.json` (pre-correction), `ch315-corrected.json`, `ch315-corrections-log.md`,
`ch315-source.json` (Maude). Paragraph indices below are 0-based, matching the review and the log.

## 1. Diff vs log

Paragraphs that actually differ between candidate and corrected (computed by string comparison,
not read off the log): **0, 2, 3, 4, 5, 6**. Unchanged: 1.

Paragraphs with a log entry: **0, 2, 3, 4, 5, 6**.

- Logged but not changed: none.
- Changed but not logged: none.
- Every log entry's `Before:` string is byte-identical to the corresponding candidate paragraph, and
  every `After:` string is byte-identical to the corresponding corrected paragraph (6/6).

No mismatch.

## 2. Per-change verdicts (re-derived from the source, not from the log)

| ¶ | Change | Source warrant | Verdict |
|---|---|---|---|
| 0 | "the retreat from Moscow to the Niemen" → "the campaign from Moscow back to the Niemen"; "where two blindfolded players stumble about and one occasionally rings" → "in which two players are blindfolded and one of them occasionally rings" | "during the campaign from Moscow back to the Niemen"; "in which two players are blindfolded and one of them occasionally rings a little bell" | Both correct. The sentence covers both armies, so "campaign … back" is the right word and "retreat" was wrong for the Russians; the invented "stumble about" is gone. "To let the catcher know where he is" (for "to inform the catcher of his whereabouts") is an unflagged gloss carrying the same claim. |
| 2 | "the main means of determining" → "of approximately determining"; "in a completely different spot" → "in quite another position" | "the chief means of approximately ascertaining the enemy's position"; "in quite another position" | Both correct. The hedge is the paragraph's premise — scouting never gave more than an approximation — and "position" is restored as the running term across all three sentences. |
| 3 | "after a four-day rest" → "after a four-day halt"; "no strategy or plans" → "no maneuvers or plans"; "simply started running again" → "started running again" | "after a four days' halt the mob, with no maneuvers or plans, again began running along the beaten track" | All three correct. "Halt" no longer implies recuperation the source denies, "maneuvers" is concrete again, and the added intensifier is gone. |
| 4 | "+ separated in their flight and"; "the Russian vanguard" → "our vanguard"; "(the Viceroy's) corps" → "(the Viceroy's)"; "wide detours" → "semicircles" | "the French separated in their flight and spread out over a distance of twenty-four hours"; "the French ran into our vanguard"; "first Murat's (the vice-king's), then Davout's, and then Ney's"; "by making semicircles to the right" | All four correct. Two facts (they split apart; they strung out) are restored; Tolstoy's "our" puts the narrator back with the Russians; "corps" is dropped per the editor's ruling, which matters here because ¶3 has just called this a mob with no organisation; the precise figure "semicircles" is back. "Twenty-four hours' march" remains as an accepted gloss on the distance-in-time. |
| 5 | Simile "the way a child who has fallen strikes the ground for tripping it" deleted; "their desperate plight, or perhaps because of it" → "their unfortunate plight, or because of it"; "all the rest along with his cannon" → "all the rest and all his cannon" | "they wished to punish the floor against which they had hurt themselves"; "despite the unfortunate plight of the French or because of it"; "having abandoned all the rest and all his cannon" | **MAJOR cleared.** The added image and its added motive ("for tripping it") are gone; the floor stands bare, as in Maude, and the childishness is left for the reader to supply. The two MINORs are exact restores — the flat "or because of it" no longer hedged, and the second "all" insisting every gun was left. See §5 on the retained agent. |
| 6 | "Their supreme commander" → "Their supreme chief" | "Their supreme chief donned a fur coat" | Correct. The sardonic epithet that pointedly does not name Napoleon is restored — the same narrator's stance recovered at ¶4 with "our vanguard". |

No correction introduced a new claim, dropped a claim, or sharpened one. Nothing was merged, split or reordered.

## 3. New reader pass

Read end to end as a first-time reader. The blindman's-buff frame holds at every joint: setup and bell
(¶0), clapper held tight on the Smolensk road (¶1), the collision at Krasnoe (¶4), still playing with
the pursuing army (¶6). ¶5 without the simile reads better than with it — "the French wanted to punish
the floor that had hurt them" is self-explaining and the absurdity lands without being spelled out.
"Our vanguard" is unambiguous in context (the preceding sentence is about the Russian army) and gives
the chapter back its voice. Geography and numbers are followable throughout. No paragraph is harder to
read than the pre-correction candidate.

## 4. Structure and punctuation

- Paragraph count: source 7, candidate 7, corrected 7. Order unchanged; no empty paragraphs.
- `number` 315 and title "Book Fourteen (1812) — Chapter 17" identical across source, candidate and corrected.
- Question marks: zero in source and zero in corrected, all 7 paragraphs. Exclamation marks: zero and zero, all 7.
- No punctuation counts changed between candidate and corrected.
- Word count never falls below 0.89 of the source paragraph (chapter mean 0.93).

## 5. New findings

- **¶5, MODERATE (carried by explicit editor ruling — not a blocking finding here).** The agent flip stands:
  the corrected text reads "the floor that had hurt them" where Maude has "the floor against which they had
  hurt themselves". The fidelity review graded this MODERATE and proposed a reflexive; the editor ruled that
  ¶5 keeps "the floor that had hurt them" with no simile, and the log records the ruling accurately. Verified
  as applied-as-ruled. Flagged here only so the record shows the review finding was decided, not missed.
- **¶3, cosmetic (new, introduced by the correction).** Restoring "rest" → "halt" leaves "four-day halt there"
  and "after a four-day halt" two clauses apart, where the source varies ("their stay of four days" … "a four
  days' halt"). Fidelity is improved and the repetition is mild; worth a one-word variation on a later pass.
  Not blocking.
- **¶6, cosmetic (carried, logged).** "still playing blindman's buff" drops the source's "playing **at**
  blindman's buff". Raised only in the review's whole-chapter notes, not as a finding row; correctly left.
- **¶4, no finding.** "The Viceroy's" for "the vice-king's" is a legitimate modernisation of the same title
  (vice-roi), as the review states; the restored "as it were" hedge is present, in the source's position.
- Apart from the ruled-on ¶5 agent, no MAJOR or MODERATE finding from `ch315-fidelity.md` remains outstanding.

Verification: ACCEPT
sha256: 43cbe228359d9dacfc80a7d88fba09f10b95e1eea5d62764597117b9400414ca
