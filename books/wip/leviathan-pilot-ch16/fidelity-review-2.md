# Fidelity Review — Round 2

**Text:** Hobbes, *Leviathan*, edition chapter 16 (Hobbes's ch. 15, "Of Other Laws of Nature")
**Source (locked):** `source.json` — 43 paragraphs
**Candidate:** `candidate-sonnet.json` — 43 paragraphs
**Baseline for diff:** round-1-certified candidate at `dc361d4a~1`
**Date:** 2026-09-21

## VERDICT: ACCEPT AS-IS

All five round-2 edits are faithful to source and each resolves the round-1 defect it
was aimed at. No new fidelity defects introduced. No regressions elsewhere.

---

## Change-set integrity

Mechanical diff of round-1 candidate vs. current candidate: **exactly 5 of 43
paragraphs changed** — indices **5, 11, 13, 21, 41**. 38/43 byte-identical.

`source.json` is unchanged from its round-1 state (sha256 match against
`dc361d4a~1`); the working tree is clean against `HEAD` (`dc361d4a`), so the file
reviewed here is the committed file. Paragraph count, chapter `number` (16) and
title are unchanged.

### Paragraph-number correction to the change log

The change log's paragraph numbering is **shuffled** relative to the actual file.
The five edits did all land, but at different indices than the brief stated:

| Change log said | Actually landed at | Content |
| --- | --- | --- |
| 5 | **5** ✓ | "gaining heaven" — *by any means whatever* |
| 21 | **11** | master / servant / stranger — *whom he therefore could not have wronged* |
| 41 (arith./geom.) | **13** | commutative / distributive proportion glosses |
| 11 | **21** | Aristotle / equality — *have no confidence in their own wisdom* |
| 13 | **41** | *And consequently all men agree* |

The set of touched paragraphs is identical to the set of intended fixes; only the
index labels were transposed. Nothing was edited that was not meant to be edited.

---

## Per-edit verification

### Paragraph 5 — "gaining heaven" — PASS (key fix confirmed)

- **Source:** "As for the Instance of gaining the secure and perpetuall felicity of
  Heaven, **by any way**; it is frivolous: there being but one way imaginable; and
  that is not breaking, but keeping of Covenant."
- **R1:** "…by **breaking one's word** — that argument is worthless, since there is
  only one way…"
- **R2:** "…by **any means whatever** — that argument is worthless, since there is
  only one way…"

R1 narrowed Hobbes's general premise ("by any way") to one specific method, which
made the sentence self-refuting: it asserted breaking one's word as the method and
then in the same breath said the only imaginable way is *not* breaking but keeping
covenant. R2's "by any means whatever" is a direct, non-narrowing rendering of "by
any way", and the self-refutation is gone: the Fool's instance is now the *general*
claim (heaven may be gained by whatever route), which Hobbes then rebuts by naming
the single route. Argument structure now matches source exactly. **Resolved.**

### Paragraph 11 — master / servant / stranger — PASS

- **Source:** "…the dammage redoundeth to the stranger, to whom **he** had no
  Obligation; and therefore could not Injure him."
- **R1:** "…the damage falls on the stranger, to whom the servant owed nothing, and
  so could not have wronged." — grammatically incomplete; the relative clause had no
  object, leaving the reader to supply "him", and the elided subject of "could not
  have wronged" was ambiguous.
- **R2:** "…to whom the servant owed nothing, and **whom he therefore could not have
  wronged**."

The sentence is now complete: "whom" (= the stranger) is the object, "he" is the
subject. Antecedent check: the nearest and only available masculine singular
referent in the preceding clause is **the servant** ("to whom the servant owed
nothing"); the master is last named earlier and in a clause whose own relative
pronoun ("whom the servant had earlier covenanted to obey") already fixes the master
as an object, not a subject. "He" therefore reads as the servant, which matches
Hobbes: the servant owes the stranger nothing, so the servant cannot injure him —
the injury lands on the master, the damage on the stranger. **Correct referent,
complete sentence, meaning matches source.**

### Paragraph 13 — arithmetical / geometrical glosses — PASS (addition, accurate)

- **Source:** "…the former they say consisteth in proportion Arithmeticall; the
  later in proportion Geometricall."
- **R2:** "the first, they say, follows arithmetical proportion **— that is,
  equality of amount —** the second geometrical proportion **— that is, equality of
  ratio**."

Confirmed: both glosses are **editorial additions not present in source**. Assessed
on accuracy, scope and internal consistency:

- *Arithmetical proportion → equality of amount.* Correct as commonly understood and
  as Hobbes uses it here. Commutative justice on the schoolmen's account equalizes
  the quantity exchanged (equal value given for value received) — an arithmetic
  equality of amounts, not of ratios.
- *Geometrical proportion → equality of ratio.* Correct. Distributive justice
  equalizes the ratio of share to merit across recipients (a : merit(a) :: b :
  merit(b)) — the Aristotelian/Euclidean geometric proportion.
- *No overreach.* Both glosses stay inside the clause Hobbes explicitly attributes to
  other writers ("they say"), so neither puts a claim in Hobbes's own mouth, and
  neither pre-empts his rejection of the distinction later in the same paragraph.
- *No contradiction downstream.* The paragraph goes on to locate commutative justice
  "in the equal value of the things exchanged in a contract" (= equality of amount)
  and distributive "in giving an equal benefit to men of equal merit" (= equality of
  ratio). The glosses agree with both, and are in fact glosses the paragraph's own
  next sentence independently supports. Hobbes's subsequent verdict — that "this
  distinction, understood the way it's usually explained, isn't correct" — is
  untouched and still reads cleanly, because the glosses explain what the writers
  mean, not whether they are right.

Minor stylistic note (not a fidelity issue, no fix required): the sentence now
carries three em-dashes, and the second gloss is closed by the sentence-final period
rather than by a matching dash, so the dash pairing is asymmetric. It parses
correctly and the accessibility pass may or may not wish to tighten it; it does not
affect meaning.

### Paragraph 21 — Aristotle / ninth law — PASS (referent flip confirmed fixed)

- **Source:** "Nor when the wise in their own conceit, contend by force, with **them
  who distrust their owne wisdome**, do they alwaies, or often, or almost at any
  time, get the Victory."
- **R1:** "…try to force their will on people who **distrust that wisdom**…" — flips
  the referent: it makes the opposing party people who doubt *the self-styled wise
  men's* wisdom.
- **R2:** "…try to force their will on people who **have no confidence in their own
  wisdom**…"

"Their own" now attaches to the subject of its own clause ("people"), correctly
identifying the **modest/humble party who doubt their own wisdom** — Hobbes's
contrast between the self-conceitedly wise and the diffident, not between the
conceited and their critics.

This restores the ninth law's argument. Hobbes's point is *a fortiori*: even against
those who make no claim to wisdom at all, the self-styled wise seldom or never win by
force — so the supposed natural command-fitness of the wiser sort is refuted by
experience, and Aristotle's natural hierarchy collapses. The R1 reading (conceited
vs. sceptics-of-their-wisdom) made it a contest between two confident parties and
drained the *a fortiori* force, weakening the bridge to "That every man acknowledge
other for his Equall by Nature." The surrounding sentences (the preference for
self-government, the equal-terms-for-peace argument, the ninth law itself, pride as
its breach) are unchanged and now follow from the corrected clause. **Resolved.**

### Paragraph 41 — causal connective — PASS

- **Source:** "…as private Appetite is the measure of Good, and Evill: **and
  consequently** all men agree on this, that Peace is Good…"
- **R1:** "…private appetite is the measure of good and evil. **And yet** all men
  agree on this much: that peace is good…"
- **R2:** "…private appetite is the measure of good and evil. **And consequently**
  all men agree on this much: that peace is good…"

R1's "And yet" reversed a causal connective into a concessive one, presenting the
agreement on peace as a surprise *despite* the rule of private appetite. R2 restores
the source's "and consequently": because each man's own appetite measures good and
evil, and because war threatens every man's own preservation, it follows for each
appetite alike that peace is good — and hence that the means to peace (justice,
gratitude, modesty, equity, mercy and the rest) are good, i.e. the moral virtues.
That inference is exactly the hinge the rest of the paragraph stands on ("the science
of virtue and vice is moral philosophy, and so the true doctrine of the laws of
nature is the true moral philosophy"). Relationship is now consequential, matching
source. **Resolved.**

---

## Eighteenth-law numbering anomaly — UNTOUCHED (as required)

Paragraph 32 carries the bracketed marginal note:

> `[The eighteenth law: no man should be judge who has in him a cause of bias.]`

against source paragraph 32:

> `The Eighteenth, No Man To Be Judge, That Has In Him Cause Of Partiality`

Paragraph 32 is **not** in the round-2 change set and is byte-identical to its
round-1-certified state (sha256 prefix `2ee97e69b7e3` both sides). The ordinal was
**not** renumbered, correctly preserving Hobbes's own inconsistent marginal numbering
as round-1 fidelity certified. No action.

---

## Spot-checks on untouched paragraphs

Byte-identical to round-1-certified state (sha256, first 12 hex shown):

| ¶ | hash | | ¶ | hash |
| --- | --- | --- | --- | --- |
| 0 | `f7b225447af6` | | 18 | `cb74698c869f` |
| 1 | `efe323fe4ed8` | | 20 | `01dc4da6a0cb` |
| 2 | `00deceae1293` | | 22 | `800d5bc77140` |
| 4 | `dfcb42531b49` | | 32 | `2ee97e69b7e3` |
| 6 | `e03df1e13cd9` | | 37 | `cbafdce274d4` |
| 10 | `774c0a3c9ebf` | | 40 | `155d5125bbf6` |
| 12 | `9aeade3045f6` | | 42 | `acd3ae731eb9` |
| 14 | `a3f40f1e344b` | | | |

Full-file check (not just spot-checks): every one of the 38 paragraphs outside
{5, 11, 13, 21, 41} is byte-identical. **No collateral drift.**

---

## Coverage statement

- Round-2 change set identified mechanically, not from the change log: 5/5 edits
  located and verified against source (¶5, 11, 13, 21, 41).
- Arithmetical/geometrical fix located by content search, as instructed — it is at
  ¶13, not ¶41.
- Change-log paragraph numbering found to be transposed; corrected above. No
  unintended paragraph was touched.
- Eighteenth-law marginal note confirmed unchanged.
- 38/38 untouched paragraphs confirmed byte-identical (14 listed explicitly).
- Source file confirmed locked (unchanged since round 1); working tree clean.

**No fixes required. Ready for the accessibility pass / round-2 sign-off.**
