/**
 * The plan the cards show: Premium, Free, or Premium's first month free
 * (Anders, 22 Oct 2026): a new account's 30-day trial, or the first month
 * granted to existing readers. The Worker says until when the free month runs
 * (/api/subscription-info `free_month_until`, aiAllowance.ts freeMonthUntil).
 */
import { premiumOfferIntervals, type PremiumInterval, type SubscriptionInfo } from '../lab/labPremiumOffer'

export type Plan = 'premium' | 'free' | 'free_month'

export type PlanInfo = SubscriptionInfo & { free_month_until?: string | null }

export function isPlan(value: unknown): value is Plan {
  return value === 'premium' || value === 'free' || value === 'free_month'
}

export function planOf(info: PlanInfo, now = Date.now()): Plan {
  const until = info.free_month_until ? Date.parse(info.free_month_until) : NaN
  if (Number.isFinite(until) && until > now) return 'free_month'
  const status = info.subscription_status ?? null
  const paying = status === 'active' || status === 'trialing' || status === 'past_due'
    || (status === 'canceled' && Boolean(info.subscription_period_end) && new Date(info.subscription_period_end!).getTime() > now)
  return paying ? 'premium' : 'free'
}

/**
 * The plans offered on the Account card. The free month is not a paid plan,
 * so it offers them as a free account does: subscribing keeps Premium after it.
 */
export function planIntervals(info: PlanInfo, now = Date.now()): PremiumInterval[] {
  return premiumOfferIntervals(planOf(info, now) === 'free_month' ? { ...info, subscription_status: null } : info, now)
}
