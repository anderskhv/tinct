# Priority-1 word-timing queue, and two normalisation classes that block it

September 11, 2026. Measured from a Claude cloud session against
**https://tinct.app**, with no access to any local machine.

Everything here is read-only evidence. Nothing was published to production in
producing it, and no GPU was launched — see "What blocked GPU work" below.

## Priority order, established not assumed

`classify_editions.py` on the registry: **101 non-AI** English editions (94 with
a translator/year recorded, 7 public-domain texts whose provenance the registry
does not document) and **100 AI-created** `Modern English` editions. This
matches the figure the handoff carried.

Missing timings split by that provenance:

| | chapters | editions | audio hours |
| --- | --- | --- | --- |
| Priority 1 — non-AI | 2,423 | 95 | 567.7 |
| Priority 2 — AI-created | 2,441 | 93 | 535.8 |

## The readiness split: the queue is cleaner than assumed

The brief's expectation was that much of the ~4,850 missing-timing count is
repair work rather than processable work. For the Priority-1 editions closest to
complete, that is **not** what the data says. `audio_readiness.py` over the 214
chapters belonging to the 37 Priority-1 editions within ten chapters of
complete:

- **213 ready** (109.1 audio hours)
- **1 repair** — `aristotle-politics/original-en` ch6, `p26.mp3` returns HTTP 404

So 99.5% of the near-complete Priority-1 queue is alignable today. Repair is a
real class but it is not what stands between Tinct and finished editions here.

Sampling caveat, carried from the tool: readiness samples the first, middle and
last spoken paragraph per chapter. It catches a chapter whose recordings never
landed; it does not prove every paragraph of every chapter is sound.

## What finishing looks like

`p1-finish-queue.json` — **36 Priority-1 editions can be taken to complete**
using only chapters the splitter called ready: **206 chapters, 101.2 audio
hours**. Ordered cheapest first, it starts with editions that finish for almost
nothing:

| audio | chapters | edition | becomes |
| --- | --- | --- | --- |
| 0.44h | 1 | `magna-carta/original-en` | 1/1 complete |
| 0.49h | 3 | `crito/original-en` | 3/3 complete |
| 0.73h | 2 | `communist-manifesto/original-en` | 5/5 complete |
| 0.85h | 3 | `frederick-douglass/original-en` | 12/12 complete |
| 0.91h | 4 | `us-founding-documents/original-en` | 4/4 complete |
| 0.94h | 2 | `meditations/original-en` | 12/12 complete |

Magna Carta is the single highest-value chapter in the Priority-1 set: its
edition has exactly one chapter, so one alignment completes an edition.

## The measured CPU canary

`cpu-canary/` is the full evidence for `frankenstein/original-en` ch3 (9
paragraphs, 110 seconds of audio) run through the recovered `trial.py`
**unmodified**, `--device cpu --compute-type int8 --arms off auto`.

The chain works end to end: cohort → aligner → candidate sidecar → sidecar
validation. `validation_errors` is empty for both arms.

**Throughput: 1.71× realtime on 4 vCPU at int8** — one audio hour costs 35
CPU-minutes per arm. The 101.2-hour finish queue is therefore ~59 CPU-hours for
one arm, ~118 for both. That is the number that justifies a GPU: this work is
not CPU-feasible at Tinct's scale, but individual cheap editions are.

Model pinned at tree SHA-256
`f1fe271c349229677131d389a96d0a28062a6a2c2fee54a8ce119c43538315c5`
(`Systran/faster-whisper-small.en`). **This pin is self-computed, not
inherited.** No model hash from the diagnostic pilot is recorded in any branch,
so this cannot be asserted to be the same bytes the acceptance results were
measured against. It is reproducible going forward; it is not provenance.

## Two normalisation classes, and why nothing was changed to get past them

The canary rejected its chapter. Both failing paragraphs had **perfect
recognition** — the ASR heard exactly the right words. Both failures are
expected-token artifacts:

**1. Markdown emphasis survives normalisation.** Paragraph 0 is
`_To Mrs. Saville, England._`. `normalize_token` is
`re.sub(r"[^\w]", "", token.lower())`, and `_` **is** a word character in Python
regex — so `_To` normalises to `_to` while the ASR's `to` normalises to `to`.
Two of four tokens mismatch on emphasis markers alone: ratio 0.50 against a 0.85
gate.

**2. Initials are one expected token but several heard ones.** Paragraph 8 is
the letter signature `R.W.`: one expected token `rw`, against heard `R` and
`-W`. Matched words 0, ratio 0.00.

Neither is an audio defect, a recognition defect, or a case for lowering the
gate. Kokoro plainly did not speak the underscores; the recording is right and
the text carries markup the aligner's tokenizer does not strip.

**Prevalence, measured** (`normalisation-scan.json`, class 1 across the 206-chapter
finish queue): 71 chapters contain at least one underscore-bearing token, and
**28 chapters would be rejected outright** — one failing paragraph rejects a
whole chapter in `trial.py`. That blocks **12 of the 36 completable editions**,
including `bacchae/original-en` (8 of 9 queued chapters) and
`frankenstein/original-en` (5).

**Nothing was changed.** The fix belongs in `normalize_token`/`clean_text`, both
inside `pinned_words_sidecar_lib.py` — the file held at the exact `f5b23de7`
revision the acceptance results were measured against. Editing it silently would
invalidate the provenance that makes the 0.85 gate meaningful, so this is
recorded as a decision for Anders rather than taken unilaterally:

> Strip Markdown emphasis markers from the expected-token side before canonical
> comparison. This does not lower the threshold and does not touch recognition
> output or timestamps — it stops comparing markup against speech. It does
> change the pinned helper's matching semantics, so the acceptance sample should
> be re-measured after it.

`p1-clean-queue.json` is the work that does **not** depend on that decision:
**24 editions, 126 chapters, 76.2 audio hours**, free of class 1.
`p1-blocked-queue.json` is the 12 editions that do.

## What blocked GPU work

`RUNPOD_API_KEY` is **not set** in this environment. `runpod_guard.py status`
reports it cannot see or stop any pod, and enumerates nothing — so the 08:55 UTC
"all 8 `tinct-*` pods EXITED" picture could not be re-confirmed from here, and a
running pod could neither be detected nor stopped.

No pod was launched. With no guard able to enforce the $1/hour ceiling, the
50-minute deadline or the $25 envelope, launching would have put unbounded spend
behind an unverifiable stop mechanism. **$0 was spent in producing any of this.**

Two further gaps were found and worked around rather than reported as blockers:

- **`cohort.py` cannot run in the cloud.** It imports its S3 client from
  `output/audio-recovery-publication-2026-09-09/recover.py` and reads the
  pilot's `diagnosis-ledger.json`; neither is in any branch, both are on the
  Mac. The aligner README's claim that the whole chain runs on any worker given
  R2 credentials does not hold for it. `aligner/cloud_cohort.py` was added to
  build the same cohort shape from the published read routes instead.
- **No `ffmpeg` binary**, and it could not be installed here. `cloud_cohort.py`
  decodes with PyAV instead, so no ffmpeg is needed. A recording that fails to
  decode drops the chapter with a reason rather than being guessed at.

R2 credentials are present, so publishing is not blocked.

## Files

| file | what |
| --- | --- |
| `provenance.json` | every English edition classified non-AI / AI-created, with the reason |
| `p1-missing-timings.json` | 2,423 Priority-1 chapters lacking timings |
| `p1-near-readiness.json` | readiness split over the 214 near-complete chapters |
| `p1-editions-by-closeness.json` | the 95 Priority-1 editions ranked by chapters remaining |
| `p1-finish-queue.json` | 36 editions completable from ready chapters |
| `p1-clean-queue.json` | the 24 of those unaffected by class 1 |
| `p1-blocked-queue.json` | the 12 that the normalisation decision gates |
| `normalisation-scan.json` | per-chapter underscore-token measurement |
| `cpu-canary/` | full canary evidence, both arms, with candidate sidecars |
