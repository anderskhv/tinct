# Modern-EN repair — audio and highlight-sync impact

Every book in the repair queue **already has published `modern-en` audio**, and
most chapters already have word-timing sidecars. Repairing the text therefore
invalidates finished audio work. This file records the scope and the two
blockers, so the decision is made deliberately rather than discovered after a
deploy.

Figures from `origin/audio-highlight-ledger:ledger/coverage.json`
(the scheduled census in `tools/audio-highlight/audit_production.py`).

## `modern-en` audio invalidated by the repair

| Book | Chapters with audio | Hours | Timing sidecars | Batch |
|---|---|---|---|---|
| heart-of-darkness | 3 | 2.8 | 1 | 1 (pilot) |
| the-awakening | 39 | 4.5 | 35 | 1 |
| walden | 18 | 9.7 | 14 | 1 |
| vindication-rights-of-woman | 15 | 8.4 | 14 | 2 |
| jungle-book | 7 | 3.7 | 4 | 2 |
| brothers-karamazov | 96 | 32.1 | 27 | 2 |
| **Total (batches 1-2)** | **178** | **61.2** | **95** | |
| confessions *(other branch)* | 13 | 10.0 | 13 | separate |
| ulysses *(excluded)* | 18 | 29.6 | 1 | – |
| jerusalem *(excluded)* | 18 | 6.6 | 18 | – |

`original-en` audio is unaffected — the repair does not touch `original-en`.

## Why per-paragraph tracking

Audio is generated and timed per paragraph, so only paragraphs whose text
actually changed need a new recording and a new sidecar entry. A paragraph left
byte-identical keeps both. `change_manifest.py` records the changed indices per
chapter at repair time, before the candidate overwrites the live file, and
writes `manifests/<book>-changes.{json,md}`. That manifest is the regeneration
queue. On the pilot chapter roughly three quarters of paragraphs change, so the
saving is real but partial — assume most of the 61.2 hours is re-recorded.

## Blocker 1 — the timing publisher creates, it never replaces

`tools/audio-highlight/publish_timings.py` skips any key that already exists and
journals the skip. This is deliberate, and `tools/audio-highlight/README.md`
lists it under "rules this tooling will not bend": it is what stops two owners
clobbering each other. A repaired chapter needs its sidecar *replaced*, which
the current tooling will refuse. Resolving this needs a decision from Anders —
version the keys per text revision, or add an explicit supersede path with its
own journal entry. **Do not work around it by loosening the publisher.**

## Blocker 2 — the scheduled audit goes red as soon as repaired text deploys

`verify_timings.py` checks that a published sidecar's timed words match the
**published edition text** at the 0.85 acceptance threshold, and
`.github/workflows/audio-highlight-audit.yml` runs that every six hours and
fails the run if any published sidecar is invalid. The moment repaired
`modern-en` text reaches production, every existing sidecar for a repaired
chapter falls below the threshold and that workflow starts failing — correctly.

Consequences, in order of preference:

1. Hold repaired text out of production until its audio is regenerated, keeping
   text and audio in step per book.
2. Deploy text first and accept a red audit for a known, time-boxed window,
   with the affected chapters recorded here so the failures are expected rather
   than alarming.

**Decided 2026-09-17 (Anders): option 1.** Repaired text is held out of
production until its audio and word-timing sync are regenerated. Text and audio
ship together, per book. Nothing repaired goes live on its own.

## Order of operations per repaired chapter

1. Repair text, gate, Opus check.
2. `change_manifest.py` — record changed paragraph indices (before overwrite).
3. `write-chapter.py` — text into the live edition on the branch.
4. Regenerate Kokoro audio for changed paragraphs only.
5. Re-align, `verify_timings.py`, publish sidecar — **blocked on blocker 1**.
6. `modern-da` re-translation from the repaired `modern-en`, then Danish audio
   only if explicitly requested (Danish audio is opt-in per `books/CLAUDE.md`).
