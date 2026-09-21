# Leviathan Expansion Batch — edition ch40 (Hobbes ch39) Report

**Chapter:** edition chapter 40 / Hobbes's own Chapter 39, "Of the
Signification in Scripture of the Word Church." Identity verified
directly against the live files before drafting: source and modern-en
titles both read "Chapter 39. Of the Signification in Scripture of the
Word Church" exactly; opening "The word Church, (Ecclesia) signifieth in
the Books of Holy Scripture divers things..."; 5 paragraphs confirmed
matching between `-original-en.json` and `-modern-en.json`.

**Final file:** `leviathan-ch40-final.json`
```
sha256: 52277a34efaf708d0befa21c37dc076b3a298ad1dbd933460329fa16de404fc7
source sha256: 2a10ce856850c8cedf542d8b0e5b065cd273a3d8184a765426d7344de5f987d8
```

## Process (4 rounds)

1. **Round 0 — drafting.** Sonnet drafted against the locked source,
   using the existing modern-en (already REAL-classified, sim 0.634) as
   reference. This chapter was chosen specifically to stress-test the
   quotation rule against **external scripture citation** (as opposed
   to ch18's test of the author's own in-text formulas): six direct
   Bible quotations, modernized word-by-word from source's own wording,
   with the drafter explicitly instructed not to import a named Bible
   translation (KJV/NIV) from training. No citation flagged as a likely
   source error.
2. **Round 1 — full independent review.** Blind accessibility (all 5
   paragraphs) + Opus fidelity (all 5 paragraphs + whole-chapter
   re-read). Verdict: ACCEPT AS-IS, one worth-applying stylistic note
   (restore source's "and" in "Ecclesiastes and Concionator," which had
   become "or"). Independently confirmed: no scripture verse was
   silently swapped for a familiar translation's wording (the two
   highest-risk spots, Matt 18:17's "Gentile" not "heathen man" and Col
   4:15's "his house" not "her house," were both correctly resisted);
   all nine untranslated Greek/Latin terms preserved with the argument
   about their precise senses intact.
3. **Round 2 — fixes + re-verification.** The stylistic note applied,
   plus accessibility fixes for 4 flagged spots (a stacked
   foreign-terms sentence, unmarked Latin/Greek synonym pair,
   "church triumphant" gloss, a triple-negative sentence, a "person"
   clarification placed carefully *outside* Hobbes's directly quoted
   formal definition rather than interpolated inside the quotation
   marks). Independent re-check found the placement was correct but
   caught **one real new defect the sentence-splitting introduced**:
   promoting "The Roman commonwealth" to the subject of both verbs in
   a split sentence made the candidate assert Rome called the speaker
   by a *Greek* term — false, and the one error this etymology-focused
   chapter could least afford. Also caught an imported doctrinal claim
   (asserting the "church triumphant" is specifically "in heaven," a
   position Hobbes elsewhere in the same book argues against) and two
   places where added words shifted from fact-of-usage to endorsement
   or from Hobbes's own terms to narrower modern ones.
4. **Round 3/4 — fixes + final verification.** All four required fixes
   applied. A fresh accessibility pass caught a subtler regression the
   fix itself introduced: a gloss reading "what **Hobbes calls** the
   'church triumphant'" broke the chapter's consistent first-person
   voice (Hobbes elsewhere says "I define...") and wrongly implied he
   coined a standard theological term — fixed with a two-word deletion,
   independently confirmed by both an accessibility and a fidelity
   reviewer working separately. A final full, non-sampled fidelity pass
   (all 5 paragraphs, every citation, every Greek/Latin term) then
   returned **ACCEPT AS-IS**, and a final blind accessibility pass
   returned **substantially accessible**.

## Final verdicts

- **Fidelity: ACCEPT AS-IS**, certified by a full non-sampled pass on
  the exact final file. Zero blocking defects at any point in this
  chapter's history — every defect found (F1-F5) was introduced by a
  *revision* edit, not present in the original draft, and every one was
  caught and fixed the same round or the next.
- **Accessibility: substantially accessible.** Remaining friction is
  concentrated in paragraph 4 (the argument-densest paragraph) and
  consists of items that are fidelity-locked, not fixable without
  reintroducing a defect: "between the Christian and the man" reads as
  genuinely ambiguous to a fresh reader on first pass, but the
  alternative wording tried in round 2 ("citizen"/"loyalty") was an
  unlicensed narrowing of Hobbes's own terms and was reverted by
  fidelity review (F4). Likewise "so are civil sovereigns" arriving
  before its justification is how Hobbes's own argument is structured
  (he explains in the following sentences); adding "rightly" to
  soften the arrival was also reverted by fidelity review (F3). These
  are documented tradeoffs, not overlooked fixes.

## What this chapter specifically tested (per the task's "different
difficulties" goal)

Unlike ch18 (dense abstract philosophical argument, prose only) and
ch24 (concrete administrative/legal taxonomy), this chapter tested:

- **External citation vs. in-text formula.** ch18 taught the lesson
  that in-text quoted formulas should be modernized; this chapter
  confirmed the *complementary* discipline — modernize the quoted
  scripture's own wording, but never substitute a different, more
  familiar translation's phrasing, even when the drafter/reviewer
  recognizes it. Both the drafter and two independent reviewers held
  this line correctly across all six citations.
- **Preserving a distinction the source's own argument depends on.**
  Much of this chapter is Hobbes arguing about the precise sense of
  specific Greek/Latin words (*Ecclesia*, *Concio*, *Ecclesiastes*,
  etc.). The round-2 regression (F1) is a direct illustration of the
  risk named in the task brief: an accessibility-motivated
  restructuring accidentally broke exactly the kind of
  word-to-language attribution this chapter's argument turns on. It was
  caught precisely because the fidelity checklist has a dedicated item
  for this failure class.
- **Distinguishing a citation question from a candidate defect.** The
  "Gentile" vs. "heathen man" (Matt 18:17) question was investigated
  and resolved as *not* an error — "Gentile" is a defensible direct
  rendering of the Greek, not a citation mismatch — and documented as
  such rather than silently left ambiguous.

## Review coverage (exact)

| Round | What | File | Verdict |
|---|---|---|---|
| 1 | Accessibility, blind, all 5 paragraphs | `accessibility-review-1.md` | needs targeted fixes |
| 1 | Fidelity, all 5 paragraphs + whole-chapter re-read | `fidelity-review-1.md` | ACCEPT AS-IS |
| 2 | Accessibility, blind, all 5 paragraphs | `accessibility-review-2.md` | needs targeted fixes |
| 2 | Fidelity, changed-passage re-check, all 4 revised paragraphs | `fidelity-review-2.md` | ACCEPT WITH FIXES REQUIRED (F1-F4) |
| 3 | Accessibility, blind, all 5 paragraphs | `accessibility-review-3.md` | needs one small fix |
| 3 | Fidelity, changed-passage re-check | `fidelity-review-3.md` | ACCEPT WITH FIXES REQUIRED (F5) |
| final | Accessibility, blind, all 5 paragraphs | `accessibility-review-final.md` | substantially accessible |
| final | Fidelity, FULL non-sampled pass, all 5 paragraphs | `fidelity-review-final.md` | **ACCEPT AS-IS** |

## Status

Nothing has been published. `leviathan-ch40-final.json` is a staged
candidate only, not copied into any live edition file.
