# the-histories — The Histories (Herodotus)

Audit batch B12 (ancient history / strategic writing, translated works), 2026-09-11.
Scope: **public**. Review only — no edition files were modified.

## Edition snapshot (Phase 1 data)

| edition | label | translator / year | sha256_16 | chapters | paragraphs | words | sections |
|---|---|---|---|---|---|---|---|
| original-en | Macaulay (1890) | George Campbell Macaulay, 1890 | `f442e468e59838d5` | 1525 | 1626 | 284,922 | 9 |
| modern-en | Modern English | — | `d79ea955070c9d8c` | 1525 | 1626 | 259,323 | 9 |
| modern-da | Moderne Dansk | — | `6e7874e0da84539d` | 1525 | 1626 | 247,769 | 9 |

`en_editions_aligned: true`, no count mismatches, no empty paragraphs.
Mean weighted similarity **0.6802**; 0.1 % identical long paragraphs; **1 truncation flag**
(chapter 1206, para 0).

Sections map to the nine Books: 1–215 (Book 1 Clio), 216–397 (2 Euterpe), 398–557 (3 Thalia),
558–761 (4 Melpomene), 762–886 (5 Terpsichore), 887–1026 (6 Erato), 1027–1260 (7 Polymnia),
1261–1403 (8 Urania), 1404–1525 (9 Calliope). "Chapter" = one Herodotean section; almost all
have a single paragraph.

Recomputed word-level similarity per chapter (≥120 source words, n = 1104): median **0.721**.
Share of source words by similarity band: ≥0.95 → 0.3 %; 0.90–0.95 → 3.1 %; 0.85–0.90 → 6.0 %;
0.75–0.85 → 30.5 %; 0.60–0.75 → 43.9 %; <0.60 → 16.1 %. So this is a *conservative but real*
rewrite: a small minority of chapters are near-untouched Macaulay, the bulk is genuinely
reworked.

## Provenance / completeness of the core English text

original-en is G. C. Macaulay's 1890 translation, the Project Gutenberg text (#2707/#2456).
Complete, all nine Books.

Two provenance problems in **original-en** itself, both of which modern-en actually fixes:

1. **Footnote-marker pollution.** Macaulay's footnote reference numbers were never stripped and
   sit inside the reading text: 1,384 stray digits (e.g. *"For many very wealthy men are not
   happy, 32 while many who have but a moderate living are fortunate; 33 and in truth…"*,
   *"the rise of the Yin dynasty was due to I Chih"* style markers throughout). modern-en is
   clean (35 remaining digits, all genuine numerals).
2. **Merged chapters / non-contiguous numbering.** original-en's chapter titles skip nine
   Herodotean numbers — at globals 44 (1.43→1.45), 575 (4.17→4.19), 879 (5.117→5.119),
   1061 (7.34→7.36), 1064 (7.38→7.40), 1091 (7.66→7.68), 1099 (7.75→7.77), 1238 (7.215→7.217),
   1348 (8.87→8.89). I checked two of these (global 43 and global 1347): the "missing" chapter's
   text is present, merged into the preceding file chapter (global 1347 runs through 8.88 and
   ends on *"My men have become women, and my women men."*). **Content is not lost** — the
   numbering is just a merge artefact of ingestion.

## Phase 1 flags — confirmed / disconfirmed

**The single truncation flag (chapter 1206 = Hdt 7.184, ratio 0.60) — DISCONFIRMED, and it is
actually the best passage in the book.** Macaulay's myriad-arithmetic is converted to Arabic
numerals, which halves the word count while preserving every figure:

SRC: *"the original number of the crews supplied by the several nations I find to have been
twenty-four myriads and also in addition to them one thousand four hundred, if one reckons at
the rate of two hundred men to each ship … This was the naval force which came from Asia,
amounting in all to fifty-one myriads and also seven thousand six hundred and ten in addition."*
MOD: *"the original crews supplied by the various nations amounted to 241,400 men — reckoning
200 men per ship … This, then, was the naval force from Asia, totaling 517,610 in all."*

I checked the arithmetic: 1,207 × 200 = 241,400 ✓; 1,207 × 30 = 36,210 ✓; 3,000 × 80 = 240,000 ✓;
241,400 + 36,210 + 240,000 = 517,610 ✓; + 1,700,000 + 80,000 + 20,000 = 2,317,610 ✓.
Every number in the chain is correct.

`last_chapter_suspiciously_short: false` — confirmed; 9.122 is complete through Cyrus's
"soft lands breed soft men" reply.

**However, the mechanical screen missed the two real defects in this book** (see below): both are
chapter-level content substitutions with matching paragraph counts and fluent output, so no
count, length-ratio or empty-paragraph check could see them.

## Phase 2 — sampled passages (20 locations across eight of the nine Books)

Sampling: Book 1 ×6 (1.1, 1.23, 1.24, 1.32, 1.188, 1.202), Book 2 ×4 (2.1, 2.6, 2.35, 2.86),
Book 3 ×2 (3.27, 3.80), Book 4 ×1 (4.5), **Book 5 ×0**, Book 6 ×1 (6.112), Book 7 ×3 (7.48, 7.184, 7.162),
Book 8 ×1 (8.89), Book 9 ×2 (9.29, 9.122). Plus whole-corpus automated sweeps for numerals,
proper nouns, terminology and chapter-title integrity.

### CONFIRMED SUBSTANTIVE OMISSION #1 — Herodotus 1.188 (file chapter 187)

SRC (1.188): *"This queen then is reported to have been such as I have described: and it was the
son of this woman, bearing the same name as his father, Labynetos, and being ruler over the
Assyrians, against whom Cyrus was marching. Now the great king makes his marches not only well
furnished from home with provisions for his table and with cattle, but also taking with him
water from the river Choaspes, which flows by Susa, of which alone and of no other river the
king drinks: and of this water of the Choaspes boiled, a very great number of waggons,
four-wheeled and drawn by mules, carry a supply in silver vessels, and go with him wherever he
may march at any time."*

MOD at the same index: *"On his march toward Babylon, Cyrus reached the river Gyndes. This river
rises in the mountains of the Matienians, flows through Dardanian territory, and empties into
the Tigris, which passes the city of Opis and flows into the Red Sea. As Cyrus attempted to
cross the Gyndes… one of his sacred white horses charged into the river…"*

That is **Herodotus 1.189**, not 1.188 — and 1.189 is *also* correctly translated at the very
next index (file chapter 188), so modern-en contains the Gyndes story twice (once as a loose
paraphrase, once as a close rendering) and does not contain 1.188 at all. Herodotus's famous
detail that the Persian king drinks only boiled Choaspes water, carried in silver vessels on
four-wheeled mule waggons, is gone. Whole-text check: "Choaspes" appears 4× in original-en,
2× in modern-en; "Labynetos/Labynetus" for this passage is absent.

### CONFIRMED SUBSTANTIVE OMISSION #2 — Herodotus 2.6 (file chapter 221)

SRC (2.6): *"Then secondly, as to Egypt itself, the extent of it along the sea is sixty
schoines, according to our definition of Egypt as extending from the Gulf of Plinthine to the
Serbonian lake, along which stretches Mount Casion… for those of men who are poor in land have
their country measured by fathoms, those who are less poor by furlongs, those who have much land
by parasangs, and those who have land in very great abundance by schoines: now the parasang is
equal to thirty furlongs, and each schoine… is equal to sixty furlongs. So there would be an
extent of three thousand six hundred furlongs for the coast-land of Egypt."*

MOD at the same index: *"As further evidence about this land, the priests told me that in the
reign of King Moeris, whenever the river rose at least eight cubits, it flooded all of Egypt
below Memphis…"*

That is **Herodotus 2.13**, which is *also* correctly translated seven chapters later at file
chapter 228 (*"The priests also gave me a strong proof concerning this land as follows. In the
reign of King Moeris…"*). So again: one chapter of Herodotus deleted, a neighbouring chapter
duplicated in its place. Lost with it is the whole fathom / furlong / parasang / schoine scale —
one of Herodotus's signature ethnographic-measurement asides — and the 3,600-furlong figure.
Whole-text check: "schoin*" 9× in original-en → 2× in modern-en; "Plinthine" 1× → 0×.

Both defects are the classic "missing substance concealed by fluent prose" failure: the
replacement text is well written and on-topic, so nothing looks wrong locally.

### CONFIRMED DATA DEFECT — 407 wrong chapter titles in modern-en

modern-en's chapter titles diverge from original-en's for a contiguous run of **407 chapters,
file chapters 44 through 450** (Book 1 ch. 45 → Book 3 ch. 53). In that range the title carries
the **global file index** instead of the Herodotean chapter number:

| file chapter | original-en title | modern-en title |
|---|---|---|
| 187 | Book 1 — Clio, Chapter 188 | Book 1 — Clio, Chapter 187 |
| 221 | Book 2 — Euterpe, Chapter 6 | Book 2 — Euterpe, **Chapter 221** |
| 450 | Book 3 — Thalia, Chapter 53 | Book 3 — Thalia, **Chapter 450** |

In Book 1 this happens to look like a harmless off-by-one (because of the 1.44 merge); in Books
2 and 3 it is grossly wrong. A reader in split-pane sees "Book 2 — Euterpe, Chapter 6" on the
left and "Book 2 — Euterpe, Chapter 221" on the right. Outside 44–450 the titles match exactly.
This is a scripted fix.

### Digressions — specifically checked, and preserved intact

The batch brief flagged the risk that a modernization would quietly trim Herodotus's *logoi*.
It has not. Every digression I sampled is complete:

- **1.23–24, Arion and the dolphin** (453 source words). Every beat survives: Periander,
  Corinthians and Lesbians agreeing, the dithyramb, Taras/Tarentum, the plot, the offer of his
  wealth, the choice between suicide aboard and jumping, the full minstrel's garb, the Orthian
  strain, the dolphin, Periander's disbelief, the sailors' story, the bronze votive at Taenarum.
- **2.35, Egyptian customs reversed** (191 source words). The whole catalogue is there —
  women trading and men weaving, woof pushed downwards, burdens on heads vs shoulders,
  urination postures, relieving themselves indoors and eating in the street with the stated
  reason, no priestesses, daughters compelled to support parents and sons not.
- **2.86, mummification** (358 source words). Every technical step: the painted wooden models,
  the three price tiers, the hooked iron through the nostrils, the Ethiopian stone, palm-wine,
  pounded spices, myrrh and cassia but not frankincense, seventy days in natron, the linen bands
  and gum, the man-shaped wooden case stood upright against the wall.
- **4.5, Scythian origin myth.** Targitaos, the Borysthenes, Herodotus's own scepticism
  (*"though I for my part do not believe it"*), the three sons, the four gold objects, the
  blazing fire, the transfer of kingship.
- **3.80, the Constitutional Debate** (469 source words). Otanes's whole speech survives,
  including Herodotus's aside that some Greeks disbelieve the speeches were made.

### Strong passages
- **1.1 (opening, Io)** and **1.32 (Solon on happiness, 660 source words)** — complete, including
  Solon's entire day-count arithmetic (70 years, 25,200 days, 35 intercalary months, 1,050 days,
  26,250 total) and the "no single land is self-sufficing" analogy.
- **3.27 (Apis)** — good use of a minimal gloss: *"the sacred bull Apis"* where Macaulay has bare
  "Apis". Exactly the "explain essential unfamiliar terms briefly at the point of need" move.
- **9.122 (ending)** — complete; Cyrus's soft-lands/soft-men reply intact.

### Weak passages — near-untouched Macaulay
A small minority of chapters are copy-edits only. **1.202** (sim 0.954) and **2.1** (sim 0.971)
differ from the source essentially in punctuation; the archaisms a modern reader trips on
survive verbatim (*"who are wont to use as clothing the skins of seals"*, *"being the son of this
woman and of Cyrus"*, *"whence flows the Gyndes"*). This affects ~3.4 % of the book's words.

### Terminology inconsistency (whole-text counts)
- Macaulay's "Hellen*" (638 occurrences) is rendered as **"Greek*" 438× and "Hellen*" 217×** —
  the same source word, two different English words, with no discernible rule. e.g. 3.80 keeps
  "Hellenes"; 6.112 and 7.162 use "Greeks".
- "Barbarian" (204×, capitalized in source) → lower-case "barbarian" 198× / "Barbarian" 4×.
- "furlong" (84× in source) → "furlong" 69× / "stade" 10× / dropped 5×. Two different renderings
  of one unit, and "stade" is arguably *less* accessible than "furlong".
- "myriad" (48×) → numerals mostly, but 10 survive untranslated.
None of these is a comprehension failure, but they violate the consistency requirement and would
confuse a reader using search or the Cast panel.

### Cosmetic
Mixed apostrophe typography in modern-en (608 straight `'` alongside 26 curly `’`), where
original-en is uniformly straight. Also one mismatched quote pair seen at 3.80 (`‘Equality.'`).

### Automated omission sweep (whole corpus)
I ran a normalized proper-noun-loss detector over all 1,319 chapters ≥4 proper nouns, and a
numeral-preservation check over all 1,626 paragraph pairs. The top two proper-noun-loss
chapters were exactly 187 and 221 (the two confirmed omissions). The remaining high scorers
(9.29, 7.36, 7.162, 6.33…) are all benign — Hellenes→Greeks, Euxine→Black Sea, myriad→numeral.
The numeral sweep produced no genuine losses (all hits were Macaulay footnote markers). So the
omission rate looks low, but the sweep is heuristic and cannot prove there are only two.

## Phase 3 — human-edition research

**Candidate A — A. D. Godley, *Herodotus, The Persian Wars* (Loeb Classical Library, Harvard
University Press, 1920–1925), 4 vols. Complete.**
Read at Wikisource: <https://en.wikisource.org/wiki/Herodotus_The_Persian_Wars_(Godley)>.
I fetched the raw Book I page and confirmed **all 216 chapters are present**, header crediting
"A. D. Godley, 1920, Loeb Classical Library, Harvard University Press, Cambridge MA".

**Rights: public domain.** US — Loeb vols. I–III copyright lapsed, vol. IV (1925) not renewed.
Denmark/EU — Godley died **1925**, so life+70 expired in **1996**. PD in both jurisdictions.
(Wikisource's own transcription adds no separate restriction.)

**But I read it, and it is not more accessible than what we have.** Godley 1.32:
*"Croesus," said Solon, "you ask me concerning the lot of man; well I know how jealous is Heaven
and how it loves to trouble us. In a man's length of days he may see and suffer many things that
he much mislikes."* And 1.187: *"Wert thou not insatiate of wealth and basely desirous of gain,
thou hadst not opened the coffins of the dead."* And 1.189: *"Cyrus was very wroth… essayed to
cross the Gyndes."*
Godley's sentences are shorter and better punctuated than Macaulay's, but his *diction* is in
places more archaic (*mislikes, whereof, essayed, wroth, wert thou not insatiate*, second-person
singular in quoted speech). Against our reading standard — "clear, natural English for a
thoughtful modern adult" — Godley is a lateral move, not an upgrade. **I do not recommend
switching to it**, but it is a clean, complete, rights-clear fallback if the current modern-en
ever had to be withdrawn, and it is a useful cross-check text for repairing 1.188 and 2.6.

**Candidate B — George Rawlinson (1858–60).** Frequently called "the classic" English Herodotus
and PD (Rawlinson d. 1902). **Unverified** — I did not locate and read a complete, cleanly
transcribed digital text in this search (Project Gutenberg carries Macaulay, not Rawlinson;
sacred-texts.com returned HTTP 403). Recorded as unverified, not rejected. Rawlinson is also
generally reckoned freer and more Victorian than Macaulay, so it is unlikely to beat Godley on
accessibility.

**Modern trade translations (de Sélincourt/Marincola, Waterfield, Holland, Purvis/Strassler)** are
all in copyright and were not pursued.

**Standard Ebooks has no Herodotus** as of this search.

## Phase 4 — ratings and decision

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40 % | **4** |
| first-read clarity | 25 % | **4** |
| literary voice | 20 % | **4** |
| restraint / no invention | 10 % | **4** |
| naturalness | 5 % | **4** |

**Weighted score 4.0 — band: Good with fixes.**

Fidelity 4, not 5, because of the two confirmed chapter-level omissions; not 3, because they are
two localized defects in 1,525 chapters and everything else I sampled or swept was complete,
numerically accurate, and digression-preserving. Clarity 4: a genuine, consistent improvement on
Macaulay (archaic pronouns gone, periods broken up, footnote digits removed, myriads converted)
but deliberately conservative, with a residue of chapters barely touched. Voice 4: Herodotus's
digressive, first-person, sceptical manner is well preserved.

**Recommendation: LIGHT EDIT.** Confidence: **medium** — 20 sampled passages out of 1,525
chapters, plus whole-corpus automated sweeps for numerals, proper nouns, terminology and titles.
"Strong in samples" is not "the whole book is verified": there may be further chapter
substitutions of the 1.188 / 2.6 type that my heuristics did not surface.

**Correction scope: local.** Four scoped jobs:
1. Retranslate Herodotus **1.188** (file chapter 187) and **2.6** (file chapter 221) from the
   source, and delete the duplicated paraphrases of 1.189 and 2.13 that currently occupy them.
2. Rewrite the **407 modern-en chapter titles** in file chapters 44–450 to match original-en
   (scripted; the correct values are already in original-en).
3. Normalize terminology: pick one of Hellenes/Greeks, one of furlong/stade, one apostrophe
   style; convert the 10 residual "myriads".
4. Re-run the chapter-substitution detector over the whole book (proper-noun loss + best-match
   against neighbouring source chapters) to see whether 1.188 and 2.6 are the only two.

Separately worth considering, but not part of this recommendation: **original-en is the weaker
edition of the pair.** Its 1,384 embedded footnote digits are a live reading defect for anyone
who chooses the Macaulay edition today.

## Limitations of this review

- 20 passages out of 1,525 chapters (~1.3 %) were read as aligned pairs, concentrated in Books 1–3
  and 6–9. **Book 4 was sampled once (4.5) and Book 5 not at all** — Book 5 (file chapters
  762–886, Terpsichore) was covered only by the automated sweeps. If a third chapter
  substitution exists, Book 5 is the least-inspected place for it.
- The two omissions were found by an automated sweep plus targeted follow-up; the sweep is a
  heuristic (normalized proper-noun set difference) and will miss substitutions between chapters
  that share proper nouns. The true omission count is unknown; I found two.
- modern-da was **not** reviewed. Note that modern-da's chapter titles could not be checked
  against original-en by my script (they are Danish); the title defect may or may not extend to
  it, and that should be checked separately.
- I did not check audio manifests, onboarding JSON, or `the-histories-threads.json`.
- Rawlinson remains **unverified**, not rejected.
- No legal advice is given or implied on any rights question.
