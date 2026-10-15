/**
 * Warm the account cards while the reader is idle, so a tap on the picture
 * opens on this device's fresh figures instead of last time's (the cards
 * paint from the device cache first and refresh behind; a first open on a
 * device had nothing to paint). The same reads the cards make on open,
 * written to the same cache (cardsCache.ts): the reader's own profile,
 * reading figures, leaderboard rank, plan, AI credits. Nothing new is collected or kept.
 *
 * Only with a stored session whose token is still good (never a token
 * refresh), only when the network is spare, and only once the reader has
 * settled (whenReaderSettled). Low priority: one round, no retries.
 */
import { fetchAiAllowance } from '../lab/labAiAllowance'
import { fetchSubscriptionInfo } from '../lab/labPremiumOffer'
import { socialFriendsOn } from '../social/friendsClient'
import { currentBookHint } from '../social/socialClient'
import { networkSpare, whenReaderSettled } from '../utils/libraryPreviewWarmup'
import { fetchOwnProfile, loadReading } from './cardsApi'
import { loadDefaultBoard } from './boardMemory'
import { readCardsCache, writeCardsCache } from './cardsCache'
import { rankOf } from './cardsFormat'
import { storedSession } from './cardsBoot'

export function warmAccountCards(): void {
  if (!networkSpare()) return
  let stopped = false
  // Ends at navigation start (beforeunload), before WebKit refuses new requests (see libraryPreviewWarmup).
  const stop = () => { stopped = true }
  window.addEventListener('beforeunload', stop, { once: true })
  window.addEventListener('pagehide', stop, { once: true })
  whenReaderSettled(() => {
    const stored = storedSession()
    if (!stored?.fresh || stopped) return
    const { token, userId } = stored.session
    const social = socialFriendsOn()
    void Promise.all([
      fetchOwnProfile(token, currentBookHint()).catch(() => null),
      loadReading(token, userId).catch(() => null),
      // Kept in memory for the Leaderboard card (boardMemory.ts), never in the device cache.
      social ? loadDefaultBoard(token, userId) : Promise.resolve(null),
      fetchSubscriptionInfo(token).catch(() => null),
      fetchAiAllowance(token).catch(() => null),
    ]).then(([profile, reading, board, info, allowance]) => {
      if (stopped) return
      const known = readCardsCache(userId)
      const me = board ? (board.entries.find(entry => entry.me) ?? board.me) : null
      const status = info?.subscription_status ?? null
      const paying = Boolean(info) && (status === 'active' || status === 'trialing' || status === 'past_due'
        || (status === 'canceled' && Boolean(info!.subscription_period_end) && new Date(info!.subscription_period_end!).getTime() > Date.now()))
      writeCardsCache(userId, {
        profile: profile?.ok ? profile.profile : known?.profile ?? null,
        reading: reading ?? known?.reading ?? null,
        rank: board ? rankOf(me?.rank, board.total) : known?.rank ?? null,
        plan: info ? (paying ? 'premium' : 'free') : known?.plan ?? null,
        billing: info ? Boolean(info.stripe) : known?.billing ?? false,
        allowance: allowance ?? known?.allowance ?? null,
      })
    })
  }, () => stopped)
}
