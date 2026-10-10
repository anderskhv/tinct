/**
 * The Premium choice on the account page (/sign-in?mode=account): monthly or
 * yearly. The page names only the interval; the Worker maps it to its own
 * Stripe price (STRIPE_PRICE_PREMIUM / STRIPE_PRICE_PREMIUM_YEARLY) and says
 * which intervals are on sale in /api/subscription-info `intervals`. A plan
 * the Worker does not list is not shown.
 */
import { readAttributionPayload } from '../utils/attribution'

export type PremiumInterval = 'month' | 'year'

export type SubscriptionInfo = {
  subscription_status?: string | null
  subscription_period_end?: string | null
  intervals?: unknown
  /** The Stripe subscription, when the account has one (null for Premium by grant). */
  stripe?: { status?: string } | null
}

/**
 * The intervals to offer this reader, or none. A reader who is paying (or
 * whose cancelled plan still runs, or whose payment is being retried) is not
 * offered a second subscription; they manage the one they have.
 */
export function premiumOfferIntervals(info: SubscriptionInfo | null, now = Date.now()): PremiumInterval[] {
  if (!info) return []
  const status = info.subscription_status ?? null
  if (status === 'active' || status === 'trialing' || status === 'past_due') return []
  if (status === 'canceled' && info.subscription_period_end && new Date(info.subscription_period_end).getTime() > now) return []
  const listed = Array.isArray(info.intervals) ? info.intervals : []
  return (['month', 'year'] as const).filter(interval => listed.includes(interval))
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export async function fetchSubscriptionInfo(token: string, fetchImpl: FetchLike = fetch): Promise<SubscriptionInfo | null> {
  try {
    const response = await fetchImpl('/api/subscription-info', { headers: { Authorization: `Bearer ${token}` } })
    if (!response.ok) return null
    return await response.json() as SubscriptionInfo
  } catch {
    return null
  }
}

/** Starts Stripe Checkout for the chosen interval; resolves to the Checkout URL. */
export async function startPremiumCheckout(token: string, interval: PremiumInterval, fetchImpl: FetchLike = fetch): Promise<string> {
  const response = await fetchImpl('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ type: 'subscription', interval, attribution: readAttributionPayload() }),
  })
  const data = await response.json().catch(() => ({})) as { url?: unknown }
  if (!response.ok || typeof data.url !== 'string' || !data.url.startsWith('https://')) throw new Error('checkout')
  return data.url
}
