# Leviathan — Established Terminology (updated after ch24, ch40)

Reference for drafting/reviewing further chapters so vocabulary choices
stay consistent with the already-accepted final candidates. Originally
built from ch18; updated after ch24 and ch40 were accepted.

## From ch18 (unchanged)

- **commonwealth** — lowercase in ordinary running text. Full caps
  **COMMONWEALTH** only at the moment the term is formally defined.
- **sovereign / subject** — lowercase in ordinary use; full caps
  **SOVEREIGN** / **SUBJECT** only at their formal-definition moment.
- **CIVITAS**, **LEVIATHAN** — kept as Hobbes's own capitalized Latin/
  proper terms, briefly glossed inline where genuinely unfamiliar.
- **mortal god** — lowercase.
- **person / author** (Hobbes's technical sense) — lowercase throughout
  ("bear their person," "the author of," "one and the same person"),
  consistently, wherever the concept recurs. **House gloss, confirmed
  reusable across chapters:** "To 'bear the person' of something, in
  this technical sense, is to act and speak as if you were that thing"
  — used in both ch18 and ch24 without objection from any reviewer.
  Give it once, at the term's first concentrated use in a chapter; don't
  re-gloss every subsequent occurrence.
- **"keep them in awe"** — this exact phrase, not "keep them in check."
- **"plurality of voices"** — kept as Hobbes's own technical term (not
  "majority," which means something different). A short parenthetical
  gloss is fine if genuinely needed: "(that is, by whichever choice
  wins the most support)."
- **"pretext"** (for source "pretences") in a skeptical context — case
  by case, not a blanket rule.

## New from ch24 / ch40

- **Quoted scripture:** modernize the quoted verse's own wording, never
  substitute a named translation's (KJV/NIV/etc.) phrasing even when a
  reviewer recognizes it. Verified across six citations in ch40 with no
  slip either direction.
- **Quoted performative/definitional formulas that are the author's own
  words** (not external citations): modernize fully, as confirmed
  working well in ch18 (the contract formula) and ch40 (the formal
  CHURCH definition). When adding a clarifying gloss near such a
  quotation, keep it clearly **outside** the quotation marks — never
  interpolated inside the quoted text itself.
- **Untranslated Greek/Latin terms of art** central to an author's own
  argument about word-meaning (ch40's *Ecclesia*, *Concio*,
  *Ecclesiastes*, etc.): keep untranslated, gloss briefly and
  accurately, and — this is the specific failure mode ch40 round 2
  demonstrated — be careful that any sentence restructuring around them
  doesn't accidentally reassign which language/speaker/actor a term
  belongs to.
- **Word-count ratio as a structural tripwire.** Not a quality gate (per
  the resolved similarity-gate policy), but a cheap sanity check to run
  after any edit that touches substantial paragraph text: candidate
  words / source words per paragraph. A ratio outside roughly 0.7-1.6
  (absent a licensed short gloss expansion) is worth a direct read, not
  just a diff — this caught a real content-loss bug in ch24 round 3 that
  a diff-trusting review nearly missed. See ch24's `PILOT-REPORT.md` for
  the full story.
- **Editing scripts: never use bare assignment (`p[i] = new_text`) when
  the intent is a targeted replacement within a paragraph.** Use
  `p[i] = p[i].replace(old, new)` with an `assert old in p[i]` guard
  beforehand. A bare assignment silently discards everything in the
  paragraph outside the literal string you typed — this is exactly what
  caused the ch24 round-3 regression.

This note is descriptive, not a new rule — deviate when a later
chapter's context makes a documented choice genuinely wrong, but do it
as a conscious, documented choice.
