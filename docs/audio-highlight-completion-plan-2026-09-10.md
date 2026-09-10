# Finish audio word highlighting across the English library

September 10, 2026. Requested by Anders after reviewing the repeated GrokBot /
Codex recovery handoffs. **Execution approved September 10; not a claim of completion.**

Anders subsequently instructed execution through task
`01a08a6c-7502-7262-b6c4-af1778cecd05`: initial $25 total envelope, first trial
at most 60 paid GPU minutes, targeted repairs, isolated known-text experiment
if required, and verified publication. One execution owner: Move coding to Codex.
No destructive cleanup or material source/voice changes. The proposal/approval
wording later in this document is historical and superseded by this approval. This review changes documentation only.

Source conversation: [Review Grokbot recovery task](https://chatgpt.com/s/cx_6aa2694ad8cc8191a56c4d0efa839b11).

## Recommendation

Close the recovery phase. Give one Codex execution owner responsibility for the
remaining backlog, from exact targets through production verification. Use
GrokBot only for RunPod operations if its existing access is useful. Replace
repeated conversational handoffs with one versioned job package and a durable
results ledger. Publish verified books continuously.

The Bible demonstrated that playback highlighting works. It did not establish
that every legacy recording matches today's paragraph numbering and text, or
that the recognizer handles every name, number and speaker label. This is now
primarily an audio-data and processing problem. There is no missing all-books
switch in the reader.

## Evidence established in this review

- All four main shard ledgers are recovered and reconciled. The 108 newly
  recovered chapter timing files are already published and verified. No further
  recovery request is a prerequisite to this work. See the
  [publication report](audio-recovery-publication-2026-09-09.md).
- Baseline accounting leaves **4,253 missing chapter timings**: 345 without a
  recorded terminal outcome and 3,908 with historical failures. Of the latter,
  3,755 are alignment-only; the remainder have HTTP, network, paragraph-map,
  invalid-audio or mixed histories. These are historical classifications, not
  fresh diagnoses of every file. This is **not a new whole-library audit**.
- The generator rejects the whole chapter before saving its timing output if
  any paragraph falls below 85% observed token matching. Thus a chapter-level
  failure does not mean all its paragraphs are unusable. The current path also
  loses the detailed evidence needed for selective repair.
- The recovered production generator supports paragraph-text bias, but the
  recorded runs used bias off. The current main and reader-stabilization local
  generator files differ from that recovered version. A new run must use one
  reviewed, pinned revision; simply restarting a local script is insufficient.
- Preparation has already advanced beyond the written pilot proposal. The
  current diagnostic artifacts contain 32 chapter records and 103 audio
  samples. The existing task **Move coding to Codex** was active when inspected.
  Its full current progress was not available through the task reader. Reuse
  its work and establish one owner before any second implementation starts.

Newer diagnostic evidence narrows several failures:

| Evidence | Practical next action |
| --- | --- |
| Montaigne original chapters 1, 2 and 104 each have one extra manifest paragraph. A cached local ASR probe hears the chapter title in p0; chapter 1 p3 matches displayed paragraph 2 at about 95.7% text similarity. Chapter 2 p11 resembles the Italian quotation in displayed paragraph 10. | Test a title-induced one-paragraph offset. Confirm the full mapping before remapping manifests; do not apply a blanket offset from these samples. These are machine observations, not independent listening certification. |
| Jerusalem original chapter 10 omits displayed paragraph 2 (`***`); Niels Lyhne original chapter 1 omits paragraph 10 (`* * *`). | Define and test a narrow rule for non-spoken scene separators. Preserve all displayed paragraphs and indexes; do not invent speech timings for ornaments. |
| Four pilot MP3s are missing and two are empty/undecodable. | Repair those exact audio objects before alignment. HTTP 200 alone is insufficient. |
| Earlier Art of War diagnosis found printed digits versus spoken number words; Phaedo has spelled speaker labels. | Test explicit spoken-to-display token mappings. Repair materially defective pronunciation where needed. Do not lower confidence globally. |

Evidence: `output/word-timing-diagnostic-pilot-2026-09-10/diagnosis-ledger.json`
and `local-asr-probe.json`; [diagnostic pilot](word-timing-diagnostic-pilot-2026-09-10.md);
[September 4 audit](../artifacts/tinct-word-timing-recovery-2026-09-04/REPORT.md).
The Montaigne observations are provisional and do not certify its other chapters.

## Explicit finish line and scope

Working interpretation of Anders's request and the shared conversation:
**accurate word highlighting for every public English edition with its own
matching narration**, across every published book. Danish remains paused;
staged and future books are separate publication work.

The September 9 production audit covered 169 audio-flagged English editions,
96 books and 12,425 chapters. A current-file inventory in this review finds
100 public books, 201 English editions and 13,019 chapters. The additional
32 unflagged editions contain 594 chapters. **Unflagged does not mean their
audio is missing**; their production assets require an explicit audit.

Four local public books have no English edition flagged for audio: The Comedy
of Errors, Walden, A Vindication of the Rights of Woman, and The Death of Ivan
Ilyich. They must appear in the completion ledger. Reconcile these local counts
with the actual shipping catalogue before execution; this checkout is dirty.
The required `python3 books/wip_inventory.py --audio` was also run; its WIP
first/last-manifest checks do not certify public-corpus timing coverage.

Track two milestones separately: one complete matching English edition in
every public book, then every public English edition. The first is useful
progress, not completion of the second. Do not mark a book complete because
one opening chapter works. In Compare, exact highlighting applies to the
edition being narrated; different wording cannot inherit those word timings.

## Execution sequence

### 1. Assemble the exact job and fix known structural defects

Use a clean audio worktree based on reconciled shipping inputs and the recovered
generator improvements. Preserve unrelated app/content changes. Refresh coverage
once, including unflagged public English editions, and snapshot source text,
paragraph indexes, manifest/file mappings and hashes. Distinguish 404 from
403, timeouts and other unknown states. This refresh can run while tooling is
prepared; it must not become a new historical investigation.

Create one chapter ledger with paragraph-level checkpoints. Save successful
and failed results, raw recognition, match/provenance data and rejection causes
before returning failure. A checkpoint is reusable only while its input hashes
and processing configuration match. Retry defective paragraphs, then assemble
and validate the complete chapter. Avoid a new partial-publication schema for
the first release.

Confirm and fix the Montaigne mapping, scene-separator handling and deterministic
number matching on their exact fixtures. A manifest repair must agree with both
reader playback and sidecar file identity; correcting only the sidecar cannot
fix playback of the wrong paragraph. Never delete or renumber displayed text
to make audio pass. Save old manifest bytes for any verified replacement.

Deliverable: a tested, pinned runner and manifest of exact targets, with a
dry run showing no duplicates, silent edition substitutions or unrelated writes.

### 2. Run one bounded selection trial, then make a decision

Reuse the existing 32 diagnostic chapters and four controls. Do not collect a
second broad diagnostic sample. Use the matching-audio subset of the existing
12 alignment failures plus controls for the paired bias-off/bias-on comparison;
exclude or repair mismapped/missing/broken input first. Keep current model and
normalization fixed within each comparison so the result is interpretable.

If corrected inputs and the existing bias option do not provide a useful rescue,
test **one** known-text forced-alignment alternative on the same eligible sample.
We already know the book text and paragraph audio boundaries. WhisperX exposes
an alignment function accepting a known transcript; this is a technically
supported candidate, not evidence it will solve this corpus. See the
[maintainer's alignment implementation](https://github.com/m-bain/whisperX/blob/main/whisperx/alignment.py).
Any such dependency experiment is isolated audio tooling and requires the
repository's dependency approval before installation.

Do not convert a forced aligner's output into fictitious 100% observed ASR
confidence. Preserve independent speech/text checks and word provenance, and
validate its confidence contract explicitly before production use. Unsupported
names, digits and embedded foreign-language quotations remain real test cases.

Keep the existing acoustic trial criteria: independent start/middle/end and
weak-region checks, at least 30 word anchors per candidate, proposed target of
95% within 300 ms and no unexplained drift over one second. These tolerances
are proposed, not measured corpus accuracy. A control regression blocks adoption.

Deliverable: one selected method per diagnosed class, rescued/attempted/excluded
counts, measured throughput and a cost/finish estimate. After two failed repair
attempts on a class, instrument the cause instead of guessing again. Other
passing classes proceed independently.

### 3. Process three independent queues and release complete books

| Queue | Work |
| --- | --- |
| Uncovered and transport failures | Recheck current inputs; process eligible members of the 345 uncovered chapters and retry confirmed transient failures. These are candidates, not guaranteed easy successes. |
| Alignment and mapping repairs | Apply only the method proven for that class; preserve validated paragraph checkpoints and complete chapters as their exceptions are repaired. |
| Audio missing, corrupt or wrong | Regenerate only the defective paragraph recordings against the selected current text, with the existing approved voice/settings; remeasure manifests and regenerate affected timings. Audit the 32 unflagged editions here and enable flags only after real coverage is established. |

Use disjoint machine-generated targets, starting with one worker. Increase
worker count only after the canary proves setup, output recovery, validation
and actual throughput. Distribute by measured audio/work duration, not book
count. No pod may improvise edition names or redo verified work.

Publish complete validated chapters as ready and verify each completed edition.
Give books close to completion a route to finish while difficult classes remain
in the repair queue. Missing-object publication reuses the existing conditional
no-overwrite uploader. Necessary replacements use an explicit reviewed object
list, saved previous bytes and verified manifest/timing consistency. Verify
served production bytes after writes; keep rollback evidence outside public keys.

### 4. Close the feature on production and prevent recurrence

- Every target English edition has valid matching audio and usable timings for
  all spoken text. Non-spoken decorations have explicit tested treatment.
- A fresh full target audit reports zero missing, invalid and unknown entries.
  Presence alone is insufficient: validate all timing files against exact
  source, identity, paragraph/file mapping, finite monotonic bounds and duration.
- Each edition gets representative real-playback checks, including opening,
  interior, ending and weakest material. Across the release, exercise mobile
  and desktop, Read/Compare, seeking, pause/resume, speed changes, page turns,
  chapter transitions and edition changes. Record the acoustic sampling limits.
- Any app change follows tests, build, verify-bundle, approved deployment and
  production bundle/playback verification. Sidecar-only publication does not
  need an unrelated app deployment.
- Make validated audio **and timings** part of future book publication, with
  source/audio hashes invalidating stale timings. A replacement edition or
  recording is incomplete until its timing assets are ready.

Paragraph or sentence fallback can remain during repairs, but is not counted as
finished word highlighting. Neither perfect token counts nor an 85% recognition
score alone proves that the audible words track correctly.

## Ownership, spending and checkpoints

Recommended single execution owner: the existing **Move coding to Codex** task,
provided the audio work receives a dedicated work period instead of repeatedly
waiting behind reader releases. Do not create another overlapping implementation.
Codex owns code, input selection, validation, publication and the completion
report. GrokBot may start the specified RunPod job, return its durable artifacts,
and stop compute; it should not choose targets or alter alignment policy.
Anders should not act as the routine message relay.

Before involving GrokBot, provide one concrete package: reviewed commit, target
manifest, dependency/runtime preflight, exact command, output location, automatic
stop and tested recovery route. Recover results through the proven artifact
route; avoid revisiting SSH/Jupyter workarounds while paid compute runs.

Recommended approval structure once that package is reviewable: one bounded
execution envelope covering the specified trial, targeted audio repairs and
verified batch publication. A **suggested initial ceiling is US$25**, with no
more than 60 paid GPU minutes for the first selection trial. This is a proposed
spending limit, not a price quote or a claim it will fund the full library.
Confirm actual provider rates and include new storage/compute charges, retries
and startup in the envelope; report pre-existing idle storage separately.
No paid work or new dependency installation was authorized by this review.

Within an approved envelope, proceed automatically from passing trial to the
covered repair batches. Return for a genuine budget limit, material source/
voice/dependency change, or unresolved failure class requiring a decision;
do not require Anders to approve every chapter or successful upload.

Scheduling target: a dedicated first workday should produce the corrected runner,
selection result and first additional production repairs, subject to compute
availability and the agreed envelope. This is a planning target, not a promise.
Set the remaining finish date from measured queue durations, worker throughput,
rescue rate and exception-review effort immediately after the trial. Do not
extrapolate a whole-library ETA from Genesis or raw GPU speed alone.

Report progress as complete books, complete editions, newly verified chapters,
remaining chapters by cause, spend and the next checkpoint. The recovery stage
is closed; its old logs remain evidence, not recurring prerequisites.

## Relationship to previous plans

This is the current **completion recommendation**. It supersedes the open-ended
sequence of further recovery requests and pilot-only handoffs. The
[readiness audit](word-sync-readiness-2026-09-09.md),
[recovery report](audio-recovery-publication-2026-09-09.md), and
[diagnostic pilot](word-timing-diagnostic-pilot-2026-09-10.md) remain evidence and
technical references. Their historical counts and approval status are preserved;
this recommendation does not retroactively authorize work.
