/**
 * The last profile and figures the account cards showed, kept on this device
 * so the You card paints at once with the reader's own name and numbers
 * (then refreshes from the endpoints). One entry per account, under a
 * `tinct:` key, so sign-out's clearLocalUserData removes it with the rest of
 * the reader's data on this device. Never read for another account.
 */
import type { OwnProfile } from '../social/socialClient'
import type { ReadingLoad } from './cardsApi'

export const CARDS_CACHE_PREFIX = 'tinct:account-cards:'
const VERSION = 1

export interface CardsCache {
  profile: OwnProfile | null
  reading: ReadingLoad | null
  rank: string | null
  plan: 'premium' | 'free' | null
  billing: boolean
}

function storage(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null }
}

export function readCardsCache(userId: string | null): CardsCache | null {
  if (!userId) return null
  try {
    const raw = storage()?.getItem(CARDS_CACHE_PREFIX + userId)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<CardsCache> & { v?: number; userId?: string }
    if (data.v !== VERSION || data.userId !== userId) return null
    const profile = data.profile && typeof data.profile.name === 'string' && typeof data.profile.handle === 'string' ? data.profile : null
    const reading = data.reading && data.reading.stats && Array.isArray(data.reading.readingNow) && Array.isArray(data.reading.finished) ? data.reading : null
    return {
      profile,
      reading,
      rank: typeof data.rank === 'string' ? data.rank : null,
      plan: data.plan === 'premium' || data.plan === 'free' ? data.plan : null,
      billing: data.billing === true,
    }
  } catch {
    return null
  }
}

export function writeCardsCache(userId: string | null, data: CardsCache): void {
  if (!userId) return
  try {
    storage()?.setItem(CARDS_CACHE_PREFIX + userId, JSON.stringify({
      v: VERSION, userId, profile: data.profile, reading: data.reading, rank: data.rank, plan: data.plan, billing: data.billing,
    }))
  } catch { /* full or blocked: the cards just load as before */ }
}
