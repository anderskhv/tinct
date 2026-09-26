# Acceptance Record — Faust Part I, original-de remaining attribution fixes

**Status: ACCEPTED, ready for Codex integration. Not published.** This
resolves the three remaining confirmed attribution defects left open by
the earlier apparatus repair (`APPARATUS-REPAIR-ACCEPTANCE-RECORD.md`,
this folder).

| Item | Value |
|---|---|
| Package | `books/wip/faust-part-1-original-de-fix/` |
| Branch | `claude/cool-clarke-ngd780` |
| Candidate sha256 | `3e69f81d08d33c8b3aae0d7c1c7b05757f6944317ba68ff754a0f2aaf4b2f66c` (28 chapters, 1,095 paragraphs, was 1,093) |
| Independent reviewer | A separate Claude agent instance, verified against raw source and programmatic diffs before consulting release notes |
| Review verdict | **ACCEPT — no discrepancies found** |

## What this fixes

1. **Chapter 16, paragraph 5**: a line of dialogue ("Bester Mann! von
   Herzen lieb' ich dich!") had no speaker label — fixed by prefixing
   "MARGARETE. ", confirmed against the raw source's standalone
   "_Margarete._" label immediately preceding the stage direction that
   precedes this line.
2. **Chapter 21, paragraph 2**: the Zwinger scene's prayer ("Ach neige,
   Du Schmerzenreiche...") had no speaker label — fixed by prefixing
   "GRETCHEN. ", not "MARGARETE.", because the raw source explicitly
   labels this speech "_Gretchen._" specifically (not "Margarete"), and
   this choice was verified consistent with the file's own existing
   split usage: chapters 18/20/22/23 already use "GRETCHEN." while
   chapters 10/11/13/15/16/19/28 use "MARGARETE." — chapter 21 sits
   chronologically among the GRETCHEN-labeled scenes, not an arbitrary
   choice.
3. **Chapter 25**: "TITANIA."'s paragraph had "Orchester Tutti" and a
   full unlabeled chorus quatrain glued onto its end, with the
   "(Fortissimo.)" stage direction entirely missing. Split into three
   paragraphs: Titania's speech alone, a new "[Fortissimo.]" stage
   direction, and a new "ORCHESTER TUTTI." speech paragraph for the
   chorus.

## Independent review summary

Confirmed both label choices (MARGARETE for ch16, GRETCHEN for ch21)
against the raw source directly, and confirmed the GRETCHEN/MARGARETE
split is consistent with this file's own established pattern elsewhere.
Programmatically confirmed the chapter 25 split reproduces the exact
same underlying words as before (old paragraph text minus "TITANIA. "
prefix equals the two new speech paragraphs' bodies joined by "Orchester
Tutti", with only the stage direction genuinely new — nothing dropped or
duplicated). Diffed every chapter against the prior accepted state:
chapters 16 and 21 each have exactly one changed paragraph, chapter 25
has exactly the described 1→3 split, and all other 25 chapters are
dict-identical to the prior state. Valid JSON, 28 chapters, 1,095 total
paragraphs (+2, fully explained by the chapter 25 split).

## What "accepted" does not mean

Accepted for integration; not published, not live. This closes out all
three previously-flagged remaining gaps in `original-de`'s apparatus
repair — no further known apparatus defects in this edition. Codex owns
integration and the serialized release process per
`books/BOOK-TASK-WORKFLOW.md`.
