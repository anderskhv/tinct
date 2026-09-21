# Fidelity Review 2 — *Meditations on First Philosophy* (Descartes)

**Round:** 2 of the accept/fix/reverify cycle. Re-verification of the round-2
repair pass against the 16 blocking defects raised by
`fidelity-review-1-ch1-5.md` (§2, 7 items) and `fidelity-review-1-ch5-9.md`
(§2, 9 items: B1–B9).
**Reviewer:** independent fidelity reviewer, working from the locked source,
not from the round-1 suggested wordings.
**Locked source (sole anchor):**
`books/wip/green-descartes-meditations/source.json` (Veitch English, 9
chapters). No Latin/French original and no other translation was used as a
standard.
**Candidate:** `books/wip/green-descartes-meditations/candidate.json`
(commit `b99f9f1d`, "round-2 fixes").
**Date:** 2026-09-21

---

## 1. Coverage

### 1.1 Structural re-check (run, not asserted)

| | Source | Candidate |
|---|---|---|
| Chapters | 9 | 9 |
| Paragraphs per chapter | 7 / 7 / 6 / 12 / 16 / 39 / 17 / 16 / 24 | 7 / 7 / 6 / 12 / 16 / 39 / 17 / 16 / 24 |
| Chapter titles | — | identical to source, all 9 |

Identical to the counts certified in round 1. Nothing merged, split,
reordered or dropped by the repair pass.

### 1.2 Blast-radius check of the round-2 edit

A paragraph-by-paragraph diff of `candidate.json` at `98914c97` (the
round-1 candidate) against `b99f9f1d` (the round-2 candidate) returns
**exactly 15 changed paragraphs and no others**:

```
C1 P5 · C4 P0 · C4 P4 · C5 P2 · C5 P5 · C5 P9 · C5 P11 ·
C6 P3 · C6 P15 · C6 P18 · C6 P29 · C7 P4 · C7 P7 · C9 P10 · C9 P20
```

That is precisely the declared change list. No paragraph outside the fix
list was silently touched, and no paragraph, chapter title or `sections`
entry was added or removed. Everything round 1 certified as sound is
therefore still byte-identical to the text round 1 read.

### 1.3 What was re-derived

All 15 changed paragraphs were re-read **in full, clause by clause, against
source.json**, not merely checked for the presence of the round-1 suggested
wording. Each was checked for: actors, negation, causality/connectives,
certainty and hedging, conditions and their scope, omissions, unlicensed
additions, silent corrections, and bracketed/parenthetical apparatus.
Chapter 9 ¶20 was additionally checked against the A/B/C/D illustration and
the referred-pain conclusion it supports.

Seven unchanged paragraphs were spot-checked against source to confirm they
remain as round 1 certified them: **C2 P3, C3 P2, C6 P14, C7 P14, C8 P7,
C9 P13, C9 P21**. All seven match round 1's findings exactly, including the
two known outstanding items in them (see §4).

---

## 2. Verification of the 16 round-1 blocking defects

### From `fidelity-review-1-ch1-5.md` §2

**2.1 — C5 P5 "how often / as often" — RESOLVED.**
Candidate now: "I am — I exist: this is certain; but how often? As often as
I think; for it might perhaps happen that, if I wholly ceased to think, I
should at the same time wholly cease to be." Source: "but how often? As
often as I think; for perhaps it would even happen…". The frequency reading
is restored, so the sentence again chimes with ¶3's "necessarily true each
time it is spoken by me." The silent correction is gone. Hedge ("perhaps",
"might") intact; conditional intact. No new distortion.

**2.2 — C4 P4 added universal "never" — RESOLVED.**
Candidate: "what happens in sleep is not as distinct as all this." Source:
"the occurrences in sleep are not so distinct as all this." The unlicensed
universal is gone, and the paragraph no longer contradicts its own
conclusion two sentences later ("there are no certain marks by which the
waking state can ever be distinguished from sleep"), which is itself
rendered with the negation and the scope of "ever" intact.

**2.3 — C5 P11 dropped negation — RESOLVED.**
Candidate: "But what is meant by flexible and movable? Is it not that I
imagine that the piece of wax, being round, is capable of becoming square,
or of passing from a square into a triangular shape? Surely not, because I
conceive that it admits of an infinity of similar changes…" The
interrogative negation matches the source, and the answer ("Surely not" for
"Assuredly such is not the case") still lands correctly. Re-derived the rest
of the paragraph: the infinity step, the "consequently… not the product of
the faculty of imagination" inference (rendered "So this conception I have
of the wax is not…"), the `[clearly and]` bracket, the `(mens, Lat.,
entendement, F.)` and `(inspectio)` glosses, and the "neither an act of
sight, of touch, nor of imagination" triple negation are all present and
correct.

**2.4 — C1 P5 hedge → assertion — RESOLVED.**
Candidate: "I will add that they are such as to lead me to think that there
is no way open to the human mind by which superior proofs could ever be
discovered." Matches the source's "to lead me to think"; the softening the
following apology apologises for is back. (One residual, non-blocking: see
§3.1.)

**2.5 — C4 P0 "opportunely" / duplicated "happily" — RESOLVED.**
Candidate: "Today, then, since I have conveniently freed my mind from all
cares [and am happily disturbed by no passions]…". "Conveniently" carries
*at a convenient moment*, which is what the preceding sentences about
waiting for the right age set up, and the stutter inside the editorial
bracket is gone. The bracket itself is intact and unaltered.

**2.6 — C5 P2 actor shift in the cogito — RESOLVED.**
Candidate: "was I not therefore also convinced that I did not exist? Far
from it: I certainly did exist, since I was persuaded of it." The implied
external convincer is gone; the state of being persuaded is again what
requires a subject. Re-derived the rest: "he can never bring it about that
I am nothing, so long as I am conscious that I am something" and the
`(pronunciatum)` gloss on "I am, I exist" are both intact, and the formula
still matches its other occurrence in C5 P5.

**2.7 — C5 P9 "Although…" fragment + dropped "in truth" — RESOLVED.**
Candidate now runs it as one sentence: "…than that I-know-not-what part of
myself which cannot be imagined; **yet, in truth, it may seem strange** to
say that I know and understand more distinctly things whose existence
appears doubtful to me … — in a word, more distinctly than I know myself."
The fragment is gone (the clause is now coordinated inside the sentence, not
standing alone), "in truth" is restored, and the concessive force of the
source's "although" survives in "yet". The comparison's three-part structure
("unknown to me… do not belong to me… than others… known to me… belong to
my own nature") is complete and correctly ordered.

### From `fidelity-review-1-ch5-9.md` §2

**B1 — C9 P20 cord/phantom-limb referent — RESOLVED. (See §2.1 below for the
detailed re-derivation.)**

**B2 — C6 P15 truncated "any other ground" — RESOLVED.**
Candidate: "…for, after the most careful search, I have so far been unable
to discover any other ground." The noun is back, so the claim is again
"no other route to proving other beings exist," not "no other being." The
preceding negation ("I shall have no sufficient ground for assurance that
any other being besides me exists") is also correct. (One residual,
non-blocking: see §3.2.)

**B3 — C6 P3 quotation closed mid-series — RESOLVED.**
Candidate: "'Let whoever can deceive me do so; he will never be able to
bring it about that I am not, so long as I am conscious that I am; **nor to
make it true at any future time** that I have never been, given that it is
now true that I am; **nor to make** two and three more or less than five' —
for in supposing such things and other like absurdities I find a manifest
contradiction." All three members are now inside the quotation and governed
by the single "will never be able to", which is the source's structure, and
all three read as things the deceiver *cannot* do. The parenthetical "it
being now true that I am" survives as "given that it is now true that I am".
(Two residual, non-blocking: see §3.3–3.4.)

**B4 — C6 P18 causal link severed — RESOLVED.**
Candidate: "**And since** ideas are, as it were, images — so that there can
be none that does not seem to us to represent some object — **the idea that
represents cold as something real and positive will not improperly be called
false**, if it is correct to say that cold is nothing but a privation of
heat; and so on in other cases." Premise and conclusion are back in one
sentence with the "since… therefore" intact; the source's double negative
("will not improperly be called false") is preserved rather than simplified
to "may be called false", and the conditional "if it is correct to say…"
retains its scope. The material/formal falsity distinction earlier in the
paragraph is unchanged and correct.

**B5 — C6 P29 added "than any other" — RESOLVED.**
Candidate: "Nor could I have denied to myself any property I perceive to be
contained in the idea of God, since none of these seems to me more difficult
to make or to acquire; and if there were any that did happen to be more
difficult, they would surely appear so to me (supposing I were myself the
source of the other things I possess), because I would discover in them a
limit to my power." The unlicensed comparison class is gone, and the
comparison again runs against the (already granted) feat of self-creation
set up two sentences earlier ("a matter of much higher difficulty that I, a
thinking being, should arise from nothing"). Both bracketed insertions in
the paragraph are intact.

**B6 — C7 P7 "negation" → "want" — RESOLVED.**
Candidate: "…is the lowest grade of liberty, and shows defect or **negation**
of knowledge rather than perfection of will." The scholastic pair is
restored at its first occurrence, and it now agrees with ¶14, which still
reads "it ought not to be called privation, but negation [according to the
signification of these words in the schools]" (verified in place). "Want"
remains the candidate's rendering of *privation* elsewhere, so the two terms
no longer cross-contaminate. Re-derived the rest of this very long
paragraph: the two causes of error, the `(percipio)` gloss, "freedom does
not require that I be equally indifferent toward each of two contraries",
"far from diminishing liberty, augment and fortify it", and the
will-greater-in-God-but-not-formally-greater concession are all present with
negations and scope intact.

**B7 — C7 P4 ungrammatical "to ought to possess" — RESOLVED.**
Candidate: "…but the privation, or want, of some knowledge **that, it would
seem, I ought to possess**." Grammatical, and the hedge now qualifies the
whole claim rather than Descartes' possession — which is the source's
scope. The preceding negation-vs-privation bracket is intact and, helpfully,
uses "absence" there rather than "want", keeping the pair distinct.

**B8 — C5 P5 "how often / as often"** — same defect as ch1–5 §2.1;
**RESOLVED** (above).

**B9 — C9 P10 dangling "correcting" — RESOLVED.**
Candidate: "…he has consequently permitted no falsity in my opinions **that**
he has not also given me a faculty of correcting…". "Correcting" has its
object back and the clause says what the faculty corrects. The double
negation ("no falsity… that he has not also given me a faculty of
correcting") is preserved exactly, and the causal "consequently" still
attaches to "God is no deceiver."

### 2.1 C9 P20 — the cord / phantom-limb argument, re-derived in full

This was the one round-1 defect that actually broke an argument, so it was
re-derived from the source rather than checked against the suggested fix.

- **Source:** "the nature of body is such that none of its parts can be
  moved by another part a little removed from the other, **which cannot
  likewise be moved in the same way by any one of the parts that lie between
  those two**, although the most remote part does not act at all."
- **Round-1 candidate (defective):** "…without **that intermediate part**
  being capable of being moved in the same way by any of the parts that lie
  between the two…" — attached the relative clause to the intervening part.
- **Round-2 candidate:** "no part of it can be moved by another part some
  distance away **without its being capable of being moved in just the same
  way by any of the parts lying between the two** — even though the most
  remote part does not act at all."

Re-derivation:

1. **Referent.** In "no part of it can be moved by another part some
   distance away without **its** being capable of being moved…", the
   possessive subject of the gerund attaches to the clause's subject, "no
   part of it" — i.e. the part that *gets* moved (A). That is the source's
   attachment: the relative "which cannot likewise be moved" modifies the
   part being moved, not the distant mover and not the intervening parts.
   The bad referent is gone.
2. **Logical form.** Source: *for no A, D is it the case that A is moved by
   distant D while A is not also movable in the same way by an intervening
   B or C.* Candidate: *no A can be moved by distant D without A being
   movable in just the same way by any of the parts between them.* These
   are the same proposition; the round-2 recast from a relative clause to a
   "without…" construction is a syntactic change only, not a logical one.
3. **Agreement with the illustration.** The very next sentence, unchanged in
   substance, reads: "if its last part D is pulled, the first part A will
   not be moved differently than it would be were one of the intermediate
   parts B or C to be pulled, while the last part D meanwhile remained
   fixed." This is exactly the claim the repaired premise now makes — A's
   motion is indifferent between a pull at D and a pull at B or C. Under the
   round-1 wording it was not. The repair and the illustration now agree.
4. **Agreement with the conclusion.** The nerve passage follows without
   change of sense: the nerves run foot → tibia → leg → loins → back → neck
   → brain; "although their extremities in the foot are not affected, but
   only certain of their parts that pass through the loins or neck, the same
   movements are nevertheless excited in the brain by this motion as would
   have been caused there by a hurt received in the foot. And so the mind
   will necessarily feel pain in the foot, just as if it had been hurt."
   Negations, the concessive "although", and the concluding "And so" (for
   the source's "hence") are all intact, and the conclusion now follows from
   the repaired premise.
5. **No new distortion.** "likewise / in the same way" survives as "in just
   the same way"; "although the most remote part does not act at all"
   survives as "even though the most remote part does not act at all"; the
   `[which is in tension]` bracket and the letters A, B, C, D are all
   present. Nothing was added.

**Verdict on B1: genuinely resolved, with no new distortion introduced.**
One optional clarity nit is recorded at §3.5 — it is a readability
suggestion, not a fidelity defect.

---

## 3. New observations on the changed paragraphs (all non-blocking)

Nothing here blocks acceptance. These are residuals that survived the repair
pass or small things the recast introduced; none changes an argument, an
actor, a negation or a condition.

1. **C1 P5 — dropped "for".** Source: "…can ever be discovered **for** the
   importance of the subject, and the glory of God … constrain me to speak
   here somewhat more freely of myself." The candidate ends the sentence and
   starts a new one: "The importance of the subject, and the glory of God to
   which all this relates, oblige me to speak here a little more freely about
   myself…". The causal connective is lost (the boast is *explained by* the
   importance of the subject). The sentence split pre-dates round 2; only the
   hedge was in scope. Optional fix: begin the new sentence with "For the
   importance of the subject…".
2. **C6 P15 — second condition demoted.** Source: "if the objective reality
   … be such as clearly to convince me, that this same reality exists in me
   neither formally nor eminently, **and if**, as follows from this, I myself
   cannot be the cause of it, it is a necessary consequence that…".
   Candidate: "…convince me clearly that this same reality exists in me
   neither formally nor eminently, **and that**, as follows from this, I
   myself cannot be the cause of it, **then** it follows necessarily…". The
   source's second *if*-clause becomes a second object of "convince me". The
   inference survives because "as follows from this" is retained and the
   second condition is entailed by the first, so nothing is lost logically —
   recorded because conditional structure is a checklist item.
3. **C6 P3 — "no one" narrowed to "he".** Source: "Deceive me who may, **no
   one** will yet ever be able to bring it about that I am not…". Candidate:
   "'Let whoever can deceive me do so; **he** will never be able to bring it
   about…". The universal quantifier becomes the deceiver specifically. This
   was the wording round 1 itself proposed for B3, and the source's own
   "Deceive me who may" makes the deceiver the salient subject, so the drift
   is slight — but it is a scope narrowing and should be on the record.
   "Yet" ("will *yet* ever be able") is also dropped.
4. **C6 P3 — added "for".** "…more or less than five' — **for** in supposing
   such things and other like absurdities I find a manifest contradiction."
   The source has a relative clause ("in supposing which…"), not a reason
   clause. The addition is what makes the sentence work once the series is
   closed, and it states the source's actual relation, so it is defensible;
   recorded as a licensed addition.
5. **C9 P20 — optional clarity nit on "its".** "…without **its** being
   capable of being moved…" is grammatically bound to the subject (A), which
   is correct, but the nearest preceding noun phrase is "another part some
   distance away" (D). A reader could momentarily mis-parse it. If the
   drafter wants belt-and-braces: "without **that first part's** also being
   capable of being moved in just the same way…". Fidelity is already
   correct either way; do not make this change if it risks disturbing the
   rest of the sentence.
6. **C5 P9 — word added inside an editorial bracket.** Source:
   "[which fall under the senses]"; candidate: "[**and** which fall under
   the senses]". Bracketed insertions are translator's apparatus; a
   connective added inside one is cosmetic but ideally stays outside the
   brackets.
7. **C5 P9 / C4 P0 — "opportunely" rendered two ways.** "Conveniently" in
   C4 P0 (the B-defect fix) and "at the right moment" in C5 P9. Both are
   correct in sense; a single rendering would read better.
8. **Round-1 non-blocking items that remain unfixed in the changed
   paragraphs.** Recorded so no one assumes the repair pass swept them:
   C4 P4 "I feel it" (source "I perceive it", ch1–5 §3.7); C5 P2 dropped
   "absolutely" (§3.17), "I know not **who**" for "I know not what being"
   (§3.18), and "supremely powerful/cunning" flattening "the highest power
   and the deepest cunning" (§3.11); C5 P5 "truly belongs to me" for
   "properly belongs" (§3.12); C4 P0 "anything firm and lasting" for
   "superstructure" (§3.19); C6 P18 dropped "For" opening the material-
   falsity sentence. All were non-blocking in round 1 and remain so.

---

## 4. Spot-check of unchanged paragraphs

Read against source and compared with what round 1 certified:

| Paragraph | Result |
|---|---|
| **C2 P3** | Materially/objectively distinction, the "much less that what is represented … exists" negation, and the forward reference to the Replies all intact. As certified. |
| **C3 P2** | Objective reality bracket `[i.e. participates by representation…]`, the `(i.e. representative)` gloss and the workman analogy all intact. The round-1 note that "either" is dropped from "either the science of the workman, or…" still stands (§3.3, non-blocking). |
| **C6 P14** | The causal principle's no-infinite-regress step, "archetype", and "can never contain anything greater or more perfect" all intact. As certified. |
| **C7 P14** | **S2 is still present**: source "I cannot therefore deny that it **is not** somehow a greater perfection in the universe"; candidate "…that it **is** somehow a greater perfection…". Unchanged by round 2 — correctly, since round 1 asked for it to be *recorded*, not edited. See §5. ¶14's "privation, but negation [according to the signification of these words in the schools]" verified in place, which is what B6 needed. |
| **C8 P7** | Mountain/valley disanalogy and the source's own "the equality of its three angles to two right angles" preserved without silent repair. As certified. |
| **C9 P13** | Sense-variety inference with its hedge ("although perhaps not in reality like them") and the body/mind-composite clause intact. As certified. |
| **C9 P21** | Still carries the round-1 §4.15 antecedent ambiguity ("among all the sensations **it is capable of producing**", where the nearest antecedent is now the mind). Non-blocking; unchanged, as expected. |

No drift found anywhere outside the fix list — which the §1.2 diff already
establishes mechanically.

---

## 5. Outstanding non-text requirement (not a defect in the candidate)

`fidelity-review-1-ch5-9.md` §6 item 3 requires that **S1–S7 be recorded as
explicit editorial decisions in the book's notes** — silent repairs the
candidate makes to a corrupt locked source (printer's errors at C7 P6 and
C8 P6, the broken clause at C7 P3, the `senses communis` typo at C9 P19,
`chiliogon`/`myriogon` normalization at C9 P1, the unclosed bracket at
C6 P24, and **S2 at C7 P14, which is a dropped negation**). All seven are
still present in the candidate, which is correct behaviour — they are good
repairs — but there is no notes file in
`books/wip/green-descartes-meditations/` recording them. Likewise,
`fidelity-review-1-ch1-5.md` §3.22 asks for an explicit policy decision on
the **unmodernized scripture quotations in C1 P2** (leave archaic, or
modernize), recorded either way because the question recurs in every book
with scriptural quotation.

Neither is a fidelity defect in the text. Both are disclosure/documentation
items that should be closed before the book is pinned, and S2 in particular
must not remain an invisible change.

---

## 6. Verdict

# ACCEPT AS-IS

All **16 round-1 blocking defects are resolved**, verified by re-derivation
from the locked source rather than by matching the suggested wording:

- ch1–5 §2.1–§2.7 (C5 P5, C4 P4, C5 P11, C1 P5, C4 P0, C5 P2, C5 P9) — 7/7.
- ch5–9 B1–B9 (C9 P20, C6 P15, C6 P3, C6 P18, C6 P29, C7 P7, C7 P4,
  C5 P5 [= §2.1], C9 P10) — 9/9.

**C9 P20, the one defect that actually broke an argument, is genuinely
fixed.** The relative clause is reattached to the part that gets moved, the
repaired premise now agrees with the A/B/C/D cord illustration and supports
the referred-pain/phantom-limb conclusion, and no new distortion was
introduced — negations, the concessive, the bracket and the letters all
survive.

No new blocking defect was introduced by the repair pass. The edit is
surgically scoped: exactly the 15 declared paragraphs changed and nothing
else, so the whole of the round-1 certified text is untouched. Structure is
unchanged (9 chapters; 7/7/6/12/16/39/17/16/24).

The §3 observations are non-blocking and may be swept in any later pass, or
left; none of them affects an argument.

### Ready for a final whole-book non-sampled pass?

**Yes.** This book is ready for the final whole-book, non-sampled read. The
two round-1 reviews between them read every paragraph of all nine chapters
individually; round 2 has re-derived every changed paragraph and confirmed
mechanically that nothing else moved. There is no known blocking defect
outstanding, so the final pass starts from a clean text rather than a
patched one.

Two things should be closed alongside (or before) that pass, neither of them
a text edit: **record S1–S7 as explicit editorial decisions** (S2 is a
dropped negation and must be visible), and **record the C1 P2 scripture-
modernization policy** either way.
