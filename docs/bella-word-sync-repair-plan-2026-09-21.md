# Bella word-sync repair plan

Status: proposed execution plan, 2026-09-21. Planning only: no audio generation, GPU launch, publication, app change or deployment is authorized by this document.

## Outcome and scope

Preserve existing Bella recordings that match the approved English reading text and provide reliable word highlighting, seeking and paragraph transitions. Repair timings without re-recording usable audio. Include existing modern-English Bella audio only where its text is being retained; do not spend alignment effort on translations scheduled for replacement.

Danish is outside the strategy. Follow [Language scope](../STRATEGY.md#language-scope). Language, voice and source-version identity must remain explicit so these repairs can coexist with the future narration architecture.

## Evidence reviewed and limits

Reviewed the current repository tooling, run-3 report and v7 helper notes on 2026-09-21. This is not a new production census or a verified Bella coverage total. Historical English/Kokoro counts must not be relabelled Bella counts without voice provenance.

- [Run 3](audio-highlight-run3-2026-09-12.md) records 990 published chapters and 15 completed editions. It found that ranking only by fewest missing chapters repeatedly selected known failures; rank by demonstrated completability instead.
- [Helper v7](../tools/audio-highlight/aligner/HEADING-RULE-V7.md) fixes a heading-prefix restoration bug. It explicitly does not fix recognition near-misses such as fortnight/Fortnite. Its presence in main is not evidence that the reviewed execution runner or every production timing uses it.
- [Repair proposal](audio-highlight-repair-proposal-2026-09-11.md) separates absent recordings, paragraph-map defects and incompatible chapter divisions. Its September 11 counts are historical.
- [Cloud tooling](../tools/audio-highlight/README.md) already provides census, validation, conditional publication and served-byte verification. [Aligner instructions](../tools/audio-highlight/aligner/README.md) require input/configuration hashes for checkpoint reuse.
- The stored September 16 resume directory has an empty active-batch file; that is not proof that no provider job is running now. Its quarantine also contains old helper-specific holds that need reconciliation.
- OVERVIEW.md and docs/documentation-maintenance.md are absent from the inspected remote tree. PIPELINES.md provides the available project entry point.

## 1. Produce a current, Bella-specific repair ledger

First execution deliverable; read-only, from the cloud environment.

Run books/wip_inventory.py and books/wip_inventory.py --audio against the current checkout, then the audio census and readiness/verification tools against served production assets. Reconcile registry entries, availability holds, published text, manifests, recordings, word timings, previous attempts and publication journals. Separate published editions from staged material.

Confirm Bella from generation metadata or preserved job provenance. Record unknown voices explicitly rather than assuming every Kokoro recording is Bella.

For each chapter record: book/edition/language, voice evidence, approved text version/hash, manifest and audio identity, timing identity, spoken paragraph coverage, previous failure class, last helper/model used, retained-versus-replacing text, and proposed action. Exclude structural separators from spoken coverage only when evidence shows they are unspoken.

Classify into:
1. Correct audio and verified timings: preserve.
2. Correct audio, timings missing: align or recover an existing candidate.
3. Correct audio, timings invalid: repair the timing data.
4. Recoverable paragraph/chapter mapping mismatch: prove the correspondence before remapping.
5. Missing, damaged or substantively different audio: separate audio-repair decision.
6. Text scheduled for replacement, content/rights hold or uncertain voice: hold with a named reason.

Deliver a per-edition checklist, affected paragraphs, audio hours, reasons and ready/held totals. No old count becomes the new backlog without rechecking.

## 2. Recover completed work before purchasing compute

Revalidate saved candidates and replay retained recognition diagnostics using the appropriate pinned helper. Reuse only when text, audio and processing identities match. Reconcile helper-specific holds against actual runner state; content holds do not disappear when a helper changes.

Do not retry unchanged rejected paragraphs blindly. Fix a demonstrated shared normalization/mapping defect once and test it against both failures and unaffected examples. Keep the 0.85 observed-token gate; it is a rejection screen, not a claim of millisecond timing accuracy. Do not add arbitrary homophone substitutions or fabricate confidence/timestamps to pass it.

## 3. Run a small representative pilot

Proposed starting size: about ten chapters, chosen from the fresh ledger rather than named in advance. Cover ordinary prose, long chapters, dialogue/speaker labels, headings/numbered prose and at least one previously rejected case. Include retained modern-English audio if available.

Compare reusable results with a fresh alignment only where needed. For unresolved recognition failures, evaluate a stronger recognizer or transcript-guided alignment on a few affected paragraphs; this is a fallback experiment, not a dependency switch or full-corpus rerun.

Validate exact edition/paragraph mapping, word coverage, monotonic timestamps, audio bounds and start/middle/end acoustic anchors. Inspect every suspect boundary and final spoken word. Check reader highlighting, seeking, resume, speed changes and paragraph/chapter transitions in an isolated muted browser. Any audible review needs a separately agreed listening window.

Deliver measured pass/fail results, remaining failure classes, runtime and cost per audio hour. Choose the broader budget and method from these measurements; prior runs' costs are not a current quotation.

## 4. Finish ready editions, then handle exceptions

Rank eligible editions by likelihood of completion and retained reader value. Repair only missing/invalid timings; preserve good recordings and timings. Resume from verified checkpoints and keep one publication owner.

For a genuine recording defect, identify the smallest affected paragraph/chunk and the voice/source needed. Do not regenerate a book to fix its timing. Do not quietly introduce WaveNet halfway through an existing Bella recording: any voice replacement belongs to the broader voice-strategy decision. Do not re-chapter published text merely to fit old audio or disturb saved reading positions.

Before paid execution, confirm the available cloud credentials, current jobs, reviewed runner/helper pin, provider-independent termination, and an explicit spend ceiling. A worker timeout alone does not stop provider billing. This plan starts no paid jobs.

## 5. Publish with evidence and keep repairs valid

Missing timing objects can use the existing create-only publisher. Already-present but incorrect timing objects require a separate versioned/conditional replacement path with previous bytes preserved; the current publisher deliberately refuses overwrites. Stage and validate those repairs before changing what the reader receives.

For every publication, verify production serves the expected bytes and re-run structural/text checks. Record the text/audio hashes, voice, helper/model/configuration and publication outcome. Recheck the entire affected edition, not only the repaired chapter.

Future text changes must invalidate only dependent audio/timing chunks. Unchanged recordings remain reusable. If spoken text changes, old timings cannot simply be attached to a new recording.

## Completion and next action

A retained Bella edition is complete only when all intended spoken paragraphs have matching recordings and accepted timings, representative acoustic/reader checks pass, and no unresolved exceptions are hidden by an availability flag. Report held material separately with its reason and next action.

Next execution step: the read-only ledger in step 1. Then a bounded pilot proposal with exact targets, method and spend ceiling. App implementation, timing publication and paid repair work remain future execution stages.
