# Fidelity Review — Gap Closure, Paragraph Index 10

**Chapter:** edition chapter 10 (Hobbes's Chapter 9, "Of the Several Subjects of Knowledge")
**Source (locked):** `books/wip/leviathan-pilot-ch10/source.json`
**Candidate:** `books/wip/leviathan-pilot-ch10/candidate-sonnet.json`
**Edit under review:** commit `6163a5e5` — "content: ch10 round-3.1 fix - shorten institution/founding gloss"
**Why this review exists:** `6163a5e5` landed *after* the round-3 fidelity check
(`fidelity-review-3.md`, verdict ACCEPT AS-IS) had already been dispatched against the
prior wording. That one edit has therefore never been independently fidelity-checked.
This is a narrow, targeted re-verification of that single edit and its blast radius —
not a re-run of the full chapter review.
**Date:** 2026-09-21

## VERDICT: ACCEPT AS-IS

The shortened gloss is exactly as faithful as the longer one it replaces. No blocking
items. Two non-blocking notes in section 5; neither requires an edit.

---

## 1. Change-set verification (blast radius)

Decoded-string comparison of the current candidate against its pre-edit committed
state (`6163a5e5^` — the state `fidelity-review-3.md` certified):

| Paragraph | Status |
|---|---|
| 0–9 | unchanged (decoded-string identical) |
| **10** | **changed — the edit under review** |
| 11 | unchanged |

Changed set = `[10]` and nothing else. No collateral edits, no serializer drift this
time. Working tree is clean for `books/wip/leviathan-pilot-ch10/`; `source.json` is
untouched since its pin.

This satisfies task item 4: paragraphs 0–9 are byte-identical (after JSON decoding) to
what `fidelity-review-3.md` §4 already certified, so that certification carries forward
intact and is not re-litigated here.

---

## 2. Paragraph 10 — the edit itself

**Source:**
> "Of Consequences from the Institution of COMMON-WEALTHS, to the Rights, and Duties
> of the Body Politique, or Soveraign."

**Previous (round-3-certified) candidate:**
> "1. Of consequences from the institution — that is, the founding — of COMMONWEALTHS,
> to the rights and duties of the body politic, or sovereign."

**Current candidate:**
> "1. Of consequences from the institution, or founding, of COMMONWEALTHS, to the
> rights and duties of the body politic, or sovereign."

### 2.1 Semantic content of the gloss is unchanged

The glossing *word* did not change. "Founding" was the gloss before and is the gloss
now; only the marker changed, from a metalinguistic em-dash `— that is, X —` to a
comma-bracketed appositive `, or X,`. Both markers are standard English devices for
restating a term. Since the content of the restatement is identical, every fidelity
finding in `fidelity-review-3.md` §3 about the accuracy of "founding" transfers
verbatim and is not weakened:

- **Accurate.** "Institution" in this phrase is the act of instituting — the founding
  of a commonwealth by covenant. "Founding" states that.
- **No narrowing.** The gloss does not restrict the entry's scope; the head noun
  governing "of COMMONWEALTHS" is still "institution", and the entry still runs
  *to* "the rights and duties of the body politic, or sovereign", verbatim-faithful to
  "the Rights, and Duties of the Body Politique, or Soveraign".
- **No distortion, no added claim.** It defines a word. It does not assert the
  institution/acquisition doctrine (which Hobbes has not yet drawn at this point in the
  edition), does not editorialize about what follows from founding, and adds no
  category to the table.
- **Head term preserved.** "Institution" remains the operative noun, so a reader who
  meets "commonwealth by institution" in ch. 17–18 has already been handed the term.
  The shortening did not demote it.

### 2.2 The new-ambiguity question: could "or founding" misread as two alternatives?

This is the one genuinely new risk the shortening introduces, since English "or" is in
principle ambiguous between *explicative* ("that is") and *disjunctive* ("alternatively,
a different thing"), where "— that is —" is unambiguously explicative. Assessed
directly, the risk is negligible, for four independent reasons:

1. **Comma-bracketing on both sides.** The form is `, or founding,` — a parenthetical
   set off fore and aft. A disjunctive "or" joining two list items in this position
   would not take a closing comma before "of COMMONWEALTHS"; the closing comma is what
   marks the span as an interpolation rather than a second conjunct.
2. **The twin appositive in the same sentence.** The very same clause ends with "the
   body politic, or sovereign" — Hobbes's own explicative apposition, preserved from
   source. The reader meets the identical `X, or Y,` pattern twice in one sentence, and
   the second instance is unmistakably explicative. This was the stated rationale for
   the edit and it holds up: the sentence teaches its own convention.
3. **Chapter-internal precedent.** Paragraph 8 already uses explicative "or" in this
   chapter: "that is, the air, or the ethereal substance." The device is established.
4. **The failure mode is benign.** Even under the disjunctive misreading, "institution"
   and "founding" denote the same act here, so a misreading reader arrives at
   essentially the same referent. No false claim is available to construct from the
   ambiguity — unlike a case where the two terms named genuinely distinct things.

Set against this, the em-dash form's only fidelity advantage was explicitness of the
metalinguistic signal — a stylistic margin, not a fidelity margin. There is no reading
of the current sentence that yields a claim the source does not support.

### 2.3 Structure of the entry

Outline label "1." preserved. Small-caps COMMONWEALTHS preserved. The source's
"from X, to Y" scope structure is intact and now uninterrupted — which was the
accessibility complaint being answered. Nothing merged, split, reordered, or invented.

---

## 3. Paragraph 11 — anaphor resolution after the change

**Source 11:** "Of Consequences from the same, to the Duty and Right of the Subjects."
**Candidate 11:** "2. Of consequences from that same institution, to the duty and right
of the subjects." *(unchanged by this edit)*

Resolves cleanly. An appositive does not displace the head of its noun phrase, so the
head noun of paragraph 10's first term is still "the institution" — exactly the word
paragraph 11's "that same institution" picks up. Agreement between the two entries is
the same as it was under the certified em-dash wording, and if anything the anaphor now
sits closer to its antecedent, since the interrupting dash-span is gone.

The antecedent matches Hobbes's own: his "from the same" refers back to "the Institution
of COMMON-WEALTHS". Making the anaphor explicit in an outline entry read standalone
remains appropriate and adds no content.

**Boundary 9 → 10 → 11 re-read as a unit:** heading B introduces political bodies /
civil philosophy; entries 1 and 2 sit under it as its two subdivisions; 2 points back to
1's institution. The chain is unbroken.

---

## 4. Structural integrity

| Check | Source | Candidate | Verdict |
|---|---|---|---|
| Paragraph count | 12 | 12 | PASS |
| Paragraph order | — | unchanged | PASS |
| `number` | 10 | 10 | PASS |
| `title` | "Chapter 9. Of the Severall Subjects of Knowledge" | "Chapter 9. Of the Several Subjects of Knowledge" | PASS — spelling modernization only; Hobbes's chapter number 9 preserved in the title, edition-level `number` stays 10 |
| Outline labels (I / A / 1 / a / a / 2) / B / 1 / 2) | as above | identical sequence | PASS — source's own duplicated "a." and "2)" break still left alone |
| JSON validity | — | valid | PASS |
| Nothing merged/split/reordered/invented | — | confirmed | PASS |

---

## 5. Non-blocking notes

1. **Slight loss of metalinguistic explicitness.** `— that is, X —` announces a gloss;
   `, or X,` implies one. Section 2.2 explains why this is not a fidelity problem here
   (comma-bracketing, the twin appositive, chapter precedent, benign failure mode).
   Recorded so a later reviewer does not read the change as accidental. No action.
2. **Round-3 observation #3 still stands, unchanged.** "Founding" remains very slightly
   broader than the technical "institution" (a commonwealth by acquisition is also,
   loosely, founded). That was non-blocking then and is non-blocking now for the same
   reason: the gloss explains the head term, which remains operative, and Hobbes has not
   yet drawn the institution/acquisition distinction at this point in the edition. If
   ch. 17/18 wants tighter language, that is a ch. 17/18 decision.

---

## 6. Coverage statement

- Full source (12/12) and full candidate (12/12) read.
- Paragraph 10 reviewed clause-by-clause against locked source, and against its
  round-3-certified prior wording, with the new-ambiguity question assessed explicitly.
- Paragraph 11 re-read for anaphor resolution under the new wording.
- Paragraphs 0–9 verified decoded-identical to the `fidelity-review-3.md`-certified
  state via `git show 6163a5e5^`; that certification carries forward.
- Structure (count, order, numbering, title, outline labels, JSON validity) verified.
- Working tree and source pin verified clean.

**Result: ACCEPT AS-IS.** The verification gap left by `6163a5e5` is closed. Chapter 10
is fidelity-clear for the verify-and-pin step.
