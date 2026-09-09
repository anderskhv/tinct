# English word-sync readiness — 9 September 2026

## Decision

Do not declare the English corpus finished or lower the alignment gate. Continue using validated word timings where available. Existing sentence fallback uses the same timing estimates and is not evidence of accurate sentence-boundary anchors. Rejected chapters without saved timing output require recovery of retained alignment data or targeted alignment work.

## Recovery publication update

Later on September 9, all 107 pod 4 candidates plus one pod 1 candidate were
published with conditional no-overwrite writes. Three already-present pod 1
files were preserved. All 111 recovered files now serve exact validated bytes;
all 1,816 referenced audio objects responded, and chapter 46 word highlighting
was verified during live desktop/mobile browser playback. The full pod 1
ledger is reconciled. See the [publication report](audio-recovery-publication-2026-09-09.md).
The baseline-adjusted missing list is 4,253; this is not a fresh corpus audit.
The original audit and its historical observations follow unchanged.

## Production evidence

Read-only audit against tinct.app, using the catalogue and edition files from the shipping `Tinct-reader-stabilization` checkout (HEAD `76266466`). This is the 169 English editions marked for audio in public BOOKS, covering 96 books. It does not certify staged books, Danish, or unflagged editions. Both the main local inventory and shipping catalogue were inspected.

| Check | Result |
| --- | ---: |
| Chapter targets | 12,425 |
| Audio manifests responding | 12,425 |
| Timing sidecars responding | 8,064 (64.9%) |
| Missing timing sidecars | 4,361 (35.1%) |
| Request errors after retry | 0 |
| Editions with complete sidecar presence | 6 / 169 |
| Editions with no sidecars | 37 / 169 |

An audio manifest response does not certify every referenced MP3. Missing MP3s remain a separate investigation; these counts must not be described as complete audio-file verification.

Machine-readable chapter repair inventory: [coverage JSON](../output/word-sync-audit-2026-09-09.json).

Follow-up fetched all 4,361 manifests for chapters missing sidecars: zero contained inline word timings, with zero request errors. Thus inline manifest timings do not cover these gaps. [Inline timing audit](../output/word-sync-inline-audit-2026-09-09.json).

## Quality sample

Sampled the first, middle and last available sidecar chapter per edition, deduplicated: 356 chapters across 132 editions. All 356 passed the current validator against shipping edition text (paragraph coverage, exact cleaned token correspondence, timing structure and monotonic starts). No sampled paragraph carrying confidence metadata had an observed match ratio below 85%. Two sampled files, KJV chapters 1 and 1189, lacked paragraph confidence metadata. Presence and structural validation do not prove acoustic accuracy. This is a deterministic sample, not a full quality certification or a random statistical estimate.

[Sample results](../output/word-sync-quality-sample-2026-09-09.json).

## Reader and generator findings

- Live HTML serves `assets/index-7G18c3yZ.js`, matching the documented shipping release. The shipping history already contains sentence fallback (`08f47288`). No duplicate reader implementation was added.
- Sentence fallback expands the highlighted range using existing word timestamps when paragraph matchRatio is below its configured threshold. It does not independently realign a sentence to audio. Punctuation includes semicolons/colons; abbreviations are not specially protected.
- Files without confidence metadata currently retain word highlighting. That is compatibility behavior, not a quality certificate.
- The current local generator returns failure before saving `words.json` when any paragraph falls below the gate. Per-word observed/interpolated provenance and failed alignment output are not persisted by that path. The actual RunPod version and retained files must be checked before assuming the results can be salvaged.
- Existing word-sidecar loading is parameterized by book/edition/chapter. This is a coverage and confidence problem, not a missing all-books switch.
- Live Republic reader playback controls entered Playing and then paused successfully. This was a UI smoke check, not an audible timing or sentence-sync certification. Republic original chapter 1 manifest has no inline word timings and its sidecar is absent.

## Audit tooling correction and verification

Corrected the existing coverage tool so HTTP 403 is an error, not a missing object. Request failures are kept out of confirmed-missing lists; reports count confirmed missing files and suppress generated GPU commands while errors remain. The first audit was cancelled after detecting transient 403s; the final run used corrected classification with one retry and finished with zero errors.

Seven coverage-tool tests passed, including 403/404 classification and unknown-file exclusion. The shipping reader's 37 focused follow/listen tests passed. No app source, deployment or GPU job was changed; build/deploy gates do not apply to this audio-tooling-only change. Existing unrelated work in both checkouts was preserved.

## Next actions

1. Obtain four shard logs, exact generator commit/command, and an inventory of any retained failed alignment output from Grok Bot. Do not infer unique failure counts or causes from aggregate shard totals.
2. Reconcile those logs with the 4,361 confirmed missing sidecars. Identify missing MP3s, upload failures and alignment failures separately.
3. If failed word/transcript data were retained, evaluate actual sentence-boundary anchors on a small representative set before promoting weak chapters to sentence mode. Otherwise plan a targeted alignment rerun that retains observed-token provenance and partial results.
4. Keep unreliable regions at paragraph follow. A sentence-wide mark over interpolated timing is not a guaranteed catch-up mechanism.
5. After targeted repairs, rerun coverage and validate real playback before claiming completion.


## Supplied handoff reconciliation — 9 September 2026

Inspected the seven files Anders supplied in Downloads as evidence only; none
of the shell scripts or supplied generator was executed. Exact inert copies
and SHA256 digests are saved under
[handoff artifacts](../output/word-sync-handoff-2026-09-09/reconciliation.json).
The reconciliation uses the earlier same-day full audit, with a fresh live
check of the 35 omitted chapters. It is not a second whole-catalogue audit.

### Coverage and counters

| Shard | Editions | Current chapter targets | Missing sidecars in audit | Reported final FAIL |
| --- | ---: | ---: | ---: | ---: |
| 1 | 39 | 2,565 | 991 | 889 |
| 2 | 43 | 2,373 | 817 | 789 |
| 3 | 44 | 4,360 | 1,493 | 1,492 |
| 4 | 40 | 3,092 | 1,025 | 1,018 |
| Outside supplied shards | 3 | 35 | 35 | Not applicable |

The four scripts contain 166 unique edition targets, without inter-shard
duplicates, covering 12,390 of the 12,425 audited chapters. Missing targets:
`the-art-of-war/original-en` (13), `the-art-of-war/modern-en` (13), and
`phaedo/original-en` (9). All 35 omitted sidecars still returned missing in a
fresh live check, with zero errors. This proves absence from the supplied
commands, not that no other historical job ever attempted them.

The Genesis refresh covers `bible/web-en` and `bible/modern-en`, already in
shards 1 and 2. It has no chapter restriction: its filename does not make it
Genesis-only. Do not add its totals to shard totals as unique chapters.

Shard final FAIL totals sum to 4,188, while the audit has 4,326 missing
sidecars inside those shard targets, plus the 35 uncovered chapters. The
138-chapter difference inside the targets cannot be assigned to a cause from
these snapshots. Retries, historical skips, versions and timing require logs.

### Conservative failure classification

[Every missing chapter with its shard and source-note references](../output/word-sync-handoff-2026-09-09/missing-chapter-classification.json).

| Bucket | Chapters |
| --- | ---: |
| Explicitly reported alignment failure | 71 |
| Explicitly reported HTTP 404 | 6 |
| Explicitly reported upload/tooling issue | 1 |
| Absent from supplied shard commands | 35 |
| Cause not established by this extraction | 4,248 |

These are conservative lower bounds for named historical causes. Extraction
requires an explicit edition and chapter, does not silently normalize
`essay-montaigne`, `bible/kjv`, or unspecified-edition shorthand, and does not
turn mixed `under85/FAIL` labels into proven alignment failures. The unresolved
bucket includes mixed labels and ambiguous notes. It does not mean those
chapters were never mentioned. Historical reports are not current diagnoses.

Four explicit note references (WEB Bible chapters 152, 153, 168 and 169) already
had sidecars in the earlier audit and were excluded from the missing repair
list. Replaying the partial note list wholesale would duplicate work.

The one exact upload/tooling candidate is
`democracy-in-america/modern-en/ch46` on pod 4. It is a salvage candidate, not
proof a valid local file remains. Pod 4's Node problem also makes that volume
the most useful first place to inventory leftover files. Do not label all
pod 4 failures upload failures.

### Generator version and recovery implications

The supplied generator is byte-for-byte identical to the file at repository
commit `f5b23de7`. Its matching `words_sidecar_lib.py` was retrieved read-only
from that commit and preserved with the evidence. This identifies the supplied
file; it does not establish the commit used on each pod throughout the run.
No further helper-file request is needed for this version.

This supersedes the older local-generator observation about unconditional
existing-file skips: the supplied generator validates existing R2 sidecars
against current text and manifest, and checks book/edition/chapter identity.
A skip can still mean the audio manifest was inaccessible/missing. Its HEAD
helper collapses request exceptions into false, so full logs and live checks
matter when interpreting missing-manifest skips.

The supplied generator still discards low-alignment chapter results before
writing a new sidecar. Successful generation followed by upload failure leaves
the local sidecar for potential recovery; existing local files must be checked
against current text, manifest, identity and confidence before upload. Neither
case warrants deleting volumes.

Text-guided retry support (`--bias-text`) is present, but defaults to `off` and
none of the supplied commands enables it. A future bounded repair pilot could
evaluate that option against plain alignment while keeping the 85% acceptance
gate. A higher text-match score alone does not certify audio timing or a
reliable sentence boundary.

### Next evidence request

Recover the full ledgers and inventory leftover `words.json` files, starting
with pod 4, and record each pod's HEAD plus local generator/helper hashes.
If there is a supported volume-only access path, use it; do not assume stopped
volumes can be mounted elsewhere. Any paid Start remains unrequested in this
work. Do not rerun alignment or delete volumes as part of evidence collection.
Then validate recoverable files, classify the remaining failures, and select
a small alignment pilot. No GPU, upload or app deployment was performed here.


### Live check of explicitly identified HTTP 404 chapters

Checked all 200 manifest-listed files across the six explicit-edition 404
chapters above. Each chapter still has one missing MP3; the other 194 responded.
One timeout succeeded on retry; zero unresolved request errors remain.

| Edition | Chapter | Missing file |
| --- | ---: | --- |
| war-and-peace/modern-en | 91 | p11.mp3 |
| crime-and-punishment/modern-en | 9 | p6.mp3 |
| great-expectations/original-en | 15 | p89.mp3 |
| democracy-in-america/modern-en | 28 | p1.mp3 |
| democracy-in-america/modern-en | 85 | p1.mp3 |
| democracy-in-america/modern-en | 89 | p0.mp3 |

These six chapters are now confirmed audio-repair blockers, rather than merely
historical 404 reports. This is a targeted check, not a whole-catalogue MP3
audit. [Live file results](../output/word-sync-handoff-2026-09-09/historical-404-live-mp3-check.json).

## Pod 4 recovery validation — 9 September 2026

Read-only recovery audit completed against the local archive at
`/Users/andershvelplund/Desktop/runpod-recovery/pod4/`. Archive SHA256 is
`e80dcec78b929c4d6a344a1bf125a88a8a8cd886bb1563b8e79422e0b6b41d54`.
Safely copied its 107 regular sidecar files into the audit artifact directory;
no archive paths were executed. The saved chapter 46 checksum matches.

**All 107 sidecars pass** exact cleaned token/paragraph validation against both
shipping-checkout text (HEAD `6d463fcd8b2b291dd1f7829f5ef39b753b0e60d6`)
and freshly fetched live chapter shards. All pass identity, nonnegative and
monotonic timing, paragraph confidence >=85%, and live manifest file mapping.
No word end exceeds its manifest duration by more than the 100 ms tolerance.
All 107 production sidecar requests returned HTTP 404; all manifests and live
chapter shards returned 200. HTTP errors are not classified as missing.

The recovered keys **exactly equal the 107 explicitly logged upload failures**,
all reporting that Wrangler required Node >=22 while the pod had Node 12.22.9.
Recovery therefore provides a concrete no-GPU repair batch:

| Edition | Recovered missing chapters |
| --- | ---: |
| Moby-Dick / original-en | 63 |
| Peloponnesian War / original-en | 20 |
| Federalist Papers / modern-en | 23 |
| Democracy in America / modern-en | 1 (chapter 46) |

All 12 manifest-listed chapter 46 audio objects (title plus 11 paragraphs)
returned HTTP 200 to HEAD requests. Other recovered chapters' individual MP3s
were not exhaustively checked. Structural/confidence validation and manifest
durations do not certify acoustic accuracy or prove historical audio bytes
have not changed. No listening certification is claimed.

The full ledger contains 3,092 unique chapter outcomes, reconciling exactly to
272 uploaded, 1,802 skipped, and 1,018 failures:

| Failure category | Chapters |
| --- | ---: |
| Low observed alignment | 879 |
| HTTP 404 during generation | 25 |
| Upload tool Node version failure | 107 |
| Connection reset / timeout | 4 |
| Invalid audio data | 1 |
| Missing paragraph coverage | 2 |

All 1,018 logged failed chapter keys occur in the earlier missing-sidecar audit.
Historical 404s are not a fresh diagnosis of which object is absent. Skip
reasons remain in the per-chapter ledger; skips are not audio certification.
The earlier supplied-command table is a different scope snapshot and is not
silently replaced by these actual-ledger counts.

### Next repair actions

1. Publish chapter 46 as the first controlled recovery candidate, then verify
   its served bytes and reader playback. No generation is necessary.
2. Check remaining candidates' MP3 availability and promote the rest of the
   107-file batch using current tooling; recheck destination absence immediately
   before writing. This audit does not authorize blanket overwrites.
3. Diagnose the 25 historical HTTP 404s, four network failures, invalid audio,
   and two coverage failures before GPU alignment work. Keep all 879 alignment
   failures behind the existing quality gate; select a bounded pilot only after
   checking text/audio correspondence and retained evidence.
4. Recover the other shard logs to classify the rest of the corpus backlog.

No production objects, app source, GPU state, or billing state were changed.
No build/deploy was needed for this evidence-only audit. Pod stopped status and
cost remain Grok's report, not independently confirmed here.

Evidence: [summary](../output/pod4-recovery-audit-2026-09-09/summary.json),
[file checks and repair keys](../output/pod4-recovery-audit-2026-09-09/files.json),
[live text checks](../output/pod4-recovery-audit-2026-09-09/live-text.json),
[full classified ledger](../output/pod4-recovery-audit-2026-09-09/ledger.json),
[reconciliation](../output/pod4-recovery-audit-2026-09-09/reconciliation.json).

## Recovery actions completed — September 9, 13:06 UTC

Pod 4 next actions 1–2 above are complete. The pod 1 recovery also yielded one
new missing file (Social Contract original-en chapter 37); Bible modern-en 1151
and Manual original-en 17/46 already existed byte-identically and were preserved.
The publication report records all verification and limitations.

Across the two full ledgers, 1,797 historical failures remain: 1,718 alignment,
60 historical HTTP 404, 12 network, six paragraph coverage and one invalid audio.
All 110 logged upload failures now have verified sidecars (108 restored here,
two already present). Diagnose the remaining failure paths and obtain other
shard logs before planning targeted generation; no GPU action was taken.
