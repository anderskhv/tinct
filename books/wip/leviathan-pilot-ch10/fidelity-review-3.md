# Fidelity Review — Round 3

**Chapter:** edition chapter 10 (Hobbes's Chapter 9, "Of the Several Subjects of Knowledge")
**Source (locked):** `books/wip/leviathan-pilot-ch10/source.json`
**Candidate:** `books/wip/leviathan-pilot-ch10/candidate-sonnet.json`
**Round-3 edit commit:** `901a313d` — "content: round-3 fixes for Leviathan batch 2 (ch10, ch14, ch27)"
**Reviewer:** independent fidelity pass (round 3 of the accept/fix/reverify cycle)
**Date:** 2026-09-21

## VERDICT: ACCEPT AS-IS

All three round-3 edits are faithful. No blocking items. Three non-blocking
observations are recorded in section 6; none require a round-4 edit, and
nothing here should be "fixed" silently at pin time.

---

## 1. Change-set verification (what actually moved this round)

Decoded-string comparison of the current candidate against its pre-round-3
committed state (`901a313d^`):

| Paragraph | Status |
|---|---|
| 0 | unchanged |
| 1 | unchanged |
| **2** | **changed (round-3 scope)** |
| 3 | unchanged |
| 4 | unchanged |
| 5 | unchanged |
| 6 | unchanged |
| 7 | unchanged |
| 8 | unchanged |
| 9 | unchanged |
| **10** | **changed (round-3 scope)** |
| **11** | **changed (round-3 scope)** |

The changed set matches the declared round-3 scope exactly: paragraphs 2, 10,
11 and nothing else. No collateral edits.

**Encoding note (not a content change):** the raw diff also shows em dashes in
paragraphs 0, 1, 7, 8 re-serialized from literal `—` to the JSON escape
`—`. This is a serializer artifact of the edit helper, not a text change —
those four paragraphs decode byte-identically to their certified state. The
escaped form matches the house style already used in
`current-modern-en.json` and in the ch14/ch27 candidates, so no action needed.

`source.json` has not been modified since it was pinned in `e4b82586`. Working
tree is clean.

---

## 2. Paragraph 2 — faithfulness of the rewrite

**Source:**
> "The Registers of Science, are such Books as contain the Demonstrations of
> Consequences of one Affirmation, to another; and are commonly called Books of
> Philosophy; whereof the sorts are many, according to the diversity of the
> Matter; And may be divided in such manner as I have divided them in the
> following Table."

**Candidate (round 3):**
> "The records of science are the books that contain the demonstrations of how
> one affirmation follows as a consequence from another; these are commonly
> called books of philosophy. They are of many sorts, according to the variety
> of the subject matter, and can be classified as shown in the table that
> follows."

Clause-by-clause coverage:

| Source clause | Candidate rendering | Verdict |
|---|---|---|
| "The Registers of Science, are such Books as contain..." | "The records of science are the books that contain..." | Faithful. "Register" → "record" is consistent with paragraph 1's already-certified "The record of knowledge of fact is called history." |
| "the Demonstrations of Consequences of one Affirmation, to another" | "the demonstrations of how one affirmation follows as a consequence from another" | Faithful. The stacked prepositional chain is unpacked into a finite clause. Inferential direction is preserved: Hobbes's "consequence of A to B" = B follows from A, which is what the candidate states. Both terms stay indefinite; no particular affirmations are smuggled in. |
| "and are commonly called Books of Philosophy" | "these are commonly called books of philosophy" | Faithful, verbatim in substance. |
| "whereof the sorts are many, according to the diversity of the Matter" | "They are of many sorts, according to the variety of the subject matter" | Faithful. "Matter" correctly read as *subject matter*, not *material substance* — the right sense here, since the sorts of philosophy books vary by topic. |
| "And may be divided in such manner as I have divided them in the following Table." | "and can be classified as shown in the table that follows." | Faithful in substance. The repeated-verb self-reference ("divided... as I have divided them") is collapsed, and the table is still presented as the chapter's own division, immediately followed by that very table in paragraphs 3-11. |

- **Nothing added.** No new categories, no explanatory content beyond the source.
- **Nothing dropped.** All four source clauses are represented.
- **Nothing distorted.** Sentence-splitting (one semicolon-chained period into two
  sentences) does not alter the argument and does not touch paragraph count.

**Paragraph-count integrity:** the rewrite stayed inside paragraph 2; no split,
merge, or reorder.

---

## 3. Paragraphs 10–11 — the institution/founding gloss

**Source:**
> 10: "Of Consequences from the Institution of COMMON-WEALTHS, to the Rights,
> and Duties of the Body Politique, or Soveraign."
> 11: "Of Consequences from the same, to the Duty and Right of the Subjects."

**Candidate (round 3):**
> 10: "Of consequences from the institution — that is, the founding — of
> COMMONWEALTHS, to the rights and duties of the body politic, or sovereign."
> 11: "Of consequences from that same institution, to the duty and right of the
> subjects."

Assessment:

1. **The gloss is accurate.** In Leviathan, "institution" in this phrase is the
   act of instituting — the founding of a commonwealth by covenant, as opposed
   to a commonwealth by acquisition (ch. 17-18). "That is, the founding" states
   exactly that and nothing more.
2. **It does not overreach.** The gloss defines a word; it does not assert a
   doctrine, does not introduce the institution/acquisition contrast that
   Hobbes has not yet made at this point in the text, and does not editorialize
   about what follows from the founding. Scope of the entry — consequences
   running *to* the rights and duties of the body politic or sovereign — is
   untouched.
3. **The head term is now "institution", which is the right call.** Keeping
   "institution" as the operative noun with "founding" as the appositive gloss
   preserves ch. 18's already-accepted technical usage, so a reader who meets
   "commonwealth by institution" later has already been handed the term. The
   round-2 flag (D5) is resolved in the correct direction — the gloss serves
   the technical term rather than replacing it.
4. **Paragraph 11's anaphor resolves correctly.** Hobbes's "from the same"
   refers back to "the Institution of COMMON-WEALTHS". "From that same
   institution" resolves it to the same antecedent, and now agrees with
   paragraph 10's head noun (previously "that same founding" agreed with the
   previous "the founding"). Making the anaphor explicit in an outline entry
   that will be read standalone is appropriate and adds no content.
5. **Remainder of both entries is verbatim-faithful:** "Rights, and Duties of
   the Body Politique, or Soveraign" → "rights and duties of the body politic,
   or sovereign" (apposition preserved, not silently reinterpreted);
   "Duty and Right of the Subjects" → "duty and right of the subjects"
   (Hobbes's singular "duty and right" order preserved).

---

## 4. Paragraphs 0, 1, 3–9 — unchanged-state confirmation

Confirmed **byte-identical after JSON decoding** to the round-2-certified state
(`c0b188f3` / `901a313d^`). Re-read against source for regression:

- **0** — two kinds of knowledge, fact vs. consequence; absolute vs.
  conditional; witness vs. philosopher; the circle/diameter example intact,
  including "any straight line through its centre divides it into two equal
  parts." Note it renders Hobbes's technical phrase literally as "knowledge of
  the consequence of one affirmation to another." Clean.
- **1** — history; natural vs. civil; the metals/plants/animals/regions list
  complete; "no dependence on the will of man" intact. Clean.
- **3** — "I. Science, that is, knowledge of consequences; which is also called
  PHILOSOPHY". Clean; small-caps emphasis preserved.
- **4** — "accidents (that is, the properties and qualities)" gloss, certified
  in an earlier round, still present and still accurate for Hobbes's sense of
  *accident*.
- **5** — "accidents common to all natural bodies; which are quantity and
  motion." Clean.
- **6** — "indeterminate quantity and motion... Philosophia Prima (First
  Philosophy)". Latin preserved with gloss, per the chapter's Latin-gloss
  policy. Clean.
- **7** — "qualities of transient bodies — those that sometimes appear and
  sometimes vanish". Faithful to "Qualities of Bodies Transient". Clean.
- **8** — "2) Consequences of the qualities from liquid bodies that fill the
  space between the stars — that is, the air, or the ethereal substance."
  Correctly preserves the source's own awkward "of the Qualities from" without
  silently repairing it, and the "2)" numbering break likewise mirrors the
  source. Clean.
- **9** — "B. Consequences from the accidents of political bodies; which is
  called POLITICS, and CIVIL PHILOSOPHY". Clean.

**Boundary 9 → 10 → 11 reads consistently.** Heading B introduces political
bodies / civil philosophy; entries 1 and 2 sit under it as its two
subdivisions; 2's "that same institution" points back to 1's "the institution
— that is, the founding — of COMMONWEALTHS". The round-3 terminology change did
not break the heading-to-entry or entry-to-entry chain.

---

## 5. Structural integrity

| Check | Source | Candidate | Verdict |
|---|---|---|---|
| Paragraph count | 12 | 12 | PASS |
| Paragraph order | — | unchanged | PASS |
| `number` | 10 | 10 | PASS |
| `title` | "Chapter 9. Of the Severall Subjects of Knowledge" | "Chapter 9. Of the Several Subjects of Knowledge" | PASS — spelling modernization only; Hobbes's own chapter number 9 preserved inside the title while the edition-level `number` stays 10 |
| Outline labels (I / A / 1 / a / a / 2) / B / 1 / 2) | as above | identical sequence | PASS — including the duplicated "a." and the "2)" break, which are the source's own artifacts and correctly left alone |
| JSON validity | — | valid | PASS |
| Nothing merged/split/reordered/invented | — | confirmed | PASS |

---

## 6. Non-blocking observations (no round-4 edit required)

1. **Terminological consistency of Hobbes's key phrase across paragraphs 0 and
   2.** Paragraph 0 renders "consequence of one affirmation to another"
   literally; paragraph 2 now unpacks the same phrase as "how one affirmation
   follows as a consequence from another." Both are accurate, and the unpacking
   is the point of the round-3 fix, but a reader tracking Hobbes's terminology
   meets the phrase in two shapes. Acceptable as-is — paragraph 0 is where the
   term is defined, and paragraph 2 is where it is applied.
2. **Hobbes's first person is gone from paragraph 2.** "as I have divided them"
   became the agentless "as shown in the table that follows." This was the
   declared aim of the fix and the table is unmistakably the chapter's own, so
   no authority is misattributed; recording it only so a later reviewer does not
   read the loss as accidental.
3. **"Founding" is very slightly broader than "institution."** A commonwealth by
   acquisition is also, loosely, founded, whereas "institution" is the narrow
   technical case. The gloss is not wrong — it explains the head term
   "institution," which remains operative — and Hobbes has not yet drawn the
   institution/acquisition distinction at this point in the edition, so there is
   nothing here for a reader to mis-map. If ch. 17/18 renderings later want
   tighter language, that is a ch. 17/18 decision, not a ch. 10 defect.

---

## 7. Coverage statement

- Full source (12/12 paragraphs) read against full candidate (12/12 paragraphs).
- Round-3 changed paragraphs (2, 10, 11) reviewed clause-by-clause against the
  locked source text.
- Unchanged paragraphs (0, 1, 3–9) verified as decoded-byte-identical to the
  round-2-certified state via `git show 901a313d^`, and re-read against source.
- Paragraph 9/10/11 boundary read as a unit for referential consistency.
- Structure (count, order, numbering, title, JSON validity) verified.
- Working tree and source pin verified clean.

**Result: ACCEPT AS-IS.** Chapter 10 is fidelity-clear for the verify-and-pin
step.
