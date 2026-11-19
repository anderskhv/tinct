/**
 * A small in-memory IndexedDB for the userBook store's tests: only the calls
 * userBookStore.ts makes (open, transaction, objectStore get/put).
 *
 * Like IndexedDB, a transaction completes only once none of its requests is
 * pending, including a put issued from a get's onsuccess. Every request
 * succeeds in a later task. Completion is never a fixed timer: one was, and
 * under a loaded runner (a stall of a few ms between `transaction()` and
 * `get()`) it fired before the get, so keepFields resolved before its put.
 */
type Request = { result?: unknown; onsuccess?: () => void; onerror?: () => void }

export function fakeIndexedDb(records: Map<string, Record<string, unknown>>) {
  const db = {
    objectStoreNames: { contains: () => true },
    createObjectStore() {},
    close() {},
    transaction() {
      const tx: Record<string, unknown> & { oncomplete?: () => void } = {}
      let pending = 0
      let done = false
      const settle = () => setTimeout(() => {
        if (pending > 0 || done) return
        done = true
        tx.oncomplete?.()
      }, 0)
      const request = (run: () => unknown): Request => {
        if (done) throw new Error('TransactionInactiveError: the transaction has finished')
        const req: Request = {}
        pending++
        setTimeout(() => {
          req.result = run()
          req.onsuccess?.()
          pending--
          settle()
        }, 0)
        return req
      }
      tx.objectStore = () => ({
        get: (key: string) => request(() => records.get(key)),
        put: (value: Record<string, unknown>) => request(() => { records.set(String(value.key), value); return value.key }),
      })
      // A transaction with no requests completes too.
      settle()
      return tx
    },
  }
  return {
    open() {
      const request: Request = {}
      setTimeout(() => { request.result = db; request.onsuccess?.() }, 0)
      return request
    },
  }
}
