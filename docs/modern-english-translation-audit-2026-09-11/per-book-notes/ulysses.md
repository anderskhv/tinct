# ulysses — Ulysses (James Joyce)

Batch B1 · audit date 2026-09-11 · reviewer: batch agent B1

## Edition snapshot (from Phase 1 `mechanical/ulysses.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `ddc3418890b6a623` | 18 | 7148 | 264,931 | Original (1922) |
| modern-en | `ac853e0de7c6f8da` | 18 | 7148 | 268,222 | Modern English |
| modern-da | `b0cff115dcc73fbb` | 18 | 7148 | 258,904 | Moderne Dansk |

`en_editions_aligned: true`, no count mismatches, 0 truncated, 0 empty,
**mean weighted similarity 0.935**, pct_identical_long_paragraphs 0.7.

## Core English text — provenance and completeness

James Joyce, *Ulysses*, the 1922 Shakespeare and Company first edition.
Complete, 18 episodes. This is an **English original**, not a translation.

Rights: public domain in the **United States** (published 1922; US copyright in
pre-1929 works has expired) and in the **EU/Denmark** since 1 January 2012
(Joyce d. 1941, life+70). Caveat recorded by the International James Joyce
Foundation: the *1934 Random House* and *1961 Random House* editions, and
Gabler's 1984 edition, raise separate questions — only the 1922 text is safely
clear. Tinct's edition is labelled "Original (1922)", which is the right choice;
I did not collate it against a facsimile to verify it *is* the 1922 text rather
than a later one.
Sources: https://joycefoundation.utulsa.edu/joyce-copyright/joyce-works-copyright-public-domain/ ·
https://www.newswise.com/articles/ulysses-has-no-us-copyright

## Headline finding — the book is two-thirds unmodernized

The Phase 1 mean of 0.935 conceals a hard split. Recomputed per episode:

```
ep 1 Telemachus   0.851      ep10 Wandering Rocks  0.837
ep 2 Nestor       0.859      ep11 Sirens           0.996  <
ep 3 Proteus      0.746      ep12 Cyclops          0.992  <
ep 4 Calypso      0.845      ep13 Nausicaa         0.996  <
ep 5 Lotus Eaters 0.823      ep14 Oxen of the Sun  0.991  <
ep 6 Hades        0.837      ep15 Circe            0.998  <
ep 7 Aeolus       0.821      ep16 Eumaeus          0.995  <
ep 8 Lestrygonians 0.726     ep17 Ithaca           0.997  <
ep 9 Scylla&Charybdis 0.822  ep18 Penelope         0.998  <
```

Episodes 1–10 (87,097 words) received real editorial work. **Episodes 11–18
(177,834 words — 67% of the book) are the 1922 text with a thin glossary pass
applied.** I counted the token-level edits directly:

| episode | words | token-level changes | rate |
|---|---|---|---|
| 14 Oxen of the Sun | 20,328 | 141 | 0.7% |
| 16 Eumaeus | 22,705 | 86 | 0.4% |
| 15 Circe | 38,060 | 69 | 0.2% |
| 18 Penelope | 24,182 | 43 | **0.18%** |

The hardest episodes in the novel — Oxen of the Sun, Circe, Ithaca, Penelope —
are the least touched. The reader who selects "Modern English" to get through
"Oxen of the Sun" receives Joyce's Anglo-Saxon and Middle-English pastiche
essentially verbatim.

**Answer to the orchestrator's question about sim=0.935:** it is not that
Joyce's prose is so distinctive that a good modernization would retain it. It
is that two-thirds of the book was never modernized. Where the edition *does*
intervene, it changes plenty (ep 8 at 0.726) — and, as below, often for the worse.

## Phase 1 flags — confirmed / disconfirmed

- **mean similarity 0.935 — CONFIRMED but seriously misleading**; see above.
- **pct_identical_long_paragraphs 0.7 — CONFIRMED but a weak instrument here.**
  Byte-identity is defeated by a single apostrophe or hyphen change. Normalizing
  curly apostrophes, the identical-paragraph share in the untouched episodes is:
  ep 11 53%, ep 12 45%, ep 15 43%, ep 17 39%, ep 13 23%, ep 16 18%, ep 14 6%,
  ep 18 0% (Penelope has only 8 paragraphs, each ~3,000 words, so one change
  per paragraph defeats the metric entirely while 99.8% of the text is
  unchanged). **For books with very long or very short paragraphs this metric
  should not be trusted; per-episode similarity is the check that works.**
- **0 truncated / 0 empty paragraphs — CONFIRMED.** My 72%-length sweep across
  all 7,148 pairs found zero. Nothing is cut.
- **last_chapter_suspiciously_short: false — CONFIRMED** (Penelope, 24,191 words).

## Samples inspected (10)

### 1. Episode 1 (Telemachus), paras 0–11 — modernized

> **SRC** "—Come up, Kinch! Come up, you **fearful** jesuit!"
>
> **MOD** "—Come up, Kinch! Come up, you **cowardly** Jesuit!"

**Finding — outright mistranslation.** "Fearful jesuit" is *dreadful/appalling
Jesuit* (Mulligan mocking Stephen's training). "Cowardly" reverses the sense
and makes Mulligan's taunt land on the wrong target. This is the fourth line of
the novel.

> **SRC** "—For this, O dearly beloved, is the genuine **Christine**: body and
> soul and blood and **ouns**."
>
> **MOD** "—For this, O dearly beloved, is the genuine **Christ**: body and soul
> and blood and **wounds**."

**Finding — flattened joke.** "Christine" is Mulligan's camp blasphemy,
feminizing Christ inside a mock-Mass. Replacing it with "Christ" deletes the
joke and leaves a straight-faced liturgical line. "Ouns" is a minced oath
('swounds = God's wounds); "wounds" recovers half of it and loses the swearing.

> **SRC** "his even white teeth glistening here and there with gold points.
> **Chrysostomos.**"
>
> **MOD** "his even white teeth gleaming here and there with gold fillings.
> **Golden-mouthed.**"

**Finding — image replaced by explanation.** "Chrysostomos" is Stephen's
one-word interior allusion (St John Chrysostom, *golden-mouthed*), fired off by
the gold in Mulligan's teeth. It is the reader's first glimpse of Stephen's
learned, Greek-inflected inner voice. Translating it into English destroys both
the allusion and the characterization.

> **SRC** "**Solemnly** he came forward and mounted the round gunrest."
>
> **MOD** "**With mock solemnity** he stepped forward and mounted the round gun
> platform."

**Finding — invention.** Joyce writes "Solemnly" and lets the mockery emerge.
"With mock solemnity" is an interpretation added to the text, closing an
ambiguity the novel deliberately leaves open.

Also: "—*Introibo ad altare Dei*." → "—Introibo ad altare Dei — I will go unto
the altar of God." An explanatory gloss inserted *inside* Joyce's line.
"untonsured hair" → "unshorn hair" loses the mock-priest joke.

### 2. Episode 3 (Proteus), paras 0–3 — modernized; the worst damage in the book

> **SRC** "**Ineluctable modality of the visible**: at least that if no more,
> thought through my eyes. Signatures of all things I am here to read,
> **seaspawn and seawrack**… Limits of the **diaphane**. **But he adds: in
> bodies.**… Bald he was and a millionaire, ***maestro di color che sanno***."
>
> **MOD** "**The inescapable reality of the visible**: at least that much, if
> nothing more, thought through my eyes. Signatures of all things I am here to
> read — **seaweed and wrack**… Limits of the **transparent**. **But Aristotle
> adds: in bodies.**… Bald he was and a millionaire, **the master of those who
> know**."

Four separate failures in eleven words each:
- "Ineluctable **modality**" → "inescapable **reality**" is a philosophical
  error, not a simplification. Modality is Aristotle's technical term; reality
  is a different concept. This is also the single most famous sentence in the
  episode, and it recurs ("ineluctable modality of the audible") — changed there
  too.
- "seaspawn" is Joyce's coinage; "seaweed" is not what it means.
- "But he adds" → "But Aristotle adds" **names what Joyce withholds** — an
  invention that hands the reader the answer to the puzzle the paragraph is.
- *maestro di color che sanno* is Dante's phrase for Aristotle (*Inferno* IV).
  Translating it removes the Dante allusion that is doing the naming work.

> **SRC** "Five, six: the ***nacheinander***… If I fell over a cliff that
> **beetles o'er his base**, fell through the ***nebeneinander*** ineluctably!…
> **Tap with it: they do.**… Sounds solid: made by the mallet of ***Los
> Demiurgos***… **Dominie Deasy kens them a'.**"
>
> **MOD** "Five, six: **one thing after another**… If I fell over a cliff that
> **hangs above the sea**, fell through **things side by side**, inescapably!…
> **Tap with it: that's what blind men do.**… Sounds solid: made by the hammer
> of **God the Creator**… **Old Deasy the schoolmaster knows all about them.**"

- *nacheinander* / *nebeneinander* are Lessing's terms from the *Laocoön* and
  are the organizing motif of the episode. Both erased.
- "a cliff that beetles o'er his base" is *Hamlet* I.iv. Erased.
- *Los Demiurgos* is Blake's Los fused with the Gnostic demiurge; "God the
  Creator" is neither.
- "Tap with it: they do" → over-explained.
- Deasy's Scots "kens them a'" flattened.
- Two paragraphs later: "A **catalectic** tetrameter of iambs" → "A **four-beat
  line** of iambs" — dropping "catalectic" removes the whole point, since the
  line's metrical truncation is what makes it gallop ("*deline the mare*").

### 3. Episode 8 (Lestrygonians), paras 0–7 — modernized

> **SRC** "placed a **throwaway** in a hand of Mr Bloom"
>
> **MOD** "placed a **religious leaflet** in Mr Bloom's hand"

**Finding — destroys a structural plot pun.** *Throwaway* is also the name of
the horse that wins the Ascot Gold Cup on 16 June 1904. The whole
misunderstanding in "Cyclops" — the citizen and Lenehan believing Bloom has
won on Throwaway and is hiding his winnings — depends on this word being here.
Replacing it in Episode 8 while leaving Episode 12 untouched breaks the link
across the novel.

Also: "lemon platt" → "lemon drops" (platt is a specific plaited candy);
"Lozenge and comfit manufacturer to His Majesty the King" → "Confectionery
manufacturer to His Majesty the King" (flattens the royal-warrant formula that
sets up "God. Save. Our."); "hymen" → "virginity"; "Iron Nails Ran In." →
"Iron Nails Ran In — I.N.R.I." (over-gloss; Bloom's mishearing is the joke, and
decoding it kills it).

### 4–10. Episodes 11, 12, 13, 14, 15, 17, 18 — **not modernized**

Representative evidence from each:

**Ep 14 (Oxen of the Sun), para 10 — 1.000 similarity, byte-identical:**
> **SRC / MOD, identical:** "Loth to irk in Horne's hall hat holding the seeker
> stood. On her stow he ere was living with dear wife and lovesome daughter
> that then over land and seafloor nine years had long outwandered."

Para 30 (1,695 words) differs by three tokens. The episode's total intervention
is 141 word-swaps in 20,328 words, and they are of this kind: `sapience
endowed`→`wisdom`, `in doctrine erudite`→`learned`, `proliferent`→`fertile`,
`parturient`→`laboring`, `commodiously`→`comfortably`, `divers`→`various`,
`thither`→`there`, `molestful`→`troublesome`.

**This is worse than doing nothing.** "Oxen of the Sun" *is* a chronological
pastiche of English prose style from Old English to Dublin slang. Substituting
a handful of the period words degrades the pastiche while leaving 99.3% of it
in place, so the reader gets neither Joyce's design nor a readable text.

**Ep 15 (Circe), 69 changes in 38,060 words (0.2%):**
`nighttown,`→`the red-light district,` (Nighttown is Joyce's proper noun for
the setting and the episode's name in every guide), `VIRAGO:`→`fierce woman:`
(a speaker label in a play-script episode rewritten into lower-case
description, breaking the dramatic form while the other 1,400 speaker labels
keep their capitals), `bawd`→`madam`, `navvy`→`laborer`, `Kithogue!`→`lefty!`.

**Ep 18 (Penelope), 43 changes in 24,182 words (0.18%):**
`farthing`→`penny`, `lay out 4d`→`spend fourpence`, `gabby`→`chatty`,
`petticoats`→`skirts`, `babbyface`→`baby face`, `stupoes`→`idiots`. Molly's
eight unpunctuated paragraphs are otherwise the 1922 text exactly.

**Ep 16 (Eumaeus), 86 changes in 22,705 words:** `Preparatory to`→`before`,
`inasmuch as`→`since`, `Accordingly`→`so`, `jarvey`→`cab driver`, `not to put
too fine a point on it`→`to be blunt`. Eumaeus' exhausted cliché-ridden prose
is the joke of the episode; tidying its connectives works against it.

**Ep 13 (Nausicaa), para 20 — 0.998:** Gerty MacDowell's 581-word
women's-magazine parody comes through verbatim, "iron jelloids", "Widow
Welch's female pills" and all.

**Ep 12 (Cyclops), para 5 — 0.985:** "three bob"→"three shillings" is the entire
edit in a 67-word paragraph.

**Ep 17 (Ithaca), para 10 — 0.909:** "nocturnal perambulations"→"nighttime
perambulations". "Perambulations" retained.

**Ep 11 (Sirens), para 20 — 1.000:** "Lost. Throstle fluted. All is lost now."

## Phase 3 — human-edition research

*Ulysses* is an English original. The instructions direct me to first assess
whether the original meets the reading standard.

**Does Joyce's 1922 text meet the standard?** Not by the "clear on a first read
for a thoughtful modern adult" test — but no edition of *Ulysses* ever will,
and that is by design. The difficulty is not archaism (the 1922 prose is a
century old but not linguistically remote); it is allusion, shifting register,
unmarked interior monologue, and deliberate parody. **None of these are
translatable barriers. They are the work.** The samples above demonstrate what
happens when you try: every "clarification" removes a thing the book is made of.

**Is there a human "modern English *Ulysses*"?** No, and there is not likely to
be. The search found no rendered/simplified English edition from any reputable
source. What exists instead is the annotation tradition:

| Resource | Type | Rights | Verdict |
|---|---|---|---|
| Don Gifford & Robert Seidman, *Ulysses Annotated* (2nd ed. 1988, UC Press) | Line-by-line annotation | **Fully in copyright** | The standard reference. Cannot be reused. |
| Harry Blamires, *The New Bloomsday Book* (3rd ed. 1996, Routledge) | Page-by-page paraphrase/guide | **Fully in copyright** | Closest thing to a "plain" *Ulysses*; not licensable. |
| Joyce Project / *Ulysses* hypertext annotations | Web annotation | Copyrighted by the respective editors; no open licence found | **Unverified** — not resolved either way. |
| Wikisource / Gutenberg 1922 text | Source text | Public domain | Already what Tinct ships. |

**Conclusion: none found in this search** — and I mean it in the strong sense
for this title, because the genre (a modernized *Ulysses*) essentially does not
exist. I did *not* exhaustively canvass open-licensed annotation projects, so
the annotation-layer question remains open.

## Ratings

| Dimension | Weight | Score | Reason |
|---|---|---|---|
| Fidelity / completeness | 40% | **3** | Nothing omitted (0 truncations across 7,148 pairs) — but "throwaway"→"religious leaflet", "Christine"→"Christ", "Chrysostomos"→"Golden-mouthed", "modality"→"reality", dropped "catalectic" are meaning losses, and the Proteus allusion set is gutted. |
| First-read clarity | 25% | **2** | Two-thirds of the book, including the four hardest episodes, is unmodernized. The modernized third is clearer only where the clarification is itself a loss. |
| Literary voice | 20% | **2** | Proteus flattened; Oxen partially wrecked by 141 word-swaps; Circe's dramatic form broken by rewriting a speaker label; "nighttown" and "Nighttown" both lost. |
| Restraint / no invention | 10% | **2** | "With mock solemnity", "But Aristotle adds", "that's what blind men do", the inline *Introibo* gloss, "— I.N.R.I." are all additions. |
| Naturalness | 5% | **4** | Where it does rewrite, the English is natural. |

**Weighted score: 2.5** · **Band: Poor**

## Recommendation

**SOURCE + GLOSSES** · confidence **high** · correction scope **substantial**

The 1922 text is rights-clear in both of Tinct's jurisdictions and is already
shipped. A modern-English *Ulysses* is not a thing that can be done well, and
the current attempt demonstrates exactly why: every successful "clarification"
in the samples above deletes an allusion, a joke, a pun, or a motif. The two
failures compound — where the edition does nothing it misleads the reader who
selected it, and where it does something it damages the book.

Concretely:
1. **Retire `ulysses-modern-en`** as a reader-facing edition, or at minimum
   stop labelling it "Modern English".
2. Build a **gloss/annotation layer** over the 1922 text instead — the same
   editorial budget spent on notes (*Chrysostomos = St John Chrysostom,
   "golden-mouthed"; nacheinander/nebeneinander = Lessing's terms for time and
   space; Throwaway = also the Gold Cup winner, cf. Episode 12*) delivers what
   the modernization was trying to deliver, without destroying anything.
3. If a reader-facing bridge is still wanted, an **episode-level orientation
   note** ("what this episode is doing and why it reads this way") is far more
   valuable for Oxen/Circe/Ithaca/Penelope than any word-level rewrite.

If instead the decision is to keep a modern edition, this is a **RETRANSLATE**,
not a LIGHT EDIT: the defects are recurring and structural, and 67% of the book
has not been attempted. I am recommending against that path, not for it.

## Limitations of this review

- 10 episodes sampled at passage level (~4,000 source words of 264,931, ~1.5%).
  Episodes 2, 4, 5, 6, 7, 9, 10 were not read at passage level, only measured.
- The *coverage* finding (which episodes are unmodernized, and the exact edit
  counts and edit lists per episode) is **whole-book computed evidence**, not
  sampling.
- I did **not**: collate `original-en` against a 1922 facsimile to confirm it is
  the 1922 text and not a later edition (relevant to the rights caveat above);
  review modern-da (`books/scan-report.md` gives ulysses the highest Danish
  severity in the corpus, 110, with whole paragraphs left in English — see
  Ch17 p25 there — which is a separate and more urgent problem); check
  audio, threads/cast JSON, or onboarding content.
- The Joyce Project annotation licensing is **unverified**, not cleared.
