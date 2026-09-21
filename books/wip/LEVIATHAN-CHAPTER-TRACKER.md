# Leviathan Modern-English Repair — Chapter Tracker

Status legend: not started / drafted / accessibility reviewed / fidelity
reviewed / corrected / **final verified** (fidelity ACCEPT AS-IS on the
exact final file + accessibility resolved, hash pinned after last edit).

49 chapters total (edition numbering; "Hobbes ch" is his own numbering,
one less than edition number for chapters 2-49 since edition ch1 is the
unnumbered Introduction).

## Done

| Edition ch | Hobbes ch | Title | Status | Final hash |
|---|---|---|---|---|
| 18 | 17 | Of the Causes, Generation, and Definition of a Commonwealth | **final verified** | `89546ca2c949cf64104c518ff4e1bf8dc959ecb94f59b672c14ee641ed4d610f` |
| 24 | 23 | Of the Public Ministers of Sovereign Power | **final verified** | `791e117aa5ef698e7cc7ef87b4a0ecf0eaeaa48f9f280518c2b7bed98b8abd68` |
| 40 | 39 | Of the Signification in Scripture of the Word Church | **final verified** | `52277a34efaf708d0befa21c37dc076b3a298ad1dbd933460329fa16de404fc7` |
| 10 | 9 | Of the Several Subjects of Knowledge | **final verified** | `394b09485b8ef288af5409527d0fe050570e060ca6150f7d53b15500983ce445` |
| 14 | 13 | Of the Natural Condition of Mankind, as Concerning Their Felicity, and Misery | **final verified** | `0bf1de2f5e2b9097cb36cbc99776582df5ff01a19787446811b6a737291cda82` |
| 27 | 26 | Of Civil Laws | **final verified** | `81bc5757384809e4e28599eec1fcd7883d56b3220a0c14c85519fb61c14a7ba1` |
| 2 | 1 | Of Sense | **final verified** | `46c4171f315c7f4fda1533b5ea27eac31f1389fac1d90cb716046aa338b1f663` |
| 13 | 12 | Of Religion | **final verified** | `42bc1e301272084321689dd3a30d4c013081e26adb6d33574e5977ca61d0478a` |
| 16 | 15 | Of Other Laws of Nature | **final verified** | `81049aadf46b3c513989d25d6e316bca7f2375930c885967e0926a3d8bcd7fc7` |

Batch 2 (ch10/14/27) and batch 3 (ch2/13/16) full process history,
review coverage, and defect-by-stage counts are in each chapter's
`books/wip/leviathan-pilot-ch{N}/PILOT-REPORT.md`.

## Not started (37 remaining after batch 3)

1 (Introduction), 3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 19, 20, 21,
22, 23, 25, 26, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 41, 42, 43
(very long, 138 paras/29,242w — edition ch43 = Hobbes's own ch42, "Of
Power Ecclesiasticall"; recommend its own dedicated multi-batch project
when reached — an earlier version of this tracker mislabeled this as
edition ch42, corrected during batch 3 selection, see
`leviathan-batch3-selection.md`), 44, 45, 46, 47, 48, 49.

## Process notes

- Model policy held constant: Sonnet drafting, fresh candidate-only
  accessibility review, independent Opus fidelity review, no paid API
  calls (settings recorded per-batch in each pilot directory).
- Hardened correction protocol in effect since batch 2:
  `books/content_edit_helpers.py` for all in-script paragraph edits,
  before/after diffing, structure validation, word-count tripwires (see
  `TRANSLATION_PROTOCOL.md` → "Applying corrections without introducing
  new defects").
- Any edit made after a chapter's final ACCEPT AS-IS requires its own
  independent re-verification before the hash is pinned — see ch24's
  `fidelity-review-D9-verification.md` for the pattern this follows.
- Pause conditions (per standing instruction): an unresolved
  meaning/editorial decision that materially affects the text; a
  recurring process failure the safeguards haven't resolved; conflicting
  ownership or missing access; a genuine resource/spending limit. Not
  pausing for routine per-chapter sign-off.
