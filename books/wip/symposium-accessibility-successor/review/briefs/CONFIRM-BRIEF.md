# Symposium accessibility successor: final confirmation of round-3 edits

You are an independent confirmer. You did not render, assess, review, re-check or edit this text.

## Background

The successor re-renders the accepted Tinct Modern English Symposium (`1e970b7b…`) against Jowett, the corrected `original-en` (`3521a12d…`), for a first-time reader or listener. The edits have passed through several rounds:

1. The **round-2 edits** were independently re-checked by SRC1–SRC4.
2. The **round-3 edits** in your packet were made after those re-checks. They come from two sources:
   - **revisions a re-checker proposed**, applied in the re-checker's own words (marked `SRC<n> revise`), plus small polish the re-checkers endorsed;
   - **fixes from the fresh blind reads** BL3 (chapters 1 and 3) and BL4 (chapter 7). They read the round-2 text without Jowett and flagged where a first-time listener still loses the thread.

## For every R3 edit, give a verdict

- `accept`: faithful to Jowett, fixes the stated problem, reads naturally by ear, follows the conventions, and introduces no new defect.
- `revise`: right in direction, but the wording needs changing. Give the exact replacement for the edit's replacement span.
- `reject`: say whether to keep the round-2 text or what to do instead.

## What to check

- **Invention.** A few words that unpack a metaphor, name or shifted sense are allowed; added facts, motives or arguments are not. Two round-3 edits need particular attention:
  - At 7.64, the climax sentence is recast in plain words, and "true love" becomes "loving a young man in the right way". Check that nothing of Jowett's is lost, and that the frankness matches Plato's word without sharpening it.
  - At 7.63, "the knowledge of beauty everywhere" becomes "the knowledge of a beauty of a very special kind". The edit cites Plato's Greek, because Jowett's "everywhere" contradicts 7.64. Decide whether this is a sound resolution or an import from outside Jowett.
- **Glosses.** Check each for accuracy: 7.40 "fine and noble", 7.53 "giving birth in the presence of beauty".
- **Voice and conventions.**
  - Diotima uses no contractions.
  - Straight quotes: single for speech, double for nested speech.
  - A continuing speech reopens its quote at each paragraph start.
  - American spelling, spaced em dashes, and no ellipses.
- **The whole paragraph.** Read each AFTER paragraph in full, and report anything the edits broke.

`../symposium/pg1600.txt` is the Jowett source, and `../symposium/GLOSSARY.md` is the glossary. Never consult a copyrighted translation.

## Output

Write JSON to `/tmp/claude-0/-home-user-tinct/781378ba-275b-5897-8531-920676c586a7/scratchpad/out/symp-final-confirm.json`:

```json
{"confirmer": "SFC", "verdicts": [{"edit": "R3-1", "id": "5.8", "verdict": "accept" | "revise" | "reject", "note": "...", "proposed_replace": "<only for revise>"}],
 "paragraph_problems": [{"id": "x.y", "issue": "..."}], "summary": "..."}
```

Validate the file with `python3 -m json.tool`. Your final message should give the counts, with one line for each revise or reject. Do not edit any other file, and do not run git.
