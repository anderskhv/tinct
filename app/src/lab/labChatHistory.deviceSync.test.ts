// @vitest-environment jsdom

/**
 * Phone → desktop chat history (2026-10-07). Anders, signed in on an iPhone
 * and desktop Chrome: the desktop Chat's newest message stayed at 18 Sept
 * although he had chatted on the phone many times since. Each test below is a
 * way a phone turn could fail to reach, or stay out of, the shared
 * `chat-history:{bookId}` row. The fake row behaves like `commit_user_data`
 * on Postgres: a NULL expected rev overwrites unconditionally, and a JSONB
 * value holding U+0000 or an unpaired UTF-16 surrogate is rejected.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChatConversation, ChatMessage } from '../types'
import {
  LAB_CHAT_CLOUD_TIMEOUT_MS,
  appendLabChatTurn,
  createLabChatCloudWriter,
  createLabChatHistoryCloud,
  readLabBookChat,
  type LabChatHistoryCloud,
} from './labChatHistory'

afterEach(() => {
  localStorage.clear()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const USER = '11111111-1111-4111-8111-111111111111'

function message(patch: Partial<ChatMessage> = {}): ChatMessage {
  return { id: 'm1', role: 'user', content: 'Why does the psalmist call the law perfect?', timestamp: 1_789_000_000_000, isComplete: true, source: 'text', ...patch }
}

function conversation(id: string, messages: ChatMessage[]): ChatConversation {
  return {
    id,
    bookId: 'bible',
    chapterNumber: 497,
    startTimestamp: messages[0].timestamp,
    endTimestamp: messages[messages.length - 1].timestamp,
    messages: messages.map(m => ({ ...m, bookId: 'bible', chapterNumber: 497 })),
    preview: messages[0].content.slice(0, 40),
  }
}

/** Postgres JSONB rejects these escapes, so the whole RPC fails. */
function postgresRejects(value: unknown): boolean {
  const text = JSON.stringify(value)
  return /\\u0000/.test(text) || /\\ud[89ab][0-9a-f]{2}(?!\\ud[c-f])/i.test(text) || /(?<!\\ud[89ab][0-9a-f]{2})\\ud[c-f][0-9a-f]{2}/i.test(text)
}

/** In-memory `user_data` row with commit_user_data semantics. */
function fakeRow(initial: ChatConversation[] | null, rev = 1) {
  const state = { value: initial as ChatConversation[] | null, rev: initial ? rev : 0, exists: Boolean(initial) }
  const commits: Array<{ expected: number | null }> = []
  const cloud: LabChatHistoryCloud = {
    async read() { return state.exists ? { conversations: JSON.parse(JSON.stringify(state.value)), rev: state.rev } : null },
    async commit(_bookId, conversations, expected) {
      commits.push({ expected })
      if (postgresRejects(conversations)) throw new Error('unsupported Unicode escape sequence')
      if (state.exists && expected !== null && expected !== state.rev) {
        return { applied: false, conflict: true, row: { conversations: JSON.parse(JSON.stringify(state.value)), rev: state.rev } }
      }
      if (!state.exists && expected !== null && expected !== 0) {
        return { applied: false, conflict: true, row: null }
      }
      state.value = JSON.parse(JSON.stringify(conversations))
      state.rev = state.exists ? state.rev + 1 : 1
      state.exists = true
      return { applied: true, conflict: false, row: { conversations: JSON.parse(JSON.stringify(state.value)), rev: state.rev } }
    },
  }
  return { cloud, state, commits }
}

const ids = (conversations: ChatConversation[] | null) => (conversations ?? []).flatMap(c => c.messages.map(m => m.id))

describe('phone turns reach the shared chat row', () => {
  it('a writer that has not seen the row yet never overwrites newer cloud turns (Invariant 9)', async () => {
    // The desktop's turn is already in the row; the phone's first sync has
    // not finished (or failed) when its first turn is pushed.
    const { cloud, state, commits } = fakeRow([conversation('desktop', [message({ id: 'desktop-turn', timestamp: 1_789_000_000_000 })])], 7)
    const writer = createLabChatCloudWriter(cloud)
    writer.push('bible', appendLabChatTurn('bible', message({ id: 'phone-turn', timestamp: 1_790_000_000_000 }), 497, 0))
    await vi.waitFor(() => expect(ids(state.value)).toContain('phone-turn'))
    expect(ids(state.value)).toEqual(['desktop-turn', 'phone-turn'])
    expect(commits.every(c => c.expected !== null)).toBe(true)
  })

  it('one unpaired surrogate or NUL in the thread does not block every later upload', async () => {
    // A preview cut through an emoji (`slice(0, 77)`) leaves half a pair;
    // Postgres refuses the row and, before the fix, every commit after it.
    const cutEmoji = 'x'.repeat(76) + '\u{1F64F}'.slice(0, 1)
    writeLocal([conversation('poisoned', [message({ id: 'old-phone', content: 'Amen \u0000 and thanks', timestamp: 1_789_500_000_000 })])], { preview: cutEmoji })
    appendLabChatTurn('bible', message({ id: 'new-phone', content: 'What does “converting the soul” mean?', timestamp: 1_790_000_000_000 }), 497, 0)
    const { cloud, state } = fakeRow([conversation('desktop', [message({ id: 'desktop-turn' })])], 3)
    const writer = createLabChatCloudWriter(cloud)
    await writer.sync('bible')
    expect(ids(state.value)).toEqual(['desktop-turn', 'old-phone', 'new-phone'])
    expect(postgresRejects(state.value)).toBe(false)
  })

  it('the Supabase cloud cleans the value it sends', async () => {
    const rpc = vi.fn((_name: string, args: { p_value: unknown }) => {
      const result = postgresRejects(args.p_value)
        ? { data: null, error: { message: 'unsupported Unicode escape sequence' } }
        : { data: [{ key: 'chat-history:bible', value: args.p_value, rev: 2, applied: true, conflict: false }], error: null }
      return withAbort(Promise.resolve(result))
    })
    const client = { rpc, from: vi.fn() } as unknown as Parameters<typeof createLabChatHistoryCloud>[1]
    const cloud = createLabChatHistoryCloud(USER, client)!
    const poisoned = [{ ...conversation('c', [message({ content: 'Psalm \u0000 19 \ud83d' })]), preview: '\udc4f' }]
    const result = await cloud.commit('bible', poisoned, 1)
    expect(result.applied).toBe(true)
    expect(result.row?.conversations[0].messages[0].content).toBe('Psalm  19 �')
  })

  it('a cloud call that never answers is abandoned, so the next refresh and the next turn still go out', async () => {
    vi.useFakeTimers()
    let hang = true
    const { cloud, state } = fakeRow([conversation('desktop', [message({ id: 'desktop-turn' })])], 2)
    const real = { read: cloud.read, commit: cloud.commit }
    cloud.read = (bookId) => hang ? new Promise(() => {}) : real.read(bookId)
    cloud.commit = (bookId, value, rev) => hang ? new Promise(() => {}) : real.commit(bookId, value, rev)
    const writer = createLabChatCloudWriter(cloud)
    const onUnavailable = vi.fn()
    const firstSync = writer.sync('bible', onUnavailable)
    writer.push('bible', appendLabChatTurn('bible', message({ id: 'phone-1', timestamp: 1_790_000_000_000 }), 497, 0))
    await vi.advanceTimersByTimeAsync(LAB_CHAT_CLOUD_TIMEOUT_MS + 10)
    await firstSync
    expect(onUnavailable).toHaveBeenCalledOnce()
    // The network is back: a later turn and a later refresh both land.
    hang = false
    writer.push('bible', appendLabChatTurn('bible', message({ id: 'phone-2', role: 'assistant', content: 'It restores.', timestamp: 1_790_000_001_000 }), 497, 0))
    await vi.advanceTimersByTimeAsync(10)
    await writer.sync('bible')
    expect(ids(state.value)).toEqual(['desktop-turn', 'phone-1', 'phone-2'])
    expect(ids(readLabBookChat('bible'))).toEqual(['desktop-turn', 'phone-1', 'phone-2'])
  })

  it('the phone history that never reached the cloud is uploaded on the phone’s next open', async () => {
    // Three weeks of phone-only turns sitting in the local mirror.
    const local: ChatConversation[] = []
    for (let day = 0; day < 20; day++) {
      const t = 1_789_700_000_000 + day * 86_400_000
      local.push(conversation(`conv_lab_bible_${t}`, [message({ id: `q${day}`, timestamp: t }), message({ id: `a${day}`, role: 'assistant', content: 'Answer', timestamp: t + 1 })]))
    }
    localStorage.setItem('tinct:chat-history:bible', JSON.stringify(local))
    const { cloud, state } = fakeRow([conversation('desktop', [message({ id: 'desktop-0918', timestamp: 1_789_690_000_000 })])], 40)
    await createLabChatCloudWriter(cloud).sync('bible')
    expect(ids(state.value)).toHaveLength(41)
    expect(ids(state.value)[0]).toBe('desktop-0918')
    expect(ids(state.value).at(-1)).toBe('a19')
  })
})

function writeLocal(conversations: ChatConversation[], patch: Partial<ChatConversation> = {}) {
  localStorage.setItem('tinct:chat-history:bible', JSON.stringify(conversations.map(c => ({ ...c, ...patch }))))
}

function withAbort<T>(promise: Promise<T>) {
  return Object.assign(promise, { abortSignal() { return promise } })
}
