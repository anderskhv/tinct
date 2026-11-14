/**
 * Account writes still waiting for their debounce (highlights, chat) go out before sign-out: sign-out wipes the
 * device copy (`wipeLabDeviceUserData`), so a change that had not reached the account would be lost. Each writer
 * registers while it is live; the sign-out button awaits `flushBeforeSignOut` (bounded, so a slow network never
 * holds the reader on the page) and only then ends the session.
 */
const flushers = new Set<() => unknown>()

export function registerSignOutFlush(flush: () => unknown): () => void {
  flushers.add(flush)
  return () => { flushers.delete(flush) }
}

export const SIGN_OUT_FLUSH_TIMEOUT_MS = 4_000

export async function flushBeforeSignOut(timeoutMs = SIGN_OUT_FLUSH_TIMEOUT_MS): Promise<void> {
  if (!flushers.size) return
  const all = Promise.allSettled([...flushers].map(flush => {
    try { return Promise.resolve(flush()) } catch (error) { return Promise.reject(error) }
  }))
  let timer: ReturnType<typeof setTimeout> | undefined
  await Promise.race([all, new Promise<void>(resolve => { timer = setTimeout(resolve, timeoutMs) })])
  clearTimeout(timer)
}
