# The Odyssey — modern-English workflow

Saved here so future tasks find the process without conversation history.
Adapted from the Meditations package's `WORKFLOW.md`
(`claude/meditations-modern-en-20260911-v2`), which was itself built from the
Odyssey Book 10 pilot (`claude/wizardly-allen-ra9p0k`,
`books/staged-replacements/odyssey-book10-pilot/`). This version adapts both
for a prose epic: a "chapter" here is one of the poem's 24 Books, and
"paragraph" is the served JSON's paragraph unit (a prose sense-unit, not a
line of verse) — the served editions are paragraph-aligned across
`original-en` / `modern-en` / `modern-da`, and audio, the Cast (character)
data, and saved reading positions all key on that same paragraph index.

## Scope

- **Content only.** This package owns the Odyssey only. Nothing here is
  merged, deployed, or registered. No changes to app code (`app/src/**`),
  library UI, registry entries, character/Cast cards, or audio. Never
  overwrite the served files under `app/public/data/editions/`; staged
  replacements live here, and only here, under
  `books/staged-replacements/odyssey/`.
- **Other books are other agents' work.** Meditations, Hamlet, Macbeth and
  Fear and Trembling have their own agents/threads.
- **English only** for this task. Danish (`odyssey-modern-da.json`) is not
  touched.
- **Zero Anthropic API spend.** All drafting happens in the agent
  conversation and is written to files. `generate-editions.cjs` is never run.
- **Paragraph alignment is a hard constraint.** The served editions are
  paragraph-aligned; audio, Cast cards, and saved reading positions key on
  paragraph index. The staged modern-en candidate keeps the exact paragraph
  count and order of the served `original-en` for the Book it covers: one
  candidate paragraph per source paragraph, in the same order.
- **No imported phrasing from other translations.** Every candidate sentence
  is built from Samuel Butler's 1900 prose translation (the served
  `original-en`, see `PROVENANCE.md`) alone. Fagles, Lattimore, Wilson and
  Fitzgerald (all in copyright) are not consulted, quoted, or paraphrased
  from memory.

## The eight steps (per Book)

1. **Verify the source.** Confirm the served `original-en`'s translation,
   public-domain status, and paragraph/Book count against the actual
   Project Gutenberg (or equivalent) text — not from memory. Check whether
   the served `modern-en` for the Book in question is reusable as-is or
   needs replacing, and record which and why. Check whether an
   already-drafted/accepted candidate exists elsewhere in the repo (for
   example the Book 10 pilot) that could be adopted, and record its status
   accurately (drafted vs. independently reviewed vs. accepted) rather than
   assuming acceptance that has not actually happened.
2. **Draft with full Book context.** Read the whole Book before drafting any
   paragraph. Fix stable renderings for names, epithets, and recurring
   formulas first (`GLOSSARY.md`), consistent with any earlier accepted
   Books.
3. **Freeze the draft.** Write `bookNN/candidate-v1.json` and the readable
   copy, record hashes in `bookNN/provenance.json`, and do not edit
   `candidate-v1.json` afterwards. Corrections go to `candidate-v2.json`.
4. **Independent review, three paragraphs at a time, with neighbouring
   context.** Prepare `bookNN/review-packets/packet-NN.md` in the Odyssey
   Book 10 pilot's layout (assigned paragraphs shown source-beside-candidate,
   one paragraph of context before and after marked `CONTEXT ONLY`), plus
   `bookNN/manifest.json` and `bookNN/review-instructions.md`. Push and stop.
   A separate reviewer session does the review; this task does not review
   its own draft. Findings come back on this branch under `bookNN/review/`.
5. **Record a finding or "No material issue found" for every paragraph.**
   The reviewer's output covers every assigned paragraph ID exactly once.
6. **Apply supported corrections and verify changed passages.** Write
   `candidate-v2.json` (and v3 if a second round is needed), list every
   change by paragraph ID with the finding it answers, re-check each changed
   passage against the source, and note any finding not applied and why.
7. **Read the complete Book for flow.** A continuous read of the corrected
   candidate for voice, pacing, repetition, terminology, and transitions.
   Record Book-level findings and fixes.
8. **Accept only when no substantive issue remains.** Record acceptance in
   `bookNN/ACCEPTANCE.md` with the accepted file's hash, the review rounds
   applied, and what remains open. Then move to the next Book.

Order of Books: this task drafted Book 1 only, per instruction. Later Books
proceed in numerical order unless a coordinator says otherwise; Book 10's
disposition (adopt the existing pilot draft vs. redraft against this
package's own glossary/continuity conventions) is a decision for the
coordinator, not assumed here (see `PROVENANCE.md`).

## Process template

The Odyssey Book 10 pilot is the template for the drafting, freezing, and
review-packet steps:

- branch `claude/wizardly-allen-ra9p0k`
- commit `25d36f36b0ee7dad1a10ff956415dcb3204bb15d`
- directory `books/staged-replacements/odyssey-book10-pilot/`
  (`README.md`, `provenance.json`, `manifest.json`, `continuity.md`,
  `review-instructions.md`, `review-packets/`, `candidate-v1.json`,
  `candidate-v1-readable.md`)

Note (recorded accurately, see `PROVENANCE.md`): that pilot is a **frozen
draft only**. Its own `README.md` states plainly that no independent review
had been run against it at the time it was pushed, and no later acceptance
commit exists on that branch or on `main`. It is used here as a process and
style template, not as an already-accepted Book.

The Book 9 pilot (`odyssey-pilot/odyssey-book9-candidate.json` on
`claude/upbeat-brown-cuttkn`) is a style reference only, referenced by the
Book 10 pilot for continuity, not a process template in its own right.

## Accessibility standard (the reading standard)

Same standard used for Meditations, from
`docs/modern-english-translation-audit-2026-09-11/AGENT-INSTRUCTIONS.md` on
`claude/upbeat-brown-cuttkn`: clear, natural English for a thoughtful modern
adult, preserving the work's complete meaning and literary character. Every
claim, image, example, qualification, and meaningful repetition survives;
old vocabulary and tangled syntax are simplified without simplifying away the
ideas; ambiguity, contradiction, and voice are kept; essential unfamiliar
terms are explained briefly at the point of need; nothing is added
(no interpretations, motives, diagnoses, historical facts, explanatory
transitions); logical distinctions are preserved; no mechanically short
sentences or generic explanatory prose.

## Voice rules for the Odyssey (adapted for prose epic)

- Preserve Homer's/Butler's narrative voice: third-person narration
  alternating with first-person speeches (Odysseus's tale to the
  Phaeacians in Books 9–12), formal epithets, and direct speech kept as
  direct speech, not summarized or paraphrased into indirect speech.
- Preserve stock epithets and recurring formulas consistently once a
  rendering is fixed (`GLOSSARY.md`) — e.g. patronymics ("son of
  Anchialus"), an epithet used for a character every time Butler uses it for
  them, and formulaic scene-types (guest-welcome, arrival, dawn) rendered the
  same way each time they recur, following the Book 10 pilot's precedent
  ("struck with her wand" / "anointed with a drug" kept as two distinct
  actions, not collapsed).
- **Names: use the served original's own forms, not a Greek-name
  normalization.** Butler's translation uses the Latin/Roman forms current
  in his period (Ulysses, Minerva, Jove, Neptune, Mercury, Saturn, Diana) for
  the Olympians who have them, alongside names that are already Greek
  (Circe, Calypso, Telemachus, Penelope, Nestor, and so on, which have no
  Roman equivalent in common use). This package keeps Butler's forms exactly
  as the served `original-en` has them — see `GLOSSARY.md` for the explicit
  decision and the reasoning (the previous served `modern-en`, now being
  replaced, silently remapped these to Greek forms — Minerva → Athena,
  Ulysses → Odysseus — which is a translation choice this package does not
  repeat without it being asked for).
- Replace archaic vocabulary, inverted word order, and long chained clauses
  with clear modern syntax, while keeping concrete physical detail (objects,
  gestures, numbers, distances) exactly as Butler has them — these are
  frequently load-bearing for later Books and for the Cast/threads data.
  Glosses for units or customs unfamiliar to a modern reader are kept to the
  shortest useful explanation at first use only (the Book 10 pilot's
  "cubit → roughly eighteen inches" is the model).
- Do not modernize into contemporary idiom that breaks the register (no
  slang, no anachronistic phrasing); "clear contemporary English" means
  syntax and vocabulary a fluent adult reader today follows without
  friction, not a colloquial rewrite.

## Files in this package

- `WORKFLOW.md` — this file.
- `PROVENANCE.md` — what the served `original-en` and `modern-en` actually
  are, hashes, public-domain status, and the Book 10 pilot's real status.
- `00-progress-ledger.md` — done / decided and why / next / needs Anders.
  Kept current at every push.
- `GLOSSARY.md` — stable name forms and recurring-formula renderings, fixed
  before drafting and extended book by book.
- `bookNN/` — one directory per Book with the eight-step artefacts.
- `scripts/` — deterministic build scripts and the frozen candidate text
  modules they read from (`scripts/candidates/bookN.py`).
