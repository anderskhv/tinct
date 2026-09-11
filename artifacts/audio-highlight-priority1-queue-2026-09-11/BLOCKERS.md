# What is actually stopping Priority-1 from finishing

September 11, 2026, 15:00 UTC. Measured from a cloud container against
production. Every number here was derived here, not carried over.

The missing GPU is the loudest blocker but not the most important one. Two
defects in the comparison layer gate most of the queue, and a GPU would produce
candidates that hit exactly the same walls, faster.

## 1. Token granularity — one expected token, several spoken words

`chapter_words_from_text` splits the edition text on whitespace only, so a single
"word" can be something the narrator must speak as two or more. Alignment then
cannot match it and interpolates across the gap. Four instances, all the same
root cause:

| class | example | expected token | heard |
| --- | --- | --- | --- |
| digits | `(44) People who` | `fortyfour` | "forty", "four" |
| Markdown emphasis | `_To Mrs. Saville, England._` | `_to` | "to" |
| em-dash | `novels--moreover,` | `novelsmoreover` | "novels", "moreover" |
| initials | `R.W.` | `rw` | "R", "-W" |

The Markdown case is its own small surprise: `normalize_token` strips with
`[^\w]`, and `_` **is** a word character in Python regex, so emphasis markers
survive normalisation.

**Measured across the 206-chapter finish queue** (`granularity-scan.json`),
counting only paragraphs these tokens alone force under 0.85:

| | |
| --- | --- |
| chapters with at least one such paragraph | **41 of 206 — 19.9%** |
| editions affected | **17 of 36** |
| class frequency among failing paragraphs | digits 62, Markdown `_` 33, em-dash 8, initials 1 |

This is a floor, not a ceiling: combined with ordinary recognition error, more
chapters fall below the gate. One failing paragraph rejects a whole chapter in
`trial.py`.

Worst hit: `bacchae` and `frankenstein` (7 queued chapters each),
`hume-enquiry` (6), `medea` and `beyond-good-and-evil` (3 each).

## 2. A systematic first-word onset bias

Every chapter measured starts each paragraph's first word about 0.35–0.40 s
before the speech begins — **including chapters already live in production**.
Full evidence in `onset-bias/`. It dominates the acoustic probe, because each
30-anchor sample catches several paragraph openings each carrying a 0.3–0.5 s
error, which is why unrelated chapters keep scoring exactly 28/30.

## 3. Non-English passages

`fear-and-trembling/original-en` ch1 carries a long Latin quotation.
`small.en` is English-only and renders `tamen` as "tae men" and `a Deo` as
"adio" — 224 of 304 words matched, 0.737. `beyond-good-and-evil` ch5 has Italian
(`femmina e mala femmina`). No tokenizer fix helps; this needs either a
multilingual model for such passages or an explicit policy for them. Neither is
a decision to take in passing.

## 4. The processing queue is optimistic

`audio_readiness.py` samples the first, middle and last spoken paragraph per
chapter, which it documents. Building the batch-2 cohort — which fetches **every**
paragraph — **2 of 7 chapters classed `ready` turned out to have a missing
recording**:

| chapter | missing |
| --- | --- |
| `confessions/original-en` ch2 | `p10.mp3` → HTTP 404 |
| `descartes-meditations/original-en` ch6 | `p6.mp3` → HTTP 404 |

A 29% false-ready rate in a small sample. The 2,181-chapter processing queue
should be read as an upper bound. Both chapters went to repair; no recording was
regenerated.

## What production actually looks like

Checked directly, all 206 finish-queue chapters, 14:45 UTC:

| | |
| --- | --- |
| published | **120 of 206** |
| still missing | 86 |
| **editions complete** | **8** |

So publication is flowing — from another owner, not this session. Two
consequences worth naming:

- **`crito/original-en` ch1–ch3 are published and fail the acoustic probe**
  (28/30). Byte comparison shows the published sidecars are near-identical to
  the ones produced here — same pipeline, minor nondeterminism — so either the
  acoustic gate is not being applied before publication, or it passed on a
  different candidate. Worth settling, since it is the gate that distinguishes
  "a file is present" from "the highlighting is right".
- **The onset bias is in production at scale**, not just in the Macbeth canary.

`still-missing-1452utc.json` lists what remained unpublished at that moment.

## Recommended order

1. **Fix token granularity.** Split expected tokens on `--`, strip Markdown
   emphasis, and handle digit and initial runs so one expected token can align to
   several heard words. Unblocks ~20% of chapters and ~half the editions. Then
   re-measure the acceptance sample, because this changes the pinned helper.
2. **Fix the onset bias.** Clamp a paragraph's first-word start to measured
   speech onset. Improves what production already serves and makes the acoustic
   gate measure chapter quality instead of one constant offset.
3. **Then** buy GPU time. With 1 and 2 unfixed, compute mostly produces
   rejections.
4. Decide a policy for non-English passages.
5. Re-derive the processing queue with full-paragraph audio checks.

Nothing in this session lowered a threshold, disabled a check, invented a
timestamp or confidence value, regenerated a recording, or published anything.
