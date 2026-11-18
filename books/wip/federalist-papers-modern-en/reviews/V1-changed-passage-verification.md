# V1 changed-passage verification (slice 1, 38 entries)

All 38 `current` texts were compared programmatically to `batches/chNN.json` paragraph p: all identical (no drift). Result: 36 VERIFIED, 2 DEFECT.

| Coordinate | Verdict | Note |
|---|---|---|
| ch01 p5 | VERIFIED | "A consciousness of good intentions" restores the positive claim. Rest faithful. |
| ch03 p7 | VERIFIED | "Town or country influence" restores the printed (probable misprint) reading. Matches source. Observation only: opening "First," stands in for source "Because" (p7 and p8 both begin "Because"); acceptable, not a defect. |
| ch03 p17 | DEFECT | Round-1 issue (Doge as chief magistrate) was optional, but the fix "chief official" departs from the fixed term in STYLE-NOTE ("chief magistrate" -> "chief executive") and from ch18 p13, which renders the praetor as "chief executive". The first-round candidate wording was within the table. Revert to "chief executive". |
| ch04 p1 | VERIFIED | JUST capitals restored; PRETENDED/INVITE kept. Faithful. |
| ch04 p2 | VERIFIED | "often" restored; "advance or support" covers "aggrandize" without narrowing to wealth. Faithful. |
| ch04 p12 | VERIFIED | "may draw attention" restores the modal. Faithful. |
| ch04 p13 | VERIFIED | "deceptively attractive" carries "specious". Grammatical and faithful. |
| ch05 p2 | VERIFIED | "In general" restored. Faithful. |
| ch05 p8 | VERIFIED | "and connection with" restored. Faithful. |
| ch05 p9 | VERIFIED | Rhetorical question restored with both clauses (conquests; changes introduced). Faithful. |
| ch05 p10 | VERIFIED | "fair-minded people" restores a people referent (candid men). Faithful. |
| ch06 p5 | VERIFIED | "too often not to be generally known" restores the claim; grammatical. Footnote markers (6)(7)(8) intact. |
| ch07 p1 | VERIFIED | "until it was given up" keeps the passive, no agent. Rest unchanged and faithful. |
| ch07 p9 | VERIFIED | "The view they have given" fixes the referent; "harmful" and "destructive" no longer repeat. Faithful. |
| ch08 p14 | VERIFIED | "framed in America so far" modernizes "heretofore"; plain and faithful. |
| ch09 p0 | VERIFIED | "with a mixture of regret, because we reflect" is clean and faithful. |
| ch09 p1 | DEFECT | Reported issue (agent "these writers") is fixed, and the passive keeps the source open. But the sentence "The effectiveness of various principles is now well understood that were either not known ..." is ungrammatical (relative clause detached from "principles"); it was present before the fix and remains. Source: "The efficacy of various principles is now well understood, which were either not known at all, or imperfectly known to the ancients." Minimal repair adds a comma and "principles". |
| ch10 p2 | VERIFIED | "curing the harms of faction" restores the object of the cure; per STYLE-NOTE (mischiefs -> harms). Faithful. |
| ch10 p5 | VERIFIED | "at liberty to use it" restores the liberty idiom. Faithful. |
| ch10 p11 | VERIFIED | "one of only two means" restores the exactly-two sense. Faithful. |
| ch10 p19 | VERIFIED | "less to be feared in a republic than in a democracy" restores comparison; term use correct. |
| ch11 p2 | VERIFIED | Split fixed: "Nor will it seem fanciful to those who can appreciate the immense difference" gives the appreciating readers as referent. Faithful. |
| ch12 p11 | VERIFIED | "it may be subject to enough guesswork to cause the oppression of individuals" is grammatical, "it" = personal estate; sense preserved. Slightly dense but one-read clear. |
| ch14 p0 | VERIFIED | "already" removed; matches source. Faithful. |
| ch15 p1 | VERIFIED | "may perhaps ask" restores "perhaps". Faithful. |
| ch17 p10 | VERIFIED | "dreaded and detested by both ... union between the two" restores both/the two as sovereign and common people; "both" immediately precedes, so the referent is clear. |
| ch18 p12 | VERIFIED | "the Union" capitalized as printed. Faithful. |
| ch18 p13 | VERIFIED | Appointment of the praetor back inside the "sole and exclusive right" enumeration. Faithful. |
| ch18 p19 | VERIFIED | "joined by the AEtolians and Athenians, they raised the standard" restores who joined whom. Faithful. |
| ch19 p4 | VERIFIED | "subject to judgment by the emperor and diet" is plain and faithful. |
| ch19 p6 | VERIFIED | "a body without strength" for "nerveless body"; clear modern sense. |
| ch21 p5 | VERIFIED | "incompatible with an adequate supply for the national emergencies" restores "repugnancy" and "national". Faithful; acceptable phrasing. |
| ch22 p6 | VERIFIED | lowercase "the union's survival" as printed (generic union). Faithful. |
| ch22 p14 | VERIFIED | "we have much to fear" no comparative; "for nothing is more natural" connective restored. Faithful. |
| ch22 p18 | VERIFIED | "exposed to frequent and intricate questions" grammatical and faithful. |
| ch24 p1 | VERIFIED | "The correctness of this remark" renders "proprietary" (propriety). Faithful. |
| ch24 p9 | VERIFIED | "savage tribes" kept as printed per Period-language rule. |
| ch25 p8 | VERIFIED | All three drifts fixed: "does violence to the natural and well-known course" (policy contrary to nature/experience), "local disorders", "sometimes". Faithful. |

## Corrected paragraphs

### ch03 p17

```
In 1685 the state of Genoa, having offended Louis XIV, tried to appease him. He demanded that they send their Doge, or chief executive, accompanied by four of their senators, to FRANCE, to ask his pardon and receive his terms. For the sake of peace they had to submit. Would he ever have demanded or accepted the same humiliation from Spain, or Britain, or any other POWERFUL nation?
```

### ch09 p1

```
But it cannot be denied that the portraits sketched of republican government were too accurate copies of the originals from which they were taken. If it had proved impracticable to devise models of a more perfect structure, the enlightened friends of liberty would have been obliged to abandon the cause of that kind of government as indefensible. The science of politics, however, like most other sciences, has been greatly improved. The effectiveness of various principles is now well understood, principles that were either not known at all, or only imperfectly known, to the ancients. The regular distribution of power into distinct departments; the introduction of legislative balances and checks; the institution of courts composed of judges who hold their offices during good behavior; the representation of the people in the legislature by deputies of their own election: these are wholly new discoveries, or have made their principal progress toward perfection in modern times. They are means, and powerful means, by which the excellences of republican government may be retained and its imperfections lessened or avoided. To this list of circumstances that tend to improve popular systems of civil government I shall venture to add one more, however novel it may appear to some. It rests on a principle that has been made the foundation of an objection to the new Constitution. I mean the ENLARGEMENT of the ORBIT within which such systems are to revolve, whether by enlarging the dimensions of a single State or by consolidating several smaller States into one great Confederacy. The latter is what immediately concerns the subject at hand. It will, however, be useful to examine the principle as it applies to a single State, which I shall do in another place.
```

## JSON

```json
[
 {
  "chapter": 3,
  "p": 17,
  "replacement": "In 1685 the state of Genoa, having offended Louis XIV, tried to appease him. He demanded that they send their Doge, or chief executive, accompanied by four of their senators, to FRANCE, to ask his pardon and receive his terms. For the sake of peace they had to submit. Would he ever have demanded or accepted the same humiliation from Spain, or Britain, or any other POWERFUL nation?"
 },
 {
  "chapter": 9,
  "p": 1,
  "replacement": "But it cannot be denied that the portraits sketched of republican government were too accurate copies of the originals from which they were taken. If it had proved impracticable to devise models of a more perfect structure, the enlightened friends of liberty would have been obliged to abandon the cause of that kind of government as indefensible. The science of politics, however, like most other sciences, has been greatly improved. The effectiveness of various principles is now well understood, principles that were either not known at all, or only imperfectly known, to the ancients. The regular distribution of power into distinct departments; the introduction of legislative balances and checks; the institution of courts composed of judges who hold their offices during good behavior; the representation of the people in the legislature by deputies of their own election: these are wholly new discoveries, or have made their principal progress toward perfection in modern times. They are means, and powerful means, by which the excellences of republican government may be retained and its imperfections lessened or avoided. To this list of circumstances that tend to improve popular systems of civil government I shall venture to add one more, however novel it may appear to some. It rests on a principle that has been made the foundation of an objection to the new Constitution. I mean the ENLARGEMENT of the ORBIT within which such systems are to revolve, whether by enlarging the dimensions of a single State or by consolidating several smaller States into one great Confederacy. The latter is what immediately concerns the subject at hand. It will, however, be useful to examine the principle as it applies to a single State, which I shall do in another place."
 }
]
```
