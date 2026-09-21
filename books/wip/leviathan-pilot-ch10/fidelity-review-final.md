# Final Fidelity Review — Leviathan, edition chapter 10 (Hobbes ch. 9)

**Files reviewed**
- Source (locked): `books/wip/leviathan-pilot-ch10/source.json`
- Final candidate: `books/wip/leviathan-pilot-ch10/candidate-sonnet.json`

**Method:** full non-sampled read of all 12 paragraphs in their current final
state, each checked against the corresponding source paragraph on actors,
negation, causality, certainty/hedging, conditions, omissions, additions and
silent corrections. This is not a diff against earlier rounds.

## Verdict

**ACCEPT AS-IS.**

No fidelity defects found. No fixes required. The chapter is ready for hash
pinning as final.

## Structure check

| Check | Source | Candidate | Result |
|---|---|---|---|
| `number` | 10 | 10 | match |
| `title` | `Chapter 9. Of the Severall Subjects of Knowledge` | `Chapter 9. Of the Several Subjects of Knowledge` | match (spelling modernization only; chapter numbering and subject wording preserved) |
| Paragraph count | 12 | 12 | match |
| Paragraph order / indices | — | — | 1:1, nothing merged, split, reordered, dropped or invented |
| Outline labels (I, A, 1, a, a, 2), B, 1, 2) | — | — | reproduced exactly, including the deliberate oddities |

Preserved-by-design oddities confirmed present and untouched (not defects):
the two consecutive items both labelled "a."; the `2)` item that breaks the
period-based scheme; and the inverted phrase "of the qualities from liquid
bodies".

## Paragraph-by-paragraph findings

**P1 — two kinds of knowledge.** Both kinds, and the fact/consequence
distinction, are preserved in the same order. Modality is correct: knowledge of
fact is *absolute*, science is *conditional*; the geometric example keeps its
full conditional form ("if the figure shown is a circle, then any straight line
through its centre divides it into two equal parts"). `shall divide` → `divides`
is a tense modernization inside an already-stated conditional and does not alter
certainty. The witness/philosopher actor assignments are correct. "him that
pretends to Reasoning" → "anyone who claims to reason" correctly renders the
period sense of *pretend* (lay claim to) rather than the modern sense of
feigning — a genuine fidelity gain, not a silent correction of Hobbes.

**P2 — history.** Both sorts preserved with correct labels. The defining
negation of natural history — facts that have **no** dependence on the will of
man — is carried through intact, and the example list (metals, plants, animals,
regions) is complete and in order. Civil history correctly limited to
*voluntary* actions of men *in commonwealths*.

**P3 — registers of science.** "Demonstrations of Consequences of one
Affirmation, to another" is unpacked as "demonstrations of how one affirmation
follows as a consequence from another" — same directional relation, no reversal.
"diversity of the Matter" → "variety of the subject matter" is accurate.
"may be divided in such manner as I have divided them in the following Table"
→ "can be classified as shown in the table that follows": the first-person
framing is dropped, but the claim, its hedging ("may"/"can") and the forward
reference to the table are all preserved. Acceptable register shift, not an
omission of content.

**P4 — I. Science.** Exact; "which is called also PHILOSOPHY" → "which is also
called PHILOSOPHY", capitalization of the term preserved.

**P5 — A. Natural philosophy.** "Accidents of Bodies Naturall" → "accidents
(that is, the properties and qualities) of natural bodies". The parenthetical is
an added gloss, but it is (a) correct for the scholastic sense of *accident*,
(b) clearly marked as a gloss, and (c) applied on first occurrence only —
"accidents" runs unglossed in P6 and P10. This is the standard approved gloss
pattern and does not change the taxonomy. Term NATURAL PHILOSOPHY preserved.

**P6 — 1. Common accidents.** Exact: accidents common to all natural bodies,
namely quantity and motion. No addition or loss.

**P7 — a. Philosophia Prima.** "Quantity, and Motion Indeterminate" →
"indeterminate quantity and motion" keeps *indeterminate* governing both terms,
as in the source. The causal/definitional clause "being the principles or first
foundation of philosophy" is preserved, including the singular "is called".
"(First Philosophy)" is an added translation gloss of the retained Latin term —
benign and non-substantive.

**P8 — a. Transient bodies.** "Qualities of Bodies Transient, such as sometimes
appear, sometimes vanish" → "qualities of transient bodies — those that
sometimes appear and sometimes vanish". The hedged frequency ("sometimes ...
sometimes") is preserved on both sides; the relative clause correctly attaches
to the bodies. The duplicate "a." label is retained as instructed.

**P9 — 2) Liquid bodies.** Label `2)` retained. The inverted source phrase
"Consequences of the Qualities from Liquid Bodies" is reproduced as
"Consequences of the qualities from liquid bodies" — deliberate, as specified.
"that fill the space between the Starres" preserved; "the Ayre, or substance
aetherial" → "the air, or the ethereal substance" preserves both members of the
disjunction.

**P10 — B. Politics.** "Accidents of Politique Bodies" → "accidents of political
bodies"; POLITIQUES → POLITICS, CIVILL PHILOSOPHY → CIVIL PHILOSOPHY. Both
capitalized terms preserved, no third term added.

**P11 — 1. Rights and duties of the sovereign.** "Institution of
COMMON-WEALTHS" → "institution, or founding, of COMMONWEALTHS": a small
clarifying gloss on *institution* in its founding sense, correct here and
consistent with P12. Direction of the consequence (from the institution *to*
the rights and duties of the body politic, or sovereign) is preserved, as is
the pairing "rights and duties".

**P12 — 2. Duty and right of subjects.** "Of Consequences from the same" →
"Of consequences from that same institution": the anaphor is made explicit, and
the antecedent resolved is the correct one (the institution of commonwealths
named in P11). Note the source's deliberate reversal of order — P11 has
"Rights, and Duties", P12 has "Duty and Right" — and the candidate reproduces
that reversal exactly rather than silently regularizing it. Correct.

## Cross-cutting checks

- **Actors:** witness, philosopher, man/men, subjects, sovereign — all correctly
  assigned; no actor introduced or swapped anywhere.
- **Negation:** the single substantive negation in the chapter (natural history
  = facts with *no* dependence on man's will, P2) is intact. No negation added
  or dropped elsewhere.
- **Causality:** the affirmation-to-affirmation consequence relation is
  directional throughout and never reversed (P1, P3, P4, P5, P6, P7, P8, P9,
  P10, P11, P12).
- **Certainty / hedging:** absolute vs. conditional knowledge (P1) preserved;
  "may be divided" → "can be classified" (P3) and "sometimes ... sometimes"
  (P8) keep their original strength. No hedge removed, no claim hardened.
- **Conditions:** the one explicit conditional (circle / straight line, P1) is
  complete with both antecedent and consequent.
- **Omissions:** none. Every list item, example and technical term in the source
  has a counterpart in the candidate.
- **Additions:** three explanatory glosses only — "(that is, the properties and
  qualities)" (P5), "(First Philosophy)" (P7), "or founding" (P11), plus the
  explicit antecedent "that same institution" (P12). All are semantically
  correct, marked or minimal, and none adds a claim Hobbes does not make.
- **Silent corrections:** none. The preserved numbering oddities and the
  "Rights, and Duties" / "Duty and Right" asymmetry confirm the rendering does
  not regularize the original.

## Recommendation

Pin the hash. ACCEPT AS-IS.
