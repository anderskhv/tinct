# Acceptance — Meditations, Book I

**Accepted file:** `candidate-v2.json`, sha256 `07c7f4b6c1c58959c8a3210ee3dff34b1f866a9819e88e260ce229d2aafbf663` (17 paragraphs, I.1–I.17, one per numbered meditation, aligned 1:1 with `source-book1.json`; word ratio 0.975 to Long, minimum paragraph ratio 0.91).

**Date:** 2026-09-11. **By:** the content agent for this thread, after the steps below; the coordinator's reviewer session did not draft the candidate.

## Review rounds applied

1. **Round 1** — `review/findings-v1.md`, independent reviewer session spawned by the coordinator, on `candidate-v1.json` (sha256 `e1d816d3…`). Verdict: *Accept after corrections*. 0 substantive findings, 19 minor (11 "worth improving": 3.1, 5.1, 6.1, 7.1, 9.1, 12.1, 15.1, 16.1, 16.2, 16.3, 17.1; 8 "optional preference": 6.2, 9.2, 11.1, 14.1, 14.2, 15.2, 15.3, 17.2), 6 paragraphs with no material issue.

No second round was requested: there was no substantive finding, every correction is confined to the clause the finding quotes, and every new wording is the reviewer's own proposal or Long's own word, so the review's condition for a second round was not met.

## Step 6 — corrections applied and verified

- **Applied:** all 11 "worth improving" findings and all 8 "optional preference" findings (15.3 as a `continuity.md` record, the text unchanged, which is what the finding asked for). Of the reviewer's seven "also noted, optional" points, four were applied (I.7 "easily disposed to be pacified and reconciled", I.9 "family", I.16 "loved to stay", I.17 three-dot ellipsis to match the staged original).
- **Declined, with reasons:** three "also noted" points, none of them numbered findings. I.5 "to endure hard work" — the reviewer accepted it; "to endure work" is not idiomatic and Long's "labor" already means toil. I.16 "when to act vigorously and when to relax" — the reviewer called it a fair modernisation of "remission"; "ease off" is no closer. I.16 "the smallest matter" — the reviewer called the supplied noun harmless, and "the smallest" alone is not modern English. On 3.1, only I.3 and I.7 changed; I.9 "kindly disposition" and I.15 "doing kindnesses" were already in the "kind" family.
- **One decision beyond the findings:** on 14.1 the dagger-marked I.14 clause was restored to Long's "undeviating" (the reviewer's first route), and so that Long's one word is not rendered two ways in one book the unmarked I.8 and I.16 uses were restored to "undeviating" too. Recorded in `continuity.md`.
- Full list, old and new text side by side with the finding ID, in `changes-v1-to-v2.md`; applied mechanically by `scripts/build_book1_v2.py`, which asserts that each old string occurs exactly once in its paragraph. 12 paragraphs touched (I.3, I.5, I.6, I.7, I.8, I.9, I.11, I.12, I.14, I.15, I.16, I.17), 5 untouched (I.1, I.2, I.4, I.10, I.13); paragraph count 17; numbering intact.
- Each changed passage was re-read against `source-book1.json` after the build, using the script's per-paragraph word diff: only the intended words changed, and every new word is either Long's own (games, received, disposed, pacified, family, consideration, also, and, required by, observed, but, undeviating, appearance, want, perfect, loved, had) or the reviewer's proposal (kindness / kind acts, "as a matter of course", "went out", "would").
- The three dagger-marked clauses stand verbatim: I.9 "those who form opinions without consideration" (restored), I.14 "consistency and undeviating steadiness in my regard for philosophy" (restored), I.15 "humorous in an agreeable way" (unchanged). The I.17 ellipsis after "dizziness" is kept in the three-dot form of the staged original.
- Glossary: I.15 "appearance" now follows the glossary's explicit instruction for that section; "impressions" in I.17 is the only technical use left in the book. The "vexation → annoyance" departure and the "beneficence → kindness" family are recorded in `continuity.md`. The three pending glossary rows named in the ledger ("dissatisfied → discontented", "in a manner → in a way", plural "daemons → spirits") were added to `GLOSSARY.md` at this step.
- Mechanical checks from `README.md` re-run against both v1 (frozen hash `e1d816d3…` confirmed) and v2: paragraph count, numbering, packet coverage, readable copy identical to the JSON, dagger clauses present in source and candidate. All passed.

## Step 7 — flow read

`candidate-v2-readable.md` read continuously from I.1 to I.17. The book reads as one ledger of debts in one voice: first person, no verb invented for the verbless sections, the "and … and … nor" chains now unbroken through I.11 and I.15 as well as I.16 and I.17, the two long sections carried in Long's order, the anecdotes left bare, the manuscript note at the close. One change was made from the read, listed last in `changes-v1-to-v2.md`: I.12, where the first rendering of finding 12.1 ("the neglect of the duties our relation to those we live with requires, by pleading urgent business") stacked a relative clause awkwardly; the final wording ("the neglect of the duties required by our relation to those we live with, by pleading urgent business") follows Long's own shape and is closer to him. Nothing else was changed from the read.

## Step 8 — acceptance

No substantive issue remains. Book I is accepted as `candidate-v2.json`.

## What remains open

- Nothing content-side for Book I. The registry misattribution and the 412 → 487 paragraph re-basing decision (`../00-progress-ledger.md`, "Needs Anders") are unchanged and outside this book's acceptance.
- Errors can remain; this record claims the process was followed, not that the text is beyond correction. A later reader's finding goes into a `candidate-v3.json` with the same change-log discipline.
