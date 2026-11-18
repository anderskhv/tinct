import { useEffect, useRef } from 'react'
import { getFunnelToken } from '../utils/funnel'
import { createListenReporter } from '../utils/usageReport'

const TICK_SECONDS = 5

/**
 * Reports narration listening time to the cost ledger in batches of about
 * five minutes (and on stop, hide and pagehide), so the dashboard shows who
 * listens even when every recording came from cache. Metadata only: a book
 * id and a number of seconds.
 */
export function useLabListenReport(playing: boolean, bookId: string): void {
  const reporter = useRef<ReturnType<typeof createListenReporter> | null>(null)
  if (!reporter.current) reporter.current = createListenReporter(getFunnelToken)
  const bookRef = useRef(bookId)
  bookRef.current = bookId

  useEffect(() => {
    const active = reporter.current!
    if (!playing) { active.flush(); return }
    const timer = setInterval(() => active.tick(bookRef.current, TICK_SECONDS), TICK_SECONDS * 1000)
    const onHide = () => active.flush()
    const onVisibility = () => { if (document.visibilityState === 'hidden') active.flush() }
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(timer)
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onVisibility)
      active.flush()
    }
  }, [playing])
}
