import { describe, expect, it } from 'vitest'
import { emptyLabPositionState, type LabPositionState } from './labPosition'
import type { ReadingMemoryState, ReadingSession } from '../readingMemory'
import { labChapterStatusLine, labChapterStatuses, labFinishedChapterSet, labLastReadAt } from './labChapterStatus'

function session(id: string, chapterNumber: number, state: ReadingSession['state'], at: number, extra: Partial<ReadingSession> = {}): ReadingSession {
  return {
    id, seq: 1, deviceId: 'phone', owner: null, state,
    anchor: {
      bookId: 'bible', editionKey: 'kjv-en', chapterNumber, chapterLabel: `Jeremiah ${chapterNumber - 745}`, page: 2, totalPages: 6,
      paragraphIndex: 0, wordIndex: 3,
      range: { startParagraphIndex: 0, startWordIndex: 0, startCharOffset: 0, endParagraphIndex: 0, endWordIndex: 3, endCharOffset: 12, firstWords: 'The word', lastWords: 'the Lord' },
    },
    startedAt: at - 1000, lastActiveAt: at, endedAt: at, completedAt: state === 'completed' ? at : null,
    ...extra,
  }
}
function memory(...sessions: ReadingSession[]): ReadingMemoryState {
  return { v: 1, updatedAt: 0, sessions: Object.fromEntries(sessions.map(item => [item.id, item])) }
}
const chapters = [746, 747, 780, 781, 782]

describe('lab chapter statuses', () => {
  it('has three truthful states: finished (flag or completed session), in progress (session or pin), not started', () => {
    const position: LabPositionState = {
      ...emptyLabPositionState('phone'),
      books: { jeremiah: { bookId: 'jeremiah', headerBook: 'Jeremiah', chapterNumber: 37, sequentialChapter: 782, paragraphIndex: 1, wordIndex: 0, pageIndex: 3, updatedAt: 3_000, deviceId: 'phone', rev: 9 } },
    }
    const statuses = labChapterStatuses({
      bookId: 'bible',
      chapterNumbers: chapters,
      finished: new Set([747]),
      memory: memory(session('a', 780, 'completed', 1_000), session('b', 781, 'progressed', 2_000)),
      position,
    })
    expect(statuses.get(746)).toBeUndefined()
    expect(statuses.get(747)).toEqual({ kind: 'finished', page: undefined, totalPages: undefined, lastReadAt: undefined, finishedAt: undefined })
    expect(statuses.get(780)).toMatchObject({ kind: 'finished', finishedAt: 1_000, lastReadAt: 1_000 })
    expect(statuses.get(781)).toMatchObject({ kind: 'in-progress', page: 2, totalPages: 6, lastReadAt: 2_000 })
    expect(statuses.get(782)).toMatchObject({ kind: 'in-progress', page: 4, lastReadAt: 3_000 })
    expect([...labFinishedChapterSet(statuses)].sort()).toEqual([747, 780])
    expect(labLastReadAt(statuses)).toBe(3_000)
  })

  it('never counts another account\'s sessions or another book\'s chapters', () => {
    const statuses = labChapterStatuses({
      bookId: 'bible',
      chapterNumbers: chapters,
      finished: new Set(),
      memory: memory(
        session('theirs', 780, 'completed', 1_000, { owner: 'someone-else' }),
        session('mine', 781, 'completed', 1_000, { owner: 'me' }),
        session('odyssey', 782, 'completed', 1_000, { anchor: { ...session('x', 782, 'completed', 1).anchor, bookId: 'odyssey' } }),
      ),
      viewer: 'me',
    })
    expect(statuses.get(780)).toBeUndefined()
    expect(statuses.get(781)?.kind).toBe('finished')
    expect(statuses.get(782)).toBeUndefined()
    expect(labLastReadAt(new Map())).toBeNull()
  })

  it('a completed session wins over a later open one, and the newest page is kept', () => {
    const statuses = labChapterStatuses({
      bookId: 'bible',
      chapterNumbers: chapters,
      finished: new Set(),
      memory: memory(session('done', 780, 'completed', 1_000), session('again', 780, 'resumed', 5_000, { anchor: { ...session('x', 780, 'resumed', 1).anchor, page: 1, totalPages: 6 } })),
    })
    expect(statuses.get(780)).toMatchObject({ kind: 'finished', page: 1, lastReadAt: 5_000, finishedAt: 1_000 })
  })

  it('formats one honest line per state', () => {
    const date = (value: number) => `d${value}`
    expect(labChapterStatusLine(undefined, true, date)).toBe('Reading now')
    expect(labChapterStatusLine(undefined, false, date)).toBe('Not started')
    expect(labChapterStatusLine({ kind: 'finished' }, false, date)).toBe('Finished')
    expect(labChapterStatusLine({ kind: 'finished', finishedAt: 7 }, false, date)).toBe('Finished · d7')
    expect(labChapterStatusLine({ kind: 'in-progress' }, false, date)).toBe('In progress')
    expect(labChapterStatusLine({ kind: 'in-progress', page: 2, totalPages: 9, lastReadAt: 4 }, false, date)).toBe('In progress · page 2 of 9 · last read d4')
    expect(labChapterStatusLine({ kind: 'in-progress', page: 2, lastReadAt: 4 }, false, date)).toBe('In progress · last read d4')
  })
})
