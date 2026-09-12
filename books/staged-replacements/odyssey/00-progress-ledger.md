# The Odyssey modern-English — progress ledger

Branch `claude/odyssey-modern-en-20260911`. Content agent for the Odyssey
thread; the coordinator reads this file, Anders does not read the session.
Kept current at every push.

## Done

- 2026-09-11 — Read the process templates: Meditations package
  (`WORKFLOW.md`, `GLOSSARY.md`, `PROVENANCE.md`, `00-progress-ledger.md`,
  and `book5/` in full) on `claude/meditations-modern-en-20260911-v2`, and
  the Odyssey Book 10 pilot on `claude/wizardly-allen-ra9p0k`.
- 2026-09-11 — `WORKFLOW.md` written: eight steps adapted for prose epic
  (chapter = Book, paragraph-aligned), scope, naming policy, and voice rules.
- 2026-09-11 — Source verified against the actual Project Gutenberg text: the
  served `original-en` is Samuel Butler's 1900 public-domain prose
  translation, PG #1727, 24 chapters, 1,027 paragraphs, byte-identical Book 1
  opening, file ends exactly where PG's translation body ends. Registry
  attribution already correct. Evidence in `PROVENANCE.md` §1.
- 2026-09-11 — Served `modern-en` checked and recorded as the file being
  replaced (`PROVENANCE.md` §2); none of its wording is reused.
- 2026-09-11 — Odyssey Book 10 pilot's real status checked directly: a
  **frozen draft only**, never independently reviewed (`PROVENANCE.md` §3).
- 2026-09-11 — `GLOSSARY.md` written; Book 1 drafted and frozen at
  `candidate-v1.json` (32 paragraphs, 1:1, ratio 0.943), with readable copy,
  `continuity.md`, `provenance.json`, `manifest.json`, `README.md`,
  `review-instructions.md` and 11 review packets. Stopped for independent
  review.
- 2026-09-12 — **Round 1 of independent review came back** on
  `candidate-v1.json` (`book01/review/findings-v1.md`): *Accept after
  corrections* — 1 standing, 3 substantive, 33 minor, 5 optional, 5
  paragraphs with no material issue, coverage complete. The reviewer
  re-verified the source independently by its own reconstruction of PG lines
  376–740, built from PG's numbered footnote-entry list rather than from the
  build's rule: 32 of 32 paragraphs byte-identical, zero diffs.
- 2026-09-12 — **Book 1 accepted** (steps 6–8) at `candidate-v2.json`, sha256
  `f28a13264288079781a8c8c6cf044ae41d288847dc5d7f23378851a44ba7df45`.
  **All 41 findings applied; none declined.** 37 text corrections in 27
  paragraphs, 47 name substitutions, 22 apostrophes normalized; 29 of 32
  paragraphs differ from v1; ratio 0.9425 → 0.9462. Applied by
  `scripts/build_book01_v2.py`, which asserts v1's frozen hash and every
  glossary hazard before and after. `book01/changes-v1-to-v2.md`,
  `book01/ACCEPTANCE.md`, and the README's mechanical checks re-run verbatim
  (`OK — … all hazards held, ratio 0.9462`). Continuous flow read of the
  corrected book produced no further change.
- 2026-09-12 — **Standing finding S1 applied package-wide**: the naming
  decision is reversed to the Greek forms, written into `GLOSSARY.md` as a
  closed seven-row table with six enumerated hazards, plus `PUNCTUATION.md`
  (new) for the quotation/apostrophe standard. `WORKFLOW.md`,
  `PROVENANCE.md` §2–3, `book01/continuity.md` and
  `book01/review-instructions.md` updated to match. The frozen v1 artefacts
  and the review packets are **deliberately not regenerated**.
- 2026-09-12 — **Book 2 source re-verified independently** (step 1, re-done
  from scratch rather than inherited): `scripts/verify_source_book2.py`
  reconstructs Book 2 from raw PG #1727 by a rule devised for this Book and
  audited against the raw lines before being trusted, then diffs against the
  staged original — **35 of 35 paragraphs byte-identical, zero diffs, 4,184
  words compared word-for-word**. The rule uses the footnote-marker property
  **positionally**: the body holds exactly 187 digit runs and, read in order,
  they are 1…187, against 186 PG footnote entries numbered to 187 with only 29
  absent (Book III) — so the k-th run removed must *be* the k-th marker, and a
  stray body digit breaks the arithmetic instead of vanishing. Two audit
  catches recorded: `FOOTNOTES:` occurs twice in the file and anchoring on the
  first (the table of contents) would have made the relation vacuously true;
  and Book 2's markers are never preceded by a space, so the whitespace clause
  is a no-op here. Two negative controls prove the check can fail (35/35 differ
  if lines are joined with a space; 5/35 differ if markers are left in).
- 2026-09-12 — **Book 2 drafted and frozen** (steps 2–3):
  `book02/candidate-v1.json`, sha256
  `2b5a0280719312bbabb214f0bcbf400cde62541ab7e9c892ce2c2b65bb4273ea`,
  **35 paragraphs**, 1:1 with the source, word ratio **0.9993** (min 0.951 at
  B02-P005, max 1.059 at B02-P003). First Book drafted under the Greek-forms
  decision from the start: Odysseus 17, Athena 8, Zeus 6, Eurycleia 2, each
  matching the source's count exactly; `Ops` untouched. Butler's unclosed
  quotation preserved at B02-P006 → B02-P007 (D4), with the *inner* single
  quotation correctly closed. Zero ASCII quotes. One gloss (the Erinyes), one
  base-text decision (Butler's `[do not]` bracket — mark dropped, words kept),
  two flagged Butler spellings (`Ilius`, `Mycene`). `continuity.md`,
  `provenance.json`, `manifest.json`, `README.md` with passing mechanical
  checks, `review-instructions.md` and **12 review packets** (11×3 + 1×2)
  built by `scripts/build_book_package.py 2`. **Stopped for independent
  review** (step 4). Book 2 was not self-reviewed and Book 3 was not started.
- 2026-09-12 — `scripts/build_book_package.py` gained two things Book 2 needed:
  it maps the **candidate's chapter title** through the closed name table (the
  served `modern-en` does the same), and it **refuses to rebuild a frozen
  Book** without `--force` — Book 1 predates the title mapping and would have
  changed silently if rebuilt.

## Decided, and why

| # | Decision | Why |
|---|---|---|
| ~~D1~~ | ~~Keep Butler's own Roman name forms.~~ **REVERSED 2026-09-12 — see D5.** | Correct on the drafting brief ("use whatever the served original uses") and correctly applied in `candidate-v1.json` — the reviewer's name census found not one name moved off Butler's form. Overruled by the coordinator on product evidence, not translation evidence. Left on the record rather than deleted. |
| D2 | Odyssey Book 10 pilot is recorded as a frozen, unreviewed draft, not as "accepted" text ready to adopt. | Its own `README.md` and the branch's commit history say plainly that no independent review was run and no acceptance recorded. See `PROVENANCE.md` §3. |
| D3 | "Hecatomb" is folded into a plain description rather than kept as a glossed loanword — **and the description supplies no number.** | Book 1 uses the term once and nothing later depends on recognizing it again; a plain description meets the accessibility standard without adding a term that needs its own gloss. *(Amended 2026-09-12, optional finding 3.1: v1's "an offering of a hundred sheep and oxen" stated a quantity Butler declines to state, and by Homer's period *hecatomb* no longer meant a hundred of anything. Now "a great sacrifice of sheep and oxen". Later Books' hecatombs inherit this form.)* |
| D4 | Butler's paragraph-internal quotation convention (closing mark omitted where a speech runs on into the next paragraph) is preserved exactly, not "corrected." | It is Butler's own printing convention for one continuous speech split by a paragraph break (B01-P018 → B01-P019). Confirmed by the round-1 reviewer. Silently closing the quote would tell the reader the speaker stopped and started again. See `PUNCTUATION.md` §2. |
| **D5** | **The modern edition uses the Greek name forms** (Odysseus, Athena, Zeus, Poseidon, Hermes, Cronus, Artemis), applied by script from the **closed** table in `GLOSSARY.md`, with every hazard asserted by the build. Butler's forms stay in `original-en`. | Coordinator ruling at Book 1 round 1 (standing finding **S1**), answering **A1**. The evidence is the product's: `odyssey-threads.json` (the Cast beside the text) uses Odysseus 319 / Athena 21 / Zeus 24 / Poseidon 19 / Hermes 12, with every Roman form in it inside a `searchNames` alias array; the Book Onboarding uses Odysseus 21 times. A reader who meets "Odysseus" in the onboarding, taps a highlighted "Odysseus" in the Cast and then reads "Ulysses" has been handed two names for one man by the same product on the same screen. |
| **D6** | **The mapping table is closed and enumerated, never generated from a general Roman→Greek deity list, and is applied case-sensitively and word-bounded.** | The hazard that actually fires is **`Ops`** — Butler's name for Eurycleia's grandfather, a man, already Greek, and *also* the Roman name of Rhea. Any general list carries `Ops → Rhea` and would put a goddess into a genealogy. Case-insensitivity destroys the island `Same`. Six hazards enumerated in `GLOSSARY.md`; all six asserted by `scripts/build_book01_v2.py` before and after the pass. |
| **D7** | **Possessive of a name ending in -s: `Odysseus's`.** Decided once for every Book. | Matches the candidate's own `Telemachus's`, `Phemius's`, `Agamemnon's`, and is what an English reader says aloud. Butler's bare `Ulysses’` is not carried over. Asserted: three `Odysseus’s`, no bare `Odysseus’`. |
| **D8** | **Where the Cast (`odyssey-threads.json`) has a display name for a figure, the Cast's spelling wins.** Butler's *Euryclea* → **Eurycleia**. | It removes the last name on which the edition and the Cast disagreed, and the Cast keeps "Euryclea" as a `searchNames` alias so highlighting works either way. Deliberately narrow: the rule is *the Cast's display name*, not the drafter's judgement of what looks Greek enough. Other unusual Butler spellings are still flagged in `continuity.md`, not corrected. |
| **D9** | **Typographic quotation marks and apostrophes throughout; American spelling.** | `PUNCTUATION.md` §1 and `GLOSSARY.md`. v1 mixed curly doubles with ASCII apostrophes and recorded neither; the served `original-en` beside it in split-pane is typographic throughout. American spelling matches the served editions and the rest of the product. `draughts` stays — the game's name, not a spelling variant. |
| **D10** | **A frozen `candidate-vN.json`, its readable copy and its review packets are never regenerated after a later version supersedes them.** | They are the record of what a review round actually reviewed. Regenerating them would make the findings file quote text that no longer exists. Recorded in `book01/manifest.json` and `book01/continuity.md`; Book 1's v1 artefacts stay in Butler's Roman forms for exactly this reason. |
| **D11** | **A finding is answered either way, and an "optional" finding whose real subject is a rule for later Books is settled at the Book that raises it, not deferred.** | Applied at Book 1 to 3.1 (hecatomb, a rule for every later hecatomb) and 26.1 (the "in her heart" formula, which recurs through the poem). The alternative — carry it forward as a preference — means the same question is rediscovered at Book 6 with a rendering already in the file. All five of Book 1's optional findings were applied on this reading. |

## Next

1. **Waiting on the coordinator: independent review of Book 2**
   (`book02/review-instructions.md`, `book02/review-packets/`, 12 packets,
   coverage `B02-P001`…`B02-P035`). On findings: `book02/candidate-v2.json`
   via a change script in the established pattern, verification, flow read,
   `book02/ACCEPTANCE.md`. **Three things are put to the reviewer explicitly**
   and should not be left unruled: the `[do not]` bracket decision at
   B02-P004 (the package's first bracket of any kind, and whether it should
   become a recorded rule); the Erinyes gloss at B02-P008; and the
   "marriage gifts a beloved daughter deserves" formula carried over from
   accepted Book 1 with its objection deferred rather than answered — if it
   changes, it changes in both Books.
2. Book 3 onward proceeds in numerical order once a coordinator says so; this
   task's brief scoped drafting to Book 2 and forbade starting Book 3.
3. Book 10's disposition still needs a coordinator decision — see A2 below,
   now narrowed.

## Needs Anders (listed, not waited on)

- ~~**A1. Name-form policy for the whole Odyssey.**~~ **ANSWERED 2026-09-12
  by the coordinator: Greek forms.** Recorded as **D5**–**D8**, applied to
  Book 1 by script, and written into `GLOSSARY.md` so Books 2–24 inherit it.
  Kept here rather than deleted so the reversal is legible.
- **A2. Book 10 pilot's disposition — narrowed, still open.** Applying S1
  removed one of the two stated blockers: the pilot already uses the Greek
  forms, so it and this package now agree on names. What remains is that it
  has had **no independent review at all**, and that it predates this
  package's glossary rows, `PUNCTUATION.md` and continuity conventions.
  Either adopt its draft as the starting point for a from-scratch round 1
  under this package, or set it aside and redraft Book 10 fresh when its turn
  comes in numerical order. Both are workable; no action taken on Book 10.

## Open, not blocking

- **B01-P014's source crux is resolved on a stated reading, not settled by
  the source.** Butler prints `for he is not dead yet not on the mainland`,
  unpunctuated and ungrammatical (PG line 538, verified). The adversative
  reading is taken, because the next sentence draws an inference that follows
  from *not on the mainland* and not from *not yet*. A later reader who
  prefers the temporal reading has the argument to argue against, in
  `book01/continuity.md` "Unresolved source issues" item 1.
- **B01-P006's "an eye" → "the eye"** is the package's one deliberate
  resolution of a Victorian indefinite. Recorded at B01-P006 rather than
  silent. If a later Book turns up a second, decide whether this becomes a
  class or stays a one-off.
- **B01-P013's doubled "brought"** ("what kind of ship brought you, and how
  your crew brought you to Ithaca") is clumsy, not defective; the round-1
  reviewer considered a finding and declined. Asserted unchanged by the
  build so a later pass does not drift into it.
- `source-texts/` (this package's directory for fetched public-domain source
  texts) is named differently from the Meditations package's `source/` for
  an environment reason specific to the original task's sandbox; no content
  difference is implied.
