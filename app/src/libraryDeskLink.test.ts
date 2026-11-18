import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { addressWithoutLink, deskWithLink } from '../public/lab/library_2/desk-link.js'

// Anders, 6 Nov 2026: on /library?book=frankenstein (the address a signed-in reader reaches from
// /read/frankenstein), Frankenstein was on his desk as a book he was reading. He removed it with its ×;
// the desk put it straight back at the front as the linked book, which has no × and reads "Read", and
// every reload of that address showed it there again. scripts/check-library-shelf-remove.mjs drives it.

const row = (bookId: string, extra: Record<string, unknown> = {}) => ({ bookId, title: bookId, ...extra })
const table = (...ids: string[]) => ({ mode: 'returning', reading: ids.map(id => row(id)), finished: [] })

describe('the linked book on the desk', () => {
  it('stands in front only while the reader is not reading it', () => {
    const linked = row('frankenstein', { linked: true })
    expect(deskWithLink(table('the-republic', 'bible'), 'frankenstein', linked).reading.map(b => b.bookId)).toEqual(['frankenstein', 'the-republic', 'bible'])
    const reading = table('frankenstein', 'the-republic')
    expect(deskWithLink(reading, 'frankenstein', linked)).toBe(reading)
    const plain = table('the-republic')
    expect(deskWithLink(plain, null, linked)).toBe(plain)
    expect(deskWithLink(plain, 'frankenstein', null)).toBe(plain)
  })

  it('leaves the address once the reader removes that book, keeping everything else', () => {
    expect(addressWithoutLink('https://tinct.app/library?book=frankenstein', 'frankenstein')).toBe('/library')
    expect(addressWithoutLink('https://tinct.app/library?book=frankenstein&edition=modern-en&card=you#my-shelf', 'frankenstein')).toBe('/library?card=you#my-shelf')
    expect(addressWithoutLink('https://tinct.app/read/frankenstein/', 'frankenstein')).toBe('/library')
    expect(addressWithoutLink('https://tinct.app/read/frankenstein', 'frankenstein')).toBe('/library')
    expect(addressWithoutLink('https://tinct.app/library?book=odyssey', 'frankenstein')).toBeNull()
    expect(addressWithoutLink('https://tinct.app/library', 'frankenstein')).toBeNull()
    expect(addressWithoutLink('not a url', 'frankenstein')).toBeNull()
  })

  it('is dropped by the desk before a removal is drawn: its × and My shelf alike (bookshelf.js)', () => {
    const shelf = readFileSync(resolve(__dirname, '../public/lab/library_2/bookshelf.js'), 'utf8')
    expect(shelf).toMatch(/let linked=/)
    const remove = shelf.slice(shelf.indexOf('onRemoveReading:async id=>{'), shelf.indexOf('onRemove:id=>'))
    expect(remove.indexOf('dropLink(id);')).toBeGreaterThan(-1)
    expect(remove.indexOf('dropLink(id);')).toBeLessThan(remove.indexOf('view.update('))
    expect(remove.indexOf('dropLink(id);')).toBeLessThan(remove.lastIndexOf('present();'))
    const elsewhere = shelf.slice(shelf.indexOf("addEventListener('library2:shelf-removed'"))
    expect(elsewhere.indexOf('dropLink(id);')).toBeGreaterThan(-1)
    expect(elsewhere.indexOf('dropLink(id);')).toBeLessThan(elsewhere.indexOf('present();'))
    expect(shelf).toContain('function dropLink(id){\n  if(!linked||id!==linked)return;\n  linked=null;')
  })
})
