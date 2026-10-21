import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// A book on the desk (2026-10-21, scripts/check-library-speed.mjs): Continue waited, unseen, for the
// account's places and the reader hand-off before anything happened (2.4 s on a throttled phone, 3.5 s
// when tapped as the desk appeared), and a second tap meanwhile opened the book twice. The tap is now
// answered at once with the page's fade to the reader's paper (body.leaving, as every way into the
// reader does); the place it opens at still waits for the account's reads, as before.
const shelf = readFileSync(resolve(__dirname, '../public/lab/library_2/bookshelf.js'), 'utf8')
const open = shelf.slice(shelf.indexOf('onOpen:async(id,shelf,img)=>{'), shelf.indexOf('else await openBook(id,img);'))

describe('a book on the desk opens', () => {
  it('answers the tap before waiting for the account and the hand-off', () => {
    const leaving = open.indexOf("document.body.classList.add('leaving')")
    expect(leaving).toBeGreaterThan(-1)
    expect(leaving).toBeLessThan(open.indexOf('await resumeReady'))
    expect(open.indexOf('await resumeReady')).toBeLessThan(open.indexOf('api.readerDestination(id,null)'))
  })

  it('takes the fade back when the book cannot open, and after a return from the back/forward cache', () => {
    expect(open).toContain("catch(error){document.body.classList.remove('leaving');throw error;}")
    expect(open).toContain("addEventListener('pageshow',e=>{if(e.persisted)document.body.classList.remove('leaving');},{once:true})")
  })

  it('ignores a second tap while it leaves (reading-table.js)', () => {
    const table = readFileSync(resolve(__dirname, '../public/lab/library_2/reading-table.js'), 'utf8')
    expect(table).toContain("if (!b || document.body.classList.contains('leaving')) return;")
  })
})
