# imitation-of-christ — The Imitation of Christ, Thomas à Kempis

**Scope:** public. Audited 2026-09-11. **6 passages inspected.**

## Edition snapshot (Phase 1)

| edition | sha256_16 | chapters | paragraphs | words | label in registry |
|---|---|---|---|---|---|
| original-en | `43902ea5bf50af97` | 114 | 774 | 61,341 | "Benham (1886)" (registry `translator` field is `null`) |
| modern-en | `8805af64c4357b3f` | 114 | 774 | 56,603 | "Modern English" |
| modern-da | `02c25fe5430acc68` | 114 | 774 | 55,867 | "Moderne Dansk" |

Mechanical comparison (original-en → modern-en): mean weighted similarity **0.5066**, identical
long paragraphs **2.1%**, 0 truncation flags, 0 empty paragraphs, 0 paragraph-count mismatches,
`en_editions_aligned: true`. No Phase 1 flags — this book was not on the 33-book watch list.

Provenance of the core English text: **Rev. William Benham (1831–1910), 1886**, translated from the
Latin; complete — all four Books (I: 25 chapters, II: 12, III: 59, IV: 18 = 114), flattened into a
single 114-chapter sequence with the per-Book chapter titles preserved and scripture citations kept
as chapter-final footnote paragraphs. Public domain; the same text underlies Project Gutenberg
#26222, the Standard Ebooks edition and the LibriVox recording. The registry label "Benham (1886)"
is correct; the `translator` field is simply unfilled.

## Samples inspected (6)

### 1. Opening — Book I ch 1 ("Of the imitation of Christ, and of contempt of the world")

SRC ¶3: *"What doth it profit thee to enter into deep discussion concerning the Holy Trinity, if
thou lack humility, and be thus displeasing to the Trinity? … I had rather feel contrition than be
skilful in the definition thereof."*
MOD ¶3: *"What good does it do you to discuss the Holy Trinity in learned terms, if you lack
humility and so displease the Trinity? … I would rather feel genuine sorrow for my sins than be
able to define it perfectly."*

**Finding — strong.** The famous opening keeps its shape and its sting. "Contrition" is glossed in
place ("genuine sorrow for my sins") rather than dropped or footnoted. The "It is vanity to…"
anaphora of ¶4 is preserved as anaphora across all six clauses, which matters — this book is
written to be read aloud slowly and its repetitions are structural, not accidental.

**But** see finding 6: the footnote anchor after *"He that followeth me shall not walk in
darkness,(1)"* has been deleted while footnote paragraph ¶6 still reads *"(1) John viii. 12.
(2) Revelations ii. 17. (3) Ecclesiastes i. 8."*

**One image replaced by an explanation.** SRC ¶2: *"such as have His Spirit find therein **the
hidden manna**.(2)"* → MOD ¶2: *"those who have his Spirit find **hidden nourishment** within it."*
"Hidden manna" is a direct quotation of Revelation 2:17 — which is exactly what footnote (2) is
pointing at. Turning it into "hidden nourishment" severs the allusion *and* strands the surviving
footnote. The standard is explicit that images must not be replaced by explanations.

### 2. Book II ch 1 ("Of the inward life")

SRC ¶1: *"The kingdom of God is within you,(1) saith the Lord… He often visiteth the inward man and
holdeth with him sweet discourse, giving him soothing consolation, much peace, friendship exceeding
wonderful."*
MOD ¶1: *"\"The kingdom of God is within you,\" says the Lord… He often visits the inner person,
holding sweet conversation, giving soothing comfort, deep peace, and friendship beyond anything you
could imagine."*

**Finding — strong.** Scripture is correctly moved into quotation marks (Benham only italicised or
left it bare), and the "prepare a worthy mansion for Him within thee" → "prepare a worthy home for
him within" keeps the image.

**One flattening.** SRC ¶3: *"Put thy whole trust in God and let Him be **thy fear** and thy love"*
→ MOD ¶3: *"Place all your trust in God. Let him be **your reverence** and your love."* The Latin
*timor Dei* is deliberate, and the source's paradox (fear *and* love, held together) is the point of
the sentence. "Reverence" softens a term the author chose for its edge. Local, but this is the
class of change the standard warns about.

### 3. Book III ch 1 ("Of the inward voice of Christ to the faithful soul")

SRC ¶1: *"Blessed are the ears which receive the echoes of the soft whisper of God, and turn not
aside to the whisperings of this world."*
MOD ¶1: *"Blessed are the ears that catch the gentle whisper of God and pay no attention to the
whisperings of this world."*

**Finding — strong.** The seven-fold "Blessed are…" litany survives intact as a litany — no clause
merged, no clause dropped, rhythm preserved. This is the most important structural test for this
book and it passes.

### 4. Book III ch 11 ("That the desires of the heart are to be examined and governed") — the book's **lowest**-similarity chapter (0.324)

SRC ¶5: *"Sometimes, indeed, it is needful to use violence, and manfully to strive against the
sensual appetite, and not to consider what the flesh may or not will; but rather to strive after
this, that it may become subject, however unwillingly, to the spirit."*
MOD ¶5: *"Sometimes, indeed, you must use force and fight vigorously against your physical
appetites, not caring what the body wants or doesn't want. Instead, strive to make the body obey
the spirit, however unwillingly."*

**Finding — strong.** The most heavily rewritten chapter in the book is also clean: the
Christ–disciple dialogue form ("My Son…" / "What are they, Lord?") is preserved, including the
speaker-attribution structure, and nothing in the counsel is softened away. ¶2 (*"What are they,
Lord?"*) is left byte-identical, correctly — it needs nothing.

### 5. Book IV ch 1 ("With how great reverence Christ must be received")

SRC ¶2: *"Come unto Me, sayest Thou, all that labour and are heavy laden, and I will refresh you."*
MOD ¶2: *"\"Come to me,\" you say, \"all you who labor and are heavy laden, and I will give you
rest.\""*

**Finding — strong.** The "Voice of the Disciple" / "Voice of the Beloved" speaker headings are
preserved verbatim as their own paragraphs throughout Books III–IV, which is essential to how this
text is read.

### 6. Ending — Book IV ch 18 ("That a man should not be a curious searcher of the Sacrament") — the final chapter

SRC ¶2: *"He that is a searcher of Majesty shall be oppressed by the glory thereof.(1)"*
MOD ¶2: *"\"Whoever searches into majesty will be overwhelmed by its glory.\""*
SRC ¶7 / MOD ¶7 (both, identical): *"(1) Proverbs xxv. 27 (Vulg.)."*

**Finding — the book-wide defect, confirmed at the last paragraph of the last chapter.** The book
closes correctly on content: ¶5's *"God walks with the simple, reveals himself to the humble…and
hides his grace from the curious and the proud"* keeps its four-fold parallel. But the footnote
apparatus is broken, and it is broken everywhere.

## The one systematic defect: orphaned footnote apparatus

I counted markers of the form `(N)` across the whole book, separating running-text paragraphs from
chapter-final footnote paragraphs:

| | original-en | modern-en |
|---|---|---|
| in-text footnote anchors | **180** | **0** |
| footnote-block entries | 180 | **180** |

**Every one of the 180 in-text anchors has been deleted. Every one of the 180 footnote entries has
been kept.** The reader therefore reaches the end of a chapter and finds, e.g., *"(1) John viii.
12. (2) Revelations ii. 17. (3) Ecclesiastes i. 8."* with nothing anywhere in the chapter pointing
at (1), (2) or (3).

This is not an editorial judgement call; it is a defect with a single mechanical cause and a single
mechanical fix (re-anchor, or drop the orphaned blocks — re-anchoring is clearly better, since the
scripture references are part of the work's devotional use). It affects all 114 chapters.

Secondary consequence: because the anchors are gone, nothing flags that *"hidden nourishment"*
(sample 1) is supposed to be Revelation 2:17, which is how that image got explained away without
anyone noticing.

## Archaic-language check

`thou / thee / thy / thine / hath / doth / saith` and `-eth` forms across the whole book:
**original-en 2,696 → modern-en 0.** The modernization pass is complete and consistent; there is no
partially-converted chapter anywhere.

## Phase 1 flags: confirmed vs. disconfirmed

| Flag | Verdict |
|---|---|
| mean similarity 0.5066 | **Confirmed as a thorough, genuine rewrite.** Lowest similarity of the five books in this batch; chapter range 0.324–0.641. Six passages read across all four Books support it. |
| 2.1% identical long paragraphs | **Confirmed and benign** — the identical material is short already-plain lines ("What are they, Lord?") and the footnote blocks. |
| 0 truncation / 0 empty / 0 mismatches | **Confirmed** in every sample. |
| No Phase 1 flag existed for the footnote apparatus | **New finding, not visible to the mechanical pass.** The anchors are 3-character tokens, far below any word-count threshold; nothing in Phase 1 could have caught this. |
| Devotional/exhortative address-to-reader style (brief's specific concern) | **Disconfirmed as a problem** — see samples 1, 3, 5. Anaphora, litany, and the Christ–disciple dialogue headings all survive. |

## Phase 3 — human-edition research

**Rights of the current core text.** Benham 1886 is public domain. Standard Ebooks carries it
(<https://standardebooks.org/ebooks/thomas-a-kempis/the-imitation-of-christ/william-benham>) with
the statement that the source text is "believed to be in the United States public domain… free of
copyright restrictions in the United States"; Project Gutenberg #26222 carries the same text;
Internet Archive has the 1886 printing
(<https://archive.org/details/imitationofchris00benhrich>). Benham d. 1910, so it is also PD in the
EU/Denmark.

**Is Benham accessible enough to stand alone?** No, not for our reader. Benham is deliberately
archaising — `thou/thee/hath/doth/saith` throughout, 2,696 instances — because in 1886 that was the
register for devotional prose. That is a real barrier, and the mean similarity of 0.5066 reflects
how much work removing it took. A modern edition is clearly justified here.

**Candidates examined:**

1. **Ronald Knox & Michael Oakley (1944/1959)** — widely praised ("engaging, passionate, poetic,
   very readable"; called by some the best English version). **In copyright**, in commercial print
   (Baronius Press). **Permission required.** Not accessed.
2. **Leo Sherley-Price (Penguin Classics, 1952)** — the standard paperback; "balances fidelity to
   the original Latin with readability". **In copyright**, in print (ISBN 9780140440270).
   **Permission required.** Not accessed.
3. **Richard Challoner (1st pub. 18th c.; 1848 printing)** — public domain, but an 18th-century
   Catholic register, no more accessible than Benham. Not a candidate for accessibility.
4. **Darrell Wright, "The Imitation of Christ: A New Translation" (2018)** — self-published revision
   *of Benham*, explicitly "geared toward the modern reader with its updating of language". **In
   copyright** (ISBN 9781722234010). Interesting as proof that our approach — modernize Benham — is
   the standard move, but it is a commercial product. **Permission required.** Not accessed.

**Conclusion:** no complete, readable, rights-clear human modern English *Imitation* found in this
search. The PD options (Benham, Challoner, Whitford) are all archaic; the readable options (Knox,
Sherley-Price, Wright) are all in copyright. Keeping our own modern edition is the right call —
it just needs its footnotes reconnected. I am saying "none found in this search", not "none
exists".

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | **4** — prose content complete and accurate in all six samples across all four Books, but 180/180 in-text footnote anchors deleted book-wide while the footnote blocks remain, and one scriptural image ("the hidden manna", Rev 2:17) replaced by an explanation |
| first-read clarity | 25% | **5** — genuinely readable modern devotional English; 2,696 archaic forms removed with no residue |
| literary voice | 20% | **4** — litany, anaphora, exhortative second-person address and the Christ/disciple dialogue headings all survive; small flattenings ("thy fear"→"your reverence", "babes"→"the young", "abyss of doubt"→"sea of doubt") |
| restraint / no invention | 10% | **5** — no added motive, gloss-as-fact, or explanatory transition found |
| naturalness | 5% | **5** — reads as natural contemporary English throughout, without becoming chatty |

**Weighted score: 4.4 — band: Good with fixes.**

## Recommendation

**LIGHT EDIT.** Confidence: **medium**. Estimated correction scope: **local** (bounded and
mechanical, though it touches all 114 chapters).

The rewrite itself is good work and should be kept. Two scoped fixes:

1. **Restore the 180 in-text footnote anchors** (or, second-best, delete the orphaned footnote
   blocks). Positions are recoverable exactly by aligning against `original-en`, which still has all
   180. This is the whole reason the recommendation is not KEEP.
2. **Restore the scriptural images the anchors were protecting** — starting with "the hidden manna"
   (I.1 ¶2, Rev 2:17), and sweeping the other 179 anchor sites for the same class of change.

Optional third: reconsider "thy fear" → "your reverence" (II.1 ¶3) and "giveth understanding to
babes" → "gives understanding to the young" (IV.18 ¶5).

## Limitations of this review

- 6 passages out of 774 paragraphs, spread across all four Books. The prose verdict is
  "strong in samples", not a whole-book verification.
- The footnote-anchor finding, by contrast, **is** whole-book — it comes from a complete count of
  all 180 anchors and all 180 footnote blocks, not from sampling.
- I did not check whether the surviving footnote citations are themselves accurate against
  scripture.
- I did not check modern-da.
- I did not read Knox, Sherley-Price, Challoner or Wright; their assessments here are second-hand
  and used only to establish rights status.
- I did not verify our `original-en` against the 1886 printing beyond confirming it matches the
  Benham text in circulation.
