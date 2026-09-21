# Fidelity Review 1 — Leviathan, edition ch. 40 (Hobbes ch. 39)

"Of the Signification in Scripture of the Word Church"

Reviewer: independent fidelity reviewer (Reviewer B), per
`books/prompts/fidelity-review-prompt.md`.
Fidelity anchor: `books/wip/leviathan-pilot-ch40/source.json` (5 paragraphs).
Candidate: `books/wip/leviathan-pilot-ch40/candidate-sonnet.json` (5 paragraphs).
No accessibility review or drafter self-report was consulted.

## Coverage

Exact coverage: **paragraphs 0–4, all five, read individually and in full,
source vs. candidate, clause by clause.** The chapter is short enough to be a
single packet; the packet method's "one paragraph of context each side"
requirement is satisfied trivially since the whole chapter was in view at once.
Nothing was skimmed or sampled.

After the paragraph pass, a **whole-chapter re-read** was done in one pass for
cross-boundary issues: the running argument about the senses of *Ecclesia*
(paras 0–2) and its payoff in the "one Person" / single-sovereign argument
(paras 3–4), and consistency of the recurring terms *Church / house / building
/ congregation / assembly*.

Structural checks:
- Paragraph count 5 = 5. Order preserved. Nothing merged, split, reordered,
  dropped or invented.
- Chapter `number` (40) and `title` identical in both files.
- All nine untranslated Greek/Latin terms present in the candidate (see below).

## Blocking defects

**None found.**

## Item-by-item verification of the three requested checks

### 1. Quoted scripture — modernized from the SOURCE's own wording?

Every quotation was checked for silent substitution of a familiar translation's
phrasing. **No verse was imported from KJV, NIV or any other named
translation.** Each is a light modernization of the source's own words:

| Para | Source wording | Candidate wording | Assessment |
|---|---|---|---|
| 0 | "Let your women keep silence in the Churches:" | "Let your women keep silent in the churches." | Faithful; `silence`→`silent` is a grammatical modernization of the source's own noun-for-adjective construction. Not a KJV import (KJV is in fact "keep silence", i.e. the candidate moved *away* from the familiar wording rather than toward it — the right direction here). |
| 2 | "Saul made havock of the Church" | "Saul made havoc of the church" | Spelling only. Faithful. |
| 2 | "Salute the Church that is in his house." | "Greet the church that is in his house." | `Salute`→`Greet` modernizes the source's own verb. Critically, **"his house" is preserved** — the candidate did not silently "correct" to the Nympha/"her house" reading found in modern critical translations. Correct behavior. |
| 2 | "A Glorious Church, without spot, or wrinkle, holy, and without blemish;" | "A glorious church, without spot, or wrinkle, holy, and without blemish" | Hobbes's compression of Eph. 5:27 is preserved verbatim; the candidate did *not* expand it to the fuller canonical wording ("or any such thing… that it should be holy"). Correct. |
| 2 | "Tell it to the Church, and if hee neglect to hear the Church, let him be to thee as a Gentile, or Publican." | "Tell it to the church, and if he fails to hear the church, let him be to you as a Gentile, or a tax collector." | **"Gentile" is preserved** — the candidate did not substitute KJV's "heathen man". `neglect to hear`→`fails to hear`, `thee`→`you` are ordinary modernizations. The one soft spot is `Publican`→`tax collector`; see non-blocking note N1. |

### 2. Untranslated Greek/Latin terms

All preserved, all still doing their argumentative work:

- **Ecclesia** (para 0, 1) — preserved; the candidate keeps it as the term being
  defined across senses.
- **Kuriake** / **Kyrke** (para 0) — preserved, and the etymological chain
  (Greek fathers' *Kuriake* = "the Lord's house" → English *Kyrke* → *Church*)
  survives intact. The gloss "the Lord's house" is retained.
- **Concio** (para 1) — preserved, and the Rome/Greece contrast is intact
  ("what the Roman commonwealth called Concio").
- **Ecclesiastes** / **Concionator** (para 1) — both preserved as the names of
  *the speaker*, correctly distinguished from the names of the assembly.
- **Ecclesia Legitima** / **Ennomos Ecclesia** (para 1) — preserved, with the
  "called together by lawful authority" condition intact and the Acts 19:39
  citation attached to it.
- **Ecclesia Sugkechumene** (para 1) — preserved, with the contrastive "But"
  and the "stirred up by disorderly and seditious clamor" condition intact.

Hobbes's whole point in this chapter — that each word has a precise, distinct
sense — is preserved. The four senses in para 2 (dispersed multitude / a
particular local group / the elect only / an actually-assembled body of
professors, true or counterfeit) are each present and each still distinct, and
the para 3 argument that **only the last sense** can be taken for one person is
correctly keyed to the fourth sense. That cross-paragraph dependency survives.

### 3. Citations

Checked against the actual passages:

- **1 Cor. 14:34** — correct; this is where "let your women keep silence in the
  churches" occurs.
- **Acts 19:39** — correct; the Ephesus town clerk's ἐν τῇ ἐννόμῳ ἐκκλησίᾳ
  ("in a lawful assembly"). Hobbes's *Ennomos Ecclesia* is exactly this phrase.
- **Acts 8:3** — correct; "Saul made havock of the church."
- **Col. 4:15** — correct; "salute… the church which is in his house."
- **Eph. 5:27** — correct; "a glorious church, not having spot, or wrinkle…
  holy and without blemish."
- **Matt. 18:17** — correct; "tell it unto the church: but if he neglect to
  hear the church, let him be unto thee as an heathen man and a publican."

No citation was silently changed by the candidate. Each chapter:verse in the
candidate matches the source exactly (only the punctuation style `14. ver. 34.`
→ `14:34` was normalized, consistently, across all six).

## Flagged possible-citation-questions

These are raised separately from candidate defects. They concern **the source
text itself**; the candidate reproduced the source faithfully in each case, so
none of these is a candidate defect, and none is silently resolved here.

**C1 — Matt. 18:17, "Gentile" vs. "heathen man". Not an error; do not
"correct" it.** My independent assessment: the Greek is ὁ ἐθνικὸς καὶ ὁ
τελώνης. ἐθνικός straightforwardly means *Gentile / one of the nations /
pagan*; KJV's "heathen man" is one rendering of it, not the only correct one,
and "Gentile" is if anything the more literal. Hobbes is paraphrasing from the
Greek (as he does throughout Part III), not misquoting the KJV. Additionally he
writes "a Gentile, **or** Publican" where the Greek has καί ("and") — again a
loose Hobbesian paraphrase, not a mis-citation. **Recommendation: leave
"Gentile" exactly as-is in both source and candidate.** Replacing it with
"heathen man" would be precisely the "silent correction to the historically
standard wording" that the protocol forbids. The candidate got this right.

**C2 — *Ecclesia Sugkechumene* carries no citation in the source, though it is
a direct quotation of Acts.** Hobbes attaches "(Acts 19.39.)" to *Ecclesia
Legitima* but gives no reference for the contrasting *Ecclesia Sugkechumene*.
That phrase is from **Acts 19:32** (ἡ ἐκκλησία συγκεχυμένη — "the assembly was
confused"), seven verses earlier in the same Ephesus episode. This is not an
internal inconsistency and not a candidate defect; it is an uncited quotation
in Hobbes. Flagging it only because a reader may reasonably assume the
"(Acts 19:39)" governs both halves of the sentence, which it does not. **No
change recommended to source or candidate**; if annotation is ever added to
this edition, Acts 19:32 would be the correct target for the second phrase.

**C3 — Col. 4:15 "his house".** The source (following the Textus Receptus /
KJV line, "Nymphas… and the church which is in his house") reads *his*; most
modern critical editions read Νύμφαν … αὐτῆς, "Nympha… and the church in *her*
house." The candidate correctly preserved "his." Flagged only so that a later
reviewer does not mistake the preserved "his" for a candidate error. **No
change recommended.**

## Non-blocking stylistic notes

**N1 — para 2, Matt. 18:17, "Publican" → "tax collector."**
Source: `let him be to thee as a Gentile, or Publican.`
Candidate: `let him be to you as a Gentile, or a tax collector.`
"Tax collector" is a legitimate modernization of the source's own archaic
"Publican," and is required by the modernization mandate (a quotation is not
exempt from modernization, and "publican" is opaque to a modern reader).
However, the combination "Gentile, or a tax collector" happens to resemble
contemporary-translation phrasing closely enough that a later reviewer could
mistake it for an import. Since "Gentile" is demonstrably from the source and
not from any modern translation, and "tax collector" is a gloss of the source's
own word, I do not treat this as a defect. Optional belt-and-braces fix if the
drafter wants to make the derivation visible: `as a Gentile, or a tax collector
(a publican).` Not required.

**N2 — para 1, "and" → "or".**
Source: `as he that spake was called Ecclesiastes, and Concionator.`
Candidate: `the speaker himself being called Ecclesiastes, or Concionator.`
The source's "and" joins the Greek name and the Latin name as a pair (Greek
*Ecclesiastes*, Roman *Concionator*); "or" reads very slightly more as
alternatives for one language. Meaning is not damaged — the Greek/Roman frame
is set up in the same sentence — but "and" is the safer word. Optional fix:
restore `Ecclesiastes, and Concionator`.

**N3 — para 4, "at least one".**
Source: `whereof both may be, and one must be false.`
Candidate: `of which both could be false, and at least one must be false.`
"At least" is a quantifier not in the source. It is logically entailed by the
source (if both may be false and one must be, then at least one must be), so
this is an explicitation rather than an addition of content. Acceptable;
if the drafter prefers strict economy, `and one must be false` is exact.

**N4 — para 1, "then" dropped.** Source `then it was a confused Church`;
candidate `it was a confused church`. The "But when… / then…" correlative is
carried by "But when they were stirred up…". No meaning lost.

**N5 — para 4, "grosse" → "material".** Source: `in this life they are grosse,
and corruptible.` Hobbes's "grosse" means coarse/gross-material as opposed to
spiritual. "Material" catches the sense and preserves the spiritual/material
contrast with the preceding clause. Acceptable; "physical" or "coarse and
material" would be marginally closer. Non-blocking.

**N6 — para 4, "Doctors of the Church" → "teachers of the church."** Hobbes's
"Doctors" = learned teachers, not physicians and not a formal ecclesiastical
title in this context. "Teachers" is the right modernization and it keeps the
following pastor/pastors argument coherent. No change needed.

## Checks run with no findings

- **Actors:** no subject/object swaps. Verified in the trickiest spots — para 3
  "the particular act of each one of those present **who lent their aid**"
  (source: "that were present, and gave their aid"), and para 4 "each of them
  is subject to the commonwealth of which **he is himself a member**."
- **Negation:** all preserved. Checked "though not often" (0), "when it does
  not mean a building" (1), "though not actually assembled" (2), "without
  authority from a lawful congregation" (3), "not the act of all of them
  together" (3), "were not willing it should be done" (3), "without whose
  authority they ought not to assemble" (3), "no such universal church… because
  there is no power on earth" (4), "if pastors are not subordinate" (4). None
  dropped, added or flipped.
- **Causality:** "but this is Metaphorically put" → "But this use is
  metaphorical"; "and therefore the Greek Fathers call it Kuriake" → "That is
  why"; "For without authority…" → "For without authority…"; "And because in
  all Common-wealths… is unlawful; that Church also… is an unlawfull Assembly"
  → same because/therefore direction; "It followeth also… because there is no
  power on Earth"; "and consequently, cannot be subject"; "There is therefore
  no other Government"; "or else there must needs follow Faction". All point
  the same way.
- **Conditions:** "when not taken for a House" (1), "when they were called
  forth by lawfull Authority" (1), "But when they were excited by tumultuous…
  clamor" (1), "whether their profession be true, or counterfeit" (2), "if hee
  neglect to hear" (2), "if Pastors be not subordinate" (4) — all survive with
  the same scope and the same consequence.
- **Certainty/hedging:** "though not often" (0), "Sometimes… sometimes… and
  sometimes… Sometimes also… Sometimes" (0, 2) — the graded frequency markers
  are all preserved in the right slots; "It is true, that the bodies of the
  faithfull" → "It is true that…" (4); "hath been already shewn" → "has already
  been shown" (4); "we shall see in the Chapters following" → "we shall see in
  the chapters that follow" (4). No source hedge stated as fact, and no
  candidate hedge added over a source assertion.
- **Omissions:** no clause, example, citation or aside missing. Specifically
  confirmed present: the idolaters contrast (0), "the House of Prayer" (0),
  "Head of the Church" (2), "Church Triumphant, or, Church To Come" (2), the
  full CHURCH definition including both halves of the assemble/not-assemble
  clause (3), "Civill State… because its subjects are men" (4), the full
  four-part faction list including "the sword of justice and the shield of
  faith" and "in every Christian man's own breast, between the Christian and
  the man" (4).
- **Additions:** nothing unlicensed. The only explicitations are N1 and N3
  above, both entailed by the source.
- **Silent corrections:** none. Positively verified on the three highest-risk
  points: "Gentile" (not "heathen man"), "his house" (not "her house"), and
  Hobbes's compressed Eph. 5:27 (not expanded to the canonical wording).
- **Unmodernized quotations / archaic islands:** none. All six scripture
  quotations and the formal CHURCH definition read as modern prose consistent
  with their surroundings; no quotation was left in archaic spelling or syntax
  as an exemption.
- **Whole-chapter re-read (cross-boundary):** the four senses set up in
  paras 0–2 are each still distinct, and para 3's "in this last sense only"
  still correctly refers to the fourth sense (assembled professors, true or
  counterfeit) as the candidate rendered it — the payoff is not broken by the
  packet-local rewording. Recurring terms are used consistently: *house /
  building* for the edifice sense, *congregation / assembly* for the gathered
  sense, *commonwealth* throughout for "Common-wealth," *sovereign* throughout
  for "Soveraign." The pastor/chief-pastor thread at the end of para 4 lands on
  the same conclusion (civil sovereign = chief pastor) that the para 3–4
  single-authority argument builds toward.

## Verdict

**ACCEPT AS-IS.**

No blocking defects. Paragraph alignment is exact (5/5). All six scripture
quotations are modernized from the source's own wording with no import from
KJV, NIV or any other named translation — the two places where such an import
would have been most tempting ("heathen man" at Matt. 18:17 and "her house" at
Col. 4:15) were both correctly resisted. All nine Greek/Latin terms are
preserved, and Hobbes's argument about the precise sense of each still holds in
the modernized prose. The six notes above (N1–N6) are optional stylistic
refinements, not conditions of acceptance; N2 ("and" → "or") is the only one I
would bother applying if the file is being touched again for other reasons.

Three source-level citation questions (C1–C3) are flagged unresolved for the
record. None requires a change to the candidate, and C1 in particular should
**not** be "fixed": "Gentile" is Hobbes's own defensible rendering of ἐθνικός,
not a citation error.
