import type { UsageEnv } from './rateLimit'

/**
 * Daily ceiling for signed-out AI, the same reservation pattern narration
 * uses: every provider call reserves its estimated cost first and is refused
 * when the day's budget would be exceeded. Units are micro-dollars.
 */
export type GuestAiSpendEnv = UsageEnv & {
  /** Whole US cents per UTC day for signed-out AI. Unset = the default below. */
  GUEST_AI_DAILY_CENTS?: string
  /** Whole US cents per UTC day for the /try page's reader (its own budget). Unset = DEFAULT_TRY_AI_DAILY_CENTS. */
  TRY_AI_DAILY_CENTS?: string
}

/**
 * Which daily budget a signed-out AI request draws on. The /try page's reader (docs/try-page/BRIEF.md) has its own,
 * so a busy day there never drains the reader's guest budget, or the other way round. Its frame marks every AI
 * request with `X-Tinct-Surface: try` (public/lab/try/reader-demo.js). A guest who sets the header by hand only
 * moves to the other capped budget; both stay bounded.
 */
export type AiSpendSurface = 'guest' | 'try'
export const TRY_SURFACE_HEADER = 'x-tinct-surface'

export function aiSpendSurface(request: Request): AiSpendSurface {
  return request.headers.get(TRY_SURFACE_HEADER)?.trim().toLowerCase() === 'try' ? 'try' : 'guest'
}

export type ReserveGuestSpend = (microDollars: number) => Promise<boolean>

export const DEFAULT_GUEST_AI_DAILY_CENTS = 500
/** The /try page's own day: $3 unless the Worker var TRY_AI_DAILY_CENTS says otherwise. */
export const DEFAULT_TRY_AI_DAILY_CENTS = 300
/** Approximate list prices per token, in micro-dollars. Operational estimate only. */
export const INPUT_MICROS_PER_TOKEN = 3
export const OUTPUT_MICROS_PER_TOKEN = 15
/** Tool-using requests re-send the (cached) prompt; charge half again for it. */
const TOOL_ROUND_FACTOR = 1.5

export function guestAiDailyMicros(env: GuestAiSpendEnv, surface: AiSpendSurface = 'guest'): number {
  const raw = surface === 'try' ? env.TRY_AI_DAILY_CENTS : env.GUEST_AI_DAILY_CENTS
  const cents = Number(raw)
  const value = Number.isFinite(cents) && cents >= 0 ? Math.floor(cents) : surface === 'try' ? DEFAULT_TRY_AI_DAILY_CENTS : DEFAULT_GUEST_AI_DAILY_CENTS
  return value * 10_000
}

/**
 * Characters are counted at four per token, rounded up. Pictures add their own
 * input tokens (`imageTokens`, see chatImages.imageTokenEstimate).
 */
export function estimateAiCostMicros(input: { inputChars: number; maxTokens: number; tools?: boolean; imageTokens?: number }): number {
  const inputTokens = Math.ceil(Math.max(0, input.inputChars) / 4) + Math.max(0, Math.ceil(input.imageTokens ?? 0))
  const inputCost = inputTokens * INPUT_MICROS_PER_TOKEN * (input.tools ? TOOL_ROUND_FACTOR : 1)
  return Math.max(1, Math.ceil(inputCost + Math.max(0, input.maxTokens) * OUTPUT_MICROS_PER_TOKEN))
}

function logCeiling(reason: string): void {
  console.warn(JSON.stringify({ event: 'guest_ai_ceiling', reason }))
}

/** A reservation that can be given back when the request it was made for never runs. */
export type GuestSpendHold = { release: () => Promise<void> }
/** Reserve like ReserveGuestSpend; a granted reservation comes back as a hold, a refusal as null. */
export type HoldGuestSpend = (microDollars: number) => Promise<GuestSpendHold | null>

/**
 * Fails closed: no binding, a coordinator error, or a full day all refuse.
 * The hold releases the same units on the same day's row, so a request that
 * reserved alongside its rate-limit check and was then refused by the limiter
 * leaves the budget as it found it.
 */
export function createGuestSpendHolder(env: GuestAiSpendEnv, now: () => number = Date.now, surface: AiSpendSurface = 'guest'): HoldGuestSpend {
  return async (microDollars) => {
    const namespace = env.USAGE_COORDINATOR
    if (!namespace) { logCeiling('binding_missing'); return null }
    const day = new Date(now()).toISOString().slice(0, 10)
    const units = Math.ceil(microDollars)
    const name = guestSpendBudgetName(day, surface)
    try {
      const ok = await namespace.getByName(name).reserve(day, units, guestAiDailyMicros(env, surface))
      if (!ok) { logCeiling('ceiling_reached'); return null }
      return {
        release: async () => {
          try { await namespace.getByName(name).release(day, units) } catch { logCeiling('release_error') }
        },
      }
    } catch {
      logCeiling('coordinator_error')
      return null
    }
  }
}

/** The coordinator row a day's signed-out AI spend is reserved on (the /try page's on its own row). */
export function guestSpendBudgetName(day: string, surface: AiSpendSurface = 'guest'): string {
  return `spend:${surface === 'try' ? 'try-ai' : 'guest-ai'}:${day.slice(0, 7)}`
}

/**
 * Give back part of a reservation made on `day` (a Talk trial that ended
 * before its two reserved minutes). Best effort; never below zero.
 */
export async function releaseGuestSpend(env: GuestAiSpendEnv, day: string, microDollars: number, surface: AiSpendSurface = 'guest'): Promise<void> {
  const units = Math.floor(microDollars)
  if (!env.USAGE_COORDINATOR || !(units > 0)) return
  try { await env.USAGE_COORDINATOR.getByName(guestSpendBudgetName(day, surface)).release(day, units) } catch { logCeiling('release_error') }
}

/** Fails closed: no binding, a coordinator error, or a full day all refuse. */
export function createGuestSpendReserver(env: GuestAiSpendEnv, now: () => number = Date.now, surface: AiSpendSurface = 'guest'): ReserveGuestSpend {
  const hold = createGuestSpendHolder(env, now, surface)
  return async (microDollars) => (await hold(microDollars)) !== null
}

/** One calm, structured answer for a ceiling or a provider budget/limit error. */
export const AI_RESTING_TYPE = 'ai_resting'
export const AI_RESTING_MESSAGE = 'AI is resting — try again later.'

export function aiRestingBody() {
  return { type: 'error', error: { type: AI_RESTING_TYPE, message: AI_RESTING_MESSAGE } }
}
