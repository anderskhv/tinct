/**
 * Voice V2 preview vocabulary. Selected only by `/lab/reader?voice=v2`.
 *
 * V2 reports a user-visible activity phase that is derived purely from
 * observed session events (WebRTC data channel, Realtime events, the
 * companion hop). It never guesses. V1 leaves the phase at `idle` and keeps
 * deriving its UI from the older machine state, so nothing here runs for V1.
 */

export type VoiceVersion = 'v1' | 'v2'

export type VoiceActivityPhase =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'checking_text'
  | 'preparing_answer'
  | 'speaking'

/** Exactly the five user-facing labels V2 is allowed to show. */
export const VOICE_V2_STATUS_LABELS: Record<Exclude<VoiceActivityPhase, 'idle'>, string> = {
  connecting: 'Connecting',
  listening: 'Listening',
  checking_text: 'Checking text',
  preparing_answer: 'Preparing answer',
  speaking: 'Speaking',
}

export function voiceV2StatusLabel(phase: VoiceActivityPhase): string | null {
  if (phase === 'idle') return null
  return VOICE_V2_STATUS_LABELS[phase]
}

/** Spoken once when a substantive request cannot be answered. */
export const VOICE_V2_FAILURE_LINE = "I couldn't get an answer to that just now."

/** Shown once when the Realtime leg itself failed mid-turn and nothing could be spoken. */
export const VOICE_V2_FAILURE_NOTICE = "Couldn't finish that answer. Ask again."

/** Structured companion-hop result. V1 keeps returning a plain string. */
export type CompanionAskFailureReason = 'request_failed' | 'incomplete' | 'empty'

export type CompanionAskResult = {
  status: 'completed' | 'failed'
  answer: string
  attempts: number
  stopReason: string | null
  failureReason?: CompanionAskFailureReason
}

/** Accept either the V1 string or the V2 structured result. */
export function normalizeCompanionResult(value: string | CompanionAskResult): CompanionAskResult {
  if (typeof value !== 'string') return value
  const answer = value.trim()
  return answer
    ? { status: 'completed', answer, attempts: 1, stopReason: null }
    : { status: 'failed', answer: '', attempts: 1, stopReason: null, failureReason: 'empty' }
}

/**
 * Realtime errors that are the expected echo of our own control events, not
 * a failed turn. A barge-in cancel that lands after the response already
 * finished is the common one.
 */
const BENIGN_REALTIME_ERRORS = [
  /no active response/i,
  /cancellation failed/i,
  /already has an active response/i,
  /buffer too small/i,
  /input audio buffer.*empty/i,
]

export function isBenignRealtimeError(message: string | undefined): boolean {
  const text = (message || '').trim()
  if (!text) return true
  return BENIGN_REALTIME_ERRORS.some(pattern => pattern.test(text))
}

const COMPANION_FILLER_PREFIXES = [
  /^(?:what a |that's a |that is a |such a )?(?:good|great|excellent|important|interesting|wonderful|fascinating)\s+(?:question|point|observation|insight)[.!,:-]*\s*/i,
  /^(?:absolutely|certainly|of course|sure)[.!,:-]*\s*/i,
  /^(?:let me|i(?:'ll| will))\s+(?:think(?: about (?:that|this))?|check|look(?: (?:that|this))?(?: up)?|take a (?:closer )?look|have a look)[^.!?]*[.!?:,-]*\s*/i,
  /^(?:i(?:'m| am) looking at (?:this|the passage|the text)[^.!?]*[.!?:,-]*\s*)/i,
  /^it (?:looks|seems) like (?:the )?(?:answer|companion(?:'s response)?) (?:is )?(?:still )?(?:working|waiting|loading)[.!,:-]*\s*/i,
] as const

/** Remove model-added praise or narrated process without rewriting the substance. */
export function directCompanionAnswer(text: string): string {
  let next = text.replace(/\s+/g, ' ').trim()
  let previous = ''
  while (next && next !== previous) {
    previous = next
    for (const prefix of COMPANION_FILLER_PREFIXES) next = next.replace(prefix, '').trim()
  }
  if (next && /^[a-z]/.test(next)) next = next[0].toUpperCase() + next.slice(1)
  return next
}
