// @vitest-environment jsdom
/**
 * Conversion rules 7 (userEdition.ts USER_EDITION_CONVERTER), found by the
 * Gutenberg Add to Tinct sweep (scripts/check-gutenberg-adds.mjs, 2026-10-09).
 * Each case also converts under rules 6, which must stay exactly what a book
 * converted before rules 7 was.
 */
import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain .mjs test helper shared with the Add-a-book e2e tests
import { zip } from '../../../../addbooks/web/test/make-epub.mjs'
import { EpubError, epubToEdition } from './epubEdition'
import { publicChapters } from './publicChapters'
import { parseChapters } from '../../worker/routes/publicBooks'
import { epubSourceLetters, verifyEditionAgainstSource } from '../../worker/lib/epubSource'

const CONTAINER = '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
const page = (body: string) => `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>x</title></head><body>${body}</body></html>`

// Nothing to Eat (Project Gutenberg 5868, 1857), set as Gutenberg's EPUB3 sets it: one
// document holds the header, the printed contents, and every section's title over its verse
// in a <pre>. Its own words; the opening stanzas stand for each section's verse.
const ARGUMENT = `   THOUGH famine prevails not at all in the city;
   Though none of starvation have died in the street;
   Yet many there are now exciting our pity,
   Who're daily complaining of nothing to eat.

   The every-day cry and the every-day fare,
   That's every day heard where the Livewells are dining,
   Is nothing to eat, or else nothing to wear,
   Which naked and starving rich Merdles are whining.

   There's Kitty Malone—Mrs. Merdle 'tis now—
   Was ever on earth here before such a sinner;
   Protesting, excusing and swearing a vow,
   She'd nothing worth eating to give us for dinner.

   Why Kitty, if starving for want of a meal,
   And had'nt a cent in the world to buy meat,
   You wouldn't exclaim with a more pious zeal,
   “I'm dying of hunger—we've nothing to eat!!”`
const SECTIONS = ['The Argument', 'The Proof—the Queen of Fashion', 'The Object aimed at.', 'What another Poet did.', 'How the Author sometimes Dines.',
  'Merdle the Banker.', 'Places Where Mortals Dine.', 'Things That Mortals Eat There.', 'The Invitation.', 'The Merdle Origin.', 'Mrs. Merdle At Home.',
  'Mrs. Merdle goes to Market.', 'The Dinner-bell Rings.', 'The Dinner Table Talk.', 'Mrs. Merdle Ordereth the Second Course.', 'Mrs. Merdle Describeth her Doctor.',
  'Mrs. Merdle Discourseth of Pudding.', 'He Discourseth of Trouble and Sorrow.', 'He Moralizeth upon what a Day may Bring forth.', 'FINIS.']

function nothingToEat(): Uint8Array {
  const doc = 'book.xhtml'
  const body = `<header class="pg-boilerplate pgheader" id="pg-header"><h2>The Project Gutenberg eBook of Nothing to Eat</h2><p>This eBook is for the use of anyone anywhere in the United States.</p>`
    + `<div id="pg-start-separator"><span>*** START OF THE PROJECT GUTENBERG EBOOK NOTHING TO EAT ***</span></div></header>`
    + `<h1>NOTHING TO EAT</h1><h2>By Horatio Alger and Thomas Chandler Haliburton</h2><p><b>CONTENTS</b></p>`
    + SECTIONS.map((title, i) => `<p class="toc"><a href="${doc}#s${i}" class="pginternal"> ${title} </a></p>`).join('')
    + SECTIONS.map((title, i) => `<p><a id="s${i}"> </a></p><h2>${title}</h2><pre>\n${ARGUMENT}\n</pre>`).join('')
  const footer = '<section class="pg-boilerplate pgfooter" id="pg-footer"><div id="pg-end-separator"><span>*** END OF THE PROJECT GUTENBERG EBOOK NOTHING TO EAT ***</span></div><p>Updated editions will replace the previous one.</p></section>'
  const nav = `<nav epub:type="toc"><ol><li><a href="${doc}">NOTHING TO EAT</a></li>${SECTIONS.map((title, i) => `<li><a href="${doc}#s${i}">${title}</a></li>`).join('')}<li><a href="footer.xhtml">THE FULL PROJECT GUTENBERG LICENSE</a></li></ol></nav>`
  const opf = `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">http://www.gutenberg.org/5868</dc:identifier><dc:title>Nothing to Eat</dc:title><dc:creator>Jr. Horatio Alger</dc:creator><dc:creator>Thomas Chandler Haliburton</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="pg-header" href="${doc}" media-type="application/xhtml+xml"/><item id="pg-footer" href="footer.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="pg-header"/><itemref idref="pg-footer"/></spine></package>`
  return zip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', CONTAINER],
    ['OEBPS/content.opf', opf],
    ['OEBPS/nav.xhtml', page(nav)],
    [`OEBPS/${doc}`, page(body)],
    ['OEBPS/footer.xhtml', page(footer)],
  ])
}

describe('a document holding the printed contents and the text (rules 7)', () => {
  it('is the book, not a contents page: every section and its verse are kept', async () => {
    const edition = await epubToEdition(nothingToEat(), { sourceTitles: true, rules: 7 })
    expect(edition.converter).toBe(7)
    expect(edition.chapters.map(chapter => chapter.title)).toEqual(expect.arrayContaining(SECTIONS))
    const text = edition.chapters.flatMap(chapter => chapter.paragraphs).join('\n')
    expect(text).toContain('THOUGH famine prevails not at all in the city;')
    expect(text.match(/nothing to eat!!/g)?.length).toBe(SECTIONS.length)
    expect(text).not.toMatch(/PROJECT GUTENBERG/)
  })

  it('adds to Tinct: the Worker finds every paragraph in the EPUB', async () => {
    const bytes = nothingToEat()
    const chapters = parseChapters({ chapters: publicChapters((await epubToEdition(bytes, { sourceTitles: true })).chapters) })
    expect(chapters).not.toBeNull()
    const verified = verifyEditionAgainstSource(chapters!, await epubSourceLetters(bytes))
    expect(verified?.removedParagraphs).toBe(0)
    expect(verified?.renamedChapters).toBe(0)
  })

  it('stays unreadable under rules 6, as a book converted before rules 7 was', async () => {
    const failure = await epubToEdition(nothingToEat(), { rules: 6 }).catch(error => error)
    expect(failure).toBeInstanceOf(EpubError)
    expect(failure.code).toBe('bad_epub')
  })

  it('still leaves out a contents page whose other words are few', async () => {
    const contents = `<p><b>CONTENTS</b></p>${SECTIONS.map((title, i) => `<p><a href="b.xhtml#s${i}">${title}</a></p>`).join('')}`
    const book = SECTIONS.map((title, i) => `<h2 id="s${i}">${title}</h2><p>${ARGUMENT.replace(/\n+/g, ' ')}</p>`).join('')
    const nav = `<nav epub:type="toc"><ol>${SECTIONS.map((title, i) => `<li><a href="b.xhtml#s${i}">${title}</a></li>`).join('')}</ol></nav>`
    const opf = `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">t</dc:identifier><dc:title>Nothing to Eat</dc:title><dc:creator>A. Writer</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="a" href="a.xhtml" media-type="application/xhtml+xml"/><item id="b" href="b.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="a"/><itemref idref="b"/></spine></package>`
    const bytes = zip([['mimetype', 'application/epub+zip'], ['META-INF/container.xml', CONTAINER], ['OEBPS/content.opf', opf], ['OEBPS/nav.xhtml', page(nav)], ['OEBPS/a.xhtml', page(contents)], ['OEBPS/b.xhtml', page(book)]])
    const edition = await epubToEdition(bytes, { sourceTitles: true })
    expect(edition.chapters[0].title).toBe(SECTIONS[0])
    expect(edition.chapters.flatMap(chapter => chapter.paragraphs).some(p => p === 'CONTENTS' || p === SECTIONS[1])).toBe(false)
  })
})
