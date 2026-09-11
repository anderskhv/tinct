# What is actually stopping Priority-1 from finishing

September 11, 2026, ~18:00 UTC. Every number here was measured from a cloud
container against production during this session. Where an earlier figure of
mine was wrong, the correction is stated rather than quietly replaced.

**The missing GPU is the loudest blocker but not the binding one.** One defect in
the comparison layer gates about a fifth of the queue, and compute would produce
candidates that hit exactly the same wall, faster.

## The evidence that the remaining work is adversely selected

Production state, checked directly across all 206 finish-queue chapters:

| | |
| --- | --- |
| published | **120 of 206** |
| still missing | 86 |
| editions complete | **8** |

Publication is flowing, from another owner rather than this session. The
chapters left behind are the hard ones, and the flags below predict which:

| group | still unpublished |
| --- | --- |
| base rate across the queue | 42% |
| **chapters flagged by the scans below** | **79%** |
| unflagged chapters | 32% |
| truncated-audio chapters | **100%** |

Five chapters were aligned this session specifically because each would complete
an edition on its own. **None passed.** Their causes are the classes below, not
throughput.

## 0. Short paragraphs have no error tolerance — the largest blocker

Found last, and it outranks everything below it.

The acceptance ratio is **per paragraph**, and one failing paragraph rejects the
whole chapter. For a paragraph of n tokens, a single recognition error scores
(n-1)/n, so the gate is passed only when n is at least 7:

| tokens | score after ONE error | verdict |
| --- | --- | --- |
| 2 | 0.500 | fails |
| 4 | 0.750 | fails |
| 6 | 0.833 | **fails** |
| 7 | 0.857 | passes |

So any paragraph of **6 tokens or fewer must be recognised perfectly**. Measured
on `the-tempest/original-en`, 501 paragraphs, biased arm:

| paragraph length | paragraphs | failures | fail rate |
| --- | --- | --- | --- |
| 1–5 words | 138 | 8 | **5.8%** |
| 6–10 | 114 | 1 | 0.9% |
| 11–20 | 105 | 1 | 1.0% |
| 21–50 | 97 | 0 | 0% |
| 51+ | 47 | 0 | 0% |

Every failure in all five chapters was a short paragraph. Half of that edition —
252 of 501 paragraphs — is 10 tokens or fewer, because verse drama is built from
one-line speeches.

**Reach across the finish queue** (`short-paragraph-scan.json`):

| | |
| --- | --- |
| paragraphs of 6 tokens or fewer | **2,683 of 14,859 — 18.1%** |
| **chapters containing at least one** | **114 of 206 — 55.3%** |
| editions affected | **26 of 36** |

Worst exposed: `the-republic` ch10 with **120** such paragraphs of 318,
`phaedo` ch3 at 51% of its paragraphs, `oedipus-at-colonus` ch11 at 46%,
`the-tempest` ch1 at 44%, `notes-from-underground` ch17 with 51 of 120.

At the measured ~5% failure rate per short paragraph, a chapter carrying 20 of
them passes with probability about 0.95^20 — roughly a third of the time. For
`the-republic` ch10 the probability is indistinguishable from zero. **This is why
all five `the-tempest` chapters were rejected and why passing is erratic** —
two chapters of similar quality differ only in whether some two-word line
happened to be heard exactly. It also explains why `macbeth` ch1 passed: 12
paragraphs, and none of its short ones took an error.

This is arithmetic, not a judgement about the 0.85 threshold, and **the threshold
should not be lowered** — it is correct for prose. What needs deciding is how a
ratio gate applies to a two-word line, where it demands perfection from a
recogniser that has none. Options, none taken here:

- score short paragraphs against an absolute allowance rather than a ratio
- group consecutive short paragraphs for scoring and keep per-word timings
- accept a different acceptance policy for verse and dialogue editions

Whichever is chosen, it is a gate-design decision for Anders, so this section
records the evidence and changes nothing.

## 1. Token granularity — one expected token, several spoken words

`chapter_words_from_text` splits the edition text on whitespace only, so a single
"word" can be something the narrator must speak as two or more. Alignment cannot
match it, interpolates across the gap, and one failing paragraph rejects a whole
chapter.

| class | example | expected token | spoken as |
| --- | --- | --- | --- |
| Markdown emphasis | `_To Mrs. Saville, England._` | `_to` | "to" |
| em-dash | `novels--moreover,` | `novelsmoreover` | "novels", "moreover" |
| compound cardinal | `(44) People who` | `fortyfour` | "forty", "four" |
| uncovered number | `1851` | `1851` | "eighteen", "fifty", "one" |
| digit-mixed | `1st` | `1st` | "first" |
| initials | `R.W.` | `rw` | "R", "-W" |

The Markdown case is its own surprise: `normalize_token` strips with `[^\w]`, and
`_` **is** a word character in Python regex, so emphasis markers survive
normalisation and can never match speech.

**Measured over the 206-chapter finish queue** (`granularity-scan.json`),
counting only paragraphs these tokens alone force under 0.85:

| | |
| --- | --- |
| chapters with at least one such paragraph | **38 of 206 — 18.4%** |
| editions affected | **14 of 36** |
| class frequency among failing paragraphs | Markdown `_` 50, digit-mixed 13, compound cardinal 10, em-dash 8, uncovered number 7, initials 2 |

Worst hit: `bacchae` (8 queued chapters), `frankenstein` (7), `medea` (4),
`hume-enquiry` and `jungle-book` (3 each).

**Correction to an earlier figure of mine.** I first reported this as 41 chapters
with "digits" the largest class at 62. That scan flagged every token containing a
digit, which is wrong: `canonical_alignment_token` maps 0–20 and the round tens
through `CARDINAL_WORDS` to a single word that matches speech fine, so `1`, `5`
and `12` are not defects. Only compound cardinals, numbers the table does not
cover, and digit-mixed tokens like `1st` mismatch. Corrected, the total is 38
chapters and **Markdown emphasis is the dominant class**, not digits.

## 2. A systematic first-word onset bias

Every chapter measured starts each paragraph's first word about 0.35–0.40 s
before speech begins — **including chapters already live in production**
(`macbeth` ch1: +0.390 s across 12 of 12 paragraph openings). Full evidence in
`onset-bias/`.

It dominates the **acoustic** gate rather than the structural one: each 30-anchor
sample catches several paragraph openings each carrying a 0.3–0.5 s error, which
is why unrelated chapters keep scoring exactly 28/30, on two different machines.

## 3. Non-English passages

`fear-and-trembling/original-en` ch1 carries a long Latin quotation, and
`small.en` is English-only: `tamen` becomes "tae men", `a Deo` becomes "adio" —
224 of 304 words matched, 0.737. `beyond-good-and-evil` ch5 has Italian. No
tokenizer change helps. This needs either a multilingual model for such passages
or an explicit policy, which is a decision rather than a fix.

## 4. Truncated recordings — small, and now cheaply detectable

A recording can exist, decode cleanly, and contain only part of its paragraph.
`audio_readiness.py` cannot see this. Narration runs at a median **2.80 words per
second** over 806 measured paragraphs (p5 2.03, p95 3.31); truncated recordings
are not near that distribution but physically impossible:

| chapter | paragraph | words | seconds | w/s |
| --- | --- | --- | --- | --- |
| `war-and-peace` ch195 | p36 | 294 | 4.8 | **61.2** |
| `merry-wives-of-windsor` ch12 | p3 | 159 | 2.9 | 55.7 |
| `odyssey` ch3 | p37 | 208 | 4.0 | 51.7 |
| `iliad` ch14 | p34 | 204 | 16.4 | 12.5 |

`duration_screen.py` (added this session) finds these from manifest durations and
edition word counts alone — no audio download, no model — so the queue screens in
minutes instead of surfacing over GPU hours.

**Across all 2,109 `original-en` chapters in the processing queue: 11 chapters
(0.5%), 28 paragraphs, 6 editions.** `war-and-peace` worst at 5 chapters. A small
class, but every one of them is still unpublished.

## 5. Missing recordings — negligible, correcting an earlier claim

I reported a "29% false-ready rate" after 2 of 7 batch-2 chapters dropped for a
404 paragraph (`confessions` ch2 `p10.mp3`, `descartes-meditations` ch6
`p6.mp3`). **That extrapolation was wrong** — a 7-chapter batch that happened to
contain two bad ones.

Measured properly on 60 randomly sampled queue chapters with **every** paragraph
checked (`full-presence-sample.json`): **3,017 recordings, 0 missing, 60 of 60
chapters all-present.** Missing audio is rare and the processing queue is not
meaningfully optimistic about it. The two chapters found remain genuine repair
cases; no recording was regenerated.

## Recommended order

0. **Decide how the ratio gate applies to short paragraphs.** It gates 55% of
   queue chapters and 26 of 36 editions — more than everything below combined,
   and it is why passing currently looks like luck. Do not lower 0.85.
1. **Fix token granularity** — split expected tokens on `--`, strip Markdown
   emphasis, and let one expected token align to several heard words. Unblocks
   ~18% of chapters and 14 of 36 editions. Re-measure the acceptance sample
   afterwards, since this changes the pinned helper.
2. **Fix the onset bias** — clamp a paragraph's first-word start to measured
   speech onset. Improves what production already serves, and makes the acoustic
   gate measure chapter quality rather than one constant offset.
3. **Then** spend GPU budget. With 1 and 2 unfixed, compute mostly buys
   rejections: 0 of the 5 highest-value chapters aligned today were publishable.
4. Decide a policy for non-English passages.
5. Route the 11 truncated chapters to repair; re-screen the queue with
   `duration_screen.py` before each batch.

## One thing to settle

**`crito/original-en` ch1–ch3 are published and fail the acoustic probe at
28/30.** Byte comparison shows the published sidecars are near-identical to the
candidates produced here — same pipeline, minor nondeterminism — so either the
acoustic gate is not being applied before publication, or it passed on a
different candidate. That gate is what separates "a file is present" from "the
highlighting is right", so the discrepancy is worth resolving.

## What this session did not do

No threshold lowered. No check disabled or reinterpreted. No timestamp or
confidence value invented. No recording regenerated. Nothing published. $0 of
GPU spend, with the $24 envelope intact.
