# A systematic first-word onset bias, and what it means for the acoustic gate

September 11, 2026. Measured in a cloud container against production audio.

This is the most consequential finding of the session, and it is not about any
one chapter. **Every chapter measured — including the one already accepted and
live in production — starts each paragraph's first word roughly 0.35–0.40 s
before the speech actually begins.**

## How it surfaced

Three freshly aligned chapters all scored **exactly 28 of 30** anchors within
300 ms against the independent probe: `magna-carta/original-en` ch1 and
`crito/original-en` ch1, ch2 and ch3. Anders recorded the same 28/30 for Magna
Carta from the Mac. Identical scores across unrelated texts is a property of the
measurement, not of the texts.

Calibration ruled out a broken probe: the published, accepted
`macbeth/original-en` ch1 scores **30/30, max 0.240 s, criterion met** (see
`../probe-calibration/`). The probe works.

The failing anchors were almost all paragraph-opening words. In `crito` ch1,
anchors at word index 0–2 disagreed at **13.3%** against **0.8%** past word 10.

## Two wrong hypotheses, discarded on evidence

**"The words were interpolated, not heard."** Wrong. `crito` ch1 paragraph 0
records `source: observed`, `heard_index: 0` for `Socrates.`, and **all 14 words
in that paragraph are observed with none interpolated**. The timestamps are
genuine recognition output, not fabrications.

**"Zero-duration words mark a bad chapter."** Wrong. The accepted, published
Macbeth sidecar contains them too — `p10 w8 "Hover"` is `[3.27, 3.27]`. Duration
is not the signal.

## What is actually happening

Speech onset was measured directly from the audio — 10 ms RMS frames, first
frame within 25 dB of peak sustained over three frames — and compared against
the candidate's first-word start:

| chapter | paragraphs | onset − candidate start (median) | candidate starts early |
| --- | --- | --- | --- |
| `macbeth` ch1 — **published, passed** | 12 | **+0.390 s** | **12 of 12** |
| `magna-carta` ch1 — failed | 14 | **+0.375 s** | **14 of 14** |
| `crito` / `meditations` — failed | 14 | **+0.335 s** | 12 of 14 |

And the candidate's first-word starts do not vary with the audio at all:

| chapter | first-word start: min / median / max |
| --- | --- |
| `macbeth` | 0.050 / 0.080 / 0.080 |
| `magna-carta` | 0.000 / 0.050 / 0.140 |
| `crito` / `meditations` | 0.020 / 0.050 / 3.850 |

Measured speech onset in these same files is **0.39–0.46 s**. So the first word
of a paragraph is pinned near the start of its audio file regardless of when the
narrator actually begins, absorbing the leading silence into the word.

Worked example, `crito` ch1 p0:

| | start | end |
| --- | --- | --- |
| candidate (`faster-whisper small.en`) | 0.08 | 0.78 |
| independent probe (`whisper base`) | 0.64 | 1.00 |
| **measured speech onset** | **0.390** | — |

Neither model is right, but the probe is much closer, and the candidate is early
by 0.31 s on a word the reader sees highlighted first.

## Why this matters more than the failed chapters

1. **It is already in production.** The accepted Macbeth sidecar carries the same
   bias — 12 of 12 paragraph openings early by a median 0.390 s. Every published
   chapter highlights each paragraph's first word roughly four tenths of a second
   before it is spoken. Subtle, but it is the first word a reader's eye lands on.
2. **It dominates the acoustic gate.** Each chapter's 30-anchor sample contains
   several paragraph-opening anchors, each carrying a 0.3–0.5 s error. Whether a
   chapter passes therefore depends largely on how many of those land in the
   sample — which is why accepted and rejected chapters alike sit at ~97% within
   300 ms on their full populations, and why 28/30 recurs.
3. **Fixing it helps twice**: better highlighting in production, and an acoustic
   gate that discriminates real per-chapter quality instead of re-measuring one
   systematic offset.

## What was not done

No threshold was lowered. No check was disabled or reinterpreted. No timestamp
or confidence value was invented. No recording was regenerated. Nothing was
published. The two failing chapters stay held, and `magna-carta` ch1 stays held
for the separate clause-number reason in `../magna-carta-ch1-held/`.

The candidate's first-word start is set in the recognition request and sidecar
build — `vad_filter=True` and `lib.build_sidecar` in
`pinned_words_sidecar_lib.py`, the helper held at the revision acceptance was
measured against. Changing it alters published-timing semantics for every future
chapter and invalidates the acceptance provenance, so it is recorded here for a
decision rather than taken unilaterally.

## Suggested decision

Clamp a paragraph's first-word start to measured speech onset (or to the
independent model's start, whichever is later), then re-measure the acceptance
sample and re-probe. This is evidence-driven, not invention: the onset is
measurable from the recording, as above. It should move most of the Priority-1
queue from "fails the acoustic gate by sampling luck" to a genuine pass, and it
improves what production already serves.

Until that decision is made, the acoustic gate rejects most chapters for a
defect none of them individually owns.

## Files

| file | what |
| --- | --- |
| `probe-crito-meditations.json` | probe output for the newly aligned chapters |
| `../probe-calibration/` | the accepted-chapter calibration that validates the probe |
| `../magna-carta-ch1-held/` | the separate clause-number failure |
