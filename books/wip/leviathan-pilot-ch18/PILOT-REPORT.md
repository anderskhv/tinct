# Leviathan Pilot A — Report & Recommendation

**Chapter:** edition chapter 18 / Hobbes's own Chapter 17, "Of the Causes,
Generation, and Definition of a Commonwealth." Identity confirmed by title
and opening text match before drafting began (see main session log —
Codex's cited opening, "The final cause, end, or design of men…," a
~113-word single sentence, was confirmed present in the live edition).

**De-anonymized mapping** (reviewers never saw this): candidate-A = Sonnet
draft, candidate-B = Opus draft. Exact settings and an honest caveat about
what can/can't be independently re-verified about which model actually
served each background subagent: `model-settings.md`.

## Process followed

1. Both models given the identical revised drafting prompt
   (`books/prompts/modern-en-draft-prompt.md`) and the identical locked
   source (`source.json`), with no visibility into each other's output.
2. Candidates anonymized as A/B for review.
3. Step A (accessibility, blind to source) run independently for both.
4. Step B (fidelity, packet-based against source) run independently for
   both, by reviewers with no access to the accessibility reviews, the
   drafters' notes, or each other's candidate.
5. Step C (whole-chapter cross-boundary re-read) included in both fidelity
   reviews per the prompt.
6. Step D (verify in final file, pin to hash): see "Status" below — this
   pilot stops before step D's publish action, per this task's scope
   (no publishing yet), but the file hashes as reviewed are recorded here.

## Results

| | Candidate A (Sonnet) | Candidate B (Opus) |
|---|---|---|
| Accessibility verdict | Needs targeted fixes | Needs targeted fixes |
| Fidelity verdict | ACCEPT AS-IS | ACCEPT AS-IS |
| Worst accessibility issue | ¶12: genuine ambiguous-pronoun parse failure ("he has conferred on him"); unglossed "bear their person" idiom repeated in ¶12 &14 | ¶12-13: the two central performative/definitional quotations left **completely unmodernized**, 1651 spelling and thee/thou syntax dropped into otherwise modern prose at the chapter's doctrinal climax — reviewer: "the single most disruptive passage," "some may give up mid-sentence" |
| Other accessibility notes | Dense stacked-conditional sentences in ¶1, ¶3, ¶4; "injury" vs. "damage" technical-sense ambiguity in ¶10 | "in awe" risks a wonder/admiration misread in ¶0; "pretext" injects unintended tone in ¶1; unglossed "political creatures"/Aristotle reference in ¶5; unglossed "CIVITAS" |
| Fidelity notes (all non-blocking) | "art"→"cunning" adds an unintended craftiness connotation (¶1); dropped hedge "perhaps"→"well" (¶5) | Inserted rhetorical question not in source (¶0, harmless but unlicensed); "eminent"→"sets him above them" is an interpretive gloss beyond the source word (¶7); "plurality of voices"→"majority of voices" swaps Hobbes's own technical term for a modern one with a different technical meaning, flagged as worth a deliberate decision (¶12); softened "not only/but also" parallel (¶3) |
| Strength | The two quoted set-pieces (¶12 contract formula, ¶13 definition) were modernized along with everything else — no archaic island in the prose | Where restructured, syntax generally reads cleanly (paragraph 0, 3, 15 praised); the two quoted set-pieces are preserved **exactly** character-for-character where kept archaic — a legitimate approach for a different editorial policy, just not one that matches the "genuinely accessible" target here |

Both candidates: zero blocking fidelity defects, all 16 paragraphs
present/in-order, no actor swaps, no dropped/flipped negation, no
causality reversal, no lost hedges/conditions beyond the two minor notes
each above, no invented factual content, no silent "correction" of a name
or citation. This chapter has no verse.

## Recommendation: Sonnet vs. Opus for dense philosophical drafting

On this one chapter, **fidelity was a wash** — both models produced a
faithful, ACCEPT-AS-IS rendering with only minor, non-blocking connotation
notes. The difference that matters is accessibility execution, and it
splits along different failure types rather than one model being simply
"better":

- **Sonnet's failures were local, sentence-level tangles** (dense
  stacked conditionals, one genuine but narrow ambiguous-pronoun bug, an
  unglossed idiom) — the kind of thing a targeted revision pass fixes
  without touching drafting strategy.
- **Opus's worst failure was a strategic drafting choice** — leaving the
  chapter's two most important sentences (the social-contract oath and
  the formal definition of a commonwealth) completely unmodernized,
  right at the point where a general reader most needs clarity. This
  wasn't a minor gap; the blind accessibility reviewer independently
  named it the single most disruptive passage in the chapter, unprompted
  by any hint that this was the area to scrutinize.

That specific failure is fixable by *instruction*, not by picking a
different model: the current draft prompt does not explicitly address how
to handle a directly-quoted performative formula that is part of the
author's own argument (as opposed to an external citation the author is
quoting, e.g. scripture). Opus appears to have defaulted to "preserve a
verbatim quotation exactly," which is a defensible instinct in the
abstract but wrong for this book's stated target. **Action taken:**
recorded as an open issue below rather than silently patched into the
prompt file, since this is exactly the kind of instruction change that
should be visible to the next reviewer, not buried in an edit.

**Recommendation:** treat this as roughly tied on a one-chapter sample —
too small to declare a durable per-model preference — but note that
Sonnet needed less structural correction to reach a genuinely accessible
result under the current prompt, while Opus needed one explicit
instruction clarification (verbatim quotations of the author's own
formulas/definitions get modernized like everything else) to reach parity.
With that clarification added to the prompt, there is no evidence here
that one model is categorically stronger than the other for dense
philosophical material; both are usable. If forced to pick a single model
to run the next batch without a second opinion, prefer **Sonnet**, since
its errors this round were all easier categories to catch and fix in
review (dense sentences, one pronoun bug) than Opus's category (an entire
drafting-policy gap that a reviewer has to notice is missing, not just
mis-executed).

## Status

Nothing here has been published. `candidate-A.json`/`candidate-B.json`
(and their de-anonymized originals `candidate-sonnet.json`/
`candidate-opus.json`) are staged candidates only. Neither has had its
non-blocking notes applied yet — that would be step D's "verify in the
actual final file" work, which this pilot intentionally stops short of
per this task's "do not publish yet" instruction.
