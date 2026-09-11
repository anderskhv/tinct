# "Ready" promised more than it could deliver

September 11, 2026, evening. A correction to the Priority-1 queue figures, and
to how I characterised two execution sessions.

## What happened

`audio_readiness.py` classified 2,181 Priority-1 chapters as alignable today.
Nineteen of them were pulled out as the highest-leverage batch: they would
complete thirteen editions, and every one was marked `ready`.

Two execution sessions were given that list with an explicit "publish these,
nothing else" mandate. Neither published. Both stopped to investigate alignment
quality instead — the first into token granularity and onset bias, the second
into int8 versus float32 precision. I read that as scope drift and said so.

I was wrong. When the second session finally reported concrete numbers for the
nineteen:

| Outcome | Chapters |
| --- | ---: |
| Aligned and staged for publication | 5 |
| **Failed the 0.85 paragraph threshold** | **10** |
| **Recordings unreachable** | **4** |

Only **5 of 19** — 26% — actually produced an acceptable sidecar.

## Both failure modes were mine, not theirs

**The audio gaps were a sampling flaw.** `audio_readiness.py` checked the
first, middle and last paragraph recording of each chapter. An independent full
check of all nineteen confirms four have genuine gaps:

- `confessions/original-en` ch2 — 1 of 18 paragraph recordings missing
- `descartes-meditations/original-en` ch6 — 1 of 39
- `peloponnesian-war/original-en` ch16 — 1 of 82
- `peloponnesian-war/original-en` ch24 — 2 of 52

One missing paragraph in the middle of eighty-two falls neatly between three
samples. The tool now checks every paragraph by default; `--samples N` restores
the cheap path only as a deliberate choice.

**The threshold failures were a category error.** `ready` was only ever
evidence that a chapter is *worth attempting*: its manifest paragraph count
matches the published edition and its recordings exist. It was never evidence
that alignment would clear 0.85. I treated the two as the same thing and handed
over a list labelled in a way that implied a guarantee it could not make.

## What this does to the estimate

If the nineteen are representative, roughly **a quarter** of the 2,181
"alignable" Priority-1 chapters will publish on a first pass. The rest divide
into recordings with gaps too small for a sample to catch, and audio that is
present and correct but which the aligner cannot match to the text well enough
at the acceptance bar we refuse to lower.

That is not a reason to lower it. It is a reason to stop quoting 2,181 as
though it were a queue of near-certain work. Until a larger batch is measured,
the honest figure is: **2,181 attemptable, an unknown majority of which will
need either a repaired recording or a better alignment pass.**

## The process lesson

Two independent sessions, separately scoped, both declined to publish and both
went looking at alignment quality. That agreement was data. I overrode it four
times before asking what they had actually found — and the answer took one
question. Where an agent doing the work keeps stopping at the same place, the
stop is worth investigating before the instruction is repeated louder.
