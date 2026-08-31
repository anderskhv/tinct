# Voice v1 architecture

## Product invariant

A Tinct voice session is reader-owned. It stays open after answers and during silence. It ends only when the reader taps **End voice**, returns to playback, closes the audio strip, or explicitly asks to resume the book. Permission failures and unrecoverable network failures are the only non-user exits.

Changing page, chapter, edition, or book updates the active session context instead of closing it. A stale audiobook anchor must never move the reader back into the previous passage when voice ends.

## Response path

Production voice uses `gpt-realtime-2.1-mini` directly over WebRTC. Claude is not in the spoken-turn path; it remains the text-chat model. The smaller Realtime model stays in v1 because its direct speech-to-speech path is the lowest-latency option already integrated in Tinct.

Production turn detection uses semantic VAD with `auto` eagerness. This removes the fixed 700 ms silence wait while retaining a balanced pause tolerance for readers who speak deliberately.

## Reader context

Every active session receives a live, bounded context update containing:

- book, author, edition, chapter, page, and paragraph index;
- the current paragraph, nearby paragraphs, and visible text;
- the reader's current reading objective;
- a compact continuity profile derived from existing Tinct data.

The continuity profile contains at most 12 library books, five recent reading positions, and six recent question/answer pairs across books. It uses the existing synced storage model; v1 adds no new database, embeddings, or vector search. The model is instructed to use this memory quietly and only when relevant, never to recite or announce a user profile.

## Latency measurement

Tinct records two kinds of client-side samples in `tinctDebug().voice`:

- `session_setup`: tap to ready WebRTC data channel;
- `turn`: Realtime `speech_stopped` to first response audio, numbered per session.

Turn 1 and turn 2 can therefore be compared separately. Samples retain the last 20 measurements and include the model name. This deliberately reports the observable Realtime leg; it does not pretend to include an unknowable timestamp for the physical end of the reader's speech.

For a fair ChatGPT Voice comparison, use the same device, network, two scripted questions, and response-length instruction, run each flow five times, and compare medians. ChatGPT's consumer UI does not expose equivalent event timestamps, so its number must be measured manually from the recording rather than inferred from marketing claims.

## Next feature candidates

After v1 is stable, the strongest additions are sentence-level “what does this mean?”, a short “last time…” continuity cue, adaptive answer depth, and an optional end-of-session thread/bookmark that saves the useful insight without turning every conversation into a formal note.
