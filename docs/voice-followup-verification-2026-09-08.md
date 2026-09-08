# Voice follow-up verification — 8 September 2026

The direct voice trial can research outside commentary and comparisons, return to the page without automatically starting audio, and consult real dated reading records. The playback fix keeps cancelled requests from skipping paragraphs or hiding the active word.

Test link: https://tinct.app/lab/reader?chrome=v2&voiceTrial=full

## What changed

- V2 no longer enables fictional “yesterday” history by default. Voice reads account-scoped durable reading sessions as well as legacy reading logs. Bible sub-books such as Jeremiah are matched against chapter titles. Missing records produce an honest empty result; the current chapter is not evidence of yesterday’s reading. Explicit demo history is labelled as demo.
- Full and Mini direct trials have an authenticated, rate-limited `search_reading_sources` tool. The existing OpenAI service performs a bounded web search and returns cited research notes. Realtime remains the speaking companion. Only the public search question is sent, not personal reading history. Compact numbered source links are stored alongside the answer, with source titles available on hover.
- Both return paths are supported: `resume_audiobook` respects whether the user actually requested audio, and `open_tinct_view(read)` closes the call and restores the interrupted mode. An explicit audio request from silent reading uses the same page/source setup as pressing Play.
- V2 waits for WebRTC playout rather than declaring a failure because audio generation completed before playback started. An overlapping response cannot relabel existing speech as listening. Obsolete notices clear on successful speech and return.
- V2 playback requests are versioned. A stale play promise cannot skip a clip, clear the current highlighting, or overwrite a newer playback state. Pause, stop, source changes, and replacement play requests invalidate old work. Abort/autoplay rejections do not mean the file is corrupt.

## Checks

- Full Vitest suite: **140 files, 1,532 tests passed**, including the unchanged V1 DOM snapshot.
- `CI=1 npm run build` and `npm run verify-bundle`: passed.
- Published from a clean committed worktree through `CI=1 npm run deploy`, using Node 24. Build-generated sitemap changes restored afterwards.
- Final Worker version: `8db3a765-dbfc-4b3a-b1e5-f21afe7ccca3`.
- Final bundle: `assets/index-BX3JoAUZ.js`.
- Production `/lab/phone?chrome=v2` references that bundle; fetched bytes exactly match the local deployed asset.
- SHA-256: `ec56563c24312ca5d0bbfb687d96dbcadc5952363a5419f3c63395bc15d2e5a9`.

## Real voice checks

Fresh Chromium profiles at 390×844 used synthetic microphone speech and real OpenAI WebRTC sessions. Authenticated research was real. Personal reading/chat writes and the legacy chat/recap APIs were blocked in the test browser. Temporary test sign-in sessions were signed out independently of existing sessions. No Anthropic API was called.

| Scenario | Observed result |
| --- | --- |
| “Can you take me back to the book?” from silent reading | Call closed; reader mode `reading`; audio remained off; no leftover notice. |
| “Please resume the audiobook now” from silent reading | Audio remained on the first paragraph; native media and UI both reported playing; active word visible; no leftover notice. |
| Tim Keller on Genesis 1 | Called source research and delivered a substantive, attributed answer. |
| Genesis 1 versus Quran creation accounts | Called source research and completed a comparison with source links. |
| Jeremiah yesterday, with no matching dated records | Called `get_reading_history(period=yesterday, book_query=Jeremiah)` and explicitly reported no matching activity. No fabricated Genesis session. |
| Speaking/listening display | Event traces kept the speaking label through buffered audio, including two responses sharing one continuous output buffer. |

The first instrumented playback run reproduced the reported failure: rapid transitions from p0 through p6, followed by native audio playing while React reported paused. The regression and subsequent live run verify its correction. An early research harness timeout was a test assumption: two Realtime responses can share one output buffer, so its start and stop events need not name the same response. The application completed that answer; the harness now waits for buffer drain and the actual call status.

## Artifacts and repeatability

Artifacts: `/Users/andershvelplund/.codex/visualizations/2026/09/08/01a07ff0-a87f-7031-8b2f-d050d06d52bd/voice-followup/`

- `bundle.json`: final production byte comparison.
- `back/`: silent return, screenshot and event report.
- `start-instrumented/`: captured failing media sequence.
- `start-fixed/` and `final-start/`: sustained correct playback and visible word highlighting.
- `research-fixed/`: complete Keller, Quran, and missing-history scenarios, including clickable citations.
- `final-sources/`: final compact source-link presentation.

`app/scripts/voice-trial-fixtures.cjs` generates the public-topic spoken fixtures. `app/scripts/browser-voice-followup.cjs` runs the isolated real-voice scenarios. An authenticated research run accepts a temporary test session through `TINCT_VOICE_TEST_SESSION`; credentials must never be committed or included in artifacts.

## Remaining limits

The model sometimes still speaks a lookup preface despite instructions, and source research takes longer than ordinary replies. Historical records that are absent cannot be reconstructed from the current page. The durable reading-memory store still has its existing 50-session cap; this change does not manufacture or expand historical records. Full was exercised with live speech here; Mini shares the corrected controls/retrieval path but its answer quality was not re-evaluated in this pass. Physical microphones, speaker echo, and iOS Safari were not tested in this desktop run.
