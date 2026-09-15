# The gate was measuring typography, not the reading

**2026-09-15.** Fixed in `7f00e3e3f`. This note records what was wrong, how it
was found, and which of my earlier conclusions it overturns.

## What was wrong

`normalize_token` in `aligner/pinned_words_sidecar_lib.py` stripped `[^\w]`.
`_` is a word character to Python's `re`, and Project Gutenberg wraps stage
directions and italics in underscores. So:

| edition token | normalized | Whisper heard | normalized |
|---|---|---|---|
| `[_Whispering._]` | `_whispering_` | `Whispering.` | `whispering` |
| `[_Exeunt._]` | `_exeunt_` | `Exeunt` | `exeunt` |
| `[_Whispers him._]` | `_whispers`, `him_` | `Whispers him.` | `whispers`, `him` |

The recordings are word-perfect. The comparison was failing on the markup, the
paragraph scored 0.0, and the whole chapter was rejected under the 0.85
per-paragraph gate.

Fix: `[\W_]` instead of `[^\w]`. One character. The gate itself is untouched.

## How it surfaced

Not by looking for it. Batch D's rejections had whole-chapter match ratios of
0.96–0.997 — chapters failing on one or two paragraphs out of a hundred. That
pattern is not what a bad recording looks like, so I classified every failing
paragraph across all five batches:

```
131 failing paragraphs
  80 (61%)  stage direction [_..._]
  29 (22%)  short text 4-10 words (footnote citations, asterisked translations)
  16 (12%)  ordinary prose/verse
   5 ( 4%)  very short text (<=3 words)
   1 ( 1%)  bracketed markup
```

Failing paragraphs had a median of **4 words** against **17** for all
paragraphs; 86% were under ten words against a 31% baseline. Then the
diagnostics for `julius-caesar` ch18 showed expected-vs-heard directly, and the
cause was unambiguous.

## What it recovers

Replaying the stored diagnostics offline through the corrected normalizer — no
re-transcription, no cost — flips **13 of the 46 rejected chapters**:

anna-karenina ch104 · antony-and-cleopatra ch19 · brothers-karamazov ch32 ·
coriolanus ch13 · cymbeline ch23 · merchant-of-venice ch7/ch8/ch14 ·
moby-dick ch81 · richard-iii ch24 · taming-of-the-shrew ch2 ·
twelfth-night ch9 · ulysses ch7

The larger effect is on what was never attempted. Plays carry a stage direction
every few lines, and stage directions are short, so one unmatched token in a
two-word paragraph is a 0.0:

```
              pass  fail   rate
verse drama      1    20     5%
prose           32    24    57%
```

**808 chapters across 23 verse-drama books** still lack timings. At a 5% pass
rate that corpus was closed. It is now worth running.

## What I got wrong, and should correct

I have been escalating a request to authorize regenerating ~35 defective
paragraph recordings, and I justified it partly on the gate failures — that the
residue "cannot be finished by aligning." For the gate-failure class that was
wrong. The audio was fine; the comparison was broken. Regenerating those
recordings would have cost money and changed nothing.

The genuinely broken-media class is separate and unaffected: 8 chapters whose
manifests name recordings production 404s on, including all six `bible/kjv-en`
chapters. That repair queue stands, in `blocked-missing-recordings.json`.

## What still fails, and why it is not this bug

33 chapters remain rejected after the fix. They are dominated by short
non-dialogue paragraphs where the per-paragraph gate is arithmetically severe —
a 4-word paragraph must be transcribed perfectly to clear 0.85, while a
100-word paragraph may miss 15 words:

- speaker labels — `Oswald. Ay, madam.` → 0.33
- footnote citations — `(1) Luke xxiv. 32.` → 0.75
- asterisked translations — `* A bastard.` → 0.67
- Bible verse superscripts — `¹⁶ These shall be...` → 0.84

These are real text/audio differences, not markup artifacts, so the gate is
correctly rejecting them. Whether a per-paragraph ratio is the right instrument
for a three-word paragraph is a separate question, and a gate question — it is
Anders's to decide, not mine to quietly adjust.

## Guardrails that held

- `test_exact_helper_pin` fired on the edit, which is what it is for. Re-armed
  at the new bytes with the reason recorded inline rather than deleted. Its git
  reference had gone stale independently: `app/tts/words_sidecar_lib.py` now
  holds an older lineage with no `canonical_alignment_token`.
- A control test keeps a genuine mishearing from the same chapter — "alarums"
  read as "alarms" — scoring 0.5 and failing. The fix recovers markup; it does
  not manufacture agreement.
- The in-flight tick had to be stopped and 73 diagnostics deleted. `trial.sha`
  reads the helper from disk at write time while the worker holds the old code
  in memory, so anything written after the edit carried the *new* signature with
  *old* scoring — cache entries a later resume would have trusted.

## Not fixed, deliberately

- `bias_hotwords` strips affixes with the same `[^\w]` idiom, so underscored
  proper names never become Whisper hotwords. That changes ASR input rather than
  scoring, and I have not measured it.
- `app/tts/words_sidecar_lib.py` carries the same underscore bug in its own copy
  of `normalize_token`.
