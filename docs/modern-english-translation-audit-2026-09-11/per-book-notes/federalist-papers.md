# federalist-papers — The Federalist Papers, Hamilton, Madison, Jay (as "Publius")

**Scope:** public. Audited 2026-09-11. Batch B20.

## Edition snapshot (Phase 1)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `c733011184b5b42d` | 85 | 1,279 | 188,055 | "Original (1788)", year `1788` |
| modern-en | `1974574ebce6859b` | 85 | 1,279 | 178,251 | "Modern English" |
| modern-da | `0f4dc8cf0faeb96a` | 85 | 1,279 | 167,604 | "Moderne Dansk" |

Mechanical comparison: mean weighted similarity **0.8328**, identical long paragraphs **4.5%**, 0
truncations, 0 empty paragraphs, alignment intact.

**Completeness: all 85 papers present, numbered 1–85, each chapter title carrying an author
attribution** (Hamilton / Madison / Jay / "Hamilton & Madison" for 18–20). Paragraph counts match
exactly across all three editions. No. 85's three closing footnotes are carried as paragraphs 15–17
in both English editions.

## The central finding: the book was modernised in two different ways

Phase 1 reports one similarity number for the book (0.83). That number is an average over a
**bimodal** distribution, and the average is misleading. I recomputed per-chapter weighted
similarity against `original-en`:

| band | papers | count | words | share |
|---|---|---|---|---|
| **near-untouched** (sim ≥ 0.65) | **28, 29, 30, 31, 32, 33, 34, 38, 63, 64, 65, 66, 67, 68** | 14 | 28,821 | 15.3% |
| partial (0.50–0.65) | 20, 23, 27, 40, 43, 47, 56, 57, 58, 60, 62, 84 | 12 | 28,241 | 15.0% |
| thoroughly modernised (< 0.50) | the other 59 | 59 | 130,993 | 69.7% |

The near-untouched set is **two contiguous runs plus one stray** — Nos. 28–34, No. 38, and Nos.
63–68. That shape says a production run, not an editorial judgement: whatever generated the modern
edition either skipped or lightly passed over two blocks. Within those blocks, papers reach sim 0.98
(No. 34) and 0.97 (No. 38), i.e. word-for-word.

Nothing is *missing* in those papers — they are complete. They simply are not modern English, and a
reader who switches to the "Modern English" edition there gets the 1788 text back with a handful of
word swaps.

## Samples inspected (11)

Spread across the span (1, 2, 10 early; 34, 35, 36, 38, 51 middle; 64, 66, 70, 78 late) and across
all three authors (Hamilton ×6, Madison ×3, Jay ×2).

### 1. No. 1 (Hamilton) — opening

SRC ¶0: *"AFTER an unequivocal experience of the inefficacy of the subsisting federal government,
you are called upon to deliberate on a new Constitution… whether societies of men are really capable
or not of establishing good government from reflection and choice, or whether they are forever
destined to depend for their political constitutions on accident and force."*
MOD ¶0: *"After clear and unmistakable evidence that the existing federal government does not work,
you are now called upon to deliberate on a new Constitution… whether human societies are truly
capable of building good government from reflection and choice, or whether they are forever doomed
to depend on accident and force for their political constitutions."*

SRC ¶3: *"For in politics, as in religion, it is equally absurd to aim at making proselytes by fire
and sword. Heresies in either can rarely be cured by persecution."*
MOD ¶3: *"In politics, as in religion, it is equally absurd to try to make converts by fire and
sword. Heresies in either field can rarely be cured by persecution."*

**Finding — strong.** This is the edition at its best: complete, the governing antithesis
("reflection and choice" / "accident and force") preserved intact, the images kept rather than
explained, Hamilton's forward pressure intact. The only quibble: *"it seems to have been reserved to
the people of this country"* → *"the people of this country seem to have been chosen"* supplies an
agent where the source has a passive with providential overtones.

### 2. No. 2 (Jay) — the union as inheritance

SRC ¶3: *"…one connected, fertile, wide-spreading country was the portion of our western sons of
liberty. Providence has in a particular manner blessed it… A succession of navigable waters forms a
kind of chain round its borders, as if to bind it together."*
MOD ¶3: *"…one connected, fertile, wide-spreading country was the inheritance of our western sons of
liberty. Providence has, in a special way, blessed it… A succession of navigable waters forms a kind
of chain around its borders, as if to bind it together."*

**Finding — strong.** Jay's warm, ceremonious register survives. "Portion" → "inheritance" is a
correct gloss of the older sense. The chain image is kept, not paraphrased into "natural borders".

### 3. No. 10 (Madison) — factions

SRC ¶4: *"Liberty is to faction what air is to fire, an aliment without which it instantly
expires."*
MOD ¶4: *"Liberty is to faction what air is to fire—a fuel without which it instantly dies."*

SRC ¶7: *"…because his interest would certainly bias his judgment, and, not improbably, corrupt his
integrity."*
MOD ¶7: *"…because his interest would certainly bias his judgment and quite likely corrupt his
integrity."*

**Finding — strong, one micro-slip.** The whole argument survives with its structure: the two
methods of removing causes, the two of controlling effects, the property clause, the judge-in-his-
own-cause sequence, "Every shilling with which they overburden the smaller number is a shilling
saved to their own pockets." *Aliment* → *fuel* is a good equivalence. *"Not improbably"* → *"quite
likely"* upgrades a litotes into a positive probability estimate — a small strengthening of a hedge,
of the kind the reading standard names.

### 4. No. 34 (Hamilton) — mechanical outlier, sim 0.98

SRC ¶2 / MOD ¶2 (identical, 93 words): *"In the case particularly under consideration, there is no
such contradiction as appears in the example cited; there is no power on either side to annul the
acts of the other. And in practice there is little reason to apprehend any inconvenience; because,
in a short course of time, the wants of the States will naturally reduce themselves within A VERY
NARROW COMPASS…"*

SRC ¶3: *"…it will be well to advert to the proportion between the objects **which** will require a
federal provision… Constitutions of civil government are not to be framed **upon** a calculation of
existing exigencies…"*
MOD ¶3: *"…it will be well to advert to the proportion between the objects **that** will require a
federal provision… Constitutions of civil government are not to be framed **on** a calculation of
existing exigencies…"*

**Finding — failing (LIGHT/MECHANICAL false modern).** The entire difference between the two
editions in this 2,209-word paper is *which*→*that* and *upon*→*on*. "Advert to", "exigencies",
"illimitable", "circumscribed within very moderate bounds" all stand. This is a modern edition in
label only.

### 5. No. 38 (Madison) — the worst case, sim 0.97

SRC ¶7 / MOD ¶7 **byte-identical, 409 words**, beginning *"As it can give no umbrage to the writers
against the plan of the federal Constitution, let us suppose, that as they are the most zealous, so
they are also the most sagacious, of those who think the late convention were unequal to the task
assigned them…"* and running unbroken to *"…not until a BETTER, but until ANOTHER should be agreed
upon by this new assembly of lawgivers."*

SRC ¶1 / MOD ¶1 **byte-identical, 146 words** (the Minos/Zaleucus/Lycurgus catalogue).
SRC ¶0 vs MOD ¶0: the only change is *"IT IS not a little remarkable"* → *"It is not a little
remarkable"*, plus one removed comma.

**Finding — failing.** 886 of this paper's 3,315 words sit in byte-identical paragraphs, and the
rest differ only in punctuation. The 409-word single sentence quoted above is precisely the sort of
periodic construction a modern edition exists to break up; it is delivered untouched.

### 6. No. 35 (Hamilton) — heaviest compression, −25% words

SRC ¶1 (314 w): *"…they tend to render other classes of the community tributary, in an improper
degree, to the manufacturing classes, to whom they give a premature monopoly of the markets; they
sometimes force industry out of its more natural channels into others in which it flows with less
advantage…"*
MOD ¶1 (228 w): *"…They tax other classes of the community to benefit the manufacturing class by
giving manufacturers a premature monopoly. They sometimes force industry out of its natural channels
into less productive ones…"*

**Finding — borderline.** Most of the 86-word drop is legitimate: 18th-century doubling
("prejudicial to the fair trader" → "hurts honest traders") compressed without loss, and the result
reads very well. But *"in an improper degree"* is a qualification Hamilton put in deliberately — he
is not saying tariffs make other classes tributary, he is saying they do so *improperly* — and
*"of the markets"* is dropped from the monopoly. Small, but this is the pattern to watch in the
compressed papers.

### 7. No. 36 (Hamilton) — largest absolute word loss, −615

SRC ¶5 (204 w) → MOD ¶5 (123 w). SRC: *"The circumstances that may distinguish its situation in one
State from its situation in another must be few, simple, and easy to be comprehended. The principal
thing to be attended to, would be to avoid those articles which had been previously appropriated to
the use of a particular State…"*
MOD: *"The differences between the article's situation in different states must be few, simple, and
easy to grasp. The main thing to attend to would be avoiding articles already taxed by particular
states…"*

**Finding — strong.** I checked the two biggest-drop paragraphs in the chapter and found no lost
claim; the loss is redundancy. "Appropriated to the use of a particular State" → "already taxed by
particular states" is an interpretation, but the correct one.

### 8. No. 51 (Madison) — "if men were angels"

SRC ¶3 / MOD ¶3 are effectively identical through the famous stretch: *"Ambition must be made to
counteract ambition… If men were angels, no government would be necessary. If angels were to govern
men, neither external nor internal controls on government would be necessary."*
SRC ¶4: *"This policy… **might** be traced through the whole system of human affairs."*
MOD ¶4: *"This policy… **can** be traced through the whole system of human affairs."*

**Finding — strong, one micro-slip.** The set-piece is rightly left alone — there is nothing to
modernise. *Might*→*can* converts a modest hypothetical into a capability claim; the same class of
modal drift as No. 10's "not improbably".

### 9. No. 64 (Jay) — near-untouched, sim 0.86

SRC ¶4 / MOD ¶4, near-identical: *"…seem not to **recollect / recall** that such a body must
necessarily be inadequate to the attainment of those great objects which require to be steadily
contemplated in all their relations and circumstances, and which can only be approached and achieved
by measures which not only talents, but also exact information, and often much time, are necessary
to concert and to execute."*

**Finding — failing (LIGHT/MECHANICAL).** "Obviate the inconvenience", "a considerable residue of
the old ones in place", "concert and to execute" all survive into the "modern" edition. Two word
swaps (*As*→*Since*, *recollect*→*recall*) in a 2,304-word paper.

### 10. No. 66 (Hamilton) — near-untouched, sim 0.89

SRC ¶1 / MOD ¶1: the only substantive change in the paragraph is *"the ablest **adepts** in
political science"* → *"the ablest **experts** in political science"*. *"An absolute or qualified
negative in the executive upon the acts of the legislative body"* — the single hardest phrase in the
paragraph for a modern reader — is untouched.

**Finding — failing (LIGHT/MECHANICAL).**

### 11. No. 70 (Hamilton) and No. 78 (Hamilton) — late, thoroughly done

No. 70 SRC ¶0: *"Energy in the Executive is a leading character in the definition of good
government."* → MOD: *"Energy in the Executive is a defining feature of good government."* The Roman
dictator sentence (a 100-word periodic construction) is correctly broken into two, with all three
"as well against… as against" limbs preserved as a three-part list.
No. 78 SRC ¶10: *"There is no position which depends on clearer principles, than that every act of a
delegated authority, contrary to the tenor of the commission under which it is exercised, is void."*
→ MOD: *"There is no position that depends on clearer principles than this: that every act of a
delegated authority contrary to the tenor of the commission under which it is exercised is void."*

**Finding — strong (No. 70), borderline (No. 78).** No. 70 is excellent. No. 78 is faithful but
barely modernised in this stretch — "manifest tenor of the Constitution", "the medium of courts of
justice", "tenor of the commission" all survive. Accurate, low clarity gain.

## Author register — checked specifically, and it holds up

The brief asked whether Hamilton's urgency, Madison's analysis and Jay's diplomacy get homogenised.
**They do not.** I found no evidence of a single flattened house voice. The reason is structural
rather than virtuous: the edition stays close to each author's sentence architecture, so the
differences carry through automatically. Hamilton's declarative hammer-blows in No. 70 ("A feeble
execution is just another phrase for bad execution"), Madison's balanced taxonomies in No. 10, Jay's
courteous periods in No. 2 are all recognisably themselves. Where an author's papers fall in the
near-untouched band (Jay's No. 64, Hamilton's Nos. 28–34, Madison's No. 38) the voice is preserved
trivially, because the text is the original.

## Phase 1 flags — confirmed / disconfirmed

- **Mean similarity 0.8328 → CONFIRMED but MISLEADING.** Recomputed 0.83; the distribution is
  bimodal (14 papers ≥ 0.65, 59 papers < 0.50). The single average hides the defect. Recommend the
  mechanical pass report per-chapter dispersion, not just the mean, for multi-part books.
- **4.5% identical long paragraphs → CONFIRMED and localised.** Independently: 3,895 of 188,055
  source words (2.1%) sit in byte-identical paragraphs, concentrated in Nos. 38 (886 w), 67 (348 w),
  9 (276 w), 43 (398 w), 44 (292 w), 31 (192 w).
- **0 truncations / 0 empty paragraphs / 85-85 chapters / 1,279-1,279 paragraphs → CONFIRMED.**
- **"last chapter suspiciously short" false → CONFIRMED**; No. 85 is complete including footnotes.
- **Not flagged by Phase 1, found here:** the word-count drop is unevenly distributed — Nos. 35
  (−25%) and 36 (−21%) lose a fifth to a quarter of their words while Nos. 34 and 38 lose none. I
  spot-checked the two heaviest and found compression, not omission, with one lost qualifier.

## Phase 3 — human-edition research

**English original; the rights position is clean and no alternative edition is needed for rights
reasons.** The 1788 text is public domain everywhere (Project Gutenberg #1404, Library of Congress,
Avalon Project). `original-en` matches the standard McLean/Gideon-derived public text, complete with
the traditional author attributions.

The Phase 3 question that applies: **does the original meet our reading standard on its own?** Here
the answer is **no**, and this is the book in the batch where a modern edition is most clearly
justified. Federalist prose is not merely old-fashioned; it is genuinely obstructive — 300- and
400-word periodic sentences, a technical 18th-century political vocabulary (*negative* for veto,
*adepts*, *exigencies*, *tributary*, *aliment*, *illimitable*), and nested subordination that most
capable modern readers cannot hold. 175,000 words of it is a real barrier, and the thoroughly
modernised 70% of this edition demonstrably removes it.

**No human modernisation candidate was sought.** I am not aware of a complete, rights-clear
modern-English rendering of all 85 papers; the well-known reading editions (Rossiter/Kesler for
Signet, Ball for Cambridge, Carey & McClellan for Liberty Fund) are annotated presentations of the
*original* text, not modernisations, and their apparatus is in copyright. Liberty Fund's edition is
free to read online but that is not a redistribution licence. Record this as **none sought for
modernisation; annotated originals are all in copyright or unverified** — not as "none exists".

## Ratings

| dimension | score | note |
|---|---|---|
| fidelity/completeness (40%) | **4** | All 85 papers complete and aligned; no omissions found in 11 samples including the two most compressed. Minor qualifier losses (No. 35 "in an improper degree") and modal drift (No. 10, No. 51). |
| first-read clarity (25%) | **3** | Excellent across ~70% of the book; **zero** clarity gain across 14 papers / 15% of the words, and marginal gain across another 12. A reader hitting Nos. 28–34 or 63–68 gets no help at all. |
| literary voice (20%) | **4** | Three distinct authorial registers preserved; images and antitheses kept rather than explained. |
| restraint / no invention (10%) | **4** | Very little added. A few silent interpretive resolutions, all defensible. |
| naturalness (5%) | **4** | Where modernised, the prose is genuinely good English. |

**Weighted score: 3.8 — band: Good with fixes.**

## Recommendation

**LIGHT EDIT** — confidence **medium-high**. Correction scope: **substantial** in volume, but
precisely bounded.

The defect is recurring rather than local, which normally points to RETRANSLATE — but retranslating
is the wrong call here, because 59 of 85 papers are good work that should not be thrown away. The
right characterisation is: **the modernisation pass is sound and was not run on about 15–30% of the
book.** The fix is to re-run it on an enumerated list, not to redo the book.

Priority list, in order (all 14 near-untouched, then the 12 partials):
`28, 29, 30, 31, 32, 33, 34, 38, 63, 64, 65, 66, 67, 68` — then `20, 23, 27, 40, 43, 47, 56, 57, 58,
60, 62, 84`.

Plus two one-line fixes from the samples: restore *"in an improper degree"* (No. 35 ¶1) and consider
reverting *"quite likely"* → *"not unlikely"* (No. 10 ¶7) and *"can be traced"* → *"might be
traced"* (No. 51 ¶4).

**Next action:** re-run the modernisation pass over papers 28–34, 38 and 63–68 (28,821 words), then
review the 12 partial-band papers; do not touch the other 59.

## Limitations of this review

- 11 papers sampled out of 85 (≈13%), covering roughly 25,000 of 188,055 source words. The
  near-untouched classification for the other 71 papers rests on a mechanical similarity
  recomputation, not on reading them — I read 4 of the 14 near-untouched papers (34, 38, 64, 66) and
  confirmed the mechanical signal in all four.
- "Strong in samples" is not "the whole book is verified." I did not check Nos. 3–9, 11–27, 39–50,
  52–62, 69, 71–77, 79–83 at all.
- I did not read `modern-da`.
- I did not collate `original-en` against a scholarly edition, so I cannot certify the 1788 text's
  accuracy beyond noting that the passages I quoted match the standard public text.
- I did not check footnote handling beyond No. 85, nor audio.
