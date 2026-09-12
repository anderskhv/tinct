# Book IX — independent review round 1

Step 4 of `../../WORKFLOW.md` for Book IX. Findings are in `findings-v1.md`,
one entry per paragraph IX.1–IX.42 in order. The reviewer did not draft the
candidate, did not consult the drafter, and made no change to
`candidate-v1.json` or to anything outside this directory.

**Verdict: Accept after corrections.**

| Severity | Count | Where |
|---|---|---|
| substantive | **1** | 40.1 |
| minor | **3** | 1.1, 9.1, 41.1 |
| optional | **5** | 1.2, 3.1, 7.1, 28.1, 29.1 |
| no material issue | **35** paragraphs | |

## What was checked

- **Hashes**, all recomputed locally and all matching: `candidate-v1.json`
  `b02cf1353bc209d905bb58d0183e79e9fe69b135c6daba22e257c79d33b23d89`;
  `source-book9.json`
  `aca874d060abe2d7fb6b9d16bd1a4a5f5027780a4314accf6791344fcaa00bbe`;
  `../../meditations-original-en.staged.json`
  `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830`
  (487 paragraphs, 12 chapters, section profile 17, 17, 16, 51, 36, 59, 75,
  61, **42**, 38, 39, 36); `../../source/pg15877-long-1862.txt`
  `6584df7e90d6035eece30d8028527290bf2508076963ee0376cb41db9cf88d5b`.
- **The README's mechanical-check block**, re-run verbatim: prints `OK` with
  the three expected hashes.
- **The no-rebuild claim**, verified independently — see below.
- **All fourteen packets**, in order, three paragraphs at a time with the
  supplied `CONTEXT ONLY` neighbours; coverage `B09-P001`…`B09-P042`, each
  exactly once.
- **A word-level diff of all 42 paragraphs**, read beside the packets, so
  every word Long has that the candidate does not, and the reverse, was
  inspected individually. Every difference in the book traces to a documented
  decision. Six word insertions and four deletions in the whole book, all
  accounted for.
- **The word ratio**, including a ruling on the 0.79 minimum at IX.20.
- **The glossary**, including the extended "divinity" row, applied term by
  term across all 42 paragraphs.
- **The three dagger clauses** (IX.6, IX.26, IX.27), each verbatim but for
  pronouns and glossary renderings.
- **D11 and the apparatus arithmetic**, recounted from the source: four
  brackets, four folds, **zero drops**, six cross-reference spans dropped.
- **The "shall" rule**, every surviving "shall" audited — this is the first
  book drafted under it.
- **The six base-text points**, each ruled on explicitly.
- **A continuous read** of `candidate-v1-readable.md` for voice, pacing,
  repetition, terminology and transitions. No additional chapter-level
  findings.

## Does the no-rebuild claim hold? Yes — verified, and not by re-running the script

Byte-identity to a re-run build proves only that the file matches the script,
which is exactly how the Book IV illustration captions and the Book VII
flush-left footnotes survived the first build. So the check here was a
**separately written reconstruction** of Book IX from PG lines 5419–5864,
diffed word for word against the staged text.

**The only three differences in the whole book are the three documented dagger
marks** (IX.6, IX.26, IX.27). Nothing else differs. That independently
establishes:

- `[Illustration: THE FORUM]` at PG line 5628 **is stripped**. IX.21 ends
  "…a thing to be afraid of." and IX.22 begins "22. Hasten [to examine]…",
  both whole. No `[Illustration` anywhere in the staged file.
- **Eight footnotes**, at PG 5462, 5515, 5601, 5649, 5680, 5707, 5778, 5858 —
  the eight the drafter names, at the lines the drafter names — **all
  indented**, all stripped, with every other indented line in the range a
  continuation of one of their bodies. **No flush-left footnote opener and no
  flush-left footnote body**, tested the strong way: such a body would have
  been read as ordinary text by the reconstruction and would have shown as a
  diff. None did.
- **No running head, page number or catchword**; **no verse and no verse
  citation**; **no Greek in the body** (every `[Greek: …]` span in the range
  sits inside a footnote body).
- **Exactly three dagger marks**, at PG 5525, 5661, 5669.

`git status` clean on the staged file. **No rebuild is needed and no accepted
book is reopened.**

## Rulings requested by the drafter

1. **IX.34 "poor souls" for PG's "pool souls" — endorsed.** A slip, not a
   reading: "pool souls" is not English; Long has "their poor souls" himself
   at IX.27 in the same construction (and those are the only two occurrences
   of the phrase in the whole PG file); Standard Ebooks agrees. The VIII.37
   `Fergamus`/`Pergamus` answer is the right one here.
2. **IX.29 "insolence", not "indolence" — endorsed, and the variant can be
   closed rather than left open.** The meditation's whole subject is
   grandiosity — the men "playing the philosopher", the refusal to expect
   Plato's Republic, the warning against acting "like tragedy heroes" — and
   the clause answers "Simple and modest is the work of philosophy". The
   opposite of *simple and modest* is showy and proud, not lazy and proud;
   indolence has no antecedent in the section. "Insolence"/"indolence" is also
   a one-letter confusion of exactly the kind a re-keyed text produces.
   *Limitation:* no Greek text was consulted; the ruling rests on the argument
   of the meditation and the shape of the error.
3. **IX.29 "They themselves shall judge" — confirmed, keep it.** Emphatic /
   volitional third-person "shall", licensed by the rule and current English
   ("they shall answer for it"). The next sentence — "But if they acted like
   tragedy heroes, no one has condemned me to imitate them" — is a rebuttal of
   a claim on him, not the second half of a prediction, so "will judge" would
   lose the sense, not merely the register.

Also ruled on, unprompted: **IX.35 "bound" not "found"** and **PG's ellipsis
against Standard Ebooks' added "done"** — both correct; **IX.40 "Pray thou"
against "Another prays"** — correct, and decisive on internal evidence;
**IX.28's Standard Ebooks paragraph break** — correctly ignored, and in any
case a 43rd paragraph would break the package's hard alignment constraint.

## The "shall" audit

Long has eleven in Book IX; the candidate keeps eight; three were removed.
**The rule is being applied consistently.** The three removed (all IX.3) are
plain futures in temporal or relative clauses and correctly take the plain
present or "will". Of the eight kept, six are IX.40's first-person
deliberative questions (licensed by name), one is IX.29's emphatic "shall"
(confirmed above), and one is IX.41's "how the mind … shall be free from
disturbances". That last is **right as rendered** but is an *indirect*
question, and the rule's text licenses only direct ones — see finding 41.1,
which proposes widening the rule's wording rather than changing the
candidate. No second-person "shall" and no plain-future "shall" survives
anywhere in the book.

## Next steps for the drafter

1. **Apply finding 40.1 in `candidate-v2.json`** (the one substantive
   finding): IX.40's three corrective turns are imperatives in Long and two of
   the three are not imperatives in the candidate. Proposed: "You, pray
   thus:" / "You, pray:" / "You thus:".
2. **Apply finding 9.1** — move one comma at IX.9, "and, in a way, loves", so
   "loves" is not read as a verb. One character.
3. **Correct `continuity.md` for finding 1.1**: IX.1 has three "inasmuch as",
   not four; the fourth "since" replaces Long's "for" and is unrecorded.
   Either restore "for" or record the substitution.
4. **Correct `GLOSSARY.md` for finding 41.1** before Book X is drafted: widen
   the deliberative-"shall" clause to cover indirect questions, citing IX.41.
5. **Rule and record** on the five optional findings (1.2, 3.1, 7.1, 28.1,
   29.1) — take them or leave them, but note which and why, as the earlier
   `ACCEPTANCE.md` files do.
6. Then steps 6–8: verify each changed passage against the source, read the
   corrected chapter continuously, and record acceptance in
   `book9/ACCEPTANCE.md` with the accepted file's hash.

Nothing in this round requires a rebuild of the staged original, and nothing
reopens an accepted book.
