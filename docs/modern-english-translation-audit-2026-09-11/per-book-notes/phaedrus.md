# phaedrus — Phaedrus (Plato)

**Reviewer:** batch agent, 2026-09-11 · **Scope:** public

## Edition snapshot (from Phase 1 mechanical data)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `687f5a5e9b73892c` | 6 | 408 | 23,027 | Jowett (1871) |
| modern-en | `a246a86ca83ff335` | 6 | 408 | 21,683 | Modern English |
| modern-da | `f779e3b14e3a1880` | 6 | 408 | 21,144 | Moderne Dansk |

`en_editions_aligned: true`. No paragraph-count mismatch, no truncated paragraphs, no
empty paragraphs, last chapter not short. Mean weighted similarity 0.7272;
`pct_identical_long_paragraphs` 3.2.

Chapters: 1 By the Ilissus (35 ¶, 1,629 → 1,451 w), 2 Lysias's Speech (6 ¶, 1,497 →
1,272 w), 3 Socrates's First Speech (59 ¶, 3,924 → 3,587 w), 4 The Palinode (27 ¶,
6,506 → 6,171 w), 5 Rhetoric and the True Art of Speech (226 ¶, 7,146 → 6,910 w),
6 On Writing (55 ¶, 2,325 → 2,292 w).

### Core English text — provenance
Benjamin Jowett; registry label "Jowett (1871)". Complete — the walk by the Ilissus,
Lysias's speech, Socrates's first speech, the Palinode with the chariot myth, the
rhetoric discussion, the Theuth myth and the critique of writing, and the closing
prayer to Pan. Exact Jowett edition year not verified.

## Phase 1 flags — confirmed / disconfirmed

Nothing to disconfirm. Recomputed per chapter over paragraphs of ≥30 source words:

| chapter | word ratio | ≥0.85 sim | ≥0.95 sim | cosmetic-only¹ | archaic reduction² |
|---|---|---|---|---|---|
| 1 By the Ilissus | 0.89 | 0% | 0% | 0% | 100% |
| 2 Lysias's Speech | 0.85 | 0% | 0% | 0% | 100% |
| 3 Socrates's First Speech | 0.91 | 0% | 0% | 0% | 100% |
| 4 The Palinode | 0.95 | 6% | 0% | 0% | 100% |
| 5 Rhetoric | 0.97 | 42% | 2% | 1% | ~100% |
| 6 On Writing | 0.99 | **72%** | 5% | 5% | ~93% |

¹ identical after normalising quotes, dashes and British→American spellings.
² reduction in archaic-word density per 10k words.

Book-wide: **0.9%** of long-paragraph words are literally unchanged, only **8%** sit at
≥0.90 similarity, and archaic-vocabulary density falls **96%** (11.6 → 0.5 per 10k) —
the best archaic-reduction figure in the batch after crito and apology. Phaedrus is a
real modernisation, and chapters 1–4 (about 57% of the word count, including both
speeches and the whole Palinode) are done properly.

The problem is the same degradation curve seen across this batch, but milder and later:
chapters 5 and 6 — the rhetoric discussion and the critique of writing — get a much
lighter touch, with chapter 6 (the Theuth myth, the "writing is like painting" image,
the closing prayer) at 72% of long-paragraph words above 0.85 similarity.

Completeness: no chapter below 0.85 word ratio; no substantive omission found in any
sampled passage.

## Samples inspected (8 passages)

### 1. Ch1 ¶0–3 — the meeting — **GOOD**
- SRC ¶1: "I come from Lysias the son of Cephalus, and I am going to take a walk outside the wall, for I have been sitting with him the whole morning; and our common friend Acumenus tells me that it is much more refreshing to walk in the open air than to be shut up in a **cloister**."
- MOD ¶1: "I'm coming from Lysias, the son of Cephalus, and I'm off to take a walk outside the city wall. I've been sitting with him all morning, and our mutual friend Acumenus tells me it's much more refreshing to walk in the open air than to be **cooped up indoors**."
- "cloister" (Jowett's anachronistic gloss for a covered walk) correctly replaced.
  Speaker tags preserved. Nothing lost.

### 2. Ch3 ¶32 — Socrates warns he is going into dithyrambs — **GOOD**
- SRC: "Listen to me, then, in silence; for surely the place is holy; so that you must not wonder, if, as I proceed, I appear to be in a divine fury, for already I am getting into dithyrambics."
- MOD: "Then listen to me in silence. The place is surely holy, so you mustn't be surprised if, as I go on, I appear to be in a divine fury — for I'm already slipping into dithyrambs."
- The self-aware joke about his own rising style is intact; "dithyrambics" → "dithyrambs"
  keeps the technical term rather than explaining it away, which is right here.

### 3. Ch4 ¶10 — the four kinds of divine madness (403 words) — **GOOD; the hardest passage in the book, handled well**
- SRC: "…they must have thought that there was an inspired madness which was a noble thing; for the two words, mantike and manike, are really the same, and the letter tau is only a modern and tasteless insertion… in proportion as prophecy (mantike) is more perfect and august than augury, both in name and fact, in the same proportion, as the ancients testify, is madness superior to a sane mind (sophrosune)"
- MOD: "…They must have believed there was an inspired madness which was something noble — for the two words, mantike and manike, are really the same, and the letter tau is only a modern and tasteless addition… And just as prophecy (mantike) is more perfect and august than augury, in both name and fact, so — as the ancients testify — madness is superior to a sane mind (sophrosune)"
- This is the passage most likely to be mangled: it is a chain of Greek etymologies
  (mantike/manike, oionoistike/oionistike, nous/istoria/oiesis) inside a proportional
  argument. All transliterations, all parenthetical glosses, and the "in proportion as…
  in the same proportion" structure survive, converted into a "just as… so" that is
  easier to follow and means the same thing. The three kinds of madness (prophetic,
  ritual/purificatory, poetic) are all present, in order, with the closing sneer at the
  craftsman-poet: "The sane man vanishes and is nowhere to be seen when he enters into
  competition with the madman."

### 4. Ch4 ¶14 — the winged chariot and the procession of the gods (487 words) — **GOOD**
- SRC: "…the vicious steed goes heavily, weighing down the charioteer to the earth when his steed has not been thoroughly trained:--and this is the hour of agony and extremest conflict for the soul."
- MOD: "…the vicious horse drags heavily, pulling the charioteer toward the earth if his horse has not been thoroughly trained. And this is the hour of agony and supreme conflict for the soul."
- SRC: "…knowledge absolute, not in the form of **generation** or of relation, which men call existence, but knowledge absolute in existence absolute"
- MOD: "…knowledge absolute — not in the form of **becoming** or relation, which men call existence, but knowledge absolute in existence absolute"
- Complete and well handled: Zeus leading, the eleven bands, Hestia alone at home, the
  princely twelve, the climb to the vault, the hyperouranios topos ("the heaven above the
  heavens"), the colourless formless essence, the soul feasting, ambrosia and nectar at
  the stall. Long periods are broken up without losing any element. "generation" →
  "becoming" is a terminological modernisation (and closer to standard usage for
  γένεσις); flagging it only because it is a change to the source's word, not a defect.

### 5. Ch4 ¶25–26 — the prayer to Eros and Phaedrus's reply — **GOOD**
- "blame Lysias, who is the father of the brat — and let us have no more of his progeny"
  keeps Jowett's joke intact; "thine anger" → "your anger"; "lose conceit of Lysias" →
  "lose my regard for Lysias" is a correct reading of a now-opaque idiom.

### 6. Ch5 ¶144 — the catalogue of rhetorical handbooks — **LIGHT / under-modernised**
- SRC: "I ought also to mention the illustrious Parian, Evenus, who first invented insinuations and indirect praises; and also indirect censures, which according to some he put into verse to help the memory. But shall I 'to dumb forgetfulness consign' Tisias and Gorgias…"
- MOD: "I ought also to mention the illustrious Parian, Evenus, who first invented insinuations and indirect praises, and indirect censures too — which, according to some, he put into verse to help the memory. But shall I 'consign to dumb forgetfulness' Tisias and Gorgias…"
- The only real changes are clause reordering, one comma, and "defence"→"defense". The
  passage is a dense catalogue of sophists and technical terms and would have benefited
  from actual work. (Mild positive: the Gray quotation's inverted word order is
  straightened.) 42% of chapter 5's long-paragraph words are at this level.

### 7. Ch6 ¶32 — against written political treatises — **LIGHT / under-modernised (worst chapter)**
- SRC: "That whether Lysias or any other writer that ever was or will be, whether private man or statesman, proposes laws and so becomes the author of a political treatise, fancying that there is any great certainty and clearness in his performance, the fact of his so writing is only a disgrace to him, whatever men may say."
- MOD: "That whether it's Lysias or any other writer who ever was or will be, whether private man or statesman, who proposes laws and so becomes the author of a political treatise, fancying that there is great certainty and clarity in his performance — the fact of his writing it is only a disgrace to him, whatever men may say."
- A 103-word Jowett period left as a 105-word period, with "clearness"→"clarity" and a
  dash. This is the sentence that states the dialogue's conclusion about writing.

### 8. Ch6 ¶48 — Socrates's prophecy about Isocrates — **LIGHT / under-modernised**
- SRC: "I think that he has a genius which soars above the orations of Lysias, and that his character is cast in a finer **mould**. My impression of him is that he will **marvellously** improve as he grows older…"
- MOD: "I think he has a genius that soars above the orations of Lysias, and that his character is cast in a finer **mold**. My impression is that he will **marvelously** improve as he grows older…"
- Spelling conversion plus two dropped words. Representative of chapter 6.

**Characterisation:** Phaedrus's enthusiast-of-fashionable-rhetoric personality comes
through clearly in chapters 1–3 (his eagerness to recite Lysias, his oath-swearing, his
resistance to being outdone), and Socrates's shifts of register — teasing, then
possessed, then sober — are preserved in the chapters that were properly rewritten. The
two speeches (Lysias's cold sophistic performance vs Socrates's Palinode) remain
audibly different from each other. No homogenisation found.

## Phase 3 — human-edition research

**No public-domain human English Phaedrus was found in this search that improves on
Jowett for a modern reader.** ("Found in this search", not "none exists.")

**Candidate A — J. Wright, *The Phaedrus, Lysis, and Protagoras of Plato: a new and
literal translation mainly from the text of Bekker* (Macmillan, 1888). REJECTED.**
- Rights: public domain (1888 publication; translator long dead). Complete for Phaedrus.
- URL (full text I read): https://archive.org/details/phaedruslysisand02platuoft
- Sample read (opening): "Soc. **Whence come you**, friend Phædrus, and **whither are you
  bound**? — Ph. I come from Lysias, the son of Cephalus… Soc. Well, how did you pass
  your time there? though I can hardly doubt that Lysias **regaled** you with his
  speeches… In that case his speeches would indeed be delightful, and **a public boon**."
  Also "staying with Epicrates at the **Morychian mansion** yonder."
- Assessment: **more archaic than Jowett**, not less. Rejected on readability, not rights.

**Candidate B — Harold North Fowler, in *Plato I: Euthyphro, Apology, Crito, Phaedo,
Phaedrus* (Loeb Classical Library 36, 1914).**
- Rights: **public domain.** US — published 1914. EU/Denmark — Fowler died 1955;
  life+70 expired 1 Jan 2026. Complete.
- URL: https://archive.org/details/euthyphroapology0001plat ; Perseus copy at
  https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0174 — **note
  Perseus applies CC BY-SA 3.0 US to its own digitisation**, and its translator metadata
  for these texts is inconsistent (it credits Fowler for volumes Loeb credits to Lamb).
  Source from the archive.org scan.
- Sample read (Phaedrus 227a): "Dear Phaedrus, **whither away**, and where do you come
  from? From Lysias, Socrates, the son of Cephalus; and I am going for a walk outside
  the wall."
- Assessment: more literal than Jowett and useful as a fidelity control, but "whither
  away" is not a readability improvement. Rejected as a reader-facing replacement.

**Not pursued:** W. H. D. Rouse's *Great Dialogues of Plato* (1956) and R. Hackforth's
*Plato's Phaedrus* (Cambridge, 1952) are both 20th century and in copyright.

**Conclusion:** for Phaedrus, Tinct's own modern-en (chapters 1–4 at least) is already
the most readable complete English text I could verify as usable. The right move is to
finish it, not to replace it.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 4 |
| first-read clarity | 25% | 4 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 4 |

**Weighted score: 4.1 — Band: Good with fixes**

Clarity 4 rather than 5 because chapters 5 and 6 (41% of the word count) retain Jowett's
long periods largely intact. No omission, no invention, and no logical distortion was
found in any sampled passage — including the etymological/proportional argument in the
Palinode, which is the most likely place for a modernisation to go wrong.

## Recommendation

**LIGHT EDIT** — confidence **medium**. Correction scope: **substantial**.

Chapters 1–4 meet the standard and should be left alone; they are the best sustained
stretch of modernisation in this Plato batch after crito. Chapters 5 and 6 need a second
pass: break Jowett's periods, and finish the job on the rhetoric catalogue and the
Theuth myth / critique of writing, which is the passage most readers come to this
dialogue for after the chariot. No edition change, no retranslation.

**Next action:** second modernisation pass over chapters 5 and 6 to the chapter-4
standard, gated on <10% of long-paragraph words at ≥0.85 similarity per chapter.

## Limitations of this review

- 8 passages read as connected prose out of 408 paragraphs (~15% of word count).
  **Chapter 2 (Lysias's speech in full) was not read as connected prose**, nor were
  ch4 ¶15–23 (the description of the two horses and the lover's struggle, immediately
  after the sampled ¶14) — chapter 4's verdict rests on ¶10, ¶14, ¶25 and ¶26 plus the
  similarity/archaic statistics.
- Most of chapter 5 (226 paragraphs) was not read; the "42% light" figure is statistical.
- Completeness checked by word ratio and paragraph alignment plus clause-level reading of
  the sampled passages.
- No Greek-side check; all judgements are modern-en against original-en (Jowett).
- modern-da was not reviewed.
- Rights conclusions are date arithmetic, not legal advice.
