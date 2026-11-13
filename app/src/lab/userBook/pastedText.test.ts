// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { isPastedEpub } from './pastedText'
// @ts-expect-error -- shared browser module
import { pasteEpub } from '../../../public/lab/library_2/paste-text.js'

/** An EPUB's opening entries as another maker writes them (stored, so its package is plain in the file). */
const makeEpub = (ids: string[]) => new TextEncoder().encode('PK\u0003\u0004mimetypeapplication/epub+zip PK\u0003\u0004OEBPS/content.opf<?xml version="1.0"?><package><manifest>'
  + ids.map(id => `<item id="${id}" href="${id}.xhtml" media-type="application/xhtml+xml"/>`).join('') + '</manifest><spine>' + ids.map(id => `<itemref idref="${id}"/>`).join('') + '</spine></package>')

const bytes = (file: File) => new Promise<Uint8Array>((resolve, reject) => {
  const reader = new FileReader(); reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer)); reader.onerror = () => reject(reader.error); reader.readAsArrayBuffer(file)
})

describe('a pasted text told from its file', () => {
  it('knows the EPUB Paste text writes, with or without an imported article’s address', async () => {
    expect(isPastedEpub(await bytes(pasteEpub({ source: 'One paragraph.\n\nAnother.', format: 'plain', title: 'Notes' })))).toBe(true)
    const imported = await bytes(pasteEpub({ source: '<p>An article.</p>', format: 'html', title: 'Article', sourceUrl: 'https://example.com/a' }))
    expect(isPastedEpub(imported)).toBe(true)
    expect(isPastedEpub(imported.buffer.slice(imported.byteOffset, imported.byteOffset + imported.byteLength) as ArrayBuffer)).toBe(true)
  })
  it('does not take a book’s EPUB, a single-document EPUB of another maker or nothing for one', () => {
    expect(isPastedEpub(makeEpub(['c1', 'c2']))).toBe(false)
    expect(isPastedEpub(makeEpub(['text']))).toBe(false)
    expect(isPastedEpub(null)).toBe(false)
    expect(isPastedEpub(new TextEncoder().encode('<manifest><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="chapter"/></spine>'))).toBe(false)
  })
})
