# Fidelity Review 1 — Leviathan, edition chapter 10 (Hobbes's ch. 9)

**Reviewer:** independent fidelity reviewer (Reviewer B), source-based.
**Method:** `books/prompts/fidelity-review-prompt.md`.
**Book / chapter:** Leviathan (Thomas Hobbes, 1651), edition chapter 10 /
Hobbes's own Chapter 9, "Of the Severall Subjects of Knowledge."
**Locked source (sole fidelity anchor):**
`books/wip/leviathan-pilot-ch10/source.json` — 12 paragraphs.
**Candidate:** `books/wip/leviathan-pilot-ch10/candidate-sonnet.json` — 12 paragraphs.
**Also consulted (context only, not a fidelity anchor):**
`current-modern-en.json` (the live `leviathan-modern-en.json` chapter 10),
and the accepted finals for edition ch18 / ch24 / ch40 for house convention.

---

## 1. Coverage

The chapter is short (12 paragraphs), so it was covered in two packets with
overlapping context, then re-read whole. **Every paragraph was read
individually against the source. Nothing was skimmed or sampled.**

| Packet | Certified | Context read |
|---|---|---|
| 1 | P0–P5 | P6 |
| 2 | P6–P11 | P5 |
| Whole-chapter re-read | P0–P11 | — |

Structural checks run mechanically as well as by eye:

- `number`: source 10, candidate 10 — match.
- Paragraph count: 12 / 12 — match. No merges, splits, reorders, or drops.
- Every list label (`I.`, `A.`, `1.`, `a.`, `a.`, `2)`, `B.`, `1.`, `2.`)
  compared index-by-index: **all 12 match exactly.**

---

## 2. The numbering oddities — verified, genuinely in the source

The drafter flagged two oddities. Both are **real source features, not
drafter error**, and I verified this independently rather than taking the
drafter's word:

1. **P6 and P7 are both labeled `a.`, with no `b.`** — confirmed present in
   the locked source.
2. **P8 is labeled `2)` rather than `2.`** — confirmed present in the locked
   source. It is also the only closing-paren label anywhere in the chapter.

Further, `source.json` was compared programmatically against the live
`app/public/data/editions/leviathan-original-en.json` chapter 10: the
`title` string and all 12 paragraph strings are **byte-identical**. So the
locked source is a faithful extract of the pinned original edition, and the
oddities originate upstream of this pilot.

**The candidate preserves both oddities exactly** — `a.` / `a.` with no `b.`,
and `2)` — and has not silently renumbered them to `a.` / `b.` or `2.`. This
is the correct behavior and is explicitly **not** a defect.

See §6 (N5) for a separate, out-of-scope note about what these oddities
imply about the upstream original-edition text.

---

## 3. Blocking defects

### D1 — BLOCKING (mechanical). Chapter title left unmodernized.

- **Index:** chapter `title` field.
- **Source:** `"Chapter 9. Of the Severall Subjects of Knowledge"`
- **Candidate:** `"Chapter 9. Of the Severall Subjects of Knowledge"`
- **What's wrong:** The candidate copied the source title verbatim,
  including the archaic `Severall`. This is an archaic island at the very
  top of an otherwise modernized chapter, and it breaks the house
  convention established by the accepted pilots: chapter titles are
  modernized to the spelling the live `leviathan-modern-en.json` already
  uses. This is exactly defect D1 from
  `books/wip/leviathan-pilot-ch24/fidelity-review-1.md`, where source
  `"Of the Publique Ministers of Soveraign Power"` was required to become
  `"Of the Public Ministers of Sovereign Power"` in the accepted final. The
  live modern-en title for edition ch10 is already
  `"Chapter 9. Of the Several Subjects of Knowledge"`; shipping the
  candidate as-is would regress it. (Edition ch40's source title happened
  to be modern-spelled already, so it is consistent with, not evidence
  against, this convention; ch18's accepted final likewise sits against a
  live modern-en title reading `Commonwealth`.)
- **Verdict on convention:** **modernized title wins.** The drafter's choice
  to keep source spelling is wrong for this project.
- **Fix:** set
  `"title": "Chapter 9. Of the Several Subjects of Knowledge"`.

### D2 — BLOCKING (unmodernized island / internal inconsistency). P7.

- **Index:** P7
- **Source:** `"a. Consequences from the Qualities of Bodies Transient,
  such as sometimes appear, sometimes vanish"`
- **Candidate:** `"a. Consequences from the qualities of bodies transient,
  such as sometimes appear, sometimes vanish"`
- **What's wrong:** Apart from lowercasing, this paragraph is the source
  verbatim. Two archaic constructions survive untouched: the postpositive
  adjective `bodies transient`, and `such as sometimes appear` (17th-century
  `such as` = "which"), which in modern English reads as a broken sentence
  because the relative pronoun is missing. This is an unmodernized island
  under the quotation/modernization rule, and — more damning — it is
  **internally inconsistent with the candidate's own choices elsewhere in
  the same table**: in P4 the candidate modernized `Bodies Naturall` →
  `natural bodies`, and in P8 it modernized `substance aetherial` →
  `ethereal substance`. Only P7 was left in archaic word order. There is no
  fidelity loss here — the meaning is intact — but the modernization mandate
  is not met, and the inconsistency is visible to a reader within three
  lines of the table.
- **Fix:** `"a. Consequences from the qualities of transient bodies —
  those that sometimes appear and sometimes vanish"`. (Keep the `a.` label
  exactly as is.)

---

## 4. Non-blocking defects / fixes recommended

### D3 — NON-BLOCKING (archaic residue). P8.

- **Index:** P8
- **Source:** `"...between the Starres; such as are the Ayre, or substance
  aetherial."`
- **Candidate:** `"...between the stars; such as are the air, or ethereal
  substance."`
- **What's wrong:** `such as are the air` carries over the same archaic
  `such as` construction as D2. `Ayre` → `air` and `substance aetherial` →
  `ethereal substance` were handled correctly; only the connective is
  stranded.
- **Fix:** `"...between the stars — that is, the air, or the ethereal
  substance."` Fix D2 and D3 together so the table reads consistently.

### D4 — NON-BLOCKING (archaic residue, term of art). P6.

- **Index:** P6
- **Source:** `"a. Consequences from Quantity, and Motion Indeterminate;
  which, being the Principles or first foundation of Philosophy, is called
  Philosophia Prima"`
- **Candidate:** `"a. Consequences from quantity and motion indeterminate;
  which, being the principles or first foundation of philosophy, is called
  Philosophia Prima"`
- **What's wrong:** `motion indeterminate` keeps the source's postpositive
  order, same class of residue as D2. Fidelity is fine and `Philosophia
  Prima` is correctly left in Latin (it is Hobbes's name for the discipline,
  not a phrase to translate). The singular verb `is called` against a
  compound subject is also the source's own and is correctly preserved.
- **Fix (optional):** `"Consequences from indeterminate quantity and
  motion; which, being the principles or first foundation of philosophy, is
  called Philosophia Prima"`. Lower priority than D2/D3 because
  "indeterminate" here modifies the pair and the inversion is less
  disruptive than P7's missing relative pronoun.

---

## 5. Checklist results, paragraph by paragraph

All nine checklist axes (actors, negation, causality, certainty/hedging,
conditions, omissions, additions, silent corrections, unmodernized
quotations) were run on each of the 12 paragraphs. Clean unless noted.

**P0** — Clean on fidelity. Two-way division preserved with the right halves
attached to the right terms (`knowledge of fact` → sense/memory/absolute/
witness; `knowledge of the consequence of one affirmation to another` →
science/conditional/philosopher). No actor swap. The conditional
(`If The Figure Showne Be A Circle, Then...`) survives with identical scope
and consequence; `Shall Divide` → `divides` is a tense/aspect
modernization, not a certainty change. `of him that pretends to Reasoning`
→ `of anyone who claims to reason` is the correct 17th-century sense of
"pretends" (lays claim to), not the modern "feigns" — good. No additions,
no omissions.

**P1** — Clean. `no Dependance on Mans Will` → `no dependence on the will of
man` preserves the negation. `one called Naturall History` / `The other, is
Civill History` → `One is natural history` / `The other is civil history`:
correct pairing, no swap. The full example list (metals, plants, animals,
regions) is intact with nothing added.

**P2** — Clean. `Registers` → `records` is consistent with P1's `Register` →
`record` — no terminology drift. `according to the diversity of the Matter`
→ `according to the variety of the subject matter` is accurate. The
forward-reference to the table is preserved, which matters because P3–P11
are that table.

**P3** — Clean. `which is called also PHILOSOPHY` → `which is also called
PHILOSOPHY`. ALL-CAPS preserved. Source has no terminal period here and the
candidate correctly adds none.

**P4** — Clean. `Accidents of Bodies Naturall` → `the accidents of natural
bodies`; the inserted `the` is licensed. `NATURALL PHILOSOPHY` → `NATURAL
PHILOSOPHY`, caps preserved.

**P5** — Clean. `which are Quantity, and Motion` → `which are quantity and
motion`; the plural verb correctly still governs both.

**P6** — Fidelity clean. See D4 (style).

**P7** — Fidelity clean. See D2 (blocking modernization defect).

**P8** — Fidelity clean, and notably so. The source reads `Consequences of
the Qualities from Liquid Bodies`, which is a garbled/transposed
construction (one would expect "from the Qualities of Liquid Bodies"). **The
candidate preserved the source's transposition exactly rather than silently
correcting it to the standard reading.** That is the correct call under the
"silent corrections" rule and I am recording it as a pass, not a defect.
See D3 for the `such as are` residue.

**P9** — Clean. `Politique Bodies` → `political bodies`, `POLITIQUES` →
`POLITICS`, `CIVILL PHILOSOPHY` → `CIVIL PHILOSOPHY`. Caps preserved; the
two ALL-CAPS discipline names are both retained rather than collapsed.

**P10** — Clean. `COMMON-WEALTHS` → `COMMONWEALTHS` (de-hyphenation matches
the live edition's `Commonwealth`). `Body Politique` → `body politic` —
correctly distinguished from P9's `Politique Bodies` → `political bodies`,
since these are different constructions doing different work. Directionality
of `to the Rights, and Duties` is preserved (`to the rights and duties`) and
not silently rewritten into a causal claim.

**P11** — Clean. `from the same, to the Duty and Right of the Subjects` →
`from the same, to the duty and right of the subjects`. The anaphoric `the
same` still points at "the institution of commonwealths" in P10. Note the
source's own asymmetry — `Rights, and Duties` in P10 but `Duty and Right`
(singular, reversed) in P11 — **is preserved, not normalized.** Correct.

---

## 6. Whole-chapter re-read — cross-boundary notes

Read start to finish in one pass after the packets, looking for what packets
hide.

- **N1 — Terminology consistency across the chapter: holds.** `knowledge of
  fact` / `knowledge of the consequence of one affirmation to another`
  (P0) → `knowledge of fact` (P1) → `consequences` in every table row.
  `science` (P0) → `records of science` (P2) → `I. Science` (P3). `register`
  → `record` in both P1 and P2. The P2 promise of "a table that follows" is
  paid off by P3–P11 with no dangling reference. No recurring term is
  translated two different ways.
- **N2 — Taxonomic hierarchy survives intact.** `I.` contains `A.` and `B.`;
  `A.` contains `1.` then the `a.`/`a.`/`2)` rows; `B.` contains `1.` and
  `2.`. The candidate did not flatten, re-indent, or re-parent anything.
- **N3 — ALL-CAPS inconsistency (non-blocking, cosmetic).** The candidate
  preserves the source's ALL-CAPS on `PHILOSOPHY`, `NATURAL PHILOSOPHY`,
  `POLITICS`, `CIVIL PHILOSOPHY`, `COMMONWEALTHS`, but drops it on the
  source's opening `KNOWLEDGE` in P0 (`Knowledge is of two kinds`). Both
  capitalizations are the same Gutenberg convention for a term being
  introduced. Either policy is defensible; applying two policies in one
  chapter is not. Optional fix: `"KNOWLEDGE is of two kinds."` No fidelity
  impact — noting it so the ch18/24/40 house policy can settle it once.
- **N4 — No cross-boundary content movement.** No clause from any paragraph
  surfaced in a neighbor. Word-for-word the candidate tracks the source
  paragraph for paragraph.
- **N5 — Upstream source-integrity note (OUT OF SCOPE for this review, but
  Anders should see it).** The `a.` / `a.` / `2)` oddity is not random: it
  has the shape of a **table that lost rows during parsing**. In the
  published Leviathan, the Chapter 9 table is substantially longer than nine
  rows — the `NATURAL PHILOSOPHY` branch alone continues into consequences
  from determined quantity and motion, from the qualities of bodies (optics,
  music, astronomy), and the `CIVIL PHILOSOPHY` side sits beside further
  branches (ethics, poetry, rhetoric, logic, the science of just and
  unjust). The orphaned second `a.` with no `b.`, and a `2)` whose `1)` is
  absent, are precisely what is left when intermediate rows are dropped.
  **This does not affect the verdict below** — the locked source is the sole
  fidelity anchor, the candidate matches it, and the candidate must *not*
  restore missing rows. But `leviathan-original-en.json` chapter 10 is worth
  re-checking against the Gutenberg text as separate parsing work, since a
  truncated original would also truncate the modern-en rendering and the
  audio. Flagged, not acted on.

---

## 7. Summary of findings

| ID | Severity | Paragraph | Issue |
|---|---|---|---|
| D1 | **Blocking** | title | Archaic `Severall` retained; breaks the ch24 house convention and regresses the live modern-en title |
| D2 | **Blocking** | P7 | Unmodernized island (`bodies transient`, `such as sometimes appear`); inconsistent with the candidate's own P4/P8 choices |
| D3 | Non-blocking | P8 | `such as are the air` — archaic connective residue |
| D4 | Non-blocking | P6 | `motion indeterminate` — postpositive order retained |
| N3 | Non-blocking | P0 | `KNOWLEDGE` de-capitalized while five later ALL-CAPS terms are kept |
| N5 | Out of scope | — | Locked source itself appears to be a truncated table; upstream parsing check recommended |

**No fidelity defect of any kind was found.** No actor swap, no dropped or
flipped negation, no reversed causality, no certainty/hedging drift, no
altered condition, no omitted clause/example/number, no invented content, no
silent correction (and one notable *correct refusal* to silently correct, at
P8). Both flagged numbering oddities are genuine source features and are
preserved exactly. All four defects above are modernization/mechanical
issues, not meaning issues.

---

## 8. Verdict

### ACCEPT WITH FIXES REQUIRED

Required before acceptance:

1. **D1** — set `"title": "Chapter 9. Of the Several Subjects of Knowledge"`.
2. **D2** — P7 → `"a. Consequences from the qualities of transient bodies —
   those that sometimes appear and sometimes vanish"`.

Recommended in the same pass (cheap, and they make the table read as one
voice):

3. **D3** — P8 → `"...between the stars — that is, the air, or the ethereal
   substance."`
4. **D4** — P6 → `"Consequences from indeterminate quantity and motion;
   which, being..."`
5. **N3** — decide the ALL-CAPS policy once and apply it to P0.

A re-draft is **not** warranted. The rendering is substantively sound and
fidelity-clean throughout; these are two required patches and three optional
ones. After the fixes, only the changed passages need a targeted
re-verification, not a full re-review.

**Do not** "fix" the `a.` / `a.` / `2)` labels. They are the source's.
