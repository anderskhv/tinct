/**
 * Test stand-in for the private USER_BOOKS R2 bucket: put/get/head/delete and a
 * paginated list (`pageSize` objects per page) that honours `include`.
 * Every delete call is appended to `log` so tests can assert ordering.
 */
type Stored = { key: string; bytes: Uint8Array; uploaded: Date; customMetadata: Record<string, string>; httpMetadata?: R2HTTPMetadata }

export function fakeUserBooksBucket(options: { pageSize?: number; log?: string[] } = {}) {
  const objects = new Map<string, Stored>()
  const pageSize = options.pageSize ?? 1000
  const calls = { list: 0, delete: 0, put: 0 }
  const head = (s: Stored) => ({ key: s.key, size: s.bytes.byteLength, uploaded: s.uploaded, customMetadata: { ...s.customMetadata }, httpMetadata: s.httpMetadata ?? {} })

  const bucket = {
    async put(key: string, value: Uint8Array | ArrayBuffer | string, opts: R2PutOptions = {}) {
      calls.put++
      const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : new Uint8Array(value instanceof ArrayBuffer ? value : value.slice())
      const stored: Stored = { key, bytes, uploaded: new Date(), customMetadata: { ...(opts.customMetadata as Record<string, string> ?? {}) }, httpMetadata: opts.httpMetadata as R2HTTPMetadata }
      objects.set(key, stored)
      return head(stored)
    },
    async get(key: string) {
      const s = objects.get(key)
      if (!s) return null
      return { ...head(s), body: new Response(s.bytes).body, arrayBuffer: async () => s.bytes.slice().buffer }
    },
    async head(key: string) {
      const s = objects.get(key)
      return s ? head(s) : null
    },
    async delete(keys: string | string[]) {
      calls.delete++
      options.log?.push('r2:delete:user-books')
      for (const key of ([] as string[]).concat(keys)) objects.delete(key)
    },
    async list(opts: R2ListOptions = {}) {
      calls.list++
      const prefix = opts.prefix ?? ''
      const all = [...objects.keys()].filter(key => key.startsWith(prefix)).sort()
      const start = opts.cursor ? Number(opts.cursor) : 0
      const size = Math.min(pageSize, opts.limit ?? 1000)
      const slice = all.slice(start, start + size)
      const withMeta = (opts.include ?? []).includes('customMetadata')
      const truncated = start + size < all.length
      return {
        objects: slice.map(key => {
          const h = head(objects.get(key)!)
          return withMeta ? h : { ...h, customMetadata: undefined }
        }),
        truncated,
        cursor: truncated ? String(start + size) : undefined,
        delimitedPrefixes: [],
      }
    },
  }
  return { bucket: bucket as unknown as R2Bucket, objects, calls }
}
