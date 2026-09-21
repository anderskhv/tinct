# Fidelity Review 2 (revision re-check) — Leviathan, edition ch. 24 (Hobbes ch. 23), "Of the Public Ministers of Sovereign Power"

Reviewer: independent fidelity reviewer (Reviewer B), per
`books/prompts/fidelity-review-prompt.md`. Targeted re-check of a revision
round, not a full first pass — the unchanged paragraphs were certified in
`fidelity-review-1.md`.

- **Fidelity anchor (sole):** `books/wip/leviathan-pilot-ch24/source.json` (13 paragraphs)
- **Candidate:** `books/wip/leviathan-pilot-ch24/candidate-sonnet.json` (13 paragraphs, post-revision)
- **Baseline read first:** `fidelity-review-1.md` (D1–D6 and the S1–S3 source flags)
- **Not consulted as a fidelity reference:** the accessibility review, the
  drafter's notes, `leviathan-modern-en.json`, or any other translation. The
  pre-revision candidate text was read only via `git show 169a06a3` to establish
  exactly which paragraphs the revision touched.

Paragraph indices below are **0-based** (index 0 = first paragraph). Review 1
used 1-based "p.N" numbering; the mapping is p.N = index N−1.

## Coverage

Exact coverage, stated explicitly:

- **Changed in this revision (read individually, in full, against source, with
  one paragraph of context on each side):** title field, and indices
  **0, 1, 2, 3, 6, 7, 8, 11, 12**. This set was derived from the diff of commit
  `169a06a3` against `3c346ff4`, not from the drafter's commit message.
- **Unchanged in this revision (byte-identical to the text certified in review
  1; not re-certified here):** indices **4, 5, 9, 10**. Read as context only.
- **Whole-chapter continuous pass:** all 13 paragraphs, source and candidate,
  for cross-boundary consistency — recurring terms (public/private minister,
  natural vs. political capacity, judicature, business, author) and the
  body-natural analogy chain (nerves/tendons → organs of voice → hands → eye →
  ear).

Structural checks:

- Paragraph count **13 = 13**. Order preserved, 1:1 index alignment. Nothing
  merged, split, reordered, dropped, or invented at paragraph level. `"number"`
  is 24 in both.
- Sentence-level splits inside indices 7, 11 and 12 stay inside their own
  paragraph; no claim crossed a paragraph boundary.
- The p.7 → p.8 argument payoff ("no man can be judge in his own case" →
  "judged by his own judges") still holds after the untangling.

---

## Part 1 — D1–D6 from review 1: applied?

| # | Fix required | Status |
|---|---|---|
| D1 | Modernize chapter title | **APPLIED, correct** |
| D2 | Drop added "king" in index 2 | **APPLIED** (see N5, cosmetic residue) |
| D3 | "county" → editorial call | **APPLIED** as "locality" |
| D4 | Restore "favour" in index 8 | **APPLIED, correct** |
| D5 | Restore object "them" in index 7 | **APPLIED, correct** |
| D6 | Restore "annexed/attached to" in index 6 | **APPLIED, correct** |

Detail:

- **D1 (blocking in review 1) — CLEARED.** Title is now
  `"Chapter 23. Of the Public Ministers of Sovereign Power"`. Matches the house
  convention. No archaic island remains anywhere in the chapter.
- **D2 — CLEARED.** `"a predecessor king may entrust…"` →
  `"an infant king's predecessor may entrust…"`. The unlicensed rank is gone;
  the candidate now says exactly what the source says ("the Predecessor of an
  Infant King"). One cosmetic residue, see N5.
- **D3 — CLEARED (editorial call taken).** `"men from the county where the
  matter in dispute lay"` → `"men from the locality where the matter in dispute
  lay"`. This is the more faithful rendering of Hobbes's general "men of the
  Country" (the vicinage formula) and no longer substitutes a narrower
  administrative term. Correct call.
- **D4 — CLEARED.** `"acknowledged as a privilege granted to them"` →
  `"acknowledged as a privilege granted them as a favor"`. The favour/grace
  element that the argument rests on is restored, in exactly the wording review
  1 proposed.
- **D5 — CLEARED.** `"whose interest makes him suspect"` → `"whose interest
  makes him suspect them"`. Object restored; the momentary "makes him
  suspected" misreading is gone.
- **D6 — CLEARED.** `"all judicature is essentially bound up with sovereignty"`
  → `"all judicature — the administration of justice — is essentially attached
  to sovereignty"`. Hobbes's technical "annexed to" thread is restored as
  "attached to", and the added gloss is an accurate plain definition that
  injects no claim. Term placement is right: this is the first occurrence of
  "judicature" in the chapter, so the two later uses (indices 8 and 12) are
  covered.

All six are correctly applied. No fix introduced a regression in the sentence it
touched.

---

## Part 2 — NEW defects in the accessibility-driven changes

These edits had not been independently fidelity-checked before. Findings are
ordered by severity.

### N1 — BLOCKING (addition + silent misidentification). Index 0: the "similar parts" gloss states something the source does not say, and states it wrongly.

- **Source (index 0):** "In the last Chapter I have spoken of the Similar parts
  of a Common-wealth; In this I shall speak of the parts Organicall, which are
  Publique Ministers."
- **Candidate (index 0):** "In the last chapter I spoke of the similar parts of
  a commonwealth — **the private citizens who simply make it up**. In this I
  shall speak of its organic parts — that is, the parts with a distinct
  function, like organs in a body — namely, the public ministers."
- **What's wrong:** two problems in one gloss.
  1. **Unlicensed addition.** Hobbes's sentence is a bare back-reference. It
     defines nothing about what the similar parts *are*; the candidate supplies
     a definition and presents it as part of Hobbes's sentence (em-dash
     apposition, not a visibly editorial aside).
  2. **The supplied definition is wrong.** The "last Chapter" is Hobbes's ch. 22,
     "Of Systemes Subject, Politicall, and Private" — systems, i.e. subordinate
     bodies, corporations, leagues, families. The similar parts he is pointing
     back at are those systems, not "the private citizens who simply make it
     up." The gloss therefore asserts a substantive claim about Hobbes's
     structure that the source does not make and that the preceding chapter
     contradicts. This is the "helpful invented explanation" failure mode, with
     a factual error inside it.
- **Fix:** delete the added clause. Minimum acceptable: "In the last chapter I
  spoke of the similar parts of a commonwealth — its uniform, like-natured
  parts. In this I shall speak of its organic parts…". If the edition wants the
  back-reference made explicit, the only safe content is the anatomical
  contrast (similar/homogeneous parts vs. organs), not a claim about who those
  parts are.
- **Note on the second gloss in the same sentence:** "that is, the parts with a
  distinct function, like organs in a body" is an addition too, but it is
  licensed — it unpacks Hobbes's own word "Organicall" and his own
  body-natural analogy, which this chapter then runs through nerves/tendons,
  organs of voice, hands, eye and ear. Keep it.

### N2 — NON-BLOCKING (addition, reader-confusing). Index 3: the "economy" gloss adds a meta-claim that fights the sentence it introduces.

- **Source (index 3):** "As at home, First, for the Oeconomy of a Common-wealth,
  They that have Authority concerning the Treasure, as Tributes, Impositions,
  Rents, Fines, or whatsoever publique revenue…"
- **Candidate (index 3):** "At home, first, for the commonwealth's economy —
  **that is, the management of its affairs, not money in the modern sense**:
  those who have authority over the public treasure — tributes, impositions,
  rents, fines, or any other public revenue…"
- **What's wrong:** the "management of its affairs" half is a correct gloss of
  *oeconomia*. The "not money in the modern sense" half is an added assertion
  about word usage that the source does not make, and it is placed immediately
  before a clause entirely about treasure, taxes, rents, fines and revenue — so
  the reader is told the word is not about money and then reads a list of money.
  Net effect is a confusion the source does not have.
- **Fix:** trim to the licensed half: "for the commonwealth's economy — that is,
  the management of its affairs: those who have authority…".

### N3 — NON-BLOCKING (addition). Index 7: "the remaining judges" imports a pool the source does not describe.

- **Source (index 7):** "if the Defendant be allowed to except against such of
  his Judges, whose interest maketh him suspect them, (for as to the
  Complaynant he hath already chosen his own Judge,) those which he excepteth
  not against, are Judges he himself agrees on."
- **Candidate (index 7):** "First: the complainant has already chosen his own
  judge. If the defendant is then allowed to challenge any of the **remaining**
  judges whose interest makes him suspect them, the judges he does not challenge
  are ones he has, **in effect**, agreed to himself."
- **What's wrong (two small items in one sentence):**
  - "remaining" implies a fixed panel from which the complainant's chosen judge
    has already been removed, leaving a remainder for the defendant to work on.
    Hobbes writes only "such of his Judges"; the parenthetical about the
    complainant is an aside explaining why the device is needed for the
    defendant only, not a description of a two-stage selection. Interpretive
    addition.
  - "in effect" is an added hedge. The source states it flatly: those he does
    not except against *are* judges he himself agrees on. The hedge weakens a
    step Hobbes needs at full strength, because the whole paragraph ends on
    "judged by his own judges, that is to say, by himself."
- **Fix:** "If the defendant is then allowed to challenge any of his judges
  whose interest makes him suspect them, the judges he does not challenge are
  ones he has himself agreed to."

### N4 — NON-BLOCKING (structure/emphasis). Index 7: Hobbes's parenthetical aside is promoted to the headline of his "first" case.

- **Source:** the "first" way of agreement *is* the defendant's right of
  exception; "(for as to the Complaynant he hath already chosen his own Judge,)"
  is a bracketed justification.
- **Candidate:** "First: the complainant has already chosen his own judge. If
  the defendant is then allowed to challenge…"
- **What's wrong:** as written, "First:" appears to name the complainant's prior
  choice as the first mode of agreement. The following sentence recovers the
  intended sense, so no claim is lost — but the emphasis of the enumeration is
  shifted, and the enumeration is load-bearing (first/second/third).
- **Fix:** keep the untangling but subordinate the aside:
  "First. Since the complainant has already chosen his own judge, the question
  concerns the defendant: if he is allowed to challenge any of his judges whose
  interest makes him suspect them, the judges he does not challenge are ones he
  has himself agreed to."

### N5 — NON-BLOCKING (cosmetic, from the D2 fix). Index 2: "infant king" now appears twice in one sentence.

- **Source:** "as to a Protector, or Regent, may bee committed by the Predecessor
  of an Infant King, during **his** minority, the whole Administration of his
  Kingdome."
- **Candidate:** "an **infant king's** predecessor may entrust a protector or
  regent with the whole administration of the kingdom during **an infant king's**
  minority."
- **What's wrong:** nothing fidelity-wise — D2 is properly fixed. But the source
  uses a pronoun for the second reference, and the doubled noun phrase reads as
  though two different infant kings might be meant.
- **Fix:** "…during his minority."

### N6 — NON-BLOCKING (term consistency). Index 11: Hobbes's single word "Businesse" is rendered two different ways in adjacent sentences.

- **Source (index 11):** "though Authority be Publique; yet because the
  **businesse** is Private…" and "though both the Authority, and the
  **Businesse** be Publique…"
- **Candidate (index 11):** "though his authority is public, the **business** is
  private…" and "both his authority and his **task** are public…"
- **What's wrong:** Hobbes is running the same authority/business pair twice, as
  a deliberate parallel (public authority + private business → private person;
  public authority + public business, but no one to represent to → still private
  minister). Varying the noun hides the parallel. No meaning changed.
- **Fix:** use "business" in both.

### N7 — NON-BLOCKING (condition converted to asserted premise). Index 12: the counsellor/presence sentence.

- **Source (index 12):** "For the Advice is addressed to the Soveraign only,
  whose person cannot **in his own presence**, be represented to him, by
  another."
- **Candidate (index 12):** "For the advice is addressed to the sovereign alone.
  And **since the sovereign is present in his own person**, no one else can
  represent him to himself."
- **What's wrong:** the untangling is otherwise good and the actors are right
  (review 1 had already certified this sentence's actor assignment). The one
  shift: Hobbes states a restriction — a man's person cannot be represented to
  him *while he is present* — whereas the candidate asserts the sovereign's
  presence as an established fact and makes it the premise of a "since". In
  context (advice given to the sovereign) the presence is indeed implied, so
  this is a mild firming-up rather than a new claim.
- **Fix (optional):** "For the advice is addressed to the sovereign alone, and
  no one can represent a man's person to him while he is himself present."

### Checked in the changed paragraphs and found clean

- **Index 1 — "cofferers (household treasurers)".** Accurate gloss of the
  household office; sits inside a list of household officers, so it does not
  mislead about the list's scope. The full list (ushers, sergeants, stewards,
  chamberlains, cofferers) survives, and the negation structure
  ("neither… nor… nor…, are public ministers in a monarchy") is intact.
- **Index 6 — judicature gloss and the rest of the paragraph.** "ministers of
  whoever holds the sovereign power" correctly covers the source's "him, or
  them"; the fact/law two-judge structure and its "consequently" are unchanged.
- **Index 7 — everything outside N3/N4.** "ought in fairness" for "ought in
  Equity" is fine; the first/second/third consequents are unchanged and land on
  the same conclusions; "for no man can be judge in his own case" and the
  closing "judged by his own judges, that is, by himself" are intact.
- **Index 8 — the "a jury" naming.** Licensed: twelve men agreed on without
  exception, who then judge, is a jury; the gloss adds no institutional claim
  beyond what the sentence describes, and it does not silently correct Hobbes's
  overstated right of challenge (see S2 in review 1, still correctly left
  alone). "had no grounds to object to the sentence being final" is an accurate
  rendering of "there could be nothing alledged by the party, why the sentence
  should not be finall." Court names, the two orders of men, "none but Lords",
  "as many of them as chose to attend", "Pleas of the Crown", and the number
  twelve are all unchanged — no silent historical correction anywhere in the
  paragraph.
- **Index 11 — the "author" gloss.** "because the commonwealth does not
  authorize any of their actions — that is, does not take responsibility for
  them as its own" is an accurate unpacking of Hobbes's technical "Author"
  (the party who owns the action), the negation is preserved with the same
  scope, and the active-voice recast does not swap actors.
- **Index 11 — the secret-agent sentence.** Splitting it fixed the pronoun
  tangle without loss: the concessive ("though both the Authority, and the
  Businesse be Publique; yet because…") survives as "both his authority and his
  task are public — but since…", the reason clause keeps its direction, and
  "he counts as only a private minister… He is still a minister of the
  commonwealth" preserves Hobbes's two-step qualification and the eye analogy.
  The added "there" (no one *there* recognizes him) is implicit in the source's
  situation and adds no claim.
- **Index 12 — the rest.** The opening "Neither a counsellor nor a council of
  state… is a public person" keeps its negation and its "considered simply as
  having no authority of judicature or command" restriction; the
  monarchy/democracy/aristocracy sequence and "gives counsel to no one but
  itself" are unchanged.

### Carried over from review 1, still unfixed (both were non-blocking notes there)

- The `Dei Gratia` gloss is still "favor of God alone" in one place and "grace of
  God and the king" in the next (index 5). Index 5 was not touched in this
  revision. Same word, two renderings, parallel slightly obscured. Still
  optional.
- S1/S2/S3 (possible errors in Hobbes's own text) remain correctly rendered and
  uncorrected. That is the right behaviour and nothing in this revision
  disturbed it — in particular, "locality" (D3) and "a jury" (N-clean, index 8)
  did not tip the paragraph into modern legal-technical correction.

### Cross-boundary / consistency pass

- **Gloss placement is consistent:** every glossed term is glossed at its first
  occurrence only (similar/organic parts, index 0; cofferers, index 1; economy,
  index 3; judicature, index 6; author, index 11), and later occurrences of
  "judicature" (indices 8, 12) correctly run unglossed.
- **Gloss form is not consistent:** parentheses at index 1, em-dash apposition
  at indices 0, 3 and 6, "that is" at indices 0, 3 and 11. Worth picking one
  pattern house-wide, but it is a style matter, not fidelity.
- **The body-natural chain is complete and correctly placed:** nerves/tendons
  (index 2), organs of voice (end of index 8), hands (index 9), eye and ear
  (index 11) — matching the source's placement in every case. The new index 0
  gloss ("like organs in a body") introduces the analogy one paragraph earlier
  than Hobbes does, which is consistent with, not contrary to, the chain.
- **Public/private minister and natural/political capacity** are used
  consistently throughout; no drift introduced by the revision.
- No claim was moved across a paragraph boundary by any of the sentence splits.

---

## Verdict

**ACCEPT WITH FIXES REQUIRED**

The revision did what it was asked to do: all six review-1 defects (D1–D6) are
correctly applied, with no regression in the sentences they touched, and the
blocking title defect is cleared. Most of the accessibility-driven work — the
judicature and author glosses, the secret-agent untangling, the counsellor
sentence, the jury naming, "locality" — is faithful and improves the chapter
without adding claims.

One new blocking defect was introduced by the accessibility pass.

Required before acceptance:

1. **N1 (index 0)** — delete or replace "the private citizens who simply make it
   up." It is an unlicensed addition and it misdescribes Hobbes's ch. 22.

Recommended (cheap, not blocking):

2. **N2 (index 3)** — drop "not money in the modern sense".
3. **N3 (index 7)** — drop "remaining" and "in effect".
4. **N4 (index 7)** — subordinate the complainant aside instead of heading the
   "First" case with it.
5. **N5 (index 2)** — "during his minority".
6. **N6 (index 11)** — "business" in both halves of the parallel.
7. **N7 (index 12)** — optional, restore the "while he is present" restriction
   rather than asserting presence as a premise.

No re-draft is needed; every item is a local patch. Paragraph count, order and
alignment are sound (13 = 13).
