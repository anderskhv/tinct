# Audiobook architecture

Status: implementation branch, 2026-09-21. This is the authoritative plan for current English audiobook delivery. `fish-audio-pilot-2026-09-18.md` remains historical evidence for the cache, lock and spend-control pilot that this design adapts.

## Voice contract

- Female original/classic English uses retained Bella only for the 31 whole-edition candidates in `bella-edition-inventory-2026-09-21.md`. The code list is intentionally conservative and excludes Meditations, Faust, Jekyll, Bible, Histories and the separate repair queue.
- Every other female English tuple uses exactly `en-US-Wavenet-F`.
- Every male English tuple uses exactly `en-US-Wavenet-J`.
- One persona is resolved for the whole book/edition. Playback never falls between Bella and generated audio inside an edition.
- The reader exposes Female/Male only. Provider, model and voice IDs are implementation data.
- The same account preference selects Grok `ursa` for Female and `helios` for Male. Unsupported voices surface as session errors; there is no substitution.
- Danish generation is disabled. Provider and language are explicit cache dimensions so a future approved localization can add mappings without changing the storage model.

## Generation and cache

- The Worker sends SSML to Google v1beta1 with a mark before every spoken token and requests `SSML_MARK` timepoints. Audio is rejected unless it is a plausible MP3 and at least 85 percent of displayed words have valid, ordered timings inside the measured duration.
- Cache identity includes cache version, provider, model, exact voice, settings and stable chunk text. Audio and timing metadata are stored together under that content identity; edition maps are published only after both validate.
- Paragraph maps retain ordered chunk identities for later chapter or M4B assembly without synthesis. Downloadable export is not implemented.
- A paragraph edit makes its old map stale. Each current chunk is then probed by content identity, so unchanged chunks are reused and only changed chunks are synthesized. Chunk blobs are position-independent and shared across users, books and editions when every identity field matches.
- KV locks prevent concurrent synthesis of the same identity. Retries, circuit breaking, request deadlines, per-reader/IP rate limits, and daily/monthly text ceilings remain bounded.
- Existing Fish objects are preserved but are not selected by the production Google configuration. No Bella or Fish assets are overwritten or deleted.

## Scheduling

- The library click starts a best-effort 45-second buffer before navigation, beginning at the saved listening paragraph or chapter opening. It can inspect up to eight paragraphs but stops once the target is reached, on failure, or at the request deadline.
- The verified Anders account email is exempt both in the authenticated Worker and in the cached pre-reader identity path. Other anonymous and signed-in readers are rate-limited separately.
- Pressing Play maintains about 45 seconds ahead of the actual audio playhead. Pausing, stopping, leaving, changing edition or changing voice aborts scheduling while retaining valid cached chunks.
- Near chapter end, active playback alone prepares about 45 seconds at the next chapter opening. Silent reading never runs the rolling or next-chapter scheduler.
- Seeking into an uncached target prepares that target and preserves already cached gaps. The first uncached playback can wait briefly.

## Chapter timeline

- The existing black progress track is now a whole-chapter timeline and seeks across clips. Known clip durations are exact; missing generated clips use a text-length estimate until their audio validates, and accessibility text labels the total as estimated.
- Media Session uses the same chapter elapsed time and duration for lock-screen position, play, pause, backward, forward and seek-to actions.
- Reading position remains word/chapter based. Timeline calculations do not write or reinterpret reading progress.

## Evidence on this branch

- Cloud repository read access: `origin/main` at `0cd12bc06850ee85a1ac5dd7749cc8153062d50c`.
- Cloud repository write authority: authenticated GitHub identity `anderskhv` with admin/push permission. The local HTTPS remote itself is intentionally unauthenticated, so release writes use the GitHub connector.
- Catalogue audit: `python3 books/wip_inventory.py --audio` passed for the one staged WIP, Treasure Island. Published coverage is exercised through the full English scope rather than a hard-coded featured shelf.
- The full local suite passed: 202 files and 2,550 tests, with one file and one test intentionally skipped. Focused cases cover exact voice mapping, Bella exclusions, Google SSML marks, timing rejection, cold/warm cache behavior, provider/voice identity, concurrency, selective invalidation, pause/seek scheduling and whole-chapter Media Session seeking.
- `SKIP_ENV_CHECK=1 npm run build` and a Wrangler dry-run bundle compile succeeded locally. Local `npm run verify-bundle` correctly refused the intentionally placeholder build because this cloud checkout has no client Supabase/audio environment values. The release workflow must supply its configured values and pass `verify-bundle` before deployment.

## Acceptance limits still requiring production evidence

- Google production calls must confirm both F and J through the deployed Worker. Earlier local samples prove mark structure, not production latency or listening quality.
- Grok Ursa and Helios are listed by xAI for speech-to-speech and must each receive a successful production `session.updated` response. Automated tests remain muted and do not request microphone access.
- Browser automation can verify Media Session state and handlers. A physical phone lock-screen display and audible punctuation, headings and joins require an agreed manual test window and will not be inferred from headless results.
- Unknown future provider latency and catalogue listening quality are not promised. Cold playback may wait, and operational ceilings can refuse generation visibly.
