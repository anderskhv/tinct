# Fidelity Review — candidate-A-revised.json (Reviewer B, targeted re-check)

**Book/chapter:** Leviathan (Thomas Hobbes, 1651), edition ch. 18 / Hobbes's Ch. XVII,
"Of the Causes, Generation, and Definition of a Commonwealth."
**Source edition (fidelity anchor):** `source.json` (locked).
**Scope of this pass:** targeted re-check of a revision round, per instructions —
not a full first-pass review (paragraphs 0, 2, 6–9, 11, 13–15 already passed
full fidelity review as part of candidate-A and are byte-identical here).

## Coverage

1. **Diff verification.** Programmatically diffed `candidate-A.json` against
   `candidate-A-revised.json`, paragraph by paragraph (16 paragraphs each,
   both files). Changed indices: **{1, 3, 4, 5, 10, 12}** — exactly the
   claimed set, nothing else differs. Paragraph counts match source (16) in
   all three files; no merge/split/reorder detected anywhere.
2. **Packet review of changed paragraphs against source**, each read with
   its source neighbor(s) for context:
   - Packet A: paragraphs 0 (context) – 1 – 2 (context)
   - Packet B: paragraphs 2 (context) – 3 – 4 – 5 – 6 (context)
     (3, 4, 5 read together since they're contiguous)
   - Packet C: paragraphs 9 (context) – 10 – 11 (context)
   - Packet D: paragraphs 11 (context) – 12 – 13 (context)
   All six changed paragraphs were read individually and in full against the
   source text, not skimmed.
3. **Whole-chapter re-read**, all 16 paragraphs in order (revised text),
   for cross-boundary consistency: recurring Hobbesian terms (awe, injury,
   person, covenant, common power), pronoun antecedents across the numbered
   "bees and ants" list (paras 5–11), and the "him"/sovereign reference
   linking paragraph 12 into paragraph 13.

## Findings by paragraph

### Paragraph 1
- Fix confirmed: "own strength and cunning" (candidate-A) → "own strength
  and skill" (revised). Source: "own strength and art." "Art" in Hobbes's
  usage is skill/craft, not deception — "cunning" carried an unlicensed
  connotation of trickery; "skill" is correct. No fidelity issue remains.
- The stacked conditional was split ("So the laws of nature only bind a
  person when he is willing to keep them and can safely do so. Even
  granting that, if no power has been set up...") from source's single
  sentence "notwithstanding the Lawes of Nature (which every one hath then
  kept, when he has the will... ) if there be no Power erected...". This
  is a legitimate restructuring for readability — meaning preserved
  (matches Hobbes's own foro interno/foro externo distinction stated
  elsewhere in Leviathan). Non-blocking.
- "so farre from being reputed against the Law of Nature, that the greater
  the spoyles... the greater was their honour" rendered as two sentences
  with an added "quite the opposite:" — the correlative "so far from X,
  that Y" already means "not X; in fact Y," so this is a faithful unpacking,
  not an addition. Non-blocking.

### Paragraphs 3–4 (reviewed together, contiguous)
- **Defect (terminology consistency, non-blocking but should be fixed):**
  paragraph 3 revised reads "without any common power to keep them all **in
  check**," where source has "to keep them all **in awe**" and candidate-A
  had "in awe" (matching source). "Keep in awe" is a recurring, load-bearing
  Hobbesian term used elsewhere in this same chapter unchanged: paragraph 0
  ("no visible Power to keep them in awe") and paragraph 11 ("a Common
  Power, to keep them in awe"). "In awe" specifically connotes fear/terror
  as the mechanism of restraint (central to Hobbes's argument that only
  fear of punishment secures covenants); "in check" is a softer, more
  generic notion of control. This drifts from the source term and breaks
  terminological consistency across the chapter — exactly the kind of
  cross-boundary issue the whole-chapter pass is meant to catch.
  - Source: "without a common Power to keep them all in awe"
  - Candidate-A-revised: "without any common power to keep them all in check"
  - Fix: restore "in awe" — "without any common power to keep them all in
    awe."
- The "not only... subdued by a few... but also... make warre" construction
  was split into two sentences ("This leaves them easily subdued by even a
  small number who act in agreement. And when there is no common enemy,
  they readily make war on one another...") — this actually repairs an
  ungrammatical parallel in candidate-A ("subdued... but also... prone to
  making war," mixing a passive participle with an adjective phrase). Both
  clauses of the source's "not only/but also" are preserved. No fidelity
  issue.
- "neither would be nor need to be any Civill Government... because there
  would be Peace without subjection" → "no need for civil government...
  and indeed no such thing would exist, since there would be peace without
  anyone being subject to anyone else." Both clauses (no need to exist / no
  such thing exists) preserved, causal "since" tracks "because." No issue.
- Paragraph 4: source's single dense sentence ("Nor is it enough for the
  security... that they be governed... for a limited time... For though
  they obtain a Victory...") is split into four shorter sentences. The
  **ambiguous pronoun fix** is here: candidate-A had "he that by one part
  is held for an enemy, is by another part held for a friend" (source's own
  "he," ambiguous out of context); revised has "one party comes to regard
  as an enemy someone another party regards as a friend" — removes the
  free-floating "he" without changing the claim (one faction's enemy is
  another faction's friend). Correct fix, meaning preserved.
- Added transitional sentence "that unity will not last" (revised only,
  not in source or candidate-A) — this doesn't introduce a new claim, it
  summarizes what the following clause already states (they fall back into
  war once the common enemy is gone). Minor stylistic addition, non-blocking,
  but flagging per the "additions" check since it has no direct source
  token.
- "no common enemy" → "no common enemy left" — "left" is licensed by
  context (they just won a war against that enemy) and not a real addition
  of fact. Non-blocking.

### Paragraph 5
- **Fix confirmed:** candidate-A's "someone may **well** want to know" is a
  hedging drift from source's "some man may **perhaps** desire to know" —
  "may well" reads as an endorsed/likely inference, stronger than "perhaps."
  Revised correctly restores "someone may **perhaps** want to know,"
  matching the source's hedge exactly. This was one of the two minor
  fidelity notes from the earlier review and it is fixed correctly.

### Paragraph 10
- **Unglossed idiom fix confirmed:** source's "cannot distinguish betweene
  Injury, and Dammage" is a technical Hobbesian distinction (in Leviathan,
  "Injury" = breach of covenant/right, not simply "harm"). Candidate-A left
  it as "cannot distinguish between injury and mere damage" with no gloss.
  Revised adds "cannot tell the difference between an injury — a wrong done
  to them — and mere damage." This is a reasonable plain-English gloss and
  doesn't contradict Hobbes's usage, though it's a simplification (Hobbes's
  "Injury" is specifically about violated right/covenant, not just any
  "wrong done to them" in a loose sense). Non-blocking — acceptable for a
  general-reader modern edition, doesn't lose the injury/damage distinction
  the sentence is built on.

### Paragraph 12
- The "only way to erect X (which has properties A, B, C) is Y" nested
  relative clause is restructured into two sentences ("Such a common power
  must be able to defend people... There is only one way to set up a power
  like that: to confer..."). The "only way" uniqueness claim and the three
  required properties (defend from foreign invasion, defend from mutual
  injury, secure self-sufficient contented living) are all preserved, just
  reordered from a single 70-word sentence into two. No fidelity issue.
- **Gloss added, correct:** "to bear their person" is glossed as "— that
  is, to act and speak as if he were the multitude itself —" (this is the
  unglossed-idiom fix for this paragraph). Reasonably accurate for a
  general reader; Hobbes's technical sense (Ch. 16: a "Person" is one whose
  words/actions are considered as representing another, by authorization)
  is slightly more precise than "as if he were," but the gloss doesn't
  contradict it and helps a reader who doesn't know Hobbes's Ch. 16
  vocabulary. Non-blocking.
- **Minor fidelity note (non-blocking, worth a look):** source says the
  sovereign "hath the **use of** so much Power and Strength **conferred on
  him**" — emphasizing that power is *delegated/conferred* by the
  individuals, and that the sovereign holds its *use*, not an inherent
  possession. Candidate-A rendered this closely: "he has conferred on him
  the use of so much power and strength that..." (awkward but faithful).
  Revised simplifies to "he holds so much power and strength that..." —
  this drops the "use of ... conferred" framing. The delegation idea is
  still present earlier in the same clause ("by this authority, granted to
  him by every individual man in the commonwealth"), so the paragraph as a
  whole doesn't lose the point that this power is delegated, not inherent —
  but the specific "use of X conferred," which underscores that the
  sovereign wields power he does not personally own, is flattened into a
  plainer "he holds." Suggested fix if picked up in a later pass: "...he
  holds so much power and strength, conferred on him for that use..." or
  similar, to keep the conferral language tight to the power clause itself.
  Judged non-blocking because the surrounding sentence and the chapter's
  argument elsewhere still make the delegation point clearly.

## Cross-boundary / whole-chapter re-read

Read all 16 paragraphs in the revised file in order. Findings:
- The "in awe" → "in check" drift in paragraph 3 (above) is the one real
  cross-boundary inconsistency: paragraphs 0 and 11 (unchanged) both use
  "in awe" for the same recurring concept, so paragraph 3 now reads as
  using a different term for the same thing mid-chapter.
- Pronoun/referent chains hold: "him" opening paragraph 13 correctly
  resolves to the sovereign established at the end of paragraph 12 (revised
  wording doesn't disturb this). The numbered list (paras 5–11, "First...
  Last...") reads consistently through the revised paragraph 5 and
  paragraph 10 insertions — no numbering or referent drift.
- Terminology otherwise holds: "commonwealth," "covenant," "sovereign,"
  "person," "injury" are used consistently in the revised paragraphs and
  match usage in the unchanged surrounding paragraphs.
- No claim set up in a changed paragraph is contradicted or left unpaid-off
  by an unchanged one, or vice versa.

## Defect summary

| # | Para | Severity | Issue | Fix |
|---|------|----------|-------|-----|
| 1 | 3 | Non-blocking (terminology drift, should fix) | "in check" replaces source's/chapter's "in awe" | Restore "in awe" |
| 2 | 4 | Non-blocking (minor addition) | "that unity will not last" has no direct source token | Optional: keep as harmless transitional gloss, or drop |
| 3 | 12 | Non-blocking (nuance flattened) | "use of ... conferred on him" simplified to "he holds" | Optional: restore "conferred"/delegation framing in that clause |

No blocking defects: no actor swaps, no dropped/flipped negation, no
causality reversal, no lost conditions, no unlicensed additions of
substance, no silent factual "corrections," and the one archaic-quotation
concern in the chapter (the definition of commonwealth quoted in paragraph
13) is unchanged from the already-accepted candidate-A and was not touched
in this revision.

## Verdict

**ACCEPT WITH FIXES REQUIRED** — one fix required before sign-off:

1. Paragraph 3: change "keep them all in check" back to "keep them all in
   awe" to match the source term and its two other unchanged occurrences
   in this same chapter (paragraphs 0 and 11).

Items 2 and 3 in the table are optional polish, not required for
acceptance. All other revised paragraphs (1, 4, 5, 10, 12 apart from the
noted "conferred" nuance) faithfully preserve source meaning while fixing
the accessibility problems they were revised for (dense stacked
conditionals in 1/3/4/12, the ambiguous pronoun in 4, the unglossed idiom
in 10 and 12, and the "cunning"/"may well" fidelity notes in 1 and 5).
