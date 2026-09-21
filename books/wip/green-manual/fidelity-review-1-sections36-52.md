# Fidelity Review 1 — *The Manual* (Enchiridion), Sections 36–52

**Reviewer:** Independent fidelity reviewer (Reviewer B role), per
`books/prompts/fidelity-review-prompt.md`.
**Date:** 2026-09-21
**Book:** The Manual (Epictetus, *Enchiridion*)
**Fidelity anchor (locked source):** `books/wip/green-manual/source.json`
(George Long translation, 52 sections, field `chapters`)
**Candidate:** `books/wip/green-manual/candidate.json` (52 sections)
**Assigned scope:** sections 36–52 (§35 read as leading context only, not certified)

---

## Coverage statement

Structural check first: both files carry 52 chapters, numbers 1–52 in order,
with identical paragraph counts per chapter (all single-paragraph except §33 =
13 and §52 = 4). No paragraph merges, splits, reorderings, or drops anywhere in
the file, and none in scope.

**Every paragraph in sections 36–52 was read individually against its source
counterpart, in full. Nothing in scope was skimmed or sampled.** That is 20
paragraphs: §36–51 (one paragraph each, 16 paragraphs) plus §52 (4 paragraphs).

Packets, each read with one section of context on either side:

- **Packet A:** §36–44, with §35 (leading context, per assignment) and §45 as
  trailing context.
- **Packet B:** §45–52, with §44 as leading context. §52 is the end of the
  book, so no trailing context exists.

**Whole-scope second pass:** after both packets, §36–52 was re-read in one
continuous pass for cross-boundary issues — recurring terminology, the Stoic
logic vocabulary that recurs in §36 / §42 / §51, the "uninstructed" thread that
runs §46 → §48 → §50, and the progress/Socrates material set up in §46 and paid
off in §50. For terminology consistency I also checked the candidate's
established renderings outside scope (§1, §2, §13, §14, §23, §25, §29, §31–33)
so that in-scope choices could be judged against the book's own house usage
rather than against my preference.

Out-of-scope terminology findings (checked, all clean): the candidate uses
"within our control" consistently from §1 through §48, and "ruling mind" in both
§29 and §38.

---

## Blocking defects

### B1 — §46: object of the recommendation is reversed (actor/object swap)

- **Source:** "Persons used to come to him and ask to be recommended by him to
  philosophers, and he used to take them to philosophers, so easily did he
  submit to being overlooked."
- **Candidate:** "People would come to him and ask him to recommend
  philosophers, and he would take them to philosophers, so readily did he accept
  being overlooked."
- **What's wrong:** In the source, the visitors ask *to be recommended* — they
  want Socrates to introduce *them* to philosophers. In the candidate they ask
  him *to recommend philosophers*, i.e. to name good ones. The object of
  "recommend" has been swapped from the visitors to the philosophers. This is
  not a stylistic difference: the anecdote's whole point is that they come to
  Socrates as a go-between rather than as a philosopher in his own right, which
  is what makes his acquiescence an example of "submitting to being overlooked."
  Under the candidate's reading he is merely being asked for a referral, and the
  punchline about being overlooked is weakened.
- **Fix:** "People would come to him wanting him to introduce them to
  philosophers, and he would take them to philosophers, so readily did he accept
  being overlooked."

### B2 — §45: closing sentence drops the negation and re-states the claim

- **Source:** "Thus it will not happen to you to comprehend some appearances
  which are capable of being comprehended, but to assent to others."
- **Candidate:** "This way, what you accept as true will match what you actually
  perceive."
- **What's wrong:** Three problems in one sentence. (a) The source's negation
  ("it will **not** happen to you…") is gone; the candidate is a bare positive
  assertion. (b) The source's two-part contrast — comprehending impressions that
  *can* be comprehended, versus assenting to *other* ones — is collapsed into a
  single "match" claim. (c) The candidate substitutes "perceive" for the
  source's "comprehend," which shifts the sentence from a claim about assent
  outrunning cognition to a claim about perception, a different assertion. The
  result reads as a paraphrase of the drafter's interpretation rather than a
  modernization of the sentence.
- **Fix:** restore the negation and the contrast, e.g. "That way you will not end
  up grasping only some impressions that can be grasped, while giving your
  assent to others." If a plainer form is wanted, keep the negation and the
  assent/grasp distinction: "That way you will not find yourself assenting to
  impressions you have not actually grasped."

### B3 — §50: "as if" simile hardened into a factual claim (certainty shift)

- **Source:** "Whatever things (rules) are proposed to you (for the conduct of
  life) abide by them, as if they were laws, **as if you would be guilty of
  impiety if you transgressed any of them**."
- **Candidate:** "Hold to the rules laid down for your conduct as if they were
  laws, **and breaking any of them would violate a sacred duty**."
- **What's wrong:** The source runs two parallel "as if" clauses — treat them as
  if they were laws, as if breaking them were impiety. The candidate keeps the
  first "as if" and converts the second into an asserted consequence ("and
  breaking any of them would violate a sacred duty"). What the source offers as
  a deliberate stance to adopt, the candidate states as fact. The parallel
  construction is also lost.
- **Fix:** "Hold to the rules laid down for your conduct as if they were laws,
  and as if breaking any of them would be an act of impiety."

---

## Non-blocking notes

Listed by section. None of these alone changes what a sentence claims; a couple
(N6, N9, N14) are close enough to the line that I would fix them while the file
is open.

- **N1 — §36, "In logic" is an unlicensed addition.** Source: "As the
  proposition, it is either day, or it is night, is of great importance for the
  disjunctive argument…". Candidate: "In logic, 'It is day or it is night' works
  as an either-or statement…". The framing phrase is not in the source. It is a
  defensible reader aid, but it is an addition; flagging per the protocol.
- **N2 — §36, the value/no-value pairing is flattened.** Source contrasts "of
  great importance" against "of no value," which is what sets up the parallel
  with "of great value for the body … worth nothing." Candidate reduces the
  first half to "works as … but not as …". The analogy still lands via the
  second half, so this is stylistic, but the rhetorical parallel Epictetus is
  building is weaker than the source's.
- **N3 — §36, imperative "remember" dropped.** Source: "remember, to look not
  only to…". Candidate: "consider not only…". Minor.
- **N4 — §37, "unbecoming" flattened to "badly."** Source: "you have both acted
  in this manner in an unbecoming way". Candidate: "you both perform it badly."
  The source's point is unseemliness, not incompetence. Suggested: "you both
  perform it unbecomingly". Also, candidate's "neglect **the role** you could
  have fulfilled" supplies "role" where the source has only "that which you
  might have fulfilled" — harmless given the sentence's opening, but it is a
  supplied noun.
- **N5 — §39, "dyed purple" for "of a purple color."** The source describes the
  shoe's colour, not the process. Minor; "then purple" would be exact.
- **N6 — §40, the Latin gloss "(dominæ)" is dropped, and "Women" becomes
  "girls."** Source: "Women forthwith from the age of fourteen are called by the
  men mistresses (, dominæ)." Candidate: "As soon as girls reach fourteen, men
  address them as 'ladies'." "Ladies" is a fair modernization of *dominae* and
  "girls" is a reasonable reading at that age, but both are silent changes to the
  source's own nouns. If the edition's policy is to preserve translator glosses,
  restore *dominae* (e.g. "…men address them as 'ladies' — *dominae*").
- **N7 — §40, "discreet" → "sensible."** The source's third virtue is
  discretion/self-restraint; "sensible" reads as practicality. "Self-controlled"
  or "modest in conduct" would be closer. Minor.
- **N8 — §41, "mean capacity" and "the mind" both rendered with "mind."**
  Source contrasts "a mean capacity" (the small nature) with "the mind" (the
  faculty to be cared for). Candidate: "a sign of a limited mind … Direct all
  your care towards the mind." The same English word now sits on both sides of a
  contrast the source draws between two different things. Suggested: "It is a
  sign of a small nature…".
- **N9 — §42, causal "for" dropped before the closing formula.** Source: "you
  will be mild in temper to him who reviles you; **for** say on each occasion, It
  seemed so to him." Candidate: "Keep this in mind and you will be gentle with
  anyone who insults you. Say each time: 'That is how it seemed to them.'" In the
  source the saying is offered as the ground of the mildness; in the candidate it
  is a detached second instruction. Suggested: "…you will be gentle with anyone
  who insults you — so say each time: …".
- **N10 — §42, explanatory gloss added.** Candidate: "a true combined
  statement—**claims joined by 'and'**—is false". The em-dash gloss is not in the
  source. Acceptable as modernization of a technical term, but it is an addition
  and it is inconsistent with §36 (see N17).
- **N11 — §45, the translator's gloss "(early)" is dropped.** Source: "Does a
  man bathe quickly (early)?" The candidate must pick one sense and picks
  "quickly," which is defensible; noting the loss for the record.
- **N12 — §46, "in this way" dropped.** Source: "remember that **in this way**
  Socrates also altogether avoided ostentation" — i.e. by acting rather than
  lecturing, which is what the preceding sentence just described. Candidate:
  "Remember how completely Socrates avoided showing off," which keeps
  "altogether" but loses the back-reference that connects the anecdote to the
  advice. Suggested: "Remember that this is how Socrates too avoided showing off
  entirely."
- **N13 — §48, the "condition and characteristic" framing is dropped from the
  first two sentences but kept in the third.** Source: "The condition and
  characteristic of an uninstructed person is this: … The condition and
  characteristic of a philosopher is this: … The signs (marks) of one who is
  making progress are these: …". Candidate compresses the first two into plain
  assertions but keeps "These are the signs of someone making progress." The
  three-part parallel that organises the section survives only in part. Not a
  meaning change; a structural flattening worth restoring.
- **N14 — §49, "I rather blush" loses the comparative.** Source: "When, then,
  any man says to me, Read Chrysippus to me, **I rather blush**, when I cannot
  show my acts like to and consistent with his words." The "rather" is contrastive
  — he blushes instead of taking pride, which is the whole point after the
  preceding sentences about what is worth being proud of. Candidate: "I feel
  ashamed if I cannot show…". Suggested: "I feel ashamed rather than proud, if I
  cannot show…".
- **N15 — §49, "like to and consistent with" reduced to one term.** Source has
  two adjectives ("like to **and** consistent with his words"); candidate has
  only "that agree with his words." Suggested: "actions that match his words and
  agree with them." Also, "If I **merely** admire the explanation" supplies
  "merely," which is not in the source ("But if I shall admire the exposition").
- **N16 — §50, three small losses.** (a) "inglorious" → "shameful": inglorious
  is the absence of glory, not disgrace; suggested "without honour." (b) "a
  Socrates" (indefinite, twice) → "Socrates" / "like him"; the source's point is
  a type, not the man. (c) "ought to live as one who wishes to be a Socrates" →
  bare imperative "live as someone who wishes to be like him," dropping the
  modal. None change the claim.
- **N17 — cross-boundary: the Stoic conjunctive is rendered two different ways.**
  §36 renders the conjunctive as "a both-and statement"; §42 renders the same
  concept as "a true combined statement—claims joined by 'and'." A reader who
  met the term in §36 will not recognise it in §42. Pick one and use it in both
  — "both-and statement" is the cleaner of the two and needs no gloss on second
  appearance.
- **N18 — §51, "that on which we ought to rest" → "the one we should concentrate
  on."** The source's image is resting/relying on the first part; "concentrate
  on" is close but shifts from reliance to attention. Minor.
- **N19 — §52.2, the quotation's opening "But" is dropped.** Source: "**But**
  whoso nobly yields unto necessity…". Candidate: "Whoever nobly yields to
  necessity…". Minor connective loss inside a quoted fragment.
- **N20 — §52.1, "bid" left in place.** "Along the path you bid me take" is
  understandable but is the one lightly archaic verb left in the modernized
  verse. Optional: "the path you set for me." Everything else in §52 modernizes
  cleanly — "If I choose not" → "If I refuse," "wretch" → "miserable."

---

## Checks that came back clean

Recording these explicitly so the next reviewer knows what has already been
verified and need not be re-derived.

- **Unmodernized quotations (§52).** This is the book's highest-risk section and
  it passes. All three quotations — the Cleanthes hymn, the Euripides fragment,
  and the Crito/Apology line — are modernized in register to match the
  surrounding prose, with no archaic island left standing. Line breaks are added
  in the two verse quotations, which is a presentation change, not a content one;
  no paragraph boundaries move.
- **Silent corrections.** None found. In particular, §52.3 preserves the
  source's "Anytus and Melitus" rather than normalising to the standard spelling
  "Meletus." This is exactly right per the protocol — the source's form is what
  governs.
- **Proper nouns and allusions.** Chrysippus (§49, four occurrences), Homer
  (§49), Socrates (§46, §50), Zeus and Destiny (§52.1), Crito, Anytus, Melitus
  (§52.3), the Olympic Games (§50) all present and correctly placed.
- **Numbers.** "fourteen" (§40) preserved. "first / second / third" ordering in
  §51 preserved, including the dependency direction ("The third part is needed
  for the second, and the second for the first").
- **Negation elsewhere in scope.** Apart from B2, every negation checked out:
  §37 "neglect," §38 "not to step on a nail," §41 "secondary," §43 "do not grasp
  … that handle will not bear it," §44 "do not follow," §45 "Do not say," §46
  "Never call yourself," §47 "do not be proud / do not announce / tell no one,"
  §48 "never expects … criticise no one, praise no one, blame no one, accuse no
  one … make no defence … do not care," §50 "Pay no attention / a law you must
  not break," §51 "we must not lie" (three occurrences, all directions intact),
  §52.3 "they cannot harm me."
- **Causality in scope.** §37 ("both … and"), §39 ("Go beyond it, and…"), §42
  (duty → cannot follow → they are the one harmed), §44 (the "so" chains in all
  four arguments, and the direction of "do not follow" vs "do follow"), §49 (the
  "so … so far … once … if" chain), §51 (the needed-for chain and the closing
  "So we lie") all point the same direction as the source. The only causal loss
  is N9.
- **Conditions in scope.** §37 "If you take on a role beyond your strength,"
  §38 "If we follow this rule," §39 "Keep to what the body needs / Go beyond
  it," §42 "If their judgment is wrong," §43 "If your brother acts unjustly,"
  §46 "If a conversation … arises / When someone tells you," §47 "If you want to
  train yourself / If you are very thirsty," §48 "If someone praises them / if
  someone criticises them," §49 "Once I have found an interpreter / If I merely
  admire," §50 "If you remain careless / If anything hard or pleasant … comes
  your way," §52.1 "If I refuse," §52.3 "if this pleases the gods" — all survive
  with the same scope and the same consequence. The only condition defect is B3.
- **Omissions of whole clauses.** None found in scope beyond the gloss-level
  items noted in N3, N6, N11, N12, N15, N19.
- **Cross-boundary payoffs.** The "uninstructed" thread (§46 → §48 → §50) is
  rendered consistently as "untrained in philosophy." The Socrates material set
  up in §46 (avoiding ostentation) and paid off in §50 (Socrates became perfect
  by attending to nothing but reason) holds together. The digestion image in §46
  is carried consistently across its three uses (vomit up / digest within / the
  actions that come from digesting them). The handle image in §43 is complete on
  both ends. The measure image in §39 (body : possessions :: foot : shoe) keeps
  both halves of the proportion and the correct direction.

---

## Verdict

**ACCEPT WITH FIXES REQUIRED** — scoped to sections 36–52.

The rendering is a genuine modernization, not a summary or a mechanical
cleanup. Paragraph alignment is exact, the technical Stoic vocabulary is handled
with care, §52's quotations are properly modernized, and no silent historical
correction was made. The scope is close to publishable.

Three defects must be fixed before this scope is certified:

1. **B1 (§46)** — restore "ask him to introduce them to philosophers."
2. **B2 (§45)** — restore the negation and the grasp/assent contrast in the
   closing sentence.
3. **B3 (§50)** — restore the second "as if" clause so impiety is a stance
   adopted, not a fact asserted.

A re-draft is not warranted; all three are single-sentence patches. Once they
are applied, this scope should be re-read as a whole one more time (the fixes to
B2 and B3 both sit in long sentences where a patch can disturb the surrounding
clause), and the non-blocking items — N17 in particular, since it is the only
one that spans sections — resolved at the drafter's discretion.
