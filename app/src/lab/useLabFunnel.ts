import { useEffect, useRef } from 'react'
import { funnel, setFunnelDeviceId, setFunnelToken, trackFunnel } from '../utils/funnel'
import { readLabDeviceId } from './labPositionStore'
import { readSupabaseAccessToken } from './labAuth'

/**
 * Reader funnel wiring: the pageview and visible-time durations for /reader,
 * the signed-in account for the Worker, and one `book_opened` per book per
 * page load once its text is on screen. All fire-and-forget (see utils/funnel).
 */
export function useLabFunnel(input: { bookId: string; ready: boolean; signedIn: boolean; authToken?: string | null }): void {
  const { bookId, ready, signedIn, authToken } = input
  const opened = useRef(new Set<string>())

  useEffect(() => {
    setFunnelDeviceId(readLabDeviceId)
    funnel().start()
    return () => funnel().stop()
  }, [])

  useEffect(() => {
    let cancelled = false
    if (authToken !== undefined) { setFunnelToken(authToken); return }
    void readSupabaseAccessToken().then(token => { if (!cancelled) setFunnelToken(token) }).catch(() => {})
    return () => { cancelled = true }
  }, [authToken, signedIn])

  useEffect(() => {
    if (!ready || !bookId || opened.current.has(bookId)) return
    opened.current.add(bookId)
    trackFunnel('book_opened', { book_id: bookId, signed_in: signedIn })
  }, [bookId, ready, signedIn])
}
