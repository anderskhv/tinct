// @vitest-environment jsdom
/**
 * Conversion rules 6 (userEdition.ts USER_EDITION_CONVERTER), on fixtures set
 * the way the real books QA converted are set (Project Gutenberg's EPUB3
 * builds of The Importance of Being Earnest, War and Peace, The Adventures of
 * Sherlock Holmes, Gibbon's Decline and Fall, Emily Dickinson's Poems, Keats's
 * Poems 1817, A Doll's House, Emerson's Essays, A Modest Proposal; a Standard
 * Ebooks novel; a Wikisource export), with their own words. Each case also
 * converts under rules 5, which must stay exactly what a book converted
 * before rules 6 was: its chapters, paragraphs and places never move.
 */
import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain .mjs test helper shared with the Add-a-book e2e tests
import { zip } from '../../../../addbooks/web/test/make-epub.mjs'
import { convertEpub, epubToEdition, LEGACY_EDITION_CONVERTER, USER_EDITION_CONVERTER } from './epubEdition'
import { normalizeChapterTitles } from '../../../public/lab/chapter-title.js'
import { isPlayText, registerShakespeareSpeakers, resetVerseLines, shakespeareSpeakerWords, verseSpeakerWords } from '../labVerseLines'

const CONTAINER = '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
const page = (body: string, head = '') => `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>x</title>${head}</head><body>${body}</body></html>`

/** A contents entry: label, href, and the entries under it. */
type Entry = [string, string, Entry[]?]

/** An EPUB 3 with a nav contents, its documents in spine order. */
function epub({ title, creator = 'A. Writer', nav, docs }: { title: string; creator?: string; nav: Entry[]; docs: Array<[string, string]> }): Uint8Array {
  const list = (entries: Entry[]): string => `<ol>${entries.map(([label, href, under]) => `<li><a href="${href}">${label}</a>${under ? list(under) : ''}</li>`).join('')}</ol>`
  const opf = `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">t</dc:identifier><dc:title>${title}</dc:title><dc:creator>${creator}</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>${docs.map(([name], i) => `<item id="d${i}" href="${name}" media-type="application/xhtml+xml"/>`).join('')}</manifest><spine>${docs.map((_, i) => `<itemref idref="d${i}"/>`).join('')}</spine></package>`
  return zip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', CONTAINER],
    ['OEBPS/content.opf', opf],
    ['OEBPS/nav.xhtml', page(`<nav epub:type="toc">${list(nav)}</nav>`)],
    ...docs.map(([name, body]): [string, string] => [`OEBPS/${name}`, body]),
  ])
}

const both = async (bytes: Uint8Array, options: { sourceTitles?: boolean } = {}) => ({
  now: await epubToEdition(bytes, options),
  before: await epubToEdition(bytes, { ...options, rules: LEGACY_EDITION_CONVERTER }),
})
const titles = (edition: { chapters: Array<{ title: string }> }) => edition.chapters.map(chapter => chapter.title)
/** A paragraph of running prose, long enough that a chapter is never taken for a contents page. */
const PROSE = 'It was a bright cold day in April, and the clocks were striking thirteen, while the rest of the town went about its business as if nothing at all had changed in the world.'
const prose = `<p>${PROSE}</p>`

describe('conversion rules', () => {
  it('converts new books under the current rules and records them; rules 5 on request, for a book converted before', async () => {
    const bytes = epub({ title: 'A Short Book', nav: [['One', 'a.xhtml']], docs: [['a.xhtml', page('<h1>One</h1><p>Text.</p>')]] })
    expect(USER_EDITION_CONVERTER).toBe(11)
    expect((await epubToEdition(bytes)).converter).toBe(11)
    expect((await epubToEdition(bytes, { rules: 10 })).converter).toBe(10)
    expect((await epubToEdition(bytes, { rules: 9 })).converter).toBe(9)
    expect((await epubToEdition(bytes, { rules: 8 })).converter).toBe(8)
    expect((await epubToEdition(bytes, { rules: 6 })).converter).toBe(6)
    expect((await epubToEdition(bytes, { rules: 5 })).converter).toBe(5)
    // Rules nobody converted with are never used: the current ones are.
    expect((await epubToEdition(bytes, { rules: 4 })).converter).toBe(11)
  })
})

describe('act, part and story titles (rules 6)', () => {
  // The Importance of Being Earnest (PG 844): FIRST ACT over SCENE, speakers on their own line.
  const speech = (name: string, text: string) => `<p>${name}.<br/>\n${text}\n</p>`
  const act = (n: string, lines: Array<[string, string]>) => page(`<h2><a id="a${n}"/>${n} ACT</h2><h3 id="s${n}">SCENE</h3><p>Morning-room in Algernon’s flat in Half-Moon Street.</p>${lines.map(([who, text]) => speech(who, text)).join('')}`)
  const dialogue: Array<[string, string]> = Array.from({ length: 24 }, (_, i) => [['ALGERNON', 'LANE', 'JACK'][i % 3], `Line ${i + 1} of the scene, sir.`])
  const earnest = epub({
    title: 'The Importance of Being Earnest', creator: 'Oscar Wilde',
    nav: [['FIRST ACT', 'a1.xhtml#aFIRST', [['SCENE', 'a1.xhtml#sFIRST']]], ['SECOND ACT', 'a2.xhtml#aSECOND', [['SCENE', 'a2.xhtml#sSECOND']]]],
    docs: [['a1.xhtml', act('FIRST', dialogue)], ['a2.xhtml', act('SECOND', dialogue)]],
  })

  it('keeps the act a scene opens (The Importance of Being Earnest) and joins each speaker to the speech', async () => {
    const { now, before } = await both(earnest)
    expect(titles(before)).toEqual(['Scene', 'Scene'])
    expect(titles(now)).toEqual(['First Act', 'Second Act'])
    expect(now.chapters[0].paragraphs.slice(0, 3)).toEqual(['SCENE', 'Morning-room in Algernon’s flat in Half-Moon Street.', 'ALGERNON. Line 1 of the scene, sir.'])
    expect(before.chapters[0].paragraphs).toContain('ALGERNON.')
    expect(now.speakers).toBe(true)
    expect(before.speakers).toBeUndefined()
    // The reader sets the speaker as a label, as in Tinct's own plays.
    resetVerseLines()
    registerShakespeareSpeakers(now.chapters[0].paragraphs)
    expect(verseSpeakerWords('ALGERNON. Line 1 of the scene, sir.')).toBe(1)
    resetVerseLines()
  })

  it('names chapters alike in several books by their book (War and Peace), and finds their heading in the text', async () => {
    const chapter = (book: string, n: string) => `<div class="chapter"><h2 id="${book}c${n}">CHAPTER ${n}</h2><p>Text of ${book} chapter ${n}.</p>${prose}</div>`
    const bytes = epub({
      title: 'War and Peace', creator: 'graf Leo Tolstoy',
      nav: [['BOOK ONE: 1805', 'b1.xhtml#b1'], ['CHAPTER I', 'b1.xhtml#1cI'], ['CHAPTER II', 'b1.xhtml#1cII'], ['BOOK TWO: 1805', 'b2.xhtml#b2'], ['CHAPTER I', 'b2.xhtml#2cI'], ['CHAPTER II', 'b2.xhtml#2cII']],
      docs: [
        ['b1.xhtml', page(`<div class="chapter"><h2 id="b1">BOOK ONE: 1805</h2></div>${chapter('1', 'I')}${chapter('1', 'II')}`)],
        ['b2.xhtml', page(`<div class="chapter"><h2 id="b2">BOOK TWO: 1805</h2></div>${chapter('2', 'I')}${chapter('2', 'II')}`)],
      ],
    })
    const { now, before } = await both(bytes)
    expect(titles(before)).toEqual(['Chapter 1', 'Chapter 2', 'Chapter 1', 'Chapter 2'])
    expect(titles(now)).toEqual(['Book 1, Chapter 1', 'Book 1, Chapter 2', 'Book 2, Chapter 1', 'Book 2, Chapter 2'])
    // The book's heading opens its first chapter; the chapter's own heading is the title, not a paragraph.
    expect(now.chapters[0].paragraphs).toEqual(['BOOK ONE: 1805', 'Text of 1 chapter I.', PROSE])
    expect(now.chapters[1].paragraphs).toEqual(['Text of 1 chapter II.', PROSE])
    expect(before.chapters[1].paragraphs).toEqual(['Text of 1 chapter II.', PROSE])
    // The author as readers know them; a book converted before keeps its credit (healed on read).
    expect(now.author).toBe('Leo Tolstoy')
    expect(before.author).toBe('graf Leo Tolstoy')
    // Add to Tinct sends titles as written; the Worker sets them in house style.
    expect(normalizeChapterTitles((await epubToEdition(bytes, { sourceTitles: true })).chapters).map(chapter => chapter.title)).toEqual(titles(now))
  })

  it("titles a story's parts by the story (The Adventures of Sherlock Holmes)", async () => {
    const bytes = epub({
      title: 'The Adventures of Sherlock Holmes', creator: 'Arthur Conan Doyle',
      nav: [['I. A SCANDAL IN BOHEMIA', 's1.xhtml#t1', [['I.', 's1.xhtml#p1'], ['II.', 's1.xhtml#p2']]], ['II. THE RED-HEADED LEAGUE', 's2.xhtml#t2']],
      docs: [
        ['s1.xhtml', page(`<h2 id="t1">I. A SCANDAL IN BOHEMIA</h2><h3 id="p1">I.</h3><p>To Sherlock Holmes she is always <i>the</i> woman.</p>${prose}<h3 id="p2">II.</h3><p>At three o’clock precisely I was at Baker Street.</p>${prose}`)],
        ['s2.xhtml', page(`<h2 id="t2">II. THE RED-HEADED LEAGUE</h2><p>I had called upon my friend.</p>${prose}`)],
      ],
    })
    const { now, before } = await both(bytes)
    expect(titles(before)).toEqual(['1', '2', '2 — The Red-Headed League'])
    expect(titles(now)).toEqual(['1 — A Scandal in Bohemia', '1 — A Scandal in Bohemia, Part 2', '2 — The Red-Headed League'])
    expect(now.chapters[0].paragraphs).toEqual(['To Sherlock Holmes she is always _the_ woman.', PROSE])
    expect(now.chapters[1].paragraphs).toEqual(['At three o’clock precisely I was at Baker Street.', PROSE])
  })

  it('keeps a part with its first entries, and later ones under the part they follow (Spinoza, Ethics)', async () => {
    const bytes = epub({
      title: 'Ethics', creator: 'Benedictus de Spinoza',
      nav: [['The Ethics', 'e.xhtml#t'], ['Benedict de Spinoza', 'e.xhtml#a', [['Translated from the Latin by R. H. M. Elwes', 'e.xhtml#tr']]],
        ['PART I. CONCERNING GOD.', 'e.xhtml#p1', [['DEFINITIONS.', 'e.xhtml#d1', [['AXIOMS.', 'e.xhtml#x1']]]]],
        ['PART II.', 'e.xhtml#p2', [['DEFINITIONS', 'e.xhtml#d2'], ['AXIOMS', 'e.xhtml#x2']]]],
      docs: [['e.xhtml', page(`<h1 id="t">The Ethics</h1><h2 id="a">Benedict de Spinoza</h2><h3 id="tr">Translated from the Latin by R. H. M. Elwes</h3><p>PART I PART II</p>
        <h2 id="p1">PART I. CONCERNING GOD.</h2><h3 id="d1">DEFINITIONS.</h3><p>I. By that which is self-caused, I mean that of which the essence involves existence.</p>${prose}
        <h3 id="x1">AXIOMS.</h3><p>I. Everything which exists, exists either in itself or in something else.</p>${prose}
        <h2 id="p2">PART II.</h2><h3 id="d2">DEFINITIONS</h3><p>I. By body I mean a mode which expresses God’s essence.</p>${prose}<h3 id="x2">AXIOMS</h3><p>I. The essence of man does not involve necessary existence.</p>${prose}`)]],
    })
    const { now, before } = await both(bytes)
    expect(titles(before)).toEqual(['Translated from the Latin by R. H. M. Elwes', 'Definitions', 'Axioms', 'Definitions', 'Axioms'])
    expect(titles(now)).toEqual(['The Ethics', 'Part 1 — Concerning God', 'Part 1 — Axioms', 'Part 2 — Definitions', 'Part 2 — Axioms'])
  })

  it('names a letter by its number and its heading, and a title page by the book (Clarissa)', async () => {
    const bytes = epub({
      title: 'Clarissa Harlowe; or the history of a young lady — Volume 1', creator: 'Samuel Richardson',
      nav: [['CLARISSA HARLOWE', 'c.xhtml#t1'], ['or the', 'c.xhtml#t2'], ['HISTORY OF A YOUNG LADY', 'c.xhtml#t3', [['Nine Volumes Volume I.', 'c.xhtml#t4']]],
        ['LETTER I', 'c.xhtml#l1', [['MISS ANNA HOWE, TO MISS CLARISSA HARLOWE JAN 10.', 'c.xhtml#h1']]]],
      docs: [['c.xhtml', page(`<h1 id="t1">CLARISSA HARLOWE</h1><h2 id="t2">or the</h2><h1 id="t3">HISTORY OF A YOUNG LADY</h1><h3 id="t4">Nine Volumes Volume I.</h3><p>The following History is given in a series of letters.</p>${prose}${prose}${prose}
        <h2 id="l1">LETTER I</h2><h3 id="h1">MISS ANNA HOWE, TO MISS CLARISSA HARLOWE JAN 10.</h3><p>I am extremely concerned, my dearest friend.</p>${prose}${prose}${prose}`)]],
    })
    const { now, before } = await both(bytes)
    expect(titles(before)).toEqual(['Nine Volumes Volume 1.', 'Miss Anna Howe, to Miss Clarissa Harlowe Jan 10'])
    expect(titles(now)).toEqual(['Clarissa Harlowe or the History of a Young Lady', 'Letter 1 — Miss Anna Howe, to Miss Clarissa Harlowe Jan 10'])
  })

  it("keeps a numbered chapter's own title over its first subheading (Gibbon, Chapter I and its Introduction)", async () => {
    const bytes = epub({
      title: 'History of the Decline and Fall of the Roman Empire — Volume 1', creator: 'Edward Gibbon',
      nav: [['Preface By The Editor.', 'p.xhtml'], ['Chapter I: The Extent Of The Empire In The Age Of The Antonines—Part I.', 'c1.xhtml#c', [['Introduction.', 'c1.xhtml#i']]]],
      docs: [
        ['p.xhtml', page('<h2>Preface By The Editor.</h2><p>The great work of Gibbon is indispensable to the student of history.</p>')],
        ['c1.xhtml', page(`<div class="chapter" id="c"><h2>Chapter I: The Extent Of The Empire In The Age Of The Antonines—Part I.</h2><h3 id="i">Introduction.</h3>
          <p>In the second century of the Christian Æra, the empire of Rome comprehended the fairest part of the earth. <a href="#linknote-1" id="linknoteref-1">1</a> Its frontiers <a href="#linknote-1a" id="linknoteref-1a">1a</a> were guarded.</p>
          <p class="foot"><a id="linknote-1"/>1 (<a href="#linknoteref-1">return</a>)<br/> [ Dion Cassius, l. lvi. p. 833.]</p>
          <p class="foot"><a id="linknote-1a"/>1001a (<a href="#linknoteref-1a">return</a>)<br/> [ See the Augustan History.]</p></div>`)],
      ],
    })
    const { now, before } = await both(bytes)
    expect(titles(before)).toEqual(['Preface By The Editor.', 'Introduction.'])
    expect(titles(now)).toEqual(['Preface By The Editor.', 'Chapter 1: The Extent Of The Empire In The Age Of The Antonines—Part 1.'])
    // The notes stay beside the text, without their way back; a lettered note call is a call, not a word.
    expect(now.chapters[1].paragraphs).toEqual([
      'Introduction.',
      'In the second century of the Christian Æra, the empire of Rome comprehended the fairest part of the earth. Its frontiers were guarded.',
      '[ Dion Cassius, l. lvi. p. 833.]',
      '[ See the Augustan History.]',
    ])
    expect(before.chapters[1].paragraphs.join('\n')).toMatch(/1 \(return\)[\s\S]*1001a \(return\)/)
    expect(before.chapters[1].paragraphs.join(' ')).toMatch(/Its frontiers 1a were guarded/)
  })

  it("joins an essay's epigraph, set apart before the essay's own heading, to the essay (Emerson, Essays)", async () => {
    const motto = ['There is no great and no small', 'To the Soul that maketh all:', 'And where it cometh, all things are', 'And it cometh everywhere.']
    const bytes = epub({
      title: 'Essays — First Series', creator: 'Ralph Waldo Emerson',
      nav: [['I. HISTORY', 'e.xhtml#m1'], ['HISTORY', 'e.xhtml#h1'], ['II. SELF-RELIANCE', 'e.xhtml#m2'], ['SELF-RELIANCE', 'e.xhtml#h2']],
      docs: [['e.xhtml', page(`<h2 id="m1">I. HISTORY</h2><p class="poem">${motto.join('<br/>')}</p><h2 id="h1">HISTORY</h2><p>There is one mind common to all individual men.</p>
        <h2 id="m2">II. SELF-RELIANCE</h2><p>“Ne te quæsiveris extra.”</p><h2 id="h2">SELF-RELIANCE</h2><p>I read the other day some verses written by an eminent painter.</p>`)]],
    })
    const { now, before } = await both(bytes)
    expect(titles(before)).toEqual(['1 — History', 'History', '2 — Self-Reliance', 'Self-Reliance'])
    expect(titles(now)).toEqual(['1 — History', '2 — Self-Reliance'])
    expect(now.chapters[0].paragraphs).toEqual([...motto, 'There is one mind common to all individual men.'])
  })
})

describe('bare numbers and their names (rules 6)', () => {
  it("takes a Wikisource chapter's name from under its number, and leaves out the export's title page and licence", async () => {
    const chapter = (n: string, name: string, text: string) => page(`<div class="wst-center"><p>${n}</p></div><div class="wst-center"><p><span class="wst-asc">${name}</span></p></div><p>${text}</p>`)
    const bytes = epub({
      title: 'The Time Machine (Heinemann text)', creator: 'H. G. Wells',
      nav: [['Title page', 'title.xhtml'], ['I', 'c1.xhtml'], ['II', 'c2.xhtml']],
      docs: [
        ['title.xhtml', page('<h2>The Time Machine (Heinemann text)</h2><h3>H. G. Wells</h3><h5>1895</h5><h6>Exported from Wikisource on October 8, 2026</h6>')],
        ['c1.xhtml', chapter('I', 'INTRODUCTION', 'The Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us.')],
        ['c2.xhtml', chapter('II', 'THE MACHINE', 'The thing the Time Traveller held in his hand was a glittering metallic framework.')
          .replace('</body>', '<div class="licenseContainer licenseBanner"><p>This work is in the <b>public domain</b> in the <b>United States</b> because it was published before January 1, 1931.</p></div></body>')],
      ],
    })
    const { now, before } = await both(bytes)
    expect(titles(before)).toEqual(['1', '2'])
    expect(titles(now)).toEqual(['1 — Introduction', '2 — The Machine'])
    expect(now.chapters[0].paragraphs).toEqual(['The Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us.'])
    expect(now.chapters[1].paragraphs).toEqual(['The thing the Time Traveller held in his hand was a glittering metallic framework.'])
    expect(JSON.stringify(before)).toMatch(/Exported from Wikisource|public domain/)
  })

  it('calls a Standard Ebooks chapter numbered only by its numeral a chapter', async () => {
    const chapter = (n: number, roman: string) => page(`<section id="chapter-${n}" epub:type="chapter"><h2 epub:type="ordinal z3998:roman">${roman}</h2><p>Text of chapter ${n}.</p></section>`, '')
      .replace('<body>', '<body epub:type="bodymatter z3998:fiction">')
    const bytes = epub({
      title: 'The Picture of Dorian Gray', creator: 'Oscar Wilde',
      nav: [['The Picture of Dorian Gray', 'half.xhtml', [['I', 'chapter-1.xhtml'], ['II', 'chapter-2.xhtml']]]],
      docs: [['half.xhtml', page('<section epub:type="halftitlepage"><h2 epub:type="fulltitle">The Picture of Dorian Gray</h2></section>')], ['chapter-1.xhtml', chapter(1, 'I')], ['chapter-2.xhtml', chapter(2, 'II')]],
    })
    const { now, before } = await both(bytes)
    expect(titles(before)).toEqual(['1', '2'])
    expect(titles(now)).toEqual(['Chapter 1', 'Chapter 2'])
    expect(now.chapters[0].paragraphs).toEqual(['Text of chapter 1.'])
  })

  it('reads a book of one untitled chapter under its own title (A Modest Proposal)', async () => {
    const bytes = epub({
      title: 'A Modest Proposal / For preventing the children of poor people in Ireland', creator: 'Jonathan Swift',
      nav: [['THE FULL PROJECT GUTENBERG LICENSE', 'l.xhtml#pg-footer']],
      docs: [['m.xhtml', page('<p>It is a melancholy object to those, who walk through this great town.</p>')], ['l.xhtml', page('<section id="pg-footer" class="pg-boilerplate"><h2>THE FULL PROJECT GUTENBERG LICENSE</h2></section>')]],
    })
    const { now, before } = await both(bytes)
    expect(titles(before)).toEqual(['Section 1'])
    expect(titles(now)).toEqual(['A Modest Proposal'])
  })
})

describe('verse and poems (rules 6)', () => {
  it("sets verse kept one line to a paragraph as lines, and a poem's number as its heading (Emily Dickinson, Poems)", async () => {
    const line = (text: string) => `<div class="pg_body_wrapper">\n${text}</div><div class="pg_body_wrapper"><br/>\n</div>`
    const poem = (n: string, lines: string[]) => `<div class="pg_body_wrapper"><a id="p${n}"/></div>${line(`${n}.`)}${lines.map(line).join('')}<hr/>`
    const bytes = epub({
      title: 'Poems by Emily Dickinson, Three Series, Complete', creator: 'Emily Dickinson',
      nav: [['First Series', 's.xhtml#s1']],
      docs: [['s.xhtml', page(`<h2 id="s1">First Series</h2><p>The eagerness with which the first volume of Emily Dickinson's poems has been read shows very clearly the rare quality of her verse.</p>
        ${poem('VI', ['If you were coming in the fall,', "I'd brush the summer by", 'With half a smile and half a spurn,', 'As housewives do a fly.'])}
        ${poem('VII', ['I hide myself within my flower,', 'That wearing on your breast,', 'You, unsuspecting, wear me too —', 'And angels know the rest.'])}`)]],
    })
    const { now, before } = await both(bytes)
    const kinds = (edition: typeof now) => edition.chapters[0].paragraphs.map((text, i) => [edition.chapters[0].kinds?.[i] ?? null, text])
    expect(before.chapters[0].kinds).toBeUndefined()
    expect(kinds(now)).toEqual([
      [null, "The eagerness with which the first volume of Emily Dickinson's poems has been read shows very clearly the rare quality of her verse."],
      ['heading', 'VI.'], ['line', 'If you were coming in the fall,'], ['line', "I'd brush the summer by"], ['line', 'With half a smile and half a spurn,'], ['line', 'As housewives do a fly.'],
      ['heading', 'VII.'], ['line', 'I hide myself within my flower,'], ['line', 'That wearing on your breast,'], ['line', 'You, unsuspecting, wear me too —'], ['line', 'And angels know the rest.'],
    ])
    // The text is the same either way: only what each paragraph is changes.
    expect(now.chapters[0].paragraphs).toEqual(before.chapters[0].paragraphs)
  })

  it("never takes short prose dialogue for verse (Sherlock Holmes's “Seven!” I answered.)", async () => {
    const bytes = epub({
      title: 'Stories', nav: [['One', 'a.xhtml']],
      docs: [['a.xhtml', page('<h1>One</h1><p>“Wedlock suits you,” he remarked.</p><p>“Seven!” I answered.</p><p>“Not yet.”</p><p>“But you have hopes?”</p><p>“I have hopes.”</p>')]],
    })
    expect((await epubToEdition(bytes)).chapters[0].kinds).toBeUndefined()
  })

  it("cuts a book without contents at its poems' titles set in a larger type (Keats, Poems 1817), without Project Gutenberg's naming line", async () => {
    const title = (text: string) => `<table><tbody><tr><td style="text-align: center;"><span style="font-size: large;">${text}</span></td></tr></tbody></table>`
    const verse = (lines: string[]) => `<table><tbody><tr><td><blockquote><div><p><span>${lines.join('<br/>')}</span></p></div></blockquote></td></tr></tbody></table>`
    const lines = (n: number) => Array.from({ length: 4 }, (_, i) => `Line ${i + 1} of the ${n === 1 ? 'first' : n === 2 ? 'second' : 'third'} poem, with words enough in it`)
    const bytes = epub({
      title: 'Poems 1817', creator: 'John Keats',
      nav: [['THE FULL PROJECT GUTENBERG LICENSE', 'l.xhtml#pg-footer']],
      docs: [
        ['k.xhtml', page(`<header class="pg-boilerplate" id="pg-header"><h2>The Project Gutenberg eBook of Poems 1817</h2></header><p>The Project Gutenberg eBook of Poems 1817, by John Keats</p>
          ${title('Poems 1817')}${title('SPECIMEN<br/><span style="font-size: small;">OF AN</span><br/>INDUCTION TO A POEM.')}${verse(lines(1))}${title('CALIDORE.')}${verse(lines(2))}${title('XI.<br/><br/><i>On first looking into Chapman’s Homer.</i>')}${verse(lines(3))}`)],
        ['l.xhtml', page('<section id="pg-footer" class="pg-boilerplate"><h2>THE FULL PROJECT GUTENBERG LICENSE</h2></section>')],
      ],
    })
    const { now, before } = await both(bytes)
    expect(titles(before)).toEqual(['Section 1'])
    expect(before.chapters[0].paragraphs[0]).toBe('The Project Gutenberg eBook of Poems 1817, by John Keats')
    expect(titles(now)).toEqual(['Specimen of an Induction to a Poem', 'Calidore', '11. On first looking into Chapman’s Homer.'])
    expect(JSON.stringify(now)).not.toMatch(/Project Gutenberg eBook/)
    expect(now.chapters[1].kinds).toEqual(['line', 'line', 'line', 'line'])
  })
})

describe('plays (rules 6)', () => {
  it("joins each speaker of A Doll's House to the speech, the porter who speaks once too, and marks the book a play", async () => {
    const lines: Array<[string, string]> = [['NORA', 'Hide the Christmas Tree carefully, Helen.'], ['PORTER', 'Sixpence.'], ['NORA', 'There is a shilling. No, keep the change.']]
    for (let i = 0; i < 9; i++) lines.push(['HELMER', `Is that my little lark twittering out there? (${i})`], ['NORA', `Yes, it is! (${i})`], ['MRS LINDE', `How do you do, Nora? (${i})`])
    const bytes = epub({
      title: "A Doll's House", creator: 'Henrik Ibsen', nav: [['ACT I', 'a.xhtml']],
      docs: [['a.xhtml', page(`<h2>ACT I</h2><p><i>[SCENE.—A room furnished comfortably.]</i></p>${lines.map(([who, text]) => `<p>${who}.<br/>${text}</p>`).join('')}`)]],
    })
    const { now, before } = await both(bytes)
    expect(now.chapters[0].paragraphs.slice(0, 4)).toEqual(['_[SCENE.—A room furnished comfortably.]_', 'NORA. Hide the Christmas Tree carefully, Helen.', 'PORTER. Sixpence.', 'NORA. There is a shilling. No, keep the change.'])
    expect(now.chapters[0].paragraphs).toContain('MRS LINDE. How do you do, Nora? (0)')
    expect(now.speakers).toBe(true)
    expect(before.chapters[0].paragraphs.slice(1, 3)).toEqual(['NORA.', 'Hide the Christmas Tree carefully, Helen.'])
  })

  it('never takes a proof, a figure or a numeral for a speaker', () => {
    const prose = Array.from({ length: 30 }, (_, i) => [`PROOF. This is clear from Prop. ${i}.`, `_Fig._ ${i}. A louse.`, `VI. The ${i}th axiom.`]).flat()
    expect(isPlayText(prose)).toBe(false)
    const play = Array.from({ length: 10 }, (_, i) => [`NORA. Line ${i}.`, `HELMER. Line ${i}.`, `RANK. Line ${i}.`]).flat()
    expect(isPlayText(play)).toBe(true)
    expect(shakespeareSpeakerWords('MRS LINDE. How do you do?')).toBe(2)
  })
})

describe('Add to Tinct takes the same rules (sourceTitles)', () => {
  it('sends the act title as written, for the Worker to check and set in house style', async () => {
    const dialogue = Array.from({ length: 24 }, (_, i) => `<p>${['ALGERNON', 'LANE', 'JACK'][i % 3]}.<br/>Line ${i}.</p>`).join('')
    const bytes = epub({
      title: 'The Importance of Being Earnest', creator: 'Oscar Wilde',
      nav: [['FIRST ACT', 'a.xhtml#a', [['SCENE', 'a.xhtml#s']]]],
      docs: [['a.xhtml', page(`<h2 id="a">FIRST ACT</h2><h3 id="s">SCENE</h3><p>Morning-room.</p>${dialogue}`)]],
    })
    const { edition } = await convertEpub(bytes, { sourceTitles: true, images: false })
    expect(titles(edition)).toEqual(['FIRST ACT'])
    expect(edition.chapters[0].paragraphs[2]).toBe('ALGERNON. Line 0.')
  })
})
