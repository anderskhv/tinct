# Book II — independent review (round 1)

This directory holds the independent review of `../candidate-v1.json`
(Meditations, Book II, modern-English candidate v1, sha256
`42002ed4b9d7003fba329a8a5f1d91142431b7e24f8f188178868255922ba07f`),
step 4 of `../../WORKFLOW.md`. It was produced by a separate reviewer session
spawned by the coordinator, which did not draft the candidate and did not
consult the drafter. Nothing outside this directory was edited; the candidate
is untouched.

## Files

- `findings-v1.md` — the review. Header (reviewer, date, hash, packets,
  standard), then one entry per paragraph II.1–II.17 in order, each either a
  set of findings or exactly "No material issue found."; then a summary count,
  chapter-level findings from the continuous read, a flow judgement, the
  verdict, and coverage/limitations.

## How the review was done

1. Read `../README.md`, `../review-instructions.md`, `../continuity.md`,
   `../provenance.json`, `../manifest.json`, `../../GLOSSARY.md`,
   `../../WORKFLOW.md` and `../../PROVENANCE.md` (for the dagger positions).
2. Re-ran the mechanical checks in `../README.md`: candidate hash, 17 = 17
   paragraphs, packet coverage, packet text identical to the JSON. All passed.
   Confirmed the three dagger marks in `../../source/pg15877-long-1862.txt`
   (II.6, II.12, II.14).
3. Worked through `../review-packets/packet-01.md` … `packet-06.md` in order,
   three paragraphs at a time, source beside candidate, with the supplied
   `CONTEXT ONLY` neighbours. For every paragraph: each Long clause checked
   for presence (qualifiers, negations, list lengths, "some"/"all",
   sequence vs. cause); every glossary term checked against `GLOSSARY.md`;
   imagery checked as image; voice checked for drift into advice or
   explanation; dagger passages checked for being left as open as Long has
   them.
4. Read `../candidate-v1-readable.md` straight through for voice, pacing,
   repetition, terminology and transitions; recorded chapter-level findings.
5. Wrote one entry per paragraph, with source and candidate quoted, a
   classification, why it matters, a proposed correction inside Long and the
   glossary, and a severity: **substantive** (must fix before acceptance) or
   **minor** (drafter's discretion, marked "worth improving" or "optional
   preference").

The review is against Long's 1862 English only. No other translation was
consulted, and no Greek was used to adjudicate.

## Result

**Accept after corrections.** 5 substantive findings (II.2, II.6, II.12 ×2,
II.14), 20 minor, 5 paragraphs with no material issue (II.4, II.8, II.9,
II.11, II.13). Details and counts in `findings-v1.md`.

## What the drafter does next (steps 6–8 of `WORKFLOW.md`)

1. **Apply the corrections as `../candidate-v2.json`** (and a matching
   `candidate-v2-readable.md`). Do not edit `candidate-v1.json`. All five
   substantive findings must be applied; apply the minor ones at your
   discretion (the review recommends 1.2, 2.3, 3.1, 7.1, 10.1, 10.2, 15.1,
   16.1, 17.1). List every change by paragraph ID with the finding it
   answers, and list every finding not applied with the reason, in a
   `../changes-v1-to-v2.md` (or in `../continuity.md`). If a minor finding
   is declined because `continuity.md` already records the decision (e.g.
   16.1), say so; if a glossary departure is kept (1.2), record it in
   `continuity.md` as an explicit exception.
2. **Verify each changed passage** against `../source-book2.json` after
   editing: the corrected clause present, nothing else in the paragraph
   disturbed, paragraph count still 17, numbering intact.
3. **Do the flow read** of `candidate-v2-readable.md` from II.1 to II.17
   without stopping, and record chapter-level fixes (the review's
   chapter-level note on dropped connectives is the thing to check).
4. **Record acceptance** in `../ACCEPTANCE.md` with the accepted file's
   sha256, the review rounds applied (this one, plus any second round the
   coordinator orders), and what remains open. Update `../provenance.json`
   with the v2 hash and `../../00-progress-ledger.md`. Accept only when no
   substantive issue remains; if the substantive corrections change more than
   the quoted clauses, ask the coordinator for a second review round rather
   than self-certifying.
5. Then Book I, by the same eight steps.
