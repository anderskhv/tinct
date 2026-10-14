/**
 * Screen Wake Lock for a live Talk session.
 *
 * A web page cannot keep the microphone running while iOS is locked, so while
 * Talk is active the screen is kept awake instead (iOS Safari 16.4+, Chrome).
 * Browsers release a wake lock whenever the page is hidden; it is requested
 * again when the page is visible while the hold is still wanted. Unsupported
 * or refused requests fail silently: Talk works as before, the phone may lock.
 */

interface WakeLockSentinelLike {
  released?: boolean
  release(): Promise<void>
  addEventListener?(type: 'release', listener: () => void): void
}

interface WakeLockLike {
  request(type: 'screen'): Promise<WakeLockSentinelLike>
}

export interface ScreenWakeLockEnv {
  navigator?: { wakeLock?: WakeLockLike } | null
  document?: Pick<Document, 'visibilityState' | 'addEventListener' | 'removeEventListener'> | null
}

export interface ScreenWakeLockHold {
  release(): void
}

function defaultEnv(): ScreenWakeLockEnv {
  return {
    navigator: typeof navigator !== 'undefined' ? (navigator as unknown as { wakeLock?: WakeLockLike }) : null,
    document: typeof document !== 'undefined' ? document : null,
  }
}

/** Keeps the screen awake until `release()`. Never throws. */
export function holdScreenWakeLock(env: ScreenWakeLockEnv = defaultEnv()): ScreenWakeLockHold {
  const wakeLock = env.navigator?.wakeLock
  const doc = env.document ?? null
  if (!wakeLock || typeof wakeLock.request !== 'function') return { release() {} }

  let wanted = true
  let sentinel: WakeLockSentinelLike | null = null
  let pending = false

  const drop = (lock: WakeLockSentinelLike) => {
    try { void lock.release().catch(() => {}) } catch { /* already released */ }
  }

  const acquire = () => {
    if (!wanted || pending || (sentinel && !sentinel.released)) return
    if (doc && doc.visibilityState !== 'visible') return
    pending = true
    let request: Promise<WakeLockSentinelLike>
    try { request = wakeLock.request('screen') }
    catch { pending = false; return }
    void Promise.resolve(request).then(lock => {
      pending = false
      if (!wanted) { drop(lock); return }
      sentinel = lock
      try { lock.addEventListener?.('release', () => { if (sentinel === lock) sentinel = null }) } catch { /* optional */ }
    }, () => { pending = false })
  }

  const onVisibility = () => { if (doc?.visibilityState === 'visible') acquire() }
  try { doc?.addEventListener('visibilitychange', onVisibility) } catch { /* no document events */ }
  acquire()

  return {
    release() {
      if (!wanted) return
      wanted = false
      try { doc?.removeEventListener('visibilitychange', onVisibility) } catch { /* ignore */ }
      const lock = sentinel
      sentinel = null
      if (lock && !lock.released) drop(lock)
    },
  }
}
