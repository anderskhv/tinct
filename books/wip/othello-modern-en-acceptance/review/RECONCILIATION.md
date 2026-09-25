# Reconciliation: 36 reported edits against 34 independently re-checked

**Base package:** `books/wip/othello-modern-en/` on `claude/cool-galileo-tyen9m`, commit `15d3d67e53c32dc24e05679271997d7dd24f868a`.
**Candidate:** v1, `othello-modern-en.candidate.json`, sha256 `012ede1e45c1d3b0c51c791212971892b345092c658b06e4712aa69a1dd2083c`.

The comparison was run by script over the base package's `review/editor-fixes.json`, `review/recheck.json`, `review/rev-A.json` … `rev-D.json`, and the candidate text.

## Result

- **36** line edits are logged in `editor-fixes.json`.
  - All 36 "after" strings are present in candidate v1.
  - No "before" string survives.
- **32** of the 36 come from reviewer findings: 1 must-fix, 11 should-fix and 20 notes.
  - **All 32 reviewer findings were acted on.**
  - 24 were applied exactly as the reviewer proposed.
  - 8 were applied in editor wording: 4.96, 7.10, 10.6, 10.80, 12.71, 13.48 l.12, 13.48 l.16 and 15.190.
- **4** edits came from the editor: 1.3 l.0, 3.35 l.7, 15.2 l.2 and 1.33 l.0.
- The re-check (`recheck.json`) has **34** entries. They are exactly edits 1–34, in order. All 34 were accepted and none rejected.
  - It raised one follow-up, the 15.2 line-2 refrain, which became edit 35.
- **Two edits had no independent check:**
  - edit 35, 15.2 l.2: "It's the cause. Still, I won't spill her blood," (the re-check follow-up);
  - edit 36, 1.33 l.0: "…making the beast with two backs — having sex." (added after the re-check).

**Two corrections to the base package's record:**

- `REVIEW-RECORD.md` says "19 of the 20 notes were also applied … The one not applied is 13.48 l.2 as proposed". This is inaccurate. All 20 notes have an applied edit, and 13.48 l.2 is word-for-word rev-D's own proposal ("marital duties").
- The record names only 10.6, 10.80 and 12.71 as editor wording. In fact eight edits used editor wording (listed above).

## Resolution of the two unchecked edits (this acceptance pass)

| Edit | Independent verdicts | Outcome in v2 |
|---|---|---|
| 35, 15.2 l.2 "It's the cause. Still, I won't spill her blood," | Contested-gloss resolver G1: **KEEP**. Re-checker RC2 in `recheck-RC2.json` confirms. | Unchanged. Line 0 of the same speech was independently reverted to "It's the cause, it's the cause, my soul;" (G1: no public-domain commentator supports the "crime on trial" gloss; blind reader B3 found it opaque). |
| 36, 1.33 "— having sex" | G1: **REVISE**, remove it. Blind reader B1, independently: "the most jarring line in the scene … sounds like an editor's footnote spoken by Iago". Re-checker RC1 in `recheck-RC1.json` confirms. | Removed: "…your daughter and the Moor are, right now, making the beast with two backs." |

## Per-edit table

| # | Line | Origin | Applied | Independently re-checked |
|---|---|---|---|---|
| 1 | 1.3 l.0 | editor | editor-originated | yes, accept |
| 2 | 3.35 l.7 | editor | editor-originated | yes, accept |
| 3 | 3.35 l.18 | rev-A should-fix | as proposed | yes, accept |
| 4 | 4.68 l.0 | rev-A should-fix | as proposed | yes, accept |
| 5 | 4.105 l.21 | rev-A note | as proposed | yes, accept |
| 6 | 4.72 l.7 | rev-A note | as proposed | yes, accept |
| 7 | 4.17 l.2 | rev-A note | as proposed | yes, accept |
| 8 | 1.40 l.6 | rev-A note | as proposed | yes, accept |
| 9 | 1.9 l.0 | rev-A note | as proposed | yes, accept |
| 10 | 4.96 l.0 | rev-A note | editor wording | yes, accept |
| 11 | 4.51 l.2 | rev-A note | as proposed | yes, accept |
| 12 | 6.24 l.10 | rev-B must-fix | as proposed | yes, accept |
| 13 | 7.8 l.0 | rev-B should-fix | as proposed | yes, accept |
| 14 | 9.154 l.3 | rev-B should-fix | as proposed | yes, accept |
| 15 | 9.66 l.2 | rev-B should-fix | as proposed | yes, accept |
| 16 | 9.146 l.3 | rev-B note | as proposed | yes, accept |
| 17 | 7.10 l.0 | rev-B note | editor wording | yes, accept |
| 18 | 10.6 l.0 | rev-C should-fix | editor wording | yes, accept |
| 19 | 10.40 l.2 | rev-C note | as proposed | yes, accept |
| 20 | 10.75 l.3 | rev-C note | as proposed | yes, accept |
| 21 | 10.80 l.0 | rev-C should-fix | editor wording | yes, accept |
| 22 | 12.71 l.0 | rev-C should-fix | editor wording | yes, accept |
| 23 | 12.33 l.8 | rev-C should-fix | as proposed | yes, accept |
| 24 | 12.37 l.7 | rev-C note | as proposed | yes, accept |
| 25 | 12.80 l.0 | rev-C note | as proposed | yes, accept |
| 26 | 12.93 l.0 | rev-C note | as proposed | yes, accept |
| 27 | 12.115 l.0 | rev-C should-fix | as proposed | yes, accept |
| 28 | 13.48 l.2 | rev-D note | as proposed | yes, accept |
| 29 | 13.48 l.12 | rev-D note | editor wording | yes, accept |
| 30 | 13.48 l.16 | rev-D note | editor wording | yes, accept |
| 31 | 15.2 l.0 | rev-D note | as proposed | yes, accept |
| 32 | 15.108 l.1 | rev-D note | as proposed | yes, accept |
| 33 | 15.153 l.2 | rev-D should-fix | as proposed | yes, accept |
| 34 | 15.190 l.8 | rev-D note | editor wording | yes, accept |
| 35 | 15.2 l.2 | editor | editor-originated | **no** |
| 36 | 1.33 l.0 | editor | editor-originated | **no** |
