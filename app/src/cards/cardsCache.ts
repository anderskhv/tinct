/**
 * The last profile and figures the account cards showed, kept on this device
 * so the You card paints at once with the reader's own name and numbers
 * (then refreshes from the endpoints). One entry per account, under a
 * `tinct:` key, so sign-out's clearLocalUserData removes it with the rest of
 * the reader's data on this device. Never read for another account.
 */
import type { AiAllowance } from '../lab/labAiAllowance'
import type { OwnProfile } from '../social/socialClient'
import type { ReadingLoad } from './cardsApi'
import { isPlan, type Plan } from './planLabel'

export const CARDS_CACHE_PREFIX = 'tinct:account-cards:'
// 2: the allowance joined the cache (11 Oct 2026); older entries are dropped rather than trusted.
const VERSION = 2

export interface CardsCache {
  profile: OwnProfile | null
  reading: ReadingLoad | null
  rank: string | null
  plan: Plan | null
  billing: boolean
  /** The AI credits as last shown, so the credits rows paint with the card (they arrived a second late, 11 Oct 2026). */
  allowance?: AiAllowance | null
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
      plan: isPlan(data.plan) ? data.plan : null,
      billing: data.billing === true,
      allowance: data.allowance && typeof data.allowance.usedFraction === 'number' && Array.isArray(data.allowance.topUps)
        // Cached before hasAllowance existed: a period with no reset date has no allowance (labAiAllowance.parseAiAllowance).
        ? { ...data.allowance, hasAllowance: typeof data.allowance.hasAllowance === 'boolean' ? data.allowance.hasAllowance : Boolean(data.allowance.resetsAt) }
        : null,
    }
  } catch {
    return null
  }
}

/** Forget this account's cached cards (a cache the cards could not paint from is dropped, not kept). */
export function clearCardsCache(userId: string | null): void {
  if (!userId) return
  try { storage()?.removeItem(CARDS_CACHE_PREFIX + userId) } catch { /* nothing to drop */ }
}

export function writeCardsCache(userId: string | null, data: CardsCache): void {
  if (!userId) return
  try {
    storage()?.setItem(CARDS_CACHE_PREFIX + userId, JSON.stringify({
      v: VERSION, userId, profile: data.profile, reading: data.reading, rank: data.rank, plan: data.plan, billing: data.billing, allowance: data.allowance ?? null,
    }))
  } catch { /* full or blocked: the cards just load as before */ }
}
