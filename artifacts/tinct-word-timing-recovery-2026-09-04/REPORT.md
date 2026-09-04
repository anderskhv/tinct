# Tinct word-timing recovery audit

Date: 2026-09-04  
Scope: published catalogue audio and `words.json` timing sidecars only  
Production baseline observed: `cd4130d2`, bundle `assets/index-BAeR9pzn.js`  
Production changes made: none

## Bottom line

The reader's word-follow path is working when a trustworthy `words.json` sidecar exists. Genesis 1 KJV is the live control and follows individual words. Genesis 1 WEB and Modern English have audio manifests but no sidecars, so the reader correctly falls back to paragraph highlighting.

The principal defect is missing content infrastructure, not playback-speed math: 12,567 published audio chapters have no word-timing sidecar. Only Bible KJV has any sidecars today.

Two strict, local Genesis 1 pilots are ready for human listening review:

- WEB: 738/738 observed words matched, 100.0% overall and minimum paragraph match.
- Modern English: 724/735 observed words matched, 98.5% overall; weakest paragraph 95.65%.

Both pilots contain exactly one timing for every normalized edition token, have monotonic timestamps, match the manifest paragraph/file structure, remain within audio duration bounds, and pass both the Python and Node validators. Nothing was uploaded.

## Authoritative production coverage

The audit used the same production surfaces as the reader:

- `/api/audio-manifest?path={book}/{edition}/ch{N}/manifest.json`
- `/api/audio-file?path={book}/{edition}/ch{N}/words.json`

| Measure | Result |
| --- | ---: |
| Published books | 100 |
| Audio-enabled edition targets | 231 |
| Expected chapters across those editions | 14,068 |
| Audio manifests present | 13,743 |
| Audio manifests missing | 325 |
| Word sidecars present | 1,176 |
| Word sidecars missing where audio exists | 12,567 |
| Present sidecars compatible with reader normalization | 1,176 / 1,176 |
| Present sidecars with modern observed-ASR provenance metadata | 0 / 1,176 |
| Published audio measured from manifests | 1,828.816 hours |

Language split:

| Language | Edition targets | Chapters | Audio manifests | Sidecars |
| --- | ---: | ---: | ---: | ---: |
| English | 169 | 12,425 | 12,425 | 1,176 |
| Danish | 62 | 1,643 | 1,318 | 0 |

All 325 missing audio manifests belong to the incomplete War and Peace Modern Danish target. Every one of the 231 audio-enabled edition targets is incomplete for word timing.

Bible detail:

| Edition | Audio manifests | Sidecars | State |
| --- | ---: | ---: | --- |
| KJV | 1,189 | 1,176 | Genesis 1 works; 13 chapters lack sidecars |
| WEB | 1,189 | 0 | paragraph fallback everywhere |
| Modern English | 1,189 | 0 | paragraph fallback everywhere |

The 13 KJV gaps are chapters `103, 132, 197, 702, 875, 957, 961, 1044, 1089, 1100, 1149, 1179, 1186`.

The 1,176 existing KJV sidecars are structurally sound and compatible with the reader's semantic normalization. They have exact word counts, monotonic timing, correct manifest file identity, and no duration-bound failures. However, they predate the current provenance fields, so their acoustic accuracy has not been independently certified by the strict generator. That is a quality-certification gap, not evidence that they are unusable.

## Canonical pipeline and one safety issue

The repository's intended pipeline is:

1. Discover published audio targets from `app/src/data/bookRegistry.ts`.
2. Audit the production manifest and sidecar endpoints with `books/r2_words_sidecar_coverage.py`.
3. Download the exact production paragraph MP3s.
4. Transcribe them with faster-whisper word timestamps using `app/tts/generate-words-sidecar.py`.
5. Align Whisper observations to the exact TTS-cleaned edition tokens using `app/tts/words_sidecar_lib.py`.
6. Validate identity, complete token coverage, monotonic timestamps, manifest file matching, duration bounds, and a minimum observed match ratio per paragraph.
7. Upload only after validation to `tinct-audio/{book}/{edition}/ch{N}/words.json`; the batch is resumable and skips valid existing sidecars.

The pipeline was added on 2026-08-28, after most catalogue audio had already been generated. Audio generation and timing generation are separate phases, and the sidecar phase was never run catalogue-wide. That explains the present coverage.

There is one important operational caveat: the clean deployed baseline contains the older generator logic, which can count interpolated tokens as if they were observed matches. The current working-copy hardening correctly tracks actual Whisper matches, enforces the per-paragraph threshold, validates existing files before skipping, supports language-specific models, and emits provenance. Those hardening changes and their tests must be landed cleanly before any batch upload. The pilots in this report used the hardened version.

## Local Genesis 1 pilots

| Pilot | Audio length | Tokens | Observed match | Weakest paragraph | Validation |
| --- | ---: | ---: | ---: | ---: | --- |
| Bible WEB Genesis 1 | 3.78 min | 738 | 100.0% | 100.0% | pass |
| Bible Modern English Genesis 1 | 3.74 min | 735 | 98.5% | 95.65% | pass |

Spot evidence:

- WEB begins `In` at 0.05–0.53s; its final paragraph ends on `day.` at 6.97–7.33s.
- Modern begins `In` at 0.05–0.53s; its final paragraph ends on `day.` at 6.37–6.73s.

These local artifacts can restore Genesis 1 word following for the two missing English editions after a short perceptual listening check and an explicitly authorized R2 upload. Because the reader fetches sidecars at runtime, this content repair should not require a reader-code deploy.

## Representative non-Bible dry-run

The safe generator rejected, rather than published, two useful legacy-audio cases:

1. **The Art of War, chapter 1 (Original and Modern English).** Printed enumerations use `1/2/3/4/5`; Whisper correctly hears `one/two/three/four/five`. The current aligner does not treat those forms as equivalent, so affected paragraphs fall below the 85% gate. This is a narrow deterministic normalization gap.
2. **Phaedo, chapter 1 (Original English).** Older TTS spells uppercase speaker labels letter by letter—e.g. displayed `Phaedo:` is heard as `P. H. A. D. O.`. This is a real text/audio-form mismatch. It needs either an explicit, tested speaker-label equivalence rule or repaired audio; lowering the quality threshold is not safe.

This demonstrates why a blind all-catalogue upload is inappropriate. The batch should classify failures into:

- alignable as-is;
- deterministic normalization cases such as digit/number-word equivalence;
- genuine legacy text/audio mismatches requiring audio repair or regeneration.

## Fastest safe recovery plan

### 0. Land the hardened timing tool

Move the current generator, validator, coverage audit, and tests into one clean audio-tooling commit. Add deterministic digit/number-word equivalence for alignment only. Add explicit tests for speaker labels before deciding whether to map them or regenerate those audio paragraphs. Do not weaken the 85% observed-per-paragraph gate.

### 1. Restore the immediate Genesis 1 experience

Perceptually listen to the two local pilots at the beginning, middle, end, and across paragraph boundaries. If they track correctly, upload only:

- `bible/web-en/ch1/words.json`
- `bible/modern-en/ch1/words.json`

Then verify live word-role movement at 1× and a faster speed. Keep KJV as the known-good control.

Estimated remaining effort: **30–60 minutes**. The artifacts are already generated; this estimate is listening, upload, and live verification.

### 2. Recover Genesis before the entire Bible

Genesis WEB + Modern English is 100 chapters and 5.99 hours of audio. Run the strict batch, quarantine every failed paragraph, listen to a stratified sample, then upload passing chapters.

Estimated effort: **half a day** with one GPU lane, including failure review and production verification. Do not quote the compute more precisely until a 10-chapter RunPod benchmark measures real small-file overhead.

### 3. Recover the flagship reading set

Recommended first English set, because it covers the books currently central to product testing:

- Phaedo: 4.63 audio hours across Original + Modern.
- The Art of War: 2.11 hours across Original + Modern.
- The Odyssey: 19.16 hours across Original + Modern.
- Meditations: 8.45 hours across Original + Modern.
- The Republic: 20.85 hours across Original + Modern.
- Ulysses: 56.38 hours across Original + Modern.

That set is 111.58 audio hours, before the 5.99-hour Genesis slice. Add War and Peace Original + Modern only after the pipeline is stable; that adds 106.9 hours.

Estimated effort: **1–2 working days** for the 112-hour flagship set if most chapters align, or **3–5 days** if the Phaedo/legacy-TTS class is common and requires selective audio repair. Compute is parallelizable; exception review and listening QA are the critical path.

### 4. Catalogue-wide recovery

Run `books/r2_words_sidecar_coverage.py --scope public --runpod-command` to produce the exact resumable targets. Batch English with `small.en` and Danish with the multilingual `small` model. Re-run the presence and strict validity matrix after every batch.

The current catalogue contains 1,828.816 hours of published audio. The local CPU pilots processed at roughly 4–6× real time, implying about **300–460 sequential CPU hours** before retries. A single GPU's real throughput and paragraph-download overhead must be benchmarked; at a conservative 10–30× real-time range, alignment alone is approximately **61–183 GPU hours**, readily parallelized across pods.

Estimated operational effort: **one calibration day**, then roughly **1–2 working weeks** for a controlled catalogue rollout with parallel GPU lanes, validation, retries, and spot listening. If legacy audio/text mismatches are widespread, the audio-repair work becomes a separate longer content project. The 325 missing War and Peace Danish audio chapters cannot receive timings until their audio exists.

## Release gate for truthful word following

An edition/chapter should advertise word following only when all of these pass:

- audio manifest returns 200;
- sidecar returns 200;
- `bookId`, `editionKey`, chapter, paragraph, and file identities match;
- every displayed/TTS-cleaned token appears exactly once and in order;
- timestamps are finite, non-negative, monotonic, and within the matching file duration;
- every non-empty paragraph reaches at least 85% observed ASR match before interpolation;
- representative listening spots confirm perceptual tracking;
- 1× and faster playback both advance from actual `audio.currentTime` rather than synthetic pace.

If any condition fails, the honest behavior is paragraph fallback—not constant-rate pseudo-word highlighting.

## Artifacts

- `chapter-coverage-matrix.csv` — one row per published audio-enabled chapter (14,068 rows).
- `coverage-summary.json` — catalogue totals.
- `production-presence-by-edition.json` — source presence audit for all 231 edition targets.
- `production-audio-hours.json` — duration totals from all 13,743 available production manifests.
- `bible-kjv-structural-audit.json` — strict KJV structural audit.
- `kjv-reader-compatibility.json` — deployed-reader semantic-token compatibility check.
- `pilot-validation.json` — Genesis pilot quality and spot evidence.
- `pilots/bible-web-en-ch1.words.json` — local, not uploaded.
- `pilots/bible-modern-en-ch1.words.json` — local, not uploaded.
- `non-bible-dry-run.json` — Art of War and Phaedo safe-rejection evidence.

No application source, routes, catalogue, reader behavior, production R2 object, or deployment was changed by this audit.
