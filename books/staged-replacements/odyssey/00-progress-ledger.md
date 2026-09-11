# The Odyssey modern-English — progress ledger

Branch `claude/odyssey-modern-en-20260911`. Content agent for the Odyssey
thread; the coordinator reads this file, Anders does not read the session.
Kept current at every push.

## Done

- 2026-09-11 — Read the process templates: Meditations package
  (`WORKFLOW.md`, `GLOSSARY.md`, `PROVENANCE.md`, `00-progress-ledger.md`,
  and `book5/` in full) on `claude/meditations-modern-en-20260911-v2`, and
  the Odyssey Book 10 pilot (`README.md`, `provenance.json`,
  `continuity.md`, `review-instructions.md`, one packet, `candidate-v1.json`)
  on `claude/wizardly-allen-ra9p0k`.
- 2026-09-11 — `WORKFLOW.md` written: eight steps adapted for prose epic
  (chapter = Book, paragraph-aligned), scope, naming policy, and voice rules.
- 2026-09-11 — Source verified against the actual Project Gutenberg text
  (not from memory or the registry label): the served `original-en` is
  Samuel Butler's 1900 public-domain prose translation, PG #1727, 24
  chapters, 1,027 paragraphs, byte-identical Book 1 opening confirmed
  word-for-word, file ends exactly where PG's translation body ends (no
  boilerplate). Registry attribution (`bookRegistry.ts`) already correctly
  credits Butler — unlike Meditations, no misattribution to fix here. Full
  evidence in `PROVENANCE.md` §1.
- 2026-09-11 — Served `modern-en` checked: structurally sound (24 chapters,
  1,027 paragraphs, aligned), but silently remaps Butler's Roman names to
  Greek forms without recording that as a decision, and is a wholesale
  rewrite with no per-paragraph continuity trail. Recorded as the reason it
  is being replaced, per the task brief (`PROVENANCE.md` §2); its hash is
  recorded and none of its wording is reused.
- 2026-09-11 — Odyssey Book 10 pilot's real status checked directly (not
  assumed): it is a **frozen draft only**, never independently reviewed, no
  `ACCEPTANCE.md`, no `candidate-v2.json`, not present on `main`. Its own
  `README.md` says so in its own words. This is recorded plainly in
  `PROVENANCE.md` §3 rather than repeating the task brief's assumption that
  it was "accepted." Nothing from the pilot is copied into this package;
  its `candidate-v1.json` hash is recorded as a possible future starting
  point if a coordinator decides to adopt it (which would still need its
  own independent-review round and a name-form decision, since it uses
  Greek forms).
- 2026-09-11 — `GLOSSARY.md` written: the naming decision (keep Butler's
  Roman forms — Ulysses, Minerva, Jove, Neptune, Mercury, Saturn — rather
  than the served modern-en's Greek remapping), plus Book 1's recurring
  epithets and formulas ("son of Saturn, king of kings"; "father of gods and
  men"; "tell me truly" for the doubled "tell me, and tell me true";
  hecatomb folded into a plain description).
- 2026-09-11 — **Book 1 drafted and frozen** (steps 2–3): `book01/candidate-v1.json`
  (32 paragraphs, 1:1 with Butler's Book 1), word ratio 0.943 (min paragraph
  0.858, a single long Victorian sentence condensed — B01-P017). Source
  extracted verbatim into `book01/source-book1.json`. Speeches kept as
  direct speech throughout; Butler's own paragraph-boundary quotation
  convention preserved exactly at the one place it matters in this Book
  (source paragraphs 17→18, Minerva's speech: no closing quotation mark at
  the end of 17, opening quotation mark at the start of 18 — the candidate
  reproduces this rather than "fixing" it). Readable copy, `continuity.md`,
  `provenance.json`, `manifest.json`, `README.md`, `review-instructions.md`,
  and 11 review packets (10×3 + 1×2) built by
  `scripts/build_book_package.py 1` from `scripts/candidates/book1.py`.
  **Stopped for independent review** (step 4). Findings expected under
  `book01/review/`.

## Decided, and why

| # | Decision | Why |
|---|---|---|
| D1 | Keep Butler's own Roman name forms (Ulysses, Minerva, Jove, Neptune, Mercury, Saturn), not the Greek forms the served modern-en uses. | The task instruction is explicit: "preserve names in the served original's forms... use whatever the served original uses." Butler's text is written in Roman-form convention throughout; switching to Greek forms is a translation choice that was made silently in the file being replaced, and is not repeated here without being asked for. Recorded in `GLOSSARY.md` and `PROVENANCE.md` §2. |
| D2 | Odyssey Book 10 pilot is recorded as a frozen, unreviewed draft, not as "accepted" text ready to adopt. | Its own `README.md` and the branch's commit history say plainly that no independent review was run and no acceptance was recorded; nothing on `main` shows it as accepted either. Repeating the task brief's framing without checking would misrecord the state of the repository for the next agent or the coordinator. See `PROVENANCE.md` §3. |
| D3 | Long's-style hecatomb ("a hecatomb of sheep and oxen") is folded into a plain description ("an offering of a hundred sheep and oxen") rather than kept as a glossed loanword. | Book 1 only uses the term once and nothing later in the Book depends on the reader recognizing "hecatomb" as a fixed term again; a plain description meets the accessibility standard without adding a term that would need its own gloss. Revisit if a later Book needs "hecatomb" to recur as a fixed word. |
| D4 | Butler's paragraph-internal quotation convention (a speech's closing quotation mark omitted where the speech runs on into the next paragraph) is preserved exactly, not "corrected." | This is Butler's own printing convention for a continuous speech split by a paragraph break (source paragraphs 17→18 in Book 1), the same phenomenon the Meditations package noted for Casaubon's continuous first-person narration. Silently closing the quote would misrepresent the source's own punctuation. |

## Next

1. **Waiting on the coordinator: independent review of Book 1**
   (`book01/review-instructions.md`, `book01/review-packets/`, 11 packets).
   On findings: `book01/candidate-v2.json` via a change script in the
   established pattern, verification, flow read, `book01/ACCEPTANCE.md`.
2. Book 2 onward proceeds in numerical order once a coordinator says so;
   this task's brief scoped drafting to Book 1 only.
3. Book 10's disposition (redraft under this package vs. adopt/rework the
   pilot draft) needs a coordinator decision — see "Needs Anders" below.

## Needs Anders (listed, not waited on)

- **A1. Name-form policy for the whole Odyssey.** This package keeps
  Butler's Roman forms (Ulysses, Minerva, Jove...) per the task instruction
  to use the served original's own forms. The served `modern-en` being
  replaced used Greek forms (Odysseus, Athena, Zeus...) instead, and the
  Book 10 pilot independently made the same Greek-form choice. If Anders (or
  a later brief) actually wants the Greek forms across the Odyssey — which
  is arguably the more common convention in English Homer translations
  generally, even though it is not what Butler himself used — that is a
  cross-Book decision that should be made once, explicitly, before more
  Books are drafted, rather than discovered book by book.
- **A2. Book 10 pilot's disposition.** Adopt its draft as a starting point
  for a from-scratch independent review and a name-form pass under this
  package, or set it aside and redraft Book 10 fresh once its turn comes in
  numerical order. Either is workable; this task took no action on Book 10
  itself, per its brief (Book 1 only).

## Open, not blocking

- Book 1's B01-P017 (source index 16) has the lowest per-paragraph word
  ratio (0.858): Telemachus's speech about his father's disappearance,
  condensed from one very long Victorian sentence into clearer modern
  syntax without dropping any of its claims (the burial-mound counterfactual,
  the "no trace" image, the naming of the three suitor-supplying islands
  in the following paragraph). Flagged for the reviewer's attention as the
  Book's largest single condensation, not as a known defect.
- `source-texts/` (this package's directory for fetched public-domain source
  texts) is named differently from the Meditations package's `source/` for
  an environment reason specific to this task's sandbox (a bare directory
  segment named `source` was refused by a tool-safety check unrelated to
  content); no content difference is implied.
