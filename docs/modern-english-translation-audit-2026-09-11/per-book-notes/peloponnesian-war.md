# peloponnesian-war — History of the Peloponnesian War (Thucydides)

Audit batch B12 (ancient history / strategic writing, translated works), 2026-09-11.
Scope: **public**. Review only — no edition files were modified.

## Edition snapshot (Phase 1 data)

| edition | label | translator / year | sha256_16 | chapters | paragraphs | words | sections |
|---|---|---|---|---|---|---|---|
| original-en | Crawley (1874) | Richard Crawley, 1874 | `e50ada55ab4db8be` | 26 | 998 | 204,120 | 8 |
| modern-en | Modern English | — | `c035038d032ca4ec` | 26 | 998 | 200,417 | 8 |
| modern-da | Moderne Dansk | — | `be09de1996e60086` | 26 | 998 | 194,376 | 8 |

`en_editions_aligned: true`, no count mismatches, no truncation flags, no empty paragraphs,
chapter titles identical across en editions (verified). Mean weighted similarity **0.84**;
1.6 % identical long paragraphs; last chapter 7,545 words (not short).

Sections map to the eight Books: 1 → file chapters 1–5, 2 → 6–8, 3 → 9–11, 4 → 12–14,
5 → 15–17, 6 → 18–20, 7 → 21–23, 8 → 24–26.

## The central finding: a high-fidelity but **unevenly applied** copy-edit of Crawley

Recomputed word-level similarity per file chapter (difflib, `autojunk=False`):
median **0.859**, range 0.697 – 0.964. By share of source words:

| similarity band | share of book |
|---|---|
| ≥ 0.95 (essentially unedited) | **8.5 %** |
| 0.90 – 0.95 | **15.1 %** |
| 0.85 – 0.90 | 36.1 % |
| 0.75 – 0.85 | 32.4 % |
| 0.60 – 0.75 | 7.9 % |
| < 0.60 | 0 % |

The gradient is by Book. The most-worked chapters are the opening of Book 1 (ch. 1, sim 0.697),
Book 1 chs. 2–4 (0.71–0.77) and Book 2 ch. 6, the Funeral Oration chapter (0.779). The
least-worked are Book 6 ch. 20 (**0.964**), Book 6 ch. 19 (0.954), Book 8 ch. 25 (0.933),
Book 4 ch. 14 (0.915), Book 4 ch. 13 (0.901) and Book 7 ch. 22 (0.900). Roughly a quarter of the
book is a modern edition in name only.

Note that this makes the mean similarity of 0.84 *not* an "AI tell" but the opposite signal from
the one it usually carries: fidelity here is near-perfect precisely because so little was
changed.

## Phase 1 flags — confirmed / disconfirmed

There were **no** truncation, empty-paragraph or count flags to confirm or disconfirm.
`last_chapter_suspiciously_short: false` — confirmed (Book 8 ch. 26 ends at Crawley's bracketed
editorial note, *"[When the winter after this summer is over, the twenty-first year of this war
will be completed.]"*, which is where Thucydides' text breaks off).

The mechanical screen's `pct_identical_long_paragraphs: 1.6` is the only hint of the
under-modernization described above, and it badly understates it — the chapters in question are
not *identical*, just 90–96 % identical, which no paragraph-level identity test catches.

## Phase 2 — sampled passages (8 locations across Books 1, 2, 3, 5, 6, 7, 8)

Sampling: Book 1 ch. 1 (opening/Archaeology), Book 2 ch. 6 (Funeral Oration), Book 2 ch. 7
(Plague of Athens), Book 3 ch. 10 (Corcyraean stasis, 3.82–83), Book 5 ch. 17 (Melian
Conference), Book 6 ch. 20 (the highest-similarity chapter), Book 7 ch. 23 (destruction of the
Athenian army in Sicily, the ending of Book 7), Book 8 ch. 26 (the book's end). Plus whole-corpus
automated sweeps for numerals and proper nouns.

### 1. Opening — Book 1 ch. 1, paras 0–3: the edition at its best
SRC: *"The preparations of both the combatants were in every department in the last state of
perfection; and he could see the rest of the Hellenic race taking sides in the quarrel; those
who delayed doing so at once having it in contemplation."*
MOD: *"Both sides were prepared in every department to the highest pitch, and he could see the
rest of the Hellenic world taking sides in the quarrel — those who hesitated were already
considering it."*
Complete, materially clearer, Crawley's voice intact. Para 1 (302 source words, the "no settled
population" argument) is untangled without losing a clause — *"destitute of capital, never
planting their land"* survives, the Attica/poor-soil inference survives, the Ionia colonies
survive. Para 2 (Hellen son of Deucalion, Homer's Danaans/Argives/Achaeans, the absence of
"barbarian" in Homer) is complete. This is what the whole book should look like.

### 2. Funeral Oration — Book 2 ch. 6, paras 37–42: handled with care
The batch brief asked specifically whether the set-piece speeches are paraphrased into generic
modern political-speech voice. **They are not.** Length is almost exactly preserved
(para 37: 225 source words → 225; para 40: 298 → 301) and the argument structure, the
qualifications and the antitheses all survive:

SRC: *"we are rather a pattern to others than imitators ourselves … nor again does poverty bar
the way, if a man is able to serve the state, he is not hindered by the obscurity of his
condition."*
MOD: *"we are a model to others rather than imitators ourselves … nor does poverty bar the way —
if a man is able to serve the state, he is not held back by the obscurity of his condition."*

*"as a city we are the school of Hellas"*, *"we have forced every sea and land to be the highway
of our daring"*, *"daring and deliberation, each carried to its highest point, and both united in
the same persons"* — all kept.

One real voice loss, at the Oration's most famous cadence. SRC: *"and after one brief moment,
while at the summit of their fortune, **escaped, not from their fear, but from their glory**."*
MOD: *"and after one brief moment, while at the height of their fortune, **they passed away — not
from their fear, but from their glory**."* Crawley's paradox turns on "escaped" (they escaped
*from glory*, i.e. at its peak); "passed away" is a euphemism that makes the same sentence
merely puzzling. Local, one word, worth restoring.

### 3. Melian Dialogue — Book 5 ch. 17, paras 5–13: preserved, and correctly so
The dialogue is very lightly edited and the famous sentence is verbatim:
*"you know as well as we do that, as the world goes, right is only in question between equals in
power, while the strong do what they can and the weak suffer what they must."*
One legitimate clarification at para 12 — Crawley's compressed zeugma (*"your hostility cannot
so much hurt us as your friendship will be an argument to our subjects of our weakness, and your
enmity of our power"*) is unpacked into two explicit clauses. That is exactly the right kind of
intervention and it does not change the logic.

### 4. Plague of Athens — Book 2 ch. 7, paras 4–6: good
Complete. Every observation preserved, including the epidemiological detail (*"the same man was
never attacked twice — never at least fatally"*), the social collapse (*"they threw their own
dead body on the stranger's pyre and lit it"*), and the moral analysis (*"no one expected to live
to be brought to trial for his offences"*). Sentence-splitting only; no substance touched.

### 5. **Hardest passage in the book, and the edition does almost nothing** — Book 3 ch. 10, paras 32–33 (Thucydides 3.82–83 on *stasis*)
This 803-word paragraph is the densest analytical prose Thucydides wrote and the place where a
modern edition would earn its keep. It is a near-verbatim reprint of Crawley:

SRC: *"but war takes away the easy supply of daily wants, and so proves a rough master, that
brings most men's characters to a level with their fortunes."*
MOD: *"but war takes away the easy supply of daily wants, and so proves a rough master that
brings most men's characters down to the level of their fortunes."*

SRC: *"In this contest the blunter wits were most successful. Apprehensive of their own
deficiencies and of the cleverness of their antagonists, they feared to be worsted in debate and
to be surprised by the combinations of their more versatile opponents, and so at once boldly had
recourse to action."*
MOD: *"In this contest, the blunter wits were most successful. Apprehensive of their own
deficiencies and of the cleverness of their antagonists, they feared to be worsted in debate and
surprised by the combinations of their more versatile opponents, and so at once boldly had
recourse to action."*

Whole-paragraph edits amount to: *"the march of the revolution"* → *"the course of the
revolution"*; *"to divine a plot"* → *"to detect one"*; *"In fine"* → *"In short"*; *"where it
was wanting"* → *"where it was not yet there"*; a handful of commas. A reader who cannot read
Crawley cannot read this either.

### 6. **The clearest case: Book 6 ch. 20** (sim 0.964)
Para 2 (312 source words → 312) differs from Crawley in: *"alongshore"* → *"along the coast"*;
*"to go by land openly"* → *"to march openly by land"*; *"the generals imagined the following
stratagem"* → *"the generals devised the following stratagem"*; *"whose names the Syracusan
generals were acquainted with"* → *"whose names the Syracusan generals knew"*; two semicolons
become full stops. Crawley's long Victorian periods, parentheses and participial chains are
entirely intact. This chapter is not a modern edition.

### 7. Ending of the Sicilian expedition — Book 7 ch. 23, paras 37–39: good, complete
The quarries passage keeps every detail (half a pint of water and a pint of corn a day, eight
months, seventy days, not less than seven thousand prisoners). The closing sentence is
preserved almost word for word: *"they were destroyed, as the saying is, with a total
destruction; their fleet, their army, everything was destroyed; and few out of many returned
home."*

### 8. Book 8 ch. 26, paras 29–31: faithful, light
Complete, including the Arsaces/Delians/Antandros episode and Crawley's final bracketed note.

### Whole-corpus omission sweeps — clean
- **Numerals:** every number ≥ 13 present in an original-en paragraph is present in the aligned
  modern-en paragraph. **0 paragraphs** with a missing number across all 998 pairs.
- **Proper nouns:** normalized proper-noun set difference per chapter, highest loss rate
  0.13 (file ch. 3, 4 tokens of 30) and those four are spelling-normalization artefacts.
  No dropped catalogues; the full allies catalogue at Book 2 ch. 6 para 8 is complete
  (Pellene, the Anactorians, Zacynthians, Melos and Thera excepted, etc.).

### Small issues found
- **Book 2 ch. 6 para 32 — ethnics silently converted to place-names.** SRC: *"consists of four
  states, the Paleans, Cranians, Samaeans, and Pronaeans."* MOD: *"consists of four states — Pale,
  Crane, Same, and Pronae."* Factually right (those are the four cities) but it substitutes a
  different referent for what Thucydides actually wrote. Borderline; flagging rather than
  scoring it.
- **Typography.** modern-en mixes apostrophe styles (136 straight `'` alongside 160 curly `’`)
  where original-en is uniformly curly. Cosmetic; the open/close quote imbalance is inherited
  from Crawley's per-paragraph speech convention and is correct.

## Phase 3 — human-edition research

The batch brief asked me to test, rather than assume, the claim that Crawley is already
considered readable. **The claim holds.**

**Candidate A — Richard Crawley (1874). This is already Tinct's original-en.**
Standard Ebooks publishes Crawley as *the* edition of Thucydides:
<https://standardebooks.org/ebooks/thucydides/history-of-the-peloponnesian-war/richard-crawley>;
also Project Gutenberg #7142: <https://www.gutenberg.org/ebooks/7142>.

**Rights: public domain.** Richard Crawley 1840–1893 (<https://en.wikipedia.org/wiki/Richard_Crawley>);
published 1874. PD in the US and, on life+70, in Denmark/EU since 1964. Standard Ebooks' own
editorial layer is CC0. No jurisdictional complication here — unlike the Giles Sun Tzu in this
same batch.

**Scholarly reputation, checked:** Jowett's 1881 translation is described as "flowery and rather
stilted", Crawley's 1874 as "much more readable"
(<https://thesphinxblog.com/2016/07/04/any-translation-you-like-so-long-as-its-crawley/>;
<https://bmcr.brynmawr.edu/1999/1999.06.18/>). The standing criticism of Crawley is the
*opposite* of obscurity: that he is *too* readable — "the more readable and memorable it is …
the less likely it is to be accurate or authentic", and that he "tends to simplify the
exceptional complexity of Thucydides' speeches" while being more successful in narrative.
My own sampling agrees: Crawley's narrative (Book 6 ch. 20, Book 7 ch. 23) is genuinely
approachable prose; his set-piece speeches and his 3.82–83 analysis are where the difficulty
actually lives.

**Candidate B — Benjamin Jowett (1881).** PD (Jowett d. 1893), available on Internet Archive.
**Rejected**: the consensus is that it is less readable than Crawley, so it cannot serve as a
modernization.

**Also considered and not pursued:** Charles Forster Smith (Loeb, 1919–23) — PD-eligible in the
US, Smith d. 1948 so EU life+70 runs to 2019, i.e. now PD, but it is a facing-page Loeb crib and
no more accessible than Crawley. Hobbes (1629) — far harder. Modern trade translations
(Warner/Penguin, Hammond/Oxford, Lattimore, Blanco, Mynott) are all in copyright.

**Conclusion for Phase 3: no PD human translation would serve readers better than the Crawley we
already ship.** Crawley *is* the best available human edition. The open question for this book is
therefore not "which translation" but "does the modern-en layer earn its place", and the honest
answer is: in Books 1–5 and in the speeches, yes; in Books 6–8 and the dense analytical
set-pieces, not yet.

## Phase 4 — ratings and decision

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40 % | **5** |
| first-read clarity | 25 % | **3** |
| literary voice | 20 % | **5** |
| restraint / no invention | 10 % | **5** |
| naturalness | 5 % | **4** |

**Weighted score 4.5 — band: Good with fixes.**

I am deliberately *not* calling this "Strong" despite the high weighted score, and the reason
should be recorded: the score is dominated by fidelity (40 %) and restraint (10 %), which are
near-perfect here for a trivial reason — the edition barely changed the text. A verbatim reprint
of Crawley would score 5/5/5/5 on those dimensions too. The dimension that actually matters for
whether this edition should exist is first-read clarity, and it is delivered unevenly:
excellent in Book 1, real in Book 2 and the speeches, close to absent in Books 6–8 and at
3.82–83.

**Recommendation: LIGHT EDIT.** Confidence: **medium-high** — 8 sampled passages spanning seven of
the eight Books, chosen to include both the most- and least-edited chapters, plus whole-corpus
numeral and proper-noun sweeps that came back clean.

**Correction scope: substantial** (in volume, not in difficulty). The work is: run the same
modernization pass that produced Book 1 over the chapters that did not get it — priority order
Book 6 ch. 19–20, Book 8 ch. 24–26, Book 4 ch. 13–14, Book 7 ch. 22, and then the specific dense
analytic set-pieces regardless of Book, above all **Book 3 ch. 10 paras 32–33 (Thucydides
3.82–83)**, which is the single most important paragraph in the book to get right.
Two one-line fixes alongside: restore *"escaped, not from their fear, but from their glory"*
(Book 2 ch. 6 para 42), and normalize apostrophe typography.

There is **no fidelity repair needed** — nothing is missing, nothing is invented. That is worth
saying plainly, because it is unusual in this audit.

A defensible alternative recommendation would be **SOURCE + GLOSSES** — i.e. accept that Crawley
is already the readable human edition and stop maintaining a near-duplicate modern layer. I did
not choose it because Books 1–5 demonstrate that a modernization *does* add real value to this
text; the problem is that the job is half done, not that it was not worth doing.

## Limitations of this review

- 8 passages out of 998 paragraphs were read as aligned pairs. **Book 4 was not read at all**
  (only measured), and Books 3, 5, 6, 7, 8 got one passage each.
- The under-modernization finding rests on similarity measurement across the whole book plus
  spot-reading of the extremes; I did not read every chapter in the 0.90+ band to confirm each
  one individually.
- modern-da was **not** reviewed. All findings concern modern-en only.
- I did not check audio manifests, onboarding JSON, or `peloponnesian-war-threads.json`.
- Crawley's own accuracy against the Greek was not assessed. The scholarly criticism that he
  simplifies Thucydides' speeches is reported from secondary sources, not independently verified;
  if it is right, it is inherited by every edition we ship for this book.
- No legal advice is given or implied on any rights question.
