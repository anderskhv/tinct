# bacchae — The Bacchae (Euripides)

Batch B11 (Greek tragedy) · audit date 2026-09-11 · reviewer: batch agent B11

## Edition snapshot (from Phase 1 `mechanical/bacchae.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `fd89db94d47b8a03` | 11 | 336 | 13,451 | Murray (1906), tr. Gilbert Murray |
| modern-en | `9d205d8b021e5028` | 11 | 336 | 14,283 | Modern English |
| modern-da | `0b34847e60f068f0` | 11 | 336 | 13,644 | Moderne Dansk |

`en_editions_aligned: true`. chapter_count_mismatch false, para_count_mismatch_total 0,
truncated 0, empty 0, last_chapter_suspiciously_short false (3,837 words).
**mean_weighted_similarity 0.6163**, **pct_identical_long_paragraphs 0.0**.

## ⚠ Core English text — provenance, completeness, and an UNRESOLVED RIGHTS QUESTION

**Gilbert Murray, *The Bacchae of Euripides*, translated into English rhyming
verse (1906).** Complete: Prologue through Exodos, ending on the Chorus's "There
are many shapes of mystery…"

**Gilbert Murray: born 2 January 1866, died 20 May 1957** (Britannica; Wikipedia;
Online Books Page lists him as "Murray, Gilbert, 1866-1957").

That death date is the problem.

- **United States:** published 1906 → public domain (pre-1929). No issue.
- **EU / Denmark:** copyright term is the author's life + 70 years (harmonised by
  Directive 2006/116/EC). Murray died in 1957 → **his translations appear to
  remain in copyright in the EU, including Denmark, until 31 December 2027, and
  to enter the public domain on 1 January 2028.**

Tinct operates from Denmark, serves globally, and sells a paid Premium tier. Two
things follow, and I am flagging both as **unresolved**, not as legal conclusions
— I am not qualified to give a legal opinion and this needs a real one:

1. `bacchae-original-en.json` is a **verbatim reproduction** of Murray's 1906
   translation, labelled as such in the registry ("Murray (1906)", translator
   "Gilbert Murray"). If the EU term analysis above is right, Tinct is currently
   distributing a text that is still under copyright in its home jurisdiction.
2. `bacchae-modern-en.json` is a **close, paragraph-by-paragraph derivative** of
   that same translation — 336 paragraphs aligned one-to-one, preserving
   Murray's imagery, diction and line order. Whether that constitutes a
   derivative work under Danish/EU law is exactly the sort of question I should
   not answer. It should not be assumed to be clean merely because it is a
   rewrite.

`medea` has the identical problem, same translator. No other book in this batch
does: Storr (d. 1919) and Morshead (d. 1912) are PD everywhere.

**There is a clean, rights-clear substitute source** — see Phase 3.

## Phase 1 flags — confirmed / disconfirmed

No Phase 1 flags. Independently re-verified:

- **0 truncated / 0 empty — CONFIRMED.** My own sweep of all 336 paragraph pairs
  (source ≥30 words, modern <72% of source) returned **zero** hits; no paragraph
  exceeded 1.40× expansion; no chapter fell outside a 0.92–1.30 word-ratio band.
- **0 identical long paragraphs — CONFIRMED.** Even Murray's stage directions are
  rewritten here (re-punctuated and bracketed), unlike in the Oresteia.
- **Archaism residue (my own metric):** `original-en` 44.0 hits/1,000 words;
  `modern-en` **0.84** (12 total: `hither` ×8, `behold` ×4). Both are defensible
  in an invocatory choral register ("Hither, O fragrant of Tmolus the Golden!"),
  though "hither" ×8 is more than I would leave.

No mechanical outlier existed, so my difficult-passage samples are the Dionysus
prologue (one 600-word block of Murray's rhymed couplets) and the Messenger's
sparagmos narration (the longest single paragraph in the play).

## Samples inspected (6)

### Sample 1 — opening. Chapter 1 (Prologue), paras 0–2

Murray's prologue is a single 600-word paragraph of rhyming couplets — the
hardest reading in the book. Source:
> "For they have scorned me whom it least beseemed, / Semele's sisters; mocked my
> birth, nor deemed / That Dionysus sprang from Dian seed. / My mother sinned, said
> they; and in her need, / With Cadmus plotting, cloaked her human shame / With the
> dread name of Zeus"

Modern:
> "For they have scorned me, those who least should have — Semele's own sisters;
> they mocked my birth and refused to believe that Dionysus was sprung from divine
> seed. My mother sinned, they said; **some mortal lay with her**, and at Cadmus'
> urging she covered her human shame with the dread name of Zeus"

Finding: **strong overall, one confirmed invention.** The whole catalogue of
Dionysus's eastward travels (Lydia, Phrygia, Persia, Bactria, Media, Araby the
Blest), the Semele tomb with its undying fire, Hera's hatred, the maddened women
on Cithaeron, the war against Pentheus and the closing call to the Lydian band
all survive intact. Murray's rhyme is gone, unavoidably; his imagery is not.

But **"some mortal lay with her" is not in the source.** It is an explanatory
gloss of what "my mother sinned" means — a correct reading of the Greek, but an
addition, and the reading standard is explicit that interpretations not in the
source should not be added. This is the clearest invention I found in the batch.

Two smaller changes in the same paragraph: "my maids" → "my Maenads" (introduces
a technical term the source does not use at that point), and "maniac armies
battled after me" → "lead a maddened army into war for me" (Dionysus stands in
their path *with* armies behind him; the modern makes him the leader marching
them out).

### Sample 2 — choral ode (Parodos). Chapter 2, paras 0–4

Source (para 2):
> "Oh, blessed he in all wise, / Who hath drunk the Living Fountain, / Whose life no
> folly staineth, / And his soul is near to God; / Whose sins are lifted, pall-wise,
> / As he worships on the Mountain, / And where Cybele ordaineth, / Our Mother, he
> has trod"

Modern:
> "Blessed in every way is the man who has drunk from the Living Fountain, whose
> life no folly stains, whose soul stands near to God; whose sins are lifted off
> him like a fallen pall as he worships on the Mountain, and where Cybele our
> Mother ordains, his foot has trodden."

Finding: **strong, and the choral mode is unmistakably preserved.** This is the
most purely lyric writing in Euripides and it stays hymnic and incantatory —
second person to the god, ritual cry embedded as quoted speech ("Up, O Bacchae,
wife and maiden! Come, O Bacchae, come!"), the double-birth myth told as myth,
the Timbrel's descent from Rhea to the Satyrs to Dionysus. It reads nothing like
the play's dialogue. No explanatory apparatus inserted around the cult
references.

One disambiguation worth flagging: Murray's "Whom erst in anguish lying / For an
unborn life's desire, / As a dead thing in the Thunder / His mother cast to earth"
is grammatically ambiguous about who casts whom; the modern resolves it ("his
mother was cast to earth like a dead thing, struck down by the Thunder"). The
resolution is correct against the Greek, but it does close an ambiguity the
source leaves open.

### Sample 3 — the seduction. Chapter 7 (Third Episode), paras 40–61

Source:
> "PENTHEUS. Nay; am I a woman, then, / And no man more? / DIONYSUS. Wouldst have
> them slay thee dead? / No man may see their mysteries."

Modern:
> "PENTHEUS. What — am I a woman, then, and no longer a man? / DIONYSUS. Would you
> have them kill you outright? No man may see their mysteries."

Finding: **strong — and this is the key test for this play.** The whole power
dynamic between Pentheus and Dionysus is preserved without a word of added
commentary: the voyeurism ("I would gladly watch, hidden among the pines"), the
piecemeal surrender to the robe, the wig, the snood, the fawn-skin, and the two
parenthetical stage directions Murray supplies for Pentheus's inner collapse
("after a struggle with himself", "again doubting"). The modern does not tell the
reader what is happening psychologically; it lets the stichomythia do it, which
is exactly right.

"Snood" is carried across untranslated — an obscure word (a hair-net) that the
reading standard's "prefer a familiar accurate equivalent" would have replaced.
Minor.

### Sample 4 — hardest passage: the sparagmos. Chapter 11 (Exodos), para 10

The Messenger's ~900-word single-paragraph narration of Pentheus's death.
Source:
> "But she, with lips a-foam and eyes that run / Like leaping fire, with thoughts
> that ne'er should be / On earth, possessed by Bacchios utterly, / Stays not nor
> hears. Round his left arm she put / Both hands, set hard against his side her
> foot, / Drew . . . and the shoulder severed!"

Modern:
> "But she, with foaming lips and eyes that ran like leaping fire, with thoughts no
> mortal should have, possessed by Bacchus utterly, did not stay and did not hear.
> Round his left arm she put both hands, set her foot hard against his side, and
> pulled . . . and the shoulder came away!"

Finding: **strong.** Nothing is softened or abridged in the most violent passage
in Greek tragedy: the bent pine, the voice from heaven, Pentheus's plea to his
mother, the tearing, Ino and Autonoe, the scattered limbs, the head on the wand.
No moralising is added — the Messenger's own closing reflection ("To fulfill God's
laws, and have no thought beyond his will, is man's best treasure") is Murray's,
not an addition.

One tiny insertion: "his mother blind, Agave" → "his mother **foremost**, blind
Agave." "Foremost" is not in the source.

### Sample 5 — recognition. Chapter 11 (Exodos), paras 68–83

Source:
> "AGAVE. 'Tis Dionyse hath done it! Now I see. CADMUS (_earnestly_). Ye wronged
> Him! Ye denied his deity!"

Modern:
> "AGAVE. It is Dionysus who has done it! Now I see. CADMUS (earnestly). You
> wronged him! You denied his godhead!"

Finding: **strong.** The stichomythic dismantling of Agave's delusion is intact
line for line, including the withheld answer that forces her to lift the veil
herself, and her "if any sin was wrought, it was mine! What part had my child in
it?"

### Sample 6 — ending. Chapter 11 (Exodos), paras 100–110

Source (para 106–107):
> "AGAVE. On all this house, in bitter wise, / Our Lord and Master, Dionyse, / Hath
> poured the utter dregs of pain! / DIONYSUS. In bitter wise, for bitter was the
> shame / Ye did me"

Modern:
> "AGAVE. On all this house, **in bitter way**, our Lord and Master, Dionysus, has
> poured the utter dregs of pain! / DIONYSUS. **In bitter way**, for bitter was the
> shame you did me"

Finding: **good, with one clear naturalness defect.** The play ends correctly on
the Chorus tag. But "in bitter wise" (= *in bitter fashion*) has been half-
modernized to "in bitter way", which is not idiomatic English in either register.
It appears twice, and the repetition is load-bearing — Dionysus is throwing
Agave's own phrase back at her — so both instances need the same fix ("bitterly",
or "in bitter fashion").

## Name normalisation — an improvement, checked programmatically

Murray's text is internally inconsistent; `modern-en` silently regularises it,
and does so consistently:

| name | original-en | modern-en |
|---|---|---|
| Kithaeron / Cithaeron | 11 / 0 | 0 / **11** |
| Dionyse / Dionysus | 13 / 12 | 0 / **25** |
| Bromios / Bromius | 12 / 0 | 0 / **12** |
| Maenad(s) | 3 / 2 | 3 / 3 |

Counts reconcile exactly (the one extra "Maenads" is the prologue substitution
noted in Sample 1). No mixed spellings remain. This is the right call under the
reading standard's consistency rule.

## Phase 3 — human-edition research

The core English is itself a 1906 translation and — uniquely in this batch — one
whose rights are unresolved. So this research matters more here than elsewhere.

| Candidate | Date | Form | Rights evidence | Verdict |
|---|---|---|---|---|
| **E. P. Coleridge**, *The Plays of Euripides* (incl. *The Bacchantes*) | 1891; 1910/1913 reprint | **complete prose**, all 18/19 plays | **Public domain, US and EU.** **Edward Philip Coleridge, 1863–1936** (Wikisource author page) → US PD (pub. pre-1931), EU life+70 expired **2007**. Wikisource's own tag: PD worldwide. Hosted complete on Wikisource and the MIT Classics Archive. | **The rights-clear substitute source.** Read the opening: *"Lo! I am come to this land of Thebes, Dionysus, the son of Zeus, of whom on a day Semele, the daughter of Cadmus, was delivered by a flash of lightning."* Still lightly archaic ("Lo!", "I am come", "on a day"), so **not** a modern reading edition in itself — but it is complete, accurate, prose rather than rhymed verse, and unambiguously free to use commercially from Denmark. |
| Arthur S. Way, *Euripides* (Loeb) | 1912 | complete verse | PD (Way 1847–1930; EU term expired 2001) | **Unverified** by reading. Way's reputation is for being *more* archaic than Murray, so I would not expect an accessibility gain. |
| T. A. Buckley, *The Tragedies of Euripides* | c. 1850 | complete prose | PD (Buckley 1825–1856) | **Unverified** by reading. |
| **Ian Johnston** (VIU), *Bacchae* | 2000s, rev. | complete verse | **Permission required.** johnstonia copyright page, verbatim: readers may download and redistribute "provided they do not use the material in a commercial publication"; "No commercial publishing of these materials is permitted, without the written permission of Ian Johnston." One Johnston title (*Philoctetes*) is separately CC BY 4.0 — terms vary per play, so Bacchae would need checking individually. | Best-reading modern candidate, not rights-clear for a paid product. Worth an email to ian.johnston@viu.ca. |
| George Theodoridis (Bacchicstage), *Bacchae* | 2000s | complete | Free for non-commercial reproduction; theatrical/educational/cinematic use requires permission. | Rejected on rights. |

## Ratings (editorial quality only — rights are handled separately)

| Dimension | Weight | Score |
|---|---|---|
| Fidelity / completeness | 40% | 5 |
| First-read clarity | 25% | 5 |
| Literary voice | 20% | 5 |
| Restraint / no invention | 10% | 4 |
| Naturalness | 5% | 4 |

**Weighted score 4.9 — band: Strong.**

Restraint loses a point for "some mortal lay with her" and "his mother foremost";
naturalness for "in bitter way" ×2 and the unglossed "snood".

## Recommendation

**BLOCKED.** Confidence in the blocking issue: **medium-high** on the facts
(Murray's dates and the EU life+70 term are not in dispute), **low** on the legal
consequence (I am not able to give a legal opinion, and the derivative-work
question in particular needs one).

**What is unresolved, exactly:** whether Tinct may, from Denmark, commercially
distribute (a) `bacchae-original-en.json`, a verbatim copy of Gilbert Murray's
1906 translation, and (b) `bacchae-modern-en.json`, a paragraph-aligned
derivative of it, given that Murray died in 1957 and the EU/Danish copyright term
is life + 70 years, expiring 31 December 2027.

**Were that resolved, the editorial verdict would be KEEP CURRENT MODERN EDITION
with a LIGHT EDIT** for three named fixes: delete "some mortal lay with her",
delete "foremost", and replace both instances of "in bitter way". Six passages
sampled (~2,600 source words) covering the prologue, a complete choral ode, the
Pentheus/Dionysus agon, the sparagmos narration, the recognition and the ending.
No substantive omission anywhere; all 336 paragraph pairs mechanically verified.
Euripides's moral ambiguity is preserved throughout with no added commentary —
which is the specific thing this play is easy to get wrong.

**Next action:** get a rights opinion on the Murray texts (this book and `medea`).
If the EU term is confirmed, the cheapest clean path is to **re-derive both
editions from E. P. Coleridge's 1891 prose** (PD in the US and EU, complete,
hosted on Wikisource and MIT Classics) rather than to wait until 2028 or to
negotiate. That would also mean re-generating `modern-da`.

**Correction scope: unknown** — "local" if the rights question comes back clean
(three one-line fixes); "substantial" if the source has to be swapped and both
derived editions re-generated and re-aligned.

## Limitations of this review

- I read 4 of 11 chapters closely (1, 2, 7, and 11 in three separate places —
  six passages in total). Chapters
  3, 4, 5, 6, 8, 9 and 10 were checked mechanically only — notably I did **not**
  read the Teiresias/Cadmus scene (ch 3) or the palace-miracle scene (ch 5).
- `modern-da` not evaluated; out of scope.
- No comparison against the Greek — fidelity claims are fidelity to Murray.
- **The rights analysis is mine, not a lawyer's.** I verified Murray's death year
  (1957) against multiple sources and applied the standard EU life+70 rule. I did
  **not** check for any Danish-specific exception, any rule for works first
  published abroad, the status of the specific 1906 printing versus later revised
  printings, or whether Tinct already holds a licence. Treat this as a flag that
  needs professional review, not as a finding of infringement.
- Coleridge was verified by reading its opening lines only; Way and Buckley are
  unverified.
- No in-app rendering check.
