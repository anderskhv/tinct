import { describe, expect, it } from 'vitest'
import { labSuperMenuRows } from './labSuperMenu'

const GROUPS = [['text', 'Aa'], ['editions', 'Book settings'], ['audio', 'Audio settings']]
const groups = (rows: ReturnType<typeof labSuperMenuRows>) => rows.filter(row => ['text', 'editions', 'audio'].includes(row.id)).map(row => [row.id, row.label])

describe('labSuperMenuRows', () => {
  it('the phone: Chat · Talk, Summarize, Catch me up, Aa, Book settings, Audio settings, Library, Profile (22 Oct 2026)', () => {
    const phone = labSuperMenuRows({ phone: true })
    expect(phone.map(row => row.id)).toEqual(['conversation', 'summarize', 'catchup', 'text', 'editions', 'audio', 'library', 'account'])
    expect(phone.map(row => row.label)).toEqual(['', 'Summarize', 'Catch me up', 'Aa', 'Book settings', 'Audio settings', 'Library', 'Profile'])
    expect(phone[0].modes).toEqual(['chat', 'talk'])
    expect(phone.some(row => (row.id as string) === 'settings' || (row.id as string) === 'reading' || row.id === 'librarian')).toBe(false)
  })

  it('the three settings groups are the same rows, names and order on the phone and the desktop', () => {
    expect(groups(labSuperMenuRows({ phone: true }))).toEqual(GROUPS)
    expect(groups(labSuperMenuRows({ phone: false }))).toEqual(GROUPS)
    for (const phone of [true, false]) {
      const rows = labSuperMenuRows({ phone })
      expect(rows.filter(row => GROUPS.some(([id]) => id === row.id)).every(row => row.chevron)).toBe(true)
      expect(rows.find(row => row.id === 'text')?.ruleBefore).toBe(true)
    }
  })

  it('the phone hides Catch me up on a book’s first chapter', () => {
    expect(labSuperMenuRows({ phone: true, noCatchUp: true }).map(row => row.id)).toEqual(['conversation', 'summarize', 'text', 'editions', 'audio', 'library', 'account'])
  })

  it('leaves Library to the back arrow on desktop, and keeps its Librarian row', () => {
    const desktop = labSuperMenuRows({ phone: false })
    expect(desktop.map(row => row.id)).toEqual(['librarian', 'summarize', 'catchup', 'text', 'editions', 'audio', 'account'])
    expect(desktop.find(row => row.id === 'account')?.ruleBefore).toBe(true)
    expect(labSuperMenuRows().map(row => row.id)).toEqual(desktop.map(row => row.id))
    expect(desktop[0]).toEqual({ id: 'librarian', label: 'Librarian', modes: ['chat', 'talk'] })
  })

  it('gives a reader’s own book Catch me up, Aa and Audio settings (no Book settings but a PDF’s), Your books for Library', () => {
    expect(labSuperMenuRows({ phone: true, privateBook: true }).map(row => [row.id, row.label])).toEqual([
      ['conversation', ''], ['summarize', 'Summarize'], ['catchup', 'Catch me up'], ['text', 'Aa'], ['audio', 'Audio settings'], ['library', 'Your books'], ['account', 'Profile'],
    ])
    expect(labSuperMenuRows({ privateBook: true }).map(row => row.id)).toEqual(['librarian', 'summarize', 'catchup', 'text', 'audio', 'account'])
    expect(labSuperMenuRows({ privateBook: true, ownPdf: true }).map(row => row.id)).toEqual(['librarian', 'summarize', 'catchup', 'text', 'editions', 'audio', 'account'])
    expect(labSuperMenuRows({ phone: true, privateBook: true, ownPdf: true }).map(row => row.id)).toEqual(['conversation', 'summarize', 'catchup', 'text', 'editions', 'audio', 'library', 'account'])
  })
})
