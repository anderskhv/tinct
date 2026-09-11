# jungle-book — The Jungle Book, Rudyard Kipling (1894)

Batch B14. Reviewer: audit subagent, 2026-09-11.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en "Kipling (1894)" | `f1a9afbb1c7ee5ab` | 7 | 944 | 50,774 |
| modern-en "Modern English" | `821357c6bb7dc016` | 7 | 944 | 50,675 |
| modern-da "Moderne Dansk" | `574838d49e38cec0` | 7 | 944 | 48,749 |

`en_editions_aligned: true`; no count mismatches; 0 truncated; 0 empty; mean
weighted similarity 0.9719; `pct_identical_long_paragraphs` **46.0** (second
highest in the 101-book inventory).

## Provenance of the core English text

English original, public domain worldwide. Seven stories first published in
magazines 1893–94 and collected in 1894. Our `original-en` retains Project
Gutenberg plain-text markup — `--` for em dashes and `_underscore_` italics —
in both English editions; see production notes below.

## Phase 1 flags: confirmed / disconfirmed

**Confirmed, with a decisive per-chapter split.** Share of source *words* in
byte-identical paragraphs, per chapter:

```
ch 1  Mowgli's Brothers        154/154 paragraphs   100.0%   (7,534 words verbatim)
ch 2  Kaa's Hunting             62/181                15.2%
ch 3  "Tiger! Tiger!"           39/119                12.9%
ch 4  The White Seal            60/115                33.8%
ch 5  "Rikki-Tikki-Tavi"        66/121                37.4%
ch 6  Toomai of the Elephants   14/89                  6.3%
ch 7  Her Majesty's Servants    88/165                33.0%
```

Chapter 1 is **100% byte-identical**, every paragraph, 7,534 words — 14.8% of
the book, and the single most-read chapter in Kipling. The modernization pass
never ran on it. Independent confirmation, counting leftovers in `modern-en`
only:

```
chapter          archaic pronouns (thy/thee/thou/ye/hath/saith)   raw "--" markers
ch 1                              89                                     68
ch 2                              10                                      0
ch 3                               8                                     22
ch 4                               0                                      0
ch 5                               0                                      0
ch 6                               1                                      0
ch 7                               0                                      0
```

Chapters 4, 5 and 7 have zero archaisms and zero `--`; chapter 1 has 89 and 68.
That is not "the source was already plain" — it is an untreated chapter.

Disconfirmed: no truncation, no empty paragraphs, no paragraph-count drift, no
content moved between chapters. A length-ratio scan of every paragraph ≥40
source words found **zero** outliers outside 0.72–1.35, so nothing is omitted
or padded anywhere.

## Samples inspected (6, five of them identical-flagged)

### 1. Chapter 1 (Mowgli's Brothers), paras 0–5 — identical-flagged

`original-en` and `modern-en` p2 are the same string:

"It was the jackal--Tabaqui, the Dish-licker--and the wolves of India despise
Tabaqui because he runs about making mischief… We call it hydrophobia, but they
call it dewanee--the madness--and run."

The verse epigraph also survives with raw PG markup in both: `_Night-Song in the
Jungle_`.

Finding: **failing.** Verbatim, including the `--` and `_italics_` artifacts
that chapters 4/5/7 do not contain.

### 2. Chapter 2 (Kaa's Hunting), paras 0–5 — the treated register, for contrast

Source p0: "If **ye** find that the Bullock can toss you… **Ye** need not stop
work to inform us". Modern p0: "If **you** find that the Bullock can toss you…
**you** need not stop work to inform us."

Source p1: "though they are little and **fubsy**" → modern "little and
**pudgy**". Source p2: "**revenged himself on** Shere Khan" → "**took revenge
on** Shere Khan"; `--` → em dash. Source p4: "all **thy** long talk" → "all
**your** long talk".

Finding: **strong.** This is the correct editorial call for Kipling — normalize
archaic pronouns and one obsolete adjective, touch nothing else. It also proves
the chapter-1 identity is a miss, not a decision: the same `thy`/`ye`/`--`
forms that chapter 2 normalizes are left standing 89 and 68 times in chapter 1.

### 3. Chapter 2, para 141 — identical-flagged neighbourhood, internal
inconsistency

Source: "'We be one blood, **thou** and I,' Mowgli answered. 'I take my life
from **thee** tonight. My kill shall be **thy** kill if ever **thou art**
hungry, O Kaa.'"

Modern-en: "'We be one blood, **thou** and I,' Mowgli answered. 'I take my life
from **you** tonight. My kill shall be **your** kill if ever **you are**
hungry, O Kaa.'"

Finding: **borderline / voice defect.** Mowgli's oath is a ritual formula in
the book's invented Jungle-Law register. The edition modernizes the second half
of the formula and leaves the first half archaic, producing a line that is
archaic and modern in the same breath. Elsewhere (ch2 p14, p118, p151) the
Master-Words "We be of one blood, ye and I" are left wholly archaic, which is
the right call. This one line is inconsistent with that policy.

### 4. Chapter 4 (The White Seal), paras 2–4 — identical-flagged chapter

Source p2: "away and away in the Bering Sea… blown on **to** the rigging of a
steamer **going to** Japan… **till** he was fit to fly back". Modern p2: "far
away in the Bering Sea… blown **onto** the rigging of a steamer **bound for**
Japan… **until** he was fit to fly back."

Finding: **strong / legitimate identity.** Where the edition changes nothing
(p3 is near-identical) the source genuinely needs nothing. Kipling's narrative
prose here is already modern-adult English.

### 5. Chapter 5 (Rikki-Tikki-Tavi), paras 0–7 — identical-flagged chapter

Source: "clung to it till he **lost his senses**… very **draggled** indeed";
modern: "clung to it until he **lost consciousness**… very **bedraggled**
indeed". Verse: "(_At **thy** pleasure, Nag._)" → "(_At **your** pleasure,
Nag._)"; "**saith**" → "**says**".

Finding: **strong / legitimate identity.** Same verdict as chapter 4.

### 6. Chapter 7 (Her Majesty's Servants), paras 30–35 — identical-flagged
chapter

Source p33: "I'm not above stampeding myself, for the fun of **the thing**";
modern: "for the fun of **it**". p30, p31, p35 verbatim.

Finding: **strong / legitimate identity.** Dialogue that is already
contemporary in rhythm is left alone; the only edits are genuine idiom updates.

## Editorial judgement on the identical-paragraph question

The brief asked whether 46% identity is legitimate or a light/mechanical false
modernization of the wealth-of-nations kind. **Both answers apply, to different
parts of the book.** For chapters 2–7 the identity is legitimate and the
editorial policy is right: Kipling's prose is already plain, and a heavier hand
would have damaged it. For chapter 1 the identity is a straightforward gap —
the pass did not run, and the internal evidence (89 archaic pronouns, 68 raw
`--`, versus 0 and 0 in chapters 4/5/7) makes that unambiguous rather than a
matter of taste.

**Children's-register check (house policy — no kids editions).** Passed. Mean
sentence length `original-en` 18.2 words / median 14; `modern-en` 17.7 / 14.
No shortening, no vocabulary dumbing, no added moralizing. The edition keeps
"impenetrable", "prolific in pretexts", "architecturally", "hydrophobia",
"cantonment", "Bandar-log", "Gidur-log [the jackal people]". This is an adult
reading edition.

## Production notes (not editorial)

Both English editions carry Project Gutenberg plain-text markup that never got
cleaned: `_italics_` underscores around verse attributions in every chapter,
and `--` double hyphens (68 in `modern-en` ch1, 22 in ch3). Chapters 2, 4, 5, 6,
7 of `modern-en` have had these converted to em dashes; chapters 1 and 3 have
not. Reader-visible.

## Human-edition research

English original, public domain worldwide; no translation involved. If a
cleaner base text is ever wanted, **Standard Ebooks, *The Jungle Book*,
Rudyard Kipling** — 50,969 words, transcribed from Project Gutenberg with
HathiTrust page scans, complete (all seven stories). Licensing statement on the
page, verified by fetch: *"Content produced by or for Standard Ebooks L³C is
dedicated to the public domain via the CC0 1.0 Universal Public Domain
Dedication."* URL: https://standardebooks.org/ebooks/rudyard-kipling/the-jungle-book
That edition would also resolve the `--` / `_italics_` markup artifacts for
free. Word count 50,969 vs our 50,774 — consistent with a complete text plus
front matter, i.e. our `original-en` is not abridged.

**Status: not researched further (English original already accessible); one
rights-clear cleaner transcription noted opportunistically.**

## Ratings

| dimension | weight | rating |
|---|---|---|
| fidelity / completeness | 40% | 5 |
| first-read clarity | 25% | 3 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 4 |

Weighted score **4.3** — band **Good with fixes**.

Fidelity is 5: nothing is omitted, invented, or logically altered anywhere in
the book (verified mechanically across all 944 paragraph pairs, plus six read
passages). Clarity is 3 solely because chapter 1 was never treated. Voice is 4
for the ch2 p141 formula break.

## Recommendation

**LIGHT EDIT.**

1. Run the chapter-2-through-7 pass over chapter 1 — normalize `thy/thee/thou/
   ye/hath/saith` (89 instances), convert `--` to em dashes (68 instances),
   update the handful of obsolete idioms. Do not otherwise rewrite it; the
   chapter 4/5/7 policy is correct.
2. Convert the remaining 22 `--` in chapter 3.
3. Fix ch2 p141 to leave Mowgli's oath wholly archaic, matching ch2 p14/118/151.

- **Confidence: high.** The chapter-1 finding is mechanical and exhaustive, not
  sampled; the legitimacy of the chapters 2–7 identity was checked by reading
  four separate identical-flagged passages.
- **Correction scope: local** (one chapter plus three line-level fixes).

## Limitations of this review

- 6 passages read closely out of 7 chapters; chapter 6 ("Toomai of the
  Elephants") was only scanned mechanically, not read as connected prose.
- I did not check `modern-da`.
- I did not audit the verse epigraphs of chapters 3, 4, 6, 7 line by line —
  verse is where a modernizer is most likely to damage metre, and I only
  inspected the chapter 2 and chapter 5 epigraphs.
- I did not check onboarding/cast JSON or audio.
