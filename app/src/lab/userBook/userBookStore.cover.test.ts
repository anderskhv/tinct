// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// healCover draws an own EPUB's cover from its file on the device that has it; the drawn
// cover goes to the account copy when that has none (ownCovers.ts offerCoverToAccount).
vi.mock('./userBookCover', () => ({
  canDrawCover: () => true,
  drawCover: async () => ({ url: 'data:image/jpeg;base64,RFJBV04=', width: 600 }),
}))
vi.mock('./epubEdition', () => ({ readEpubCover: async () => ({ data: new Uint8Array([1, 2, 3]), type: 'image/jpeg' }) }))

import { healCover } from './userBookStore'

/** Just enough IndexedDB for one object store read and written in a transaction. */
function fakeIndexedDb(records: Map<string, Record<string, unknown>>) {
  const later = (fn: () => void) => setTimeout(fn, 0)
  return {
    open() {
      const request: Record<string, unknown> = {}
      const db = {
        objectStoreNames: { contains: () => true },
        close() {},
        transaction() {
          let pending = 0
          const tx: Record<string, unknown> = {}
          const settle = () => { if (--pending === 0) later(() => (tx.oncomplete as () => void)?.()) }
          tx.objectStore = () => ({
            get(key: string) {
              pending++
              const req: Record<string, unknown> = {}
              later(() => { req.result = records.get(key) ? structuredClone(records.get(key)) : undefined; (req.onsuccess as () => void)?.(); settle() })
              return req
            },
            put(record: Record<string, unknown>) { records.set(String(record.key), structuredClone(record)) },
          })
          return tx
        },
      }
      later(() => { request.result = db; (request.onsuccess as () => void)?.() })
      return request
    },
  }
}

const KEY = 'epub:' + 'ab'.repeat(12)

describe('healCover and the account copy', () => {
  let records: Map<string, Record<string, unknown>>
  beforeEach(() => {
    records = new Map([[KEY, { key: KEY, kind: 'epub', owner: 'u1', bytes: new ArrayBuffer(4) }]])
    vi.stubGlobal('indexedDB', fakeIndexedDb(records))
  })
  afterEach(() => { vi.unstubAllGlobals() })

  it('keeps the drawn cover on the record, then offers it to the account', async () => {
    const offer = vi.fn(async () => true)
    expect(await healCover(KEY, 'u1', new ArrayBuffer(4), offer)).toBe(true)
    expect(records.get(KEY)).toMatchObject({ cover: 'data:image/jpeg;base64,RFJBV04=', coverW: 600, coverV: 2 })
    expect(offer).toHaveBeenCalledWith('ab'.repeat(12), 'data:image/jpeg;base64,RFJBV04=')
  })

  it('offers nothing for another account\'s record, or one healed already', async () => {
    const offer = vi.fn(async () => true)
    expect(await healCover(KEY, 'someone-else', new ArrayBuffer(4), offer)).toBe(false)
    records.set(KEY, { ...records.get(KEY)!, coverV: 2 })
    expect(await healCover(KEY, 'u1', new ArrayBuffer(4), offer)).toBe(false)
    expect(offer).not.toHaveBeenCalled()
  })
})
