/**
 * The reader's follow-request dot (followRequests.ts) for the menu's Profile
 * row: read once, a few seconds after the reader opens (never in front of the
 * book's own loading), and cleared as soon as the You card or Following you
 * shows the requests.
 */
import { useEffect, useRef, useState } from 'react'
import { fetchFollowRequests, socialFriendsOn } from './friendsClient'
import { FOLLOW_REQUESTS_SEEN_EVENT, requestDotDue, type RequestRow } from './followRequests'

/** How long after the reader opens the requests are asked for. */
export const REQUEST_DOT_DELAY_MS = 4000

export function useFollowRequestDot(userId: string | null, getToken: () => Promise<string | null>, delayMs = REQUEST_DOT_DELAY_MS): boolean {
  const [due, setDue] = useState(false)
  const tokenRef = useRef(getToken)
  tokenRef.current = getToken
  useEffect(() => {
    setDue(false)
    if (!userId || !socialFriendsOn()) return
    let live = true
    let rows: RequestRow[] = []
    const paint = () => { if (live) setDue(requestDotDue(userId, rows)) }
    const timer = window.setTimeout(() => {
      void tokenRef.current().then(token => token ? fetchFollowRequests(token) : null).then(found => {
        rows = found?.followingYou ?? []
        paint()
      }).catch(() => {})
    }, delayMs)
    window.addEventListener(FOLLOW_REQUESTS_SEEN_EVENT, paint)
    return () => { live = false; window.clearTimeout(timer); window.removeEventListener(FOLLOW_REQUESTS_SEEN_EVENT, paint) }
  }, [userId, delayMs])
  return due
}
