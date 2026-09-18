Model: opus

# Chapter 252 — Book Eleven (1812), Chapter 23 — independent verification

Files verified: `ch252-candidate.json` (pre-correction), `ch252-corrected.json`, `ch252-corrections-log.md`, `ch252-source.json`. `ch252-fidelity.md` was read for context only; every verdict below was re-derived from the source, not from the log. I did not draft, review or correct this chapter.

## 1. Diff vs log

Python paragraph-by-paragraph diff of candidate against corrected (0-based indices, matching the log's numbering):

| ¶ | Changed in file? | Logged? |
|---|---|---|
| 0 | yes | yes |
| 2 | yes | yes |
| 5 | yes | yes |
| 7 | yes | yes |
| 11 | yes | yes |
| 12 | yes | yes |
| 14 | yes | yes |
| 17 | yes | yes |
| 18 | yes | yes |
| 20 | yes | yes |
| 23 | yes | yes |
| 24 | yes | yes |
| 27 | yes | yes |
| 28 | yes | yes |
| 29 | yes | yes |
| 30 | yes | yes |
| 31 | yes | yes |
| 35 | yes | yes |
| 39 | yes | yes |
| 41 | yes | yes |
| 42 | yes | yes |

Twenty-one paragraphs changed; twenty-one logged. Set equality exact. Every log **Before** block matches the candidate paragraph verbatim and every **After** block matches the corrected paragraph verbatim (42/42). **No mismatch.**

Non-paragraph structure (`number` 252, `title` "Book Eleven (1812) — Chapter 23", key set) is identical across source, candidate and corrected.

## 2. Per-change verdicts (re-derived from source)

**¶23 — MODERATE (invented attribution). Correct, and this is the decisive one.**
Source: "I say, is it true that we have been beaten?" "And what did you think? Look what folks are saying."
Corrected: "I say, is it true that we have been beaten?" "And what did you think? Look what folks are saying."
The candidate's "someone asked" and "another replied" are both gone, and nothing replaced them. The two quotations again stand bare and unattributed, which is what ¶24 depends on — I checked ¶24 in the corrected file: it still reads "Questions and answers were heard", and that summary now has anonymous material to summarise. The corrected paragraph is the source sentence with straight quotes; "we've been defeated" is also back to the source's "we have been beaten". Nothing attributed that the source leaves anonymous. No new drift.

**¶29 — MODERATE (dropped third cry). Correct.**
Source: "An ukáse, they are reading an ukáse! Reading an ukáse!" cried voices in the crowd, and the people rushed toward the reader.
Corrected: "A decree, they are reading a decree! Reading a decree!" voices cried, and the crowd rushed toward the reader.
The triple repetition is restored — the sound of the word going round the crowd. Word count rises from 15 to 21 against the source's 22, clearing the 75% floor this paragraph was the only one to breach. "Decree" for "ukáse" is a substitution the reviewer already ruled admissible; I confirmed it is applied consistently, including at ¶32.

**¶28 — MODERATE (partly-failed gloss). Correct.** "— a historic Moscow district, not a Chinese quarter —" is reduced to "a district of Moscow": the editorial correction addressed to the reader is gone, the evaluative "historic" is gone, and what remains is the bare category tag the reviewer proposed. The narrative voice holds at the point where the crowd scene tightens. Also restored in the same paragraph: "frieze coat" in place of the candidate's "rough coat" (a specific fabric, not a texture).

**¶27 — MODERATE. Correct.** "Aren't there plenty of troops on the march?" — the rhetorical question is restored against the candidate's flat assertion, and the crowd keeps its arguing voice. Verified against the source punctuation.

**¶0, ¶2, ¶5, ¶7, ¶11, ¶12, ¶14, ¶17, ¶18, ¶20, ¶24, ¶30, ¶31, ¶35, ¶39, ¶41, ¶42 — MINOR. All correct, all source-anchored.** Spot-checked each against the source: "he always carefully rolled it up again" and "fighting and blows in the passage and porch" restored (¶0 — the candidate had relocated the fight to "the doorway and porch" and dropped the passage); "a fight in the porch" restored (¶2); "the lad with the turned-up sleeve gave the smith a blow in the face" restored (¶5 — the candidate had substituted a different subject, "the tall young man punched"); "Oh, gracious me… beaten to death — killed!…" restored (¶7); "Bind him" restored twice against the candidate's "Grab" (¶11, ¶12), which matters because the publican's retort turns on the word; "Robbery is not permitted to anybody nowadays!" restored in full (¶14); "bootmakers" restored against "cobblers" so the sign and the men match the source (¶17, ¶20); "workingman… ceased speaking" restored (¶18, ¶20); "Questions and answers **were heard**" restored against the candidate's "flew" (¶24), which is what carries ¶23's anonymity; the unsourced attribution "Rostopchin's broadsheet" cut back to "the broadsheet" (¶30); the inserted gloss "— Kutuzov, the commander in chief —" removed from inside the read-aloud proclamation and "aid the army to exterminate these scoundrels" restored (¶31); "coachman" restored against "driver" (¶35, ¶41); "It's a fraud… Let him answer us!" restored (¶42).

The pattern across this chapter is right: the corrections consistently remove glosses inserted into quoted or read-aloud speech and restore Tolstoy's concrete nouns. No correction introduced a claim, attribution, number, or evaluation absent from the source.

## 3. Readability of the changed paragraphs

Re-read cold, all twenty-one are clear. Two are worth naming. ¶23 now gives two quotations with no speech tags — a new reader must infer two voices from the adjacency, but the source asks exactly that inference, ¶22 and ¶24 frame it as crowd noise, and inventing speakers to spare the reader that inference is precisely the error being corrected; fidelity is right here. ¶31 is dense because it interleaves the proclamation with the tall fellow's heckling, but the corrected version handles it better than the candidate: the asides are now closed parentheticals and the proclamation resumes with an explicit "…" so the reader can hear which voice is which. ¶0's restored long sentences remain tractable.

## 4. Structure and punctuation

- Paragraph count: source 45, candidate 45, corrected 45. Order unchanged; the 24 unchanged paragraphs are byte-identical to the candidate.
- No empty or whitespace-only paragraphs.
- Question/exclamation parity with source: 43 of 45 paragraphs exact. Two differ, and **neither was introduced by this round**:
  - ¶31 (+1 "?", +1 "!"): the heckler's "Do you see," → "See?" and "…clear up the whole affair for you…." → "…sort the whole thing out for you!". Both readings were already in the candidate; the corrections in this paragraph were elsewhere. The speaker "shouted victoriously" in the source, so the register is defensible, but it does sharpen punctuation the source left flat. MINOR.
  - ¶44 (+1 "!"): "left us to perish." → "left us to die!". Unchanged paragraph, pre-existing. MINOR.
  Neither is meaning drift. Recorded, not blocking.
- Valid JSON; keys `number`, `title`, `paragraphs`.
- Word-count ratio against source 97%; no paragraph below the 75% floor (¶29, the previous breach, is cleared).

## 5. Terminology ruling — "trap" → "carriage"

Ruled against the source, as asked. The source uses "trap" four times in this chapter, all for the police superintendent's vehicle (¶34, ¶36, ¶40, ¶42); the corrected text renders all four as "carriage".

**Verdict: MINOR. Not MODERATE. The corrector was right to leave it.**

Reasons: (a) Nothing is added, dropped, attributed or sharpened — "carriage" is the superordinate of "trap", so the only cost is vehicle specificity (a light two-wheeler becomes a generic horse-drawn vehicle). No event, motive, character or claim changes; the superintendent still drives in escorted by two mounted dragoons, still tells his coachman to go on, and the crowd still chases the thing. (b) "Trap" in this sense is genuinely opaque to a present-day reader, for whom the first sense of the word is a snare — so the substitution serves the reading edition's purpose rather than working against the source. (c) The rendering is consistent within the chapter: all four instances go the same way, so no reader sees two names for one vehicle.

The only real objection is cross-chapter: chapter 245 keeps "trap" at its ¶3 and ¶47. I checked both chapters against each other. They are different scenes, different owners (Berg's spruce little trap and the steward's, against the police superintendent's), and there is no cross-reference between them, so the divergence is invisible from inside either chapter and misleads no one tracking a vehicle. A later edition-wide consistency pass could settle on one word; it is not a fidelity defect and does not warrant another round.

## 6. New findings

- **MINOR, non-blocking (pre-existing, not touched).** ¶35 renders the source's "by Count Rostopchín's orders" as "on Rostopchin's orders", dropping the title. Not logged, because the corrector's edit in that paragraph was elsewhere ("driver" → "coachman"). No meaning drift; worth a one-word restoration on any later pass, alongside the same paragraph in ¶30 where the corrector already removed the unsourced Rostopchin attribution.
- No new drift was introduced by any of the twenty-one corrections. No MAJOR finding existed for this chapter. All four MODERATE findings from `ch252-fidelity.md` (¶23, ¶27, ¶28, ¶29) are addressed and verified against the source.

Verification: ACCEPT
sha256: f45a5d1f8e19f7b3727617fdcccd65169e960c2761abe41d9794a37675130f0d
