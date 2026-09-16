# Tinct reading-companion benchmark

Created 2026-09-16. **Status: benchmark tooling and fixtures; no real model answers or winning model yet.** This is an internal, descriptive pilot, not an official benchmark or a statistically established model ranking.

## Question

Which candidate gives the more useful, thoughtful and trustworthy explanation for Tinct readers: Claude Sonnet 5 or GPT-5.6 Terra?

Separate two questions:
1. **Matched text quality (implemented here):** identical passage, question, conversation, source packet and shared instruction; no tools.
2. **Complete voice experience (acceptance plan below):** production prompts, retrieval, turn detection, audio, playback controls and latency. A text-only result cannot prove which voice experience is better.

No application behavior, production models or book content is changed by this benchmark.

## Cases and evidence

24 cases across six books: Job (8), Hamlet (3), Odyssey (3), Meditations (4), Apology (3), Pride and Prejudice (3). Exact public-domain excerpts are frozen from Tinct editions, with source blob SHA, chapter and zero-based inclusive paragraph indices. Validation checks both the Git blob hash and the extracted text. If an edition changes, review and version fixtures; do not silently regenerate.

- 7 calibration cases (Meditations, Apology): use for rubric training and prompt experiments.
- 8 regression cases (Job): known reported failures, including the Keller correction and explanation handoff.
- 9 held-out cases (Hamlet, Odyssey, Austen): reserve from prompt tuning. They are not secret or contamination-free; keep them untouched during this experiment.
- Three repeats per candidate: 144 scheduled outcomes for the full pilot. Repeats are not independent questions.

Case checks are reviewer guidance, not canonical literary answers or keyword tests. Other defensible readings should score well when supported. These fixtures do not semantically approve or alter published book content.

The Keller source packet is a short editorial paraphrase of [Keller's own article](https://timothykeller.com/blog/2012/8/6/4-wrong-answers-to-the-question-why-me), checked 2026-09-16. It supports the thematic connection but not an exact quotation/page for Job 8:4. Both candidates receive the same packet. This deliberately tests attribution and responding to a correction, not web-search capability.

The design follows the principle of task-specific datasets, pairwise review and human calibration in [OpenAI's evaluation guidance](https://developers.openai.com/api/docs/guides/evaluation-best-practices). It makes no claim that this rubric itself has been externally validated.

## Run in the cloud checkout

Node 24.13.0, no dependencies and no network access required by this tool. Run from repository root:

~~~sh
node --test benchmarks/reading-companion/benchmark.test.mjs
node benchmarks/reading-companion/benchmark.mjs validate benchmarks/reading-companion/cases.json .
node benchmarks/reading-companion/benchmark.mjs prepare benchmarks/reading-companion/cases.json benchmarks/reading-companion/candidates.json /tmp/tinct-benchmark-run calibration
~~~

Omit the final split argument for all 24 cases, or use regression / holdout. Use a fresh output directory for each experiment. The CLI refuses to overwrite existing output.

The checked-in candidates record the intended production-aligned comparison: Sonnet low effort versus Terra provider-default effort. They are **not compute-equivalent**. The shared 1,024 output-token ceiling also does not guarantee equal usable answer length if providers account for reasoning differently. Confirm exact model availability and resolved effort before collection. Change the run ID for every experiment; preserve old manifests. For a separate higher-effort comparison, make a new config and run; never mix settings within a run.

Preparation writes manifest.json and requests.jsonl. Evaluation checks stay in the manifest; submit only each request's prompt plus its settings to the model. Render the structured prompt consistently for both providers; record that rendering and any endpoint-specific settings alongside the run. Never send checks, ratings or candidate identities as answer instructions.

**Collection is intentionally not automated.** AGENTS.md prohibits Anthropic API calls during development. These scripts make no provider calls, use no API credentials and incur no inference charges. A real paired run requires an explicit exception to that instruction, or previously collected authorized responses. Do not treat this README as authorization. Do not route around the restriction through the production reader.

Once collection is authorized:
- Freeze config, prompt serialization, split, run ID and a spend cap before looking at answers.
- Alternate/randomize provider request order, run repeats in separate passes, use fresh conversations and equal concurrency. Log timestamps, region, caching and retries.
- Record every scheduled request, including timeouts/errors/truncation. No silent retries or cherry-picking: each retry must be a separately declared run.
- Record returned model version; if unavailable, use the literal provider-unreported and preserve requested identity. Record resolved effort or its unavailability in collection metadata.
- Define elapsed_ms as request dispatch to full text, ttft_ms as dispatch to first nonempty answer text (not a reasoning token). Use a monotonic clock. Report null for unmeasured values, never invented zeroes.
- Token/cost metadata comes from actual provider usage/pricing, not estimates disguised as measurements. No cost comparison when missing. This CLI treats cost as nullable and does not fetch prices.

Create one JSON object per line in results.jsonl with these fields (copy IDs and hashes from requests.jsonl):

~~~json
{
  "run_id": "YOUR_RUN_ID",
  "case_id": "job-anguish",
  "repeat": 1,
  "candidate": "sonnet",
  "request_hash": "COPY_FROM_REQUEST",
  "config_hash": "COPY_FROM_REQUEST",
  "status": "ok",
  "response": "ACTUAL_UNEDITED_MODEL_OUTPUT",
  "resolved_model": "ACTUAL_RETURNED_MODEL_OR_provider-unreported",
  "elapsed_ms": 1234,
  "ttft_ms": 300,
  "cost_usd": null
}
~~~

The numbers above illustrate the schema, not benchmark measurements. status is ok, error, timeout or truncated. A non-ok outcome may have an empty response; retain provider error details in separate collection logs without secrets. Keep raw responses, usage, timestamps, rendering and provider configuration privately with the manifest.

## Blind review

~~~sh
node benchmarks/reading-companion/benchmark.mjs blind /tmp/tinct-benchmark-run/manifest.json /tmp/results.jsonl /tmp/tinct-benchmark-review
~~~

Share only review.html (or review.json), ratings.json and this rubric with reviewers. **Keep private-key.json, manifest, results, timing and provider logs private until ratings are locked.** Answer A/B is independently randomized per pair; order is shuffled. Text is unedited and HTML-escaped. Style or self-identification in an answer can still reveal identity; record suspected unblinding rather than selectively editing responses.

Open review.html to read pairs; fill ratings.json in an editor:
- reviewer: stable pseudonymous ID.
- preference: A, B, tie or both-poor.
- Each answer: five integer scores 0–4, evidence notes, severe flags (empty array if none).
- Put supporting details in notes, especially for low scores or a preference.
- Score every successful pair. Both-poor is distinct from an acceptable tie.
- Failed/truncated pairs are excluded from subjective comparison and separately counted; they must not disappear from the reliability result.

Use Anders as the primary product reviewer and, if available, a second independent reviewer familiar with literary interpretation. Calibrate only on the calibration set, then score regression/holdout independently. Keep each reviewer's ratings and report separate; discuss disagreements after locking them. Do not use a candidate model as the sole judge of itself.

| Dimension | Weight | What matters |
|---|---:|---|
| Grounding | 25% | Correct speaker, facts, textual evidence; calibrated uncertainty |
| Depth | 25% | Explains why/how, tension and nuance; more than paraphrase |
| Relevance | 25% | Answers the actual question, correction and conversation; respects scope/spoilers |
| Clarity | 15% | Warm, accessible, coherent; fits requested length and spoken mode |
| Attribution | 10% | Distinguishes source, interpretation and quotation; no invented authority |

Anchors apply to each dimension:
- 0: fundamentally fails or contradicts the evidence.
- 1: major problems; little usable value.
- 2: adequate but with meaningful omissions or muddle.
- 3: strong, accurate and useful with minor weaknesses.
- 4: excellent for this reader/question; nuanced without unnecessary elaboration.

A simple question can earn 4 for depth through a precise short explanation. Do not reward length, jargon, confident tone or agreement with a particular theology. Attribution can score 4 without citations when the answer only interprets the supplied text and accurately distinguishes inference.

Use severe flags such as invented-quotation, false-attribution, central-factual-error, ignored-correction or spoiler. These are reviewer judgments, not automatic keyword labels. An attractive overall score must not hide a severe problem.

## Report and decision

~~~sh
node benchmarks/reading-companion/benchmark.mjs report /tmp/tinct-benchmark-review/private-key.json /tmp/tinct-benchmark-review/ratings.json /tmp/tinct-benchmark-report.json
~~~

The report gives dimension/weighted scores separately by split, per-case preferences, successful-pair coverage, outcome counts, severe flags, nullable costs, and text latency p50/p95. Scores average repeats within each case, then average cases equally. It refuses missing, duplicate, stale or unscored data. Report all exclusions and both-poor pairs.

Do not pool calibration into the final choice. Compare regression and held-out results, inspect severe flags and human disagreement, then consider latency/cost. No automatic winner or significance claim: only nine held-out questions across three related book families is too small for confident generalization. If results are close, add independently selected passage families before looking at more outputs. Do not treat 72 repeat pairs as 72 independent questions.

## Separate voice acceptance plan

After any proposed model change, use an explicitly agreed microphone/audio testing window (not unattended browser automation). Compare the same scripted turns and book context:

1. Ask a multi-clause question with a mid-sentence pause; assistant must wait for completion.
2. Interrupt an answer, then correct the intent to the Keller question; no stale continuation or dropped correction.
3. Open Talk from an explanation and ask what a phrase in that explanation meant; context must survive.
4. Ask to resume the audiobook; resume at the start of the interrupted sentence and the correct location.
5. Ask to pause/continue playback; verify actual player state, not only the spoken promise.
6. Observe listening/thinking/speaking transitions; record flicker, duplicate transcripts and missing answers.

Measure end-of-user-turn to first audible response separately from text TTFT. Record task success, interruption timing and context correctness; do not combine these into the text-quality score.

## Maintenance / verification limits

Authoritative benchmark instructions live here. Suite version 1 has no real responses committed. Synthetic answers exist only inside regression tests and are clearly labeled. Do not commit private conversation logs, API keys or unblinding artifacts.

Cloud CI runs the test suite and exact-source validation in the verify workflow. The broader app verify workflow also remains enabled. This benchmark has no UI deployment requirement.

At creation, the remote checkout did not contain OVERVIEW.md, docs/product-current.md, docs/documentation-maintenance.md or scripts/check-docs.py referred to by AGENTS.md. They were not reconstructed from historical preservation trees. Accordingly that historical documentation checker cannot be run in the cloud checkout; this is a recorded migration/documentation gap, not a passed check.
