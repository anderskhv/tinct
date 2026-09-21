# Fidelity Review 1 — *Meditations on First Philosophy* (Descartes), chapters 5–9

**Reviewer:** Independent fidelity reviewer (Reviewer B role), per
`books/prompts/fidelity-review-prompt.md`.
**Date:** 2026-09-21
**Fidelity anchor (locked source):**
`books/wip/green-descartes-meditations/source.json` — the Veitch English
translation as parsed into 9 chapters. This is the sole anchor; no other
Descartes translation and no Latin/French original was used as a standard.
**Candidate:** `books/wip/green-descartes-meditations/candidate.json`.
**Assigned scope:** chapters 5–9 (Meditations 2–6), with chapter 4
(Meditation 1) read as leading context only and **not certified**.

---

## 1. Coverage statement

Structural check (run, not asserted): chapter count 9 = 9; per-chapter
paragraph counts identical in source and candidate for all nine chapters
(7/7/6/12/16/39/17/16/24). No paragraph was merged, split, reordered or
dropped anywhere in scope.

Every paragraph in chapters 5–9 was read **individually**, source against
candidate, in the packet method: packets of 5–10 paragraphs with one
paragraph of context on each side of every packet boundary. Nothing was
skimmed or sampled. Packets:

| Chapter | Meditation | Paragraphs (0-indexed) | Packets |
|---|---|---|---|
| 4 (context only) | Med. 1 | 0–11 | read once, not certified |
| 5 | Med. 2 | 0–15 | 0–7, 6–15 |
| 6 | Med. 3 | 0–38 | 0–8, 7–16, 15–24, 23–31, 30–38 |
| 7 | Med. 4 | 0–16 | 0–8, 7–16 |
| 8 | Med. 5 | 0–15 | 0–7, 6–15 |
| 9 | Med. 6 | 0–23 | 0–7, 6–14, 13–19, 18–23 |

After the packets, each of chapters 5–9 was re-read end to end for
cross-boundary issues: recurring technical vocabulary, terms set up in one
paragraph and paid off in another, and the argumentative spine of each
Meditation. In addition, an automated diff was run over the whole scope for
bracketed editorial insertions `[...]`, parenthetical glosses (`percipio`,
`cogitatio`, `mens sive animus`, `inspectio`, `sensus communis`,
`facultas cognoscitiva`, etc.) and all digits, to catch silently dropped
apparatus or changed numbers. **No bracketed insertion, Latin/French gloss
or number is missing anywhere in chapters 5–9.** The parenthesis diffs
that the check surfaced are all cases where the candidate added parentheses
around clauses already present in the source, or converted a source
parenthesis to dashes — no content change.

Overall the rendering is careful, genuinely modernized (not a mechanical
cleanup), and in the great majority of paragraphs the logical connectives,
scope of conditionals and epistemic hedges survive intact. The defects
below are specific and patchable; none of them indicates a bad method.

---

## 2. Blocking defects (fidelity / meaning)

### B1 — Ch. 9 (Med. 6), ¶20: referent error garbles the cord argument

- **Source:** "the nature of body is such that none of its parts can be
  moved by another part a little removed from the other, **which cannot
  likewise be moved in the same way by any one of the parts that lie
  between those two**, although the most remote part does not act at all."
- **Candidate:** "no part of it can be moved by another part a little
  distance away **without that intermediate part being capable of being
  moved in the same way by any of the parts that lie between the two** —
  even though the most remote part does not act at all."
- **What's wrong:** the source's relative clause attaches to the part that
  *gets moved* (A in the following A–B–C–D example): A cannot be moved by
  distant D without A also being movable in just the same way by the
  intervening B or C. The candidate reattaches it to "that intermediate
  part," which is a different actor and produces a claim the source does
  not make (and which does not match the A/B/C/D illustration in the very
  next sentence, nor the phantom-limb conclusion it supports). This is the
  premise of the whole referred-pain argument, so the error propagates.
- **Fix:** "no part of it can be moved by another part some distance away
  without its being capable of being moved in just the same way by any of
  the parts lying between the two — even though the most remote part does
  not act at all."

### B2 — Ch. 6 (Med. 3), ¶15: "any other ground" truncated to "any other"

- **Source:** "I shall have no sufficient ground of assurance of the
  existence of any other being besides myself, for, after a most careful
  search, I have, up to this moment, been unable to discover **any other
  ground**."
- **Candidate:** "…I have so far been unable to discover **any other**."
- **What's wrong:** the source says he has found no other *ground* (no
  other route to proving other beings exist). Stripped of its noun, the
  candidate's "any other" most naturally reads as "any other *being*" —
  which is a different, and much stronger, claim than the one Descartes
  makes at this point in the argument, and one he explicitly has not
  established.
- **Fix:** restore the noun: "…I have so far been unable to discover any
  other ground."

### B3 — Ch. 6 (Med. 3), ¶3: quotation closed mid-series, breaking the parallel and the syntax

- **Source:** "…I naturally break out into expressions such as these:
  Deceive me who may, no one will yet ever be able **to bring it about**
  that I am not, so long as I shall be conscious that I am, **or** at any
  future time **cause it to be true** that I have never been, it being now
  true that I am, **or make** two and three more or less than five…"
- **Candidate:** "…I naturally break out into expressions like these:
  'Let whoever can deceive me do so; he will never be able to bring it
  about that I am not, so long as I am conscious that I am'; **or to make
  it true at any future time** that I have never been…; **or to make** two
  and three more or less than five…"
- **What's wrong:** the source has one governing verb phrase ("no one will
  ever be able to…") heading a three-member series. The candidate closes
  the quotation after the first member, which leaves members two and three
  dangling with no governing verb — ungrammatical, and it obscures that all
  three are things the deceiver *cannot* do.
- **Fix:** put the whole series inside the quotation and keep one
  governing verb, e.g.: "'Let whoever can deceive me do so; he will never
  be able to bring it about that I am not, so long as I am conscious that
  I am; nor to make it true at any future time that I have never been,
  given that it is now true that I am; nor to make two and three more or
  less than five' — for in supposing such things…"

### B4 — Ch. 6 (Med. 3), ¶18: causal link severed by a sentence split

- **Source:** "**and since**, ideas being as it were images there can be
  none that does not seem to us to represent some object, **the idea which
  represents cold as something real and positive will not improperly be
  called false**, if it be correct to say that cold is nothing but a
  privation of heat."
- **Candidate:** "And since ideas are, as it were, images, there can be
  none that does not seem to us to represent some object. **The idea that
  represents cold as something real and positive will not improperly be
  called false**, if it is correct to say that cold is nothing but a
  privation of heat."
- **What's wrong:** in the source, "since ideas are images…" is the
  *premise* for calling the cold-idea false. The candidate promotes the
  premise to a free-standing assertion and leaves the conclusion
  unsupported — the "since… therefore" that defines *material falsity* is
  gone. This is a causality defect in precisely the paragraph where
  Descartes introduces the technical notion.
- **Fix:** keep them in one sentence: "And since ideas are, as it were,
  images — so that there can be none that does not seem to us to represent
  some object — the idea that represents cold as something real and
  positive will not improperly be called false, if…"

### B5 — Ch. 6 (Med. 3), ¶29: unlicensed addition changes the comparison class

- **Source:** "I could not, indeed, have denied to myself any property
  which I perceive is contained in the idea of God, because there is none
  of these that seems to me to be **more difficult to make or acquire**;
  and if there were any that should happen to be more difficult to
  acquire…"
- **Candidate:** "…since none of these seems to me more difficult to make
  or to acquire **than any other**; and if there were any that did happen
  to be more difficult…"
- **What's wrong:** "than any other" is not in the source and changes what
  is being compared. The source compares the divine perfections against
  the (already granted) feat of giving himself existence — the argument is
  that nothing in the idea of God would have been *harder* than what he
  supposedly already did. The candidate turns it into a comparison among
  the perfections themselves, which is a different claim.
- **Fix:** delete "than any other".

### B6 — Ch. 7 (Med. 4), ¶7: technical term "negation" replaced by "want", colliding with ¶14

- **Source:** "…is the lowest grade of liberty, and manifests defect or
  **negation** of knowledge rather than perfection of will."
- **Candidate:** "…is the lowest grade of liberty, and shows defect or
  **want** of knowledge rather than perfection of will."
- **What's wrong:** *privation* vs *negation* is a scholastic distinction
  Descartes trades on explicitly eight paragraphs later (¶14: "it ought not
  to be called privation, but negation [according to the signification of
  these words in the schools]"), and the candidate keeps that distinction
  there. Rendering "negation" as "want" here erases one half of the pair at
  its first occurrence, and "want" is the word the candidate uses for
  *privation* elsewhere (¶4: "the privation, or want, of some knowledge").
  The terminology now cross-contaminates.
- **Fix:** restore "negation": "…shows defect or negation of knowledge
  rather than perfection of will."

### B7 — Ch. 7 (Med. 4), ¶4: ungrammatical clause

- **Source:** "the privation or want of some knowledge **which it would
  seem I ought to possess**"
- **Candidate:** "the privation, or want, of some knowledge **that I would
  seem to ought to possess**"
- **What's wrong:** "would seem to ought to possess" is not English; it
  also flattens the source's hedge ("it would seem" qualifies the whole
  claim, not Descartes' possession).
- **Fix:** "…of some knowledge that, it would seem, I ought to possess."

### B8 — Ch. 5 (Med. 2), ¶5: "how often / as often" silently converted to duration

- **Source:** "I am—I exist: this is certain; but **how often? As often as
  I think**; for perhaps it would even happen, if I should wholly cease to
  think, that I should at the same time altogether cease to be."
- **Candidate:** "I am — I exist: this is certain; but **for how long? As
  long as I think**; for it might perhaps happen that, if I wholly ceased
  to think…"
- **What's wrong:** this is a *silent correction*. The candidate's reading
  is the one most modern translations give (Latin *quandiu*), but the
  locked source says "how often / as often as," and the anchor is the
  source, not the Latin. Changing it also changes the claim from a
  frequency claim (each time I think, I am) to a duration claim (I last as
  long as my thinking lasts) — and the frequency reading is what ties this
  sentence back to ¶3's "necessarily true each time it is spoken by me, or
  conceived in my mind," which the candidate renders faithfully. The two
  paragraphs no longer chime.
- **Fix:** restore "but how often? As often as I think". If the project
  decides it prefers the corrected reading, it must be an explicit,
  recorded editorial decision, not a silent one.

### B9 — Ch. 9 (Med. 6), ¶10: dangling "correcting"

- **Source:** "he has permitted no falsity in my opinions **which he has
  not likewise given me a faculty of correcting**"
- **Candidate:** "he has consequently permitted no falsity in my opinions
  **for which he has not also given me a faculty of correcting**"
- **What's wrong:** with "for which," the participle "correcting" loses its
  object and the sentence no longer says what the faculty corrects. Small,
  but this clause is the hinge on which the rest of Meditation 6 turns.
- **Fix:** "…he has consequently permitted no falsity in my opinions that
  he has not also given me a faculty of correcting."

---

## 3. Silent corrections of the source — must be disclosed and decided

These are places where the candidate quietly repaired an evident corruption
in the locked source. In each case I judge the repair *substantively right*,
but the review prompt requires flagging them, and the project should record
them as deliberate editorial decisions rather than let them pass unnoticed.

| # | Ch/¶ | Source | Candidate | Assessment |
|---|---|---|---|---|
| S1 | 7 / ¶6 | "I cannot deny that **we** may have produced many other objects, or at least that **he** is able to produce them" | "I cannot deny that **he** may have produced many other objects, or at least is able to produce them" | Source "we" is a printer's error (the sentence's own second half says "he"). Keep the repair; record it. |
| S2 | 7 / ¶14 | "I cannot therefore deny that it **is not** somehow a greater perfection in the universe, that certain of its parts are not exempt from defect" | "I cannot therefore deny that it **is** somehow a greater perfection in the universe that some of its parts are not exempt from defect" | A **negation was dropped**. The source's double negative is almost certainly a redundant-negative archaism and the candidate's reading is Descartes' actual doctrine — but dropping a "not" is exactly the class of change that must never be invisible. Record explicitly. |
| S3 | 7 / ¶3 | "error, **so far as error is not something real**, which depends for its existence on God, but is simply defect" | "error, **insofar as it is error, is not something real** that depends for its existence on God, but is simply a defect" | Source clause is grammatically broken; the repair recovers the standard sense. Keep; record. |
| S4 | 8 / ¶6 | "compel me to **assert** to what I clearly conceive" | "compel me to **assent** to what I clearly conceive" | Obvious source typo; repair is correct. Keep; record. |
| S5 | 9 / ¶19 | "(**senses** communis)" | "(**sensus** communis)" | Source typo; ch. 5 ¶13 already reads "sensus communis" in the source, so the repair also restores internal consistency. Keep; record. |
| S6 | 9 / ¶1 | "chiliogon", "myriogon" | "chiliagon", "myriagon" | Spelling normalization; within the modernization mandate. Keep; record. |
| S7 | 6 / ¶24 | Bracket "[in other words, that it may exist in me from my imperfections…" is **never closed**; the sentence then runs on through "for, on the contrary, as this idea is very clear…" | Bracket closed after "and the like]"; new sentence begins "On the contrary, since this idea is very clear…" | Punctuation repair of a corrupt source passage; the closure point chosen is the right one. Keep; record. |

---

## 4. Non-blocking notes (style, hedging, minor drift)

None of these alone would hold up acceptance; they are listed so the
drafter can tighten them in the same pass.

1. **Ch. 5 ¶9** — "although, in truth, it may seem strange to say that I
   know…" becomes a free-standing sentence beginning "Although it may seem
   strange to say that…", which leaves a subordinate clause with no main
   clause. Join it to the preceding sentence or start "It may seem strange
   to say…". The source's "in truth" is also dropped.
2. **Ch. 5 ¶10** — "found in the one before **us**" → "before **me**".
   Harmless, but the source's first-person-plural is deliberate in this
   stretch ("bodies we touch and see"). Also "all that **contributes to
   make** a body as distinctly known as possible" → "all that **is needed
   to** make" slightly narrows the claim.
3. **Ch. 5 ¶12** — "artificial machines, whose motions might be determined
   by springs" → "**automata**, whose movements might be controlled by
   springs." Faithful, but "automata" is *less* accessible than the source's
   own wording; modernization should not move toward the rarer word.
4. **Ch. 5 ¶0, ¶3** — dropped intensifier/hedge: "so **greatly**
   disconcerted" → "so disconcerted"; "lest **perchance** I inconsiderately
   substitute" → "not to thoughtlessly substitute".
5. **Ch. 6 ¶0** — "in as far **only** as they are modes of consciousness"
   → "insofar as they are **merely** modes of consciousness": the scope of
   the restrictor shifts from the *insofar* clause to the noun. Prefer
   "only insofar as they are modes of consciousness".
6. **Ch. 6 ¶6** — "I may even **perhaps** come to be of opinion" →
   "I may even come to think": hedge dropped.
7. **Ch. 6 ¶13** — "we **certainly** cannot, for all that, allege" → "we
   still cannot say"; and "it must **of course** derive this from nothing"
   → "then it must derive this from nothing". Two emphasis markers lost in
   one paragraph.
8. **Ch. 6 ¶17** — "**although** they were, apart from myself, neither
   men, animals, nor angels" → "**even if**, apart from me, there were no
   men, animals, or angels at all": concessive-factual becomes
   hypothetical. Defensible, but it is a modal shift.
9. **Ch. 6 ¶37** — "all those lofty perfections, of which **the mind** may
   have some slight conception" → "of which **my mind** may…": the source
   generalizes to mind as such.
10. **Ch. 7 ¶1** — "yet **the will** testifies without doubt of malice and
    weakness" → "**the will to deceive** bears witness…". The gloss is
    licensed by context, but it is an addition to an elliptical source.
11. **Ch. 7 ¶16** — "I will assuredly reach truth **if I only fix** my
    attention sufficiently" → "if I fix my attention sufficiently":
    "only" (= merely) dropped.
12. **Ch. 8 ¶5 (¶ index 4)** — "which are not framed by me **though it may
    be in my power** to think, or not to think them" → "though it **is** in
    my power": hedge dropped.
13. **Ch. 8 ¶13 (index 12)** — "I **feel** not only as assured of it" →
    "I **am** not only as assured of it": a reported feeling becomes a
    stated fact. Minor certainty upgrade.
14. **Ch. 9 ¶7 (index 6)** — "I could not be quite certain **even that**
    any one of my members was affected when I felt pain in it" → "I could
    not be quite certain that any one of my limbs was affected **even
    when** I felt pain in it": the emphatic moves clauses. The candidate's
    placement is arguably the more natural sense, but it is a change.
15. **Ch. 9 ¶22 (index 21)** — "among all the sensations which **it**
    [the movement] is capable of impressing upon **it** [the mind]" →
    "among all the sensations **it is capable of producing**", where the
    nearest antecedent is now *the mind*. Disambiguate: "among all the
    sensations that movement is capable of impressing on it".
16. **Vocabulary consistency** — "clearness" is sometimes modernized to
    "clarity" and sometimes left as "clearness" (e.g. ch. 6 ¶1 vs ch. 7
    ¶0) with no pattern. The load-bearing pair "clear and distinct" is
    preserved consistently everywhere, so this is cosmetic, but a single
    policy would read better. "figure" → "shape" *is* applied consistently
    throughout the scope, and "Deity", "natural light", "objective
    reality", "formally / eminently", "privation", "adventitious /
    factitious / innate", "perceiving (sentire)" are all consistent
    across chapter boundaries.

---

## 5. Things specifically checked and found sound

Because the assignment flagged them, these were verified clause by clause
rather than read:

- **Med. 3 causal principle** (ch. 6 ¶14): "there must **at least** be as
  much reality in the efficient and total cause as in its effect" — the
  "at least," the formal/objective/eminent distinctions, and the
  no-infinite-regress step (¶15) all survive exactly, including the
  concessive "although that cause may not transfer to my idea anything of
  its actual or formal reality."
- **Med. 3 trademark argument** (ch. 6 ¶38): "I perceive that I could not
  possibly be of such a nature as I am, and yet have in my mind the idea
  of a God, **if God did not in reality exist**" — conditional and scope
  intact; "it is **highly probable** that he in some way fashioned me
  after his own image" retains the source's hedge rather than upgrading it.
- **Med. 5 ontological argument** (ch. 8 ¶7–¶11): the mountain/valley
  disanalogy, "not that this is brought about by my thought," the
  rhombus/quadrilateral objection, and — importantly — the source's own
  odd "its three angles are **not greater than** two right angles" are all
  preserved without silent repair.
- **Med. 5 on the divine guarantee** (ch. 8 ¶14–¶16): "provided only I
  remember that I once had a clear and distinct comprehension of it" and
  "even if I were dreaming, the rule still holds" keep both the proviso and
  its scope.
- **Med. 6 real distinction** (ch. 9 ¶9): "it is certain that I [that is,
  my mind, by which I am what I am] am entirely and truly distinct from my
  body, and can exist without it" — the two-sided clear-and-distinct
  premise and the omnipotence step before it are complete.
- **Med. 6 mind-body union** (ch. 9 ¶13): "not only lodged in my body as a
  pilot in a vessel, but… so intimately conjoined… that my mind and body
  compose a certain unity" — image, negation and counterfactual intact.
- **Wax argument** (ch. 5 ¶11–¶14): the full list of sensible qualities
  before and after the fire, the infinity-of-changes step, "mind alone
  (mens, Lat., entendement, F.)", the hats-and-cloaks passage and the
  judgment-not-sight conclusion are all present and correctly ordered.

---

## 6. Verdict

**ACCEPT WITH FIXES REQUIRED — chapters 5–9.**

The rendering is a real modern-English translation of the locked source,
alignment is exact, no content is invented or dropped at paragraph scale,
and in the argumentative core (the causal principle, the trademark and
ontological arguments, the real distinction) the connectives, conditionals
and hedges are carried across with care. A re-draft is not warranted.

Required before this batch is pinned:

1. Fix **B1** (ch. 9 ¶20 cord-argument referent) — the one defect that
   actually changes an argument.
2. Fix **B2–B9** as specified above (¶-level wording given for each).
3. Record **S1–S7** as explicit editorial decisions in the book's notes;
   **S2 in particular is a dropped negation** and must not remain an
   invisible change.
4. Optionally sweep the non-blocking hedge/intensifier losses in §4 items
   4, 6, 7, 11, 12, 13 — these are the same defect class (quiet loss of
   qualification) repeated, and Descartes' argument is built out of
   qualifications.

Re-review is needed only on the paragraphs touched by items 1–3; the rest
of chapters 5–9 is certified as read and sound.
