# Bella word-sync execution — 2026-09-21

Status: ongoing completion work. Anders explicitly instructed continuing through failures on 2026-09-21. This report records observed repairs and remaining gaps, not full Bella coverage or edition completion.

## Continuation checkpoint — 12:18 UTC

The initial pilot results below are historical. Its Imitation of Christ and King Lear failures have now been resolved and published. No app/reader implementation, source text, reading position, discovery hold or application deployment was changed.

Thirteen chapter repairs have been served and byte-verified in total: Winter’s Tale 6 from the initial pilot; Imitation of Christ 76; King Lear 3; remapped Montaigne 28 and Merry Wives 22; Merchant of Venice 6, 9, 15; War and Peace 259, 283, 314; Winter’s Tale 4, 9. All editions here are original-en. Historical voice identity remains unknown at manifest level; generation scripts support Bella provenance but do not certify each recording.

- [Imitation and King Lear publication receipts](https://github.com/anderskhv/tinct/blob/codex/bella-context-repair-20260921/artifacts/bella-context-repair-2026-09-21/publication-journal.json): all source text/audio hashes rechecked. Imitation’s citation comparison and whole-paragraph timing selection passed a fresh independent small-model check, 30/30 anchors within 300 ms. King Lear’s short reply required surrounding audio context, and actually spoken speaker labels were restored from recognition evidence; 30/30 anchors, maximum 290 ms.
- [Atomic mapping receipts](https://github.com/anderskhv/tinct/blob/codex/bella-remap-pilot-20260921/artifacts/bella-remap-pilot-2026-09-21/publication-journal.json): exact historical paragraph correspondence and acoustic checks supported reuse. Original MP3 bytes were copied to immutable filenames. Previous manifests were backed up, then conditional manifest writes activated corrected audio and embedded timings together. Merry Wives also received its correct existing Act 5 Scene 4 title recording.
- [Eight batch publication receipts](https://github.com/anderskhv/tinct/blob/codex/bella-completion-batch-20260921/artifacts/bella-completion-batch-2026-09-21/publication-journal.json): the first 20-chapter GPU batch produced 12 alignment candidates; nine passed independent acoustic checks. Existing reader-data tests passed eight; War and Peace 281 was held because a spoken date heading had zero-length timings. Its separate heading repair subsequently passed all four independent word comparisons but is not yet published at this checkpoint.
- [Reader-data checks](https://github.com/anderskhv/tinct/actions/runs/35596598346) passed all four initial repaired fixtures and existing audio-loader tests. The [nine-candidate run](https://github.com/anderskhv/tinct/actions/runs/35597670644) had eight individual chapter cases pass and one fail, correctly blocking chapter 281. These are actual reader function tests without playback; full muted-browser seeking, resume, speed and transition acceptance remains outstanding.
- [Heading repair](https://github.com/anderskhv/tinct/actions/runs/35598125260) uses recorded speech and narrowly contextual date-number equivalence. It does not invent timing spans or relax the acceptance gate.
- [Remaining-work ledger](https://github.com/anderskhv/tinct/blob/codex/bella-completion-ledger-20260921/artifacts/bella-completion-ledger-2026-09-21/summary.json) reconciled 3,005 historical chapter keys: 317 stronger-recognition cases, 318 without a preserved prior attempt, 233 source/audio repairs and two content holds at ledger creation. These are baseline classifications, not a fresh remaining count after publication.
- Source mapping recovered exact/normalized monotonic correspondence for 4,633 Montaigne paragraphs, all 1,155 Merry Wives paragraphs and all 1,006 Measure for Measure paragraphs; 820 of the latter also match the historical manifest structure. Correspondence alone is not acoustic acceptance. Meditations’ source-history change from Casaubon to Long is established; current published text remains authoritative.

Failures are being repaired, not counted as completed: a cloud-host CUDA failure was retried on a working secure host; a JSON numeric-serialization failure was fixed while preserving results; artifact preservation was corrected for ignored output directories; multiword speaker labels have an identified source-token restoration defect under regression tests. A queued retry run was displaced by GitHub’s one-pending-run concurrency behavior and must be resumed after the active remap batch rather than treated as executed.

Compute: the failed first GPU host cost approximately $0.0034; its replacement batch approximately $0.035. Both pods were stopped and deleted. The existing aggregate ceiling is $15, with conservative carry-forward values that include previous spend; later queued work uses $3.00 as a conservative preflight allowance. Active batches have a separate cloud watchdog, maximum hourly rate, process cap, launcher deadline and stop/delete cleanup. Settled provider and GitHub runner costs have not been fully reconciled. All computation and generated assets remain in cloud branches. Production upload uses the existing local credentialed transport only because the cloud lacks the three R2 S3 secrets; no secret or generated repository file was written locally.

Next: finish active batch collection, revalidate and publish accepted candidates, complete the held heading repair, resume stronger-recognition retries, continue remapped-recording checks, and close each affected edition’s remaining cases. Missing recordings, genuinely different spoken text and the two content holds remain explicit exceptions requiring resolution, not fabricated timings.

## Initial pilot: what changed in production

Only `winters-tale/original-en/ch6/words.json` was created, conditionally and without overwriting an existing file, at 10:41:14 UTC. It contains 179 words across eight paragraphs (19,461 bytes). Production returned the identical SHA-256:

`295bfc09b610eda54a0c8acfe5473f52f0584a16caf959b471dc8af1a7803e5a`

The source paragraphs and all eight recording hashes were checked against the cloud pilot inputs before publication. The served timing file passed exact text/structure checks. Independent Whisper-base acoustic comparison found 29/30 sampled anchors within 300 ms, with a maximum difference of 970 ms, passing the existing sampled gate. This is automated sampling, not human listening or word-by-word acoustic certification.

[Publication receipt](https://github.com/anderskhv/tinct/blob/codex/bella-sync-acoustic-20260921/artifacts/bella-sync-pilot-2026-09-21/publication-journal.json).

No reader/app code, reading positions, book text, recording, manifest, availability flag or deployment was changed by this work. No audible browser test was performed. UI seeking/resume/speed/transition acceptance remains unverified. The current bundle observed after publication was `index-DIuP-7hv.js`; the initial capture failed, so no measured before/after bundle equality is claimed. Winter’s Tale still has 11 chapters missing timings and four passing structural checks: the edition is not complete.

## Current production inventory

[Completed cloud audit](https://github.com/anderskhv/tinct/actions/runs/35591181465), [summary](https://github.com/anderskhv/tinct/blob/codex/bella-sync-repair-20260921/artifacts/bella-sync-2026-09-21/summary.json), [chapter ledger](https://github.com/anderskhv/tinct/blob/codex/bella-sync-repair-20260921/artifacts/bella-sync-2026-09-21/chapters.json).

Both required WIP inventory commands ran in the cloud. The survey used actual published chapter numbers, avoiding the old census’s 1,200-chapter ceiling. It covers 11,830 chapter entries across 200 English editions from the 100-book registry. The resumed audit reused 7,600 same-source-hash checks from its earlier run; this is a same-day survey, not an atomic snapshot. There were no edition-fetch errors.

| Non-modern English status | Chapters |
| --- | ---: |
| Existing timings pass structural/text checks | 6,234 |
| Timings missing | 846 |
| Existing timings invalid | 12 |
| Audio absent | 12 |
| Total | 7,104 |

The 846 missing-timing chapters represent approximately 237.38 manifest audio hours. Readiness classification: 633 sampled-ready, 174 mapping defects, 35 audio defects, four separator gaps. “Sampled-ready” means matching paragraph counts and three accessible audio samples; it does not establish matching speech, acceptable alignment or freedom from content holds.

All 12 absent-audio entries are Ivan Ilyich. All 12 invalid existing timing files are Meditations original-en. Chapter 1 timing words demonstrably describe a different English translation from the current text. The audio itself was not acoustically adjudicated; preserve it and establish its source identity before considering replacement. Timestamp remapping cannot cure differing prose.

Modern-en: 1,751 structurally passing, 806 missing timings, and 2,169 explicitly deferred pending decisions about retained text. These 2,169 are neither certified nor counted as missing. No new modern-English alignment was performed.

All manifests lack explicit voice identity. Historical generation scripts use `af_bella`, which is supporting evidence but not per-recording proof. These totals must not be presented as a verified Bella-only inventory.

## Recovery and pilot results

[Recovery run](https://github.com/anderskhv/tinct/actions/runs/35587836422) examined prior canary artifacts: 55 distinct candidate arms, 15 already present, 39 rejected by their earlier gate, and one recoverable result. The recoverable Histories original-en chapter 1390 has a content hold and was not published. Corrected recovery outputs retain its provenance and list zero publishable candidates.

[CPU pilot](https://github.com/anderskhv/tinct/actions/runs/35588469333) aligned three short chapters with the existing v7 helper and small.en recognizer. All 87 existing tests passed after fetching their required historical fixture commit. No GPU was rented.

| Chapter | Result |
| --- | --- |
| Winter’s Tale original-en 6 | Passed structural and independent acoustic gates; published |
| Imitation of Christ original-en 76 | Roman-numeral citation mismatch demonstrated; experimental replay passes text gate but independent acoustic gate fails (28/30 anchors within 300 ms); held |
| King Lear original-en 3 | “Ay, madam” recognized as “I’m Adam”; paragraph gate fails; held |

The citation experiment preserves observed timing evidence and original output words, with four focused tests. It is isolated on a work branch, not merged into the general aligner. A broader replay found only modern-English retained diagnostics, hence zero eligible original-English cases; wider applicability remains unproven. Gates were not relaxed and arbitrary homophone substitutions were not added.

[Independent acoustic run](https://github.com/anderskhv/tinct/actions/runs/35589562923) completed acoustic checks but its cloud publication step failed because the three R2 S3 upload secrets are absent. The one accepted candidate was subsequently published using existing preserved local credentials in memory, without writing secrets or local repository files. No other candidate was uploaded. Cloud computation and generated artifacts remained on isolated GitHub branches; they were not merged into the app.

## Initial pilot: remaining work and next action

The shared failure classes are recognition of short phrases/citations, paragraph-map differences, missing recordings and changed source text. Retrying every rejected chapter unchanged is not a demonstrated fix.

1. Reconcile the 633 sampled-ready chapters against prior-attempt evidence, voice provenance and content holds; prioritize demonstrably completable retained editions.
2. Evaluate stronger recognition or transcript-guided alignment on the held pilot paragraphs and representative unaffected material before expanding. Preserve the per-paragraph 0.85 observed-token and independent acoustic gates.
3. Produce separate mapping/audio repair proposals for the 213 sampled defects and separators. Establish the Meditations audio’s actual source before proposing regeneration; Ivan Ilyich needs audio, not timestamps.
4. Confirm retained modern-English text before aligning its existing recordings.
5. Configure the existing cloud uploader through the approved secret-management route before routine cloud publication. Do not copy credentials into repository files.
6. Keep create-only publication for missing files. Existing invalid files require a versioned, conditional replacement path with their previous bytes preserved.
7. Complete isolated muted reader acceptance and representative acoustic review before claiming an edition complete. No reader implementation change is required by this repair plan.

The initial pilot incurred no rented GPU cost. GitHub Actions CPU work was used; a settled runner-cost total was not retrieved. Subsequent authorized continuation and bounded paid execution are recorded in the checkpoint above.

See [authoritative repair plan](bella-word-sync-repair-plan-2026-09-21.md). OVERVIEW.md and docs/documentation-maintenance.md remain absent from the inspected remote tree; PIPELINES.md is the available entry point.
