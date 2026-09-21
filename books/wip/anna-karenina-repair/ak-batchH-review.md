# Anna Karenina — Batch H Independent Adversarial Review (Chapters 156–176)

## Scope and method

Independent re-read of all 21 chapters (Part Five ch32–33 + Part Six ch1–19),
every paragraph of `ak-batchH-current-modern-en.json` checked against
`ak-batchH-source.json` (Garnett, locked ground truth), without relying on the
drafter's notes. The drafter's self-report ("0 defects, 2 trivial flagged
items") was treated as a claim to verify, not a fact.

## 1. corrected.json == current-modern-en.json

Confirmed programmatically (`python3 -m json.tool` on both, diffed) — the two
files are byte-for-byte identical after normalization. No divergence.

## 2. Paragraph-by-paragraph fidelity read

All 21 chapters read in full, source vs. modern-en, side by side. Independent
verdict: **no content-fidelity defects found.** No dropped clauses or
sentences, no invented content, no meaning inversions, no compression/
summarization, no altered names/places/relationships/numbers anywhere in the
21 chapters. Dialogue, parentheticals, French/Latin phrases, and asides are
all preserved. Register modernization (contractions, "propose" for "make an
offer," "the birth was five miles" style rephrasing, etc.) is consistent and
does not cost any content. This independently confirms the drafter's
top-line claim — I did not find a reason to overturn it.

## 3. Specific factual claims — verified against source

All four cited facts checked directly against source text and found to match
exactly:

- **"Thirty-seven pounds"** — ch165 (Chapter 8), paragraph 30. Source: "In
  the pocketbook there were thirty-seven pounds." Modern-en: "In the wallet
  there were thirty-seven pounds." Exact match.
- **"Seventeen snipe"** — ch167 (Chapter 10), paragraph 3. Source: "There I
  once shot seventeen snipe." Modern-en: "I once shot seventeen snipe
  there." Exact match.
- **"Five thousand" vs "fifty roubles"** — ch168 (Chapter 11), paragraph 19.
  Source: "your receiving some five thousand, let's say, for your work on
  the land, while our host, the peasant here ... can never get more than
  fifty roubles." Modern-en preserves both figures exactly: "five thousand,
  let's say" / "fifty roubles." Exact match.
- **Anna's daughter unnamed / "a Karenina"** — ch176 (Chapter 19), paragraph
  16. Source: "She has no name—that is, she's a Karenina." Modern-en: "She
  has no name — that is, she is a Karenina." Exact match, including the
  plot-critical detail that the child carries no legal surname of her own.

No numeric, onomastic, or relational fact was altered anywhere in the batch.

## 4. Evaluation of the two flagged non-blocking paraphrase items

Both independently re-checked in context.

- **Ch. 162, paragraph 26** — Source: `"I'll show you," she said, taking her
  husband's hand, lifting it to her mouth ... "Like a kiss on a priest's
  hand."` Modern-en: `"Like this," she said, taking her husband's hand ...`
  This is Kitty physically demonstrating (not verbally explaining) how the
  chaste kiss on the priest's hand "doesn't bite" — the action described in
  the sentence is identical, the dialogue tag is a loose but harmless
  paraphrase, and nothing about the scene's meaning, humor, or characterization
  changes. **Agree: non-blocking.**
- **Ch. 174, paragraph 35** — Source: `"if we could take that raven horse
  now, to cart the corn"`. Modern-en: `"if we could borrow that raven horse
  ... to cart the corn"`. This is an unnamed peasant's aside about Vronsky's
  passing trotter. "Take" carries a faint edge of commandeering someone
  else's fine horse for menial farm work (the joke), which "borrow" softens
  very slightly — but it is a one-off peasant quip with no plot or
  characterization weight, said by a character who appears in no other
  paragraph. The substitution does not change any fact, relationship, or
  plot point. **Agree: non-blocking**, though "borrow" is arguably the
  (very marginally) weaker word choice of the two — not worth a fix.

## 5. Paragraph counts

Verified programmatically, chapter-by-chapter, source vs. modern-en. All 21
chapters match exactly:

156: 28, 157: 74, 158: 23, 159: 71, 160: 47, 161: 5, 162: 31, 163: 43,
164: 63, 165: 34, 166: 34, 167: 41, 168: 65, 169: 18, 170: 17, 171: 49,
172: 57, 173: 19, 174: 40, 175: 35, 176: 28.

Chapter titles/numbers also line up 1:1 between source and modern-en for all
21 entries (no chapter added, dropped, split, or merged).

## Verdict

**Accept as-is.**

The drafter's self-report holds up under an independent, full paragraph-by-
paragraph re-read (not spot-checked) of all 21 chapters. Paragraph counts
match exactly. All four cited factual details (thirty-seven pounds, seventeen
snipe, five thousand vs. fifty roubles, Anna's daughter's unnamed status)
verify exactly against source. Both flagged loose-paraphrase items are
confirmed harmless and correctly classified as non-blocking. No new defects
were found in this independent pass. No edits to any batch H file are
recommended.
