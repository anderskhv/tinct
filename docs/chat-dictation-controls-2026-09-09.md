# Chat dictation controls — 9 September 2026

Anders requested an obvious stop control during transcription and slightly smaller microphone and conversation controls.

- The existing dictation toggle already stopped recognition. V2 now displays a filled stop square during starting/listening, restores the microphone when idle, and says “Listening — tap stop to finish”.
- Both icon controls use 36px painted circles and 20px icons, preserving 44px touch targets. Active dictation also gets the intended contrasting ink background; the previous multiline background rule overrode it.
- Speech recognition, draft handling, and reading position behavior are unchanged.

## Verification and deployment

- 54 focused tests passed across LabAskPane, useLabDictation, and LabApp chrome V2, including start/listen/stop icon transitions. Build and verify-bundle passed.
- npm run deploy succeeded from the clean shipping checkout using Node 24. Code commit: 31b21fb1. Worker: d9cacfd2-c390-4f85-99a5-6ab69f8a6c22.
- Live bundle index-DC1F7HTb.js matched the local build byte for byte. SHA256: e1a66394f7f5e009e9857c7232b99d6187e363d5986a06c35e24e10238c5c0e1.
- All 15 production smoke checks passed.
- Local and production WebKit checks at 390×844 (/lab/phone?chrome=v2) and 1440×1000 (/reader) verified the stop square during startup/listening, stopping in both states, restored microphone, retained transcript draft, 44px targets, and 20px icons. Browser SpeechRecognition was mocked to exercise deterministic states without real microphone access or speech-service requests. Physical iPhone speech recognition was not retested.
- Production screenshot reviewed: phone-live-recording.png. Artifacts and JSON results: /Users/andershvelplund/.codex/visualizations/2026/09/09/tinct-dictation-controls/.
