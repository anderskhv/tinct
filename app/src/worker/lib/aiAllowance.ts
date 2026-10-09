/**
 * AI allowance: Premium (and the 30-day trial) includes a monthly allowance
 * measured in real AI cost, plus top-up credit that carries over (Anders,
 * 2026-10-05). Readers never see a currency: the Worker sends only the
 * fraction used, a state and the reset time.
 *
 * Spend is the cost ledger (ai_usage_events, see aiUsage.ts) summed since the
 * period start, narration and dictation excluded. Top-up credit is drawn only by spend beyond
 * the period's allowance; the database settles that atomically
 * (ai_allowance_settle in app/supabase/migrations/20261005_ai_allowance.sql).
 *
 * At zero, the reader keeps reading and listening; only the paid AI features
 * stop. Explain and Define are never blocked, but their cost counts.
 */
import { AI_ALLOWANCE_ENFORCED } from '../../aiAllowanceSwitch'
import type { AiFeature } from './aiUsage'
import { supabaseGet, supabaseRpc, type SupabaseEnv } from './supabase'

/**
 * Master switch, defined once in src/aiAllowanceSwitch.ts (shared with the
 * reader bundle and the build scripts). Off: nothing is gated, nothing extra
 * is read or written, and the client shows no usage bar. The migrations
 * 20261005_ai_allowance.sql (run by Anders) and
 * 20261007_ai_allowance_never_charged.sql must have run before it is turned on.
 */
export { AI_ALLOWANCE_ENFORCED }

/**
 * Monthly AI allowance for Premium (monthly and yearly plans) and the trial,
 * in US dollars of our real AI cost. Approved by Anders, 2026-10-06.
 */
export const PREMIUM_AI_ALLOWANCE_USD = 3.00

/**
 * The top-ups on sale: checkout type -> price and AI credit, in US dollars.
 * Approved by Anders, 2026-10-06: the $5 pack gives $3.50, the $10 pack $7.50.
 * `chat_pack_200` is the existing $5 Stripe price (STRIPE_PRICE_CHAT_200);
 * `top_up_10` is the $10 price (STRIPE_PRICE_TOP_UP_10, or STRIPE_PRICE_TOPUP_10), offered only once
 * that secret is set. The $3 `chat_pack_100` is no longer sold.
 */
export const TOP_UPS = Object.freeze({
  chat_pack_200: Object.freeze({ priceCents: 500, creditUsd: 3.50 }),
  top_up_10: Object.freeze({ priceCents: 1000, creditUsd: 7.50 }),
})

export type TopUpType = keyof typeof TOP_UPS

/** Top-ups in the order the usage bar offers them. */
export const TOP_UP_TYPES: readonly TopUpType[] = Object.freeze(['chat_pack_200', 'top_up_10'] as const)

/** Credit per checkout type, in US dollars of AI cost. */
export const TOP_UP_CREDIT_USD: Readonly<Record<TopUpType, number>> = Object.freeze({
  chat_pack_200: TOP_UPS.chat_pack_200.creditUsd,
  top_up_10: TOP_UPS.top_up_10.creditUsd,
})

export function isTopUpType(type: unknown): type is TopUpType {
  return typeof type === 'string' && Object.prototype.hasOwnProperty.call(TOP_UPS, type)
}

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
  return isTopUpType(type) ? usdToMicros(TOP_UP_CREDIT_USD[type]) : null
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

/**
 * The window of whole calendar months counted from `anchor`, backwards or
 * forwards, that contains `now`. Every boundary is computed from the anchor
 * itself, so a day clamped in a short month never drifts the next one.
 */
export function monthWindowAround(anchor: Date, now: Date): { start: Date; end: Date } {
  let months = (now.getUTCFullYear() - anchor.getUTCFullYear()) * 12 + (now.getUTCMonth() - anchor.getUTCMonth())
  if (addMonthsUtc(anchor, months).getTime() > now.getTime()) months -= 1
  else if (addMonthsUtc(anchor, months + 1).getTime() <= now.getTime()) months += 1
  return { start: addMonthsUtc(anchor, months), end: addMonthsUtc(anchor, months + 1) }
}

/** The monthly window, anchored at `anchor`, that contains `now` (the first one while `now` is before it). */
function monthlyWindow(anchor: Date, now: Date): { start: Date; end: Date } {
  if (now.getTime() < anchor.getTime()) return { start: anchor, end: addMonthsUtc(anchor, 1) }
  return monthWindowAround(anchor, now)
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
 * Premium features that are not AI, such as adding books (a catalogue import or
 * an own PDF/EPUB upload; Anders, 2026-10-07): subscribed, or within the
 * account's 30-day trial. Books already added stay readable regardless.
 */
export function hasPremiumAccess(profile: AllowanceProfile, now: Date): boolean {
  if (isSubscribed(profile, now)) return true
  const end = trialEndsAt(profile)
  return !!end && now.getTime() < end.getTime()
}

/** `hasPremiumAccess` for an account, from its profile; null when the profile cannot be read. Never throws. */
export async function loadPremiumAccess(env: SupabaseEnv, userId: string, now: Date = new Date()): Promise<boolean | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null
  try {
    const res = await supabaseGet(env, `profiles?id=eq.${userId}&select=subscription_status,subscription_period_end,created_at`)
    if (!res.ok) return null
    const profile = ((await res.json()) as AllowanceProfile[])?.[0]
    return profile ? hasPremiumAccess(profile, now) : null
  } catch {
    return null
  }
}

/**
 * Which kind of Premium access an account has: a paid subscription, the
 * 30-day trial (and not subscribed), or none. Features with a smaller trial
 * ceiling (OCR of scanned PDFs: lib/ownOcr.ts) tell the two apart with it.
 */
export type PremiumTier = 'premium' | 'trial' | 'none'

export function premiumTier(profile: AllowanceProfile, now: Date): PremiumTier {
  if (isSubscribed(profile, now)) return 'premium'
  const end = trialEndsAt(profile)
  return end && now.getTime() < end.getTime() ? 'trial' : 'none'
}

/** `premiumTier` for an account, from its profile; null when the profile cannot be read. Never throws. */
export async function loadPremiumTier(env: SupabaseEnv, userId: string, now: Date = new Date()): Promise<PremiumTier | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null
  try {
    const res = await supabaseGet(env, `profiles?id=eq.${userId}&select=subscription_status,subscription_period_end,created_at`)
    if (!res.ok) return null
    const profile = ((await res.json()) as AllowanceProfile[])?.[0]
    return profile ? premiumTier(profile, now) : null
  } catch {
    return null
  }
}

/**
 * The reader's current billing period and its allowance.
 *  - Subscription, monthly or yearly: the calendar month, counted from
 *    Stripe's period end, that contains now. Stripe keeps the period end on
 *    the subscription's start day and time, so this is a monthly reset
 *    anchored to the subscription start: for a monthly plan it is exactly
 *    the billing period, and a yearly plan resets every month (Anders,
 *    2026-10-06) instead of once a year. An active subscription whose stored
 *    end has passed (a missed webhook) keeps rolling forward month by month.
 *  - Trial (the first 30 days of an account): one window from created_at, so a
 *    trial never spans two allowances.
 *  - Standard: monthly windows from the trial's end, with no allowance; only
 *    top-up credit can pay for paid features.
 */
export function billingPeriod(profile: AllowanceProfile, now: Date, allowanceUsd = PREMIUM_AI_ALLOWANCE_USD): AllowancePeriod {
  const allowanceMicros = usdToMicros(allowanceUsd)
  const periodEnd = validDate(profile.subscription_period_end)
  if (isSubscribed(profile, now)) {
    if (periodEnd) return { kind: 'subscription', ...monthWindowAround(periodEnd, now), allowanceMicros }
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
  /** This period's allowance alone: min(spend, allowance) / allowance (1 when there is no allowance). */
  monthUsedFraction: number
  /** The top-up credit left of the credit there was this period (left + drawn); null when there was none. */
  topUpLeftFraction: number | null
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
  const round = (value: number) => Math.round(value * 1000) / 1000
  const topUpTotal = credit + drawn
  return {
    usedFraction: round(usedFraction),
    monthUsedFraction: allowance > 0 ? round(Math.min(spend, allowance) / allowance) : 1,
    topUpLeftFraction: topUpTotal > 0 ? round(credit / topUpTotal) : null,
    state,
    resetsAt: resetsAt ? resetsAt.toISOString() : null,
    hasTopUp: credit > 0,
  }
}

// ===== Gate =====

/**
 * Chat dictation (xAI speech-to-text), metered as 'dictation' once that
 * branch lands; named here so it is never gated or charged.
 */
export type GatedAiFeature = AiFeature | 'dictation'

/**
 * Never charged (Anders, 2026-10-06): their cost stays out of the allowance.
 * Narration (generating and listening), chat dictation and recognising the
 * text of a scanned own PDF ('ocr', which has its own page and dollar
 * ceilings: lib/ownOcr.ts). The SQL spend sum excludes exactly these
 * (ai_spend_micros in 20261009_ai_usage_ocr.sql; a test keeps the two equal).
 */
export const NEVER_CHARGED_AI_FEATURES: readonly GatedAiFeature[] = Object.freeze(['narration_listen', 'narration_generate', 'dictation', 'ocr'] as const)

/**
 * Never blocked: the never-charged features, plus Explain and Define (metered
 * as 'explain'), whose cost still counts toward the bar.
 */
const FREE_AI_FEATURES: ReadonlySet<GatedAiFeature> = new Set<GatedAiFeature>(['explain', ...NEVER_CHARGED_AI_FEATURES])

export function isPaidAiFeature(feature: GatedAiFeature): boolean {
  return !FREE_AI_FEATURES.has(feature)
}

/**
 * Switch off: always allowed. On: paid features are refused at zero. An
 * unreadable allowance (null) fails open, like the message model did.
 */
export function allowsAiFeature(enforced: boolean, feature: GatedAiFeature, view: AllowanceView | null): boolean {
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
