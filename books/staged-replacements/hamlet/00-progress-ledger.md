# Hamlet modern-English staging — progress ledger

Kept current at every push. Content-only; nothing here is merged, deployed,
or registered.

## Done

- **2026-09-11 — Package scaffold + source verification.** Set up
  `books/staged-replacements/hamlet/` on branch
  `claude/hamlet-modern-en-20260911`. Wrote `WORKFLOW.md` (adapted from the
  Meditations template, scene-as-chapter, speech/direction/heading as
  paragraph), `PROVENANCE.md` (served `original-en` identified as Project
  Gutenberg ebook #1524, public domain, no misattribution issue; served
  `modern-en` hash recorded as the file being replaced; paragraph format
  described), and started `GLOSSARY.md` (archaic-grammar table; address/
  titles/period-terms table).
- **2026-09-11 — Act 1 Scene 1 drafted and frozen.** `ch01/`: extracted the
  71-paragraph source, drafted `candidate-v1.json` paragraph-for-paragraph
  (word ratio 1.0036, no expansion, no paragraph loses content), froze it,
  and built the independent-review package: `manifest.json` (24 packets,
  coverage-checked), `review-packets/packet-01.md`–`packet-24.md`,
  `review-instructions.md`, `continuity.md` (all per-paragraph decisions,
  two open judgment calls flagged for the reviewer, confirmation of no
  base-text defects), `README.md` with a passing mechanical-checks script.

## Decided and why

- **No staged-corrected `original-en` needed.** Unlike the Meditations
  package (where the served file was misattributed and needed rebuilding),
  the served Hamlet `original-en` matched Project Gutenberg #1524 verbatim
  everywhere sampled in Act 1 Scene 1, and the registry does not claim a
  translator, so there is nothing to correct. The served file is used
  as-is as the alignment source for every scene.
- **Packet size stays 3, with a short final packet.** 71 is not divisible
  by 3; used 23 packets of 3 plus one final packet of 2 (packet 24:
  C01-P070–C01-P071) rather than an uneven distribution elsewhere, so every
  packet before the last is full-size and the coverage check stays simple.
- **Stage directions are never modernized.** They are already plain English
  in the source and are copied verbatim; only speeches are rendered.
- **No copyrighted modernization consulted, per the task's hard rule** — not
  No Fear Shakespeare, not any other in-copyright modern-English Hamlet.

## Next

**Next: Waiting on the coordinator: independent review of chapter 1
(`ch01/`), per `ch01/review-instructions.md`.** This agent does not review
its own draft. Once review findings land under `ch01/review/`, steps 5–8
(corrections → v2, flow read, acceptance) proceed for Act 1 Scene 1, and
then Act 1 Scene 2 (`ch02/`) begins under the same eight-step process.

## Needs Anders

- None yet. Two judgment calls in the frozen draft are flagged for the
  reviewer, not escalated to Anders: C01-P028 ("Tush, tush" rendered once,
  as "Nonsense") and C01-P039 ("usurp'st" rendered "take on" rather than
  "seize").
