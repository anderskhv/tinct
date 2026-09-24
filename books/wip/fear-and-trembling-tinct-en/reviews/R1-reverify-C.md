# R1 re-verification, Part C (ch4 Preliminary Expectoration, ¶0–11, note n4.2a)

- **Re-verifier:** an independent Danish-to-English re-verifier, new to this text. I did not draft or review it in round 1.
- **Inputs:** `reviews/R1-fidelity-C.md`, `reviews/R1-applied-C.md`, `reviews/R1-diff-C.md`, `drafts/C-ch4.json` (current), `drafts/history/C-ch4.r0.json` (before), `source/original-da-final.json` ch4, `STYLE-AND-TERMINOLOGY.md`.
- **Method:**
  - I diffed r0 against the current draft myself, word by word. The changed slots are ¶0, 2, 4, 7, 9, 10 and 11, and only their `text` changed. `R1-diff-C.md` matches both files exactly for every one of these slots. Note n4.2a did not change.
  - I read every changed paragraph against the Danish sentence by sentence, including the sentences that did not change.
  - I swept all of ¶0–11 for the book rulings.
  - I consulted no English translation.

## Summary

| Area | Result |
|---|---|
| R1 findings (15) | 13 RESOLVED, 2 DECLINED-JUSTIFIED (4.2, 6.1), 0 NOT RESOLVED |
| New defects in changed text | 0 BLOCKER, 0 MAJOR, 1 MINOR (optional), 1 NIT |
| Structure / anchor | 12 slots. `sectionHeading` and `dividerBefore` are null. n4.2a `anchorAfterEn` is still the exact final words of ¶2. No note text in the main text. |
| Ruling conflicts (consistency) | 2: ¶6 *tør* rendered "may"; ¶7 *opfattes* rendered "grasped". Plus 1 observation (*vove* / *turde* both "dare"). |
| **Verdict** | **APPROVABLE.** I recommend applying the two one-word consistency edits (C1, C2) before merge. Neither blocks approval. |

## 1. Status of R1 findings

| # | Status | Verification against the Danish |
|---|---|---|
| 0.1 | RESOLVED | "Here it holds true that only the one who works gets bread; …" renders impersonal *her gjælder det, at* exactly. |
| 2.1 | RESOLVED | "Yet here again the question is whether one is willing to work and to be burdened." *dog* = yet, *atter* = again, *gjælder det … om* = the question is whether. The intensifier is gone. |
| 2.2 | RESOLVED | "even though he sacrificed the best." The bare token *det Bedste* now matches the preachers' formula and "Isaac and the best". |
| 4.1 | RESOLVED | "If faith cannot make it a holy act to be willing to murder one's son, then let the verdict on Abraham be the same as on anyone else." *at ville myrde* now parallels "was willing to murder / was willing to sacrifice". *lad den samme Dom gaae over Abraham som over enhver Anden* is rendered faithfully. |
| 4.2 | DECLINED-JUSTIFIED | Per the coordinator's policy: *Nul og Nichts* is a Danish idiom and is rendered ("nil and nothing"). *Schäfer-Historier* is a German insertion kept with a gloss (§A6). Both follow the rulings. |
| 6.1 | DECLINED-JUSTIFIED | "a passing movement of feeling". *Bevægelse* here is emotional (after *Stemning* and *Rørelse*). "of feeling" prevents a misreading as the technical movement, and "movement" is kept per §C. |
| 7.1 | RESOLVED | "I have known a person who once could have saved my life, if he had been magnanimous." *har kjendt* and the scope of *engang* are right. |
| 7.2 | RESOLVED | "I fear that later I will lack the strength". *frygte* = fear. |
| 9.1 | RESOLVED | "offering her own beauty for sale to philosophy". Reflexive *sin* makes it theology's own beauty, and the repetition matches *dens Gunst … til Philosophien*. |
| 10.1 | RESOLVED | "incommensurable — not measurable by any common standard — with the whole of actuality." The gloss is at the term, and *Virkelighed* = actuality per the ruling. |
| 11.1 | RESOLVED | "Nor, then, could I do more than make the infinite movement …" / "Nor would I have loved Isaac …" keeps the *da heller ikke … da heller ikke* series. The Danish also opens with "not either" after an affirmative sentence, so the English "Nor" is faithful. |
| 11.2 | RESOLVED (adjusted wording accepted) | "perhaps I would, if anything, have come too early". "If anything" carries the contrastive *snarere* (as opposed to late) and avoids the preference reading of "would rather". |
| 11.3 | RESOLVED | "I would not have dawdled along the highway either". This is idiomatic for *ligget og drevet paa Landeveien*. |
| 11.4 | RESOLVED | "in the capacity of a tragic hero". The term stays unglossed. |
| 11.5 | RESOLVED | "summoned to such an extraordinary journey in the king's service as the one to Mount Moriah". This matches *tilsagt til … Kongereise* (being summoned to provide transport or service for the king's journey) without adding a gloss. It is consistent with the following "The moment I got up on the horse". |

## 2. New defects in changed paragraphs

Every sentence of ¶0, 2, 4, 7, 9, 10 and 11 was re-read against the Danish. I found no omission, no added interpretation, no voice change and no ungrammatical English. n4.2a is unchanged and its anchor is still valid.

- **N1, ¶4, MINOR (optional; a screen re-render). "such thoughtless glorification" for *slig tankeløs Lovprisen*.**
  - *Lovprisen* is praising or extolling. It belongs to the *Lovtale* family: "undeserved eulogies" in the same paragraph, and the title "Eulogy on Abraham" in ch3.
  - "Glorification" is slightly stronger. Next to "murder", it also brings in the modern sense of "glorifying" a crime, which the Danish lacks.
  - It is not a meaning error, which is why it is only MINOR.
  - Fix, if wanted: "such thoughtless extolling" or "such unthinking praise". Either stays clear of the overlap screen differently from r0's "thoughtless praise".
- **N2, ¶0 / ¶2, NIT. The *gjælder det* echo is weakened.**
  - *atter* in ¶2 points back to ¶0's *her gjælder det*. ¶0 now says "Here it holds true that …", but ¶2 says "here again the question is whether …", so the verbal echo is gone. "again" still carries the link.
  - No change is needed. If wanted: "Yet here again it holds true: the question is whether one is willing …"
- **The screen re-renders were also checked and are accurate:**
  - "He put it plainly" for *sagde ligefrem*;
  - "let the verdict on Abraham be the same as on anyone else" for *lad den samme Dom gaae over … som over enhver Anden*.

Pre-existing wording in the changed paragraphs that I checked and accept (not new, and no action needed):
- ¶10 "and compared with that it is unhappy" leaves the *dog* of *og er dog … ulykkelig* implicit.
- ¶11 "to be glad in Isaac again" is slightly unidiomatic ("to rejoice in Isaac again" would be smoother).

## 3. Consistency items (conflicts with book rulings, ¶0–11)

| # | ¶ | Danish | Current English | Ruling | Fix |
|---|---|---|---|---|---|
| C1 | 6 | *saa tænker jeg vel, man **tør** tale uden Fare derom i vor Tid* | "then I think one **may** speak of it without danger in our time" | *tør* = **dare** by default; "may not" / "must not" only for plain prohibitions (ruling of 2026-09-24). This is not a prohibition. The same paragraph already has *Tør jeg det ikke* = "If I do not dare". | "then I think one **dares** to speak of it without danger in our time" (or "one can dare to speak of it …") |
| C2 | 7 | *naar det **opfattes** i sin Storhed* | "when it is **grasped** in its greatness" | "grasp" / "seize" is reserved for *gribe* (the grasp of faith and resignation). *opfatte* belongs with *fatte* and must be kept apart from it. | "when it is **understood** in its greatness" (or "apprehended") |
| C3 | 7 | *turde* (¶7, ¶6) and *vove* (*vovede at gaae frem*, *jeg vover det ikke*) | "dare" for both | This is not a ruling violation, because the standard only fixes *tør* → dare. Recording it so the lead knows that "dare" is shared by two lexemes. | Optional: "ventured to set out on the road" for *vovede*. Keep "I do not dare" in the quoted speech, where it is idiomatic. |

The rest of the sweep is compliant:
- *Virkelighed* = actuality (¶3 "so-called actuality"; ¶10). *virkelig* = "really" (¶2, 7, 11). *Realitet* does not occur.
- *en Enkelt* = "someone" (¶6). *det Enkelte* = "particular things" (¶10). *enkelte Steder* = "certain places" (¶9). "The single individual" is never used.
- *fatte* does not occur. *greben* (¶2) = "moved": the idiomatic emotional sense, not the grasp of faith, so it is acceptable.
- "the absurd" (¶10) is bare, which now agrees with §A5 of the standard. The R1 standard-vs-brief conflict is settled in the standard.
- *Angst* / *Angest* = anxiety. *frygte* = fear. *Anfægtelse* = spiritual trial, glossed once, at ¶7.

Carried over from R1 for the book-level pass (not a Part C defect): the accepted pilot ch5 ¶0 still glosses "spiritual trial", which is now a second definition.

## 4. Verdict

**APPROVABLE.**
- All 15 R1 findings are resolved or justifiably declined.
- The revisions introduced no new fidelity defect beyond one optional MINOR word choice (N1).
- Recommended before merge: C1 (¶6 *tør* → "dares") and C2 (¶7 *opfattes* → "understood"). These are one-word edits that bring Part C fully into line with the book rulings.
- N1 is at the lead's discretion.
