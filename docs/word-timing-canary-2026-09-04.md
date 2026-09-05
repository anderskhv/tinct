# Word-timing canary validation and four-shard plan — 2026-09-04

Lane: tooling and validation only (Lane 2 of the Tinct control room).
Branch: `codex/claude-word-timing-production`, cut from the clean production
baseline `3888548da6d9` (`origin/codex/lab-convergence`).

Nothing in this document was uploaded, deployed, or read from R2. Every
result below was produced offline against files in the repository and the
recovery artifacts extracted from
`artifacts/tinct-word-timing-recovery-2026-09-04/`
(`EXECUTION-PLAN.md`, `REPORT.md`, `pilot-validation.json`,
`chapter-coverage-matrix.csv`, `coverage-summary.json`,
`production-audio-hours.json`, the two Genesis 1 pilot sidecars).

## 1. Environment facts

| Fact | Value |
|---|---|
| Node | v22.22.2 (the RunPod bootstrap installs Node 24; the tooling has no Node-version-specific code) |
| Python | 3.11.15, stdlib `unittest` only — `pytest` is not installed |
| `faster_whisper` | not installed, and must not be installed here (no GPU) |
| GPU | none (`nvidia-smi` absent) |
| `wrangler` | not on `PATH`; never invoked |
| `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` / any `R2_*` / `RUNPOD_*` variable | not present in the environment |
| Egress | no access to `tinct.app` or `api.cloudflare.com`; nothing network-dependent was attempted |
| Local audio manifests | none. `app/public/audio/` does not exist; `app/public/data/editions-chapters/*/manifest.json` is the **text** chapter manifest (`paragraphCount`, no durations) |
| Edition chapter data used | `app/public/data/editions-chapters/bible-web-en/ch0001.json` and `bible-modern-en/ch0001.json` (directory names confirmed; each is `{number: 1, title: "Genesis 1", paragraphs: [7 strings]}`) |

## 2. Cherry-pick of the tooling commit

`git cherry-pick 9684bd4e` ("tools: harden word timing recovery pipeline",
from `origin/codex/ref-word-timing-tooling`) landed as **`d478e8b3`**.

It did **not** apply cleanly. The baseline already carries an older version of
four of the files (added by `53c41bc2` "Add words.json generation pipeline and
cloud deploy docs"), and the tooling commit's parent `07667bc6` predates that,
so git saw add/add conflicts:

| File | Baseline version | Tooling version | Resolution |
|---|---:|---:|---|
| `app/scripts/validate-words-sidecar.cjs` | 93 lines | 141 lines | took tooling version verbatim (`git checkout --theirs`) |
| `app/tts/generate-words-sidecar.py` | 341 lines | 547 lines | took tooling version verbatim |
| `app/tts/words_sidecar_lib.py` | 231 lines | 336 lines | took tooling version verbatim |
| `app/tts/words_sidecar_lib_test.py` | 61 lines | 133 lines | took tooling version verbatim |

Why "verbatim" was safe: for each conflicted file the diff from the baseline
version to the tooling version is additive (observed-vs-interpolated
`AlignmentStats`, `canonical_alignment_token` digit/cardinal equivalence,
duplicate/missing/exact-token/manifest-bound validation, `module.exports` for
the Node validator, the new tests), plus one genuine fix: the baseline's
`clean_text` line `text.replace("'", "'")...replace('"', '"')` had its curly
quotes flattened to ASCII at some point, so it was a no-op; the tooling
version restores `’ ‘ “ ”` handling (and the Node `cleanText` mirrors it).
No baseline-only logic was dropped.

The remaining five files (`validate-words-sidecar.test.cjs`,
`generate_words_sidecar_test.py`, `runpod-bootstrap.sh`,
`books/r2_words_sidecar_coverage.py`, `books/r2_words_sidecar_coverage_test.py`)
merged automatically.

Verification after the cherry-pick:

- `git diff --stat 9684bd4e HEAD -- <the nine tooling paths>` is empty: every
  tooling file is byte-identical to the source commit.
- `git diff --stat 3888548da6d9 HEAD` touches exactly those nine paths
  (1,174 insertions, 114 deletions) — nothing under `app/src/**`,
  `app/public/**`, or anywhere else.

Delivery shape: two commits — the cherry-picked tooling commit `d478e8b3`
(original author preserved) plus one docs commit for this file. Not squashed;
the conflicts were mechanical.

## 3. Tooling self-tests (offline)

All four suites ran as plain scripts (no `pytest`); none needed
`faster_whisper`, network, or R2. Exact totals:

| Suite | Command (from the directory containing it) | Result |
|---|---|---|
| Node validator | `node --test validate-words-sidecar.test.cjs` | `# tests 2 / # pass 2 / # fail 0` |
| `words_sidecar_lib` | `python3 words_sidecar_lib_test.py -v` | `Ran 9 tests in 0.001s — OK` |
| generator (Whisper mocked) | `python3 generate_words_sidecar_test.py -v` | `Ran 3 tests in 0.005s — OK` |
| coverage audit | `python3 r2_words_sidecar_coverage_test.py -v` | `Ran 4 tests in 0.628s — OK` |

Notes:

- `generate_words_sidecar_test.py` patches `load_chapter_text`,
  `fetch_manifest`, `http_get_bytes` and `process_paragraph`, so it exercises
  the alignment gate, stale-local-skip and MP3 cleanup without Whisper or
  network. Its three tests print the generator's own log lines
  (`Download p0.mp3`, `Ignore stale or unverified local .../words.json`); that
  is expected output, not a failure.
- `r2_words_sidecar_coverage_test.py::test_registry_discovers_kjv_audio_target`
  parses the real `bookRegistry.ts` (offline); the audit test injects a fake
  checker. No test in any suite hits the network.
- `pilot-validation.json` in the artifacts recorded "12/12 Python" tests at
  the time of the audit. On this tree the Python count is 9 + 3 = 12, which
  matches.

## 4. Genesis 1 pilot validation (execution-plan step 1)

### 4.1 Validator runs

```
node app/scripts/validate-words-sidecar.cjs pilots/bible-web-en-ch1.words.json    --edition bible-web-en    --chapter 1
OK: .../bible-web-en-ch1.words.json (7 paragraphs)           exit 0
node app/scripts/validate-words-sidecar.cjs pilots/bible-modern-en-ch1.words.json --edition bible-modern-en --chapter 1
OK: .../bible-modern-en-ch1.words.json (7 paragraphs)        exit 0
```

Negative control (Modern pilot validated against the WEB edition) fails as it
should, exit 1: `paragraph 0: 80 words != expected 82`, `paragraph 1: 97 != 108`,
`paragraph 2: 123 != 124`, `paragraph 3: 94 != 98`, ... So the validator is
actually comparing against the named edition, not just checking shape.

`words_sidecar_lib.validate_sidecar(sidecar, expected_tokens, None)` also
passes for both pilots (manifest argument omitted — see 4.4).

### 4.2 Independent checks (my own script, not the tooling)

Reader semantics were reproduced from `app/src/lab/labFollow.ts`:
`chapterWordsFromText` = whitespace split; `isSilentVerseMarker` =
`/^[⁰¹²³⁴⁵⁶⁷⁸⁹]+$/` (superscript verse numbers are dropped before matching);
`semanticToken` = NFKC → lowercase → `‘’`→`'` → strip everything except
letters, digits, `'`. `mergeSidecarWords` rejects the whole sidecar if
`sidecar.chapter !== expectedChapter`, and `alignTimedWordsToText` rejects a
paragraph if the spoken-token count or any semantic token differs.

| Check | WEB (`bible-web-en-ch1.words.json`) | Modern (`bible-modern-en-ch1.words.json`) |
|---|---|---|
| SHA-256 | `2f0e8e15031138a2e78735fc6033cacf612ebc7c4cc8afac38b784cd0e53b7c3` | `1b384804edf8ceaa04a8af7e0c8ffa07a544c0847c030dc3db131ea7334f64e5` |
| Size | 72,454 bytes | 72,226 bytes |
| Top-level identity | `chapter: 1`, `bookId: "bible"`, `editionKey: "web-en"` | `chapter: 1`, `bookId: "bible"`, `editionKey: "modern-en"` |
| Provenance | `method: "faster-whisper-word-timestamps"`, `language: "en"`, `model: "small.en"`, `title: "Genesis 1"`, chapter-level and per-paragraph `alignment{expectedWords, heardWords, matchedWords, matchRatio}` | same fields |
| Paragraph entries | 7, indexes 0–6, unique, ordered = chapter's 7 paragraphs | 7, indexes 0–6 = chapter's 7 paragraphs |
| `file` per entry | `p{i}.mp3` for every i | `p{i}.mp3` for every i |
| Sidecar words | 738 | 735 |
| Reader raw tokens (whitespace) | 769 (= 738 spoken + 31 verse markers) | 766 (= 735 + 31) |
| Reader spoken tokens (verse markers removed) | 738 | 735 |
| Validator tokens (`cleanText` + split) | 738 | 735 |
| **Token coverage** | **738/738 = 100.0%**, per paragraph 82/108/124/98/124/179/23 | **735/735 = 100.0%**, per paragraph 80/97/123/94/137/181/23 |
| Semantic mismatches vs reader | 0 | 0 |
| Exact-text mismatches vs validator tokens | 0 | 0 |
| Non-monotonic `start` within paragraph | 0 | 0 |
| `end < start` | 0 | 0 |
| Negative or non-finite values | 0 | 0 |
| Observed ASR alignment (from file) | 738/738 matched, ratio 1.0, min paragraph 1.0 | 724/735 matched, ratio 0.985, min paragraph 0.9565 (p6, 23 words) |
| First / last word | `In` 0.05–0.53 / p6 `day.` 6.97–7.33 | `In` 0.05–0.53 / p6 `day.` 6.37–6.73 |

Per-paragraph last-word end times (seconds): WEB 24.61 / 32.49 / 36.87 / 26.69 /
42.55 / 51.02 / 7.33 (sum 221.6 s = 3.69 min); Modern 23.35 / 28.61 / 37.92 /
25.45 / 45.81 / 51.37 / 6.73 (sum 219.2 s = 3.65 min).

### 4.3 Cross-check against the artifacts

`pilot-validation.json` reports exactly the values found in the files
(738/738/738 and 735/728/724, paragraph minimum 0.9565, the same first/last
spot tokens and times, `validator: pass`). There is **no** `SHA256SUMS` file
and `pilot-validation.json` carries no hashes, so the SHA-256 values above are
the first recorded ones; the RunPod operator should compare against them after
GET (section 5).

### 4.4 What could not be checked offline

- **Duration bound.** The audio manifests (`/api/audio-manifest?path=bible/{edition}/ch1/manifest.json`)
  live only on R2/Worker and are not in the repo, and the pilot files do not
  embed durations. `withinManifestDurationBounds: true` in
  `pilot-validation.json` is the audit's claim, not reproduced here. Plausibility
  only: the per-paragraph end-time sums (3.69 / 3.65 min) sit just under the
  reported audio lengths (3.78 / 3.74 min), which is consistent with words
  ending before each file's trailing silence.
- **Perceptual sync.** Requires a human listening pass (section 5).

Verdict for step 1: both pilots are structurally valid for the reader and for
both validators, with 100% token coverage and no timing anomalies. They are
ready for the listening pass and, after it, for the canary upload.

## 5. Blocked steps (execution plan 2–6) and what unblocks each

None of these can be attempted from this environment (no credentials, no
egress, no GPU). Attempting them here would produce fake results; they were
not attempted.

| Plan step | Status here | Unblock |
|---|---|---|
| 2. No-overwrite upload of `bible/web-en/ch1/words.json` then `bible/modern-en/ch1/words.json` | blocked: no R2 token, no `wrangler`, no egress | A dedicated least-privilege R2 **object read/write** token for bucket `tinct-audio` (not the Workers deploy token from `app/.env`), exported on the RunPod pod as `CLOUDFLARE_API_TOKEN` — if RunPod stores it under another name, map it: `export CLOUDFLARE_API_TOKEN="$CLOUDFLARE_R2_TOKEN"`. Plus `CLOUDFLARE_ACCOUNT_ID` (the bootstrap prints it; it is not a secret). Pod bootstrapped via `app/tts/runpod-bootstrap.sh` (installs ffmpeg, faster-whisper, Node 24, wrangler, clones the repo). |
| 3. GET / hash / schema / provenance verification against R2 | blocked: no egress | Same token; `wrangler r2 object get` of the just-written key and `sha256sum` against the values in 4.2; then `node app/scripts/validate-words-sidecar.cjs` on the downloaded copy. |
| 4. Production highlighting check at 1× and 2× | blocked: no browser access to tinct.app, and nothing uploaded | A person on tinct.app (private window) playing Genesis 1 in WEB and Modern English: moving word highlight, exact paragraph transition, pause/resume, page turn, and confirming KJV (control) and untouched editions still behave. |
| 5. Genesis 1–10 WEB + Modern GPU benchmark (20 chapters) | blocked: no GPU, no faster-whisper, no network for MP3 download | GPU pod (RTX 4090 class) bootstrapped as above, same token, the command in section 7.3. Measure wall-clock per chapter and per audio-minute. |
| 6. Throughput / cost report | blocked: depends on 5 | Replace the planning ranges in section 8 with measured numbers from step 5 before starting any shard. |

Important, from the execution plan and repeated here because it will come up:
the existing local `CLOUDFLARE_API_TOKEN` (Workers deploy token) returned
Cloudflare error **10000** on a bucket-**list** call. A 10000 on
`r2 bucket list` does **not** prove that object-level access is unavailable —
bucket listing and object read/write are different permissions. The first
capability test on the pod must be a **GET of a known existing object**
(e.g. the live KJV Genesis 1 sidecar), not a bucket list. Only if that GET
fails with the R2 token is the token wrong. And the Workers deploy token must
not be used for uploads regardless of what it can do.

Also: `wrangler r2 object put` has no conditional-write flag, and the generator
does not do a post-upload GET (see section 9). "No-overwrite" for the canary
therefore has to be enforced procedurally: confirm the key returns 404 before
the put, and GET + hash afterwards.

## 6. Four-shard plan for the 12,567 missing sidecars

### 6.1 Inputs and method

- Source rows: `chapter-coverage-matrix.csv` (14,068 rows). Rows with
  `audio_manifest=present` and `words_sidecar=missing`: **12,567**
  (11,249 English, 1,318 Danish) across all 231 edition targets. The 325
  `audio_manifest=missing` rows (all `war-and-peace/modern-da`) are excluded —
  no audio, nothing to time.
- Token count per chapter: computed locally from
  `app/public/data/editions-chapters/{book}-{edition}/chNNNN.json` (35
  targets) or `app/public/data/editions/{book}-{edition}.json` (196 targets)
  with the generator's own tokenization (`clean_text` + whitespace split, from
  `words_sidecar_lib`). Totals reproduce the execution plan exactly:
  **18,649,897 tokens, 308,473 paragraphs**.
- Duration: no per-chapter durations exist offline. `production-audio-hours.json`
  gives measured hours **per edition target** (all 231 present). Each chapter's
  duration is estimated as `target_hours × chapter_tokens / target_tokens`
  (apportioned by token share across that target's audio chapters). Missing
  set: **1,761.9 h est.** (English 1,519.4 h, Danish 242.5 h); the 1,176
  existing KJV sidecars account for the remaining 66.9 h of the 1,828.8 h.
  Sanity check: Genesis 1–50 WEB + Modern comes out at 6.11 h est. versus the
  plan's 5.99 h measured, so the apportioning is within ~2% where it can be
  checked.
- Balancing: longest-processing-time-first greedy over the 231 targets, so no
  target (hence no object key) is ever split across two shards. Result: four
  shards of 440.21–440.57 h est. (spread 0.08%), so no chapter-range splitting
  of a target was needed. Chapter ranges shown per target are the missing
  chapters (mostly the full edition).

### 6.2 Resume mechanism (what the tooling actually does, plus what to add)

1. **Skip existing objects.** For every chapter, `generate-words-sidecar.py`
   HEADs `/api/audio-file?path={book}/{edition}/ch{N}/words.json`; if present it
   re-downloads the object and only skips when `validate_sidecar` passes
   against current text and the audio manifest **and** `bookId`/`editionKey`/
   `chapter` match. An invalid existing object is regenerated and overwritten
   (without `--force`). A locally kept `words.json` is likewise validated
   (identity + every paragraph `matchRatio ≥ --min-alignment`) before being
   trusted.
2. **Idempotent re-run.** Re-running the identical shard command resumes
   because of (1); completed chapters cost one HEAD + one GET each. Chapters
   whose audio manifest is missing are skipped and counted. Chapters that fail
   the 85% observed-alignment gate are logged `FAIL low observed alignment: ...`
   and **not** uploaded; they are retried on every re-run until fixed or
   quarantined.
3. **Per-shard progress log.** The tool writes only to stdout. Each shard
   command in 6.3 tees to `/workspace/tinct/ledger/shard-{k}-{lang}.log`
   (append). The lines `{book}/{edition} ch{N}: OK|FAIL|skip|uploaded ...` and the
   final `Done: ok= fail= skip=` are the resumable record; `grep -c uploaded`
   / `grep FAIL` give progress and the retry list. This is the JSONL ledger
   the plan asks for in its minimal form; a structured ledger is still a
   tooling gap (section 9).
4. **Disjoint keys.** Shards contain disjoint edition targets, so two pods
   never write the same object key. Do not run the same shard on two pods.
5. **After each shard**, re-run
   `python3 books/r2_words_sidecar_coverage.py --scope public --json ledger/coverage-after-shard-{k}.json`
   to regenerate the presence matrix from the reader's own endpoints.

### 6.3 Calibration batch (must run and be measured BEFORE any shard)

Genesis 1–10 in WEB and Modern English — 20 chapters:

| Target | Chapters | Paragraphs | Tokens | Est. audio |
|---|---|---:|---:|---:|
| `bible/web-en` | 1–10 | 58 | 5,771 | 29.6 min |
| `bible/modern-en` | 1–10 | 58 | 5,616 | 29.0 min |
| total | 20 | 116 | 11,387 | 58.6 min |

Genesis 1 (chapter 1) is already covered by the canary; the range 1–10 is
still specified as a single command so the tool's skip-if-valid path is
exercised on chapter 1 as part of the measurement. Record per chapter: wall
time, download time, transcription time, observed alignment, and whether it
uploaded. Derive `× real time` = 58.6 min ÷ wall minutes. Only then fill in
section 8 and start Shard 1. If any Genesis 1–10 chapter fails the 85% gate,
stop and classify before proceeding (Bible normalization issues would recur
2,378 times across WEB + Modern).

Then, per the execution plan, complete Genesis 1–50 (100 chapters, ~6 h audio)
before opening the shards.

### 6.4 Shards

Quarantined targets (execution plan / `non-bible-dry-run.json`) are listed in
their shard for completeness but **excluded from the emitted commands**:
`the-art-of-war/original-en` and `/modern-en` (printed `1/2/3/4/5` vs heard
`one/two/...` — note the cherry-picked `canonical_alignment_token` now maps
standalone digits to cardinals, so these may pass on retry; re-test them
individually first) and `phaedo/original-en` (speaker labels spelled letter by
letter in legacy TTS — needs a decision, not a lower gate). `phaedo/modern-en`
was not dry-run; test one chapter before including it.

Danish targets are listed per shard with their own `--model small` command,
gated on explicit approval (the repo currently pauses Danish generation).

### Shard 1 — 440.57 h est. (25.0%), 2890 chapters, 4,693,167 tokens


**English (`--model small.en`)** — 40 targets, 2578 chapters, 346.93 h est.

| Target | Missing chapters | Count | Tokens | Est. audio h | Note |
|---|---|---:|---:|---:|---|
| `bible/web-en` | 1-1189 | 1189 | 766,685 | 65.46 |  |
| `don-quixote/modern-en` | 1-126 | 126 | 395,083 | 35.96 |  |
| `wealth-of-nations/modern-en` | 1-32 | 32 | 379,356 | 34.22 |  |
| `anna-karenina/modern-en` | 1-239 | 239 | 347,559 | 32.48 |  |
| `leviathan/original-en` | 1-49 | 49 | 207,403 | 19.93 |  |
| `peloponnesian-war/modern-en` | 1-26 | 26 | 200,417 | 19.12 |  |
| `crime-and-punishment/modern-en` | 1-41 | 41 | 189,484 | 18.01 |  |
| `great-expectations/original-en` | 1-59 | 59 | 184,218 | 16.71 |  |
| `divine-comedy/original-en` | 1-100 | 100 | 111,060 | 11.08 |  |
| `divine-comedy/modern-en` | 1-100 | 100 | 109,841 | 10.57 |  |
| `paradise-lost/original-en` | 1-12 | 12 | 79,739 | 8.06 |  |
| `jerusalem/original-en` | 1-18 | 18 | 77,761 | 6.94 |  |
| `hume-enquiry/original-en` | 1-19 | 19 | 53,644 | 5.49 |  |
| `genealogy-of-morals/modern-en` | 1-4 | 4 | 52,860 | 5.32 |  |
| `the-awakening/modern-en` | 1-39 | 39 | 47,867 | 4.52 |  |
| `social-contract/original-en` | 1-48 | 48 | 44,073 | 4.29 |  |
| `werther/original-en` | 1-84 | 84 | 42,304 | 3.87 |  |
| `hamlet/modern-en` | 1-20 | 20 | 30,903 | 3.11 |  |
| `the-prince/original-en` | 1-27 | 27 | 32,405 | 3.08 |  |
| `candide/modern-en` | 1-30 | 30 | 31,563 | 3.04 |  |
| `cymbeline/original-en` | 1-29 | 29 | 28,441 | 2.90 |  |
| `king-lear/original-en` | 1-26 | 26 | 27,157 | 2.83 |  |
| `heart-of-darkness/modern-en` | 1-3 | 3 | 37,897 | 2.77 |  |
| `henry-v/modern-en` | 1-23 | 23 | 27,135 | 2.66 |  |
| `beowulf/modern-en` | 1-43 | 43 | 25,923 | 2.52 |  |
| `much-ado-about-nothing/modern-en` | 1-17 | 17 | 21,977 | 2.27 |  |
| `merchant-of-venice/modern-en` | 1-20 | 20 | 21,608 | 2.13 |  |
| `phaedo/modern-en` | 1-9 | 9 | 26,337 | 2.10 |  |
| `symposium/original-en` | 1-8 | 8 | 21,429 | 1.93 |  |
| `symposium/modern-en` | 1-8 | 8 | 21,457 | 1.92 |  |
| `gilgamesh/original-en` | 1-12 | 12 | 18,845 | 1.74 |  |
| `jekyll-and-hyde/modern-en` | 1-10 | 10 | 25,372 | 1.71 |  |
| `oedipus-at-colonus/original-en` | 1-11 | 11 | 13,557 | 1.39 |  |
| `bacchae/original-en` | 1-11 | 11 | 13,451 | 1.32 |  |
| `communist-manifesto/modern-en` | 1-5 | 5 | 11,282 | 1.27 |  |
| `the-art-of-war/original-en` | 1-13 | 13 | 10,847 | 1.17 | digit/number-word enumeration (dry-run rejected p0,p3) |
| `antigone/modern-en` | 1-11 | 11 | 10,689 | 1.01 |  |
| `us-founding-documents/modern-en` | 1-4 | 4 | 8,777 | 0.90 |  |
| `the-manual/original-en` | 1-52 | 52 | 8,111 | 0.70 |  |
| `magna-carta/modern-en` | 1 | 1 | 4,593 | 0.45 |  |

**Danish (`--model small`, gated: run only if Danish timing is explicitly approved)** — 18 targets, 312 chapters, 93.65 h est.

| Target | Missing chapters | Count | Tokens | Est. audio h | Note |
|---|---|---:|---:|---:|---|
| `ulysses/modern-da` | 1-18 | 18 | 258,904 | 27.85 |  |
| `odyssey/modern-da` | 1-24 | 24 | 101,339 | 9.62 |  |
| `aristotle-politics/modern-da` | 1-8 | 8 | 79,838 | 7.08 |  |
| `jerusalem/modern-da` | 1-18 | 18 | 71,516 | 6.57 |  |
| `around-the-world-80-days/modern-da` | 1-37 | 37 | 59,272 | 6.23 |  |
| `second-treatise/modern-da` | 1-19 | 19 | 53,431 | 4.89 |  |
| `on-liberty/modern-da` | 1-5 | 5 | 44,797 | 3.57 |  |
| `richard-iii/modern-da` | 1-25 | 25 | 31,720 | 3.53 |  |
| `cymbeline/modern-da` | 1-29 | 29 | 30,097 | 3.26 |  |
| `meditations/modern-da` | 1-12 | 12 | 32,687 | 3.26 |  |
| `king-lear/modern-da` | 1-26 | 26 | 28,472 | 3.21 |  |
| `winters-tale/modern-da` | 1-15 | 15 | 27,460 | 2.92 |  |
| `merry-wives-of-windsor/modern-da` | 1-23 | 23 | 24,011 | 2.68 |  |
| `twelfth-night/modern-da` | 1-18 | 18 | 21,747 | 2.46 |  |
| `taming-of-the-shrew/modern-da` | 1-12 | 12 | 21,070 | 2.41 |  |
| `the-tempest/modern-da` | 1-10 | 10 | 18,293 | 2.08 |  |
| `gilgamesh/modern-da` | 1-12 | 12 | 15,167 | 1.61 |  |
| `magna-carta/modern-da` | 1 | 1 | 4,236 | 0.43 |  |

Shard 1 English command (resumable; re-run as-is to resume):

```bash
cd /workspace/tinct/repo
mkdir -p /workspace/tinct/ledger
python3 app/tts/generate-words-sidecar.py \
  --target bible/web-en \
  --target don-quixote/modern-en \
  --target wealth-of-nations/modern-en \
  --target anna-karenina/modern-en \
  --target leviathan/original-en \
  --target peloponnesian-war/modern-en \
  --target crime-and-punishment/modern-en \
  --target great-expectations/original-en \
  --target divine-comedy/original-en \
  --target divine-comedy/modern-en \
  --target paradise-lost/original-en \
  --target jerusalem/original-en \
  --target hume-enquiry/original-en \
  --target genealogy-of-morals/modern-en \
  --target the-awakening/modern-en \
  --target social-contract/original-en \
  --target werther/original-en \
  --target hamlet/modern-en \
  --target the-prince/original-en \
  --target candide/modern-en \
  --target cymbeline/original-en \
  --target king-lear/original-en \
  --target heart-of-darkness/modern-en \
  --target henry-v/modern-en \
  --target beowulf/modern-en \
  --target much-ado-about-nothing/modern-en \
  --target merchant-of-venice/modern-en \
  --target phaedo/modern-en \
  --target symposium/original-en \
  --target symposium/modern-en \
  --target gilgamesh/original-en \
  --target jekyll-and-hyde/modern-en \
  --target oedipus-at-colonus/original-en \
  --target bacchae/original-en \
  --target communist-manifesto/modern-en \
  --target antigone/modern-en \
  --target us-founding-documents/modern-en \
  --target the-manual/original-en \
  --target magna-carta/modern-en \
  --model small.en --upload 2>&1 | tee -a /workspace/tinct/ledger/shard-1-en.log
```

Shard 1 Danish command (do not run without explicit approval):

```bash
python3 app/tts/generate-words-sidecar.py \
  --target ulysses/modern-da \
  --target odyssey/modern-da \
  --target aristotle-politics/modern-da \
  --target jerusalem/modern-da \
  --target around-the-world-80-days/modern-da \
  --target second-treatise/modern-da \
  --target on-liberty/modern-da \
  --target richard-iii/modern-da \
  --target cymbeline/modern-da \
  --target meditations/modern-da \
  --target king-lear/modern-da \
  --target winters-tale/modern-da \
  --target merry-wives-of-windsor/modern-da \
  --target twelfth-night/modern-da \
  --target taming-of-the-shrew/modern-da \
  --target the-tempest/modern-da \
  --target gilgamesh/modern-da \
  --target magna-carta/modern-da \
  --model small --upload 2>&1 | tee -a /workspace/tinct/ledger/shard-1-da.log
```

### Shard 2 — 440.55 h est. (25.0%), 2614 chapters, 4,749,274 tokens


**English (`--model small.en`)** — 44 targets, 2386 chapters, 402.41 h est.

| Target | Missing chapters | Count | Tokens | Est. audio h | Note |
|---|---|---:|---:|---:|---|
| `bible/modern-en` | 1-1189 | 1189 | 722,807 | 62.27 |  |
| `wealth-of-nations/original-en` | 1-32 | 32 | 379,438 | 37.52 |  |
| `don-quixote/original-en` | 1-126 | 126 | 402,675 | 35.96 |  |
| `brothers-karamazov/original-en` | 1-96 | 96 | 349,373 | 32.05 |  |
| `ulysses/modern-en` | 1-18 | 18 | 268,222 | 29.55 |  |
| `leviathan/modern-en` | 1-49 | 49 | 209,039 | 19.69 |  |
| `federalist-papers/original-en` | 1-85 | 85 | 188,055 | 18.89 |  |
| `jane-eyre/original-en` | 1-38 | 38 | 184,364 | 17.47 |  |
| `great-expectations/modern-en` | 1-59 | 59 | 181,350 | 16.16 |  |
| `the-republic/original-en` | 1-10 | 10 | 118,264 | 11.35 |  |
| `confessions/original-en` | 1-13 | 13 | 111,775 | 9.96 |  |
| `confessions/modern-en` | 1-13 | 13 | 112,709 | 9.96 |  |
| `odyssey/modern-en` | 1-24 | 24 | 104,916 | 9.24 |  |
| `paradise-lost/modern-en` | 1-12 | 12 | 84,141 | 6.95 |  |
| `jerusalem/modern-en` | 1-18 | 18 | 73,351 | 6.58 |  |
| `niels-lyhne/modern-en` | 1-14 | 14 | 68,875 | 6.23 |  |
| `around-the-world-80-days/modern-en` | 1-37 | 37 | 61,964 | 6.02 |  |
| `imitation-of-christ/modern-en` | 1-114 | 114 | 56,603 | 5.26 |  |
| `on-liberty/modern-en` | 1-5 | 5 | 47,144 | 4.67 |  |
| `social-contract/modern-en` | 1-48 | 48 | 43,231 | 4.21 |  |
| `the-aeneid/modern-en` | 1-12 | 12 | 109,977 | 3.88 |  |
| `frederick-douglass/original-en` | 1-12 | 12 | 36,168 | 3.24 |  |
| `richard-iii/original-en` | 1-25 | 25 | 30,808 | 3.20 |  |
| `coriolanus/modern-en` | 1-29 | 29 | 29,795 | 3.07 |  |
| `cymbeline/modern-en` | 1-29 | 29 | 29,610 | 2.91 |  |
| `othello/original-en` | 1-15 | 15 | 27,549 | 2.87 |  |
| `king-lear/modern-en` | 1-26 | 26 | 27,973 | 2.86 |  |
| `henry-iv-part-2/original-en` | 1-19 | 19 | 26,974 | 2.71 |  |
| `romeo-and-juliet/original-en` | 1-25 | 25 | 25,515 | 2.57 |  |
| `winters-tale/modern-en` | 1-15 | 15 | 26,229 | 2.54 |  |
| `beowulf/original-en` | 1-43 | 43 | 24,338 | 2.49 |  |
| `much-ado-about-nothing/original-en` | 1-17 | 17 | 22,347 | 2.27 |  |
| `as-you-like-it/modern-en` | 1-17 | 17 | 21,482 | 2.12 |  |
| `julius-caesar/modern-en` | 1-18 | 18 | 20,831 | 2.11 |  |
| `phaedrus/modern-en` | 1-6 | 6 | 21,683 | 2.06 |  |
| `the-tempest/modern-en` | 1-10 | 10 | 18,102 | 1.84 |  |
| `the-tempest/original-en` | 1-10 | 10 | 17,269 | 1.80 |  |
| `midsummer/original-en` | 1-9 | 9 | 17,017 | 1.70 |  |
| `gilgamesh/modern-en` | 1-12 | 12 | 16,439 | 1.47 |  |
| `bacchae/modern-en` | 1-11 | 11 | 14,283 | 1.33 |  |
| `medea/original-en` | 1-7 | 7 | 14,167 | 1.26 |  |
| `the-art-of-war/modern-en` | 1-13 | 13 | 8,329 | 0.94 | digit/number-word enumeration (dry-run rejected p3) |
| `apology/modern-en` | 1-3 | 3 | 7,856 | 0.70 |  |
| `crito/original-en` | 1-3 | 3 | 5,347 | 0.49 |  |

**Danish (`--model small`, gated: run only if Danish timing is explicitly approved)** — 14 targets, 228 chapters, 38.14 h est.

| Target | Missing chapters | Count | Tokens | Est. audio h | Note |
|---|---|---:|---:|---:|---|
| `confessions/modern-da` | 1-13 | 13 | 63,389 | 5.78 |  |
| `jungle-book/modern-da` | 1-7 | 7 | 48,749 | 4.61 |  |
| `fear-and-trembling/modern-da` | 1-8 | 8 | 40,154 | 3.59 |  |
| `hamlet/modern-da` | 1-20 | 20 | 31,375 | 3.52 |  |
| `antony-and-cleopatra/modern-da` | 1-42 | 42 | 27,731 | 3.30 |  |
| `candide/modern-da` | 1-30 | 30 | 31,191 | 3.11 |  |
| `henry-iv-part-2/modern-da` | 1-19 | 19 | 27,654 | 3.05 |  |
| `the-prince/modern-da` | 1-27 | 27 | 28,289 | 2.76 |  |
| `julius-caesar/modern-da` | 1-18 | 18 | 21,542 | 2.43 |  |
| `phaedrus/modern-da` | 1-6 | 6 | 21,144 | 1.97 |  |
| `oedipus-rex/modern-da` | 1-11 | 11 | 13,416 | 1.47 |  |
| `bacchae/modern-da` | 1-11 | 11 | 13,644 | 1.28 |  |
| `the-art-of-war/modern-da` | 1-13 | 13 | 8,070 | 0.90 |  |
| `crito/modern-da` | 1-3 | 3 | 4,542 | 0.38 |  |

Shard 2 English command (resumable; re-run as-is to resume):

```bash
cd /workspace/tinct/repo
mkdir -p /workspace/tinct/ledger
python3 app/tts/generate-words-sidecar.py \
  --target bible/modern-en \
  --target wealth-of-nations/original-en \
  --target don-quixote/original-en \
  --target brothers-karamazov/original-en \
  --target ulysses/modern-en \
  --target leviathan/modern-en \
  --target federalist-papers/original-en \
  --target jane-eyre/original-en \
  --target great-expectations/modern-en \
  --target the-republic/original-en \
  --target confessions/original-en \
  --target confessions/modern-en \
  --target odyssey/modern-en \
  --target paradise-lost/modern-en \
  --target jerusalem/modern-en \
  --target niels-lyhne/modern-en \
  --target around-the-world-80-days/modern-en \
  --target imitation-of-christ/modern-en \
  --target on-liberty/modern-en \
  --target social-contract/modern-en \
  --target the-aeneid/modern-en \
  --target frederick-douglass/original-en \
  --target richard-iii/original-en \
  --target coriolanus/modern-en \
  --target cymbeline/modern-en \
  --target othello/original-en \
  --target king-lear/modern-en \
  --target henry-iv-part-2/original-en \
  --target romeo-and-juliet/original-en \
  --target winters-tale/modern-en \
  --target beowulf/original-en \
  --target much-ado-about-nothing/original-en \
  --target as-you-like-it/modern-en \
  --target julius-caesar/modern-en \
  --target phaedrus/modern-en \
  --target the-tempest/modern-en \
  --target the-tempest/original-en \
  --target midsummer/original-en \
  --target gilgamesh/modern-en \
  --target bacchae/modern-en \
  --target medea/original-en \
  --target apology/modern-en \
  --target crito/original-en \
  --model small.en --upload 2>&1 | tee -a /workspace/tinct/ledger/shard-2-en.log
```

Shard 2 Danish command (do not run without explicit approval):

```bash
python3 app/tts/generate-words-sidecar.py \
  --target confessions/modern-da \
  --target jungle-book/modern-da \
  --target fear-and-trembling/modern-da \
  --target hamlet/modern-da \
  --target antony-and-cleopatra/modern-da \
  --target candide/modern-da \
  --target henry-iv-part-2/modern-da \
  --target the-prince/modern-da \
  --target julius-caesar/modern-da \
  --target phaedrus/modern-da \
  --target oedipus-rex/modern-da \
  --target bacchae/modern-da \
  --target the-art-of-war/modern-da \
  --target crito/modern-da \
  --model small --upload 2>&1 | tee -a /workspace/tinct/ledger/shard-2-da.log
```

### Shard 3 — 440.57 h est. (25.0%), 3438 chapters, 4,650,836 tokens


**English (`--model small.en`)** — 45 targets, 3193 chapters, 398.53 h est.

| Target | Missing chapters | Count | Tokens | Est. audio h | Note |
|---|---|---:|---:|---:|---|
| `war-and-peace/modern-en` | 1-365 | 365 | 534,552 | 54.22 |  |
| `essays-montaigne/original-en` | 1-107 | 107 | 477,531 | 48.87 |  |
| `anna-karenina/original-en` | 1-239 | 239 | 349,256 | 33.17 |  |
| `brothers-karamazov/modern-en` | 1-96 | 96 | 349,146 | 32.01 |  |
| `ulysses/original-en` | 1-18 | 18 | 264,931 | 26.83 |  |
| `the-histories/modern-en` | 1-1525 | 1525 | 259,323 | 21.95 |  |
| `crime-and-punishment/original-en` | 1-41 | 41 | 202,615 | 18.87 |  |
| `moby-dick/modern-en` | 1-136 | 136 | 191,004 | 17.64 |  |
| `iliad/original-en` | 1-24 | 24 | 152,639 | 13.32 |  |
| `iliad/modern-en` | 1-24 | 24 | 151,096 | 13.24 |  |
| `pride-and-prejudice/modern-en` | 1-61 | 61 | 114,090 | 10.81 |  |
| `odyssey/original-en` | 1-24 | 24 | 117,228 | 9.92 |  |
| `nicomachean-ethics/original-en` | 1-10 | 10 | 92,325 | 8.75 |  |
| `frankenstein/original-en` | 1-28 | 28 | 74,919 | 7.05 |  |
| `niels-lyhne/original-en` | 1-14 | 14 | 68,196 | 6.24 |  |
| `meditations/original-en` | 1-12 | 12 | 57,307 | 5.39 |  |
| `hume-enquiry/modern-en` | 1-19 | 19 | 53,188 | 5.34 |  |
| `second-treatise/modern-en` | 1-19 | 19 | 55,556 | 5.12 |  |
| `fear-and-trembling/modern-en` | 1-8 | 8 | 43,817 | 4.04 |  |
| `notes-from-underground/original-en` | 1-21 | 21 | 44,050 | 3.98 |  |
| `oresteia/modern-en` | 1-26 | 26 | 36,797 | 3.41 |  |
| `hamlet/original-en` | 1-20 | 20 | 31,621 | 3.22 |  |
| `richard-iii/modern-en` | 1-25 | 25 | 31,425 | 3.19 |  |
| `candide/original-en` | 1-30 | 30 | 32,209 | 3.10 |  |
| `coriolanus/original-en` | 1-29 | 29 | 28,925 | 3.06 |  |
| `kant-groundwork/modern-en` | 1-4 | 4 | 30,431 | 2.98 |  |
| `antony-and-cleopatra/modern-en` | 1-42 | 42 | 26,847 | 2.87 |  |
| `the-prince/modern-en` | 1-27 | 27 | 28,879 | 2.80 |  |
| `descartes-meditations/modern-en` | 1-9 | 9 | 29,003 | 2.67 |  |
| `phaedo/original-en` | 1-9 | 9 | 27,292 | 2.53 | spelled speaker labels (dry-run rejected) |
| `twelfth-night/original-en` | 1-18 | 18 | 21,028 | 2.17 |  |
| `twelfth-night/modern-en` | 1-18 | 18 | 21,490 | 2.17 |  |
| `discourse-on-inequality/modern-en` | 1-4 | 4 | 30,692 | 2.12 |  |
| `taming-of-the-shrew/modern-en` | 1-12 | 12 | 20,283 | 2.09 |  |
| `measure-for-measure/modern-en` | 1-17 | 17 | 23,245 | 1.83 |  |
| `midsummer/modern-en` | 1-9 | 9 | 17,813 | 1.74 |  |
| `macbeth/original-en` | 1-28 | 28 | 16,520 | 1.73 |  |
| `poetics/original-en` | 1-26 | 26 | 14,802 | 1.47 |  |
| `oedipus-at-colonus/modern-en` | 1-11 | 11 | 14,767 | 1.40 |  |
| `oedipus-rex/modern-en` | 1-11 | 11 | 13,764 | 1.29 |  |
| `medea/modern-en` | 1-7 | 7 | 14,719 | 1.26 |  |
| `apology/original-en` | 1-3 | 3 | 11,383 | 0.98 |  |
| `bible/kjv-en` | 103, 132, 197, 702, 875, 957, 961, 1044, 1089, 1100, 1149, 1179, 1186 | 13 | 9,975 | 0.86 |  |
| `magna-carta/original-en` | 1 | 1 | 4,525 | 0.44 |  |
| `crito/modern-en` | 1-3 | 3 | 4,576 | 0.42 |  |

**Danish (`--model small`, gated: run only if Danish timing is explicitly approved)** — 13 targets, 245 chapters, 42.04 h est.

| Target | Missing chapters | Count | Tokens | Est. audio h | Note |
|---|---|---:|---:|---:|---|
| `war-and-peace/modern-da` | 1-40 | 40 | 69,356 | 6.88 | 325 chapters have no audio yet; only chapters with manifests listed |
| `a-little-princess/modern-da` | 1-19 | 19 | 67,106 | 6.17 |  |
| `beyond-good-and-evil/modern-da` | 1-11 | 11 | 60,068 | 4.42 |  |
| `faust-part-1/modern-da` | 1-28 | 28 | 33,391 | 3.71 |  |
| `coriolanus/modern-da` | 1-29 | 29 | 30,556 | 3.38 |  |
| `heart-of-darkness/modern-da` | 1-3 | 3 | 37,898 | 3.01 |  |
| `genealogy-of-morals/modern-da` | 1-4 | 4 | 49,435 | 2.81 |  |
| `measure-for-measure/modern-da` | 1-17 | 17 | 23,562 | 2.63 |  |
| `much-ado-about-nothing/modern-da` | 1-17 | 17 | 22,966 | 2.47 |  |
| `merchant-of-venice/modern-da` | 1-20 | 20 | 22,714 | 2.43 |  |
| `macbeth/modern-da` | 1-28 | 28 | 17,616 | 2.04 |  |
| `poetics/modern-da` | 1-26 | 26 | 12,548 | 1.37 |  |
| `apology/modern-da` | 1-3 | 3 | 7,840 | 0.73 |  |

Shard 3 English command (resumable; re-run as-is to resume):

```bash
cd /workspace/tinct/repo
mkdir -p /workspace/tinct/ledger
python3 app/tts/generate-words-sidecar.py \
  --target war-and-peace/modern-en \
  --target essays-montaigne/original-en \
  --target anna-karenina/original-en \
  --target brothers-karamazov/modern-en \
  --target ulysses/original-en \
  --target the-histories/modern-en \
  --target crime-and-punishment/original-en \
  --target moby-dick/modern-en \
  --target iliad/original-en \
  --target iliad/modern-en \
  --target pride-and-prejudice/modern-en \
  --target odyssey/original-en \
  --target nicomachean-ethics/original-en \
  --target frankenstein/original-en \
  --target niels-lyhne/original-en \
  --target meditations/original-en \
  --target hume-enquiry/modern-en \
  --target second-treatise/modern-en \
  --target fear-and-trembling/modern-en \
  --target notes-from-underground/original-en \
  --target oresteia/modern-en \
  --target hamlet/original-en \
  --target richard-iii/modern-en \
  --target candide/original-en \
  --target coriolanus/original-en \
  --target kant-groundwork/modern-en \
  --target antony-and-cleopatra/modern-en \
  --target the-prince/modern-en \
  --target descartes-meditations/modern-en \
  --target twelfth-night/original-en \
  --target twelfth-night/modern-en \
  --target discourse-on-inequality/modern-en \
  --target taming-of-the-shrew/modern-en \
  --target measure-for-measure/modern-en \
  --target midsummer/modern-en \
  --target macbeth/original-en \
  --target poetics/original-en \
  --target oedipus-at-colonus/modern-en \
  --target oedipus-rex/modern-en \
  --target medea/modern-en \
  --target apology/original-en \
  --target bible/kjv-en \
  --target magna-carta/original-en \
  --target crito/modern-en \
  --model small.en --upload 2>&1 | tee -a /workspace/tinct/ledger/shard-3-en.log
```

Shard 3 Danish command (do not run without explicit approval):

```bash
python3 app/tts/generate-words-sidecar.py \
  --target war-and-peace/modern-da \
  --target a-little-princess/modern-da \
  --target beyond-good-and-evil/modern-da \
  --target faust-part-1/modern-da \
  --target coriolanus/modern-da \
  --target heart-of-darkness/modern-da \
  --target genealogy-of-morals/modern-da \
  --target measure-for-measure/modern-da \
  --target much-ado-about-nothing/modern-da \
  --target merchant-of-venice/modern-da \
  --target macbeth/modern-da \
  --target poetics/modern-da \
  --target apology/modern-da \
  --model small --upload 2>&1 | tee -a /workspace/tinct/ledger/shard-3-da.log
```

### Shard 4 — 440.21 h est. (25.0%), 3625 chapters, 4,556,620 tokens


**English (`--model small.en`)** — 40 targets, 3092 chapters, 371.53 h est.

| Target | Missing chapters | Count | Tokens | Est. audio h | Note |
|---|---|---:|---:|---:|---|
| `essays-montaigne/modern-en` | 1-107 | 107 | 467,925 | 53.85 |  |
| `war-and-peace/original-en` | 1-365 | 365 | 561,695 | 52.68 |  |
| `democracy-in-america/modern-en` | 1-96 | 96 | 303,372 | 30.34 |  |
| `the-histories/original-en` | 1-1525 | 1525 | 284,922 | 25.91 |  |
| `moby-dick/original-en` | 1-136 | 136 | 207,804 | 20.16 |  |
| `peloponnesian-war/original-en` | 1-26 | 26 | 204,120 | 19.63 |  |
| `federalist-papers/modern-en` | 1-85 | 85 | 178,251 | 17.94 |  |
| `jane-eyre/modern-en` | 1-38 | 38 | 175,639 | 16.21 |  |
| `pride-and-prejudice/original-en` | 1-61 | 61 | 121,546 | 11.44 |  |
| `the-aeneid/original-en` | 1-12 | 12 | 107,470 | 10.51 |  |
| `the-republic/modern-en` | 1-10 | 10 | 108,521 | 9.49 |  |
| `aristotle-politics/modern-en` | 1-8 | 8 | 86,194 | 8.11 |  |
| `nicomachean-ethics/modern-en` | 1-10 | 10 | 79,500 | 7.71 |  |
| `beyond-good-and-evil/original-en` | 1-11 | 11 | 62,412 | 6.60 |  |
| `beyond-good-and-evil/modern-en` | 1-11 | 11 | 63,623 | 6.54 |  |
| `a-little-princess/modern-en` | 1-19 | 19 | 66,160 | 5.99 |  |
| `frankenstein/modern-en` | 1-28 | 28 | 63,214 | 5.89 |  |
| `second-treatise/original-en` | 1-19 | 19 | 54,832 | 5.14 |  |
| `the-awakening/original-en` | 1-39 | 39 | 49,605 | 4.70 |  |
| `notes-from-underground/modern-en` | 1-21 | 21 | 42,757 | 3.90 |  |
| `jungle-book/modern-en` | 1-7 | 7 | 50,675 | 3.74 |  |
| `werther/modern-en` | 1-84 | 84 | 40,815 | 3.44 |  |
| `oresteia/original-en` | 1-26 | 26 | 34,061 | 3.34 |  |
| `faust-part-1/modern-en` | 1-28 | 28 | 34,570 | 3.24 |  |
| `frederick-douglass/modern-en` | 1-12 | 12 | 35,673 | 3.10 |  |
| `meditations/modern-en` | 1-12 | 12 | 57,236 | 3.05 |  |
| `kant-groundwork/original-en` | 1-4 | 4 | 30,736 | 3.02 |  |
| `othello/modern-en` | 1-15 | 15 | 28,200 | 2.87 |  |
| `antony-and-cleopatra/original-en` | 1-42 | 42 | 25,987 | 2.85 |  |
| `henry-iv-part-2/modern-en` | 1-19 | 19 | 27,330 | 2.72 |  |
| `romeo-and-juliet/modern-en` | 1-25 | 25 | 25,597 | 2.55 |  |
| `merry-wives-of-windsor/original-en` | 1-23 | 23 | 23,458 | 2.15 |  |
| `merry-wives-of-windsor/modern-en` | 1-23 | 23 | 23,555 | 2.11 |  |
| `taming-of-the-shrew/original-en` | 1-12 | 12 | 19,554 | 2.07 |  |
| `measure-for-measure/original-en` | 1-17 | 17 | 23,200 | 1.88 |  |
| `macbeth/modern-en` | 1-28 | 28 | 17,683 | 1.78 |  |
| `utilitarianism/modern-en` | 1-5 | 5 | 27,074 | 1.69 |  |
| `poetics/modern-en` | 1-26 | 26 | 13,507 | 1.33 |  |
| `communist-manifesto/original-en` | 1-5 | 5 | 11,395 | 1.29 |  |
| `the-manual/modern-en` | 1-52 | 52 | 6,221 | 0.55 |  |

**Danish (`--model small`, gated: run only if Danish timing is explicitly approved)** — 17 targets, 533 chapters, 68.68 h est.

| Target | Missing chapters | Count | Tokens | Est. audio h | Note |
|---|---|---:|---:|---:|---|
| `anna-karenina/modern-da` | 1-239 | 239 | 350,806 | 32.72 |  |
| `the-awakening/modern-da` | 1-39 | 39 | 48,308 | 4.60 |  |
| `social-contract/modern-da` | 1-48 | 48 | 40,640 | 4.09 |  |
| `othello/modern-da` | 1-15 | 15 | 28,989 | 3.20 |  |
| `romeo-and-juliet/modern-da` | 1-25 | 25 | 26,036 | 2.94 |  |
| `discourse-on-inequality/modern-da` | 1-4 | 4 | 30,253 | 2.76 |  |
| `beowulf/modern-da` | 1-43 | 43 | 23,690 | 2.55 |  |
| `descartes-meditations/modern-da` | 1-9 | 9 | 28,476 | 2.51 |  |
| `utilitarianism/modern-da` | 1-5 | 5 | 26,249 | 2.38 |  |
| `jekyll-and-hyde/modern-da` | 1-10 | 10 | 24,511 | 2.27 |  |
| `midsummer/modern-da` | 1-9 | 9 | 17,596 | 1.94 |  |
| `symposium/modern-da` | 1-8 | 8 | 15,681 | 1.56 |  |
| `medea/modern-da` | 1-7 | 7 | 14,522 | 1.40 |  |
| `antigone/modern-da` | 1-11 | 11 | 10,391 | 1.17 |  |
| `communist-manifesto/modern-da` | 1-5 | 5 | 10,021 | 1.16 |  |
| `us-founding-documents/modern-da` | 1-4 | 4 | 7,854 | 0.85 |  |
| `the-manual/modern-da` | 1-52 | 52 | 6,508 | 0.58 |  |

Shard 4 English command (resumable; re-run as-is to resume):

```bash
cd /workspace/tinct/repo
mkdir -p /workspace/tinct/ledger
python3 app/tts/generate-words-sidecar.py \
  --target essays-montaigne/modern-en \
  --target war-and-peace/original-en \
  --target democracy-in-america/modern-en \
  --target the-histories/original-en \
  --target moby-dick/original-en \
  --target peloponnesian-war/original-en \
  --target federalist-papers/modern-en \
  --target jane-eyre/modern-en \
  --target pride-and-prejudice/original-en \
  --target the-aeneid/original-en \
  --target the-republic/modern-en \
  --target aristotle-politics/modern-en \
  --target nicomachean-ethics/modern-en \
  --target beyond-good-and-evil/original-en \
  --target beyond-good-and-evil/modern-en \
  --target a-little-princess/modern-en \
  --target frankenstein/modern-en \
  --target second-treatise/original-en \
  --target the-awakening/original-en \
  --target notes-from-underground/modern-en \
  --target jungle-book/modern-en \
  --target werther/modern-en \
  --target oresteia/original-en \
  --target faust-part-1/modern-en \
  --target frederick-douglass/modern-en \
  --target meditations/modern-en \
  --target kant-groundwork/original-en \
  --target othello/modern-en \
  --target antony-and-cleopatra/original-en \
  --target henry-iv-part-2/modern-en \
  --target romeo-and-juliet/modern-en \
  --target merry-wives-of-windsor/original-en \
  --target merry-wives-of-windsor/modern-en \
  --target taming-of-the-shrew/original-en \
  --target measure-for-measure/original-en \
  --target macbeth/modern-en \
  --target utilitarianism/modern-en \
  --target poetics/modern-en \
  --target communist-manifesto/original-en \
  --target the-manual/modern-en \
  --model small.en --upload 2>&1 | tee -a /workspace/tinct/ledger/shard-4-en.log
```

Shard 4 Danish command (do not run without explicit approval):

```bash
python3 app/tts/generate-words-sidecar.py \
  --target anna-karenina/modern-da \
  --target the-awakening/modern-da \
  --target social-contract/modern-da \
  --target othello/modern-da \
  --target romeo-and-juliet/modern-da \
  --target discourse-on-inequality/modern-da \
  --target beowulf/modern-da \
  --target descartes-meditations/modern-da \
  --target utilitarianism/modern-da \
  --target jekyll-and-hyde/modern-da \
  --target midsummer/modern-da \
  --target symposium/modern-da \
  --target medea/modern-da \
  --target antigone/modern-da \
  --target communist-manifesto/modern-da \
  --target us-founding-documents/modern-da \
  --target the-manual/modern-da \
  --model small --upload 2>&1 | tee -a /workspace/tinct/ledger/shard-4-da.log
```

## 7. RunPod command sequences

Placeholders: `<R2_TOKEN>` is the dedicated R2 object read/write token; never
paste it into a file in the repo, a Markdown doc, or `app/.env`.

### 7.1 Bootstrap and capability check

```bash
# fresh RunPod pod (PyTorch template, RTX 4090 class), web terminal
curl -fsSL https://raw.githubusercontent.com/anderskhv/tinct/main/app/tts/runpod-bootstrap.sh | bash
# if this branch is not yet on main, instead:
#   git -C /workspace/tinct/repo fetch origin codex/claude-word-timing-production
#   git -C /workspace/tinct/repo checkout codex/claude-word-timing-production

export CLOUDFLARE_API_TOKEN="<R2_TOKEN>"          # or: export CLOUDFLARE_API_TOKEN="$CLOUDFLARE_R2_TOKEN"
export CLOUDFLARE_ACCOUNT_ID="58f26c4a077e8c66e0b017d2399ae1b3"
cd /workspace/tinct/repo
mkdir -p /workspace/tinct/ledger

# offline self-tests on the pod (same four suites as section 3)
(cd app/scripts && node --test validate-words-sidecar.test.cjs)
(cd app/tts && python3 words_sidecar_lib_test.py && python3 generate_words_sidecar_test.py)
(cd books && python3 r2_words_sidecar_coverage_test.py)

# capability check: a known-object GET FIRST, never a bucket list
(cd app && wrangler r2 object get tinct-audio/bible/kjv-en/ch1/words.json --file /tmp/kjv-ch1.words.json --remote)
node app/scripts/validate-words-sidecar.cjs /tmp/kjv-ch1.words.json --edition bible-kjv-en --chapter 1
# expected: OK ... (N paragraphs). If this GET fails, stop: the token is wrong or lacks object read.
```

### 7.2 Canary (execution-plan steps 2–4), one object at a time

```bash
# 0. copy the two pilot files to the pod (scp / RunPod file upload), then confirm hashes:
sha256sum /workspace/pilots/bible-web-en-ch1.words.json      # expect 2f0e8e15031138a2e78735fc6033cacf612ebc7c4cc8afac38b784cd0e53b7c3
sha256sum /workspace/pilots/bible-modern-en-ch1.words.json   # expect 1b384804edf8ceaa04a8af7e0c8ffa07a544c0847c030dc3db131ea7334f64e5
node app/scripts/validate-words-sidecar.cjs /workspace/pilots/bible-web-en-ch1.words.json    --edition bible-web-en    --chapter 1
node app/scripts/validate-words-sidecar.cjs /workspace/pilots/bible-modern-en-ch1.words.json --edition bible-modern-en --chapter 1

# 1. no-overwrite guard: the key must NOT exist yet (expect HTTP 404)
curl -s -o /dev/null -w '%{http_code}\n' 'https://tinct.app/api/audio-file?path=bible%2Fweb-en%2Fch1%2Fwords.json'

# 2. put WEB only
(cd app && wrangler r2 object put tinct-audio/bible/web-en/ch1/words.json \
  --file /workspace/pilots/bible-web-en-ch1.words.json --content-type application/json --remote)

# 3. GET back through the reader's own endpoint and through R2; hash + validate both
curl -s 'https://tinct.app/api/audio-file?path=bible%2Fweb-en%2Fch1%2Fwords.json' -o /tmp/web-en-ch1.live.json
(cd app && wrangler r2 object get tinct-audio/bible/web-en/ch1/words.json --file /tmp/web-en-ch1.r2.json --remote)
sha256sum /tmp/web-en-ch1.live.json /tmp/web-en-ch1.r2.json     # both must equal 2f0e8e15031138a2e78735fc6033cacf612ebc7c4cc8afac38b784cd0e53b7c3
node app/scripts/validate-words-sidecar.cjs /tmp/web-en-ch1.live.json --edition bible-web-en --chapter 1
python3 -c "import json;d=json.load(open('/tmp/web-en-ch1.live.json'));print(d['chapter'],d['bookId'],d['editionKey'],d['method'],d['model'],d['alignment'])"

# 4. HUMAN: tinct.app, private window, Genesis 1 WEB, play at 1x and 2x — moving word highlight,
#    paragraph transitions, pause/resume, page turn; KJV still tracks; Modern still paragraph-fallback.
#    Only after that passes, repeat 1–4 for bible/modern-en/ch1 with the modern pilot file.
```

Rollback for a bad canary object: `wrangler r2 object delete tinct-audio/bible/web-en/ch1/words.json --remote`
(the reader then returns to paragraph fallback; no deploy involved). Note the
Worker caches `words.json` with `Cache-Control: public, max-age=86400`.

### 7.3 Calibration batch (execution-plan step 5) — measure before any shard

```bash
cd /workspace/tinct/repo
tmux new -s words
export CLOUDFLARE_API_TOKEN="<R2_TOKEN>"; export CLOUDFLARE_ACCOUNT_ID="58f26c4a077e8c66e0b017d2399ae1b3"
python3 -c "import faster_whisper, torch; print(torch.cuda.get_device_name(0))"
date +%s > /workspace/tinct/ledger/calib-start
python3 app/tts/generate-words-sidecar.py --target bible/web-en --target bible/modern-en \
  --start-ch 1 --end-ch 10 --model small.en --upload 2>&1 | tee -a /workspace/tinct/ledger/calib-genesis-1-10.log
date +%s > /workspace/tinct/ledger/calib-end
grep -E 'ch[0-9]+: (OK|FAIL|skip|uploaded)' /workspace/tinct/ledger/calib-genesis-1-10.log
# throughput = 58.6 audio-minutes / ((calib-end - calib-start) / 60)
```

Then Genesis 1–50 with `--end-ch 50`, then the shard commands in 6.4 (English
first; Danish only on approval). Reattach with `tmux attach -t words`.

## 8. Planning estimates (quoted from `EXECUTION-PLAN.md`; unmeasured)

All of the following are **planning estimates, unmeasured**, copied from the
execution plan so this document does not invent new numbers. They are to be
replaced by the section 7.3 measurement.

- RunPod RTX 4090 throughput: **15–35× real time** (conservative, because the
  tool transcribes one short paragraph file at a time).
- Total GPU time for the full 1,828.8 h corpus: **52–122 GPU-hours**; the
  missing-only set (1,761.9 h est.) is slightly smaller.
- Four balanced 4090 pods: **13–31 wall-clock hours**, plus audit, setup,
  failure triage and final verification.
- Compute cost: **$18–$42** Community Cloud ($0.34/GPU-h) or **$39–$90** Secure
  Cloud ($0.74/GPU-h); with a 20–30% retry allowance **$20–$55** / **$45–$120**.
- Storage: ~98.2 bytes per token → about **1.83 GB** of new `words.json`;
  ~$0.03/month at R2 Standard if the free allowance is consumed. 12,567 Class A
  writes are far under the free allowance. ~106 GB of MP3 download (R2 egress
  free; paragraph MP3s are deleted after transcription).
- Local CPU alternative: **400–600 CPU-hours** (3–5.5× real time observed on the
  pilots) — not the sensible default.

## 9. Tooling observations (not fixed in this lane; reported)

1. **No post-upload verification and no true no-overwrite.** `r2_put` calls
   `wrangler r2 object put` unconditionally; there is no conditional write and
   no GET/hash after upload. The pre-flight `words_on_r2` + `sidecar_on_r2_is_valid`
   skip is the only guard, and an existing-but-invalid object is overwritten
   without `--force`. Execution-plan hardening item 5 is therefore only partly
   met; the canary procedure in 7.2 compensates manually.
2. **Stale credential wording.** The generator docstring still says
   `CLOUDFLARE_API_TOKEN — wrangler r2 object put (RunPod R2 token or Workers token)`
   and "Upload with --upload (Workers deploy token or R2 upload token)". The
   policy (`docs/workflow-boundaries.md`, execution plan) is R2 token only.
   `app/tts/RUNPOD_SETUP.md` has the same inconsistency per the plan.
3. **No structured ledger.** Progress is stdout only; the plan's JSONL
   per-chapter ledger (expected tokens, observed alignment, object size/hash,
   error class) does not exist. Section 6.2 uses tee'd logs as the interim.
4. **No shard generation.** `r2_words_sidecar_coverage.py --runpod-command`
   emits one command listing every incomplete target (231 today), not balanced
   shards. Section 6.4 supplies them by hand.
5. **Dead code.** In `generate_chapter`, `if not entry or pindex < 0: continue`
   is immediately followed by a second `if pindex < 0: continue`. Harmless.
6. **Validator ergonomics.** `validate-words-sidecar.cjs` throws a raw stack
   trace (exit 1) on a missing input file rather than a message. The Node
   validator does not check `start >= 0`; the Python one does. Both check
   `end >= start` and monotonic `start`.
7. **Asset fallback interaction.** `app/src/worker/routes/audio.ts`
   (`readAudioAsset`) can serve `/audio/{path}/words.json` from Worker assets
   when R2 has none; the generator's `words_on_r2` HEAD would then treat such
   an asset as "already on R2". No such assets exist today (`app/public/audio/`
   is absent), so this is a latent, not current, issue.
8. **Retry classification** in `r2_put` is substring-based on the wrangler
   error text (`503/500/502/504/timeout/ECONNRESET`); anything else fails fast.
   Acceptable for sequential uploads; revisit if parallelised.

None of these blocks the canary. Items 1–3 should be addressed before the
catalogue run, in a separate tooling commit.

## 10. Repository state delivered by this lane

- `d478e8b3` — `tools: harden word timing recovery pipeline` (cherry-pick of
  `9684bd4e`; nine tooling files only).
- one further commit — this document.
- No pilot JSON, logs, `__pycache__`, or artifacts were committed; the working
  tree is clean after the docs commit.

## Canary upload and production verification (2026-09-05)

Lane 2 rerun in a fresh cloud session with network egress and two tokens in
the environment. Outcome: **stopped at step 2 (known-object read test)**.
The value supplied as `CLOUDFLARE_R2_TOKEN` is rejected by Cloudflare as an
invalid API token, so no object was read from or written to R2. Nothing was
uploaded; both target keys are still absent from production.

### Environment facts

| Fact | Value |
|---|---|
| Checkout | `codex/claude-word-timing-production` at `df82698f`, `git status --short` clean before and after `npm ci` |
| Node / npm | v22.22.2 / npm 11 (npm suggested 12.0.2; not upgraded) |
| wrangler | 4.124.0 via `npx` from `app/` after `npm ci --no-audit --no-fund` |
| Egress | works to `tinct.app` and `api.cloudflare.com` through the session proxy (TLS re-terminated; the proxy reported no relay failures and does not inject Cloudflare credentials) |
| `app/.env`, `app/.dev.vars` | absent, so wrangler could only have read the inline `CLOUDFLARE_API_TOKEN` override (it printed "The API Token is read from the CLOUDFLARE_API_TOKEN environment variable") |
| GPU / faster-whisper | none / not installed; no benchmark attempted |
| Browser | preinstalled Chromium under `/opt/pw-browsers`; not used, because step 5 needs the sidecars on production first |

### Step 1 — pilot files (pass)

Fetched from `origin/codex/ref-artifacts-2026-09-04` with `git show` into
`/tmp/pilots/` (not committed).

| File | Size | SHA-256 | Matches §4.2 | Validator |
|---|---|---|---|---|
| `bible-web-en-ch1.words.json` | 72,454 B | `2f0e8e15031138a2e78735fc6033cacf612ebc7c4cc8afac38b784cd0e53b7c3` | yes | `OK … (7 paragraphs)`, exit 0 (`--edition bible-web-en --chapter 1`) |
| `bible-modern-en-ch1.words.json` | 72,226 B | `1b384804edf8ceaa04a8af7e0c8ffa07a544c0847c030dc3db131ea7334f64e5` | yes | `OK … (7 paragraphs)`, exit 0 (`--edition bible-modern-en --chapter 1`) |

### Production key inventory (curl, before any R2 call)

| Key (`/api/audio-file?path=…`) | HTTP | content-type | size |
|---|---|---|---|
| `bible/kjv-en/ch1/manifest.json` | 200 | application/json | 729 B |
| `bible/kjv-en/ch1/p0.mp3` | 200 | audio/mpeg | 411,693 B |
| `bible/kjv-en/ch1/words.json` (control, `cache-control: public, max-age=86400`) | 200 | application/json | 76,890 B |
| `bible/web-en/ch1/manifest.json` | 200 | application/json | 728 B |
| **`bible/web-en/ch1/words.json`** (target) | **404** | text/plain | 9 B |
| `bible/modern-en/ch1/manifest.json` | 200 | application/json | 738 B |
| **`bible/modern-en/ch1/words.json`** (target) | **404** | text/plain | 9 B |

So the no-overwrite precondition for both targets holds on production, and
`bible/kjv-en/ch1/words.json` is a real, existing object suitable for the
known-object read test.

### Step 2 — known-object read test (FAIL, hard stop)

```
cd app
CLOUDFLARE_ACCOUNT_ID=58f26c4a077e8c66e0b017d2399ae1b3 CLOUDFLARE_API_TOKEN="<R2_TOKEN>" \
  npx wrangler r2 object get tinct-audio/bible/kjv-en/ch1/words.json --file /tmp/kjv-ch1.words.json --remote
```

Result: exit 1, output file 0 bytes. wrangler resolved the account
(`Ahvelplund@fastmail.com's Account`, `58f26c4a077e8c66e0b017d2399ae1b3`) and
then:

```
✘ [ERROR] Failed to fetch /accounts/58f26c4a077e8c66e0b017d2399ae1b3/r2/buckets/tinct-audio/objects/bible/kjv-en/ch1/words.json - 403: Forbidden;
{"success":false,"errors":[{"code":10000,"message":"Authentication error"}],"messages":[],"result":null}
```

This is an object-level GET, not a bucket list, so the §5 caveat (a 10000 on
`bucket list` proves nothing) does not apply: the token is not authorized for
object reads on `tinct-audio`.

Two confirming checks, both with the same `<R2_TOKEN>` value:

| Check | Result |
|---|---|
| `curl -H "Authorization: Bearer <R2_TOKEN>" https://api.cloudflare.com/client/v4/user/tokens/verify` | `{"success":false,"errors":[{"code":1000,"message":"Invalid API Token"}]}` |
| Direct REST GET of the same object (`…/r2/buckets/tinct-audio/objects/bible/kjv-en/ch1/words.json`) | HTTP 403, code 10000 "Authentication error" (identical to wrangler) |

Code 1000 from `tokens/verify` means Cloudflare does not recognise the value
as any API token at all (an existing token with insufficient scope would
verify as `active` and then fail with 10000 on the object call). Likely
causes, in order: the wrong secret was pasted into the environment variable
(for example an R2 S3 access-key or secret rather than an API token), the
token was rolled or deleted after being created, or the value was truncated
or altered when stored. Cloudflare API tokens are usually 40 characters; the
supplied value is 53 characters of `[A-Za-z0-9_-]` with no whitespace. The
value itself was never printed or written anywhere.

The Workers deploy token was not used for any R2 or Cloudflare call, per
lane rules.

### Steps 3–5 — not attempted

| Step | Status | Reason |
|---|---|---|
| 3. No-overwrite check / upload | not attempted | No authorised token; production already shows both targets 404, so nothing would have been overwritten had the token worked |
| 4. R2 GET / hash / validator / production headers | not attempted | Nothing uploaded |
| 5. Highlighting at 1× and 2× (`web-en`, `modern-en`) | not attempted | Sidecars are not on production; the reader would only exercise client measurement fallback, which is not what the canary tests |

### What remains blocked

- **Step 2 onward**: a valid least-privilege R2 API token (Object Read &
  Write on bucket `tinct-audio`, created under Account → R2 → Manage API
  tokens or as a user API token with the `Workers R2 Storage` permission)
  exported as `CLOUDFLARE_R2_TOKEN`. First check on the rerun:
  `tokens/verify` must return `"status":"active"`, then the known-object GET
  above must produce a 76,890-byte file that passes
  `node app/scripts/validate-words-sidecar.cjs /tmp/kjv-ch1.words.json --edition bible-kjv-en --chapter 1`.
- **Genesis 1–10 GPU benchmark** (`generate-words-sidecar.py --start-ch 1 --end-ch 10`): still needs a GPU pod; nothing here.
- **Human listening pass** at 1× and 2× on `web-en` and `modern-en`: still
  needed after the upload; the headless check in step 5 only asserts word
  identity against the sidecar, never perceptual sync.

### Exact commands used

```bash
git rev-parse --short HEAD && git status --short          # df82698f, clean
git fetch origin codex/ref-artifacts-2026-09-04
mkdir -p /tmp/pilots
git show origin/codex/ref-artifacts-2026-09-04:artifacts/tinct-word-timing-recovery-2026-09-04/pilots/bible-web-en-ch1.words.json    > /tmp/pilots/bible-web-en-ch1.words.json
git show origin/codex/ref-artifacts-2026-09-04:artifacts/tinct-word-timing-recovery-2026-09-04/pilots/bible-modern-en-ch1.words.json > /tmp/pilots/bible-modern-en-ch1.words.json
sha256sum /tmp/pilots/*.json
node app/scripts/validate-words-sidecar.cjs /tmp/pilots/bible-web-en-ch1.words.json    --edition bible-web-en    --chapter 1
node app/scripts/validate-words-sidecar.cjs /tmp/pilots/bible-modern-en-ch1.words.json --edition bible-modern-en --chapter 1

for k in bible/kjv-en/ch1/manifest.json bible/kjv-en/ch1/p0.mp3 bible/kjv-en/ch1/words.json \
         bible/web-en/ch1/manifest.json bible/web-en/ch1/words.json \
         bible/modern-en/ch1/manifest.json bible/modern-en/ch1/words.json; do
  printf '%s -> ' "$k"; curl -s -o /dev/null -w '%{http_code} %{content_type} %{size_download}\n' "https://tinct.app/api/audio-file?path=$k"
done

cd app && npm ci --no-audit --no-fund && npx wrangler --version   # 4.124.0
CLOUDFLARE_ACCOUNT_ID=58f26c4a077e8c66e0b017d2399ae1b3 CLOUDFLARE_API_TOKEN="<R2_TOKEN>" \
  npx wrangler r2 object get tinct-audio/bible/kjv-en/ch1/words.json --file /tmp/kjv-ch1.words.json --remote   # exit 1, 403 / 10000
curl -sS -H "Authorization: Bearer <R2_TOKEN>" https://api.cloudflare.com/client/v4/user/tokens/verify          # code 1000 Invalid API Token
curl -sS -o /tmp/kjv-rest.json -w 'http=%{http_code}\n' -H "Authorization: Bearer <R2_TOKEN>" \
  "https://api.cloudflare.com/client/v4/accounts/58f26c4a077e8c66e0b017d2399ae1b3/r2/buckets/tinct-audio/objects/bible/kjv-en/ch1/words.json"  # 403 / 10000
```

Not run: `wrangler r2 object put`, `wrangler deploy`, any bucket list, any
GPU or corpus job.

### Rerun with Workers R2 Storage token (2026-09-05, later)

Lane 2 rerun in a fresh cloud session, checkout
`codex/claude-word-timing-production` at `016a1975`, `git status --short`
clean before and after `npm ci --no-audit --no-fund` (wrangler 4.124.0 via
`npx` from `app/`). Outcome: **stopped again at step 2 (known-object read
test)**. The token supplied as `CLOUDFLARE_R2_TOKEN` is a real, active
Cloudflare **account-owned API token**, but Cloudflare answers every R2
endpoint with `403` / code `10000 Authentication error`, so it carries no
effective R2 permission on account `58f26c4a…`. Nothing was read from or
written to R2. Nothing was uploaded; both target keys are still `404` on
production. The Workers deploy token was not used for any R2 or Cloudflare
call.

**Token type used (described, never the value):** `CLOUDFLARE_R2_TOKEN`,
53 characters of `[A-Za-z0-9_-]`, which wrangler identifies as an *Account
API Token* ("You are logged in with an Account API Token, associated with
the account Ahvelplund@fastmail.com's Account"). Cloudflare's own
`accounts/{id}/tokens/verify` endpoint reports it `active`, `not_before`
`2026-09-05T05:31:23Z`, `expires_on` `2026-10-05T05:31:23Z`. Its SHA-256
prefix (`4c2a18aa…`, recorded only so a future rerun can tell whether the
value changed) was not recorded on the earlier rerun, so it is unknown
whether this is the same value that was rejected earlier today.

**Correction to the earlier rerun's diagnosis.** The earlier section read
code `1000 Invalid API Token` from `/client/v4/user/tokens/verify` as proof
that the value was not a token at all. That endpoint only verifies
*user-owned* tokens; an account-owned token always gets `1000` there and
must be verified at `/client/v4/accounts/{account_id}/tokens/verify`, where
this one verifies fine. So the earlier value may well have been a genuine
account-owned token with the same missing R2 permission as this one. The
`10000` on object GET, which is what actually blocks the canary, is
unchanged between the two reruns.

#### Step results

| Step | Result |
|---|---|
| 1. Pilots | **pass.** `bible-web-en-ch1.words.json` 72,454 B, SHA-256 `2f0e8e15031138a2e78735fc6033cacf612ebc7c4cc8afac38b784cd0e53b7c3`; `bible-modern-en-ch1.words.json` 72,226 B, SHA-256 `1b384804edf8ceaa04a8af7e0c8ffa07a544c0847c030dc3db131ea7334f64e5`. Both equal the recorded hashes. Validator: `OK … (7 paragraphs)`, exit 0 for both (`--edition bible-web-en --chapter 1`, `--edition bible-modern-en --chapter 1`). |
| 2. Known-object read | **fail (hard stop).** `wrangler r2 object get tinct-audio/bible/kjv-en/ch1/words.json … --remote` exit 1, output file 0 bytes. Error: `Failed to fetch /accounts/58f26c4a077e8c66e0b017d2399ae1b3/r2/buckets/tinct-audio/objects/bible/kjv-en/ch1/words.json - 403: Forbidden; {"success":false,"errors":[{"code":10000,"message":"Authentication error"}]}`. Production still serves the same key at 200 / 76,890 B, so the object exists. |
| 3. No-overwrite / upload | not attempted (no authorised token). Production: `bible/web-en/ch1/words.json` 404, `bible/modern-en/ch1/words.json` 404, so nothing would have been overwritten. |
| 4. Verify | not attempted (nothing uploaded). |
| 5. Highlighting 1× / 2× | n/a — production not serving sidecar yet. |

#### Diagnostic probes (all read-only, same token)

| Probe | Result |
|---|---|
| `GET /client/v4/user/tokens/verify` | `{"success":false,"errors":[{"code":1000,"message":"Invalid API Token"}]}` (expected for an account-owned token) |
| `GET /client/v4/accounts/58f26c4a…/tokens/verify` | `success:true`, `status:"active"`, valid 2026-09-05T05:31:23Z → 2026-10-05T05:31:23Z |
| wrangler account resolution (`GET /accounts`) | works: lists `Ahvelplund@fastmail.com's Account` |
| `GET …/r2/buckets/tinct-audio/objects/bible/kjv-en/ch1/words.json` (wrangler, object read) | 403, code 10000 `Authentication error` |
| `GET …/r2/buckets/tinct-audio` (single-bucket metadata, not a list) | 403, code 10000 `Authentication error` |
| `GET …/accounts/58f26c4a…/tokens/<own id>` (read own policy) | 403, code 9109 `Unauthorized to access requested resource` (token has no *Account API Tokens Read*, so its policy cannot be inspected from here) |
| Cloudflare docs, account-owned token compatibility matrix | R2 and Workers both listed as supported, so the token *type* is not the problem |
| `curl https://tinct.app/api/audio-file?path=bible/kjv-en/ch1/words.json` | 200, `application/json`, 76,890 B (egress and production fine) |

No bucket list was attempted.

**Interpretation.** An active account-owned token that can list accounts but
gets `10000` on both the bucket resource and an object under it has no
R2 permission that applies to `tinct-audio` on this account. Likely causes,
in order: the permission chosen at creation was not *Workers R2 Storage*
(for example *Workers R2 Data Catalog* or *R2 SQL*, which sit next to it in
the picker); the token's account resource does not include this account; or
a bucket-level resource scope was set that does not match `tinct-audio`.
IP filtering is unlikely (that surfaces as `9109`/`9106`, not `10000`, and
the verify call succeeds from this IP). This session cannot distinguish
between these because the token cannot read its own policy.

#### Production headers (targets unchanged since the earlier rerun)

| Key (`/api/audio-file?path=…`) | HTTP | content-type | size |
|---|---|---|---|
| `bible/kjv-en/ch1/words.json` (control) | 200 | application/json | 76,890 B |
| `bible/web-en/ch1/manifest.json` | 200 | application/json | 728 B |
| **`bible/web-en/ch1/words.json`** | **404** | text/plain;charset=UTF-8 | 9 B |
| `bible/modern-en/ch1/manifest.json` | 200 | application/json | 738 B |
| **`bible/modern-en/ch1/words.json`** | **404** | text/plain;charset=UTF-8 | 9 B |

Highlighting tables: none (step 5 n/a; the reader would only exercise the
client-measurement fallback, which is not what the canary tests).

#### What remains blocked

- **Step 2 onward**: a token whose policy actually grants *Workers R2
  Storage: Edit* (or Read for step 2, Edit for step 3) on this account.
  Whoever creates it should open the token in the dashboard and confirm the
  permission row reads exactly `Account · Workers R2 Storage · Edit` and
  that *Account Resources* includes `Ahvelplund@fastmail.com's Account`.
  An account-owned token is fine (R2 supports them); a user-owned token
  from *My Profile → API Tokens* also works. First checks on the next rerun:
  `accounts/{id}/tokens/verify` returns `active`, then
  `GET …/r2/buckets/tinct-audio` returns `success:true`, then the known-object
  GET above produces a 76,890-byte file that passes
  `node app/scripts/validate-words-sidecar.cjs /tmp/kjv-ch1.words.json --edition bible-kjv-en --chapter 1`.
- **Genesis 1–10 GPU benchmark** (`generate-words-sidecar.py --start-ch 1 --end-ch 10`): still needs a GPU pod; nothing here.
- **Human listening pass** at 1× and 2× on `web-en` and `modern-en`: still
  needed after the upload; the headless check in step 5 only asserts word
  identity against the sidecar, never perceptual sync.

#### Exact commands used

```bash
git rev-parse --short HEAD && git status --short          # 016a1975, clean
git fetch origin codex/ref-artifacts-2026-09-04
mkdir -p /tmp/pilots
git show origin/codex/ref-artifacts-2026-09-04:artifacts/tinct-word-timing-recovery-2026-09-04/pilots/bible-web-en-ch1.words.json    > /tmp/pilots/bible-web-en-ch1.words.json
git show origin/codex/ref-artifacts-2026-09-04:artifacts/tinct-word-timing-recovery-2026-09-04/pilots/bible-modern-en-ch1.words.json > /tmp/pilots/bible-modern-en-ch1.words.json
sha256sum /tmp/pilots/*.json
node app/scripts/validate-words-sidecar.cjs /tmp/pilots/bible-web-en-ch1.words.json    --edition bible-web-en    --chapter 1   # OK, exit 0
node app/scripts/validate-words-sidecar.cjs /tmp/pilots/bible-modern-en-ch1.words.json --edition bible-modern-en --chapter 1   # OK, exit 0

cd app && npm ci --no-audit --no-fund && npx wrangler --version   # 4.124.0
curl -sS -H "Authorization: Bearer <R2_TOKEN>" https://api.cloudflare.com/client/v4/user/tokens/verify                                   # code 1000 (user endpoint; n/a for account token)
curl -sS -H "Authorization: Bearer <R2_TOKEN>" https://api.cloudflare.com/client/v4/accounts/58f26c4a077e8c66e0b017d2399ae1b3/tokens/verify  # status active
for k in bible/kjv-en/ch1/words.json bible/web-en/ch1/manifest.json bible/web-en/ch1/words.json \
         bible/modern-en/ch1/manifest.json bible/modern-en/ch1/words.json; do
  printf '%s -> ' "$k"; curl -s -o /dev/null -w '%{http_code} %{content_type} %{size_download}\n' "https://tinct.app/api/audio-file?path=$k"
done
CLOUDFLARE_ACCOUNT_ID=58f26c4a077e8c66e0b017d2399ae1b3 CLOUDFLARE_API_TOKEN="<R2_TOKEN>" \
  npx wrangler r2 object get tinct-audio/bible/kjv-en/ch1/words.json --file /tmp/kjv-ch1.words.json --remote   # exit 1, 403 / 10000, 0-byte file
curl -sS -H "Authorization: Bearer <R2_TOKEN>" \
  https://api.cloudflare.com/client/v4/accounts/58f26c4a077e8c66e0b017d2399ae1b3/r2/buckets/tinct-audio          # 403 / 10000
curl -sS -H "Authorization: Bearer <R2_TOKEN>" \
  https://api.cloudflare.com/client/v4/accounts/58f26c4a077e8c66e0b017d2399ae1b3/tokens/<token id>              # 403 / 9109
```

Not run: `wrangler r2 object put`, `wrangler deploy`, any bucket list, any
GPU or corpus job, any browser session.
