/**
 * The reader's AI usage bar (Worker: /api/ai-allowance, lib/aiAllowance.ts).
 * Pure helpers; the component is LabAiUsageBar.tsx. The Worker sends no
 * currency or amount, only the fraction used, a state and the reset time.
 * Nothing renders unless the Worker says the allowance is switched on.
 */
import { AI_ALLOWANCE_ENFORCED } from '../aiAllowanceSwitch'
import { apiUrl } from '../utils/apiUrl'

// Wording: Anders, 2026-10-07 (price pills).
export const AI_USAGE_COPY = {
  label: 'AI use',
  resets: (date: string) => `Renews ${date}`,
  low: 'Running low.',
  usedUp: 'AI features are paused. Reading and listening carry on.',
  usedUpUntil: (date: string) => `AI features are paused until ${date}. Reading and listening carry on.`,
  includesTopUp: 'Includes your top-up.',
  /** The price pills; their accessible names say what they do. */
  topUp: '$5',
  topUpMore: '$10',
  topUpAction: 'Buy a $5 top-up',
  topUpMoreAction: 'Buy a $10 top-up',
  topUpFailed: 'Could not open checkout. Try again.',
} as const

export type AiAllowanceState = 'ok' | 'low' | 'used_up'

export interface AiAllowance {
  usedFraction: number
  /** This month's allowance alone (the cards' first bar); null from an older Worker. */
  monthUsedFraction: number | null
  /** What is left of this period's top-up (the cards' second bar); null when none was bought. */
  topUpLeftFraction: number | null
  state: AiAllowanceState
  resetsAt: string | null
  hasTopUp: boolean
  /** The top-ups on sale now. */
  topUps: TopUpPack[]
}

/** The $5 and the $10 top-up (worker/lib/aiAllowance.ts TOP_UPS). */
export type TopUpPack = 'chat_pack_200' | 'top_up_10'

const STATES: readonly AiAllowanceState[] = ['ok', 'low', 'used_up']
const TOP_UP_PACKS: readonly TopUpPack[] = ['chat_pack_200', 'top_up_10']

/** The top-ups the Worker says are on sale, $5 first; unknown names are dropped. */
export function parseTopUps(value: unknown): TopUpPack[] {
  if (!Array.isArray(value)) return []
  return TOP_UP_PACKS.filter(pack => value.includes(pack))
}

/** null when the allowance is switched off or the response is not the expected shape. */
export function parseAiAllowance(data: unknown): AiAllowance | null {
  if (!data || typeof data !== 'object') return null
  const value = data as Record<string, unknown>
  if (value.enabled !== true) return null
  if (typeof value.usedFraction !== 'number' || !Number.isFinite(value.usedFraction)) return null
  if (!STATES.includes(value.state as AiAllowanceState)) return null
  const resetsAt = typeof value.resetsAt === 'string' && Number.isFinite(Date.parse(value.resetsAt)) ? value.resetsAt : null
  const fraction = (raw: unknown) => (typeof raw === 'number' && Number.isFinite(raw) ? Math.min(1, Math.max(0, raw)) : null)
  return {
    usedFraction: Math.min(1, Math.max(0, value.usedFraction)),
    monthUsedFraction: fraction(value.monthUsedFraction),
    topUpLeftFraction: fraction(value.topUpLeftFraction),
    state: value.state as AiAllowanceState,
    resetsAt,
    hasTopUp: value.hasTopUp === true,
    topUps: parseTopUps(value.topUps),
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

/** Top-ups are offered when running low and at zero, never while plenty is left. */
export function offersTopUps(allowance: AiAllowance): boolean {
  return allowance.state !== 'ok' && allowance.topUps.length > 0
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

/** The Worker's refusal at zero: HTTP 402 { error: 'allowance_used' } (worker/lib/aiAllowance.ts). */
export const ALLOWANCE_USED_ERROR = 'allowance_used'

/**
 * Whether a failed AI response is the allowance refusal, so the sheet shows
 * LAB_COPY.balanceEmpty rather than only Retry. Always false while the switch
 * is off: then nothing on screen changes. Reads the body; call it only on a
 * response whose body has not been read.
 */
export async function isAllowanceUsedResponse(response: { status: number; json(): Promise<unknown> }, enforced: boolean = AI_ALLOWANCE_ENFORCED): Promise<boolean> {
  if (!enforced || response.status !== 402) return false
  try {
    const data = await response.json() as { error?: unknown } | null
    return data?.error === ALLOWANCE_USED_ERROR
  } catch {
    return false
  }
}

/**
 * The reader's session for AI routes that also serve signed-out readers
 * (chapter notes, Catch me up), so the Worker can charge and gate a signed-in
 * reader's own generations. Cached answers stay free. Sent only while the
 * allowance is switched on; off, these requests are unchanged.
 */
export function allowanceAuthHeaders(token: string | null | undefined, enforced: boolean = AI_ALLOWANCE_ENFORCED): Record<string, string> {
  return enforced && token ? { Authorization: `Bearer ${token}` } : {}
}

/** Switch off (src/aiAllowanceSwitch.ts): resolves to null without a request. */
export async function fetchAiAllowance(token: string, fetchImpl: FetchLike = fetch, enforced: boolean = AI_ALLOWANCE_ENFORCED): Promise<AiAllowance | null> {
  if (!enforced) return null
  try {
    const response = await fetchImpl(apiUrl('/api/ai-allowance'), { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
    if (!response.ok) return null
    return parseAiAllowance(await response.json())
  } catch {
    return null
  }
}

/** Opens the top-up checkout; resolves to the Stripe URL, or null. */
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
