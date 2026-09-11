# Repair proposal for English editions whose audio cannot simply be aligned

September 11, 2026. Measured, not estimated: every figure below comes from
`tools/audio-highlight/audio_readiness.py` run against production over all
2,423 Priority-1 (non-AI) chapters that lack word timings.

## The shape of the problem

Of those 2,423 chapters:

| | chapters | audio hours |
| --- | ---: | ---: |
| **Processing queue** — alignable today | **2,181** | **497.6** |
| Repair queue — alignment cannot fix these | 242 | 64.2 |

So **90% of the Priority-1 backlog needs no repair at all**. Treating the
missing-timing count as the work queue overstates the blocked portion nearly
tenfold.

The 242 are concentrated in eleven editions:

| Edition | chapters | hours | causes |
| --- | ---: | ---: | --- |
| `essays-montaigne/original-en` | 107 | 48.9 | map |
| `merry-wives-of-windsor/original-en` | 39 | 2.1 | map 21, text 18 |
| `measure-for-measure/original-en` | 32 | 1.9 | map 17, text 15 |
| `faust-part-1/original-en` | 27 | 3.4 | map |
| `niels-lyhne/original-en` | 13 | 6.0 | audio |
| `bible/web-en` | 11 | 0.6 | audio |
| `bible/kjv-en` | 5 | 0.2 | audio |
| `war-and-peace/original-en` | 5 | 0.3 | audio 3, map 2 |
| `aristotle-politics`, `democracy-in-america`, `oedipus-rex` (`original-en`) | 3 | 0.8 | audio |

## Three classes, three very different costs

### 1. Missing or empty recordings — 35 chapters, 7.9 hours. Costs money.

A sampled paragraph recording is not served or is too small to be real, e.g.
`aristotle-politics/original-en` ch6 `p26.mp3` returns HTTP 404. Concentrated in
`niels-lyhne` (13) and the two Bible translations (16).

**Proposal:** regenerate only the defective paragraph recordings, against the
current edition text, with the existing approved voice and settings — then
remeasure the manifest and align normally. This is the only class that requires
new audio, and therefore the only one needing spending authorisation. It is
**not** authorised yet and no recording has been regenerated.

### 2. Paragraph-map defects — 174 chapters, 56.2 hours. Probably free, but not one fix.

The completion plan recorded that Montaigne chapters have "one extra manifest
paragraph", with a cached probe hearing the chapter title spoken as `p0`. That
holds — but only partly, and the plan was right to warn against a blanket
offset:

- **58 of 107 Montaigne chapters have offset exactly +1.** These match the
  documented title-as-paragraph case and are plausibly fixed by a manifest
  remap, with no new audio.
- **The remaining 49 are not offsets at all.** Their manifest-minus-edition
  differences scatter — `+671`, `-618`, `-143`, `+47`. That is a different
  chapter's audio, not a shifted one.
- `faust-part-1`, `merry-wives-of-windsor` and `measure-for-measure` show the
  same scatter, in both directions.

**Proposal:** treat the +1 Montaigne group as one candidate fix, verified
chapter by chapter against the audio before any manifest is touched, with the
previous manifest bytes saved. Treat the scattered group as class 3.

### 3. Chapter-division mismatch — 33 chapters plus the scattered map defects. Needs a decision, not a fix.

`repair:text` means production serves audio for a chapter the published edition
does not have: `measure-for-measure/original-en` ch18, for instance. Combined
with the two-directional scatter in the same plays, the likely explanation is
that the recordings were generated against a **different chapter division** of
the text — scenes against acts, or a different source edition — so chapter *N*
in audio is not chapter *N* in the reader.

This cannot be repaired by aligning or remapping, because there is no
correspondence to recover. It needs someone to decide which division is
authoritative. Re-chaptering published text would move every reader's saved
position, so the safer direction is almost certainly to re-cut or regenerate the
audio to match the text — which returns it to class 1 and its cost.

**Proposal:** do not touch these until that decision is made. They are 33
chapters and a fraction of an hour of audio; they are not worth risking reader
positions over, and they block only three editions.

## What happens meanwhile

Nothing here blocks the other 2,181 chapters. Work proceeds on those, by
provenance and by proximity to a finished edition. Editions carrying repair
chapters are marked `blocked-on-repair` in the checklist and are explicitly
**not** counted as complete — temporary exclusion is not completion.
