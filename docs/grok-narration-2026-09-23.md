# Grok English audiobook release

The reader retains its paragraph/chapter architecture. Grok returns English speech and word timings together. Talk remains unchanged.

## Voices and cache

Ara (`ara`, public key `f`) is the female default; Helios (`helios`, key `m`) is the male default. Orion and Eve are optional audiobook voices. Leo is excluded. Optional audiobook choices do not change Talk.

The exact normalized displayed text, provider, model identity, voice and synthesis settings form the shared content address. Timings and MP3 must validate before publication. Changed chunks invalidate independently; identical chunks across books/editions reuse audio. Sparse maps support direct seeks without synthesizing preceding text.

Dashes are never sent to the narrator (`speakableText` in `app/src/narration/narrationCore.ts`, 2026-10-07): a numeric range reads "to" (`1914–1918` → "1914 to 1918"), and every other dash run — em/en dash, `--`, an elided year (`17—.`), a blank name (`Mr. ——`, `D——`, `R-----`) — becomes a pause (dropped before punctuation, a comma between words), never the word "dash" or "blank". Hyphenated words are untouched. The paragraph text hash is unchanged by these rules; only the spoken text of a chunk, and so its blob identity, changes. Recordings made before the rules stay in use: each chunk the rules change also carries its pre-rules spoken text (`legacyText`), and `narrationChunkTextCandidates` offers that recording's identity after today's. The Worker accepts either when matching the map, validates blob metadata against the matching text, and probes R2 for both before synthesizing, so guests (cache-only) keep the audio and signed-in readers never pay to record it again. Both candidates come from the same display tokens of a paragraph whose text hash matched, so an edited paragraph matches neither. New recordings always use today's spoken text. The reader replay-cache identity is unchanged, since the Worker serves the same recordings as before.

A SQLite Durable Object per identity owns a 120-second synthesis lease. One object per UTC month atomically reserves bytes against daily/monthly ceilings before every paid attempt. Retries are bounded; rejected reservations fail closed. Reservations conservatively include attempts whose billing outcome is unknown. KV counters remain informational.

## Playback

Opening a book and silent reading do not synthesize. Explicit Play begins preparation; listening maintains a rolling buffer. Pause, departure and tuple changes cancel new client work. Completed recordings remain cached. Anonymous readers can play validated cached audio; uncached generation retains the existing signed-in authorization.

Chapter progress uses the whole text, with estimated durations until recordings provide exact timing. A paused word seek remembers its target until Play. Native Media Session and chapter handoff remain in place.

## Release gates

1. Stage with the public provider still Google. Only signed release requests may override to Grok.
2. Resolve opening editions from the release catalogue, preserving discovery holds and defaults.
3. Prepare five minutes of Ara and Helios for these ten books in order: Frankenstein, Odyssey, Jekyll and Hyde, Pride and Prejudice, Meditations, Crime and Punishment, Jane Eyre, The Prince, Julius Caesar, Candide. Twenty openings total, approximately 100 minutes plus sentence-group boundary overshoot.
4. Verify cached starts spend zero, then muted Chromium/WebKit playback, word highlighting, chunk handoff, pause, and bounded cold/default/optional voice probes. Report actual reader cold starts against the five-second target.
5. After acceptance, switch the public provider through the normal reviewed deployment and verify the actual public reader.
6. Retain legacy objects briefly for rollback. Inventory and preserve exact obsolete English objects and references before deletion. Never delete unrelated languages or unverified bucket prefixes.

The cloud workflow uses an expiring HMAC derived from the existing xAI server/Actions secret. The secret never enters a browser or report. The signature binds method, path/query, timestamp and body. Artifacts record source hashes, cache identities, durations, measurements and screenshots.

## Acceptance limits

Headless WebKit does not establish physical iPhone locked-screen reliability; report device testing separately. Provider latency is not reader startup latency. Staged code or prepared cache is not production cutover.

Text publication is independent of audio generation. This release adds no editions and publishes no unreviewed modern-text follow-ups.
