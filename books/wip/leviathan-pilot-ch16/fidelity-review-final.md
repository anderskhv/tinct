# Final fidelity review — Leviathan, edition ch. 16 (Hobbes ch. XV, "Of Other Laws of Nature")

**Scope:** Full, non-sampled read of all 43 paragraphs of
`candidate-sonnet.json` against `source.json`, in their current final state.
No sampling, no reliance on rounds 1–2 findings. Checked per paragraph for:
actors, negation, causality, certainty/hedging, conditions, omissions,
additions, silent corrections, and — for every numbered law — the exact
content of the prohibition/requirement and its ordinal.

**Verdict: ACCEPT AS-IS.**

One non-prose packaging note is recorded in §8 (missing `section` key). It is
not a fidelity defect and does not block pinning the prose hash, but it should
be handled when the chapter is merged into `leviathan-modern-en.json`.

---

## 1. Structure

| Check | Source | Candidate | Result |
|---|---|---|---|
| `number` | 16 | 16 | ✅ |
| `title` | `Chapter 15. Of Other Lawes of Nature` | `Chapter 15. Of Other Laws of Nature` | ✅ (spelling modernized only; chapter label "15", edition number 16, both intact) |
| Paragraph count | 43 | 43 | ✅ |
| Paragraph order | — | 1:1 positional | ✅ no merge, split, reorder, insertion, or drop |
| `section` | `Part I — Of Man` | absent | ⚠️ see §8 |

Every source paragraph maps to exactly one candidate paragraph at the same
index. Length ratios run 0.85–1.25; the two low outliers (¶2 0.85, ¶17 0.87)
and the high outliers (¶6 1.25, ¶19 1.22, ¶38 1.22) were each read
word-by-word against source and are compression of Hobbes's doubled
constructions / expansion of Latinisms respectively — no content loss or
invention in any of them.

---

## 2. The numbered laws — ordinals and load-bearing content

This is the critical axis. Every ordinal that appears in the source appears in
the candidate, at the same paragraph, with the same number. **No ordinal is
invented for a law the source leaves unnumbered, and none is renumbered.**

| ¶ | Ordinal in source | Ordinal in candidate | Law content — verified |
|---|---|---|---|
| 1 | "a Third … That Men Performe Their Covenants Made" | "a third law: that people keep the covenants they make" | ✅ Requirement preserved; the consequent ("covenants are vain / empty words", "right of all men to all things remaining", "still in the condition of war") all present with the same conditional force. |
| 16 | "the fourth Law of Nature" (gratitude) | "the fourth law of nature" | ✅ Quoted formula preserved in full, including the precise actor structure: the *receiver* of a free gift must endeavour that the *giver* have no reasonable cause to repent his goodwill. Direction of obligation not reversed. |
| 17 | "A fifth Law of Nature, is COMPLEASANCE" | "A fifth law of nature is COMPLAISANCE" | ✅ "That every man strive to accommodate himselfe to the rest" → "everyone should try to accommodate himself to the rest". Small-caps term retained. |
| 18 | "A sixth Law of Nature" (pardon) | "A sixth law of nature" | ✅ The condition is load-bearing and intact: pardon is owed *upon caution of the future time*, to those *that repenting, desire it*. Both qualifiers present. |
| 19 | Marginal heading "The Seventh, That In Revenges, Men Respect Onely The Future Good" | `[The seventh law: in taking revenge, men should look only to the future good.]` | ✅ Marginal note rendered as a bracketed gloss (house convention, matches ¶3, ¶33, ¶42). Ordinal preserved. |
| 20 | "A seventh is" | "A seventh law is" | ✅ "look not at the greatnesse of the evill past, but the greatnesse of the good to follow" — the negation and the contrast are both intact. Permitted purposes ("correction of the offender, or direction of others") preserved as an exhaustive pair. |
| 21 | "we may in the eighth place … set down this Precept" | "we may set down, as an eighth law of nature, this rule" | ✅ Prohibition intact: *no man*, by *deed, word, countenance, or gesture*, declare hatred or contempt. All four modes preserved; "countenance" → "expression". |
| 22 | "for the ninth Law of Nature, I put this" | "as the ninth law of nature, I set down this" | ✅ "That every man acknowledge other for his Equall by Nature"; breach = Pride. |
| 23 | *unnumbered* ("On this law, dependeth another") | *unnumbered* ("Another law follows from this one") | ✅ No ordinal invented. |
| 24 | *unnumbered* ("it is a precept of the Law of Nature") | *unnumbered* | ✅ |
| 26 | *unnumbered* ("from this followeth another law") | *unnumbered* | ✅ |
| 27 | *unnumbered* | *unnumbered* | ✅ |
| 30 | *unnumbered* ("It is also a Law of Nature") | *unnumbered* | ✅ |
| 31 | *unnumbered* ("it is of the Law of Nature") | *unnumbered* | ✅ |
| 33 | Marginal heading "The Eighteenth, No Man To Be Judge, That Has In Him Cause Of Partiality" | `[The eighteenth law: no man should be judge who has in him a cause of bias.]` | ✅ **Anomaly deliberately preserved, not regularized.** The candidate says "eighteenth" exactly where the source does, despite the intervening laws being unnumbered — i.e. Hobbes's own inconsistent numbering is carried through unaltered. No attempt to renumber it to a sequentially-derived value, and no editorial note apologizing for it. This is correct. |

Laws 10–17 and 19 are unnumbered in the source and remain unnumbered in the
candidate. The candidate never supplies a missing ordinal, never removes one,
and never silently corrects the eighteenth.

---

## 3. Paragraph-by-paragraph confirmation (all 43)

Grouped by theme; every index is accounted for.

### A. The third law and the definition of justice (¶1–3)

- **¶1** ✅ Derivation from the second law, the third law's content, the
  double consequence. "hinder the peace of Mankind" → "hinder the peace of
  mankind" (actor of the hindering is the retained right, not the person —
  preserved).
- **¶2** ✅ Fountain/origin of JUSTICE; the no-covenant→no-transfer→
  no-injustice chain; "the definition of INJUSTICE is … the Not Performance
  Of Covenant"; "whatsoever is not Unjust, is Just". Conditional structure
  ("where no covenant has been made" / "once a covenant is made") exact.
  Shortest ratio in the file (0.85) — purely the loss of Hobbes's doubling,
  no dropped clause.
- **¶3** ✅ The full argument: invalidity of mutual-trust covenants under
  fear; injustice impossible until fear is removed; impossibility of removing
  it in the natural condition; the coercive power requirement, including the
  *quantitative* condition on punishment (greater than the expected benefit
  of breach); the Scholastic definition quoted; the no-own→no-injustice and
  no-power→no-property→no-injustice chains; "the Validity of Covenants begins
  not but with the Constitution of a Civill Power". The "only once … "
  restrictive force of "begins not but with" is preserved.
  Marginal heading rendered as `[Justice and property begin with the founding
  of a commonwealth.]` — ✅.
  *Gloss:* "in the Schooles" → "in the schools — that is, in scholastic
  philosophy". Explanatory, adds no claim. Acceptable.

### B. The Fool (¶4–7)

- **¶4** ✅ Long and high-risk; read in full. The Fool's position is stated as
  *his* position throughout (no slippage into Hobbes's voice), the concessions
  he does *not* deny are preserved as concessions, the parenthetical "for the
  same Foole hath said in his heart there is no God" is kept, and the
  hypothetical chain (kingdom of God by force → by *unjust* force → not
  against reason → not against justice → else justice is not good) keeps every
  link and its interrogative mood. Coke on Littleton: attainder/treason →
  "convicted of treason", "Eo Instante the Atteynder be voyd" → "the
  conviction becomes void the instant it does". Saturn/Jupiter example intact,
  including the *concessive* force ("believed neverthelesse"). Parricide
  inference preserved with "though his father". Closing verdict — "This
  specious reasoning is nevertheless false" → "This plausible-sounding
  argument is nevertheless false" — keeps the judgment and its finality.
- **¶5** ✅ The refutation. The excluded case (mutual promises with no
  security, which "are no Covenants") is correctly excluded, not confused with
  the case under discussion. The two live cases (one party already performed /
  a power exists to compel) both present. "And I say it is not against reason"
  — the answer's polarity is correct. First consideration (foreseeable
  self-destruction not redeemed by unforeseeable accident) ✅. Second
  consideration (confederates; the betrayer can expect no safety beyond his
  own single power; cannot be received into society except by others' error;
  cannot be retained once the error is seen; cannot reasonably reckon on
  others' errors) ✅ — every negation intact. Closing: those who forbear him do
  so "onely out of ignorance of what is good for themselves" ✅.
- **¶6** ✅ Heaven. "frivolous" → "worthless"; "there being but one way
  imaginable; and that is not breaking, but keeping of Covenant" — the
  exclusivity ("one way") and the negation/affirmation pair both preserved.
  Ratio 1.25 is expansion of the elliptical Jacobean syntax only.
- **¶7** ✅ Rebellion. The key modal distinction — the event may follow, yet it
  *cannot reasonably be expected* — preserved, with "but rather the contrary"
  kept as a separate claim. Second reason (teaching others) kept. Conclusion:
  justice is a rule of reason forbidding anything destructive to our life,
  "and consequently a Law of Nature" ✅.

### C. Objections answered (¶8–9)

- **¶8** ✅ The eternal-felicity party; the parenthetical about killing/
  deposing/rebelling against a sovereign "constituted over them by their own
  consent" ✅ (the consent clause is load-bearing and present). The epistemic
  grounds — no natural knowledge of the state after death, still less of the
  reward for breach of faith, only belief grounded on others' hearsay chain —
  preserved with the hearsay regress intact. Conclusion's negation ✅.
- **¶9** ✅ Heretics and habitual covenant-breakers. The reductio is exact: if
  a fault sufficed to *discharge* a covenant made, it ought to have sufficed to
  *hinder the making* of it. Both limbs and their temporal order preserved.

### D. Just/unjust of men vs. actions (¶10–13)

- **¶10** ✅ The manners/actions distinction; just man = takes all the care he
  can, unjust man = neglects it; righteous/unrighteous terminological note;
  the asymmetry that neither title is lost by isolated contrary acts.
  *Two glosses noted and judged acceptable:*
  (a) "such Actions, as he does, or forbeares to do, for feare" → "just
  actions he performs, or wrong actions he refrains from, out of fear" — the
  candidate supplies the implied valence. This is the standard reading and
  does not change the claim (the reason given, "because his Will is not framed
  by the Justice, but by the apparant benefit", is preserved and is what
  makes the valence explicit anyway).
  (b) "Noblenesse or Gallantnesse of courage" → "nobility or generosity of
  spirit" — "of courage" is absorbed into "spirit". Slight softening; the
  rarity parenthetical "(rarely found)" and the scorn-to-be-beholden-to-fraud
  content are both intact. Not a fidelity defect.
- **¶11** ✅ Justice of actions → guiltless, not just; injustice ("also called
  Injury") → guilty. The *merely* force of "but" preserved twice.
- **¶12** ✅ Injustice of manners as disposition, injustice *before* any act
  and without any individual injured; injustice of an action requires an
  individual injured, "namely him, to whom the Covenant was made". The
  master/servant/stranger case keeps all three roles and the injury/damage
  split in the correct direction (injury→master, damage→stranger, no
  obligation to the stranger therefore no injury to him). Debts remittable by
  private men, robbery/violence not, "because … Robbery and Violence, are
  Injuries to the Person of the Common-wealth" ✅.
- **¶13** ✅ Volenti non fit injuria. Both branches of the dilemma (right not
  passed away → no breach; right passed away → signified will releases the
  covenant) present, in order, with the same conclusion each time.

### E. Commutative and distributive justice (¶14–15)

- **¶14** ✅ The writers' division; arithmetical/geometrical proportion;
  their placement of each; the "as if" examples (unjust to sell dearer than
  we buy / to give more than a man merits) kept as *their* implication, not
  Hobbes's. Hobbes's counter-claims — value measured by contractors'
  appetite, just value = what they are content to give; merit not due by
  justice but rewarded of grace only, with the covenant-merit exception
  correctly parenthesized and correctly assigned to *commutative*, not
  distributive, justice — all exact. Verdict "is not right" ✅. Proper
  definition with its list of contract types complete (buying/selling,
  hiring/letting to hire, lending/borrowing, exchanging, bartering, other
  acts of contract).
  *Glosses:* "equality of amount" / "equality of ratio" added for the two
  proportions. Explanatory, correct, non-distorting. (Verified this is the
  round-2 corrected paragraph; the arithmetical/geometrical pairing is right
  way round.)
- **¶15** ✅ Distributive justice = justice of an arbitrator; the trust
  condition; "though improperly" → "loosely"; "but more properly Equity;
  which also is a Law of Nature, as shall be shewn in due place" — the
  forward reference preserved.

### F. Fourth through ninth laws (¶16–22)

- **¶16** ✅ (See §2.) Also: the grace/free-gift parallel to covenant; the
  reason no one gives but with intention of good to himself; the collapse
  chain (no benevolence → no trust → no mutual help → no reconciliation →
  remain in war) with every link; "contrary to the first and Fundamentall Law
  of Nature, which commandeth men to Seek Peace" ✅; ingratitude:grace ::
  injustice:obligation-by-covenant analogy preserved in the correct direction.
- **¶17** ✅ The stone simile in full (asperity and irregularity of figure →
  takes more room than it fills; hardness → cannot be made plain → hinders the
  building → cast away as unprofitable and troublesome), and the human
  parallel matched limb for limb (asperity of nature → retains what is
  superfluous to himself and necessary to others; stubbornness of passions →
  cannot be corrected → to be left or cast out as cumbersome). The right-*and*-
  necessity-of-nature premise ✅; the guilt assignment ("is guilty of the
  warre that thereupon is to follow") ✅. SOCIABLE / *commodi* / the four
  contrary terms all present (stubborn, unsociable, peevish, intractable —
  "froward" → "peevish").
- **¶18** ✅ (See §2.) The three-way distinction — pardon to the persevering
  is fear not peace; refusal to those who give caution is a sign of aversion
  to peace — preserved with both negations.
- **¶19** ✅ Marginal heading. (See §2.)
- **¶20** ✅ (See §2.) Plus: the derivation from the preceding law; the
  vainglory argument with "(for the End is alwayes somewhat to Come)" kept;
  hurt without reason → war → against the law of nature → "commonly stiled by
  the name of Cruelty" ✅.
- **¶21** ✅ (See §2.) Premise "most men choose rather to hazard their life,
  than not to be revenged" preserved, including the double negative.
  *Gloss:* "contumely — that is, open insult or scorn". Added definition, no
  new claim.
- **¶22** ✅ Equality in mere nature; present inequality introduced by civil
  laws; the Aristotle critique with both parenthetical jabs intact and
  correctly attributed; "which is not only against reason; but also against
  experience" — both limbs. The two empirical claims preserved with their
  exact hedging: "very few so foolish" and the graded "not alwaies, or often,
  or almost at any time" → "not always — or even often, or hardly ever". The
  disjunctive argument (if nature made men equal → acknowledge it; if unequal
  → equality must *still* be admitted, because men who think themselves equal
  will not enter peace but on equal terms) keeps both horns and the concessive
  "yet". Ninth law and "Pride" ✅.

### G. Modesty, equity, distribution (¶23–29)

- **¶23** ✅ Dependence on the preceding law; the reciprocity test stated as a
  prohibition on reserving any right one is unwilling to see reserved to all.
  The necessary-to-lay-down / necessary-to-retain balance preserved, with the
  retained list complete (govern own body; air, water, motion; ways to go
  from place to place; all things else without which a man cannot live, or
  not live well) — including the "or not live well" qualifier. Modest /
  Arrogant; *pleonexia* glossed exactly as Hobbes glosses it.
- **¶24** ✅ Trusted judge must deal equally; without it controversies can be
  determined only by war; the partial judge "doth what in him lies" to deter
  men from using judges and arbitrators → cause of war, "(against the
  fundamentall Lawe of Nature)" ✅.
- **¶25** ✅ EQUITY defined as the observance; the back-reference "(as I have
  sayd before)" kept; "Acception Of Persons, Prosopolepsia" → "favoritism, or
  Prosopolepsia — that is, showing partiality toward particular persons". Term
  retained, gloss added.
- **¶26** ✅ Indivisibles enjoyed in common *if it can be*; without stint *if
  the quantity permits*; otherwise proportionally to the number that have
  right. All three conditional tiers, in order, with their conditions intact.
- **¶27** ✅ The residual case (neither divisible nor enjoyable in common);
  entire right *or* — with the alternation parenthetical — first possession,
  determined by lot; the justification (equal distribution is of the law of
  nature; no other means can be imagined) ✅ including its universal negation.
- **¶28** ✅ Two sorts of lot; arbitrary = agreed by the competitors; natural
  = primogeniture (*kleronomia*, "given by lot") or first seizure. Greek term
  and its gloss preserved.
- **¶29** ✅ The inference: to the first possessor, and in some cases to the
  firstborn, "as acquired by Lot". Source's typo "is some cases" read as "in
  some cases" — a correct and unavoidable reading, not a substantive change.

### H. Arbitration (¶30–35)

- **¶30** ✅ Safe conduct for mediators of peace; the end/means chain (peace as
  end → intercession as means → safe conduct as means to intercession) kept in
  full and in order.
- **¶31** ✅ The two question-types with their labels attached to the right
  ones (former = question of fact, later = question of right) — not swapped.
  The conditional ("unlesse the parties … Covenant mutually to stand to the
  sentence of another, they are as farre from Peace as ever") preserved as a
  necessary condition. ARBITRATOR defined; the law stated.
- **¶32** ✅ Presumption of self-interest; no man fit arbitrator in his own
  cause; the concessive second argument ("and if he were never so fit; yet
  Equity …") preserved as concessive, with the symmetry conclusion and
  "against the Law of Nature".
- **¶33** ✅ Marginal heading, eighteenth-law anomaly preserved. (See §2.)
- **¶34** ✅ The three interests (profit, honour, pleasure), "apparently
  ariseth out of the victory of one party, than of the other"; the bribe
  argument with its concession "(though an unavoydable bribe, yet)" rendered
  as "even if an unavoidable one" — concession intact; "no man can be obliged
  to trust him" ✅ (obligation, not ability).
- **¶35** ✅ Controversy of fact; the judge's parity of credit; the
  parenthetical condition "(if there be no other Arguments)"; recourse to a
  third, or third and fourth, or more; else undecided and left to force.

### I. Closing matter (¶36–43)

- **¶36** ✅ These laws dictate peace as a means of conserving men in
  multitudes and concern *only* the doctrine of civil society; the excluded
  class (drunkenness and other intemperance) acknowledged as also forbidden by
  the law of nature but not necessary or pertinent to mention here. The
  concession and the exclusion are both preserved — the candidate does not
  turn "may therefore also be reckoned amongst" into a flat assertion.
- **¶37** ✅ The self-deprecating concession about subtlety; the two reasons
  most men miss it (too busy getting food / too negligent); the purpose "to
  leave all men unexcusable"; the Golden Rule in its *negative* form — "Do not
  that to another, which thou wouldest not have done to thy selfe" — correctly
  kept negative, not flipped to the positive formulation. The balance-scale
  procedure preserved step by step, including "that his own passions, and
  selfe-love, may adde nothing to the weight", and the conclusion's double
  negative ("there is none of these Lawes … that will not appear … very
  reasonable") rendered as "none … will fail to seem … thoroughly reasonable"
  — polarity correct.
- **¶38** ✅ Marginal heading `[But in practice, only where there is
  security.]`. *In foro interno* / *in foro externo* both retained as Latin
  with glosses; the crucial asymmetry — bind to a desire always, to the act
  "not alwayes" — preserved exactly, with the hedge on the external
  obligation. Both supporting arguments intact. Ratio 1.22 is the Latin
  glossing.
  *Silent repair noted:* the source sentence "he that shall observe the same
  Lawes towards him, observes them not himselfe, seeketh not Peace, but War"
  is elliptical in this text (a relative pronoun is missing). The candidate
  renders the standard reading — "a man who keeps these laws toward someone
  who does not keep them himself is not seeking peace but war". This is the
  only defensible reading and the only one that preserves the argument; it is
  recorded here as a deliberate, correct disambiguation rather than an
  unlogged silent correction.
- **¶39** ✅ Breach of an *in foro interno* obligation by an act that conforms
  to the law but is believed contrary to it.
  *Silent repair noted:* the source's second sentence is truncated ("For
  though his Action in this case, be according to the Law; which where the
  Obligation is In Foro Interno, is a breach."). The candidate supplies "his
  intention" as the subject of "is a breach". This is the standard editorial
  reading, matches the first sentence's claim, and invents nothing beyond
  making the sentence grammatical. Recorded, accepted.
- **¶40** ✅ Immutable and eternal; the vice list complete and in order
  (injustice, ingratitude, arrogance, pride, iniquity, acception of persons —
  rendered "favoritism", consistent with ¶25 — and the rest); "can never be
  made lawfull"; the closing impossibility claim with both halves ("war shall
  preserve life, and peace destroy it").
- **¶41** ✅ Easy to observe *because* they oblige only to desire and
  endeavour; the qualifier "I mean an unfeigned and constant endeavour"
  preserved (both adjectives); "he that endeavoureth their performance,
  fulfilleth them; and he that fulfilleth the Law, is Just" — the two-step
  inference kept as two steps.
- **¶42** ✅ Read in full. The science of these laws is "the true and onely
  Moral Philosophy" — exclusivity preserved. Definition of moral philosophy;
  good/evil as names of appetites and aversions; variation across tempers,
  customs and doctrines; the two levels of disagreement (sense-pleasantness
  and conformity-to-reason); intrapersonal variation over time; the
  consequence (disputes, controversies, war). Private appetite as measure of
  good and evil in mere nature ✅. The universal agreement claim — peace is
  good, therefore the means of peace are good — with the named means complete
  (justice, gratitude, modesty, equity, mercy, and the rest) and the
  back-reference kept. Moral virtues / contrary vices ✅. The critique of the
  moral philosophers: they acknowledge the same virtues and vices, but do not
  see wherein their goodness consists, nor that they are praised as means to
  peaceable, sociable and comfortable living, and so place them in a
  mediocrity of passions. Both "as if" examples keep the cause/degree and
  cause/quantity contrasts, with the negated term and the affirmed term on the
  correct sides ("the degree of daring, not its cause, that made courage";
  "the size of a gift, not its motive, that made generosity"). Rendering
  "Cause" as "motive" in the second example is a light localization of the
  same contrast; the argument is unaffected.
- **¶43** ✅ The closing qualification. Dictates of reason are called laws
  "but improperly"; they are conclusions or theorems about what conduces to
  one's own conservation and defence; the proper definition of law as the word
  of him that by right has command over others; and the *conditional*
  rehabilitation — if considered as delivered in the word of God, who by right
  commands all things, "then are they properly called Lawes". The conditional
  is preserved as a conditional, not asserted.

---

## 4. Actors, negation, causality — targeted sweep

Re-checked as a separate pass across the whole chapter, independent of the
per-paragraph read:

- **Actors.** No reversal found. The highest-risk cases — giver/receiver in the
  fourth law (¶16), master/servant/stranger and injury/damage (¶12), judge vs.
  parties (¶24, ¶32, ¶34, ¶35), the Fool's voice vs. Hobbes's (¶4–5), "they
  say" attributions to the Schoolmen (¶3) and to the writers on justice (¶14)
  and on moral philosophy (¶42) — are all correctly assigned.
- **Negation.** Every negative in the source survives as a negative. Spot
  risks confirmed: ¶2 ("no action can be Unjust"), ¶6 ("not breaking, but
  keeping"), ¶9 (the reductio), ¶11 ("not Just, but Guiltlesse"), ¶12
  ("without supposing any individuall person injured"), ¶20 ("look not at …
  but at"), ¶27 ("cannot be imagined"), ¶37 (negative Golden Rule; final
  double negative), ¶38 ("not alwayes"), ¶40 ("can never be made lawfull"),
  ¶42 ("not seeing wherein consisted their Goodnesse"), ¶43 ("but
  improperly").
- **Causality.** Derivation markers preserved in kind and direction:
  "there followeth a Third" (¶1), "consequent to the next before it" (¶20),
  "On this law, dependeth another" (¶23), "from this followeth another" (¶26),
  "For the same reason" (¶34). No causal link inverted; no new causal claim
  introduced.
- **Certainty / hedging.** "may be called", "may in the eighth place", "though
  improperly", "may seem too subtile", "not alwayes", "almost at any time",
  "very prone to inferre", "it is manifest" — each rendered at the same
  strength. No hedge dropped, no hedge added over an assertion, no assertion
  weakened.
- **Conditions.** All conditional and restrictive clauses verified present:
  "upon caution of the Future time" (¶18), "if it can be" / "if the quantity
  of the thing permit" (¶26), "making the use alternate" (¶27), "if there be
  no other Arguments" (¶35), "in case a man think it contrary" (¶39), "if we
  consider the same Theoremes, as delivered in the word of God" (¶43).

---

## 5. Omissions

None found. Every proper noun, Latin term, Greek term, citation and list item
present in the source is present in the candidate: Aristotle's *Politics* bk. I,
Coke's *Commentary on Littleton*, Saturn and Jupiter, the Schools, *commodi*,
*pleonexia*, *Prosopolepsia*, *kleronomia*, *in foro interno* / *in foro
externo*, COMPLAISANCE, SOCIABLE, EQUITY, ARBITRATOR, JUSTICE, INJUSTICE.
Small-caps emphasis on defined terms is preserved. No clause, example, or
list item was dropped anywhere, including in the compressed paragraphs (¶2,
¶10, ¶17).

## 6. Additions

All additions are bracketed or inline glosses of terms the source itself uses;
none introduces a claim Hobbes does not make:

| ¶ | Addition | Judgment |
|---|---|---|
| 3 | "that is, in scholastic philosophy" | Definitional gloss ✅ |
| 14 | "equality of amount" / "equality of ratio" | Definitional gloss ✅ |
| 21 | "that is, open insult or scorn" | Definitional gloss ✅ |
| 25 | "that is, showing partiality toward particular persons" | Definitional gloss ✅ |
| 38 | "within the inner court of conscience" / "in outward action" | Definitional gloss ✅ |
| 10 | "just actions"/"wrong actions" valence supplied | Standard reading; warranted by the source's own stated reason ✅ |

Marginal headings (¶3, ¶19, ¶33, ¶42) are bracketed, which distinguishes them
from body text and preserves them rather than absorbing or deleting them.
Consistent across all four.

## 7. Silent corrections

Two, both at ¶38 and ¶39, both repairs of genuinely defective source sentences
rather than changes of meaning. Documented in §I above. Neither regularizes the
eighteenth-law numbering, and no other silent correction was found — notably,
the candidate does **not** tidy Hobbes's ordinal sequence, does **not**
renumber the unnumbered laws, and does **not** harmonize "Acception of
Persons" across ¶25 and ¶40 inconsistently (it uses "favoritism" in both).

## 8. Non-fidelity packaging note (non-blocking)

`candidate-sonnet.json` has keys `number`, `title`, `paragraphs`.
`source.json` and `current-modern-en.json` additionally carry
`"section": "Part I — Of Man"`. Nothing in the prose is affected, and the
paragraph hash is unaffected, but the `section` value must be carried over
when this chapter replaces the current modern-en chapter 16, or the
part-heading will be lost in the shipped edition.

---

## Coverage statement

- Both files read in full, in this pass, from disk — not from prior rounds'
  summaries.
- 43/43 paragraphs individually confirmed against their source counterparts on
  all eight axes. No paragraph was sampled, skimmed, or carried over on the
  strength of round 1 or round 2.
- All 8 ordinals present in the source (third, fourth, fifth, sixth, seventh
  ×2, eighth, ninth, eighteenth) verified for both ordinal value and law
  content; all 9 unnumbered laws verified to remain unnumbered.
- Eighteenth-law anomaly confirmed preserved and **not** regularized.
- Structure confirmed: 43 paragraphs, `number` 16, title `Chapter 15. Of Other
  Laws of Nature`, 1:1 paragraph alignment.

**Verdict: ACCEPT AS-IS.** No prose fixes required. Safe to pin the hash.
Carry the `section` field over at merge time (§8).
