import { isValidUUID } from './security'
import { supabaseGet, supabaseInsert, type SupabaseEnv } from './supabase'

export type DiagnosticEnv = SupabaseEnv & {
  OWNER_DIAGNOSTIC_USER_ID?: string
}

export type DiagnosticConsent = {
  enabled: boolean
  raw_content_enabled: boolean
}

export const DIAGNOSTIC_RETENTION_DAYS = 14

const EVENT_TYPES = new Set([
  'submitted', 'request_accepted', 'provider_started', 'provider_first_token',
  'provider_completed', 'provider_error', 'fallback', 'retry', 'response_persisted',
  'tts_queued', 'tts_started', 'tts_first_audio', 'tts_completed', 'tts_interrupted',
  'tts_cancelled', 'playback_ended', 'microphone_connect', 'listen', 'think', 'speak',
  'cancelled',
])

const SAFE_METADATA_KEYS = new Set([
  'latency_ms', 'input_characters', 'output_characters', 'input_tokens', 'output_tokens',
  'attempt', 'status', 'error_class', 'cancellation_reason', 'transport', 'model',
  'source', 'audio_duration_ms',
])

const SENSITIVE_KEY = /(authorization|token|secret|password|cookie|payment|card|email)/i
const OPAQUE_ID = /^[A-Za-z0-9_-]{1,100}$/

export function isConfiguredOwner(env: DiagnosticEnv, userId: string): boolean {
  return Boolean(
    env.OWNER_DIAGNOSTIC_USER_ID
    && isValidUUID(env.OWNER_DIAGNOSTIC_USER_ID)
    && userId === env.OWNER_DIAGNOSTIC_USER_ID,
  )
}

export function sanitizeDiagnosticMetadata(value: unknown): Record<string, string | number | boolean | null> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: Record<string, string | number | boolean | null> = {}
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!SAFE_METADATA_KEYS.has(key) || SENSITIVE_KEY.test(key)) continue
    if (raw === null || typeof raw === 'boolean') result[key] = raw
    else if (typeof raw === 'number' && Number.isFinite(raw)) result[key] = raw
    else if (typeof raw === 'string') result[key] = raw.slice(0, 200)
  }
  return result
}

export function validDiagnosticEventType(value: unknown): value is string {
  return typeof value === 'string' && EVENT_TYPES.has(value)
}

export function validOpaqueId(value: unknown): value is string {
  return typeof value === 'string' && OPAQUE_ID.test(value)
}

export function reconstructDiagnosticSequence(events: Array<{ event_type: string }>): {
  hadFallback: boolean
  speechCutOff: boolean
  completed: boolean
} {
  const types = events.map(event => event.event_type)
  const lastSpeechStart = Math.max(types.lastIndexOf('tts_started'), types.lastIndexOf('speak'))
  const lastSpeechEnd = Math.max(types.lastIndexOf('tts_completed'), types.lastIndexOf('playback_ended'))
  return {
    hadFallback: types.includes('fallback') || types.includes('retry'),
    speechCutOff: lastSpeechStart >= 0 && lastSpeechEnd < lastSpeechStart
      && (types.includes('tts_interrupted') || types.includes('tts_cancelled') || types.includes('cancelled')),
    completed: types.includes('provider_completed') && lastSpeechEnd >= lastSpeechStart,
  }
}

export async function getDiagnosticConsent(env: DiagnosticEnv, userId: string): Promise<DiagnosticConsent> {
  if (!isConfiguredOwner(env, userId) || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return { enabled: false, raw_content_enabled: false }
  }
  const response = await supabaseGet(env, `diagnostic_consents?user_id=eq.${encodeURIComponent(userId)}&select=enabled,raw_content_enabled&limit=1`)
  if (!response.ok) return { enabled: false, raw_content_enabled: false }
  const rows = await response.json() as DiagnosticConsent[]
  return rows[0] ?? { enabled: false, raw_content_enabled: false }
}

export async function recordServerDiagnosticEvent(
  env: DiagnosticEnv,
  userId: string,
  event: { sessionId: string; turnId?: string; providerId?: string; type: string; metadata?: unknown; raw?: unknown },
): Promise<boolean> {
  const consent = await getDiagnosticConsent(env, userId)
  if (!consent.enabled || !validOpaqueId(event.sessionId) || !validDiagnosticEventType(event.type)) return false
  if (event.turnId && !validOpaqueId(event.turnId)) return false
  if (event.providerId && !validOpaqueId(event.providerId)) return false
  const eventId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + DIAGNOSTIC_RETENTION_DAYS * 86_400_000).toISOString()
  const inserted = await supabaseInsert(env, 'diagnostic_events', {
    id: eventId,
    user_id: userId,
    session_id: event.sessionId,
    turn_id: event.turnId ?? null,
    provider_id: event.providerId ?? null,
    event_type: event.type,
    metadata: sanitizeDiagnosticMetadata(event.metadata),
    expires_at: expiresAt,
  })
  if (!inserted.ok) return false
  if (consent.raw_content_enabled && event.raw && typeof event.raw === 'object' && !Array.isArray(event.raw)) {
    const raw = event.raw as Record<string, unknown>
    const payload: Record<string, string> = {}
    for (const key of ['prompt', 'response', 'transcript']) {
      if (typeof raw[key] === 'string') payload[key] = (raw[key] as string).slice(0, 50_000)
    }
    if (Object.keys(payload).length) {
      await supabaseInsert(env, 'diagnostic_payloads', { event_id: eventId, user_id: userId, payload, expires_at: expiresAt })
    }
  }
  return true
}
