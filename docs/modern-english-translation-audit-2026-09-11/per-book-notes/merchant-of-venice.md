# merchant-of-venice — The Merchant of Venice (William Shakespeare)

Batch B5. Reviewed 2026-09-11. Scope: **public**.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `4897042eb4453562` | 20 | 779 | 21,975 | Shakespeare (1600) |
| modern-en | `a15d3a630dbfe538` | 20 | 779 | 21,608 | Modern English |
| modern-da | `17d56d29af1104af` | 20 | 779 | 22,714 | Moderne Dansk |

`en_editions_aligned: true`. Mean weighted similarity 0.6782; identical long paragraphs 1.3%;
no truncation, no empty paragraphs, no paragraph-count mismatches, last chapter not short.

## Provenance / completeness of the core English text

`original-en` is the Early Modern English original (no translator), same Project Gutenberg
"modernized" lineage as the other four plays in this batch (curly apostrophes, scene headings with
locations, `[_Exeunt._]` stage directions). Public domain.

Structure is **correct and complete**: 20 chapters = the play's 20 scenes (1.1–1.3, 2.1–2.9,
3.1–3.5, 4.1–4.2, 5.1). Chapter titles are real Act/Scene labels with locations
(`Act 4, Scene 1 — Venice. A court of justice`). Opens with `Enter Antonio, Salarino and Solanio.`
and Antonio's `In sooth I know not why I am so sad`; ends with Gratiano's ring couplet and the exit
direction. Nothing lost at the edges; no prologue/epilogue in this play.

## Passages inspected (6)

The batch brief flagged a specific risk for this play: that an AI modernization would sanitize
Shylock, or editorialize around the antisemitic content. **I checked this directly in four of the
six samples and found no sanitizing and no added commentary.** Details below.

### 1. Act 1, Scene 1 (ch1) paras 3–12 — opening; lowest-similarity chapter (wsim 0.456)
Source: `SALARINO. My wind cooling my broth Would blow me to an ague when I thought What harm a wind too great might do at sea.`
Modern: `SALARINO. Just the breath of my own breath cooling my soup would chill me into a fever when I thought what damage a real wind might do at sea.`

**Findings, all minor:**
- `the breath of my own breath` is a redundancy the source does not have; it reads as a slip.
- `by two-headed Janus` → `by two-faced Janus`. The image is altered: Janus's *two heads facing
  opposite ways* is the point (Salarino is describing two opposite temperaments); "two-faced" in
  modern English means duplicitous, which is not what Salarino says.
- `your most noble kinsman` → `your noble kinsman` (superlative dropped).
Otherwise faithful and fluent; Salarino's whole argosy/church/rocks conceit survives clause by clause.

### 2. Act 1, Scene 3 (ch3) paras 28–47 — Shylock, Jacob and Laban, the bond
Source: `SHYLOCK. …You call me misbeliever, cut-throat dog, And spet upon my Jewish gaberdine, And all for use of that which is mine own.`
Modern: `SHYLOCK. …You call me misbeliever, cut-throat dog, and spit on my Jewish gabardine—all for using what is my own.`

Antonio's `The devil can cite Scripture for his purpose`, `Hie thee, gentle Jew`, and Shylock's
whole "bondman's key" speech are rendered in full, with the slurs intact and no softening, no
bracketed disclaimer, no added context. **Finding: strong; risk area clear.** One small
over-specification in the Jacob narrative: `Who then conceiving did in eaning time Fall
parti-colour'd lambs` → `who then, conceiving while looking at them, gave birth… to multicolored
lambs` — the modern supplies the folk-mechanism ("while looking at them") that the source leaves
implicit.

### 3. Act 2, Scene 1 (ch4) + Act 2, Scene 7 (ch10) — the Prince of Morocco; race content
Source: `PORTIA. A gentle riddance. Draw the curtains, go. Let all of his complexion choose me so.`
Modern: `PORTIA. A gentle riddance. Draw the curtains, go. Let all of his complexion choose me so.` (identical)

Morocco's `Mislike me not for my complexion, The shadowed livery of the burnish'd sun` is fully
present; Portia's closing line is left verbatim. **Finding: strong; no sanitizing.** One craft
lapse in the scroll verse: the source's nine-fold `gold / told / sold / behold / infold / bold /
old / inscroll'd / cold` rhyme chain is broken because `Your answer had not been inscroll'd` becomes
`Your answer had not been on this scroll`.

### 4. Act 3, Scene 1 (ch13) paras 14–33 — "Hath not a Jew eyes"
Source: `SHYLOCK. …I am a Jew. Hath not a Jew eyes? … If you prick us, do we not bleed? … The villainy you teach me I will execute, and it shall go hard but I will better the instruction.`
Modern: `SHYLOCK. …I am a Jew. Has not a Jew eyes? … If you prick us, do we not bleed? … The villainy you teach me I will execute—and it shall go hard but I will improve on the instruction.`

The speech is complete and the moral ambiguity is left exactly where Shakespeare leaves it — the
plea for common humanity and the vow of revenge are both there, in that order, with no connective
gloss between them. Shylock's `I would my daughter were dead at my foot, and the jewels in her ear`
is kept. Solanio's `Here comes another of the tribe` is kept. **Finding: strong; risk area clear.**

One interpretive sharpening: `SOLANIO. Out upon it, old carrion! Rebels it at these years?` →
`Are you still in heat at your age?`. The source's bawdy jab is oblique; the modern makes it
explicit and picks one reading of an ambiguous line.

### 5. Act 4, Scene 1 (ch18) paras 55–69 and 118–135 — the trial; the forced conversion
Source: `ANTONIO. …Two things provided more, that for this favour, He presently become a Christian;`
Modern: `ANTONIO. …Two more conditions: that, for this favor, he immediately become a Christian;`

`The quality of mercy is not strain'd` survives essentially intact. The forced conversion, Gratiano's
`to bring thee to the gallows, not to the font`, and Shylock's four-word exit (`I am content`) are
all present and unsoftened. **Finding: strong; risk area clear.**

### 6. Act 5, Scene 1 (ch20) paras 1–11 and 98–107 — ending
Source: `LORENZO. …In such a night as this, When the sweet wind did gently kiss the trees…`
Modern: `LORENZO. …On a night like this, when the sweet wind gently kissed the trees…`

The Troilus/Thisbe/Dido/Medea/Jessica anaphora is preserved as anaphora (`On such a night`), and
Jessica's sting (`and ne'er a true one`) is kept. **Finding: strong.**

## Confirmed recurring mechanical defect (unique to this book in the batch)

**All 26 occurrences of `Exeunt` in the source are rendered `Exit` in modern-en** — 26/26, including
the play's final direction, where the whole cast leaves:

Source: `[_Exeunt._]` (ch20 p107) → Modern: `[Exit.]`

Also `[_Exeunt Solanio, Salarino and the Servant._]` → `[Exit Solanio, Salarino and the Servant.]`
and `[_Exeunt Duke and his train._]` → `[Exit Duke and his train.]`. This is grammatically wrong and
is a stage-direction convention the other four plays in this batch preserve correctly
(comedy-of-errors 14/14 kept, henry-v 32/32, as-you-like-it 26/26, winters-tale 21/21). It is a
mechanical find-and-replace fix.

The modern edition also **adds** seven conventional editorial directions the source lacks
(`[To Antonio.]`, `[Aside.]`, `[Opening the leaden casket.]`, `[Kissing her,]` …). These are
standard modern-edition practice and genuinely help; I do not count them as inventions, but they
should be a conscious editorial policy rather than an accident.

## Phase 1 flags: confirmed vs disconfirmed

- `truncated_paragraphs_total: 0` — **confirmed**; paragraph word ratios run 0.88–1.16 book-wide.
- `pct_identical_long_paragraphs: 1.3` (5 paragraphs) — **disconfirmed as a defect**. All five are
  lines that are already plain modern English (`An oath, an oath! I have an oath in heaven…`;
  `Sweet doctor, you shall be my bedfellow…`; Launcelet's Moor/more quibble). Leaving them is right.
- `mean_weighted_similarity: 0.6782` — checked: the high-similarity zones are Acts 4–5, where much
  of the verse is already transparent, not evidence of a light/mechanical edition.
- `last_chapter_suspiciously_short: false` — **confirmed** (5.1 is 2,584 words).

## Phase 3 — human-edition research

English original; the original does **not** already meet the reading standard (the legal/financial
vocabulary, the "breed for barren metal" argument and the casket verse are genuine barriers).

1. **Play On Shakespeare / ACMRS Press — *The Merchant of Venice*, tr. Elise Thoron.** Complete
   modern-verse translation; a Folger interview with Thoron and Julie Felise Dubiner describes it as
   a full translation that deliberately keeps the play's antisemitism in view
   (https://www.folger.edu/blogs/shakespeare-and-beyond/play-on-elise-thoron-julie-felise-dubiner-translating-the-merchant-of-venice/).
   Sold in print by ACMRS Press / University of Chicago Press
   (https://press.uchicago.edu/ucp/books/book/distributed/M/bo122973416.html).
   **Rights: permission required.** In copyright, living translator. I searched for a free sample or
   open-access edition and found none, so the text itself is **unverified** — I have not read it.
2. **Folger Shakespeare digital texts** — **CC BY-NC 3.0**, commercial use expressly excluded
   (https://www.folger.edu/copyright-policy/). Blocked for Tinct, and it is a modern-spelling
   edition of the original rather than a modern-English rendering.
3. **Lamb, *Tales from Shakespeare* (1807)** — public domain, includes The Merchant of Venice, but
   is an abridged prose retelling (verified by reading a sample at PG #573). Fails completeness.
4. **No Fear Shakespeare / NoSweatShakespeare** — free to read, fully copyrighted. Rejected.

**Conclusion: no complete, readable, rights-clear human modern-English edition found in this
search** (not: none exists).

## Ratings

| dimension | score |
|---|---|
| fidelity / completeness (40%) | 5 |
| first-read clarity (25%) | 5 |
| literary voice (20%) | 4 |
| restraint / no invention (10%) | 4 |
| naturalness (5%) | 4 |

**Weighted score 4.7 — band: Strong.**

## Recommendation

**LIGHT EDIT** — confidence **high** (6 passages, ~1,900 source words, all five acts; three of the
six chosen specifically to test the Shylock/antisemitism risk the brief raised).

Correction scope: **local**. No omission, no sanitizing, no added commentary. The defects are a
mechanical stage-direction error (26 instances, one find-and-replace), two altered images, one
broken rhyme chain and two interpretive sharpenings.

Next action: restore `Exeunt` in all 26 stage directions; fix `two-faced Janus` → `two-headed
Janus`, the `breath of my own breath` redundancy, the Morocco scroll rhyme, and the "in heat"
sharpening at 3.1 p16.

## Limitations of this review

- 6 of 779 paragraphs inspected closely (~9% of the book by words). Acts 2.2–2.6 (Launcelet
  Gobbo's prose comedy), 3.2 (the casket choice and Portia's surrender speech) and 3.4–3.5 were
  scanned mechanically but not read against the source line by line.
- `modern-da` not reviewed.
- The antisemitism check covers the four passages where the risk concentrates (1.3, 2.7, 3.1, 4.1);
  I did not read every Shylock line in the play.
- Rights research is desk research; no legal opinion, no EU/Denmark-specific counsel. The Play On
  candidate is unverified as text and inferred as unlicensed.
