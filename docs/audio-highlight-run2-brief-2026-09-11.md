# Audio word-highlighting — GPU run 2 brief (2026-09-11)

The cloud session spawned for run 2 at 15:48 UTC never pushed. This is the brief a fresh
cloud session (with `RUNPOD_API_KEY`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
`R2_ENDPOINT` in its environment) should be started with. Part A may already be done on
`claude/audio-normalisation-20260911`; if so, merge that branch first and skip to Part B.

## Read first
`AGENTS.md`; `tools/audio-highlight/README.md`, `aligner/README.md`, `gpu/`; the run-1 report
`docs/audio-highlight-run1-2026-09-11.md` in full (batch sizing by paragraph count, host
failures, rejection classes); `artifacts/audio-highlight-run1-2026-09-11/run2-queue.json`;
`artifacts/audio-highlight-queue-2026-09-11/p1-processing-queue.json` and `p1-repair-queue.json`;
`DECISIONS.md` rows dated 2026-09-11 (Danish out; audio after translations; tokenizer
normalisation approved).

## Part A — normalisation fix (approved)
Strip never-spoken markup from expected tokens (underscore emphasis, `[28]` / `[Greek: …]`
footnote markers, spaced ellipses, double hyphens) and join recogniser-split hyphen
compounds for comparison; timings for a compound come from its pieces (first start, last
end). 0.85 threshold unchanged; nothing synthesised. Ship as a new pinned helper revision
(do not edit the verbatim `pinned_words_sidecar_lib.py`), with unit tests per class, and
re-run the CPU canary on `macbeth/original-en` ch1 and `frankenstein/original-en` ch3
(Macbeth's published sidecar must verify unchanged). Push Part A before any pod.

## Part B — the queue
Re-run the 67 run-1 chapters that waited on this decision, then the rest of the Priority-1
processing queue, editions closest to complete first. Skip: already published; the 4 missing
recordings and the Phaedo spelled-out-speaker chapters (run 3, re-recording); the repair
queue; every `bible/*` edition; `magna-carta`, `faust-part-1`, `as-you-like-it`,
`henry-iv-part-2`, `taming-of-the-shrew`. English only.

Envelope **US$20**, max $1.00/hr per pod, 50-minute wall-clock per pod, pods named
`tinct-words-run2-<n>`, no volumes, terminated after harvest, A4500-class hosts preferred.
In-session guard loop (`runpod_guard.py enforce --apply` every 5 minutes) while any pod
exists — the GitHub cron does not fire reliably — plus four-minute output snapshots. Batch by
paragraph count. Publish each verified chapter with `publish_timings.py` (create-never-replace;
production must serve the bytes back at the expected SHA-256; journal under
`artifacts/audio-highlight-run2-2026-09-11/`). Never end a turn with a pod running.

## Reporting
`docs/audio-highlight-run2-2026-09-11.md`, rewritten at every push: after Part A, after every
published batch, and at close (pods with times and $, chapters aligned / published+verified /
rejected with reason, editions completed, spend vs envelope, next, run-3 list). Never merge to
`main`; the coordinator merges.
