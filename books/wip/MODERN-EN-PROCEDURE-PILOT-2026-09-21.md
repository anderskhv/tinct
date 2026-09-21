# Modern-English Acceptance Procedure — Pilot Report (2026-09-21, closed out)

Top-level summary. This supersedes the earlier version of this file from
the same date — that version left the quotation rule and both pilots open;
this one records how they closed. Sub-reports and staged artifacts are
linked throughout.

## 1. Reconciliation and preserved work

- Merged `origin/main` (PR #123 / commit `18976900`, "retire legacy
  translation-language instructions") into this branch. Clean merge, no
  conflicts. All prior translation-repair work (Wealth of Nations,
  Leviathan/Don Quixote/Anna Karenina/Essays-Montaigne repairs) preserved
  unchanged; merge commit `985acf3b`.
- Confirmed `983cda4e` ("Don Quixote: merge content-fidelity close-read
  fixes into live edition") is an ancestor of this branch — not
  overwritten.
- No app code, landing pages, registry, audio, or published edition files
  changed by this task. Everything new is under `books/**` (procedure
  docs, prompts, `books/wip/**` staged candidates/review artifacts).
- No paid model API calls made. All drafting and review used Claude
  Agent-tool subagent sessions available in this environment.

## 2. Procedure and prompts — including the resolved quotation rule

- **Entry point:** `books/TRANSLATION_PROTOCOL.md`.
- **Reusable prompts:** `books/prompts/modern-en-draft-prompt.md`,
  `books/prompts/accessibility-review-prompt.md`,
  `books/prompts/fidelity-review-prompt.md`.
- **Quotation rule resolved and written into all of the above**:
  quoted speech, verse, and formulas are modernized the same as
  surrounding prose — quotation marks are not an exemption. When the
  source's own discussion is about the exact wording (characters
  comparing two near-identical lines), the distinction that discussion
  depends on must be preserved. This only licenses working from the
  chapter's own locked source quotation — never substituting wording from
  another translation or a modern copyrighted edition. Added as a
  dedicated section in the draft prompt, a new fidelity-review checklist
  item ("unmodernized quotations"), and an accessibility-review
  instruction not to give quoted passages a pass.
- **`books/AGENTS.md`** — Modern English + QA Gates sections rewritten:
  the `classify-modern-en.py` similarity/length gate is an inspection
  flag, not a blocking quality gate. A chapter's completeness is decided
  by the acceptance procedure (accessibility review blind to source →
  packet-based fidelity review → whole-chapter cross-boundary re-read →
  verify-and-pin to the final file's hash), not by the similarity score.
- **`books/CLAUDE.md`** — trimmed to a pointer at `AGENTS.md`/
  `TRANSLATION_PROTOCOL.md` to prevent future drift.

## 3. Pilot A — Leviathan, edition ch18 (Hobbes ch17) — CLOSED

Full report: `books/wip/leviathan-pilot-ch18/PILOT-REPORT.md`.

**A final candidate was selected, verified, and hashed** — this went
through three full rounds of fix-then-reverify, not a single pass:

- Round 1: Sonnet and Opus drafted independently (no cross-visibility),
  both reviewed blind (accessibility) and independently (fidelity, full
  packet coverage + whole-chapter re-read). Both fidelity-clean;
  Sonnet's accessibility issues were local dense sentences + one
  ambiguous-pronoun bug; Opus's worst issue was leaving the chapter's two
  central quoted formulas completely archaic (the exact failure the new
  quotation rule targets).
- Round 2: targeted fixes applied to both candidates per their own
  review findings; a fresh blind reviewer and a targeted fidelity
  re-check of just the changed passages caught real regressions the
  round-2 edits themselves introduced (a broken parenthesis, two
  terminology-consistency breaks — "in awe," "pretext").
- Round 3: regressions fixed; remaining flagged items closed (unglossed
  technical/Latin terms in both candidates, one tangled sentence in the
  selected candidate, a capitalization inconsistency in the other). Final
  targeted fidelity checks: **ACCEPT AS-IS** on every changed passage in
  the selected candidate.
- **Selected: candidate A/X (Sonnet-drafted).** Final file:
  `books/wip/leviathan-pilot-ch18/leviathan-ch18-final.json`,
  `sha256: 89546ca2c949cf64104c518ff4e1bf8dc959ecb94f59b672c14ee641ed4d610f`
  (source hash: `571be86f55a1050d4cbd3b8466f7752e1030a5b77c32656a254c112f11c5ec57`).
  Selection was made on the accumulated evidence (which candidate needed
  less/cheaper work to reach a fully clean state), not the model name —
  see the pilot report's "Why X over Y" section.
- **Not fully finished:** candidate B/Y (Opus) was left with two known
  tangled sentences and one archaic-verb-sense risk, unfixed, once X was
  selected and further iteration on Y was stopped per this task's "do not
  keep iterating for stylistic preference alone" instruction. This is
  recorded as an open item, not hidden.

Full review coverage table (12 review files across 3 rounds, each
stating exact paragraph coverage) is in the pilot report.

## 4. Pilot B — Brothers Karamazov verse review — CLOSED

Full report: `books/wip/brothers-karamazov-verse-review/PILOT-REPORT.md`.
Inventory: `inventory.md`. Ledger: `correction-ledger.md`. Staged JSON:
`staged-corrections.json`. Independent review: `independent-review.md`.

**All six flagged/inventoried paragraphs are now staged, corrected, and
independently reviewed — ACCEPT AS-IS on every one:**

- ch. 33 P11/P12 (Smerdyakov's song + the dialogue commenting on its
  exact wording, reviewed together): rhyme-driven "treasure/leisure" and
  invented "and gay" replaced; the source's "wealth/health" rhyme and the
  specific dear-one/darling distinction the dialogue depends on are both
  restored.
- ch. 36 P1 (Grand Inquisitor epigraph): "doth say" → "says," matching
  how the identical phrase is already handled in the very next paragraph.
- ch. 16 P41/P43/P45 (Schiller "Ode to Joy" quotation, previously
  flagged as completely unmodernized — this is new work completed in
  this session, not left over from before): "fostereth" → "fosters,"
  "'Tis at her beck...hath turned" → "At her bidding...has turned,"
  "cling for ever" → "cling forever." "The foaming must" was deliberately
  left unchanged — a documented judgment call (it rhymes with "lust" two
  lines later; modernizing it would destroy a deliberate existing rhyme
  for a word that's odd, not actually unclear, in context) — independent
  review agreed while flagging it as worth a second look in any future
  *full* re-rendering of that stanza's denser phrasing (out of scope for
  this targeted pass).

**No verse passage inventoried in this book has an unresolved defect.**
Nothing applied to the published edition file — all corrections remain
staged for Anders to apply.

## 5. Correction ledger

Full ledger (source / before / after / rationale) for all Karamazov
fixes: `books/wip/brothers-karamazov-verse-review/correction-ledger.md`.
Leviathan's fix history (every round's exact changes, with source vs.
candidate wording) is spread across its numbered review files under
`books/wip/leviathan-pilot-ch18/`, summarized in that pilot's
`PILOT-REPORT.md`.

## 6. Sonnet vs. Opus recommendation

Both models produced fidelity-clean drafts across every round; neither
had a blocking fidelity defect at any point. The meaningful difference
was accessibility execution style (Sonnet: local sentence-level tangles;
Opus: one drafting-policy gap on quoted formulas, now closed project-wide
by the resolved quotation rule). **No durable per-model ranking is
established by this one-chapter pilot.** Recommendation: use **Sonnet as
the economical drafting baseline** for the next batch (matching the
model policy below), with Opus available for independent fidelity review
or a second opinion on unusually dense passages — not because Opus
drafted worse, but because Sonnet's gaps this round were cheaper to
close and the model policy calls for an economical default absent
stronger evidence either way.

## 7. Model policy used in this pilot

- **Sonnet**: economical drafting baseline (used for both Leviathan
  draft candidates in round 1, and for all revision rounds on the
  selected candidate).
- **Fresh session, candidate-only**: performed every accessibility
  review (never shown source or the other candidate).
- **Independent fidelity review, source-based**: performed by separate
  sessions with access to the locked source but not the drafter's notes
  or the accessibility review.
- Exact settings and an honest caveat about what can/can't be
  independently re-verified about which model served each background
  subagent: `books/wip/leviathan-pilot-ch18/model-settings.md`.
- No paid API calls made anywhere in this task.

## 8. Remaining issues requiring judgment

1. **Candidate B/Y (Opus) for Leviathan ch18 was not carried to a fully
   clean state** — two tangled sentences and one archaic-verb-sense risk
   remain, since iteration stopped once candidate A/X was selected. If
   Anders wants a second fully-finished candidate for future comparison,
   that's additional bounded work.
2. **Publishing `leviathan-ch18-final.json`** to the live edition is
   Anders's call — not done here, per this task's scope.
3. **Applying the six staged Karamazov corrections** to the published
   edition is Anders's call — not done here.
4. **Chapter 16's Schiller stanza (Karamazov)** has a narrow, targeted
   fix only; a full re-rendering of its denser non-archaic phrasing
   (including revisiting "must"/"lust") is optional future work, not a
   defect in what's staged.

## 9. Recommended next small Leviathan batch — chosen to test different difficulties

This pilot's chapter (edition ch18) was dense political-philosophy prose
with **no verse** and its hardest case was two in-text performative
quotations (the author's own words). To stress-test the procedure and the
new quotation rule against a genuinely different failure surface, and to
keep the batch small and bounded:

- **Primary recommendation — edition chapter 40, "Of the Signification in
  Scripture of the Word Church"** (Hobbes's own ch. 39; 5 paragraphs, 942
  words). Short, self-contained, and heavy with direct Bible quotation —
  this is the first real test of the quotation rule against *external*
  scripture citation rather than the author's own formula, plus Hobbes's
  own close argument about how one Greek/English word should be
  translated (a genuine case of "the source's discussion is itself about
  the exact wording," which the new rule specifically addresses). Small
  enough to run start-to-finish in one sitting.
- **Secondary/alternative — edition chapter 24, "Of the Publique
  Ministers of Soveraign Power"** (Hobbes's own ch. 23; 13 paragraphs,
  1701 words). Plain civic/descriptive prose (ambassadors, tax
  collectors, judges) rather than abstract argument — tests whether the
  procedure holds up on more concrete, example-driven material, a
  different register from both this pilot's chapter and the
  scripture-heavy option above.

**Explicitly not recommended:** a full-book pass on Leviathan, Brothers
Karamazov, Don Quixote, or any other title. **Confessions and War and
Peace remain "existing repairs to verify against updated criteria"** —
untouched by this task, not queued as retranslation work.

## 10. What this task did not do (by design)

- Did not publish any pilot candidate or Karamazov correction to a live
  edition file.
- Did not regenerate audio.
- Did not launch a full-book accessibility pass on any book.
- Did not touch app code, the registry, or landing-page code.
- Did not call a paid model API.
- Did not retranslate Confessions or War and Peace, or treat them as
  queued work.
