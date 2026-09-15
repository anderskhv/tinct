import { describe, expect, it } from 'vitest'
import type { ChatConversation, ChatMessage } from '../types'
import { mergeChatHistoryValues } from './chatHistoryMerge'

function message(id: string, timestamp: number, content: string, bookId = 'bible'): ChatMessage {
  return { id, timestamp, content, bookId, chapterNumber: 3, role: 'user', isComplete: true }
}

function conversation(id: string, messages: ChatMessage[], bookId = 'bible'): ChatConversation {
  return {
    id,
    bookId,
    chapterNumber: 3,
    startTimestamp: messages[0]?.timestamp ?? 0,
    endTimestamp: messages.at(-1)?.timestamp ?? 0,
    messages,
    preview: messages[0]?.content ?? '',
  }
}

describe('mergeChatHistoryValues', () => {
  it('unions a stale mobile snapshot with newer desktop and mobile messages', () => {
    const june = message('june', 1, 'What does Psalm 27 mean?')
    const desktop = message('desktop', 3, 'Why did John eat locusts and honey?')
    const mobile = message('mobile', 2, 'Who is speaking here?')

    const merged = mergeChatHistoryValues(
      [conversation('shared', [june, desktop])],
      [conversation('shared', [june, mobile])],
      'bible',
    )

    expect(merged?.[0].messages.map(item => item.id)).toEqual(['june', 'mobile', 'desktop'])
    expect(merged?.[0].endTimestamp).toBe(3)
  })

  it('retains conversations created independently on two devices', () => {
    const merged = mergeChatHistoryValues(
      [conversation('desktop', [message('d', 3, 'Desktop')])],
      [conversation('mobile', [message('m', 2, 'Mobile')])],
      'bible',
    )

    expect(merged?.map(item => item.id)).toEqual(['mobile', 'desktop'])
  })

  it('prefers the complete copy of a repeated streaming message', () => {
    const partial = { ...message('same', 1, 'Locusts and'), role: 'assistant' as const, isComplete: false }
    const complete = { ...partial, content: 'Locusts and wild honey.', isComplete: true }

    const merged = mergeChatHistoryValues(
      [conversation('shared', [partial])],
      [conversation('shared', [complete])],
      'bible',
    )

    expect(merged?.[0].messages).toEqual([complete])
  })

  it('fails closed when either history contains another book', () => {
    expect(mergeChatHistoryValues(
      [conversation('shared', [message('wrong', 1, 'Wrong book', 'odyssey')], 'odyssey')],
      [conversation('shared', [message('right', 2, 'Right book')])],
      'bible',
    )).toBeNull()
  })
})
