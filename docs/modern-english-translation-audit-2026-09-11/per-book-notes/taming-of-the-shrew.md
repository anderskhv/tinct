# The Taming of the Shrew — modern-en audit (batch B5)

- **Book ID:** `taming-of-the-shrew`
- **Title / author:** The Taming of the Shrew / William Shakespeare
- **Scope:** public (in `BOOKS`)
- **Reviewer:** batch agent B5, 2026-09-11

> **Headline finding: the entire Induction is missing from all three editions.** This is
> a confirmed substantive omission of ~2,400 words (≈11% of the play), including the
> Christopher Sly frame that makes the taming plot a play-within-a-play. It is present in
> the public-domain source and was lost in ingestion. Details below.

## Edition snapshot (Phase 1 data)

| Edition | sha256_16 | Chapters | Paragraphs | Words | Label |
|---|---|---|---|---|---|
| original-en | `2fa6c01140bd2544` | 12 | 1021 | 19,554 | Shakespeare (1623) |
| modern-en | `65f0c9c6d2da2732` | 12 | 1021 | 20,283 | Modern English |
| modern-da | `9764e1bffb4062b3` | 12 | 1021 | 21,070 | Moderne Dansk |

Mechanical comparison: mean weighted similarity **0.6036** (**lowest in this batch — the
most thoroughly rewritten**); identical long paragraphs **0.0%**; truncation flags **0**;
empty paragraphs **0**; no chapter or paragraph mismatches; `en_editions_aligned: true`.

**Why Phase 1 could not see the omission:** every mechanical check compares `original-en`
against `modern-en`. The Induction is missing from *both*, so chapter counts, paragraph
counts and similarity all agree perfectly. This is a blind spot of the screening
instrument, not a failure of it — it is exactly what Phase 2 is for.

## The missing Induction — evidence

`original-en` chapter 0 is titled `Act 1, Scene 1 — Padua. A public place`. The 12
chapters are Act 1 (2 scenes), Act 2 (1), Act 3 (2), Act 4 (5), Act 5 (2) = 12. The
canonical play has **Induction Scene 1 + Induction Scene 2 before Act 1**.

Searched all three editions for the frame characters:

```
original-en   Sly: 0   Induction: 0   Christopher: 0
modern-en     Sly: 0   Induction: 0   Christopher: 0
modern-da     Sly: 0   Induction: 0   Christopher: 0
```

The Induction **is** in the public-domain source. Project Gutenberg #1508 (*The Taming of
the Shrew*, modernised spelling) opens:

```
INDUCTION

SCENE I. Before an alehouse on a heath.

Enter Hostess and Sly

SLY.
I'll pheeze you, in faith.

HOSTESS.
A pair of stocks, you rogue!
```

I fetched and measured it: the Induction body runs **2,416 words** to the `ACT I` heading
([gutenberg.org/cache/epub/1508/pg1508.txt](https://www.gutenberg.org/cache/epub/1508/pg1508.txt);
also present in the Folio-spelling [PG #1107](https://www.gutenberg.org/cache/epub/1107/pg1107.txt),
which opens `Enter Begger and Hostes, Christophero Sly`).

**Corroborating arithmetic:** `bookRegistry.ts` declares `wordCount: 22000` for this
book. 19,554 (shipped) + 2,416 (Induction) = **21,970**. The registry's word count was
evidently taken from the complete play; the shipped text silently dropped the Induction
after that number was recorded.

**Why it matters editorially, not just numerically.** The brief flags this play's
contested gender politics. The Induction is the single largest piece of context a reader
needs to hold Katherina's final speech at the right distance: without it, the taming plot
is presented as the play, rather than as an entertainment staged for a drunk tinker who
has been told he is a lord. Readers arriving at Act 5 Scene 2 in Tinct's edition have
been given no frame at all. (Note the Folio, like our text, has no closing Sly frame —
the *opening* frame is what is missing.)

**Also inaccurate:** the edition label `Shakespeare (1623)` / `year: 1623` points at the
First Folio, which contains the Induction. The label promises a text we are not serving.

## Samples inspected (5)

Ratings below assess the modern-en rendering **of the text it was given**; the omission
is scored separately under fidelity.

### 1. Act 2, Scene 1, paras 100–121 (Petruchio and Katherina's first meeting) — strong
Source (paras 102–104): *"KATHERINA. What is your crest? a coxcomb?" / "PETRUCHIO. A
combless cock, so Kate will be my hen." / "KATHERINA. No cock of mine; you crow too like
a craven."*
Modern: *"KATHERINA. What's your crest — a coxcomb?" / "PETRUCHIO. A combless cock, so
long as Kate will be my hen." / "KATHERINA. No cock of mine — you crow too like a
coward."*

**Finding:** The batch's best wordplay handling. The heraldry volley (arms / crest /
coxcomb) and the cock-fighting volley (combless cock / hen / craven) both survive as
wordplay. `"Had I a glass I would"` → `"If I had a mirror, I would"` is exactly the right
kind of substitution. `"passing gentle"` → `"exceedingly gentle"`, `"Dian"` → `"Diana"`.

One small over-explanation: para 100 *"So may you lose your arms"* → *"So you may lose
your arms — **your coat of arms**"*. That is an added gloss not in the source, and it
pre-empts the pun the next two lines are built on. Single instance; the only added
explanation I found in this book.

### 2. Act 4, Scene 1, paras 54–70 (Petruchio's taming-house bluster) — strong
`"Where are my slippers? Shall I have some water?"` retained verbatim where it should be;
`"welcome heartily"` → `"welcome with all my heart"`. No softening of the domestic
violence of the scene, no editorial commentary attached.

### 3. Act 4, Scene 3, paras 30–51 (the haberdasher and the tailor) — comic/low register, strong
Source (para 45): *"O mercy, God! what masquing stuff is here? What's this? A sleeve?
'Tis like a demi-cannon. What, up and down, carv'd like an apple tart? Here's snip and
nip and cut and slish and slash, Like to a censer in a barber's shop."*
Modern: *"Oh mercy, God! What masquerade stuff is here? What's this? A sleeve? It's like
a demi-cannon. What — carved up and down like an apple tart? Here's snip and nip and cut
and slish and slash, like a censer in a barber's shop."*

**Finding:** Good. The sound-play ("snip and nip and cut and slish and slash") is kept
intact rather than paraphrased into sense; `"custard-coffin"` preserved; the catalogue
at para 30 (ruffs, cuffs, farthingales, amber bracelets) keeps every item. Katherina's
protest at para 41 (*"I am no child, no babe… My tongue will tell the anger of my
heart"*) is rendered with its full force.

### 4. Act 5, Scene 2, paras 95–112 (Katherina's final speech and the ending) — **strong on restraint**
Source (para 101, extract): *"Thy husband is thy lord, thy life, thy keeper, Thy head,
thy sovereign… Such duty as the subject owes the prince, Even such a woman oweth to her
husband… Then vail your stomachs, for it is no boot, And place your hands below your
husband's foot."*
Modern: *"Your husband is your lord, your life, your keeper, your head, your sovereign…
The same duty a subject owes the prince, a woman owes her husband… Then lower your
prides, for it's no use, and place your hands beneath your husband's foot."*

**Finding:** Exactly right. The speech is delivered whole, in its own terms, with no
softening, no hedging, no added framing and no interpretive commentary — the reader is
left to make of it what they will, which is the correct editorial posture for this text.
`"foul contending rebel"` → `"foul, contentious rebel"` and `"graceless traitor"` →
`"ungrateful traitor"` both keep their sting. `"vail your stomachs"` → `"lower your
prides"` is a good equivalent.

One register loss two lines later: *"PETRUCHIO. Why, there's a wench!"* → *"Why, there's
a woman!"*. "Wench" here is coarse-affectionate and characterising; "woman" is neutral
and drops the colour. Minor but on a charged line.

### 5. Act 5, Scene 1, paras 17 & 50 + Act 5 Scene 2 paras 106–109 (mechanical-outlier pick) — formatting defect
Source (5.2 para 107): `[_To Lucentio._] though you hit the white;`
Modern (5.2 para 107): `[_To Lucentio._] though you hit the bullseye —`
Source (5.2 para 109): `[_Exeunt Petruchio and Katherina._]`
Modern (5.2 para 109): `[_Exeunt Petruchio and Katherina._]`

**Finding:** The gloss is good — `"hit the white"` is an archery term and `"bullseye"` is
the right equivalent. But the **raw Project Gutenberg italic markup `[_…_]` survives into
the reader-facing modern edition.** I counted paragraphs containing an underscore:

| Book | original-en | modern-en |
|---|---|---|
| othello | 7 | **0** |
| king-lear | 188 | **0** |
| much-ado-about-nothing | 0 | **0** |
| **taming-of-the-shrew** | 123 | **125** |
| antony-and-cleopatra | 157 | **0** |

Shrew is the only book in the batch where the markup was not stripped — and it has
*more* underscore paragraphs in modern-en than in the source. Readers see literal
`[_Exit._]` and `[_Aside._]` throughout. This is a visible rendering bug, not an
editorial one, and it is trivially fixable.

## Phase 1 flags: confirmed vs. disconfirmed

- **0 truncation / 0 empty / 0 mismatches / 0.0% identical long paragraphs** — all
  confirmed *for the text as shipped*. They tell us nothing about the missing Induction
  because it is absent from both sides of the comparison (see above).
- **Mean similarity 0.604, 0% of long paragraphs ≥0.90** — confirmed, and it is a real
  quality signal. Ranking all 222 source paragraphs ≥25 words: the *highest* similarity
  in the whole book is 0.88, and 55% fall below 0.60. This is the most genuinely
  rewritten modern edition in the batch; there are no unmodernized pockets of the kind
  that spoil Much Ado's Act 5.
- **Archaic-token sweep:** 476 source instances → 4 in modern-en (**1% retained**).
- **`marry` handling:** 18 in source, **16 left verbatim** in modern-en. Inconsistent
  with Othello (modernized) and Much Ado (wrongly glossed "By the Mass"); a batch-wide
  policy is needed. Low severity here since "marry" reads as period colour.
- **Spelling house style:** `honor` 1 / `honour` 1; `favor` 1 / `favour` 4; and `colour`
  in Act 2 Scene 1. Mixed, but only a handful of instances.

## Phase 3 — human-edition research

Two separate questions for this book.

**(a) Can the missing Induction be restored from a rights-clear source? Yes, easily.**
Project Gutenberg #1508 and #1107 both carry it; PG texts of Shakespeare are **public
domain** with "almost no restrictions whatsoever", and Wikisource permits commercial
reuse of public-domain transcriptions
([Wikisource: Reusing content](https://en.wikisource.org/wiki/Wikisource:Reusing_Wikisource_content)).
This part of the fix has **no rights obstacle**.

**(b) Is there a complete human modern-English edition better than our modern-en?**
Same answer as the rest of the batch (full table in `othello.md`):

- **Standard Ebooks** — Shrew **not published** (histories + *The Winter's Tale* only);
  original-language anyway. CC0. [standardebooks.org/ebooks/william-shakespeare](https://standardebooks.org/ebooks/william-shakespeare)
- **Wikisource / PG / Globe-Moby** — complete, **public domain**, commercial reuse OK —
  but original language.
- **Folger digital texts** — **CC BY-NC**, noncommercial only. Rights-blocked.
- **Internet Shakespeare Editions** — educational/non-profit only; editor holds
  copyright. [ISE copyright](https://internetshakespeare.uvic.ca/Foyer/copyright.html). Rights-blocked.
- **Open Source Shakespeare** — CC BY-NC 4.0. Rights-blocked.
- **No Fear Shakespeare / Shakescleare / NoSweatShakespeare / Durband *Shakespeare Made
  Easy* / OSF *Play On!*** — complete modern-English translations, all copyrighted;
  permission required.
- **Lamb, *Tales from Shakespeare*** — Shrew *is* one of the 20 tales, public domain, but
  an abridged children's prose retelling. Also note Lamb's version omits the Induction
  too. [PG #573](https://www.gutenberg.org/cache/epub/573/pg573.txt)

**No complete, human-authored, rights-clear modern-English Shrew found in this search.**

## Phase 4 — rating

| Dimension | Weight | Score |
|---|---|---|
| Fidelity / completeness | 40% | 3 |
| First-read clarity | 25% | 5 |
| Literary voice | 20% | 4 |
| Restraint / no invention | 10% | 4 |
| Naturalness | 5% | 2 |

**Weighted score: 3.8 — band: Good with fixes.**

The rendering quality is the best in the batch (clarity 5). Fidelity is pulled to 3 by
the missing Induction: judged as a *modernization of the text it was given* this would be
a 5, but the edition as it reaches a reader is missing 11% of the play and its framing
device, and the audit rates the shipped edition. Naturalness is a 2 solely because 125
paragraphs leak raw markup at the reader.

**Recommendation: LIGHT EDIT.**
Not BLOCKED — nothing is unresolved. I know exactly what is missing, exactly where to get
it, and that it is public domain. Not RETRANSLATE — the existing modernization is the
strongest in the batch and should be kept as-is.

The work is:
1. **Re-ingest Induction Scenes 1 and 2** into `original-en` from the public-domain source
   (~2,400 words, 2 new chapters at the head, renumbering 12 → 14 chapters).
2. **Generate `modern-en` and `modern-da` for those two scenes only**, matching the
   existing quality bar (this is the one piece of new content generation required).
3. **Strip the `[_…_]` markup** from all 125 modern-en paragraphs (and from original-en,
   which readers also see).
4. Correct the edition label, and update `wordCount` once the Induction is back.
5. Decide a batch-wide policy for `marry` and normalize `honour`/`favour`/`colour`.

- **Confidence: high** on the omission (verified in all three edition files, verified
  present in two independent public-domain sources, and corroborated by the registry's
  own word count). Medium-high on the quality rating — 5 passages / roughly 1,600 source
  words read closely, plus a full-text similarity ranking over all 1,021 paragraphs.
- **Correction scope:** local (well-bounded, but includes generating two new scenes).

## Limitations of this review

- Acts 1 and 3 were sampled only through the similarity ranking, not read closely;
  the Bianca subplot and the disguise machinery are unexamined beyond that.
- I did not verify whether any *other* play in the Tinct library has a comparable
  head-of-text omission — the four other Shakespeare plays in this batch were checked
  and are structurally complete, but that leaves the rest of the library unchecked. This
  is worth a library-wide sweep.
- `modern-da` not evaluated beyond confirming the Induction is absent there too.
- Threads/onboarding/audio JSON not checked; note that restoring two chapters will shift
  chapter numbering and may invalidate saved reading positions and audio manifests for
  this book.
- Rights conclusions are research summaries, not legal advice.
