# Direct voice trial — 8 September 2026

The optional lab reader trial uses one Realtime model for listening, reasoning and speaking. `get_book_passage` retrieves the selected edition's exact text; existing application tools handle navigation and playback. No separate companion answers these trial questions. The normal production voice default remains unchanged.

- Full: https://tinct.app/lab/reader?chrome=v2&voiceTrial=full
- Mini: https://tinct.app/lab/reader?chrome=v2&voiceTrial=mini
- Models: `gpt-realtime-2.1` and `gpt-realtime-2.1-mini`. Default model reasoning settings; no tuned effort comparison.

## Evidence and recommendation

Use full as the candidate for further reader testing. This is a small diagnostic sample, not a statistically reliable benchmark or a launch approval.

Real Chromium/WebRTC sessions on tinct.app used a synthetic microphone with recorded questions and actual OpenAI responses. The remote audio was recorded. Neither chat/companion endpoint was called. No Anthropic API was used.

| Check | Full | Mini |
| --- | --- | --- |
| Explain the firmament | Complete; distinguished text from interpretation | Complete; asserted a symbolic reading too confidently |
| Literary follow-up | Complete and relevant | Complete and relevant |
| Retrieve and quote Genesis 1:26 | Exact KJV quotation, in both runs | Passed verse-derived paragraph offset 24; retrieval failed and model acknowledged failure |
| First sound after speech, first two questions | 2.22/2.88 seconds; repeat 2.27/2.13 | 2.08/2.27 seconds |
| Retrieval first sound | 2.07 seconds; repeat 5.13 | 2.36 seconds |
| Confirmed interruption | One cancellation; new one-sentence answer | One cancellation; new one-sentence answer |
| Five seconds of silence | No unsolicited response | No unsolicited response |
| Hangup and Back to book | Audiobook resumed | Audiobook resumed |
| Spoken resume, final build | Complete acknowledgement, then audiobook resumed and call closed | Not repeated on Mini |

Retrieval timings above include a spoken preamble; they are not time to the substantive quotation. Both models still sometimes narrate retrieval despite instructions. This needs further tuning. Full's reading quality and tool use were better in this sample; the speed difference on ordinary questions was small. A bigger model alone does not establish factual accuracy.

The detailed-answer prompt was intentionally interrupted. Long-form answer quality, accented/natural speech, speaker echo, mobile Safari, and signed-in reconnection still need broader testing. The synthetic microphone does not test a physical microphone or speaker loop.

A real data-channel closure displayed Disconnected and Reconnect. Guest reconnection correctly encountered the existing one-free-session account gate. This verifies the guest failure path, not authenticated reconnection.

An initial harness stopped producing a continuous audio stream, causing invalid VAD/follow-up results. Those runs were discarded. The committed harness keeps the microphone stream alive with a near-silent source and correlates responses to their input transcript, so interrupted old responses do not count as new answers.

## Bugs found and fixed in the trial

- Conversation-history updates could clear a live microphone buffer.
- Response creation needed to wait for accepted transcription and respect an outstanding response.
- An old transcript callback intercepted “resume the audiobook,” tearing down the call before command completion. Direct voice now owns that command; successful return closes the call surface instead of displaying a false disconnection.

## Repeatable checks

Run from `app/`, with Node 24 and the installed Playwright Chromium:

```sh
node scripts/voice-trial-fixtures.cjs /tmp/tinct-voice-fixtures
node scripts/browser-voice-trial.cjs full /tmp/tinct-voice-fixtures /tmp/tinct-voice-full
node scripts/browser-voice-trial.cjs mini /tmp/tinct-voice-fixtures /tmp/tinct-voice-mini
node scripts/browser-voice-trial.cjs full /tmp/tinct-voice-fixtures /tmp/tinct-voice-resume https://tinct.app resume
node scripts/browser-voice-trial.cjs full /tmp/tinct-voice-fixtures /tmp/tinct-voice-disconnect https://tinct.app disconnect
```

These are opt-in paid API tests, not part of ordinary CI. Fixture generation uses macOS speech, not an AI API. A fresh browser profile is used; the user's microphone, private history and saved session are not accessed. Human review of factual quality and recorded speech remains necessary. Reports include public test transcripts, real data-channel events and remote audio, never ephemeral HTTP credentials.

Artifacts: `/Users/andershvelplund/.codex/visualizations/2026/09/08/01a07ff0-a87f-7031-8b2f-d050d06d52bd/voice-trial/` (`full`, `full-initial`, `mini`, `resume`, `guest-disconnect`). Final full and Mini include MP3 copies. Original Mini report mixed canceled text into its interruption summary; the event stream confirms the new answer began 2.19 seconds after input ended. The committed harness fixes that correlation.

Verification: 136 test files / 1,504 tests passed, including the V1 DOM snapshot. CI build and bundle verification passed. Approved deployment completed with Worker version `a19bad4d-28a5-4b65-92b2-b18c510d5ab9`; live `assets/index-DAJ832Gt.js` matched the built bytes. Final full conversation and spoken-resume browser tests passed on that production build. Trial app commits: `d5760555`, `13d076c6`.
