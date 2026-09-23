# Frankenstein and Jekyll text publication — 23 September 2026

Scope: exact approved text replacements and required character-card compatibility. No new editions, GPU/TTS generation, audio regeneration, or voice changes in this release.

Source review commit: [668985bf35e4](https://github.com/anderskhv/tinct/tree/668985bf35e4ff284bd1f60649b653257b4f9f6b). The source branch was behind current main; only the approved candidates and selected release records are integrated. Unrelated content helpers/prompts and concurrent work remain untouched.

| Book | Accepted SHA-256 | Chapters / paragraphs | Changed paragraphs | Retained / omitted card links |
| --- | --- | --- | --- | --- |
| Frankenstein | a99352b3bf5f9d1f7a78970b658f2a35722a2b5031d4037a398d284c6ab390ff | 28 / 764 | 301 | 480 / 38 |
| Jekyll and Hyde | f2cf24e93c77b354a9fa617d3440b6daaa09acd36e6fdb1df236469ac570a5ae | 10 / 339 | 235 | 504 / 1 |

Cloud preparation verifies candidate/baseline/source bytes, every accepted paragraph hash, chapter identity/counts and the exact changed-paragraph/character-impact sets. Character data is checked by the application's real verification tests. Card prose and original-edition data remain unchanged. Release revision: `2026-09-23.2`; existing versioned source requests are preserved.

The re-anchoring report records all omissions and the 17 unchanged Jekyll proper names relocated using identical spelling, unchanged occurrence counts and a unique previously reviewed character identity. Changed epithets are not new alias approvals. Two Frankenstein name spans and one Jekyll span also remain omitted when those guards could not establish a safe mapping. See [technical report](frankenstein-jekyll-release-20260923-report.json).

Both [Frankenstein](green-frankenstein/ACCEPTANCE-RECORD.md) and [Jekyll](green-jekyll-and-hyde/ACCEPTANCE-RECORD.md) have documented whole-book independent fidelity and candidate-only accessibility reviews plus final changed-passage re-verification. The original Astra reports were unavailable; this release does not claim individual reconciliation of those proposals. Jekyll chapter 10 retains the explicitly accepted first-edition **for/as** reading; it is not mechanically changed to **from**.

## Publication verification

Release via the standard tested PR and serialized deployment. Verify actual reader build-versioned edition URLs and character revision-versioned sources against the hashes above, and served character bytes against the tested commit. Bare unversioned URLs can retain legacy immutable CDN content and are not the reader's current requests. Record deployment, bundle and live-hash evidence in the release handoff; source acceptance alone is not deployment evidence.

## Stale instruction correction

Obsolete mandatory Kokoro regeneration was traced to the shared book agent instructions and workflow guide, not to a standalone release-packet template. Corrected sources: root `AGENTS.md`, `books/AGENTS.md`, `books/CLAUDE.md`, `books/TRANSLATION_PROTOCOL.md`, `docs/workflow-boundaries.md`, and `PIPELINES.md`. The retained `books/ENGLISH_AUDIO_PIPELINE.md` is explicitly historical. Both current release packets state the text-only rule; historical review evidence and accepted bytes are preserved.

The live `/api/narration/voices` response and current configuration were checked on 23 September: Google / `google-tts-v1beta1` is still deployed. `docs/audiobook-architecture-2026-09-21.md` now records the separately approved Grok plan accurately: Ara/Helios defaults, Orion/Eve optional, five-minute openings for ten exact default English editions, Play-only generation elsewhere, and cleanup after accepted cutover/rollback retention. This documentation does not claim that migration has shipped or waive future text/audio identity requirements.
