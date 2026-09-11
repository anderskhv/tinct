# Calibrating the ported acoustic probe against an accepted chapter

September 11, 2026.

Two freshly aligned chapters — `magna-carta/original-en` ch1 and
`crito/original-en` ch1 — both scored **exactly 28 of 30** anchors within
300 ms. The same number Anders recorded from the Mac run of Magna Carta. Three
identical scores across unrelated texts looks like a property of the measurement
rather than of the chapters, and acting on a broken gate would be worse than
having no gate: it would either block everything or wave everything through.

The failures also concentrated positionally. In `crito` ch1, anchors at word
index 0–2 of a paragraph disagreed at **13.3%** (8 of 60) against **0.8%**
(2 of 244) past word 10 — exactly where leading silence is attributed and where
a word the recogniser missed gets interpolated.

So before treating either verdict as real, the probe was run against a chapter
that **is already accepted and live in production**: `macbeth/original-en` ch1,
the published canary whose bytes the handoff verified. Its published
`words.json` was fetched from production and fed to the probe as the candidate,
unchanged.

## Result: the probe passes the accepted chapter

| | macbeth ch1 (published) | magna-carta ch1 | crito ch1 |
| --- | --- | --- | --- |
| selected anchors within 300 ms | **30/30** | 28/30 | 28/30 |
| max selected delta | **0.240 s** | 0.520 s | 0.560 s |
| `criterion_met` | **true** | false | false |
| full population within 300 ms | 97.40% | 97.41% | 97.29% |
| **full population over 1 s** | **0** | **2** | **1** |
| full population max | **0.310 s** | 1.530 s | 1.560 s |

The probe is calibrated and discriminating. **28/30 is a real failure.** The two
held chapters fail on their merits.

## What actually separates pass from fail

Not the 300 ms rate — all three sit at about 97%. It is the **outlier tail**.
The accepted chapter's worst anchor in its entire population is 0.310 s; both
failures carry second-scale displacements, and both are at paragraph openings:

| chapter | anchor | candidate | probe | delta |
| --- | --- | --- | --- | --- |
| crito ch1 | p6 w0 `Socrates.` | 1.56 – 1.64 | 0.00 – 0.98 | 1.560 s |
| magna-carta ch1 | p45 w1 `People` | — | — | 1.530 s |

`crito` p6 is instructive: the candidate places the speaker label `Socrates.` at
1.56 s with an 0.08 s duration, while the independent model hears speech from
0.00 s. A four-syllable word cannot occupy 80 ms. The candidate did not observe
that word and interpolated it, and the interpolation landed in the wrong place.

## A correction worth recording

Degenerate timestamps are **not** by themselves evidence of a bad chapter. The
accepted, published Macbeth sidecar contains them too — `p10 w8 "Hover"` is
`[3.27, 3.27]`, a zero-duration word, and `p1 w11 "or"` spans 0.02 s. An earlier
reading of `crito`'s zero-duration `"Yes;"` as a disqualifying defect was
overstated. What distinguishes the failures is **displacement**, not duration.

## Consequence for the gate

The gate stands as it is, unchanged: 30 anchors, 95% within 300 ms, none over
1 second. It was not lowered, widened, or reinterpreted to admit anything. It
passes a chapter that a human already accepted and rejects two that carry
second-scale displacement, which is what it exists to do.

## Files

| file | what |
| --- | --- |
| `macbeth-ch1-published-probe.json` | probe output for the accepted, published chapter |
| `crito-ch1-probe.json` | probe output for the newly aligned chapters |
