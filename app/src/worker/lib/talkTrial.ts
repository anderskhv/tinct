/**
 * A signed-out guest's Talk trial (Anders, 16 Oct 2026): one conversation per
 * IP per UTC day, at most TALK_TRIAL_SECONDS long, its estimated cost reserved
 * against the daily ceiling for signed-out AI first.
 *
 * The browser cannot hold an xAI client secret for a trial: a provider session
 * outlives its secret's expiry (probed 16 Oct: a 10 s secret, the socket still
 * open at 40 s), so the length could not be enforced. A guest's call is relayed
 * through the Worker instead (routes/voice.ts), which closes it at the limit.
 * `/api/lab-voice-session` hands the browser a signed, single-use ticket for
 * that relay; the ticket carries what the relay needs to settle the call.
 */
import type { UsageEnv } from './rateLimit'
import { AI_PRICING, hashGuestKey, type LedgerEnv } from './aiUsage'

/** The longest a guest's Talk trial runs; the relay closes the call here. */
export const TALK_TRIAL_SECONDS = 120
/** Close code (application range) the relay sends when the trial's time is up. */
export const TALK_TRIAL_CLOSE_CODE = 4000
export const TALK_TRIAL_CLOSE_REASON = 'talk_trial_ended'
/** The JSON `code` of a refusal because today's trial is used. */
export const TALK_TRIAL_USED_CODE = 'talk_trial_used'
/** Seconds a ticket may wait before the browser opens the relay. */
export const TALK_TRIAL_TICKET_SECONDS = 30
/**
 * Tinct's own checks (`x-tinct-check: 1`, e.g. the post-deploy voice
 * acceptance) share this many trials a day between them, instead of the
 * per-IP one. The header is not a secret, so this pool is the most anyone
 * gains by sending it; every call is still reserved against the guest ceiling.
 */
export const TALK_TRIAL_CHECKS_PER_DAY = 12
const DAY_MS = 86_400_000

/** Two minutes of Talk at the voice ledger's per-minute price, in micro-dollars. */
export const TALK_TRIAL_RESERVE_MICROS = Math.ceil(TALK_TRIAL_SECONDS / 60 * AI_PRICING.xai.voicePerMinute * 1_000_000)

export type TalkTrialEnv = UsageEnv & LedgerEnv & { XAI_API_KEY?: string }

export interface TalkTrialSlot {
  /** Coordinator object holding today's count (hashed, never the raw IP). */
  name: string
  limit: number
}

export function utcDay(now: number): string {
  return new Date(now).toISOString().slice(0, 10)
}

/** Today's trial slot for this caller: per hashed IP, or the shared pool for Tinct's own checks. */
export async function talkTrialSlot(env: TalkTrialEnv, input: { ip: string; check: boolean; day: string }): Promise<TalkTrialSlot> {
  if (input.check) return { name: `rl:talk-trial:${input.day}:check`, limit: TALK_TRIAL_CHECKS_PER_DAY }
  return { name: `rl:talk-trial:${input.day}:${await hashGuestKey(env, input.ip)}`, limit: 1 }
}

/** Take today's trial. Fails closed: no binding or a coordinator error refuses. */
export async function takeTalkTrial(env: TalkTrialEnv, slot: TalkTrialSlot): Promise<boolean> {
  const namespace = env.USAGE_COORDINATOR
  if (!namespace) return false
  try {
    return await namespace.getByName(slot.name).hit(slot.limit, DAY_MS)
  } catch {
    return false
  }
}

/** Give a trial back (the provider never connected). Best effort. */
export async function returnTalkTrial(env: TalkTrialEnv, name: string): Promise<void> {
  try { await env.USAGE_COORDINATOR?.getByName(name).unhit() } catch { /* the trial stays used */ }
}

export interface TalkTicket {
  /** Expiry, ms since epoch. */
  exp: number
  /** Single-use nonce. */
  n: string
  /** UTC day the spend was reserved on, and how much (micro-dollars). */
  d: string
  u: number
  /** The trial slot to give back if the provider never connects. */
  t: string
  /** Tinct's own check: the ledger row is labelled `check`. */
  c: boolean
}

const encoder = new TextEncoder()

function base64url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64url(text: string): Uint8Array {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((text.length + 3) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, char => char.charCodeAt(0))
}

function ticketSecret(env: TalkTrialEnv): string | null {
  return env.AI_LEDGER_SALT || env.XAI_API_KEY || null
}

async function sign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return base64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(`talk-ticket:${payload}`))))
}

/** `<payload>.<mac>`, both base64url: valid in a WebSocket subprotocol token. */
export async function signTalkTicket(env: TalkTrialEnv, ticket: TalkTicket): Promise<string | null> {
  const secret = ticketSecret(env)
  if (!secret) return null
  const payload = base64url(encoder.encode(JSON.stringify(ticket)))
  return `${payload}.${await sign(secret, payload)}`
}

/** The ticket, or null when it is forged, malformed or expired. */
export async function verifyTalkTicket(env: TalkTrialEnv, token: string, now: number): Promise<TalkTicket | null> {
  const secret = ticketSecret(env)
  if (!secret || token.length > 1024) return null
  const [payload, mac, extra] = token.split('.')
  if (!payload || !mac || extra !== undefined) return null
  const expected = await sign(secret, payload)
  if (expected.length !== mac.length) return null
  let diff = 0
  for (let i = 0; i < mac.length; i++) diff |= mac.charCodeAt(i) ^ expected.charCodeAt(i)
  if (diff !== 0) return null
  try {
    const ticket = JSON.parse(new TextDecoder().decode(fromBase64url(payload))) as TalkTicket
    if (typeof ticket.exp !== 'number' || ticket.exp < now) return null
    if (typeof ticket.n !== 'string' || !/^[0-9a-f]{32}$/.test(ticket.n)) return null
    if (typeof ticket.d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(ticket.d)) return null
    if (!Number.isSafeInteger(ticket.u) || ticket.u < 0 || typeof ticket.t !== 'string') return null
    return { exp: ticket.exp, n: ticket.n, d: ticket.d, u: ticket.u, t: ticket.t, c: ticket.c === true }
  } catch {
    return null
  }
}

export function newTicketNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

/** The subprotocol that carries the ticket on the relay's WebSocket. */
export const TALK_TICKET_PROTOCOL_PREFIX = 'tinct-ticket.'
