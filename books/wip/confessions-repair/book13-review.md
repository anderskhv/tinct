# Book 13 — Independent Adversarial Review

Reviewer: independent (did not draft).
Source of truth: `book13-source.json` (Pusey 1838), 53 paragraphs.
Candidate: `book13-candidate.json`, sha256 `fc900a522c54c9a11d077fc32d6d8a88f1aae59401563650d3f8f10f330feb4d` — **verified matching**.
Structure: 53 source paragraphs / 53 candidate paragraphs, **one-to-one confirmed**.

---

## 1. Independent punctuation counts (computed, not taken from drafter's notes)

Script: per-paragraph `p.count('?')` and `p.count('!')`, source vs candidate, exact.

**Question marks — 54 source / 54 candidate. Zero per-paragraph mismatches.**

| # | src ? | cand ? | | # | src ? | cand ? |
|---|---|---|---|---|---|---|
| 2 | 2 | 2 | | 23 | 1 | 1 |
| 3 | 2 | 2 | | 26 | 1 | 1 |
| 5 | 1 | 1 | | 32 | 1 | 1 |
| 7 | 3 | 3 | | 34 | 3 | 3 |
| 8 | 5 | 5 | | 35 | 3 | 3 |
| 10 | 3 | 3 | | 39 | 4 | 4 |
| 11 | 1 | 1 | | 40 | 3 | 3 |
| 12 | 5 | 5 | | 43 | 1 | 1 |
| 14 | 3 | 3 | | 45 | 2 | 2 |
| 15 | 4 | 4 | | 52 | 3 | 3 |
| 16 | 1 | 1 | | | | |
| 20 | 2 | 2 | | **Total** | **54** | **54** |

All other paragraphs: 0 / 0.

**Exclamation marks — 1 source / 1 candidate. Zero mismatches.**
The single "!" is in para 15 ("see, where Thou art!" → "See — there you are!"). Correctly sited.

**The drafter's parity claim is independently confirmed.** Notably, para 7 and para 43 both preserve Pusey's *odd* punctuation (an interrogative-shaped clause closed with a period) rather than normalizing it — parity was achieved honestly, not by adding or removing marks to hit a number. See Finding 7 for the fidelity cost this incurred in para 7.

**Dash style:** zero occurrences of `--` in the candidate. All dashes are em dashes `—`. Confirmed by literal substring scan.

**Quote style:** candidate contains 4 straight double quotes (`"`), 5 straight single quotes (`'`), and **zero** curly/typographic quotes. All 5 single quotes are possessive apostrophes (`man's` ×2, `men's` ×2, `world's` ×1) — **zero single-quote-as-quotation defects**, confirmed. The 4 double quotes are two quoted technical phrases: `"borne above"` (para 7) and `"multitude"` (para 36). Straight-quote style matches books 9/10/12 accepted files.

> **Notes inaccuracy (non-blocking):** the drafter's notes §6 state the quoted phrase pairs are in "para 7, para 16." They are in para 7 and **para 36**. Para 16 contains no quotes.

**Archaism scan:** clean. The only archaic-register survivor is "behold" (18 instances vs 25 in source), which is retained only inside or adjacent to scriptural citation, where it is standard modern Bible-English. No `thee/thou/thy/hath/doth/saith/unto/whilst/betwixt/whereof/spake`.

**Length ratios:** zero paragraphs fall below 0.75× or above 1.6× the source word count. No wholesale compression or inflation anywhere.

---

## 2. Packet-by-packet findings

### Packet A — paras 1–3 (creation owes God everything)

- **P1 — MINOR (2).** (a) "forgottest not me, forgetting Thee" → "did not forget me even as I, forgetting you, **was lost**." "Was lost" is not in the source; Augustine says only that he was forgetting. Proposed: "…and did not forget me even when I was forgetting you." (b) "out of Thy goodness" → "by your goodness **alone**". Added intensifier. Proposed: drop "alone".
- **P2 — no issues.** Long periodic sentence with the double parenthetical (spiritual-though-formless outranks corporeal-though-formed; corporeal-though-formless outranks nothing) is preserved intact and in the correct ranking direction.
- **P3 — no issues.** "we were sometimes darkness" → "were once darkness in that life" correct. "in Thy Only One" → "in your Only Son" is a standard, safe explicitation.

### Packet B — paras 4–6 (light as conversion; the Trinity glimpsed)

- **P4 — no issues.** Light = the spiritual creature's turning to God, owed to grace not merit. Direction correct.
- **P5 — MINOR.** "For those, on whom Thy good Spirit is said to rest, He causes to rest in Himself." → "…he causes to rest in himself **instead**." Added contrastive connective. Proposed: drop "instead".
  - The load-bearing clause is right: "borne over the waters, **not borne up by them**, as if He rested upon them" → "borne over the waters, not borne up by them, as if resting upon them." Grace acts *on* the waters; the waters do not support it. **Direction confirmed.**
- **P6 — MINOR.** "Lo, now the Trinity appears" → "Now the Trinity appears". The interjection "Lo" is dropped. Trivial but it is the hinge into the Trinity passage. Proposed: "Look — now the Trinity appears to me…".

### Packet C — paras 7–9 (why the Spirit is said to be "borne above")

- **P7 — MODERATE.** See **Finding 7** below. Pusey's tentative "Was it because it was meet that…" is rendered as a flat assertion, "**It was because** it was fitting that…". Augustine proposes a reason; the candidate states it as established.
  - Proposed correction (preserves the "?" count exactly, since the source clause ends in a period): "**Perhaps it was because** it was fitting that knowledge of him should be conveyed as being "borne above"; and this could not be said unless…"
- **P8 — MODERATE.** See **Finding 6**. Pusey uses "supereminent" three times in one paragraph, deliberately: the *supereminent knowledge* of Christ's love (Eph 3:19) → the Spirit *borne supereminent* above the waters → that *supereminent repose*. The candidate renders these "surpassing" / "supreme" / "supreme", severing the chain that *is* the argument (the same word links what we know, how the Spirit moves, and where we end).
  - Proposed: use one word in all three slots — "the **surpassing** knowledge of the love of Christ" / "he was borne, **surpassing all**, above the waters" / "that **surpassing** rest".
  - Otherwise this paragraph is excellent. The five stacked questions are kept halting and unsmoothed, exactly as the drafter claims; "we sink and rise" for "merged and emerge" is well judged.
- **P9 — no issues.** "ready for the whole spiritual creation" → "waiting for" is accurate.

### Packet D — paras 10–12 (why only the Spirit; weight and love; the three in us)

- **P10 — MINOR (2).** (a) "We ascend **Thy** ways that be in our heart" → "We climb **the ascents** that are in our heart." The possessive "your" is dropped, removing the God-reference from the Psalm allusion. Proposed: "We climb **your** ascents that are in our heart." (b) "We are inflamed, by Thy Gift we are kindled" is merged into "We are set aflame by your gift, and kindled" — the source's two separate predicates become one. Low impact.
  - Opening question: source "But was not either the Father, or the Son, borne above the waters?" → candidate "But was neither the Father nor the Son borne above the waters?" The polarity is inverted in form but the rhetorical setup and the answer that follows are identical in both. **Assessed and cleared — not a finding.**
  - The weight/love physics (fire up, stone down, oil above water, water below oil) is exactly ordered, with no swap. **Direction confirmed.**
- **P11 — no issues.**
- **P12 — no issues.** Be / know / will triad preserved in order, all five questions intact, and the closing triple question retains its three-beat cadence.

### Packet E — paras 13–15 (heaven/earth = spiritual/carnal people of the Church)

- **P13 — no issues.** "God make heaven and earth, namely, the spiritual and carnal people of His Church" → "heaven and earth — namely, the spiritual and the carnal people of his Church." **Direction confirmed: heaven = spiritual people, earth = carnal people. Not reversed.**
- **P14 — MINOR.** "having now the first-fruits of the Spirit **laid up with Him**" → "already has the firstfruits of the Spirit **stored up within him**." The source's referent is God/Christ; the candidate relocates the firstfruits into the friend of the Bridegroom. Proposed: "though he already has the firstfruits of the Spirit laid up with him" (keeping the ambiguity Pusey has, rather than resolving it inward).
  - Otherwise this very long paragraph is fully accounted for: no clause dropped across "friend of the Bridegroom / jealous for him, not for himself / voice of your waterspouts / serpent deceived Eve."
- **P15 — no issues.** The "!" lands correctly. "not the children of the night… which yet sometimes we were" is preserved with its concessive force. The division of light from darkness is explicitly reserved to God alone — "**you alone** divide; you, who test our hearts, and call the light day, and the darkness night" — **direction confirmed.**

### Packet F — paras 16–18 (the firmament = Scripture; waters above = angels)

- **P16 — MINOR.** "that solid firmament of authority, **in Thy discourses** set forth by them" → "that solid firmament of authority **in the discourses they set forth**." The possessive shifts the discourses from God's to the writers' — the reverse of the paragraph's point (their mortality *raises* the authority of what is *God's*). Proposed: "that solid firmament of authority in **your** discourses, set forth by them."
  - The core claim is right: authority **more** eminent *because* the writers died. **Direction confirmed — not lessened.**
- **P17 — no issues.**
- **P18 — MINOR.** "where they might gaze up and learn Thy mercy, **announcing** in time Thee Who madest times" → "…learn your mercy, **which announces** in time you who made the times." Pusey leaves the participle floating (it could attach to the people looking up); the candidate fixes it to "mercy". A small resolution of an ambiguity. Low impact; acceptable.
  - **Waters above = angels / "the supercelestial people", immortal, who need no reading; firmament set over "the infirmity of the lower people," who do.** Rendered "the people above the heavens" and "the weakness of the people below." **Direction confirmed — above/below not swapped, superiority correctly assigned to the waters above.**

### Packet G — paras 19–21 (sea = the embittered; dry land = the Church; fruit = works of mercy)

- **P19 — MINOR (2).** (a) "as it cannot **of itself** enlighten itself, so can it not **of itself** satisfy itself" — both "of itself" qualifiers dropped. (b) "For so is the fountain of life with Thee, **like as** in Thy light we shall see light" → "…**and** in your light we shall see light." The comparative "like as" becomes a flat conjunction. Low impact, but the source is drawing a likeness, not listing two facts.
- **P20 — MINOR.** "**Nor** is the bitterness of men's wills… called sea, but the gathering together of the waters" → "**For** it is not the bitterness… that is called sea, but the gathering together of the waters." The candidate converts a continuation into a causal claim (risk pattern #3). Proposed: "**Nor** is it the bitterness of men's wills that is called sea, but…".
  - Substance is right: **sea = the gathered society of the embittered pursuing temporal happiness; dry land = the souls that thirst after God. Not swapped.**
- **P21 — no issues.** Herb yielding seed = relief of bodily need (the easy things); tree yielding fruit = protection of the wronged by strength of just judgment. **Direction confirmed, and the two are not transposed.**

### Packet H — para 22 (lights in the firmament — the longest paragraph)

- **P22 — MODERATE.** See **Finding 2 — the single most consequential finding in this review.** The candidate **silently emends the locked source.**
  - Source, verbatim: "For to one is given by the Spirit the word of wisdom, **as it were the lesser light**: **to another faith;** to another the gift with the light of perspicuous truth, as it were for the rule of the day. To another the word of knowledge by the same Spirit, as it were the lesser light: to another faith; …"
  - Candidate: "For to one is given, by the Spirit, the word of wisdom, **as it were the greater light**; to another, the gift accompanied by the light of clear truth, as it were for the rule of the day. To another, by the same Spirit, the word of knowledge, as it were the lesser light; to another faith; …"
  - Two departures: "lesser" → "**greater**" for the word of wisdom, and deletion of the **first** "to another faith."
  - **Assessment: the emendation is substantively correct and should be kept.** The Pusey line as it stands in the locked file is self-contradictory dittography (wisdom and knowledge both called "the lesser light"; "to another faith" printed twice), and the rest of the same paragraph proves the intended direction beyond doubt: knowledge and the sacraments "come short of that brightness of **wisdom**, which gladdens the forementioned **day**" and "are only for the rule of the **night**." Rendering Pusey's typo literally would have manufactured a genuine sun/moon direction inversion.
  - **The defect is the silence.** The drafter's notes and mapping table present "Sun (rule of the day) = the greater spiritual gift… wisdom" as *verified in para 22* without disclosing that the locked file says "lesser" at that point. A deviation from ground truth must be a recorded decision, not an invisible one. **Required action: keep the text, add the emendation to the corrections log/notes explicitly.**
- **P22 — MINOR (2).** (a) "those other **notices of gifts**" → "those other, **lesser** tokens of gifts." "Lesser" is an added evaluative word; the source establishes the inferiority in the following clause ("inasmuch as they come short of…") rather than by epithet. Proposed: drop "lesser". (b) "Thy most **prudent** servant" → "your **wisest** servant." In a paragraph whose entire argument turns on *sapientia* as a technical term, rendering *prudens* as "wisest" creates a link the source does not make. Proposed: "your most prudent servant."
  - Everything else holds: the paragraph is neither split nor merged; sun = day = the mature, moon and stars = night = the babe in Christ fed on milk. **Direction confirmed.** The "signs of times" chain (old things passed away / salvation nearer / night far gone) is complete.

### Packet I — paras 23–25 (the rich man; the preachers shine; sea brings forth sacraments)

- **P23 — no issues.** "judge the fatherless" → "defend the cause of the fatherless" is a safe reading of Isa 1:17. "Whence then so many thorns, if the earth be fruitful?" preserved as a question.
- **P24 — no issues.** "the light of the perfect… and the darkness of the little ones, though not despised" → "the light of the mature… from the darkness of the little ones, though not despised." **Light = the mature/spiritual; darkness = the little ones. Not reversed**, and the "though not despised" qualifier — which is what keeps this from being contemptuous — survives.
- **P25 — no issues.** **Sacraments = the moving creatures moved amid the waves of the world's temptations, consecrating the Gentiles; the voices of the messengers = the birds flying under the authority of the firmament of the Book. Direction confirmed, and sea-creatures/birds are not confused with land animals.** "in the open firmament" → "under the open firmament" follows the source's own gloss ("under which they were to fly") and is acceptable.

### Packet J — paras 26–28 (material works; living soul vs moving creature)

- **P26 — MINOR (2).** "knowledge is **substantial and defined**" → "knowledge is **fixed and unchanging**" (drifts from "substantial/determinate" toward a different predicate); "the **fastidiousness** of mortal senses" → "the **weariness** of mortal senses" (*fastidium* is squeamish distaste, not tiredness). Both low impact.
- **P27 — no issues.**
- **P28 — no issues, and this is the best-handled passage in the book.** The candidate holds the two categories rigorously apart: "not the moving creature that has life, but the living soul"; the faithful earth no longer needs baptism or signs, the sea-born still do; tongues are a sign "not to those who believe, but to those who do not believe"; the fish is taken out of the deep to feed the dry land; the bird, bred in the sea, is multiplied on the earth. **Every direction confirmed.**

### Packet K — paras 29–31 (beasts/cattle/serpents; man after God's image)

- **P29 — no issues.** Order verified element by element: *pride → wild beasts tamed; luxury/lust → cattle broken to the yoke; false name of knowledge/curiosity → serpents made harmless*, and the vice list that follows ("arrogance of pride, the pleasure of lust, the poison of curiosity") matches that order exactly. **No reordering, no cross-assignment.** The land-animals-as-the-soul's-rule-over-lower-passions mapping is correct and not inverted.
- **P30 — MINOR.** "good serpents, **not dangerous, to do hurt**, but wise to take heed" → "not dangerous **enough** to do harm, but wise **enough** to be watchful." "Enough" implies thwarted intent rather than a changed nature. Proposed: "not dangerous so as to do harm, but wise so as to be watchful."
- **P31 — no issues.** The "not after his kind / but after our image" contrast — the whole point of the paragraph, and the point most at risk of collapse — is fully kept, including both singular/plural pairs ("Let us make man" / "And God made man"; "After our likeness" / "After the image of God"). The renewed mind "does not need another man to direct him" — **direction confirmed.**

### Packet L — paras 32–33 (dominion and judgment; male and female) — *extra scrutiny*

- **P32 — no issues, and correctly restrained.** Verified against the source clause by clause:
  - "those who are spiritually **set over** others" = the directing leg; "those who are spiritually **subject** to those set over them" = the obeying leg. **Direction confirmed.**
  - "for it was **in this way** that you made man male and female" — the candidate does **not** assign "male = set over" or "female = subject." Augustine does not make that assignment here, and the candidate leaves it exactly as implicit as the source does. **The drafter's stated restraint is independently verified and is the right call.**
  - The neutralizing clause survives: "where, as far as the sex of the body goes, there is neither male nor female, because there is neither Jew nor Greek, neither slave nor free."
  - The *not-judged* list is intact and correctly negative: not the spiritual knowledge shining in the firmament, not the Book itself, not the secret division of spiritual from carnal, not the restless people of this world. **No item migrated to the judged side.**
- **P32 — MINOR.** "that distinction of spiritual and carnal men, **who** are known unto Thine eyes… and **have not as yet discovered themselves** unto us by works" → "that division… **which** is known to your eyes… and **which they** have not yet revealed to us." The relative pronoun shifts referent mid-sentence (division → people). Sense survives; grammar is untidy. Proposed: "…that division between spiritual and carnal people — people known to your eyes, our God, who have not yet revealed themselves to us by their works…".
- **P33 — MODERATE.** See **Finding 4**. "the day and the night, which Thou **calledst** before the foundation of the heaven" → "which you **called into being** before the foundation of the heaven." "Called into being" converts an act of *naming/electing* into an act of *creating*, and severs the deliberate echo of para 32's "hast divided and **called** them in secret, or ever the firmament was made" — which is precisely the sentence that makes the day/night division the *secret election*, the thing man may not judge. Proposed: "which you **called** before the foundation of the heaven."
- **P33 — MINOR.** "the living soul, living by the taming of the **affections**" → "of the **passions**." See Finding 5 (vocabulary consistency).
  - The judged list (sacraments in many waters; the Fish taken out of the deep; signs flying beneath the firmament; almsgiving as earth bearing fruit; the living soul's chastity and fasting) is complete and correctly assigned. **Direction confirmed.**

### Packet M — paras 34–36 ("increase and multiply") — *extra scrutiny*

- **P34 — no issues.** The whole elimination argument (why not light, firmament, stars, earth, sea? why not herbs, trees, beasts, serpents, which also breed?) is preserved without a single dropped item.
- **P35 — MINOR (3).** (a) The source marks the hypothetical objection with quotation marks — `"that it was idly said, and without meaning?"` — the candidate drops them ("That it was said idly, and without meaning?"). The capital "That" carries it, but the objection is now less clearly a *quoted* position being rejected. Low impact; consistent with the candidate's global choice not to mark quoted speech. (b) "O Father of **piety**" → "O Father of **holiness**" (*pietas* drifts). (c) "various kinds of **true senses**" → "various kinds of **true meaning**." The plural is the argument — *many* true senses. Proposed: "various kinds of true senses."
- **P36 — no issues on the critical point. The selective-allegory qualification survives fully intact.** Verified against source:
  - Literal leg: "not allegorically, but properly, then does the phrase increase and multiply agree unto all things that come of seed" → "not allegorically but literally, the phrase increase and multiply applies to everything that comes from seed." **Kept, not erased.**
  - Figurative leg: "But if we treat of the words as figuratively spoken (**which I rather suppose** to be the purpose of the Scripture…)" → "But if we take the words as spoken figuratively — **which I rather suppose** to be the intent of Scripture…". **Augustine's hedge — that this is his preference, not a proof — is preserved.**
  - The payoff is correct and undiluted: the blessing grants "a power and a capacity both to express in several ways what we understand as one thing, and to understand in several ways what we read as obscurely delivered in one" — i.e. **abundance of meaning, held alongside the literal sense, neither reading cancelling the other.**
  - The nine-item allegorical recapitulation list (heaven/earth, light/darkness, firmament, sea, dry land, herbs and trees, lights, living soul) is complete, in order, with each element attached to its correct referent. No transposition.
- **P36 — MINOR (2).** (a) "which doth not, surely, superfluously ascribe…" → "**since** it surely would not attach…" — a relative clause becomes an explicit causal. (b) "which are not moved but by several significations" → "**since** they are stirred only by their many meanings." Same pattern. Both are defensible English but both supply causation the source leaves as apposition (risk #3). Also (c): "affections formed unto temperance" → "**feelings** shaped into **self-control**" — see Finding 5.

### Packet N — paras 37–40 (works of mercy owed; gift vs fruit)

- **P37 — no issues.** Onesiphorus, the Macedonian brothers, and the barren trees at Paul's first defence are all present with their allegorical roles correct. Crucially: "unto the fishes and to the great whales, hast Thou not given them" is preserved — **the food is *not* given to the carnal/unbelieving. Direction confirmed.**
- **P38 — MODERATE.** See **Finding 3**. Source quotes Phil 4:10 as "…wherein ye were also careful, **but it had become wearisome unto you**." The candidate substitutes a different translation: "in which you were also concerned, **but had no opportunity**." The very next sentence in the candidate still reads "These Philippians had, **over a long weariness**, dried up and withered" — so the citation no longer supplies the weariness the argument immediately picks up, and the inference becomes a non sequitur. Proposed: restore "but it had become wearisome to you."
- **P39 — no issues.** All four questions land, and the parenthetical "(for to such creatures, is this food due;)" is folded inside the third question without changing the count. "Joy" as the one-word answer is kept as a one-word answer.
- **P40 — no issues.** The **gift** (the thing given: money, food, drink, clothing, shelter, help) vs **fruit** (the good and right will of the giver) pair is fixed, consistent, and never transposed — including in the Elijah illustration: **widow → fruit, raven → gift. Direction confirmed.**
- **P40 — MINOR.** "which might **also** for want of that food have perished" → "which might **otherwise** have perished for want of that food." Small connective substitution.

### Packet O — paras 41–44 (why the carnal neither feed nor are fed; "very good"; the objectors)

- **P41 — MINOR.** "neither do they feed these, nor are these fed by them" → "neither do they **truly** feed these, nor are these **truly** fed by them." Two added intensifiers. Proposed: drop both. The disambiguation of "the one"/"the other" into "the givers"/"the receivers" is a genuine readability gain and correctly assigned.
- **P42 — no issues.** The arithmetic (seven, and this is the eighth) is correct, and the aesthetic point — the whole more beautiful than the members singly, without the members ceasing to be beautiful — is complete.
- **P43 — no issues.** The source's nested quotation (double quotes containing single quotes) is resolved by dropping quotation marks entirely and marking the speaker with "crying out:". This is the right call — it is what keeps the file free of single-quote defects — and the shift into first-person divine speech happens at exactly the source's position, with no invented framing.
- **P44 — no issues.** The Manichean position is reported accurately and, importantly, still *as their position*, with "Frenzied are they who say thus" → "Those who say this are out of their minds" retained rather than softened.

### Packet P — para 45 (the three-way distinction) — *extra scrutiny*

- **P45 — MAJOR. Direction inversion, twice, on the same verb.** See **Finding 1**. This is the only major finding in the book.
- **P45 — otherwise strong.** The three legs of the distinction are all present, distinct, and in the source's order: (i) thinking what is good is bad; (ii) seeing that what is good is good, but enjoying the creature rather than God; (iii) God seeing in the man that it is good, i.e. God being loved in what he made. The third leg's closing move ("whatever exists, in whatever degree, is good… for it comes from him, who himself does not exist in some degree, but simply is what he is") is precise.

### Packet Q — paras 46–48 (the recapitulation; woman and man)

- **P46 — no issues on the critical mapping.** Verified clause by clause:
  - "one power which has dominion **by directing**, another **made subject, that it might obey**" → rendered exactly, in that order. **Direction confirmed.**
  - "who in the mind of her reasonable understanding should have **a parity of nature**" → "should have an **equal nature**." **The equality clause survives** — this is the clause most easily lost, and it is intact.
  - "but in the sex of her body, should be in like manner subject to the sex of her husband" → preserved with its restriction to bodily sex, not extended to mind.
  - The analogy tail ("as the appetite of doing is fain to conceive the skill of right-doing from the reason of the mind") is rendered without an added explanatory gloss, as the drafter claims. **Verified: no invented bridge.**
- **P46 — MINOR.** "is **fain to** conceive" → "**must** draw." *Fain* is desire/inclination; "must" is obligation. Proposed: "just as the appetite for acting **seeks to** draw the skill of right action from the reason of the mind."
- **P47 — no issues.** The concreation argument (matter from nothing, form from the formless matter, both together with no interval) is exact.
- **P48 — no issues on sequence.** The whole six-day recapitulation is re-walked in the correct order with every referent correctly attached: justifying the ungodly and dividing from the wicked → firmament of the Book between the teachable above and the subject below → gathering unbelievers into one conspiracy so the zeal of the faithful appears → works of mercy → lights kindled (the holy ones with the word of life) → sacraments, visible miracles and forms of words for initiating the Gentiles → the living soul of the faithful → the mind renewed after God's image, needing no human authority. **No element is displaced and no direction reversed.** "as the woman to the man" is kept where the source has it.
- **P48 — MINOR.** "through **affections** well ordered by the vigour of **continency**" → "through **feelings** brought into order by the strength of **self-control**." See Finding 5.

### Packet R — paras 49–53 (the Sabbath) — assessed separately in §4

- **P49 — MINOR.** "having finished their courses" (plural, of the many things) → "once it has run its course" (singular). Minor collapse of the plural.
- **P50, P51 — no issues.**
- **P52 — MINOR (2).** (a) "so, so shall it be received" → "so, **and only so**, shall it be received." An added intensifier in the book's final cadence, where the source's force comes from bare repetition. Proposed: "so, so shall it be received." (b) "knocked for **at Thee**" → "knocked for at **your door**." The source's triple preposition chain (of you / in you / at you) is broken by the added "door". Proposed: "knocked for at you."
- **P53 — no issues.** `GRATIAS TIBI DOMINE` preserved verbatim, untranslated. Correct.

---

## 3. Allegorical mapping table — independent verification

Each row was checked against the specific source sentence that makes the claim, not against the drafter's table.

| # | Creation element | Referent in candidate | Direction | Verified against |
|---|---|---|---|---|
| 1 | Spirit borne over the waters | Grace/charity preceding merit; acts **on** the waters, is **not** supported by them | ✅ correct | P5 "not borne up by them, as if resting upon them"; P8 |
| 2 | Let there be light / light | Beginning of spiritual conversion; the creature turning to God | ✅ correct | P4, P11, P13 |
| 3 | Darkness | The prior, unconverted state | ✅ correct, **not swapped** | P3, P13 "we were once darkness, but now we are light" |
| 4 | Heaven and earth (in the Church) | **Heaven = spiritual people; earth = carnal people** | ✅ correct, **not reversed** | P13 |
| 5 | Dividing light from darkness | Separating spiritually- from carnally-minded; reserved to God alone in this life | ✅ correct | P15 "you alone divide"; P22; P32 |
| 6 | Firmament stretched like a skin | Scripture's authority, **raised** by the writers' deaths | ✅ correct, **not lessened** | P16, P18 |
| 7 | Waters **above** the firmament | Angels / "the people above the heavens" — immortal, need no reading | ✅ correct, **above = superior** | P18 |
| 8 | Waters **below** the firmament | Mortals, "the weakness of the people below," who do need Scripture | ✅ correct, **not swapped with #7** | P18, P48 |
| 9 | Gathering of waters / the sea | The society of the embittered, unbelievers in one conspiracy | ✅ correct, **never the faithful** | P20, P48 |
| 10 | Dry land appearing | The visible Church; souls thirsting after God, separated from the sea's bitterness | ✅ correct | P20, P21, P28 |
| 11 | Herb yielding seed | Works of mercy in the easy things — relief of bodily need | ✅ correct | P21 |
| 12 | Tree yielding fruit | Works of mercy at cost — protecting the wronged by strength of just judgment | ✅ correct, **not transposed with #11** | P21 |
| 13 | Lights in the firmament | Spiritual gifts and the holy ones/teachers who hold them | ✅ correct | P22, P24, P48 |
| 14 | Sun / rule of the day | The greater gift — the word of wisdom, for the mature | ⚠️ correct **but rests on an emendation** — locked source reads "lesser light" here (Finding 2) | P22 |
| 15 | Moon and stars / rule of the night | Sacraments and the lesser enumerated gifts, for the babe in Christ fed on milk | ✅ correct, **night ≠ the mature** | P22 |
| 16 | Moving creatures from the waters | Sacraments, moved amid the waves of the world's temptations, consecrating the Gentiles | ✅ correct | P25, P27 |
| 17 | Birds flying under the firmament | Preaching / the messengers' voices, under the Book's authority; great whales = great miracles | ✅ correct, **not assigned to land animals** | P25, P33 |
| 18 | Earth bringing forth the **living soul** (not the moving creature) | The already-faithful, who no longer need baptism or signs | ✅ correct, **category kept distinct from #16** | P28 |
| 19 | Wild beasts tamed | Pride | ✅ correct, order matches the vice list exactly | P29 |
| 20 | Cattle broken to the yoke | Lust / luxury | ✅ correct | P29 |
| 21 | Serpents made harmless | Curiosity / the false name of knowledge | ✅ correct, **no cross-assignment among 19–21** | P29 |
| 22 | Land animals generally | The soul's rule over lower passions; reason's dominion | ✅ correct, **not the reverse** | P29, P30, P46 |
| 23 | Man after God's image (not "after his kind") | The mind renewed by direct relation to God, needing no human model | ✅ correct | P31 |
| 24 | Man's dominion | The spiritual man's power to judge — **explicitly excluding** the firmament, the secret day/night division, the Book, and the sea | ✅ correct, **exclusion list intact** | P32, P33 |
| 25 | Male and female | Those spiritually set over / those spiritually subject — left **implicit**, as the source leaves it; bodily sex explicitly neutralized here | ✅ correct, **and correctly not over-explicated** | P32 |
| 25b | Woman to man (bodily) | Directing power → husband; subject in bodily sex only → woman; **parity of nature in mind preserved** | ✅ correct, kept as a distinct later statement | P46, P48 |
| 26 | "Increase and multiply" | Abundance of meanings/true senses — **held alongside** the literal reading of seed-bearing generation, neither erasing the other | ✅ correct | P34–36 |
| 27 | Augustine's selective-allegory qualification | "If… not allegorically but literally… But if we take the words as figuratively spoken, **which I rather suppose**…" | ✅ **survives fully intact**, including the hedge | P36 |
| 28 | Food given (herbs, fruit trees) — **not** to fish and whales | Spiritual nourishment owed to those who minister doctrine; **not** to the carnal, who get miracles and sacraments instead | ✅ correct, **negative kept** | P37, P41 |
| 29 | Gift vs fruit | Gift = the thing given; fruit = the giver's good will (widow = fruit, raven = gift) | ✅ correct, never transposed | P40 |
| 30 | "Very good" (the eighth seeing) | The whole better than the parts singly — aesthetic/theological, not temporal | ✅ correct | P42 |
| 31 | The seventh day / Sabbath | The eternal rest of the redeemed, alone without evening | ✅ correct | P49–51 |

**Result: 31 of 31 mappings verified in the correct direction. Zero inversions in the allegorical scheme.** Book 13 joins Book 12 in breaking the Books 4/5/6/8/10 inversion streak *at the level of the allegory*. The one major direction inversion found (Finding 1) is not an allegorical mapping but a theological verb in para 45. Row 14 carries a disclosure defect, not a direction error.

---

## 4. Closing Sabbath meditation — dedicated assessment (paras 49–53)

This is the last page of the *Confessions*, and it has to carry the weight of thirteen books. It does.

**What is preserved:**
- The petition's shape in P49 — *give peace, for you have given us all things, the peace of rest, the peace of the Sabbath which has no evening* — keeps the three-beat apposition and the parenthesis. "which hath no evening" → "which has no evening" is exactly right; the whole meditation turns on the absence of that one word.
- The morning/evening motif is tracked consistently across P47 ("their own succession of morning and evening, partly hidden, partly visible"), P48 ("without morning or evening"), P49 ("for in them there was morning and evening") and P50 ("the seventh day has no evening"). The candidate never varies the phrasing, so the reader feels the pattern break at the seventh day. **This is the single most important thing in the passage and it is handled correctly.**
- P50's difficult double structure — God *rested* on the seventh day *although* he made everything in unbroken rest, and that resting is itself the Book's advance announcement of *our* rest — survives with both halves and the concessive intact.
- P51's paradox is undiluted: "you are always working, and always at rest… you do not see in time, nor are you moved in time, nor do you rest in a time; and yet you make the things that are seen in time, and the very times themselves, and the rest that comes from time." The three-fold negation followed by the three-fold affirmation is preserved beat for beat.
- P52's reversal — "we see these things that you made, because they exist; but they exist, because you see them" — lands cleanly, and the chiasmus is not smoothed away.
- The closing triple question ("what man can teach another man…? Or what angel, another angel? Or what angel, a man?") keeps its ellipsis rather than expanding the second and third into full clauses. Correct instinct.
- `GRATIAS TIBI DOMINE` is left untranslated, as it must be.

**Where weight is lost (both minor, both cheaply fixed):**
- P52's final cadence, "so, so shall it be received, so shall it be found, so shall it be opened," is the last sentence of the work before the Amen. The candidate's "so, **and only so**, shall it be received" breaks a four-beat drum into an explanation. The source is not arguing at this point; it is closing. **Remove "and only so."**
- "knocked for **at Thee**" → "at **your door**" concretizes the last of three prepositions that all point at the same word — *of you, in you, at you*. Restoring "at you" recovers the cadence at no cost to clarity.

**Verdict on the Sabbath meditation: not flattened.** It reads as contemplative address, not summary. With the two minor cadence restorations above it is fully at the level the passage demands.

---

## 5. Whole-chapter read (straight through)

Read end to end as a reader, not a checker.

**Voice.** Consistent throughout: second-person address to God sustained across all 53 paragraphs without slipping into third-person exposition, which is the failure mode this book invites (it is an exegesis, and it would be easy to let it become a commentary). The candidate keeps it prayer. The register is uniform from P1 to P52 — no drift into either casualness or pastiche.

**Argumentative coherence.** The book's spine holds: creation owes God everything (1–5) → the Trinity glimpsed (6–12) → the same creation re-read as the Church (13–33) → the digression on "increase and multiply" as abundance of meaning (34–36) → works of mercy and the gift/fruit distinction (37–41) → "very good" and God's seeing (42–45) → recapitulation (46–48) → Sabbath (49–52). A reader can follow each transition. The allegorical vocabulary is stable enough that when "firmament", "the deep", "dry land" and "living soul" recur twenty paragraphs later, they land as the same terms.

**Readability.** The long periodic sentences (P14, P22, P32, P36, P48) are the hardest in the book and the candidate manages them with em-dash parenthesis rather than by splitting — which is the right call, since the one-to-one rule forbids splitting and merging would be worse. P22 in particular strains but does not break. P28 and P40 read genuinely well.

**Weak spots on the straight read:**
1. **Vocabulary drift (Finding 5) is audible.** Reading straight through, "affections" (P8, P31) becoming "passions" (P33) and then "feelings" (P36, P48) makes the *same* recurring allegorical category sound like three different things at the three places where the reader most needs to recognize it as one. Same with the continence family across P29/30/36/37/39/48. This is the one systemic issue in an otherwise disciplined file.
2. **P8's "supereminent" chain** (Finding 6) — the loss registers as a missed connection rather than an error.
3. **P38's substituted Bible translation** (Finding 3) produces the only place in the book where a reader would stop and reread because the inference does not follow.
4. **P45's inverted verb** (Finding 1) produces the only place where a careful reader would be led to the wrong theology.

Nothing else in the read interrupts.

---

## 6. Findings summary

### MAJOR (1)

**Finding 1 — P45, direction inversion, twice.** Pusey: "and whatsoever things for Thy sake please, **Thou pleasest in them**" and, in the parenthesis, "as Thy creatures be pleasing unto many, because they be good, **whom yet Thou pleasest not in them**." In both, **God is the one who *is pleasing*** (Lat. *tu places in eis*). The candidate renders both with **God as the one who is *pleased***: "you are pleased by it in them" and "yet you are not pleased by them in those people."

Why it matters: the paragraph's middle leg is precisely that people can see a creature is good and enjoy it *while God is not what pleases them in it* — that is the difference between leg (ii) and leg (iii). Rendering it "you are not pleased by them" turns a statement about misdirected delight into a statement about divine disapproval, and the three-way distinction the drafter correctly worked to preserve collapses at its hinge. The candidate also mis-attaches the second one: "in those people" should be "in those creatures."

Proposed corrections:
- "…and whatever pleases for your sake, **it is you who are pleasing in them**; and whatever, through your Spirit, pleases us, pleases you in us." *(second clause is already correct — leave it)*
- "…as your creatures please many people because they are good, **yet you yourself are not what pleases them in those creatures**, when they prefer to enjoy the creatures rather than you…"

### MODERATE (6)

**Finding 2 — P22, undisclosed emendation of the locked source.** "lesser light" → "greater light" for the word of wisdom, plus deletion of one duplicated "to another faith." **The emendation is correct and should be kept** (Pusey's line as locked is self-contradictory dittography, and rendering it literally would create a real sun/moon inversion). **The defect is that it is silent** — the drafter's notes and mapping table present the emended reading as verified against the source. Required action: record it explicitly in the corrections log as a deliberate departure from ground truth, with the reasoning.

**Finding 3 — P38, substituted Bible translation breaks the argument.** "but it had become wearisome unto you" → "but had no opportunity," while the next sentence still argues from "over a long weariness… withered." Restore "but it had become wearisome to you."

**Finding 4 — P33, added creation gloss severs an allegorical link.** "which Thou calledst" → "which you called **into being**," breaking the echo of P32's "divided and called them in secret." Restore "which you called."

**Finding 5 — systemic, paras 8/29/30/31/33/36/37/39/48: inconsistent rendering of two technical chains.** *affectus*: "affections" (8, 31) / "passions" (33) / "feelings" (36, 48). *continentia*: "hold yourselves back" (29) / "self-controlled" (30) / "self-control" (36, 48) / "self-restraint" (37, 39). Both are cumulative allegorical categories ("the living soul, living by the taming of the affections") that the reader must recognize across twenty paragraphs. Fix: **"affections" everywhere** for the first chain; pick one of "self-control" or "self-restraint" for the second and use it in all five places, with "restrain yourselves" for the verb in P29.

**Finding 6 — P8, "supereminent" chain broken.** Three occurrences of one word rendered three ways ("surpassing" / "supreme" / "supreme"). Use one word in all three slots.

**Finding 7 — P7, tentative proposal hardened into assertion.** "Was it because it was meet that…" → "It was because it was fitting that…" The drafter disclosed this tradeoff and reasoned it from Pusey's odd punctuation, but the fix that satisfies *both* constraints is available at no cost to the "?" count: **"Perhaps it was because it was fitting that…"**

### MINOR (23)

P1 ×2 (added "was lost"; added "alone") · P5 (added "instead") · P6 (dropped "Lo") · P10 ×2 (dropped "your" before ascents; merged inflamed/kindled) · P14 (firstfruits relocated from God to the friend) · P16 (dropped "your" before discourses) · P18 (floating participle resolved) · P19 ×2 (dropped "of itself" ×2; "like as" → "and") · P20 ("Nor" → "For") · P22 ×2 (added "lesser"; "prudent" → "wisest") · P26 ×2 ("substantial and defined"; "fastidiousness" → "weariness") · P30 ("not dangerous enough") · P32 (relative-pronoun drift) · P35 ×3 (quotation marks dropped; "piety" → "holiness"; "true senses" → "true meaning") · P36 ×2 (two added causal "since") · P40 ("also" → "otherwise") · P41 (added "truly" ×2) · P46 ("is fain to" → "must") · P49 (plural → singular) · P52 ×2 (added "and only so"; "at Thee" → "at your door")

None of the minors changes a claim, a direction, or a sequence. Roughly half are added connectives or intensifiers (risk pattern #3) that should be trimmed on principle since they are the seed of the larger failures; the rest are small lexical drifts.

### Clean on the named risk patterns

| # | Pattern | Result |
|---|---|---|
| 1 | Flattened rhetorical questions | **Clean** — 54/54, independently counted |
| 2 | Flattened exclamations | **Clean** — 1/1, correctly sited |
| 3 | Added interpretive connectives | **9 minor instances + Finding 7** — the book's most frequent small fault, never load-bearing except in P7 |
| 4 | Dropped clauses | **Clean** except Finding 2 (deliberate, defensible) and Finding 3 (substitution, must be fixed). No accidental drops found on re-check of P8, P14, P22, P32, P35, P36, P37, P48 |
| 5 | Garbled restructuring | **Clean** — zero paragraphs merged, split, or reordered; sentence-count deltas all ≤3; no length ratio outside 0.75–1.6× |
| 6 | **Direction inversions** | **Clean across all 31 allegorical mappings.** One major inversion outside the allegory, at P45 (Finding 1) |
| 7 | Inconsistent allegorical vocabulary | **Finding 5** — the one systemic issue |
| 8 | Quote / dash style | **Clean** — zero `--`, zero curly quotes, zero single-quote-as-quotation, double quotes only |
| 9 | Sabbath meditation flattened | **Clean** — devotional weight intact; two minor cadence restorations recommended |

---

## 7. Verdict

**Finding counts: 1 major, 6 moderate, 23 minor.**

This is a strong candidate and the best allegorical handling in the repair sequence so far. The mapping directions — the thing this book could most easily get wrong, and the thing Books 4, 5, 6, 8 and 10 did get wrong — are **correct in all 31 checked cases**, including every one the brief named specifically: light to the spiritually-minded, waters above set over waters below, sea-creatures and birds to sacraments and preaching (not land animals), land animals to the soul's rule over lower passions (not the reverse), "increase and multiply" as abundance of meaning *held alongside* the literal sense, and Augustine's selective-allegory qualification surviving with its hedge intact. The male/female restraint in P32 is exactly right and was verified independently against the source, not accepted on the drafter's word.

The one major finding is a genuine direction inversion, but of a theological verb rather than an allegorical mapping: in P45 the candidate twice makes God the one who *is pleased* where Pusey has God as the one who *is pleasing*, which collapses the middle leg of the paragraph's three-way distinction. It must be fixed before acceptance.

The most consequential moderate finding is P22, where the candidate silently corrects a dittography in the locked source ("lesser" → "greater light" for the word of wisdom). The correction is right — rendering the locked text literally would have produced a real sun/moon inversion — but it must be disclosed and logged rather than absorbed invisibly into a mapping table that claims verification against the source.

**Recommendation: accept after correction.** Fix Finding 1 (P45) and Finding 3 (P38) as textual corrections; log Finding 2 (P22) as a disclosed emendation; apply Finding 4 (P33), Finding 5 (vocabulary, ~9 sites), Finding 6 (P8) and Finding 7 (P7); trim the added connectives and intensifiers among the minors, in particular P41's two "truly"s and P52's "and only so," which sits in the last sentence of the *Confessions*.
