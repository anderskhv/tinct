# Modern-English Acceptance Procedure — Pilot Report (2026-09-21)

Top-level summary of this task. Sub-reports and staged artifacts are
linked throughout; this file is the entry point for reviewing the whole
piece of work.

## 1. Reconciliation and preserved work

- Merged `origin/main` (including PR #123 / commit `18976900`, "retire
  legacy translation-language instructions") into this branch. Clean
  merge, no conflicts — this branch had not touched any file PR #123
  changed. All prior translation-repair work (Wealth of Nations, and the
  earlier Leviathan/Don Quixote/Anna Karenina/Essays-Montaigne repairs)
  is preserved unchanged; merge commit `985acf3b`.
- Confirmed `983cda4e` ("Don Quixote: merge content-fidelity close-read
  fixes into live edition") is an ancestor of this branch's history — it
  was not overwritten; this branch is newer than and built on top of it.
- No app code, landing pages, registry, audio, or published edition files
  were changed by this task. Everything new is under `books/**`
  (procedure docs, prompts, and `books/wip/**` staged candidates/review
  artifacts).
- No paid model API calls were made. All drafting and review used Claude
  Agent-tool subagent sessions already available in this environment.

## 2. Procedure and prompts

- **Entry point:** `books/TRANSLATION_PROTOCOL.md` — rewritten from an
  11-line stub into the actual entry point, linking the three reusable
  prompts and stating the four-step (A-D) acceptance procedure.
- **Reusable prompts:** `books/prompts/modern-en-draft-prompt.md`,
  `books/prompts/accessibility-review-prompt.md`,
  `books/prompts/fidelity-review-prompt.md`.
- **`books/AGENTS.md`** — Modern English section rewritten to point at
  the protocol/prompts rather than duplicate rules that could drift out
  of sync; added an explicit **Acceptance Procedure** section; **QA
  Gates** section rewritten so the `classify-modern-en.py`
  similarity/length gate is documented as an inspection flag, not a
  blocking quality gate — it remains a trip-wire specifically for the
  2026-05 mechanical-modernization failure class (539 chapters that were
  never actually rewritten), but a chapter reading close to the source is
  no longer treated as a defect on its own, and the acceptance procedure
  (not the score) is what makes a chapter "done."
- **`books/CLAUDE.md`** — trimmed its duplicate Translation Rules section
  to a short pointer at `AGENTS.md`/`TRANSLATION_PROTOCOL.md` so the two
  files can't drift into contradiction again; updated its book-flow step
  5b to match the new non-blocking framing.
- The old "paragraph should normally remain at least 75% of source word
  count" language is gone from both files' operative rules — reframed
  everywhere as "a signal to go inspect the paragraph, never a rewrite
  target."

## 3. Pilot A — Leviathan, edition ch18 (Hobbes ch17)

Full report: `books/wip/leviathan-pilot-ch18/PILOT-REPORT.md`.

Two independent full-chapter drafts (Sonnet, Opus — same prompt, same
locked source, no cross-visibility), anonymized A/B, taken through the
full accessibility → fidelity → cross-boundary review procedure by four
independent reviewer sessions. Both models available in this environment;
both arms completed — no fabricated or missing comparison.

**Headline result:** both candidates are fidelity-clean (ACCEPT AS-IS,
only minor non-blocking notes each). Accessibility-wise, both need
targeted fixes, but of different kinds: Sonnet's issues are local dense
sentences plus one real ambiguous-pronoun bug; Opus's worst issue is
structural — it left the chapter's two central quoted formulas (the
social-contract oath, the formal definition of a commonwealth) completely
unmodernized, which the blind accessibility reviewer independently named
the single most disruptive passage in the chapter. See the pilot report
for the full comparison table and the Sonnet-vs-Opus recommendation.

Neither candidate has been published or merged. Both remain staged in
`books/wip/leviathan-pilot-ch18/`.

## 4. Pilot B — Brothers Karamazov verse review

Full report: `books/wip/brothers-karamazov-verse-review/PILOT-REPORT.md`.
Inventory: `inventory.md`. Correction ledger with exact before/after and
rationale: `correction-ledger.md`. Staged JSON: `staged-corrections.json`.

Verified Codex's finding: the ch. 33 (P11/P12, Smerdyakov's song and the
dialogue commenting on it) and ch. 36 (P1, Grand Inquisitor epigraph)
defects **do still remain** in the live edition. Reviewed the song and
its commenting dialogue together, since the dialogue is commentary on the
song. Staged faithful corrections for all three paragraphs (not applied —
Brothers Karamazov is published; this task's scope is staged
candidates/review artifacts only).

Manually built and verified a full inventory of every genuine verse/song
passage in the book (five found; three defective/corrected, one flagged
but not corrected — ch. 16's Schiller "Ode to Joy" quotation, completely
unmodernized — one clean).

## 5. Correction ledger (all books touched this task)

See `books/wip/brothers-karamazov-verse-review/correction-ledger.md` for
the full ledger (source / before / after / rationale) for all three
staged Karamazov fixes. Leviathan pilot notes (non-blocking, not yet
applied to any file since nothing is being published) are in each
fidelity review file under `books/wip/leviathan-pilot-ch18/`.

## 6. Sonnet vs. Opus recommendation (summary)

See §3 above and the full pilot report for detail. Short version: roughly
tied on fidelity; Sonnet needed less correction to reach a genuinely
accessible result under the current prompt. Opus's one real miss (leaving
in-text performative/definitional quotations fully archaic) looks like a
prompt-instruction gap more than a model-capability gap — recommend
clarifying the draft prompt on this point before running a full-batch
comparison, rather than concluding either model is categorically weaker
for dense philosophical material from a single chapter.

## 7. Remaining issues requiring judgment

1. **Quoted in-text formulas/definitions.** The draft prompt doesn't
   explicitly say whether a directly-quoted performative formula or
   definition that is part of the author's own argument (not an external
   citation) should be modernized like the rest of the prose, or
   preserved verbatim as a "quotation." This pilot surfaced a real
   disagreement between the two models on exactly this point. Recommend
   Anders confirm the intended rule (this report's default assumption,
   used to judge the pilot, was: modernize it like everything else,
   since it's the author's own words, not an external document being
   quoted) before it's written into the prompt file.
2. **Chapter 16 Schiller quotation (Brothers Karamazov).** Flagged, not
   drafted — see Pilot B report for why, and the recommended next-batch
   scope.
3. **Leviathan pilot's minor fidelity/accessibility notes** (both
   candidates) have not been applied anywhere — they're documented in
   the review files for whoever runs the next batch or decides to
   publish this specific chapter.
4. **Which candidate (if either) to actually publish for Leviathan ch18**
   is Anders's call, not decided here — this task's brief was explicitly
   to stop at the decision point, not to publish.

## 8. Recommended next bounded batch

Two independent, small, well-scoped options — either is appropriately
sized as "next," neither requires touching a whole book:

- **Leviathan ch18 finalization:** apply the non-blocking fixes from
  whichever candidate is chosen (or merge the best of both — e.g.
  Sonnet's quote-modernization instinct with Opus's cleaner prose in
  paragraphs 0/3/15), regenerate the fidelity review against the final
  file, and pin acceptance to that file's hash (step D). Small, since
  the fixes needed are already fully enumerated.
- **Brothers Karamazov ch16, P41/43/45 (Schiller quotation):** draft and
  review a modernized rendering of the one flagged verse passage, through
  the full acceptance procedure. Small, self-contained, well-scoped.

**Explicitly not recommended as automatic work:** a full-book pass on
Leviathan, Brothers Karamazov, Don Quixote, or any other book. Per this
task's brief, **Confessions and War and Peace remain "existing repairs to
verify against updated criteria,"** not retranslation jobs — nothing in
this task touched either book, and nothing here should be read as
authorizing that. Verifying them against the reconciled acceptance
procedure (a light audit against the new gate framing and reviewer
process, not a rewrite) is itself a reasonable candidate for a future
bounded task, separate from the two above.

## 9. What this task did not do (by design)

- Did not publish any pilot candidate or Karamazov correction to a live
  edition file.
- Did not launch a full-book accessibility pass on any book.
- Did not touch app code, the registry, landing pages, or audio.
- Did not call a paid model API.
- Did not retranslate Confessions or War and Peace, or treat them as
  queued work.
