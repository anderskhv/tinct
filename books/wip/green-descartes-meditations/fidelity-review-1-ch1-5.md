# Fidelity Review 1 — Meditations on First Philosophy (Descartes)

**Scope:** chapters 1–5 (indices 1–5 in `chapters`), with chapter 6 read as
trailing context only.
**Reviewer:** independent fidelity reviewer (Reviewer B role), first review of
this text. No prior review existed; no drafter self-report was consulted.
**Method:** per `books/prompts/fidelity-review-prompt.md`.
**Locked source (sole fidelity anchor):**
`books/wip/green-descartes-meditations/source.json` (Veitch English text, 9
chapters). Candidate: `candidate.json`.
**Date:** 2026-09-21

---

## 1. Coverage statement

Every paragraph in chapters 1–5 was read individually, source against
candidate, in order. Nothing was skimmed or sampled.

| Chapter | Title | Paragraphs certified |
|---|---|---|
| 1 | Letter of Dedication | 0–6 (7 of 7) |
| 2 | Preface to the Reader | 0–6 (7 of 7) |
| 3 | Synopsis of the Six Following Meditations | 0–5 (6 of 6) |
| 4 | Meditation 1 — Of the Things of Which We May Doubt | 0–11 (12 of 12) |
| 5 | Meditation 2 — Of the Nature of the Human Mind… | 0–15 (16 of 16) |

**Total: 48 of 48 paragraphs in scope, each read individually.**

Packets used (with one paragraph of context on each side, crossing chapter
boundaries where adjacent):

- C1 P0–P6 (whole chapter; context = C2 P0)
- C2 P0–P6 (context = C1 P6, C3 P0)
- C3 P0–P5 (context = C2 P6, C4 P0)
- C4 P0–P5, C4 P5–P11 (context = C3 P5, C4 P4/P6, C5 P0)
- C5 P0–P7, C5 P6–P15 (context = C4 P11, C5 P5/P8, C6 P0)
- C6 P0–P5 read as trailing context only (**not certified** — belongs to the
  next reviewer's scope)

After the packet pass, chapters 1–5 were re-read end to end in one pass for
cross-boundary issues (recurring terms, claims set up in one chapter and paid
off in another). Findings from that pass are in §4.

Mechanical backstops run over chapters 1–5 in addition to the human read:
paragraph count and order (48 = 48, aligned index-for-index); numbered
paragraph markers ("1.", "2." …) present and matching in every paragraph;
bracketed editorial insertions `[ ]` — count matches in every paragraph, none
dropped; parenthetical Latin/technical glosses — checked one by one (§3.17 is
the only loss); all digits/numerals — no changes; all mid-sentence
capitalised proper nouns present in the candidate; negation-token counts —
every divergence hand-checked and confirmed to be a structural rephrase
(e.g. "without hands, eyes, flesh" → "no hands, no eyes, no flesh"), not a
flip or a drop.

---

## 2. Blocking defects

These affect meaning, hedging, negation, or are silent corrections away from
the locked source. Fix before acceptance.

### 2.1 — C5 P5 — silent correction of the source ("how often" → "for how long")

- **Source:** "I am—I exist: this is certain; but how often? **As often as I
  think**; for perhaps it would even happen, if I should wholly cease to
  think, that I should at the same time altogether cease to be."
- **Candidate:** "I am — I exist: this is certain; but **for how long? As long
  as I think**; for it might perhaps happen that, if I wholly ceased to think,
  I should at the same time wholly cease to be."
- **Problem:** This is a silent "correction." The Latin (*quamdiu?*) does mean
  "how long," and the drafter has evidently gone behind the locked source to
  the Latin and fixed Veitch's rendering. The locked source is the sole
  fidelity anchor; where it is arguably wrong, we still follow it. It is also
  a substantive change: "as often as I think" makes existence coextensive with
  each act of thinking; "as long as I think" makes it a duration.
- **Fix:** restore — "but how often? As often as I think;".

### 2.2 — C4 P4 — universal quantifier added ("never")

- **Source:** "the occurrences in sleep are **not so distinct as all this**."
- **Candidate:** "what happens in sleep is **never as distinct as all this**."
- **Problem:** An addition not licensed by the source, and it works directly
  against the argument of the paragraph. Descartes is about to concede two
  sentences later that there are **no certain marks** distinguishing waking
  from sleep. A flat "never" asserts exactly the reliable mark he is denying.
- **Fix:** "what happens in sleep is not as distinct as all this."

### 2.3 — C5 P11 — negation dropped from a rhetorical question

- **Source:** "But what is meant by flexible and movable? **Is it not that** I
  imagine that the piece of wax, being round, is capable of becoming square…?"
- **Candidate:** "But what is meant by flexible and movable? **Is it that** I
  imagine that the piece of wax, being round, is capable of becoming square…?"
- **Problem:** A dropped negation. The answer given ("Surely not") is
  unchanged, so the conclusion survives, but the source's interrogative form
  is altered. Per the checklist, negation edits are flagged whether or not
  they happen to be recoverable from context.
- **Fix:** "Is it not that I imagine that the piece of wax…?"

### 2.4 — C1 P5 — epistemic hedge strengthened into assertion

- **Source:** "they are such as **to lead me to think** that there is no way
  open to the mind of man by which proofs superior to them can ever be
  discovered."
- **Candidate:** "they are such as **to convince me** there is no way open to
  the human mind by which superior proofs could ever be discovered."
- **Problem:** "lead me to think" is a deliberate softening — Descartes is
  already apologising, in the next clause, for speaking "somewhat more freely
  of myself than I have been accustomed to do." "Convince me" removes the
  softening the apology is apologising for.
- **Fix:** "they are such as to lead me to think that there is no way open to
  the human mind…".

### 2.5 — C4 P0 — mistranslated adverb, plus a word repeated from the bracket

- **Source:** "To-day, then, since I have **opportunely** freed my mind from
  all cares [and am **happily** disturbed by no passions]…"
- **Candidate:** "Today, then, since I have **happily** freed my mind from all
  cares [and am **happily** disturbed by no passions]…"
- **Problem:** "Opportunely" means *at a convenient moment* — it is the whole
  point of the preceding sentences about having waited for the right age and
  now having no more time to waste. "Happily" loses that and duplicates the
  next word inside the editorial bracket, which now reads as a stutter.
- **Fix:** "since I have conveniently freed my mind from all cares [and am
  happily disturbed by no passions]".

### 2.6 — C5 P2 — actor shift in the cogito passage

- **Source:** "was I not, therefore, at the same time, persuaded that I did
  not exist? Far from it; I assuredly existed, **since I was persuaded**."
- **Candidate:** "was I not therefore also convinced that I did not exist? Far
  from it: I certainly did exist, **since I was the one being convinced**."
- **Problem:** The source's "since I was persuaded" points at the *state* of
  being persuaded as the thing that requires a subject. "The one being
  convinced" introduces an implied external convincer and shifts the actor.
  This is the load-bearing inference of the Second Meditation; it needs to
  track the source exactly.
- **Fix:** "I certainly did exist, since I was persuaded of it."

### 2.7 — C5 P9 — sentence fragment created by a sentence split, plus dropped "in truth"

- **Source:** "…that I know not what part of myself which is not imaginable;
  **although, in truth, it may seem strange to say** that I know and
  comprehend with greater distinctness things whose existence appears to me
  doubtful … in a word, than myself. But I see clearly what is the state of
  the case."
- **Candidate:** "…which cannot be imagined. **Although it may seem strange to
  say** that I know and understand more distinctly things whose existence
  appears doubtful to me … in a word, more distinctly than I know myself. But
  I see clearly what the case is."
- **Problem:** The split turns a subordinate clause into a free-standing
  fragment with no main clause — it is a sentence beginning "Although…" and
  ending in a full stop. It also drops "in truth."
- **Fix:** either rejoin to the previous sentence with a semicolon, or recast
  as a main clause: "Yet in truth it may seem strange to say that I know and
  understand more distinctly…".

---

## 3. Non-blocking defects and notes

Small fidelity slips and style notes. None changes an argument; fix where
cheap.

1. **C3 P0** — Source: "so long at least, as we have **no other foundations**
   for the sciences than those we have hitherto possessed." Candidate: "at
   least so long as we have **no firmer foundations**." "Other" ≠ "firmer."
   Fix: "no foundations for the sciences other than those we have so far
   possessed."
2. **C3 P1** — Source: "involve an explication of **the whole principles of
   Physics**." Candidate: "require an explanation of **the whole of Physics**."
   Drops "principles." Fix: "…of the whole body of principles of Physics."
3. **C3 P2** — Source: "must have some cause, viz, **either** the science of
   the workman, **or** of some other person…" Candidate drops "either." The
   disjunction survives on "or," but restore "either" for the explicit
   two-branch structure.
4. **C2 P4** — Source: "the **undue** attribution to our minds of so much
   vigor and wisdom." Candidate: "attributing to our minds such vigor and
   wisdom that we presume to…" — "undue," the word that marks the attribution
   as an error, is gone; "presume" only partly carries it. Fix: "unduly
   attributing to our minds such vigor and wisdom that we presume…".
5. **C2 P4** — Source: "**hence** all that is alleged by them will occasion us
   no difficulty." Candidate: "Everything they allege will give us no
   difficulty." A causal connective dropped. Fix: "So everything they allege…".
6. **C4 P2** — Source: "not to place absolute confidence in that by which we
   have **even once** been deceived." Candidate: "…by which we have **once**
   been deceived." Drops the emphatic "even," which is what makes the maxim
   strong enough to license total doubt. Fix: restore "even once."
7. **C4 P4** — Source: "I extend this hand consciously and with express
   purpose, and **I perceive it**." Candidate: "…and **I feel it**." Silently
   specifies the sense modality. Fix: "and I perceive it."
8. **C4 P5** — Source: "we are nevertheless absolutely necessitated to admit
   the reality **at least** of some other objects still more simple…"
   Candidate drops "at least." Fix: restore.
9. **C4 P3** — Source: "many other of their **informations (presentations)**."
   Candidate: "many other **reports** of theirs" — the translator's gloss
   "(presentations)" is dropped. The candidate keeps every other such gloss
   (e.g. "(perception)" in C2 P2, "(cognition)", "(cogitatio)"), so this is an
   inconsistency. Fix: "many other reports (presentations) of theirs."
10. **C4 P9** — Source: "in proportion as the power possessed by the cause,
    **to which they assign my origin**, is lessened." Candidate: "in
    proportion as the power of **whatever cause is assigned my origin** is
    diminished." This is ungrammatical (missing "to"), and it also loses the
    actor "they" (those who deny God). Fix: "…in proportion as the power of
    whatever cause they assign my origin to is diminished."
11. **C4 P11** — Source: "some malignant demon, who is at once **exceedingly
    potent** and deceitful." Candidate: "**supremely powerful** and
    deceitful." Mild upgrade; and note that in C5 P2 the source's "the highest
    power" is also rendered "supremely powerful," so two different source
    phrases are flattened into one. Descartes is careful not to let the demon
    share God's predicates. Fix: "immensely powerful."
12. **C5 P5** — Source: "here I discover what **properly** belongs to myself."
    Candidate: "here I find what **truly** belongs to me." The candidate uses
    "properly" for *proprie* everywhere else in the chapter ("properly
    speaking," "properly be said to belong to me," "properly called
    perceiving"). Fix: "here I find what properly belongs to me."
13. **C5 P8** — Source: "**For** it is of itself so evident that it is I who
    doubt…" Candidate: "It is so self-evident that it is I who doubt…" Dropped
    "For," which links this sentence to the question just asked. Fix: restore
    "For."
14. **C5 P12** — Source: "hats and cloaks that might cover **artificial
    machines**." Candidate: "**automata**." Against the modernization mandate:
    "automata" is the less accessible word. Fix: "machines" or "mechanical
    figures."
15. **C5 P10** — Source: "is found in **the one before us**." Candidate: "in
    **the one before me**." Minor actor shift; the surrounding paragraph uses
    "us"/"we." Fix: "before us."
16. **C5 P14** — Source: "my imagination, or any other cause, **whatever it
    be**, persuades me." Candidate drops "whatever it be." Fix: restore.
17. **C5 P2** — Source: "there was **absolutely** nothing in the world."
    Candidate: "there was nothing in the world." Drops the intensifier that
    was set up in C5 P1 ("absolutely nothing certain"). Fix: restore.
18. **C5 P2** — Source: "there is **I know not what being**." Candidate:
    "there is some being — **I know not who**." Shifts an indefinite *what* to
    a personal *who*, which prejudges the deceiver's nature. Fix: "some being
    — I know not what."
19. **C4 P0** — Source: "a firm and abiding **superstructure** in the
    sciences." Candidate: "anything firm and lasting in the sciences." The
    building metaphor is set up in the same sentence ("building from the
    foundation") and paid off in C4 P1 ("the downfall of the whole edifice").
    Non-blocking, but "structure" would keep the image intact.
20. **C2 P5** — Source: "any commendation from the crowd **for my endeavors**,
    or a wide circle of readers." Candidate drops "for my endeavors."
21. **C1 P6** — Source ends a bracketed clause with a footnote marker:
    "[who are cognisant of the disorders which doubt of these truths
    produces]**\***". The candidate drops the asterisk. Since the footnote text
    is not carried in the JSON, dropping a dangling marker is defensible —
    recorded here only so the decision is on the record.
22. **C1 P2 — unmodernized quotations (judgment call for the protocol
    owner).** The two scriptural quotations are left as archaic islands inside
    otherwise fully modernized prose: "'Howbeit they are not to be excused;
    for if their understanding was so great that they could discern the world
    and the creatures, why did they not rather **find out the Lord
    thereof**?'" and "'That which may be known of God is manifest in them.'"
    The candidate did add quotation marks the source lacks, so the decision to
    leave them archaic looks deliberate. Per the prompt's "unmodernized
    quotations" check I must flag it. Checked for other defects: actors,
    negation, causality and conditions in both quotations are intact, and the
    surrounding commentary ("we seem to be told that all that can be known of
    God may be made manifest by reasons drawn from no other source than the
    inspection of our own minds") still supports the same inference. Fix, if
    the protocol treats scripture as modernizable: "Yet they are not to be
    excused; for if their understanding was great enough to discern the world
    and its creatures, why did they not rather find out its Lord?" If
    scripture quotations are policy-exempt, record the exemption and leave as
    is.

---

## 4. Whole-chapter cross-boundary pass (chapters 1–5)

Read straight through after the packets. Results:

- **Recurring terms are consistent.** "figure" → "shape" and "magnitude" →
  "size" are applied uniformly (C4 P6, P8, P11; C5 P1, P4, P10, P11, P12) —
  no paragraph reverts. "infidels" → "unbelievers" is consistent in C1 P2.
  "clearness" → "clarity" is uniform. "thinking thing" is never varied.
- **Latin/technical glosses all survive** and are used consistently:
  *conceptus*, *cogitatio*, *mens sive animus*, *inspectio*, *sentire*,
  *effingo*, *pronunciatum*, *sensus communis*, *intellectio*/*imaginatio*.
  The one exception is item 3.9.
- **The formula "I am, I exist"** is identical in both its occurrences (C5 P2,
  C5 P5).
- **Set-up / pay-off chains hold.** The materially/objectively distinction
  drawn in C2 P3 is the same distinction relied on in C3 P2 ("objective
  reality… objective (i.e. representative) perfection"). The doubt-about-God
  move introduced in C4 P8 is the one the demon supposition of C4 P11
  replaces, and C5 P2 and C5 P5 both refer back to the same demon. C1 P5's
  Archimedes reappears correctly in C5 P0.
- **No silent historical correction.** C3 P1 attributes the mind/body
  divisibility argument to "this Second Meditation," which is where the source
  puts it (Descartes actually argues it in the Sixth). The candidate leaves
  the source's attribution alone. Correct behavior — recorded so a later
  reviewer does not "fix" it.
- **An obvious source typo was handled well.** C5 P9 source reads "and,
  according to it every kind of liberty" (for "and accord to it…"). The
  candidate renders "and grant it every kind of freedom" — the right call, and
  not a silent fact change.
- **No claim was moved across a paragraph boundary**, added, or dropped
  wholesale. Paragraph alignment is exact.

---

## 5. Out-of-scope observation (chapter 6, context read only)

Not certified, but worth passing to the chapter 6 reviewer: at **C6 P3** the
candidate opens a quotation and closes it early, leaving the rest of the
source's list dangling without a governing verb — "…break out into expressions
like these: 'Let whoever can deceive me do so; he will never be able to bring
it about that I am not, so long as I am conscious that I am'; **or to make it
true at any future time that I have never been** …; **or to make two and three
more or less than five**…". In the source all three branches are governed by
the same "no one will yet ever be able to." As punctuated, the second and
third branches are ungrammatical.

---

## 6. Verdict

**ACCEPT WITH FIXES REQUIRED — chapters 1–5.**

The rendering is a genuine modern-English translation, not a summary or a
mechanical cleanup. Paragraph alignment is exact, nothing is invented or
dropped wholesale, the Latin apparatus and editorial brackets survive intact,
and the logical connectives and conditionals that the argument depends on are
carried over faithfully in the great majority of paragraphs (C4 P8's nested
conditional and C5 P14's chain of "if I judge… it follows" are both handled
well). No re-draft is needed.

Required before acceptance — the seven blocking items in §2:

1. C5 P5 — restore "but how often? As often as I think."
2. C4 P4 — remove the added "never": "is not as distinct as all this."
3. C5 P11 — restore the negation: "Is it not that I imagine…?"
4. C1 P5 — restore the hedge: "to lead me to think."
5. C4 P0 — "conveniently" for "opportunely"; remove the duplicated "happily."
6. C5 P2 — "since I was persuaded of it."
7. C5 P9 — repair the "Although…" fragment and restore "in truth."

The §3 items are recommended but non-blocking, except that §3.22
(unmodernized scripture) needs an explicit policy decision recorded either
way, since the same question will recur in every book with scriptural
quotation.
