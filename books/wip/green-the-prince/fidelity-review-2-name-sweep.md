# Fidelity Review 2 — Spot-check of Reverted Paragraphs + Independent Proper-Noun Sweep

**Book:** The Prince (Machiavelli), `the-prince`. Files: `source.json` /
`candidate.json` in this directory.

## Part 1 — Spot-check of the 11 reverted paragraphs: CLEAN

Re-derived all 11 locations directly from `source.json` (using the JSON
`number` field, matching the review-1 and fix-pass convention) and diffed
byte-for-byte against `candidate.json`:

- (9,1) Amilcar — matches
- (13,10) Domnia / Bernabo — matches (both names)
- (13,12) Nicolo Orsini — matches
- (13,13) Vaila — matches
- (21,2) Vaila — matches
- (21,5) Nicolo Vitelli / Citta di Castello — matches (both)
- (21,6) Nicolo Machiavelli — matches
- (22,1) Bernabo — matches
- (27,8) Vaila — matches
- (27,12) cuor — matches
- (19,9) Nicolo Machiavel — matches

All 11 now exactly reproduce source's printed spelling. No collateral
changes found in these paragraphs beyond the intended reverts — rest of
each paragraph's wording is unchanged from the state fidelity-review-1
already accepted.

## Part 2 — Independent proper-noun sweep across all 27 chapters: 6 MORE DEFECT CLASSES FOUND

A full mechanical diff (word-level, all chapters/paragraphs) plus manual
verification turned up **six further silent proper-noun/wording
"corrections," 15 additional instances total**, all in the same defect
class already accepted as non-blocking-but-required-fix in
fidelity-review-1. None found in the previously-reviewed 8-item list or the
11 reverted paragraphs — these are new locations.

| Chapter | ¶ | Source | Candidate | Notes |
|---|---|---|---|---|
| 8 | 4 | Sinigalia | Sinigaglia | |
| 8 | 7 | Sinigalia | Sinigaglia | |
| 8 | 8 | Sinigalia | Sinigaglia | |
| 9 | 5 | Sinigalia | Sinigaglia | 4 instances total, same place name |
| 4 | 15 | Forli | Forlì | |
| 14 | 7 | Forli | Forlì | |
| 21 | 5 | Forli | Forlì | |
| 21 | 6 | Forli | Forlì | 4 instances, "Countess of Forli"/"Imola and Forli" |
| 13 | 7 | Vaila | Vailà | **Same word already fixed elsewhere in this book (13,13 / 21,2 / 27,8) but this occurrence was missed** |
| 27 | 7 | Vaila | Vailà | **Same — missed occurrence, sibling of the already-fixed 27,8** |
| 27 | 7 | Allesandria | Alessandria | Source's own spelling is inconsistent within the book (ch27 p8 already spells it "Alessandria"), but protocol requires reproducing THIS paragraph's own printed form, not silently normalizing it to match a different paragraph |
| 20 | 17 | Sclavonia | Slavonia | Archaic place-name spelling normalized |
| 22 | 8 | Tribu (both occurrences, incl. the quoted-as-itself instance "'Tribu' were possibly gentile groups...") | Tribù | Diacritic added inside a term being defined/quoted — same pattern as the already-fixed Petrarch "cuor"→"cor" case |
| 22 | 1 | "Messer Bernabo da Milano" | "Messer Bernabo of Milan" | Lower-confidence: translates the Italian epithet "da Milano" to English "of Milan" rather than reproducing source's mixed-language printed form. Flagging for a human call since this may be defensible as ordinary translation rather than a "correction," unlike the others in this table. |

**Vaila is now a split case**: 3 of 5 total occurrences in the book (13,13
/ 21,2 / 27,8) were reverted to source form by the fix pass; 2 occurrences
(13,7 and 27,7) still read "Vailà" in candidate and were not caught by
either round-1's flagged list or the fix pass.

## General fidelity spot-check (chapters outside the original 8-item list)

Read Chapter 2 (Hereditary Principalities), Chapter 16 (Liberality and
Meanness, full 5 paragraphs), and Chapter 24 (Why the Princes of Italy
Lost Their States, full 4 paragraphs) in full against source. No
actor-swaps, negation flips, causality reversals, hedging changes, or
omitted/invented content in any of the three — consistent with round-1's
overall finding. The only defect class in this book remains the
proper-noun/quoted-wording spelling issue above.

## Verdict

Not clean — additional instances of the same defect class found. Do not
edit `candidate.json` in this task per instructions; these are reported
for a follow-up fix pass alongside (or after) the accessibility fixes.
