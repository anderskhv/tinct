# Meditations (Marcus Aurelius) — modern-English workflow

Saved here so future tasks find the process without conversation history.
Decided by Anders on 2026-09-11 (see `DECISIONS.md` rows for 2026-09-11);
relayed to this task by the coordinator session.

## Scope

- **Content only.** This package owns Meditations only. Nothing here is
  merged, deployed, or registered. No changes to About, landing pages, app
  code (`app/src/**`), library UI, registry entries, character cards, or
  audio. Never overwrite the served files under
  `app/public/data/editions/`; staged replacements live here, and only here,
  under `books/staged-replacements/meditations/`.
- **Other books are other agents' work.** The Odyssey, Hamlet, Macbeth and
  Fear and Trembling have their own agents. Held content work (Bible, Faust,
  Magna Carta, Jane Eyre, and others) is not resumed through this task.
- **English only.** Danish is out of scope (decision 2026-09-11).
- **Zero Anthropic API spend.** All drafting happens in the agent
  conversation and is written to files (`AGENTS.md`). `generate-editions.cjs`
  is never run.
- **Paragraph alignment is a hard constraint.** The app's editions are
  paragraph-aligned; audio, character cards and saved reading positions key
  on paragraph index. A staged modern edition keeps the paragraph count and
  order of the `original-en` it is aligned to, exactly: one candidate
  paragraph per source paragraph. If the served `original-en` is
  misattributed or incomplete, the correct edition is staged with evidence
  (see `PROVENANCE.md`); served files are never edited.

## The eight steps (per book)

1. **Verify the source** and assess suitable reusable human editions.
   Identify the exact translation actually in the served file, its
   provenance, completeness by book and meditation count, and reuse rights
   in the US and Denmark. If a legally reusable human translation already
   meets the accessibility standard, stage it unchanged with evidence
   instead of rewriting. Otherwise modernise from one documented source and
   use that source consistently. Do not combine familiar quotations from
   different translations.
2. **Draft with full chapter context.** Read the whole book (chapter)
   before drafting any paragraph. Fix stable renderings for recurring
   concepts first (`GLOSSARY.md`).
3. **Freeze the draft.** Write `bookN/candidate-v1.json` and the readable
   copy, record hashes in `bookN/provenance.json`, and do not edit
   `candidate-v1.json` afterwards. Corrections go to `candidate-v2.json`.
4. **Independent review, three paragraphs at a time, with neighbouring
   context.** Prepare `bookN/review-packets/packet-NN.md` in the Odyssey
   Book 10 format (assigned paragraphs shown source-beside-candidate, one
   paragraph of context before and after marked `CONTEXT ONLY`), plus
   `bookN/manifest.json` and `bookN/review-instructions.md`. Push and stop.
   A separate reviewer session spawned by the coordinator does the review;
   this task does not review its own draft. Findings come back on this
   branch under `bookN/review/`.
5. **Record a finding or "No material issue found" for every paragraph.**
   The reviewer's output covers every assigned paragraph ID exactly once.
6. **Apply supported corrections and verify changed passages.** Write
   `candidate-v2.json` (and v3 if a second round is needed), list every
   change by paragraph ID with the finding it answers, re-check each changed
   passage against the source, and note any finding not applied and why.
7. **Read the complete chapter for flow.** A continuous read of the
   corrected candidate for voice, pacing, repetition, terminology and
   transitions. Record chapter-level findings and fixes.
8. **Accept only when no substantive issue remains.** Record acceptance in
   `bookN/ACCEPTANCE.md` with the accepted file's hash, the review rounds
   applied, and what remains open. Then move to the next book.

Order of books: Book II first as the pilot. Once Book II is accepted,
continue in numerical order, Book I included, without waiting for routine
approval. Each book goes through all eight steps and gets its own
independent review round from the coordinator.

## Process template

The Odyssey Book 10 package is the template for the drafting, freezing and
review-packet steps:

- branch `claude/wizardly-allen-ra9p0k`
- commit `25d36f36b0ee7dad1a10ff956415dcb3204bb15d`
- directory `books/staged-replacements/odyssey-book10-pilot/`
  (`README.md`, `provenance.json`, `manifest.json`, `continuity.md`,
  `review-instructions.md`, `review-packets/`, `candidate-v1.json`,
  `candidate-v1-readable.md`)

The Book 9 pilot (`odyssey-pilot/` on `claude/upbeat-brown-cuttkn`) is a
style reference only, not the process template.

## Accessibility standard (the reading standard)

From `docs/modern-english-translation-audit-2026-09-11/AGENT-INSTRUCTIONS.md`
on `claude/upbeat-brown-cuttkn`: clear, natural English for a thoughtful
modern adult, preserving the work's complete meaning and literary character.
Every claim, image, example, qualification and meaningful repetition
survives; old vocabulary and tangled syntax are simplified without
simplifying away the ideas; ambiguity, contradiction and voice are kept;
essential unfamiliar terms are explained briefly at the point of need;
nothing is added (no interpretations, motives, diagnoses, historical facts,
explanatory transitions); logical distinctions are preserved; no mechanically
short sentences or generic explanatory prose. A readable human edition is
preferable to an AI rewrite when it meets these criteria.

## Voice rules for Meditations (Anders's brief, binding)

- Preserve Marcus's compact, personal, self-addressed voice. Do not turn his
  reflections into motivational advice, moral lessons, or explanations
  addressed to a modern audience.
- Preserve each meditation's argument, qualifications, imagery and internal
  structure. Keep book and meditation numbering intact.
- Establish stable renderings for recurring concepts such as nature, reason,
  the ruling faculty, providence and the common good (`GLOSSARY.md`).
  Clarify briefly where necessary without imposing a modern psychological
  interpretation.
- Replace archaic vocabulary and tangled syntax while retaining concise,
  memorable language that already works. Do not expand short reflections
  merely to make them easier.

## Files in this package

- `WORKFLOW.md` — this file.
- `PROVENANCE.md` — what the served file actually is, the candidate-edition
  assessment, rights, and the staged corrected `original-en`.
- `00-progress-ledger.md` — done / decided and why / next / needs Anders.
  Kept current at every push.
- `GLOSSARY.md` — stable renderings fixed before drafting.
- `meditations-original-en.staged.json` — corrected `original-en` (George
  Long 1862), built by `scripts/build_original_en_from_pg15877.py` from
  `source/pg15877-long-1862.txt`.
- `bookN/` — one directory per book with the eight-step artefacts.
