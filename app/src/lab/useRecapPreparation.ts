import { useEffect, useRef } from 'react'
import type { LabRecapRequest } from '../recapSummary'
import { sendRecapPreparation } from '../preReader/recapPreparationClient'

/** Observe the resolved reader only. Never owns or changes saved positions. */
export function useRecapPreparation(input: {
  userId: string | null
  ready: boolean
  request: LabRecapRequest
  readToken: () => Promise<string | null>
}): void {
  const observed = useRef(new Map<string, LabRecapRequest>())
  if (input.ready) observed.current.set(input.request.bookId,input.request)
  const client = useRef<string | null>(null)
  if (!client.current) client.current = crypto.randomUUID()
  const sequence = useRef(0)
  useEffect(() => {
    if (!input.userId || !input.ready || input.request.editionKey.endsWith('-da')) return
    let token: string | null = null, stopped = false
    const bookId = input.request.bookId
    let last = input.request
    const send = (active: boolean, keepalive = false) => {
      if (!token) return
      last = observed.current.get(bookId) ?? last
      void sendRecapPreparation({ kind:'presence', clientId:client.current!, sequence:++sequence.current, active, request:last },token,keepalive).catch(() => {})
    }
    const visible = () => send(document.visibilityState !== 'hidden', document.visibilityState === 'hidden')
    const leave = () => send(false,true)
    void input.readToken().then(value => {
      if (stopped) return
      token = value
      if (token) visible()
    }).catch(() => {})
    const timer = window.setInterval(() => { if (document.visibilityState !== 'hidden') send(true) },30_000)
    document.addEventListener('visibilitychange',visible)
    window.addEventListener('pagehide',leave)
    window.addEventListener('online',visible)
    return () => {
      stopped=true; window.clearInterval(timer)
      document.removeEventListener('visibilitychange',visible)
      window.removeEventListener('pagehide',leave)
      window.removeEventListener('online',visible)
      send(false,true)
    }
  },[input.userId,input.ready,input.request.bookId,input.request.editionKey])
}
