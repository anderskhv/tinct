# Modern-English Translation Protocol

Updated: 2026-09-21

This is the entry point for `modern-en` drafting, repair, and acceptance.
Follow [Book Factory Agent Instructions](AGENTS.md) — especially its
**Modern English** and **QA Gates** sections — for the rules this protocol
implements. [Workflow Boundaries](../docs/workflow-boundaries.md) governs
separation from app and audio work.

The previous language-specific protocol (Danish translation instructions,
the old pipeline spec) was retired in PR #123 (commit `18976900`). Its
contents remain recoverable in Git history; do not apply its superseded
model restrictions, generation commands, or publication requirements to
current work. This document, together with `AGENTS.md`, is what replaces
it. It is not yet exhaustive — treat gaps as open questions to raise, not
license to improvise a conflicting procedure.

## Target

A faithful, genuinely accessible modern-English reading edition suitable
for a potential default reading edition. Not a summary. Not the original
translation with spelling modernized. See `AGENTS.md` → Modern English for
the full drafting rules; the short version:

- Preserve every claim, image, action, condition, example, quantity,
  uncertainty, repetition, and joke.
- Anchor to one identified source edition. Never import remembered detail
  from another translation.
- Rebuild difficult syntax in ordinary vocabulary; one source sentence may
  become several, but avoid choppy prose.
- Preserve paragraph count, order, and array indices exactly.
- Clarify essential unfamiliar terms briefly and accurately; never invent
  interpretation or erase deliberate ambiguity.
- No required rewrite percentage — already-clear wording may stay as is.
- Modernize quoted speech, verse, and formulas as well as surrounding
  prose. Preserve meaning, imagery, rhetorical function, and recognizable
  recurring wording. Do not leave archaic language merely because it
  appears inside quotation marks. When the source's own discussion is
  about the exact wording (a character comparing two near-identical
  lines), preserve the distinctions that discussion depends on, and
  clarify briefly if necessary. This applies only to quotations embedded
  in the chosen source — never substitute wording from another
  translation or a modern copyrighted edition.
- In verse: meaning outranks rhyme. Never add an idea or change an image
  to land a rhyme. Preserve musicality where it doesn't cost fidelity.
- Use a documented, context-aware name convention. No blind global
  replacements.

## Reusable prompts

- [`prompts/modern-en-draft-prompt.md`](prompts/modern-en-draft-prompt.md)
  — drafting/repair prompt for a chapter.
- [`prompts/accessibility-review-prompt.md`](prompts/accessibility-review-prompt.md)
  — Reviewer A (fresh, blind accessibility pass).
- [`prompts/fidelity-review-prompt.md`](prompts/fidelity-review-prompt.md)
  — Reviewer B (packet-based fidelity pass against source).

Use Claude agent sessions already available in this environment to run
drafting and review. Do not call paid model APIs directly for drafting or
review work.

## Acceptance procedure

A chapter is accepted only after all of the following, in order:

**A. Accessibility review, first, blind.** A reviewer who has not seen the
source or the drafter's notes reads the candidate alone and identifies
exact wording a new reader would struggle with, and why. Natural flow
matters as much as sentence length — a short sentence can read choppily; a
long one can read smoothly.

**B. Fidelity review, second, in packets, with context.** A separate
reviewer compares every paragraph against the source in small packets
(roughly 5-10 paragraphs), including one paragraph of neighboring context
on each side of the packet. Checks actors, negation, causality, certainty,
conditions, and omissions/additions — see the fidelity prompt for the full
checklist.

**C. Whole-chapter re-read for cross-boundary issues.** After packets are
done, the fidelity reviewer re-reads the whole chapter once more for
relationships and recurring terms/images that cross packet boundaries and
that a packet-scoped read can miss.

**D. Verify in the actual final file; pin acceptance to a hash.** Apply any
required fixes to the real candidate file (not just the review notes),
regenerate the review artifact against that final version, and record the
file's hash alongside the acceptance verdict. An acceptance record that
doesn't name the exact file/hash it covers does not count.

### Rules for reviewers

- Reviewers must state exactly what they read — which paragraphs, in full
  or sampled, and why. **A sampled review cannot certify an entire
  batch.**
- The drafter's own self-check is not independent review. Step B/C must be
  done by a separate reviewer session that does not start from the
  drafter's notes as ground truth.
- Similarity and length metrics (the `classify-modern-en.py` gate,
  word-count ratios) are **flags for inspection, never proof of quality
  and never a mandatory rewrite target.** A chapter that is already clear
  and idiomatic may legitimately score close to the source; that is not
  by itself a defect. See `AGENTS.md` → QA Gates for how the gate is used
  now (inspection trigger, not a blocking pass/fail on its own).

## Status

This procedure has been reconciled across `AGENTS.md` and `CLAUDE.md` as of
2026-09-21. It has been piloted on one chapter each of Leviathan
(accessibility pilot, Sonnet vs. Opus) and a targeted verse review of
Brothers Karamazov — see `books/wip/leviathan-pilot-ch18/` and
`books/wip/brothers-karamazov-verse-review/` for the pilot reports and
recommendation on the next bounded batch. No candidate produced under this
procedure has been published yet.

Existing edition data, audio assets, and runtime language support are
unchanged by this document. Do not delete or regenerate them as part of
procedure work.
