/**
 * What Modern English editions (lib/modernEdition.ts) may spend per UTC month,
 * all books together: MODERN_EDITION_MONTHLY_USD (default $100, Anders
 * 2026-10-10). The ceiling gates NEW purchases only: a book a reader has paid
 * for is always finished, even when it takes the month over (logged).
 *
 * Counted in micro-dollars on NarrationCoordinator, one object per month
 * (`modern-budget:{YYYY-MM}`), as the other monthly budgets are (lib/ownOcr.ts):
 *   - a checkout reserves the book's expected cost (from its word count) before
 *     the Stripe session exists; refused when it would take the month over, so
 *     no session is created and nothing is charged;
 *   - an unpaid checkout (expired, cancelled, failed) gives its reservation back;
 *   - a paid book spends from its reservation; what it costs beyond it is added
 *     to the month it is spent in, never refused; once the book is finished,
 *     what the reservation did not use is given back.
 * Without the coordinator binding nothing is offered (fails closed).
 */
import type { NarrationCoordinator } from '../narrationCoordinator'
import { xaiTextCostUsd } from './aiUsage'

export type ModernBudgetEnv = {
  /** Dollars all Modern English generation may spend per UTC month; gates new purchases. */
  MODERN_EDITION_MONTHLY_USD?: string
  NARRATION_COORDINATOR?: DurableObjectNamespace<NarrationCoordinator>
}

export const MODERN_EDITION_DEFAULT_MONTHLY_USD = 100
/** A reservation is a whole micro-dollar count of at least one. */
const UNLIMITED = Number.MAX_SAFE_INTEGER

export interface ModernReservation { day: string; micros: number }

export const modernBudgetName = (month: string) => `modern-budget:${month}`
const dayOf = (now: number) => new Date(now).toISOString().slice(0, 10)

export function modernMonthlyMicros(env: ModernBudgetEnv): number {
  const parsed = Number(env.MODERN_EDITION_MONTHLY_USD)
  return Math.round((Number.isFinite(parsed) && parsed > 0 ? parsed : MODERN_EDITION_DEFAULT_MONTHLY_USD) * 1_000_000)
}

// ===== Expected cost =====

/**
 * The cost model behind every expectation (grok-4.3 rates, $1.25 / $2.50 per
 * million tokens): each call sends the instructions and the chapter header
 * (MODERN_PROMPT_TOKENS) plus the source, and gets back about as many tokens
 * as it sent of source. Older English prose runs about 1.4 tokens a word.
 */
export const MODERN_PROMPT_TOKENS = 500
export const MODERN_TOKENS_PER_WORD = 1.4
/** Words assumed for a book whose word count is unknown: the top of the cheapest tier, which its price assumed. */
export const MODERN_UNKNOWN_WORDS = 40_000
/** Source words per call in the expectation (lib/modernEdition.ts CHUNK_WORDS). */
const WORDS_PER_CALL = 900

/** Expected dollars for one call of `words` source words. */
export function modernChunkExpectedUsd(words: number): number {
  const w = Math.max(0, words)
  return xaiTextCostUsd(MODERN_PROMPT_TOKENS + w * MODERN_TOKENS_PER_WORD, w * MODERN_TOKENS_PER_WORD)
}

/** Expected dollars for a whole book of `words` source words, written without retries. */
export function modernBookExpectedUsd(words: number | null | undefined): number {
  const w = typeof words === 'number' && Number.isFinite(words) && words > 0 ? words : MODERN_UNKNOWN_WORDS
  const calls = Math.max(1, Math.ceil(w / WORDS_PER_CALL))
  return xaiTextCostUsd(calls * MODERN_PROMPT_TOKENS + w * MODERN_TOKENS_PER_WORD, w * MODERN_TOKENS_PER_WORD)
}

export const usdToMicros = (usd: number) => Math.max(0, Math.round(usd * 1_000_000))

// ===== Coordinator =====

function monthObject(env: ModernBudgetEnv, day: string) {
  return env.NARRATION_COORDINATOR?.getByName(modernBudgetName(day.slice(0, 7))) ?? null
}

/** Micro-dollars counted this month so far (reservations and overruns); null when it cannot be read. */
export async function modernMonthMicros(env: ModernBudgetEnv, now: number): Promise<number | null> {
  const object = monthObject(env, dayOf(now))
  if (!object) return null
  try {
    const rows = await object.usage()
    return (rows as Array<{ bytes: number }>).reduce((sum: number, row) => sum + row.bytes, 0)
  } catch { return null }
}

/** Whether a new book expected to cost `micros` fits in this month. False when the month cannot be read. */
export async function modernMonthHasRoom(env: ModernBudgetEnv, now: number, micros: number): Promise<boolean> {
  const used = await modernMonthMicros(env, now)
  return used !== null && used + Math.max(1, micros) <= modernMonthlyMicros(env)
}

/**
 * Reserves a new book's expected cost. Strict (a checkout): null when it would
 * take the month over or the month cannot be reached. `force` (a payment that
 * arrived without a reservation): never refused; logs when it takes the month over.
 */
export async function reserveModernBook(env: ModernBudgetEnv, now: number, micros: number, options: { force?: boolean; bookId?: string } = {}): Promise<ModernReservation | null> {
  const day = dayOf(now)
  const object = monthObject(env, day)
  const amount = Math.max(1, Math.round(micros))
  if (!object) return null
  try {
    const limit = modernMonthlyMicros(env)
    if (await object.reserve(day, amount, limit, limit)) return { day, micros: amount }
    if (!options.force) return null
    await object.reserve(day, amount, UNLIMITED, UNLIMITED)
    console.warn(JSON.stringify({ event: 'modern_edition_month_over', book: options.bookId ?? null, micros: amount, limitMicros: limit }))
    return { day, micros: amount }
  } catch { return null }
}

/** Gives back (part of) a reservation, to the month it was made in. Never throws. */
export async function refundModernReservation(env: ModernBudgetEnv, reservation: ModernReservation | null | undefined, micros = reservation?.micros ?? 0): Promise<void> {
  if (!reservation || !(micros >= 1)) return
  try { await monthObject(env, reservation.day)?.refund(reservation.day, Math.round(micros)) } catch { /* the month's count stays a little high */ }
}

/** What a paid book cost beyond its reservation: added to this month, never refused; logged when the month goes over. */
export async function chargeModernOverrun(env: ModernBudgetEnv, now: number, micros: number, bookId: string): Promise<void> {
  const amount = Math.round(micros)
  if (!(amount >= 1)) return
  const day = dayOf(now)
  const object = monthObject(env, day)
  if (!object) return
  try {
    const limit = modernMonthlyMicros(env)
    if (await object.reserve(day, amount, limit, limit)) return
    await object.reserve(day, amount, UNLIMITED, UNLIMITED)
    console.warn(JSON.stringify({ event: 'modern_edition_month_over', book: bookId, micros: amount, limitMicros: limit }))
  } catch {
    console.warn(JSON.stringify({ event: 'modern_edition_budget_unreachable', book: bookId, micros: amount }))
  }
}
