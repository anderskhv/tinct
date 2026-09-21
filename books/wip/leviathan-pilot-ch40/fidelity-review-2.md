# Fidelity Review 2 — Leviathan, edition ch. 40 (Hobbes ch. 39)

"Of the Signification in Scripture of the Word Church"

Reviewer: independent fidelity reviewer (Reviewer B, second pass), per
`books/prompts/fidelity-review-prompt.md`.
Fidelity anchor: `books/wip/leviathan-pilot-ch40/source.json` (5 paragraphs).
Candidate: `books/wip/leviathan-pilot-ch40/candidate-sonnet.json` (5 paragraphs).
Baseline: `books/wip/leviathan-pilot-ch40/fidelity-review-1.md` (ACCEPT AS-IS).

This is a **targeted re-check of the revision round**, not a fresh full first
pass. The chapter already carries a documented independent ACCEPT AS-IS.
Indices below are **0-based**, matching Review 1 (para 0 = "The word Church…",
para 4 = "It followeth also…"). The task brief's "paragraph 1/2/3/4" maps to
these same indices.

## Coverage

Exact coverage: **all 5 paragraphs (0–4) re-read individually and in full,
source vs. candidate, clause by clause.** Nothing skimmed or sampled. The
chapter is one packet; the "one paragraph of context each side" rule is
satisfied trivially because the whole chapter was in view at once.

- Paragraphs 1, 2, 3, 4 (the four revised paragraphs) were checked against the
  source on the full standard checklist — actors, negation, causality,
  certainty/hedging, conditions, omissions, additions, silent corrections,
  unmodernized quotations — as new, previously uncertified text.
- Paragraph 0 was re-read in full to confirm nothing migrated into or out of it
  across the 0/1 boundary. It is unchanged from the version Review 1 certified.
- A **whole-chapter re-read** was then done in one pass for cross-boundary
  issues: the four senses of *Ecclesia* set up in paras 0–2 and paid off by "in
  this last sense only" in para 3; the single-sovereign argument running 3→4;
  and consistency of the recurring terms *house / building / congregation /
  assembly / commonwealth / sovereign / pastor*.

Structural check:
- **Paragraph count 5 = 5.** Order preserved. Nothing merged, split, reordered,
  dropped or invented at the paragraph level. (Sentence-level splitting inside
  paragraphs 1, 3 and 4 is intra-paragraph only and does not disturb
  alignment.)
- Chapter `number` (40) and `title` identical in both files.
- All nine untranslated Greek/Latin terms still present.

## 1. N2 — confirmed applied

Source (para 1): `as he that spake was called Ecclesiastes, and Concionator.`
Previous candidate: `the speaker himself being called Ecclesiastes, or Concionator.`
Current candidate: `called the speaker himself both Ecclesiastes and Concionator.`

**N2 is applied** — "or" is now "and". Note that the revision also added "both",
which is harmless in itself, but the sentence it now sits in introduced a new
attribution error; see **F1**.

## Blocking defects

**None.** No invented claim, dropped clause, flipped negation, reversed
causality or broken condition was found. All three fixes below are patch-level.

## NEW defects found (fixes required)

### F1 — para 1: the Roman commonwealth is made to call the speaker *Ecclesiastes*

- **Source:** `and which in the Common-wealth of Rome was called Concio, as he that spake was called Ecclesiastes, and Concionator.`
- **Candidate:** `The Roman commonwealth called this same kind of assembly Concio, and called the speaker himself both Ecclesiastes and Concionator.`
- **What's wrong (actors / silent correction):** In the source, "as he that
  spake was called…" is an agentless passive spanning both linguistic worlds:
  the Greek assembly's speaker is *Ecclesiastes* (ἐκκλησιαστής, from *ekklēsia*),
  the Roman one's is *Concionator* (from *concio*). The sentence split promoted
  "The Roman commonwealth" to the subject of *both* verbs, so the candidate now
  asserts that **Rome** called the speaker *Ecclesiastes*. That is false, and it
  is the one error this chapter can least afford: the entire chapter is an
  argument about which word belongs to which language and sense. It also
  collides with the paragraph's own newly added Latin/Greek framing two
  sentences later, where the candidate correctly assigns Greek forms to Greek.
  This defect did not exist in the pre-revision wording Review 1 certified; the
  accessibility split introduced it.
- **Fix:** restore the agentless passive, keeping the applied N2 "and":
  `The Roman commonwealth called this same kind of assembly Concio, and the speaker was called Ecclesiastes, and Concionator.`
  If the drafter wants the pairing made explicit rather than implicit, the
  accurate version is `…and the speaker was called Ecclesiastes in Greek, and Concionator in Latin.` — but the agentless form above is the minimal, safest fix.

### F2 — para 2: "the redeemed in heaven" over-specifies, and contradicts Hobbes

- **Source:** `which is meant of the Church Triumphant, or, Church To Come.`
- **Candidate:** `meaning the "church triumphant" — that is, the redeemed in heaven, as distinct from the church still on earth — or the church still to come.`
- **What's wrong (additions / silent correction):** The gloss imports the
  conventional scholastic militant/triumphant pair and locates the triumphant
  church **in heaven**. Two problems. (i) Hobbes's own sentence *equates*
  "Church Triumphant" with "Church To Come" — for him it is a future state, and
  his doctrine elsewhere in Part III (notably ch. 38, on the place of eternal
  life) is emphatically that the faithful are raised and reign **on earth**, not
  in heaven. A gloss asserting "the redeemed in heaven" states as Hobbes's
  meaning a position Hobbes specifically argues against; it is precisely the
  "changed to what is historically/doctrinally standard rather than what the
  source says" failure mode. (ii) "as distinct from the church still on earth"
  adds a contrast term (the church militant) that is nowhere in the source, and
  it sits awkwardly against the candidate's very next words, "or the church
  still to come", which is the source's *own* restatement.
- **Fix:** gloss the phrase without assigning a location or an unstated
  counterpart:
  `meaning the "church triumphant" — the church in its final, glorified state — or the church still to come.`
  Dropping the gloss entirely and leaving `meaning the church triumphant, or the church to come` is also fully acceptable and is what Review 1 certified.

### F3 — para 4: "rightly called pastors too" adds an endorsement the source does not make

- **Source:** `The Doctors of the Church, are called Pastors; so also are Civill Soveraignes:`
- **Candidate:** `The teachers of the church are called pastors — and civil sovereigns are rightly called pastors too.`
- **What's wrong (certainty / additions):** The source states a fact of usage
  ("so also are"). The candidate inserts **"rightly"**, an evaluative
  endorsement of the usage. Hobbes does go on to argue for the conclusion, but
  he argues for it in the following sentences; asserting it as already-settled
  here front-loads the conclusion into the premise and strengthens an
  unqualified statement beyond the source.
- **Fix:** `The teachers of the church are called pastors — and so are civil sovereigns.`

### F4 — para 4: "between his loyalty as a Christian and his loyalty as a citizen"

- **Source:** `and (which is more) in every Christian mans own brest, between the Christian, and the Man.`
- **Candidate:** `and (what is more) in every Christian man's own breast — between his loyalty as a Christian and his loyalty as a citizen.`
- **What's wrong (additions / over-specification):** Two changes, both
  interpretive. (i) **"the Man" → "a citizen"** narrows Hobbes's term. "The
  Man" is the natural man, the whole temporal person — the term that keeps the
  clause parallel with the three preceding pairs (church/state,
  spiritualists/temporalists, sword of justice/shield of faith) and that carries
  the sting of the "which is more": the division is not merely institutional but
  runs through what a person *is*. "Citizen" reduces it to a civil role and, in
  Hobbes, "man" and "subject/citizen" are not interchangeable. (ii)
  **"loyalty"** is a noun the source does not use; Hobbes names two identities,
  not two allegiances. Review 1 specifically recorded this clause as preserved
  verbatim; the revision moved it from faithful to interpretive.
- **Fix:** restore the source's own terms:
  `and (what is more) in every Christian man's own breast — between the Christian and the man.`
  If the drafter judges the bare phrase too opaque for a modern reader, the
  closest acceptable expansion keeps both identities:
  `— between himself as a Christian and himself as a man.` "Citizen" and
  "loyalty" should both go.

## Verified as requested — the three specific checks

### (a) "Ecclesia Legitima is Latin / Ennomos Ecclesia is Greek" — accurate

- **Source:** `it was Ecclesia Legitima, a Lawfull Church, Ennomos Ecclesia.`
- **Candidate:** `it was, in Latin, Ecclesia Legitima, and in Greek, Ennomos Ecclesia — both meaning simply "a lawful church."`

The claim holds. *Legitima* is the Latin feminine adjective of *legitimus*
("lawful, according to law"), agreeing with *ecclesia* (a Greek loanword fully
naturalized in Latin; the noun form is identical in both languages, which is why
the adjective is what distinguishes them). *Ennomos* is the transliterated Greek
ἔννομος, "within the law, lawful" — and it is exactly the word in the anchor
citation, Acts 19:39, ἐν τῇ ἐννόμῳ ἐκκλησίᾳ, "in a lawful assembly." Both
phrases therefore mean the same thing, one in each language, which is what the
candidate says. The word order is also right in each language (Latin adjective
following the noun, Greek adjective preceding it), so the gloss does not create
a false form.

This is **explicitation, not interpretation**: the source's juxtaposition of the
two phrases with a single English gloss between them already presupposes they
are the same term in two languages, and the paragraph has established the
Greek/Roman frame two sentences earlier. Not a defect. One caveat, recorded but
not charged: "simply" is a small added flattener; it may stay.

Related, non-defective: `it was what the Greeks called Ecclesia Sugkechumene —
"a confused church."` adds "what the Greeks called", an attribution the source
leaves implicit. It is accurate (the phrase is Greek, from Acts 19:32 — see
Review 1's C2) and consistent with the paragraph's frame. Acceptable.

### (b) The "person" clarification sits OUTSIDE the quoted definition — confirmed

Candidate (para 3):

> …I define a CHURCH to be, 'a company of men professing the Christian religion,
> united in the person of one sovereign, at whose command they ought to
> assemble, and without whose authority they ought not to assemble.' (Here
> "person" is used in its political sense: a single sovereign authority, not
> necessarily one individual ruler.)

The closing quotation mark falls before the gloss; the gloss is a separate
parenthetical sentence after the quotation closes. **It is not interpolated into
Hobbes's formal definition.** The quoted definition itself matches the source
clause for clause — company of men / professing Christian religion / united in
the person of one sovereign / at whose command they ought to assemble / and
without whose authority they ought not to assemble — with both halves of the
assemble/not-assemble pair intact and no reordering. (Source's internal
semicolon after "Soveraign" is a comma in the candidate; punctuation only.)

The gloss's content is also correct Hobbes: in ch. 16 a *person* may be borne by
an assembly as well as by one man, and Hobbes's sovereign is explicitly either a
man or an assembly. So the gloss does not smuggle in a monarchist or
anti-monarchist reading. It remains an editorial intrusion in the author's
voice, and if the edition's policy is to keep such glosses out of the body text
it belongs in a note — but as a fidelity matter it is licensed and correctly
placed.

### (c) Paragraph 4's other rewordings

- **"between the Christian and the man"** — **changed in substance.** See **F4**.
- **"so also are civil sovereigns"** — **changed in substance.** See **F3**.
- **Double-negative untangling.** Source: `There is therefore no other Government
  in this life, neither of State, nor Religion, but Temporall; nor teaching of
  any doctrine, lawfull to any Subject, which the Governour both of the State,
  and of the Religion, forbiddeth to be taught:` Candidate: `There is therefore
  no other government in this life, neither of state nor of religion, but
  temporal government. And no subject may lawfully teach any doctrine that the
  governor — who governs both state and religion — forbids to be taught.` The
  logic survives exactly: the scope of "no… lawful" is unchanged, the forbidder
  is still the single governor of both state and religion, and splitting the
  sentence does not weaken the "therefore". **No defect.**
- **"And that governor must be one, or else faction and civil war must
  inevitably follow"** — source `And that Governor must be one; or else there
  must needs follow Faction, and Civil war`. "must needs" → "must inevitably" is
  an exact-strength modernization. **No defect.**

## Other checks on the revised paragraphs — no findings

- **Negation:** all preserved through the splits. Verified: "when it does not
  mean a building" (1); "though not actually assembled" (2); "without authority
  from a lawful congregation", "It is not the act of all of them together", "who
  was absent, or who was present but unwilling", "without whose authority they
  ought not to assemble", "without warrant from the civil sovereign is unlawful"
  (3); "no such universal church", "there is no power on earth", "cannot be
  subject", "no other government", "no subject may lawfully teach", "if pastors
  are not subordinate" (4). None dropped, added or flipped. Paragraph 3's
  triple-negative split preserved all three negations as three separate
  sentences with the same scopes.
- **Causality:** "For without authority…" still causal and still governs the
  whole gathering argument (3); "And because in every commonwealth… a church
  too… is an unlawful assembly" keeps the because/therefore direction (3); "It
  follows too… because there is no power on earth", "and consequently cannot be
  subject", "And therefore a church…", "There is therefore no other government",
  "or else faction… must inevitably follow" (4). All point the same way.
- **Conditions:** "when it does not mean a building", "When they were called
  together by lawful authority", "But when they were stirred up…" (1); "whether
  their profession is genuine or false", "if he fails to hear" (2); "at whose
  command… and without whose authority" (3); "if pastors are not subordinate,
  so that there may be one chief pastor" (4). Same scope, same consequence.
- **Certainty/hedging:** the graded frequency markers survive in the right slots
  ("Sometimes… And in this sense… Sometimes it is used… Sometimes, too… Sometimes
  it means", para 2). "It is true that after the resurrection…" and "has already
  been shown" / "we shall see in the chapters that follow" (4) keep the source's
  modality. The only certainty change found is F3's "rightly".
- **Omissions:** nothing missing from the revised paragraphs. Confirmed present:
  the Acts 19:39 citation still attached to *Ecclesia Legitima* and not moved
  onto *Sugkechumene* (1); "head of the church", all four senses, all four
  citations (2); the full CHURCH definition with both halves of the
  assemble/not-assemble clause, and the absent/present-but-unwilling pair (3);
  "civil state… because its subjects are men", the full four-part faction list
  including "the sword of justice and the shield of faith" (4).
- **Silent corrections:** none newly introduced. Re-verified that the revision
  did **not** disturb the three high-risk points Review 1 flagged: "Gentile"
  (not "heathen man"), "his house" (not "her house"), and Hobbes's compressed
  Eph. 5:27 (not expanded to canonical wording). All still correct. F2 is the
  one place where a standard-doctrine import crept in, and it came in as a gloss
  rather than as a change to the source's own words.
- **Unmodernized quotations / archaic islands:** none. All six scripture
  quotations and the formal CHURCH definition read as modern prose consistent
  with their surroundings.
- **Additions:** the licensed explicitations are the Latin/Greek gloss (1,
  accurate — see (a)), "what the Greeks called" (1, accurate), the "person"
  gloss (3, accurate and correctly placed — see (b)), and "at least one" (4,
  Review 1's N3, entailed). The unlicensed ones are F2, F3, F4.

## Whole-chapter re-read — cross-boundary

The four senses set up in paras 0–2 are still four and still distinct after the
revisions: (i) the building/temple, metaphorically (0); (ii) the whole dispersed
multitude of Christians (2); (iii) a particular local group (2); (iv) the elect
only (2); (v) an actually-assembled body of professors, true or counterfeit (2).
Para 3's "it is only in this last sense" still lands on the assembled-professors
sense — the last one the candidate lists — so the chapter's payoff is intact.
The para 1 civil-assembly sense (*Ecclesia* in the Greek commonwealths) still
functions as the bridge to the para 3 "lawful congregation" argument, and the
new Latin/Greek gloss strengthens rather than blurs that bridge.

Recurring terms are used consistently: *house / building* for the edifice sense,
*congregation / assembly* for the gathered sense, *commonwealth* throughout for
"Common-wealth", *sovereign* for "Soveraign", *pastor* for "Pastor". The
pastor/chief-pastor thread still lands on the same conclusion (civil sovereign =
chief pastor) that the para 3–4 single-authority argument builds toward.

One cross-boundary tension worth naming: the F1 error in para 1 (Rome calling
the speaker *Ecclesiastes*) is contradicted by para 1's own later Latin/Greek
gloss and by the Greek/Latin distinction the chapter depends on. Fixing F1
removes the inconsistency.

## Non-blocking stylistic notes

- **S1 — quotation-mark style, para 2.** The paragraph uses single quotes for
  scripture ('A glorious church…') but double quotes for "church triumphant" in
  the same sentence. Cosmetic; normalize when F2 is applied.
- **S2 — para 3, "much lesse" → "And it is certainly not".** Source: `much lesse
  that act of them that were absent`. The comparative gradation ("even less so")
  flattens to a flat denial of the same strength. Meaning is not damaged; `still
  less is it the act of anyone who was absent` would keep the gradation. Optional.
- **S3 — para 2, "counterfeit" → "false".** Source: `whether their profession be
  true, or counterfeit`. "Counterfeit" implies deliberate feigning; "false" is
  broader. `genuine or feigned` is marginally closer. Optional.
- **S4 — para 3, "only the individual act".** Source: `it is the particular act
  of every one of those that were present`. "Only" is added but is entailed by
  the following "It is not the act of all of them together". Acceptable.
- Review 1's N1 (Publican → tax collector), N3 ("at least one"), N4 ("then"
  dropped), N5 ("grosse" → "material") and N6 ("Doctors" → "teachers") are all
  unchanged by this round and remain non-blocking. Review 1's C1–C3
  source-level citation questions are unchanged and still require no action.

## Verdict

**ACCEPT WITH FIXES REQUIRED.**

Paragraph alignment is still exact (5/5), nothing was merged, split, reordered,
dropped or invented at the paragraph level, and N2 was applied. The
accessibility-driven revisions are mostly sound: the paragraph 1 Latin/Greek
gloss is linguistically accurate and licensed, the paragraph 3 "person" gloss is
correct and is properly outside Hobbes's quoted definition, the paragraph 3
triple-negative split preserved all three negations, and the paragraph 4
double-negative untangling preserved the logic exactly.

Four fixes are required before this round can be accepted:

1. **F1 (para 1)** — the sentence split made "The Roman commonwealth" the
   subject that calls the speaker *Ecclesiastes*. Restore the agentless passive:
   `…and the speaker was called Ecclesiastes, and Concionator.`
2. **F2 (para 2)** — "the redeemed in heaven, as distinct from the church still
   on earth" imports standard doctrine Hobbes rejects and adds an unstated
   counterpart. Replace with `the church in its final, glorified state`, or drop
   the gloss.
3. **F3 (para 4)** — delete "rightly": `and so are civil sovereigns.`
4. **F4 (para 4)** — restore `between the Christian and the man` (or, if a
   gloss is judged necessary, `between himself as a Christian and himself as a
   man`); "citizen" and "loyalty" both go.

All four are word- or clause-level patches to otherwise sound paragraphs. No
re-draft is needed, and none of the pre-revision text Review 1 certified needs
to be revisited.
