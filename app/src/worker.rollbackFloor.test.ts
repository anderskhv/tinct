import { describe, expect, it } from 'vitest'
import { build } from 'esbuild'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { fakeUserBooksBucket } from './worker/fakeUserBooksBucket'
import { handleUserBooks as modernRoute, type listOwnCards, type listOwnMarks } from './worker/routes/userBooks'

const A = '11111111-1111-4111-8111-111111111111'
const routeDirectory = resolve(dirname(fileURLToPath(import.meta.url)), 'worker/routes')
type Handler = typeof modernRoute
type Route = { handleUserBooks: Handler; listOwnMarks: typeof listOwnMarks; listOwnCards: typeof listOwnCards }

// Checked-in, content-pinned route snapshots preserve the old main and
// compatible floor when the reader branch is merged. The live route is the
// modern reader candidate under review; bundle snapshots against its dependency tree.
const fixtures = {
  old: ['old-userBooks.ts.txt', '191e4e1c793c781ca2547f7eee98b56d0185959057ae572caab01a0ad608d1c9'],
  modern: ['modern-userBooks.ts.txt', 'c25b0b48d7bf45ec2e74d2d981aaf8593e19a80660948d45642a789dcd8ee69b'],
  floor: ['floor-userBooks.ts.txt', 'a7f55e0d4670e995cf40510e2ea961b81a590283dd2fdc6785225a9308b44e7d'],
} as const
const handlers: Partial<Record<keyof typeof fixtures, Promise<Route>>> = {}
function snapshot(kind: keyof typeof fixtures): Promise<Route> {
  return handlers[kind] ??= (async () => {
    const [name, digest] = fixtures[kind]
    const source = readFileSync(resolve(routeDirectory, '../../test/fixtures/rollback-floor', name), 'utf8')
    expect(createHash('sha256').update(source).digest('hex')).toBe(digest)
    const compiled = await build({ stdin: { contents: source, sourcefile: 'userBooks.ts', resolveDir: routeDirectory, loader: 'ts' },
      bundle: true, write: false, platform: 'node', format: 'esm', target: 'es2022' })
    return await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`) as Route
  })()
}

const pdf = new TextEncoder().encode('%PDF-1.7\n1 0 obj << >> endobj\n%%EOF\n')
const mark = { id: 'mark1', page: 1, rects: [[.1, .2, .5, .02]], text: 'Passage', color: 'gold', at: 1000 }
const secondMark = { ...mark, id: 'mark2', at: 1001 }
const card = { id: 'card1', kind: 'ask', page: 1, rects: [[1, .1, .2, .5, .02]], text: 'Passage', turns: [{ role: 'assistant', content: 'Answer' }], at: 1000 }
const note = { id: 'note1', kind: 'ask', page: 1, pageOnly: true, rects: [], text: 'Chapter one',
  turns: [{ role: 'user', content: 'Keep this note' }], at: 1001,
  data: { action: 'note', unit: { key: 'ch-1', title: 'Chapter one', from: 1, to: 2 }, source: { from: 1, to: 2 } } }

function harness() {
  const { bucket, objects } = fakeUserBooksBucket()
  // The real R2 conditional first write is atomic. The shared fake checks
  // etagMatches; add If-None-Match:* without changing body-derived ETags.
  const r2 = new Proxy(bucket, { get(target, property) {
    if (property === 'put') return (key: string, value: string | Uint8Array, options: R2PutOptions = {}) => {
      if (options.onlyIf instanceof Headers && options.onlyIf.get('If-None-Match') === '*' && objects.has(key)) return Promise.resolve(null)
      return target.put(key, value, options)
    }
    const member = Reflect.get(target, property)
    return typeof member === 'function' ? member.bind(target) : member
  } })
  const env = { USER_BOOKS: r2 }
  const deps = { verifyUser: async () => ({ id: A }), checkRateLimit: async () => true, premiumAccess: async () => true }
  const call = (handler: Handler, path: string, init: RequestInit = {}) => handler(new Request(`https://tinct.app/api/user-books${path}`, init), env, deps)
  const upload = async (handler: Handler, bytes: Uint8Array = pdf) => {
    const response = await call(handler, '', { method: 'POST', body: bytes })
    expect(response.status).toBe(201)
    return (await response.json() as { book: { id: string; sha256: string; type: string } }).book
  }
  const put = (handler: Handler, kind: 'marks' | 'cards', hex: string, list: unknown[], rev: number, expectedFileId?: string) =>
    call(handler, `/${kind}/${hex}`, { method: 'PUT', body: JSON.stringify({ [kind]: list, rev, ...(expectedFileId ? { expectedFileId } : {}) }) })
  const get = async (handler: Handler, kind: 'marks' | 'cards', hex: string) =>
    (await call(handler, `/${kind}/${hex}`)).json() as Promise<Record<string, unknown>>
  return { bucket: r2, objects, call, upload, put, get }
}

describe('source-fixed rollback-floor storage policy on one R2 bucket', () => {
  it('pins all three historical routes and tests the pending reader branch as the live modern route', async () => {
    const rollout = JSON.parse(readFileSync(resolve(routeDirectory, '../../../release/shared-reader-rollout.json'), 'utf8'))
    expect(rollout.phase).toBe('pending')
    const current = readFileSync(resolve(routeDirectory, 'userBooks.ts'), 'utf8')
    expect(createHash('sha256').update(current).digest('hex')).toBe(fixtures.modern[1])
    for (const kind of Object.keys(fixtures) as Array<keyof typeof fixtures>) {
      expect((await snapshot(kind)).handleUserBooks).toBeTypeOf('function')
    }
    expect(modernRoute).toBeTypeOf('function')
  })

  it('crosses actual old main → floor → full → floor for PDF place, marks, cards, export and deletion', async () => {
    const { handleUserBooks: main } = await snapshot('old')
    const { handleUserBooks: floor, listOwnMarks: floorMarks, listOwnCards: floorCards } = await snapshot('floor')
    const full = modernRoute
    const h = harness()
    const book = await h.upload(main)
    const hex = book.sha256.slice(0, 24)
    const prefix = `u/${A}/`
    const marksKey = `${prefix}marks/${hex}`, cardsKey = `${prefix}cards/${hex}`
    expect(h.objects.get(`${prefix}${book.id}`)?.customMetadata.annotationGeneration).toBeUndefined()
    const place = { page: 1, fraction: .25, updatedAt: 1000 }
    expect((await h.call(main, `/places/${hex}`, { method: 'PUT', body: JSON.stringify({ place, rev: 0 }) })).status).toBe(200)
    expect((await h.call(floor, `/places/${hex}`, { method: 'PUT', body: JSON.stringify({ place: { ...place, fraction: .5 }, rev: 1 }) })).status).toBe(200)
    expect(new TextDecoder().decode(h.objects.get(`${prefix}places/${hex}`)!.bytes)).toBe('2')
    expect((await h.call(main, '/places')).status).toBe(200)
    expect((await h.put(main, 'marks', hex, [mark], 0)).status).toBe(200)
    expect((await h.put(main, 'cards', hex, [card], 0)).status).toBe(200)
    expect((await h.put(floor, 'marks', hex, [mark, secondMark], 1)).status).toBe(200)
    expect((await h.put(floor, 'cards', hex, [card], 1)).status).toBe(200)
    for (const key of [marksKey, cardsKey]) {
      const raw = new TextDecoder().decode(h.objects.get(key)!.bytes)
      expect(JSON.parse(raw)).toBeInstanceOf(Array)
      expect(raw.startsWith('[')).toBe(true)
      expect(raw.length).toBeGreaterThan(JSON.stringify(JSON.parse(raw)).length)
    }
    expect(await h.get(main, 'marks', hex)).toMatchObject({ marks: [mark, secondMark], rev: 2 })
    expect(await h.get(main, 'cards', hex)).toMatchObject({ cards: [card], rev: 2 })
    // Even an identical-list floor write gets a different ETag; the old main
    // handler still reads the array and can advance it before full migration.
    const oldEtag = h.objects.get(cardsKey)!.etag
    expect((await h.put(floor, 'cards', hex, [card], 2)).status).toBe(200)
    expect(h.objects.get(cardsKey)!.etag).not.toBe(oldEtag)
    expect((await h.put(main, 'cards', hex, [card], 3)).status).toBe(200)
    expect((await h.put(full, 'marks', hex, [mark, secondMark], 2)).status).toBe(200)
    expect((await h.put(full, 'cards', hex, [card], 4)).status).toBe(200)
    expect(await h.get(floor, 'marks', hex)).toMatchObject({ marks: [mark, secondMark], rev: 3 })
    expect(await h.get(floor, 'cards', hex)).toMatchObject({ cards: [card], rev: 5 })
    expect((await h.put(floor, 'marks', hex, [mark, secondMark], 3)).status).toBe(200)
    expect(JSON.parse(new TextDecoder().decode(h.objects.get(`${marksKey}/${book.id}`)!.bytes))).toMatchObject({ rev: 4, list: [mark, secondMark] })
    expect(await floorMarks(h.bucket, A)).toMatchObject({ [hex]: { removed: 0, rev: 2 }, [`${hex}/${book.id}`]: { removed: 0, rev: 4 } })
    expect(await floorCards(h.bucket, A)).toMatchObject({ [hex]: { removed: 0, rev: 4 }, [`${hex}/${book.id}`]: { removed: 0, rev: 5 } })
    expect((await h.call(floor, `/${book.id}`, { method: 'DELETE' })).status).toBe(200)
    expect([...h.objects.keys()].filter(key => key.startsWith(`${prefix}marks/${hex}`) || key.startsWith(`${prefix}cards/${hex}`))).toEqual([])
  })

  it('floor-created files write old arrays; legacy-only writes reject new schemas while modern uploads retain them', async () => {
    const { handleUserBooks: floor } = await snapshot('floor')
    const full = modernRoute
    const h = harness()
    const legacy = await h.upload(floor)
    const hex = legacy.sha256.slice(0, 24)
    expect(h.objects.get(`u/${A}/${legacy.id}`)?.customMetadata.annotationGeneration).toBeUndefined()
    for (const route of ['text-marks', 'text-cards']) {
      expect((await h.call(floor, `/${route}/${hex}`)).status).toBe(503)
    }
    expect((await h.call(floor, `/metadata/${hex}`, { method: 'PATCH', body: JSON.stringify({ title: 'New', author: '', rev: 0, expectedFileId: legacy.id }) })).status).toBe(503)
    expect((await h.put(floor, 'cards', hex, [note], 0)).status).toBe(503)
    expect(h.objects.has(`u/${A}/cards/${hex}`)).toBe(false)
    expect((await h.put(floor, 'marks', hex, [mark], 0)).status).toBe(200)
    expect(JSON.parse(new TextDecoder().decode(h.objects.get(`u/${A}/marks/${hex}`)!.bytes))).toEqual([mark])
    const epub = new Uint8Array(await (await import('../../addbooks/web/test/make-epub.mjs')).makeEpub({ title: 'Legacy EPUB' }))
    const epubBook = await h.upload(floor, epub)
    const epubHex = epubBook.sha256.slice(0, 24)
    expect((await h.put(floor, 'marks', epubHex, [], 0)).status).toBe(503)
    expect((await h.put(floor, 'cards', epubHex, [], 0)).status).toBe(503)
    // A modern-marked full upload keeps its generation, source-word and
    // page-only routes when floor is placed in front of the same bucket.
    const modern = await h.upload(full, new TextEncoder().encode('%PDF-1.7\nmodern\n%%EOF\n'))
    const modernHex = modern.sha256.slice(0, 24)
    expect(h.objects.get(`u/${A}/${modern.id}`)?.customMetadata.annotationGeneration).toBe('file-id-v1')
    expect((await h.put(full, 'cards', modernHex, [note], 0, modern.id)).status).toBe(200)
    expect((await h.put(floor, 'cards', modernHex, [note, card], 1, modern.id)).status).toBe(200)
    expect(await h.get(full, 'cards', modernHex)).toMatchObject({ cards: [note, card], rev: 2 })
    expect((await h.call(floor, `/text-marks/${modernHex}`)).status).toBe(200)
    expect((await h.call(floor, `/metadata/${modernHex}`, { method: 'PATCH', body: JSON.stringify({ title: 'Edited', author: 'Owner', rev: 0, expectedFileId: modern.id }) })).status).toBe(200)
    expect((await h.call(full, '')).status).toBe(200)
    expect((await h.call(floor, `/${modern.id}`, { method: 'DELETE' })).status).toBe(200)
    expect(h.objects.has(`u/${A}/cards/${modernHex}/${modern.id}`)).toBe(false)
    expect((await h.call(floor, `/${legacy.id}`, { method: 'DELETE' })).status).toBe(200)
    const reupload = await h.upload(floor)
    expect(reupload.id).not.toBe(legacy.id)
    expect(await h.get(floor, 'marks', hex)).toMatchObject({ marks: [], rev: 0 })
    expect((await h.put(floor, 'marks', hex, [mark], 0, legacy.id)).status).toBe(409)
  })

  it('a changed-ETag sealed bare key rejects a stale floor CAS and keeps the complete tombstone list visible', async () => {
    const { handleUserBooks: floor } = await snapshot('floor')
    const h = harness()
    const book = await h.upload(floor)
    const hex = book.sha256.slice(0, 24)
    const key = `u/${A}/marks/${hex}`
    const tombstone = { id: 'removed1', gone: true, u: 2000 }
    expect((await h.put(floor, 'marks', hex, [mark, tombstone], 0)).status).toBe(200)
    const before = await h.bucket.head(key)
    const raw = new TextDecoder().decode(h.objects.get(key)!.bytes)
    const sealed = await h.bucket.put(key, `${raw}\n`, { customMetadata: { rev: '1', annotationMigration: 'sealed-v1' }, onlyIf: { etagMatches: before!.etag } })
    expect(sealed?.etag).not.toBe(before?.etag)
    expect(await h.get(floor, 'marks', hex)).toMatchObject({ marks: [mark, tombstone], rev: 1 })
    const pending = await h.bucket.put(key, '[ ]', { customMetadata: { rev: '2' }, onlyIf: { etagMatches: before!.etag } })
    expect(pending).toBeNull()
    const unavailable = await h.put(floor, 'marks', hex, [secondMark, tombstone], 1)
    expect(unavailable.status).toBe(503)
    expect(await unavailable.json()).toMatchObject({ error: 'temporarily_unavailable', retryable: true })
    expect(JSON.parse(new TextDecoder().decode(h.objects.get(key)!.bytes))).toEqual([mark, tombstone])
  })
})
