# Fidelity Review 2 — Leviathan, edition chapter 10 (Hobbes's ch. 9)

**Reviewer:** independent fidelity reviewer (Reviewer B), source-based,
second round (post-revision).
**Method:** `books/prompts/fidelity-review-prompt.md`.
**Book / chapter:** Leviathan (Thomas Hobbes, 1651), edition chapter 10 /
Hobbes's own Chapter 9, "Of the Severall Subjects of Knowledge."
**Locked source (sole fidelity anchor):**
`books/wip/leviathan-pilot-ch10/source.json` — 12 paragraphs.
**Candidate re-reviewed:** `books/wip/leviathan-pilot-ch10/candidate-sonnet.json`
(post-revision state).
**Baseline read first:** `fidelity-review-1.md` (verdict: ACCEPT WITH FIXES
REQUIRED — D1 title and D2 P7 blocking; D3 P8, D4 P6, N3 P0 non-blocking).
**Also consulted (context only, never a fidelity anchor):**
`accessibility-review-1.md` (the source of the new edits),
`current-modern-en.json` (live ch10), `leviathan-pilot-ch18/leviathan-ch18-final.json`
and its `source.json` (for the "institution" cross-reference),
`leviathan-pilot-ch24/leviathan-ch24-final.json`,
`leviathan-pilot-ch40/leviathan-ch40-final.json`,
`books/wip/leviathan-terminology-note.md` (house term policy).

---

## 1. Coverage

**Every one of the 12 paragraphs was re-read individually against the source.
Nothing was skimmed or sampled.** This round was scoped as a targeted
re-verification of the seven changed paragraphs plus the title, but I read the
five unchanged paragraphs against the source as well (they are one-line table
rows or short prose; the marginal cost is nil and it is the only way to be sure
"unchanged" is true).

| Packet | Certified | Context read |
|---|---|---|
| 0 | `title` | P0 |
| 1 | P0–P5 | P6 |
| 2 | P6–P11 | P5 |
| Whole-chapter re-read | P0–P11 | — |

Verified unchanged from the round-1 state (re-read, still fidelity-clean):
P1, P2, P3, P5, P9. No drift, no accidental edit, no terminology change.

Structural checks run mechanically as well as by eye:

- `number`: source 10, candidate 10 — match.
- Paragraph count: **12 / 12** — match. No merges, splits, reorders, drops.
- All 12 list labels compared index-by-index (`—`,`—`,`—`,`I.`,`A.`,`1.`,`a.`,
  `a.`,`2)`,`B.`,`1.`,`2.`): **all 12 identical to source.**
- Terminal-punctuation parity per paragraph: source and candidate agree on
  every paragraph (P3/P4/P9 end unpunctuated on the ALL-CAPS discipline name;
  P6 and P7 end unpunctuated; the rest end in a period). The only formal
  difference is P6 now ending in `)` because of its new gloss — still no
  invented terminal period.
- Word-count tripwire (candidate/source per paragraph, per the ch24 rule):
  1.03, 1.02, 1.04, 1.00, **1.58**, 1.00, 1.10, 1.14, 1.04, 1.00, 1.00, 1.07.
  The single outlier is P4, fully accounted for by its licensed 6-word gloss
  (12→19 words); read directly, not just diffed. No content loss anywhere.

---

## 2. Round-1 fixes — item-by-item verification

### 1. D1 (blocking) — chapter title. **CONFIRMED FIXED.**

- Candidate `title` now reads exactly
  `"Chapter 9. Of the Several Subjects of Knowledge"`.
- Byte-compared against the live `current-modern-en.json` title: **identical.**
  No regression of the live modern-en title; the archaic `Severall` island at
  the top of the chapter is gone. Matches the ch24 house convention.

### 2. D2 (blocking) — P7. **CONFIRMED FIXED, to the prescribed wording.**

- Candidate: `"a. Consequences from the qualities of transient bodies — those
  that sometimes appear and sometimes vanish"`
- This is D2's prescribed fix **verbatim**, label `a.` preserved exactly, and
  no terminal period added (source has none).
- Re-derived independently against source `"a. Consequences from the Qualities
  of Bodies Transient, such as sometimes appear, sometimes vanish"`: the
  postpositive `bodies transient` is resolved to `transient bodies`; the
  17th-century `such as` (= "which") is resolved to `those that`, with the
  antecedent correctly landing on the **bodies**, not the qualities — which is
  the source's own grammar. Fidelity intact, no meaning added or lost.

### 3. D3 (non-blocking) — P8. **CONFIRMED FIXED, to the prescribed wording.**

- Candidate: `"2) Consequences of the qualities from liquid bodies that fill
  the space between the stars — that is, the air, or the ethereal substance."`
- D3's prescribed tail applied verbatim; the stranded `such as are` is gone.
- **Critically, the source's garbled transposition is still preserved.** The
  source reads `Consequences of the Qualities from Liquid Bodies`; the
  candidate still reads `Consequences of the qualities from liquid bodies` and
  has **not** been silently normalized to "from the qualities of liquid
  bodies." (The live `current-modern-en.json` *does* normalize it — so the
  candidate is deliberately diverging from the live edition in the correct
  direction under the silent-corrections rule.) The revision round did not
  erode this. Recorded as a pass, and specifically as a *correct refusal*.
- Label `2)` unchanged.

### 4. D4 (non-blocking) — P6. **CONFIRMED FIXED, to the prescribed wording**
(plus one new gloss, see §3).

- Candidate: `"a. Consequences from indeterminate quantity and motion; which,
  being the principles or first foundation of philosophy, is called
  Philosophia Prima (First Philosophy)"`
- D4's prescribed reordering applied verbatim. `indeterminate` correctly
  governs the pair (quantity *and* motion), as in the source. The source's own
  singular verb `is called` against the compound subject is still preserved,
  not normalized to `are called` — correct.
- Note in passing: this is also more faithful than the live edition, which
  renders `Motion Indeterminate` as "in general" — a real (if small) semantic
  loosening the candidate avoids.

### 5. N3 (non-blocking) — P0 ALL-CAPS. **CONFIRMED FIXED.**

- Candidate P0 now opens `"KNOWLEDGE is of two kinds."` The ALL-CAPS policy is
  now applied uniformly across the chapter: `KNOWLEDGE`, `PHILOSOPHY`,
  `NATURAL PHILOSOPHY`, `POLITICS`, `CIVIL PHILOSOPHY`, `COMMONWEALTHS` all
  carry the source's caps; nothing else does. No second policy in force.
- Rest of P0 re-read in full against source: two-way division intact with the
  right halves on the right terms, the geometry conditional unchanged in scope
  and consequence, `pretends to Reasoning` → `claims to reason` still the
  correct 17th-century sense. No new defect introduced by the capitalization
  edit.

---

## 3. New edits not covered by round 1 — independently checked

### 6. P4 — the new `accidents` gloss. **ACCEPT (accurate, not overreaching).**
Non-blocking style note only.

- **Source:** `"A. Consequences from Accidents of Bodies Naturall; which is
  called NATURALL PHILOSOPHY"`
- **Candidate:** `"A. Consequences from the accidents (that is, the properties
  and qualities) of natural bodies; which is called NATURAL PHILOSOPHY"`
- **Accuracy check, from Hobbes's own usage in the locked book** (I checked the
  pinned `leviathan-original-en.json` rather than reasoning from outside
  knowledge): ch2 ¶0 — "some quality, or other Accident of a body without us";
  ch5 ¶6 — "their similitude in some quality, or other accident"; ch5 ¶15 —
  "for some accident or quality, which we conceive to be in it"; ch6 ¶9/¶10 —
  accidents opposed to bodies, "the Accidents of Bodies Without Us." Hobbes
  himself repeatedly pairs accident with quality as near-synonyms, with quality
  as a species of accident. **The gloss is therefore within Hobbes's own idiom
  and does not overreach.** It does not smuggle in the Aristotelian
  accident/essence contrast, does not assert anything Hobbes denies, and does
  not change what the taxonomy branch covers.
- **Two small notes, neither blocking:**
  - (a) *Mild hierarchy blur.* Inside this very table, `qualities` is the name
    of a **narrower sub-branch** (P7, P8) sitting under `accidents` (P4, P5).
    Glossing accidents as "the properties and qualities" makes the two read as
    equivalents three lines before the table relies on them being nested. A
    gloss that leaves the nesting visible would be safer, e.g. *"(that is, the
    properties and qualities a body happens to have)"* or simply *"— that is,
    their properties —"*. Optional.
  - (b) *House gloss style.* ch18/ch24/ch40 finals consistently use the inline
    `— that is, …` em-dash form for this kind of aid (`"organic parts — that
    is, the parts with a distinct function"`, `"Dei Gratia in the strict sense
    — that is, by the favor of God alone"`). A round parenthesis is used in
    ch40 only for `(Ecclesia)`, a source-derived term. Matching the em-dash
    form would make ch10 read like its siblings. Cosmetic.
  - Gloss placement is otherwise right: it lands on the **first** occurrence
    (P4) and is not repeated at P5 or P9, per the terminology note's
    "gloss once, don't re-gloss" rule.

### 7. P6 — `Philosophia Prima (First Philosophy)`. **ACCEPT.** Non-blocking
style note only.

- The Latin term of art is **kept**, as the terminology note requires
  ("untranslated Greek/Latin terms of art … keep untranslated, gloss briefly
  and accurately"), and the gloss is a correct literal translation. The gloss
  is sited cleanly outside the term and does not reassign what is Hobbes's
  Latin and what is the modernizer's English.
- Same cosmetic point as P4(b): house form would be `Philosophia Prima — that
  is, First Philosophy` or `…, or First Philosophy` (the accessibility
  reviewer's own suggested wording). Optional.

### 8. P10–P11 — `institution` → `founding`, and `the same` → `that same
founding`. **ACCEPT ON MEANING; one non-blocking cross-chapter defect (D5).**

- **Source P10:** `"1. Of Consequences from the Institution of COMMON-WEALTHS,
  to the Rights, and Duties of the Body Politique, or Soveraign."`
  **Candidate P10:** `"1. Of consequences from the founding of COMMONWEALTHS,
  to the rights and duties of the body politic, or sovereign."`
- **Source P11:** `"2. Of Consequences from the same, to the Duty and Right of
  the Subjects."`
  **Candidate P11:** `"2. Of consequences from that same founding, to the duty
  and right of the subjects."`

**Meaning check — passes.** Hobbes's `Institution` here is the *act of
instituting/establishing*, not "an established organization," and `founding`
carries exactly that act-sense. The `from X, to Y` directionality is preserved
in both rows and has **not** been silently rewritten into a causal claim.
`COMMONWEALTHS` caps preserved (de-hyphenation matches house convention);
`Body Politique` → `body politic` still correctly distinguished from P9's
`Politique Bodies` → `political bodies`; and the source's own asymmetry
(`Rights, and Duties` in P10 vs. the singular, reversed `Duty and Right` in
P11) is **still preserved, not normalized.** The P11 anaphor resolution is
correct: `the same` does point back to the institution/founding of
commonwealths, not to the commonwealths themselves, so `that same founding` is
a licensed explicitation, not an invention. Word-count ratios 1.00 and 1.07
confirm nothing else moved.

**Cross-reference requested — ch18's `institution`.** I checked. `Institution`
in Leviathan **is** a term of art, and the accepted ch18 final **keeps it**:

> ch18 source: `"…may be called a Politicall Common-wealth, or Common-wealth by
> Institution; and the former, a Common-wealth by Acquisition. And first, I
> shall speak of a Common-wealth by Institution."`
> ch18 accepted final: `"…may be called a political commonwealth, or a
> commonwealth by institution; the first, a commonwealth by acquisition. I will
> speak first of a commonwealth by institution."`

The contrast term is **acquisition**, and ch10's table row B.1 —
"from the Institution of Common-wealths, to the Rights and Duties of the Body
Politique, or Soveraign" — is the table entry that corresponds to Hobbes's own
chapter "Of the Rights of Soveraignes by Institution." So this is **not** a
loose everyday sense that happens to share a word: it is the same technical
term, used of the same act, naming the branch of civil philosophy that the
institution/acquisition distinction organizes. See D5.

---

## 4. Defects

### D5 — NON-BLOCKING (terminology, cross-chapter). P10 (and P11).

- **What's wrong:** replacing the term of art `institution` with the paraphrase
  `founding` severs the lexical link to the accepted ch18 final, where
  `commonwealth by institution` / `commonwealth by acquisition` is the load-
  bearing pair. A reader who meets "the founding of commonwealths" in ch10's
  table has nothing to connect it to "a commonwealth by institution" eight
  chapters later, and the live modern-en edition currently in production uses
  `institution` here too. This is a terminology-consistency loss, **not** a
  meaning error — `founding` is a correct reading of the word — which is why it
  is non-blocking rather than blocking. But it is exactly the class of thing
  the terminology note exists to catch, and the accessibility reviewer who
  proposed it was reasoning from within this chapter alone and had no reason to
  see the ch18 precedent.
- **Fix (recommended, satisfies both reviewers):** keep the term and gloss it
  once, as the house does for every other Hobbesian term of art —
  P10: `"1. Of consequences from the institution — that is, the founding — of
  COMMONWEALTHS, to the rights and duties of the body politic, or sovereign."`
  P11: `"2. Of consequences from that same institution, to the duty and right
  of the subjects."`
  (Or, if Anders prefers the accessibility reading to win, keep `founding`
  everywhere and record the choice in `leviathan-terminology-note.md` so ch18's
  `institution` and any future chapter get reconciled deliberately rather than
  chapter by chapter. Either resolution is defensible; what is not defensible
  is leaving the two accepted chapters silently disagreeing.)

### N6 — NON-BLOCKING (style, cosmetic). P4, P6.
Gloss punctuation style: parentheses here vs. the `— that is, …` em-dash form
used throughout ch18/ch24/ch40. See §3 items 6(b) and 7.

### N7 — NON-BLOCKING (style, optional). P4.
Gloss wording slightly flattens the table's own accidents ⊃ qualities nesting.
See §3 item 6(a).

### N5 (carried forward, OUT OF SCOPE, unchanged) — the locked source itself
still looks like a table that lost rows during parsing (orphan second `a.` with
no `b.`, a `2)` with no `1)`). This does not affect the verdict, the candidate
must not restore missing rows, and nothing in this revision round touched it.
`leviathan-original-en.json` ch10 remains worth re-checking against Gutenberg
as separate parsing work.

**No new blocking defect was found. No fidelity defect of any kind was found in
this round** — no actor swap, no dropped or flipped negation, no reversed
causality, no certainty/hedging drift, no altered condition, no omitted
clause/example/number, no invented claim, no silent correction. The one
addition (P4/P6 glosses, P11's anaphor resolution) is licensed reader aid that
states nothing the source does not license.

---

## 5. Item 7 — structure and source oddities

| Check | Result |
|---|---|
| Paragraph count | 12 / 12 — **unchanged** |
| `number` field | 10 / 10 — unchanged |
| Order / merges / splits / drops | none |
| `a.` at P6 and `a.` at P7, with no `b.` | **preserved exactly, unchanged** |
| `2)` at P8 (the only closing-paren label) | **preserved exactly, unchanged** |
| Taxonomic nesting (`I.` ⊃ `A.`,`B.`; `A.` ⊃ `1.` ⊃ `a.`/`a.`/`2)`; `B.` ⊃ `1.`,`2.`) | intact, not flattened or re-parented |
| P8's garbled `Consequences of the qualities from liquid bodies` | **still preserved, not normalized** |
| P10/P11 `Rights, and Duties` vs `Duty and Right` asymmetry | **still preserved, not normalized** |
| JSON validity | valid |

The revision round did **not** touch any of the genuine source oddities. The
drafter correctly resisted the temptation to tidy them while editing the
neighboring text — which is the likeliest place for such a regression to sneak
in, and it did not.

---

## 6. Whole-chapter re-read — cross-boundary notes

Read start to finish in one pass after the packets.

- **Terminology consistency within the chapter: holds, and improved.** The
  archaic-island inconsistency that round 1 flagged (P7 modernized differently
  from P4/P8) is resolved; the table now reads in one voice. `accidents` is
  glossed once at first use and used consistently thereafter (P4, P5, P9);
  `qualities` is used only for the narrower branch (P7, P8); `consequences`
  is uniform across all nine rows; `record`/`records` is consistent between P1
  and P2; the P2 promise of "the table that follows" is still paid off by
  P3–P11 with no dangling reference.
- **Terminology consistency across chapters: one break — D5** (`founding` vs.
  ch18's `institution`). This is the only cross-boundary issue found.
- **No content movement across paragraph boundaries.** Word for word, the
  candidate still tracks the source paragraph for paragraph.
- **ALL-CAPS policy:** now single and uniform (N3 resolved).

---

## 7. Summary

| ID | Status | Paragraph | Note |
|---|---|---|---|
| D1 | **FIXED** | title | Now `Chapter 9. Of the Several Subjects of Knowledge` |
| D2 | **FIXED** | P7 | Prescribed wording applied verbatim |
| D3 | **FIXED** | P8 | Prescribed wording applied verbatim; transposition still preserved |
| D4 | **FIXED** | P6 | Prescribed reordering applied verbatim |
| N3 | **FIXED** | P0 | `KNOWLEDGE` capitalized; caps policy now uniform |
| — | **NEW, accepted** | P4 | `accidents` gloss — accurate per Hobbes's own usage, not overreaching |
| — | **NEW, accepted** | P6 | `Philosophia Prima (First Philosophy)` — term kept, gloss correct |
| — | **NEW, accepted on meaning** | P10–P11 | `founding` / `that same founding` — faithful to the source's sense; anaphor correctly resolved |
| **D5** | **NEW, non-blocking** | P10–P11 | `institution` is a Hobbesian term of art kept in the accepted ch18 final; the paraphrase breaks cross-chapter consistency |
| N6 | Non-blocking | P4, P6 | Parenthetical glosses vs. the house `— that is, …` form |
| N7 | Non-blocking | P4 | Gloss slightly flattens accidents ⊃ qualities nesting |
| N5 | Out of scope | — | Locked source still appears to be a truncated table (upstream parsing) |

---

## 8. Verdict

### ACCEPT AS-IS

Both round-1 blocking defects are fixed, to the prescribed wording, with no
regression elsewhere. Both non-blocking round-1 defects and the cosmetic N3 are
fixed as well. The two new glosses are accurate and licensed, the two source
oddities and the two deliberate non-normalizations survived the edit untouched,
structure is byte-for-byte intact at 12 paragraphs with all 12 labels matching,
and the chapter is fidelity-clean on every checklist axis. **Nothing blocks
acceptance.**

Recommended before the chapter is pinned, but not required (and not a reason to
hold the chapter):

1. **D5** — resolve `founding` vs. ch18's `institution` one way or the other,
   and record the decision in `books/wip/leviathan-terminology-note.md` so the
   remaining Leviathan chapters inherit it. My recommendation is to keep
   `institution` with an inline gloss, since it is the same technical term ch18
   already ships.
2. **N6 / N7** — optional gloss-style alignment with ch18/ch24/ch40.

If D5 is actioned, only P10 and P11 need re-verification, not a third full
review.

**Do not** "fix" the `a.` / `a.` / `2)` labels, and do not "fix" P8's
`Consequences of the qualities from liquid bodies`. They are the source's.
