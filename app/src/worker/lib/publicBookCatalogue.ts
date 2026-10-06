/**
 * One work of the Add-a-book catalogue (`/lab/addbook/data/catalog.json.gz`,
 * ~8 MB gzip, ~58 MB of JSON on one line), found without parsing the whole
 * file: the gzip is streamed through DecompressionStream and scanned for the
 * work's own opening (`{"id":"<work id>",`), and only that object is parsed.
 * Recent lookups are kept per isolate. Server truth for imports: the browser
 * names a work id, never a download URL, title or author.
 */
import type { CatalogueWork } from '../../../public/lab/public-books.js'

export const ADD_BOOK_CATALOGUE_PATH = '/lab/addbook/data/catalog.json.gz'

const cache = new Map<string, CatalogueWork | null>()
const CACHE_SIZE = 200

/** The index just past the JSON object that starts at `start`, or -1 while it is incomplete. */
export function objectEnd(text: string, start: number): number {
  let depth = 0
  let inString = false
  for (let i = start; i < text.length; i++) {
    const c = text.charCodeAt(i)
    if (inString) {
      if (c === 92) i++ // backslash: skip the escaped character
      else if (c === 34) inString = false
      continue
    }
    if (c === 34) inString = true
    else if (c === 123 || c === 91) depth++
    else if (c === 125 || c === 93) { if (--depth === 0) return i + 1 }
  }
  return -1
}

/** Scan a catalogue byte stream (gzip or plain JSON) for one work. */
export async function findWorkInStream(body: ReadableStream<Uint8Array>, workId: string): Promise<CatalogueWork | null> {
  const reader = body.getReader()
  const first = await reader.read()
  if (first.done) return null
  // Re-assemble the stream with its first chunk, gunzipping only if it is still gzip.
  const head = first.value
  const rest = new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(head) },
    async pull(controller) {
      const next = await reader.read()
      if (next.done) controller.close()
      else controller.enqueue(next.value)
    },
    cancel(reason) { return reader.cancel(reason) },
  })
  const gz = head[0] === 0x1f && head[1] === 0x8b
  const plain = gz ? rest.pipeThrough(new DecompressionStream('gzip') as unknown as ReadableWritablePair<Uint8Array, Uint8Array>) : rest
  const text = plain.pipeThrough(new TextDecoderStream() as unknown as ReadableWritablePair<string, Uint8Array>).getReader()
  const needle = `{"id":${JSON.stringify(workId)},`
  let buffer = ''
  let found = -1
  try {
    for (;;) {
      const { done, value } = await text.read()
      if (done) return null
      buffer += value
      if (found < 0) {
        found = buffer.indexOf(needle)
        if (found < 0) { buffer = buffer.slice(-needle.length); continue }
        buffer = buffer.slice(found)
        found = 0
      }
      const end = objectEnd(buffer, 0)
      if (end > 0) return JSON.parse(buffer.slice(0, end)) as CatalogueWork
      if (buffer.length > 1_000_000) return null
    }
  } finally {
    await text.cancel().catch(() => {})
  }
}

export async function lookupCatalogueWork(
  assets: { fetch: (request: Request) => Promise<Response> },
  origin: string,
  workId: string,
): Promise<CatalogueWork | null> {
  if (cache.has(workId)) return cache.get(workId) ?? null
  const response = await assets.fetch(new Request(new URL(ADD_BOOK_CATALOGUE_PATH, origin)))
  if (!response.ok || !response.body) throw new Error(`catalogue ${response.status}`)
  const work = await findWorkInStream(response.body, workId)
  if (cache.size >= CACHE_SIZE) cache.delete(cache.keys().next().value as string)
  cache.set(workId, work)
  return work
}

export function resetCatalogueLookupCache(): void {
  cache.clear()
}
