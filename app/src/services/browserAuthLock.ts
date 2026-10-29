import { NavigatorLockAcquireTimeoutError, type LockFunc } from '@supabase/supabase-js'

/** Keep one pending browser lock acquisition per name in this document. */
export function serializeBrowserAuthLock(acquire: LockFunc): LockFunc {
  const pending = new Map<string, Promise<void>>()
  return async <R>(name: string, timeout: number, fn: () => Promise<R>): Promise<R> => {
    const previous = pending.get(name)
    // Auto-refresh uses a zero timeout to skip a busy lock, not wait behind it.
    if (timeout === 0 && previous) throw new NavigatorLockAcquireTimeoutError('Authentication lock is busy')
    const result = (async () => {
      await previous
      let callback: Promise<R> | undefined
      try {
        return await acquire(name, timeout, () => {
          callback = Promise.resolve().then(fn)
          return callback
        })
      } finally {
        // A lock stolen by another tab can reject while its callback still runs.
        // Do not start this tab's next operation until that callback settles.
        await callback?.catch(() => {})
      }
    })()
    const settled = result.then(() => {}, () => {})
    pending.set(name, settled)
    void settled.then(() => { if (pending.get(name) === settled) pending.delete(name) })
    return result
  }
}
