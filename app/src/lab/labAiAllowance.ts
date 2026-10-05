/**
 * The reader's AI usage bar (Worker: /api/ai-allowance, lib/aiAllowance.ts).
 * Pure helpers; the component is LabAiUsageBar.tsx. The Worker sends no
 * currency or amount, only the fraction used, a state and the reset time.
 * Nothing renders unless the Worker says the allowance is switched on.
 */
import { apiUrl } from '../utils/apiUrl'

// DRAFT COPY — needs Anders's approval
export const AI_USAGE_COPY = {
  label: 'AI use',
  resets: (date: string) => `Renews ${date}`,
  low: 'Running low.',
  usedUp: 'AI features are paused. Reading and listening carry on.',
  usedUpUntil: (date: string) => `AI features are paused until ${date}. Reading and listening carry on.`,
  includesTopUp: 'Includes your top-up.',
  topUp: 'Top up',
  topUpMore: 'Bigger top-up',
  topUpFailed: 'Could not open checkout. Try again.',
} as const

export type AiAllowanceState = 'ok' | 'low' | 'used_up'

export interface AiAllowance {
  usedFraction: number
  state: AiAllowanceState
  resetsAt: string | null
  hasTopUp: boolean
}

export type TopUpPack = 'chat_pack_100' | 'chat_pack_200'

const STATES: readonly AiAllowanceState[] = ['ok', 'low', 'used_up']

/** null when the allowance is switched off or the response is not the expected shape. */
export function parseAiAllowance(data: unknown): AiAllowance | null {
  if (!data || typeof data !== 'object') return null
  const value = data as Record<string, unknown>
  if (value.enabled !== true) return null
  if (typeof value.usedFraction !== 'number' || !Number.isFinite(value.usedFraction)) return null
  if (!STATES.includes(value.state as AiAllowanceState)) return null
  const resetsAt = typeof value.resetsAt === 'string' && Number.isFinite(Date.parse(value.resetsAt)) ? value.resetsAt : null
  return {
    usedFraction: Math.min(1, Math.max(0, value.usedFraction)),
    state: value.state as AiAllowanceState,
    resetsAt,
    hasTopUp: value.hasTopUp === true,
  }
}

export function aiAllowanceDate(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null
}

/** The line under the bar. */
export function aiUsageNote(allowance: AiAllowance): string {
  const date = aiAllowanceDate(allowance.resetsAt)
  if (allowance.state === 'used_up') return date ? AI_USAGE_COPY.usedUpUntil(date) : AI_USAGE_COPY.usedUp
  const parts: string[] = []
  if (allowance.state === 'low') parts.push(AI_USAGE_COPY.low)
  if (allowance.hasTopUp) parts.push(AI_USAGE_COPY.includesTopUp)
  if (date) parts.push(`${AI_USAGE_COPY.resets(date)}.`)
  return parts.join(' ')
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export async function fetchAiAllowance(token: string, fetchImpl: FetchLike = fetch): Promise<AiAllowance | null> {
  try {
    const response = await fetchImpl(apiUrl('/api/ai-allowance'), { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
    if (!response.ok) return null
    return parseAiAllowance(await response.json())
  } catch {
    return null
  }
}

/** Opens the existing chat-pack checkout; resolves to the Stripe URL, or null. */
export async function startTopUpCheckout(token: string, pack: TopUpPack, fetchImpl: FetchLike = fetch): Promise<string | null> {
  try {
    const response = await fetchImpl(apiUrl('/api/create-checkout'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: pack }),
    })
    if (!response.ok) return null
    const data = await response.json() as { url?: unknown }
    return typeof data.url === 'string' && data.url.startsWith('https://') ? data.url : null
  } catch {
    return null
  }
}
