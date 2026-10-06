// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { crc32, deflateRawSync } from 'node:zlib'
// @ts-expect-error -- plain .mjs test helper shared with the Add-a-book e2e tests
import { makeEpub, makeFigureEpub, zip } from '../../../../addbooks/web/test/make-epub.mjs'
import { stripUnderscoreEmphasis } from '../emphasisText'
import { convertEpub, epubToEdition, EpubError, imageSize, joinSegments, USER_EDITION_CONVERTER, USER_EDITION_FORMAT } from './epubEdition'
import { figureToken } from '../labFigures'

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

describe('library matter', () => {
  // Shaped like Project Gutenberg's own EPUB 3 (ebookmaker): a marked-up header with the
  // START marker before the title page, a footer document with the END marker and the
  // licence, and a contents entry pointing into the licence.
  const PG_HEADER = `<header class="pg-boilerplate pgheader" id="pg-header" lang="en"><h2 id="pg-header-heading">The Project Gutenberg eBook of <span>Night Book</span></h2>
    <div>This eBook is for the use of anyone anywhere in the United States and most other parts of the world at no cost and with almost no restrictions whatsoever.</div>
    <div class="container" id="pg-machine-header"><p><strong>Title</strong>: Night Book</p><p><strong>Release date</strong>: October 2, 2004 [eBook #35]</p></div>
    <div id="pg-start-separator"><span>*** START OF THE PROJECT GUTENBERG EBOOK NIGHT BOOK ***</span></div></header>`
  const PG_FOOTER = `<footer class="pg-boilerplate pgheader" id="pg-footer" lang="en"><div id="pg-end-separator"><span>*** END OF THE PROJECT GUTENBERG EBOOK NIGHT BOOK ***</span></div>
    <h2 id="pg-footer-heading">THE FULL PROJECT GUTENBERG™ LICENSE</h2><div>Updated editions will replace the previous one.</div><div>Section 5. General Information About Project Gutenberg electronic works</div></footer>`
  const nav = (entries: Array<[string, string]>) => xhtml(`<nav epub:type="toc"><ol>${entries.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('')}</ol></nav>`)

  it('leaves out Project Gutenberg’s header, START marker, END marker and licence', async () => {
    const bytes = zip([
      ['mimetype', 'application/epub+zip'],
      ['META-INF/container.xml', CONTAINER],
      ['OEBPS/content.opf', opf([['nav', 'toc.xhtml', 'properties="nav"'], ['coverpage-wrapper', 'wrap.xhtml'], ['pg-header', 'h0.xhtml'], ['c1', 'h1.xhtml'], ['pg-footer', 'h2.xhtml']], ['coverpage-wrapper', 'pg-header', 'c1', 'pg-footer'])],
      ['OEBPS/toc.xhtml', nav([['h0.xhtml#title', 'Night Book'], ['h1.xhtml#ch1', 'I. The Lamp'], ['h2.xhtml#pg-footer-heading', 'THE FULL PROJECT GUTENBERG™ LICENSE']])],
      ['OEBPS/wrap.xhtml', xhtml('<div><svg xmlns="http://www.w3.org/2000/svg"><image href="cover.jpg"/></svg></div>')],
      ['OEBPS/h0.xhtml', xhtml(`${PG_HEADER}<h1 id="title">Night Book</h1><div class="h2">by A. Writer</div>`)],
      ['OEBPS/h1.xhtml', xhtml('<h2 id="ch1">I. The Lamp</h2><p>The lamp was lit.</p><p>The end.</p>')],
      ['OEBPS/h2.xhtml', xhtml(PG_FOOTER)],
    ])
    const edition = await epubToEdition(bytes)
    const all = JSON.stringify(edition.chapters)
    expect(all).not.toMatch(/Gutenberg|START OF|END OF|eBook|LICENSE/i)
    // The title page (title and "by" author only) is left out too: the reader
    // opens the first chapter under the book's own title.
    expect(edition.chapters.map(chapter => [chapter.title, chapter.paragraphs])).toEqual([
      ['I. The Lamp', ['The lamp was lit.', 'The end.']],
    ])
  })

  it('cuts at the plain-text PG markers of an older file', async () => {
    const body = [
      '<p>The Project Gutenberg EBook of Night Book, by A. Writer</p>',
      '<p>This eBook is for the use of anyone anywhere at no cost.</p>',
      '<p>*** START OF THIS PROJECT GUTENBERG EBOOK NIGHT BOOK ***</p>',
      '<h1>Night Book</h1>', '<h2 id="c1">Chapter I</h2>', '<p>One.</p>', '<p>Two.</p>', '<h2 id="c2">Chapter II</h2>', '<p>Three.</p>', '<p>Four.</p>', '<p>Five.</p>', '<p>Six.</p>',
      '<p>End of the Project Gutenberg EBook of Night Book, by A. Writer</p>',
      '<p>*** END OF THIS PROJECT GUTENBERG EBOOK NIGHT BOOK ***</p>',
      '<p>Updated editions will replace the previous one.</p>',
    ].join('')
    const bytes = zip([
      ['mimetype', 'application/epub+zip'],
      ['META-INF/container.xml', CONTAINER],
      ['OEBPS/content.opf', opf([['nav', 'toc.xhtml', 'properties="nav"'], ['b', 'b.xhtml']], ['b'])],
      ['OEBPS/toc.xhtml', nav([['b.xhtml#c1', 'Chapter I'], ['b.xhtml#c2', 'Chapter II']])],
      ['OEBPS/b.xhtml', xhtml(body)],
    ])
    const edition = await epubToEdition(bytes)
    expect(JSON.stringify(edition.chapters)).not.toMatch(/Gutenberg|START OF|END OF|Updated editions/i)
    expect(edition.chapters.map(chapter => [chapter.title, chapter.paragraphs])).toEqual([
      ['Chapter I', ['Night Book', 'One.', 'Two.']],
      ['Chapter II', ['Three.', 'Four.', 'Five.', 'Six.']],
    ])
  })

  it('leaves out Standard Ebooks’ imprint, colophon and uncopyright, and Wikisource’s own pages', async () => {
    const section = (type: string, text: string) => xhtml(`<section epub:type="${type}"><h2>${type}</h2><p>${text}</p></section>`)
    const bytes = zip([
      ['mimetype', 'application/epub+zip'],
      ['META-INF/container.xml', CONTAINER],
      ['OEBPS/content.opf', opf([['nav', 'toc.xhtml', 'properties="nav"'], ['imprint', 'imprint.xhtml'], ['c1', 'c1.xhtml'], ['c2', 'c2.xhtml'], ['about', 'about.xhtml'], ['colophon', 'colophon.xhtml'], ['uncopyright', 'uncopyright.xhtml']], ['imprint', 'c1', 'c2', 'about', 'colophon', 'uncopyright'])],
      ['OEBPS/toc.xhtml', nav([['imprint.xhtml', 'Imprint'], ['c1.xhtml', 'One'], ['c2.xhtml', 'Two'], ['about.xhtml', 'About this digital edition'], ['colophon.xhtml', 'Colophon'], ['uncopyright.xhtml', 'Uncopyright']])],
      ['OEBPS/imprint.xhtml', section('frontmatter imprint', 'This ebook is the product of many hours of hard work by volunteers for Standard Ebooks.')],
      ['OEBPS/c1.xhtml', xhtml('<section epub:type="chapter"><h2>One</h2><p>Alpha.</p></section>')],
      ['OEBPS/c2.xhtml', xhtml('<section epub:type="chapter"><h2>Two</h2><p>Beta.</p></section>')],
      ['OEBPS/about.xhtml', xhtml('<h1>About this digital edition</h1><p>This e-book comes from the online library Wikisource.</p>')],
      ['OEBPS/colophon.xhtml', section('backmatter colophon', 'The cover page is adapted from a painting.')],
      ['OEBPS/uncopyright.xhtml', section('backmatter copyright-page', 'May you do good and not evil.')],
    ])
    const edition = await epubToEdition(bytes)
    expect(edition.chapters.map(chapter => [chapter.title, chapter.paragraphs])).toEqual([
      ['One', ['Alpha.']],
      ['Two', ['Beta.']],
    ])
  })
})

describe('a designed book, not a converted one', () => {
  const nav = (entries: Array<[string, string]>) => xhtml(`<nav epub:type="toc"><ol>${entries.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('')}</ol></nav>`)
  const book = (docs: Array<[string, string]>, entries: Array<[string, string]>, metadata = '') => zip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', CONTAINER],
    ['OEBPS/content.opf', opf([['nav', 'toc.xhtml', 'properties="nav"'], ...docs.map(([name]): [string, string] => [name, `${name}.xhtml`])], docs.map(([name]) => name)).replace('</metadata>', `${metadata}</metadata>`)],
    ['OEBPS/toc.xhtml', nav(entries)],
    ...docs.map(([name, body]): [string, string] => [`OEBPS/${name}.xhtml`, xhtml(body)]),
  ])

  it('leaves out the cover, half-title, copyright page and the book’s own contents page', async () => {
    const edition = await epubToEdition(book([
      ['cover', '<section epub:type="cover"><img src="cover.jpg" alt="Cover"/></section>'],
      ['half', '<section epub:type="halftitle"><p>NIGHT<br/>BOOK</p></section>'],
      ['copy', '<p>Copyright © 2025 A. Writer</p><p>All rights reserved.</p><p>ISBN 000-0-00-000000-0</p>'],
      ['contents', '<p><strong>CONTENTS</strong></p><p><a href="one.xhtml">One Night</a></p><p><a href="two.xhtml">Two Nights</a></p><p><a href="three.xhtml">The Third Night</a></p>'],
      ['one', '<h1>One Night</h1><p>Alpha.</p>'],
      ['two', '<h1>Two Nights</h1><p>Beta.</p>'],
      ['three', '<h1>The Third Night</h1><p>Gamma.</p>'],
    ], [['cover.xhtml', 'Cover'], ['copy.xhtml', 'Copyright'], ['contents.xhtml', 'Contents'], ['one.xhtml', 'One Night'], ['two.xhtml', 'Two Nights'], ['three.xhtml', 'The Third Night']], '<dc:title id="sub">A Novel of Lamps</dc:title><meta refines="#sub" property="title-type">subtitle</meta>'))
    expect(edition.title).toBe('Night Book')
    expect(edition.subtitle).toBe('A Novel of Lamps')
    expect(edition.chapters.map(chapter => [chapter.title, chapter.paragraphs])).toEqual([
      ['One Night', ['Alpha.']],
      ['Two Nights', ['Beta.']],
      ['The Third Night', ['Gamma.']],
    ])
    expect(JSON.stringify(edition)).not.toMatch(/Cover|CONTENTS|rights reserved|ISBN/)
  })

  it('keeps subheadings, table labels and list items as kinds beside plain paragraphs', async () => {
    const edition = await epubToEdition(book([
      ['one', `<p class="cht1"><strong>ONE<br/> NIGHT</strong></p>
        <p class="head1">EPISODE DETAILS</p>
        <table><tr><td><p><span><strong>Date</strong></span></p></td><td><p>2012</p></td></tr>
          <tr><td><p><strong>Ideas</strong></p></td><td><p><span class="tb1">•</span> A first idea.</p></td></tr></table>
        <ul><li>Listed thing</li><li>Another <em>listed</em> thing</li></ul>
        <h3>Transcript</h3>
        <p>The talk began.</p>
        <p><strong>Not a heading, a bold sentence.</strong></p>
        <p><strong>Homepage:</strong></p>`],
      ['two', '<h1>Two</h1><p>Beta.</p>'],
    ], [['one.xhtml', 'One Night'], ['two.xhtml', 'Two']]))
    const [one] = edition.chapters
    expect(one.paragraphs).toEqual(['EPISODE DETAILS', 'Date', '2012', 'Ideas', 'A first idea.', 'Listed thing', 'Another _listed_ thing', 'Transcript', 'The talk began.', 'Not a heading, a bold sentence.', 'Homepage:'])
    // A bold line ending in a colon introduces what follows: a label, kept with it.
    expect(one.kinds).toEqual(['heading', 'label', null, 'label', 'item', 'item', 'item', 'heading', null, null, 'label'])
    expect(edition.chapters[1].kinds).toBeUndefined()
  })

  it('drops empty paragraphs and a lone "Link" label above an address, keeping anchors on their text', async () => {
    const edition = await epubToEdition(book([
      ['one', `<h1>One</h1>
        <p>&#x00A0;</p><p>\u200b</p><p><span class="tb1">&#x2022;</span></p>
        <table><tr><td><p><strong>Link</strong></p></td><td><p><a href="https://youtu.be/abc">https://youtu.be/abc</a></p></td></tr>
          <tr><td><p><strong>Show</strong></p></td><td><p id="show">Closer to Night</p></td></tr></table>
        <p>Link</p><p>A link is a thing that joins.</p>`],
      ['two', '<h1>Two</h1><p>Beta.</p>'],
    ], [['one.xhtml', 'One'], ['one.xhtml#show', 'Two']]))
    const [one] = edition.chapters
    // "Link" before prose is the book's own word and stays.
    expect(one.paragraphs).toEqual(['https://youtu.be/abc', 'Show'])
    expect(edition.chapters[1].paragraphs.slice(0, 3)).toEqual(['Closer to Night', 'Link', 'A link is a thing that joins.'])
  })

  it('joins credits the print wrapped mid-clause, and keeps a poem’s lines', async () => {
    const edition = await epubToEdition(book([
      ['one', `<h1>One</h1>
        <p><em>Major support for this volume<br/> was provided by A. Patron.</em></p>
        <p>The lamp is lit,<br/>the night is long.</p>
        <p>Shall I compare thee<br/>To a lamp at night?</p>`],
      ['two', '<h1>Two</h1><p>Beta.</p>'],
    ], [['one.xhtml', 'One'], ['two.xhtml', 'Two']]))
    const [one] = edition.chapters
    expect([one.paragraphs, one.kinds]).toEqual([
      ['_Major support for this volume was provided by A. Patron._', 'The lamp is lit,', 'the night is long.', 'Shall I compare thee', 'To a lamp at night?'],
      [null, 'line', 'line', 'line', 'line'],
    ])
  })

  it('joins a list of names the print wrapped, and keeps verse whose lines open on capitals', async () => {
    const edition = await epubToEdition(book([
      ['one', `<h1>One</h1>
        <p class="indentc"><em>Additional support by Ada Wren, Basil</em><br/> <em>Corvin, Delia Frost, Ezra Holt,</em><br/> <em>Fenna Lund, and Gil Marsh.</em></p>
        <p>The sea is calm to-night,<br/>The tide is full, the moon lies fair<br/>Upon the straits,</p>
        <p>O lamp of mine,<br/>And Robin, come,<br/>Thou art the light.</p>`],
      ['two', '<h1>Two</h1><p>Beta.</p>'],
    ], [['one.xhtml', 'One'], ['two.xhtml', 'Two']]))
    const [one] = edition.chapters
    expect([one.paragraphs, one.kinds]).toEqual([
      ['_Additional support by Ada Wren, Basil Corvin, Delia Frost, Ezra Holt, Fenna Lund, and Gil Marsh._',
        'The sea is calm to-night,', 'The tide is full, the moon lies fair', 'Upon the straits,',
        'O lamp of mine,', 'And Robin, come,', 'Thou art the light.'],
      [null, 'line', 'line', 'line', 'line', 'line', 'line'],
    ])
  })

  it('never reads a bold lead-in line under the heading as a subtitle or byline', async () => {
    const edition = await epubToEdition(book([
      ['one', '<h1>Sam Writer: On Lamps</h1><p><strong>Hosts:</strong> Sam Writer &amp; Jo Smith</p><p>Body text follows here.</p>'],
      ['two', '<h1>Two</h1><p>Beta.</p>'],
    ], [['one.xhtml', 'Sam Writer: On Lamps'], ['two.xhtml', 'Two']]))
    expect(edition.chapters[0].paragraphs[0]).toBe('Hosts: Sam Writer & Jo Smith')
    expect(edition.chapters[0].kinds).toBeUndefined()
  })

  it('keeps web links by word range and bare addresses as their own words; nothing else links', async () => {
    const edition = await epubToEdition(book([
      ['one', `<h1>One</h1>
        <p><a href="https://youtu.be/abc">https://youtu.be/abc</a></p>
        <p>See <a href="https://example.org/a">the full episode</a> online, or <a href="javascript:alert(1)">this</a>, <a href="data:text/html,x">that</a> and <a href="two.xhtml">chapter two</a>.</p>
        <p>Read <a href="http://www.site.org/page"><em>www.site.org/page</em></a> today.</p>`],
      ['two', '<h1>Two</h1><p>Beta.</p>'],
    ], [['one.xhtml', 'One'], ['two.xhtml', 'Two']]))
    const [one] = edition.chapters
    expect(one.paragraphs).toEqual([
      'https://youtu.be/abc',
      'See the full episode online, or this, that and chapter two.',
      'Read _http://www.site.org/page_ today.',
    ])
    expect(one.links).toEqual([[1, 1, 4, 'https://example.org/a']])
    expect(JSON.stringify(edition)).not.toMatch(/javascript|data:/)
  })

  it('sets an anthology chapter’s opening: repeated title out, subtitle and byline in', async () => {
    const edition = await epubToEdition(book([
      ['one', '<p class="chapnum">1</p><p class="chaptitle">The Fate of Lamps</p><p>What Many Lamps Mean for Night</p><p>Sam Writer</p><p>Modern lamps consist of two parts, and both of them are bright.</p>'],
      ['two', '<h1>The Second Essay</h1><h2>A Subtitle Set as a Heading</h2><p class="author">Jo Smith</p><p>Body text.</p>'],
      ['three', '<h1>Preface</h1><p>Preface</p><p>Notes on the Night</p><p>The preface begins here and runs on.</p>'],
      ['four', '<h1>Notes</h1><p>Ann Lee</p><p>Ann Lee said that lamps were bright.</p>'],
    ], [['one.xhtml', '1 The Fate of Lamps'], ['two.xhtml', 'The Second Essay'], ['three.xhtml', 'Preface'], ['four.xhtml', 'Notes']]))
    const [one, two, three, four] = edition.chapters
    expect([one.paragraphs, one.kinds]).toEqual([
      ['What Many Lamps Mean for Night', 'Sam Writer', 'Modern lamps consist of two parts, and both of them are bright.'],
      ['subtitle', 'byline', null],
    ])
    expect([two.paragraphs, two.kinds]).toEqual([['A Subtitle Set as a Heading', 'Jo Smith', 'Body text.'], ['subtitle', 'byline', null]])
    // A repeated plain-paragraph title goes; a lone title-cased line after it is a subtitle.
    expect([three.paragraphs, three.kinds]).toEqual([['Notes on the Night', 'The preface begins here and runs on.'], ['subtitle', null]])
    // A name alone after the heading is a byline.
    expect([four.paragraphs, four.kinds]).toEqual([['Ann Lee', 'Ann Lee said that lamps were bright.'], ['byline', null]])
  })

  it('leaves body text alone when an opening line is not clearly a subtitle or byline', async () => {
    const edition = await epubToEdition(book([
      ['one', '<h1>One</h1><p>It was dark.</p><p>Nobody came.</p>'],
      ['two', '<h1>Two</h1><p>the lamp, lit at last</p><p>Then morning.</p>'],
    ], [['one.xhtml', 'One'], ['two.xhtml', 'Two']]))
    expect(edition.chapters.map(chapter => chapter.kinds)).toEqual([undefined, undefined])
  })

  it('sets lines parted by breaks as lines, and a heading broken over lines as one heading', async () => {
    const edition = await epubToEdition(book([
      ['one', '<h1>One</h1><p>The lamp is lit,<br/>the night is long.</p><p><strong>A BROKEN<br/>HEADING</strong></p><p>Prose follows here.</p>'],
      ['two', '<h1>Two</h1><p>Beta.</p>'],
    ], [['one.xhtml', 'One'], ['two.xhtml', 'Two']]))
    const [one] = edition.chapters
    expect([one.paragraphs, one.kinds]).toEqual([
      ['The lamp is lit,', 'the night is long.', 'A BROKEN HEADING', 'Prose follows here.'],
      ['line', 'line', 'heading', null],
    ])
  })

  it('keeps an index’s page numbers, which link to print pages rather than notes', async () => {
    const edition = await epubToEdition(book([
      ['one', '<h1>One</h1><p id="page_7">Alpha.</p>'],
      ['index', '<h1>Index</h1><p>Lamps, <a href="one.xhtml#page_7">7</a>, <a href="one.xhtml#page_9">9</a></p><p>Note<a href="one.xhtml#fn1">1</a></p>'],
    ], [['one.xhtml', 'One'], ['index.xhtml', 'Index']]))
    expect(edition.chapters[1].paragraphs).toEqual(['Lamps, 7, 9', 'Note'])
  })
})

describe('figures', () => {
  it('keeps every picture at its place as a figure, with its caption; leaves out the cover and decoration', async () => {
    const { edition, images } = await convertEpub(makeFigureEpub())
    // No Cover chapter: the cover picture is the book's cover, not a chapter or a figure.
    expect(edition.chapters.map(chapter => chapter.title)).toEqual(['The Workshop', 'The Ledger', 'The Shape of a Flame'])
    const [one, two, three] = edition.chapters
    expect(one.figures?.map(figure => [figure.id, figure.number, figure.caption, figure.width, figure.height, figure.large ?? false])).toEqual([
      ['f1', 1, 'The workbench, with lamps in every stage of making.', 800, 500, false],
      ['f2', 2, undefined, 400, 300, false],
    ])
    // A figure is a paragraph of one word at its place; a picture inside a sentence stands after its paragraph.
    const at = (chapter: typeof one, id: string) => chapter.paragraphs.indexOf(figureToken(id))
    expect(one.paragraphs[at(one, 'f1') - 1]).toMatch(/^Paragraph 2\./)
    expect(one.paragraphs[at(one, 'f2') - 1]).toMatch(/^A small mark sat on every label, and the lamps were sorted by size/)
    expect(one.paragraphs.join(' ')).not.toMatch(/ornament|icon/)
    expect(two.figures?.map(figure => [figure.number, figure.caption, figure.large ?? false])).toEqual([
      [3, 'A lamp-post on the quay, drawn to scale.', false],
      // 1800 x 1000: a detailed plate, always a strip. Its "Plate I." caption is its own paragraph no more.
      [4, 'Plate I. A map of the harbour and every lamp on it.', true],
    ])
    expect(two.paragraphs.some(text => /^Plate I\./.test(text))).toBe(false)
    expect(three.figures?.map(figure => [figure.number, figure.caption, figure.width, figure.height])).toEqual([[5, 'The shape of a flame, drawn from life.', 400, 300]])
    // Pictures stay on the device, beside the book: one image per figure, never the cover.
    expect([...images.keys()]).toEqual(['f1', 'f2', 'f3', 'f4', 'f5'])
    expect(images.get('f1')?.type).toBe('image/png')
    expect(images.get('f5')?.type).toBe('image/svg+xml')
    expect(edition.chapters.flatMap(chapter => chapter.figures ?? []).every(figure => figure.src === `asset:${figure.id}`)).toBe(true)
    expect(edition.droppedImages).toBe(3)
    // The edition itself is plain JSON (the pictures travel separately).
    expect(JSON.parse(JSON.stringify(edition))).toEqual(edition)
  })

  it('reads picture sizes from their headers', () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 3, 32, 0, 0, 1, 244])
    expect(imageSize(png, 'image/png')).toEqual({ width: 800, height: 500 })
    const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x2c, 0x01, 0xc8, 0x00])
    expect(imageSize(gif, 'image/gif')).toEqual({ width: 300, height: 200 })
    expect(imageSize(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"></svg>'), 'image/svg+xml')).toEqual({ width: 640, height: 480 })
    expect(imageSize(new Uint8Array([1, 2, 3]), 'image/png')).toBeNull()
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
