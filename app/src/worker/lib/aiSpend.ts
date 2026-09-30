import type { UsageEnv } from './rateLimit'

/**
 * Daily ceiling for signed-out AI, the same reservation pattern narration
 * uses: every provider call reserves its estimated cost first and is refused
 * when the day's budget would be exceeded. Units are micro-dollars.
 */
export type GuestAiSpendEnv = UsageEnv & {
  /** Whole US cents per UTC day for signed-out AI. Unset = the default below. */
  GUEST_AI_DAILY_CENTS?: string
}

export type ReserveGuestSpend = (microDollars: number) => Promise<boolean>

export const DEFAULT_GUEST_AI_DAILY_CENTS = 500
/** Approximate list prices per token, in micro-dollars. Operational estimate only. */
export const INPUT_MICROS_PER_TOKEN = 3
export const OUTPUT_MICROS_PER_TOKEN = 15
/** Tool-using requests re-send the (cached) prompt; charge half again for it. */
const TOOL_ROUND_FACTOR = 1.5

export function guestAiDailyMicros(env: GuestAiSpendEnv): number {
  const cents = Number(env.GUEST_AI_DAILY_CENTS)
  const value = Number.isFinite(cents) && cents >= 0 ? Math.floor(cents) : DEFAULT_GUEST_AI_DAILY_CENTS
  return value * 10_000
}

/** Characters are counted at four per token, rounded up. */
export function estimateAiCostMicros(input: { inputChars: number; maxTokens: number; tools?: boolean }): number {
  const inputTokens = Math.ceil(Math.max(0, input.inputChars) / 4)
  const inputCost = inputTokens * INPUT_MICROS_PER_TOKEN * (input.tools ? TOOL_ROUND_FACTOR : 1)
  return Math.max(1, Math.ceil(inputCost + Math.max(0, input.maxTokens) * OUTPUT_MICROS_PER_TOKEN))
}

function logCeiling(reason: string): void {
  console.warn(JSON.stringify({ event: 'guest_ai_ceiling', reason }))
}

/** Fails closed: no binding, a coordinator error, or a full day all refuse. */
export function createGuestSpendReserver(env: GuestAiSpendEnv, now: () => number = Date.now): ReserveGuestSpend {
  return async (microDollars) => {
    const namespace = env.USAGE_COORDINATOR
    if (!namespace) { logCeiling('binding_missing'); return false }
    const day = new Date(now()).toISOString().slice(0, 10)
    try {
      const ok = await namespace.getByName(`spend:guest-ai:${day.slice(0, 7)}`).reserve(day, Math.ceil(microDollars), guestAiDailyMicros(env))
      if (!ok) logCeiling('ceiling_reached')
      return ok
    } catch {
      logCeiling('coordinator_error')
      return false
    }
  }
}

/** One calm, structured answer for a ceiling or a provider budget/limit error. */
export const AI_RESTING_TYPE = 'ai_resting'
export const AI_RESTING_MESSAGE = 'AI is resting — try again later.'

export function aiRestingBody() {
  return { type: 'error', error: { type: AI_RESTING_TYPE, message: AI_RESTING_MESSAGE } }
}
