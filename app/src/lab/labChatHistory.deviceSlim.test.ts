// @vitest-environment jsdom

/**
 * A phone's storage for the site (about 5 MB) full of long threads (iPhone, 31 Oct 2026): every new answer read as
 * "could not be saved on this device". The device copy now gives up the older conversations the account holds as
 * they are, and nothing leaves the account.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChatConversation } from '../types'
import {
  LAB_CHAT_DEVICE_RECENT,
  createLabChatCloudWriter,
  forgetLabChatHeldInAccount,
  labBookChatStored,
  readLabBookChat,
  writeLabBookChat,
  type LabChatHistoryCloud,
} from './labChatHistory'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  forgetLabChatHeldInAccount()
})

const T0 = 1_789_000_000_000

function conversation(n: number): ChatConversation {
  const at = T0 + n * 600_000
  return {
    id: `conv-${n}`, bookId: 'bible', chapterNumber: 497, startTimestamp: at, endTimestamp: at + 1000, preview: `Question ${n}`,
    messages: [
      { id: `q-${n}`, role: 'user', content: `Question ${n}?`, timestamp: at, bookId: 'bible', chapterNumber: 497, isComplete: true, source: 'text' },
      { id: `a-${n}`, role: 'assistant', content: `Answer ${n}. ${'word '.repeat(200)}`, timestamp: at + 1000, bookId: 'bible', chapterNumber: 497, isComplete: true },
    ],
  }
}
const thread = (from: number, to: number) => Array.from({ length: to - from }, (_, i) => conversation(from + i))

/** A device whose storage holds at most `chars` per value, like a nearly full phone. */
function fullDevice(chars: number) {
  const setItem = Storage.prototype.setItem
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, value: string) {
    if (value.length > chars) throw Object.assign(new Error('full'), { name: 'QuotaExceededError' })
    return setItem.call(this, key, value)
  })
}

function fakeRow(initial: ChatConversation[]) {
  const state = { value: initial, rev: 1 }
  const cloud: LabChatHistoryCloud = {
    async read() { return { conversations: JSON.parse(JSON.stringify(state.value)), rev: state.rev } },
    async commit(_bookId, conversations, expected) {
      if (expected !== state.rev) return { applied: false, conflict: true, row: { conversations: JSON.parse(JSON.stringify(state.value)), rev: state.rev } }
      state.value = JSON.parse(JSON.stringify(conversations))
      state.rev += 1
      return { applied: true, conflict: false, row: { conversations: JSON.parse(JSON.stringify(state.value)), rev: state.rev } }
    },
  }
  return { cloud, state }
}

describe('a full phone keeps what the account lacks', () => {
  it('drops the older conversations the account holds, keeps the new answer, and the account keeps everything', async () => {
    const old = thread(0, 80)
    const { cloud, state } = fakeRow(old)
    const writer = createLabChatCloudWriter(cloud)
    await writer.sync('bible')
    fullDevice(JSON.stringify(thread(0, 40)).length)

    const next = [...old, conversation(80)]
    expect(writeLabBookChat('bible', next)).toBeNull()
    const device = readLabBookChat('bible').map(c => c.id)
    expect(device).toContain('conv-80')
    expect(device).toHaveLength(LAB_CHAT_DEVICE_RECENT)
    expect(device).not.toContain('conv-0')
    // The save is checked against the device copy and the account together.
    expect(labBookChatStored('bible', next)).toBe(true)

    // A margin view pushes the slim device copy: the account row still has every conversation.
    writer.push('bible', readLabBookChat('bible'))
    await vi.waitFor(() => expect(state.value.map(c => c.id)).toContain('conv-80'))
    expect(state.value.map(c => c.id)).toEqual(next.map(c => c.id))
  })

  it('never slims a copy the account has not confirmed, nor a signed-out reader\'s', () => {
    fullDevice(JSON.stringify(thread(0, 40)).length)
    expect(writeLabBookChat('bible', thread(0, 81))).toBe('quota')
    expect(readLabBookChat('bible')).toEqual([])
    expect(labBookChatStored('bible', thread(0, 81))).toBe(false)
  })

  it('a new answer the account lacks stays on the device even when it is old', async () => {
    const { cloud } = fakeRow(thread(0, 80))
    await createLabChatCloudWriter(cloud).sync('bible')
    fullDevice(JSON.stringify(thread(0, 40)).length)
    const unsent = { ...conversation(-1), id: 'unsent' }
    expect(writeLabBookChat('bible', [unsent, ...thread(0, 80)])).toBeNull()
    expect(readLabBookChat('bible').map(c => c.id)).toContain('unsent')
  })
})
