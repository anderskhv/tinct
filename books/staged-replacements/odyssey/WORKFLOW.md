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
   **Before freezing, run `scripts/collision_triage.py N` and
   `scripts/compound_register.py`, and act on what they say** — not after.
   Book 9 is the demonstration: fifteen live collisions repaired in the draft,
   which at a review round would have been fifteen findings and a successor.
   Adding a Book also creates rows in every earlier Book's `collisions.md`;
   rule those too rather than leaving a backlog.

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

   **Then RE-RUN the collision check and the compound register over the
   corrected file, and rule whatever the repairs opened.** Blind spot 15 is
   *a repair that re-creates its own collision somewhere else in the same
   draft*, and Book 9's round 1 found the instance by reading PG by hand:
   the P020 repair restored Butler's `clutched up` to protect his `snatched`
   at P036 while the same draft wrote `snatch` at P019. **Book 9's own v2
   then opened a new row** (`answer`, at P017/P019) and Book 10's draft
   opened several — and every one of them was caught **only because the check
   was run again after the repairs**. A repair is an edit to the text and
   gets the same instruments a draft gets.
7. **Read the complete Book for flow.** A continuous read of the corrected
   candidate for voice, pacing, repetition, terminology, and transitions.
   Record Book-level findings and fixes.
8. **Accept only when no substantive issue remains.** Record acceptance in
   `bookNN/ACCEPTANCE.md` with the accepted file's hash, the review rounds
   applied, and what remains open. Then move to the next Book.

   **And regenerate EVERY Book's `checks-vN.md` and manifest** —
   `python3 scripts/checks.py N --version V --write-manifest` for each Book
   that has a `checks` block. Every checks file prints the cross-Book
   comparability table, so accepting a Book makes every earlier Book's
   generated file stop reproducing from the code that writes it, while its
   recorded hash and the file on disk still agree because both are the same
   stale pair. `checks.py --manifests` names this by Book when you forget;
   it was found by `prove_manifest.py`'s own control at Book 9, not by an
   instrument.

Order of Books: this task drafted Book 1 only, per instruction. Later Books
proceed in numerical order unless a coordinator says otherwise; Book 10's
disposition (adopt the existing pilot draft vs. redraft against this
package's own glossary/continuity conventions) is a decision for the
coordinator, not assumed here (see `PROVENANCE.md`).

## Verifying a Book's source — the standing rule

Every Book's source is verified **twice, by two unlike rules**, and each new
Book's drafter devises a **new kind** of rule rather than re-running an earlier
one. Agreement between unlike methods is evidence; agreement between one method
and itself is not, and **byte-identity to a re-run of your own build script is
not verification at all**. The eight kinds used so far are enumerated in
`RESUME.md`.

**Audit the rule before trusting it.** Four drafters and reviewers have now
audited their own source rule before publishing it, and **all four audits found
a defect in the rule as first written** — two no-op controls (Book 5 drafter),
a measure blind to deletion (Book 5 reviewer), a half-vacuous containment guard
found by the next round (Book 5 drafter again, finding C-14), and a character
span that dropped the chapter's last full stop (Book 6 drafter). Budget for it.
A rule that passes its own audit on the first attempt has probably not been
audited.

## Negative controls — the two-clause rule (D18)

Written at Book 5's step 6, from records findings **R-1** and **R-2** of
`book05/review/findings-v1.md`. Every verification script in this package
verifies something nobody will check again, so each carries negative controls:
mutations that the check **must** reject. Two ways of writing one are worthless
and they look identical from outside.

> **A negative control asserts (a) that its mutation changed the input, and
> (b) that the check's own verdict changed. Where (b) cannot be made to hold,
> the blindness is declared by name and a second check is made to carry that
> class.**

Clause (a) is the one Book 5's drafter found for itself: two of its controls
were `paragraph.replace("the", …)`, a **no-op** on a paragraph with no `the` in
it. Round 1 found the same shape in three further scripts, none of them a no-op
today, none of them saying so — a control that is sound by luck is not sound.

Clause (b) is the half that survives the fix, and round 1 demonstrated it rather
than asserting it: the reviewer's own rule had a control that deleted twelve
words, **asserted that the deletion changed the text**, and still did not fire,
because the measure counted only the fraction of the chapter's tokens that
aligned and every surviving token still aligned. The mutation was real; the
*measure* was blind. Clause (b) is what catches that, and it caught one again
while this rule was being applied: a one-letter control in
`book04/review/verify_source_book4_review.py` mutated `understanding.”` into
`understanding.””` — real, and invisible to a fingerprint that normalizes
punctuation.

`scripts/controls.py` is the rule as one callable. `control()` runs both
clauses; `declare_blind()` is the escape, and it is not free — it requires the
name of the check that carries the class instead. Every verification script in
the package routes its controls through it, new and old:

| script | controls | declared blind |
|---|---|---|
| `scripts/verify_source_book2.py` | 3 (none before; its controls were prose-described) | a defect PG and the served file share |
| `scripts/verify_source_book3.py` | 2 process controls | — |
| `scripts/verify_source_book4.py` | 4 | — |
| `scripts/verify_source_book5.py` | 5 + 2 structural | a paragraph merge |
| `scripts/verify_source_book6.py` | 6 | a changed digit; a defect PG itself carries |
| `book03/review/verify_source_book3_review.py` | 3 | — |
| `book04/review/verify_source_book4_review.py` | 6 | a defect PG and the served file share |
| `book05/review/verify_source_book5_review.py` | 5 | — (repaired at review time by its own audit) |
| `scripts/compound_drift.py` | 4 | a compound open in every Book, with no closed or hyphenated form anywhere in the corpus |

Applying the rule to an existing script changes its assertions, never its
verdict; where a review script is touched, the change says so in place.

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
- **Names: the Greek forms, applied by script from the closed table in
  `GLOSSARY.md`.** *(Revised 2026-09-12 at Book 1 step 6. This rule
  previously said the opposite — keep the served original's Roman forms. The
  coordinator reversed it at round 1 of Book 1's review, standing finding
  **S1**, on the product's evidence: the Cast data and the Book Onboarding
  the reader meets beside and before the text use Odysseus, Athena, Zeus,
  Poseidon and Hermes almost exclusively.)* Butler's translation uses the
  Latin/Roman forms current in his period (Ulysses, Minerva, Jove, Neptune,
  Mercury, Saturn, Diana) for the Olympians who have them; the modern edition
  uses Odysseus, Athena, Zeus, Poseidon, Hermes, Cronus, Artemis. Names that
  are already Greek (Circe, Calypso, Telemachus, Penelope, Nestor, and so on)
  are kept exactly as Butler spells them, with one exception: where the Cast
  (`odyssey-threads.json`) has a display name for the figure, the Cast's
  spelling wins (Butler's *Euryclea* → **Eurycleia**). Butler's forms stay,
  correctly, in `original-en`, which is Butler.

  **Apply the mapping by script, never by hand or by find-and-replace over a
  general Roman→Greek deity list**, and assert each of the six hazards
  `GLOSSARY.md` enumerates — the one that actually fires is `Ops`, Butler's
  name for Eurycleia's grandfather, which such a list would turn into Rhea.
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
  before drafting and extended book by book. Also the spelling standard.
- `PUNCTUATION.md` — quotation marks and apostrophes, which Victorian
  quotation habits are normalized and which are preserved, and why.
- `bookNN/` — one directory per Book with the eight-step artefacts.
- `scripts/` — deterministic build scripts and the frozen candidate text
  modules they read from (`scripts/candidates/bookN.py`).
