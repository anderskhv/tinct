# symposium — Symposium (Plato)

**Reviewer:** batch agent, 2026-09-11 · **Scope:** public

## Edition snapshot (from Phase 1 mechanical data)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `e2943777fd54eaaa` | 8 | 217 | 21,429 | Jowett (1871) |
| modern-en | `7816d1eb6ac9cc6d` | 8 | 217 | 21,457 | Modern English |
| modern-da | `2a98c5281c40f5e3` | 8 | 217 | 15,681 | Moderne Dansk |

`en_editions_aligned: true`. No paragraph-count mismatch, no truncated paragraphs, no
empty paragraphs. Mean weighted similarity **0.8796** (highest in this batch);
`pct_identical_long_paragraphs` 1.8. Flag raised: **`last_chapter_suspiciously_short`**
(ch8 = 263 words).

Chapters: 1 The Gathering (40 ¶, 1,870 w), 2 Phaedrus's Speech (8 ¶, 918 w),
3 Pausanias's Speech (12 ¶, 2,398 w), 4 Eryximachus's Speech (10 ¶, 1,359 w),
5 Agathon & Aristophanes (18 ¶, 2,433 w), 6 Agathon's Speech (13 ¶, 1,954 w),
7 Socrates & Diotima (115 ¶, 10,238 w), 8 Alcibiades (1 ¶, 259 w).

### Core English text — provenance
Benjamin Jowett; registry label "Jowett (1871)". Complete: the modern-en word count
(21,457) is *higher* than the source (21,429), so nothing is missing. Exact Jowett
edition year not verified.

## Phase 1 flags — confirmed / disconfirmed

### `last_chapter_suspiciously_short` — **DISCONFIRMED as truncation; CONFIRMED as a chapter-titling error.**
Chapter 8 is not a truncated Alcibiades speech. Alcibiades's entrance and his entire
encomium sit inside **chapter 7** (¶69–¶107; his entrance at ¶72, the speech proper
from ¶91, the confession at ¶98–99, the reaction at ¶108). Chapter 8's single
259-word paragraph is the dialogue's genuine epilogue — the revellers bursting in, the
company drinking, Aristodemus falling asleep, the dawn argument that the true tragedian
is also a comedian, Socrates going off to the Lyceum:
> "Agathon arose in order that he might take his place on the couch by Socrates, when
> suddenly a band of revellers entered, and spoiled the order of the banquet… the chief
> thing which he remembered was Socrates compelling the other two to acknowledge that
> the genius of comedy was the same with that of tragedy… In the evening he retired to
> rest at his own home."
So: a real structural feature (Plato's short frame-closing), **but the chapter is
mislabelled "Alcibiades"**, which will mislead any reader using the chapter nav or the
Cast panel. That is a fixable metadata bug, independent of the translation question.

### High similarity — **CONFIRMED, and this is the finding that matters.**
Recomputed over paragraphs of ≥30 source words:

| chapter | ≥0.95 word-sim | ≥0.90 word-sim | cosmetic-only¹ | archaic-word reduction² |
|---|---|---|---|---|
| 1 The Gathering | 2% | 41% | 4% | 100% |
| 2 Phaedrus | 11% | 75% | 19% | 100% |
| 3 Pausanias | 0% | 0% | 0% | n/a (no archaic markers in source) |
| 4 Eryximachus | 8% | 75% | 9% | 67% |
| 5 Agathon & Aristophanes | 25% | 94% | 15% | 34% |
| 6 Agathon's Speech | **59%** | **100%** | 32% | **0%** |
| 7 Socrates & Diotima | **58%** | **79%** | **64%** | **8%** |
| 8 epilogue | 0% | 0% | 0% | n/a |

¹ identical after normalising curly quotes, em-dashes and British→American spellings.
² reduction in archaic-word density per 10k words (thee/thou/hath/whither/thence/…).

Book-wide: **36.7% of long-paragraph words are literally unchanged Jowett** after
normalisation, **69% sit at ≥0.90 similarity**, and archaic-vocabulary density falls
only **31%** (10.1 → 7.0 per 10k). Chapter 6 shows a **0%** archaic reduction.

This is the "LIGHT/MECHANICAL false 'modern' edition" failure mode named in the
standard. Exactly one chapter — Pausanias's speech — is a genuine modernisation. Half
the book's word count, including the whole Diotima ladder and the whole Alcibiades
speech, is Jowett with American spellings and em-dashes.

## Samples inspected (6 passages)

### 1. Ch3 ¶0–1 — Pausanias's two Aphrodites — **GOOD (this is what the edition can do)**
- SRC ¶1: "Take, for example, that which we are now doing, drinking, singing and talking--these actions are not in themselves either good or evil, but they turn out in this or that way according to the mode of performing them"
- MOD ¶1: "Take, for example, what we are doing right now — drinking, singing, and talking. These actions are not in themselves either good or evil; they turn out one way or the other depending on how they are done. Done well, they are good; done badly, they are evil."
- Real rewriting, real clarity gain, nothing lost. Heavenly/Common Aphrodite capitalised
  consistently as terms. This chapter is the control case proving the rest is a choice, not a limit.

### 2. Ch1 ¶36–37 — Eryximachus proposes the speeches — **FAIL (pass-through) + a quotation bug**
- SRC ¶37: "…**whereas other gods have poems and hymns made in their honour, the great and glorious god, Love, has no encomiast** among all the poets who are so many. There are the worthy sophists too--the excellent Prodicus for example, who have **descanted** in prose on the virtues of Heracles…"
- MOD ¶37: "…whereas other gods have poems and hymns made in their honor, the great and glorious god Love has no encomiast among all the poets who are so many. There are the worthy sophists too — the excellent Prodicus, for example, who have descanted in prose on the virtues of Heracles…"
- "encomiast" and "descanted" — precisely the vocabulary a modern edition exists to
  replace — survive untouched; the only changes are honour→honor and dash style.
- **Punctuation bug:** the source closes Phaedrus's reported complaint at "So entirely
  has this great deity been neglected.'" and then returns to Eryximachus's own voice.
  The modern moves the closing quotation mark to the very end of the paragraph, so
  Eryximachus's proposal ("I mean to propose that each of us in turn… shall make a
  speech") is swallowed inside Phaedrus's quoted grumble. Two speakers merged — a
  comprehension error introduced by the modernisation pass.

### 3. Ch6 ¶7 — the company cheers Agathon — **FAIL (pass-through)**
- SRC: "When Agathon had done speaking, Aristodemus said that there was a general cheer; the young man was thought to have spoken in a manner worthy of himself, and of the god. And Socrates, looking at Eryximachus, said: Tell me, son of Acumenus, was there not reason in my fears? and was I not a true prophet when I said that Agathon would make a wonderful oration, and that I should be in a strait?"
- MOD: identical except one comma removed, one "And" capitalised, and quotation marks added.
- Representative of the whole of chapter 6 (100% at ≥0.90 similarity, 0% archaic reduction).
  "I should be in a strait" is left as-is.

### 4. Ch7 ¶62–63 — Diotima's ladder of love — **FAIL (pass-through)**
- SRC ¶62: "'These are the lesser mysteries of love, into which even you, Socrates, may enter; to the greater and more hidden ones which are the crown of these, and to which, if you pursue them in a right spirit, they will lead, I know not whether you will be able to attain.'"
- MOD ¶62: identical, word for word.
- SRC ¶63: "…being not like a servant in love with the beauty of one youth or man or institution, himself a slave mean and narrow-minded, but drawing **towards** and contemplating the vast sea of beauty… until on that shore he grows and **waxes strong**"
- MOD ¶63: identical except "towards" → "toward" and one dash.
- The single most quoted philosophical passage in the dialogue is delivered to the
  reader unmodernised under a "Modern English" label. One incidental positive: at ¶62
  the modern silently repairs a defect in the source text ("the beauty in every form is
  and the same" → "is one and the same") — evidence this chapter received a proofing
  pass but not a translation pass.

### 5. Ch5 ¶0 — Aristophanes's myth of the split souls — **FAIL (pass-through)**
- SRC: "Aristophanes professed to open another vein of discourse… the primeval man was round, his back and sides forming a circle; and he had four hands and four feet, one head with two faces, looking opposite ways… also four ears, two privy members, and the remainder to correspond."
- MOD: "Aristophanes professed to open another vein of discourse… the primeval man was round, his back and sides forming a circle; and he had four hands and four feet, one head with two faces looking opposite ways… also four ears, two **sets of** privy members, and the remainder to correspond."
- The only substantive change in 269 words is inserting "sets of". "vein of discourse",
  "primeval", "privy members", "of the ills which are the great impediment to the
  happiness of the race" all stand. All nine long paragraphs of Aristophanes's speech
  sit at 0.92–0.97 word similarity.

### 6. Ch7 ¶98–99 — Alcibiades's confession — **FAIL (pass-through)**
- SRC ¶99: "…and there I lay during the whole night having this wonderful monster in my arms… **hear, O judges; for judges you shall be of the haughty virtue of Socrates**--nothing more happened, but in the morning when I awoke (let all the gods and goddesses be my witnesses) I arose as from the couch of a father or an elder brother."
- MOD ¶99: identical except favour→favor, dash style, and one comma.
- The dialogue's dramatic climax — 305 + 229 words — is verbatim Jowett.

**Characterisation:** because the back half is a copy, the differentiation between
Agathon's flowery Gorgianic manner, Diotima's catechism and Alcibiades's drunken
intimacy is exactly as Jowett left it — neither improved nor damaged. Where the edition
*does* rewrite (ch3), voice is handled well.

## Phase 3 — human-edition research

**No rights-clear, complete, clearly-more-readable human English Symposium was found in
this search.** ("Found in this search", not "none exists.")

**Candidate A — W. R. M. Lamb, in *Plato III: Lysis, Symposium, Gorgias* (Loeb
Classical Library 166, 1925).**
- Completeness: complete.
- Rights: **split by jurisdiction, and blocked for Tinct.** US — published 1925, PD.
  **EU/Denmark — Lamb (Sir Walter Rangeley Maitland Lamb) died 27 March 1961, so
  life+70 runs to 1 January 2032.** Tinct operates commercially from Denmark; this is
  not usable here before 2032 without permission from the rights holder.
- URL: https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0174 (Perseus
  attributes its Symposium to "Harold N. Fowler, Plato in Twelve Volumes, Vol. 9, 1925",
  which conflicts with the Loeb credit to Lamb — **Perseus's translator metadata for
  this text is unreliable and I could not resolve it**; treat attribution as unverified).
  Perseus also applies CC BY-SA 3.0 US to its digitisation.
- Sample read (212c): "So I ask you, Phaedrus, to be so good as to consider this account
  as a eulogy bestowed on Love, or else to call it by any name that pleases your fancy."
  Register comparable to Jowett; no clear readability gain.

**Candidate B — Percy Bysshe Shelley, *The Banquet* (translated 1818; published
posthumously by Mary Shelley, 1840).**
- Rights: public domain without question.
- **Rejected on completeness.** The translation was suppressed and then bowdlerised;
  the printings that are in the public domain are the censored ones, with the dialogue's
  homoerotic centre cut. Restored/unexpurgated texts derive from 20th-century editorial
  work (e.g. Notopoulos, 1949), which is still in copyright. A public-domain Shelley
  Symposium is therefore an **incomplete** Symposium.
- Reference: https://archive.org/details/symposiumofplato00plat_0

**Candidate C — Michael Joyce (Everyman's Library, 1935).** In copyright (Joyce d. 1964;
EU to 2035, US to 2031). Not pursued.

**Not found:** a 19th-century general-reader Symposium comparable to what F. J. Church
did for the Socratic dialogues. Church's *Trial and Death of Socrates* covers
Euthyphro/Apology/Crito/Phaedo only.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 5 |
| first-read clarity | 25% | 2 |
| literary voice | 20% | 3 |
| restraint / no invention | 10% | 5 |
| naturalness (for a contemporary reader) | 5% | 2 |

**Weighted score: 3.7 — Band: Mixed**

**The weighted score is badly misleading here and should not be used on its own.**
Fidelity and restraint score 5 for the trivial reason that a copied paragraph cannot
omit or invent anything. The honest summary is: this edition is complete and faithful
because it is largely not a translation at all. Clarity (2) and naturalness (2) are the
dimensions that describe what a reader receives.

## Recommendation

**RETRANSLATE** — confidence **high**. Correction scope: **substantial**.

Chapters 1, 2, 4, 5, 6 and 7 — roughly 90% of the book, including Agathon's speech, the
whole Diotima sequence and the whole Alcibiades speech — need to be modernised for the
first time. Chapter 3 (Pausanias) and chapter 8 (epilogue) are already good and set the
target. Two non-translation fixes should ride along: rename chapter 8 (it is the
epilogue, not "Alcibiades", and Alcibiades's speech is in chapter 7), and repair the
misplaced closing quotation mark at ch1 ¶37.

**Next action:** retranslate chapters 1, 2, 4, 5, 6, 7 to the chapter-3 standard, then
gate on the same metrics used here — target <2% of long-paragraph words at ≥0.90
similarity and ≥90% archaic-marker reduction per chapter.

## Limitations of this review

- 6 passages read as connected prose. Chapter 2 (Phaedrus's speech) and chapter 4
  (Eryximachus's speech) were **not** read as prose; their status is asserted from the
  similarity and archaic-density statistics only.
- I did not verify clause-level completeness inside the rewritten chapter 3.
- No Greek-side check; all judgements are modern-en against original-en (Jowett).
- modern-da was not reviewed.
- Perseus's translator attribution for the Symposium is unresolved; the Lamb rights
  arithmetic assumes the Loeb credit is correct.
- Rights conclusions are date arithmetic, not legal advice.
