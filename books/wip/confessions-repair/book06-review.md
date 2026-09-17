# Confessions Book 6 — Independent Fidelity & Readability Review

**Reviewer:** independent (did not draft this candidate)
**Source of truth:** `book06-source.json` (Pusey 1838), 27 paragraphs
**Candidate reviewed:** `book06-candidate.json`, sha256 `73bb3730f7ce0ac95dc4d652c0607fef9de6ff683f7ce7424e19db7d56fc6ae7` — verified matches the frozen hash
**Structural check:** 27 source paragraphs / 27 candidate paragraphs, one-to-one. PASS.

---

## 0. Independent question-mark count (stated up front)

Counted programmatically with `str.count('?')` over both files, zipped in order. **I did not use the drafter's table.**

| Para | Source `?` | Candidate `?` | Match |
|---|---|---|---|
| 1 | 2 | 2 | OK |
| 2 | 0 | 0 | OK |
| 3 | 1 | 1 | OK |
| 4 | 0 | 0 | OK |
| 5 | 0 | 0 | OK |
| 6 | 0 | 0 | OK |
| 7 | 1 | 1 | OK |
| 8 | 0 | 0 | OK |
| 9 | 3 | 3 | OK |
| 10 | 1 | 1 | OK |
| 11 | 0 | 0 | OK |
| 12 | 0 | 0 | OK |
| 13 | 2 | 2 | OK |
| 14 | 0 | 0 | OK |
| 15 | 1 | 1 | OK |
| 16 | 2 | 2 | OK |
| 17 | 1 | 1 | OK |
| 18 | 10 | 10 | OK |
| 19 | 6 | 6 | OK |
| 20 | 0 | 0 | OK |
| 21 | 0 | 0 | OK |
| 22 | 0 | 0 | OK |
| 23 | 0 | 0 | OK |
| 24 | 0 | 0 | OK |
| 25 | 0 | 0 | OK |
| 26 | 1 | 1 | OK |
| 27 | 0 | 0 | OK |

**Result: per-paragraph parity holds on all 27 rows. No rhetorical question was flattened or invented.**

**Totals: 31 source / 31 candidate — not 32/32.** The drafter's notes claim "32 question marks in source, 32 in candidate" in section 4 and repeat "32/32" in the self-assessment. Their own per-paragraph table sums to 31. This is an arithmetic error in the notes, not a defect in the text — the gate passes, and it passes at 31/31. Recorded here because the notes should not be trusted as a verification artifact on their own. (See Finding F29.)

**Caveat on parity as a gate (para 9):** parity is satisfied in paragraph 9 by a *redistribution* rather than a preservation — the source's questions become indirect clauses and the source's flat answers become rhetorical questions. Count-based gating alone would not have caught this. See F17.

---

## 1. Packet-by-packet findings

Severity key: **major** = meaning inverted, dropped, or fabricated; **moderate** = a claim, subject, or clause altered such that a careful reader gets something different from the source; **minor** = lexical/register drift, small explicitation, or lost echo.

### Packet A — paragraphs 1–3

**Para 1 — 3 findings (all minor)**

- **F1 (minor).** Source: "she hastened the more eagerly to the Church, and hung upon the lips of Ambrose, **praying for** the fountain of that water, which springeth up unto life everlasting." Candidate: "...hung on Ambrose's every word, **seeking** the spring of that water which wells up to eternal life." The petitionary element (*praying for*) is replaced by *seeking*. Monica praying is a load-bearing motif across the whole book (she prays for the vision in para 23, she prays through paras 1–2). **Proposed:** "…praying for the spring of that water which wells up to eternal life."

- **F2 (minor, added connective).** Source: "after **the access, as it were, of a sharper fit**, which physicians call 'the crisis.'" Candidate: "after **what would come first**, a sharper turn for the worse, which doctors call 'the crisis.'" "What would come first" is an added sequencing connective supplying an ordering the source only implies via "after". Harmless but unnecessary. **Proposed:** "after what amounts to the onset of a sharper fever, which doctors call 'the crisis.'"

- **F3 (minor, quote style).** Source puts Monica's reply in quotation marks even though it is reported indirectly: `she replied to me, "She believed in Christ, that before she departed this life, she should see me a Catholic believer."` Candidate drops the quotation marks and uses a colon. Defensible (quoting indirect speech reads oddly in modern English), and the wording is otherwise exact. Noted only for the record; **no change required**.

**Para 2 — 2 findings (1 moderate, 1 minor)**

- **F4 (MODERATE — dropped claim).** Source: "For wine-bibbing did not lay siege to her spirit, nor did love of wine provoke her to **hatred of the truth**, as it doth too many (both men and women), who revolt at a lesson of sobriety…" Candidate: "…nor did any love of drink provoke her to **resent this lesson in sobriety**, as it does so many — men and women alike — who recoil from a call to temperance…" The source makes two distinct claims: (a) wine did not make her hate *the truth*, and (b) many others *do* recoil from a lesson of sobriety. The candidate substitutes (b) into (a)'s slot, deleting "hatred of the truth" entirely and making the following clause a near-tautology ("provoke her to resent this lesson in sobriety, as it does so many who recoil from a call to temperance"). **Proposed:** "…nor did any love of drink provoke her to hatred of the truth, as it does so many — men and women alike — who recoil from a call to temperance the way men already far gone in drink recoil from wine mixed with water."

- **F5 (minor, addition).** Source: "And if there were many churches of the departed saints that were to be honoured in that manner…" Candidate adds "**on a given day**". Not in the source; it resolves an unstated timeframe. **Proposed:** delete "on a given day".

**Para 3 — 2 findings (both minor)**

- **F6 (minor).** Source: "shut out both from his ear and speech by multitudes of busy people, whose **weaknesses** he served." Candidate: "whose **troubles** he attended to." *Infirmitatibus* / "weaknesses" is a deliberate word (Ambrose serving people's frailty, not their errands). **Proposed:** "whose weaknesses he ministered to."

- **F7 (minor, lost keyword).** Source: "his eye glided over the pages, and his **heart** searched out the sense." Candidate: "his eyes moved across the page and his **mind** searched out the meaning." *Cor* is the single most load-bearing word in the *Confessions* and the candidate itself renders it as "heart" everywhere else in this book (paras 1, 5, 7, 9, 11, 12). Changing it here alone is an inconsistency as much as a drift. **Proposed:** "his eyes moved across the page and his heart searched out the meaning."

Otherwise packet A is faithful. Checked specifically: the mariners/passengers comfort direction in para 1 (source: passengers are normally the ones comforted *by* the sailors; candidate preserves this), and the "who durst intrude" rhetorical question in para 3 (preserved).

---

### Packet B — paragraphs 4–6

**Para 4 — 1 finding (minor)**

- **F8 (minor, collapsed referent).** Source: "all the knots of those crafty calumnies, which **those our deceivers** had knit against the Divine Books." Candidate: "all the knots **those cunning slanderers** had tied against the divine scriptures." "Our deceivers" identifies them as the Manichees who had specifically deceived *Augustine and his circle* — the possessive is the point. The candidate merges "crafty calumnies" and "our deceivers" into one phrase and loses the possessive. **Proposed:** "all the knots of those crafty slanders that our deceivers had tied against the divine scriptures."

Polarity checked and **correct**: the image-of-God clause. Source says the spiritual sons did *not* understand "man created after Thine own image" as meaning God is bounded by human shape; candidate preserves this ("was not understood… to mean that you were bound by human shape"). No inversion. The parenthetical about spiritual substance is preserved, and the "wholly everywhere and nowhere in space" / "from head to foot contained in space" contrast is intact.

**Para 5 — 3 findings (all minor)**

- **F9 (minor, ambiguity resolved).** Source: "I should have knocked and proposed the doubt, how it was to be believed, not insultingly opposed it, **as if believed**." Candidate: "…instead of scornfully opposing it **as though I already knew what was believed**." Pusey's "as if believed" means *as if that [anthropomorphic notion] were what the Church believed*. The candidate converts this into a claim about Augustine's own state of knowledge. Related but not the same, and it closes an ambiguity the source leaves open. **Proposed:** "…instead of scornfully opposing it as though that were what was believed."

- **F10 (minor, addition).** Source: "I had with childish error and vehemence, **prated of so many uncertainties**." Candidate adds "**as though they were sure**". Implied, but it is an addition. **Proposed:** delete "as though they were sure".

- **F11 (minor, drift).** Source: "the **One Only** Church, the body of Thine Only Son." Candidate: "the **one true** Church." *Unica* asserts uniqueness, not truth — and in this very sentence Augustine has just conceded the Church did *not yet*, so far as he had discovered, teach truly. Swapping "only" for "true" pushes against the concession two clauses earlier. **Proposed:** "the one and only Church".

Polarity checked and **correct**: "not indeed as yet to teach truly, but at least not to teach that for which I had grievously censured her" → candidate keeps this as a partial concession, not an endorsement. Also correct: "confounded, and converted" → "humbled, and turned around" (acceptable).

**Para 6 — 1 finding (minor)**

- **F12 (minor, added intensifier).** Source: "as it happens that one who **has tried** a bad physician, fears to trust himself with a good one." Candidate: "someone who **has been burned by** a bad doctor." The source says merely *tried*; "burned by" supplies an injury the source does not state. **Proposed:** "someone who has had a bad doctor is afraid to trust even a good one."

Checked and correct: "by hanging in suspense I was the worse killed" (preserved, not softened); "seven and three are ten"; the letter/spirit quotation kept as a quoted rule with Augustine's uncertainty intact ("he taught things I did not yet know whether to believe true"); "refused to be cured… resisting your hands" polarity intact.

---

### Packet C — paragraphs 7–9  *(7 and 9 on the drafter's polarity-risk list)*

**Para 7 — 1 finding (minor)**

- **F13 (minor, quote style).** Source quotes two credal fragments: `"That Thou art" whatsoever Thou wert (what I knew not), and "That the government of human things belongs to Thee."` Candidate de-quotes both and folds them into indirect speech. Readable, but Book 5's accepted convention keeps quoted scriptural/credal fragments in double quotes. **Proposed:** "…could wrest from me the belief that 'you are' — whatever you were, which I did not know — and that 'the governing of human affairs belongs to you.'"

**Polarity verified — CORRECT (the highest-risk sentence in the book).** Source: "not they who believed Thy Books… but they who believed them not, were to be blamed." Candidate: "it was not those who believed your books… who deserved blame, but those who did not believe them." Blame stays on the non-believers. No inversion. The full "considering…" chain (secular history / places and cities / friends / physicians / other men / parentage on hearsay) is present with every item, in order.

**Para 8 — 1 finding (minor)**

- **F14 (minor, dropped qualifier).** Source: "having heard **divers of them** expounded satisfactorily, I referred to the depth of the mysteries." Candidate: "when things in scripture that used to strike me as strange and offensive **had been explained** to my satisfaction." The candidate drops "divers/several", implying all such passages had been explained. Augustine's point is that having several explained was enough to make him defer on the rest. **Proposed:** "when several of the things in scripture that used to strike me as strange and offensive had been explained to my satisfaction…"

Checked and correct: the comparison at the end of the paragraph ("waft over towards Thee some few, **yet many more than** if it stood not aloft on such a height of authority") — candidate preserves both the "some few" and the "far more than otherwise" comparative, which is an easy place to invert and was not inverted.

**Para 9 — 2 findings (1 MAJOR, 1 minor)**

- **F15 (MAJOR — direction inversion).**
  **Source:** "…we yet looked to arrive only at that very joyousness whither that beggar-man had arrived before us, **who should never perchance attain it**."
  **Candidate:** "…we were only hoping to arrive at that very cheerfulness which that beggar had already reached ahead of us — **who might, perhaps, never fully attain it himself**."

  The relative clause is attached to the wrong party. In Pusey the "who" attaches to "**us**" — *we* are the ones who might never arrive. The Latin is unambiguous: *quo ille mendicus iam praecesserat nos numquam fortasse **perventuros*** — "where that beggar had already gone ahead of us, who would perhaps never get there." The candidate's added "**himself**" makes the misattribution explicit and unrecoverable: it states that the *beggar* might never attain the cheerfulness he has, which contradicts the sentence's own premise (he had already reached it) and destroys the paragraph's argument — the whole force of the passage is that the beggar has *already arrived* at a joy Augustine is grinding toward and may never reach.

  This is the exact defect class that appeared in Books 4 and 5. It is also *not* on the drafter's polarity-check list for para 9 — the notes check the "he was the happier" comparison (which is fine) and miss this one.

  **Proposed correction:** "…we were only hoping to arrive at that very cheerfulness which that beggar had already reached ahead of us — while we, perhaps, would never reach it at all."

- **F16 (minor, restructuring of rhetorical movement).** Source: "But should any ask me, had I rather be merry or fearful? **I would answer merry.** Again, if he asked had I rather be such as he was, or what I then was? **I should choose to be myself**, though worn with cares and fears." Candidate: "But if someone had asked me whether I would rather be cheerful or fearful, **would I not have answered cheerful?** And again, if asked whether I would rather be as he was, or what I then was — **would I not have chosen to remain myself**, worn down as I was by cares and fears?"

  The source *asks* and then *answers flatly*; the candidate turns the questions into indirect clauses and the answers into rhetorical questions. Question-mark parity is preserved by this swap (3/3), but the rhetorical shape is inverted, and Augustine's two blunt self-indicting admissions become softened rhetorical appeals. The drafter acknowledges the restructuring in the notes and calls it "mechanical"; it is not quite — a flat admission and a rhetorical question do different work. Content is not lost, so: minor. **Proposed:** "But if someone had asked me whether I would rather be cheerful or fearful? I would have answered: cheerful. And again, if he asked whether I would rather be as he was, or what I then was? I would have chosen to remain myself, worn down as I was by cares and fears."

Checked and correct: "Thou being the more gracious, the less Thou sufferedst aught to grow sweet to me, which was not Thou" (direction preserved); "he verily had not the true joy; but yet I… was seeking one much less true" (candidate: "far less true still" — correct); "he was joyous, I anxious; he void of care, I full of fears" (not swapped); "I ought not to prefer myself to him, because more learned" (correct); panegyric-lies passage at full weight.

---

### Packet D — paragraphs 10–12

**Para 10 — 1 finding (minor)**

- **F17 (minor, disposition → act).** Source: "he, **by fair wishes**, had gotten wine; I, by lying, was seeking for empty, swelling praise." Candidate: "he had gotten his wine **by honest begging**, while I was chasing after empty, swelling praise through lying." *Bonis optandis* / "by fair wishes" is a disposition (wishing for modest, honest things), not an act. "Honest begging" imports an activity and slightly dulls the wish/lie antithesis Augustine is building. **Proposed:** "he had gotten his wine by honest wishing, while I was chasing after empty, swelling praise by lying."

Polarity verified — **correct**: the beggar remains "the happier one"; "he was ahead of me even then"; his joy is no true joy but Augustine's glory is no true glory and did his soul *more* harm. The drunk-digestion asymmetry ("he would sleep off his drunkenness that very night; but I had slept and woken again with mine…") is intact.

**Para 11 — no issues.** Alypius's origin (same town, leading family, younger), the sequence (studied under Augustine in the hometown then Carthage), the mutual affection and its stated grounds, the Circus addiction, the father's estrangement, "seemed likely to throw away, or had already thrown away, such great promise", and the "he began to greet me, come in, listen a little, and leave" close are all present in order.

**Para 12 — 2 findings (1 moderate, 1 minor)**

- **F18 (MODERATE — subject inverted).** Source: "Let him be silent in Thy praises, who considers not Thy mercies, **which confess unto Thee out of my inmost soul**." Candidate: "…who does not weigh your mercies, **which my innermost soul confesses to you**." The subject and object of *confiteri* are swapped: in the source it is the **mercies** that confess to God out of Augustine's marrow; in the candidate it is the **soul** that confesses the mercies. Latin: *misericordias tuas, quae confitentur tibi ex medullis meis* — the mercies are the grammatical subject. Theologically low-stakes but it is a straight subject/object swap, which is precisely the defect class this project is guarding against, and it flattens a deliberately strange image into a conventional one. **Proposed:** "…who does not weigh your mercies, which confess to you out of my inmost being."

- **F19 (minor, softened term).** Source: "was involved in the same **superstition** with me." Candidate: "was drawn into the same **false belief** I held." *Superstitio* is Augustine's standing word for Manicheism across Books 3–5 and is not a synonym for "false belief" — it carries the sense of a cult practice. **Proposed:** "was caught up in the same superstition I held."

Checked and correct: "his amendment might plainly be attributed to Thyself, Thou effectedst it through me, unknowingly" (agency direction preserved); "another would have taken occasion of offence **with me**… that right-minded youth took as a ground of being offended **at himself**" (not swapped — this is a genuine inversion trap and the candidate handles it correctly); "But I had not rebuked him, but Thou" (preserved); the counterfeit-continency close at full weight.

---

### Packet E — paragraphs 13–15  *(13 self-flagged dense)*

**Para 13 (gladiator games) — no issues. This is the strongest paragraph in the candidate.**

Line-checked in full against the source. Every beat is present and at full weight: the "carried away incredibly with an incredible eagerness" doubling is preserved; Alypius's protest is quoted verbatim in substance with its rhetorical question intact ("can you force my mind or my eyes to turn to those shows as well?"); "I shall be absent while present, and so shall overcome both you and them"; the friends' motive ("perhaps eager to see whether he could really do as he said"); "shutting the gateway of his eyes"; the authorial cry "and if only he had stopped up his ears too!"; the double comparison, correctly directed — **a deeper wound in his soul than the man he wanted to see was struck in his body**, and **he fell more miserably than the one whose fall had raised that great roar**; the ear→eye causal chain; "a soul that was bold rather than truly strong, and weaker for having trusted in itself when it ought to have relied on you."

The corruption itself is **not softened**, per the standing instruction: "he drank in savagery along with it; he did not turn away but fixed his eyes there, drinking in the frenzy without realizing it, and took delight in that guilty contest, and grew drunk on the bloodshed as entertainment. He was no longer the man who had come in, but one of the crowd he had joined — a true companion, now, of those who had brought him there." The "Why say more?" question and the escalation (watched → shouted → caught fire → returned ahead of them → drew others in) are all present. "But that came later" closes correctly.

**Para 14 (the hatchet / false accusation) — no issues.**

Checked clause by clause against the dense source: rehearsing by heart at midday in the marketplace; God's stated reason (that he who was to be so great a man should learn not to condemn a man on rash credulity in judging cases); the real thief is a young lawyer; the hatchet brought in secretly, unnoticed by Alypius; the lead gratings fencing the silversmiths' shops; the noise heard; the silversmiths below raising the alarm and sending men to seize *whoever they could find*; the thief fleeing and abandoning the hatchet for fear of being caught with it; Alypius not having seen him enter but seeing him go and how fast; his curiosity; finding the hatchet and standing there turning it over; the sent men finding him alone holding it; the seizure, the crowd gathered, the boast of having caught a notorious thief, and the march toward the judge. Nothing dropped, nothing added, no clause reordered in a way that changes causation.

**Para 15 — 2 findings (1 moderate, 1 minor)**

- **F20 (MODERATE — garbled restructuring / merged subjects).**
  **Source:** "Thus the crime being transferred to that house, and the multitude ashamed, which had begun to insult over Alypius, **he** who was to be a dispenser of Thy Word, and an examiner of many causes in Thy Church, **went away better experienced and instructed**."
  **Candidate:** "So the crime was traced back to that house, and the crowd, ashamed of having jeered at Alypius, **and** he who was one day to be a steward of your word and an examiner of many cases in your church, **went away** with better experience and better instruction."

  The candidate's "and" joins "the crowd" to "he who was one day to be a steward" as co-subjects of "went away", which (a) is ungrammatical as written and (b) states that the crowd, too, went away better experienced and instructed. In the source, the crowd's shame is an absolute construction; **only Alypius** goes away better instructed. The sentence as it stands is the one genuinely broken sentence in the candidate and will read as an error to any attentive reader.

  **Proposed correction:** "So the crime was traced back to that house, and the crowd that had begun to jeer at Alypius was put to shame; and he who was one day to be a steward of your word and an examiner of many cases in your church went away with better experience and better instruction."

- **F21 (minor, broken echo).** Source opens "But thus far was Alypius to be **instructed**" and closes "went away better experienced and **instructed**". Candidate opens "But this was only how far Alypius was meant to be **tested**", breaking the deliberate frame. "Tested" also misstates the point: God permitted the episode to *teach* him about judging cases, which the paragraph then says explicitly. **Proposed:** "But this was only how far Alypius was meant to be instructed."

Checked and correct: the architect's suspicion direction ("they were used to being suspected **by him** of stealing goods lost from the marketplace" — correct; this is a natural inversion trap and was not inverted); the "as though to show him at last who had really been committing these thefts" irony; the ambiguity of who paid respects at the senator's house is **preserved**, not resolved; the boy's "Ours" and the double quotes around the exchange.

---

### Packet F — paragraphs 16–18  *(16 on the polarity list; 18 self-flagged dense)*

**Para 16 — 2 findings (both minor)**

- **F22 (minor, risks reversing an obligation).** Source: "a very powerful senator, **to whose favours many stood indebted**, many much feared." Candidate: "a very powerful senator, **to whom many owed favors** and whom many greatly feared." "Owed favors to X" most naturally reads in modern English as *they were obliged to render favors to him* — the reverse of the source, where they were indebted **for** favors he had done them. Ambiguous rather than flatly wrong, but it sits in the exact defect class under review and costs nothing to disambiguate. **Proposed:** "a very powerful senator, to whom many were indebted for favors and whom many greatly feared."

- **F23 (minor, addition).** Source: "There he had **thrice** sat as Assessor." Candidate: "There he had **already** sat three times as Assessor." "Already" is an added temporal gloss. Trivial; delete if convenient.

Polarity verified — **correct** on all four risk points in this paragraph:
1. "with an incorruptibility that amazed others, while he for his part was amazed that anyone could prefer gold to honesty" — the reciprocal amazement is not swapped.
2. Bribe scorned / threats trampled — both in the right direction.
3. The judge's manoeuvre: "put the matter off onto Alypius, claiming that Alypius would not allow him to do it — for in truth, had the judge granted it himself, Alypius would have ruled otherwise." Correct, and the candidate correctly disambiguates Pusey's pronoun tangle.
4. The Luke 16 conditionals: "if you have not been faithful with unrighteous wealth, who will entrust you with true riches? And if you have not been faithful with what belongs to another, who will give you what is your own?" Both conditionals in the correct direction, both question marks preserved. The Praetorian book-copying temptation and its resolution ("judging the fairness that stood in his way more valuable than the privilege that would have let him have his way") preserve the equity-over-power comparison correctly.

**Para 17 — 1 finding (minor)**

- **F24 (minor, overstatement).** Source: "yea and Carthage itself, **where he had much lived**." Candidate: "and Carthage itself, **where he had lived most of his life**." "Much lived" says he had spent a lot of time there; "most of his life" is a quantified claim the source does not make. **Proposed:** "and Carthage itself, where he had lived a great deal."

Checked and correct: everything Nebridius left behind (native region, Carthage, family estate and house, the mother who was not to follow); "for no other reason but that with me he might live in a most ardent search after truth and wisdom"; "like me he sighed, like me he wavered"; the three hungry mouths and "meat in due season"; the "How long will things be this way?" cry (1 question, preserved and quoted); and the closing clause "saying it, we did not abandon those pursuits, for as yet nothing certain had dawned that we might embrace instead, having let them go" — the trickiest syntax in the paragraph and rendered correctly.

**Para 18 (internal monologue, 10 questions) — 1 finding (minor).**

This was the drafter's top self-flagged risk and it holds up. All ten questions are present and each maps to a distinct source question, in order: *where should it be sought, and when* / *where will we even find the books* / *where, or when, would we get them* / *from whom would we borrow them* / *do we still hesitate to 'knock'* / *what do we do with the rest of the day* / *why not this* / *when do we pay court to our powerful friends* / *when do we compose what we can sell to students* / *when do we rest ourselves*. Every intervening assertion is present too: Faustus will come and clear everything up; the sardonic address to the Academics; "let us search all the more diligently, and not despair"; the church's books no longer absurd and open to a good sense; "I will take my stand where my parents placed me"; the fixing of set times and hours; and the full content of the "great hope has dawned" sentence, including the specific doctrinal point (educated Catholics hold it blasphemous to bound God by a human body). The nested single quotes around 'knock' and 'may be opened' inside the double-quoted monologue match the Book 5 accepted convention, and the open-quote that runs across into para 19 without closing mirrors the source exactly (source para 18 has 1 double quote, para 19 has 2; candidate matches).

- **F25 (minor, register).** Source: "**Perish every thing**, dismiss we these empty vanities…" (opening of para 19, but flagged with this packet as part of the same monologue). Candidate: "**To hell with everything** — let us dismiss these empty vanities…" *Pereant omnia* is a formal imperative wish, not profanity. "To hell with everything" introduces a coarse register Augustine does not use anywhere in this book, and it is odd in the mouth of a man about to argue for the authority of the Christian faith three sentences later. **Proposed:** "Let everything perish — let us dismiss these empty vanities…"

---

### Packet G — paragraphs 19–21

**Para 19 — 1 finding (minor)** *(F25 above belongs to this paragraph)*

- **F26 (minor, addition).** Source: "Then must this be ascertained." Candidate: "Then **this too** must be settled **first**." Both "too" and "first" are added. **Proposed:** "Then this must be settled."

All six questions present and correctly ordered. Checked and correct: the counterfactual "God would never have worked such great things for us **if** the life of the soul ended with the death of the body" (not inverted); the self-interrupting "But wait — even those worldly things are pleasant"; the shame of relapse; the governorship/dowry calculation including the pointed "a wife with some money, so she won't add to our expenses"; and the closing appeal to married men who studied wisdom.

**Para 20 — no issues.** The double negative — "from day to day I put off living in you, **while never once putting off dying daily in myself**" — is the trap in this paragraph and is correctly preserved. So are "Loving a happy life, I feared it in its true home, and sought it by fleeing from it", "unless wrapped in a woman's arms", "I gave no thought to the medicine of your mercy… since I had never tried it", and the continence quotation with its two conditions (inward groaning, settled faith casting care).

**Para 21 — 1 finding (minor)**

- **F27 (minor, weakened to an attempt).** Source: "Alypius indeed **kept me from marrying**." Candidate: "Alypius, for his part, **kept trying to keep me from marrying**." The Latin imperfect arguably supports a conative reading, and the candidate's choice is defensible against the actual outcome (Augustine did get engaged) — but Pusey states it flatly, and turning a statement into an attempt is a change in the claim, not just in the register. **Proposed:** "Alypius, for his part, kept me from marrying, arguing that…"

Checked and correct: Alypius's own purity and the qualifier that makes it remarkable (he had entered that course early but had not stuck in it, and felt remorse and revulsion); Augustine's counter-examples (married men who cherished wisdom, served God acceptably, kept and faithfully loved their friends); "dragged my chain along, **dreading to be freed of it**" (not softened); the wound rubbed raw; and the serpent speaking through Augustine's tongue into Alypius's path.

---

### Packet H — paragraphs 22–24  *(22 on the polarity list)*

**Para 22 — 1 finding (minor)**

- **F28 (minor, broken echo).** Source: "him, **an admiring wonder** was leading captive." Candidate: "he was being led captive by **an admiring curiosity**." *Admiratio* / "wonder" is the word the whole paragraph is built on — it appears four times before this line ("he wondered", "when I saw him wonder", "he ought not to wonder", "was amazed at my thraldom; and through that **amazement**"). The final clause is the payoff where that wonder becomes the thing that captures him. Swapping in "curiosity" (already used earlier for a different Latin word) breaks the chain. **Proposed:** "he was being led captive by an admiring wonder."

Polarity verified — **correct**: the causal chain runs amazement → desire to try → the trial itself → possible bondage, in that order, with "perhaps" preserved on the last step, plus "willing to strike a bargain with death" and "whoever loves danger will fall into it". The asymmetry in the closing comparison is also correct — Augustine held captive by appetite, Alypius being led captive by wonder (candidate does not swap these). The tangled defence in the opening sentence (Alypius's brief, barely-remembered experience vs. Augustine's long-standing habit, and the marriage-name argument) is untangled correctly without changing whose experience is which.

**Para 23 — 1 finding (minor)**

- **F29 (minor, addition).** Source: "her prayers, and Thy promises, were being fulfilled **in my faith**." Candidate: "…were being fulfilled **in my growing faith**." "Growing" is added. Small, but it nudges Monica's assessment toward a progress claim the source does not make. **Proposed:** delete "growing".

Checked and correct — and this paragraph contains the book's other great blunt line, which the candidate does **not** soften: "she daily begged you with heartfelt cries that you would reveal to her, through a vision, something about my future marriage; **you never would.**" Also correct: Monica's own discounting of the visions she did have, and the stated basis for it (a feeling she could not put into words that distinguished God's revelations from her own soul's dreams); the girl two years short of the proper age and the decision to wait. "I courted a girl, and was promised her" adds "a girl"/"her" to Pusey's bare "I wooed, I was promised", but it is licensed by the same paragraph's later "a maiden asked in marriage" — no finding.

**Para 24 — no issues.** The commune plan is complete: pooling whatever each could procure into one household; the explicit principle ("nothing would belong especially to any one of us, but the whole, drawn together from everyone, would belong as a whole to each, and everything to everyone"); roughly ten members; Romanianus named with his three attributes (townsman, childhood friend, brought to court by his troubles) plus his eagerness and the reason his voice carried weight; the two annually-chosen officers; the wives question as the thing that broke it; "fell apart in our hands, and was utterly shattered and cast aside"; and the closing turn to sighs, the broad beaten way, and "many plans were in our hearts, but your counsel stands forever." The candidate correctly reads Pusey's typo "some often persons" as "some ten persons".

---

### Packet I — paragraphs 25–27  *(25 and 26 on the polarity list)*

**Para 25 (dismissal of the concubine) — 2 findings (both minor). Emotional weight: PASS.**

The standing instruction here is that this must land at full weight, and it does. "torn and wounded and bleeding" is preserved verbatim. Her vow is preserved without editorial comment ("vowing to you never to know another man, leaving with me my son by her"). Augustine's self-indictment is preserved with its condescension intact rather than sanitised — "**unable even to imitate a mere woman in this**" — and, critically, **in the correct direction**: she is the moral exemplar and he falls short of her. The candidate does not flip this, does not soften "a mere woman" into something more palatable, and does not editorialise about the concubine's fate. The second liaison is stated as baldly as the source does: "not truly wanting marriage so much as enslaved to lust — I took another woman, though not as a wife."

- **F30 (minor, flattened image).** Source: "the disease of my soul might be kept up and carried on in its vigour, or even augmented, **into the dominion of marriage**." Candidate: "…all the way into **the state of marriage**." *Regnum* / "dominion" is the point — the disease is to be carried into marriage as into a kingdom it will rule. "State of marriage" is inert. **Proposed:** "…all the way into the dominion of marriage."

- **F31 (minor, lost medical logic).** Source: "after inflammation and most acute pain, **it mortified**, and my pains became less acute, but more desperate." Candidate: "after burning and the sharpest pain, **it festered**, and my pain grew less acute, but more hopeless." Mortification is *necrosis* — the tissue dies, which is exactly **why** the pain becomes less acute but the condition more desperate. A festering wound hurts more, not less, so the candidate's clause no longer explains itself. **Proposed:** "…after burning and the sharpest pain, it went dead, and my pain grew less acute, but more hopeless." (Or keep "mortified" — it is not an archaism in medical usage.)

**Para 26 — 1 finding (minor)**

- **F32 (minor, narrowed referent).** Source: "not knowing that great misery was involved **in this very thing**." Candidate: "not realizing that a great misery lay hidden **in this very question**." The source's "this very thing" refers to Augustine's whole condition (being sunk and blinded), not merely to the question he has just posed; "question" narrows it. **Proposed:** "not realizing that a great misery lay hidden in this very thing."

Polarity verified — **correct**: the Epicurus counterfactual survives intact as a counterfactual — "Epicurus **would have** won the prize in my judgment, **if I had not believed** that after death there remained a life for the soul, and places of reward and punishment according to what each person deserved — **which Epicurus refused to believe**." Not converted into a preference, not into a refutation. Also correct: the fear of death as the *only* thing holding him back from a deeper gulf; the friendship passage, including the concessive close "I loved these friends purely for themselves, and I felt that they loved me in return purely for myself."

**Para 27 — no issues.** The whole coda is present: the cry against crooked paths; the audacious/reckless soul hoping to gain something better by forsaking God; the turning on back, sides and belly with everything painful; "and only you are rest"; and the four-part closing quotation in double quotes, with all four clauses ("Run — I will carry you; yes, I will bring you all the way through; there too I will carry you").

---

## 2. Whole-chapter read (flow, voice, consistency, mechanics)

I read the candidate straight through, independently of the source, as a reader would.

**Voice.** Consistent and good. It holds a single register — plain modern English, unhurried, with enough syntactic reach to carry Augustine's periodic sentences without either shattering them into staccato or leaving them tangled. The direct address to God ("Lord", "you") is handled uniformly and never drifts into third person. The book's two registers — the analytical (paras 4–8, 11–12, 16) and the confessional-lyrical (1, 9, 25, 27) — are both audible and distinct, which is the harder thing.

**Flow.** The narrative spine reads cleanly end to end: Monica's arrival → her deference to Ambrose → Augustine's frustrated attempts to reach Ambrose → his intellectual thaw toward Catholic doctrine → Alypius's two formative episodes → Nebridius → the beggar → the monologue of delay → the commune plan → the engagement and the dismissal → the coda. The one place the prose actually trips is the final sentence of para 15 (F20), which is grammatically broken and stops the reader. That is the single most reader-visible defect in the chapter.

**Mechanics — all verified programmatically:**
- **Archaisms: zero.** Scanned for thou/thee/thy/thine/hath/doth/hast/wert/wouldest/shouldest/didst/unto/whilst/betwixt/perchance/ofttimes/fain/nay/yea/verily/thence/whither/wherein/whereof/therewith/quoth/loth/divers/methinks. No hits.
- **Quote style: conforms.** Straight double quotes throughout; **zero** curly/smart quotes; single quotes used only for nesting inside a double-quoted passage (para 18's 'knock' / 'may be opened'), which matches `book05-accepted.json` (14 double quotes, 0 curly, single quotes used for nesting in 3 paragraphs). The one paragraph with an odd double-quote count (18) is correct — the monologue's quote opens there and closes at the end of para 19, exactly as the source does it.
- **Technical/proper terms: consistent with the source and with Books 3–5.** Ambrose 5/5, Nebridius 3/3, Manichee(s) 4/4, Romanianus 1/1, Faustus 1/1, Epicurus 2/2, Assessor 2/2, Praetorian 1/1. Alypius 18 vs. 17 in source (one extra is a correct pronoun disambiguation in para 16, "claiming that **Alypius** would not allow him", which is an improvement on Pusey's ambiguous "he"). Circus 3 vs. 2 (the extra comes from rendering "Circensian races" as "chariot races" in one place and "Circus games" in another — acceptable and noted by the drafter). **Adeodatus** correctly does **not** appear: the source says only "my son by her", and the candidate does not insert the name. **catechumen** does not appear in either — correctly, it is not in Book 6's source.
- **Paragraph length:** every candidate paragraph falls between 0.85× and 1.25× the source word count. No paragraph is compressed or padded.

**Consistency niggles picked up on the straight read** (all already logged above as findings, listed here because they are the ones a reader would actually notice): "heart" rendered as "mind" once in para 3 while "heart" is used everywhere else (F7); "instructed"/"tested" breaking the para 15 frame (F21); "wonder" becoming "curiosity" at the payoff of para 22 (F28); and the tonal outlier "To hell with everything" in para 19 (F25).

**Risk-pattern sweep, summarised:**
1. *Flattened rhetorical questions* — none. Parity 31/31, per-paragraph, independently counted. One redistribution in para 9 (F16).
2. *Added interpretive connectives* — five small ones (F2, F5, F10, F23, F26, F29); none load-bearing.
3. *Dropped clauses in dense paragraphs* — one real drop (F4, "hatred of the truth"), one dropped qualifier (F14, "divers"). **Paras 13, 14 and 18 — the three densest — are clean.**
4. *Garbled restructuring* — one instance (F20, para 15).
5. *Direction inversions* — **one major (F15, para 9)**, one moderate subject swap (F18, para 12), one ambiguous-and-risky (F22, para 16). Notably, the major inversion is in a paragraph the drafter *did* polarity-check — they checked the "he was the happier" comparison and missed the relative clause two sentences earlier. The drafter's seven self-flagged polarity paragraphs (7, 9, 10, 16, 22, 25, 26) are otherwise clean on the specific points they checked.
6. *Technical terms* — consistent; no errors.
7. *Softened emotional content* — **none.** Both load-bearing passages (para 13 gladiator corruption, para 25 concubine dismissal) are at full weight, and the direction of the para 25 comparison (Augustine falls short of her) is correct.
8. *Quote style* — conforms to the Book 5 convention; two minor de-quotings noted (F3, F13).

**Note on the drafter's notes file.** The notes are substantially accurate and the paragraph-by-paragraph table is correct, but the stated total — "32 question marks in source, 32 in candidate", repeated in the self-assessment — is wrong. The correct total is **31/31**, and the notes' own table sums to 31. Parity still passes; the arithmetic in the summary does not. This is worth recording because the notes present that figure as the outcome of a programmatic check.

---

## 3. Summary verdict

**Finding counts by severity** (arithmetic double-checked: 1 + 3 + 28 = 32 findings across 32 numbered entries F1–F32, of which F3 is a no-change observation):

| Severity | Count | Findings |
|---|---|---|
| **Major** | **1** | F15 (para 9) |
| **Moderate** | **3** | F4 (para 2), F18 (para 12), F20 (para 15) |
| **Minor** | **28** | F1, F2, F3, F5, F6, F7, F8, F9, F10, F11, F12, F13, F14, F16, F17, F19, F21, F22, F23, F24, F25, F26, F27, F28, F29, F30, F31, F32 |
| **Total** | **32** | |

Paragraphs with no findings at all: **11, 13, 14, 20, 24, 27** — including both of the densest narrative paragraphs (13, 14).

**Verdict: ACCEPT AFTER CORRECTION.**

This is the strongest candidate in the repair sequence so far. The structural gates all pass — 27/27 paragraphs, 31/31 question marks paragraph-by-paragraph, zero archaisms, zero curly quotes, consistent technical terms, every paragraph within 0.85–1.25× the source word count — and, most importantly, the two passages under standing instruction not to soften (Alypius's corruption at the games, the dismissal of the concubine) are rendered at full weight with their comparisons pointing the right way. Paragraphs 13, 14 and 18, the three the drafter flagged as highest-risk, are among the cleanest in the chapter.

But the defect class that has bitten this project in Books 4 and 5 has recurred once more, and it recurred inside a paragraph the drafter had explicitly polarity-checked: in para 9 the relative clause "who should never perchance attain it" is attached to the beggar instead of to Augustine and his friends, and the added word "himself" makes the error explicit. This reverses the paragraph's argument and must be fixed. Three moderate findings follow it — a dropped claim in para 2 ("hatred of the truth"), a subject/object swap in para 12, and one genuinely broken sentence at the end of para 15. **F15, F4, F18 and F20 are blocking; the 28 minor findings are recommended but not blocking,** with F7, F21, F25, F28, F30 and F31 the ones most worth taking since each restores a word the chapter is actually built on.
