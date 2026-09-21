# Leviathan Pilot A — Final Report

**Chapter:** edition chapter 18 / Hobbes's own Chapter 17, "Of the Causes,
Generation, and Definition of a Commonwealth." Identity confirmed by title
and opening text match before drafting began (Codex's cited opening, "The
final cause, end, or design of men…," a ~113-word single sentence, was
confirmed present in the live edition before this pilot started).

**De-anonymized mapping** (reviewers never saw this): candidate-A/X =
Sonnet draft, candidate-B/Y = Opus draft. Exact settings and an honest
caveat about what can/can't be independently re-verified about which
model actually served each background subagent: `model-settings.md`.

## Final selection

**Selected: candidate-A / candidate-X (Sonnet-drafted), final file
`leviathan-ch18-final.json`.**

```
sha256sum leviathan-ch18-final.json
89546ca2c949cf64104c518ff4e1bf8dc959ecb94f59b672c14ee641ed4d610f  leviathan-ch18-final.json

sha256sum source.json
571be86f55a1050d4cbd3b8466f7752e1030a5b77c32656a254c112f11c5ec57  source.json
```

This is the version reviewed and accepted in the last round below
(`fidelity-review-X-final.md`, ACCEPT AS-IS). Both `candidate-A.json` and
its later revisions (`candidate-A-revised.json`, `candidate-X.json`) are
kept in this directory for audit trail; `leviathan-ch18-final.json` is
the authoritative final artifact and is byte-identical to `candidate-X.json`
at this hash.

Selection was made on the evidence, not the model name: both candidates'
fidelity was clean throughout (ACCEPT AS-IS at every round, on both), and
Sonnet's candidate needed a smaller, more local set of fixes to close its
accessibility gaps than Opus's did (see "Why X over Y" below). This is not
a claim that Sonnet is categorically the stronger model — see the
Sonnet-vs-Opus section.

## Process (multiple rounds — this is not a single draft-and-ship)

1. **Round 0 — independent drafting.** Sonnet and Opus each given the
   identical revised drafting prompt and identical locked source, no
   cross-visibility. Anonymized A/B for review.
2. **Round 1 — full accessibility + fidelity review of both, blind/
   independent.** Accessibility reviewer blind to source; fidelity
   reviewer working the source in packets with context, then a
   whole-chapter re-read. Both candidates: ACCEPT AS-IS on fidelity,
   "needs targeted fixes" on accessibility, for different reasons (see
   table below).
3. **Round 2 — targeted fixes for both candidates**, closing the
   accessibility problems each review actually found: dense
   stacked-conditional sentences and one ambiguous-pronoun bug in A;
   modernizing the two previously-archaic quoted formulas in B (per the
   newly-resolved quotation rule), plus its other flagged spots.
   Re-anonymized as X/Y for a fresh blind reviewer.
4. **Round 2 verification — fresh blind accessibility review of X/Y +
   independent fidelity re-check of the changed passages only** (not a
   full re-review of unchanged paragraphs, which had already passed).
   This caught real regressions the round-2 edit itself introduced: a
   broken parenthesis in Y, and two terminology-consistency breaks in
   both candidates ("in awe" changed inconsistently in A; "in awe" and
   "pretext" changed inconsistently in Y).
5. **Round 3 — fix the regressions**, plus close Y's remaining flagged
   items (redundant CIVITAS gloss, inconsistent capitalization,
   unglossed "plurality of voices" and "have made themselves every one
   the author of" syntax) and X's remaining flagged items (unglossed
   "political creatures," "plurality of voices," "CIVITAS," one tangled
   sentence in ¶12).
6. **Round 3 verification — targeted fidelity re-checks of exactly what
   changed** in this round, for both candidates. Caught one more
   regression in Y (paragraph 14 left "Person" capitalized after 12-13
   were lowercased) — fixed. X's round-3 changes: ACCEPT AS-IS, no
   defects.
7. **Final selection made on the accumulated evidence** — see below.
   No further rounds run once both accessibility and fidelity read
   clean on the selected candidate. (Y was not carried to a final
   verified state past round 3, since it was not selected; the round-3
   fixes.md file left it defect-free but its previously-flagged
   somewhat-tangled sentences in ¶1/¶4 were never independently
   re-verified against a subsequent fix, since none was made after X
   was chosen as the stronger base — see "Why X over Y.")

## Why X over Y

Final blind accessibility review of both fully-revised candidates
(`accessibility-review-final.md`) found both still needed some fixing at
that point, for different reasons:

- **X (Sonnet)**: three unglossed terms ("political creatures,"
  "plurality of voices," "CIVITAS" in ¶5/¶12) and one long, structurally
  confusing sentence in ¶12 — all fixed in round 3, verified clean.
- **Y (Opus)**: two genuinely tangled sentences (¶1: subject/verb pulled
  apart by nested em-dash interruptions; ¶4: a cleft sentence plus a
  doubly-embedded relative clause with dropped pronouns) and one archaic
  verb sense that can flip meaning on a fast read ("check the actions,"
  ¶10) — **not fixed**, since X was selected first and carrying both
  candidates through an unbounded number of further rounds would violate
  this task's explicit "do not keep iterating for stylistic preference
  alone" instruction.

The reviewer's own judgment, unprompted: "X reads slightly more
accessible overall — its failure mode (missing glosses, a soft stumble a
reader can read past) is less disruptive than Y's (tangled syntax, a
harder stumble that forces re-reading)." X's remaining gaps were also
cheaper and lower-risk to close (three short glosses, one sentence split)
than Y's would have been (two sentences needing real restructuring). That
tie-breaker, not the model's name, decided the selection.

## Review coverage (exact)

| Round | What | File |
|---|---|---|
| 1 | Accessibility, candidate A, blind, all 16 paragraphs | `accessibility-review-A.md` |
| 1 | Accessibility, candidate B, blind, all 16 paragraphs | `accessibility-review-B.md` |
| 1 | Fidelity, candidate A, packets covering all 16 paragraphs + whole-chapter re-read | `fidelity-review-A.md` (ACCEPT AS-IS) |
| 1 | Fidelity, candidate B, packets covering all 16 paragraphs + whole-chapter re-read | `fidelity-review-B.md` (ACCEPT AS-IS) |
| 2 | Accessibility, candidate X (=A round-2), blind, all 16 paragraphs | `accessibility-review-X.md` |
| 2 | Accessibility, candidate Y (=B round-2), blind, all 16 paragraphs | `accessibility-review-Y.md` |
| 2 | Fidelity, candidate A round-2 delta (¶1,3,4,5,10,12) + context | `fidelity-review-A-revised.md` (ACCEPT WITH FIXES REQUIRED → fixed) |
| 2 | Fidelity, candidate B round-2 delta (¶0,1,5,12,13) + context | `fidelity-review-B-revised.md` (ACCEPT WITH FIXES REQUIRED → fixed) |
| 3 | Accessibility, final blind pass, both X and Y, all 16 paragraphs each | `accessibility-review-final.md` |
| 3 | Fidelity, candidate B round-3 delta (¶0,1,5,12,13, cross-checked against ¶3,11,14) | `fidelity-review-B-final.md` (ACCEPT WITH FIXES REQUIRED → fixed) |
| 3 | Fidelity, candidate X round-3 delta (¶5, ¶12) | `fidelity-review-X-final.md` (ACCEPT AS-IS) |

Every fidelity reviewer stated exact coverage in their own file (packet
ranges, which paragraphs were treated as new vs. context-only). No
reviewer sampled a full chapter without saying so.

## Full results table (round 1, as first drafted)

| | Candidate A (Sonnet) | Candidate B (Opus) |
|---|---|---|
| Accessibility verdict | Needs targeted fixes | Needs targeted fixes |
| Fidelity verdict | ACCEPT AS-IS | ACCEPT AS-IS |
| Worst accessibility issue | ¶12: genuine ambiguous-pronoun parse failure ("he has conferred on him"); unglossed "bear their person" idiom repeated in ¶12 &14 | ¶12-13: the two central performative/definitional quotations left **completely unmodernized**, 1651 spelling and thee/thou syntax dropped into otherwise modern prose at the chapter's doctrinal climax — reviewer: "the single most disruptive passage," "some may give up mid-sentence" |

(Full round-1 table with all notes preserved below for the record — see
"Round 1 detail.")

## Sonnet vs. Opus for dense philosophical drafting

On this one chapter, **fidelity was a wash throughout every round** —
neither model ever produced a blocking fidelity defect; every regression
introduced across rounds 2-3 was a self-inflicted editing mistake made
*during revision*, not a drafting-stage error by either model. The
meaningful difference was in the initial accessibility execution:

- Sonnet's round-1 failures were local, sentence-level tangles (dense
  stacked conditionals, one genuine ambiguous-pronoun bug, an unglossed
  idiom) — fixable without touching drafting strategy.
- Opus's round-1 failures included one strategic drafting-policy gap
  (leaving the two central quoted formulas completely archaic) that the
  blind accessibility reviewer independently named the single most
  disruptive passage in the chapter — now resolved project-wide by the
  quotation-modernization rule added to the draft prompt, so it should
  not recur in future batches from either model.

With that prompt fix in place, **there is no durable evidence from this
one-chapter pilot that one model is categorically stronger for dense
philosophical material.** Both produced fidelity-clean drafts; both
needed a comparable number of total fix-rounds to reach a clean state
(X finished at round 3 and was selected; Y was still carrying two
tangled sentences at the point X was chosen and iteration stopped).

**Recommendation, given the evidence:** default to **Sonnet** as the
economical drafting baseline for the next batch (per this task's model
policy), and treat Opus as available for a second opinion or for
passages a reviewer flags as unusually dense — not because this pilot
proved Opus weaker, but because Sonnet's failure mode this round was
cheaper to close and the model-policy explicitly calls for an economical
baseline absent stronger evidence either way.

## Unresolved issues

1. **Candidate Y (Opus) was not carried to a fully clean state.** Its
   two tangled sentences (¶1, ¶4) and one archaic-verb-sense risk (¶10,
   "check the actions") remain unfixed, since X was selected first and
   further work on Y was stopped per the "do not keep iterating" rule.
   If Anders wants a second fully-finished candidate for comparison, that
   is additional bounded work, not something this pilot silently skipped.
2. **The non-blocking fidelity connotation notes from round 1** on the
   *unchanged* portions of candidate A (e.g., none remain — "art"→
   "cunning" and the dropped "perhaps" hedge from round 1 were both
   folded into the round-2 fix pass) are resolved; no open fidelity notes
   remain on the selected final candidate.
3. **This chapter has no verse**, so it does not exercise the
   verse/rhyme half of the drafting prompt — the next batch recommendation
   below is chosen partly to cover that gap.

## Status

`leviathan-ch18-final.json` (hash above) is the final staged candidate.
**Nothing has been published** — this file has not been copied into
`app/public/data/editions/leviathan-modern-en.json` or any other live
edition file, per this task's scope. Publishing it is a decision for
Anders.

---

### Round 1 detail (preserved for the record)

| | Candidate A (Sonnet) | Candidate B (Opus) |
|---|---|---|
| Other accessibility notes | Dense stacked-conditional sentences in ¶1, ¶3, ¶4; "injury" vs. "damage" technical-sense ambiguity in ¶10 | "in awe" risks a wonder/admiration misread in ¶0; "pretext" injects unintended tone in ¶1; unglossed "political creatures"/Aristotle reference in ¶5; unglossed "CIVITAS" |
| Fidelity notes (all non-blocking) | "art"→"cunning" adds an unintended craftiness connotation (¶1); dropped hedge "perhaps"→"well" (¶5) | Inserted rhetorical question not in source (¶0, harmless but unlicensed); "eminent"→"sets him above them" is an interpretive gloss beyond the source word (¶7); "plurality of voices"→"majority of voices" swaps Hobbes's own technical term for a modern one with a different technical meaning (¶12); softened "not only/but also" parallel (¶3) |
| Strength | — | Where restructured, syntax generally reads cleanly (paragraph 0, 3, 15 praised) |

All of the above were addressed in round 2/3 fixes to the selected
candidate (A/X); the equivalent items in B/Y were also addressed except
where noted in "Unresolved issues."
