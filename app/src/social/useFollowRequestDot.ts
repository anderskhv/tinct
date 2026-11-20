/**
 * The reader's follow requests (followRequests.ts) for the t button's dot, the
 * menu's Profile row dot and the menu's request row: read once, a few seconds
 * after the reader opens (never in front of the book's own loading), and the
 * dot cleared as soon as the menu row, the You card or Following you shows the
 * requests.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchFollowRequests, socialFriendsOn, type FindRow } from './friendsClient'
import { FOLLOW_REQUESTS_SEEN_EVENT, requestDotDue, withRelation, type RequestRow } from './followRequests'

/** How long after the reader opens the requests are asked for. */
export const REQUEST_DOT_DELAY_MS = 4000

export interface FollowRequestsState {
  /** A request this device has not shown yet: the dot shows. */
  due: boolean
  /** Following you as the Worker listed it (empty until read, signed out or with Friends off). */
  rows: FindRow[]
  /** A follow back answered: that reader's relation, so they no longer wait. */
  settle: (handle: string, relation: RequestRow['relation']) => void
}

export function useFollowRequests(userId: string | null, getToken: () => Promise<string | null>, delayMs = REQUEST_DOT_DELAY_MS): FollowRequestsState {
  const [due, setDue] = useState(false)
  const [rows, setRows] = useState<FindRow[]>([])
  const rowsRef = useRef<FindRow[]>([])
  const tokenRef = useRef(getToken)
  tokenRef.current = getToken
  const userRef = useRef(userId)
  userRef.current = userId
  useEffect(() => {
    setDue(false)
    setRows([])
    rowsRef.current = []
    if (!userId || !socialFriendsOn()) return
    let live = true
    const paint = () => { if (live) setDue(requestDotDue(userId, rowsRef.current)) }
    const timer = window.setTimeout(() => {
      void tokenRef.current().then(token => token ? fetchFollowRequests(token) : null).then(found => {
        if (!live) return
        rowsRef.current = found?.followingYou ?? []
        setRows(rowsRef.current)
        paint()
      }).catch(() => {})
    }, delayMs)
    window.addEventListener(FOLLOW_REQUESTS_SEEN_EVENT, paint)
    return () => { live = false; window.clearTimeout(timer); window.removeEventListener(FOLLOW_REQUESTS_SEEN_EVENT, paint) }
  }, [userId, delayMs])
  const settle = useCallback((handle: string, relation: RequestRow['relation']) => {
    rowsRef.current = withRelation(rowsRef.current, handle, relation)
    setRows(rowsRef.current)
    setDue(requestDotDue(userRef.current, rowsRef.current))
  }, [])
  return { due, rows, settle }
}

/** The dot alone (the menu's Profile row). */
export function useFollowRequestDot(userId: string | null, getToken: () => Promise<string | null>, delayMs = REQUEST_DOT_DELAY_MS): boolean {
  return useFollowRequests(userId, getToken, delayMs).due
}
