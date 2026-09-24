# R1 re-verification: Part A (ch1 Preface, ch2 Attunement, ch8 Epilogue)

Reviewer: an independent re-verifier (Danish → English) who had not seen this text before. I compared the current `drafts/A-ch1.json`, `A-ch2.json` and `A-ch8.json` against `source/original-da-final.json` (chapters 1, 2 and 8) and against `drafts/history/A-ch*.r0.json`, using a word-level diff of every paragraph. The standard was `STYLE-AND-TERMINOLOGY.md`. I consulted no English translation.

## Summary

- **Findings 1–44 (1 MAJOR, 43 MINOR):** 44 are RESOLVED. None is NOT RESOLVED. None was declined.
- **New defects from the revision:** 0 BLOCKER, 0 MAJOR and 4 MINOR (N1–N4). There are also 3 optional polish points (O1–O3). N1 and N2 are real English defects and should be fixed. N3 and N4 are small fidelity or consistency slips.
- **Changes the applied log does not mention:** four small edits (ch2 ¶0 ×2, ¶8 and ¶13). I checked each one against the Danish and all four are acceptable.
- **Conflicts with the book rulings:** none.
- **Mechanical checks:**
  - Paragraph counts are 4 / 15 / 4.
  - No `sectionHeading` or `dividerBefore` field has changed.
  - Both note anchors occur exactly once. n8.5a (updated to "…go through the same river twice.") sits at the position of the Danish marker.
  - The Latin and Greek are unchanged and verbatim.
- **Verdict: APPROVABLE after N1 and N2**, which are one-line edits. N3 and N4 are recommended. No further review round is needed once N1 and N2 are applied as written below.

| # | Where | Severity | Type | Fix |
|---|---|---|---|---|
| N1 | ch2 ¶4 | MINOR | English: an ambiguous pronoun introduced by fix 19 | "Then Abraham turned away from him for a moment; but when Isaac looked at Abraham’s face a second time, it had changed." |
| N2 | ch8 ¶1 | MINOR | English: "is no business of its" is unidiomatic | "…had the same one is none of its business — unless…" |
| N3 | ch1 ¶1 | MINOR | Addition: "actually" has no source in ¶1 | "To ask where they get to would perhaps be foolhardy." |
| N4 | ch2 ¶0 | MINOR | Consistency: "climbed" is now *besteg*, but here it renders *gik … op til* | "…left the donkeys behind and went up the mountain alone with Isaac" |

---

## 1. Status of every R1 finding

| # | ¶ | Status | Check against the Danish |
|---|---|---|---|
| 1 | 1.0 | RESOLVED | "untimely and inopportune" is a correct doublet. |
| 2 | 1.0, 1.1 | RESOLVED | "where they actually get to". In ¶0 this correctly carries *dog egentlig*. See N3 for ¶1. |
| 3 | 1.0 | RESOLVED | "every smallholder and lodger in philosophy" |
| 4 | 1.0 | RESOLVED | "without the deepest emotion" |
| 5 | 1.0 | RESOLVED | "and even if perhaps the light of reason" renders *forte*. |
| 6 | 1.0 | RESOLVED | "Principia philosophiæ" |
| 7 | 1.0 | RESOLVED | "attained it:" drops "at last". "It" resumes the task and skill of the previous sentence, which is acceptable. |
| 8 | 1.0 | RESOLVED | "denied the certainty of the senses and the certainty of thought" |
| 9 | 1.0 | RESOLVED | "that is what everyone in our time begins with" renders *dermed begynder*. |
| 10 | 1.1 | RESOLVED | "did indeed master, but which no human being ever entirely outgrows". The added "ever" is a harmless intensifier of *ganske*. |
| 11 | 1.2 | RESOLVED | "He has not understood the System — whether there is one, whether it is finished." |
| 12 | 1.2 | RESOLVED | "makes a slip of the pen on the System nor signs himself away to the System" |
| 13 | 1.2 | RESOLVED | "so that it can be…". The subject is now the writing. See O1. |
| 14 | 1.2 | RESOLVED | "promises of the System", "to the System" and "the slightest thing to do with the System" are all restored. |
| 15 | 1.2 | RESOLVED | "…omnibus, for a tower it is hardly likely to become." |
| 16 | 1.3 | RESOLVED | "Most respectfully, Johannes de silentio." |
| 17 | 2.0 | RESOLVED | "on which Abraham rode with sorrow before him and Isaac at his side" |
| 18 | 2.4 | RESOLVED | "said not a single word" |
| 19 | 2.4 | RESOLVED | "his face" is gone, *men* is "but" and "whole" is gone. The fix introduced N1. |
| 20 | 2.4 | RESOLVED | "No, it is my own desire." "Own" is a slight intensifier that is acceptable in the feigned monster's voice. ¶8 keeps "her delight", and the reviewer allowed that option. |
| 21 | 2.4 | RESOLVED | "have mercy on me" ×2 |
| 22 | 2.6 | RESOLVED | The appositives now name Isaac. See O3. |
| 23 | 2.6 | RESOLVED | "the ram that God had chosen" renders *udseet*. |
| 24 | 2.7 | RESOLVED | "hides her bosom with a maiden’s modesty" |
| 25 | 2.8 | RESOLVED | "Hagar and the son, whom he had driven out" now lets *som* cover both. |
| 26 | 2.8, 2.4 | RESOLVED | "He climbed Mount Moriah" and "Abraham climbed Mount Moriah". This creates N4 in ¶0. |
| 27 | 2.9 | RESOLVED | "the father had forgotten his duty to the son" |
| 28 | 2.9 | RESOLVED | "could not understand that it could be forgiven" |
| 29 | 2.10 | RESOLVED | The two *at* clauses are parallel, and *dog* is rendered as "afterwards still". |
| 30 | 2.11 | RESOLVED | "But Abraham prepared…, calm and gentle; but as he turned away…" keeps the double *men*. |
| 31 | 2.11 | RESOLVED | "a trembling pass through his body". See O2. |
| 32 | 2.12 (MAJOR) | RESOLVED | "but Isaac had lost his faith." This matches ¶4's "loses his faith in you", so the I/IV echo is restored. |
| 33 | 2.13 | RESOLVED | The blessing ends with a period. |
| 34 | 2.13 | RESOLVED | "the stronger food" ×2. "Ready" for *ved Haanden* is acceptable. |
| 35 | 2.14 | RESOLVED | "after a journey to Mount Moriah" |
| 36–37 | 8.0 | RESOLVED | "does not make people anxious, so that they want to rush headlong at the highest" |
| 38 | 8.0 | RESOLVED | "inspiring … inspires" repeats the verb. "Young and beautiful and lovely to look at" keeps the polysyndeton. |
| 39 | 8.1 | RESOLVED | "The fact that" now states a fact. The cleft "it is the generation, after all, that has the task" is acceptable: *jo* plus the contrast with "the spirit who governs the world" supports the emphasis. See N2. |
| 40 | 8.1 | RESOLVED | "As soon as" |
| 41 | 8.2 | RESOLVED | "outraged" (*oprøres*) is now stronger than "indignant" (*harmes*). |
| 42 | 8.2 | RESOLVED | "I am by no means stopping, since my life is in it." |
| 43 | 8.3 | RESOLVED | "one cannot go through the same river twice." The anchor is updated and valid. The note's Greek gloss rightly keeps "step into". |
| 44 | 8.3 | RESOLVED | "a disciple of Heraclitus — one who went further, not back to what Heraclitus had abandoned." |

---

## 2. New defects in changed paragraphs and notes

I read each changed paragraph against the Danish sentence by sentence: ch1 ¶0–3; ch2 ¶0, 4, 6–14; ch8 ¶0–3; and n8.5a. I found no omission of any sentence, clause, hedge, question or exclamation, and no voice drift.

### N1 — MINOR — ENGLISH, ambiguous pronoun (ch2 ¶4; introduced by fix 19)

- **Current text:** "Abraham climbed Mount Moriah, but Isaac did not understand him. Then he turned away from him for a moment; but when Isaac looked at Abraham’s face a second time, it had changed."
- **Why it is ambiguous:** the nearest subject is Isaac ("but Isaac did not understand him"). So "Then he turned away from him" first reads as Isaac turning away from Abraham. The reader has to backtrack at the climax of variation I.
- **Why the Danish is not a precedent:** the Danish *Da vendte han sig bort … fra ham* shares the same bare pronouns. But this is only a grammatical ambiguity, and §A.2 requires it to be resolved. The r0 draft resolved it by naming Abraham, and the fix dropped the name along with "his face".
- **Fix:** "Then Abraham turned away from him for a moment; but when Isaac looked at Abraham’s face a second time, it had changed." The Danish repeats names freely in this paragraph, so the repetition is in keeping.

### N2 — MINOR — ENGLISH (ch8 ¶1; introduced by the re-wording of fix 39)

- **Current text:** "…and the fact that the previous generation had the same one is no business of its — unless…"
- **Problem:** "no business of its" uses a stranded independent possessive "its". That is unidiomatic, and it reads like an error.
- **Fix:** "…and the fact that the previous generation had the same one is none of its business — unless…" A closer alternative is "…has nothing to do with it". The idiom "none of its business" is not a shared-run risk in this position.

### N3 — MINOR — ADDITION (ch1 ¶1; introduced by fix 2)

- **Danish:** *Et Spørgsmaal om, hvor de komme hen, vilde maaskee være en Dumdristighed*. Unlike ¶0 (*hvor de dog egentlig komme hen*), ¶1 has no *dog egentlig*.
- **Problem:** "To ask where they actually get to" imports ¶0's intensifier. It is small, but it erases a variation that the source makes, which is the same principle finding 9 enforced.
- **Fix:** "To ask where they get to would perhaps be foolhardy."
- **Optional:** to tighten the *komme hen … naaede hen* answer inside ¶1, "Where those venerable figures got to, that is where, in our time, everyone begins…".

### N4 — MINOR — CONSISTENCY (ch2 ¶0; exposed by fix 26)

- **The pairing fix 26 set up:** the book now uses "climbed" for *besteg* (¶4 "Abraham climbed Mount Moriah"; ¶8 "He climbed Mount Moriah").
- **The conflict:** in ¶0, "the hour when he left the donkeys behind and climbed the mountain alone with Isaac" renders *gik ene med Isaak op til Bjerget*. In ¶4, the same Danish phrase (*gik ene med Isaak … op til Bjerget*) is "went up the mountain alone". So the man's wish in ¶0 now shares a verb with *besteg* and not with its own twin in ¶4.
- **Fix:** "the hour when he left the donkeys behind and went up the mountain alone with Isaac".

### Optional polish (not defects; no action required for approval)

- **O1 (ch1 ¶2):** "take care to write in such a way that it can be comfortably leafed through". The dummy "it" matches the Danish *det* and is readable. If you want no doubt at all: "so that what he writes can be comfortably leafed through".
- **O2 (ch2 ¶11):** "Isaac saw Abraham’s left hand clench in despair and a trembling pass through his body". The Danish *hans* (not *sin*) marks the body as Abraham's without ambiguity. English "his" after "Isaac saw" could in principle mean Isaac's. The natural reading is Abraham's, and this wording predates R1. Optional: "…and a trembling pass through Abraham’s body — but Abraham drew the knife." That adds a third "Abraham", so leaving it as is also defensible.
- **O3 (ch2 ¶6):** "and she kissed Isaac, her pride, her hope through all generations, who had taken away her shame." The personal "who" could, very weakly, attach to "generations". This is acceptable. If it is changed: "and she kissed Isaac, who had taken away her shame and was her pride, her hope through all generations." That is the reviewer's second option, and it also restores the Danish order.

### Changes the applied log does not mention (all acceptable)

| ¶ | r0 | Now | Assessment |
|---|---|---|---|
| ch2 ¶0 | "to go with them on the three-day journey" | "to go along on…" | This is closer to *følge med*. OK. |
| ch2 ¶0 | "Isaac by his side" | "Isaac at his side" | *ved sin Side*. OK. |
| ch2 ¶8 | "into the wilderness" | "into the desert" | Both are valid for *Ørkenen*, and "desert" is used nowhere else in the book for Hagar. OK. Record it in the log. |
| ch2 ¶13 | "does not perish" | "shall not perish" | This is closer to *ikke skal omkomme*. OK. |

---

## 3. Conflicts with the book rulings

None. I checked every occurrence in the Danish of chapters 1, 2 and 8:

- **Virkelighed / Realitet:** none occurs in Part A.
- ***tør*** (ch8 ¶2): "I dare appeal only to myself". This follows the ruling.
- ***gribe*** (ch8 ¶2 *grebe*): "grasped". This follows the ruling. The ch2 ¶4 *greb Isaak i Brystet* ("gripped") is physical seizing, which is correct.
- ***fatte***: none occurs. *begribe* is "comprehended" (ch1 ¶2, which keeps the *Begreb/begribe* play) and "incomprehensible" (ch2 ¶9). Neither collides with the *gribe* = grasp ruling.
- ***forstaae***: "understand" throughout (ch1 ¶2; ch2 ¶0, 2, 4, 9, 14; ch8 ¶0).
- ***en Enkelt / den Enkelte***: the only form is *de Enkelte i Slægten* (ch8 ¶1), rendered "the individuals within it". This is an ordinary plural, correctly not the fixed term. *den enkelte Slægt* is "the particular generation", which is correct.
- **Angst / ængste:** "anxiety" (ch1 ¶0, ¶1; ch2 ¶4), "anxiously" (ch1 ¶0) and "make … anxious" (ch8 ¶0). No fear-vocabulary is used.
- ***gaae videre*** is "go further" throughout. *komme videre* is "get further". *blive staaende ved* is "stop at".
- **Bevægelse:** "movement" (ch1 ¶0; ch8 ¶3).
- **Systemet:** capitalized throughout.
- **Tro:** "faith". The I/IV echo "loses his faith in you" / "had lost his faith" is intact.

---

## 4. Verdict

**Approvable after N1 and N2.** These are two one-line English fixes, and the exact wording is given above. N3 and N4 are recommended in the same pass. O1–O3 are at the editor's discretion. The one MAJOR (the I/IV faith echo) is properly resolved. Every R1 finding is resolved, and nothing in the revision introduces a fidelity error of MAJOR weight or above. After N1 and N2 are applied as written, no further re-verification round is required. A mechanical check that the four strings changed and that the n8.5a/n8.5b anchors still resolve is enough.
