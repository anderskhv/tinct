# Fidelity Review — FINAL — Leviathan, edition ch. 40 (Hobbes ch. 39)

"Of the Signification in Scripture of the Word Church"

Reviewer: independent fidelity reviewer, fourth and closing pass, per
`books/prompts/fidelity-review-prompt.md`.
Fidelity anchor: `books/wip/leviathan-pilot-ch40/source.json` (5 paragraphs).
Candidate reviewed: `books/wip/leviathan-pilot-ch40/candidate-sonnet.json`,
current file on disk, post F5 + N7 application.
Baseline: `books/wip/leviathan-pilot-ch40/fidelity-review-3.md`
(ACCEPT WITH FIXES REQUIRED — F5 required, N7 optional).

Indices are **0-based**, consistent with Reviews 1–3 (para 0 = "The word
Church…", para 4 = "It followeth also…"). The brief's "paragraph 1/2/3/4" maps
to these same indices.

## Coverage

Exact coverage: **all 5 source paragraphs (0–4) read individually and in full
against the current candidate, clause by clause.** This was a complete
re-derivation from `source.json`, not a spot-check of the F5/N7 edits and not a
re-reading of Review 3's prose. Word-count and similarity heuristics were used
only as a cross-check after the manual pass, never in place of it. The chapter
is a single packet, so the whole text was in view simultaneously and the
cross-boundary pass covers every paragraph junction (0/1, 1/2, 2/3, 3/4).

Structural check:
- **Paragraph count 5 = 5.** Order preserved. Nothing merged, split, reordered,
  dropped or invented at the paragraph level.
- Chapter `number` (40) and `title` byte-identical in both files.
- Both files are valid JSON.

## (1) Content coverage, source vs. candidate — clause by clause

### Para 0 — no content loss
Every source clause is accounted for: "divers things" → "several different
things"; "(though not often)" preserved; "Gods House / a Temple, wherein
Christians assemble to perform holy duties publiquely" → "God's house … carry
out holy duties in public"; 1 Cor. 14:34 with its quotation; the metaphorical
note; the edifice sense with its purpose clause ("to distinguish the temples of
Christians from those of idolaters"); "The Temple of Jerusalem was Gods House,
and the House of Prayer"; "any Edifice dedicated by Christians to the worship of
Christ, Christs House"; the Greek fathers' *Kuriake*, "The Lords House"; the
derivation *Kuriake → Kyrke → Church* in the source's order. Nothing dropped,
nothing added beyond the sequencing explicitation adjudicated in Review 3 §5a
(licensed by the source's own "hath been **since** used").

### Para 1 — no content loss
"Church (when not taken for a House)" → "(when it does not mean a building)";
the *Ecclesia* / Greek-commonwealths equation; "a Congregation, or an Assembly of
Citizens, called forth, to hear the Magistrate speak unto them"; the Roman
*Concio*; the speaker's two names *Ecclesiastes* **and** *Concionator* (the
source's "and", not "or", is preserved); Acts 19:39 with lawful authority;
*Ecclesia Legitima* / *Ennomos Ecclesia* = "a lawful church"; the tumultuous,
seditious clamor; *Ecclesia Sugkechumene* = "a confused church". The F1 re-split
from Review 3 is intact and was re-verified from the source this pass: Rome is
the subject of the *Concio* clause only, and the naming of the speaker is an
agentless passive, so no Greek term is attributed to Rome.

### Para 2 — no content loss
All five sense-entries and all four scripture anchors present and in the source's
order: the right-to-belong / not-actually-assembled sense with "the whole
multitude of Christian men, how far soever they be dispersed"; Acts 8:3 "Saul
made havoc of the church"; "Christ … Head of the Church"; the particular-group
sense with Col. 4:15; the elect-only sense with Eph. 5:27 (in Hobbes's compressed
form, not expanded to canonical wording) and the *Church Triumphant / Church To
Come* equation; the assembled-professors sense with "whether their profession be
true, or counterfeit" and Matt. 18:17 in full, including both halves ("Tell it to
the church, and if he fails to hear the church") and the Gentile/tax-collector
pair. "onely" is preserved as "only" in the elect sense.

### Para 3 — no content loss
"And in this last sense only"; "taken for one Person"; the full six-item power
list (will, pronounce→declare, command, be obeyed, make laws, any other action
whatsoever); "For without authority from a lawfull Congregation"; "whatsoever act
be done in a concourse of people"; the particular-act-of-each-present-participant
clause; "not the act of them all in grosse, as of one body"; the "much lesse"
clause with **both** members of the absent / present-but-unwilling pair; the
CHURCH definition verbatim in substance, including both halves of the
assemble / not-assemble pair; the unlawful-assembly conclusion with "in all
Common-wealths" → "in every commonwealth". The "person" gloss remains **outside**
the closing quotation mark of the definition — re-verified.

### Para 4 — no content loss
No-universal-church claim with its "because there is no power on Earth" reason;
Christians under several princes and states; each subject to his own
commonwealth; "consequently, cannot be subject to the commands of any other
Person"; the church-capable-of-acting list (command, judge, absolve, condemn, any
other act); the civil-state / church double naming with both reasons; the
two-words-to-make-men-see-double sentence; the resurrection concession
(spiritual **and** eternal vs. grosse and corruptible in this life); "no other
Government in this life, neither of State, nor Religion, but Temporall"; the
teaching prohibition with the governor of both state and religion; "that Governor
must be one"; the **complete four-part faction list** (church/state —
spiritual/temporal party — sword of justice/shield of faith — the Christian/the
man); pastors and civil sovereigns; the subordination condition and the one-chief-
pastor consequence; "whereof both may be, and one must be false"; "hath been
already shewn … the Civill Soveraign"; "we shall see in the Chapters following".

**Conclusion (1): no content loss anywhere. All five paragraphs are complete.**

## (2) F5 — CONFIRMED APPLIED

- **Required:** delete `what Hobbes calls`.
- **Candidate now reads:** `—meaning the "church triumphant," or — in other words — the church still to come: the church in its final, glorified state.`

Exactly the specified text. The string "Hobbes" does not occur anywhere in the
chapter. The first-person voice is restored: para 3's "I define a CHURCH to be"
is now the only authorial voice in the chapter, with no third-person editorial
intrusion clashing with it. The misattribution of *Church Triumphant* as a Hobbes
coinage is gone. The F2 repair is untouched — "the redeemed in heaven" and "as
distinct from the church still on earth" remain absent, and the surviving gloss
("the church in its final, glorified state") asserts no location, no counterpart
and no doctrine beyond what "A Glorious Church…" and "Church To Come" carry. The
deletion introduced no new defect and left no orphaned punctuation.

## (3) N7 — CONFIRMED APPLIED

- **Source:** `between Spiritualists, and Temporalists;`
- **Candidate now:** `between the spiritual party and the temporal party`

The recommended wording, verbatim. "Claim" is gone, so party membership is no
longer recast as an act of asserting authority and no group-narrowing or
pretension connotation remains. The pair keeps its correct slot as item 2 of the
four-part faction list, the antithesis runs in the right direction, and the
twelve-word construction has been shortened back toward the source's two-word
balance. The gloss remains licensed (bare "spiritualist" would actively mislead a
modern reader). **Meaning now matches the source with no added claim.**

## (4) Full checklist — whole chapter

- **Actors.** Re-verified from the source in all five paragraphs. Correct
  throughout: Greek commonwealths → *Ecclesia*; Rome → *Concio* (and only
  *Concio*); the speaker, agentless → *Ecclesiastes* / *Concionator*; the Greek
  fathers → *Kuriake*; Saul → made havoc; Christ → head of the church; the
  lawful congregation → source of authority; the civil sovereign → the one chief
  pastor; the governor of state and religion → forbids teaching; Scripture → has
  assigned that office. No subject/object swaps, no agent invented for an
  agentless passive.
- **Negation.** All source negations present, none added or flipped: "though not
  often" (0); "when it does not mean a building" (1); "though not actually
  assembled" (2); "without authority from a lawful congregation", "not the act of
  all of them together", "It is certainly not the act of anyone who was absent,
  or who was present but unwilling", "without whose authority they ought not to
  assemble", "without warrant from the civil sovereign is unlawful" (3); "no such
  universal church", "no power on earth", "cannot be subject", "no other
  government", "no subject may lawfully teach", "if pastors are not subordinate"
  (4). No double-negative collapses.
- **Causality.** Direction and strength unchanged: "For without authority…" (3);
  "And because in every commonwealth… is an unlawful assembly" (3); "because
  there is no power on earth", "and consequently cannot be subject", "And
  therefore a church…", "There is therefore no other government", "or else
  faction and civil war must inevitably follow" (4). "That is why" for para 0's
  "and therefore" is a rendering, not a redirection.
- **Certainty / hedging.** The graded frequency markers in para 2 sit in the
  source's slots and order ("It is also used sometimes… And in this sense…
  Sometimes it is used… Sometimes, too… Sometimes it means"). "It is true that
  after the resurrection…", "has already been shown", "we shall see in the
  chapters that follow" keep the source's modality. With "rightly" removed in
  round 3 and "Hobbes calls" removed now, **no certainty or authority shift
  remains anywhere in the chapter.**
- **Conditions.** Same antecedent, same consequent, same scope: "when it does not
  mean a building", "When they were called together by lawful authority", "But
  when they were stirred up…" (1); "whether their profession is genuine or
  false", "if he fails to hear" (2); "at whose command… and without whose
  authority" (3); "if pastors are not subordinate, so that there may be one chief
  pastor" (4).
- **Omissions.** None found. Specifically re-confirmed present: both members of
  the absent / present-but-unwilling pair; both halves of the assemble /
  not-assemble pair in the definition; both reasons in the civil-state/church
  double naming; all four items in the faction list; "spiritual **but** eternal";
  all five senses of *Ecclesia*.
- **Additions.** Only the previously licensed ones remain: the Latin/Greek gloss
  and "what the Greeks called" (1); the "person" political-sense gloss (3, outside
  the quotation); "at least one" (4, entailed by "one must be false"); the
  sense-shift sequencing (0, licensed by the source's "since"). **No unlicensed
  addition remains** — F5 was the last one, and it is gone.
- **Silent corrections.** None. The three high-risk points are still correct:
  "Gentile" (not "heathen man"), "his house" in Col. 4:15 (not silently corrected
  to "her house"), and Hobbes's compressed Eph. 5:27 (not expanded to canonical
  wording). No standard-doctrine import.
- **Unmodernized quotations / archaic islands.** None. All six scripture
  quotations and the formal CHURCH definition read as modern prose consistent
  with their surroundings; no 17th-century spelling or syntax survives inside
  quoted material.
- **Greek / Latin terms — accuracy.** All nine untranslated terms present, each
  exactly once except *Concio* (in-text plus its gloss), and each spelled as in
  the source: *Ecclesia*, *Kuriake*, *Kyrke*, *Concio*, *Ecclesiastes*,
  *Concionator*, *Ecclesia Legitima*, *Ennomos Ecclesia*, *Ecclesia
  Sugkechumene*. The added language labels are correct: *Ecclesia Legitima* is
  identified as Latin and *Ennomos Ecclesia* as Greek, matching both the forms
  themselves and the source's own Greek/Roman framing. Each gloss matches the
  source's own translation — "a lawful church" for the Legitima/Ennomos pair,
  "a confused church" for *Sugkechumene*. *Kuriake* is correctly glossed "the
  Lord's house" and the *Kuriake → Kyrke → Church* chain preserves the source's
  order.
- **Scripture citations — all six.** Verified individually for reference, wording
  and attachment: **1 Cor. 14:34** (0) → "Let your women keep silent in the
  churches", attached to the temple/building sense; **Acts 19:39** (1) → attached
  to *Ecclesia Legitima* / *Ennomos Ecclesia*, and **not** to *Ecclesia
  Sugkechumene* (the misattachment risk flagged in earlier rounds has not
  returned); **Acts 8:3** (2) → "Saul made havoc of the church", attached to the
  dispersed-multitude sense; **Col. 4:15** (2) → "Greet the church that is in his
  house", attached to the particular-group sense; **Eph. 5:27** (2) → "A glorious
  church, without spot, or wrinkle, holy, and without blemish", attached to the
  elect-only sense; **Matt. 18:17** (2) → "Tell it to the church, and if he fails
  to hear the church, let him be to you as a Gentile, or a tax collector",
  attached to the assembled-professors sense. Chapter-and-verse numbers match the
  source in every case; no citation added, dropped or renumbered.
- **Cross-boundary / whole-chapter.** The sense list in 0–2 is complete and
  distinct, and para 3's "it is only in this last sense" still lands on the
  assembled-professors sense, which is still last — the chapter's payoff holds.
  Para 1's civil-assembly sense still bridges to para 3's lawful-congregation
  argument. The single-authority argument runs unbroken 3→4 and the
  pastor → chief pastor → civil sovereign thread lands on the same conclusion.
  Recurring terms are consistent: *house / building*, *congregation / assembly*,
  *commonwealth*, *sovereign*, *pastor*. **The narrative-voice clash recorded in
  Review 3 is resolved**; the chapter is uniformly in Hobbes's first person.

## Defects

**None blocking. None requiring a fix.**

Remaining items are stylistic only and carried forward unchanged from earlier
reviews; all are optional and none affects meaning:

- **S1 — para 2, quotation-mark style.** Single quotes for the scripture
  quotation ('A glorious church…') but double quotes for "church triumphant" in
  the same sentence. Review 3 suggested normalizing when F5 was applied; the F5
  deletion was made without it. Cosmetic, and the same mixed convention appears
  elsewhere in the chapter (para 3's definition in single quotes vs. the "person"
  gloss in doubles), so it is at least internally consistent as a
  scripture-vs-gloss distinction.
- **S5 — para 2, dash pile-up.** "—meaning … or — in other words — … :" still
  stacks an em dash, a spaced em-dash pair and a colon in one sentence.
  Readability only.
- **S2, S3, S4** — "much lesse" gradation flattened to "And it is certainly not";
  "counterfeit" → "false"; "only the individual act". Unchanged, all optional.
- **N1, N3, N4, N5, N6** — Publican → tax collector; "at least one"; "then"
  dropped in para 1; "grosse" → "material"; "Doctors" → "teachers". Unchanged,
  all non-blocking.
- **Review 1's C1–C3** source-level citation questions: unchanged, no action.

## Verdict

**ACCEPT AS-IS.**

Coverage was complete: all five paragraphs read in full against the source, clause
by clause, with no sampling. All five are present with **no content loss** — no
dropped clause, no merged or split paragraph, no reordering, no invented
material. **F5 is correctly applied** (the two-word attribution is deleted, the
F2 repair is intact, the first-person voice is restored and "Hobbes" appears
nowhere in the chapter). **N7 is correctly applied** ("between the spiritual
party and the temporal party", removing the added "claim" while keeping the
licensed gloss and the list slot). The full checklist — actors, negation,
causality, certainty, conditions, omissions, additions, silent corrections,
unmodernized quotations — returns **no findings**. All nine Greek/Latin terms are
present, correctly spelled and correctly glossed, with the Latin/Greek labels
accurate. All six scripture citations are present, correctly numbered, correctly
worded and attached to the right clauses.

No fixes are required. Chapter 40 is certified as a finished candidate and may be
locked in.
