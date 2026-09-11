# the-prince — *The Prince*, Niccolò Machiavelli (1532)

Audit date: 2026-09-11 · Scope: public · Reviewer: batch agent (early-modern/modern continental philosophy)

## Edition snapshot (from Phase 1 `mechanical/the-prince.json`)

| edition | label / translator | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|---|
| original-it | Il Principe (1532) | `f5d8ecdaa3b7380f` | 27 | 92 | 27,279 |
| original-en | Marriott (1908), tr. W.K. Marriott | `288e7bcf4427ef04` | 27 | 254 | 32,405 |
| modern-en | Modern English | `b9145c66f97bbdf5` | 27 | 254 | 28,879 |
| modern-da | Moderne Dansk | `ab97b2cfba5114b6` | 27 | 254 | 28,289 |

`core_key_en = original-en`; `en_editions_aligned = true`; no paragraph-count mismatches, no
truncation flags, no empty paragraphs, `last_chapter_suspiciously_short = false`.
Phase 1 mean weighted similarity 0.7593, `pct_identical_long_paragraphs` 0.4.

Note: the Italian edition has only 92 paragraphs against 254 in the English editions — the
Italian is **not** paragraph-aligned with the English set and cannot be used for split-pane
alignment. That is a pre-existing structural fact, not a modern-en defect.

## Provenance of the core English text

W.K. Marriott's 1908 translation (J.M. Dent / Everyman). Complete: 26 numbered chapters plus
the dedication to Lorenzo de' Medici (27 file chapters), and Marriott's explanatory footnotes
are carried as separate paragraphs in the file. Marriott states his aim was "an exact literal
rendering of the original, rather than a fluent paraphrase," which is exactly why his English
is syntactically heavy and why a modernization has something real to do here.

**modern-en was built from Marriott's English, not independently from the Italian.** Evidence:
clause order, footnote text, bracketed footnote numbering and even Marriott's editorial
apparatus ("Mr Burd points out that this passage is imitated directly from Cicero's *De
Officiis*…") survive intact; the Petrarch quotation at the end is carried in Italian **plus**
Marriott's supplied verse translation **plus** Marriott's attribution note "Edward Dacre, 1640."
An independent translation from `original-it` would not reproduce an English translator's
footnote apparatus. Whole-book word-token retention against Marriott is 77.9% — the lowest of
the five books in this batch, i.e. this is the most genuinely rewritten of them.

## Samples inspected (7 locations, ~2,400 source words)

### 1. Opening — Chapter 1 (file ch2), paras 0–2
Source: "The new are either entirely new, as was Milan to Francesco Sforza, or they are, as it
were, members annexed to the hereditary state of the prince who has acquired them, as was the
kingdom of Naples to that of the King of Spain."
Modern: "The new ones are either entirely new — as Milan was to Francesco Sforza — or they are,
as it were, members annexed to the hereditary state of the prince who has acquired them, as the
Kingdom of Naples was to that of the King of Spain."
**Finding:** faithful; named examples preserved exactly. Clean.

### 2. Early — Chapter 7 (file ch8), para 6 (Alexander VI and Cesare Borgia, 384 → 325 words)
Source: "…It behoved him, therefore, to upset this state of affairs and embroil the powers, so
as to make himself securely master of part of their states."
Modern: "…It behooved him, then, to upset these arrangements and embroil the powers, so as to
make himself securely master of part of their states."
**Finding:** the ~15% word-count reduction here is pure removal of Marriott's redundancy ("he
did not see his way to make him master of any state that was not a state of the Church" → "he
saw no way to make him master of any state not belonging to the Church"). Every proper name
survives: Alexander VI, Faenza, Rimini, the Orsini, the Colonnesi, the Duke of Milan, the
Venetians, King Louis, Bologna, the Duchy of Urbino, Tuscany. **No substantive omission found.**

### 3. Early — Chapter 7 (file ch8), para 9 (Ramiro d'Orco, the block and the bloody knife)
Source: "…he took Ramiro, and one morning caused him to be executed and left on the piazza at
Cesena with the block and a bloody knife at his side. The barbarity of this spectacle caused the
people to be at once satisfied and dismayed."
Modern: "…he seized Ramiro and one morning had him executed and left on the piazza at Cesena
with the block and a bloody knife beside him. The barbarity of this spectacle left the people at
once satisfied and dismayed."
**Finding:** the single most important image in the book is preserved intact, including the
paradoxical "at once satisfied and dismayed." No softening, no explanation substituted for the
image.

### 4. Middle — Chapter 14 (file ch15), paras 0–2 (largest per-chapter compression, 875 → 727 words)
Source (para 1): "…to follow incessantly the chase, by which he accustoms his body to hardships,
and learns something of the nature of localities, and gets to find out how the mountains rise,
how the valleys open out, how the plains lie…"
Modern: "…and to follow the chase incessantly. By hunting he accustoms his body to hardship and
learns the nature of terrain — how mountains rise, how valleys open out, how plains lie…"
**Finding:** I checked this chapter specifically because it has the largest relative word loss in
the book (−17%). The loss is entirely Marriott's connective padding ("Which knowledge is useful
in two ways. Firstly… afterwards, by means of the knowledge and observation of that locality").
Every claim, the Tuscany example, the two-fold utility, and the list ("surprise his enemy, select
quarters, lead armies, array the battle, besiege towns") all survive. **Nothing substantive lost.**

One local blemish in the same chapter (para 2, Philopoemen): source "If we should wish to
retreat, how ought we to pursue?" → modern "If we wished to retreat, how should we do it?"
Marriott's line is itself garbled (Machiavelli has two questions: how would we retreat, and how
would we pursue them if *they* retreated). The modern reading silently picks one half. This is a
sensible repair of a defective source line rather than an invention, but it is a place where the
modern edition quietly resolves an ambiguity.

### 5. Middle — Chapter 16 (file ch17), paras 0–2 (liberality/meanness; lowest chapter similarity in Phase 1 terms)
Source: "…thus, with his liberality, having offended many and rewarded few, he is affected by the
very first trouble and imperilled by whatever may be the first danger"
Modern: "So, with his liberality, having offended many and rewarded few, he is affected by the
very first trouble and imperiled by whatever danger comes first."
**Finding:** the antithesis structure, the Julius II and King of Spain examples, and the closing
paradox ("it is one of those vices that will enable him to govern") all survive with the sting
intact. This is the chapter I used as my "hardest passage" proxy since the book carries no Phase
1 flags.

### 6. Late — Chapter 18 (file ch19), paras 1–2 (the lion and the fox)
Source: "…because the lion cannot defend himself against snares and the fox cannot defend
himself against wolves."
Modern: "…the lion cannot defend himself against snares, the fox cannot defend himself against
wolves."
**Finding:** Chiron the centaur, Achilles, the two natures, the "wise lord cannot… keep faith"
conclusion, and the *De Officiis* footnote in untranslated Latin are all preserved. Note the
Latin footnote is left unglossed — consistent with Marriott, who also left it unglossed.

### 7. Ending — Chapter 26 (file ch27), paras 0–1 and 12–14 (exhortation to liberate Italy)
Source: "…more enslaved than the Hebrews, more oppressed than the Persians, more scattered than
the Athenians; without head, without order, beaten, despoiled, torn, overrun"
Modern: "…more enslaved than the Hebrews, more oppressed than the Persians, more scattered than
the Athenians; without head, without order, beaten, despoiled, torn, overrun"
**Finding:** the tricolon and the asyndetic list are preserved verbatim; the Moses/Cyrus/Theseus
parallel is preserved; the closing Petrarch quatrain is carried in Italian, followed by the
English verse, followed by the "Edward Dacre, 1640" attribution. Ending intact.

## Phase 1 flags: confirmed / disconfirmed

- No flags were raised for this book. Both the flag set and my reading agree.
- I re-derived per-paragraph similarity myself and found `pct_identical_long_paragraphs = 0.4`
  is accounted for entirely by **Marriott's footnotes**, which are correctly left near-verbatim
  (dates, identifications of "San Giorgio is Raffaello Riario," etc.). This is right, not a defect.
- The Italian/English paragraph-count divergence (92 vs 254) is *not* flagged by Phase 1 because
  the comparison runs English-to-English. Worth carrying forward separately.

## Phase 3 — human-edition research

| candidate | date | completeness | rights | evidence |
|---|---|---|---|---|
| W.K. Marriott (current core) | 1908 | complete | PD in US; **EU/DK status unresolved** | Standard Ebooks edition at https://standardebooks.org/ebooks/niccolo-machiavelli/the-prince/w-k-marriott states only "thought to be free of copyright restrictions in the United States. It may still be under copyright in other countries." Marriott's death date is not established in any source I could find, so EU life+70 cannot be computed. |
| Ninian Hill Thomson | 1882/1897 | complete | translation PD; Wikisource *transcription* is CC-BY-SA | https://en.wikisource.org/wiki/The_Prince_(Hill_Thomson) — fetched Chapter XVI and read it. Thomson's prose ("I say that it may be a good thing to be reputed liberal, but, nevertheless, that liberality without the reputation of it is hurtful") is the same Victorian register as Marriott. **Not more accessible.** |
| Luigi Ricci | 1903 (rev. E.R.P. Vincent 1935) | complete | 1903 text PD; the 1935 Vincent revision is **not** PD | https://en.wikisource.org/wiki/The_Prince_(Ricci) ; the widely reprinted OUP text is the revision, so the PD/non-PD boundary is easy to get wrong here. |
| Modern scholarly translations — Mansfield (Chicago), Skinner/Price (Cambridge), Bull (Penguin), Parks | 1985–2009 | complete | **in copyright** | Commercial editions in print; no licensing statement permitting reuse. |

**Conclusion:** no rights-clear human English translation of *The Prince* is meaningfully more
accessible than Marriott. The PD field (Marriott / Thomson / Ricci 1903 / Dacre 1640) is uniformly
Victorian-or-older. The genuinely readable modern translations are all commercially copyrighted.
So a modern edition is the right instrument here, and the one we have does the job well.

Carry-forward rights item (applies to `original-en`, which we already ship): W.K. Marriott's
death date is unestablished, so the EU/Danish copyright term for the *translation* cannot be
computed. Worth resolving, since Tinct sells from Denmark.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 5 |
| first-read clarity | 25% | 5 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 5 |

Weighted score **4.8** — band **Strong**.

Voice is 4 rather than 5 because a handful of Marriott's Latinate registers are smoothed a
notch ("It behoved him" → "It behooved him, then"), and Marriott's italic emphases (24
underscore markers in `original-en`) are dropped with nothing substituted in `modern-en`. The
loss is small here because Marriott used emphasis sparingly.

## Recommendation

**KEEP CURRENT MODERN EDITION** — confidence **medium-high**, correction scope **none**
(optionally *local*).

Why a modernization is needed at all: Marriott deliberately chose literalism over fluency, which
produces sentences like "And the first cause of your losing it is to neglect this art" that stop a
modern reader; the modern-en untangles these without dropping a single one of Machiavelli's
concrete historical examples, which is where the book's persuasive force lives.

Optional local polish (not blocking): restore emphasis markers dropped from Marriott's italics;
consider a one-clause gloss for the *De Officiis* Latin footnote; the Philopoemen line in ch14
para 2 could be restored to Machiavelli's two-question form.

## Limitations of this review

Seven passage locations (~2,400 source words of 32,405, ~7.4%) in chapters 1, 7, 14, 16, 18 and
26 plus the dedication. I did **not** read chapters 3–6, 8–13, 15, 17, 19–25 in full, did not check
the Danish edition, did not compare against `original-it` line by line (only enough to establish
derivation direction), and did not verify footnote numbering alignment across all 27 chapters.
"Strong in samples" is not "the whole book is verified."
