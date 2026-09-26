// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { emptyLabPositionState } from './lab/labPosition'
import type { RecapLoadDeps } from './readingMemory/recapLoad'

const calls = vi.hoisted(() => ({
  auth: vi.fn(), memory: vi.fn(), localPositions: vi.fn(), cloudPositions: vi.fn(),
  completions: vi.fn(), readingList: vi.fn(), readMemory: vi.fn(),
}))
vi.mock('./services/supabase', () => ({
  supabase: {
    auth: { getSession: calls.auth },
    from: () => ({ select: () => ({ eq: () => ({ or: calls.completions }) }) }),
  },
  isSupabaseConfigured: () => true,
}))
vi.mock('./readingMemory/recapLoad', () => ({ loadRecap: calls.memory }))
vi.mock('./lab/labPositionStore', () => ({
  prepareLabPositionLocal: calls.localPositions, fetchLabPositionCloud: calls.cloudPositions,
}))
vi.mock('./readingMemory/deviceStore', async original => ({
  ...await original<typeof import('./readingMemory/deviceStore')>(), readDeviceReadingMemory: calls.readMemory,
}))
vi.mock('./preReader/libraryRecap', async original => ({
  ...await original<typeof import('./preReader/libraryRecap')>(), readingList: calls.readingList,
}))

function gate<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}

afterEach(() => { vi.unstubAllGlobals(); vi.resetAllMocks(); vi.resetModules(); localStorage.clear() })

it('resolves the viewer, runs independent reads together, and builds the shelf only after every mirror is ready', async () => {
  const account = gate<{ data: { session: { user: { id: string }; access_token: string } } }>()
  const memory = gate<null>()
  const positions = gate<ReturnType<typeof emptyLabPositionState>>()
  const completions = gate<{ data: Array<{ key: string; value: unknown }>; error: null }>()
  calls.auth.mockReturnValue(account.promise)
  calls.memory.mockReturnValue(memory.promise)
  calls.localPositions.mockResolvedValue(emptyLabPositionState('device-a', 'viewer-a'))
  calls.cloudPositions.mockReturnValue(positions.promise)
  calls.completions.mockReturnValue(completions.promise)
  calls.readMemory.mockReturnValue({ version: 1, sessions: {}, updatedAt: 777 })
  calls.readingList.mockReturnValue({ readingNow: [], finished: [] })
  const fetch = vi.fn(async () => new Response(JSON.stringify({ books: [] }), { headers: { 'Content-Type': 'application/json' } }))
  vi.stubGlobal('fetch', fetch)

  const { loadReadingTable } = await import('./libraryTwoReading')
  let settled = false
  const table = loadReadingTable().then(value => { settled = true; return value })
  await vi.waitFor(() => expect(calls.auth).toHaveBeenCalled())
  expect(calls.memory).not.toHaveBeenCalled()
  expect(calls.cloudPositions).not.toHaveBeenCalled()
  expect(calls.completions).not.toHaveBeenCalled()

  account.resolve({ data: { session: { user: { id: 'viewer-a' }, access_token: 'viewer-token' } } })
  await vi.waitFor(() => {
    expect(calls.memory).toHaveBeenCalledOnce()
    expect(calls.cloudPositions).toHaveBeenCalledWith('viewer-token')
    expect(calls.completions).toHaveBeenCalledOnce()
  })
  expect(calls.readingList).not.toHaveBeenCalled()
  expect(settled).toBe(false)

  // Chapter content is irrelevant to the shelf and must not add a download or
  // accidentally enable generation while resolving its reading-memory mirror.
  const deps = calls.memory.mock.calls[0][0] as RecapLoadDeps
  expect(deps.allowSummary).toBe(false)
  expect(deps.requestSummary).toBeUndefined()
  expect(await deps.loadChapter({ bookId: 'hamlet' } as never)).toBeNull()
  expect(fetch.mock.calls).toHaveLength(1) // catalogue only

  memory.resolve(null)
  const cloud = emptyLabPositionState('cloud', 'viewer-a')
  cloud.updatedAt = 999
  positions.resolve(cloud)
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(calls.readingList).not.toHaveBeenCalled()
  expect(settled).toBe(false)

  completions.resolve({ data: [{ key: 'book-completed:hamlet', value: { bookId: 'hamlet' } }], error: null })
  expect(await table).toEqual({ mode: 'new', reading: [], finished: [] })
  expect(calls.readingList).toHaveBeenCalledOnce()
  expect(calls.readingList.mock.calls[0][0]).toMatchObject({
    viewer: 'viewer-a', memory: { updatedAt: 777 }, positions: { updatedAt: 999 },
    completedBookIds: new Set(['hamlet']),
  })
})

it('shares the raw catalogue and warms account-owned artwork before a slow completion read, without exposing a partial shelf', async () => {
  const completed = gate<{ data: []; error: null }>()
  const auth = gate<{ data: { session: { user: { id: string }; access_token: string } } }>()
  calls.auth.mockReturnValue(auth.promise)
  calls.memory.mockResolvedValue(null)
  const local = emptyLabPositionState('device-a', 'viewer-a')
  local.books.hamlet = { bookId: 'hamlet', chapterNumber: 1, paragraphIndex: 0, updatedAt: 100 } as never
  calls.localPositions.mockResolvedValue(local)
  calls.cloudPositions.mockResolvedValue(emptyLabPositionState('cloud', 'viewer-a'))
  calls.completions.mockReturnValue(completed.promise)
  calls.readMemory.mockReturnValue({ version: 1, sessions: {}, updatedAt: 100 })
  calls.readingList.mockReturnValue({ readingNow: [], finished: [] })
  const fetch = vi.fn()
  vi.stubGlobal('fetch', fetch)
  const onArtwork = vi.fn()
  const books = [{ id: 'hamlet', title: 'Hamlet', author: 'William Shakespeare', discoveryAvailable: false, art: { src: '/covers/hamlet.webp', srcSet: '' }, cover: { background: '#222222' }, editions: [] }]
  const { loadReadingTable } = await import('./libraryTwoReading')
  let settled = false
  const result = loadReadingTable({ catalogue: Promise.resolve({ books }), onArtwork }).then(value => { settled = true; return value })
  await vi.waitFor(() => expect(calls.auth).toHaveBeenCalled())
  expect(onArtwork).not.toHaveBeenCalled()
  auth.resolve({ data: { session: { user: { id: 'viewer-a' }, access_token: 'token' } } })
  await vi.waitFor(() => expect(onArtwork).toHaveBeenCalledWith([{ bookId: 'hamlet', cover: '/covers/hamlet.webp', tone: '#222222' }]))
  expect(settled).toBe(false)
  expect(calls.readingList).not.toHaveBeenCalled()
  expect(fetch).not.toHaveBeenCalled()
  completed.resolve({ data: [], error: null })
  await result
  expect(calls.readingList.mock.calls[0][0].books.has('hamlet')).toBe(true)
})

it('never warms a previous account’s artwork from its local positions', async () => {
  calls.auth.mockResolvedValue({ data: { session: { user: { id: 'viewer-b' }, access_token: 'token-b' } } })
  calls.memory.mockResolvedValue(null)
  const local = emptyLabPositionState('device-a', 'viewer-a')
  local.books.hamlet = { bookId: 'hamlet', chapterNumber: 1, paragraphIndex: 0, updatedAt: 100 } as never
  calls.localPositions.mockResolvedValue(local)
  calls.cloudPositions.mockResolvedValue(emptyLabPositionState('cloud', 'viewer-b'))
  calls.completions.mockResolvedValue({ data: [], error: null })
  calls.readMemory.mockReturnValue({ version: 1, sessions: {}, updatedAt: 100 })
  calls.readingList.mockReturnValue({ readingNow: [], finished: [] })
  const onArtwork = vi.fn()
  const { loadReadingTable } = await import('./libraryTwoReading')
  await loadReadingTable({ catalogue: Promise.resolve({ books: [{ id: 'hamlet', title: 'Hamlet', author: 'William Shakespeare', art: { src: '/covers/hamlet.webp', srcSet: '' }, editions: [] }] }), onArtwork })
  expect(onArtwork.mock.calls.flatMap(([books]) => books)).toEqual([])
})
