# Book 4 — independent review, round 1

Round 1 of the independent review of `book04/candidate-v1.json` (step 4 of
`../../WORKFLOW.md`). Written by a separate reviewer session that did not draft
the candidate and did not consult the drafter, working in its own worktree off
head `d6d97ebb1`. The candidate is not modified by anything here.

## Files

- `findings-v1.md` — the review. Verdict, the ruling on the retention figure,
  the five flagged decisions, the two further questions put by the task, a
  finding or "No material issue found" for every one of `B04-P001`…`B04-P081`,
  seven records findings, and what the package's checks still would not catch.
- `verify_source_book4_review.py` — this review's own source reconstruction, a
  **fifth** kind of rule (global per-paragraph fingerprint alignment over the
  whole PG file: no anchor, no needle, no region). Read-only. Run from
  `books/staged-replacements/odyssey`:

  ```bash
  python3 book04/review/verify_source_book4_review.py
  ```

- `retention_measure.py` — the measure built to answer the 0.960 question, with
  its own audit printed first. Read-only, same working directory:

  ```bash
  python3 book04/review/retention_measure.py
  ```

## Verdict

**Accept after corrections.** 1 substantive, 16 minor, 11 optional, 7 records
findings; 50 of 81 paragraphs with no material issue at all. Coverage complete:
every paragraph ID appears exactly once.

Nothing is lost and nothing is invented anywhere in the Book. No claim, motive,
quantity, genealogy, negation, condition or causal link is added or dropped;
every quantity the instructions list is exact; the name census matches the
source name for name; the twenty-one D4 paragraphs are unbalanced in exactly
the source's places at 71/50; the hyphen corruption is genuinely absent from
the candidate, the readable copy, all 27 packets and the source module.

## The ruling that matters

**The retention figure 0.960 is half the source's and half the drafter's, and
the drafter's half is entirely on Butler's syntax.** Book 4's source is less
archaic per word than Book 3's — that claim reproduces on an independent word
list — but its sentences are the *hardest* in the package: 17 sentences of
sixty words or more in 8,042 words, the highest density of the four Books. The
three accepted Books broke 100%, 43% and 33% of theirs and added 20.5%, 16.1%
and 5.5% to their sentence counts. **Book 4 v1 breaks one of seventeen and adds
0.4%.** On the calibrated bands, accepted work splits 61% of its most chained
paragraphs; this draft splits 0% of twenty-five.

That is substantive finding **S-1**, and `findings-v1.md` §B names the nine
paragraphs to recast, three more to look at, and one long sentence to leave
alone deliberately.

## The five flagged decisions, and the two further questions

All upheld: the three new name rows (with the recorded *warrant* corrected —
the Cast corroborates `Hephaestus` alone), D12 class C at B04-P001 and
B04-P052 with `abode` → `home`, the B04-P040 quotation repair, the one
deliberate break in the `heaven` census, `tell me truly` at B04-P041 (settled
three times in accepted Book 1 before Book 3 met it), and `sweetmeats` as
typographic normalization — which now needs a written compound-hyphenation
rule, because Book 4 moves compounds in three directions at once.
