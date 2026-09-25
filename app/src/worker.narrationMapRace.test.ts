import { describe, expect, it } from 'vitest'
import { publishNarrationMap } from './worker/routes/narration'
import { NARRATION_CACHE_VERSION, NARRATION_CHUNKER_VERSION, type NarrationMapEntry } from './narration/narrationCore'

/** An R2 bucket with etags and conditional puts, and a hook that runs between a read and the next put. */
class EtagBucket {
  store = new Map<string, { body: string; etag: string }>()
  version = 0
  beforePut: (() => Promise<void>) | null = null
  async get(key: string) {
    const value = this.store.get(key)
    return value ? { etag: value.etag, json: async () => JSON.parse(value.body) } : null
  }
  async put(key: string, body: string, options?: { onlyIf?: { etagMatches?: string } }) {
    const hook = this.beforePut
    this.beforePut = null
    if (hook) await hook()
    const current = this.store.get(key)
    if (options?.onlyIf?.etagMatches && current?.etag !== options.onlyIf.etagMatches) return null
    const etag = `v${++this.version}`
    this.store.set(key, { body, etag })
    return { etag }
  }
}

const entry = (chunks: number[]): NarrationMapEntry => ({
  version: NARRATION_CACHE_VERSION, textHash: 'h', chunker: NARRATION_CHUNKER_VERSION, chunkCount: 3,
  voiceKey: 'helios', voiceId: 'helios', model: 'm', bookId: 'confessions', editionKey: 'modern-en', chapter: 3, paragraphIndex: 2,
  chunks: chunks.map(index => ({ index, hash: `c${index}`, wordFrom: index * 10, wordTo: index * 10 + 10 })),
  complete: chunks.length === 3, publishedAt: '2026-09-25T00:00:00Z',
} as NarrationMapEntry)

/** Merge like the ensure route: keep what the map lists, add ours. */
const adding = (index: number) => (existing: NarrationMapEntry | null) =>
  entry([...new Set([...(existing?.chunks.map(chunk => chunk.index) ?? []), index])].sort())

describe('publishing a narration map', () => {
  it('keeps a chunk another request listed between our read and our write', async () => {
    const bucket = new EtagBucket()
    const key = 'narration/grok/map/confessions/modern-en/ch3/helios/p2.json'
    await publishNarrationMap(bucket as unknown as R2Bucket, key, adding(0))
    // Request B lists chunk 2 while request A (adding chunk 1) is between its read and its put.
    bucket.beforePut = async () => { await publishNarrationMap(bucket as unknown as R2Bucket, key, adding(2)) }
    const written = await publishNarrationMap(bucket as unknown as R2Bucket, key, adding(1))
    const stored = JSON.parse(bucket.store.get(key)!.body) as NarrationMapEntry
    expect(stored.chunks.map(chunk => chunk.index)).toEqual([0, 1, 2])
    expect(stored.complete).toBe(true)
    expect(written.chunks.map(chunk => chunk.index)).toEqual([0, 1, 2])
  })
})
