import { describe, expect, it } from 'vitest'
import type { ReadingMemoryState, ReadingSession } from '../readingMemory'
import {
  buildLabReadingTrail,
  LAB_READING_TRAIL_LENGTH,
  openingLineOf,
  recordTrailVisit,
  trailFromSources,
} from './labReadingTrail'

function session(input: {
  id: string
  chapterNumber: number
  chapterLabel: string
  lastActiveAt: number
  owner?: string | null
  editionKey?: string
  summary?: string
  firstWords?: string
  lastWords?: string
}): ReadingSession {
  return {
    id: input.id,
    seq: 1,
    deviceId: 'dev',
    owner: input.owner ?? null,
    state: 'progressed',
    anchor: {
      bookId: 'bible',
      editionKey: input.editionKey ?? 'kjv-en',
      chapterNumber: input.chapterNumber,
      chapterLabel: input.chapterLabel,
      page: 1,
      totalPages: 2,
      paragraphIndex: 0,
      wordIndex: 3,
      range: {
        startParagraphIndex: 0, startWordIndex: 0, startCharOffset: 0,
        endParagraphIndex: 0, endWordIndex: 3, endCharOffset: 12,
        firstWords: input.firstWords ?? 'The word that came',
        lastWords: input.lastWords ?? 'court of the prison',
      },
    },
    startedAt: input.lastActiveAt - 1000,
    lastActiveAt: input.lastActiveAt,
    endedAt: null,
    completedAt: null,
    summary: input.summary
      ? { text: input.summary, model: 'm', route: '/api/chat', version: 'v1', generatedAt: input.lastActiveAt, sessionSeq: 1, anchor: {} as never }
      : null,
  }
}

function memory(sessions: ReadingSession[]): ReadingMemoryState {
  return { v: 1, sessions: Object.fromEntries(sessions.map(item => [item.id, item])), updatedAt: 0 }
}

describe('reading trail', () => {
  it('strips verse markers and clips the opening line', () => {
    expect(openingLineOf(['¹ The word that came to Jeremiah from the LORD in the tenth year of Zedekiah king of Judah, which was the eighteenth year of Nebuchadrezzar.']))
      .toBe('The word that came to Jeremiah from the LORD in the tenth year of Zedekiah king of Judah, which was the eighteenth year…')
    expect(openingLineOf(['', '  ', 'Short.'])).toBe('Short.')
    expect(openingLineOf([])).toBeUndefined()
  })

  it('keeps one visit per chapter, newest last', () => {
    let visits = recordTrailVisit([], { chapterNumber: 777, label: 'Jeremiah 32', at: 1 })
    visits = recordTrailVisit(visits, { chapterNumber: 781, label: 'Jeremiah 36', at: 2 })
    visits = recordTrailVisit(visits, { chapterNumber: 777, label: 'Jeremiah 32', openingLine: 'The word', at: 3 })
    expect(visits.map(visit => visit.chapterNumber)).toEqual([781, 777])
    expect(visits[1].openingLine).toBe('The word')
  })

  it('merges visits with reading-memory sessions, excludes the current chapter and keeps the last five', () => {
    const trail = trailFromSources({
      bookId: 'bible',
      editionKey: 'kjv-en',
      currentChapter: 782,
      visits: [
        { chapterNumber: 781, label: 'Jeremiah 36', openingLine: 'And it came to pass', at: 900 },
        { chapterNumber: 782, label: 'Jeremiah 37', openingLine: 'And king Zedekiah', at: 950 },
      ],
      memory: memory([
        session({ id: 'a', chapterNumber: 777, chapterLabel: 'Jeremiah 32', lastActiveAt: 100, summary: 'Jeremiah buys a field while shut up in the court of the prison.' }),
        session({ id: 'b', chapterNumber: 778, chapterLabel: 'Jeremiah 33', lastActiveAt: 200 }),
        session({ id: 'c', chapterNumber: 1, chapterLabel: 'Genesis 1', lastActiveAt: 50 }),
        session({ id: 'd', chapterNumber: 2, chapterLabel: 'Genesis 2', lastActiveAt: 60 }),
        session({ id: 'e', chapterNumber: 3, chapterLabel: 'Genesis 3', lastActiveAt: 70 }),
        session({ id: 'f', chapterNumber: 4, chapterLabel: 'Genesis 4', lastActiveAt: 80 }),
        session({ id: 'other', chapterNumber: 500, chapterLabel: 'Psalm 22', lastActiveAt: 999, owner: 'someone-else' }),
      ]),
      viewer: null,
    })
    expect(trail).toHaveLength(LAB_READING_TRAIL_LENGTH)
    expect(trail.map(entry => entry.chapterNumber)).toEqual([3, 4, 777, 778, 781])
    expect(trail[2]).toEqual({ chapterNumber: 777, label: 'Jeremiah 32', openingLine: undefined, recap: 'Jeremiah buys a field while shut up in the court of the prison.' })
    expect(trail[3].recap).toBe('Read from "The word that came" to "court of the prison"')
    expect(trail[4]).toEqual({ chapterNumber: 781, label: 'Jeremiah 36', openingLine: 'And it came to pass', recap: undefined })
  })

  it('prefers the open edition and falls back to any edition of the same book', () => {
    const state = memory([
      session({ id: 'da', chapterNumber: 10, chapterLabel: 'Genesis 10', lastActiveAt: 10, editionKey: 'modern-da' }),
      session({ id: 'en', chapterNumber: 11, chapterLabel: 'Genesis 11', lastActiveAt: 20, editionKey: 'kjv-en' }),
    ])
    expect(trailFromSources({ bookId: 'bible', editionKey: 'kjv-en', visits: [], memory: state }).map(entry => entry.chapterNumber)).toEqual([11])
    expect(trailFromSources({ bookId: 'bible', editionKey: 'web-en', visits: [], memory: state }).map(entry => entry.chapterNumber)).toEqual([10, 11])
    expect(trailFromSources({ bookId: 'odyssey', editionKey: 'kjv-en', visits: [], memory: state })).toEqual([])
  })

  it('fills missing opening lines within the deadline and sends the trail without them otherwise', async () => {
    const state = memory([session({ id: 'a', chapterNumber: 777, chapterLabel: 'Jeremiah 32', lastActiveAt: 100 })])
    const filled = await buildLabReadingTrail({
      bookId: 'bible',
      editionKey: 'kjv-en',
      currentChapter: 782,
      visits: [],
      memory: state,
      loadOpening: async () => 'The word that came to Jeremiah',
    })
    expect(filled[0].openingLine).toBe('The word that came to Jeremiah')

    const slow = await buildLabReadingTrail({
      bookId: 'bible',
      editionKey: 'kjv-en',
      currentChapter: 782,
      visits: [],
      memory: state,
      deadlineMs: 5,
      loadOpening: () => new Promise(resolve => setTimeout(() => resolve('late'), 50)),
    })
    expect(slow).toHaveLength(1)
    expect(slow[0].openingLine).toBeUndefined()
    expect(slow[0].recap).toContain('Read from')
  })
})
