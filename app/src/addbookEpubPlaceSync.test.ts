import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// An own EPUB read in Margin view reaches the account (Anders, 4 Nov 2026: "I'm reading a private book on my
// desktop, but my phone is opening the bible"). reader.js runs only in the browser; these guard its source, and
// ownSync.marginPlace.test.ts the place it sends.
const READER = readFileSync(resolve(__dirname, '../public/lab/addbook/js/reader.js'), 'utf8')
const ENGINE = readFileSync(resolve(__dirname, 'libraryAdd.ts'), 'utf8')
const fn = (name: string) => { const at = READER.indexOf(`function ${name}(`); return READER.slice(at, READER.indexOf('\n}\n', at)) }

describe("the margin reader's EPUB place on the account's other devices", () => {
  it('notes every move in an own EPUB for the account, and sends what waits when the page is left', () => {
    expect(fn('savePlaceNow')).toContain('if (moved && isEpub()) { if (isPdfText()) pdfTextShare(); else { epubShare(); epubPlaceSync.note(state.key) } }')
    expect(READER).toContain('function leavePlace() { if (!hasBook()) return; savePlaceNow(); justRead.leave(); placeSync.flush(); epubPlaceSync.flush();')
  })

  it("sends only an own EPUB's place, signed in, through the engine's epubPlaces", () => {
    const sync = READER.slice(READER.indexOf('const epubPlaceSync = {'), READER.indexOf('\n};\n', READER.indexOf('const epubPlaceSync = {')))
    expect(sync).toContain("if (!window.TinctAI?.session?.().userId) return Promise.resolve(null);")
    expect(sync).toContain('api.epubPlaces')
    expect(sync).toContain("if (!String(key).startsWith('epub:') || state.preview) return;")
    expect(ENGINE).toMatch(/__tinctLibraryAdd = \{[^}]*\bepubPlaces\b/)
  })
})
