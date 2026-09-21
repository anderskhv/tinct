# Fidelity Review 2 (Reviewer B) — Leviathan, edition ch. 27 (Hobbes ch. 26), "Of Civil Laws"

- **Fidelity anchor:** `books/wip/leviathan-pilot-ch27/source.json` (48 paragraphs, 1651 Gutenberg text)
- **Candidate:** `books/wip/leviathan-pilot-ch27/candidate-sonnet.json` (48 paragraphs, post-revision)
- **Baseline:** `fidelity-review-1.md` (ACCEPT WITH FIXES REQUIRED — 2 blocking, 3 minor)
- **Reviewer:** independent re-derivation from source; drafter self-report not relied on.
- **Date:** 2026-09-21

---

## Coverage

This is a targeted re-check of the revision round, not a re-certification of the whole chapter
(review 1 already certified all 48 paragraphs individually).

**What I actually did:**

1. Reconstructed the pre-revision candidate by concatenating
   `candidate-sonnet-batchA.json` + `batchB.json` + `batchC.json` (16 + 16 + 16 = 48) and diffed it
   paragraph-by-paragraph against `candidate-sonnet.json`. **Exactly 7 paragraphs differ: 6, 9, 10,
   27, 28, 29, 47.** No other paragraph was touched, and no paragraph was added, dropped, merged,
   split or reordered. This independently confirms the claimed scope of the round.
2. Read source vs. candidate in full, word by word, for all 7 changed paragraphs, each with one
   paragraph of context on either side (5–7–8, 8–9–10–11, 26–27–28–29–30, 46–47 read as a pair).
3. Ran chapter-wide term censuses over source and candidate for the terms this round touches:
   *equity*, *innocency/innocence*, *promiscuously*, *interchangeably*, *procure*,
   *judgement/judgment*.
4. Structural checks: paragraph count 48 = 48; no empty paragraphs; JSON valid
   (`python3 -m json.tool` passes); `number` = 27; word-count ratio candidate/source for each
   changed paragraph 0.97–1.10 (no compression or padding).

Term census result (source index list vs. candidate index list):

| Term | Source paragraphs | Candidate paragraphs |
|---|---|---|
| equity | 6, 7, 13, 14, 17, 25, 27, 29, 30, 39, 43 | identical |
| innocenc* | 27 (×2, "Innocency") | 27 (×2, "innocence") |
| promiscuously | 46, 47 | — (rendered "interchangeably" in 46, 47) |
| procure | 29 | 29 |

---

## Item-by-item verification of the five baseline fixes

### 1. Paragraph 28 — blocking defect FIXED, and fixed correctly ✅

- **Source:** "In like manner, when question is of the Meaning of written Lawes, he is not the
  Interpreter of them, that writeth a Commentary upon them."
- **Was:** "…the man who is not the interpreter of them is the one who writes a commentary on them."
- **Now:** "In the same way, when the question is the meaning of written laws, the one who writes a
  commentary on them is not their interpreter."

This is the source's actual claim — a **denial** of interpretive authority to the commentary-writer,
not a definition of "the non-interpreter." Subject and predicate are now the right way round. The
paragraph's own argument (commentaries need further commentaries → therefore the interpreter must be
the sovereign-authorised or the ordinary judge) now follows from its opening sentence, which it did
not before. Rest of the paragraph unchanged and still clean. **Confirmed fixed.**

### 2. Paragraph 29 — blocking omission FIXED ✅

- **Source:** "…but procure of the Soveraign that another be made Judge, and himselfe Witnesse."
- **Was:** "…but he shall procure that another be made judge…"
- **Now:** "…but he shall procure **of the sovereign** that another be made judge, and himself become
  witness."

The actor is restored; the judge no longer appears to arrange his own replacement on his own
authority, which is the whole point of the example. Nothing else in the paragraph changed.
**Confirmed fixed.** (One minor style note below on "procure of" vs "procure from".)

### 3. Paragraph 47 — "any case whatsoever" RESTORED ✅ and "promiscuously" now CONSISTENT ✅

- **Determiner:** source "have Liberty in any case whatsoever" → candidate now "have liberty in
  **any** case whatsoever". The weakened/unidiomatic "some … whatsoever" is gone. Confirmed.
- **"promiscuously":** source uses it in both 46 and 47. Candidate 46: "used **interchangeably** for
  the same thing"; candidate 47: "laws and charters are **interchangeably** taken for the same
  thing." Same English word in both, and it carries the "indiscriminately / without distinguishing"
  sense that Hobbes is complaining about (the previous "commonly taken for the same thing" lost it).
  Confirmed. Paragraph 46 is unchanged, so the match was achieved by moving 47 to 46's rendering,
  which is the right direction.
- Minor: "are interchangeably taken for the same thing" is slightly stiffer word order than 46's
  "used interchangeably for the same thing". "are likewise taken interchangeably for the same thing"
  would read better and also restore the source's "Likewise". Non-blocking.

### 4. Paragraph 10 — "erroneous Sentences" RESTORED to the judicial sense ✅

- **Source:** "it is possible long study may encrease, and confirm erroneous Sentences"
- **Was:** "erroneous opinions"
- **Now:** "erroneous **judgments**"

This restores the judicial-ruling sense (erroneous rulings handed down), not the grammatical sense
of "sentences," and it does so without disturbing the paragraph's later, correct uses of "sentence"
for the subordinate judge's ruling ("his sentence may be in keeping with it… otherwise it is his
own"). Nothing else in the paragraph changed. **Confirmed fixed.**

- **NEW minor defect (spelling consistency):** the new word is spelled **"judgments"**, while the
  rest of the chapter uses British **"judgement(s)"** in paragraphs 6, 27, 28, 29, 30, 37, 41, 43.
  Paragraph 10 is now the only "judgment" in the chapter. Fix: "erroneous **judgements**".

---

## New material reviewed this round (not covered by review 1)

### 5. Paragraph 27 — the quoted "great Lawyer" passage and Hobbes's close reading of it

This is the most delicate change of the round, because Hobbes quotes the passage and then re-quotes
its key phrase in his own commentary. Both occurrences and every clause were checked.

**"notwithstanding his innocency" — both occurrences updated consistently ✅**

- In the quote: source "he shall notwithstanding his Innocency, Forfeit all his goods" → candidate
  "he shall, notwithstanding his **innocence**, forfeit all his goods".
- In Hobbes's commentary: source "an Innocent Man, Judicially Acquitted, Notwithstanding His
  Innocency, … condemned to lose all the goods he hath" → candidate "an innocent man, judicially
  acquitted, notwithstanding his **innocence** … condemned to lose all the goods he has."

Census confirms `innocenc*` appears exactly twice in candidate paragraph 27, both as "innocence",
matching the source's two occurrences. The echo that makes the commentary a close reading of the
quote is intact. **Confirmed consistent.**

**The rest of the quote, clause by clause — no claim dropped or altered ✅**

| Source | Candidate | Verdict |
|---|---|---|
| "If a man, that is Innocent, be accused of Felony" | "If a man … who is innocent is accused of a felony" | Same claim; modernized relative pronoun. OK |
| "and for feare flyeth for the same" | "and flees for fear of it" | See note (a) below |
| "albeit he judicially acquitteth himselfe of the Felony" | "although he is judicially acquitted of the felony" | See note (b) below |
| "yet if it be found that he fled for the Felony" | "yet if it is found that he fled because of the felony" | Accurate; "for" = on account of. OK |
| "he shall notwithstanding his Innocency, Forfeit all his goods, chattels, debts, and duties" | "he shall, notwithstanding his innocence, forfeit all his goods, chattels, debts, and dues" | Four-item list intact and in order; "duties" → "dues" is the correct modernization of the Coke-formula sense (sums owing), not a fact substitution. OK |
| "For as to the Forfeiture of them, the Law will admit no proofe against the Presumption in Law, grounded upon his flight" | "For as to their forfeiture, the law will admit no proof against the presumption in law grounded on his flight" | Identical claim. OK |

Hobbes's surrounding commentary is unchanged from the previous round and remains faithful: the
capital/non-capital dilemma ("if the law grounds on his flight a presumption of the fact (which was
capital), the sentence ought to have been capital; if the presumption were not of the fact, then for
what should he lose his goods?"), the "this therefore is no law of England" conclusion, and the
"presumption of law vs. presumption of the judges" distinction all survive intact.

Two **non-blocking precision notes** on the quote:

- **(a)** Source "for feare flyeth for the same" has two distinct elements: he flees *out of fear*,
  and he flees *for the felony*. The candidate's "flees for fear of it" collapses them and attaches
  the fear to the felony. The load-bearing repetition — "if it be found that he fled for the Felony"
  — is rendered correctly ("fled because of the felony"), so the argument still works. Tighter:
  "and out of fear flees on account of it".
- **(b)** Source's "he judicially **acquitteth himselfe** of the Felony" is the reflexive that echoes
  Hobbes's own definition six sentences earlier, "Innocent is he that **acquitteth himselfe**
  Judicially" — which the candidate does preserve ("innocent is the man who acquits himself
  judicially"). The quote shifts to the passive "is judicially acquitted", so the verbal link from
  definition → quote is weakened. The link from quote → commentary still holds (the source's own
  commentary is passive, "Judicially Acquitted", and the candidate matches it). Non-blocking; if
  fixed, use "although he judicially acquits himself of the felony".

Also unchanged and still open from review 1 §6: the paragraph still opens with the double negative
"because no judge, subordinate or sovereign, is incapable of erring in a judgement of equity" for
source "there is no Judge Subordinate, nor Soveraign, but may erre". Accurate, still knotted.
Optional polish, not a fidelity defect.

### 6. Paragraph 9 — the "Parlamentum" / "Rex In Parlamento" gloss ✅ accurate

- **Now:** "…then the controller of laws is not *Parlamentum* (Parliament alone) but *Rex In
  Parlamento* (the king in Parliament)."

Historically and legally accurate, and it is exactly the distinction the paragraph's argument turns
on: if someone else may dissolve Parliament, then the controlling authority is not Parliament acting
by itself but the King-in-Parliament (the composite legislative body of King, Lords and Commons —
the standard English constitutional sense). "the king in Parliament" is a literal rendering of the
Latin; "Parliament alone" adds the word *alone*, which is an interpretive addition, but it is
licensed by the immediate context (the whole sentence is a contrast between the two, and Hobbes has
just argued that Parliament is *not* the sole controller unless it is sovereign). The Latin terms
themselves are correctly preserved untranslated, so the gloss adds without replacing. **No defect.**

- Carry-over typography note from review 1, still unaddressed: "Rex **In** Parlamento" keeps the
  source's title-case medial "In"; should be "Rex in Parlamento". Trivial.

### 7. Paragraph 6 — the "equity" gloss ⚠ accurate but slightly off Hobbes's own definition

- **Now:** "…the length of time shall be no prejudice to his right, but the question shall be judged
  by equity — **that is, by what is fair, apart from the letter of the law**."

Checks that pass: this is the chapter's **first** occurrence of "equity" (census confirms: source and
candidate both have equity at 6, 7, 13, 14, 17, 25, 27, 29, 30, 39, 43 — identical index lists, so
no equity mention was added or dropped anywhere), so a first-occurrence gloss is well placed, and it
is the kind of in-line explanation the source's own "that is to say" habit licenses. It does not
contradict the paragraph's argument.

Where it is slightly overreaching: Hobbes's own gloss of the term, in paragraph 17, is "the Law of
Nature; that is to say, … common Equity" — for Hobbes, equity is a law of nature (the requirement of
equal dealing), not primarily a corrective standing outside the letter of the law. "apart from the
letter of the law" imports the English Chancery / letter-versus-equity framing, which is not the
distinction Hobbes is drawing here (his contrast in paragraph 6 is prescription-by-long-usage versus
equity, not letter versus equity). It also sits a little awkwardly against paragraph 29, where the
candidate correctly has the legislator's intention *supposed to be* equity — i.e. equity is not
"apart from" the law's own sense.

**Non-blocking**, because nothing in the source is contradicted and no claim is changed. Suggested
tighter gloss: "— that is, by what is fair and equal, the standard the law of nature sets", which
also sets up paragraph 17's "common equity" instead of cutting across it.

### 8. Structure ✅

- Paragraph count 48 = 48. No empties. JSON valid. `number` = 27.
- Diff against the reconstructed pre-revision candidate shows **only** paragraphs 6, 9, 10, 27, 28,
  29, 47 changed — no collateral edits, no silent touch-ups elsewhere.
- Word-count ratios for the changed paragraphs: 6 → 1.10, 9 → 1.02, 10 → 1.01, 27 → 1.00, 28 → 0.97,
  29 → 1.00, 47 → 1.05. All within band; the two additions (6 and 47) are the glosses, as expected.

---

## New defects found this round

1. **Paragraph 10 (minor, spelling consistency)** — "erroneous **judgments**" is the chapter's only
   "judgment"; every other instance in the chapter is "judgement". Fix: "erroneous **judgements**".
2. **Paragraph 6 (minor, gloss precision)** — "equity — that is, by what is fair, apart from the
   letter of the law" imports a letter-versus-equity framing Hobbes is not using here and cuts
   across his own gloss in paragraph 17 (equity = the law of nature / common equity). Optional
   reword.
3. **Paragraph 27 (minor, quote precision)** — "and flees for fear of it" collapses source's "for
   feare flyeth for the same"; and "he is judicially acquitted" drops the reflexive that echoes
   Hobbes's own definition of "innocent" earlier in the same paragraph. Neither breaks the argument.
4. **Paragraph 47 (minor, style)** — "are interchangeably taken for the same thing" is stiffer than
   46's phrasing and drops the source's "Likewise". Optional.
5. **Paragraph 29 (minor, idiom)** — "procure **of** the sovereign" restores the source's wording
   literally, but "procure of" is an archaic idiom in an otherwise modernized edition and a modern
   reader may misparse it. "procure **from** the sovereign" preserves the fix and the meaning.

No new blocking defect was found. Nothing in the revision introduced a flipped negation, a swapped
actor, a dropped condition, an invented claim, a silent factual correction, or a new archaic island.

Carry-over, unchanged, still optional (from review 1): paragraph 27's opening double negative;
"Rex In Parlamento" medial capital. One observation outside this round's scope: the candidate's
chapter `title` is still the source's `"Chapter 26. Of Civill Lawes"` while
`current-modern-en.json` uses `"Chapter 26. Of Civil Laws"` — the published edition should carry the
modernized title.

---

## Verdict

**ACCEPT AS-IS**

Both blocking defects from review 1 are genuinely fixed, not merely re-worded: paragraph 28 now
states Hobbes's actual claim (the commentary-writer is *not* the interpreter), and paragraph 29
restores the sovereign as the actor the judge must petition. All three minor items are fixed.
The three previously unreviewed changes — the paragraph 27 quote modernization, the paragraph 9
Latin gloss, and the paragraph 6 equity gloss — are all faithful; the paragraph 27 quote in
particular preserves every clause and updates "innocency" → "innocence" consistently in both the
quote and Hobbes's commentary on it, which was the risk point. Structure is intact at 48/48 with no
collateral edits.

The five items under "New defects" are minor polish (one spelling inconsistency, one gloss wording,
three style/idiom notes) and do not block acceptance. If a polish pass is cheap, apply item 1
("judgements") and item 5 ("procure from") — those two are the ones a reader would actually notice.
