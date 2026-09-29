import { describe, expect, it } from 'vitest'
import { bibleBookTransition } from './bookTransition'

describe('Bible spoken book boundaries', () => {
  const chapters = [
    { number: 410, title: 'Ezra 7' }, { number: 411, title: 'Ezra 8' },
    { number: 412, title: 'Ezra 9' }, { number: 413, title: 'Ezra 10' },
    { number: 414, title: 'Nehemiah 1' }, { number: 426, title: 'Nehemiah 13' },
    { number: 1190, title: 'Tobit 1' },
  ]
  it('announces the completed and incoming books only at a real boundary', () => {
    expect(bibleBookTransition('bible', chapters, 413)).toEqual({
      nextChapter: 414, completedBook: 'Ezra', nextBook: 'Nehemiah',
      text: 'You have completed Ezra. Next book: Nehemiah.',
    })
    expect(bibleBookTransition('bible', chapters, 410)).toBeNull()
  })
  it('follows Catholic edition order, not global numbering', () => {
    expect(bibleBookTransition('bible', chapters, 426)?.nextBook).toBe('Tobit')
  })
  it('does not invent a boundary for missing, malformed or final entries', () => {
    expect(bibleBookTransition('bible', chapters, 999)).toBeNull()
    expect(bibleBookTransition('bible', chapters, 1190)).toBeNull()
    expect(bibleBookTransition('hamlet', chapters, 413)).toBeNull()
    for (const title of ['Unknown', '', 'Genesis 2']) {
      expect(bibleBookTransition('bible', [{ number: 1, title: 'Ezra 10' }, { number: 2, title }], 1)).toBeNull()
    }
  })
})
