# Voice acknowledgement evidence

The real browser sent `session.update` with `voice: "ara"` and received `session.updated` without a provider error. The provider's current response contains session configuration but omits the voice field. The original strengthened test incorrectly required that optional echo, timing out even though the UI was connected.

The acceptance now pairs each acknowledgement with its queued outgoing update and checks the exact requested voice (Ara and Helios separately). If the provider echoes a voice, it must match. Evidence records the returned voice as null when omitted; it never invents an echoed value. The female check also requires audio bytes, the expected brief transcript, and completion for the existing delayed-lookup acknowledgement.

This follows the [xAI realtime contract](https://docs.x.ai/developers/rest-api-reference/inference/voice), which defines `session.updated` as acknowledgement that the client's session update has been configured. These are silent browser checks with a deterministic fake microphone, not physical-device or subjective voice-quality certification.
