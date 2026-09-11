import { describe, expect, it } from 'vitest'
import { completedLibraryBookId } from './libraryCompletion'

describe('legacy library completion', () => {
  it('recognises final-page progress even before the final chapter completion write', () => {
    expect(completedLibraryBookId('progress:the-awakening', { bookId: 'the-awakening', totalChapters: 39, highestCompletedChapter: 38, percent: 97, positionPercent: 100 })).toBe('the-awakening')
    expect(completedLibraryBookId('tinct:progress:war-and-peace', { bookId: 'war-and-peace', totalChapters: 365, highestCompletedChapter: 364, percent: 100, positionPercent: 100 })).toBe('war-and-peace')
  })
  it('preserves explicit completion when the reader subsequently moves back', () => {
    expect(completedLibraryBookId('book-completed:symposium', { bookId: 'symposium' })).toBe('symposium')
  })
  it('does not treat partial, deleted, malformed or mismatched records as completed', () => {
    expect(completedLibraryBookId('progress:bible', { bookId: 'bible', totalChapters: 1189, highestCompletedChapter: 1146, percent: 96, positionPercent: 72 })).toBeNull()
    expect(completedLibraryBookId('progress:bible', { bookId: 'bible', percent: '100' })).toBeNull()
    expect(completedLibraryBookId('progress:bible', { bookId: 'other', percent: 100 })).toBeNull()
    expect(completedLibraryBookId('book-completed:bible', null)).toBeNull()
  })
})
