# Fidelity Review 3 (round-3 revision re-check) — Leviathan, edition ch. 24 (Hobbes ch. 23), "Of the Public Ministers of Sovereign Power"

Reviewer: independent fidelity reviewer (Reviewer B), per
`books/prompts/fidelity-review-prompt.md`. Targeted re-check of revision round 3,
against the baseline of `fidelity-review-2.md` (required N1; recommended N2–N7).

- **Fidelity anchor (sole):** `books/wip/leviathan-pilot-ch24/source.json` (13 paragraphs)
- **Candidate:** `books/wip/leviathan-pilot-ch24/candidate-sonnet.json` (post round-3)
- **Baseline read first:** `fidelity-review-2.md`
- **Context consulted (not as a fidelity anchor):** `books/wip/leviathan-pilot-ch18/leviathan-ch18-final.json`, only to check house handling of "bear the person".
- **Not consulted:** the accessibility review, drafter's notes, `leviathan-modern-en.json`, or any other translation. The pre-revision text was read only via `git show 169a06a3` to establish the exact changed set.

Paragraph indices are **0-based**.

## Coverage

- **Changed in round 3 (read individually, in full, against source, with one paragraph of context on each side):** indices **0, 1, 2, 3, 6, 7, 8, 9, 11, 12**. Derived from a mechanical diff of `5f94c934` against `169a06a3`, not from the drafter's report. The changed set matches the set stated in the task.
- **Unchanged in round 3 (byte-identical to round 2; not re-certified here, read as context only):** indices **4, 5, 10**. Title field also byte-identical (still correct per D1).
- **Whole-chapter continuous pass:** all 13 paragraphs, source and candidate, for cross-boundary consistency — public/private minister, natural vs. political capacity, judicature, business, author, and the body-natural chain (nerves/tendons → organs of voice → hands → eye → ear).
- **Word-count ratio scan** of all 13 paragraph pairs (source vs. candidate) as an omission tripwire. This is what surfaced D7 below.

Structural checks:

- Paragraph count **13 = 13**. Order preserved, 1:1 index alignment. `"number"` is 24 in both. Nothing merged, split, reordered or invented at paragraph level.
- Source/candidate word-count ratios are between 0.97 and 1.11 for every index **except index 0 (1.52) and index 1 (0.36)**. Index 0's expansion is the licensed "organic parts" gloss. **Index 1's 0.36 is a mass deletion — see D7.**

---

## Part 1 — N1–N7 from review 2: applied?

| # | Status |
|---|---|
| N1 (index 0, blocking) | **APPLIED, correct** |
| N2 (index 3) | **PARTLY APPLIED** — self-contradiction gone, but the replacement gloss introduces a new (smaller) problem. See D9. |
| N3 (index 7) | **APPLIED, correct** |
| N4 (index 7) | **APPLIED, correct** |
| N5 (index 2) | **APPLIED** — but the surrounding rewrite drops a clause. See D8. |
| N6 (index 11) | **APPLIED, correct** |
| N7 (index 12) | **APPLIED, correct** |

**1. N1 — CLEARED, deleted not re-guessed.** Index 0 now reads: "In the last chapter I spoke of the similar parts of a commonwealth. In this I shall speak of its organic parts — that is, the parts with a distinct function, like organs in a body — namely, the public ministers." The "private citizens who simply make it up" clause is gone and **nothing was substituted for it** — the back-reference is left bare, exactly as Hobbes leaves it. This is the right resolution; a new gloss on "similar parts" would have re-run the same risk. The retained "organic parts" gloss is still licensed (it unpacks Hobbes's own "Organicall" and his own body-natural analogy).

**2. N2 — self-contradiction resolved, but see D9.** "not money in the modern sense" is gone. The reader is no longer told the word is not about money immediately before a list of money. Confirmed fixed as stated. The replacement gloss is a separate, smaller defect (D9).

**3. N3/N4 — CLEARED, both, and the parenthetical position is correct.**
- Round 2: "First: the complainant has already chosen his own judge. If the defendant is then allowed to challenge any of the **remaining** judges whose interest makes him suspect them, the judges he does not challenge are ones he has, **in effect**, agreed to himself."
- Round 3: "First, if the defendant is allowed to challenge any of his judges whose interest makes him suspect them (the complainant, after all, has already chosen his own judge), then the judges he does not challenge are ones he has himself agreed to."
- **"remaining" is gone** — the invented two-stage panel is no longer implied; "any of his judges" now tracks the source's "such of his Judges" exactly.
- **"in effect" is gone** — the step is flat again ("are ones he has himself agreed to" ≈ "are Judges he himself agrees on"), which the paragraph needs at full strength for the closing "judged by his own judges, that is, by himself."
- **Parenthetical position matches source structure.** Source: "if the Defendant be allowed to except against such of his Judges, whose interest maketh him suspect them, **(for as to the Complaynant he hath already chosen his own Judge,)** those which he excepteth not against, are Judges he himself agrees on." The candidate places the complainant clause in parentheses at exactly the same point in the sentence, subordinate to the defendant clause, and it still functions as the *reason why only the defendant needs the challenge-right*. "First" now correctly heads the defendant's right of exception, not the complainant's prior choice. The enumeration first/second/third is intact and load-bearing.
- One micro-note, not a defect: "after all" renders the source's "for as to" causal force adequately; it neither hedges nor adds a claim.

**4. N5 — the duplicated "infant king" is gone, but the rewrite around it is not clean. See D8.** The doubled noun phrase is resolved. Judged narrowly, N5 is cleared. Judged as a whole-sentence rewrite, index 2 has lost a clause and reintroduced a small unlicensed rank — see D8 for the full analysis, including the specific question asked about "before his own reign ends".

**5. N6 — CLEARED, and the parallel is accurate to source.** Source index 11 uses "Businesse" in both places: "though Authority be Publique; yet because the **businesse** is Private" and "though both the Authority, and the **Businesse** be Publique". The candidate now uses "business" in both: "though his authority is public, the business is private" and "both his authority and his business are public". Confirmed: this restores Hobbes's deliberate authority/business pair, and the parallel it supports (public authority + private business → private person; public authority + public business but no one to represent to → still a private minister, yet a minister of the commonwealth) now reads as one structure. Correct.

**6. N7 — CLEARED, conditional/definitional framing restored.**
- Source: "For the Advice is addressed to the Soveraign only, whose person cannot **in his own presence**, be represented to him, by another."
- Round 2: "For the advice is addressed to the sovereign alone. And **since the sovereign is present in his own person**, no one else can represent him to himself." (asserted presence as fact, used it as a premise)
- Round 3: "For the advice is addressed to the sovereign alone — and **no one can represent him to himself while he is present in person**."
- Confirmed: presence is back inside the restriction ("while he is present") rather than standing as an asserted premise ("since… is present"). "no one can" carries the source's "by another". The sentence now states the same general impossibility Hobbes states. Correct.

---

## Part 2 — NEW defects in round 3

### D7 — BLOCKING (mass omission). Index 1: roughly two-thirds of the paragraph has been deleted, including the chapter's definition of "public minister".

- **Source (index 1), in full:** "A PUBLIQUE MINISTER, is he, that by the Soveraign, (whether a Monarch, or an Assembly,) is employed in any affaires, with Authority to represent in that employment, the Person of the Common-wealth. And whereas every man, or assembly that hath Soveraignty, representeth two Persons, or (as the more common phrase is) has two Capacities, one Naturall, and another Politique, (as a Monarch, hath the person not onely of the Common-wealth, but also of a man; and a Soveraign Assembly hath the Person not onely of the Common-wealth, but also of the Assembly); they that be servants to them in their naturall Capacity, are not Publique Ministers; but those onely that serve them in the Administration of the Publique businesse. And therefore neither Ushers, nor Sergeants, nor other Officers that waite on the Assembly, for no other purpose, but for the commodity of the men assembled, in an Aristocracy, or Democracy; nor Stewards, Chamberlains, Cofferers, or any other Officers of the houshold of a Monarch, are Publique Ministers in a Monarchy." (170 words)

- **Candidate (index 1), in full:** "A monarch bears the person not only of the commonwealth but also of a man; a sovereign assembly bears the person not only of the commonwealth but also of the assembly. (To \"bear the person\" of something, in this technical sense, is to act and be treated in law as if you were that thing — not to physically carry anyone.)" (61 words)

- **What's wrong:** round 3 kept only Hobbes's *parenthetical illustration* and deleted everything it was illustrating. Four things are gone outright:
  1. **The definition of a public minister** — "he, that by the Soveraign, (whether a Monarch, or an Assembly,) is employed in any affaires, with Authority to represent in that employment, the Person of the Common-wealth." This is the defining sentence of the entire chapter; the chapter's title term is now never defined.
  2. **The two persons / two capacities frame** — "every man, or assembly that hath Soveraignty, representeth two Persons, or (as the more common phrase is) has two Capacities, one Naturall, and another Politique". Without it the surviving monarch/assembly sentence has no antecedent and no point; it now opens the paragraph as a free-standing assertion.
  3. **The criterion** — "they that be servants to them in their naturall Capacity, are not Publique Ministers; but those onely that serve them in the Administration of the Publique businesse." A negation plus its exception, both lost.
  4. **The worked example list** — ushers, sergeants, other officers attending the assembly "for no other purpose, but for the commodity of the men assembled, in an Aristocracy, or Democracy"; stewards, chamberlains, cofferers, other household officers of a monarch; and the conclusion "are Publique Ministers in a Monarchy" (negated). An entire enumerated example with its "And therefore" inference.

  This is also a **regression**: round 2's index 1 rendered all of this correctly and review 2 certified it clean (including the "cofferers (household treasurers)" gloss and the intact negation structure). The deletion is new in commit `5f94c934`.

  **Cross-chapter damage:** index 3 ends on "because they serve him in his **political capacity**" and index 11 turns on an ambassador's business "belonging to him in his **natural capacity**". Both now refer back to a distinction the chapter no longer draws. Likewise "private minister" (index 11) has lost its definitional counterweight.

- **Fix:** restore round 2's index 1 verbatim (`git show 169a06a3:books/wip/leviathan-pilot-ch24/candidate-sonnet.json`, paragraph 1), then re-apply only the intended round-3 edit — inserting the "bear the person" gloss — into that full text, adjusted per D10. Nothing else in index 1 needed changing.

### D8 — FIXES REQUIRED (omission + small unlicensed addition). Index 2: the protectorship sentence lost "during his minority" and re-acquired a "king".

- **Source (index 2):** "Of the whole, as to a Protector, or Regent, may bee committed by the **Predecessor of an Infant King**, **during his minority**, the whole Administration of his Kingdome."
- **Candidate (index 2):** "Of the whole: for example, **a king** may, **before his own reign ends**, arrange for a protector or regent to be entrusted with the whole administration of the kingdom **once his successor inherits the throne as a child**."
- **What's wrong (three items, in descending severity):**
  1. **"during his minority" is gone.** The source bounds the protectorship by a *duration* — it runs through the infant king's minority and ends with it. The candidate replaces this with a *start condition* ("once his successor inherits the throne as a child"). The terminus is lost, and the terminus is the substantive point of a regency. This is an omission, not a paraphrase.
  2. **"before his own reign ends" — over-assertion, but mild.** Answering the question directly: this is a *reasonable* clarification of implied timing, not an invention. "Predecessor of an Infant King" entails that the arranging is done by someone who held the office before the infant, i.e. before his own reign ended. What it does do is convert Hobbes's neutral, passive, undated "may bee committed by the Predecessor" into an act of deliberate advance planning with an explicit deadline. On its own I would let it pass; combined with the loss of "during his minority" it reads as the temporal information having been *moved* from the right place (duration of the regency) to the wrong one (timing of the appointment). Recommend dropping it as unnecessary once "during his minority" is restored.
  3. **"a king" partially regresses D2.** Review 1's D2 required removing the unlicensed "predecessor king"; round 2 fixed it to "an infant king's predecessor"; round 3 reintroduces "a king" as the actor. It is a smaller offence than the original (the predecessor of a king is in practice a monarch) but it is still the candidate naming a rank Hobbes declines to name.
- **Fix:** "Of the whole: for example, an infant king's predecessor may entrust a protector or regent with the whole administration of the kingdom during his minority." (This is round 2's sentence with N5's pronoun fix applied — which is exactly what review 2 asked for, and it is both shorter and more faithful than the round-3 rewrite.)

### D9 — NON-BLOCKING (substituted gloss narrows the term). Index 3: "economy" is now glossed as "public treasure".

- **Source (index 3):** "As at home, First, for the **Oeconomy** of a Common-wealth, They that have Authority concerning the Treasure, as Tributes, Impositions, Rents, Fines, or whatsoever publique revenue…"
- **Candidate (index 3):** "At home, first, there are those who administer the commonwealth's economy — **that is, its public treasure**. Those with authority over tributes, impositions, rents, fines, or any other public revenue — to collect, receive, disburse, or audit it — are public ministers."
- **What's wrong:** the N2 self-contradiction is gone, but the gloss that replaced it now *defines* economy as treasure. Hobbes's "Oeconomy" is household/estate management (the sense review 2 endorsed: "the management of its affairs"); the treasure is the subject matter he goes on to enumerate, not the meaning of the word. So the candidate silently substitutes a narrower definition. Secondary, cosmetic: the restructuring into two sentences makes the subject appear twice ("those who administer… / Those with authority over…"), which round 2's single sentence did not.
- **Fix:** use the half review 2 already licensed: "At home, first, for the commonwealth's economy — that is, the management of its affairs: those who have authority over the public treasure — tributes, impositions, rents, fines, or any other public revenue — to collect, receive, disburse, or audit it, are public ministers."

### D10 — NON-BLOCKING (gloss overreach + reader-directed aside). Index 1: the "bear the person" parenthetical.

- **Candidate (index 1):** "(To \"bear the person\" of something, in this technical sense, is to **act and be treated in law** as if you were that thing — **not to physically carry anyone**.)"
- **House precedent (ch. 18 accepted candidate, index 12):** "to bear their person — that is, **to act and speak as if he were the multitude itself**."
- **Assessment:** glossing the technical sense of "person" here is legitimate and welcome — the term is doing real work in this chapter and Hobbes defines it elsewhere, not here. Two parts of the wording overreach:
  1. **"be treated in law"** imports a legal-status claim Hobbes's "person" does not carry. His person is about whose words and actions are *owned and attributed* — representation, not legal treatment. It also fits badly in this very sentence: a monarch bearing "the person… of a man" is his natural capacity, and no one is "treated in law as if" they were a man. The ch. 18 formulation ("act and speak as if he were…") is both more faithful and already accepted house wording.
  2. **"not to physically carry anyone"** is a reader-directed aside about English idiom, not a statement about the text. It is the same move as the "not money in the modern sense" clause that review 2 required removed from index 3 (N2); leaving one and deleting the other is inconsistent.
- **Fix:** "(To \"bear the person\" of something, in this technical sense, is to act and speak as if you were that thing.)" — and place it in the restored full index 1 (see D7), after the two-capacities sentence where the term first does its work.

### D11 — NON-BLOCKING (hedge added; connective weakened). Index 8: the lords'-privilege sentence and the "Historically" connective.

- **Source (index 8):** "**For whereas** there were two orders of men, whereof one was Lords, the other Commons; The Lords had this Priviledge, to have for Judges in all Capitall crimes, none but Lords; and of them, as many as would be present; **which being ever acknowledged as a Priviledge of favour, their Judges were none but such as they had themselves desired.**"
- **Candidate (index 8):** "**Historically**, there were two orders of men in England: the lords and the commons. The lords had the privilege that in all capital crimes their judges could be none but lords — as many of them as chose to attend. Because this was always acknowledged as a privilege granted them as a favor, **it meant the lords, in effect, had judges of their own choosing**."
- **What's wrong (two small items):**
  1. **"in effect" is an added hedge.** Hobbes states it flatly: "their Judges were none but such as they had themselves desired." This is the exact hedge that N3 required removed from index 7 three paragraphs earlier; it has been deleted there and introduced here in the same revision. The flat form matters, because the next sentence's conclusion ("having judges of his own choosing, the party had no grounds to object") depends on it.
  2. **"Historically" for "For whereas"** drops the causal link. Hobbes's "For" ties the two-orders description back to his praise of the English courts as evidence for it; "Historically" merely time-stamps it and faintly implies the arrangement has lapsed, which the source does not say. "in England" is licensed (the paragraph is explicitly about England) and the splitting into two sentences is fine.
- **Fix:** "For there were two orders of men in England: the lords and the commons. The lords had the privilege that in all capital crimes their judges could be none but lords — as many of them as chose to attend. Because this was always acknowledged as a privilege granted them as a favor, their judges were none but those they themselves wanted."

### Checked in the changed paragraphs and found clean

- **Index 6 — "on the bench" gloss.** Source: "For in their Seats of Justice they represent the person of the Soveraign". Candidate: "For on the bench — in their seats of justice — they represent the person of the sovereign, and their sentence is his sentence." Accurate and non-overreaching: "on the bench" is the plain modern equivalent of sitting in a seat of justice, it adds no institutional claim, and the source's own phrase is retained beside it rather than replaced. Mildly redundant (both halves say the same thing) but that is style, not fidelity. The rest of index 6 is unchanged from the version certified in review 2 — the judicature gloss, "ministers of whoever holds the sovereign power", the fact/law two-judge structure and its "consequently" all intact.
- **Index 9 — "procure" → "see to".** Source: "Authority from the Soveraign, to **procure** the Execution of Judgements given". "See to the execution of judgments given" is an accurate rendering of the 17th-century "procure" (bring about, cause to happen) and avoids the modern "obtain/purchase" misreading. Correct change, no loss. The rest of the paragraph is byte-identical to the certified round-2 text.
- **Index 7 — everything outside N3/N4.** "ought in fairness" for "ought in Equity"; "no man can be judge in his own case"; the sovereign's two options; second/third consequents; the closing "judged by his own judges, that is, by himself" — all intact and unchanged.
- **Index 8 — everything outside D11.** Common Pleas / Public Pleas / Pleas of the Crown definitions, "none but Lords", "as many of them as chose to attend", "granted them as a favor" (D4 still in place), "locality" (D3 still in place), the number twelve, "a jury", "had no grounds to object to the sentence being final", and the organs-of-voice close are all unchanged. "fitly" → "fittingly" is a pure typo fix. No silent historical correction anywhere in the paragraph.
- **Index 11 — everything outside N6.** The "author" gloss, the private-faction negation, the ambassador/natural-capacity case, the secret-agent two-step qualification, and the eye/ear analogies are unchanged and still correct.
- **Index 12 — everything outside N7.** Opening negation and the "considered simply as having no authority of judicature or command" restriction; monarchy/democracy/aristocracy sequence; "gives counsel to no one but itself" — unchanged.

### Carried over, still open (all non-blocking, none touched in round 3)

- **Index 5, `Dei Gratia`** rendered "the favor of God alone" then "the grace of God and the king" in adjacent clauses. Same note as review 2. Index 5 was not touched.
- **Index 9, "suppress uprisings"** for "suppresse Tumults". Certified in review 1 and not changed this round, but noting it while re-reading the paragraph: "tumults" in Hobbes is riots and disorders; "uprisings" leans toward organised rebellion. "disturbances" or "riots" would be closer. Optional.
- **S1/S2/S3** (possible errors in Hobbes's own text) remain correctly rendered and uncorrected. Nothing in round 3 disturbed this.

### Cross-boundary / consistency pass

- **The body-natural chain** is complete and correctly placed: nerves/tendons (index 2), organs of voice (end of index 8), hands (index 9), eye and ear (index 11). Undisturbed.
- **"business"** is now used consistently for Hobbes's "Businesse" at indices 3, 10 and both occurrences in 11. Good.
- **"judicature"** is glossed once at first occurrence (index 6) and runs unglossed at 8 and 12. Correct.
- **Natural vs. political capacity is now broken** by D7: the distinction is invoked at indices 3 and 11 but no longer established at index 1, where the source establishes it. This is the main cross-boundary consequence of the deletion.
- **"Public minister" is never defined** after D7, though the phrase is used in every one of the remaining twelve paragraphs.
- **Hedging discipline is now inconsistent within the chapter:** "in effect" removed at index 7 (correct), added at index 8 (D11).
- No claim was moved across a paragraph boundary by any round-3 edit.

---

## Verdict

**ACCEPT WITH FIXES REQUIRED**

On the seven items this round was asked to address, the revision is good: **N1 is cleared in the right way (deleted, not re-guessed); N3, N4, N6 and N7 are cleared cleanly and correctly; N2's self-contradiction is gone; N5's duplication is gone.** The two newly-checked accessibility additions that work — "on the bench" (index 6) and "see to" (index 9) — are accurate and non-overreaching.

But round 3 introduced one blocking regression that is larger than anything the earlier reviews found: **index 1 lost about two-thirds of its content, including the chapter's definition of "public minister", the two-capacities distinction, the natural-capacity criterion, and the ushers/stewards/cofferers example.** Round 2's index 1 was certified clean; this is a deletion, not a rewrite. The chapter cannot ship in this state.

Required before acceptance:

1. **D7 (index 1)** — restore round 2's full paragraph 1 (`git show 169a06a3:…candidate-sonnet.json`), then re-apply the "bear the person" gloss into it per D10. **Blocking.**
2. **D8 (index 2)** — restore "during his minority"; revert to "an infant king's predecessor may entrust a protector or regent with the whole administration of the kingdom during his minority."

Recommended (cheap, not blocking):

3. **D9 (index 3)** — gloss economy as "the management of its affairs", not "its public treasure".
4. **D10 (index 1)** — "act and speak as if you were that thing" (ch. 18 house wording); drop "be treated in law" and "not to physically carry anyone".
5. **D11 (index 8)** — drop "in effect"; restore "For" in place of "Historically".
6. Carried-over optional items: `Dei Gratia` consistency (index 5), "tumults" (index 9).

No re-draft is needed — D7 is a restore-and-reapply, and everything else is a local patch. Paragraph count, order and index alignment are sound (13 = 13). **A word-count ratio check against the source should be run before the next round is submitted;** it catches this failure mode in seconds.
