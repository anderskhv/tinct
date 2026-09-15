// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mock = vi.hoisted(() => {
  const requestedKeys: string[][] = []
  const rows = new Map<string, { key: string; value: unknown; rev: number }>()
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    in: vi.fn(async (_column: string, keys: string[]) => {
      requestedKeys.push(keys)
      return { data: keys.flatMap(key => rows.has(key) ? [rows.get(key)!] : []), error: null }
    }),
  }
  const rpcResponses: Array<{ data: unknown; error: null }> = []
  const rpc = vi.fn(async () => rpcResponses.shift() ?? { data: null, error: null })
  return { requestedKeys, rows, rpcResponses, supabase: { from: vi.fn(() => query), rpc } }
})

vi.mock('./supabase', () => ({ supabase: mock.supabase }))

import { SupabaseStorageProvider } from './supabaseStorage'

beforeEach(() => {
  localStorage.clear()
  mock.requestedKeys.length = 0
  mock.rows.clear()
  mock.rpcResponses.length = 0
  vi.clearAllMocks()
})

describe('SupabaseStorageProvider chat refresh', () => {
  it('refreshes and announces the active book chat after a returning-device focus', async () => {
    const september = [{
      id: 'conv-bible',
      bookId: 'bible',
      chapterNumber: 3,
      startTimestamp: 1,
      endTimestamp: 2,
      preview: 'Why locusts?',
      messages: [{ id: 'm-new', role: 'user', content: 'Why locusts?', timestamp: 2, bookId: 'bible' }],
    }]
    mock.rows.set('chat-history:bible', { key: 'chat-history:bible', value: september, rev: 4 })
    const provider = new SupabaseStorageProvider('reader')
    const events: Array<{ key: string; value: unknown }> = []
    provider.onChange((key, value) => events.push({ key, value }))

    await provider.refresh('bible')

    expect(mock.requestedKeys).toEqual([
      ['tinct-current-book', 'position:bible'],
      ['chat-history:bible'],
    ])
    expect(provider.get('chat-history:bible')).toEqual(september)
    expect(events).toContainEqual({ key: 'chat-history:bible', value: september })
    provider.unsubscribe()
  })

  it('retries a version conflict with the union of both devices histories', async () => {
    const remote = [{
      id: 'conv-bible', bookId: 'bible', chapterNumber: 3,
      startTimestamp: 1, endTimestamp: 3, preview: 'Old',
      messages: [
        { id: 'old', role: 'user', content: 'Old', timestamp: 1, bookId: 'bible' },
        { id: 'desktop', role: 'user', content: 'Desktop', timestamp: 3, bookId: 'bible' },
      ],
    }]
    const local = [{
      id: 'conv-bible', bookId: 'bible', chapterNumber: 3,
      startTimestamp: 1, endTimestamp: 2, preview: 'Old',
      messages: [
        { id: 'old', role: 'user', content: 'Old', timestamp: 1, bookId: 'bible' },
        { id: 'mobile', role: 'user', content: 'Mobile', timestamp: 2, bookId: 'bible' },
      ],
    }]
    mock.rpcResponses.push(
      { data: { key: 'chat-history:bible', value: remote, rev: 4, applied: false, conflict: true }, error: null },
      { data: { key: 'chat-history:bible', value: [], rev: 5, applied: true, conflict: false }, error: null },
    )
    const provider = new SupabaseStorageProvider('reader')

    provider.set('chat-history:bible', local)

    await vi.waitFor(() => expect(mock.supabase.rpc).toHaveBeenCalledTimes(2))
    const retry = mock.supabase.rpc.mock.calls[1]?.[1] as { p_value: typeof local }
    expect(retry.p_value[0].messages.map(item => item.id)).toEqual(['old', 'mobile', 'desktop'])
    provider.unsubscribe()
  })

})
