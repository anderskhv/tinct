# Audio word highlighting — GPU run 1

September 11, 2026. Execution owner: a Claude cloud session on branch
`claude/audio-exec-run1-20260911`, spawned by the Tinct coordinator. This file
is the running report; it is rewritten at every push. Evidence lives in
`artifacts/audio-highlight-run1-2026-09-11/`. The tables at the bottom are
generated from that directory by `tools/audio-highlight/gpu/run_summary.py`.

## Status at this push — 3: batches 1–4 published, pods 5–7 running

- **75 chapters published and verified** on production R2; **6 editions
  complete**: Crito, Meditations, Phaedrus, Symposium, U.S. Founding
  Documents, Utilitarianism.
- Pods 1–4 done and terminated; estimated spend so far **$0.40** of $25
  (four pods on RTX A4500 at $0.19/hr, plus $0.01 for a pod that failed
  its CUDA probe in 1.4 minutes and was terminated).
- 16 chapters failed the 0.85 gate on both arms and are not published.
  7 chapters were cut off by the worker's time cap in the plays batch and are
  re-queued as `batch-13-leftovers.json`. 2 chapters were dropped before
  alignment for a missing paragraph recording (repair class).
- Pods 5, 6 and 7 running batches 5–7. Guard loop enforcing every 5 minutes;
  `runpod_guard.py` was patched on this branch so it reads uptime from
  `lastStartedAt` (the REST pod list has no runtime block, so before the
  patch a running pod read as zero minutes and the 50-minute deadline could
  never fire). Test added.

### What the rejections look like

Every rejection so far has correct or near-correct recognition of the
speech; the expected-token side carries markup the tokenizer does not strip.
Observed classes, beyond the underscore class already recorded in the
priority-1 artifact:

1. **Hyphen compounds split by the recogniser** — "wage-labour", "Tut-tut",
   "Good-night", "poison-fire", "straw-colour" come back as two tokens.
   The most frequent class by far, and the one behind most short-paragraph
   failures.
2. **Spaced ellipses and double hyphens as tokens** — ". . ." and
   "lieth--and" in the verse plays (Medea, Oedipus at Colonus, The Tempest).
3. **Bracketed footnote markers** — "[28]", "[Greek: eunouchos]" in Hume.
4. **A speaker name spelled out in the recording** — Phaedo ch1 and ch7:
   "Echecrates:" was narrated as "E-C-H-E-C-R-A-T-E-S". That one is an
   audio defect, not a tokenizer one.
5. One recognition failure: `odyssey/original-en` ch3 p37, where the
   recogniser looped a sentence. Genuine ASR miss; the gate did its job.

Nothing was changed to get past any of them: the threshold, the helper and
`trial.py` are untouched. Classes 1–3 are candidates for the same
normalisation decision Anders already has in front of him; class 4 needs a
re-recording of the affected paragraphs.

### Batch sizing lesson

Batch 2 (the plays: Bacchae, Medea, Midsummer, Oedipus at Colonus, The
Tempest, plus Odyssey and Symposium) hit the 2,100 s worker cap after 30 of
36 chapters. Per-paragraph overhead dominates in drama — 3,317 paragraph
diagnostics against 1,170 for a prose batch of similar audio length — so
hours of audio understate the work. The remaining batches are prose with long
paragraphs and finish inside the cap; The Tempest's unfinished chapters go in
the leftovers batch on their own.

### Credentials

Present by name in the environment: `RUNPOD_API_KEY`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`. No value has been printed, logged, or
committed. The pod receives none of them.

### One thing for Anders, not for this run

The 8 pre-existing exited `tinct-*` pods and the foreign pod each still hold
a 20–50 GB volume; `/billing/pods` shows each billing $0.15–0.33 per day for
disk with zero compute time — about **$1.60/day across the nine**. The
mandate says stop, never delete, and those volumes may hold the Mac's raw
recognition results, so this run does not touch them. Pods created by this
run carry **no volume** and are terminated, not merely stopped, once their
results are fetched.

### Queue selected

Source: `artifacts/audio-highlight-priority1-queue-2026-09-11/p1-finish-queue.json`
(36 editions, 206 chapters), cheapest edition first, filtered twice:

| filter | editions affected | chapters removed |
| --- | --- | --- |
| Mandate exclusions (`magna-carta`, `faust-part-1`, `as-you-like-it`, `henry-iv-part-2`, `taming-of-the-shrew`, `bible/*`) | 1 present in the queue: `magna-carta/original-en` | 1 |
| Normalisation class 1 (underscore tokens cap a paragraph under 0.85, so the unmodified aligner rejects the whole chapter) | 12 | 28 |

That leaves **177 chapters across 35 editions, 93.2 audio hours** in
`run-queue.json`. The 29 skipped entries and their reasons are in
`skipped.json`.

Why skip the class-1 chapters rather than run them: the scan in the
priority-1 artifacts measured a per-paragraph ceiling below the gate for each
of them. Running them would spend GPU time on a certain rejection. The fix
belongs in the pinned helper and is a decision recorded for Anders in that
artifact's README; nothing here touches the threshold or the helper. Editions
that contain such a chapter (for example `bacchae`, `frankenstein`,
`medea`) cannot reach *complete* in this run, but their alignable chapters
are still processed and published individually.

### How the GPU work runs

`tools/audio-highlight/gpu/` (new on this branch):

- `pod_job.py` — the fixed job a pod runs. Batch arrives in the pod's
  environment at creation; aligner fetched from one pinned commit
  (`a3780bee`); model fetched from Hugging Face at revision `d1d751a5…` and
  its tree hash must equal the canary's pin `f1fe271c…` or the job stops;
  recordings and text from tinct.app. The pod holds **no credentials**. Its
  only network surface is a GET-only status/results server behind a per-pod
  random token. It accepts no uploads and no commands.
- `orchestrate.py` — creates the pod (on-demand, cheapest available GPU
  under $1/hr, no volume), waits, polls, pulls results, then stops and
  terminates it at a 44-minute launcher deadline — below the guard's 50.
- `guard-loop.sh` — `runpod_guard.py enforce --apply` every 5 minutes from
  this session, with finished-pod spend carried in `spent.txt`.
- `run_summary.py` — renders the tables below from the artifacts.

Model pin resolved: the canary's `f1fe271c…` is the tree hash of the **full
snapshot** (six files, no allow-patterns) at revision `d1d751a5…`, and
`model.bin` is the same blob (`62b2a45b…`) at that revision and at `main`.
Reproduced locally, then on every pod (recorded in each `pod.json`).

Settings: `--device cuda --compute-type float16 --arms off auto`, gate 0.85,
`trial.py` unmodified. float16 is `trial.py`'s own GPU default; the CPU canary
used int8 only because it ran on CPU. The one chapter from the local smoke
test (`phaedo/original-en` ch6) was aligned on CPU at int8 with the same
model, code and gate; both arms passed and the candidate validated against
production before it was published.

### Measured throughput

Pod 1: 12,786 s of audio through both arms in 743 s — **17× realtime for the
pair**, on an RTX A4500. Cohort download from tinct.app: 62 s for 3.55 hours.
Setup (pip, model, CUDA probe): 12 s. At that rate one pod within the
44-minute launcher deadline clears about 9 audio hours, which is how batches
2–12 were cut (`batch-N.json`). Cost per pod ≈ $0.15; the whole 93-hour queue
projects to well under $3.

### Why the two failures failed

Both are short paragraphs where one token decides the ratio, with correct
recognition of the speech:

- `communist-manifesto/original-en` ch3 p19: text "Let us now take
  wage-labour."; heard "wage -labour" as two tokens. Ratio 0.80.
- `notes-from-underground/original-en` ch17 p19: text "A fortnight."; heard
  "A Fortnite." Ratio 0.50. p24: "There ... in Riga." — the ellipsis is an
  expected token nothing can match. Ratio 0.75.

Neither is an audio defect. They are gate rejections at the unmodified 0.85
threshold and stay unpublished; full diagnostics are kept under
`pods/tinct-words-run1-1/rejected/`.

### What is committed and what is not

Per pod: `pod.json` (timestamps, GPU, rate, outcome), `orchestrator.log`,
`batch.json`, the job's `status.json` and logs, both arms' `chapter.json`,
`collect-report.json`, `candidates.json`. Per-paragraph recognition
diagnostics and per-arm candidate sidecars are git-ignored for passing
chapters (the published bytes are on R2 and hashed in the journal) and kept
in full for rejected chapters.

### Next

1. Harvest and publish batches 5–7 as each pod finishes; push.
2. Launch batches 8–12 and the leftovers batch, three pods at a time.
3. Final push with the guard's closing `status`.

## Pods

| pod | id | gpu | $/hr | created | terminated | uptime min | outcome | est. $ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tinct-words-run1-1 | `5smmp2998eevju` | NVIDIA RTX A4500 | 0.19 | 12:19:55 | 12:34:03 | 14.1 | done | 0.04 |
| tinct-words-run1-2 | `5ji31k7j0db2vq` | NVIDIA RTX A4500 | 0.19 | 12:35:37 | 13:15:13 | 39.5 | done-with-errors | 0.13 |
| tinct-words-run1-3 | `lli7qxhiig3qrw` | NVIDIA RTX A4500 | 0.19 | 12:35:39 | 13:11:40 | 35.9 | done | 0.11 |
| tinct-words-run1-4 | `dsrtidan8r3ju1` | NVIDIA RTX A4500 | 0.19 | 12:35:41 | 13:09:04 | 33.3 | done | 0.11 |
| tinct-words-run1-5 | `ewn71l34h2zdaa` | ? | 0.19 | 13:12:19 |  |  |  | 0.00 |
| tinct-words-run1-6 | `44vq3tivfgioyl` | ? | 0.22 | 13:12:22 |  |  |  | 0.00 |
| tinct-words-run1-7 | `f93pwrhxtctc66` | NVIDIA GeForce RTX 4090 | 0.34 | 13:15:20 | 13:16:47 | 1.4 | failed | 0.01 |
| tinct-words-run1-7 | `y58l6eo16iu3hk` | ? | 0.19 | 13:17:14 |  |  |  | 0.00 |

Estimated spend across pods (costPerHr × uptime): **$0.40**.

## Published and verified — 75 chapters

| edition | ch | SHA-256 | bytes | at (UTC) |
| --- | --- | --- | --- | --- |
| `phaedo/original-en` | 6 | `fbd76339172ca66b55c717c007bec9f704851948cc87ae3d085c85eed7969aaa` | 39931 | 12:19:38 |
| `crito/original-en` | 1 | `3be771fe96b1df17a1c450c88928a29404e07bb031351069e27ab7b8cd5852ef` | 51084 | 12:34:22 |
| `crito/original-en` | 2 | `4195f5befacbe04935bc91d96efe64ab555e7919362405c234461b2cd80f0698` | 267336 | 12:34:25 |
| `crito/original-en` | 3 | `22070f80c629208afbc4e139c43e98bba0662f23eeefad3e981ece4914ed53fe` | 220815 | 12:34:28 |
| `frederick-douglass/original-en` | 2 | `a9ce338c8b6ae69757492696e6ee81069519f4c8a647bc5166bf3d662b9d90d0` | 196563 | 12:34:31 |
| `meditations/original-en` | 11 | `08045759f72772d0d793b18ef423ba2ad01007ab11cdc903c896046bb79dd561` | 439041 | 12:34:34 |
| `meditations/original-en` | 6 | `cf22eb2588024f033aa68b455e0e480ca602c4c7650683e6c24467826423cdd5` | 545984 | 12:34:36 |
| `notes-from-underground/original-en` | 14 | `8d9331bdeb1e0c63df1b2de46cc792cd39186c34a3fa8a6ac14f0fec3b56bc1c` | 348623 | 12:34:40 |
| `us-founding-documents/original-en` | 1 | `291178b52cb9d14c00a59f1267ea5365cb81051be11c5f85128a1aa3267a84bf` | 136646 | 12:34:43 |
| `us-founding-documents/original-en` | 2 | `c957eda569766652382c29a0ee32e462db9ee9ab32dc19da2bf47f924e9c64b4` | 446459 | 12:34:45 |
| `us-founding-documents/original-en` | 3 | `7ead3f045f73b56847bfaad7994f8967d1c4e6e67c72a1076e7813ba8a353362` | 48930 | 12:34:48 |
| `us-founding-documents/original-en` | 4 | `670a2815be143933f7b7ebdb47adf4fe8288c51c10bdca92fdbdf8c06e464f4e` | 258092 | 12:34:50 |
| `descartes-meditations/original-en` | 1 | `3f37aae4c7254c94f5827010a2905da142fa181200a34cb1d1d51a96cb875a5c` | 173745 | 13:09:55 |
| `descartes-meditations/original-en` | 2 | `5df8e95f5dc04de52596494184fd82d2361c39e7526add787b143bafa850d1cc` | 116087 | 13:09:59 |
| `descartes-meditations/original-en` | 3 | `61ca73e8c916291ebc1b996a5f5f80b1b8220de3df7f98ff537565984a083f14` | 139065 | 13:10:01 |
| `descartes-meditations/original-en` | 4 | `f6711e52b5b34ff0cebbbbc6b8686c6953f9afc2c560340baa5fcf5cdcfa792e` | 212202 | 13:10:04 |
| `descartes-meditations/original-en` | 5 | `422731d26788025c7964edf1fac24c009d0acd894c91a31029cdaa9ac839a765` | 383631 | 13:10:06 |
| `descartes-meditations/original-en` | 7 | `b879cd5b4c413885d03dd01db0237f92cf9a28bba590061eeecc8857a31ed821` | 354569 | 13:10:09 |
| `descartes-meditations/original-en` | 8 | `464460957ff3571fc50a20b4337055713b395eba2e906547def89e39065a35de` | 267115 | 13:10:11 |
| `frankenstein/original-en` | 10 | `72f3b9a7e830c70937f61085185d60d01b20360bf5ee6f212be939003c6e1433` | 267468 | 13:10:14 |
| `frankenstein/original-en` | 11 | `b9d3347c6881130f18d5c307222d75ef7b212b78508f9d6a3e07e6a71b9d5bd9` | 353656 | 13:10:17 |
| `frankenstein/original-en` | 22 | `cdf5d6bc6e5cb6364524946e8010e19f8136cfeee7f7052e911e3089efabe360` | 279711 | 13:10:20 |
| `frankenstein/original-en` | 25 | `e5685d0bef7489945f12703a8f7b2598cfb583dafb069d656e3273fd86c4b9a7` | 369865 | 13:10:22 |
| `phaedo/original-en` | 2 | `4ed895eeb5beef312ba237eaa41b0185da9e13fe349a93ff4c726e6748ba84bf` | 274625 | 13:10:26 |
| `phaedo/original-en` | 3 | `d0de3f2bb505522ef6f72b88a6f098bb171041238cf89299cdee02bbb031a821` | 118976 | 13:10:29 |
| `phaedo/original-en` | 4 | `c7c285f8da5955bdf7f89ce4e6c29f3dbc5944dc6a28a39caebf072bd8742cc1` | 60552 | 13:10:32 |
| `phaedo/original-en` | 5 | `930c9cbb5c3d8d1e124a37e1162f76372c59746d44c8737fbb6283cdd13e9547` | 553217 | 13:10:35 |
| `phaedo/original-en` | 8 | `0e126075f90ae1ec258a1626d0c50a3ddf50b20e06927177a809f5277c1ae17f` | 364258 | 13:10:38 |
| `phaedo/original-en` | 9 | `0903012c438eabee8ed5c12899b6c46c3b5cca5308def484007a4b96126f6294` | 170395 | 13:10:40 |
| `utilitarianism/original-en` | 1 | `d564df14024d0cd5008cd463a8f8ce8d3156bcc62a0f126aec686d52d5af6855` | 181625 | 13:10:43 |
| `utilitarianism/original-en` | 2 | `4ab2085a6181a598c87166b88547535aa819517996d411af00167f9df2578ecb` | 885092 | 13:10:45 |
| `utilitarianism/original-en` | 3 | `d8e9b681f7b17d48d58bae292caaf46cd2cbb8ce90e8a549953d720e56420667` | 341936 | 13:10:48 |
| `utilitarianism/original-en` | 4 | `c7868a07e74dd82efedfbd53b6d96670b33afedfc39058de7b79ee512afc2f6a` | 283427 | 13:10:50 |
| `utilitarianism/original-en` | 5 | `d6d0108eed843f1cc5a2654e3f47aa1c27eb46c72b6eab56ed14d52bb8beb49c` | 1001281 | 13:10:53 |
| `confessions/original-en` | 1 | `57735100f7aefaec715e04a1a4601ec343775bd1e64d08cb26dd117c805ae87f` | 686814 | 13:12:24 |
| `confessions/original-en` | 13 | `a9d8430b6db7895d44b749ec4a14d18bc64c5898e9cbb03efe1aee26b45f8f0b` | 1225602 | 13:12:27 |
| `hume-enquiry/original-en` | 14 | `5161d8380f1b74e972b3826eaae5f2edda5f05b2d35f4503da8e8e8d8072291a` | 252349 | 13:12:30 |
| `hume-enquiry/original-en` | 15 | `67a18ecfad824e57ea8db3d9ff7c041779f3a7ff1e1a1bbab5a1835e1c538e1c` | 603983 | 13:12:32 |
| `hume-enquiry/original-en` | 18 | `8e1ba2443d2ba41bc21e80099e9e1725e06a2c4b6b8fb966b197a699af570771` | 169943 | 13:12:35 |
| `hume-enquiry/original-en` | 9 | `1789cc80add68092ead226b468340d376fbbcfaedada0783ce342c2be2999c29` | 463981 | 13:12:37 |
| `jekyll-and-hyde/original-en` | 10 | `60a4e883e4f23146bf70f30e431914bb26cad72dc3c55ebc2b161827ac42748f` | 675255 | 13:12:40 |
| `jekyll-and-hyde/original-en` | 3 | `29b4aab4b51be720f14f8e08e6d86f3a17ef110ec5e4766e09407fe271793b7a` | 80226 | 13:12:42 |
| `jekyll-and-hyde/original-en` | 4 | `7009237c4ace0ca2f20b99e15ac0f40f42d3133d2f65b3833184c75b5cee5a6c` | 164453 | 13:12:45 |
| `jekyll-and-hyde/original-en` | 5 | `4e67f6eb0d092d7634ed12951aac421cb9ac52e200ab92ec15b9626724e6b7a5` | 165402 | 13:12:47 |
| `jekyll-and-hyde/original-en` | 6 | `bcc3f80ccfbf741508e3c3441c3a01004d4fb04a9f02ed8b1a3cbb17aa4f5d94` | 146777 | 13:12:50 |
| `jekyll-and-hyde/original-en` | 7 | `dd00404a12744c2fda70a46283ba437fd31a094b4ef10f8dc1c6dac93411f16c` | 56192 | 13:12:52 |
| `jekyll-and-hyde/original-en` | 8 | `59025dd91eda339894bc675080ff51606fec8455885f2f1d8a3664faa5e6882b` | 439689 | 13:12:55 |
| `odyssey/original-en` | 22 | `61cd9886cc0254131d8ad042faa6fd45fe0ad30495364c3a43dc16602c1f7d89` | 446367 | 13:12:58 |
| `phaedrus/original-en` | 1 | `9038a95a5a939b4821329a9074723219adcbab816e4214cb1e5bd50d2f0ac773` | 164281 | 13:13:01 |
| `phaedrus/original-en` | 2 | `83530af0c53e7f829fbb766db38f35981057cf05584dde0cc8dd5b0788862b25` | 146902 | 13:13:03 |
| `phaedrus/original-en` | 3 | `091a90bc92e08252f377e379a3c3904c272821f58f1fbc78c48c0ebb39e9e868` | 390700 | 13:13:06 |
| `phaedrus/original-en` | 4 | `ff11d43256e75031dd7f086627d0d5f8eb6e0a316bc191c4b9c5a22900b0f726` | 636188 | 13:13:08 |
| `phaedrus/original-en` | 5 | `e6d4fa9d47bf98db0a903c6e16de57c0ca7b41fd1a6c3e1ed9df4b08d312e820` | 738419 | 13:13:11 |
| `phaedrus/original-en` | 6 | `dfa57f00820f60ba0ce2b3a25816c915d3d370cf5d8eda504c0a9f9a59310270` | 236374 | 13:13:14 |
| `bacchae/original-en` | 2 | `c9f038428d757da6b5e3754ea32621967bba331b66a1b780c866788138ee2dba` | 76103 | 13:15:24 |
| `medea/original-en` | 3 | `a2002d65c83ac13be3ca3a45906662d70614a548989b36738d43eb97e4917eba` | 204482 | 13:15:27 |
| `midsummer/original-en` | 1 | `fc6a1f250d25ae471af9eb5f1f07699a3290dd19c3ab2681b7d015bae98b32af` | 205723 | 13:15:29 |
| `midsummer/original-en` | 3 | `55e31d57e8c8a27420df5eca8684096fd08488dc676df9b7f0869789f448cb87` | 220568 | 13:15:32 |
| `midsummer/original-en` | 4 | `73f868a02bc842c641a8e44f887c3e319164cf24740657e774897934dba963b1` | 127422 | 13:15:34 |
| `midsummer/original-en` | 6 | `64ba88f89797f0387969e19befd9bbd1936772c112147cf0208171a4bb76fb60` | 397083 | 13:15:37 |
| `midsummer/original-en` | 7 | `b79409bd53ccbd4b3bce120fd91d9d71a78f1c5c04a02fd5cc725bb36b24df6e` | 189965 | 13:15:39 |
| `midsummer/original-en` | 8 | `b07a3a81ab4ff30d2c36565bb81d8d782df09c8460cc7850c37850b0890313f9` | 40298 | 13:15:42 |
| `odyssey/original-en` | 12 | `951f6f6839a6533ee4bde8beb142808b1aa90027531f8f1c60ba3e346b663767` | 448066 | 13:15:44 |
| `odyssey/original-en` | 16 | `ec6742ce2f98cb2819ebd126f1fade763aaa4bf6bcd0c5f259e5150a488c3c22` | 444759 | 13:15:47 |
| `odyssey/original-en` | 17 | `e9f8dca00a99e849ff151c5761f73f18abdf6f20a19fd319dbd4e3b86bc94369` | 570714 | 13:15:50 |
| `oedipus-at-colonus/original-en` | 1 | `5a4b4b86afd0d54e178f26db20ab6061c27046d106dff82f30e108a9eeddc4e7` | 101467 | 13:15:53 |
| `oedipus-at-colonus/original-en` | 11 | `a5cf7b2fbe6f43c30f533c1a1f764c32907612ace90417c1985aff9230e14a27` | 206028 | 13:15:55 |
| `oedipus-at-colonus/original-en` | 2 | `3ed4234cf7ee8d9de6053d984c69e62d82f246f3e498168185c5d12e919b781c` | 152442 | 13:15:58 |
| `oedipus-at-colonus/original-en` | 4 | `823c3b95f51398badc994e9045acc9bb951ee6ca839ada6a4051fa72bebb1ad9` | 90245 | 13:16:00 |
| `oedipus-at-colonus/original-en` | 7 | `52678a66dd15c1db4eb07feaac733346c4a17fea215f4671795b0adbccb9fcaf` | 191733 | 13:16:03 |
| `oedipus-at-colonus/original-en` | 8 | `827e6eba78ac0584ff25dca0415d29f41a2ce3a473558ebe6e1669ca7d229453` | 119506 | 13:16:05 |
| `oedipus-at-colonus/original-en` | 9 | `cb7c0e50242dc57b34c3f895dc5e39eccdd2477aa5b555ca89db8430852bae74` | 276664 | 13:16:08 |
| `second-treatise/original-en` | 11 | `06bd607ec49868b5080bb1368717fc4fce8ea8cccddd588f705e7e3ed0a6b321` | 294096 | 13:16:10 |
| `symposium/original-en` | 1 | `fe0836b1d8bf86a5ab5f742909f7912ef2b123ab2d37592e6ff44d065d6ccbae` | 188556 | 13:16:13 |
| `symposium/original-en` | 7 | `680b35b22f588256640b7454e384c9473e2ba60c92b872d44f904c07e4c43785` | 1009406 | 13:16:15 |

33 journal entries are re-runs that found the object already published and were skipped (the uploader never overwrites).

## Chapters that failed the gate

- `communist-manifesto/original-en/ch3` (tinct-words-run1-1) — paragraphs [19]: below 0.85 on every arm; not published
- `notes-from-underground/original-en/ch17` (tinct-words-run1-1) — paragraphs [19, 22, 24, 28, 41, 42]: below 0.85 on every arm; not published
- `medea/original-en/ch4` (tinct-words-run1-2) — paragraphs [17, 25, 26, 28, 36, 40, 41, 44, 46, 54, 56, 58, 61, 62, 63, 64, 68, 75, 76]: below 0.85 on every arm; not published
- `medea/original-en/ch7` (tinct-words-run1-2) — paragraphs [2, 10, 12, 13, 16, 25, 29, 38, 46, 58, 59]: below 0.85 on every arm; not published
- `midsummer/original-en/ch2` (tinct-words-run1-2) — paragraphs [5, 9, 13, 15, 16, 20, 37]: below 0.85 on every arm; not published
- `odyssey/original-en/ch3` (tinct-words-run1-2) — paragraphs [37]: below 0.85 on every arm; not published
- `oedipus-at-colonus/original-en/ch3` (tinct-words-run1-2) — paragraphs [0, 3, 5, 8, 9, 11, 12, 17, 21, 25, 29, 37, 47]: below 0.85 on every arm; not published
- `second-treatise/original-en/ch19` (tinct-words-run1-2) — paragraphs [27, 34, 37, 38]: below 0.85 on every arm; not published
- `the-tempest/original-en/ch1` (tinct-words-run1-2) — paragraphs [0, 1, 2, 3, 6, 8, 9, 10, 18, 19, 20, 23, 24, 25, 26, 29, 40, 42]: below 0.85 on every arm; not published
- `the-tempest/original-en/ch2` (tinct-words-run1-2) — paragraphs [3, 25, 33, 49, 55, 57, 76, 78, 80, 88, 94, 96, 102, 115, 116, 117, 119, 122, 124, 137, 149, 153, 172]: below 0.85 on every arm; not published
- `hume-enquiry/original-en/ch16` (tinct-words-run1-3) — paragraphs [2, 3]: below 0.85 on every arm; not published
- `hume-enquiry/original-en/ch3` (tinct-words-run1-3) — paragraphs [4, 5]: below 0.85 on every arm; not published
- `jekyll-and-hyde/original-en/ch1` (tinct-words-run1-3) — paragraphs [8]: below 0.85 on every arm; not published
- `jekyll-and-hyde/original-en/ch2` (tinct-words-run1-3) — paragraphs [10, 47, 48]: below 0.85 on every arm; not published
- `phaedo/original-en/ch1` (tinct-words-run1-4) — paragraphs [1, 6, 14, 16, 17, 18, 19, 21, 22, 31, 43, 45]: below 0.85 on every arm; not published
- `phaedo/original-en/ch7` (tinct-words-run1-4) — paragraphs [6, 40, 42, 104, 125, 130, 138, 141, 164, 202]: below 0.85 on every arm; not published

## Chapters cut off by the worker time cap and re-queued

- `the-tempest/original-en/ch3` (tinct-words-run1-2) — not a rejection; re-run in the leftovers batch

## Chapters dropped before alignment (repair class)

- `confessions/original-en/ch2` (tinct-words-run1-3) — p10.mp3 HTTP 404
- `descartes-meditations/original-en/ch6` (tinct-words-run1-4) — p6.mp3 HTTP 404

## Editions completed this run — 6

- `crito/original-en` — 3/3 chapters timed (3 added this run)
- `meditations/original-en` — 12/12 chapters timed (2 added this run)
- `phaedrus/original-en` — 6/6 chapters timed (6 added this run)
- `symposium/original-en` — 8/8 chapters timed (2 added this run)
- `us-founding-documents/original-en` — 4/4 chapters timed (4 added this run)
- `utilitarianism/original-en` — 5/5 chapters timed (5 added this run)

## Editions advanced but not complete — 14

- `bacchae/original-en` — 3/11 timed (1 added; 0 queued chapters still open)
- `confessions/original-en` — 12/13 timed (2 added; 1 queued chapters still open)
- `descartes-meditations/original-en` — 7/9 timed (7 added; 2 queued chapters still open)
- `frankenstein/original-en` — 23/28 timed (4 added; 0 queued chapters still open)
- `frederick-douglass/original-en` — 10/12 timed (1 added; 0 queued chapters still open)
- `hume-enquiry/original-en` — 16/19 timed (4 added; 2 queued chapters still open)
- `jekyll-and-hyde/original-en` — 7/10 timed (7 added; 2 queued chapters still open)
- `medea/original-en` — 2/7 timed (1 added; 2 queued chapters still open)
- `midsummer/original-en` — 6/9 timed (6 added; 1 queued chapters still open)
- `notes-from-underground/original-en` — 19/21 timed (1 added; 1 queued chapters still open)
- `odyssey/original-en` — 23/24 timed (4 added; 1 queued chapters still open)
- `oedipus-at-colonus/original-en` — 9/11 timed (7 added; 1 queued chapters still open)
- `phaedo/original-en` — 7/9 timed (7 added; 2 queued chapters still open)
- `second-treatise/original-en` — 18/19 timed (1 added; 1 queued chapters still open)
