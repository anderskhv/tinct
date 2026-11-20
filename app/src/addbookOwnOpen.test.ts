import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// The margin reader's own-book open (D's pre-launch matrix, 22 Oct 2026). reader.js runs only in the browser; these
// guard its source, and margin-check / the stream D matrix exercise the behaviour.
const READER = readFileSync(resolve(__dirname, '../public/lab/addbook/js/reader.js'), 'utf8')
const fn = (name: string) => { const at = READER.indexOf(`function ${name}(`); return READER.slice(at, READER.indexOf('\n}\n', at)) }

describe("the margin reader's own books", () => {
  it('opens an EPUB without waiting for pdf.js and the PDF scripts, which come after it is open', () => {
    expect(fn('openFromUrl')).not.toContain('await pdfReady()')
    const stored = fn('openStored')
    expect(stored).toContain("const epub = String(key).startsWith('epub:');")
    expect(stored).toContain('if (!epub) await pdfReady();')
    expect(stored).toContain('if (epub) setTimeout(() => pdfReady().catch(() => {}), 1500);')
  })

  it("moves a Contents pick of an own EPUB to the chapter's first paragraph, held, never to the room above it", () => {
    const nav = fn('previewNav')
    // The own branch's go: the entry's place (its file, the paragraph its anchor marks) through epubGoSpot.
    expect(nav).toContain('const at = ownEntrySpot(e); if (!at || !epubGoSpot(at.page, at.para, 0)) goToEntry(e)')
    expect(fn('ownEntrySpot')).toContain('return { page: e.page, para: 0 }')
  })
})
