# Independent Review — As You Like It, modern-da structure and completeness repair

**Reviewer:** independent session, not the author of the candidate.
**Verdict: ACCEPT**

This review was performed from source materials and the candidate JSON
before reading `RELEASE-PACKET.md`. Findings below were derived
independently; the comparison with the packet's own claims follows at the
end.

## 1. Relocation map re-derivation (full, not sampled)

Wrote a script that, for all 880 keys in `PARAGRAPH-MAP.json`, looked up
the live Danish text at the old `chapter.index` coordinate and the
candidate's Danish text at the new `chapter.index` coordinate and compared
them for byte-for-byte equality.

Note on coordinates: map keys use 1-based chapter *numbers*
(`"1.51"` = chapter number 1, paragraph index 51), and both the live
(17-chapter) and candidate (23-chapter) files have `chapter.number`
sequential from 1 matching list position exactly, so `number - 1` is the
correct list index. (An initial run using the raw string as a 0-based
list index produced spurious mismatches/out-of-range errors — a
coordinate-convention bug in the check script itself, not the data. Fixed
and re-run.)

**Result: 880/880 mapped paragraphs match exactly. Zero mismatches, zero
missing.**

## 2. Act 1 Scene 1 (candidate chapter 1, 47 paragraphs) vs English original

Read every paragraph in full against `as-you-like-it-original-en.json`
chapter 1, paragraph by paragraph (all 47 pairs).

- **Completeness:** all 47 paragraphs present, 1:1, no merges/splits/drops.
- **Invented content:** none found — every paragraph tracks the English
  content closely, including secondary clauses.
- **Speaker attribution:** correct throughout — ORLANDO, ADAM, OLIVER,
  DENNIS, CHARLES all match the English speaker tags in the same
  sequence, including the two stage-direction-only paragraphs
  (`OLIVER træder ind`, `DENNIS træder ind`, `CHARLES træder ind`,
  `Exeunt ORLANDO and ADAM` → `ORLANDO og ADAM går`).
- **Register:** compared against already-translated chapter 2 (Rosalind/
  Celia dialogue). Same declarative, mildly archaic-but-readable Danish
  register, same "I/jer" formal address between unequals and Duke/court
  figures, same treatment of stage directions. No stylistic seam
  detectable between chapter 1 (new) and chapter 2 (pre-existing).

No defects found in Act 1 Scene 1.

## 3. Caption insertions (chapters 4, 11, 16, 19)

Confirmed index 0 of each chapter is a location caption, not a scene-label
string, matching the English baseline's own paragraph 0 content and the
file's established place-name convention:

| Chapter | DA caption | EN baseline |
|---|---|---|
| 4 | "Ardens Skov" | "The Forest of Arden" |
| 11 | "Paladset" | "The palace" |
| 16 | "Skoven" | "The forest" |
| 19 | "Skoven" | "The forest" |

Checked every paragraph after the caption in all four chapters — not just
the seam — via the full-map validation in step 1 (every non-caption
paragraph in these four chapters is present in `PARAGRAPH-MAP.json` and
was confirmed byte-identical to its live source), plus a manual read of
chapter 4's full 12 paragraphs and chapter 16's full 84 paragraphs.
Per-chapter paragraph counts (caption + mapped entries) reconcile exactly:
ch4 = 1 + 11 = 12, ch11 = 1 + 4 = 5, ch16 = 1 + 83 = 84, ch19 = 1 + 32 = 33
— matching both the candidate's actual counts and the English structure.

Scene-title (`"Akt N, Scene M"`) and section (`"Akt N"` / `"Epilog"`)
metadata checked for all 23 chapters against the English baseline: fully
consistent throughout, not just at relocated seams.

## 4. Whole-edition fidelity re-check of the relocated (pre-existing) Danish text

Sampled every 5th paragraph across all 22 chapters containing relocated
text (chapter 1 excluded — that's new translation, already reviewed in
full above; the 4 caption paragraphs excluded — already reviewed in step
3), for **182 paragraphs, ~20.7% of the 880 relocated paragraphs**, spread
evenly across chapters 2–23, and compared each against
`as-you-like-it-modern-en.json`.

Additionally ran an automated heuristic across the **entire** file (all
931 paragraphs): flag any paragraph where the Danish word count is under
50% of the English paragraph's word count for English paragraphs of 4+
words (a proxy for gross compression/dropped clauses). **Zero flags.**
Also confirmed there are no empty paragraphs anywhere in the file.

Manually read two full chapters in their entirety, not just sampled
(chapter 9, 4 paragraphs; chapter 17, 12 paragraphs) as an additional
non-sampled deep check — both fully faithful, complete, correctly
attributed.

**One pre-existing defect found** (predates this repair — confirmed
present in the live file too, at old coordinate `12.82`, and simply
relocated unchanged to candidate `16.51`, consistent with the map
verification in step 1 showing the relocation itself is correct):

- **Candidate chapter 16, paragraph 51** (old `12.82`): `"CELIA. Jeg kan
  ikke ordene."` — missing the verb "sige". English: *"CELIA. I can't say
  the words."* Correct Danish would be `"Jeg kan ikke sige ordene."` This
  is a grammatical/typo-class defect in the prior, independently-produced
  Danish translation, not a defect introduced by this relocation. Meaning
  is still inferable from context, so it is not a dropped-content or
  fabrication defect, but it should be fixed at some point since it's
  visibly broken Danish.

No other fidelity defects (dropped content, compressed dialogue, invented
replacement text, wrong speaker attribution) were found in the sampled or
fully-read portions of the relocated Danish text.

## 5. Forbidden strings

Case-insensitive search of the raw candidate file for `WORLD LIBRARY`,
`ELECTRONIC VERSION`, `ETEXT`: **0 occurrences of all three.**

## 6. Structure

- Valid JSON (`json.loads` succeeds).
- 23 chapters, 931 total paragraphs — confirmed.
- Per-chapter paragraph counts checked against
  `as-you-like-it-modern-en.json` for all 23 chapters: **exact match**,
  including chapter numbers in sequence (47, 120, 51, 12, 6, 12, 38, 25,
  4, 43, 5, 151, 35, 27, 27, 84, 12, 61, 33, 50, 17, 67, 4 — total 931).

## 7. Hash confirmation

- Candidate `sha256`: `62386b6037f23ee775ecad7f83fdc3f009ab2bc5d44449f0a5b87a9453937d5b` — matches the release packet.
- Live file `sha256`: `80064e115bd31f194fa60e16f1ec08ee4b99efc5f1cc199ec7a4ac34dd52d8ef` — matches the release packet's stated "replaces" hash.

## Comparison with RELEASE-PACKET.md (read after independent work)

The packet's own description of the fix (Act 1 Scene 1 missing, mislabeled
17→23 structure, World Library boilerplate in 4 places, 21 dropped
paragraphs, 51 new translated paragraphs) matches what was independently
observed. The packet's self-verification (12-sample relocation spot-check,
JSON validity, forbidden-string check, caption placement, full Act 1
Scene 1 read) is consistent with and superseded by this review's full
880/880 relocation check and 20.7%-sampled + 2-full-chapter fidelity
re-check of the relocated text. The packet correctly flagged the exact
open question this review targeted (undiscovered fidelity issues in the
pre-existing Danish translation) and the one defect found (16.51 / old
12.82) answers that question: the pre-existing translation is
substantially sound, with at least one small pre-existing grammatical
defect that this repair did not introduce and is not obligated to fix,
but which is worth flagging for a future pass.

## Verdict

**ACCEPT.** The relocation is 100% correct (880/880), Act 1 Scene 1 is a
complete, faithful, correctly-attributed, register-matched translation,
the 4 caption insertions and their downstream shifts are correct
throughout their chapters, structure exactly matches the accepted English
edition (23 chapters, 931 paragraphs), no forbidden boilerplate strings
remain, and a substantial (20.7%) spread sample plus two fully-read
chapters of the relocated pre-existing Danish text found no fidelity
defects introduced by or masked by this repair. One minor pre-existing
grammatical defect was found in the prior translation (chapter 16 /
paragraph 51, old coordinate 12.82 — dropped verb "sige"); it predates
this repair, was correctly relocated unchanged, and is not a blocker to
accepting this package, but should be queued as a small follow-up fix.

### Follow-up item (non-blocking)

- Fix `"CELIA. Jeg kan ikke ordene."` → `"CELIA. Jeg kan ikke sige
  ordene."` at candidate chapter 16, paragraph index 51.
