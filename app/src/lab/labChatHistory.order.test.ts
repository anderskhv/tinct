// @vitest-environment jsdom

/**
 * Anders, iPhone, The Bible, 1 Maccabees 2 (10 Oct 2026): after several
 * Maccabees exchanges the thread "reloaded" and ended on an older Matthew
 * exchange; the new Maccabees turns were no longer at the bottom.
 *
 * The thread was built conversation by conversation, conversations ordered by
 * the time they *started*. A conversation that started earlier but was
 * continued today (Contents → continue a chapter's conversation, after which
 * the five-minute rule keeps appending to it) sorted above a conversation
 * that started later but ended long ago, so today's turns sat in the middle
 * and the old exchange became "the latest". The stored rows were complete;
 * only the order was wrong. These tests pin: the thread is ordered by each
 * message's own time, newest last, whatever the conversation grouping.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChatConversation, ChatMessage } from '../types'
import {
  LAB_CHAT_MAX_MESSAGES_PER_BOOK,
  appendLabChatTurn,
  mergeChatConversations,
  parseChatConversations,
  readLabBookChat,
  turnsFromConversations,
  writeLabBookChat,
} from './labChatHistory'

afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); vi.useRealTimers() })

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.parse('2026-10-10T09:00:00Z')
const MACCABEES_2 = 820
const MATTHEW_14 = 944

function msg(id: string, role: 'user' | 'assistant', content: string, timestamp: number, chapterNumber: number, extra: Partial<ChatMessage> = {}): ChatMessage {
  return { id, role, content, timestamp, bookId: 'bible', chapterNumber, isComplete: true, source: 'text', ...extra }
}

function conv(id: string, chapterNumber: number, messages: ChatMessage[]): ChatConversation {
  return {
    id, bookId: 'bible', chapterNumber,
    startTimestamp: messages[0].timestamp, endTimestamp: messages[messages.length - 1].timestamp,
    messages, preview: messages[0].content,
  }
}

/** Five days ago in 1 Maccabees 2; two days ago in Matthew 14. */
const oldMaccabees = conv('conv-mac-old', MACCABEES_2, [
  msg('mac-old-u', 'user', 'Who was Mattathias?', NOW - 5 * DAY, MACCABEES_2),
  msg('mac-old-a', 'assistant', 'A priest of Modein.', NOW - 5 * DAY + 1000, MACCABEES_2),
])
const matthew = conv('conv-matthew', MATTHEW_14, [
  msg('mt-u', 'user', 'Why doesn’t he scold his disciples for their lack of faith.', NOW - 2 * DAY, MATTHEW_14, { highlightedText: 'He gave thanks and broke them' }),
  msg('mt-a', 'assistant', 'He feeds them first.', NOW - 2 * DAY + 1000, MATTHEW_14),
])

describe('the thread is ordered by message time, newest last', () => {
  it('turns appended today to a conversation that began days ago stay at the bottom', () => {
    const continued: ChatConversation = {
      ...oldMaccabees,
      endTimestamp: NOW + 61_000,
      messages: [
        ...oldMaccabees.messages,
        msg('phinehas-u', 'user', 'Why does he mention Phinehas?', NOW, MACCABEES_2),
        msg('phinehas-a', 'assistant', 'Zeal for the law.', NOW + 1000, MACCABEES_2),
        msg('mattathias-u', 'user', 'What did Mattathias do next?', NOW + 60_000, MACCABEES_2),
        msg('mattathias-a', 'assistant', 'He fled to the hills.', NOW + 61_000, MACCABEES_2),
      ],
    }
    // Stored however (continued last, as appendLabChatTurn writes it; or sorted, as the merge writes it).
    for (const stored of [[matthew, continued], mergeChatConversations([], [matthew, continued])]) {
      const ids = turnsFromConversations(stored).map(turn => turn.id)
      expect(ids).toEqual(['mac-old-u', 'mac-old-a', 'mt-u', 'mt-a', 'phinehas-u', 'phinehas-a', 'mattathias-u', 'mattathias-a'])
    }
  })

  it('continuing a conversation from Contents, then chatting on, keeps every new turn last after the row is re-read', () => {
    vi.useFakeTimers({ now: NOW })
    writeLabBookChat('bible', [oldMaccabees, matthew])
    appendLabChatTurn('bible', msg('phinehas-u', 'user', 'Why does he mention Phinehas?', Date.now(), MACCABEES_2), MACCABEES_2, 3, 'conv-mac-old')
    appendLabChatTurn('bible', msg('phinehas-a', 'assistant', 'Zeal for the law.', Date.now() + 1000, MACCABEES_2), MACCABEES_2, 3, 'conv-mac-old')
    // The sheet was closed and opened with the Chat button: no explicit continuation any more.
    appendLabChatTurn('bible', msg('mattathias-u', 'user', 'What did Mattathias do next?', Date.now() + 60_000, MACCABEES_2), MACCABEES_2, 3)
    appendLabChatTurn('bible', msg('mattathias-a', 'assistant', 'He fled to the hills.', Date.now() + 61_000, MACCABEES_2), MACCABEES_2, 3)
    // A refresh re-reads (and the merge re-sorts) the row.
    const reread = mergeChatConversations([], readLabBookChat('bible'))
    const turns = turnsFromConversations(reread)
    expect(turns.slice(-4).map(turn => turn.id)).toEqual(['phinehas-u', 'phinehas-a', 'mattathias-u', 'mattathias-a'])
    expect(turns.map(turn => turn.id)).toHaveLength(8)
  })

  it('a stored message without a usable time keeps its place instead of becoming "now"', () => {
    const raw = [{ ...matthew, messages: [{ ...matthew.messages[0], timestamp: 'yesterday' }, matthew.messages[1]] }, conv('conv-today', MACCABEES_2, [msg('today-u', 'user', 'Phinehas?', NOW, MACCABEES_2)])]
    const parsed = parseChatConversations(raw, 'bible')
    expect(turnsFromConversations(parsed).map(turn => turn.id)).toEqual(['mt-u', 'mt-a', 'today-u'])
  })

  it('at the size cap, the conversation idle the longest goes first, never one that is still being added to', () => {
    const filler = Array.from({ length: LAB_CHAT_MAX_MESSAGES_PER_BOOK - 2 }, (_, i) => msg(`fill-${i}`, i % 2 ? 'assistant' : 'user', `Turn ${i}`, NOW - 4 * DAY + i, 1))
    const continued: ChatConversation = {
      ...oldMaccabees,
      endTimestamp: NOW,
      messages: [...oldMaccabees.messages, msg('phinehas-u', 'user', 'Why does he mention Phinehas?', NOW, MACCABEES_2)],
    }
    const merged = mergeChatConversations([], [continued, conv('conv-filler', 1, filler)])
    const ids = turnsFromConversations(merged).map(turn => turn.id)
    expect(ids).toContain('phinehas-u')
    expect(ids.length).toBeLessThanOrEqual(LAB_CHAT_MAX_MESSAGES_PER_BOOK)
  })
})
