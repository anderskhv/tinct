# Owner conversation diagnostics

## Local audit (2026-09-04)

This audit inspected source and configuration only. It did not query production,
print stored rows, inspect credentials, or expose conversation content.

### What exists today

- Signed-in chat history is stored as book-scoped `chat-history:{bookId}` values.
  The browser keeps a local cache and the authenticated storage provider mirrors
  those values into Supabase `user_data`. These records contain the user and
  assistant text plus message-level book/chapter metadata. Transient error
  messages are deliberately removed before history cleanup persists them.
- Text chat requests go through the Worker to Anthropic. The Worker streams SSE
  back to the browser and writes aggregate cache/input/output token counters to
  `console.log`. It does not persist an opaque request, session, turn, or provider
  ID. The browser retries up to twice when no token has arrived; a failure after
  the first token is not retried. Those retry boundaries are not durably stored.
- Voice token issuance goes through the Worker, but the subsequent realtime
  WebRTC connection is browser-to-OpenAI. The browser controller observes speech
  start/stop, response creation, first audio, transcript deltas/completion,
  response completion/cancellation, explicit `response.cancel`, audio-buffer
  clearing, connection loss, and local state-machine transitions. It currently
  persists only completed/cancelled user and assistant transcript turns via the
  ordinary chat-history callback; it does not persist the event timeline.
- The checked-in Wrangler configuration enables no durable Worker log sink,
  Logpush, Analytics Engine binding, or Tail Worker. Ephemeral Worker logs may
  contain the existing aggregate Anthropic token/cache event, but cannot join it
  to a saved conversation.
- The OpenAI safety identifier is a one-way hash of the authenticated subject.
  It is not a per-session/provider response ID and cannot reconstruct a turn.
- No raw microphone audio is stored by the inspected application paths.

### Can the reported incident be reconstructed now?

No, not reliably. Saved transcript text can show that a fallback-like phrase was
spoken and a cancelled assistant turn may survive in chat history, but there is
no durable ordering of provider completion, first audio, cancellation, playback
end, connection loss, or app state. The evidence cannot distinguish provider
cutoff, browser cancellation/barge-in, WebRTC loss, local playback interruption,
or a state-machine transition after the fact.

## Implemented boundary

The additive migration creates four RLS-protected tables:

- `diagnostic_consents`: explicit lifecycle and separate raw-text consent.
- `diagnostic_events`: safe event metadata and opaque correlation IDs.
- `diagnostic_payloads`: raw prompt/response/transcript, physically separated.
- `diagnostic_access_audit`: every owner diagnostic read/deletion.

There are deliberately no `anon` or `authenticated` policies. The browser cannot
read these tables directly. Requests must cross the Worker, which fails closed
unless `OWNER_DIAGNOSTIC_USER_ID` is a valid UUID equal to the immutable subject
from Supabase authentication. Timeline reads/deletes additionally require that
same subject to be present in `site_admins`. Email and client-provided admin or
owner flags are ignored.

Capture defaults off. Consent is checked on every event, so opting out stops the
next event rather than waiting for a session restart. Operational metadata uses
an allowlist and rejects credential-like fields. Raw capture copies only the
three named text fields after separate consent; it never accepts audio, tokens,
cookies, email, payment data, or arbitrary local storage. Rows expire after 14
days and the operator endpoint supports expired-only or complete deletion.

Routes:

- `GET|PUT /api/diagnostics/consent`
- `POST /api/diagnostics/events`
- `GET /api/admin/diagnostics?session=<opaque-id>&includeRaw=1`
- `DELETE /api/admin/diagnostics?scope=expired` (or omit scope to delete all)

The voice-session Worker now automatically records token-request acceptance,
provider start, and provider completion/error for an opted-in owner, and returns
the opaque diagnostic session ID. No ordinary account takes the diagnostic DB
path.

## Narrow deferred client hook

This branch intentionally does not edit `App.tsx`, active Reader files, or the
voice controller while Reader/Library work is converging. To complete end-to-end
voice reconstruction, pass `diagnostic_session_id` from
`VoiceSessionController.start()` into a tiny reporter and emit from
`handleRealtimeEvent()` at the existing cases:

- `input_audio_buffer.speech_started/stopped` -> `listen` / `think`
- `response.created` -> `provider_started`
- first output-audio delta -> `tts_first_audio`
- output-audio started/stopped -> `tts_started` / `tts_completed`
- transcript done -> raw `transcript` plus character count
- response done/cancelled and controller `response.cancel` -> completed/cancelled
- data-channel close, `stop()`, and playback restoration -> interruption reason

For text chat, generate a client session/turn UUID in `useClaude.sendMessage()`,
send `submitted`, `retry`, `fallback`, `response_persisted`, and stream first-token
events to the same endpoint. Never put authorization headers or request bodies in
metadata. This is a narrow follow-up because those two client files are active in
the Reader convergence work.

## Threat model

- A user spoofs an owner/admin boolean: ignored; only verified auth subject and
  server configuration decide eligibility.
- The allowlist secret is absent, malformed, or mismatched: capture and access
  fail closed.
- A normal user calls the event endpoint with raw text: rejected before consent
  lookup or insert.
- An owner opts into metadata but not raw text: only lifecycle rows are written.
- A credential is placed in metadata: allowlisting drops the field. Arbitrary
  nested objects are dropped.
- A database role tries direct access: RLS plus revoked privileges deny it.
- A site admin who is not the configured owner tries to inspect diagnostics:
  denied. Both checks are required.
- An authorized owner reads data: the action is separately audited.
- Data accumulates indefinitely: each capture receives a 14-day expiry and the
  authorized deletion path removes expired or all diagnostic rows.

Before release, apply the migration, configure the UUID secret, and add a periodic
call to the expired-data deletion path. Do not place the UUID in client config.
