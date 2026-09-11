# romeo-and-juliet — Romeo and Juliet (William Shakespeare, 1597)

**Audit date:** 2026-09-11 · **Scope:** public · **Reviewer:** batch agent (Shakespeare batch)

## Edition snapshot (from Phase 1 `mechanical/romeo-and-juliet.json`)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en (Original Text) | `d7be46edc32ddbb1` | 25 | 1062 | 25,515 |
| modern-en (Modern English) | `47fdf4f9a1b309f6` | 25 | 1062 | 25,597 |
| modern-da (Moderne Dansk) | `bed47cb3281aa1e9` | 25 | 1062 | 26,036 |

`en_editions_aligned: true`, no paragraph-count mismatches, mean weighted similarity 0.4173
(real-rewrite range), 0.2 % identical long paragraphs, 0 truncations, 0 empty paragraphs, last
chapter not flagged. modern-en runs **+82 words (+0.3 %)** — essentially level with the source.

## Provenance / completeness of the core English text

- Core key `original-en`; English original, no translator. Registry
  (`app/src/data/bookRegistry.ts` L313-346) records no source attribution — **provenance
  undocumented**.
- Same source family as hamlet / macbeth / midsummer: curly apostrophes (704), em dashes (65).
- Complete: Prologue plus all 24 scenes, Act 1 Scene 1 through Act 5 Scene 3. Sections are
  `Prologue`, `Act 1`…`Act 5`, so the Prologue is correctly its own reading unit.
- Verse is **not lineated** (batch-wide edition format).

## Structure check — **three confirmed defects, present in BOTH English editions**

The apparatus scan from `books/AGENTS.md` returns **0 apparatus/stub suspects**, and all 25 titles
are clean reader-facing labels (`Act 3, Scene 5 — Juliet's Chamber`,
`Act 5, Scene 3 — A Churchyard; the Capulets' Monument`). The editorial-collation failure mode is
**disconfirmed**.

But a separate scan for mis-parsed stage directions found three real problems. All are inherited
from the `original-en` source parse and are byte-identical in `modern-en`, so **both editions
show them to readers**:

**(a) A stage direction rendered as a speech by a character who died four paragraphs earlier.**
`ch25 (Act 5 Scene 3) p33`, identical in original-en and modern-en:

```
ROMEO. Enter, at the other end of the Churchyard, Friar Lawrence, with a lantern, crow, and spade.
```

Romeo's `[Dies.]` is at p32. The reader sees a dead Romeo announce Friar Lawrence's entrance.
Should be `[Enter, at the other end of the Churchyard, Friar Lawrence, with a lantern, crow, and
spade.]`. This is also the source of the book's 0.2 % identical-long-paragraph flag — it is the
only ≥15-word paragraph identical between the two editions, which makes sense, because it is not
dialogue at all.

**(b) A speech swallowed into a stage direction, with a stray bracket and no speaker tag.**
`ch13 (Act 3 Scene 1) p32`, identical in both editions:

```
[Drawing.] I am for you.]
```

`I am for you` is Mercutio's line. Correct form is `MERCUTIO. [Drawing.] I am for you.`

**(c) Two unbracketed stage-direction fragments rendered as body text.** Identical in both
editions:
- `ch5 (Act 1 Scene 4) p1`: `Torch-bearers and others.` — a continuation of the bracketed entrance
  at p0 that got split off and lost its brackets.
- `ch6 (Act 1 Scene 5) p0`: `Musicians waiting. Enter Servants.` — a whole stage direction with no
  brackets and no speaker tag.

These are the only four paragraphs across all five plays in this batch that are neither bracketed
directions nor speaker-tagged speech. They are cheap to fix and they are the most visible defects
in the book.

Otherwise the speaker-tag / stage-direction convention (`books/AGENTS.md` L152) is **followed**:
`JULIET.`, `[Enter Chorus.]`, `[Exeunt.]`, `[Drinks.]`, `[Dies.]`, `[Laying Paris in the
monument.]`, `[Sings.]` all preserved verbatim in modern-en.

## Samples inspected (6)

### 1. The Prologue (ch1, complete unit, 110 source words)

**Finding (a sonnet turned into reordered prose, and a key pun resolved away).**

- SRC p1: `Two households, both alike in dignity, In fair Verona, where we lay our scene, From ancient grudge break to new mutiny, Where civil blood makes civil hands unclean. From forth the fatal loins of these two foes A pair of star-cross’d lovers **take their life**…`
- MOD p1: `In beautiful Verona, where our story takes place, two families of equal standing have reignited an ancient feud, and the violence between them stains the hands of ordinary citizens. From these two enemy households, a pair of star-crossed lovers **are born**…`

Three things happen here:
1. The sonnet's rhyme and its 14-line shape are gone (this play's Prologue *is* a formal sonnet,
   and so is the Act 2 Prologue; the form is a signal, not decoration).
2. The clauses are reordered — Verona is moved to the front — so the opening no longer lands on
   "Two households".
3. `take their life` is a deliberate double meaning: the lovers *are born from*, and later *take*,
   their lives. modern-en keeps only "are born", so the play's opening act of foreshadowing
   disappears.

Also `From forth the fatal loins of these two foes` → `From these two enemy households` replaces a
body image with an abstraction, and `civil blood makes civil hands unclean` loses the
*civil*/*civil* repetition that is the line's whole rhetorical move.

### 2. Act 1 Scene 3, paras 10–21 — the Nurse's monologue (comic prose-in-verse, low register)

Broadly good: the weaning story, the earthquake, the husband's joke and its repetition all
survive, and the compression is honest.

**Finding (character-marking oaths stripped):** the Nurse's speech is thick with oaths, and
modern-en removes most of them:
- `’Tis since the earthquake now eleven years; And she was wean’d,—I never shall forget it—` → kept
- `nay, **by th’rood** She could have run and waddled all about` → `In fact, she could have run and toddled all over the place` — oath gone
- `and, **by my holidame**, The pretty wretch left crying` → `And the sweet little thing stopped crying` — oath gone
- `That shall she, **marry**; I remember it well` → `That she will, indeed. I remember it well` — oath softened

Individually trivial; collectively they are a large part of what makes the Nurse sound like the
Nurse rather than like Lady Capulet.

**Finding (added explanation), p12:**
- SRC: `**Shake, quoth the dovehouse**: ’twas no need, I trow, To bid me trudge.`
- MOD: `**The dovecote shook from the earthquake**; there was no need to tell me to get moving.`
  → `from the earthquake` is supplied. Defensible as a gloss, but it converts a vivid clipped
  image into a report.

**Finding (repetition flattened), p12:** the source varies the refrain —
`The pretty wretch left crying, and said ‘Ay’` then `it stinted, and said ‘Ay.’` — where modern-en
uses `the sweet little thing stopped crying and said, "Yes."` both times.

### 3. Act 1 Scene 4, paras 12–17 — Mercutio (dense wordplay; the hardest passage in the play)

**This is the weakest passage found in the book.**

**Finding (pun destroyed and a clause dropped), p14:**
- SRC: `MERCUTIO. Tut, **dun’s the mouse, the constable’s own word**: If thou art dun, we’ll draw thee from the mire Or **save your reverence** love, wherein thou stickest Up to the ears.`
- MOD: `MERCUTIO. Oh, come on, don't be such a mouse. If you're stuck in the mud, we'll pull you out. Or from that swamp of love where you're stuck up to your ears.`

Mercutio is punning on Romeo's `I am done` in the previous line — *dun* / *done* — and
`the constable's own word` is the tag that flags it as a catchphrase. Both are gone. `save your
reverence` (an apology-before-obscenity formula, gesturing at *sir-reverence* = dung) is replaced
by a neutral "swamp". The result is a Mercutio who is merely impatient rather than verbally
relentless.

**Finding (content added that is not in the source), p15:**
- SRC: `ROMEO. Nay, that’s not so.`
- MOD: `ROMEO. No, we're not. It's nighttime.`

`It's nighttime` is an inference supplied by the translator. It is a *correct* inference and it
makes the next line easier, but the standard is explicit: "Do NOT add interpretations… or
explanatory transitions not in the source."

**Finding (muddled rendering), p16:**
- SRC: `Take our good meaning, for our judgment sits Five times in that ere once in our five wits.`
- MOD: `Take my meaning in the right spirit. Our good judgment is five times better than any of us can express.`
  → The source says our judgment lies in taking good meaning five times more often than in our
  five wits. The modern sentence is not a paraphrase of that; it is a different, vaguer claim.

### 4. Act 2 Scene 2, paras 4–15 — the balcony scene (high-register verse)

**Strong — the best sustained passage in the book.** Nothing omitted.

- SRC p6: `O Romeo, Romeo, **wherefore** art thou Romeo?`
- MOD p6: `Oh Romeo, Romeo! **Why do you have to be** Romeo?`
  → correctly avoids the near-universal misreading of *wherefore* as *where*.

- SRC p9: `What’s in a name? That which we call a rose By any other name would smell as sweet`
- MOD p9: `What's in a name? The thing we call a rose would smell just as sweet by any other name.`
  → preserved rather than explained.

Minor: `Retain that dear perfection which he owes Without that title` → `would still be perfect
even if he weren't called Romeo` compresses, but nothing of substance is lost.

### 5. Act 3 Scene 1, paras 30–47 — Mercutio's death (mixed register)

Good, and notably better than his Act 1 wordplay.

- SRC p43: `Ask for me tomorrow, and you shall find me a **grave** man.`
- MOD p43: `Ask for me tomorrow and you'll find me a **grave** man.`
  → the dying pun is preserved verbatim, which is exactly right.
- `A plague o’ both your houses` kept in all three occurrences.
- `Good King of Cats`, `nine lives`, `pilcher` → `scabbard`, `worms' meat` → `worm food` all sound.

Note the mis-parsed `[Drawing.] I am for you.]` at p32 sits in the middle of this scene — see
Structure check (b).

### 6. Act 5 Scene 3, paras 28–39 — the tomb / ending

Romeo's final speech is complete and well handled; `a feasting presence full of light`,
`worms that are thy chambermaids`, `shake the yoke of inauspicious stars`, `A dateless bargain to
engrossing death` and `Thus with a kiss I die` all survive as images rather than explanations.

- SRC p31: `O true apothecary! Thy drugs are quick.`
- MOD p31: `Oh, the apothecary was honest! His drugs work fast.`
  → `true` as *honest* rather than *real* is the right reading; fine.

The mis-tagged `ROMEO.` stage direction at p33 immediately follows — see Structure check (a).

### Extra spot-check — Act 1 Scene 5, para 1 (the servants, comic prose)

**Finding (meaning inverted):**
- SRC: `FIRST SERVANT. Where’s Potpan, that he helps not to take away? **He shift a trencher! He scrape a trencher!**`
- MOD: `FIRST SERVANT. Where's Potpan? He's supposed to help clear the dishes. **He can barely handle a single plate!**`

The source lines are sarcastic indignation — *him, move a plate? him, scrape a plate?* — at the
idea that Potpan would stoop to the work. modern-en turns them into a claim that Potpan is
incompetent. That is a different accusation.

## Phase 1 flags: confirmed vs disconfirmed

| flag | verdict |
|---|---|
| `pct_identical_long_paragraphs: 0.2` | **Confirmed, and it is a real bug.** The single identical long paragraph is ch25 p33 — the mis-tagged stage direction. It is identical precisely because it is not dialogue. |
| `truncated_paragraphs_total: 0` | Confirmed. |
| `empty_paragraphs_total: 0` | Confirmed. |
| `last_chapter_suspiciously_short: false` | Confirmed — Act 5 Scene 3 is 2,756 modern words. |
| `en_editions_aligned: true` | Confirmed — 1062 = 1062 paragraphs across 25 units. |
| Shakespeare apparatus-debris failure mode | **Disconfirmed** — 0 suspects, all 25 titles clean. |
| *(not in Phase 1 data)* mis-parsed stage directions | **New finding — 4 paragraphs, both editions.** See Structure check. |

## Phase 3 — human-edition research

**Does the source already meet the reading standard?** No. Mercutio's wordplay, the servants'
prose and the Nurse's idiom are all substantially opaque without annotation
(`dun's the mouse`, `save your reverence`, `by my holidame`, `a man of wax`, `pilcher`, `aby`).
A modern edition is justified.

**Rights-clear human modernization?** Same corpus-level answer as the rest of the batch:

| candidate | what it is | rights | verdict |
|---|---|---|---|
| **Play On Shakespeare / ACMRS Press** — *Romeo and Juliet*, modern-verse translation by **Hansol Jung** (staged in NYC 2023) | Complete line-by-line modern verse; the brief required preserving rhyme and meter, so it would plausibly solve the Prologue-sonnet problem | **Permission required.** "© 2026 Play On Shakespeare. All Rights Reserved."; text obtainable only via script request; ACMRS Press publishes in print/e-book with no CC licence stated. | **Rejected — rights.** |
| **Folger Shakespeare** digital text | Modern **spelling** + notes; Shakespeare's own words | **CC BY-NC 3.0**; "you may not use the material from Folger Digital Texts for commercial purposes" | **Rejected** — NC blocks a paid product; not a modernization. |
| **Standard Ebooks** — *Romeo and Juliet*, from Clark & Wright 1887 Victoria/Globe | Original language, modern spelling, clean typography, correct stage directions | **Public domain / CC0** | **Not a modern-en candidate — but the most actionable finding here.** Re-basing `original-en` on it would very likely fix all four mis-parsed stage directions at once, since they are parse artifacts rather than textual variants. **Worth verifying against SE before hand-patching.** |
| Lamb (1807, PG #20657), Nesbit (1907, PG #1430) | Abridged narrative retellings | Public domain | **Rejected — incomplete.** |
| No Fear Shakespeare, Shakescleare, NoSweatShakespeare, Shakespeare Retold | Complete modern parallel texts, free to read | All-rights-reserved | **Rejected — rights.** |

**Conclusion:** none found in this search; for the public-domain corpus, effectively "none exists".

**Sources:** https://thecitylife.org/2023/05/01/romeo-and-juliet-play-on-shakespeare-modern-verse-translation-by-hansol-jung-in-nyc/ ·
https://playonshakespeare.org/our-translations/ · https://www.folger.edu/copyright-policy/ ·
https://standardebooks.org/ebooks/william-shakespeare · https://acmrspress.com/series/play-on-shakespeare/

## Phase 4 — ratings

| dimension | weight | score | reasoning |
|---|---|---|---|
| fidelity / completeness | 40 % | **4** | No scene or speech missing; paragraph alignment perfect. Docked for one inverted meaning (`He shift a trencher!`), one muddled rendering (ch5 p16), a dropped clause and pun in Mercutio's ch5 p14, the Prologue's `take their life` pun, and stripped Nurse oaths. All local, but there are more of them than in hamlet or macbeth. |
| first-read clarity | 25 % | **5** | Consistently clear. The balcony scene, the tomb scene and the Nurse all read easily at first pass. |
| literary voice | 20 % | **3** | Juliet, Romeo and dying Mercutio are well served (`grave man` preserved); punning Mercutio, the Nurse's oaths and the Prologue's sonnet form are not. A pattern across three of six samples. |
| restraint / no invention | 10 % | **3** | Lowest restraint score in the batch. `It's nighttime` (ch5 p15) is straightforwardly added content; `from the earthquake` (ch4 p12) is an added causal explanation; `He can barely handle a single plate!` substitutes the translator's reading for the source's. |
| naturalness | 5 % | **5** | Fluent contemporary English; no tics. |

**Weighted score: 4.0** · **Band: Good with fixes**

## Recommendation

**LIGHT EDIT** · confidence **medium** · correction scope **local**

Reasoning: the prose is good, the rewrite is real (similarity 0.4173), and the two most-read
scenes in the play — the balcony and the tomb — are strong. But there are confirmed additions and
one inverted meaning, which rules out KEEP, and the four mis-parsed stage directions are
reader-visible bugs that need fixing regardless of the translation verdict. The defects are
countable and individually small, so RETRANSLATE would be disproportionate.

Scoped fix list, in priority order:
1. **Fix the four mis-parsed stage directions in BOTH English editions** (and check `modern-da` for the same four): ch25 p33, ch13 p32, ch5 p1, ch6 p0. Highest priority — a dead Romeo announcing a stage entrance is the single most embarrassing defect found in this batch. Check the Standard Ebooks text first; a re-base may fix all four without hand-patching.
2. Remove the added `It's nighttime` (ch5 p15).
3. Fix the inverted meaning at ch6 p1 (`He shift a trencher! He scrape a trencher!`).
4. Redo Mercutio ch5 p14 (`dun's the mouse` / `the constable's own word` / `save your reverence`) and ch5 p16.
5. Re-render the Prologue (ch1 p1) in the source's clause order, keep `take their life` double-sensed, and consider restoring sonnet form; do the same check on the Act 2 Prologue, which I did **not** sample.
6. Restore the Nurse's oaths (`by th'rood`, `by my holidame`, `marry`) and her varied refrain in ch4 p12.

## Limitations of this review

- I inspected **6 of 25 units** (ch1, ch4, ch5, ch8, ch13, ch25) plus a spot-check of ch6 p0–2 —
  roughly 2,600 of 25,515 source words read closely — plus mechanical coverage of all 25 units for
  alignment, titles, apparatus, identical paragraphs, stage-direction parsing and typography.
  Scenes 2, 3, 7, 9–12, 14–24 were **not** read line by line.
- **The Act 2 Prologue was not located or sampled.** The Prologue chorus of Act 2 is also a sonnet
  and is the obvious place where the ch1 finding would repeat; it should be checked first in any
  follow-up. (The `sections` list shows a single `Prologue` unit, so it may sit inside an Act 2
  scene or be absent from this source text — worth confirming either way.)
- `modern-da` and `romeo-and-juliet-threads.json` not audited (out of scope), though the four
  stage-direction defects should be checked there too.
- App integration, split-pane alignment and audio not checked.
- I did not verify against the Standard Ebooks text that a re-base would actually repair the four
  stage-direction defects — that is a recommendation to check, not a verified fix.
- Rights research is desk research on published licence statements, not legal advice; no rights
  holder contacted. Danish/EU vs US analysis not performed — all candidates fail on plain
  all-rights-reserved or NonCommercial terms.
- The Hansol Jung attribution comes from a production listing, not a primary ACMRS page; treat as
  **reported, not primary-verified**. The rights conclusion does not depend on it.
