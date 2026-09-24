# R1 re-verification — part I (ch7 Problema III, ¶29–41 + n7.47a)

Re-verifier: independent (Danish → English). I compared the current draft `drafts/I-ch7.json` against `source/original-da-final.json` ch7 ¶29–41 only, and against `STYLE-AND-TERMINOLOGY.md`. The only other draft I read was H-ch7 ¶28, to check the *Heros* consistency claim. I consulted no other English translation.

## Summary

- **Findings from R1:** all 21 are accounted for.
  - The MAJOR (M1) and 18 MINOR are **RESOLVED**.
  - Finding 12 (*Heros*) is **partly applied, and the part that was declined is justified**.
  - Finding 2 (the verse-bracket format) is **DECLINED-JUSTIFIED**, because the decision belongs to assembly.
  - **No finding is NOT RESOLVED.**
- **Integrity:**
  - `R1-diff-I.md` "after" text matches the current draft byte-for-byte for all 9 changed items.
  - A diff against `history/I-ch7.r0.json` shows changes only in ¶29, 30, 31 (+ note), 32, 33, 35, 38 and 39, which is exactly the diff set.
  - The anchor "Faust is a doubter" is still unique in ¶31, and ¶39 keeps `dividerBefore: "rule"`.
- **New defects introduced by the revision:** 0 BLOCKER, 0 MAJOR, **5 MINOR**, 4 NOTE (optional). The MINORs are in ¶30, ¶32, ¶33, ¶35 and ¶38.
- **Conflicts with the book rulings:** none against the four named rulings (Virkelighed/Realitet, fatte/gribe, tør, en Enkelt).
  - There is one deviation from the §C fixed table that needs a book-level sign-off: ¶32 "a tried man" for *en forsøgt Mand*, where the table says *forsøge* = "put to the proof".
- **Verdict: APPROVABLE.** No blocking defects remain. I recommend applying the 5 MINOR fixes below before the part is locked; they are one-line edits and do not need another review round.

## 1. Status of the R1 findings

| # | ¶ | Finding | Status | Check against the Danish |
|---|---|---|---|---|
| M1 | 31 | *en Enkelt* ≠ "single individual" | **RESOLVED** | "an individual who wants to save the universal…". ¶37 "become the single individual" is now the first use of the category in this sequence. |
| 1 | 29 | *Geschändet* | RESOLVED | "Defaced by treacherous Nature" |
| 2 | 29 | Verse-bracket format vs J ¶46 | DECLINED-JUSTIFIED | Left to assembly. The `\n` form complies with §B. The NOTES miscount has been corrected. |
| 3 | 30 | *kan man ikke frelse* modality | RESOLVED | "cannot be saved by being mediated into an idea of society". The passive has the same sense. |
| 4 | 30 | *phantastisk* | RESOLVED | "on a fanciful presupposition" |
| 5 | 30 | *det Geniale* / *Forkjærlighed* | RESOLVED | "the genius in him … the divine partiality". "Divine" is supplied from the parallel *guddommelige Misundelse*, which is acceptable. |
| 6 | 30 | *construere* | RESOLVED | "constructed" |
| 7 | 30 | Singular *Digteren* | RESOLVED, but with a new MINOR (N1) | The singular is restored. "First and foremost" loses *først*; see N1. |
| 8 | 31 | First person | RESOLVED | "I can use the legend of Faust for this." |
| 9 | n7.47a | *tør* | RESOLVED | "But dare he keep silent?" ×2 (book ruling) |
| 10 | n7.47a | *Fordømmelse* | RESOLVED | "laughter's condemnation" |
| 11 | n7.47a | *paa den Conto* | RESOLVED | "on the strength of that". The referent (aesthetic magnanimity) is clear. |
| 12 | n7.47a | *Heros*; "sorry way" | RESOLVED / DECLINED-JUSTIFIED | "lamentable" matches *sørgelig*. "hero" is kept for *Heros*: I verified that H-ch7 ¶28 renders "Shakespeare … en Heros" as "a hero", so the book is consistent, and the choice is recorded in NOTES-I. |
| 13 | 32 | Pronoun | RESOLVED | "by claiming to have gone through doubt himself, Faust easily sees through it". See NOTE 1. |
| 14 | 32 | *en forsøgt Mand* | RESOLVED | "whether the one speaking is a tried man or a Münchhausen". This conflicts with the §C table; see §3. |
| 15 | 33 | "realizes" | RESOLVED | "Faust makes this idea real." |
| 16 | 33 | "everything else — the doubting included" | RESOLVED, but with a new MINOR (N3) | The logic is fixed. "This" now has no clear referent. |
| 17 | 35 | Referent of "that"; *Een* | RESOLVED, but with a new MINOR (N4) | The referent is fixed. "No help to one" is awkward English. |
| 18 | 38 | *kun at* | RESOLVED, but with a new MINOR (N5) | "provided only that" is correct. The scope of *endog* has moved. |
| 19 | 39 | "desultory" gloss | RESOLVED | "(in the old sense: moving by leaps)". It is dictionary-supported: Danish *desultorisk* = *springende*. See NOTE 3. |
| 20 | 39 | *Misvisning* expansion | RESOLVED | "at the moment of their deviation, like a compass needle's". See NOTE 4. |

## 2. New defects in the changed text (sentence by sentence against the Danish)

Every changed paragraph and the note were checked clause by clause. Nothing is missing in any of them. The German in ¶29 is unchanged, and the ruling-driven changes (*actuality* ×3, *dare* ×2, *an individual*) are correctly placed.

### ¶29
No new defect.

### ¶30

**N1 — MINOR (meaning shift).** "burde Digteren nærmest først gjøre Allarm" → "the poet ought, first and foremost, to raise the alarm".
- *nærmest først* means "most properly be the *first*". The poet is the one who should raise the alarm before anyone else.
- "First and foremost" means "above all, primarily", so it drops the priority in time, the sense of being first in line. That was the sense R1 asked to keep; it proposed the same phrase but explained it as "the very first".

**Fix:** "About all such things the poet, of all people, ought to be the first to raise the alarm."

The rest of ¶30 is clean: "cannot be saved by being mediated", "fanciful presupposition", "the genius in him … the divine partiality" and "constructed" are all accurate.

### ¶31 and n7.47a
No new defect. "An individual" (¶31) and ¶30 "the individual himself" (*Individet*) share the word "individual". That is harmless, since neither is the technical *den Enkelte*.

### ¶32

**N2 — MINOR (terminology / concept).** "kun da opdager han egentligt ogsaa selv i Virkeligheden alle dens Lidelser" → "discover all its sufferings in real life".
- The sentence opposes doubt as it "can look poetic" (*tage sig poetisk ud*) to what Faust discovers *i Virkeligheden*. That is the poetic/actual contrast, so this is the concept, not the idiom "in fact". The idiom reading would also be redundant with *egentligt*.
- "In real life" also misfires for a figure from a legend: it suggests life outside the poem rather than actuality as against ideality.
- The ruling permits idiomatic handling only for the idiom.

**Fix:** "only then, too, does he himself actually discover all its sufferings in actuality."

**NOTE 1 (optional).** "claiming to have gone through doubt" weakens *indbilde ham* (make him believe, persuade him). An alternative is "by trying to persuade him that he himself has gone through doubt", although "he himself" reopens the pronoun question, so the current wording is acceptable.

### ¶33

**N3 — MINOR (ambiguity, §A.2).** "but otherwise can do everything else, just as they do this too, without being in a state of spirit or acting by virtue of spirit."
- "This" has to reach back across "everything else" to "doubt for one hour each semester". A cold reader stalls on it.
- The Danish *som da ogsaa dette* points unmistakably to the doubting.

**Fix:** "…but otherwise can do everything else — just as they do the doubting too — without being in a state of spirit or acting by virtue of spirit."

"Faust makes this idea real" and "annihilated actuality for him" are correct.

### ¶35

**N4 — MINOR (ungrammatical/awkward English, slight addition).** "For only afterward does he learn whether it does not come to that after all; and the outcome is no help to one, whether in the moment of action or as regards the responsibility."
- "No help to one" is barely idiomatic. "One" as a bare object at the end of a clause reads like a numeral or a slip.
- "After all" is a small addition; the Danish *om det ikke skeer* has no counter-expectation.

**Fix:** "For only afterward does he learn whether it does not come to that; and the outcome cannot help a person — neither in the moment of action nor as regards the responsibility."

If screen overlap forbids "cannot help a person", use "is of no help to the one who acts".

### ¶38

**N5 — MINOR (meaning shift: scope of *endog*).** "Der forekommer endog Steder i det nye Testamente, som anprise Ironi" → "Even in the New Testament there are passages that commend irony".
- In the Danish, *endog* intensifies the passages: "there are *even* passages that commend irony", which goes further than merely acknowledging silence.
- The revision moves "even" onto "the New Testament". That only repeats the previous sentence ("even by the New Testament"), loses the step up from silence to irony, and creates a jingle: "…even by the New Testament. Even in the New Testament…".

**Fix:** "Indeed, the New Testament even contains passages that commend irony, provided only that it is used to hide what is better." (Or R1's "There are even passages in the New Testament that…".)

"Higher than actuality" and "incommensurable with actuality" are correct.

### ¶39

No defect.
- **NOTE 3 (optional).** The gloss "moving by leaps" puts "leap" into the text at a point where the Danish has no *Spring*, which is a fixed term. Given the dictionary sense this is defensible, and it may even help. The alternative "(in the old sense: jumping from point to point)" avoids the echo. Record the choice either way.
- **NOTE 4 (optional).** "At the moment of their deviation, like a compass needle's, as it were indicate" is grammatical, but its elliptical possessive and stacked commas make it heavy. An optional smoother version: "could, at the moment of their deviation — as a compass needle deviates — as it were indicate the boundary of the unknown land."

## 3. Remaining conflicts with the book rulings

| Ruling | Occurrences in ¶29–41 + n7.47a | Status |
|---|---|---|
| *Virkelighed* = actuality; *Realitet* = reality | ¶33 "annihilated actuality"; ¶38 ×2 "actuality"; ¶32 *i Virkeligheden* → "in real life"; adverb *virkelig* ¶30, ¶34 → "really"; *Realitet* none | Compliant, except ¶32, where the idiom exemption is misapplied in my reading (N2). |
| *fatte* ≠ *gribe* | none in range (*forstaae* → "understand") | Compliant |
| *tør* = dare by default | ¶30 "if I dare say so"; n7.47a "dare" ×2; ¶35 "you may not" (ethics' prohibition, the case the ruling names) | Compliant |
| *en Enkelt* = an individual | ¶31 "an individual"; *den Enkelte* ¶37, ¶41 → "the single individual" | Compliant |
| §C *forsøge* = "put to the proof" | ¶32 *en forsøgt Mand* → "a tried man" | **Deviation.** Linguistically correct: the participle is a set adjective ("tried, experienced"), and "tried" keeps the root. It is recorded in NOTES-I. It needs a book-level sign-off, or a §C footnote that the participle-adjective *forsøgt* may be rendered "tried". |
| §C *Heros* (no table entry) | n7.47a "hero" | Consistent with H-ch7 ¶28. No conflict. |

## 4. Verdict

**Approvable.** Every R1 finding is resolved or justifiably declined, including the MAJOR. The revision introduced no omission, no addition of interpretation and no loss of voice. The five new MINOR items (N1 ¶30 "first and foremost", N2 ¶32 "in real life", N3 ¶33 "this", N4 ¶35 "no help to one", N5 ¶38 the scope of "even") are wording fixes that should be applied before lock. They do not need another re-verification round. The ¶32 "tried man" deviation should be ratified at the book level.
