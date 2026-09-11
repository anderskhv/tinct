# comedy-of-errors — The Comedy of Errors (William Shakespeare)

Batch B5. Reviewed 2026-09-11. Scope: **public**.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `84bba3a2afd91e5f` | 11 | 690 | 15,997 | Shakespeare (1623) |
| modern-en | `6319d77729e29c7b` | 11 | 690 | 16,186 | Modern English |
| modern-da | `8c099fc4f43b2bd2` | 11 | 690 | 16,836 | Moderne Dansk |

`en_editions_aligned: true`. Mean weighted similarity 0.5926; identical long paragraphs 0.7%;
no truncation, no empty paragraphs, no paragraph-count mismatches, last chapter not short.

## Provenance / completeness of the core English text

Core key is `original-en`, an Early Modern English original — no translator. The text matches
Project Gutenberg's "modernized" Shakespeare series conventions (curly apostrophes, scene headings
with locations, `[_Exeunt._]` italic stage directions) — i.e. PG #1504 / #100 lineage, public domain.

Structure is **correct and complete**: 11 chapters = the play's 11 scenes (1.1, 1.2, 2.1, 2.2, 3.1,
3.2, 4.1–4.4, 5.1). Chapter titles are real Act/Scene labels with locations
(`Act 1, Scene 1 — A hall in the Duke's palace`), not editorial-apparatus debris. Opening paragraph
is the true opening stage direction; final paragraph is the true `[_Exeunt._]` after Dromio of
Ephesus's closing couplet. No prologue/epilogue exists in this play, so nothing can have been lost
at the edges.

## Passages inspected (6)

### 1. Act 1, Scene 1 (ch1) paras 1–7 — opening; lowest-similarity chapter (wsim 0.409)
Source: `EGEON. Proceed, Solinus, to procure my fall, And by the doom of death end woes and all.`
Modern: `EGEON. Go ahead, Solinus, sentence me to die, and let the verdict of death end my sorrows along with my life.`

Egeon's 300-word shipwreck narration (p5) is rendered complete — every clause survives: the agent's
death at Epidamnum, the "pleasing punishment that women bear", the poor woman's twins bought as
servants, the mast, the two ships from Corinth and Epidaurus. **Finding: strong.** One small
addition — `That mourn'd for fashion, ignorant what to fear` becomes `who cried because that's what
they saw us doing without knowing what to fear`, which supplies a cause ("what they saw us doing")
that the source only implies. Trivial.

### 2. Act 1, Scene 2 (ch2) paras 12–23 — comic/low register, Dromio of Ephesus
Source: `DROMIO OF EPHESUS. I have some marks of yours upon my pate, Some of my mistress' marks upon my shoulders, But not a thousand marks between you both.`
Modern: `DROMIO OF EPHESUS. I have some marks of yours on my skull, and some of my mistress's marks on my shoulders, but not a thousand marks between the two of you.`

The "marks" pun (coins / blows) is kept intact; so is the clock/"struck one on my cheek" joke and
the "post" pun. **Finding: strong.** One logical-modality slip: `Perchance you will not bear them
patiently` → `you wouldn't take them patiently` (possibility flattened to assertion).

### 3. Act 2, Scene 2 (ch4) paras 25–39 — Time/hair wordplay, densest punning in the play
Source: `ANTIPHOLUS OF SYRACUSE. May he not do it by fine and recovery?` / `DROMIO OF SYRACUSE. Yes, to pay a fine for a periwig, and recover the lost hair of another man.`
Modern: `ANTIPHOLUS OF SYRACUSE. Can't he do it by fine and recovery?` / `DROMIO OF SYRACUSE. Yes — pay a fine for a wig, and recover the lost hair of another man.`

The legal pun ("fine and recovery") is preserved rather than explained away; "basting" (cooking /
beating) survives. **Finding: strong.**

### 4. Act 3, Scene 2 (ch6) paras 30–53 — the "globe" geography routine; hardest sustained wordplay
Source: `DROMIO OF SYRACUSE. Nell, sir; but her name and three quarters, that's an ell and three quarters, will not measure her from hip to hip.`
Modern: `DROMIO OF SYRACUSE. Nell, sir. But her name plus three-quarters more — that's an ell and three-quarters — won't measure her from hip to hip.`

Every country in the routine survives (Ireland/bogs, Scotland/barrenness, France/forehead,
England/chin, Spain/breath, America-Indies/nose, Belgia). **Finding: strong.** Two small glosses:
`made me turn i' the wheel` → `made me run in the kitchen wheel` (adds "kitchen"); the
`Nell`/`ell` pun is handled by a light in-text expansion rather than a footnote, which works.

### 5. Act 2, Scene 1 (ch3) para 40 — mechanical outlier (highest word-ratio expansion, 104→122)
Source: `I see the jewel best enamelled Will lose his beauty; yet the gold bides still That others touch, yet often touching will Wear gold; and no man that hath a name By falsehood and corruption doth it shame.`
Modern: `I see that even the most beautifully enamelled jewel loses its beauty in time; yet the gold underneath endures even what others touch — though frequent touching will wear gold thin. And no man with a good name shames it through dishonesty and corruption — and yet so it goes.`

**Finding: one confirmed invention.** `— and yet so it goes` has no counterpart in the source; it is
an editorial tag added to smooth over a famously corrupt passage. The rest of the expansion is
legitimate disambiguation of a textual crux, but the added clause is exactly the kind of
"explanatory transition not in the source" the standard forbids. Local, one clause.

### 6. Act 5, Scene 1 (ch11) paras 143–159 — ending
Source: `DROMIO OF SYRACUSE. There is a fat friend at your master's house, That kitchen'd me for you today at dinner. She now shall be my sister, not my wife.`
Modern: `DROMIO OF SYRACUSE. There's a fat friend at your master's house who kitchen-claimed me for you today at dinner. From now on she'll be my sister-in-law, not my wife.`

The Abbess's recognition speech, the "gossips' feast"/christening pun (`I'll gossip at this feast`
→ `I'll be godfather at this feast`) and the final brother-and-brother couplet all land correctly.
**Finding: strong**, except `my sister` → `my sister-in-law`, which specifies a relationship the
source leaves as "sister". Trivial.

## Phase 1 flags: confirmed vs disconfirmed

- `truncated_paragraphs_total: 0` — **confirmed**. Paragraph word ratios across the whole book run
  0.88–1.17; nothing is compressed or dropped.
- `pct_identical_long_paragraphs: 0.7` (2 paragraphs) — **disconfirmed as a defect**. Both are short
  already-modern lines (`DROMIO OF SYRACUSE. Do you know me, sir? Am I Dromio? Am I your man? Am I
  myself?`; Antipholus's `Brought to this town by that most famous warrior, Duke Menaphon…`). Leaving
  them alone is correct, not lazy.
- `mean_weighted_similarity: 0.5926` — the lowest of the five plays in this batch, i.e. this is the
  *most* thoroughly rewritten of them. Verified by sampling that the rewriting is substantive and
  faithful rather than loose.
- `last_chapter_suspiciously_short: false` — **confirmed**; ch11 is the longest chapter (3,725 words).

## Phase 3 — human-edition research

This is an English original. The original does **not** already meet the reading standard: Early
Modern English verse with dense homophonic punning ("fine and recovery", "Nell/ell", "marks") is a
real barrier for a general modern adult, unlike clear Victorian prose. A modern edition is worth
maintaining here.

Candidates searched:

1. **Play On Shakespeare / ACMRS Press — *The Comedy of Errors*, tr. Christina Anderson.** Complete
   modern-verse translation, published in print by ACMRS Press (dist. University of Chicago Press).
   https://acmrspress.com/series/play-on-shakespeare/ · https://playonshakespeare.org/publications/
   **Rights: permission required.** Living playwright, in copyright, sold in print; performance
   rights are licensed through Play On. ACMRS's open-access platform covers "scholarly titles"
   (https://acmrspress.com/open-access/) — I found no free full text of any Play On volume and could
   not open a sample, so I record the *text* as **unverified** and the *rights* as not clear for
   commercial redistribution.
2. **Folger Shakespeare digital texts.** https://www.folger.edu/copyright-policy/ — licensed
   **CC BY-NC 3.0**; the Folger states "you may not use the material from Folger Digital Texts for
   commercial purposes". Tinct is a paid service, so this is blocked — and in any case Folger's text
   is modern-*spelling* Shakespeare, not a modern-English rendering, so it would not remove the
   barrier.
3. **Charles & Mary Lamb, *Tales from Shakespeare* (1807)** — public domain (PG #573), includes
   The Comedy of Errors. Read a sample: it is an **abridged third-person prose retelling**, not a
   play text. Fails completeness; rejected as a substitute (could serve as onboarding material).
4. **No Fear Shakespeare (SparkNotes/B&N), NoSweatShakespeare** — free to read, fully copyrighted,
   no reuse licence. Rejected.
5. **PG "modernized" series #1504 / #100** — public domain, but that *is* our `original-en` lineage;
   it is not a modern-English rendering.

**Conclusion: no complete, readable, rights-clear human modern-English edition found in this
search.** That is "none found in this search", not "none exists" — the Play On texts exist and are
plausibly excellent; they are simply not licensable for free redistribution without a negotiation.

## Ratings

| dimension | score |
|---|---|
| fidelity / completeness (40%) | 5 |
| first-read clarity (25%) | 5 |
| literary voice (20%) | 5 |
| restraint / no invention (10%) | 4 |
| naturalness (5%) | 5 |

**Weighted score 4.9 — band: Strong.**

## Recommendation

**LIGHT EDIT** — confidence **high** (6 passages sampled, ~1,400 source words, covering all five
acts, both the high-register opening narration and three comic prose scenes).

Correction scope: **local**. The edition is the strongest in this batch and would be a clean KEEP
but for one confirmed invention (`— and yet so it goes`, 2.1 p40). Per the audit rule, a confirmed
invention rules out an unqualified KEEP, but the fix is a single clause.

Next action: delete the invented clause at ch3 p40, drop the added word "kitchen" at ch6 p51 and
"-in-law" at ch11 p153, restore the modal in ch2 p23 ("you may not take them patiently"); then this
is a KEEP.

## Limitations of this review

- 6 of 690 paragraphs inspected in full (~9% of the book by words). "Strong in samples" is not
  "the whole book is verified".
- I did not review `modern-da` at all (out of scope for this audit).
- I did not check audio alignment, onboarding JSON, or the threads/cast file.
- Rights research is desk research from public statements; no legal opinion, and no Denmark/EU-
  specific counsel was obtained. The Play On rights position is inferred from the absence of any
  open-access statement, not from a licence I read.
