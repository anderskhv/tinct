# Book 3 — independent review, round 1

Round 1 of the independent review of `book03/candidate-v1.json` (step 4 of
`../../WORKFLOW.md`). Written by a separate reviewer session that did not
draft the candidate, did not consult the drafter, and read the packets in
order before reading the candidate straight through.

## Files

- `findings-v1.md` — the review. Verdict, the two rulings the coordinator
  asked for, the three upheld decisions, the retention answer, a finding or
  "No material issue found" for every one of `B03-P001`…`B03-P038`, and five
  records findings.
- `verify_source_book3_review.py` — this review's own source reconstruction,
  written rather than re-running the drafter's. Read-only; it modifies
  nothing. Run it from `books/staged-replacements/odyssey`:

  ```bash
  python3 book03/review/verify_source_book3_review.py
  ```

## Verdict

**Accept after corrections.** 0 substantive, 18 minor, 12 optional, 5 records
findings, 12 paragraphs with no material issue. Coverage complete: every
paragraph ID appears exactly once.

Book 3's draft is the cleanest of the package's three. Nothing must be fixed
before acceptance. The findings are the small-loss class named at Books 1 and
2 (an added intensifier, a dropped hedge, a dropped noun, three dropped
connectives, a flattened tense, a contrast turned into a cause), two instances
of the package's own characteristic defect (`counselled` rendered two ways in
one Book; Butler's one-word difference in the "excellent man" warranty
flattened into sameness), four spelling- and standard-level items that the
archaism guard does not test for, and preferences.

## The two rulings

**1. B03-P038, the corrupt served paragraph — ship Butler's twelve words.**
The drafter's answer is upheld, with one argument added that the package does
not state: rendering the served 208 words is the only option that makes the
A3 repair *harder*, because after that repair the modern column's paragraph
would have no source at all. A **decision row D14** is proposed, written for
the class rather than for this paragraph, plus a recommendation to carry the
exact repaired text and hashes so A3 becomes a one-line patch.
`findings-v1.md` section C.

**2. D12 class C — settled, and Book 4 is unblocked.** The mark is dropped,
every word stands, nothing is recast across the bracket's boundaries, and
every instance is recorded with Butler's note quoted and with who bracketed
it. The ruling rests on what Butler actually writes: footnote 81 says
bracketed lines are "almost always genuine"; footnotes 36, 82, 91 and 107
claim not spuriousness but *authorship history* (fn 107: "written by the same
hand as the rest of the poem"); footnote 122 shows the Book 13 brackets are
not Butler's at all and that he argues against them. Two facts new to the
package decide the disposition: the edition has no apparatus, so a bare
bracket cannot transmit the claim the footnotes carry — and **four of the six
class-C brackets are never closed in the base text** (PG's body has 15
opening brackets and 11 closing ones, and the served original reproduces the
same imbalance), so "keep the mark verbatim" would mean either an unclosed
stray character on the first paragraph of Book 4 or inventing the extent of
the passage. Class C keeps its own obligations — recording, restraint inside
the passage, no compression of the twice-printed prophecy — but its
disposition matches A and B, which also means a B-versus-C borderline no
longer blocks a Book. `findings-v1.md` section D.

## Source verification

Verified independently, by a third kind of rule, and **it holds**. Not by
re-running the drafter's script: this one is anchorless and digit-blind — it
uses no heading, no Book number and no `FOOTNOTES:` line, so neither recorded
trap can fire, and PG's markers never become tokens. The served Book 3's
first 37 paragraphs occur as **one exact contiguous token block, once**, in
PG #1727 (4,730 tokens, PG lines 1123–1537), with three negative controls
failing as they should. Both non-marker differences are confirmed
independently: B03-P001's capitalization, and B03-P038's 196 words that PG
does not have. A fourth line of evidence is added, independent of PG
entirely: the only paragraph in the whole 1,027-paragraph served original
containing an ASCII double quote is Book 3 ¶38 — the splice carries its own
fingerprint.

## Next

Steps 5–8 for Book 3: apply the supported findings in `candidate-v2.json` via
a change script in the established pattern, answer every finding either way,
re-check each changed passage against the source, flow read, `ACCEPTANCE.md`.
Findings 2.2, 11.1, 24.1, 27.1, 32.1 and 18.2 also touch `GLOSSARY.md`; R1–R5
are answered outside the text.
