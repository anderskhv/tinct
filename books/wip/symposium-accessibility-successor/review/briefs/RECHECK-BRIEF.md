# Symposium accessibility successor: independent re-check of round-2 edits

You are an independent re-checker. You did not render, assess, review or edit this text.

## Background

The accessibility successor re-renders the accepted Tinct Modern English Symposium (`modern-en` `1e970b7b…`) so that a first-time reader or listener can follow it. The baseline is Jowett's translation: the corrected `original-en` `3521a12d…`.

In round 1, independent renderers re-rendered the paragraphs that assessors marked REPAIR. Round 1 then had two kinds of independent review:

- four fidelity reviews against Jowett (F1–F4);
- two blind comprehension reads, BL1 and BL2, by readers who never saw Jowett.

The editor then made the round-2 edits in your packet. Each edit is marked with its source:

- a fidelity finding (F1–F4);
- a blind-reader finding (BL1, BL2);
- the shared glossary (`../symposium/GLOSSARY.md`).

Many round-2 edits touch paragraphs that round 1 kept, because the blind readers showed that their Victorian wording still blocks a listener.

## For every edit, give a verdict

- `accept`: the AFTER wording is faithful to Jowett, fixes the stated problem, reads naturally by ear, follows the conventions below, and introduces no new defect.
- `revise`: right in direction, but the wording needs changing. Give the exact replacement text for the edit's replacement span.
- `reject`: the edit makes things worse. Say whether to restore BEFORE, or what else to do.

## What to check

- **Invention.** A few clarifying words that unpack a name, custom, myth or shifted sense are allowed. Examples: the pun on Agathon's name; "Uranus, god of the heavens"; the premise of the Alcestis story; "the famous Athenian politician and general". Added facts, motives or arguments are not allowed. Check every added gloss for accuracy.
- **Plato's Greek.** Some edits cite Plato's Greek to choose between readings that Jowett's words allow. Check that the choice is sound, and that no edit imports a reading from another translation.
- **Omission, distortion and voice.**
  - Nothing may be dropped.
  - No argument step may be strengthened or weakened.
  - Each speaker keeps his voice: Phaedrus earnest, Pausanias lawyerly, Eryximachus pompous, Aristophanes comic, Agathon ornate, Socrates ironic, Diotima oracular without contractions, Alcibiades drunk and candid.
  - Frank sexual content stays frank and accurate.
- **Terminology.** Follow `../symposium/GLOSSARY.md`. Where an argument turns on a word, the same word must be used at every step.
- **Conventions.**
  - Straight quotes, with single quotes for speech and double quotes for nested speech.
  - A speech that runs over several paragraphs reopens its quote at each paragraph start and closes it only at the end.
  - American spelling, spaced em dashes, and no ellipses.
- **The whole paragraph.** Read the AFTER text in full. Report any new problem the edits created, such as a broken sentence or an unbalanced quote.

`../symposium/pg1600.txt` is the full Jowett source. Never consult a copyrighted translation.

## Output

Write JSON to `/tmp/claude-0/-home-user-tinct/781378ba-275b-5897-8531-920676c586a7/scratchpad/out/symp-recheck-<ID>.json`:

```json
{"rechecker": "<ID>", "verdicts": [
  {"edit": "R2-12", "id": "1.17", "verdict": "accept" | "revise" | "reject",
   "note": "...", "proposed_replace": "<only for revise: the exact new replacement text>"}],
 "paragraph_problems": [{"id": "x.y", "issue": "..."}],
 "summary": "..."}
```

Give one verdict for every R2 edit in your packet, and validate the file with `python3 -m json.tool`. Your final message should give the counts of accept, revise and reject, with one line for each revise or reject. Do not edit any other file, and do not run git.
