# Fear and Trembling — Søren Kierkegaard

- **Book ID:** `fear-and-trembling`
- **Scope:** public
- **Original:** *Frygt og Bæven*, 1843, Copenhagen, published under the pseudonym **Johannes de silentio**.
- **Core English text:** `original-en`, labelled **"Original (English)"** — **translator unknown, date unknown, provenance undocumented.** See the provenance section below; this is the central finding for this book.

## Edition snapshot (Phase 1)

| Edition | sha256_16 | Chapters | Paragraphs | Words |
|---|---|---|---|---|
| original-da | `c61144bbf51a9307` | 8 | 232 | 40,013 |
| original-en | `d6f7ab72adfe4c16` | 8 | 232 | 43,777 |
| modern-en | `152776f19e1b707b` | 8 | 232 | 43,817 |
| modern-da | `f23fe5bb5f7d3fe3` | 8 | 232 | 40,154 |

Phase 1 mechanical: mean weighted similarity **0.7629**; identical long paragraphs **0.4%**; truncated 0; empty 0; alignment clean across all four editions.

Uniquely in my batch, this book ships the **Danish original** alongside the English — which matters both for Tinct's Danish audience and for the provenance question below.

## Finding 1 (primary): `original-en` has no documented provenance, and no complete public-domain English translation of this work exists

**What the repo says.** The `FEAR_AND_TREMBLING` entry in `app/src/data/bookRegistry.ts` gives the `original-en` edition **no `translator` and no `year`** — just `label: 'Original (English)'`. Every other translated book in my batch names its translator and date in the registry (Moore 1888, Pusey 1838). The Phase 1 `mechanical/fear-and-trembling.json` reflects this: `"translator": null, "year": null`.

**What the source documentation says.** `books/raw/fear-and-trembling/SOURCE.md` documents **only the Danish**: Internet Archive scan `frygtogbvendial00kiergoog`, a Google Books OCR of the 3rd Danish edition, with detailed OCR notes. There is **no SOURCE.md entry, no raw file, and no URL for any English text.** `books/raw/fear-and-trembling/` contains exactly two files: `SOURCE.md` and `raw.txt` (the Danish).

**What the rights research says.** There is **no complete public-domain English translation of *Fear and Trembling***:
- **Robert Payne, 1939** (Oxford University Press / Humphrey Milford) — the first complete English translation. Published after 1928; not PD by expiry. ([Cambridge, *Philosophy* review, 1939](https://www.cambridge.org/core/journals/philosophy/article/abs/journals-of-kierkegaard-183454-translated-and-edited-by-alexander-dru-london-oxford-university-press-humphrey-milford-1938-pp-lxii-603-price-25s-net-fear-and-trembling-by-soren-kierkegaard-translated-by-robert-payne-london-oxford-university-press-humphrey-milford-1939-pp-xvi-192-price-7s-6d-net/C36C60452770C37A5F86A5F937F1E505))
- **Walter Lowrie, 1941** (Princeton) — still in print and in copyright. ([Princeton UP](https://press.princeton.edu/books/paperback/9780691158310/fear-and-trembling-and-the-sickness-unto-death))
- **Howard V. and Edna H. Hong, 1983** (Princeton) — in copyright.
- **Alastair Hannay (Penguin), C. Stephen Evans & Sylvia Walsh (Cambridge, 2006)** — in copyright.
- **Lee M. Hollander, 1923**, *Selections from the Writings of Kierkegaard* — **genuinely public domain** ([Project Gutenberg #60333](https://www.gutenberg.org/files/60333/60333-h/60333-h.htm), [Wikisource](https://en.wikisource.org/wiki/Selections_from_the_writings_of_Kierkegaard/Fear_and_Trembling)). **But it is explicitly partial.** The text's own closing note states it "represents only a third of the whole 'Fear and Trembling'." I verified the contents: it includes the Introduction, Preparation, the four Abraham retellings, "A Panegyric on Abraham", and "Preliminary Expectoration" — and **omits the entire Problemata I, II and III**, which is the philosophical core and roughly 60% of the book. Unusable as a complete edition.

**What the text itself shows.** Our `original-en` is not any of these. Compare the Hegel jab in Problema I:

> **Lowrie (1941):** "This fact Hegel ought not to have concealed, for after all he was acquainted with Greek thought."
> **Ours (`original-en`):** "This Hegel ought not to have concealed; for he hath, after all, had Greek studies."

And the Boileau passage:

> **Lowrie (1941):** "To explain the whole of existence and faith along with it is easy, and that man does not make the poorest calculation in life who reckons upon admiration when he possesses such an explanation…"
> **Ours (`original-en`):** "To explain the whole of existence, faith and all, **without having any conception of what faith is**, is easy; and he calculateth not the worst in life who reckoneth upon admiration when he hath such an explanation in hand…"

Note our version carries a clause Lowrie drops — and it is in the Danish (*"uden at have et Begreb om, hvad Troen er"*). So our `original-en` is an **independent, fairly literal translation made from the Danish**, not a copy of any published English version. It is dressed in a pseudo-archaic register (`hath`, `heareth`, `reneweth`, `broodeth`, `calculateth`) that no real 20th-century translation of Kierkegaard uses.

A further tell: the **chapter titles mix incompatible translation traditions.** "Exordium" and "Eulogy on Abraham" are the **Hong** (1983) renderings; "Preliminary Expectoration" is the **Hollander/Lowrie** rendering. No single published translation uses that combination.

**Conclusion.** The overwhelmingly likely explanation is that `original-en` is an **in-house-generated English translation of the public-domain Danish, stylistically antiqued and mislabelled "Original (English)"**. If so, this is **not a rights problem** — a fresh translation from PD Danish is Tinct's to own — but it **is** a labelling and documentation problem, and a material one: the label implies a historical human translation to the reader, and the registry's silence means nobody downstream can tell. The alternative explanation (that it derives from a copyrighted translation) would be a serious rights problem. **Which of these is true cannot be determined from the repository**, and that is exactly why this book is blocked.

There is also a structural consequence: `original-en` and `modern-en` are two English renderings of the same Danish, differing mainly in archaism level (similarity 0.763). The `original-en` edition's archaism appears to have been *manufactured* so that a "modernised" edition would have something to modernise.

## Finding 2: ~16% of paragraphs begin or end mid-sentence (inherited OCR damage)

`SOURCE.md` warns that "some page-break mid-sentence fragments remain as short paragraphs (< 60 chars)". The reality is much larger and not confined to short fragments.

Scanning all 232 paragraphs for prose paragraphs (>8 words) that begin with a lowercase letter or lack terminal punctuation:

| Edition | Begins mid-sentence | Ends without terminal punctuation |
|---|---|---|
| original-en | 37 | 35 |
| modern-en | **38** | **38** |

By comparison: Communist Manifesto 0/0, Confessions 1/4, Leviathan 2/5 (headings), Wealth of Nations 1/58 (headings and tables). **Fear and Trembling is an outlier by an order of magnitude.**

These pair up — paragraph N ends mid-clause and N+1 continues it — so the Danish OCR's page-break splits propagated into every edition. Worst affected is **ch7 (Problema III): 18 of 88 paragraphs**. Also ch4 (Preliminary Expectoration): 9 of 42; ch6 (Problema II): 5 of 29.

Concrete example (ch1, the Preface — the *first substantive paragraph a reader sees*):

> **`modern-en` ch1 p1 begins:** "rarity in our age! Descartes, as he himself often enough repeats, did not doubt with respect to faith."

And ch8 (the Epilogue) p4 ends:

> "…the dark Heraclitus said: one cannot go twice through the same"

A reader opening this book lands on a paragraph starting with the word "rarity" in lower case. This is a serious, reader-facing defect, it is present in all four editions, and **the Phase 1 screen did not catch it** (`truncated_paragraphs_total: 0` — it compares editions against each other, and since all four are damaged identically, the comparison is clean).

## Finding 3: `modern-en` is offset by one sentence from `original-en` in ch7, splitting a word across a paragraph boundary

Distinct from Finding 2, and introduced by the modernisation rather than inherited.

In ch7 (Problema III), the modern edition's paragraph boundaries sit roughly one sentence later than the original's. The effect at p17/p18:

> **`modern-en` ch7 p17 ENDS:** "…The historical catastrophe was, according to Aristotle, the following: in order to revenge themselves, the family slip a temple-vessel in among his household goods, and he is condemned as a **temple-**"

> **`modern-en` ch7 p18 BEGINS:** "**robber.** This, however, is a matter of indifference; for the question is not whether the family is clever or stupid in taking revenge — the family acquires only ideal significance insofar as it is drawn into the hero's dialectic…"

whereas `original-en` p17 opens with "The historical catastrophe was, according to Aristotle, the following…" and closes with "…next by being condemned as a temple-robber."

**The word "temple-robber" is split across two paragraphs.** The same pattern occurs at ch7 p34, which ends "…the one who has never loved it is and remains a" and continues in p35.

**Important qualification: nothing is lost.** I checked for the displaced content and found it: the modern edition contains "ideal significance", "augur", and "absolute relation to the absolute" (the key doctrinal formulation at the end of p34). This is **content shifted into a neighbouring paragraph**, not omission. My whole-book shrinkage scan found **zero** paragraphs below 0.70× source length, consistent with that.

But it does break the paragraph-for-paragraph alignment that Tinct's split-pane compare view depends on, throughout the longest chapter in the book (88 paragraphs, 38% of the text).

## Finding 4: markdown-escape debris in the reading text

`modern-en` contains two bracketed insertions with literal escape backslashes that will render as visible `\[ \]` in the reader:

- ch7 p18: `\[The bride was not even able to help herself.\]`
- ch7 p34: `\[He will have\]`

Neither appears in `original-en`. Small, local, and cheap to fix, but it is scaffolding leaking into reader-facing text.

## Samples inspected (7)

### 1. Ch1 (Preface), para 1 — Descartes and modern doubt

> **`original-en`:** "rarity in our age! Cartesius, as he himself often enough repeats, did not doubt with respect to faith. […Latin footnote…] He did not cry fire and make it a duty for all men to doubt, for Cartesius was a quiet, solitary thinker, not a bawling street-watchman…"

> **`modern-en`:** "rarity in our age! Descartes, as he himself often enough repeats, did not doubt with respect to faith. […Latin footnote…] He did not cry fire and make it everyone's duty to doubt, for Descartes was a quiet, solitary thinker, not a roaring street-watchman…"

**Finding:** Good modernisation — "Cartesius" correctly resolved to "Descartes", the sarcasm ("bawling"→"roaring street-watchman") retained rather than neutralised, and both long Latin footnotes from the *Principia* and the *Discourse* preserved in full. **But** this is the mid-sentence-start defect of Finding 2, and note one regression: the modern edition converts the source's `[sc. juventutis]` to `(sc. juventutis)`, and swaps the closing typographic quotes to a straight apostrophe, leaving the Latin quotations with mismatched quote marks (`‘…'`).

### 2. Ch2 (Exordium), paras 0–2 — the man who could not understand Abraham

I read these against the **Danish original** as well as the English.

> **`original-da`:** "Der var engang en Mand, han havde som Barn hørt hiin skjønne Fortælling om, hvorledes Gud fristede Abraham… Hans Attraa var at følge med de 3 Dages Reise, da Abraham reed med Sorgen foran sig og Isaak ved sin Side."

> **`original-en`:** "Once upon a time there was a man who, as a child, had heard that beautiful tale of how God tempted Abraham… His craving was to accompany them on the three days' journey, when Abraham rode with sorrow before him and Isaac at his side."

> **`modern-en`:** "There was once a man who, as a child, had heard that beautiful tale of how God tested Abraham… His craving was to ride along on those three days when Abraham rode with sorrow before him and Isaac at his side."

**Finding:** Strong. The Danish is rendered accurately in both English editions. The closing image — "what occupied him was not the artful weaving of the imagination, but **the shudder of thought**" (*Tankens Gysen*) — is preserved exactly, and it is the sentence the whole Exordium turns on. One substantive change worth noting: `original-en` "God **tempted** Abraham" → `modern-en` "God **tested** Abraham". The Danish *fristede* means tempted; "tested" is the softer theological reading. Kierkegaard's whole argument depends on the harder sense. **This is a real, if single, fidelity slip** — though the modern edition keeps "endured the temptation" in the very next clause, so the concept is not lost.

### 3. Ch4 (Preliminary Expectoration), para 20 — the knight of faith as dancer

> **`original-en`:** "It is said to be the most difficult task for a dancer to leap into a determinate position, in such wise that there be no second wherein he is grasping for the position, but in the leap itself standeth in the position. Perhaps no dancer can do it — this doth that knight. The mass of men live forlorn in worldly sorrow and gladness; these are the wallflowers, who come not into the dance… But to be able so to fall down that in the same second it looketh as if one stood and walked, to transmute the leap of life into a walk, absolutely to express the sublime in the pedestrian — that can only that knight do, — and this is the one and only marvel."

> **`modern-en`:** "The most difficult task for a dancer is supposed to be to leap into a definite posture in such a way that there is not a second when he is grasping for the posture, but in the leap itself he stands in the posture. Perhaps no dancer can do it — but this knight does. The mass of people live lost in worldly sorrow and joy; these are the wallflowers, who do not come into the dance… But to be able to come down in such a way that the very second one looks as though one were standing and walking, to transform the leap of life into a walk, to absolutely express the sublime in the pedestrian — that only this knight can do — and this is the only wonder."

**Finding: Strong — the best passage in the book.** The extended dancer conceit survives whole: the leap, the wavering on landing, the wallflowers, the knights of infinity who "have elevation", and the closing paradox of expressing the sublime in the pedestrian. Nothing is converted from image into explanation. This is exactly what the standard asks for.

### 4. Ch5 (Problema I), paras 2–3 — the teleological suspension of the ethical

> **`original-en`:** "For faith is precisely this paradox, that the single individual is higher than the universal — yet, mark well, in such a way that the movement repeats itself… If this be not faith, then is Abraham lost; then hath faith never been in the world, precisely because it hath always been."

> **`modern-en`:** "For faith is precisely this paradox: that the single individual is higher than the universal, yet, mark well, in such a way that the movement repeats itself — that is, that having been in the universal, he now, as the single individual, isolates himself as higher than the universal. If this is not faith, then Abraham is lost; then faith has never existed in the world, precisely because it has always existed."

**Finding: Strong.** The book's central formula is preserved with its self-cancelling paradox ("never been… because it has always been") intact — a construction a careless edit would "fix". The Hegel jab and the Boileau French epigram both survive; the French is left untranslated and italicised, which is right.

### 5. Ch7 (Problema III), para 13 — silence, the demonic and the divine

> **`original-en`:** "Silence is the demon's snare, and the more one is silent, the more dreadful the demon becometh; but silence is also the deity's communion with the single individual."

> **`modern-en`:** "Silence is the demon's snare; and the more one is silent, the more dreadful the demon becomes; but silence is also the deity's communion with the single individual,"

**Finding:** Content strong — the Amor/Psyche allusion, the tragic hero as "ethics' favorite", and the double-valued silence all survive. **But the modern paragraph ends in a comma** where the original ends with a full stop, because of the one-sentence offset described in Finding 3.

### 6. Ch7 paras 17–18 — the bride, the temple-robber, and the ideal-significance argument

Covered in full under Finding 3 above. Content complete; paragraph boundary broken mid-word; `\[The bride was not even able to help herself.\]` debris present.

### 7. Ch8 (Epilogue), para 4 — Heraclitus and "one must go further"

> **`original-en`:** "'One must go further; one must go further.' This urge to go further is old in the world. The dark Heraclitus, who deposited his thoughts in his writings and his writings in the temple of Diana (for his thoughts had been his armor in life, and therefore he hung it up in the temple of the god) — the dark Heraclitus hath said: one cannot pass twice through the same"

> **`modern-en`:** "'One must go further; one must go further.' This urge to go further is old in the world. The dark Heraclitus, who deposited his thoughts in his writings and his writings in the temple of Diana (for his thoughts had been his armor in life, and therefore he hung it up in the temple of the god) — the dark Heraclitus said: one cannot go twice through the same"

**Finding:** The de-archaizing is correct and minimal (`hath said` → `said`), and the ironic repetition "one must go further; one must go further" — which is the Epilogue's whole satirical point against his contemporaries — is preserved. **But the paragraph is cut mid-sentence in both editions** ("through the same [river]"), Finding 2 again, and here it lands on the book's closing argument.

## Phase 1 flags: confirmed vs. disconfirmed

| Flag | Verdict |
|---|---|
| `mean_weighted_similarity: 0.7629` (just over the 0.75 gate) | **Confirmed as fact, but misleading.** The classifier reports `buckets: REAL-HEAVY 0, REAL 8, LIGHT 0, MECHANICAL 0` — all 8 chapters are genuine rewrites. The elevated similarity is an artefact of `original-en` and `modern-en` being two renderings of the same Danish by (apparently) the same hand, not of a mechanical pass. |
| `pct_identical_long_paragraphs: 0.4` (1 paragraph) | Confirmed as trivial. |
| `truncated_paragraphs_total: 0` | **DISCONFIRMED — the screen is blind here.** 38 paragraphs begin mid-sentence and 38 end without terminal punctuation (Finding 2), plus two mid-word paragraph splits (Finding 3). The screen compares editions against each other, and all four editions carry the same damage, so cross-edition comparison shows nothing. |
| `empty_paragraphs_total: 0` | Confirmed. |
| `para_count_mismatches: 0` / `en_editions_aligned: true` | Confirmed at the *count* level; **disconfirmed at the content level** for ch7, where modern-en is offset by one sentence (Finding 3). Paragraph counts match while paragraph *contents* do not correspond. |
| `translator: null, year: null` | **Confirmed and escalated** — see Finding 1. |

## Phase 3 — human-edition research

Summarised under Finding 1. In the required terms:

- **Hollander, 1923**, *Selections from the Writings of Kierkegaard*, University of Texas. **Public domain** (PG #60333). **Incomplete — approximately one third of the work; omits all three Problemata.** Rejected on completeness, not on rights or quality.
- **Payne, 1939**, Oxford University Press. Complete. **Post-1928; rights not established; presumed in copyright.** Not accessed — record as **unverified**, not rejected.
- **Lowrie, 1941**, Princeton. Complete, still commercially in print. **In copyright.** Unavailable.
- **Hong & Hong, 1983**, Princeton; **Hannay**, Penguin; **Evans & Walsh**, Cambridge 2006. All complete, all firmly **in copyright**. Unavailable.

**"No suitable edition found" here means "none exists,"** not "my search was incomplete": the work's translation history is short and well documented, the first complete English version postdates the US public-domain cutoff, and the one PD English text is explicitly partial by its own admission.

**The upside:** Tinct already holds the **public-domain 1843 Danish original**, which is the strongest asset in this book's edition set and is especially valuable given Tinct's Danish audience. Any legitimate English text here has to be freshly translated from that Danish — which is very likely what `original-en` already is. The fix is therefore documentation, not acquisition.

## Ratings

These rate `modern-en` against `original-en`, with the caveat that the baseline's provenance is unestablished.

| Dimension | Weight | Score | Note |
|---|---|---|---|
| Fidelity / completeness | 40% | **3** | No content lost (shifted material verified recovered; zero shrinkage hits). But paragraph correspondence is broken through ch7, a word is split across a paragraph boundary, ~16% of paragraphs begin or end mid-sentence, and "tempted"→"tested" softens a load-bearing term |
| First-read clarity | 25% | **4** | The de-archaizing genuinely helps; undercut by paragraphs that open mid-word and by the `\[ \]` debris |
| Literary voice | 20% | **5** | Excellent — the circling repetition, the irony, the dancer conceit, the Hegel jab, the Boileau epigram and the pseudonymous indirection all survive. Kierkegaard is not flattened. |
| Restraint / no invention | 10% | **5** | No added interpretation or explanation found; the French and Latin are left untranslated rather than glossed away |
| Naturalness | 5% | **4** | Reads well where the paragraphing is intact |

**Weighted score: 3.9 — band: Good with fixes.**

## Recommendation

**BLOCKED.** Confidence: **medium**. Correction scope: **substantial** for the structural work; **unknown** for provenance until someone who knows how this file was made answers.

**Exactly what is unresolved:**

1. **Who or what produced `original-en`, and when.** The registry gives no translator and no year; `books/raw/fear-and-trembling/SOURCE.md` documents only the Danish; no English source file exists in the repo. The internal evidence (independent renderings versus Lowrie, a clause present in the Danish that Lowrie omits, manufactured archaism, chapter titles mixing Hong and Hollander/Lowrie conventions) points strongly to an in-house translation from the PD Danish — which would be fine — but this must be **confirmed and written down**, not inferred by the next auditor as I have had to.

**Then, in order:**

2. **Relabel.** If it is an in-house translation, "Original (English)" is misleading and should say so plainly (e.g. "English translation from the 1843 Danish"), with `translator`/`year` populated in `bookRegistry.ts`. If it is *not* in-house, stop and get rights advice before anything else.
3. **Re-paragraph from the Danish.** Repair the ~37 OCR page-break splits at source in `original-da` and propagate to all four editions. This is the highest-value reader-facing fix in this book and it currently affects every edition, including the Danish one Danish readers will use. Until it is done, a reader's first substantive paragraph begins with the word "rarity" in lower case.
4. **Fix the ch7 one-sentence offset** so `modern-en` paragraph N corresponds to `original-en` paragraph N, and remove the two `\[ … \]` debris strings.
5. **Reconsider whether two English editions are warranted.** `original-en` and `modern-en` are two renderings of the same Danish at 0.76 similarity, differing mainly in manufactured archaism. One good English edition plus the Danish original may serve readers better than an artificial original/modern pair.

**If and only if step 1 confirms in-house provenance, the follow-on verdict on the text itself is KEEP CURRENT MODERN EDITION with the local fixes in steps 3–4.** The translation quality is genuinely good; it is the paperwork and the paragraphing that block it.

## Limitations of this review

- I read **7 of 232 paragraphs** closely (~3%), across all 8 chapters including both the opening and the Epilogue.
- Mechanical coverage is whole-book: the fragmentation counts (38/38), the offset detection, the shrinkage scan, the bracket scan and the per-chapter similarity all ran over all 232 paragraph pairs. Findings 2, 3 and 4 are computed facts, not extrapolations.
- **I did not read the Danish `original-da` systematically** — only the three Exordium paragraphs in sample 2. I therefore **cannot say how much of the ~37-paragraph OCR damage is repairable from the existing `raw.txt`** versus requiring a re-parse or a better scan. That scoping needs doing before step 3 is committed to.
- I did **not** assess `modern-da` at all.
- I could not access Payne (1939) to compare; it is recorded as **unverified**.
- My provenance conclusion is **inference from internal and external evidence, not documentary proof.** I could not find a record of how `original-en` was produced; the git history is squashed to a single merge commit (`bd87141d`) and carries no provenance. Someone with knowledge of the book's production should confirm or correct it.
