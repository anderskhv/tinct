# Accessibility Review — Reviewer A (fresh read, candidate only)

**Book/chapter:** Leviathan, "Chapter 9. Of the Severall Subjects of Knowledge" (pilot ch. 10), modern-English candidate.

**Coverage:** Read all 12 paragraphs in `candidate-sonnet.json`, in full, start to finish, then a second pass paragraph by paragraph. Array indices 0–11 (paragraph 0 through paragraph 11), all read in full — no sampling, no source/notes consulted.

---

## What reads well

- **Paragraphs 0–2** are the strongest material in the chapter. They read as natural, clear contemporary prose: "this is the kind of knowledge required of a witness" and "the kind of knowledge required of a philosopher: that is, of anyone who claims to reason" land as genuinely accessible, almost aphoristic explanatory beats — exactly the kind of plain gloss a general reader needs before the table hits. The geometry example ("if the figure shown is a circle, then any straight line through its centre divides it into two equal parts") is concrete and easy to follow. Paragraph 2's set-up of "the table that follows" is a clean transition.
- The taxonomy entries, where they use ordinary vocabulary, are readable as list items (e.g., paragraph 9: "Consequences from the accidents of political bodies; which is called POLITICS, and CIVIL PHILOSOPHY" — apart from "accidents," this is a clear enough label).

---

## Per-paragraph issues

**Paragraph 4** — "A. Consequences from the accidents of natural bodies; which is called NATURAL PHILOSOPHY"
- "accidents" is used in its old philosophical sense (a body's incidental properties/qualities, as opposed to its essence). A contemporary general reader's default reading of "accidents" is "mishaps" or "chance occurrences," which makes "consequences from the accidents of natural bodies" actively misleading, not just quaint — it's likely to be misread as something like "consequences from things that randomly happen to natural bodies." Nothing in the surrounding text glosses the word.
- **Avoidable.** "Properties" or "attributes" would carry the same meaning transparently and would not cost anything in precision.

**Paragraph 5** — "1. Consequences from the accidents common to all natural bodies; which are quantity and motion."
- Same "accidents" problem as paragraph 4, recurring.
- **Avoidable**, same fix.

**Paragraph 6** — "a. Consequences from quantity and motion indeterminate; which, being the principles or first foundation of philosophy, is called Philosophia Prima"
- "quantity and motion indeterminate" places the adjective after the noun phrase, an archaic/legalistic construction that will cause a re-read; a contemporary reader expects "indeterminate quantity and motion."
- "Philosophia Prima" is left in Latin with no gloss or translation. A general reader is very unlikely to know this means "First Philosophy," and nothing nearby tells them.
- **Both avoidable.** Reordering the adjective, and adding a light gloss (e.g., "— Philosophia Prima, or First Philosophy") would resolve both without changing the content.

**Paragraph 7** — "a. Consequences from the qualities of bodies transient, such as sometimes appear, sometimes vanish"
- "bodies transient" again inverts the expected adjective-noun order ("transient bodies"), forcing a re-read.
- This paragraph is also labeled "a." — the same label as paragraph 6. As flat, unnumbered-context list items, two consecutive "a." entries with no indication of which branch they belong to will genuinely confuse a reader trying to follow the classification. This is a structural/formatting issue inherent to presenting a multi-level table as a flat paragraph list, not a wording problem — I flag it but don't think a sentence-level fix addresses it (it would need a numbering/indentation scheme, which is out of scope for prose accessibility).
- The adjective order issue is **avoidable**; the duplicate-label confusion is **structural/inherent to the format**, not fixable by wording alone.

**Paragraph 8** — "2) Consequences of the qualities from liquid bodies that fill the space between the stars; such as are the air, or ethereal substance."
- Two separate issues here:
  1. The underlying idea — that the space between the stars is filled with a "liquid" ethereal substance — reflects obsolete 17th-century physics (a luminiferous-ether-type doctrine). A modern reader who knows space is vacuum will find this conceptually strange no matter how it's worded. **Unavoidable conceptual complexity** — this is a genuinely dated scientific claim, not an accessibility failure of the rendering.
  2. "such as are the air, or ethereal substance" uses inverted, archaic syntax ("such as are the air" instead of "such as air"). This is a separate, **avoidable** wording issue — "for example, air, or ethereal substance" would read naturally without altering the (historically strange) content.
- Also note the numbering shifts here from letter/number outline style ("a.", "1.") to a parenthesis style ("2)"), one more instance of the inconsistent-numbering issue noted at paragraph 7 — again structural, not wording.

**Paragraph 9** — "B. Consequences from the accidents of political bodies; which is called POLITICS, and CIVIL PHILOSOPHY"
- Same "accidents" issue as paragraphs 4–5. **Avoidable**, same fix.

**Paragraph 10** — "1. Of consequences from the institution of COMMONWEALTHS, to the rights and duties of the body politic, or sovereign."
- "the institution of commonwealths" uses "institution" in its older sense of "the act of founding/establishing," but a contemporary reader's first association with "institution" is an organization (as in "financial institution"). This risks a real misreading — "an institution belonging to commonwealths" rather than "the founding of commonwealths."
- The construction "Of consequences from X, to Y" (consequences "from" the institution, "to" the rights and duties) is compressed and legalistic; it's parseable but requires a careful second pass to see that "to" here means "as applied to" / "for."
- **Both avoidable.** "the founding of commonwealths" removes the ambiguity, and "as they bear on the rights and duties..." or similar would smooth the "from...to..." construction.

**Paragraph 11** — "2. Of consequences from the same, to the duty and right of the subjects."
- "the same" is a bare pronoun referring back to "the institution of commonwealths" in the previous paragraph. Because these read as separate list entries (and a reader may reasonably scan the table rather than read strictly linearly), the referent for "the same" is easy to lose track of.
- **Avoidable** — repeating "the founding of commonwealths" (or "of the same institution") instead of the bare pronoun would remove the ambiguity, at a small cost to the table's terseness.

---

## Structural note (not a wording issue, flagged for the merge owner)

Paragraphs 3–11 shift from continuous, narrative prose (paragraphs 0–2) into telegraphic taxonomy-table entries with an outline numbering scheme (I. / A. / 1. / a. / 2)) that is internally inconsistent (two "a." entries in a row; a bracket-numbered entry appearing after letter-numbered ones) and carries no visual indentation to show hierarchy. A reader will likely find the transition from prose to table jarring and will struggle to track which entry nests under which. This is inherent to rendering a classification table as flat paragraphs and is not something sentence-level wording fixes can solve — it would need a formatting/structural solution, which is out of scope for this review.

---

## Overall verdict: **Needs targeted fixes**

Paragraphs 0–2 are clean, natural, and genuinely well-written — no issues to flag there. From paragraph 4 onward, the chapter has a cluster of small, concrete, repeatable wording problems that a targeted revision pass would fix without touching the chapter's structure or content: the unglossed technical use of "accidents" (four occurrences), a few archaic postpositive-adjective constructions ("bodies transient," "motion indeterminate"), one untranslated Latin term ("Philosophia Prima"), and two referential ambiguities ("institution," "the same"). None of these require a broader rewrite — each has a specific, local fix. Separately, one piece of content (the "liquid" ether between the stars) is unavoidably strange to a modern reader because it reflects real but obsolete 17th-century physics, not a translation shortcoming — no wording change resolves that, and none should try to paper over it. The numbering/duplicate-label inconsistency is a structural issue outside the scope of prose fixes. Net: the chapter is readable and its opening is strong, but the taxonomy section carries enough recurring, fixable friction points that it should not be called "substantially accessible" as-is.
