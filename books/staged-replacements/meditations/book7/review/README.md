# Book VII — independent review round 1

Step 4 of `../../WORKFLOW.md` for Meditations Book VII. Written by an
independent reviewer session spawned by the coordinator, which did not draft
the candidate and did not consult the drafter. Nothing under `book7/` outside
this directory was touched, and `candidate-v1.json` is unchanged.

## Files

- `findings-v1.md` — the review. Header (hashes, rebuild verification, text-state
  cross-check, coverage), a ruling on the word ratio, one entry per paragraph
  VII.1–VII.75 in order, the summary table, chapter-level findings from the
  continuous read, the flow judgement, the verdict, and coverage/limitations.

## Verdict

**Accept after corrections.** No substantive finding. 6 numbered findings:
5 minor (2.1, 9.1, 14.1, 20.1, 66.1 — 9.1 proposes a `continuity.md` record
only, no change to the candidate) and 1 optional preference (8.1). 69
paragraphs recorded "No material issue found".

## What was checked

1. **Hashes, recomputed locally.** `book7/candidate-v1.json`
   `1823989f9a35a00490041cd5600bddb01f59f1f6a2b3ed367d4d3ddd87e0e6fe`;
   `book7/source-book7.json`
   `67e7bfd3bd57a4dbaa1bcd089acfb8166cceaeffa5a682cdff5de2db0be74b41`;
   `meditations-original-en.staged.json`
   `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830`;
   `source/pg15877-long-1862.txt`
   `6584df7e90d6035eece30d8028527290bf2508076963ee0376cb41db9cf88d5b`.
   All four match `provenance.json` / `PROVENANCE.md` / `README.md`.
2. **The staged-original rebuild (D12), verified independently and clean.** The
   pre-rebuild file was recovered from git history
   (`git show 0c7126d04^:…/meditations-original-en.staged.json`) and hashes to
   `b0ecf3da6984c95a54ca36e1c60d20a01ad95fc6bb6e7544740e9c82717cf67f`, the
   value on record. Structural diff of old against new: 12 chapters both sides;
   paragraph counts identical (17, 17, 16, 51, 36, 59, 75, 61, 42, 38, 39, 36 =
   **487**); **exactly one paragraph differs in the whole file**, Book 7 §45,
   which loses three trailing sentences; **chapters 1–6 byte-identical** (8–12
   too), so no accepted book is reopened. The three sentences were then checked
   in the PG text itself at lines 4600, 4602 and 4604: each is printed flush
   left as `[A] See Aristophanes, Acharnenses, v. 661.` / `[B] From the
   Apologia, c. 16.` / `[C] From the Apologia, c. 16.`, between §45 and §46,
   and §45 opens `45. [C]For thus it is, men of Athens…` — Long's footnotes
   carrying the reference letters of §44 and §45, not translation. Standard
   Ebooks' Long ends §45 at "deserting his post." and carries all three as
   endnotes. The rebuild is right; no reversal recommended.
3. **The README's mechanical checks, re-run in full and passed** — both hashes,
   75 paragraphs one-to-one, numbering, no `[Illustration` / footnote opener /
   `Acharnenses` / `From the Apologia` anywhere in the staged file, packet
   coverage B07-P001…P075 exactly once each, packet text identical to the JSON,
   readable copy identical to the JSON, the seven dagger clauses present in
   source and candidate, VII.45's corrected ending, VII.58's kept ellipsis, no
   bracket and no cross-reference left in the candidate, `(melos)` and
   `(meros)` present.
4. **All 25 packets, in order**, three paragraphs at a time with the supplied
   CONTEXT ONLY paragraphs, Long beside the candidate; then
   `candidate-v1-readable.md` read straight through. A word-level diff of all
   75 paragraphs was generated and read beside the packets, so every token
   present in one text and absent from the other was inspected individually.
5. **Fidelity, voice, expansion, glossary, apparatus, daggers.** Every clause,
   qualification, negation, quantifier, list and image checked for presence and
   order; the compact self-addressed voice checked for drift toward advice or
   explanation (none found); the 23 short meditations checked for expansion
   (none); the glossary applied consistently, including the new "imagination"
   row and the extended "the causal" and "vex ourselves at" rows; 7
   cross-references, 6 D11 drops and 9 folds each verified against the source;
   the 7 dagger marks located independently in the PG text at lines 4433, 4439,
   4529, 4530, 4607, 4609 and 4788 and each clause verified verbatim in the
   candidate.
6. **Word ratio.** The recorded 0.995 is consistent with the diff. VII.12's
   0.70 is fully explained by the dropped cross-reference "(iii. 5)" and "Be
   thou erect" → "Stand upright" in a ten-token meditation; ruled acceptable.
7. **Text state, Standard Ebooks' Long, fetched 2026-09-12**, by exact-phrase
   search, for text state only and never for wording: VII.5 "whatsoever"
   confirms PG's "what-soever" is a line-break hyphen; VII.58 breaks off
   identically; VII.45 runs the bracket as plain text; every bracket the
   drafter lists is Long's. Two variants found and reported at finding 9.1
   (PG "participate in the reason" vs SE "the same reason"; PG "one god" vs SE
   "one God").

## Drafter's next steps

1. Write `book7/candidate-v2.json` (never edit v1) applying or answering the 4
   wording findings — **2.1** VII.2 "continually" → "continuously"; **14.1**
   VII.14 remove the inserted "it"; **20.1** VII.20 "that I should do" → "that I
   may do"; **66.1** VII.66 "know that Telauges" → "know whether Telauges" —
   and list every change by paragraph ID against the finding it answers, with
   each changed passage re-checked against the source. **8.1** (VII.8
   "carrying" → "having") is a preference and may be declined with a recorded
   reason.
2. Add to `book7/continuity.md`: the two VII.9 base-text variants (finding 9.1);
   the note that VII.17's "within" comes from the glossary and not from the
   etymology; VII.50's relative clause recorded as the book's one licensed
   expansion, so it is not cited as precedent; and Long's stray comma at VII.54
   ("to behave, justly"), rightly not reproduced.
3. Reclassify in `book7/continuity.md`: VII.2 "[thoughts]" and VII.17
   "[happiness]" move from "flagged for the reviewer" to settled folds, on the
   VI.50 "[men]" ruling.
4. Consider adding an explicit exception to `../../GLOSSARY.md` for Long's
   in-text transliterated Greek (VII.13 now, VIII.57 next), so the question
   does not reopen at Book VIII.
5. Then step 7 (continuous read of the corrected candidate) and step 8
   (`book7/ACCEPTANCE.md` with the accepted file's hash, the rounds applied and
   what remains open), and update `../../00-progress-ledger.md`.

All six flagged decisions and both base-text defects were ruled on in
`findings-v1.md`; every ruling goes the drafter's way.
