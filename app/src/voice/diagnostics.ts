import { apiUrl } from '../utils/apiUrl'

export type VoiceDiagnosticEventType =
  | 'session_started'
  | 'session_ended'
  | 'context_bound'
  | 'submitted'
  | 'provider_started'
  | 'provider_first_token'
  | 'provider_completed'
  | 'provider_error'
  | 'retry'
  | 'fallback'
  | 'response_persisted'
  | 'tts_queued'
  | 'tts_started'
  | 'tts_first_audio'
  | 'tts_completed'
  | 'tts_interrupted'
  | 'tts_cancelled'
  | 'microphone_connect'
  | 'listen'
  | 'think'
  | 'checking_text'
  | 'preparing_answer'
  | 'speak'
  | 'cancelled'

export type VoiceDiagnosticPayload = {
  turnId?: string
  providerId?: string
  metadata?: Record<string, string | number | boolean | null | undefined>
  raw?: { prompt?: string; response?: string; transcript?: string }
}

export interface VoiceDiagnosticReporter {
  readonly sessionId: string
  report: (type: VoiceDiagnosticEventType, payload?: VoiceDiagnosticPayload) => void
}

let localDiagnosticId = 0

/** Opaque correlation IDs only; these intentionally contain no account or book data. */
export function nextVoiceDiagnosticId(prefix: 'turn' | 'provider'): string {
  const suffix = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}_${++localDiagnosticId}`
  return `${prefix}_${suffix}`
}

export function createVoiceDiagnosticReporter(input: {
  sessionId?: string | null
  authToken?: string | null
  fetchImpl?: typeof fetch
}): VoiceDiagnosticReporter | null {
  const sessionId = input.sessionId?.trim()
  const authToken = input.authToken?.trim()
  if (!sessionId || !authToken) return null
  const fetchImpl = input.fetchImpl ?? fetch

  return {
    sessionId,
    report(type, payload = {}) {
      const metadata = Object.fromEntries(
        Object.entries(payload.metadata ?? {}).filter((entry): entry is [string, string | number | boolean | null] => entry[1] !== undefined),
      )
      void fetchImpl(apiUrl('/api/diagnostics/events'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          sessionId,
          type,
          ...(payload.turnId ? { turnId: payload.turnId } : {}),
          ...(payload.providerId ? { providerId: payload.providerId } : {}),
          ...(Object.keys(metadata).length ? { metadata } : {}),
          ...(payload.raw ? { raw: payload.raw } : {}),
        }),
        keepalive: true,
      }).catch(() => { /* Diagnostics must never affect the reading or voice path. */ })
    },
  }
}
