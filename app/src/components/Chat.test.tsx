// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ChatConversation } from '../types'
import { Chat } from './Chat'

function renderChatWithHistory(conversation: ChatConversation, onNavigateToChapter = vi.fn()) {
  render(
    <Chat
      messages={[]}
      isLoading={false}
      onSendMessage={vi.fn()}
      onClear={vi.fn()}
      pendingHighlight={null}
      onClearHighlight={vi.fn()}
      onCopyToNotes={vi.fn()}
      chapterTitle="Jeremiah 10"
      chapterLabels={[]}
      chapterLabelByNumber={{ 755: 'Jeremiah 10' }}
      onNavigateToChapter={onNavigateToChapter}
      chatConversations={[conversation]}
    />,
  )
  return onNavigateToChapter
}

describe('Chat history', () => {
  it('navigates the reader to a conversation location when opening a past chat', () => {
    const conversation: ChatConversation = {
      id: 'conv-jeremiah',
      bookId: 'bible',
      chapterNumber: 755,
      paragraphIndex: 3,
      startTimestamp: 1_777_300_000_000,
      endTimestamp: 1_777_300_001_000,
      preview: 'Where does the divine voice begin?',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Where does the divine voice begin?',
          timestamp: 1_777_300_000_000,
          bookId: 'bible',
          chapterNumber: 755,
          paragraphIndex: 3,
        },
      ],
    }
    const onNavigateToChapter = renderChatWithHistory(conversation)

    fireEvent.click(screen.getByRole('button', { name: /Where does the divine voice begin/i }))

    expect(onNavigateToChapter).toHaveBeenCalledWith(755, 3)
    expect(screen.getAllByText('Where does the divine voice begin?')).toHaveLength(2)
    expect(screen.queryByText(/I'm here as you read/)).toBeNull()
  })
})
