/**
 * A deploy replaces the app's content-hashed files. A page opened before it
 * (or served by an edge that has not caught up) can ask for a file that is not
 * there, and the reader then stalls ("Loading contents…"). Instead: wait a
 * moment and reload once; the reading place is saved, so the reader comes back
 * where it was. At most twice per two minutes, so a real outage still shows.
 */
export const STALE_RELOAD_KEY = 'tinct:stale-reload'
export const STALE_RELOAD_DELAY_MS = 2500
const WINDOW_MS = 2 * 60_000
const MAX_RELOADS = 2

export function staleReloadAllowed(storage: Pick<Storage, 'getItem' | 'setItem'> | null, now: number): boolean {
  if (!storage) return false
  let recent: number[] = []
  try { recent = (JSON.parse(storage.getItem(STALE_RELOAD_KEY) || '[]') as number[]).filter(at => typeof at === 'number' && now - at < WINDOW_MS) } catch { recent = [] }
  if (recent.length >= MAX_RELOADS) return false
  try { storage.setItem(STALE_RELOAD_KEY, JSON.stringify([...recent, now])) } catch { return false }
  return true
}

export function installStaleChunkRecovery(win: Window = window): void {
  win.addEventListener('vite:preloadError', event => {
    let storage: Storage | null = null
    try { storage = win.sessionStorage } catch { storage = null }
    if (!staleReloadAllowed(storage, Date.now())) return
    event.preventDefault()
    win.setTimeout(() => win.location.reload(), STALE_RELOAD_DELAY_MS)
  })
}
