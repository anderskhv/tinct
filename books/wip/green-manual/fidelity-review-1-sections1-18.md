# Independent Fidelity Review 1 — The Manual (Enchiridion), Sections 1–18

**Reviewer:** independent fidelity reviewer (Reviewer B role), per
`books/prompts/fidelity-review-prompt.md`.
**Date:** 2026-09-21
**Book:** The Manual (Epictetus, *Enchiridion*)
**Fidelity anchor (sole anchor):** `books/wip/green-manual/source.json` —
George Long's English translation, 52 sections, field `chapters`.
**Candidate:** `books/wip/green-manual/candidate.json` — 52 sections.
**Assigned scope certified:** sections 1–18. Section 19 read as trailing
context only and is **not** certified here.

I did not rely on the drafter's self-report, on `BRANCH-README.md`, or on the
two prior informal whole-half reviews. Every judgement below is re-derived
from source vs. candidate.

---

## 1. Coverage statement

Sections 1–18 contain **19 paragraphs** (§1 has two paragraphs; §§2–18 have
one each). Section 19 contains 1 paragraph, read as context.

- **Every one of those 19 paragraphs was read individually, in full, source
  against candidate.** Nothing in 1–18 was skimmed or sampled.
- Packets used, each with one section of context on either side, per the
  protocol's small-packet method:
  - Packet A: §§1–6 (context: §7)
  - Packet B: §§7–12 (context: §6, §13)
  - Packet C: §§13–18 (context: §12, §19)
- **Whole-pass:** after the packets I re-read §§1–19 continuously in one pass
  for cross-boundary issues — recurring technical vocabulary, the
  "in our power / not in our power" spine, the actor terms (will, slave,
  wife, captain, giver, author), and claims set up in one section and paid off
  in another.
- Structural check run separately: 52 sections in both files, section numbers
  and titles identical, paragraph counts identical per section (1–18: 2,1,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1). No merges, splits, reorderings, or dropped
  paragraphs. Alignment is intact across the assigned range.
- **Unmodernized quotations:** checked specifically. The only archaism in the
  source within this range is §17 "Remember that thou art an actor in a play",
  which the candidate correctly modernizes to "Remember that you are an actor
  in a play". The quoted formulas the candidate introduces (§1.1 "You are only
  an impression…", §4 "I intend to bathe…", §11 "But the one who took it is a
  bad person.", §12 "This is the price of freedom from distress…") are all in
  modern English. **No archaic islands found in §§1–18.**

---

## 2. Blocking defects

These are fidelity/meaning defects: invented content, dropped or flipped
claims, actor/object swaps, and silent corrections. All are patchable at the
sentence level.

### B1. §1, paragraph 2 — invented explanatory sentence (addition)

- **Source:** "Straightway then practise saying to every harsh appearance: You
  are an appearance, and in no manner what you appear to be."
- **Candidate:** "**An impression is how something first appears to you.**
  Practise saying at once to every disturbing impression: \"You are only an
  impression, and not at all what you appear to be.\""
- **What's wrong:** the first sentence is a definition of "impression" that
  has no counterpart anywhere in the source. It is exactly the "helpful
  invented explanation" the protocol prohibits — a glossary note smuggled into
  the reading text. Epictetus does not define *phantasia* here; the force of
  the passage is the command, not a definition.
- **Fix:** delete the sentence. Paragraph should begin: "Practise saying at
  once to every disturbing impression: …". If a gloss is genuinely wanted, it
  belongs in separately sourced notes, not in the edition text.

### B2. §9 — object swap: the impediment is to the leg, not to walking

- **Source:** "Lameness is an impediment to the leg, but not to the will."
- **Candidate:** "A disabled leg hinders your walking, but not your will."
- **What's wrong:** the source's whole rhetorical engine in §9 is the fixed
  frame *"X is an impediment to [the part affected], but not to [you / the
  will]"* — disease→body, lameness→leg, and then the generalization "you will
  find it an impediment to something else, but not to yourself." The candidate
  swaps the object: the impediment is now *to walking* and the *leg* becomes
  the agent doing the hindering. That breaks the parallel with the preceding
  clause ("Illness is an obstacle to the body") and with the concluding
  generalization, which the candidate keeps intact. The reader loses the
  pattern the section exists to teach.
- **Fix:** "Lameness is an obstacle to the leg, but not to the will."
  (Keep "obstacle" to match "Illness is an obstacle to the body" in the same
  paragraph.)

### B3. §15 — the claim that they *were* divine is downgraded to a naming claim

- **Source:** "For by acting thus Diogenes and Heracleitus and those like them
  were deservedly divine, and were so called."
- **Candidate:** "This is how Diogenes and Heraclitus and those like them
  deserved to be called divine, and were."
- **What's wrong:** the source asserts two things — they *were* divine
  (deservedly), *and* they were called so. The candidate asserts only that
  they deserved the *title* and received it. The ontological claim is deleted
  and replaced by a reputational one. Dropping a claim in the source is a
  fidelity defect regardless of how the reviewer feels about the claim.
- **Fix:** "This is how Diogenes and Heraclitus and those like them were
  deservedly divine, and were called so."

### B4. §16 — permission turned into exhortation (negation/force)

- **Source:** "So far as words then do not be unwilling to show him sympathy,
  and even if it happens so, to lament with him."
- **Candidate:** "In your words, **by all means** sympathise with them and even
  mourn aloud with them if the moment calls for it."
- **What's wrong:** the source grants a permission through a double negative
  ("do not be unwilling") — outward sympathy is *allowed*, it is not
  *recommended*. The candidate converts it into a positive exhortation ("by all
  means"), which changes the advice. The following sentence ("But do not grieve
  inside as well") reads as a limit on something conceded, not on something
  urged; the candidate's version makes that "But" weaker than the source's.
  Secondary: "if it happens so" (i.e. if that is how it turns out) is rendered
  "if the moment calls for it", which adds a judgement of appropriateness the
  source does not make.
- **Fix:** "In words, then, do not refuse to sympathise with them, and even to
  mourn with them if that is how it goes. But do not grieve inside as well."

### B5. §6 — silent correction toward the standard Greek reading

- **Source:** "But when you are elated, and say, I have a beautiful horse, you
  must know that you are elated at **having a good horse**."
- **Candidate:** "But when you say proudly \"I have a beautiful horse,\" you
  should know that you are taking pride in **something that belongs to the
  horse**."
- **What's wrong:** the candidate has substituted the standard construal of
  the Greek (*you are elated at a horse's good*) for what the locked source
  actually says (*you are elated at having a good horse*). The protocol
  requires flagging silent corrections "even if the source is 'wrong.'" Long's
  English is the anchor, and Long's proposition is different from the one the
  candidate states.
- **Fix:** "you should know that you are taking pride in having a good horse."
  (The argument still lands: the next line, "What is actually yours?", supplies
  the correction the source wants the reader to make.)

### B6. §15 — "a wife" silently neutralized to "a spouse"

- **Source:** "so with respect to a wife"
- **Candidate:** "with a spouse"
- **What's wrong:** two problems. (a) It is a silent change to the source's
  actual wording — the text addresses a male reader about a wife, and this
  edition elsewhere deliberately retains historically situated material
  (slaves in §12 and §14, physical realities elsewhere). (b) It is internally
  inconsistent: the candidate keeps "wife" in §3, §7, §11, §14, §16 and §18,
  and changes it only here. A reader meets "wife" six times and "spouse" once,
  for no reason visible in the text.
- **Fix:** "with a wife".

### B7. §12, final sentence — restructured into a claim and a rule the source does not make

- **Source:** "But matters are not so well with him, but altogether well with
  you, that it should be in his power for you to be not disturbed."
- **Candidate:** "He is not the one in such a fortunate position; you are. Your
  freedom from distress **must not** lie in his power."
- **What's wrong:** the source is a single sentence in which the "that…" clause
  is the *content* of the "not so well with him / altogether well with you"
  contrast — i.e. *he is not so well placed, and you are entirely well placed,
  for your being undisturbed to lie in his hands.* The candidate splits it in
  two, which (a) leaves "He is not the one in such a fortunate position; you
  are" standing as a free-floating claim about who is *fortunate*, which the
  source does not make, and (b) converts the remainder into a normative
  prohibition ("must not"), which the source also does not make — Long's
  sentence is descriptive.
- **Fix:** keep it as one sentence tied to the dependence: "But he is not so
  well placed — and you are entirely so — that your freedom from disturbance
  should lie in his power."

---

## 3. Required fixes, lower severity

Still fidelity issues (omission, causality, modality), but each is a
word-level repair and none changes the argument of its section.

### R1. §1, paragraph 1 — two clauses collapsed into one; causal "for" dropped

- **Source:** "…no man will harm you, you will have no enemy, **for** you will
  not suffer any harm."
- **Candidate:** "You will have no enemies, and nothing can harm you."
- **What's wrong:** the source's chain has three links and an explicit
  because-relation: no one will harm you → you will have no enemy → *because*
  you will not suffer any harm. The candidate drops one link, reverses the
  remaining order, and replaces the causal connective with "and". It also
  broadens "no man will harm you" to "nothing can harm you" (agent widened from
  persons to anything).
- **Fix:** "no one will harm you, you will have no enemy, because you will not
  suffer any harm."

### R2. §1, paragraph 2 — prohibition rendered as impossibility

- **Source:** "remember that you **must not** (attempt to) lay hold of them
  with a small effort"
- **Candidate:** "remember that you **cannot** pursue them with a small effort"
- **What's wrong:** an instruction ("must not attempt") becomes a statement of
  fact ("cannot"). Modality changed.
- **Fix:** "remember that you must not try to grasp them with a small effort."

### R3. §1, paragraph 1 — "slavish" softened to "dependent"

- **Source:** "the things not in our power are weak, **slavish**, subject to
  restraint…" / "if you think the things which are by nature **slavish** to be
  free"
- **Candidate:** "weak, **dependent**, subject to obstruction" / "if you
  mistake what is **dependent** for what is free"
- **What's wrong:** the candidate is at least internally consistent (both
  occurrences changed together), but the source's slave/free opposition is the
  image the whole book runs on — it returns explicitly in §14 ("he must be a
  slave"), which the candidate keeps. Softening it in §1 breaks the setup for
  that payoff.
- **Fix:** "weak, slavish, subject to obstruction" and "if you mistake what is
  by nature slavish for what is free."

### R4. §11 — the giver's permission dropped

- **Source:** "**So long as he may allow you**, take care of it as a thing
  which belongs to another, as travellers do with their inn."
- **Candidate:** "**While you have it**, treat it as a traveller treats an inn
  — care for it, but as something that belongs to another."
- **What's wrong:** the source's condition is the *giver's* continuing
  permission — the same giver named one sentence earlier ("by whose hands the
  giver demanded it back"), which the candidate does keep. "While you have it"
  removes that actor and makes the condition merely factual possession.
- **Fix:** "For as long as he allows you, treat it as a traveller treats an
  inn…"

### R5. §15 — temporal qualifier "some time" dropped

- **Source:** "and you will be **some time** a worthy partner of the banquets
  of the gods"
- **Candidate:** "and you will prove a worthy guest at the gods' own table"
- **What's wrong:** "some time" (= eventually, at some point) is the source's
  own hedge on when this arrives. Dropped.
- **Fix:** "and in time you will prove a worthy guest at the gods' own table."

### R6. §18 — flat assertion hedged with "can"

- **Source:** "but to me all significations **are** auspicious if I choose."
- **Candidate:** "For me, every omen **can be** a good sign if I choose"
- **What's wrong:** the source already carries its own condition ("if I
  choose"); adding "can be" hedges a second time and weakens a flat claim into
  a possibility.
- **Fix:** "For me, every omen is a good sign if I choose".

### R7. §16 — causal justification turned into a counterfactual aside

- **Source:** "it is not that which has happened that afflicts this man, **for
  it does not afflict another**, but it is the opinion about this thing which
  afflicts the man."
- **Candidate:** "what distresses this person is not what has happened — **the
  same thing would not distress someone else** — but their opinion about what
  has happened."
- **What's wrong:** the source states as fact that the event does not afflict
  another person, and offers that as the *reason* ("for"). The candidate makes
  it hypothetical ("would not") and demotes the reason to a parenthetical.
- **Fix:** "…is not what has happened, since it does not distress someone
  else, but their opinion about what has happened."

### R8. §3 — the instruction to ask about *nature* is lost

- **Source:** "remember to add this to the (description, notion): **What is the
  nature of each thing**, beginning from the smallest?"
- **Candidate:** "remind yourself **what it is**. Start with small things."
- **What's wrong:** "nature" is a load-bearing term in this edition (it recurs
  in §§2, 4, 6, 13 as "in accordance with nature"), and §3 is where the reader
  is first told to ask after a thing's nature. "What it is" is thinner than the
  source and drops the term.
- **Fix:** "remind yourself what its nature is. Start with the smallest
  things." (This also restores "the smallest", which the candidate flattens to
  "small things".)

---

## 4. Non-blocking notes

No fix required for acceptance, but worth a pass before publication.

- **N1. "appearance" vs. "impression" is inconsistent.** The candidate renders
  *phantasia* as "impression" in §1, §6, §10 and §18, but as "appearance(s)" in
  §16 (and §19, outside scope). One technical term should have one English
  rendering across the book. Recommend "impression" throughout, and fix §16
  accordingly.
- **N2. "in our power" vs. "within our control" is inconsistent.** The
  candidate uses "within/outside our control" in §1, §2, §13, §14, but "within
  my/your power" in §14, §18 (and §19). The source uses one phrase. Recommend
  standardising on one, noting that §1's programmatic opening sets the term for
  everything after it.
- **N3. Dropped explanatory/causal connectives.** The candidate systematically
  drops the source's initial "For" / "for": §3 ("for when it has been broken"),
  §5, §12 ("For it is better to die of hunger"), §13 ("For you should know
  that"), §17 ("For this is your duty"). Each drop is individually harmless and
  reads better, but the cumulative effect is a text that asserts where the
  source argues. Flagged as a pattern, not as individual defects. R1 and R7
  above are the two cases where I judged the loss to be material.
- **N4. §11 rhetorical question flattened.** Source: "Has not then this also
  been restored?" Candidate: "That too has been returned." Meaning preserved;
  the interrogative pressure is not.
- **N5. §6 "genuinely" doubled.** Source: "something good which is your own."
  Candidate: "something genuinely good, and genuinely yours." A mild intensifier
  the source does not have.
- **N6. §17 "If he wants it short, it is short."** The source is simply "if
  short, of a short one". The candidate supplies the author as agent. Licensed
  by the immediately preceding "of whatever kind its author chooses", so not a
  defect — noted for completeness.
- **N7. "Heracleitus" → "Heraclitus" (§15).** A proper-name spelling change
  relative to the locked source. Acceptable as modern-edition orthography for a
  historical name, and I am not requiring it be reverted — but it is a silent
  change to the anchor and the drafter should confirm the book applies one
  consistent policy to ancient names.
- **N8. §1.1 "these things also" → "this freedom".** The source's glossed
  phrase is "such great things"; the candidate narrows it to "freedom". The
  next sentence ("happiness and freedom") licenses the reading, and the
  paragraph is much clearer for it. Not a defect; noted because it is an
  interpretive choice rather than a rendering.

---

## 5. Whole-pass findings (cross-boundary)

Read §§1–19 continuously after the packets. Findings that only appear at this
level:

1. **The slave/free spine is broken at its origin.** §1 establishes
   "by nature slavish" vs. "by nature free"; §12 and §14 keep "slave"
   literally; §14 lands the conclusion "Otherwise, that person must be a
   slave." The candidate's §1 substitutes "dependent", so the concluding move
   in §14 no longer rhymes with the premise in §1. See R3. This is the single
   most consequential cross-section issue in the range, and it is the reason R3
   is listed as required rather than as a note.
2. **The *phantasia* thread is terminologically split** (N1). §1.1 sets up
   "impression", §6 defines what is yours as the use of impressions, §10 says
   impressions will not sweep you away, §18 says do not be carried away by the
   impression — and then §16, which is the same move applied to another
   person's grief, says "appearance". A reader tracking the term loses it
   exactly where it is being generalized.
3. **The §9 frame is the only place a recurring formula is broken by an actor
   swap** (B2). Confirmed against §9's own closing generalization, which the
   candidate keeps in the source's shape — so the defect is local and the fix
   is safe.
4. **Named figures are consistent and correctly placed:** Socrates (§5),
   Diogenes and Heraclitus (§15). No figure is introduced who is not in the
   source, and none is dropped. No numbers, examples or asides are missing
   across §§1–18 other than those itemized above.
5. **No content has crossed a section boundary.** Each section's material stays
   in its own section; nothing set up in one packet is paid off in a different
   section than the source pays it off in.

---

## 6. Verdict

**ACCEPT WITH FIXES REQUIRED — sections 1–18.**

The candidate is a competent, genuinely modernized rendering: alignment is
intact, no section is summarized, the historically situated material (slaves,
wife, magistrates, omens) is retained rather than sanitized, and no archaic
islands survive. It is not a re-draft candidate — the defects are local and
each has a one-sentence fix.

**Required before acceptance of §§1–18:**

- B1 — §1.1: delete the invented sentence "An impression is how something
  first appears to you."
- B2 — §9: restore "Lameness is an obstacle to the leg, but not to the will."
- B3 — §15: restore "were deservedly divine, and were called so."
- B4 — §16: restore the permission ("do not refuse to sympathise…") in place
  of "by all means".
- B5 — §6: restore "taking pride in having a good horse."
- B6 — §15: "a spouse" → "a wife".
- B7 — §12: restore the single sentence; drop the added "must not" and the
  free-standing fortune claim.
- R1–R8 as specified in section 3 above.

Non-blocking notes N1–N8 are recommended, not required. N1 and N2
(terminological consistency) should ideally be resolved book-wide rather than
section-by-section, and therefore belong to the coordinator's integration pass
rather than to this section range.

**Scope reminder:** this verdict covers sections 1–18 only. Section 19 was
read as context and is not certified. Sections 20–52 were not reviewed.
