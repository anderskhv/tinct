# Meditations modern-English — progress ledger

Branch `claude/meditations-modern-en-20260911-v2`. Content agent for the
Meditations thread; the coordinator reads this file, Anders does not read the
session. Kept current at every push.

## Done

- 2026-09-11 — Read the Odyssey Book 10 template package (branch
  `claude/wizardly-allen-ra9p0k`, commit `25d36f36`) and the Book 9 style
  reference; read the 2026-09-11 translation audit's Meditations note and its
  reading standard (`claude/upbeat-brown-cuttkn`).
- 2026-09-11 — `WORKFLOW.md` written: eight steps, template reference, scope
  and voice rules.
- 2026-09-11 — Source verified. The served `original-en` is Meric Casaubon
  1634 (PG #2680), not George Long 1862 as the registry claims; complete
  against PG #2680 (412 paragraphs) but non-standard in numbering (Casaubon's
  Book II starts at standard II.4). Full evidence in `PROVENANCE.md` §1.
- 2026-09-11 — Human-edition assessment done against the accessibility
  standard: Casaubon 1634, Collier/Zimmern 1701/1887, Long 1862, Rendall 1898,
  Jackson 1906, Haines 1916 read from fetched texts; Farquharson 1944 and all
  post-1960 translations ruled out on rights. None meets the standard
  unchanged (`PROVENANCE.md` §2).
- 2026-09-11 — Corrected `original-en` staged from Long 1862 (PG #15877):
  `meditations-original-en.staged.json`, 12 books, 487 paragraphs (one per
  numbered section), built by `scripts/build_original_en_from_pg15877.py`
  from the committed source text; Book II cross-checked against Standard
  Ebooks (`PROVENANCE.md` §3–4).
- 2026-09-11 — `GLOSSARY.md` written and pushed: one rendering per recurring
  concept (nature, reason, the ruling part, the god within, providence, the
  common good, and the rest), plus voice and form rules, fixed before any
  drafting.

## Decided, and why

| # | Decision | Why |
|---|---|---|
| D1 | Modernise rather than stage a human edition unchanged. | No legally reusable human translation meets the standard. Rendall 1898 is nearest but lapses into thou-forms, keeps Victorian diction, adds interpretive coinages, and exists only as OCR. |
| D2 | The one documented source is George Long 1862, PG #15877. | Literal, standard numbering, clean digital text, PD in US and Denmark, and it is what the registry already promises. Casaubon (the served text) is 1634 English with non-standard numbering; Haines is more archaic; Rendall freer. |
| D3 | Stage a corrected `original-en` (Long) rather than modernise the served Casaubon. | The brief says to stage the correct edition with evidence if the served one is misattributed. Modernising Casaubon would perpetuate a false translator credit and non-standard numbering, and would fight 1634 syntax. Consequence: paragraph count changes 412 → 487; see "Needs Anders". |
| D4 | One paragraph per numbered section; each paragraph begins with its section number. | Keeps meditation numbering visible and stable, and gives the modern edition exact 1:1 alignment with the staged original. |
| D5 | Long's bracketed supplements, cross-references and verse citations kept in the staged original; footnotes, dagger marks and PG apparatus removed. | The brackets are Long's translation; the rest is scholarly apparatus, not text. All normalisations are listed in `PROVENANCE.md` §4 and reproducible by script. |
| D6 | PG #15877 preferred over the Standard Ebooks text as the base file. | PG keeps Long's square brackets (SE removes them); the two otherwise differ only in spelling convention and punctuation. SE used as a cross-check. |
| D7 | Chapter titles `Book 1`…`Book 12`, matching the served file's title style. | Keeps the app's existing chapter labelling; a change of style is not this task's call. |

## Next

1. Book II package: `book2/source-book2.json`, `candidate-v1.json`,
   `candidate-v1-readable.md`, `continuity.md`, `provenance.json`,
   `manifest.json`, `review-instructions.md`, `review-packets/packet-01…06.md`
   (17 paragraphs: five packets of three, one of two). Push 3, then stop and
   wait for the coordinator's independent review under `book2/review/`.
2. On findings: `candidate-v2.json`, verification of changed passages, flow
   read, `ACCEPTANCE.md`. Then Book I, III … XII in numerical order, each
   through the same eight steps and its own review round.

## Needs Anders (listed, not waited on)

- **A1. Paragraph-structure change.** Adopting the corrected Long
  `original-en` changes Meditations from 412 to 487 paragraphs with different
  boundaries. Served `modern-en`, `modern-da`, R2 audio, static
  `read/meditations` chapter pages and saved positions for this book all key on
  the old structure. The modern-en staged here aligns to the new structure.
  Decision needed before anything is integrated: accept the re-basing (and
  schedule modern-da and audio regeneration, out of this task's scope), or
  keep Casaubon and relabel it (in which case this modern-en would not align).
  Work continues on the assumption the re-basing is accepted.
- **A2. Registry attribution** is false today ("Long Translation (1862)" on a
  Casaubon text). Fixing it is app/registry work, outside this task.

## Open, not blocking

- Long's dagger-marked passages (textually uncertain Greek) are listed in
  `PROVENANCE.md` §4; reviewers should weigh findings there accordingly.
- II.14 PG reading "that which perish" vs Standard Ebooks "perishes"; kept as
  PG has it in the staged original.
