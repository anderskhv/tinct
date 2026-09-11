# a-little-princess — A Little Princess, Frances Hodgson Burnett (1905)

Batch B14. Reviewer: audit subagent, 2026-09-11.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en "Original (1905)" | `db6f42f1bdcc817a` | 19 | 1701 | 66,175 |
| modern-en "Modern English" | `5e359e936c37e8e7` | 19 | 1701 | 66,160 |
| modern-da "Moderne Dansk" | `3df7d45b3c5249db` | 19 | 1701 | 67,106 |

`en_editions_aligned: true`; no count mismatches; 0 truncated; 0 empty; mean
weighted similarity 0.8561; `pct_identical_long_paragraphs` 3.8.

## Provenance of the core English text

English original, public domain worldwide. The 1905 Scribner's novel-length
expansion of "Sara Crewe" (1888); 19 chapters, matching the standard text.

**Typography note:** `original-en` uses ASCII straight quotes throughout all 19
chapters; `modern-en` uses curly quotes throughout. Here the defect is on the
*source* side — the original edition is the one with the degraded typography.
Opposite of `heart-of-darkness` in this batch.

## Phase 1 flags: confirmed / disconfirmed

Low flags, and they hold up. Raw identity is 2.9% of source words; after
normalizing the quote mismatch it is 13.4%, spread evenly across all 19
chapters (range 2%–24%, no chapter above 24%, no taper, no untreated block):

```
ch 1 18%  ch 2 24%  ch 3 15%  ch 4  7%  ch 5  5%  ch 6 11%  ch 7 15%
ch 8  6%  ch 9 15%  ch10  9%  ch11 16%  ch12 16%  ch13 14%  ch14  8%
ch15 18%  ch16 10%  ch17 24%  ch18 11%  ch19 14%
```

This is a genuine whole-book pass. Disconfirmed: no truncation, no empty
paragraphs, no paragraph drift, no content moved between chapters. A
length-ratio scan of every paragraph ≥40 source words found **zero** outliers
— nothing omitted or padded.

## Children's-register check (the batch-specific risk — house policy forbids
kids editions)

**Passed on the quantitative test, with one qualitative reservation.**

```
                 sentences   mean length   median
original-en        4,379       15.1 w        12
modern-en          4,581       14.4 w        11
```

No meaningful shortening (a 0.7-word drop on a 15-word mean is within the noise
of repunctuating a few run-ons), no vocabulary simplification, no added
moralizing. The edition keeps "seminary", "Lascars", "meritorious"→"worthy",
"amiability", "un-fairy princess", "Melchisedec", "the fancies of the Large
Family". This is an adult reading edition, not a kids edition.

The reservation is register of a different kind — see finding 5 below on
working-class dialect, which is flattened. That flattens *class* voice, not
reading level, but it is the direction a children's-edition instinct would push
in and is worth naming.

## Samples inspected (5)

### 1. Opening — Chapter 1 (Sara), paras 0–6

Source p2: "It would have been an old look for a child of twelve… she was
always dreaming and thinking odd things and could not herself remember any time
when she had not been thinking things about grown-up people."
Modern p2: "It would have been an old look **even** for a child of twelve… she
was always dreaming and thinking strange things. **She** could not remember any
time when she had not been thinking about grown-up people."

Source p3: "…and of some young officers' wives who **used to try to make her
talk to them and laugh at the things she said**."
Modern p3: "…and of some young officers' wives who used to try to make her talk
to them **and who laughed at** the things she said."

Finding: **strong, with one borderline.** The prose is handled well and
"queer" → "strange" is a correct and consistently applied modernization (the
word has shifted meaning). But p3 resolves a real ambiguity in Burnett: in the
source both verbs hang off "used to try to" — the wives tried to make her talk
*and* tried to laugh at what she said, i.e. they were being condescending on
purpose. The modern text converts the second to a plain finite clause, which
makes the laughter incidental rather than part of the same patronising
performance. Small, but it is the "altered logical relationships" class, and
it lands on Sara's first characterising memory.

### 2. Chapter 5 (Becky), paras 30–39

Source p31: "The pupils were **attired** in their prettiest **frocks**, and as
Sara danced particularly well, she was very much **brought forward**."
Modern p31: "The pupils were **dressed** in their prettiest **dresses**, and
since Sara danced particularly well, she was very much…"

Source p35: "When the **ill-used** heroine of her story **wakened**" → modern
"When the **mistreated** heroine of her story **woke up**".

Finding: **strong.** Clean, faithful, adult-register. Sentence splitting at p32
(one source sentence → two) is legitimate and loses nothing.

### 3. Chapter 7 (The Diamond Mines Again), paras 30–35 — Miss Minchin's speech

Source p33: "**Her amiability she exhibits by** giving you this afternoon's
party. I hope you appreciate her generosity. **I wish you to express** your
appreciation of it by saying aloud all together…"
Modern p33: "**She shows her kindness by** giving you this afternoon's party. I
hope you appreciate her generosity. **I want you to express** your appreciation
by saying aloud all together…"

Finding: **borderline / voice.** No content is lost. But Miss Minchin's
fronted object ("Her amiability she exhibits by…") and "I wish you to" are
doing characterisation work — she is a pompous woman performing gentility, and
the stiffness is the joke. "She shows her kindness by… I want you to…" makes
her sound like an ordinary headmistress. Recurring in kind across her
dialogue in this sample.

### 4. Chapter 17 ("It Is the Child!"), paras 8–13 — the highest-identity
chapter (24%)

Source p11: "'I don't think I could talk much about anything else just now,'
the Indian gentleman answered, **knitting his forehead** with a tired look."
Modern p11: "'I don't think I could talk about much else right now,' the Indian
gentleman answered, **knitting his brow** with a tired look."

Source p13: "because **the fancies of** the Large Family always made him forget
things a little" → modern "because **the imaginings of** the Large Family…".

Finding: **strong / legitimate identity.** Burnett's dialogue-heavy chapters
are already contemporary; identity here is correct restraint, not a missed
pass. "Indian gentleman" is preserved as the period term of address, which is
right — it is how the Large Family children name him.

### 5. Ending — Chapter 19 (Anne), paras 38–44

**(a) Dialect flattening.** Source p38: "'Why, she's in that there back room,
miss, **an'** has been for a month; **an'** a decent, well-**meanin'** girl
she's **goin'** to turn out, **an'** such a help to me in the shop **an'** in
the kitchen as you'd scarce believe, **knowin'** how she's lived.'"
Modern p38: "'Why, she's in that back room there, miss, **and** has been for a
month. She's going to turn out a decent, well-**meaning** girl, **and** she's
such a help to me in the shop **and** in the kitchen as you'd scarcely believe,
**knowing** how she's lived.'"

Counted across the whole book, working-class dialect markers (`an'`, `goin'`,
`nothin'`, `somethin'`, `wot`, `'ow`, `'im`, `'er`, `yer`, `wos`, `ain't`,
`mum`) fall from **30 in `original-en` to 17 in `modern-en`** — roughly 45%
removed, and not consistently: some survive, some don't. Mrs. Brown's and
Becky's Cockney is a class marker in a novel *about* class, and the reading
standard explicitly requires preserving "meaningful differences in address,
rank, intimacy". Partial removal is worse than either full removal or full
retention, because the remaining markers now read as inconsistency rather than
characterisation.

**(b) A small sanitization.** Source p39: "she had a nice face, now that she was
no longer **a savage**, and the **wild** look had gone from her eyes."
Modern p39: "she had a nice face, now that she was no longer **wild**, and the
**savage** look had gone from her eyes."

The two words are swapped. The effect is to remove the source's predicate noun
— Burnett writes that the beggar-child *was a savage*, a hard and
uncomfortable line — and demote "savage" to a descriptor of a look. The
content survives, the editorial judgement does not. The reading standard
forbids adding interpretation; softening a source's own characterisation is the
same error in the other direction. Local, one paragraph, but worth logging
because the batch brief flagged exactly this risk class.

**(c)** p44: source "though **she** said so little" → modern "though **Anne**
said so little" — a correct disambiguation, no loss.

## Human-edition research

English original, public domain worldwide; no translation involved, so no
alternative human translation is in scope. Standard Ebooks publishes
CC0-dedicated transcriptions of Burnett (their production work is dedicated to
the public domain via CC0 1.0; the 1905 text is PD), which would also fix the
straight-quote typography in our `original-en`. That is the only defect I found
in the source file, and it is a production issue rather than a textual one.

**Status: not researched further (English original already accessible).**

## Ratings

| dimension | weight | rating |
|---|---|---|
| fidelity / completeness | 40% | 4 |
| first-read clarity | 25% | 5 |
| literary voice | 20% | 3 |
| restraint / no invention | 10% | 4 |
| naturalness | 5% | 5 |

Weighted score **4.1** — band **Good with fixes**.

Clarity and naturalness are the edition's strengths — it reads very well.
Voice takes the hit for the inconsistent dialect flattening and the softening
of Miss Minchin's pomposity; fidelity and restraint take smaller hits for the
ch1 p3 ambiguity resolution and the ch19 p39 savage/wild swap.

## Recommendation

**LIGHT EDIT.**

1. Decide a dialect policy and apply it consistently — I recommend **retain**
   Burnett's phonetic spellings for Becky, Mrs. Brown and the other
   working-class speakers, since class voice is load-bearing in this novel, and
   restore the ~13 markers that were dropped.
2. Restore ch19 p39 to Burnett's wording ("no longer a savage… the wild look").
3. Restore ch1 p3's parallel infinitives ("to make her talk to them and laugh at
   the things she said").
4. Consider restoring Miss Minchin's stiff constructions where they are clearly
   comic rather than merely archaic.
5. Separately, as a production task: fix the straight-quote typography in
   `original-en`, which is currently the worse-looking of the two English
   editions.

- **Confidence: medium.** 5 passages read closely out of 19 chapters, plus an
  exhaustive mechanical pass over all 1,701 paragraph pairs, an exhaustive
  sentence-length measurement, and an exhaustive dialect-marker count. The
  dialect finding is book-wide and solid; the voice-flattening finding on Miss
  Minchin rests on one sample and may not generalise.
- **Correction scope: local** (dialect restoration is mechanical and touches a
  bounded set of paragraphs; the other three fixes are single lines).

## Limitations of this review

- 14 of 19 chapters were not read as connected prose, including chapters 8,
  15 and 18 — chapter 15 ("The Magic") is the longest in the book at 260
  paragraphs and the emotional centre of the novel.
- The dialect count used a fixed marker list; other dialect features
  (word order, vocabulary) were not measured.
- I did not check `modern-da`.
- I did not check onboarding/cast JSON or audio.
