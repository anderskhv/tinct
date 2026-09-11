# Audio word highlighting — moving execution off the laptop

September 11, 2026. Written from a Claude cloud session
(`session_01TEYxdpbuL2oCZhBUWxf4Q5`), working on branch
`claude/wonderful-cerf-0vhcs3`.

This records what is actually true about the audio word-highlighting work right
now, what has been moved into the cloud, and the two things that still need
Anders before cloud execution can replace the Mac. It does not restate the
plan; the plan is `audio-highlight-completion-plan-2026-09-10.md` and it stands.

## What this session verified independently

All of the following was measured from this cloud container against
**https://tinct.app**, with no access to any local machine, using the public
read routes the app itself uses.

The status Anders reported checks out, item by item:

| Reported | Verified on production |
| --- | --- |
| 17 chapter repairs published, served bytes verified | The named repair targets are present and serve: The Manual `original-en` ch52, Social Contract `original-en` ch23 and ch46, `modern-en` ch22 and ch46. |
| Macbeth canary published | `macbeth/original-en/ch1/words.json` serves 11,603 bytes at SHA-256 `18cd10f6…51751`, the exact hash recorded in the plan. |
| Magna Carta `original-en` ch1 awaiting review | Not published. `modern-en` ch1 is published; `original-en` ch1 returns 404. |
| U.S. Founding Documents `modern-en` ch2 processing locally | Not published. ch1 is published, ch2 returns 404. |
| A Little Princess `modern-en` prepared, not launched | Not published. ch1 and ch2 both return 404. |

Re-validated three published repairs end to end — identity, paragraph mapping,
coverage, timestamp bounds and agreement with the published edition text.
Macbeth ch1, Social Contract ch23 and The Manual ch52 all pass every check with
a perfect token match against the edition text. The manifest's `paragraph: -1`
title track is correctly excluded from the timings rather than mistimed.

## What the inventory actually is

Parsed from `app/src/data/bookRegistry.ts` on `main` and confirmed against
production: **100 public books, 201 English editions, 169 flagged `hasAudio`,
32 unflagged.** Four books have no English edition flagged for audio at all —
Walden, A Vindication of the Rights of Woman, The Comedy of Errors, The Death
of Ivan Ilyich. These figures match the completion plan exactly.

Two findings the flags hide:

- **30 of the 32 "unflagged" English editions do have chapter-1 audio in
  production.** The flag is stale, not the recording. Only Ivan Ilyich
  (`original-en` and `modern-en`) genuinely has no audio manifest. Walden,
  Vindication and The Comedy of Errors all have audio despite having no
  flagged edition.
- Chapter-1 word timings exist for **70 of 201** English editions. 129
  editions have a chapter-1 recording and no chapter-1 timings.

The "147 eligible / 54 held / 90 discoverable" split is **not in any branch on
GitHub**. Neither is `docs/audio-edition-availability-2026-09-10.md`. There is
no eligibility or hold gating anywhere in the pushed app code. That work exists
only on the Mac.

## The full census

A complete sweep of every English edition on production, run from this cloud
session, is in `artifacts/audio-highlight-census-2026-09-11/`:

| | |
| --- | --- |
| Chapters with a recording | 12,411 |
| Chapters with word timings | 7,547 |
| Chapters missing word timings | 4,864 |
| Audio hours total | 1,742.9 |
| Audio hours missing timings | 1,103.5 |

By edition: **11 complete, 123 partial, 65 with no timings, 2 with no audio.**
Only **8 of 100 books** have one complete English edition. The 1,103.5 missing
hours corroborate the 1,094.67 measured on the Mac the day before; the
difference is the unflagged editions this sweep also covers.

The cheapest real progress available: **29 editions are within five chapters of
complete — 74 chapters, 37.1 audio hours.** Clearing that queue takes complete
English editions from 11 to 40. `finish-first-queue.json` has it in order. That
is the batch to run first when GPU access returns, ahead of re-attacking the
hard classes.

## Are the timings that exist any good?

Yes, as far as automated cross-checking can establish. `verify_timings.py` was
run over a 500-chapter spread across 134 editions — 11,373 paragraphs and
1,269,102 timed words. **All 500 passed every check.** 498 matched the edition
text perfectly on their weakest paragraph; the lowest worst-paragraph score in
the sample was 0.9231, well clear of the 0.85 gate.

Nobody had checked this before. It means the remaining work is genuinely about
the 4,864 chapters with no timings, not about repairing the 7,547 that have
them. It does not replace acoustic review: a sidecar can match the text
perfectly and still drift against the recording, which is what the plan's
anchor checks exist for.

## The safety problem this turned up

`app/tts/pod-watchdog.py` is the thing that actually stops RunPod pods — it
polls every five minutes, kills stalls, and stops pods on completion because
"this was the #1 source of waste". It runs on the Mac, from `/tmp` state files,
under `nohup`.

So today, **remote termination depends on Anders's laptop staying awake**. The
45-minute in-process cap does not help: as `app/tts/diagnostic_pilot/README.md`
says in as many words, the process cap does not terminate a provider pod or
stop its billing. If the Mac sleeps mid-run, nothing stops the meter.

That has to be fixed before any further GPU launch, not after.

## What has been moved into the cloud

`tools/audio-highlight/` — see its README. Everything there runs from any cloud
worker; nothing reads a path under `/Users`.

- **Census and verification need no credentials at all.** They work today.
- **`verify_timings.py` is the part that was missing.** Presence of a
  `words.json` proved nothing before; this checks identity, paragraph mapping,
  coverage, timestamp bounds and edition-text agreement at the existing 0.85
  threshold. It does not lower the threshold and does not invent values.
- **`publish_timings.py`** validates first, refuses to overwrite, uploads
  conditionally, re-reads the bytes production serves and compares hashes, and
  journals every outcome. Two owners can run it at once without clobbering.
- **`runpod_guard.py`** enforces the $1/hr ceiling, the 50-minute deadline and
  the $25 envelope from outside any laptop, and only touches pods carrying the
  owner prefix. Other RunPod resources are reported, never removed.

Two scheduled workflows drive them:

- `.github/workflows/audio-highlight-audit.yml` — census plus rotating
  verification every six hours, committing the ledger to the
  `audio-highlight-ledger` branch. Red build if a published sidecar is invalid.
- `.github/workflows/audio-gpu-guard.yml` — spend enforcement every five
  minutes. **Inert until `RUNPOD_API_KEY` is a repository secret.** It warns
  rather than pretending to be armed.

An hourly Claude cloud Routine supervises this session and reports.

## Durable storage, and what does not need transferring

Most of what looked like it needed moving off the Mac does not:

- **Edition text** is published at `/data/editions/{bookId}-{edition}.json` and
  is tracked in git (393 files). Reachable from anywhere.
- **Recordings and manifests** are readable from anywhere through
  `/api/audio-file` and `/api/audio-manifest`.
- **Published sidecars** are readable the same way, and now verifiable.

So the *inputs* to alignment can be rebuilt in the cloud by hash without the
Mac. What genuinely cannot be rebuilt without re-spending compute is the
accumulated evidence: `output/word-timing-diagnostic-pilot-2026-09-10/`
(diagnosis ledger, raw recognition, local ASR probe) and
`output/audio-highlight-execution-2026-09-10/`. Those are on the Mac and in no
branch. The prepared-but-unrun A Little Princess batch is cheap to rebuild;
the raw recognition results are not.

Git is the durable store for tools, ledgers and results: content-addressed,
provenanced by commit, already mirrored off the machine. Raw audio stays in R2,
where it already is.

## Two things that genuinely block cloud execution

Neither is a decision — both are access, and both should be configured as
secrets, never pasted into a chat.

1. **`RUNPOD_API_KEY`.** Without it this session cannot see what is running,
   cannot establish single ownership, cannot avoid launching a duplicate of
   whatever `gpu-package/continue_bulk03.py` may already have started, and
   cannot guarantee termination. Until it exists, this session launches
   nothing.
2. **`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`** (the variables
   already named in `app/.env.example`). Without them the cloud can validate
   and verify but cannot publish a single sidecar.

Set both in the Claude Code web environment's secrets and in the repository's
GitHub Actions secrets. The moment `RUNPOD_API_KEY` lands, the five-minute
guard arms itself with no further action.

## Setup, precisely

Three actions, none of which involves sending a secret through a chat message.

**1. `main` has been reconciled with production — September 11.**

Production was **not** running `main`. It was running the lab launch-switch
build: `/app` redirects to `/library`, the SPA is at `/reader`. `main` was 182
commits and 327 app source files behind it, because that build was deployed by
hand from the Mac rather than through GitHub. Since `deploy.yml` deploys `main`
on every push, merging anything into `main` would have redeployed week-old code
over the live build — and reported green while doing it, because `main`'s own
smoke test asserted `main`'s old routes.

The deployed commit was identified as **`93f7b9d9`
(`codex/compact-highlight-menu-20260910`)** by fingerprinting the live JS
bundle: it carries ten string literals unique to that branch — `popup-compact-menu`,
`Highlight colour`, `Back to information` among them — and none from the other
candidate tip. That commit is a strict descendant of `main`, so the fix was a
fast-forward rather than a merge.

`main` was therefore fast-forwarded to the deployed commit with this branch's
tooling on top. The app source landing on `main` is **byte-identical to what
production was already serving** — `git diff 93f7b9d9 HEAD -- app/` is empty —
so the redeploy changed nothing for readers. What it did change is that `main`
now matches reality, the fixed smoke test finally reached the default branch,
and the scheduled workflows can run.

If a later hand-deploy from the Mac puts production ahead of `main` again, this
whole hazard returns. Deploying through `main` is what prevents it.


**2. RunPod key.** RunPod console → Settings → API Keys → create a key with
read/write. Add it as `RUNPOD_API_KEY` in two places:
  - the repository's GitHub Actions secrets (Settings → Secrets and variables →
    Actions → New repository secret), which arms the five-minute guard as soon
    as the workflow reaches the default branch;
  - the Claude Code web environment's secrets, so this session can see pod
    state and stop pods directly.

**3. R2 write credentials.** Cloudflare dashboard → R2 → Manage R2 API Tokens →
Create API token with object read/write on `tinct-audio`. It returns an Access
Key ID and a Secret Access Key. Add them to the same two places as:
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_ENDPOINT` — the S3 endpoint Cloudflare shows next to the token,
    `https://<account-id>.r2.cloudflarestorage.com`

All three go in a secrets field, never in a file and never in a chat message.

### On the smoke test

An earlier draft of this document said `scripts/smoke-test.sh` was stale and
worth fixing. That was half right. The copy on `main` is stale — but the
deployed branch **already fixes it**, moving the SPA check to `/reader` and
updating the landing-page assertion. Running that fixed version against
production passes all 15 checks. Nothing needs writing; the fix simply has not
reached `main`, for the same reason nothing else has.

## Standing rules for whoever executes

- One owner. This session does not start GPU work while the Mac controller's
  state is invisible.
- Publication creates, never replaces; a key that exists is skipped and
  journalled.
- A publication counts only when production has served the bytes back at the
  expected hash.
- The 0.85 paragraph threshold does not move, and no timestamp or confidence
  value is ever synthesised.
- Reading access and saved positions are never traded for audio progress.
