# Fish Audio narration pilot — 2026-09-18

Branch `claude/eloquent-wozniak-4il2zo`. Scope: on-demand narration for
**The Odyssey, Book 1, `original-en` and `modern-en`**, behind an explicit
opt-in in the V2 reader (`/reader`). Kokoro recordings, the production
reader (`App.tsx`), Danish, voice chat, offline downloads and the sleep timer
are untouched.

Everything under **Measured** below was produced in this environment.
Everything under **Not yet measured** needs a Fish API key on the Worker;
none of it is estimated here.

## 1. What Fish Audio actually offers (verified 2026-09-18)

Source: `https://docs.fish.audio/api-reference/openapi.json` (30 paths) and
the rendered pages under `docs.fish.audio`. The OpenAPI document is the
authority; two of its endpoints are **absent from the rendered reference
pages**, which is why the first read of the docs suggested no timestamps.

| Item | Finding |
| --- | --- |
| TTS models (`model` header enum) | `s1`, `s2-pro`, `s2.1-pro` (default), `s2.1-pro-free`, `drama-3-preview` |
| Recommended production model | `s2.1-pro` ("recommended production TTS model"); `s2.1-pro-free` is the same model at $0 with no TTFA/DPA guarantee |
| Plain synthesis | `POST /v1/tts` — chunked audio only, **no timings** |
| WebSocket streaming | `wss://api.fish.audio/v1/tts/live` — audio + finish events, **no timings** |
| **Timed synthesis (used by the pilot)** | `POST /v1/tts/stream/with-timestamp` — Server-Sent Events; each event carries `audio_base64`, `chunk_seq`, `chunk_audio_offset_sec` and a cumulative `alignment { audio_duration, segments[{text,start,end}] }` snapshot per chunk. Segment times are chunk-relative; absolute = `chunk_audio_offset_sec + start`. |
| Timed live streaming | `wss://api.fish.audio/v1/tts/live/with-timestamp` (MessagePack frames, same alignment shape). Not used: the pilot synthesises whole paragraphs. |
| Timing granularity | The spec calls the alignment "word-level"; the example splits on words and **strips apostrophes** (`can't` → `can't`, `it's` → `its`, `I've` → `Ive`) and punctuation. Whether every token of a Homeric paragraph comes back is a measurement, not a promise. |
| ASR (`POST /v1/asr`) | Segment-level timestamps only (`ignore_timestamps=false`); no `words` array. Not a substitute for word timing. |
| Pricing | TTS `$15.00 / M UTF-8 bytes` for `s1`, `s2-pro`, `s2.1-pro`; `$0` for `s2.1-pro-free`. "1M UTF-8 bytes ≈ 180,000 English words ≈ 12 hours of speech". ASR $0.36 / audio hour. Voice Design $0.01 / request. |
| Concurrency | Starter (< $100 prepaid) 5 concurrent requests; ≥ $100 → 15; ≥ $1,000 → 50. |
| Request limits that shape output | `chunk_length` 100–300 (default 300), `latency` `normal|balanced|low`, `normalize` (numbers), `temperature`/`top_p` (default 0.7), `prosody.speed` 0.5–2.0, `mp3_bitrate` 64/128/192, `condition_on_previous_chunks`, `pronunciation_dictionary` (up to 3). |
| Commercial rights | Terms of Use: "if you are a user of Paid Services, you are licensed to use the Services for commercial uses". Plan page FAQ: "Premium subscribers can use verified voices (that you own) for commercial purposes. Free plan users can only use generated content for personal, non-commercial projects." Section (q) asks users to "proactively disclose that such Content was created using artificial intelligence technologies". Nothing in the Terms addresses caching or re-serving generated audio to other users. |
| Public voice library | `GET /model` is public; entries carry `licensed` (0 of 1,000 top English voices are `licensed: true`), `dmca_taken_down`, `takedown_category`, and `pvc_release_state`/`pvc_retire_*` (a voice owner can retire a voice with notice). |

### Rights assessment

Public-library voices are user-uploaded clones. The API exposes takedown and
retirement fields on them, and the Terms tie commercial rights to *verified
voices you own*. That makes a public voice fine for an **audition** but a
risk for a **product** narrator: a takedown or retirement would strand every
cached recording, and the cache identity would have to move to a new voice.
The rights-safe options are Fish **Voice Design** (`POST /v1/voice-design`,
$0.01 per request, a voice Tinct owns from a text description) or a voice
Fish licenses explicitly. Nobody's voice is cloned by this pilot.

## 2. Candidate voices for audition

Chosen from the public library by tags (narration, calm, warm, measured) and
by excluding anything that names a real person or a franchise. Samples are
the voices' own public sample MP3s (no spend); each can be replaced by
editing one Worker var, because the voice id is part of the cache identity.

| Key | Fish id | Library title | Tags | Sample |
| --- | --- | --- | --- | --- |
| `a` (male) | `bbb58d698b5f46719fd04688dfac7359` | "Nathan: English Man (US) - Audiobook" | male, middle-aged, narration, deep, warm, calm, professional, storytelling | `https://fish.audio/m/bbb58d698b5f46719fd04688dfac7359` |
| `b` (female) | `f6a19fe5ab494e1fa51bb1476d583a44` | "Abby: English Woman (US) - Audiobook" | female, middle-aged, narration, smooth, professional, warm, clear | `https://fish.audio/m/f6a19fe5ab494e1fa51bb1476d583a44` |

Alternates if either fails audition: male `e686ae649ee44f219a108aacba206c1a`
("calm storyteller male") or `30c0f62e3e6d45d88387d1b8f84e1685` ("Liam -
Calm British Voice"); female `8906b5268cae414fb9b8d3da6e84413d` ("Measured
Storyteller") or `ed9f7b2903d740a0bce1dea14ee102b3` ("Emilia").

**Listening acceptance is not claimed.** No human has auditioned these
voices on Tinct text yet; the samples above are the library's own.

## 3. Architecture

```
reader (/reader, opted in)                     Worker                              R2 tinct-audio
────────────────────────────                   ──────────────────────────────      ─────────────────────────────
useLabListen (narration mode)                  POST /api/narration/ensure          narration/fish/blob/{hash}.mp3
  clip i has no url → ensure([i])  ──────────▶   verify user, scope, rate limit    narration/fish/blob/{hash}.json
  "Preparing narration…"                        derive text from edition asset     narration/fish/map/{book}/{ed}/
  ready → play; look-ahead ensure([i+1,i+2])    + edition_patches; hash it            ch{N}/{voice}/p{i}.json
  words painted only from that recording        map entry? meta? audio? → cache hit
                                                else lock (KV) → Fish
GET /api/audio-file?path=narration/…  ◀──────   /v1/tts/stream/with-timestamp
  (existing route, byte ranges, 7-day cache)    validate → put audio, meta, map
```

**Cache identity.** `sha256(canonical JSON {v, provider, model, voiceId, text,
settings})` where `text` is the exact narration text of the displayed
paragraph (`narrationTextForParagraph`: emphasis underscores dropped,
whitespace collapsed, nothing else) and `settings` is every request field
that changes audio (format, bitrate, latency, normalize, temperature, top_p,
speed, chunk_length). A change to any of them is a new recording. The
explicit edition→recording mapping is the `map/…/p{i}.json` object, which
also stores the text hash it was recorded from.

**A text change never plays stale narration**, three ways: the reader hashes
the words it displays and sends that hash; the Worker recomputes the hash
from the edition file plus `edition_patches` and refuses on mismatch
(`text_mismatch`); and the map entry's stored hash must equal both before a
cached blob is returned. Old blobs stay in R2 unreferenced (cheap; a sweep
can remove them later).

**Publish barrier.** Audio and meta are written first, the map entry last,
and only after `validateNarrationAsset` passes: MP3 signature, size, a
plausible characters-per-second range, provider duration cross-checked
against the frame-walked duration, and monotonic token timings inside the
audio. A recording whose timings map to fewer than 85 % of tokens is
published **without words** (`timingsUsable: false`) so the reader falls back
to paragraph-level follow — never to invented word times.

**Dedupe and storms.** A KV lock per identity (120 s TTL) makes a second
requester wait for the first recording (polling R2, ≤ 20 s) and otherwise
answer `pending`; the reader polls `pending` at most three times. Provider
retries are two backoffs for 429/5xx/network only; 401/402 are never
retried; three consecutive provider failures open a 60 s breaker. Per-user
ensure calls are limited to 40/min; a request prepares at most 3 paragraphs
and the Worker generates them sequentially.

**Spending ceiling.** `NARRATION_DAILY_BYTES` (default 200,000 ≈ $3) and
`NARRATION_MONTHLY_BYTES` (default 1,000,000 ≈ $15) in UTF-8 text bytes,
enforced before every generation from KV counters. `GET /api/narration/usage`
(site admins) reports bytes, requests, generated, cache hits, failures and
provider time per day and month. KV counters are eventually consistent, so
the ceiling is a soft guard at the margin, not an accounting system.

**Word timings.** Fish segments are mapped to the reader's whitespace tokens
by `alignSegmentsToTokens`: exact key matches (letters and digits, NFKC,
case-folded; apostrophes and punctuation ignored), a token glued from
several segments, a segment spelling several tokens (span shared by
length), punctuation-only tokens pinned to the next word, and a bounded
resync that interpolates skipped tokens only between reported spans. The
match ratio is stored beside the words and drives the existing
sentence-level fallback in `labFollow.ts`.

**Reader behaviour.** In narration mode `useLabListen` builds one clip per
paragraph, prepares the clip it is about to play, then prefetches the next
two once playback starts (a play request landing on a paragraph the
look-ahead is preparing waits on the same promise). Kokoro manifest words are
never painted over Fish audio. A tuple change (book, chapter, edition) or a
voice change aborts in-flight preparation and drops prepared clips; the
reader's place is unaffected because it lives in the position store, not the
hook. Media errors stop playback with a visible retry instead of skipping or
switching narrators. Playback speed still sets `audio.playbackRate`; word
follow reads `currentTime`, so highlighting stays synchronised at any speed.

## 4. Configuration

| Where | Key | Value |
| --- | --- | --- |
| Worker secret (`npx wrangler secret put`) | `FISH_AUDIO_API_KEY` | **not set** — needed for any real generation |
| `wrangler.jsonc` vars | `NARRATION_PILOT` | `"1"` (set `"0"` to switch the routes off without a code change) |
|  | `NARRATION_MODEL` | `s2.1-pro` |
|  | `NARRATION_VOICE_A_ID` / `_LABEL` | `bbb58d698b5f46719fd04688dfac7359` / "Nathan (male, warm)" |
|  | `NARRATION_VOICE_B_ID` / `_LABEL` | `f6a19fe5ab494e1fa51bb1476d583a44` / "Abby (female, clear)" |
|  | `NARRATION_DAILY_BYTES` / `NARRATION_MONTHLY_BYTES` | `200000` / `1000000` |
| Reader opt-in | `https://tinct.app/reader?narration=fish` | remembered in `tinct-lab-prefs`; `?narration=off` clears it; Settings → Audiobook shows a "Narration pilot" row with Off / voices once opted in |

Without the secret, `/api/narration/voices` answers `enabled: false, reason:
"missing_api_key"`, the settings row reads "Not set up on this server", and
the reader keeps playing Kokoro exactly as before. Nothing about the pilot is
reachable by a reader who never used the flag.

## 5. Measured

| Check | Result |
| --- | --- |
| Unit tests: core (`narrationCore.test.ts`) | 22 pass — identity hashing, alignment classes (exact, glued, split, punctuation, resync, interpolation bounds), SSE parsing, MP3 frame walking, validation gates |
| Unit tests: Worker route (`worker.narration.test.ts`) | 16 pass — config gating, auth/scope/rate limit, generate → publish → cache hit, text change → stale map + new recording, text-hash mismatch refusal, distinct identity per voice/model, lock wait and `pending`, budget refusal without a provider call, bounded retries and breaker, no retry on 402, validation refusal publishes nothing, timestamp fallback, sub-threshold timings unusable, admin-only usage |
| Unit tests: reader (`useLabListen.narration.test.tsx`, `labNarration.test.ts`) | 19 pass — prepare-before-play, bounded look-ahead sharing in-flight work, word seek into an unprepared paragraph, failure + retry, transport errors, pending polling, abort on voice change, reset on edition change, stale-hash rejection, audio without words, media error stops with retry, prepared clips reused after stop, Kokoro path untouched when off |
| Existing suites | full `npm test`: 2450 passed, 1 skipped (the live probe), 0 failed after the pilot change; `npm run build` and `npm run verify-bundle` pass (bundle `index-CnbRV3DE.js` at that point; no secret-shaped strings) |
| Silent browser acceptance (`app/scripts/check-narration-pilot.mjs`, Chromium 390×844, muted, every `/api/narration/*` call answered by an in-page mock, audio a silent WAV) | Passes: `?narration=fish` persisted in prefs; Play shows "Preparing narration…" then plays from the narration URL with word paint from the recording's timings; first ensure carries only paragraph 0 and the SHA-256 of the displayed text; look-ahead asks for `[1, 2]` once; zero Kokoro audio requests; pause keeps the place; Settings → Audiobook shows "Narration pilot" with Off / Nathan / Abby; choosing Abby persists and the next ensure carries voice `b`; a failed preparation shows the notice with Retry and no playback; Retry plays. Screenshots in `/tmp/tinct-narration-pilot/` during the run (01-preparing … 06-retry-playing). |
| Fish endpoint reachability from this environment | `GET https://api.fish.audio/model` 200 (public); `POST /v1/tts` without a key → 401 `"this route requires an api-key"` |

### Independent review

A separate reviewer session read the full diff against the brief and ran the
narration suites. Findings and what was done:

| # | Severity | Finding | Outcome |
| --- | --- | --- | --- |
| 1 | High | A prepared entry whose text hash went stale without a tuple change could re-enter preparation forever (tab freeze). | Fixed: every prepared lookup is hash-checked against the clip; stale entries are purged when clips rebuild; "ready but no URL" is an error state, never a retry. Regression test added. |
| 2 | Medium | Provider deadline covered headers only; a stalled SSE body hung the Worker and the reader. | Fixed: the deadline now covers the body on the Worker; the reader abandons an ensure call after 70 s. |
| 3 | Medium | A cleanly truncated provider stream could validate and publish. | Fixed: when the provider timed the paragraph, the last timed token must lie in the final tenth or the recording is refused (`audio_truncated`). Test added. |
| 4 | Medium | Spending ceiling is check-then-act on eventually consistent KV counters. | Accepted for the pilot scope (≈128 possible recordings); documented as a soft guard; to be replaced by a reservation or Durable Object counter before widening. |
| 5 | Medium | Advisory KV lock could be released by a non-owner. | Fixed: token-tagged lock released only by its owner; the read-then-put race remains and only costs a duplicate generation of identical audio. Test added. |
| 6 | Medium | Old clip's clock leaked into follow paint at an unprepared boundary. | Fixed: clock and follow reset when preparation starts; the frame tick pauses while the current clip has no URL. |
| 7 | Medium | Seeking while paused into an unprepared paragraph auto-played. | Fixed; test added. |
| 8 | Medium | Public chapter listing was unthrottled. | Fixed: per-address rate limit. |
| 9 | Medium | Breaker counted storage errors and 429s as provider outages. | Fixed: only network failures and 5xx count. Test added. |
| 10 | Low | Cache metadata JSON (text, voice id, segments) was publicly readable via the audio route. | Fixed: the audio route serves only `.mp3` under `narration/`. Test added. |
| 11 | Low | `text_mismatch` copy promised a refresh that never happens. | Reworded to ask for a reload. |
| 12 | Low | Chapter auto-advance out of the pilot scope continues with Kokoro without notice. | Known limitation; documented below. |
| 13 | Low | Play pressed before `/api/narration/voices` resolves starts Kokoro and is cut off when the pilot activates. | Known limitation (sub-second window on load). |
| 14 | Low | Choosing Off hid the Settings row. | Fixed: the row stays for the page load once the pilot was on. |
| 15–17 | Low | Short-paragraph pace floor, dead monotonic check, hard-coded scope in the public config. | Scope constant now shared; the rest noted for the expansion proposal. |

### Live probe — free tier, 2026-09-18 13:43 UTC (measured, no spend)

Anders added `FISH_AUDIO_API_KEY` to the cloud environment. The paid model
answered **402 "Insufficient API credit. API credit is managed independently
from platform credit"**, so the probe ran on `s2.1-pro-free` (the same
model, $0, no latency guarantee). Report:
`artifacts/fish-narration-pilot-2026-09-18/live-probe-free-tier-2026-09-18.json`;
samples were handed to Anders and Alex directly and are not committed.
Free-tier output is licensed for personal use only, so nothing from this
probe is cached in production.

| Voice | Paragraph | Text | Audio | First audio byte | Complete | Generation ÷ audio | Tokens timed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Nathan `bbb58d69…` | p0 (opening) | 605 chars | 38.8 s | 21.9 s | 21.9 s | 0.56 | 113 / 113 |
| Nathan | p18 (quoted speech, names) | 1,875 chars, 1,887 bytes | 115.8 s | 52.2 s | 52.2 s | 0.45 | 362 / 362 |
| Abby `f6a19fe5…` | p0 | 605 chars | 38.3 s | 15.6 s | 15.6 s | 0.41 | 113 / 113 |
| Abby | p18 | 1,875 chars | 109.8 s | 39.5 s | 39.5 s | 0.36 | 362 / 362 |

What this says:

- **Word sync: passes.** Every display token of both paragraphs, including
  *Telemachus*, *Achaean*, *Minerva*, the em-dashes and the quotation marks,
  received a provider timing (`matchRatio` 1.0), validation passed with no
  reasons, and the frame-walked MP3 duration matched the provider's within
  0.1 s. The alignment mapping works on real Homeric prose without any of
  the interpolation paths firing.
- **Time to first audio: fails the experience bar as designed.** The
  timestamped stream delivered its events only at completion (first byte ≈
  complete), so an uncached paragraph waits for its whole generation:
  15–22 s for the opening paragraph, 39–52 s for paragraph 18. Generation
  runs at roughly 0.4–0.56 × audio length, so the two-paragraph look-ahead
  keeps continuous playback gap-free once started, but the first press, and
  any seek into unprepared text, waits too long. The paid tier promises
  lower latency but the store-then-serve design still waits for the whole
  recording. The fix is smaller synthesis units (see §10).
- **Cost, at list price:** p0 $0.009, p18 $0.028; Book 1 (32 paragraphs,
  ≈21,250 chars) ≈ $0.32 per voice; both voices ≈ $0.65 for the whole
  pilot chapter.
- **Pace:** ~175 words per minute for both voices; audio is 128 kbps MP3
  (≈16 KB per second, ≈1.9 MB for paragraph 18).

## 6. Not yet measured

- The paid `s2.1-pro` tier: its latency and whether it streams
  progressively. Needs API credit on the Fish account
  (`https://fish.audio/app/developers`), then
  `NARRATION_LIVE_PROBE=1 FISH_AUDIO_API_KEY=… npx vitest run src/narration/narration.live.test.ts`.
- End-to-end through the deployed Worker (cache hit timing, two listeners on
  one uncached passage) — needs the routes live and credit.
- Listening quality: no human has auditioned the samples yet.

## 7. Rollback

1. Reader: `?narration=off` on any device, or Settings → Narration pilot → Off.
2. Server, no deploy: `NARRATION_PILOT` var to `"0"` (routes answer 503 /
   `enabled: false`; the reader falls back to Kokoro at the next load), or
   delete the `FISH_AUDIO_API_KEY` secret.
3. Code: revert the pilot commits; nothing in Kokoro paths, edition files,
   the production reader or the position store changed.
4. Cache: R2 objects under `narration/fish/` are unreferenced once the
   routes are off and can be deleted at leisure.

## 8. Out of scope, with implications

- **Danish**: Fish lists 83 languages for `s2.1-pro`; nothing here is
  English-specific except the two voices and the pilot scope constant.
- **Interactive voice chat**: separate OpenAI path; unaffected.
- **Offline downloads**: the download manager knows Kokoro paths only;
  narrated chapters would need the blob URLs added to the offline manifest.
- **Sleep timer**: none exists in the V2 reader today; a fade would sit in
  `useLabListen` where speed already lives.

## 9. Known limitations of the pilot build

- Auto-advance from Book 1 into Book 2 leaves the pilot scope, so Kokoro
  narration continues there without a notice.
- Pressing Play in the first fraction of a second after load, before the
  pilot configuration has been fetched, starts Kokoro and is then reset.
- The spending ceiling and the generation lock are best-effort on KV; the
  content-addressed cache keeps duplicates harmless but not free.
- Paragraphs are synthesised whole; time to first audio for the 1,875-
  character paragraph 18 is unmeasured and may warrant sentence chunking.

## 10. Proposal after the probe: synthesise by sentence group, not paragraph

The measured first-play wait comes from generation time being proportional
to the unit synthesised. Splitting each paragraph into sentence groups of
about 250–350 characters (Fish's own `chunk_length` ceiling) would cut the
first wait to roughly a fifth of a paragraph's — on the free tier ≈ 4–8 s,
on the paid tier plausibly a second or two — while the look-ahead prepares
the rest of the paragraph and the next one. Mapping back is bounded work:
each chunk becomes a clip carrying its paragraph index and first-word
offset; paragraph word timings are the chunks' timings shifted by the
chunks' durations; the map entry lists the chunks; text hashing stays per
paragraph so invalidation is unchanged. Cost is identical (same bytes).
Estimated size: Worker chunker + per-chunk publish (~150 lines), reader
clip mapping (~80 lines), tests. This is the specific change to decide on
before wider rollout; without it the pilot works but feels slow at every
cold start.

## 11. 2026-09-19: sentence groups, featured-shelf scope, prefetch, warm-up

Anders added Fish API credit, approved sentence grouping, and asked for a
smooth start on every featured book with generation running ahead of the
reader. Implemented on the same branch:

**Sentence groups.** `chunkNarrationTokens` cuts a paragraph's narration
tokens into groups of at most 300 characters: whole sentences packed
greedily (abbreviations such as *Mr.* and initials such as *J. Alfred* do not
end a sentence), a sentence over the ceiling falls back to clause boundaries
and then to whole tokens, and a tiny final group rejoins the previous one.
Every token lands in exactly one chunk in order, so chunk `[wordFrom, wordTo)`
ranges tile the paragraph. Odyssey Book 1 paragraph 18 becomes seven groups.
The chunker version is pinned in every map entry; a chunker change is a new
cache.

**Cache v2.** One blob per chunk (`narration/fish/blob/{hash}.mp3` +
`.json`), identity hashed from the chunk text plus model, voice and settings.
The paragraph map entry is rewritten after each chunk lands and lists the
ready chunks in order; a reader trusts only the prefix whose metas and audio
agree with the live paragraph text, the chunk layout and each other.

**Requests.** `mode: 'next'` generates exactly one missing chunk of the first
incomplete requested paragraph and reports every requested paragraph's chunk
state; the reader loops it. `mode: 'all'` completes everything missing within
the Worker's time budget; the warm script uses it.

**Reader.** Clips are sentence groups; the paragraph placeholder is replaced
by its chunk clips as soon as the layout is known. The clip about to play is
prepared first (rounds until that chunk is ready); once playing, a single
serialised look-ahead loop keeps the playing paragraph and the next two
complete, one chunk per round. Follow paint reads the playing chunk's own
timings, offset into the paragraph; word seek picks the chunk that owns the
word and prepares it if needed. `stop`, a tuple change and a voice change
abort every request in flight.

**Prefetch.** `useNarrationPrefetch` warms the first three paragraphs of the
chapter on arrival and of the next chapter once the reader is within its
last three paragraphs, one chunk per round, once per (chapter, voice) per
page load, only for opted-in readers inside the scope.

**Scope.** The featured shelf (`LAB_POPULAR_BOOK_IDS`, 16 books), every
English edition, every chapter. `narrationChunks.test.ts` pins the list to
the catalogue.

**Warm-up.** `POST /api/narration/warm` is the ensure path without a reader
(gated by the `NARRATION_ADMIN_TOKEN` Worker secret, same locks, validation
and ceilings); `app/scripts/narration-warm.mjs` drives it per (book, edition,
voice) with a `--first N` pass for instant openings and a full pass after.
Chapter 1 of the shelf is ≈700k characters per voice, ≈$10.5 per voice at
list price.

**Ceilings.** Daily 2,000,000 text bytes (≈$30), monthly 10,000,000 (≈$150),
so the warm-up fits in one day with headroom for readers.

### Live probe — paid model, one sentence group, 2026-09-19 (measured)

`s2.1-pro` with API credit, narrating only the first sentence group of
Odyssey Book 1 paragraphs 0 (111 chars) and 18 (199 chars), both voices.
Report: `artifacts/fish-narration-pilot-2026-09-18/live-probe-paid-chunks-2026-09-19.json`.

| Voice | Group | Audio | First audio byte | Tokens timed |
| --- | --- | --- | --- | --- |
| Nathan | p0 first sentence | 7.8 s | 6.6 s (first call of the session) | 100 % |
| Nathan | p18 first group | 13.0 s | 2.5 s | 100 % |
| Abby | p0 first sentence | 7.2 s | 1.3 s | 100 % |
| Abby | p18 first group | 12.1 s | 2.6 s | 100 % |

The paid model still delivers the timestamped stream only at completion,
but a sentence group completes in one to three seconds, so an uncached
paragraph now starts within a few seconds and the look-ahead has 7–13 s of
audio per group to stay ahead. Cost for the four groups: $0.009.

### Independent review of the sentence-group work (2026-09-19)

| # | Severity | Finding | Outcome |
| --- | --- | --- | --- |
| 1 | High | Tapping a word ahead while listening left the previous chunk playing under "Preparing narration…", painting the target's words from the wrong clock and skipping the target on `ended`. | Fixed: one deferred entry (`enterPreparing`) pauses and clears the element, resets the clock and follow, and `ended` from an empty element is ignored; failure also pauses. Test added. |
| 2 | Medium | Bible verse numbers (standalone superscripts) were sent to the narrator and broke word paint for every Bible paragraph. | Fixed: markers are silent end to end — never sent or hashed, kept in token ranges, given no timing; the reader re-inserts them by position. Tests added (core, Worker, reader alignment). |
| 3 | Medium | Cache reads did not enforce settings, so a settings change could serve old audio until the cache version was bumped. | Fixed: every listed chunk must equal the identity hash recomputed from today's text, model, voice and settings. Test added. |
| 4 | Medium (ops) | Warm script hit the public chapter-listing throttle on a re-run. | Fixed: admin callers are exempt from the throttle and the script backs off on 429/5xx. Test added. |
| 5 | Low-medium | Two callers awaiting one in-flight round could both start a round. | Fixed: `while` loop with the satisfied check; a stale answer never shortens a playable prefix. |
| 6 | Low-medium | Pause during preparation then Play replayed the previous chunk. | Fixed: the element's source is cleared while preparing and `resume` re-enters `playClip` whenever the current narration clip is not what the element holds. Test added. |
| 7 | Low | Per-chunk worst case exceeded the request budget and the lock TTL. | Fixed: provider timeout 25 s per attempt and no attempt starts past the request deadline. |
| 8 | Low | Map rewrite could shorten a prefix another generator had extended. | Fixed: the map is re-read before writing and only ever extended. |
| 9 | Low | Prefetch marked a chapter done before finishing and lost the current warm when the reader neared the end; anonymous readers burned 401s. | Fixed: two effects, done only on completion, no rounds without a session token. Test added. |
| 10 | Low | A 429 in the reader's own round surfaced as a failure. | Fixed: treated as a short wait; the per-user limit is 60/min. Test added. |
| 11 | Low | Warm token compared with `!==`, after the configuration check. | Fixed: constant-time compare, checked first. |
| 12 | Low | The hearing stage looked paragraphs up by clip index. | Fixed: by the clip's own paragraph index. |

## 12. Release 2026-09-19: merged, deployed, verified on production, warmed

**Merge and deploy.** PR #110 was squash-merged as `ba06996a9` on `main`
after CI passed on the merge head `97fc4298f` (`app`, `reading-benchmark`,
`Workers Builds: tinct`). The `deploy` workflow run
[35432617391](https://github.com/anderskhv/tinct/actions/runs/35432617391)
succeeded end to end: tests, `npm run deploy`, the served-bundle comparison,
the production smoke test and the production browser checks. Served bundle
`/assets/index-CnnXbk7G.js`. Secrets `FISH_AUDIO_API_KEY` and
`NARRATION_ADMIN_TOKEN` were already on the Worker.

**Production API verification** (evidence:
`artifacts/fish-narration-pilot-2026-09-18/prod-verification-2026-09-19.json`):

| Check | Result |
| --- | --- |
| `GET /api/narration/voices` | enabled, `s2.1-pro`, voices `a` Nathan / `b` Abby, cache v2, chunker 1, scope = 16 featured ids + `^[a-z0-9-]+-en$` |
| `GET /api/narration/chapter` (Odyssey, original-en, ch 1, voice a) | 32 paragraphs listed, 0 ready before warm |
| `POST /api/narration/warm` paragraph 0, `mode: all` | ready after 19.6 s wall: 4 chunks, 38.2 s of audio, 113/113 words timed, `timingsUsable: true`, `source: generated` |
| First chunk blob via `/api/audio-file` | 127,894 bytes, MPEG frame header, `Content-Type: audio/mpeg`, `Range: bytes=0-1` → 206 with `Accept-Ranges: bytes` |
| Chapter listing after warm | paragraph 0 `ready 4/4`, 113 words |
| Served bundle | contains the settings row, the pending sentinel and the ensure route; no `FISH_AUDIO_API_KEY` / `NARRATION_ADMIN` strings |
| Out-of-scope book (`great-expectations`) via warm | 403 |
| Anonymous `POST /api/narration/ensure` | 401 |
| Kokoro manifest (`odyssey/original-en/ch1`) | 200, unchanged |

**Production browser check** (muted, headless Chromium, fresh anonymous
context, 390×844 mobile viewport, no route mocks; screenshots
`prod-optin-anonymous-notice-2026-09-19.png` and
`prod-optin-settings-row-2026-09-19.png` in the artifacts folder):

| Scenario | Result |
| --- | --- |
| `/reader?narration=fish`, anonymous | opt-in persisted in prefs; voices fetched; **no** ensure request before Play; Play shows "Sign in to hear this chapter narrated." with Retry and close; no Kokoro audio requested after the refusal and nothing plays; Settings → Reading settings shows **Narration pilot: Off / Nathan (male, warm) / Abby (female, clear)** |
| `/reader`, anonymous, no flag | zero `/api/narration/*` requests; Play streams the Kokoro recording as before |

Two observations from the run. The anonymous default book on production is
the Bible (KJV, Genesis 1), which is inside the scope, so the very first
opted-in visitor lands on a warmed chapter. The Kokoro chapter manifest is
still fetched on load for an opted-in reader (the reader's availability
probe); it is not used for playback and costs one small request per
chapter. The refusal notice offers Retry but no sign-in action; a "Sign in"
button in that notice is a small follow-up.

**Warm-up.** Trial `--books odyssey,bible --first 2 --voices a,b` completed
all 8 targets (both Bible editions, both voices). Full pass:

```
NARRATION_ADMIN_TOKEN=… node scripts/narration-warm.mjs --chapter 1 --voices a,b --concurrency 4
```

**Two findings from the warm-up, both fixed and deployed the same day.**

1. *Short lines and the pace guard* (PR #115, `588082b6b`). The validator
   refused every bracketed stage direction in Hamlet as
   `audio_too_long_for_text`: at 4 characters per second a seven-character
   "[Exit.]" was allowed 1.75 s of audio, less than any rendering with lead-in
   and lead-out silence. The slow-pace bound now carries a fixed 4 s pause
   allowance (`NARRATION_PAUSE_ALLOWANCE_SECONDS`); a 300-character chunk moves
   from 75 s to 79 s, so the guard against runaway audio stands. Failures now
   report the measured duration and character count.
2. *Square brackets are tags to Fish* (PR #116, `2a1a03e92`). With the
   allowance in place the same lines came back with **zero word segments**:
   "[Exit.]" as 0.76 s of audio, "[Enter Horatio and Marcellus]" as 3.2 s once
   and 12.2 s the next time, while the plain lines beside them aligned 10/10
   and 5/5. The provider treats `[...]` as a paralinguistic tag, not words.
   `spokenText` now drops square brackets from what is sent and hashed;
   display tokens keep them and the aligner maps timings back. The chunk
   identities of bracketed lines changed with their spoken text, so the
   artefact blobs are orphaned and never served. Parentheses are untouched
   until there is evidence.

Hamlet's four targets were re-warmed after the second fix so every stage
direction is a plain reading with word timings.

<!-- WARMUP_TOTALS -->

## 13. Stage 3 proposal (after the audition; decisions for Anders)

The pilot is live, opt-in and inert for everyone who has not opened the
flag. Stage 3 is the step from "works for us" to "on for readers", and every
item below is a product or spend decision rather than an engineering one.

**1. Turn it on for featured books.** For signed-in readers on the featured
shelf, make Fish the narrator by default (Settings → Audiobook keeps Kokoro
as an explicit choice, and every non-featured book keeps Kokoro). Gate: Anders
and Alex accept the two voices on the production samples in §12 and a full
chapter of listening, not just clips. Engineering is a preference default
plus the prefetch already in place; nothing new on the Worker.

**2. Anonymous readers.** Today an anonymous opted-in reader sees "Sign in to
hear this chapter narrated." with Retry and no sign-in button. Options: (a)
add a Sign in action to the notice (small); (b) let anonymous readers hear the
warmed opening of chapter 1 (cache hits only, no generation, so no spend) as
the taste that converts; (c) keep it signed-in only. Recommendation: (a) now,
(b) once the warm-up covers the shelf, since a cached paragraph costs nothing
to serve.

**3. One voice persona across Talk and narration.** Talk runs on Grok
(`altair`); narration on Fish (Nathan / Abby). Readers should pick one voice
for Tinct, not two. Recommendation: a Tinct persona table that maps each
persona to a Fish narration voice and the closest Grok Talk voice, chosen by
listening; the settings row becomes "Voice" and both features read it. The
alternative, putting Fish behind Talk (Fish agents with Grok as the language
model, or Fish streaming TTS after Grok text), trades Grok's native
speech-to-speech latency for a single vendor and is not recommended for now.

**4. Voice rights before a public default.** The two pilot voices are Fish
public-library voices used under Fish's terms for the pilot. Before narration
is on by default, either license a voice with terms that cover commercial
audiobook use or create Tinct's own with Fish Voice Design (no cloning of a
real person without permission). This is the one item that should not wait
for usage data.

**5. Coverage and spend.** The featured shelf's English editions total
27,476,615 characters over 6502 chapters (32 book/edition
targets), ≈$412 per voice at Fish's $15 per million bytes;
the Bible alone is 8,334,233 characters (≈$125 per voice) and
the other 15 books 19,142,382 (≈$287 per voice). Chapter 1
everywhere is 702,117 characters (≈$11 per voice), now warmed.
Recommendation: do not pre-generate whole books. Keep chapter 1 warm for
both voices, let the reader-side prefetch generate the next chapter as
people approach it, and run `narration-warm.mjs` for chapters 2–3 of the
five most-opened books once the first week's usage shows which they are.
The monthly ceiling (10,000,000 bytes ≈ $150) already caps the worst case;
raise it deliberately when the default flips, not before.

**6. Operations.** Add a Cron Trigger on the Worker that reports the daily
usage counters and breaker state to Anders (one line, only when non-zero),
and a small admin page for `/api/narration/usage` so spend is visible without
a token in a terminal. Alert when the breaker opens or a day crosses 50% of
its ceiling.

**7. Not in Stage 3.** Danish narration (Fish's Danish quality is unmeasured
and the modern-da editions are the larger corpus), voice chat over Fish,
offline narration bundles and the sleep timer stay out of scope until the
English default has a month of data.

**Needs a decision from Anders:** items 1, 2 and 4 before any default flips;
item 3 as a design direction; items 5 and 6 are recommendations that can
proceed on approval without further design.
