# phaedo — Phaedo (Plato)

**Reviewer:** batch agent, 2026-09-11 · **Scope:** public

## Edition snapshot (from Phase 1 mechanical data)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `c2a1b3b99c2826d4` | 9 | 652 | 27,292 | Jowett (1871) |
| modern-en | `2c46156a47556769` | 9 | 652 | 26,337 | Modern English |
| modern-da | `087b269dcd42ffb7` | 9 | 652 | 20,372 | Moderne Dansk |

`en_editions_aligned: true`. No paragraph-count mismatch, no truncated paragraphs, no
empty paragraphs, last chapter not short. Mean weighted similarity 0.7747;
`pct_identical_long_paragraphs` 4.2.

(Note: the batch brief lists Phaedo at ~40,000 words; the actual source file is 27,292.
The registry `wordCount` is an estimate, not a measurement — worth correcting separately.)

### Core English text — provenance
Benjamin Jowett; registry label "Jowett (1871)". Complete — Echecrates frame,
all four arguments for immortality, the Myth of the True Earth, and the death scene.
Exact Jowett edition year not verified.

## Phase 1 flags — confirmed / disconfirmed

No flags to confirm beyond the moderate similarity. Recomputed per chapter over
paragraphs of ≥30 source words:

| chapter | word ratio | ≥0.85 sim | ≥0.95 sim | cosmetic-only¹ |
|---|---|---|---|---|
| 1 The Last Day | 0.97 | 0% | 0% | 0% |
| 2 The Philosopher and Death | 0.98 | 2% | 0% | 0% |
| 3 The Argument from Opposites | 0.96 | 22% | 7% | 7% |
| 4 The Argument from Recollection | 0.97 | 0% | 0% | 0% |
| 5 The Affinity Argument | 0.97 | 49% | 3% | 3% |
| 6 The Objections | 0.83 | 0% | 0% | 0% |
| 7 The Final Argument | 0.98 | 27% | 1% | 2% |
| 8 The Soul Is Immortal | 1.00 | **85%** | 1% | 2% |
| 9 The Death of Socrates | 0.83 | 0% | 0% | 0% |

¹ identical after normalising quotes, dashes and British→American spellings.

Book-wide: only **1.6%** of long-paragraph words are literally unchanged and **12%** sit
at ≥0.90 similarity, and archaic-vocabulary density falls **83%** (11.3 → 1.9 per 10k).
So — unlike Symposium and the back half of the Republic — Phaedo is a **genuine**
modernisation throughout, not a pass-through. What the ≥0.85 column shows is a
different, milder problem: in chapters 3, 5, 7 and especially 8, the "modernisation"
is mostly sentence-splitting and one- or two-word swaps, leaving Jowett's syntax and
hard vocabulary largely in place. The dramatic chapters (1, 2, 4, 6, 9) are rewritten
properly. The pattern is inverted from what readers need: the arguments and the myth —
the parts that are hard — get the lightest touch.

Completeness: word ratio 0.97 overall, no chapter below 0.83, no truncation flags.
No substantive omission was found in any sampled passage.

## Samples inspected (6 passages)

### 1. Ch1 ¶0–1 — the Echecrates frame — **GOOD**
- SRC: "ECHECRATES: Were you yourself, Phaedo, in the prison with Socrates on the day when he drank the poison?" → MOD: "ECHECRATES: Were you there yourself, Phaedo, in the prison with Socrates on the day he drank the poison?"
- Speaker tags preserved; clean.

### 2. Ch2 ¶30–32 — the Forms not perceived by the senses — **LIGHT / under-modernised**
- SRC ¶30: "But did you ever behold any of them with your eyes?" → MOD ¶30: **identical.**
- SRC ¶32: "Or did you ever reach them with any other bodily sense?--and I speak not of these alone, but of absolute greatness, and health, and strength, and of the essence or true nature of everything… is not the nearest approach to the knowledge of their several natures made by him who so orders his intellectual vision as to have the most exact conception of the essence of each thing which he considers?"
- MOD ¶32: "Or did you ever reach them with any other bodily sense? I'm speaking not only of these, but of absolute greatness, and health, and strength — and of the essence or true nature of everything… Isn't it rather that the nearest approach to the knowledge of each of them is made by someone who so orders his intellectual vision as to have the most exact conception of the essence of whatever he is considering?"
- Real but minimal: the period is split and "whom"-style relatives are softened, but
  "behold", "absolute greatness", "intellectual vision", "the essence of" all stand. A
  reader who found Jowett hard here will find this hard too.

### 3. Ch7 ¶161–165 — the odd/even argument (the hardest stretch in the dialogue) — **LIGHT / under-modernised**
- SRC ¶163: "Then now mark the point at which I am aiming:--not only do essential opposites exclude one another, but also concrete things, which, although not in themselves opposed, contain opposites; these, I say, likewise reject the idea which is opposed to that which is contained in them, and when it approaches them they either perish or withdraw."
- MOD ¶163: "Then now note the point I'm aiming at: not only do essential opposites exclude one another, but concrete things which — although not in themselves opposed — contain opposites, these also reject the idea which is opposed to that which is contained in them, and when it approaches them, they either perish or withdraw."
- "mark" → "note", "at which I am aiming" → "I'm aiming at", one clause inverted. The
  dense apposition ("these, I say, likewise reject the idea which is opposed to that
  which is contained in them") survives essentially intact; in the modern it is arguably
  *harder*, because the "I say" that signalled the resumption has been removed while the
  syntax stayed.
- ¶161 is handled slightly better (the "three is odd though not oddness" example is
  broken into shorter units), and the logic of the argument is preserved correctly
  throughout — no syllogism is garbled.

### 4. Ch8 ¶28 / ¶38 — the Myth of the True Earth — **LIGHT / under-modernised (worst chapter)**
- SRC ¶28: "Now the earth has **divers** wonderful regions, and is indeed in nature and extent very unlike the notions of geographers, as I believe on the authority of one who shall be nameless." → MOD: "Now the earth has **many** wonderful regions, and is indeed in nature and extent very unlike the notions of geographers — as I believe on the authority of **someone** who shall be nameless." (two words and a dash)
- SRC ¶38: "The reason is, that they are pure, and not, like our precious stones, infected or corroded by the corrupt briny elements which **coagulate** among us… Moreover, the **temperament of their seasons** is such that they have no disease… and their other blessedness is **of a piece with** this."
- MOD ¶38: same sentence, same vocabulary; three periods split into shorter sentences,
  two "and"s turned into em-dashes. "coagulate", "briny", "temperament of their seasons",
  "ether", "of a piece with this" all retained.
- 85% of chapter 8's long-paragraph words sit at ≥0.85 similarity. This is the most
  ornate stretch of prose in the dialogue and it received the least work.

### 5. Ch9 ¶8–12 — the death of Socrates — **EXCELLENT** (best passage in the batch)
- SRC ¶10: "Socrates said: You, my good friend, who are experienced in these matters, shall give me directions how I am to proceed. The man answered: You have only to walk about until your legs are heavy, and then to lie down, and the poison will act."
- MOD ¶10: "'You,' said Socrates, 'you're experienced in these things — tell me what to do.' The man answered: 'Just walk around until your legs feel heavy, then lie down. The poison will do its work.'"
- SRC ¶11: "…he uncovered his face, for he had covered himself up, and said--they were his last words--he said: Crito, I owe a cock to Asclepius; will you remember to pay the debt?"
- MOD ¶11: "…he uncovered his face — he had drawn the cloth over himself — and spoke his last words: 'Crito, I owe a rooster to Asclepius. Will you remember to pay the debt?'"
- Speech is properly punctuated, the emotional movement (Phaedo weeping "not for him, but
  for myself"), Apollodorus's outburst, Socrates's rebuke, the cold creeping upward —
  all intact and much easier to read than Jowett. Complete.

### 6. Ch9 ¶11 — two small alterations in that same excellent passage — **LOCAL DEFECTS**
- SRC: "Apollodorus… broke out in a loud and passionate cry which **made cowards of us all**." → MOD: "…burst into such loud, passionate sobs that **he broke the heart of everyone present**." Not the same claim: the source says the outburst unmanned the company's resolve; the modern says it moved them to pity. An altered image, not a modernised one.
- SRC: "When **the poison** reaches the heart, that will be the end." → MOD: "When **the cold** reaches my heart, that will be the end." Closer to what Plato's Greek says, but a change to the source text nonetheless.
- SRC: "We only prepare, Socrates, just so much as we deem enough." → MOD: "We prepare only enough for **a single dose**, Socrates." A small added specification not in the source.

**Socratic voice and argument structure:** Socrates's cheerfulness, Crito's fussing,
Simmias's and Cebes's distinct styles of objection (Simmias tentative, Cebes dogged) all
survive. I found **no garbled inference** in any argument passage I read — the "if…then"
chains and the opposites/participation distinctions are transmitted correctly. The
weakness is clarity, not logic.

## Phase 3 — human-edition research

**Candidate A — F. J. Church, *The Trial and Death of Socrates: being the Euthyphron,
Apology, Crito, and Phaedo of Plato* (Macmillan, 1st ed. 1880; Golden Treasury Series
1886; reprinted to 1895). STRONGEST CANDIDATE.**
- Translator: Frederick John Church (1854–1888).
- Completeness: **complete** — Phaedo runs pp. 103–213 in the 1895 printing, ending with
  "Such was the end, Echecrates, of our friend, a man, I think, who was the wisest and
  justest, and the best man that I have ever known." Light explanatory footnotes.
- Rights: **public domain, unambiguously.** US — published 1880–1895, well before
  1 Jan 1931. EU/Denmark — author died 1888; life+70 expired 1958. No renewal question,
  no jurisdictional split.
- URL (full text I read): https://archive.org/details/trialanddeathofs00platiala
- Church's preface states the audience explicitly: readers "who wish to learn something
  of the masterpieces of Greek literature, and who cannot easily read them in Greek."
- Sample read — the same odd/even argument our modern-en leaves dense: "Then see what I
  want to show you. It is not only opposite ideas which appear not to admit their
  opposites; things also which are not opposites, but which always contain opposites,
  seem as if they would not admit the idea which is opposite to the idea that they
  contain: they either perish, or retire at its approach. Shall we not say that the
  number three would perish or endure anything sooner than become even while it remains
  three?" — noticeably plainer than both Jowett and our modern-en at the hardest point in
  the book.
- Sample read — the death scene: "Crito, he said, I owe a cock to Asclepius; do not
  forget to pay it." Complete and clear, though our modern-en's version of this
  particular scene is *better* (punctuated dialogue, warmer).
- Paragraph structure differs from ours — **alignment work required**; noted separately,
  not a quality strike.

**Candidate B — Harold North Fowler, *Plato I* (Loeb Classical Library 36, 1914).**
- Rights: **public domain.** US — 1914. EU/Denmark — Fowler d. 1955, life+70 expired
  1 Jan 2026.
- URL: https://archive.org/details/euthyphroapology0001plat ; Perseus hosts it at
  https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0170 but applies
  CC BY-SA 3.0 US to **its digitisation** — source from the archive.org scan to avoid
  inheriting a share-alike obligation.
- Assessment: more literal than Jowett; register is 1914 academic and no more accessible
  (sample from the companion Apology: "either it is virtually nothingness, so that the
  dead has no consciousness of anything"). Valuable as a fidelity control, not as the
  reader-facing text.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 4 |
| first-read clarity | 25% | 3 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 4 |
| naturalness | 5% | 4 |

**Weighted score: 3.8 — Band: Good with fixes**

Fidelity 4 rather than 5 because of the three local alterations at ch9 ¶11 ("made
cowards of us all", "the poison"→"the cold", "a single dose"). Clarity 3 because
chapters 3, 5, 7 and 8 — over half the word count and all of the difficult material —
are only lightly touched. Voice 4 on the strength of the frame and death scene.

## Recommendation

**LIGHT EDIT** — confidence **medium**. Correction scope: **substantial**.

"Light" describes the *character* of the work, not its size: nothing needs to be
rebuilt, and there is no completeness or invention problem to repair. What is needed is
a second modernisation pass over chapters 3, 5, 7 and 8 — unpack Jowett's periods,
replace the retained hard vocabulary ("coagulate", "intellectual vision", "of a piece
with", "absolute greatness", "divers"), and preserve the argument structure exactly as
it already is. Chapters 1, 2, 4, 6 and 9 should be left alone; ch9 ¶11 needs three
one-line corrections.

**Next action:** second pass over chapters 3, 5, 7, 8 targeting <10% of long-paragraph
words at ≥0.85 similarity, plus the three ch9 ¶11 fixes; keep Church 1880 open as the
readability benchmark for the argument sections.

## Limitations of this review

- 6 passages read as connected prose out of 652 paragraphs (~15% of word count).
  Chapters 3, 4, 5 and 6 were **not** read as prose — chapter 5 (the Affinity Argument,
  49% at ≥0.85 similarity) and chapter 6 (Simmias's and Cebes's objections) in
  particular are asserted from statistics only.
- Completeness was checked mechanically (word ratios, paragraph alignment) plus
  clause-level reading of the six sampled passages; a small omission inside an unread
  paragraph could have escaped.
- No Greek-side check; all judgements are modern-en against original-en (Jowett).
- I read Church's Apology opening, one Phaedo argument passage and the Phaedo death
  scene — not the whole translation.
- modern-da was not reviewed.
- Rights conclusions are date arithmetic, not legal advice.
