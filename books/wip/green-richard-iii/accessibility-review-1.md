# Accessibility Review 1 — Richard III (`richard-iii`, modern-en)

**Reviewer:** Claude Sonnet 5 (`claude-sonnet-5`)
**What was read:** the full candidate text, all 25 chapters (Act/Scene
units), all 1,420 paragraphs, in full, no sampling. Read candidate-only,
without reference to source.json's wording, per the blind-accessibility
step of the acceptance procedure.

## Method

Read chapter by chapter in original scene order, candidate paragraphs only.
For each chapter, checked:
- Whether a reader unfamiliar with Elizabethan English could follow the
  sense of every sentence without external help.
- Whether syntax was genuinely rebuilt (not just spelling-modernized)
  where the source syntax is hard — inversions, suspended clauses,
  archaic verb forms, elided pronouns.
- Whether stage directions and speaker tags read as clear, consistent
  reader-facing conventions (`RICHARD.`, `[Enter RICHARD, Duke of
  Gloucester, alone.]`).
- Flow and naturalness, not just sentence length — a short sentence can
  still read choppily, a long one can still read smoothly.

## Findings

The candidate is a genuine modern-English rendering throughout, not a
mechanical cleanup. Representative observations:

- Archaic function words and verb forms are consistently rebuilt: "hath"
  → "has", "doth" → "does", "thou/thee/thy" → "you/your", "wherefore" →
  "why", "an if" → "if", etc. — applied uniformly across all 25 chapters,
  including inside verse and curses, not just in prose dialogue.
- Difficult inverted/suspended Shakespearean syntax is rebuilt into
  ordinary clause order. Example (Ch1 ¶1, Richard's opening soliloquy):
  source's "I, that am curtailed of this fair proportion, / Cheated of
  feature by dissembling nature... / And that so lamely and unfashionable
  / That dogs bark at me as I halt by them—" becomes a single flowing
  modern sentence that a reader can parse on first pass without needing to
  hold the "I, that..." construction in mind across six clauses.
  Meaning, imagery, and the self-deprecating irony are all preserved.
- Formal/rhetorical set-pieces (Buckingham's oration to the citizens,
  Ch15 ¶38; Richmond's two battle orations, Ch23 ¶133 and ¶157;
  Margaret's extended curse, Ch3 ¶80 and Ch19 ¶25/¶29) read as coherent,
  followable modern rhetoric — long sentences are broken at natural sense
  boundaries rather than left as single archaic periods, but nothing is
  chopped into a flat list.
- Stichomythia (the rapid one-line exchanges — Richard/Anne's wooing
  scene Ch2 ¶54–¶91; Richard/Elizabeth's negotiation over her daughter
  Ch19 ¶91–¶152) reads naturally line-by-line; the modernization doesn't
  flatten the antithetical wordplay that drives these exchanges (e.g.
  "As long as heaven and nature lengthens it." / "As long as hell and
  Richard likes of it.").
- Historical/legal/period terms that a modern reader might stumble on are
  either modernized transparently in context (e.g. "denier" → "penny",
  "moiety" → "half", "costard" → "head") or left as the period term where
  context already carries the meaning (e.g. "malmsey-butt" → "malmsey
  cask" — close enough to be self-explanatory without inventing an
  external fact about what malmsey is).
- No paragraph reads as an unmodernized archaic block left untouched
  inside otherwise-modern prose; no paragraph reads as a summary or
  compression that drops content (cross-checked more rigorously in the
  fidelity pass, but nothing stood out on the blind read either).

## Accessibility issues found

None that block acceptance. Two minor observations, noted for completeness,
neither a genuine comprehension barrier:

1. Some formal set-piece speeches (Buckingham's, Richmond's orations) are
   necessarily long in both source and candidate — the modernization keeps
   them as long, information-dense passages rather than breaking them
   into a list-like series of short sentences, which is correct per the
   "avoid choppy, list-like prose" instruction, but a first-time reader
   will still need to read them slowly. This is inherent to formal
   Shakespearean rhetoric, not a modernization defect.
2. A handful of proper-noun-heavy stage directions with long "Enter..."
   character lists (e.g. Ch9 ¶0, Ch23 ¶0/¶135) are dense but this is
   unavoidable given the source's own cast lists at those points.

## Conclusion

No accessibility defects requiring correction. Proceeded to fidelity
review (packet-based, against source.json).
