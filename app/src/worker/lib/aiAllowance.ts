/**
 * AI allowance: Premium (and the 30-day trial) includes a monthly allowance
 * measured in real AI cost, plus top-up credit that carries over (Anders,
 * 2026-10-05). Readers never see a currency: the Worker sends only the
 * fraction used, a state and the reset time.
 *
 * Spend is the cost ledger (ai_usage_events, see aiUsage.ts) summed since the
 * period start, narration excluded. Top-up credit is drawn only by spend beyond
 * the period's allowance; the database settles that atomically
 * (ai_allowance_settle in app/supabase/migrations/20261005_ai_allowance.sql).
 *
 * At zero, the reader keeps reading and listening; only the paid AI features
 * stop. Explain and Define are never blocked, but their cost counts.
 */
import type { AiFeature } from './aiUsage'
import { supabaseGet, supabaseRpc, type SupabaseEnv } from './supabase'

/**
 * Master switch. Off: nothing is gated, nothing extra is read or written, and
 * the client shows no usage bar. Anders runs the migration
 * (20261005_ai_allowance.sql) before turning it on.
 */
export const AI_ALLOWANCE_ENFORCED = false

/**
 * Monthly AI allowance for Premium and the trial, in US dollars of our real AI
 * cost ("at cost after VAT and Stripe" on the $5 plan).
 * AWAITS ANDERS'S CONFIRMATION of the amount.
 */
export const PREMIUM_AI_ALLOWANCE_USD = 3.00

/**
 * Top-up credit per chat-pack checkout type, in US dollars of AI cost.
 * Placeholders ≈ the pack price after VAT and Stripe fees.
 * AWAITS ANDERS'S CONFIRMATION of both amounts.
 */
export const TOP_UP_CREDIT_USD: Readonly<Record<'chat_pack_100' | 'chat_pack_200', number>> = Object.freeze({
  chat_pack_100: 2.10,
  chat_pack_200: 3.50,
})

export type TopUpType = keyof typeof TOP_UP_CREDIT_USD

export const TRIAL_DAYS = 30
/** At or above this fraction used, the bar reads "low". */
export const ALLOWANCE_LOW_FRACTION = 0.8

/** The body of every refusal for a paid feature at zero (HTTP 402). */
export const ALLOWANCE_USED_ERROR = 'allowance_used'
export const allowanceUsedBody = () => ({ error: ALLOWANCE_USED_ERROR })

const MICROS_PER_USD = 1_000_000
const DAY_MS = 86_400_000

export function usdToMicros(usd: number): number {
  return Math.round(Math.max(0, usd) * MICROS_PER_USD)
}

export function topUpCreditMicros(type: unknown): number | null {
  return typeof type === 'string' && Object.prototype.hasOwnProperty.call(TOP_UP_CREDIT_USD, type)
    ? usdToMicros(TOP_UP_CREDIT_USD[type as TopUpType])
    : null
}

// ===== Period math =====

export interface AllowanceProfile {
  subscription_status: string | null
  subscription_period_end: string | null
  created_at: string | null
}

export type PeriodKind = 'subscription' | 'trial' | 'standard'

export interface AllowancePeriod {
  kind: PeriodKind
  start: Date
  end: Date
  allowanceMicros: number
}

const validDate = (value: string | null | undefined): Date | null => {
  if (!value) return null
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date : null
}

/** Calendar months in UTC; a day past the target month's end clamps to its last day (Jan 31 + 1 = Feb 28/29). */
export function addMonthsUtc(date: Date, months: number): Date {
  const result = new Date(date.getTime())
  const day = result.getUTCDate()
  result.setUTCDate(1)
  result.setUTCMonth(result.getUTCMonth() + months)
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate()
  result.setUTCDate(Math.min(day, lastDay))
  return result
}

/** The monthly window, anchored at `anchor`, that contains `now`. */
function monthlyWindow(anchor: Date, now: Date): { start: Date; end: Date } {
  if (now.getTime() < anchor.getTime()) return { start: anchor, end: addMonthsUtc(anchor, 1) }
  let months = (now.getUTCFullYear() - anchor.getUTCFullYear()) * 12 + (now.getUTCMonth() - anchor.getUTCMonth())
  if (addMonthsUtc(anchor, months).getTime() > now.getTime()) months -= 1
  return { start: addMonthsUtc(anchor, months), end: addMonthsUtc(anchor, months + 1) }
}

/**
 * Subscribed = active, or canceled but paid through a period that has not
 * ended. Other statuses (past_due, unpaid) are standard accounts, as before.
 */
export function isSubscribed(profile: AllowanceProfile, now: Date): boolean {
  if (profile.subscription_status === 'active') return true
  const end = validDate(profile.subscription_period_end)
  return profile.subscription_status === 'canceled' && !!end && end.getTime() > now.getTime()
}

export function trialEndsAt(profile: AllowanceProfile): Date | null {
  const created = validDate(profile.created_at)
  return created ? new Date(created.getTime() + TRIAL_DAYS * DAY_MS) : null
}

/**
 * The reader's current billing period and its allowance.
 *  - Subscription: Stripe's period end minus one month, to that end. An
 *    active subscription whose stored end has passed (a missed webhook) rolls
 *    forward month by month.
 *  - Trial (the first 30 days of an account): one window from created_at, so a
 *    trial never spans two allowances.
 *  - Standard: monthly windows from the trial's end, with no allowance; only
 *    top-up credit can pay for paid features.
 */
export function billingPeriod(profile: AllowanceProfile, now: Date, allowanceUsd = PREMIUM_AI_ALLOWANCE_USD): AllowancePeriod {
  const allowanceMicros = usdToMicros(allowanceUsd)
  const periodEnd = validDate(profile.subscription_period_end)
  if (isSubscribed(profile, now)) {
    if (periodEnd) {
      let end = periodEnd
      for (let guard = 0; end.getTime() <= now.getTime() && guard < 240; guard += 1) end = addMonthsUtc(end, 1)
      return { kind: 'subscription', start: addMonthsUtc(end, -1), end, allowanceMicros }
    }
    // Active with no known period end: calendar months from the account's creation.
    const anchor = validDate(profile.created_at) ?? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    return { kind: 'subscription', ...monthlyWindow(anchor, now), allowanceMicros }
  }
  const created = validDate(profile.created_at)
  const trialEnd = trialEndsAt(profile)
  if (created && trialEnd && now.getTime() < trialEnd.getTime()) {
    return { kind: 'trial', start: created, end: trialEnd, allowanceMicros }
  }
  const anchor = trialEnd ?? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  return { kind: 'standard', ...monthlyWindow(anchor, now), allowanceMicros: 0 }
}

// ===== State =====

export type AllowanceState = 'ok' | 'low' | 'used_up'

/** What the reader may see. No currency, no amounts. */
export interface AllowanceView {
  usedFraction: number
  state: AllowanceState
  /** When this period's allowance renews; null for a standard account, which has none. */
  resetsAt: string | null
  hasTopUp: boolean
}

export interface AllowanceLedger {
  allowanceMicros: number
  /** Spend this period (narration excluded). */
  spendMicros: number
  /** Top-up credit left after settlement. */
  creditMicros: number
  /** Top-up credit already drawn this period. */
  drawnMicros: number
}

const nonNegative = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0)

/**
 * The bar covers this period's allowance plus the credit drawn this period
 * and the credit still left. Settlement has already moved overflow from
 * credit to drawn, so what remains is the unused allowance plus the credit.
 */
export function allowanceView(ledger: AllowanceLedger, resetsAt: Date | null): AllowanceView {
  const allowance = nonNegative(ledger.allowanceMicros)
  const spend = nonNegative(ledger.spendMicros)
  const credit = nonNegative(ledger.creditMicros)
  const drawn = nonNegative(ledger.drawnMicros)
  const remaining = Math.max(0, allowance - spend) + credit
  const total = allowance + drawn + credit
  const usedFraction = total > 0 ? Math.min(1, Math.max(0, (total - remaining) / total)) : 1
  const state: AllowanceState = remaining <= 0 ? 'used_up' : usedFraction >= ALLOWANCE_LOW_FRACTION ? 'low' : 'ok'
  return {
    usedFraction: Math.round(usedFraction * 1000) / 1000,
    state,
    resetsAt: resetsAt ? resetsAt.toISOString() : null,
    hasTopUp: credit > 0,
  }
}

// ===== Gate =====

/**
 * Never blocked: Explain and Define (metered as 'explain') and narration.
 * Their cost still counts toward the bar (narration excepted).
 */
const FREE_AI_FEATURES: ReadonlySet<AiFeature> = new Set<AiFeature>(['explain', 'narration_generate', 'narration_listen'])

export function isPaidAiFeature(feature: AiFeature): boolean {
  return !FREE_AI_FEATURES.has(feature)
}

/**
 * Switch off: always allowed. On: paid features are refused at zero. An
 * unreadable allowance (null) fails open, like the message model did.
 */
export function allowsAiFeature(enforced: boolean, feature: AiFeature, view: AllowanceView | null): boolean {
  if (!enforced || !isPaidAiFeature(feature) || !view) return true
  return view.state !== 'used_up'
}

// ===== I/O =====

export interface AllowanceGate {
  readonly enforced: boolean
  /** The reader's settled allowance, or null when it cannot be read. Never throws. */
  load(userId: string): Promise<AllowanceView | null>
}

type SettleRow = { spend_micros: number | string; credit_micros: number | string; drawn_micros: number | string }

export async function loadAllowanceView(env: SupabaseEnv, userId: string, now: Date = new Date()): Promise<AllowanceView | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null
  try {
    const profileRes = await supabaseGet(env, `profiles?id=eq.${userId}&select=subscription_status,subscription_period_end,created_at`)
    if (!profileRes.ok) return null
    const profile = ((await profileRes.json()) as AllowanceProfile[])?.[0]
    if (!profile) return null
    const period = billingPeriod(profile, now)
    const settleRes = await supabaseRpc(env, 'ai_allowance_settle', {
      p_user: userId,
      p_period_start: period.start.toISOString(),
      p_allowance_micros: period.allowanceMicros,
    })
    if (!settleRes.ok) return null
    const row = ((await settleRes.json()) as SettleRow[])?.[0]
    if (!row) return null
    return allowanceView({
      allowanceMicros: period.allowanceMicros,
      spendMicros: Number(row.spend_micros),
      creditMicros: Number(row.credit_micros),
      drawnMicros: Number(row.drawn_micros),
    }, period.allowanceMicros > 0 ? period.end : null)
  } catch {
    return null
  }
}

export function createAllowanceGate(env: SupabaseEnv, enforced: boolean = AI_ALLOWANCE_ENFORCED): AllowanceGate {
  return {
    enforced,
    load: userId => (enforced ? loadAllowanceView(env, userId) : Promise.resolve(null)),
  }
}

/**
 * For routes that also serve signed-out readers (recap, chapter notes, Catch
 * me up): false only when the switch is on, the request carries a reader, and
 * that reader's allowance is used up. Signed-out readers stay under the daily
 * guest ceiling instead.
 */
export async function requestAllowsAiFeature(
  gate: AllowanceGate,
  resolveUser: ((request: Request) => Promise<string | null>) | undefined,
  request: Request,
  feature: AiFeature,
): Promise<boolean> {
  if (!gate.enforced || !isPaidAiFeature(feature) || !resolveUser) return true
  const userId = await resolveUser(request).catch(() => null)
  if (!userId) return true
  return allowsAiFeature(true, feature, await gate.load(userId))
}
