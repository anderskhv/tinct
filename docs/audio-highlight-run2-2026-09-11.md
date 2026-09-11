# Audio word highlighting — GPU run 2

September 11, 2026. Execution owner: a Claude cloud session on branch
`claude/audio-highlight-run-2-h6zoju`, spawned from the run-2 brief
(`docs/audio-highlight-run2-brief-2026-09-11.md`). This file is the running
report; it is rewritten at every push. Evidence lives in
`artifacts/audio-highlight-run2-2026-09-11/`.

## Status at this push — in progress

Part A (tokenizer normalisation, `pinned_words_sidecar_lib_v2.py`) was
already merged to `main` via PR #39 before this session started; pulled in
by fast-forward merge. Nothing else needed there.

### Two pre-existing bugs fixed before any pod launch

1. **`pod_job.py` never fetched the v2 helper.** `trial.py` imports
   `pinned_words_sidecar_lib_v2` unconditionally (default helper is v2 since
   the Part A merge), but `ALIGNER_FILES` in `pod_job.py` only listed the v1
   file. Every pod would have failed at import before doing any work. Fixed
   by adding the v2 file to the fetch list; aligner unit tests unaffected
   (34 pass).
2. **`runpod_guard.py`'s envelope estimate counted EXITED pods' stale
   timestamp age as running cost.** The account carries nine old
   `tinct-*` pods, retained (not deleted) per the standing mandate, each
   EXITED but with `uptimeSeconds` still falling back to days-old
   `lastStartedAt` ages. The guard's spend estimate summed any owned pod
   with `uptimeSeconds > 0`, so with those nine present it read the
   envelope as **\$259.68 of \$25 with nothing running** — the exact
   failure mode run 1's report documented for `main`'s guard killing pods
   16/17. Fixed to only count `RUNNING` pods; live check after the fix
   reads \$0.00. Added a regression test
   (`test_exited_pods_never_inflate_the_envelope`); guard suite (19 tests)
   passes.

Both fixes pushed before the first pod (`e03ff5426`, `4508acab1`).

### Round 1 — the 65 run-1 chapters that waited on the Part A decision

Source: `artifacts/audio-highlight-run1-2026-09-11/run2-queue.json`'s 71
chapters, minus the 4 with a missing paragraph recording (repair queue, run
3) and Phaedo ch1/ch7 (spelled-out-speaker audio defect, run 3
re-recording) = **65 chapters, 28.4 audio hours**, batched into 4 pods by
paragraph count (`round1-batch-1..4.json`).

- **`tinct-words-run2-1`** — failed at setup: zero CUDA devices reported to
  ctranslate2 (RTX 4090 host), the same bad-host class run 1's report
  documented. Terminated cleanly, uptime 5.1m, est \$0.03. Not a code
  defect — model hash matched the pin and the v2 fetch fix worked; retried
  as pod 2.
- **`tinct-words-run2-2`** — retried batch 1 (the-republic ch1/ch3/ch5).
  Exited externally by the provider at 18.4 min (infra reclaim, not our
  guard — it was well within every limit at its last check 4 min earlier).
  Recovered from the last snapshot: **the-republic/original-en ch1**
  completed both arms — **rejected**, same paragraphs as run 1
  (p11/33/84/142/145/166/173/177/288/382/441 on `off`; p33 on `auto`).
  Inspected p11: the recogniser heard "Glocken" for "Glaucon" — a genuine
  ASR misrecognition, not markup the v2 helper touches. Needs
  re-recording, not requeued. ch3 was mid-chapter (off arm) when the pod
  died; ch5 never started. Both requeued.
- **`tinct-words-run2-3`**, **`tinct-words-run2-4`** — RunPod returned
  "no instances currently available" on pod creation for both (transient
  capacity, not a guard or code issue). Retried immediately.
- **`tinct-words-run2-5`**, **`tinct-words-run2-6`** — created successfully,
  in progress at this push (cohort download / aligning).

### Round 2 — the rest of the Priority-1 processing queue

Built from `artifacts/audio-highlight-queue-2026-09-11/p1-processing-queue.json`
(2,181 entries) against the fresh production census
(`artifacts/audio-highlight-run2-2026-09-11/census/`, 200 English editions,
6,574 chapters already timed, 4,648 missing): English only, `bible/*` and
the mandate exclusions (`magna-carta`, `faust-part-1`, `as-you-like-it`,
`henry-iv-part-2`, `taming-of-the-shrew`) dropped, repair-queue and round-1
chapters excluded, already-published chapters dropped. **1,860 candidate
chapters, 390 audio hours**, ordered editions closest to complete first
(covered/total chapter fraction from the census), batched sequentially into
54 batches by the same paragraph-count budget as round 1
(`round2-candidates.json`, `round2-batches/`).

At run 1's measured rate (\$2.48 for 93 audio hours), round 2's 390 hours
projects to roughly \$10–11 — inside the \$20 envelope alongside round 1 —
but 54 batches will not all launch and land inside one session at the
44-minute-per-pod / ~4-5-pods-in-parallel pace this run is using. This run
will process as much of the ordered queue as the envelope and session allow
and hand off whatever remains as a run-3 list, same as run 1 handed off to
run 2.

### Guard and spend

`runpod_guard.py enforce --apply --budget 20 --spent <finished-pod-\$>`
every 5 minutes via `guard-loop-run2.sh`, envelope reading correctly since
the fix (owned pods reported, nothing over the \$0.20–0.34/hr rate ceiling
or the 50-minute deadline at any check so far). Spend so far: pod 1 \$0.03 +
pod 2 \$0.06 = **\$0.09 of \$20** from finished pods; pods 5/6 still
running.

### Published and verified — 0 chapters so far

Nothing has completed both arms of alignment and validated yet this push.

### Next

- Land pods 5/6, publish whatever validates, requeue whatever the pods lose
  to the host again.
- Work through the round-1 remainder (the-republic ch3, ch5) and the
  remaining round-1 batches.
- Launch round-2 batches in the completion-priority order already built,
  publishing and re-committing evidence after each landed pod, until the
  envelope or session time is exhausted.
- Close with pods stopped/terminated, spend accounted, editions completed
  listed, and a run-3 list of whatever round-2 batches remain unprocessed.
