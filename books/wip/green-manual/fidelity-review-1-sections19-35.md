# Fidelity Review — *The Manual* (Epictetus, *Enchiridion*), Sections 19–35

**Reviewer:** independent fidelity reviewer (Reviewer B role), first fully
independent pass on this candidate.
**Protocol:** `books/prompts/fidelity-review-prompt.md` (small-packet method).
**Fidelity anchor:** `books/wip/green-manual/source.json` (George Long
translation, 52 sections, field `chapters`). No other translation was used as
an anchor at any point.
**Candidate:** `books/wip/green-manual/candidate.json` (52 sections).
**Date:** 2026-09-21

---

## 1. Coverage statement

**Certified scope:** sections 19–35 inclusive — 17 sections, **29 paragraphs**
(sections 19–32, 34, 35 have 1 paragraph each = 16; section 33 has 13).

**Context read but not certified:** section 18 (trailing context) and section 36
(leading context), read in full on both sides.

Every one of the 29 in-scope paragraphs was read **individually and in full**,
source against candidate, side by side. **Nothing was skimmed or sampled.**
Section 33's 13 sub-paragraphs were each compared as their own unit.

**Packets worked (each with one paragraph of context on each side):**

| Packet | Certified | Context read |
|---|---|---|
| P1 | 19, 20, 21, 22, 23, 24 | 18, 25 |
| P2 | 25, 26, 27, 28, 29 | 24, 30 |
| P3 | 30, 31, 32 | 29, 33.0 |
| P4 | 33.0–33.12 (13 paragraphs) | 32, 34 |
| P5 | 34, 35 | 33.12, 36 |

**Whole-scope re-read:** after the packets, sections 18–36 were re-read in one
continuous pass for cross-boundary issues (recurring technical vocabulary,
person/voice consistency, claims set up in one section and paid off in
another). A scripted term sweep across all 52 sections was also run to check
whether the candidate's renderings of the recurring Stoic terms are consistent
book-wide (results in §4 below).

Structural check: section numbers, titles and paragraph counts match 1:1
between source and candidate across the whole scope. No merging, splitting,
reordering, or dropped paragraphs. Alignment is intact.

---

## 2. Blocking defects (fixes required before acceptance)

### B1 — §20: the technical term "appearance/impression" is dissolved into "in the moment"

- **Source (§20):** "Therefore especially try not to be carried away by *the
  appearance*."
- **Candidate (§20):** "Most importantly: try not to be swept away *in the
  moment*."

**What's wrong.** *Phantasia* — the impression — is the load-bearing term of
this whole book, and §20 is one of its key statements: the thing that carries
you away is the *impression*, not "the moment." The candidate replaces the
object of the verb with a time adverbial, which quietly removes the doctrine
(it is your judgment about the impression that you must intercept) and leaves
generic advice about not reacting hastily. This is also the one place in the
entire candidate where the term disappears: the term sweep shows "impression"
used for *phantasia* in §§1, 6, 10, 18 and "appearance(s)" in §§16, 19, with
§20 the sole outlier.

**Fix.** Restore the object:
> "Most importantly: try not to be swept away by the impression."
(and see N9 on standardizing §16/§19 to "impression" as well).

---

### B2 — §20: the content of the opinion is lost ("that these things are insulting")

- **Source (§20):** "it is not he who reviles you or strikes you, who insults
  you, but it is *your opinion about these things as being insulting*."
- **Candidate (§20):** "but *your own opinion about what they have done*."

**What's wrong.** The source names the *specific judgment* that does the
damage: the opinion **that these things are insulting**. The candidate reduces
it to having "an opinion about what they have done," which is not the claim —
any opinion at all would satisfy the candidate's sentence, including a correct
one. The precise judgment is the thing Epictetus is telling you to withdraw,
and §20's next sentence ("it is your own judgment that has angered you")
depends on it.

**Fix.**
> "…but your own opinion that what they did is insulting."

---

### B3 — §29: "base (ugly) things" downgraded to "unpleasant things", breaking the shame payoff

- **Source (§29):** "but afterwards, when certain *base (ugly)* things have
  shown themselves, *you will be ashamed*."
- **Candidate (§29):** "and later *feel ashamed* when *unpleasant* things
  appear."

**What's wrong.** "Base/ugly" is a moral term (*aischra*); "unpleasant" is a
comfort term. The sentence's own consequence clause — *you will be ashamed* —
only follows from something shameful, not from something merely unpleasant, so
the candidate's own sentence no longer holds together. It also misstates the
argument of §29 as a whole, which is not "unpleasant surprises await" but
"you will find yourself doing something beneath you."

**Fix.**
> "…and later feel ashamed when shameful things show themselves."
(or "…when ugly things appear.")

---

## 3. Non-blocking defects and notes (recommended, not gating)

Ordered by section. None of these change a proposition; each is a small
omission, a small unlicensed addition, or a dropped connective.

**N1 — §19, omission.** Source: "a man honored *before others* or possessed of
great power or highly esteemed *for any reason*." Candidate: "someone honoured,
powerful, or highly regarded." Both qualifiers dropped. *Fix:* "someone
honoured above others, powerful, or highly regarded for any reason."

**N2 — §19, dropped connectives.** Source's "Take care *then*…" and "*For* if
the nature of the good is in our power…" both become bare sentences. The second
is a causal link (envy has no place *because* the good is in our power). *Fix:*
restore "So when you see someone…" and "For if what is good lies within our
power…".

**N3 — §22, hedging/strength shift.** Source: "*If you desire* philosophy."
Candidate: "*If you commit yourself to* philosophy." The source addresses
someone who is merely drawn to it; the candidate addresses someone who has
already committed, which is a different (and later) reader. *Fix:* "If you want
philosophy" or "If you set your heart on philosophy."

**N4 — §22, omission.** Source: "whence does he get this supercilious look
*for us*?" Candidate: "Where did he get that superior look?" The "at us" is
what makes the jeer a grievance. *Fix:* "…that superior look he gives us?"

**N5 — §23, omission.** Source: "you have lost your *purpose in life*."
Candidate: "you have lost your purpose." *Fix:* restore "purpose in life."

**N6 — §24, voice reframing (acceptable, flagged for the record).** Source puts
the objections in the second person as spoken *to* the student ("But your
friends will be without assistance!"); the candidate converts them into
first-person self-objections in quotation marks ("But my friends will go
without help!"). No proposition changes, the replies still line up, and it is
consistent with the candidate's opening frame ("Do not let thoughts like these
trouble you: 'I will live without honour…'"). Note also that the candidate
correctly keeps the one place the source *does* attribute speech to the friends
("'Then acquire money,' your friends say"). No fix required.

**N7 — §25, unlicensed addition.** Source: "when he does not visit *a man's*
doors as that other man does." Candidate: "does not visit *a powerful person's*
door." "Powerful" is implied by context but is not in the source. *Fix:* "does
not visit the man's door."

**N8 — §26, omission.** Source: "when your neighbor's slave has broken his cup,
*or anything else*, we are ready to say forthwith…" Candidate drops "or
anything else." *Fix:* "When your neighbour's slave breaks a cup or anything
else…"

**N9 — §26, person shift.** The source deliberately swings to the third person
for the hard case ("when *a man's* own child or wife is dead, forthwith *he*
calls out, Woe to me") and back to the first person plural for the moral ("*we*
ought to remember how *we* feel"). The candidate is second person throughout
("*you* cry out… Remember how *you* felt"). Meaning survives; the rhetorical
distance (observing the reaction rather than accusing the reader) does not.
Also "we ought to remember" loses its "ought", and "how we feel when we hear"
shifts to past tense. Acceptable as modernization; flagged as a deliberate
choice a second reviewer should confirm rather than a defect to patch blindly.

**N10 — §29, interpretive disambiguation.** Source: "if you still choose, go to
the contest: *if you do not* you will behave like children." Candidate: "*If
you do not consider it*, you will behave like children." The source's "if you
do not" is ambiguous (do not consider / do not choose); the candidate silently
resolves it. The resolution is the likelier reading, but it is an addition.
*Fix (optional):* keep it open — "If you do not, you will behave like
children."

**N11 — §29, gloss.** "examine your *loins*" → "your *lower back*." A
defensible modernization of an anatomical term, but "loins" here is the
hips/lower trunk as a wrestler's power source; "lower back" narrows it.
*Fix (optional):* "your hips."

**N12 — §31, dropped causality.** Source: "*for* every animal is formed by
nature to this, to fly from…" — this clause explains the preceding claim.
Candidate starts a new, unconnected sentence: "Every living creature is
naturally inclined to flee…" *Fix:* "For every living creature is naturally
inclined…".

**N13 — §31, dropped modal.** Source: "you must know that this is the chief
thing." Candidate: "the most important thing is…". Minor; no fix required.

**N14 — §32, silent identification.** Source: "the greater diviner, *the
Pythian god*." Candidate: "the greater diviner, *the god at Delphi*." This
swaps an epithet for a place-name — a small "correction to what is standard."
Comprehensible and arguably a fair gloss, but the source names the god, not the
site. *Fix:* "the Pythian god at Delphi."

**N15 — §33.4, gloss addition.** Source: "banquets which are given by strangers
and by *ignorant persons*." Candidate: "*people untrained in philosophy*." The
gloss is the standard sense of *apaideutoi* and is probably right, but it is an
addition of specificity the source does not carry in English. *Fix (optional):*
"strangers and the uninstructed."

**N16 — §33.4, narrowed referent.** Source: "that you slip not into the manners
of *the vulgar (the uninstructed)*." Candidate: "so that you do not slip into
*their* ways." Ties the warning to the hosts rather than to a class. Meaning
survives. No fix required.

**N17 — §33.9, omission and scope shift.** Source: "Do not go to the hearing of
*certain persons'* recitations, nor visit them *readily*." Candidate: "Do not
*readily* go to hear people recite or visit them." "Certain persons" is
dropped, and "readily" is moved forward so it now governs both verbs.
*Fix:* "Do not go to hear certain people's recitations, and do not visit them
readily."

**N18 — §33.12, omission.** Source: "It is a dangerous *habit* also to approach
obscene talk." Candidate: "Drifting into obscene talk is dangerous as well."
The word "habit" (the repeated slide, not the one lapse) is lost. *Fix:* "It is
a dangerous habit, too, to drift into obscene talk."

**N19 — §34, terminology.** Source: "If you have received *the impression* of
any pleasure." Candidate: "When *the thought* of a pleasure strikes you."
Same term as B1; the candidate elsewhere uses "impression." *Fix:* "When the
impression of a pleasure strikes you."

**Style-only notes (no fidelity impact, listed for the drafter):**

- §19 "You can be **undefeatable**" — "undefeatable" is a non-standard form;
  "unbeatable" or "invincible" reads better and is no less modern.
- §33.5 "**Leave out** everything intended for show or luxury" — "leave out" is
  odd for a prohibition; "cut out" or "exclude" is clearer.
- §20 "If you gain **even a little** time" — "even a little" is not in the
  source ("if you once gain time and delay") and "far easier" slightly
  over-renders "more easily." Harmless, but both are small unforced additions.

---

## 4. Whole-scope cross-boundary read

Read sections 18–36 straight through after the packets. Findings:

1. **Recurring term — *phantasia*.** Book-wide sweep: "impression" in §§1, 6,
   10, 18; "appearance(s)" in §§16, 19; "the thought" in §34; "in the moment"
   in §20. §20 is the only place where the term is removed entirely (B1) and is
   the only blocking instance. §§16, 19, 34 are internally comprehensible but
   inconsistent. *Recommendation:* standardize on "impression" everywhere.

2. **Recurring term — "in our power."** The source says "in our power"
   uniformly. The candidate alternates: "within our control" (§§25, 31, 32),
   "within/outside your power" (§§19, 23, 24), "outside their control" (§33.11).
   Every variant is accurate; the inconsistency just makes the book's central
   distinction look like several different ideas rather than one repeated one.
   *Recommendation:* pick one ("within our control" is the majority form,
   including §1) and use it throughout, allowing person to vary with context.
   Non-blocking.

3. **Claim set up in one section, paid off in another.** §19's "there is only
   one road to freedom: not caring about things outside your power" is
   correctly paid off by §24 (rank/office is not yours), §25 (you did not pay
   the price), §31 (good and evil only in what is within our control) and §32
   (the outcome is neither good nor bad). No contradiction introduced across
   packets.

4. **Person and address.** The candidate systematically converts the source's
   "a man / he / we" to "you." This is applied consistently across the scope
   (see N9), so it does not create cross-section incoherence; it is a global
   voice decision, not a drift.

5. **No unmodernized quotations.** Every quoted line in scope — the sneer in
   §22, the self-doubting thoughts and objections in §24, "These things happen"
   and "That is something that happens to people" in §26, the retort in §33.7 —
   is rendered in modern English with modern punctuation. No archaic islands.
   §33.7's retort was checked specifically for the protocol's "distinction
   depends on exact wording" case: source "The man did not know the rest of my
   faults, *for* he would not have mentioned these only" vs candidate "He did
   not know my other faults, *or* he would not have mentioned only these." The
   inference runs the same direction in both; the joke survives. No defect.

6. **Numbers, names, lists.** All checked and intact: the five children's games
   and the four adult roles (§29), Euphrates (§29), the pentathlon/wrestler
   pair (§29), Polynices and Eteocles (§31), Socrates (§32), Socrates and Zeno
   (§33.10), the four anticipations at the powerful man's door (§33.11), the
   four negatives on sacrifice — "neither grudgingly nor carelessly, neither
   stingily nor beyond your means" (§31), the obolus (§25). The deliberately
   crossed smith/shoemaker pairing in §24 ("not furnished with shoes by means
   of a smith, nor with arms by means of a shoemaker") is preserved crossed —
   correctly *not* silently "fixed." "Slaves" in §33.5 and §26 is preserved,
   not bowdlerized. Good.

7. **No inventions found.** Apart from the small glosses listed at N7, N10 and
   N15, nothing in sections 19–35 asserts anything the source does not.

---

## 5. Verdict — sections 19–35

### ACCEPT WITH FIXES REQUIRED

The rendering is faithful, complete and well-aligned. Across 29 paragraphs
there are **no dropped clauses of substance, no flipped negations, no actor
swaps, no invented claims, and no unmodernized quotations**. Paragraph
alignment is exact. A re-draft is not warranted anywhere in this scope.

**Required before acceptance (3 fixes, all one-line edits):**

1. **B1 — §20:** "swept away *in the moment*" → "swept away *by the
   impression*."
2. **B2 — §20:** "your own opinion *about what they have done*" → "your own
   opinion *that what they did is insulting*."
3. **B3 — §29:** "feel ashamed when *unpleasant* things appear" → "feel ashamed
   when *shameful* things show themselves."

Section 20 accounts for two of the three; it is the weakest paragraph in the
scope and should be re-read as a whole after patching.

**Recommended but not gating:** N1–N19 above, plus the two consistency sweeps
in §4.1 and §4.2. N8 (§26 "or anything else") and N12 (§31 dropped "for") are
the two I would most want taken, as they are a literal omission and a literal
dropped causal connective respectively.

Sections 18 and 36 were read as context only and are **not** certified by this
review.
