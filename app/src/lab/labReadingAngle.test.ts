// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { readReadingAngle, readingAngleForAi, writeReadingAngle } from './labReadingAngle'
import { labReadingAngle } from './labAsk'

afterEach(() => localStorage.clear())

describe('the reading angle is one value per book (start actions, 9 Nov 2026)', () => {
  it('is stored under the book and read back for that book only', () => {
    writeReadingAngle('frankenstein', 'Watch who listens')
    expect(readReadingAngle('frankenstein')).toBe('Watch who listens')
    expect(readReadingAngle('dracula')).toBe('')
    expect(labReadingAngle('frankenstein')).toBe('Watch who listens')
    // Never another book's angle, and never the legacy global preference (B24: an angle must not leak to the next book).
    localStorage.setItem('tinct:preferences', JSON.stringify({ readingObjective: 'An old global angle' }))
    expect(labReadingAngle('dracula')).toBeUndefined()
  })

  it('clearing it removes it; blank is nothing for the AI', () => {
    writeReadingAngle('frankenstein', 'x')
    writeReadingAngle('frankenstein', '   ')
    expect(localStorage.getItem('tinct:reading-angle:frankenstein')).toBeNull()
    expect(readingAngleForAi('frankenstein')).toBeUndefined()
  })
})
