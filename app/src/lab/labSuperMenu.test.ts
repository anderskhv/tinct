import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LAB_NOTEBOOK_LABEL, LAB_SETTINGS_GROUPS, labSuperMenuRows } from './labSuperMenu'
import { LAB_V2_SHEET_TITLES } from './labV2Sheet'

const GROUPS = [['text', 'Aa'], ['editions', 'Book settings'], ['audio', 'Audio settings']]
const groups = (rows: ReturnType<typeof labSuperMenuRows>) => rows.filter(row => ['text', 'editions', 'audio'].includes(row.id)).map(row => [row.id, row.label])

// The margin reader (public/lab/addbook/js/reader.js) draws its own t menu; its names are this model's.
const readerJs = readFileSync(resolve(__dirname, '../../public/lab/addbook/js/reader.js'), 'utf8')
const literal = (name: string) => {
  const match = readerJs.match(new RegExp(`^const ${name} = (.+);$`, 'm'))
  if (!match) throw new Error(`reader.js has no ${name}`)
  return new Function(`return (${match[1]})`)() as unknown
}

describe('one settings model for the book reader and the margin reader (22 Oct 2026)', () => {
  it('names the groups Aa, Book settings and Audio settings, in that order', () => {
    expect(LAB_SETTINGS_GROUPS.map(group => group.label)).toEqual(['Aa', 'Book settings', 'Audio settings'])
    expect(LAB_NOTEBOOK_LABEL).toBe('Notebook')
  })

  it('the book reader’s sheet titles are the model’s names', () => {
    for (const group of LAB_SETTINGS_GROUPS) expect(LAB_V2_SHEET_TITLES[group.layer]).toBe(group.layer === 'reading' ? 'Appearance' : group.label)
  })

  it('reader.js MENU_LABEL equals the model, and its t menu holds the groups in the model’s order', () => {
    const labels = literal('MENU_LABEL') as Record<string, string>
    for (const group of LAB_SETTINGS_GROUPS) expect(labels[group.frame]).toBe(group.label)
    const groups = literal('MENU_GROUPS') as string[][]
    expect(groups).toContainEqual(LAB_SETTINGS_GROUPS.map(group => group.frame))
    expect(Object.values(labels)).not.toContain('Reading settings')
    // The panels' titles come from MENU_LABEL, never a second copy of the names (Aa is also the theme swatches' face).
    const rest = readerJs.replace(/^const MENU_LABEL = .+$/m, '')
    for (const group of LAB_SETTINGS_GROUPS.filter(group => group.frame !== 'aa')) expect(rest).not.toMatch(new RegExp(`['>]${group.label}['<]`))
  })

  it('the margin reader’s Notebook button carries the model’s name', () => {
    const html = readFileSync(resolve(__dirname, '../../public/lab/addbook/book.html'), 'utf8')
    expect(html).toMatch(new RegExp(`id="notebookBtn" aria-label="${LAB_NOTEBOOK_LABEL}"`))
  })
})

describe('labSuperMenuRows', () => {
  it('the phone: Chat · Talk, Summarize, Catch me up, Notebook, Aa, Book settings, Audio settings, Library, Profile (22 Oct 2026)', () => {
    const phone = labSuperMenuRows({ phone: true })
    expect(phone.map(row => row.id)).toEqual(['conversation', 'summarize', 'catchup', 'notebook', 'text', 'editions', 'audio', 'library', 'account'])
    expect(phone.map(row => row.label)).toEqual(['', 'Summarize', 'Catch me up', 'Notebook', 'Aa', 'Book settings', 'Audio settings', 'Library', 'Profile'])
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
    expect(labSuperMenuRows({ phone: true, noCatchUp: true }).map(row => row.id)).toEqual(['conversation', 'summarize', 'notebook', 'text', 'editions', 'audio', 'library', 'account'])
  })

  it('leaves Library to the back arrow on desktop, and matches the phone Chat/Talk row', () => {
    const desktop = labSuperMenuRows({ phone: false })
    // The desktop's Notebook is the margin reader's top-bar button, not a t menu row.
    expect(desktop.some(row => row.id === 'notebook')).toBe(false)
    expect(desktop.map(row => row.id)).toEqual(['conversation', 'summarize', 'catchup', 'text', 'editions', 'audio', 'account'])
    expect(desktop.find(row => row.id === 'account')?.ruleBefore).toBe(true)
    expect(labSuperMenuRows().map(row => row.id)).toEqual(desktop.map(row => row.id))
    expect(desktop[0]).toEqual({ id: 'conversation', label: '', modes: ['chat', 'talk'] })
  })

  it('puts Notebook in the private desktop menu without changing the public menu', () => {
    expect(labSuperMenuRows({ sharedReader: true }).map(row => row.id)).toEqual(['conversation', 'summarize', 'catchup', 'notebook', 'text', 'editions', 'audio', 'account'])
    expect(labSuperMenuRows({ sharedReader: true, privateBook: true }).map(row => row.id)).toEqual(['conversation', 'summarize', 'catchup', 'notebook', 'text', 'audio', 'account'])
    expect(labSuperMenuRows({ sharedReader: false }).some(row => row.id === 'notebook')).toBe(false)
  })

  it('gives a reader’s own book Catch me up, Aa and Audio settings (no Book settings but a PDF’s), Your books for Library', () => {
    expect(labSuperMenuRows({ phone: true, privateBook: true }).map(row => [row.id, row.label])).toEqual([
      ['conversation', ''], ['summarize', 'Summarize'], ['catchup', 'Catch me up'], ['notebook', 'Notebook'], ['text', 'Aa'], ['audio', 'Audio settings'], ['library', 'Your books'], ['account', 'Profile'],
    ])
    expect(labSuperMenuRows({ privateBook: true }).map(row => row.id)).toEqual(['conversation', 'summarize', 'catchup', 'text', 'audio', 'account'])
    expect(labSuperMenuRows({ privateBook: true, ownPdf: true }).map(row => row.id)).toEqual(['conversation', 'summarize', 'catchup', 'text', 'editions', 'audio', 'account'])
    expect(labSuperMenuRows({ phone: true, privateBook: true, ownPdf: true }).map(row => row.id)).toEqual(['conversation', 'summarize', 'catchup', 'notebook', 'text', 'editions', 'audio', 'library', 'account'])
  })
})
