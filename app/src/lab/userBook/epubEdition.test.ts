// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { crc32, deflateRawSync } from 'node:zlib'
// @ts-expect-error -- plain .mjs test helper shared with the Add-a-book e2e tests
import { makeEpub, zip } from '../../../../addbooks/web/test/make-epub.mjs'
import { stripUnderscoreEmphasis } from '../emphasisText'
import { epubToEdition, EpubError, joinSegments, USER_EDITION_CONVERTER, USER_EDITION_FORMAT } from './epubEdition'

const CONTAINER = '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
const xhtml = (body: string) => `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>x</title></head><body>${body}</body></html>`

function opf(items: Array<[string, string, string?]>, spine: string[], extra = '') {
  return `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">t</dc:identifier><dc:title>Night Book</dc:title><dc:creator>A. Writer</dc:creator><dc:creator>B. Editor</dc:creator><dc:language>da</dc:language></metadata><manifest>${items.map(([id, href, more]) => `<item id="${id}" href="${href}" media-type="${href.endsWith('.ncx') ? 'application/x-dtbncx+xml' : 'application/xhtml+xml'}"${more ? ' ' + more : ''}/>`).join('')}</manifest><spine${extra}>${spine.map(id => `<itemref idref="${id}"/>`).join('')}</spine></package>`
}

/** The same archive as make-epub's `zip`, with every entry but `mimetype` deflated. */
function deflatedZip(files: Array<[string, string]>): Buffer {
  const enc = new TextEncoder(), locals: Buffer[] = [], centrals: Buffer[] = []
  let offset = 0
  for (const [name, content] of files) {
    const raw = enc.encode(content), nameB = enc.encode(name)
    const method = name === 'mimetype' ? 0 : 8
    const data = method ? deflateRawSync(raw) : Buffer.from(raw)
    const crc = crc32(raw) >>> 0
    const local = Buffer.alloc(30 + nameB.length)
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6); local.writeUInt16LE(method, 8)
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(raw.length, 22); local.writeUInt16LE(nameB.length, 26)
    Buffer.from(nameB).copy(local, 30)
    const central = Buffer.alloc(46 + nameB.length)
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x800, 8); central.writeUInt16LE(method, 10)
    central.writeUInt32LE(crc, 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(raw.length, 24); central.writeUInt16LE(nameB.length, 28)
    central.writeUInt32LE(offset, 42); Buffer.from(nameB).copy(central, 46)
    locals.push(local, data); centrals.push(central)
    offset += local.length + data.length
  }
  const cd = Buffer.concat(centrals), end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, cd, end])
}

describe('epubToEdition', () => {
  it('reads the Add a book test EPUB as chapters of plain paragraphs, in spine order', async () => {
    const edition = await epubToEdition(makeEpub({ title: 'Test Book' }))
    expect(edition.format).toBe(USER_EDITION_FORMAT)
    expect(edition.converter).toBe(USER_EDITION_CONVERTER)
    expect(edition.title).toBe('Test Book')
    expect(edition.author).toBe('Test Author')
    expect(edition.language).toBe('en')
    expect(edition.chapters.map(chapter => [chapter.number, chapter.title])).toEqual([[1, 'One'], [2, 'Two']])
    // Script, style, iframe and the picture are gone; the heading that repeats the title is not a paragraph.
    expect(edition.chapters[0].paragraphs).toEqual(['First chapter link'])
    expect(edition.chapters[1].paragraphs).toEqual(['Second chapter.', 'x=2'])
    expect(edition.droppedImages).toBe(1)
    expect(JSON.stringify(edition)).not.toMatch(/pwned|<|onerror|example\.com/)
  })

  it('refuses a DRM-protected EPUB with the Add a book wording', async () => {
    const failure = await epubToEdition(makeEpub({ drm: true })).catch(error => error)
    expect(failure).toBeInstanceOf(EpubError)
    expect(failure.code).toBe('drm')
    expect(failure.message).toMatch(/protected by DRM/)
  })

  it('refuses files that are not EPUBs', async () => {
    await expect(epubToEdition(new TextEncoder().encode('%PDF-1.4 not a zip'))).rejects.toMatchObject({ code: 'not_zip' })
    await expect(epubToEdition(zip([['mimetype', 'application/epub+zip']]))).rejects.toMatchObject({ code: 'bad_epub' })
  })

  it('cuts chapters at the NCX anchors of a deflated EPUB 2, keeps italics, verse lines and notes', async () => {
    const ncx = `<?xml version="1.0"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><navMap>
      <navPoint id="p1"><navLabel><text>Part One</text></navLabel><content src="text/part.xhtml"/>
        <navPoint id="p2"><navLabel><text>Chapter I</text></navLabel><content src="text/book.xhtml#c1"/></navPoint>
        <navPoint id="p3"><navLabel><text>Chapter II</text></navLabel><content src="text/book.xhtml#c2"/></navPoint>
      </navPoint></navMap></ncx>`
    const front = xhtml('<h1>Night Book</h1><p>A title page.</p>')
    const part = xhtml('<h1>Part One</h1>')
    const book = xhtml(`
      <h2 id="c1">Chapter I. The Lamp</h2>
      <p>He said <em>never</em>, and <i>un</i>done it was.<a href="notes.xhtml#n1" epub:type="noteref">1</a></p>
      <div class="poem"><span class="line">The first line,</span><span class="line">the second line.</span></div>
      <p>One<br/>Two</p>
      <aside epub:type="footnote" id="n1"><p>A note on the lamp.</p></aside>
      <h2 id="c2">Chapter<br/>II</h2>
      <p>Morning <b>came</b> &amp; went.</p>
      <table><tr><td>Left</td><td>Right</td></tr></table>`)
    const bytes = deflatedZip([
      ['mimetype', 'application/epub+zip'],
      ['META-INF/container.xml', CONTAINER],
      ['OEBPS/content.opf', opf([['ncx', 'toc.ncx'], ['f', 'text/front.xhtml'], ['p', 'text/part.xhtml'], ['b', 'text/book.xhtml']], ['f', 'p', 'b'], ' toc="ncx"')],
      ['OEBPS/toc.ncx', ncx],
      ['OEBPS/text/front.xhtml', front],
      ['OEBPS/text/part.xhtml', part],
      ['OEBPS/text/book.xhtml', book],
    ])
    const edition = await epubToEdition(bytes)
    expect(edition.author).toBe('A. Writer, B. Editor')
    expect(edition.language).toBe('da')
    // A short title page and the part's title page both open the first chapter.
    expect(edition.chapters.map(chapter => chapter.title)).toEqual(['Chapter I', 'Chapter II'])
    expect(edition.chapters[0].paragraphs).toEqual([
      'Night Book',
      'A title page.',
      'Part One',
      'He said _never_, and undone it was.',
      'The first line,',
      'the second line.',
      'One',
      'Two',
      'A note on the lamp.',
    ])
    expect(edition.chapters[1].paragraphs).toEqual(['Morning came & went.', 'Left Right'])
    const emphasis = stripUnderscoreEmphasis(edition.chapters[0].paragraphs[3])
    expect(emphasis.text).toBe('He said never, and undone it was.')
    expect(emphasis.text.slice(...emphasis.ranges[0])).toBe('never')
  })

  it('without a usable contents list, reads one chapter per document named by its heading', async () => {
    const bytes = zip([
      ['mimetype', 'application/epub+zip'],
      ['META-INF/container.xml', CONTAINER],
      ['OEBPS/content.opf', opf([['a', 'a.xhtml'], ['b', 'b.xhtml'], ['c', 'c.xhtml'], ['cover', 'cover.xhtml']], ['cover', 'a', 'b', 'c'])],
      ['OEBPS/cover.xhtml', xhtml('<img src="cover.jpg" alt="Cover"/>')],
      ['OEBPS/a.xhtml', xhtml('<h1>The Start</h1><p>Alpha.</p>')],
      ['OEBPS/b.xhtml', xhtml('<p>Beta, no heading.</p>')],
      ['OEBPS/c.xhtml', xhtml('<h3>   </h3><p>Gamma.</p>')],
    ])
    const edition = await epubToEdition(bytes, { fallbackTitle: 'ignored' })
    expect(edition.title).toBe('Night Book')
    expect(edition.chapters.map(chapter => [chapter.title, chapter.paragraphs])).toEqual([
      ['The Start', ['Alpha.']],
      ['Section 2', ['Beta, no heading.']],
      ['Section 3', ['Gamma.']],
    ])
    expect(edition.droppedImages).toBe(1)
  })
})

describe('joinSegments', () => {
  it('marks only whole-word italic runs, so the word sequence never changes', () => {
    expect(joinSegments([{ text: 'a ', em: false }, { text: 'b c', em: true }, { text: '. d', em: false }])).toBe('a _b c_. d')
    expect(joinSegments([{ text: 'un', em: true }, { text: 'done', em: false }])).toBe('undone')
    expect(joinSegments([{ text: 'snake', em: false }, { text: '_case_', em: true }])).toBe('snake_case_')
    expect(joinSegments([{ text: '  spaced  ', em: true }, { text: 'out', em: false }])).toBe('_spaced_ out')
  })
})
