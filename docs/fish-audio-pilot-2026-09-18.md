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

## 6. Not yet measured (needs `FISH_AUDIO_API_KEY`)

Time to first audible playback, buffering gaps at paragraph boundaries,
actual bytes and cost per chapter, and the share of tokens Fish times on real
Odyssey paragraphs (names such as *Telemachus*, *Ithaca*, *Minerva*; the
1,875-character quoted speech in paragraph 18). `src/narration/narration.live.test.ts`
runs those measurements against the real API when the key is present in the
environment and writes samples and numbers to `output/narration-pilot/`;
it is skipped otherwise.

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
