/**
 * The reader's Profile sheet and social ship 3: "#3 among friends" in the
 * Last 7 days facts line, and the Leaderboard row. Null (nothing shown, no
 * request) while SOCIAL_FRIENDS is off, signed out, or the board is unavailable.
 */
import { useEffect, useState } from 'react'
import { fetchRank, socialFriendsOn } from './friendsClient'
import { amongFriendsLine } from './socialRules'

export interface FriendsRank { line: string | null; leaderboardHref: string }

export function friendsUrl(returnTo?: string | null): string {
  const back = returnTo && returnTo.startsWith('/reader') ? returnTo : '/reader'
  return `/friends?returnTo=${encodeURIComponent(back)}`
}

export function useFriendsRank(token: string | null, active: boolean, returnTo?: string | null): FriendsRank | null {
  const [rank, setRank] = useState<FriendsRank | null>(null)
  useEffect(() => {
    if (!active || !token || !socialFriendsOn()) return
    let live = true
    void fetchRank(token).then(result => {
      if (live) setRank({ line: result ? amongFriendsLine(result.rank, result.total) : null, leaderboardHref: friendsUrl(returnTo) })
    })
    return () => { live = false }
  }, [token, active, returnTo])
  return token && socialFriendsOn() ? rank : null
}
