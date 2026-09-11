# Much Ado About Nothing — modern-en audit (batch B5)

- **Book ID:** `much-ado-about-nothing`
- **Title / author:** Much Ado About Nothing / William Shakespeare
- **Scope:** public (in `BOOKS`)
- **Reviewer:** batch agent B5, 2026-09-11

## Edition snapshot (Phase 1 data)

| Edition | sha256_16 | Chapters | Paragraphs | Words | Label |
|---|---|---|---|---|---|
| original-en | `dd00eb7a88235b98` | 17 | 1118 | 22,347 | Shakespeare (1600) |
| modern-en | `3b92db2e6ffc9d6b` | 17 | 1118 | 21,977 | Modern English |
| modern-da | `2d45f4afa4ee771a` | 17 | 1118 | 22,966 | Moderne Dansk |

Mechanical comparison: mean weighted similarity **0.6995** (**highest of the five plays
in this batch**); identical long paragraphs **2.1%** (also highest); truncation flags
**0**; empty paragraphs **0**; no chapter or paragraph mismatches;
`en_editions_aligned: true`. Not on the README's 33-book watchlist — but it is the book
in this batch that came closest to deserving a place on it.

Note: modern-en is **370 words shorter** than the source. It is the only book in this
batch where the modernization is shorter than the original, which is itself a weak signal
that the pass did less work than elsewhere.

## Provenance and completeness of the core English text

17 chapters, all genuine Act/Scene units with location subtitles, matching the canonical
3+3+5+2+4 = 17-scene structure. No apparatus debris, no front matter. `Shakespeare
(1600)` = Q1; Q1 and F1 differ only trivially for this play, so unlike Othello and Lear
the label here is defensible.

## Samples inspected (5)

### 1. Act 1, Scene 1, paras 20–49 (Beatrice's opening wit) — strong
Source (para 26): *"In our last conflict four of his five wits went halting off, and now
is the whole man governed with one! so that if he have wit enough to keep himself warm,
let him bear it for a difference between himself and his horse…"*
Modern: *"In our last clash, four of his five wits went limping off, and now the whole
man is governed by just one. So if he has wit enough to keep himself warm, let him show
it off as the only thing distinguishing him from his horse…"*

**Finding:** This is the book at its best. The heraldry pun on "difference" is opened up,
`"squarer"` → `"brawler"`, `"he is not in your books"` → `"not in your good books"`,
`"stuffed man"` joke intact, Lady Disdain intact. Nothing lost, nothing added.

### 2. Act 4, Scene 1, paras 85–114 (the church scene, "Kill Claudio") — mixed
Source (para 109): *"Is he not approved in the height a villain, that hath slandered,
scorned, dishonoured my kinswoman? … What! bear her in hand until they come to take
hands…"*
Modern: *"Hasn't he proved himself thoroughly a villain, who has slandered, scorned,
dishonored my kinswoman? … What! Lead her on until they come to take hands…"*

**Finding:** The emotional spine holds — "Kill Claudio" lands, "O that I were a man"
lands, "I would eat his heart in the marketplace" lands. But the wit exchange leading up
to it is barely touched: *"With no sauce that can be devised to it"* → *"With no sauce
that can be devised **for** it"* is a one-word edit of an idiom that is opaque either
way, and `"Soft and fair, friar"` (5.4 para 41) is left verbatim — the same "soft" that
Othello's modern-en correctly renders *"Soft you"* → *"Wait."* Inconsistent across books.

### 3. Act 4, Scene 2, paras 0–29 (Dogberry's examination) — comic/low register, mixed
Source: *"DOGBERRY. Is our whole dissembly appeared?"*
Modern: *"DOGBERRY. Is our whole dissembly assembled?"*

**Finding:** Dogberry's malapropisms are mostly preserved — `"dissembly"` survives,
`"that's the eftest way"` survives verbatim and unglossed, `"Flat burglary as ever was
committed"` survives. Good. But *"Is our whole dissembly appeared?"* → *"…dissembly
assembled?"* rewrites the joke: the source's error is the *noun*, and pairing it with
the correct word changes the comic mechanism.

The larger problem in this scene is the handling of **"Marry"** — see below.

### 4. Act 5, Scene 2, paras 14–33 (Beatrice and Benedick's reconciliation banter) — **failing**
Source (para 23): *"BEATRICE. For them all together; which maintained so politic a state
of evil that they will not admit any good part to intermingle with them. But for which of
my good parts did you first suffer love for me?"*
Modern (para 23): **byte-for-byte identical.**

Source (para 25): *"BEATRICE. In spite of your heart, I think. Alas, poor heart! If you
spite it for my sake, I will spite it for yours; for I will never love that which my
friend hates."*
Modern (para 25): **byte-for-byte identical.**

Also untouched in the same scene: para 21 (*"foul breath is noisome; therefore I will
depart unkissed"*), para 27 (*"It appears not in this confession"*), para 28 (*"An old,
an old instance, Beatrice, that lived in the time of good neighbours"* — only
`neighbours` → `neighbors` and `do not` → `does not`).

**Finding: this is the book's central defect.** In Act 5 the modernization degrades into
a pronoun-and-spelling pass. Three long paragraphs are word-for-word identical to the
source and several more differ by one or two words, leaving genuinely opaque Elizabethan
idiom (`"maintained so politic a state of evil"`, `"It appears not in this confession"`,
`"An old, an old instance"`, `"noisome"`) standing in front of a reader who came to this
edition precisely to avoid it. It does not meet the reading standard for this act.

### 5. Act 5, Scene 4, paras 40–69 (the ending) — mixed
Source (para 48): *"BENEDICK. Troth, no; no more than reason."*
Modern (para 48): *"BENEDICK. **Truth**, no; no more than reason."*

**Finding: a genuine error.** "Troth" is "in truth / truly"; a bare "Truth, no" is not
English. Compare para 58, which is left **100% identical** to the source. Benedick's
final prose speech (para 61) is competently handled (`"witcrackers"` → `"wit-crackers"`,
`"a' shall"` → `"he shall"`), and the cuckold joke at para 65 (*"no staff more reverent
than one tipped with horn"*) is correctly left unglossed. The play's last line carries a
stage-direction error — see below.

## Phase 1 flags: confirmed vs. disconfirmed

- **0 truncation / 0 empty / 0 mismatches** — confirmed; all 17 scenes present,
  paragraph-matched 1118/1118.
- **2.1% identical long paragraphs — CONFIRMED as a real defect, not a benign artifact.**
  Ranking all 256 source paragraphs ≥25 words: 13 (5.1%) exceed 0.90 and **3 are exactly
  1.00**. Unlike Othello's near-identical set (all already-plain prose), these sit in the
  *wittiest* prose in the play, where the reader most needs help. The flag was the right
  one to chase.
- **Mean similarity 0.6995 — confirmed as the batch's lightest touch.** For comparison
  within this batch: Shrew 0.594, Antony 0.636, Othello 0.675, Lear 0.675, Much Ado 0.695.
- **Archaic-token sweep:** 457 source instances → 6 in modern-en (**1% retained**). So
  the *pronoun* modernization is thorough everywhere; what fails in Act 5 is the
  vocabulary and idiom layer, which the pronoun sweep does not touch. This is exactly
  the failure mode a similarity score alone would under-report.

## Additional defects found (not in Phase 1 data)

1. **"Marry" → "By the Mass" — 15 wrong glosses.** The source uses `marry` 32 times and
   `by the mass` once. modern-en uses `by the Mass` **16 times**. The interjection
   "marry" is a weakened form of "by Mary" and means roughly "why", "indeed", "to be
   sure"; rendering it "By the Mass" (a) is etymologically wrong, (b) is a heavier,
   more emphatic oath than the source, (c) is *less* accessible to a modern reader than
   the word it replaced, and (d) collapses the distinction with the source's one genuine
   "by the mass" (Verges, 4.2). It is also inconsistent with the rest of the batch:
   Othello renders "marry" as "Indeed"/"Why", Lear leaves all 7 untranslated, Shrew
   leaves 16 of 18 untranslated. Four different policies across five plays.
2. **"Exeunt" → "Exit" in 29 stage directions.** Including `[Exeunt all but Benedick and
   Claudio.]` → `[Exit all but Benedick and Claudio.]` and the play's final direction
   `[Dance. Exeunt.]` → `[Dance. Exit.]`. A mass exit is silently turned into a single
   exit — a factual alteration of stage business, and ungrammatical in the "all but"
   case. None of the other four plays in this batch do this (Othello 0, Lear 0, Shrew 0,
   Antony 0).
3. **Stage-direction convention changed from the source.** Source: 69 bracketed / 42
   bare. Modern: 111 bracketed / 0 bare — everything normalized to brackets. Harmless in
   itself but inconsistent with Shrew, which preserves the source convention exactly.

## Phase 3 — human-edition research

Same conclusion as the rest of the batch (full candidate table in `othello.md`):

- **Standard Ebooks** — Much Ado **not published**; SE Shakespeare is histories +
  *The Winter's Tale* only, and is original-language anyway. CC0.
  [standardebooks.org/ebooks/william-shakespeare](https://standardebooks.org/ebooks/william-shakespeare)
- **Wikisource / PG / Globe-Moby** — complete, **public domain**, commercial reuse
  permitted. Original language (= what `original-en` already is).
- **Folger digital texts** — **CC BY-NC**, noncommercial only. Rights-blocked.
- **Internet Shakespeare Editions** — educational/non-profit only, editor holds
  copyright. [ISE copyright](https://internetshakespeare.uvic.ca/Foyer/copyright.html). Rights-blocked.
- **Open Source Shakespeare** — CC BY-NC 4.0. Rights-blocked.
- **No Fear Shakespeare / Shakescleare / NoSweatShakespeare / Durband / OSF Play On!** —
  complete modern-English translations, all under copyright; permission required.
- **Lamb, *Tales from Shakespeare*** — Much Ado *is* one of the 20 tales, public domain,
  but an abridged children's prose retelling, not the play.
  [PG #573](https://www.gutenberg.org/cache/epub/573/pg573.txt)

**No complete, human-authored, rights-clear modern-English Much Ado found in this
search.**

## Phase 4 — rating

| Dimension | Weight | Score |
|---|---|---|
| Fidelity / completeness | 40% | 3 |
| First-read clarity | 25% | 3 |
| Literary voice | 20% | 4 |
| Restraint / no invention | 10% | 3 |
| Naturalness | 5% | 3 |

**Weighted score: 3.2 — band: Mixed.**

Fidelity is held to 3 by two confirmed alterations rather than omissions: 29 plural→
singular stage directions, and 15 inserted oaths ("By the Mass") that are not the
source's word. Restraint is held to 3 for the same reason — "By the Mass" is an
invention of register, small but systematic.

**Recommendation: LIGHT EDIT.**
Not RETRANSLATE: Acts 1–4 are a competent, funny, faithful modernization and there is no
substantive omission anywhere. But the fixes are bigger than a tweak — Act 5 Scene 2 (and
parts of 4.1 and 5.4) needs a genuine re-pass, not a patch, and two find-and-replace
classes need reverting across the whole book.

Concretely:
1. Re-pass Act 5 Scene 2 end to end, plus the ~13 long paragraphs scoring ≥0.90.
2. Revert all 15 `By the Mass` → an actual modern equivalent ("Indeed", "Why", "To be
   sure"), and settle a batch-wide policy for "marry".
3. Restore `Exeunt` in all 29 stage directions.
4. Fix `Truth, no` → `Truly, no` (5.4 para 48) and reconsider `dissembly assembled`
   (4.2 para 1).

- **Confidence:** medium-high for the defects (each is mechanically counted over the
  full text, not inferred from a sample); medium for the overall band, since I read 5
  passages / roughly 1,400 source words closely out of 22,347.
- **Correction scope:** substantial.

## Limitations of this review

- Acts 2 and 3 were sampled only through the full-text similarity ranking, not read
  closely — the gulling scenes (2.3, 3.1) and the watch scene (3.3) are unexamined
  beyond that.
- `modern-da` not evaluated. Note the "By the Mass" and "Exeunt" defects may or may not
  have Danish analogues; not checked.
- Threads/onboarding/audio JSON not checked.
- Rights conclusions are research summaries, not legal advice.
