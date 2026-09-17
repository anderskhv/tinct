# The Manual first-half repair — 15 September 2026

Status: **bounded first-half candidate accepted by independent review**. Nothing
here is served, published, deployed, or approved for audio generation.

Anders authorized a bounded repair of sections 1–26 of the existing Modern
English edition. The locked source is Tinct's George Long English translation;
this pass does not establish fidelity to the underlying Greek. The source and
prior target hashes match the queue handoff:

- source: `app/public/data/editions/the-manual-original-en.json`, SHA-256
  `23835259e0a0d52214f7554e44b0adaf44c5ec5e8a356bd196d3ccb948dc803e`
- prior target: `app/public/data/editions/the-manual-modern-en.json`, SHA-256
  `2ac0db1347defd5bea73e993f4db672a37136f53bcf69423dab544de20040f35`
- staged candidate: `the-manual-modern-en.first-half-candidate.json`, SHA-256
  `c4a45bb09c061760c741aefdb62a1cbc72d28b80383d01ad7db7a6849f3e1f51`

## Result

All 27 paragraphs in sections 1–26 were compared with the source. Twelve were
repaired and fifteen retained. Sections 27–52 remain byte-equivalent at the
chapter-object level to the prior target and were outside this review.

Changed coordinates:

`1:1, 2:0, 4:0, 8:0, 10:0, 12:0, 14:0, 18:0, 21:0, 22:0, 24:0, 25:0`

The repairs address shared failure classes rather than only the three seed
examples: collapsed instructions and conditions, omitted example members,
softened historical slavery language, weakened theological or social claims,
lost argument terms, and opaque or awkward modern wording. Clear current prose
was retained where comparison found the source content intact.

`change-ledger.json` records every scoped paragraph, all source/prior/candidate
hashes, source-accounting notes, and exact audio impact. `candidate.diff` is the
review diff. `source-coverage-check.json` records shape and scope invariants.
`build_candidate.py` reproduces all artifacts and stops if either locked input
hash drifts.

## Verification and release boundary

The build verifies 52 source, target, and candidate sections; identical
paragraph shapes; 27/27 scoped accounting rows; and no second-half changes.
The author pass reread all twelve repairs beside the source and read the full
first-half candidate continuously. An independent reviewer then checked every
changed paragraph in context, twelve held-out retained sections, structure,
ledger identity and second-half equivalence, and accepted frozen candidate SHA
`c4a45bb09c061760c741aefdb62a1cbc72d28b80383d01ad7db7a6849f3e1f51`.
See `independent-review.md`.

All twelve changed coordinates are `audio_affected`. The current Modern English
audio and word timings cannot be described as matching those paragraphs after a
future text release. Editorial acceptance must precede any recording or timing
work. A coordinated text/audio/timing release remains separate from this pilot.
