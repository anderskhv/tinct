# Bella word-sync execution — 2026-09-21

## Focused retention pass — 2026-09-21, 15:27 UTC

Anders authorized a narrow exception to the 12:58 pause: finish nine near-complete original-English editions, with a 90-minute wall-clock cap starting at 13:34:35 UTC (deadline 15:04:35 UTC). The broader backlog remains paused. This pass changed timing sidecars only; it did not change recordings, book text, reader/app code, catalogue availability, narrator, or deploy the app.

Five chapter sidecars were published and their served bytes verified: Jekyll and Hyde 9, Candide 26, Federalist Papers 48 and 84, and Pride and Prejudice 2. Candide (30 chapters), Federalist Papers (85), and Pride and Prejudice (61) passed whole-edition structural/text and existing-reader data checks, plus isolated muted production playback at 390 and 1440 pixels. The browser checks covered word highlighting, seeking, pause/resume, 1.5× speed, and paragraph/chapter transitions. These three editions are accepted for retention. Acoustic checks are representative automated samples, not human listening or word-by-word certification.

Jekyll's spoken HASTIE LANYON paragraph is repaired, with previous bytes backed up before conditional replacement. Its ten chapters passed timing/text and existing-reader checks. Its original edition still has `hasAudio: false`; normal audio handoff is rejected by the existing catalogue validation. It is timing-complete but not accepted as user-visible audio completion. No flag was changed.

| Original-English edition | Focused result |
| --- | --- |
| Candide | Complete retention acceptance; chapter 26 published |
| The Federalist Papers | Complete retention acceptance; chapters 48 and 84 published |
| Pride and Prejudice | Complete retention acceptance; chapter 2 published |
| Jekyll and Hyde | Chapter 9 published; timing-complete, existing catalogue audio unavailability remains |
| Don Quixote | Chapter 52 remains unpublished: six spoken labels/headings still fail recognition |
| The Awakening | Chapter 12 remains unpublished: independent acoustic check 28/30, maximum 1.11 seconds; paragraph 1 alternative did not improve agreement |
| Beyond Good and Evil | Chapter 5 remains unpublished: independent acoustic check 27/30, maximum 1.20 seconds; alternatives did not improve agreement |
| Nicomachean Ethics | Chapter 7 remains unpublished: final phrase recognition recovered a candidate, but the independent acoustic check hit its 8-minute cap before producing an acceptance result |
| The Communist Manifesto | Chapter 4 remains unpublished: spoken section labels recovered, but independent base check remains 28/30, maximum 0.55 seconds; small check passes 30/30 |

The unresolved editions remain candidates for whole-edition voice replacement under the separate strategy decision. No replacement was activated and no narrator was mixed within an edition. The Histories original-en chapter 1390 remains held for content: both ledger and quarantine say `hold: content` / `reason: content`. The originating September 17 entry explicitly retains that content hold after a helper update; no more specific editorial reason was present in the inspected records.

See [execution evidence](bella-word-sync-execution-2026-09-21.md) and [updated edition inventory](bella-edition-inventory-2026-09-21.md). These results supersede the historical “staged, not published” statements below for the five named sidecars only.

## Focused pass evidence and limits

- [Publication journal](https://github.com/anderskhv/tinct/blob/codex/bella-focused-retention-20260921/artifacts/bella-focused-retention-2026-09-21/publication-journal.json) records conditional writes, exact SHA-256 values, served-byte verification and Jekyll's backup. Missing objects used create-only writes; Jekyll used the previous ETag as an overwrite precondition.
- [Final whole-edition and reader-data check](https://github.com/anderskhv/tinct/actions/runs/35614746117) rechecks published candidate bytes against frozen text/audio identities and validates all 176 chapters across Candide, Federalist and Pride. Jekyll's separate ten-chapter acceptance is in [run 35609170350](https://github.com/anderskhv/tinct/actions/runs/35609170350).
- Muted browser acceptance: [Candide](https://github.com/anderskhv/tinct/actions/runs/35610797896), [Federalist](https://github.com/anderskhv/tinct/actions/runs/35613629508), [Pride](https://github.com/anderskhv/tinct/actions/runs/35614617639). Federalist and Pride observed bundle `index-CbOXAagz.js`; Candide observed `index-DEtLZ0Dq.js`. Other work changed the production app during this pass; this task performed no app deployment or before/after bundle-equality claim.
- [Collected narrow repairs](https://github.com/anderskhv/tinct/tree/codex/bella-focused-collected-20260921/artifacts/bella-focused-acoustic-2026-09-21), [short spoken phrases](https://github.com/anderskhv/tinct/tree/codex/bella-focused-short-clips-20260921/artifacts/bella-focused-short-clips-2026-09-21), [Nicomachean checkpoint recovery](https://github.com/anderskhv/tinct/tree/codex/bella-focused-nicomachean-resume-20260921/artifacts/bella-focused-acoustic-2026-09-21/nicomachean-ethics/7), and [Communist boundary review](https://github.com/anderskhv/tinct/tree/codex/bella-focused-communist-boundaries-20260921/artifacts/bella-focused-communist-boundaries-2026-09-21) preserve successes and rejections.
- [Final Nicomachean phrase check](https://github.com/anderskhv/tinct/tree/codex/bella-focused-nicomachean-phrase-20260921/artifacts/bella-focused-nicomachean-phrase-2026-09-21) preserves the final bounded attempt. The final phrase produced a candidate with the exact source words, but the independent acoustic stage timed out at 15:00:09 UTC. The candidate is unverified and was not published.
- [Histories hold evidence](https://github.com/anderskhv/tinct/blob/codex/bella-focused-retention-20260921/artifacts/bella-focused-retention-2026-09-21/histories-hold.json) preserves the canonical `the-histories` key and origin `02387ccda5ade092e6ed6bb48567629f1ea9ec35`.

Historical passing-candidate paths were checked first but the referenced actual sidecar bytes were absent (404); summary records alone were not reusable candidates. Only the ten authorized chapters were regenerated where needed, then unchanged paragraph diagnostics were reused after text/audio identity verification. No good chapter was realigned. A model-tree hash check initially encountered a cache-path exclusion error; the pinned model was reverified outside that cache path. Nicomachean checkpoint recovery also corrected an enclosing-bracket restoration mismatch while preserving exact source tokens and observed timestamps; a focused check rejects changed words. The 0.85 observed-token gate and sampled acoustic gates were not relaxed, and no arbitrary homophone substitutions were introduced.

Independent results for published repairs: Candide 30/30 anchors, maximum 0.15 seconds; Federalist 48 29/30, maximum 0.40 seconds; Federalist 84 30/30, maximum 0.15 seconds; Pride base 29/30, maximum 0.37 seconds and small 29/30, maximum 0.47 seconds. Jekyll's previously preserved independent check passed 30/30, maximum 0.11 seconds. Complete editions here means the stated structural/text, sampled acoustic and reader acceptance gates passed; it is not certification of every spoken word.

No RunPod job was launched by this focused pass: incremental RunPod spend is $0. [Billing reconciliation](https://github.com/anderskhv/tinct/blob/codex/bella-focused-acceptance-20260921/artifacts/bella-focused-acceptance-2026-09-21/billing.json) at 14:05 UTC found $0.2067058728 billed for the earlier remap pod, giving a conservative $3.2067 carry against the existing $15 aggregate ceiling. Account-wide billing is not task-specific and may lag. GitHub Actions CPU runner costs were not retrieved. All coding, tests and generated assets stayed in cloud branches; existing local R2 credentials were used only for in-memory transport of accepted cloud bytes.

At close, no further repair batch is authorized by this pass. Keep the unresolved books on the whole-edition replacement decision list; do not resume the broader backlog or alter availability/content holds from these results.

All repair jobs had ended by 15:00:13 UTC, within the 15:04:35 deadline. Documentation closeout and the final report ran past the 90-minute wall-clock cap; no new repair attempt or production publication was started after the deadline.


Status: ongoing completion work. Anders explicitly instructed continuing through failures on 2026-09-21. This report records observed repairs and remaining gaps, not full Bella coverage or edition completion.


## Strategy checkpoint — 2026-09-21, 12:58 UTC

Anders questioned the value of spending further hours restoring incomplete Bella editions and stated that the narrator must not change within a book. Further repair batches are paused while the whole-edition voice strategy is decided; this is not authorization to implement or deploy the replacement architecture. The pending 27-chapter stronger-recognition batch was cancelled; the prepared next batch was not launched. Already-running bounded jobs retain their cleanup watchdogs and may finish to preserve results.

Recommendation, pending decision: retain Bella for complete, verified editions; use one consistent selected narrator across each other book/edition through the planned on-demand, cached audio architecture. Do not splice WaveNet chapters into Bella editions. New audio still needs accepted word timings; changing provider alone does not establish highlighting. Cache identity must include the exact text chunk and voice/model configuration. Source changes invalidate only dependent chunks.

Evidence at pause: 14 chapter repairs published, with production served-byte verification. Another 24 passed independent acoustic checks; existing-reader data acceptance is being completed. The all-zero-paragraph audit of 6,234 structurally passing sidecars found one additional spoken-heading defect (Jekyll chapter 9) and one genuinely silent verse-marker paragraph. Jekyll's candidate passes independent acoustic checks but is not published. Nine newly confirmed missing Bible recordings are within the original backlog. Sampled audio from Meditations and Faust matches earlier translations, demonstrating that those are recording replacement cases. Some original editions (including Imitation and Winter's Tale) lack catalogue audio availability; timing repairs alone do not enable them. No reader/app changes or deployments were made.

Next action: preserve remaining run evidence, reconcile status by complete edition, and decide retention versus whole-edition replacement before authorizing further restoration spend. Earlier instructions below to continue broad repair batches are superseded by this pause.

## Continuation checkpoint — 12:16 UTC

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
