# Reader follow-up — 8 September 2026

## Changes for retest (chrome=v2)
- Pause keeps the audio dock visible on phone and desktop. It becomes a Resume control. A page turn while paused dismisses it; chapter changes reset it. Back to book stays unchanged.
- Message timestamps sit above the message instead of competing for horizontal space with it.
- The edition-change label sits near the top of the reading page and lasts 2.6 seconds.
- Desktop passage measurements stay hidden while the current page is being settled, then reveal the complete page. Background pagination and the compare standby paginator are retained.
- The quiet voice handoff waits for the transcript and routes the question before requesting speech. Previously a 250ms fallback asked the voice model to speak, and an escalation handler cancelled it on its first audio/transcript event. No model/provider has been changed.

## Voice testing
A new opt-in scripts/realtime-audio-probe.mjs uses the production guest session route and real Realtime audio output, recording a WAV, transcript and timings. It sends a public test question only. It does not read account history, use Anthropic, or log ephemeral credentials.

Two probes on the existing gpt-realtime-2.1-mini completed:
- Text question: first audio 878ms; 14.85 seconds of generated audio.
- Synthetic spoken question: correctly transcribed “What is the firmament in Genesis?”; first audio 949ms; 15.9 seconds of generated audio.

These are two service-level samples, not a general latency benchmark, full companion end-to-end test, or microphone/echo-cancellation test. The new controller regression separately tests the precise delayed-transcription/cutoff sequence and verifies exactly one answer request without cancellation or filler.

Run from app/: node scripts/realtime-audio-probe.mjs <output-directory> [raw-mono-PCM16-24000Hz-file]. The script opens one bounded live session and incurs normal API usage. It fails for empty/very short speech, API errors or timeout. Output recording quality is not automatically semantically graded.

## Model options
Recommendation: evaluate a direct full Realtime 2.1 voice companion with relevant book context, plus an optional Mini mode later. Realtime 2.1 supports speech-to-speech reasoning; Mini is designed for faster, lower-cost interactions. A direct model removes the answer handoff, but still needs book-context retrieval and tests for literary accuracy. Full-model availability and quality have not been tested for this account. Keep the current provider/model until Anders approves the proposed change.

Alternatives: direct Mini for low latency/cost; or retain a separate text companion plus voice synthesis for parity with typed answers, accepting more orchestration and latency. A larger model alone cannot fix application cancellation races.

Sources: https://developers.openai.com/api/docs/models/gpt-realtime-2.1 and https://developers.openai.com/api/docs/models/gpt-realtime-2.1-mini .

## Separate design task
Contents and interaction overview redesign was requested in a new task: quick location recognition, hierarchical Bible book/chapter navigation, read/unread progress and conversations/highlights; quieter left-side desktop panel with less blur. No contents redesign is included in this patch.
