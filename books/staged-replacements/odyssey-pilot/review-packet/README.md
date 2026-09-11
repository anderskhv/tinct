# Odyssey Book 9 pilot — independent review packet

For Opus and Anders/Codex, per the task's instruction to review the pilot before any
larger retranslation is proposed.

## Files

- `pairs.json` — 10 passages from Book 9 (the Cyclops episode), each shown as three
  neutrally labeled candidates (**Candidate A / B / C**, order randomized per passage) with
  no ratings, verdicts, or commentary attached. One candidate is Samuel Butler's 1900
  original-en source text, one is Tinct's current live `modern-en` edition (found by the
  2026-09-11 audit to be a "LIGHT/MECHANICAL false modern chapter" for this specific
  chapter — essentially unmodernized Butler), and one is the new pilot candidate produced
  for this task.
- `mapping.json` — the answer key, same order as `pairs.json`, mapping each label back to
  `source` / `current_modern` / `candidate`. Don't open this until after forming your own
  judgment.

## How to review

For each of the 10 passages, read all three candidates and judge for yourself, blind, on
the reading standard: complete meaning preserved (claims, images, qualifications,
sequence)? Natural modern English? Voice and characterization (Odysseus's cunning,
Polyphemus's brutality) intact? Deliberate ambiguity left alone rather than resolved?
No invented content? Only then check `mapping.json` to see which was which, and whether
your independent read agrees with the intent behind the pilot (see
`../COVERAGE-RECORD.md` for the full accounting and the translation decisions made,
including one compression the drafter found and fixed mid-pass, and the naming
conventions applied).

## What's deliberately included

The 10 passages span: the opening frame, the council speech, dramatic irony inside the
cave, the first killing, the "Nobody" trick being set up, the blinding itself, the pun
landing on the other Cyclopes, Polyphemus talking to his ram, his recognition of the old
prophecy, and Poseidon's curse — narrative, dialogue, wordplay, violence, and the
chapter's one deliberately-preserved piece of ambiguity, not just the easiest or most
impressive-looking bits.

## What this packet is not

Not a full-chapter read start-to-finish (that's `../COVERAGE-RECORD.md` plus the actual
files: `app/public/data/editions/odyssey-original-en.json` and `-modern-en.json` for
Book 9, and `../odyssey-book9-candidate.json` for the pilot). Not a verdict — no ratings
are included here by design, matching the review-packet convention used in the September
audit (source/candidate pairs, neutral labels, separate mapping file, no verdicts baked
in).
