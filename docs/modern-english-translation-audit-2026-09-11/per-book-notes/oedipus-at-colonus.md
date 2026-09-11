# oedipus-at-colonus — Oedipus at Colonus (Sophocles)

Batch B11 (Greek tragedy) · audit date 2026-09-11 · reviewer: batch agent B11

## Edition snapshot (from Phase 1 `mechanical/oedipus-at-colonus.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `72f7f95bf433c0ba` | 11 | 566 | 13,557 | Storr (1912), tr. Francis Storr |
| modern-en | `5c18460809bf2eac` | 11 | 566 | 14,767 | Modern English |
| modern-da | `04a3c0a06f626a65` | 11 | 566 | 14,526 | Moderne Dansk |

`en_editions_aligned: true`. chapter_count_mismatch false, para_count_mismatch_total 0,
truncated 0, empty 0, last_chapter_suspiciously_short false (2,115 words).
**mean_weighted_similarity 0.4875** (the lowest of the three Theban plays — the
most thoroughly rewritten), **pct_identical_long_paragraphs 0.0**.

## Core English text — provenance, completeness, rights

Francis Storr's 1912 Loeb verse translation. Complete — the play runs from
Antigone leading the blind Oedipus into the grove at Colonus through to
Theseus's refusal to show the tomb and the Chorus's closing "All is ordered for
the best." **Storr 1839–1919** → public domain in the US (pub. 1912) and in the
EU/Denmark (life+70 expired 1990). No rights issue on the source.

As with Oedipus Rex, Storr's verse lines have been flattened into run-on prose in
`original-en`, leaving verse capitals stranded mid-sentence. The modern edition
re-punctuates into real prose.

## Phase 1 flags — confirmed / disconfirmed

No Phase 1 flags. Independently re-verified:

- **0 truncated / 0 empty — CONFIRMED.** My own sweep of all 566 paragraph pairs
  (source ≥30 words, modern <72% of source) returned **zero** hits. Per-chapter
  word ratios all sit inside 1.05–1.15; none fell outside the 0.92–1.30 band.
- **Expansion sweep (my own):** exactly one paragraph exceeds 1.40× source length
  — ch 3 para 1, 27 → 38 words. I read it; it is benign ("names to me most sweet"
  → "names dearest in the world to me", plus an unpacked "how hardly… hardly").
  No content added.
- **0 identical long paragraphs — CONFIRMED.**
- **Archaism residue (my own metric):** `original-en` 53.1 hits/1,000 words —
  the *most* archaic source in this batch; `modern-en` **0.0**. The de-archaising
  pass is complete.

With no mechanical outlier available, my "difficult passage" samples are the
Messenger's account of Oedipus's disappearance (the longest and syntactically
hardest paragraph in the play, 480 source words in one block) and the
Creon/Oedipus agon.

## Shared structural defect (both editions)

The 11 chapter titles follow a generic tragic template (Prologue / Parodos /
Episodes 1–4 / Stasima 1–4 / Exodos) that **does not match where the choral odes
actually fall**. Chapter 4 "First Stasimon" is in fact an Oedipus–Chorus kommos
plus the arrival of Theseus; chapter 8 "Third Stasimon" is the Creon–Oedipus–
Theseus agon with no ode in it at all; the real Colonus ode ("You have come to a
horse-famed land…") sits in chapter 6, labelled "Second Stasimon". This is
inherited identically by `modern-en` from `original-en` — it is a **source-file
segmentation problem, not a translation defect** — but it will mislead a reader
navigating by chapter title, and it is worth a separate housekeeping ticket.

## Samples inspected (6)

### Sample 1 — opening. Chapter 1 (Prologue), paras 0–6

Source (para 1):
> "Child of an old blind sire, Antigone, What region, say, whose city have we
> reached? Who will provide today with scanted dole This wanderer? 'Tis little
> that he craves, And less obtains—that less enough for me; For I am taught by
> suffering to endure, And the long years that have grown old with me, And last
> not least, by true nobility."

Modern:
> "Antigone, child of an old blind father — tell me, what country is this? Whose
> city have we reached? Who today will offer even a meager handout to this
> wanderer? He asks for little, and gets less — but that little is enough for me.
> Suffering has taught me to endure, and so have the long years that have grown
> old alongside me, and not least my own true nobility."

Finding: **strong.** All three teachers (suffering, the long years, nobility) are
preserved as a list of three; the self-referential third person ("this wanderer…
he asks") is kept rather than normalised to "I". Nothing added.

### Sample 2 — the Colonus ode. Chapter 6 ("Second Stasimon"), paras 0–3 (complete ode)

Source (para 2):
> "And here there grows, unpruned, untamed, Terror to foemen's spear, A tree in
> Asian soil unnamed, By Pelops' Dorian isle unclaimed, Self-nurtured year by
> year; 'Tis the grey-leaved olive that feeds our boys; Nor youth nor withering
> age destroys The plant that the Olive Planter tends And the Grey-eyed Goddess
> herself defends."

Modern:
> "And here there grows, unpruned, untamed, a terror to enemy spears — a tree
> unknown in Asian soil, unclaimed by the Dorian isle of Pelops, self-renewing
> year after year: the grey-leaved olive that feeds our children. Neither youth
> nor withering age destroys the plant — the plant that the Olive Planter tends,
> and the Grey-eyed Goddess herself protects."

Finding: **strong, and choral register is clearly preserved.** This is the most
famous ode in Sophocles and it stays a hymn: nightingale, wine-dark ivy, narcissi
and crocus for "the Mother and the Daughter", the sleepless Cephisus, the olive,
the horse and the sea. The cult periphrases are left as periphrases — no
parenthetical "(Demeter and Persephone)" is inserted, which is exactly the
restraint the reading standard asks for. The mode is unmistakably different from
the surrounding dialogue.

### Sample 3 — agon. Chapter 8 ("Third Stasimon"), paras 0–2

Source (para 2, Oedipus's self-defence — 420 words in one paragraph):
> "Answer me now, if by some oracle My sire was destined to a bloody end By a
> son's hand, can this reflect on me, Me then unborn, begotten by no sire,
> Conceived in no mother's womb?"

Modern:
> "Answer me this: if by some oracle my father was destined to a bloody end at a
> son's hand, how can this reflect on me — on me, then unborn, begotten by no
> father, conceived in no mother's womb?"

Finding: **strong on fidelity.** The entire argument survives intact, including
the hypothetical that makes it ("if someone tried right now to take your life,
would you — man of justice — first inquire whether the attacker was perhaps your
father, or would you turn on him at once?") and the aphorism "Anger knows no old
age; only death can quiet it." No moralising commentary is added around a speech
that invites it.

**Two local defects, both in para 0 of the same chapter.** Source:
> "CHORUS. Thy case is perilous; though by birth and race Thou should'st be just,
> thou plainly doest wrong."

Modern:
> "CHORUS. Your case is desperate, stranger. By birth and family you should be a
> just man — yet you are plainly doing wrong."

(a) **"stranger" is invented** — there is no vocative in the source line.
(b) "perilous" → "desperate" shifts *dangerous* to *hopeless*. Neither is
substantive, but they are the clearest additions I found in the play.

### Sample 4 — Theseus's pledge. Chapter 5 (Second Episode), paras 45–51

Source:
> "THESEUS. I know that none Shall hale thee hence in my despite. Such threats
> Vented in anger oft, are blusterers, An idle breath, forgot when sense returns."

Modern:
> "THESEUS. I know this — that no one will drag you from here against my will.
> Such threats, thrown out in anger, are often bluster — idle breath, forgotten
> when sense returns."

Finding: **strong.** Note "OEDIPUS. 'Tis fear constrains me." → "It is fear that
makes me press." — a slight loosening (the source says fear *constrains* him),
but it reads better and does not change the relation.

### Sample 5 — hardest passage: the Messenger's narration. Chapter 11 (Exodos), paras 12–19

The 480-word single-paragraph account of Oedipus's disappearance. Source:
> "But by what doom the stranger met his end No man save Theseus knoweth. For
> there fell No fiery bold that reft him in that hour, Nor whirlwind from the sea,
> but he was taken. It was a messenger from heaven, or else Some gentle, painless
> cleaving of earth's base; For without wailing or disease or pain He passed
> away—and end most marvelous."

Modern:
> "But by what doom the stranger met his end, no one knows except Theseus. No
> fiery bolt struck him down in that hour, no whirlwind came off the sea — he was
> simply taken. It was a messenger from heaven, or else some gentle, painless
> opening of the earth. For without lament, without sickness, without pain, he
> passed away — the most marvelous end."

Finding: **strong.** This is the hardest single block in the play and nothing is
lost: the topography (the brazen Threshold, the pact of Theseus and Peirithous,
the Thorician rock, the hollow pear-tree, the marble tomb), Oedipus's speech to
his daughters with the one-word hinge "love", the thrice-repeated summoning
voice, the oath sworn to Theseus, and the messenger's closing self-defence ("if
my tale seems foolish to some, I am content to be called a fool by such men").
The "or else" of the double explanation — the passage's deliberate refusal to say
what happened — is preserved, not resolved.

Source typo "No fiery bold" is silently corrected to "bolt"; "cleaving of earth's
base" flattens slightly to "opening of the earth".

### Sample 6 — ending. Chapter 11 (Exodos), paras 20–29 and 74–80

Source (para 77):
> "THESEUS. My children, he Charged me straitly that no moral Should approach the
> sacred portal"

Modern:
> "THESEUS. My children, he charged me strictly that no mortal should approach
> the sacred threshold"

Finding: **strong.** Ends correctly on "Wail no more. Let sorrow rest. All is
ordered for the best." The sisters' kommos earlier (paras 23–29) keeps its lyric
mode. Storr's typo "no moral" is corrected.

## Cross-book name consistency (Theban plays)

Verified programmatically across all three modern-en files: Oedipus, Creon,
Antigone, Ismene, Polyneices, Eteocles, Theseus, Laius, Thebes, Phoebus, Apollo
are rendered identically in every book. One deliberate and correct change here:
Storr's Gutenberg text misspells Polyneices' brother as "Etocles" in ch 9 para 48;
`modern-en` silently corrects it to "Eteocles", matching the spelling used in
`antigone`. That is a consistency *improvement*, not a drift.

## Phase 3 — human-edition research

Shared with `oedipus-rex` (same translator, same corpus) — full table there. In
brief:

- **Source accessible enough for SOURCE + GLOSSES?** No. Storr here is the most
  archaic text in this batch (53.1 archaisms/1k words) with verse flattened to
  run-on prose.
- **Jebb (1888/1917, complete prose, PD everywhere)** — read the actual text
  ("knowest thou", "thou seest", "unmeet", "ye"). More accurate than Storr, but
  not more accessible. Rejected on accessibility.
- **Plumptre (1878), Campbell (1906), Harry (1911), E. P. Coleridge (1905)** — PD,
  identified but **unverified for accessibility** in this search.
- **Ian Johnston, *Oedipus at Colonus* (VIU)** — best-reading modern candidate,
  but the johnstonia copyright page states "No commercial publishing of these
  materials is permitted, without the written permission of Ian Johnston."
  **Permission required**; Tinct's Premium tier makes this commercial use.
- **George Theodoridis (Bacchicstage)** — noncommercial only.

**Conclusion:** no readable *and* rights-clear human English edition found in this
search. Johnston under written licence would be a genuine upgrade and is worth an
email.

## Ratings

| Dimension | Weight | Score |
|---|---|---|
| Fidelity / completeness | 40% | 5 |
| First-read clarity | 25% | 5 |
| Literary voice | 20% | 5 |
| Restraint / no invention | 10% | 4 |
| Naturalness | 5% | 5 |

**Weighted score 4.9 — band: Strong.**

Restraint loses a point for the invented "stranger" vocative and the
perilous→desperate shift.

## Recommendation

**KEEP CURRENT MODERN EDITION.** Confidence: **medium-high**.

Six passages sampled (~1,600 source words) covering the opening, the play's
signature choral ode, the central agon, Theseus's pledge, the hardest narrative
block, and the ending. No substantive omission or invention found; all 566
paragraph pairs mechanically re-verified for truncation and expansion. The two
defects found are both single-phrase and sit in one paragraph.

The one thing genuinely worth fixing is **not** in the translation: the chapter
titles mislabel which units are odes and which are episodes. That should be filed
as a separate source-structure ticket covering both `original-en` and `modern-en`
(and probably all three Theban plays).

**Correction scope: local.**

## Limitations of this review

- I read 5 of 11 chapters closely (1, 5, 6, 8, 11) plus targeted spot-checks in
  ch 3, 4 and 9. Chapters 2, 7 and 10 were checked mechanically only.
- `modern-da` not evaluated; out of scope.
- No comparison against the Greek — all fidelity judgements are fidelity to Storr.
- The chapter-title/structure mismatch was confirmed for this play; I checked it
  only informally in `oedipus-rex` (where the divisions look closer to correct)
  and did not audit it in `antigone`.
- PD alternatives other than Jebb were not text-sampled.
- No in-app rendering check.
