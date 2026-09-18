# Book 10 — Independent Review, Part 1 (paragraphs 0–34)

Reviewer: independent (did not draft). Source of truth: `book10-source.json` (Pusey 1838).
Candidate: `book10-candidate.json`, sha256 verified `3c37ac38119e956c7b61dede2a39086c35c2a20dfa7813b4aa60ba12f6026795`.

## Structural check

- Source paragraphs: **70**. Candidate paragraphs: **70**. One-to-one, all strings, no empty entries.
- Top-level keys match (`number` = 10, `title` = "Book 10").
- Word-count ratio candidate/source across 0–34: min 1.02, max 1.17, median ~1.08. No paragraph shows the depressed ratio that signals a dropped clause; no paragraph shows runaway expansion.

## 1. Independent question-mark count, paragraphs 0–34

Counted mechanically, source vs candidate, per paragraph:

| ¶ | src | cand | | ¶ | src | cand | | ¶ | src | cand |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | 0 | | 12 | 1 | 1 | | 24 | 8 | 8 |
| 1 | 1 | 1 | | 13 | 0 | 0 | | 25 | 7 | 7 |
| 2 | 5 | 5 | | 14 | 4 | 4 | | 26 | 3 | 3 |
| 3 | 2 | 2 | | 15 | 0 | 0 | | 27 | 4 | 4 |
| 4 | 3 | 3 | | 16 | 6 | 6 | | 28 | 10 | 10 |
| 5 | 0 | 0 | | 17 | 0 | 0 | | 29 | 4 | 4 |
| 6 | 0 | 0 | | 18 | 0 | 0 | | 30 | 2 | 2 |
| 7 | 1 | 1 | | 19 | 0 | 0 | | 31 | 0 | 0 |
| 8 | 3 | 3 | | 20 | 3 | 3 | | 32 | 5 | 5 |
| 9 | 2 | 2 | | 21 | 3 | 3 | | 33 | 2 | 2 |
| 10 | 2 | 2 | | 22 | 3 | 3 | | 34 | 0 | 0 |
| 11 | 1 | 1 | | 23 | 6 | 6 | | | | |

**Range total: 91 / 91. Zero mismatches.** Whole-file total independently computed: **132 / 132, zero mismatches across all 70 paragraphs.** The drafter's parity claim is confirmed, including the self-caught fixes at ¶31 and ¶34 (both now 0/0, matching source).

Beyond raw count, spot-checked that the questions land on the same propositions: ¶23 (`Who now shall search out this? who shall comprehend how it is?`), ¶24 (all eight, including the `What third way is there?` hinge), ¶28 (all ten, including `is not a happy life what all will…?`), ¶33 (source's one enormous `unless…?` period is split into two questions but the count is preserved and the argumentative shape survives). No rhetorical question was flattened into a statement anywhere in 0–34.

## 2. Independent quote-style scan (whole file, all 70 paragraphs)

Character census of the candidate: only `"` (90 instances) and `'` (18 instances). No U+2018/2019/201C/201D anywhere. Every one of the 18 `'` occurrences was inspected in context: all are possessive/genitive apostrophes (`a man's conscience` ¶1, `other people's lives` ¶2, `someone else's word` ¶13, `someone else's mind` and `someone else's prompting` ¶16, `a spider's thread` ¶18, `health's sake` ¶43, `David's Psalter` / `the Church's` ¶49, `men's souls` ¶52, `my neighbor's` ¶60–61, etc.).

**Zero single-quote-as-quotation-mark defects. Convention matches `book09-accepted.json` (straight `"` only).** Drafter's claim confirmed independently.

Source itself uses 92 `"` vs candidate 90 — the delta is accounted for by ¶9 and ¶18 restructurings noted below and is not a style defect.

## 3. Archaism / technical-term scan

Regex sweep of the candidate for `thee|thou|thy|thine|hath|doth|saith|unto|whilst|betwixt|yea|nay|wilt|dost|shalt|perchance|fain|divers|slothful|ere`: **zero hits in the whole file.** Clean.

Technical terms in range 0–34 are used consistently:
- **memory** — never swapped for "mind" where source says memory, and vice versa. The ¶20 identification ("this very memory is itself mind") is rendered as an identification, not blurred.
- **image / the thing itself** — the load-bearing distinction of ¶11–22 is held rigorously. ¶15 "not images of the things, but the things themselves"; ¶16 "not images of them but the things themselves"; ¶22 "not their images but the numbers themselves"; ¶23/24 "not present to the memory in itself but through its image." Every instance points the same way as source.
- **happy life** — used uniformly for Pusey's "happy life"/"blessed life" from ¶28 onward; never drifts to "good life" or "blessedness."
- **Truth (capital) vs truth (lowercase)** — candidate follows source's own casing. ¶32 "joy in you, who are the Truth"; ¶33 "it is not hidden from the Truth, while the Truth is hidden from it"; ¶34 "wherever I found Truth, there I found my God, the Truth itself." Lowercase where source is lowercase (¶9 "the truth within", ¶32 "joy in the truth"). Consistent and correct.

---

## 4. Packet-by-packet findings

### Packet A — ¶0–2

**¶0 — no issues.** The chiastic sorrow clause (`the less to be sorrowed for, the more they are sorrowed for; and the more to be sorrowed for, the less men sorrow for them`) is the kind of construction that invites inversion; candidate renders it correctly as "the more they are grieved over the less they deserve it, and the less they are grieved over the more they deserve it." Polarity verified both limbs.

**¶1 — no issues.** Direction-sensitive claim `For I should hide Thee from me, not me from Thee` correctly preserved: "I would only be hiding you from myself, not myself from you." Also `blessest the godly, but first Thou justifieth him when ungodly` → "bless the godly, but you first justify the ungodly" — order of operations intact. `in sound, it is silent; in affection, it cries aloud` intact.

**¶2 — no issues.** `no man knows what is in man, but the spirit of man which is in him` correctly rendered. `charity believeth all things` → "love believes all things" with the parenthetical restriction preserved as an em-dash aside.

### Packet B — ¶3–5

**¶3 — minor.** Source: `that Thou mightest bless me in Thee`. Candidate: "so that you might make me happy in you." *Severity: minor.* "Bless" is the source's word; "make me happy" imports the *beatus* reading and pre-echoes the "happy life" vocabulary that only arrives at ¶28. Defensible but it is a lexical substitution not licensed by the source line. *Proposed correction:* "so that you might bless me in you."

**¶3 — otherwise clean.** `divers desire to know` → "many want to know" fine; `they wish it, as ready to believe--but will they know?` → "they want it, ready to believe me — but will they actually know?" preserves the skeptical turn and the question.

**¶4 — no issues.** The strange-children clause with `mouth talketh of vanity` / `right hand is a right hand of iniquity` is fully present; the approve/disapprove/loves-me triad is intact and not collapsed.

**¶5 — no issues.** `in over great peril, were not my soul subdued unto Thee` correctly kept as a counterfactual ("in too great a danger, if my soul were not subdued to you"). `But neither do I judge myself` → "But I do not judge myself either" — the concessive force is kept.

### Packet C — ¶6–8

**¶6 — no issues.** The epistemic asymmetry is the risk here and it holds: "although no one knows the things of a man except the spirit of the man that is in him, still there is something in a man which even the spirit of the man that is in him does not itself know." Correct. `Thou art in no ways passible` → "you cannot suffer or be changed" is a gloss, but an accurate one, and it is immediately contrasted with the speaker's own ignorance exactly as source does.

**¶7 — no issues.** The long *not-this-but-a-kind-of-this* movement (light/melody/fragrance/food/embrace) is complete; all five negations and all five affirmations present, and the five "where there shines / sounds / is a fragrance / a taste / a clinging" clauses each carry their correct negated limiter (space, time, breathing, eating, fullness). No pairing scrambled.

**¶8 — minor (addition).** Source opens `And what is this?`; candidate opens "And what is this that I love?" *Severity: minor.* The referent is supplied where source leaves it to carry over from ¶7. Harmless and arguably necessary in modern prose, but it is an added interpretive completion. *Proposed correction (optional):* leave as is, or "And what is this?"

**¶8 — minor (observation, no change recommended).** Source: `there present themselves to me soul, and body, one without, the other within` — Pusey's word order makes "soul" appear to pair with "without." Candidate reproduces the same ordering ("a soul and a body, one outward, the other inward") and then, five clauses later, correctly says "the better part is the inner one" (= the soul). *Severity: minor.* The candidate is faithful to source; the confusion is Pusey's. Flagging only so a later editor doesn't "fix" it in the wrong direction. If clarity is wanted: "one outward — the body — and the other inward."

**¶8 — otherwise clean.** All five interrogations of creation are present with correct respondents, Anaximenes intact, `the beams of mine eyes` → "the rays of my eyes" intact, `I the inner knew them; I, the mind, through the senses of my body` intact.

### Packet D — ¶9–11

**¶9 — minor (speaker/person shift inside a quotation).** Source: `This, their very nature saith to him that seeth them: "They are a mass; a mass is less in a part thereof than in the whole."` Candidate: `This their very nature tells anyone who looks at them: "We are a mass, and a mass is smaller in a part of itself than in the whole."` *Severity: minor.* The quoted content is switched from third person to first person, which changes who is speaking inside the quotation marks — in source it is *nature* reporting about the bodies; in candidate the bodies speak for themselves. The proposition is unchanged and the first-person form is consistent with the "We are not God, but he made us" chorus, but it is an unlicensed person-shift inside quoted matter. *Proposed correction:* `"They are a mass, and a mass is smaller in a part of itself than in the whole."`

**¶9 — otherwise clean.** The hard chain — animals see but cannot question; men can question; men who *love* created things become subject to them and subjects cannot judge — is fully present with polarity intact. `it is dumb to this, speaks to that; yea rather it speaks to all; but they only understand, who compare its voice received from without, with the truth within` is rendered with the correction-of-self ("or rather, it speaks to all") preserved, and the from-outside/within pairing is not flipped.

**¶10 — no issues.** The two-stage ascent (life-power shared with horse and mule → sense-power also shared with horse and mule) is correct, and both "the horse and mule have this too" disclaimers land on the right power. The eye-not-hear / ear-not-see commissions are not crossed.

**¶11 — no issues.** All four behaviors of recalled items (instant, slow-fetched, rushing-in-crowds, orderly-in-sequence) present and distinct. `Is it perchance I?` preserved as a question with its quotation marks.

### Packet E — ¶12–14 *(memory passage — heightened scrutiny)*

**¶12 — minor (added pair-member).** Source lists `what is hard or soft; hot or cold; or rugged; heavy or light`. Candidate: "hard or soft, hot or cold, rough or smooth, heavy or light." *Severity: minor.* Source has only "rugged" without a paired opposite; candidate supplies "or smooth." *Proposed correction:* "hard or soft, hot or cold, or rough, heavy or light" — or accept as harmless regularization.

**¶12 — otherwise clean.** The crucial claim `Nor yet do the things themselves enter in; only the images of the things perceived are there in readiness` is exact. The two non-interference demonstrations (sounds do not disturb the reviewed visual image; colour-images do not interrupt when the ear's store is called) are both present, on the correct senses, and neither is inverted. Lilies/violets and honey/wine, smooth/rugged all correct with the "neither tasting nor touching, but only remembering" qualifier intact.

**¶13 — minor (nuance compression).** Source: `stored with the images of things so many and so great`. Candidate: "filled with the images of so many great things." *Severity: minor.* Two coordinate attributes (number *and* magnitude) collapse into one attributive adjective. *Proposed correction:* "filled with the images of things so many and so great."

**¶13 — otherwise clean.** The three inner utterances ("I will do this or that… and this or that will follow", the wish, the aversion) are all present as separate quoted exclamations, and the closing conditional (`nor would I speak of any thereof, were the images wanting`) keeps its direction: speech depends on images, not the reverse.

**¶14 — minor (redundant added clause).** Source: `and pass themselves by; nor wonder that when I spake of all these things, I did not see them with mine eyes`. Candidate: "and they pass by themselves without wondering; nor are they amazed that when I spoke of all these things just now…" *Severity: minor.* "without wondering" is added to the first limb, duplicating the wonder-verb that source places only in the second limb. Also "just now" is a small added temporal marker. *Proposed correction:* "and they pass themselves by; nor are they amazed that when I spoke of all these things, I was not seeing them with my eyes…"

**¶14 — direction checks pass.** `Therefore is the mind too strait to contain itself. And where should that be, which it containeth not of itself? Is it without it, and not within? how then doth it not comprehend itself?` → candidate keeps all three steps with the same polarity, including the "outside itself, and not within" horn of the dilemma. `Yet did not I by seeing draw them into myself… nor are they themselves with me, but their images only` — correct, not inverted. The "ocean which I *believe* to be" (as against the mountains/waves/rivers/stars which he *had seen*) is preserved, which is a detail easy to lose.

### Packet F — ¶15–17 *(memory passage — heightened scrutiny)*

**¶15 — no issues.** The pivotal claim `nor are they the images thereof, but the things themselves` is exact. All four disanalogies (sound fixed on the ear; smell evaporating; food tasteless in the belly yet tasting in memory; touch-object absent yet conceived) are present, in order, each with its correct qualifier, and the closing `For those things are not transmitted into the memory, but their images only` is not inverted. This is the hardest paragraph in the packet and it survives clause-by-clause collation.

**¶16 — minor (idiom shift, see ¶17 note).** No substantive defect. The paragraph's load-bearing paradox is rendered exactly right: `In my heart then they were, even before I learned them, but in my memory they were not` → "So they were in my heart even before I learned them, but not yet in my memory." Both limbs, correct polarity, correct location terms (heart yes / memory no). Then `Where then? or wherefore, when they were spoken, did I acknowledge them… unless that they were already in the memory, but so thrown back and buried…` — candidate keeps the "already in the memory" resolution and the buried-in-deeper-recesses qualification, so the apparent contradiction is presented as source presents it rather than smoothed away. The five sense-witnesses each keep their correct disclaiming condition (colour/sound/smell/flavour/size). Excellent work.

**¶17 — minor (manner→place drift).** Source: `not what is "collected" any how, but what is "recollected," i.e., brought together, in the mind`. Candidate: "not whatever is gathered *anywhere*, but what is gathered again — brought together — in the mind." *Severity: minor.* "any how" (in any manner) becomes "anywhere" (in any place). *Proposed correction:* "not whatever is gathered in just any way, but what is gathered again — brought together — in the mind."

**¶17 — otherwise clean.** The *cogo/cogito* etymology is intact with both analogies (`ago/agito`, `facio/factito`), the Latin is retained, and the glosses ("I gather" / "I gather again") are accurate. The definition of learning (things perceived within without images, already at random in memory, gathered into readiness) is complete and not reordered into something else.

### Packet G — ¶18–20 *(memory passage — heightened scrutiny)*

**¶18 — MODERATE (garbled restructuring; contrast collapses into self-contradiction).**
Source: `I have perceived also the numbers of the things with which we number all the senses of my body; but those numbers wherewith we number are different, nor are they the images of these, and therefore they indeed are.`
Candidate: `I have also perceived the numbers by which we count the things we sense with our bodies, but the numbers by which we count are different, and they are not images of those sensed things, and so they truly exist in their own right.`
*Severity: moderate.* Source draws a contrast between two things: (a) the numbers *of* sensed things, reached via the body, and (b) the numbers *by which we number*, which are different and are not images of (a). The candidate assigns the phrase "the numbers by which we count" to **both** sides of the contrast, so the sentence now reads "the numbers by which we count … are different [from the numbers by which we count]." As written it is incoherent — it is exactly the "plausible-sounding but not actually coherent" failure mode flagged in risk pattern #4. This is the only place in 0–34 where the restructured philosophical sentence does not track.
*Proposed correction:* "I have also perceived, through all the senses of my body, the numbers of the things we count; but the numbers by which we count are different, and they are not images of those, and therefore they truly are."
(Also note the small addition "in their own right" attached to `therefore they indeed are`; the proposed correction drops it.)

**¶18 — otherwise clean.** Greek/Latin sounds-versus-things argument intact; architects' lines intact with the correct claim that the intelligible lines are *not* images of the seen ones; `Let him who seeth them not, deride me… and I will pity him, while he derides me` intact including the simultaneity.

**¶19 — no issues.** The tower of nested memory-acts is fully preserved and correctly ordered: remembering the things → remembering how they were learned → remembering the false objections → remembering that the discrimination was made → distinguishing present discernment from remembered discernment → laying up present understanding so as to remember it later → "So then I also remember having remembered." No layer dropped, none transposed. The `though they be false, yet is it not false that I remember them` qualification is intact.

**¶20 — no issues.** Maximum-risk paragraph for inversion and it holds. `without rejoicing I remember myself to have joyed; and without sorrow do I recollect my past sorrow… Sometimes, on the contrary, with joy do I remember my fore-past sorrow, and with sorrow, joy` — all four crossings correct in the candidate, including the reversed pair. The belly-of-the-mind simile keeps the right terms (joy/sorrow = sweet/bitter food; stored but not tasted), and the closing double-negative judgment `Ridiculous it is to imagine these to be alike; and yet are they not utterly unlike` is not flattened to one side. The parenthetical evidence that memory *is* mind (the two idioms "keep it in mind" / "slipped out of my mind") is complete.

### Packet H — ¶21–23 *(memory passage — heightened scrutiny)*

**¶21 — no issues.** The four perturbations are listed in source order. The key asymmetry (I discuss them from memory yet am not disturbed by them; and they were there *before* recollection, which is why recollection can fetch them) is intact with correct causal direction. The cud simile and the rhetorical objection to it are both present. The final long alternative (`which the mind itself perceiving by the experience of its own passions, committed to the memory, or the memory of itself retained, without being committed unto it`) preserves *both* disjuncts, including the harder second one — a clause that would be very easy to drop.

**¶22 — no issues.** All six naming-cases present with the correct image/no-image verdict each time: stone and sun (images), bodily pain (image, thing absent), bodily health (thing present *and* image needed), the sick man (image retained though thing absent), the numbers we count with (things themselves, not images), the image of the sun (the image itself, not an image of an image). None of these verdicts is flipped. The closing turn to memory itself and its question is preserved.

**¶23 — no issues. This is the forgetfulness paradox and it is handled correctly.** Checked every step:
- `when I remember memory, memory itself is, through itself, present with itself` ✓
- `when I remember forgetfulness, there are present both memory and forgetfulness; memory whereby I remember, forgetfulness which I remember` ✓ (roles not swapped)
- `what is forgetfulness, but the privation of memory?` ✓
- `Present then it is, that we forget not, and being so, we forget` → "So it is present in order that we not forget, and being present in that way, we forget" ✓ — the paradox is stated as a paradox, not resolved away.
- The resolution `not present to the memory by itself but by its image: because if it were present by itself, it would not cause us to remember, but to forget` → "not present to the memory in itself but through its image — because if it were present in itself, it would cause us not to remember but to forget" ✓ **not inverted.** This is the single highest-risk polarity point in the whole range and the candidate gets it right.

One very small amplification: source `since when present I cannot remember` becomes "when, once present, it would prevent me from remembering at all." Directionally identical; noting it only for completeness, not counting it as a finding.

### Packet I — ¶24–26 *(memory passage — heightened scrutiny)*

**¶24 — no issues.** The dilemma is preserved with both horns in source order (is what I remember *not* in my memory? / is forgetfulness in memory precisely so that I not forget?) plus `Both were most absurd. What third way is there?` The image-theory objection is complete and its logic runs the right way: an image requires the thing's prior presence (Carthage, places, faces, bodily health/sickness as the supporting examples) → therefore forgetfulness must once have been present → but forgetfulness by its presence erases what is already recorded → therefore the image could not have been written. The self-undermining structure survives intact, and the closing concession (`yet certain am I that I remember forgetfulness itself also, whereby what we remember is effaced`) is not softened.

**¶25 — minor (referent supplied for an ambiguous "whence").**
Source: `desirous to arrive at Thee, whence Thou mayest be arrived at; and to cleave unto Thee, whence one may cleave unto Thee.`
Candidate: "longing to reach you, the one by whom you can be reached, and to cling to you, the one by whom one can cling to you."
*Severity: minor.* Pusey's `whence` denotes the *way/means* by which God is reached; the candidate converts it into an appositive identifying God himself as the means. The theological result is close and probably what Augustine means, but the candidate resolves an ambiguity the source leaves open. *Proposed correction:* "longing to reach you by the way in which you can be reached, and to cling to you by the way in which one can cling to you."

**¶25 — direction check passes.** `If I find Thee without my memory, then do I not retain Thee in my memory. And how shall I find Thee, if I remember Thee not?` → "If I find you outside my memory, then I do not hold you in my memory. And how shall I find you, if I do not remember you at all?" Correct on both limbs — this is precisely the in-memory/outside-memory axis flagged as inversion-prone, and it is not inverted. The threefold taxonomy of memory contents (images for bodies / actual presence for the arts / notions-and-impressions for affections) is complete with the right example attached to each, and the tricky trailing concessive (`while yet whatsoever is in the memory is also in the mind`) is kept.

**¶26 — no issues.** The lost-coin argument runs in the source's direction throughout: recognition requires memory, not the reverse. The distinction between something lost to sight but retained in memory is stated with the right pairing at the close (`But this was lost to the eyes, but retained in the memory` → "lost to the eyes, while it was kept in the memory"). `by chance` is dropped from "lost from the sight" — trivial, not counted.

### Packet J — ¶27–29

**¶27 — no issues.** The harder case — memory losing something — is fully tracked: search occurs *in memory*; rejection of wrong candidates; recognition on arrival; the "or was it that only part escaped, and the retained part hunted the lost part" alternative with the maimed-habit explanation; the forgotten-name illustration; the point that even a name supplied by another comes *from* one's own memory ("we do not take it in as something new"); and the conclusion `For we have not as yet utterly forgotten that, which we remember ourselves to have forgotten. What then we have utterly forgotten, though lost, we cannot even seek after.` Both of those final propositions are present with correct polarity. No step of the regress is dropped.

**¶28 — no issues.** Long and dense; collated clause by clause. All ten questions land on the right propositions. The blessed-in-hope hierarchy keeps its correct three-way ordering (have it in reality > have it in hope > happy in neither). The parenthetical deferral (`whether all severally, or in that man who first sinned… I now enquire not; but only, whether the happy life be in the memory?`) is preserved as a deferral rather than being answered. The Greek/Latin argument is intact including the reciprocal case (the Greek would be delighted if he heard it in Greek). `Known therefore it is to all` conclusion and its supporting universal-assent evidence both present.

**¶29 — MODERATE (altered conditional / added interpretive causation).**
Source: `(though indeed they would not be delighted but for some inward knowledge thereof, nor wish to be the like, unless they were thus delighted)`
Candidate: "though indeed they would not be delighted unless they had some inward knowledge of it, nor would they wish to be like it unless that delight came from something within"
*Severity: moderate.* The second conjunct of source's parenthesis is a plain conditional: they would not wish to *be like the eloquent men* unless they were **thus delighted** (i.e. delight is the condition of the wish). The candidate replaces the condition with "unless that delight came from something within" — a different proposition, which re-states the *first* conjunct instead of supplying the second. The two-step chain (inward knowledge → delight → wish to be like them) collapses into a one-step claim, and an unstated causal source is supplied. Additionally "be like it" mis-targets the referent: source's `the like` means *like those eloquent people*, not like eloquence.
*Proposed correction:* "though indeed they would not be delighted unless they had some inward knowledge of it, nor would they wish to be like them unless they were so delighted"

**¶29 — otherwise clean.** The four-stage elimination (Carthage-style? no / numbers? no / eloquence? no / joy? perhaps) keeps all four verdicts correct, and the reason attached to each is the source's reason. The numbers disanalogy is correct and direction-sensitive: one who has numbers in knowledge does *not* seek further, whereas the happy life is in knowledge *and* still sought — candidate has this right. The closing sadness-recalling-former-joy / joy-recalling-former-sorrow pairing is not crossed.

### Packet K — ¶30–32

**¶30 — no issues.** The two-men-and-the-war argument is preserved exactly, including the point that *both* choices are made for the sake of happiness. The proposed reconciliation (all agree in wanting joy though they seek it in different things) is kept as a question ("Is it, perhaps, that…?") rather than being asserted, matching source.

**¶31 — minor (hedge added).** Source: `Yet is not their will turned away from some semblance of joy.` Candidate: "Yet even so, their will is not turned away *entirely* from some semblance of joy." *Severity: minor.* "entirely" is an added quantifier that weakens a flat claim into a partial one. *Proposed correction:* "Yet their will is not turned away from some semblance of joy."

**¶31 — otherwise clean.** `to rejoice to Thee, of Thee, for Thee` is preserved as the full triple ("to rejoice toward you, of you, for you"), and the exclusive claim `this is it, and there is no other` is not softened.

**¶32 — minor (referent supplied).** Source: `because they are more strongly taken up with other things which have more power to make them miserable, than that which they so faintly remember to make them happy.` Candidate: "…than *the truth* they so faintly remember has power to make them happy." *Severity: minor.* Source leaves the comparatum as an unnamed "that which"; candidate names it as the truth. Almost certainly the right referent, but it is a supplied resolution. *Proposed correction:* "…than that which they so faintly remember has power to make them happy."

**¶32 — otherwise clean and correctly polarized.** The opening reversal (`It is not certain then that all wish to be happy…`) is kept as a genuine retraction of the preceding paragraph, not smoothed into agreement. `I have met with many that would deceive; who would be deceived, no one` is correct and not inverted (candidate adds "others"/"deceived" targets, which is clarifying and accurate). The chain love-happy-life → love-truth → must have notice of truth in memory runs in the source's direction.

### Packet L — ¶33–34

**¶33 — no issues.** Source's single vast `unless…?` period is split into two sentences, but the question count is preserved (2/2) and the argument is not re-pointed. The four crucial polarity pairs are all correct:
- `They love truth when she enlightens, they hate her when she reproves` ✓
- `since they would not be deceived, and would deceive` ✓ (both limbs, correct subjects)
- `they love her when she discovers herself unto them, and hate her when she discovers them` ✓ — the reveals-itself / reveals-them distinction is exactly the sort that inverts, and it does not.
- `they who would not be made manifest by her, she both against their will makes manifest, and herself becometh not manifest unto them` ✓
- `itself should not be hidden from the Truth; but the Truth is hid from it` → "it is not hidden from the Truth, while the Truth is hidden from it" ✓ — the retribution runs the correct way.
Also correct: `wish to be hidden, but that aught should be hidden from it, it wills not`, and the closing `it had rather joy in truths than in falsehoods` concession before the future-happiness clause.

**¶34 — no issues.** `I have not found Thee, without it` → "I have not found you outside of it" ✓ (the in-memory claim is not inverted — note this is the payoff of the ¶25 question, and the two paragraphs are consistent with each other in the candidate as they are in source). The Truth/God identification and the "you have lived in my memory" conclusion are both faithful. `having regard to my poverty` → "looking upon my poverty" ✓.

Small note: source `For where I found Truth, there found I my God` becomes "For *wherever* I found Truth" — generalizes a locative to a universal. Below the threshold for a finding; mentioning for completeness.

---

## 5. Dedicated memory-passage assessment (¶13–30)

The drafter flagged ¶13–30 (memory-of-memory) and ¶24–29 (forgetfulness paradox) as the highest-risk stretch. Having collated these clause by clause against source, my assessment is that **the drafter's caution paid off: this is the strongest part of the submission.** Specifically:

- **The image/thing-itself axis never slips.** Across ¶11, 12, 15, 16, 18, 22, 23, 24, 25 — nine paragraphs that each turn on whether memory holds an image or the thing — every verdict matches source. Not one is flipped. Given that this exact axis is where Book 5 and Book 8 produced inversions, that is the single most important result in this review.
- **The forgetfulness paradox (¶23–24) is intact as a paradox.** Both places where a translator would be tempted to "fix" Augustine's apparent contradiction — ¶23 "present so that we not forget, and by being present, we forget" and ¶24 "both would be utterly absurd; what third possibility is there?" — retain the contradiction. The candidate does not supply a resolution Augustine withholds.
- **The in-memory / outside-memory question (¶25, ¶34) is handled consistently across a nine-paragraph gap.** ¶25 poses "if I find you outside my memory, then I do not hold you in my memory"; ¶34 answers "I have not found you outside of it… you have lived in my memory." Both directions correct, and correct *relative to each other*. Note that the further move — God found *above* memory — falls in the second reviewer's range (¶35+); part 1 correctly does not anticipate it.
- **Nested recursion (¶19, ¶22) survives.** "I remember having remembered," and "I do not call up the image of its image" — both preserve the exact number of levels.
- **Long-sentence integrity.** The four disanalogies of ¶15, the five sense-witnesses of ¶16, the six naming-cases of ¶22, the threefold taxonomy of ¶25, and the double disjunct at the end of ¶21 are all complete. No dropped clause was found anywhere in 0–34; the word-count ratios corroborate this (nothing below 1.02).
- **The one real defect in the memory range is ¶18**, where the numbers contrast collapses on itself. It is a coherence failure rather than a fidelity inversion, but it needs fixing because as published the sentence contradicts itself.

## 6. Straight read-through, ¶0–34 (flow / voice / argumentative tracking)

Read continuously without the source. The argument tracks: confession and its fruit (0–5) → what I know and don't know of myself (6) → what do I love when I love God (7) → interrogation of creation (8–9) → ascent past life-power and sense-power (10) → entry into memory (11–14) → the liberal arts as things, not images (15–18) → memory of understanding and of memory (19) → memory of the affections (20–21) → naming and images (22) → forgetfulness (23–24) → the resolve to pass beyond memory (25) → how one seeks what is lost (26–27) → the happy life everyone wants (28–30) → joy in you alone (31–32) → truth hated because it convicts (33) → I did not find you outside memory (34).

Each hinge is genuinely a hinge in the candidate, not a non-sequitur papered over with a connective. Two stylistic observations, neither a finding: the candidate is consistently ~8% longer than source, mostly through em-dash asides that unpack Pusey's compressions, and it favors "look —" for Pusey's "behold." Both read naturally and are consistent with the accepted Books 3–9 voice. Register is uniformly modern with zero archaism. The ¶18 sentence is the only place where a reader following the argument would stop and re-read because the prose contradicts itself.

## 7. Verdict

| Severity | Count | Paragraphs |
|---|---|---|
| Major | **0** | — |
| Moderate | **2** | 18, 29 |
| Minor | **9** | 3, 8, 9, 12, 13, 14, 17, 25, 31, 32 (¶8 carries one counted finding plus one no-change observation) |

Counted minors: ¶3 (bless→make happy), ¶8 (added "that I love"), ¶9 (person shift inside quotation), ¶12 (added "or smooth"), ¶13 ("so many and so great" compressed), ¶14 (redundant "without wondering"), ¶17 ("any how"→"anywhere"), ¶25 ("whence" given a personal referent), ¶31 (added "entirely"), ¶32 (referent "the truth" supplied). That is 10 items across 10 paragraphs; ¶8 also carries a no-change observation about Pusey's soul/body ordering.

**Recommendation: ACCEPT AFTER CORRECTION.** Fix ¶18 (required — the published sentence contradicts itself) and ¶29 (required — the conditional is altered and the referent mis-targeted). The ten minor items are worth applying as a batch but none of them would mislead a reader about Augustine's argument.

**Checks passed:** question-mark parity 91/91 in range and 132/132 file-wide, independently computed; zero single-quote-as-quotation defects file-wide, independently scanned; zero archaisms file-wide; 70/70 paragraph alignment; no dropped clauses detected in 0–34; technical terms (memory, image, happy life, Truth/truth) consistent.

**The dominant historical defect — direction inversion — was not found anywhere in ¶0–34.** Every high-risk polarity point was checked individually: ¶0 chiasm, ¶1 hide-you-from-me, ¶9 nature/mass and outside/within, ¶14 mind-contains-itself dilemma, ¶15 and ¶16 things-not-images, ¶16 in-heart-not-in-memory, ¶20 joy/sorrow crossings, ¶23 image-not-itself, ¶25 and ¶34 outside-memory, ¶29 numbers-versus-happy-life, ¶33 reveals-itself/reveals-them and hidden-from-Truth. All correct.
