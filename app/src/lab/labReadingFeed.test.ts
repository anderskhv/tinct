// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { emptyLabPositionState, type LabPositionState } from './labPosition'
import { emptyLabChatHistoryState, persistLabTalkTurn, readLabChatHistoryLocal } from './labTalkHistory'
import { buildLabReadingFeed, labFeedHighlightCards, labFeedPassageLine } from './labReadingFeed'

afterEach(() => {
  try { localStorage.removeItem('tinct:chat-history:lab') } catch { /* jsdom */ }
})

function romansState(): LabPositionState {
  return {
    ...emptyLabPositionState('test'),
    books: {
      romans: {
        bookId: 'romans',
        headerBook: 'Romans',
        chapterNumber: 1,
        sequentialChapter: 1047,
        paragraphIndex: 0,
        wordIndex: 2,
        updatedAt: 40_000,
        deviceId: 'test',
        rev: 2,
      },
    },
    lastSettledBookId: 'romans',
    lastSettledAt: 40_000,
    updatedAt: 40_000,
  }
}

const genesisCurrent = {
  bookId: 'genesis',
  headerBook: 'Genesis',
  chapterNumber: 1,
  sequentialChapter: 1,
  paragraphIndex: 0,
  line: labFeedPassageLine('In the beginning God created the heaven and the earth.'),
}

const romansCurrent = {
  bookId: 'romans',
  headerBook: 'Romans',
  chapterNumber: 1,
  sequentialChapter: 1047,
  paragraphIndex: 0,
  line: labFeedPassageLine('Paul, a servant of Jesus Christ, called to be an apostle.'),
}

describe('lab reading feed cards', () => {
  it('leads with the settled book as now and does not promote a Genesis peek', () => {
    const cards = buildLabReadingFeed({
      position: romansState(),
      chat: emptyLabChatHistoryState(),
      current: genesisCurrent,
    })
    expect(cards[0]).toMatchObject({
      kind: 'now',
      bookId: 'romans',
      kicker: 'Romans 1 · now',
      action: 'Continue',
    })
    expect(cards.some(card => card.kind === 'now' && card.bookId === 'genesis')).toBe(false)
    const peek = cards.find(card => card.kind === 'peek')
    expect(peek).toMatchObject({
      bookId: 'genesis',
      kicker: 'Genesis 1 · peeked',
    })
  })

  it('includes a stored talk as a card', () => {
    persistLabTalkTurn({
      id: 'keller',
      role: 'user',
      content: 'What would Keller say about this?',
      timestamp: 1_777_300_000_000,
      isComplete: true,
      source: 'text',
    }, 1, 0, { bookId: 'romans', headerBook: 'Romans' })
    const cards = buildLabReadingFeed({
      position: romansState(),
      chat: readLabChatHistoryLocal(),
      current: romansCurrent,
    })
    const talk = cards.find(card => card.kind === 'talk')
    expect(talk?.line).toContain('Keller')
    expect(talk?.bookId).toBe('romans')
  })

  it('leaves a highlights hook that is empty until a mark exists', () => {
    expect(labFeedHighlightCards([], genesisCurrent)).toEqual([])
    expect(labFeedHighlightCards(undefined, genesisCurrent)).toEqual([])
    const cards = labFeedHighlightCards([
      { id: 'm1', text: 'And God said, Let there be light.', paragraphIndex: 0 },
    ], genesisCurrent)
    expect(cards[0]?.kind).toBe('highlight')
    expect(cards[0]?.line).toContain('Let there be light')
  })
})
