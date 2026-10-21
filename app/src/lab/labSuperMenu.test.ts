import { describe, expect, it } from 'vitest'
import { labSuperMenuRows } from './labSuperMenu'

describe('labSuperMenuRows', () => {
  it('the phone: Chat · Talk, Summarize, Catch me up, Text and theme, Reading settings, Library, Profile (20 Oct 2026)', () => {
    const phone = labSuperMenuRows({ phone: true })
    expect(phone.map(row => row.id)).toEqual(['conversation', 'summarize', 'catchup', 'text', 'reading', 'library', 'account'])
    expect(phone.map(row => row.label)).toEqual(['', 'Summarize', 'Catch me up', 'Text and theme', 'Reading settings', 'Library', 'Profile'])
    expect(phone[0].modes).toEqual(['chat', 'talk'])
    // Book editions and Settings are grouped into Text and theme and Reading settings: no row of their own.
    expect(phone.some(row => row.id === 'editions' || row.id === 'settings' || row.id === 'librarian')).toBe(false)
  })

  it('the phone hides Catch me up on a book’s first chapter', () => {
    expect(labSuperMenuRows({ phone: true, noCatchUp: true }).map(row => row.id)).toEqual(['conversation', 'summarize', 'text', 'reading', 'library', 'account'])
  })

  it('leaves Library to the back arrow on desktop, and keeps its Librarian, Book editions and Settings rows', () => {
    const desktop = labSuperMenuRows({ phone: false })
    expect(desktop.map(row => row.id)).toEqual(['librarian', 'summarize', 'catchup', 'editions', 'settings', 'account'])
    expect(desktop.find(row => row.id === 'account')?.ruleBefore).toBe(true)
    expect(labSuperMenuRows().map(row => row.id)).toEqual(desktop.map(row => row.id))
    expect(desktop[0]).toEqual({ id: 'librarian', label: 'Librarian', modes: ['chat', 'talk'] })
  })

  it('gives a reader’s own book Catch me up, Reading settings on the phone (its voice and speed), Your books for Library', () => {
    expect(labSuperMenuRows({ phone: true, privateBook: true }).map(row => [row.id, row.label])).toEqual([
      ['conversation', ''], ['summarize', 'Summarize'], ['catchup', 'Catch me up'], ['text', 'Text and theme'], ['reading', 'Reading settings'], ['library', 'Your books'], ['account', 'Profile'],
    ])
    expect(labSuperMenuRows({ privateBook: true }).map(row => row.id)).toEqual(['librarian', 'summarize', 'catchup', 'settings', 'account'])
    expect(labSuperMenuRows({ privateBook: true, ownPdf: true }).map(row => row.id)).toEqual(['librarian', 'summarize', 'catchup', 'editions', 'settings', 'account'])
  })
})
