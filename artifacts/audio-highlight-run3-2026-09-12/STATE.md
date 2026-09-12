# Run-3 STATE

_Last written: 2026-09-12 13:20 UTC._

## Right now

**Nothing is running.** No pod, no dispatcher, no harvest daemon, no guard loop.
Part A (helper v3) is done, validated and pushed. Part B has not started.

## What a fresh session should do first

1. `python3 tools/audio-highlight/runpod_guard.py status` — confirm no
   `tinct-words-run3-*` pod is alive. If one is, harvest or terminate it before
   anything else.
2. Read `docs/audio-highlight-run3-2026-09-12.md` (Part A is complete there).
3. Part B: build the target list (below), dispatch, harvest, publish, push after
   **every** pod.

## Part A — done

Helper v3 (`tools/audio-highlight/aligner/pinned_words_sidecar_lib_v3.py`,
SHA-256 `302cbd02aad3e57bc91f277069855173b782162a35522eba85e664d14daa49ff`),
28 new unit tests, `PINS.md` updated, `trial.py --helper v3` (now the default).
Replay of all 210,214 recorded run-2 attempts: 1,887 paragraphs cross the gate
upward, **0** downward, 0 attempts match fewer words; 67 more chapters pass.
Macbeth CPU canary byte-identical to the v2 canary on both arms and the
published sidecar still verifies.

## Part B — not started

Targets, in order:
1. The 67 chapters the replay says now pass (`newly-passing-replay.json`) plus
   the rest of run 2's rejections, **editions closest to complete first**.
2. The 18 wave-2 batches never dispatched in run 2
   (`artifacts/audio-highlight-run2-2026-09-11/pending.json`: batches 78-95).

Limits: envelope US$20 total, $1.00/hr per pod, 50-minute wall clock, pods named
`tinct-words-run3-<n>`, no volumes, terminated after harvest,
`runpod_guard.py enforce --apply` every 5 minutes while any pod exists.

Skips, unchanged: already-published chapters, the 4 missing recordings, Phaedo's
spelled-out-speaker chapters, the repair queue, every `bible/*`, `magna-carta`,
`faust-part-1`, `as-you-like-it`, `henry-iv-part-2`, `taming-of-the-shrew`.
English only. Gate 0.85. Nothing synthesised.

## Spend

$0.00 of the $20 envelope. No pod has been created by this run.
