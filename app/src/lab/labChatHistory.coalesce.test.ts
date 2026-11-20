// @vitest-environment jsdom

/**
 * Disk IO (22 Oct 2026): every chat commit rewrites the book's whole thread in
 * `user_data`, and a question and its answer were two commits. With a
 * coalescing window the turns of one exchange share a commit, while nothing a
 * reader said is lost: hide/pagehide flush, a turn the device could not store
 * goes at once, and a sync that ran meanwhile is never undone.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChatConversation, ChatMessage } from '../types'
import {
  LAB_CHAT_COMMIT_COALESCE_MS,
  appendLabChatTurn,
  createLabChatCloudWriter,
  type LabChatHistoryCloud,
} from './labChatHistory'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => {
  localStorage.clear()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function message(id: string, patch: Partial<ChatMessage> = {}): ChatMessage {
  return { id, role: 'user', content: `Turn ${id}`, timestamp: 1_790_000_000_000, isComplete: true, source: 'text', ...patch }
}

/** In-memory `user_data` row with commit_user_data semantics (expected rev). */
function fakeRow(initial: ChatConversation[] | null = null) {
  const state = { value: initial, rev: initial ? 1 : 0 }
  const commits: ChatConversation[][] = []
  const cloud: LabChatHistoryCloud = {
    async read() { return state.value ? { conversations: JSON.parse(JSON.stringify(state.value)), rev: state.rev } : null },
    async commit(_bookId, conversations, expected) {
      commits.push(JSON.parse(JSON.stringify(conversations)))
      if (expected !== null && expected !== state.rev) {
        return { applied: false, conflict: true, row: state.value ? { conversations: JSON.parse(JSON.stringify(state.value)), rev: state.rev } : null }
      }
      state.value = JSON.parse(JSON.stringify(conversations))
      state.rev += 1
      return { applied: true, conflict: false, row: { conversations: JSON.parse(JSON.stringify(state.value)), rev: state.rev } }
    },
  }
  return { cloud, state, commits }
}

const ids = (conversations: ChatConversation[] | null) => (conversations ?? []).flatMap(c => c.messages.map(m => m.id))

describe('coalesced chat commits', () => {
  it('a question and its answer within the window are one commit holding both', async () => {
    const { cloud, state, commits } = fakeRow()
    const writer = createLabChatCloudWriter(cloud, new Map(), { coalesceMs: LAB_CHAT_COMMIT_COALESCE_MS })
    writer.push('bible', appendLabChatTurn('bible', message('q1'), 497, 0))
    await vi.advanceTimersByTimeAsync(5_000)
    writer.push('bible', appendLabChatTurn('bible', message('a1', { role: 'assistant', timestamp: 1_790_000_005_000 }), 497, 0))
    await vi.advanceTimersByTimeAsync(1_000)
    expect(commits).toHaveLength(0)
    await vi.advanceTimersByTimeAsync(LAB_CHAT_COMMIT_COALESCE_MS)
    expect(commits).toHaveLength(1)
    expect(ids(state.value)).toEqual(['q1', 'a1'])
    expect(writer.pending()).toEqual([])
  })

  it('flush (hide, pagehide, unmount) sends what is waiting at once', async () => {
    const { cloud, state, commits } = fakeRow()
    const writer = createLabChatCloudWriter(cloud, new Map(), { coalesceMs: LAB_CHAT_COMMIT_COALESCE_MS })
    writer.push('bible', appendLabChatTurn('bible', message('q1'), 497, 0))
    writer.flush()
    await vi.advanceTimersByTimeAsync(0)
    expect(commits).toHaveLength(1)
    expect(ids(state.value)).toEqual(['q1'])
    // The timer it replaced does not send it again.
    await vi.advanceTimersByTimeAsync(LAB_CHAT_COMMIT_COALESCE_MS * 2)
    expect(commits).toHaveLength(1)
  })

  it('a turn the device could not store is committed straight away, with any waiting turn', async () => {
    const { cloud, state, commits } = fakeRow()
    const writer = createLabChatCloudWriter(cloud, new Map(), { coalesceMs: LAB_CHAT_COMMIT_COALESCE_MS })
    const first = appendLabChatTurn('bible', message('q1'), 497, 0)
    writer.push('bible', first)
    // Storage full from here on: the device copy keeps only q1.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Full', 'QuotaExceededError') })
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const second = appendLabChatTurn('bible', message('a1', { role: 'assistant', timestamp: 1_790_000_001_000 }), 497, 0, undefined, first)
    writer.push('bible', second, { now: true })
    await vi.advanceTimersByTimeAsync(0)
    expect(commits).toHaveLength(1)
    expect(ids(state.value)).toEqual(['q1', 'a1'])
  })

  it('a sync that already put the waiting turns in the row leaves nothing to commit', async () => {
    const { cloud, state, commits } = fakeRow()
    const writer = createLabChatCloudWriter(cloud, new Map(), { coalesceMs: LAB_CHAT_COMMIT_COALESCE_MS })
    writer.push('bible', appendLabChatTurn('bible', message('q1'), 497, 0))
    // The tab came back: the refresh merges the device copy into the row.
    await writer.sync('bible')
    expect(commits).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(LAB_CHAT_COMMIT_COALESCE_MS)
    expect(commits).toHaveLength(1)
    expect(ids(state.value)).toEqual(['q1'])
  })

  it('the waiting value is merged with the device copy, so turns another device sent through a sync are kept', async () => {
    const other = appendLabChatTurn('bible', message('desktop', { timestamp: 1_789_000_000_000 }), 497, 0)
    localStorage.clear()
    const { cloud, state } = fakeRow(other)
    const writer = createLabChatCloudWriter(cloud, new Map(), { coalesceMs: LAB_CHAT_COMMIT_COALESCE_MS })
    // This device's turn is built before it has seen the desktop's turn.
    writer.push('bible', appendLabChatTurn('bible', message('phone'), 497, 0))
    await writer.sync('bible')
    writer.push('bible', appendLabChatTurn('bible', message('phone-2', { role: 'assistant', timestamp: 1_790_000_001_000 }), 497, 0))
    await vi.advanceTimersByTimeAsync(LAB_CHAT_COMMIT_COALESCE_MS)
    expect(ids(state.value)).toEqual(['desktop', 'phone', 'phone-2'])
  })

  it('without a window every push commits at once, as before', async () => {
    const { cloud, commits } = fakeRow()
    const writer = createLabChatCloudWriter(cloud)
    writer.push('bible', appendLabChatTurn('bible', message('q1'), 497, 0))
    await vi.advanceTimersByTimeAsync(0)
    expect(commits).toHaveLength(1)
  })
})
