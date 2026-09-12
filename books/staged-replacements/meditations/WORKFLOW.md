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
   **How to verify a staged source file — audit the rules, then diff.** This is
   the package's main methodological result, arrived at by four reviewers in
   succession and stated here so that it does not have to be rediscovered from
   `PROVENANCE.md` §4's narrative. The question it answers is: *how do you know
   the staged file contains the translator's text and nothing of the printed
   edition's apparatus?*

   a. **A re-run of the build proves nothing.** Byte-identity to a re-run shows
      only that the file matches the script. That is exactly how three
      illustration captions (Book IV) and three flush-left footnotes (Book VII)
      survived the first build and reached accepted text. *(Book IX reviewer.)*
   b. **So write an independent reconstruction of the range** — a second program
      that extracts the same chapter from the raw source — and diff it against
      the staged file.
   c. **But a reconstruction that shares the build's blind spot proves nothing
      either**, so the reconstruction must be **derived from a different property
      of the text** than the build is. *(Book X and XI reviewers.)* Book XII's
      range was reconstructed three times from three unrelated properties —
      opener tokens, indentation magnitude, and sentence completion — and all
      three reproduce the staged file to the byte. That is as strong as this
      check gets, and the package does not ask for a fourth.
   d. **Audit the reconstruction's own RULES against the raw text, class by
      class, BEFORE looking at its output.** Enumerate every apparatus class in
      the range and check each against the raw lines: footnote openers and their
      in-text markers, reconciled as two counts that must agree; unmarked
      continuations of a footnote body, checked by content; illustration
      captions; verse runs and verse citations; in-text Greek; daggers;
      standalone short flush-left lines (running heads, page numbers,
      catchwords); and every typographic normalisation the build applies, which
      the reconstruction must **reproduce** so that the two are compared on the
      same rules (**D14**). An audit run against the reconstruction's output
      instead of the raw text would find nothing: both real defects in this
      package's history were invisible output-to-output and visible only in the
      raw range.
   e. **State every rule as a RELATION, never as a CONSTANT.** Every rule that
      has failed in this package failed the same way — it encoded a contingent
      fact about one range as if it were a property of the text. "Footnotes are
      indented" (Book VII's three flush-left footnotes walked through it);
      "apparatus does not look like body" (Book IV's captions); "footnote runs
      are indented four spaces" (Book XII's nine-space continuation would have
      leaked Greek into XII.4); "a finished sentence ends in a period" (Long's
      broken clause at XII.17 walked through the Book XII reviewer's own first
      rule). **A number taken from one book does not transfer; only the shape of
      the rule does.** Where a class is defined by a threshold, the threshold is
      part of the class's statement.
   f. **Leave the documented defects IN the reconstruction** — Long's daggers,
      for instance — so that each surfaces as a diff and is counted, rather than
      being assumed away.
   g. **Then, and only then, diff.** A reconstruction that matches except at the
      documented dagger marks is evidence; a reconstruction that matches because
      it was written to match is not.

   If the diff shows apparatus still in the staged text, a rebuild is available
   under **D12**, and its standard is the one Books IV and VII met: paragraph
   count unchanged, only the affected paragraphs differing, every other chapter
   byte-identical so that no accepted book reopens, and the hash change recorded
   in `PROVENANCE.md` §4, in this file's ledger and in each affected
   `provenance.json`.

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

## After the last book: the whole-work pass

The eight steps are per book, and a book-by-book process cannot see between
books. When the last book is accepted, one more pass is owed, and its order
matters (set out by the Book XII round-1 reviewer, followed in September 2026):

1. **Mechanical checks first, while nothing is edited**, so that their output
   describes a fixed state and becomes the worklist: assemble the accepted
   candidates into one file and assert the whole-work structure and alignment as
   a pair with the staged original; assert the negative invariants over the whole
   work at once; re-derive the apparatus arithmetic for every book from the
   source's own brackets; and run every glossary row's left column over every
   candidate (`scripts/assemble_modern_en.py`, `scripts/glossary_frequency.py`,
   `scripts/punctuation_classes.py`).
2. **Then the record corrections that change no word** — the rows that
   under-describe the edition, and the classes that were decided in one
   `continuity.md` at a time and never collated (`PUNCTUATION.md`).
3. **Then ONE v3 pass, ordered BY CLASS and not by book.** Accepted books are the
   asset; a sequence of single-book reopenings dissolves it, while one change set
   with one recorded decision per class does not. Each touched book gets one
   `candidate-v3.json`, one `changes-v2-to-v3.md` and one hash; the accepted v2
   files stay on disk unchanged.
4. **Then one continuous read of the whole work for voice** — last, because it is
   the only step that needs the text final, and the only one that finds what no
   check can specify in advance (a formula Long repeats across books, rendered
   two ways, is invisible to a per-book flow read and to a glossary sweep alike).
5. **Then re-assert everything** and record the whole-work hash.

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
