# `magna-carta/original-en` ch1 — held, with a diagnosed cause

September 11, 2026. This chapter passes every structural check and **fails the
independent acoustic probe**. It is not published, and it should not be
published until the cause below is fixed.

It matters more than one chapter normally would: this edition has exactly one
chapter, so aligning it completes an entire edition. That is also why it is
tempting to wave through, and why the evidence is recorded in full.

## What passes

`trial.py`, `--device cpu --compute-type int8 --arms off auto`, model pinned at
tree SHA-256 `f1fe271c…8315c5`.

| | |
| --- | --- |
| `auto` arm | **74/74 paragraphs at or above 0.85**, whole-chapter match 0.9854 of 4,525 words |
| `off` arm | rejected — p26 at 0.80 |
| sidecar validation | no errors, either arm |
| `publish_timings.py` dry run | **zero validation failures** against production truth |

The `off`/`auto` split is itself a finding: unbiased recognition failed p26 on
`wapentake` → "whap-and-take", `demesne` → "domain", `manors` → "manners".
Biasing scored that same paragraph **1.0**. For original-language texts the
biased arm is not optional.

## What fails

`cloud_probe.py` — the ported `independent_probe.py`, OpenAI Whisper `base` on
CPU, unprompted, against a candidate produced by `faster-whisper small.en`.

**28 of 30 selected anchors within 300 ms, max delta 0.520 s → criterion not
met** (95% required).

This independently reproduces the failure Anders recorded from the Mac run
(28/30, max 650 ms) — same anchor count, same verdict, comparable magnitude,
from a different container and a re-derived candidate. The port is faithful and
the problem is real.

## The cause, located

The two selected anchors that fail are start-side only, on short function words,
with ends agreeing to within 50 ms:

| anchor | candidate | probe | start Δ | end Δ |
| --- | --- | --- | --- | --- |
| p64 w37 `We` | 10.14 – 10.94 | 10.66 – 10.96 | 0.520 s | 0.02 s |
| p17 w1 `No` | 1.07 – 1.67 | 1.58 – 1.72 | 0.510 s | 0.05 s |

Across the **full population of 4,331 exact-match anchors** the chapter is much
better than the 30-anchor sample suggests — but it still fails, and for a
different reason:

| | |
| --- | --- |
| within 300 ms | 4,219 of 4,331 — **97.41%**, above the 95% bar |
| within 500 ms | 99.33% |
| **over 1 s** | **2 anchors** — the criterion allows none |
| median / mean / p95 | 0.060 s / 0.082 s / 0.190 s |

So the thin sample failed the percentage test by chance, while the full
population fails the absolute-limit test. Both verdicts are "hold".

The worst anchors cluster in one place:

| anchor | Δ |
| --- | --- |
| p45 w1 `People` | 1.530 s |
| p45 w0 `(44)` | 1.015 s |
| p45 w2 `who` | 0.810 s |
| p6 w0 `(5)` | 0.780 s |

Paragraph 45 opens `(44) People who…`. **`(44)` is one expected token** —
`canonical_alignment_token` sees `44`, finds it in the 21–99 range and returns
the compound `fortyfour` — **but the narrator speaks two words**, "forty" and
"four". One expected token cannot align to two heard ones, so the aligner
interpolates across the gap and displaces the opening words of the paragraph by
up to 1.5 seconds. p6's `(5)` is the same defect, smaller because a single digit
is one spoken word and only the bracket punctuation differs.

Magna Carta is a numbered charter: every clause begins this way, which is why a
chapter whose median anchor error is 60 ms still carries two second-scale
displacements.

## Why it is not corrected here

This is the **numeral variant of a tokenization-granularity class** already
documented in `../README.md`: one expected token against several heard ones.
The other two members are Markdown emphasis (`_To` normalising to `_to`, because
`_` is a word character in Python regex) and runs of initials (`R.W.` against
heard `R` and `-W`).

All three live in `canonical_alignment_token` / `normalize_token` /
`clean_text`, inside `pinned_words_sidecar_lib.py` — the file deliberately held
at the exact revision the acceptance results were measured against. Changing its
matching semantics is not a fix that can be made quietly in passing; it
invalidates the provenance that makes the 0.85 gate meaningful, and the
acceptance sample has to be re-measured afterwards.

So: no timestamp was invented, no confidence value was fabricated, no threshold
was lowered, no check was disabled, and the recording was **not** regenerated.
The recording is sound — `audio_readiness.py` classes it `ready`, and the probe's
own median of 60 ms across 4,331 anchors shows the audio and the text correspond
closely. The defect is in how the expected text is tokenised before comparison.

## What would clear it

Fix the tokenization-granularity class so a single expected token can align to
several heard words (or split such tokens before comparison), re-measure the
acceptance sample, re-run `trial.py` on this chapter, and re-run the probe. The
criterion stays 30 anchors, 95% within 300 ms, none over 1 second.

## Files

| file | what |
| --- | --- |
| `independent-probe.json` | full probe output: 4,331 anchors, the 30 selected, per-anchor deltas |
| `words.candidate.json` | the held candidate, `auto` arm — **not published** |
| `chapter.auto.json` / `chapter.off.json` | per-paragraph ratios for both arms |
| `structural-validation.json` | the `publish_timings.py` dry-run journal entry |
