# Fidelity Review 2 (round 2 re-verification) — *The Manual* (Epictetus, *Enchiridion*)

**Reviewer:** independent fidelity reviewer, round 2 of the accept/fix/reverify cycle.
**Date:** 2026-09-21
**Fidelity anchor (sole anchor):** `books/wip/green-manual/source.json` — George Long's
English translation, 52 sections, field `chapters`.
**Candidate:** `books/wip/green-manual/candidate.json` — 52 sections.
**Round-1 inputs read in full before verification:**
`fidelity-review-1-sections1-18.md`, `fidelity-review-1-sections19-35.md`,
`fidelity-review-1-sections36-52.md`.

Every judgement below was re-derived from source vs. candidate. Where a round-1
reviewer proposed wording, I checked the *source*, not the proposal — so a fix
counts as landed only if the current candidate text is independently correct,
not merely because it matches the suggested sentence.

---

## 1. Coverage

### 1.1 Structural verification (whole file)

- Source 52 sections / candidate 52 sections. Section numbers and titles identical 1:1.
- Paragraph counts identical per section for all 52 sections
  (§1 = 2, §33 = 13, §52 = 4, all others = 1). No merges, splits, reorderings,
  or dropped paragraphs anywhere. Alignment is intact across the whole book.

### 1.2 Change-set verification

I did not take the change list on trust. I diffed the current candidate against
the pre-round-2 candidate in git (`98914c97` → `3f7f718d`) at paragraph level.
Exactly these 20 sections differ:

**1, 3, 6, 9, 11, 12, 14, 15, 16, 18, 19, 20, 24, 29, 31, 34, 42, 45, 46, 50**

— identical to the declared change set. **No paragraph outside those 20 sections
was modified in round 2.** All 21 changed paragraphs (§1 has two paragraphs,
only both of which changed; every other changed section is single-paragraph)
were read in full, source against candidate.

### 1.3 Spot-checks of untouched sections

In addition to the byte-level diff, I compared key phrases in untouched sections
against what round 1 quoted for them, to confirm the round-1 findings still
describe the file:

| Section | Checked | Result |
|---|---|---|
| §17 | "you are an actor in a play"; "If he wants it short, it is short" | matches round-1 quote; archaism still correctly modernized |
| §22 | "If you commit yourself to philosophy"; "that superior look" | unchanged — round-1 N3/N4 still open |
| §23 | "you have lost your purpose" | unchanged — N5 still open |
| §25 | "a powerful person's door"; obolus | unchanged — N7 still open |
| §26 | "When your neighbour's slave breaks a cup" (no "or anything else"); second person throughout | unchanged — N8/N9 still open |
| §32 | "the god at Delphi" | unchanged — N14 still open |
| §33.7 | "He did not know my other faults, **or** he would not have mentioned only these." | unchanged, inference direction still correct |
| §36 | "In logic…"; "both-and statement" | unchanged — N1 still open; "both-and" is the form §42 was aligned to |
| §49 | "I feel ashamed if I cannot show…" | unchanged — N14 (comparative "rather") still open |
| §52.2 | "Whoever nobly yields to necessity" (no leading "But") | unchanged — N19 still open |
| §52.3 | "Anytus and Melitus" | still preserved, not normalised to "Meletus" — correct |

All consistent with round 1. Nothing outside the 20 sections drifted.

---

## 2. Verification of the round-1 defects (all 13 blocking + 8 required)

Each re-derived from source, not accepted on the strength of matching the
suggested wording.

### Sections 1–18 (review 1)

| ID | Section | Required outcome | Verdict |
|---|---|---|---|
| B1 | §1.2 | Delete invented definition "An impression is how something first appears to you." | **FIXED.** Sentence gone; paragraph now opens at "Practise saying at once to every disturbing impression…", which is Long's "Straightway then practise saying to every harsh appearance". |
| B2 | §9 | Restore impediment→leg | **FIXED.** "Lameness is an obstacle to the leg, but not to the will." Actor/object now match source; parallel with "Illness is an obstacle to the body" and with the closing generalization is restored. |
| B3 | §15 | Restore the ontological claim | **FIXED.** "…were deservedly divine, and were called so." Both source claims (they *were* divine; they were *called* so) are now present. |
| B4 | §16 | Permission, not exhortation | **FIXED.** "In words, then, do not refuse to sympathise with them, and even to mourn with them if that is how it goes." Double-negative permission restored; the added appropriateness judgement ("if the moment calls for it") is gone; the following "But do not grieve inside as well" now reads as a limit on a concession, as in source. |
| B5 | §6 | Undo the silent correction | **FIXED.** "…taking pride in having a good horse." Now states Long's proposition, not the standard Greek construal. |
| B6 | §15 | "a spouse" → "a wife" | **FIXED.** "with a wife"; now consistent with §3, §7, §11, §14, §16, §18. |
| B7 | §12 | One sentence, no added "must not", no free-standing fortune claim | **FIXED.** "But he is not so well placed — and you are entirely so — that your freedom from disturbance should lie in his power." Descriptive, single sentence, dependence clause reattached. |
| R1 | §1.1 | Restore the three-link chain and the causal "for" | **FIXED in substance** (see D2 below for a mechanical defect introduced here). "…no one will harm you, you will have no enemy, because you will not suffer any harm." Agent correctly narrowed back from "nothing" to "no one". |
| R2 | §1.2 | Prohibition, not impossibility | **FIXED.** "you must not try to grasp them with a small effort." |
| R3 | §1.1 | "dependent" → "slavish" | **FIXED**, both occurrences: "weak, slavish, subject to obstruction" and "if you mistake what is by nature slavish for what is free". The slave/free spine now reaches its §14 payoff ("that person must be a slave"). |
| R4 | §11 | Restore the giver's permission | **FIXED.** "For as long as he allows you…". Also improved: "whose hands the giver used to reclaim it" now carries Long's "by whose hands". |
| R5 | §15 | Restore "some time" | **FIXED.** "and in time you will prove a worthy guest…". |
| R6 | §18 | Drop the double hedge | **FIXED.** "For me, every omen is a good sign if I choose." |
| R7 | §16 | Factual causal, not counterfactual | **FIXED.** "…since it does not distress someone else…". Fact + reason, as in source. |
| R8 | §3 | Restore "nature" and "the smallest" | **FIXED.** "remind yourself what its nature is. Start with the smallest things." |

### Sections 19–35 (review 2)

| ID | Section | Required outcome | Verdict |
|---|---|---|---|
| B1 | §20 | "in the moment" → "by the impression" | **FIXED.** Object of the verb restored; the doctrine (it is the impression that carries you away) is back. |
| B2 | §20 | Restore the content of the opinion | **FIXED.** "…but your own opinion that what they did is insulting." The specific judgment is now named, and the next sentence ("your own judgment that has angered you") has something to refer to. |
| B3 | §29 | "unpleasant" → shameful/base | **FIXED.** "later feel ashamed when shameful things show themselves." Moral register restored; the consequence clause now follows from its antecedent. |

### Sections 36–52 (review 3)

| ID | Section | Required outcome | Verdict |
|---|---|---|---|
| B1 | §46 | Visitors ask to be recommended *to* philosophers | **FIXED.** "People would come to him wanting him to introduce them to philosophers…". Direction of the introduction is now source-correct, and the "submitting to being overlooked" punchline lands. |
| B2 | §45 | Restore negation + grasp/assent contrast | **FIXED in substance, with a residual defect** (see D3). "This way, it will not happen that you grasp some things correctly but merely assent to others without grasping them at all." Negation present; grasp vs. assent contrast present; "perceive" is gone. |
| B3 | §50 | Second "as if" restored | **FIXED.** "…as if they were laws, and as if breaking any of them would be an act of impiety." Parallel construction and the stance-not-fact modality restored; "impiety" recovered. |

**All 21 round-1 blocking/required items are correctly resolved at the level of
the proposition each one concerned.** No fix introduced a flipped negation, a
lost condition, or a new actor swap in its own sentence.

### Terminology sweep — verified book-wide

- ***phantasia* → "impression":** book-wide sweep of every occurrence. The term
  now reads "impression(s)" in §1.2, §6, §10, §16, §18, §19, §20, §34. The
  round-1 outliers (§16 "appearance", §19 "appearances", §20 "in the moment",
  §34 "the thought") are all fixed. The word "appearance" no longer occurs
  anywhere in the candidate. **One site remains unstandardized: §45**, where
  Long has "appearances" and the candidate now has "things" (see D3).
- **"in our power" → "within our control":** the sweep was applied at §14
  ("within your control"), §19 (closing clause), §24 (one site), and is
  consistent with §1, §2, §13, §25, §31, §32, §33.11, §48. **It is incomplete**,
  and the incompleteness is now visible *inside individual paragraphs*
  (see D4).

---

## 3. Defects found in round 2

Three of these are new or newly-visible; none existed in the round-1 reports.

### D1 — §29: new invented gloss on Euphrates (BLOCKING)

- **Source:** "as Euphrates speaks—and who can speak as he does?"
- **Pre-round-2 candidate:** "hear someone speak as Euphrates does—and who can speak like him?"
- **Current candidate:** "hear someone speak as Euphrates, **a celebrated philosopher of the day**, does—and who can speak like him?"

This apposition is not in the source, was not requested by any round-1 reviewer,
and was added during a round that was supposed to contain only the listed fixes.
It is the same category of defect as review 1's B1 (a glossary note smuggled into
the reading text as an explanatory aside) — which round 2 correctly removed from
§1. Removing an invented gloss in §1 while adding one in §29 is a regression
against the round-1 standard.

**Fix:** delete ", a celebrated philosopher of the day,". If the identification
is wanted, it belongs in separately sourced notes.

### D2 — §1, paragraph 1: sentence starts lowercase after a full stop (BLOCKING as a copy defect)

Current text: "You will blame no one, accuse no one, do nothing against your
will. **n**o one will harm you, you will have no enemy, because you will not
suffer any harm."

The R1 patch was spliced in without recapitalizing. This is the only such
occurrence in the file (checked by regex across all 52 sections). Reader-facing
and unambiguous.

**Fix:** "…do nothing against your will. No one will harm you…".

### D3 — §45: the *phantasia* term is dropped and two words are supplied (REQUIRED, lower severity)

- **Source:** "Thus it will not happen to you to comprehend some appearances
  **which are capable of being comprehended**, but to assent to others."
- **Current candidate:** "This way, it will not happen that you grasp some things
  **correctly** but merely assent to others **without grasping them at all**."

B2's substance is restored, but (a) "appearances" becomes "things", so §45 is the
one remaining site where the book's load-bearing technical term disappears — and
it is a site the round-2 pass was actively editing, in the same round as a
book-wide sweep intended to standardize that exact term; (b) the source's
qualifier "capable of being comprehended" is dropped; (c) "correctly" and
"without grasping them at all" are supplied. (c) is a defensible unpacking of
Long's ellipsis, but combined with (a) and (b) the sentence is further from the
source than it needs to be.

**Fix (suggested):** "This way it will not happen that you grasp only some of the
impressions that can be grasped, while giving your assent to others."

### D4 — §19 and §24 are now internally inconsistent on "power" / "control" (REQUIRED, lower severity)

The partial sweep left both variants inside the same paragraph:

- **§19:** "victory is not within your **power**" … "If what is good lies within
  our **power**" … "not caring about things outside your **control**."
- **§24:** "somebody only in the things within your **power**" … "these things are
  within our **control** rather than someone else's".

Both render Long's single phrase "in our power". Before round 2 each paragraph was
at least internally uniform; the sweep's partial application has made the book's
central distinction look like two different ideas *within one paragraph*. The
remaining unswept sites are §18 ("within my power"), §19 (×2), §23 ("This is
within your power"), §24 (×1). (Other occurrences of "power" — §1.2 worldly power,
§12 "lie in his power", §15 "their power", §28, §31 royal power, §40, §50 "power of
reason" — are different senses and are correctly left alone.)

**Fix:** finish the sweep at those five sites, letting person vary with context
("within my control", "within your control", "within our control").

### Minor, no fix required

- **§19:** source has singular "the appearance"; candidate has plural
  "impressions". No proposition changes.
- **§12:** "and you are entirely so" is a compressed rendering of Long's "but
  altogether well with you". Faithful to the sentence's structure; the compression
  is slightly opaque on first reading. Style only.
- All round-1 non-blocking notes not listed in the change set (N1–N8 of review 1;
  N1–N19 of review 2 except N12/N19; N1–N20 of review 3 except N17) remain open,
  as expected — they were never in scope for round 2.

---

## 4. Checks that came back clean on the changed sections

For each of the 20 changed sections I re-derived actors, negation, causality,
certainty/hedging, conditions, omissions, additions and silent corrections:

- **Actors:** no swap. §9 (leg), §46 (visitors/Socrates), §11 (the giver), §12
  (he/you), §16 (the weeper/the observer), §31 (son/father, Polynices/Eteocles),
  §42 (the mistaken person vs. the statement) all point the same way as the source.
- **Negation:** every negation in the changed sections checked. §1 ("no one…no
  enemy…not suffer"), §9 ("but not to the will"), §14 ("neither desire nor
  avoid"), §15 ("don't hold it back", "don't even take"), §16 ("do not refuse",
  "do not grieve inside"), §18 ("none of these signs concerns me"), §20 ("not the
  person who insults you"), §24 (the whole objection/reply chain), §29 ("must not
  drink cold water", "do not fit together"), §31 ("never blame", "no way to do
  this except"), §45 ("Do not say", "it will not happen"), §46 ("Never call
  yourself", "do not talk much", "do not vomit up"), §50 ("Pay no attention", "a
  law you must not break") — all intact and in the source's direction.
- **Conditions:** §1 ("if you mistake…", "if you take as your own…", "if you aim
  at…", "if it concerns something outside…"), §3 ("when it breaks", "when they
  die"), §9 ("unless the will consents"), §11 ("for as long as he allows you"),
  §12, §14, §15, §18 ("if I choose"), §19 ("if you never enter a contest"), §20
  ("if you gain… time"), §29 ("if you still choose", "if not"), §31 ("if you do
  this", "if you count anything…"), §34 ("if you abstain", "if you think the time
  is right"), §42 ("if their judgment is wrong"), §50 ("if you remain careless",
  "if anything… comes your way") — same scope, same consequent as source.
- **Certainty/hedging:** the three modality defects (R2 §1, R6 §18, B3 §50) are
  all corrected in the right direction; no *new* hedge or hardening was found in
  any changed section.
- **Causality:** restored where required (§1 "because", §16 "since", §31 "For every
  living creature"); §42's "Keep this in mind and you will be gentle" still
  detaches the saying from the mildness (review 3's N9, non-blocking, unchanged).
- **Additions:** one found — D1.
- **Silent corrections:** none found in the changed sections. §29 keeps the
  five children's roles and the four adult roles, Euphrates, the pentathlon/
  wrestler pair; §31 keeps the four negatives on sacrifice and the
  Polynices/Eteocles attribution; §24 keeps the deliberately crossed
  smith/shoemaker pairing uncrossed-in-source order; §12, §14, §29 keep "slave".
- **Unmodernized quotations:** none introduced. All quoted formulas in the changed
  sections ("You are only an impression…", "This is the price of freedom from
  distress…", "That is how it seemed to them.") are modern English.
- **Cross-boundary:** the slave/free spine (§1 → §12/§14) now holds; the
  *phantasia* thread (§1 → §6 → §10 → §16 → §18 → §19 → §20 → §34) is now one term
  in every place but §45; the conjunctive/disjunctive vocabulary is now one term
  across §36 and §42. No claim set up in one section is paid off differently in
  another.

---

## 5. Verdict

# ACCEPT WITH FIXES REQUIRED

All 21 round-1 blocking and required defects are genuinely resolved — verified
against the source, not against the reviewers' suggested wording. The two
terminology threads that round 1 flagged as coordinator-level work are
substantially resolved. Structural alignment is exact and nothing outside the
declared 20 sections moved. A re-draft is not warranted anywhere; the book is
close.

**Required before this round can be certified (4 items, all single-edit):**

1. **D1 — §29:** delete the invented apposition ", a celebrated philosopher of the
   day,". *(Blocking: invented content, same class as the §1 defect this round
   removed.)*
2. **D2 — §1.1:** capitalize "no one will harm you" after the full stop.
   *(Blocking: reader-facing copy defect introduced by the R1 patch.)*
3. **D3 — §45:** restore the *phantasia* term and the "capable of being grasped"
   qualifier; drop the supplied "correctly".
4. **D4 — §19, §24 (and §18, §23):** finish the "in our power" → "within … control"
   sweep so no paragraph carries both forms.

**Is the book ready for a final whole-book non-sampled pass?** Not yet — but only
just. Apply the four fixes above, then it is. D1 and D3 are both substantive
(one addition, one term/qualifier loss); D2 and D4 are mechanical. All four are
confined to five sections (1, 18/19, 23/24, 29, 45), so a round-3 verification can
be narrow, and the final whole-book non-sampled pass should follow immediately
after it rather than being merged with it.
