# Leviathan Batch 2 — Chapter Selection

Three chapters chosen from the unrepaired backlog (46 of 49 chapters
remain after ch18/ch24/ch40), verified directly against the live edition
files before drafting — number, title, and opening text checked, not
assumed from array position. All three already pass the mechanical
modernization gate (REAL/REAL-HEAVY), so this is accessibility/fidelity
repair work on an existing rewrite, same as ch18/24/40.

## Selected

| | Edition ch | Hobbes ch | Title | Paragraphs | Words | Why |
|---|---|---|---|---|---|---|
| Short (calibration) | 10 | 9 | "Of the Several Subjects of Knowledge" | 12 | 372 | The shortest unrepaired chapter in the book by a wide margin — a fast, low-risk round-trip to confirm the hardened correction protocol doesn't add unnecessary overhead to a small chapter. |
| Long (scale test) | 27 | 26 | "Of Civil Laws" | 48 | 7,889 | Substantial without being the book's extreme outlier (ch42 is 138 paragraphs / 29,242 words and would need its own dedicated multi-batch project, not folded into a 3-chapter test batch). Tests the "bounded packets, don't enlarge batches to finish faster" instruction directly: split into 3 drafting/review packets of ~16 paragraphs each rather than one large pass. |
| Different difficulty | 14 | 13 | "Of the Natural Condition of Mankind, as Concerning Their Felicity, and Misery" | 14 | 1,782 | Hobbes's most famous chapter (the "nasty, brutish, and short" state-of-nature argument) — a different argumentative mode than ch18 (abstract definitional philosophy), ch24 (administrative/legal taxonomy), or ch40 (scripture-citation-heavy). This chapter argues from psychological/empirical premises about human nature and includes a historical comparison to "the savage people in many places of America" — a genuine test case for the citation-transparency requirement (verify whether this is presented as settled fact or as Hobbes's own inference, and handle accordingly), plus dense but non-legal, non-theological philosophical prose. |

## Confirmed before drafting (per chapter)

- Title and opening text read directly from
  `app/public/data/editions/leviathan-original-en.json` and matched
  against `leviathan-modern-en.json` (see command output in session log).
- Paragraph counts match between original-en and modern-en for all
  three (12/12, 48/48, 14/14).
- Gate classification: ch10 REAL-HEAVY (sim 0.460), ch14 REAL (sim
  0.614), ch27 REAL (sim 0.583) — informational only, not a pass/fail
  gate.
- No other active writer: `git status --short` clean before staging, no
  pre-existing `books/wip/leviathan-pilot-ch10/ch27/ch14/` directories
  (the pre-existing `books/wip/leviathan-repair/` directory is from an
  earlier, already-completed full-book mechanical-modernization pass —
  different files, different purpose, not touched by this batch).

## Not selected, for the record

ch42 ("Of Power Ecclesiastical," 138 paragraphs / 29,242 words) is the
book's single largest chapter by a factor of ~4 over the next-longest.
It is a legitimate future "long chapter" candidate but deserves its own
dedicated multi-batch treatment rather than being the "long" slot in a
mixed 3-chapter batch alongside two other chapters.
