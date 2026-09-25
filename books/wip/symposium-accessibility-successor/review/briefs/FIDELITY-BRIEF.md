# Symposium accessibility successor — fidelity review brief

You are an independent **fidelity reviewer**. You did not assess, render or edit this text.

## Background

The accessibility successor re-renders paragraphs of the accepted Tinct Modern English Symposium (`modern-en` `1e970b7b…`) that independent assessors marked `REPAIR`. Those paragraphs had opaque syntax, archaic wording, shifted historical senses, arguments that were hard to follow, or misleading wording.

The baseline is Jowett's translation, the corrected `original-en` `3521a12d…`. Fidelity is judged against Jowett. Do not import readings from other translations. Plato's Greek matters only where Jowett's own sentence is ambiguous, and then only to choose between readings that Jowett's words allow.

## Your packet

`review-<ID>.md` gives every **changed** paragraph in your chapters: JOWETT, BEFORE (the accepted modern-en) and AFTER (the successor). The renderer's notes are included where given.

## Check every changed paragraph for

- **Omission:** a claim, example, name, quotation, qualification, hedge, joke, dialogue tag or step of argument dropped.
- **Invention:** content added that Jowett does not state or clearly imply. A few clarifying words that unpack a reference or a shifted sense are allowed. Added facts, motives or arguments are not.
- **Distortion:** an argument step changed, reversed, strengthened or weakened; a speaker's reasoning "improved".
- **Terminology drift:** the shared glossary is `GLOSSARY.md`. Beautiful/ugly for fair/foul, reproduction/giving birth, self-control, lacking and so on must be applied consistently, especially where an argument depends on the same word.
- **Voice and register:** Phaedrus is earnest; Pausanias lawyerly; Eryximachus pompous and technical; Aristophanes comic; Agathon ornate; Socrates ironic; Diotima oracular; Alcibiades drunk and candid. Frank sexual content stays frank and accurate.
- **Conventions:**
  - straight quotation marks, with single quotes for speech;
  - a speech running over paragraphs opens a quote at each paragraph start and closes only at its end;
  - American spelling;
  - spaced em dashes;
  - no ellipses.
- **Order:** paragraph N must begin with content equivalent to Jowett's paragraph N.

## Output

Write JSON to `/tmp/claude-0/-home-user-tinct/781378ba-275b-5897-8531-920676c586a7/scratchpad/out/symp-fidelity-<ID>.json`:

```json
{"reviewer": "<ID>", "paragraphs_read": N, "findings": [
 {"id": "4.2", "category": "omission" | "invention" | "distortion" | "terminology" | "voice" | "convention" | "order",
  "severity": "must-fix" | "should-fix" | "note",
  "jowett": "<words>", "after": "<words>", "issue": "...", "proposed": "<replacement words or sentence>"}],
 "verdict": "accept" | "accept-with-fixes" | "reject", "summary": "..."}
```

Read every changed paragraph in full. Validate the file with `python3 -m json.tool`. Your final message should give counts by category and severity, and your verdict. Do not edit any other file, and do not run git.
