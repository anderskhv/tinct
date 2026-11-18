import { useEffect, useRef } from 'react'
import type { LabRecapRequest } from '../recapSummary'
import { sendRecapPreparation } from '../preReader/recapPreparationClient'
import { RECAP_PRESENCE_LEASE_MS } from '../recapPreparation'

// Presence tells the account's recap coordinator "this book is open here", so
// it defers preparing that book's recap until the reader has left for
// RECAP_PREPARATION_DELAY_MS (5 min). Each call costs a Supabase auth check, so
// send it only when something changed (mount, book, chapter, becoming visible,
// playback start) plus a heartbeat. The heartbeat (4 min) stays a minute under
// both the 5 min preparation delay and the 5 min server lease, so a heartbeat
// that fires a little late never lets the coordinator prepare (and pay for) a
// recap of a book that is still being read. Was: every 30 s with a 90 s lease.
export const RECAP_PRESENCE_HEARTBEAT_MS = RECAP_PRESENCE_LEASE_MS - 60_000

/** Observe the resolved reader only. Never owns or changes saved positions. */
export function useRecapPreparation(input: {
  userId: string | null
  ready: boolean
  playing?: boolean
  request: LabRecapRequest
  readToken: () => Promise<string | null>
}): void {
  const playing = useRef(input.playing); playing.current = input.playing
  const observed = useRef(new Map<string, LabRecapRequest>())
  if (input.ready) observed.current.set(input.request.bookId,input.request)
  const client = useRef<string | null>(null)
  if (!client.current) client.current = crypto.randomUUID()
  const sequence = useRef(0)
  const renew = useRef<(() => void) | null>(null)
  useEffect(() => {
    if (!input.userId || !input.ready || input.request.editionKey.endsWith('-da')) return
    let token: string | null = null, stopped = false, timer = 0
    const bookId = input.request.bookId
    let last = input.request
    const active = () => document.visibilityState !== 'hidden' || playing.current === true
    const send = (isActive: boolean, keepalive = false) => {
      if (!token) return
      last = observed.current.get(bookId) ?? last
      void sendRecapPreparation({ kind:'presence', clientId:client.current!, sequence:++sequence.current, active:isActive, request:last },token,keepalive).catch(() => {})
    }
    // Long reading sessions outlive access tokens. Refresh the token before
    // renewing presence so the selected book never looks abandoned on expiry.
    const refreshPresence = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => { if (active()) refreshPresence() }, RECAP_PRESENCE_HEARTBEAT_MS)
      void input.readToken().then(value => {
        if (stopped) return
        token = value
        if (token) send(active(), document.visibilityState === 'hidden')
      }).catch(() => {})
    }
    // Hiding must report synchronously (keepalive) with the token in hand.
    const visible = () => document.visibilityState === 'hidden' ? send(active(),true) : refreshPresence()
    const leave = () => send(false,true)
    renew.current = () => { if (!stopped && active()) refreshPresence() }
    refreshPresence()
    document.addEventListener('visibilitychange',visible)
    window.addEventListener('pagehide',leave)
    window.addEventListener('online',visible)
    return () => {
      stopped=true; renew.current=null; window.clearTimeout(timer)
      document.removeEventListener('visibilitychange',visible)
      window.removeEventListener('pagehide',leave)
      window.removeEventListener('online',visible)
      send(false,true)
    }
  },[input.userId,input.ready,input.request.bookId,input.request.editionKey])
  // Chapter change and playback start renew at once; the effect above already
  // covers mount, book and edition changes.
  const chapter = input.request.chapterNumber
  const isFirst = useRef(true)
  useEffect(() => { if (isFirst.current) { isFirst.current = false; return } renew.current?.() },[chapter])
  useEffect(() => { if (input.playing) renew.current?.() },[input.playing])
}
