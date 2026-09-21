# Fidelity Review — candidate-X.json (= candidate-A-revised.json), Final Lock-In Check

**Book/chapter:** Leviathan (Thomas Hobbes, 1651), edition ch. 18 / Hobbes's Ch. XVII,
"Of the Causes, Generation, and Definition of a Commonwealth."
**Source anchor:** `source.json` (locked).
**Candidate under review:** `candidate-X.json`. Confirmed byte-identical to
`candidate-A-revised.json` (both 10,358 bytes; diffed in full — no differences).

## Scope / coverage

This is a targeted final check on the latest round of edits, per the request,
not a fresh full-chapter pass. The claim that only paragraphs 5 and 12
changed this round, and that paragraphs 0–4, 6–11, 13–15 are unchanged from a
version already accepted, was verified rather than taken on trust:

- Diffed `candidate-X.json` against the prior fully-reviewed state
  (`candidate-A-revised.json`, which is the same file) and against the
  earlier `candidate-A.json` lineage to confirm the change set matches what
  was described (paragraph 5's "political creatures" gloss and paragraph
  12's "plurality of voices" gloss, CIVITAS gloss, and the sentence split
  were all already present as of `candidate-A-revised.json` and independently
  reviewed and accepted — non-blocking — in `fidelity-review-A-revised.md`).
  No further textual change exists between that reviewed state and the
  current `candidate-X.json` — they are the same file.
- Read paragraph 5 in full against source paragraph 5, with paragraphs 4 and
  6 as context.
- Read paragraph 12 in full against source paragraph 12 (the chapter's
  doctrinal core), with paragraphs 11 and 13 as context.
- Skimmed paragraphs 0–4, 6–11, 13–15 to confirm no incidental text drift,
  not re-certified as a full independent pass (already certified elsewhere:
  paragraph 3's "in awe" fix — flagged as required in
  `fidelity-review-A-revised.md` — is confirmed present in the current file,
  consistent with the claim that this batch already cleared review).
- Verified paragraph count and order programmatically: both `source.json`
  and `candidate-X.json` have exactly 16 paragraphs, 0-indexed, no
  merge/split/reorder at the paragraph level anywhere in the file.

## Paragraph 5

Source: "...live sociably one with another, (which are therefore by
Aristotle numbred amongst Politicall creatures;) and yet have no other
direction, than their particular judgements and appetites; nor speech..."

Candidate: "...live sociably with one another, which is why Aristotle
counted them among the political creatures — that is, creatures naturally
suited to live in organized communities. Yet they have no guide beyond
their own particular judgments and appetites, nor any speech..."

- **Gloss check ("political creatures — that is, creatures naturally suited
  to live in organized communities"):** Accurate. Aristotle's zoon
  politikon, as applied here to bees and ants, denotes creatures that live
  naturally in organized, cooperative groups — exactly what the gloss says.
  It does not overclaim (e.g. it doesn't smuggle in "rational" or
  "self-governing," which would misrepresent Aristotle's point as Hobbes is
  using it). Fair, non-interpretive paraphrase.
- Rest of paragraph: "no other direction" → "no guide," "particular
  judgements and appetites" preserved, "nor speech, whereby one of them can
  signifie to another, what he thinks expedient for the common benefit" →
  "nor any speech by which one can tell another what it thinks would serve
  the common benefit" — same claim, same scope, no actor/negation/causality
  change. "Some man may perhaps desire to know" → "someone may perhaps want
  to know" — hedge ("perhaps") preserved. No omissions, no unlicensed
  additions beyond the flagged gloss, no silent corrections.
- **No defects.**

## Paragraph 12

Source (relevant clause): "...to appoint one man, or Assembly of men, to
beare their Person; and every one to owne, and acknowledge himselfe to be
Author of whatsoever he that so beareth their Person, shall Act, or cause to
be Acted, in those things which concerne the Common Peace and Safetie; and
therein to submit their Wills, every one to his Will, and their Judgements,
to his Judgment."

Candidate (same clause, split into three sentences): "to appoint one man, or
one assembly of men, to bear their person — that is, to act and speak as if
he were the multitude itself. Every one of them then owns and acknowledges
himself the author of whatever the one who bears their person does, or
causes to be done, in matters concerning the common peace and safety. And
in submitting to this, each gives up his will to that one man's will, and
his judgment to that one man's judgment."

- **Plurality-of-voices gloss** ("by a plurality of voices — that is, by
  whichever choice wins the most support —"): Accurate. Plurality means the
  option with the most support among several, not necessarily an absolute
  majority (>50%); "whichever choice wins the most support" states exactly
  that and does not conflate it with "majority." No distortion.
- **CIVITAS gloss** ("or in Latin, CIVITAS — the Latin word for 'state'"):
  Accurate. CIVITAS is standardly rendered "state" (also "commonwealth"/
  "city-state" depending on context); "state" is a fair, non-misleading
  choice and doesn't contradict the "COMMONWEALTH" already given a clause
  earlier — the gloss attaches to the Latin word specifically, not a
  re-definition of "commonwealth."
- **Three-sentence split — clause-by-clause check:**
  - "to beare their Person" → present in sentence 1 (plus the pre-existing,
    separately-reviewed "bear their person" gloss).
  - "and every one to owne, and acknowledge himselfe to be Author of
    whatsoever he that so beareth their Person, shall Act, or cause to be
    Acted, in those things which concerne the Common Peace and Safetie" →
    sentence 2, in full: "Every one of them then owns and acknowledges
    himself the author of whatever the one who bears their person does, or
    causes to be done, in matters concerning the common peace and safety."
    Every element present: the "every one" distributive subject, the
    owning/acknowledging pair, "author of whatever he... shall Act, or
    cause to be Acted," and the "common peace and safety" scope-limiter.
  - "and therein to submit their Wills, every one to his Will, and their
    Judgements, to his Judgment" → sentence 3: "And in submitting to this,
    each gives up his will to that one man's will, and his judgment to that
    one man's judgment." Both submitted items (wills, judgments) preserved,
    both mapped to "his" (the sovereign's) will/judgment respectively, no
    swap.
  - **Pronoun/actor check across the new sentence boundaries:** "he that so
    beareth their Person" in source and "the one who bears their person" in
    the candidate both unambiguously mean the appointed sovereign, not a
    member of the multitude — no ambiguity introduced by the split. "Every
    one"/"each" in sentences 2 and 3 both correctly refer back to the
    individual members of the multitude established in sentence 1's "their
    person," not to the sovereign. No cross-sentence referent drift.
  - **Causal/logical sequence preserved:** appointing one man to bear their
    person (S1) → each person thereby owns/acknowledges authorship of the
    sovereign's acts (S2) → and in that same act, each submits will and
    judgment to the sovereign's (S3). The source's single sentence chains
    these with semicolons as co-extensive parts of one act of
    institution; the candidate's "then" (S2) and "And in submitting to
    this" (S3) preserve that they are the same act described from three
    angles, not a temporal sequence of separate acts. No causality
    reversal, no new causal claim invented.
- **Rest of paragraph 12** (contract formula, COMMONWEALTH/LEVIATHAN/Mortal
  God passage, final authority sentence): re-checked word-for-word against
  source. The direct-quote contract formula ("I authorise and give up my
  Right of Governing my selfe...") is fully and correctly modernized with no
  loss of the reciprocal structure ("on this condition, that thou give up
  thy Right to him"). "This is more than Consent, or Concord; it is a reall
  Unitie..." → "This is more than consent or agreement; it is a real
  unity..." preserved. "That great LEVIATHAN, or rather... that Mortall
  God... we owe under the Immortall God, our peace and defence" preserved
  exactly, including the "under the immortal God" qualifier (this power is
  subordinate to God, not absolute in a theological sense) — not dropped.
  Final sentence ("For by this Authoritie...he hath the use of so much
  Power and Strength conferred on him, that by terror thereof, he is
  inabled to forme the wills of them all...") is rendered as "...he holds so
  much power and strength that, through the terror it inspires, he is able
  to shape the wills of them all..." — this simplification of "use of ...
  conferred on him" to "he holds" is unchanged from the prior round and was
  already flagged as a minor, non-blocking nuance in `fidelity-review-A-
  revised.md`; it is not part of this round's edits and I am not re-opening
  it as a new defect.
- **No blocking defects** in paragraph 12.

## Paragraph count / structure check

Both `source.json` and `candidate-X.json` contain exactly 16 paragraphs
(indices 0–15), in the same order. No paragraph was merged, split, dropped,
or reordered at the paragraph level. The only structural change is the
sentence-level split inside paragraph 12, addressed above.

## Defect summary

None found in the changed material (paragraph 5 gloss, paragraph 12 glosses
and sentence split). No actor swaps, no dropped/flipped negation, no
causality reversal, no lost conditions, no unlicensed additions that alter
meaning, no silent factual "corrections," no ambiguous pronoun introduced by
the sentence split, no paragraph-level restructuring.

## Verdict

**ACCEPT AS-IS**

Both new glosses ("political creatures," "plurality of voices," "CIVITAS")
are accurate and non-distorting, correctly targeted at the accessibility
issues they were written to fix. The paragraph 12 sentence split preserves
every clause, every actor reference, and the original causal/logical chain
exactly. Paragraph count and order remain correct at 16 paragraphs, matching
source, with no merge/split/reorder anywhere in the file. No fixes required.
