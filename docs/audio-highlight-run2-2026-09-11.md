# Audio word highlighting — GPU run 2

September 12, 2026. Execution owner: a Claude cloud session on branch
`claude/audio-run2-20260912`. Evidence lives in
`artifacts/audio-highlight-run2-2026-09-11/`; the live operational state is
`artifacts/audio-highlight-run2-2026-09-11/STATE.md`, rewritten as the run
moves. Brief: `docs/audio-highlight-run2-brief-2026-09-11.md`.

## Status at this push — in progress

This session is the **third** to own run 2. The first never pushed; the second
pushed its survey and queue (`dc2278edc`) and was then killed by a container
restart at 05:25 UTC with eight pods still billing.

### Adopt, not terminate

`runpod_guard.py status` found **eight** owned pods RUNNING, not the five named
in the handover: `tinct-words-run2-11` through `-18`. Every one carried
`TINCT_TOKEN` and `TINCT_TARGETS` in its RunPod environment, so
`gpu/adopt.py` could recover the read-only status server of each and finish the
job the dead orchestrator started. All eight were adopted within four minutes of
session start; the first status poll reached every pod, and together they held
**all 65 wave-1 chapters**. Terminating would have thrown away 65 chapters of
GPU work that was already 3-6 minutes in, and would have had to buy it again.

Adoption is the right default whenever the pods still answer: the decision cost
about ninety seconds of reading `adopt.py` and one API call per pod to confirm
the token was there.

### Capacity

COMMUNITY cloud had no instances of any of the seven allowed GPU types.
SECURE had some at the same $0.49/hr, so wave-2 pods run with `--cloud SECURE`.
Concurrency saturates around 12 pods; `dispatch.py` retries refused launches
(they cost nothing) and keeps the queue moving.

## Numbers

Filled in at close from `run_summary.py` and the publication journal.

## Rejection classes seen so far

Helper v2's normalisation removed the underscore/footnote/ellipsis classes that
blocked run 1, but three classes survive and each one fails a whole chapter on a
single paragraph:

- **contractions** — text "You are quite right, he replied.", recogniser hears
  "You're quite right, he replied." (`the-republic` ch3, 1 of 497 paragraphs,
  ratio 0.67).
- **grouped numerals** — text "Totals 2,186 550,943 378,347 £165,463", heard as
  "Totals 2 ,180 6 ,550 ,940 3 ,378 ,347 £165 ,463" (`wealth-of-nations`, the
  statistical tables; ratio 0.43).
- **speaker-name punctuation and elisions** — "Antonio. He'ld sow't with
  nettle-seed." heard as "Antonio, He 'ld sow't with nettle -seed."
  (`the-tempest` ch3, 1 of 170 paragraphs, ratio 0.80).

None of these is a timing error — the words are in the right places; the
comparison tokenizer and the recogniser disagree about how to spell them. They
are the natural run-3 normalisation candidates, in that order.

## Status at close — 934 chapters published and verified, nothing billing

- **934 chapters published**, every one validated against production truth
  before upload, uploaded with `If-None-Match` so nothing was ever overwritten,
  and re-read from `tinct.app` afterwards at the journaled SHA-256. The journal
  (`artifacts/audio-highlight-run2-2026-09-11/publication-journal.json`) records
  934 `published` and 5 `skipped`, and **zero** served-hash mismatches.
- **Spend: $17.32 of the $20 envelope**, by the mandate's measure (every pod
  record's `costPerHr x uptime`, plus the $0.16 the previous session had spent).
  85 pod records, 2022 pod-minutes, every pod at $0.49-$0.50/hr against a
  $1.00/hr ceiling.
- **62 editions advanced. Zero editions reached completion.** This is the
  run's real finding and it is not a GPU problem: every edition that got close
  is held open by two or three chapters that fail the 0.85 gate on both arms,
  and those failures are all the same three normalisation classes below. More
  pod time cannot finish a single edition; a tokenizer revision can finish
  dozens.
- **18 wave-2 batches were never dispatched** — the dispatcher stopped launching
  at $15.79 to keep the close-out inside the envelope. They are the run-3 queue.

### Editions within three chapters of complete

| edition | timed / total | gained this run | short by |
| --- | --- | --- | --- |
| `beowulf/original-en` | 43/45 | +43 | 2 |
| `frederick-douglass/original-en` | 12/14 | +2 | 2 |
| `jungle-book/original-en` | 7/9 | +6 | 2 |
| `the-art-of-war/original-en` | 13/15 | +13 | 2 |
| `antigone/original-en` | 10/13 | +10 | 3 |
| `candide/original-en` | 29/32 | +29 | 3 |
| `communist-manifesto/original-en` | 4/7 | +1 | 3 |
| `frankenstein/original-en` | 27/30 | +4 | 3 |
| `genealogy-of-morals/original-en` | 3/6 | +1 | 3 |
| `hume-enquiry/original-en` | 18/21 | +2 | 3 |
| `jekyll-and-hyde/original-en` | 9/12 | +2 | 3 |
| `medea/original-en` | 6/9 | +4 | 3 |
| `midsummer/original-en` | 8/11 | +2 | 3 |
| `nicomachean-ethics/original-en` | 9/12 | +2 | 3 |
| `notes-from-underground/original-en` | 20/23 | +1 | 3 |
| `oedipus-at-colonus/original-en` | 10/13 | +1 | 3 |
| `oedipus-rex/original-en` | 10/13 | +10 | 3 |
| `poetics/original-en` | 25/28 | +25 | 3 |
| `the-awakening/original-en` | 38/41 | +23 | 3 |
| `the-histories/original-en` | 1197/1200 | +17 | 3 |

## Pods

85 pod records under `artifacts/audio-highlight-run2-2026-09-11/pods/`, every
one stopped and then terminated. Outcomes: 61 `done`, 9 `done-with-errors`,
12 `pod-exited-externally` (SECURE-cloud hosts reclaimed mid-job; each was
harvested from its last four-minute snapshot, so the work was not lost), 1
`failed`, 1 terminated externally by the coordinator (pod 99, below).

Run the tables from the evidence with:

    python3 tools/audio-highlight/gpu/run_summary.py \
      artifacts/audio-highlight-run2-2026-09-11

## Two interruptions, both survived

**The container restart (05:25 UTC).** Eight pods were left billing with no
launcher. All eight were adopted rather than terminated (see above) and all 65
wave-1 chapters were recovered.

**Pod 99 (09:10 UTC).** The coordinator ran `runpod_guard.py stop-all
--terminate --apply` intending to clear the eight long-dead pre-run-2 pods; the
already-EXITED ones were unaffected and the only pod actually terminated was the
live `tinct-words-run2-99`. Its four-minute snapshot (09:07:59, 12.4 MB) was
extracted and harvested normally and **five chapters were published from it** —
at most three minutes of alignment was lost, and its batch did not need
re-running.

To scope that cleanup safely, the guard already takes a name filter, and it only
ever acts on pods matching it:

    python3 tools/audio-highlight/runpod_guard.py stop-all --terminate --apply \
      --owner-prefix tinct-words-shard-
    python3 tools/audio-highlight/runpod_guard.py stop-all --terminate --apply \
      --owner-prefix tinct-audio-bounded-trial-

Run each prefix separately, and run it **without** `--apply` first — that prints
exactly which pods would be touched and changes nothing. A bare `stop-all` uses
the default prefix, which matches live run pods too.

## What run 3 should do, in order

1. **Normalisation revision, not GPU time.** Contractions, grouped numerals and
   speaker-name punctuation (documented above) are what stand between this run
   and several dozen finished editions. Each is a comparison-tokenizer question;
   none is a timing error. Ship it as helper v3 with unit tests per class, the
   way v2 was shipped, and re-run only the rejected chapters — they are cheap.
2. **The 18 undispatched wave-2 batches** (`pending.json` at close), then the
   rest of the Priority-1 queue.
3. **The repair queue and the four missing recordings**, unchanged from run 1.

Unchanged from the brief and untouched by this run: `bible/*`, `magna-carta`,
`faust-part-1`, `as-you-like-it`, `henry-iv-part-2`, `taming-of-the-shrew`,
Phaedo's spelled-out-speaker chapters, and everything not English. Nothing was
synthesised; the gate stayed at 0.85; neither pinned helper was touched.
