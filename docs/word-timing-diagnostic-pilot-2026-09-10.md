# Word-timing diagnostic and alignment pilot — September 10, 2026

Status: local diagnosis and no-upload trial tooling complete; see dated execution
section below. No paid compute, regeneration or publication authorized.
Source: September 10 recovery handoff from Review Grokbot recovery task.

## What the consolidated evidence establishes

The retained missing baseline is 4,253 chapters after the 108 recovered uploads.
Of these, 3,908 have historical failure records and 345 have no terminal event
in the recovered runs. Fresh authenticated checks confirm all 345 still lack
sidecars: 310 in eight requested original editions absent from the runs, and
35 in three editions omitted from the supplied launch commands. This is not a
fresh whole-corpus count. Why the executed targets differed remains unknown;
recovered launch scripts are unavailable. The supplied generator preserves
explicit edition arguments; it does not automatically substitute modern English.

The 3,908 unique historical failures comprise 3,755 alignment-only, 119 HTTP 404,
18 network-only, 11 paragraph-coverage, three invalid-audio, and two with differing
alignment/network outcomes across pods. The two mixed histories are preserved:
Werther modern ch84 and Antony and Cleopatra modern ch7. Counts never sum retry
attempts or duplicate cross-pod keys as new chapters.

## Bounded sample

32 exact chapter targets, selected to distinguish causes rather than estimate
corpus-wide success. This purposive sample is not a statistically representative
random prevalence estimate. It includes name-heavy scripture, long and short
prose, verse, drama, philosophical dialogue, original/modern editions, near-gate
failures and severe Montaigne failures. Machine-readable source:
`output/audio-recovery-publication-2026-09-09/diagnostic-pilot-sample.json`.

| Group | Exact targets |
| --- | --- |
| alignment | `bible/web-en/ch5`, `bible/modern-en/ch10`, `essays-montaigne/original-en/ch1`, `essays-montaigne/original-en/ch2`, `iliad/original-en/ch3`, `iliad/original-en/ch2`, `hamlet/original-en/ch1`, `war-and-peace/modern-en/ch4`, `the-republic/original-en/ch1`, `macbeth/original-en/ch1`, `divine-comedy/original-en/ch1`, `crime-and-punishment/original-en/ch1` |
| historical_http404 | `bible/web-en/ch19`, `crime-and-punishment/modern-en/ch9`, `great-expectations/original-en/ch15`, `divine-comedy/modern-en/ch23` |
| invalid_audio | `essays-montaigne/original-en/ch104`, `ulysses/modern-en/ch17` |
| network | `hume-enquiry/original-en/ch18`, `the-awakening/modern-en/ch22` |
| paragraph_coverage | `jerusalem/original-en/ch10`, `niels-lyhne/original-en/ch1` |
| uncovered | `beowulf/original-en/ch1`, `candide/original-en/ch1`, `werther/original-en/ch1`, `poetics/original-en/ch1`, `the-art-of-war/original-en/ch1`, `phaedo/original-en/ch1` |
| control | `democracy-in-america/modern-en/ch46`, `social-contract/original-en/ch37`, `war-and-peace/modern-en/ch1`, `iliad/original-en/ch1` |

## Read-only preflight already completed

All 32 manifests respond. Of 2,218 manifest-listed audio objects, 2,214 respond
200 and four respond 404. Two of those 200 objects are zero bytes and fail both
ffprobe and full ffmpeg decoding; HTTP presence alone is insufficient.

Missing now:
- Bible WEB ch19 / p3.mp3
- Crime and Punishment modern ch9 / p6.mp3
- Great Expectations original ch15 / p89.mp3
- Divine Comedy modern ch23 / p6.mp3

Broken now (zero-byte objects):
- Essays Montaigne original ch104 / p96.mp3
- Ulysses modern ch17 / p653.mp3

All four control sidecars respond 200; the other 28 sample sidecars return 404.
A control's presence is not acoustic certification. The 32 manifests declare
10.03 hours of audio in total; this includes the long invalid Ulysses chapter.
The proposed paired alignment cohort (12 alignment chapters + four controls)
contains 4.33 hours, based on manifest durations. No whole Ulysses rerun is needed
to diagnose its broken paragraph.

## Diagnosis before alignment

1. Fetch and hash exact shipping text, manifest and relevant audio bytes; decode
   audio and check duration against the manifest. Preserve paragraph identity.
   Missing/empty/broken MP3s go to an audio-repair queue, requiring separate
   regeneration approval. Do not repeatedly align nonexistent speech.
2. For the 12 alignment chapters, inspect audible opening/middle/end samples and
   logged failing paragraphs against the exact edition. Especially investigate
   Montaigne's 0–16% cases before assuming recognition quality. Label matching
   narration, wrong edition/text revision, omitted/extra speech, or unresolved.
   No text–narration mismatch has yet been acoustically established by this audit.
3. For network failures, capture transport status and retries separately from
   alignment. For missing paragraph entries, compare text/manifest paragraph maps,
   empty paragraphs and cleaning behavior; preserve evidence before changing any
   normalization. The six uncovered chapters exercise manifest/target selection
   and may be proposed separately as clean first-pass targets.
4. Produce the diagnosis ledger before spending on alignment. A mismatch goes to
   source/audio investigation; do not force biased recognition to fit wrong speech.

## Proposed paired alignment experiment (requires later compute approval)

Run the 12 eligible matching-audio chapters and four controls with the same
pinned small.en model, generator/helper revision, normalization and audio:
A = bias-text off, B = existing bias-text option on. Do not change both model
and cleaning rules during this first comparison. Substitute no targets silently;
if a chapter is mismatched, record exclusion and retain its diagnostic evidence.

Before running, add diagnostic output retention on both pass and fail: raw ASR
text/timestamps, cleaned tokens, alignment matches, observed/interpolated flags,
per-paragraph numerator/denominator, unresolved gaps, candidate timings and
rejection reason. The current failed-result path discards this evidence. Keep
all trial outputs outside public audio paths, including results over the gate.
No automatic upload and no weakening of the >=85% per-paragraph gate.

Retain exact command, code/model revisions, dependency versions, hardware,
source/manifest/audio hashes, timestamps, logs, retry IDs and unique chapter key.
Store raw and derived artifacts with a run manifest; a candidate must be
reproducible from this evidence. Do not count retries as additional coverage.

## Success and stop criteria

- Every accepted chapter passes existing identity/token/paragraph coverage,
  monotonicity, duration and >=85% observed-alignment checks for every paragraph.
- Review audible first/middle/last excerpts plus logged weak regions. Record at
  least 30 independently judged word anchors per candidate across those regions.
  Proposed pilot timing criterion: >=95% within 300 ms and no unexplained error
  over one second. These are proposed acceptance tolerances, not measured results.
- Reject invented words, wrong narration, or biased transcription that raises the
  text-match score without improving audible timing. Compare control accuracy;
  a control regression blocks blanket adoption of that setting.
- A useful pilot identifies a reproducible cause/repair for each sample and
  demonstrates at least one repeatable improvement in an alignment stratum,
  without control regression. Report rescued / attempted / excluded by stratum;
  zero rescues is a valid finding and stops expansion, not a reason to lower gates.
- Verify accepted candidates in the reader against real playback before a
  separately authorized publication. Sampled accuracy is not whole-book proof.

## Runtime and cost measurement

Measure startup/model download, audio download, decode, ASR, alignment and
validation separately. Report warm/cold real-time factor (wall seconds divided
by audio seconds), peak memory, retries, successful chapter rate, paid GPU time
and actual provider billing. Log local review time separately. Two complete
cohort passes represent at most 8.66 manifest-audio-hours of processing input;
that is not a GPU-hour or cost estimate.

Before paid work, verify the actual hourly rate and approve a hard spend/time
cap; propose an initial maximum of 60 paid GPU minutes, with automatic stop at
that cap and no unapproved continuation. Record actual charge including startup
and storage separately. Use measured throughput and success by stratum to size
any subsequent batch; do not promise a full-corpus finish date from this sample.

## Evidence and current limits

Preflight files: `diagnostic-pilot-preflight.json`, `diagnostic-pilot-sample.json`,
`pilot-manifests/`, `invalid-audio-current-check.json`, `diagnostic-audio/`,
`all-pod-target-differences.json`, `remaining-uncovered-keys.json`, and
`consolidated-missing-reconciliation.json`, under
`output/audio-recovery-publication-2026-09-09/`.

No volume or pod was changed. All four shards are reportedly stopped; this audit
has no fresh console/billing observation. Twin7fq3rxwizujyz7 and
grieving_coffee_cod were untouched.

## September 10 local diagnostic execution (supersedes proposal-only status)

Authorized by Review Grokbot recovery task for local diagnostic/tooling work only.
No paid compute, audio regeneration or production publication took place.
The earlier statement that no ASR had run is superseded only by the four small,
local cached-model probes below; the paired GPU trial has not run.

Fresh live edition JSON, R2 manifests, hashes and per-attempt results are retained
in `output/word-timing-diagnostic-pilot-2026-09-10/diagnosis-ledger.json`.
All 32 targets inspected. Of 103 opening/middle/end/problem paragraph samples,
97 decoded fully, four remained 404 and two remained zero bytes. Healthy sample
durations differ from manifests by at most 0.071 seconds. This verifies transport
and decoding, not narration identity or word timing.

### Concrete findings

- **Montaigne numbering mismatch:** ch1 has 7 text paragraphs / 8 audio entries;
  ch2 has 22 / 23, and ch104 has 123 / 124. Local cached Whisper base CPU probes
  heard ch1 p0 as its title and ch2 p0 as “of sorrow.” Ch1 p3 produced a transcript
  matching source paragraph 2 at 0.957 normalized token sequence similarity.
  Ch2 p11 produced a rough Italian transcription corresponding to paragraph 10,
  while paragraph 11 is its English translation. These machine acoustic results,
  the extra entry and very short p0 durations strongly support a title included
  in paragraph numbering. They do not certify an automatic whole-book shift.
  Exclude ch1/ch2 from bias experiments; audit the complete mapping before repair.
- **Coverage failures have a concrete cause:** Jerusalem ch10 missing source p2
  is `***`; Niels Lyhne ch1 missing p10 is `* * *`. These nonempty decorative
  separators have no audio entry. Existing validator demands them as spoken
  paragraphs. Do not manufacture observed words or lower the 85% gate. A narrow
  explicit non-spoken-separator policy needs coordinated generator/validator/
  reader regression work; it is not silently applied in this pilot.
- **Transport:** four previously reported 404 audio objects remain absent; two
  invalid objects remain zero bytes. Put these in the separate audio repair queue.
  Sampled Hume and Awakening GET/decode now pass; their old no-route/timeout errors
  were not reproduced. This does not establish why the original network failed.
- Six uncovered targets have consistent paragraph maps and healthy sampled audio;
  remain clean first-pass candidates, not extra trial targets.
- All other alignment and control narration identity remains **unresolved**.
  No independent human listening or 30-anchor timing review is claimed. The local
  ASR probe is clearly labeled machine evidence, not ground truth.

### Prepared trial and tooling

`app/tts/diagnostic_pilot/` is isolated from the dirty generator files. The exact
f5b23de7 helper is vendored unchanged. The runner preserves raw segments/words,
request bias, normalized match opcodes, observed/interpolated provenance, gaps,
per-paragraph ratios, candidate outputs and rejection reasons. It records input,
audio, model/code hashes, dependency versions, GPU information and ASR/alignment/
model-load timing. All returned retries are retained. Outputs never upload;
passing files still require acoustic review. Per-paragraph >=85% gate preserved.

Eight focused tests pass: gate boundary, interpolation provenance, raw extra
speech, rejected-candidate retention, bias retries, transcriber errors, no-upload
chapter rejection, and exact helper pin. Python compile and shell syntax checks
pass. No actual faster-whisper/GPU runtime claim: that dependency is unavailable
in the local environment. No app build/deploy is required for these isolated tools.

Complete eligible input cohort: **14 chapters, 965 decoded MP3s, 3.975 audio hours**
(10 alignment + four controls). Both mismatched Montaigne chapters are explicitly
excluded. `cohort.json` has portable relative paths and SHA256s; all complete maps
and input bytes are validated by the runner. The actual auto-bias cascade may
perform several recognition attempts, so 7.95 hours is only two-pass input volume,
not an upper bound on repeated ASR work or GPU time.

Exact later command is in `app/tts/diagnostic_pilot/README.md` and
`run-approved-trial.sh`. Model pinned to Systran/faster-whisper-small.en revision
`d1d751a5f8271d482d14ca55d9e2deeebbae577f`; inference versions pinned to
faster-whisper 1.2.1 / CTranslate2 4.6.0. These are a reproducible trial environment,
not a claim to recover the exact prior pod environment. Both arms share it.
[Upstream releases](https://github.com/SYSTRAN/faster-whisper/releases).

### The one approval required before paid execution

Approve one diagnostic GPU session, **maximum $1 total and 60 paid minutes**, with
no regeneration or publication. Select a live quote at <=$0.60/hour, reserve the
balance for storage/overhead, and decline if the all-in cap cannot be enforced.
The [provider's GPU listing](https://www.runpod.io/gpu-models/rtx-3090) is not an
account-specific quote; verify the chosen offer before provisioning. No new
wallet top-up or existing-volume deletion is included.

Before launch, configure and verify external pod termination by 60 paid minutes.
The runner kills its process group at 45 minutes, leaving startup/export margin;
**this does not terminate a pod or stop billing**. The wrapper refuses to proceed
without explicit approval/deadline flags, but flags alone are not proof of a
working provider deadline. Keep downloaded evidence outside production. Report
partial completion honestly if the cap is reached. The trial can diagnose the
remaining identity/recognition questions; no candidate may publish without the
planned independent acoustic checks.

## Subsequent execution authorization

September 10: Anders approved the broader completion plan through task
`01a08a6c-7502-7262-b6c4-af1778cecd05`, including a $25 total envelope and
at most 60 paid GPU minutes for the first trial. This supersedes the approval
request above. Local pinned faster-whisper CPU canary preparation is underway;
no paid instance started. See the audio-highlight completion plan for scope.
