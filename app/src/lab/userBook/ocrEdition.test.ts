/**
 * The recognised text of a scanned PDF becomes a Tinct edition (ocrEdition.ts):
 * page furniture dropped, paragraphs joined across pages, line-end hyphens
 * healed, footnotes gathered under Notes, chapters from h1 (else the outline,
 * else 20 pages each) and every paragraph anchored to its PDF page.
 */
import { describe, expect, it } from 'vitest'
import { assembleOcrEdition, ocrDefaultEdition, ocrFailedPageText, type OcrPage } from './ocrEdition'
import { OCR_EDITION_FORMAT, PDF_TEXT_CONVERTER, USER_EDITION_CONVERTER, USER_EDITION_FORMAT, usableUserEdition, type UserBookEdition } from './userEdition'

const p = (x: string) => ({ t: 'p' as const, x })
const page = (n: number, blocks: OcrPage['blocks'], flags: Partial<OcrPage> = {}): OcrPage => ({ page: n, blocks, ...flags })
const book = { title: 'A Scanned Book', author: 'Jo Writer' }

describe('assembleOcrEdition', () => {
  it('makes a usable edition marked as recognised text', () => {
    const edition = assembleOcrEdition({ ...book, pages: [page(1, [p('One sentence.')])] })
    expect(edition).toMatchObject({ format: USER_EDITION_FORMAT, converter: OCR_EDITION_FORMAT, source: 'ocr', title: 'A Scanned Book', author: 'Jo Writer', droppedImages: 0 })
    expect(usableUserEdition(edition)).toBe(true)
    expect(edition.chapters[0].paragraphs).toEqual(['One sentence.'])
    expect(edition.chapters[0].pages).toEqual([1])
  })

  // Format 2 (15 Oct 2026, the scans test): captions stay, as paragraphs of their own; format 1 dropped them.
  it('drops running heads, footers and page numbers, and keeps a caption as a paragraph of its own', () => {
    const edition = assembleOcrEdition({ ...book, pages: [page(1, [
      { t: 'head', x: 'A SCANNED BOOK' }, { t: 'num', x: '12' }, p('Body text that runs on'), { t: 'cap', x: 'Figure 1. A map.' }, { t: 'foot', x: 'Printed in Denmark' },
    ])] })
    expect(edition.chapters[0].paragraphs).toEqual(['Body text that runs on', 'Figure 1. A map.'])
    expect(edition.converter).toBe(2)
  })

  it('keeps an algorithm box line by line, and a caption never runs on into the next page\'s paragraph', () => {
    const edition = assembleOcrEdition({ ...book, pages: [
      page(1, [p('The procedure is below.'), { t: 'alg', x: 'Algorithm 1 Minibatch training\nfor number of iterations do\n  update the discriminator\nend for' }, { t: 'cap', x: 'Figure 2: the losses' }]),
      page(2, [p('which a lower-case start would join.')]),
    ] })
    const ch = edition.chapters[0]
    expect(ch.paragraphs).toEqual(['The procedure is below.', 'Algorithm 1 Minibatch training', 'for number of iterations do', 'update the discriminator', 'end for', 'Figure 2: the losses', 'which a lower-case start would join.'])
    expect(ch.kinds).toEqual([null, 'line', 'line', 'line', 'line', null, null])
  })

  it('splits a paper into chapters at every numbered section, h1 or h2; subsections and unnumbered headings stay inside', () => {
    const edition = assembleOcrEdition({ ...book, pages: [
      page(1, [{ t: 'h1', x: 'Generative Adversarial Nets' }, p('Abstract. We propose a framework.'), { t: 'h2', x: '1 Introduction' }, p('Deep learning is promising.')]),
      page(2, [{ t: 'h2', x: '2 Related work' }, p('Earlier models.'), { t: 'h2', x: '3. Adversarial nets' }, p('The framework.'), { t: 'h2', x: '3.1 Training' }, p('Train both.')]),
      page(3, [{ t: 'h2', x: 'Acknowledgments' }, p('Thanks.'), { t: 'h2', x: 'IV. Results' }, p('It works.')]),
    ] })
    expect(edition.chapters.map(c => [c.title, c.pages![0]])).toEqual([['Generative Adversarial Nets', 1], ['1 Introduction', 1], ['2 Related work', 2], ['3. Adversarial nets', 2], ['IV. Results', 3]])
    expect(edition.chapters[3].paragraphs).toEqual(['The framework.', '3.1 Training', 'Train both.', 'Acknowledgments', 'Thanks.'])
  })

  it('a book with h1 chapters is not split at numbered sections inside them', () => {
    const edition = assembleOcrEdition({ ...book, pages: [
      page(1, [{ t: 'h1', x: 'Chapter One' }, { t: 'h2', x: '1 The question' }, p('Text.'), { t: 'h2', x: '2 The answer' }, p('More.')]),
      page(2, [{ t: 'h1', x: 'Chapter Two' }, p('Next.')]),
    ] })
    expect(edition.chapters.map(c => c.title)).toEqual(['Chapter One', 'Chapter Two'])
  })

  it('joins a paragraph across pages and records where the next page begins', () => {
    const edition = assembleOcrEdition({ ...book, pages: [
      page(1, [p('First paragraph.'), p('The second one runs on')], { ends_mid_paragraph: true }),
      page(2, [{ t: 'head', x: 'RUNNING HEAD' }, p('across the page break.'), p('Third.')], { starts_mid_paragraph: true }),
    ] })
    const chapter = edition.chapters[0]
    expect(chapter.paragraphs).toEqual(['First paragraph.', 'The second one runs on across the page break.', 'Third.'])
    expect(chapter.pages).toEqual([1, 1, 2])
    // Paragraph 1, word 5 ("across") is where page 2 begins.
    expect(chapter.pageBreaks).toEqual([[1, 5, 2]])
  })

  it('joins when the next page starts in lower case even without the model flag, but not after a full stop and a capital', () => {
    const joined = assembleOcrEdition({ ...book, pages: [page(1, [p('It was the best')]), page(2, [p('of times.')])] })
    expect(joined.chapters[0].paragraphs).toEqual(['It was the best of times.'])
    const apart = assembleOcrEdition({ ...book, pages: [page(1, [p('An ending.')]), page(2, [p('A beginning.')])] })
    expect(apart.chapters[0].paragraphs).toEqual(['An ending.', 'A beginning.'])
    expect(apart.chapters[0].pageBreaks).toBeUndefined()
  })

  it('heals line-end hyphenation within and across pages, but keeps a compound the book spells with a hyphen', () => {
    const edition = assembleOcrEdition({ ...book, pages: [
      page(1, [p('A well-known fact and a won-\nderful day.'), p('Another well-\nknown fact, and a long para-')]),
      page(2, [p('graph that ends.')]),
    ] })
    expect(edition.chapters[0].paragraphs).toEqual(['A well-known fact and a wonderful day.', 'Another well-known fact, and a long paragraph that ends.'])
    // "paragraph" starts on page 1: page 2 begins at word 7 ("that"), no longer inside a word.
    expect(edition.chapters[0].pageBreaks).toEqual([[1, 7, 2]])
  })

  it('removes soft hyphens and collapses line breaks inside a paragraph', () => {
    const edition = assembleOcrEdition({ ...book, pages: [page(1, [p('Soft­ly   spoken\nwords.')])] })
    expect(edition.chapters[0].paragraphs).toEqual(['Softly spoken words.'])
  })

  it('collects footnotes under a Notes heading at the end of their chapter', () => {
    const edition = assembleOcrEdition({ ...book, pages: [
      page(1, [{ t: 'h1', x: 'Chapter One' }, p('A claim.1'), { t: 'fn', x: '1 A source.' }]),
      page(2, [p('More.2'), { t: 'fn', x: '2 Another source.' }]),
      page(3, [{ t: 'h1', x: 'Chapter Two' }, p('Next.')]),
    ] })
    const [one, two] = edition.chapters
    expect(one.paragraphs).toEqual(['A claim.1', 'More.2', 'Notes', '1 A source.', '2 Another source.'])
    expect(one.kinds).toEqual([null, null, 'heading', null, null])
    expect(one.pages).toEqual([1, 2, 1, 1, 2])
    expect(two.paragraphs).toEqual(['Next.'])
    expect(two.kinds).toBeUndefined()
  })

  it('a footnote between two pages does not stop the body text joining', () => {
    const edition = assembleOcrEdition({ ...book, pages: [
      page(1, [p('The sentence goes'), { t: 'fn', x: '* A note.' }, { t: 'num', x: '1' }]),
      page(2, [p('on here.')]),
    ] })
    expect(edition.chapters[0].paragraphs).toEqual(['The sentence goes on here.', 'Notes', '* A note.'])
  })

  it('cuts chapters at h1, keeps h2 as headings, and sets tables and equations line by line', () => {
    const edition = assembleOcrEdition({ ...book, pages: [
      page(1, [p('Before any chapter.')]),
      page(2, [{ t: 'h1', x: 'CHAPTER I' }, { t: 'h1', x: 'The Start' }, p('Text.'), { t: 'h2', x: 'A section' }, { t: 'tbl', x: 'Year | Count\n1900 | 3' }, { t: 'eq', x: 'E = mc^2' }]),
      page(3, [{ t: 'h1', x: 'CHAPTER II' }, p('More.')]),
    ] })
    expect(edition.chapters.map(c => [c.number, c.title])).toEqual([[1, 'A Scanned Book'], [2, 'CHAPTER I: The Start'], [3, 'CHAPTER II']])
    const one = edition.chapters[1]
    expect(one.paragraphs).toEqual(['Text.', 'A section', 'Year | Count', '1900 | 3', 'E = mc^2'])
    expect(one.kinds).toEqual([null, 'heading', 'line', 'line', 'line'])
    expect(one.pages).toEqual([2, 2, 2, 2, 2])
    expect(edition.chapters[2].pages).toEqual([3])
  })

  it('without h1 cuts chapters at the outline, else every 20 pages', () => {
    const pages = Array.from({ length: 45 }, (_, i) => page(i + 1, [p(`Page ${i + 1} text.`)]))
    const outlined = assembleOcrEdition({ ...book, pages, outline: [{ title: 'Part A', page: 1 }, { title: 'Part B', page: 30 }] })
    expect(outlined.chapters.map(c => [c.title, c.pages?.[0], c.paragraphs.length])).toEqual([['Part A', 1, 29], ['Part B', 30, 16]])
    const plain = assembleOcrEdition({ ...book, pages })
    expect(plain.chapters.map(c => c.title)).toEqual(['Pages 1–20', 'Pages 21–40', 'Pages 41–45'])
    expect(plain.chapters[2].paragraphs[0]).toBe('Page 41 text.')
  })

  it('stands a placeholder for a page that could not be recognised, and skips blank pages', () => {
    const edition = assembleOcrEdition({ ...book, pages: [
      page(1, [p('Before the gap')]),
      page(2, [], { failed: true }),
      page(3, [], { blank: true }),
      page(4, [p('after it.')]),
    ] })
    expect(ocrFailedPageText(2)).toBe('Page 2 could not be recognised. It is in Original pages.')
    expect(edition.chapters[0].paragraphs).toEqual(['Before the gap', 'Page 2 could not be recognised. It is in Original pages.', 'after it.'])
    expect(edition.chapters[0].pages).toEqual([1, 2, 4])
  })

  it('treats a blank page between two halves of a paragraph as no break', () => {
    const edition = assembleOcrEdition({ ...book, pages: [page(1, [p('A plate interrupts')]), page(2, [], { blank: true }), page(3, [p('the sentence.')])] })
    expect(edition.chapters[0].paragraphs).toEqual(['A plate interrupts the sentence.'])
    expect(edition.chapters[0].pageBreaks).toEqual([[0, 3, 3]])
  })

  it('orders pages by number whatever order they arrive in, and is deterministic', () => {
    const pages = [page(2, [p('Second.')]), page(1, [p('First.')])]
    const a = assembleOcrEdition({ ...book, pages })
    const b = assembleOcrEdition({ ...book, pages: [...pages].reverse() })
    expect(a).toEqual(b)
    expect(a.chapters[0].paragraphs).toEqual(['First.', 'Second.'])
  })

  it('reports its layout: recognised pages, pages set in two or more columns, pages with equations', () => {
    const edition = assembleOcrEdition({ ...book, pages: [
      page(1, [p('Prose.')], { columns: 2 }),
      page(2, [p('More.'), { t: 'eq', x: 'E = mc^2' }], { columns: 1 }),
      page(3, [], { blank: true, columns: 2 }),
      page(4, [], { failed: true }),
      page(5, [p('End.')]),
    ] })
    expect(edition.ocrLayout).toEqual({ pages: 3, columns: 1, equations: 1 })
  })

  it('opens as Tinct text unless it is set in columns on ≥30% of its pages and has equations on ≥20%', () => {
    const many = (n: number, of: (i: number) => OcrPage) => Array.from({ length: n }, (_, i) => of(i + 1))
    const paper = (columnPages: number, equationPages: number) => assembleOcrEdition({ ...book, pages: many(10, n => page(n, [p(`Page ${n}.`), ...(n <= equationPages ? [{ t: 'eq' as const, x: 'x = 1' }] : [])], { columns: n <= columnPages ? 2 : 1 })) })
    expect(ocrDefaultEdition(paper(3, 2))).toBe('pages')
    expect(ocrDefaultEdition(paper(10, 10))).toBe('pages')
    expect(ocrDefaultEdition(paper(2, 10))).toBe('text')
    expect(ocrDefaultEdition(paper(10, 1))).toBe('text')
    expect(ocrDefaultEdition(paper(0, 0))).toBe('text')
    // An edition without a layout (or any other) reads as text.
    expect(ocrDefaultEdition({ ...paper(10, 10), ocrLayout: undefined })).toBe('text')
    expect(ocrDefaultEdition(null)).toBe('text')
  })

  it('has no chapters when nothing was recognised', () => {
    const edition = assembleOcrEdition({ ...book, pages: [page(1, [], { blank: true })] })
    expect(edition.chapters).toEqual([])
    expect(usableUserEdition(edition)).toBe(false)
  })
})

describe('usableUserEdition by source', () => {
  const chapters = [{ number: 1, title: 'One', paragraphs: ['Text.'] }]
  const edition = (source: UserBookEdition['source'] | 'other', converter: number) => ({ format: USER_EDITION_FORMAT, converter, title: 'T', author: '', language: '', droppedImages: 0, chapters, ...(source ? { source } : {}) })
  it('checks each source against its own rule numbers', () => {
    expect(usableUserEdition(edition(undefined, USER_EDITION_CONVERTER))).toBe(true)
    expect(usableUserEdition(edition('epub', USER_EDITION_CONVERTER))).toBe(true)
    expect(usableUserEdition(edition('pdf', PDF_TEXT_CONVERTER))).toBe(true)
    expect(usableUserEdition(edition('ocr', OCR_EDITION_FORMAT))).toBe(true)
    expect(usableUserEdition(edition('ocr', USER_EDITION_CONVERTER))).toBe(false)
    expect(usableUserEdition(edition('pdf', 99))).toBe(false)
    expect(usableUserEdition(edition('other', 1))).toBe(false)
  })
})
