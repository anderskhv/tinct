# Approved collection — 2026-09-16

Anders approved the Sonnet/Terra comparison and the specific Anthropic API exception in the benchmark task. The subsequent access check found neither provider key in GitHub Actions; Anders then confirmed adding both. Availability and model access still require runtime verification.

## Frozen pilot

Use suite version 1 and the existing candidates.json without tuning on held-out answers. The full run has 24 cases × 2 candidates × 3 repeats = 144 scheduled outcomes. Sonnet uses low effort; Terra uses provider-default effort. Both have 1,024 output-token ceilings. These are not equal-compute settings. Thinking tokens can consume that ceiling on either provider. Preserve truncations in the report; do not silently rerun with a larger budget.

The collector:
- uses official HTTPS provider endpoints directly, without the production reader;
- renders identical system and user text for both providers, with no tools;
- uses one active request, alternating which provider runs first;
- enforces a $10 conservative accounting ceiling and at most 144 requests;
- uses a 120-second request timeout and zero retries;
- records partial answers, failures, usage, request/config/wire hashes, returned model/effort when provided, text TTFT and completion latency;
- stops new calls after an authentication/model-access error, retaining not-attempted outcomes;
- calculates indicative cost from reported usage and the documented standard rates, not a billing invoice; missing usage retains its conservative reservation.

The maximum request bound reserves UTF-8 prompt bytes plus 2,048 envelope tokens at the uncached input rate and the full output cap. Explicit prompt cache writes are not enabled. Pricing checked 2026-09-16: [Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra) $2/$12 per million input/output tokens; [Sonnet](https://platform.claude.com/docs/en/models/sonnet-5/whats-new-sonnet-5) $2/$10. Tokenizers differ.

## Cloud execution

Provider keys belong in GitHub Actions secrets OPENAI_API_KEY and ANTHROPIC_API_KEY. Never put values in files, logs or prompts.

The reading-benchmark workflow tests adapters with synthetic streams and checks credential availability. It performs paid collection only on an explicit manual run with run_paid=true, or the dedicated branch commit message "Run approved reading benchmark 2026-09-16". Automatic workflow reruns do not repeat paid collection. Ordinary pushes and PR checks make no provider calls.

The workflow writes a fresh run ID based on the GitHub run ID, freezes the manifest, collects outputs and creates blinded pairs. On an interrupted run, operator artifacts preserve completed records; missing records must not be presented as a complete comparison.

Artifacts expire after 30 days:
- benchmark-operator-RUN_ID: request manifest, rendered payloads (without authentication headers), raw answer records, usage, collection summary and private A/B mapping. Keep away from reviewers.
- benchmark-blind-review-RUN_ID: readable HTML, review JSON and blank ratings. No candidate/configuration/timing metadata.

These artifacts contain only the benchmark's public-domain/source packets and generated test responses, not user conversation exports. They are not committed to the public source repository.

## Interpretation

Use human review per README. Any assistant-generated scoring must be clearly labeled exploratory model judging, not human ratings. No winner can be reported from latency alone. Report error/truncation rates before comparing the subset of successful pairs. A budget-starved pilot may motivate a separately declared follow-up, but must not be silently replaced or pooled with it.
