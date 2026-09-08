// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChatConversation, ChatMessage } from '../types'
import {
  appendLabChatTurn,
  createLabChatCloudWriter,
  labChatHistoryKey,
  legacyLabBookToRegistryId,
  mergeChatConversations,
  mergeLegacyLabChatState,
  migrateLegacyLabChatHistoryCloud,
  migrateLegacyLabChatHistoryLocal,
  parseChatConversations,
  readAllLabBookChats,
  readLabBookChat,
  syncLabBookChatWithCloud,
  turnsFromConversations,
  writeLabBookChat,
  type LabChatHistoryCloud,
} from './labChatHistory'
import { LAB_CHAT_HISTORY_STORAGE_KEY, type LabChatHistoryState } from './labTalkHistory'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

function message(patch: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'm1',
    role: 'user',
    content: 'What would Keller say about this?',
    timestamp: 1_777_300_000_000,
    isComplete: true,
    source: 'text',
    ...patch,
  }
}

function conversation(id: string, bookId: string, chapterNumber: number, messages: ChatMessage[], patch: Partial<ChatConversation> = {}): ChatConversation {
  return {
    id,
    bookId,
    chapterNumber,
    startTimestamp: messages[0].timestamp,
    endTimestamp: messages[messages.length - 1].timestamp,
    messages: messages.map(m => ({ ...m, bookId, chapterNumber: m.chapterNumber ?? chapterNumber })),
    preview: messages[0].content.slice(0, 40),
    ...patch,
  }
}

/** In-memory stand-in for the versioned user_data row. */
function fakeCloud(initial: ChatConversation[] | null = null) {
  const rows = new Map<string, { conversations: ChatConversation[]; rev: number }>()
  if (initial) rows.set('bible', { conversations: initial, rev: 3 })
  const commits: Array<{ bookId: string; expectedRev: number | null; count: number }> = []
  const cloud: LabChatHistoryCloud = {
    async read(bookId) {
      const row = rows.get(bookId)
      return row ? { conversations: row.conversations, rev: row.rev } : null
    },
    async commit(bookId, conversations, expectedRev) {
      commits.push({ bookId, expectedRev, count: conversations.flatMap(c => c.messages).length })
      const row = rows.get(bookId)
      const currentRev = row?.rev ?? 0
      if (row && expectedRev !== currentRev) {
        return { applied: false, conflict: true, row: { conversations: row.conversations, rev: row.rev } }
      }
      const next = { conversations, rev: currentRev + 1 }
      rows.set(bookId, next)
      return { applied: true, conflict: false, row: { conversations, rev: next.rev } }
    },
  }
  return { cloud, rows, commits }
}

describe('lab chat history: one row per book, shared with the classic reader', () => {
  it('writes and reads the classic key and shape', () => {
    appendLabChatTurn('odyssey', message({ id: 'u1' }), 3, 2)
    appendLabChatTurn('odyssey', message({ id: 'a1', role: 'assistant', content: 'Homer keeps Odysseus offstage for four books.', timestamp: 1_777_300_000_100 }), 3, 2)
    expect(labChatHistoryKey('odyssey')).toBe('chat-history:odyssey')
    const raw = JSON.parse(localStorage.getItem('tinct:chat-history:odyssey') || 'null') as ChatConversation[]
    expect(raw).toHaveLength(1)
    expect(raw[0].bookId).toBe('odyssey')
    expect(raw[0].chapterNumber).toBe(3)
    expect(raw[0].messages.map(m => m.id)).toEqual(['u1', 'a1'])
    expect(raw[0].messages.every(m => m.bookId === 'odyssey')).toBe(true)
    expect(readLabBookChat('odyssey')[0].messages[1].content).toContain('Homer')
    expect(localStorage.getItem(LAB_CHAT_HISTORY_STORAGE_KEY)).toBeNull()
  })

  it('shows a conversation the classic reader stored, including its summary', () => {
    const classic = conversation('conv_1', 'odyssey', 5, [
      message({ id: 'c1', content: 'Why does Athena disguise herself?', timestamp: 1_777_000_000_000 }),
      message({ id: 'c2', role: 'assistant', content: 'Because the gods test before they help.', timestamp: 1_777_000_000_500 }),
    ], { summary: 'Athena tests before helping.' })
    localStorage.setItem('tinct:chat-history:odyssey', JSON.stringify([classic]))
    const stored = readLabBookChat('odyssey')
    expect(stored[0].summary).toBe('Athena tests before helping.')
    expect(turnsFromConversations(stored).map(t => [t.role, t.chapterNumber])).toEqual([['user', 5], ['assistant', 5]])
  })

  it('rejects cross-book messages, dividers and error rows on read, as the classic cleanup does', () => {
    const parsed = parseChatConversations([
      {
        id: 'conv_x',
        bookId: 'macbeth',
        chapterNumber: 2,
        startTimestamp: 1,
        endTimestamp: 9,
        preview: '',
        messages: [
          { id: 'd', role: 'assistant', content: '', timestamp: 2, chapterDivider: 3 },
          { id: 'e', role: 'assistant', content: 'Something went wrong', timestamp: 3, refreshAction: true },
          { id: 'other', role: 'user', content: 'from another book', timestamp: 4, bookId: 'hamlet' },
          { id: 'ok', role: 'user', content: 'Is the dagger real?', timestamp: 5 },
        ],
      },
      { id: 'conv_wrong_book', bookId: 'hamlet', chapterNumber: 1, messages: [{ id: 'h', role: 'user', content: 'x', timestamp: 1 }] },
    ], 'macbeth')
    expect(parsed).toHaveLength(1)
    expect(parsed[0].messages.map(m => m.id)).toEqual(['ok'])
    expect(parseChatConversations({ books: {} }, 'macbeth')).toEqual([])
  })

  it('never writes a conversation under the wrong book', () => {
    writeLabBookChat('odyssey', [conversation('c', 'iliad', 1, [message()])])
    expect(localStorage.getItem('tinct:chat-history:odyssey')).toBeNull()
  })

  it('does not persist a voice greeting finalized twice or stuck to itself', () => {
    for (const [id, content, at] of [['g1', "I'm listening.", 0], ['g2', "I'm listening.", 50], ['g3', "I'm listening.I'm listening.", 80]] as const) {
      appendLabChatTurn('bible', message({ id, role: 'assistant', content, timestamp: 1_777_500_000_000 + at, bookId: 'lab', source: 'voice' }), 1, 0)
    }
    expect(readLabBookChat('bible')[0].messages.map(m => m.content)).toEqual(["I'm listening."])
  })

  it('lists every book on the device for the companion memory', () => {
    appendLabChatTurn('bible', message({ id: 'b1' }), 1054, 0)
    appendLabChatTurn('odyssey', message({ id: 'o1', content: 'Who is Mentes?' }), 1, 0)
    localStorage.setItem('tinct:chat-history:lab', '{"books":{}}')
    expect(readAllLabBookChats().map(c => c.bookId).sort()).toEqual(['bible', 'odyssey'])
  })
})

describe('lab chat history merge', () => {
  it('unions two copies by timestamp with no duplicate messages and keeps summaries', () => {
    const shared = message({ id: 's1', content: 'Shared question', timestamp: 1_000 })
    const a = [
      conversation('conv_a', 'bible', 1, [shared, message({ id: 'a2', role: 'assistant', content: 'Streaming', timestamp: 1_100, isComplete: false })]),
      conversation('conv_c', 'bible', 3, [message({ id: 'c1', content: 'Later on this device', timestamp: 5_000 })]),
    ]
    const b = [
      conversation('conv_a', 'bible', 1, [shared, message({ id: 'a2', role: 'assistant', content: 'Streaming done.', timestamp: 1_100, isComplete: true })], { summary: 'Opening.' }),
      conversation('conv_b', 'bible', 2, [message({ id: 'b1', content: 'Meanwhile on the phone', timestamp: 3_000 })]),
      conversation('conv_d', 'bible', 4, [shared]),
    ]
    const merged = mergeChatConversations(a, b)
    expect(merged.map(c => c.id)).toEqual(['conv_a', 'conv_b', 'conv_c'])
    expect(merged[0].summary).toBe('Opening.')
    expect(merged[0].messages.map(m => m.content)).toEqual(['Shared question', 'Streaming done.'])
    expect(merged[0].messages[1].isComplete).toBe(true)
    const ids = merged.flatMap(c => c.messages.map(m => m.id))
    expect(new Set(ids).size).toBe(ids.length)
    expect(mergeChatConversations(merged, merged)).toEqual(merged)
  })
})

describe('legacy lab blob migration', () => {
  function legacyState(): LabChatHistoryState {
    return {
      updatedAt: 1_777_300_000_500,
      books: {
        romans: {
          bookId: 'romans',
          headerBook: 'Romans',
          updatedAt: 1_777_300_000_100,
          conversations: [conversation('conv_lab_romans_1', 'romans', 1054, [
            message({ id: 'r1', content: 'What would Keller say?', timestamp: 1_777_300_000_000 }),
            message({ id: 'r2', role: 'assistant', content: 'Grace first.', timestamp: 1_777_300_000_100 }),
          ])],
        },
        genesis: {
          bookId: 'genesis',
          headerBook: 'Genesis',
          updatedAt: 1_777_200_000_000,
          conversations: [conversation('conv_lab_genesis_1', 'genesis', 1, [
            message({ id: 'g1', content: 'Who is speaking in the beginning?', timestamp: 1_777_200_000_000 }),
          ])],
        },
        'the-odyssey': {
          bookId: 'the-odyssey',
          headerBook: 'The Odyssey',
          updatedAt: 1_777_100_000_000,
          conversations: [conversation('conv_lab_the-odyssey_1', 'the-odyssey', 1, [
            message({ id: 'o1', content: 'Who is Mentes?', timestamp: 1_777_100_000_000 }),
          ])],
        },
      },
    }
  }

  it('maps legacy keys to registry ids: Bible books to bible, title slugs to the registry id', () => {
    expect(legacyLabBookToRegistryId('romans', 'Romans')).toBe('bible')
    expect(legacyLabBookToRegistryId('genesis')).toBe('bible')
    expect(legacyLabBookToRegistryId('the-odyssey', 'The Odyssey')).toBe('odyssey')
    expect(legacyLabBookToRegistryId('macbeth')).toBe('macbeth')
    expect(legacyLabBookToRegistryId('lab')).toBeNull()
  })

  it('folds the device blob into per-book rows once, ordered by time, and removes it', () => {
    localStorage.setItem(LAB_CHAT_HISTORY_STORAGE_KEY, JSON.stringify(legacyState()))
    // A classic conversation already in the per-book row survives the merge.
    appendLabChatTurn('bible', message({ id: 'classic', content: 'From the classic reader', timestamp: 1_777_250_000_000 }), 30, 0)

    expect(migrateLegacyLabChatHistoryLocal().sort()).toEqual(['bible', 'odyssey'])
    const bible = readLabBookChat('bible')
    expect(bible.map(c => c.id)).toEqual(['conv_lab_genesis_1', 'conv_lab_bible_1777250000000', 'conv_lab_romans_1'])
    expect(bible.every(c => c.bookId === 'bible' && c.messages.every(m => m.bookId === 'bible'))).toBe(true)
    expect(turnsFromConversations(bible).map(t => t.chapterNumber)).toEqual([1, 30, 1054, 1054])
    expect(readLabBookChat('odyssey')[0].messages[0].content).toBe('Who is Mentes?')
    expect(localStorage.getItem(LAB_CHAT_HISTORY_STORAGE_KEY)).toBeNull()
    // Second run: nothing to do, nothing duplicated.
    expect(migrateLegacyLabChatHistoryLocal()).toEqual([])
    expect(readLabBookChat('bible').flatMap(c => c.messages)).toHaveLength(4)
  })

  it('merging the same legacy state twice adds nothing', () => {
    mergeLegacyLabChatState(legacyState())
    const once = readLabBookChat('bible')
    mergeLegacyLabChatState(legacyState())
    expect(readLabBookChat('bible')).toEqual(once)
  })

  it('folds the retired KV blob in once per account', async () => {
    const fetchLegacy = vi.fn(async () => legacyState())
    expect((await migrateLegacyLabChatHistoryCloud({ userId: 'u1', fetchLegacy })).sort()).toEqual(['bible', 'odyssey'])
    expect(await migrateLegacyLabChatHistoryCloud({ userId: 'u1', fetchLegacy })).toEqual([])
    expect(fetchLegacy).toHaveBeenCalledTimes(1)
    expect(readLabBookChat('bible').flatMap(c => c.messages)).toHaveLength(3)
  })
})

describe('lab chat history cloud sync (versioned user_data row)', () => {
  it('signed out: nothing leaves the device', () => {
    const { cloud, commits } = fakeCloud()
    appendLabChatTurn('bible', message({ id: 'u1' }), 1, 0)
    expect(commits).toHaveLength(0)
    expect(readLabBookChat('bible')).toHaveLength(1)
    void cloud
  })

  it('open: merges the cloud row into the local mirror and commits only when local adds something', async () => {
    const cloudConv = conversation('conv_cloud', 'bible', 1054, [message({ id: 'cloud1', content: 'Asked on the desktop', timestamp: 1_777_000_000_000 })])
    const { cloud, commits, rows } = fakeCloud([cloudConv])
    const revs = new Map<string, number>()

    // Nothing local: adopt the row, no write.
    const first = await syncLabBookChatWithCloud({ bookId: 'bible', cloud, revs })
    expect(first.map(c => c.id)).toEqual(['conv_cloud'])
    expect(readLabBookChat('bible').map(c => c.id)).toEqual(['conv_cloud'])
    expect(commits).toHaveLength(0)
    expect(revs.get('bible')).toBe(3)

    // A local turn from before sign-in: commit the union with the row's rev.
    appendLabChatTurn('bible', message({ id: 'local1', content: 'Asked on the phone offline', timestamp: 1_777_100_000_000 }), 1, 0)
    const second = await syncLabBookChatWithCloud({ bookId: 'bible', cloud, revs })
    expect(second.map(c => c.id)).toEqual(['conv_cloud', 'conv_lab_bible_1777100000000'])
    expect(commits).toEqual([{ bookId: 'bible', expectedRev: 3, count: 2 }])
    expect(rows.get('bible')?.rev).toBe(4)
    expect(revs.get('bible')).toBe(4)
  })

  it('conflict: adopts the server row, merges and retries once instead of overwriting', async () => {
    const { cloud, commits, rows } = fakeCloud([conversation('conv_cloud', 'bible', 1, [message({ id: 'c1', timestamp: 1_000 })])])
    const revs = new Map<string, number>([['bible', 1]]) // stale: the server is at rev 3
    appendLabChatTurn('bible', message({ id: 'p1', content: 'Phone turn', timestamp: 2_000 }), 1, 0)
    const writer = createLabChatCloudWriter(cloud, revs)
    writer.push('bible', readLabBookChat('bible'))
    await vi.waitFor(() => expect(rows.get('bible')?.rev).toBe(4))
    expect(commits.map(c => c.expectedRev)).toEqual([1, 3])
    const ids = rows.get('bible')!.conversations.flatMap(c => c.messages.map(m => m.id))
    expect(ids).toEqual(['c1', 'p1'])
    expect(readLabBookChat('bible').flatMap(c => c.messages.map(m => m.id))).toEqual(['c1', 'p1'])
    expect(writer.isDirty()).toBe(false)
  })

  it('a failed commit keeps the turn locally and marks the writer dirty', async () => {
    const cloud: LabChatHistoryCloud = {
      async read() { return null },
      async commit() { throw new Error('offline') },
    }
    const writer = createLabChatCloudWriter(cloud)
    const next = appendLabChatTurn('bible', message({ id: 'u1' }), 1, 0)
    writer.push('bible', next)
    await vi.waitFor(() => expect(writer.isDirty()).toBe(true))
    expect(readLabBookChat('bible')).toHaveLength(1)
  })
})

describe('explicit contents continuation', () => {
  it('appends to the selected old conversation without losing its ID or unrelated threads', () => {
    const older = conversation('older', 'bible', 44, [message({ id: 'old-question', content: 'Why the cup?', chapterNumber: 44 })])
    const newer = conversation('newer', 'bible', 45, [message({ id: 'new-question', timestamp: 1_777_400_000_000 })])
    writeLabBookChat('bible', [older, newer])
    const next = appendLabChatTurn('bible', message({ id: 'follow-up', content: 'And what about Judah?', timestamp: 1_778_000_000_000 }), 44, 2, 'older')
    expect(next.find(item => item.id === 'older')?.messages.map(item => item.id)).toEqual(['old-question', 'follow-up'])
    expect(next.find(item => item.id === 'newer')).toEqual(newer)
    expect(next).toHaveLength(2)
  })
  it('rejects a missing or wrong-chapter continuation', () => {
    const target = conversation('older', 'bible', 44, [message()])
    writeLabBookChat('bible', [target])
    expect(appendLabChatTurn('bible', message({ id: 'bad' }), 45, 0, 'older')).toEqual([target])
    expect(appendLabChatTurn('odyssey', message({ id: 'bad' }), 44, 0, 'older')).toEqual([])
    expect(readLabBookChat('bible')).toEqual([target])
  })
  it('reports cloud unavailability while preserving the local mirror', async () => {
    const target = conversation('older', 'bible', 44, [message()])
    writeLabBookChat('bible', [target])
    const onUnavailable = vi.fn()
    const result = await syncLabBookChatWithCloud({ bookId: 'bible', cloud: { read: vi.fn().mockRejectedValue(new Error('offline')), commit: vi.fn() }, onUnavailable })
    expect(result).toEqual([target]); expect(onUnavailable).toHaveBeenCalledOnce()
  })
})
