import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { dropPrintedContents, isContentsHeading, printedContentsRange } from '../../public/lab/printed-contents.js'

interface FixtureChapter { number: number; title: string; paragraphs: string[]; kinds?: Array<string | null>; links?: Array<[number, number, number, string]> }
// Real Project Gutenberg books as the converter reads them (titles as written, the printed contents whole).
const fixture = JSON.parse(readFileSync(join(process.cwd(), 'src/__fixtures__/gutenberg-contents-titles.json'), 'utf8')) as { books: Record<string, { chapters: FixtureChapter[] }> }
const book = (name: string) => fixture.books[name].chapters
const titles = (chapters: FixtureChapter[]) => chapters.map(chapter => chapter.title)

describe('printed contents in imported books', () => {
  it('drops Seneca’s printed CONTENTS (PAGE header, page numbers, ditto marks) and renumbers the rest', () => {
    const chapters = book('seneca-minor-dialogues')
    const contents = chapters[2]
    expect(contents.title).toBe('CONTENTS.')
    expect(contents.paragraphs.slice(0, 5)).toEqual(['PAGE', 'Of Providence 1', 'On the Firmness of the Wise Man 22', 'Of Anger. I. 48', '" II. 76'])
    const kept = dropPrintedContents(chapters)
    expect(kept).toHaveLength(chapters.length - 1)
    expect(titles(kept)).not.toContain('CONTENTS.')
    expect(kept.map(chapter => chapter.number)).toEqual(kept.map((_, index) => index + 1))
    // Everything else is untouched: the preface and every dialogue keep their text.
    expect(kept[1]).toEqual({ ...chapters[1], number: 2 })
    expect(kept[2].paragraphs).toEqual(chapters[3].paragraphs)
  })

  it('drops a Dickens-style CONTENTS (Oliver Twist: title page, then numbered chapter summaries)', () => {
    const chapters = book('oliver-twist')
    expect(chapters[0].title).toBe('Contents')
    expect(chapters[0].paragraphs[4]).toMatch(/^I TREATS OF THE PLACE WHERE OLIVER TWIST WAS BORN/)
    const kept = dropPrintedContents(chapters)
    expect(titles(kept)).toEqual(titles(chapters).slice(1))
    expect(kept[0].number).toBe(1)
  })

  it('cuts a contents set inside a chapter, under its own heading (Montaigne’s title page)', () => {
    const chapters = book('montaigne-essays')
    const front = chapters[0]
    expect(front.paragraphs.slice(0, 4)).toEqual(['ESSAYS OF MICHEL DE MONTAIGNE', 'Translated by Charles Cotton Edited by William Carew Hazlitt', 'CONTENTS', 'PREFACE'])
    expect(printedContentsRange(front.paragraphs, { titles: titles(chapters).slice(1) })?.[0]).toBe(2)
    // Only the title page is left, so the chapter goes; the book opens with the Preface.
    const kept = dropPrintedContents(chapters)
    expect(kept[0].title).toBe('PREFACE')
    expect(kept).toHaveLength(chapters.length - 1)
  })

  it('drops short contents pages that name the book’s parts (Cicero)', () => {
    expect(titles(dropPrintedContents(book('cicero-friendship-old-age')))).toEqual(['INTRODUCTORY NOTE', 'ON FRIENDSHIP', 'ON OLD AGE'])
    const tusculan = book('cicero-tusculan-disputations')
    expect(tusculan[2].title).toBe('5CONTENTS.')
    expect(titles(dropPrintedContents(tusculan))).not.toContain('5CONTENTS.')
    expect(dropPrintedContents(tusculan)).toHaveLength(tusculan.length - 1)
  })

  it('cuts Wikisource’s printed contents out of its front page, page-number cells and all, keeping the rest', () => {
    for (const name of ['wikisource-king-in-yellow', 'wikisource-prince-ricci']) {
      const chapters = book(name)
      const front = chapters[0]
      const at = front.paragraphs.findIndex(text => /^CONTENTS\.?$/.test(text))
      expect(at, name).toBeGreaterThan(12)
      const kept = dropPrintedContents(chapters)
      expect(kept, name).toHaveLength(chapters.length)
      // The title page and the licence stay; from the heading to the last page number goes.
      expect(kept[0].paragraphs.slice(0, at), name).toEqual(front.paragraphs.slice(0, at))
      expect(kept[0].paragraphs.slice(at)[0], name).toMatch(/public domain/)
      expect(kept[0].paragraphs.slice(at).some(text => /^(PAGE|CHAP\. PAGE|\d+\.?)$/.test(text)), name).toBe(false)
      expect(kept.slice(1), name).toEqual(chapters.slice(1))
    }
  })

  it('leaves books without a printed contents exactly as they are', () => {
    const chapters = book('tale-of-two-cities')
    expect(dropPrintedContents(chapters)).toBe(chapters)
  })

  it('cuts a contents out of the middle of a chapter with its kinds and links in step', () => {
    const chapter: FixtureChapter = {
      number: 1,
      title: 'Preface',
      paragraphs: ['A preface long enough to be prose, written by the translator about the work and its many difficulties, at some length.', 'TABLE OF CONTENTS', 'Chapter I. The Start 1', 'Chapter II. The Middle 20', 'Chapter III. The End 41', 'The translator thanks the reader for patience with a book so long in the making, and with so many notes.'],
      kinds: [null, 'heading', null, null, null, null],
      links: [[0, 0, 1, 'https://a.example'], [5, 0, 1, 'https://b.example']],
    }
    const other = { number: 2, title: 'Chapter 1. The Start', paragraphs: ['It began.'] }
    const [kept] = dropPrintedContents<FixtureChapter>([chapter, other])
    expect(kept.paragraphs).toEqual([chapter.paragraphs[0], chapter.paragraphs[5]])
    expect(kept.kinds).toEqual([null, null])
    expect(kept.links).toEqual([[0, 0, 1, 'https://a.example'], [1, 0, 1, 'https://b.example']])
  })

  it('knows contents headings, and only those', () => {
    for (const heading of ['CONTENTS', 'CONTENTS.', 'Contents', 'TABLE OF CONTENTS', 'Table of Contents', '5CONTENTS.', 'DETAILED CONTENTS', 'Contents of Volume I', 'Table des matières']) expect(isContentsHeading(heading), heading).toBe(true)
    for (const heading of ['Contentment', 'The Contents of the Box', 'Chapter 1 — Contents', 'Of Providence', '']) expect(isContentsHeading(heading), heading).toBe(false)
  })
})

describe('what is not a printed contents', () => {
  const others = ['Chapter 1 — The Census', 'Chapter 2 — The Ledger', 'Chapter 3 — The Harvest', 'Chapter 4 — The Flood']

  it('a short chapter full of numbers', () => {
    const chapter = {
      number: 3,
      title: 'Chapter 3 — The Harvest',
      paragraphs: [
        'In 1805 the harvest failed.',
        'They counted 12 sheep, then 14, then 9.',
        'The ledger for 1806 shows 40.',
        'By page 212 of the parish book, 31.',
        'Nobody knew why.',
      ],
    }
    expect(printedContentsRange(chapter.paragraphs, { titles: others })).toBeNull()
    const book = [{ number: 1, title: others[0], paragraphs: ['A.'] }, { number: 2, title: others[1], paragraphs: ['B.'] }, chapter]
    expect(dropPrintedContents(book)).toBe(book)
  })

  it('poetry with line numbers', () => {
    const lines = [
      'Of Man’s first disobedience, and the fruit',
      'Of that forbidden tree whose mortal taste',
      'Brought death into the World, and all our woe,',
      'With loss of Eden, till one greater Man',
      'Restore us, and regain the blissful seat, 5',
      'Sing, Heavenly Muse, that, on the secret top',
      'Of Oreb, or of Sinai, didst inspire',
      'That shepherd who first taught the chosen seed',
      'In the beginning how the heavens and earth',
      'Rose out of Chaos: or, if Sion hill 10',
      'Delight thee more, and Siloa’s brook that flowed',
      'Fast by the oracle of God, I thence',
      'Invoke thy aid to my adventurous song, 15',
    ]
    expect(printedContentsRange(lines, { titles: ['Book 1', 'Book 2', 'Book 3', 'Book 4'] })).toBeNull()
    // Every line numbered, as some editions print them: still verse, not a contents.
    expect(printedContentsRange(lines.map((line, index) => `${line.replace(/\s\d+$/, '')} ${index + 1}`), { titles: ['Book 1', 'Book 2', 'Book 3', 'Book 4'] })).toBeNull()
  })

  it('a chapter that merely mentions its contents', () => {
    const paragraphs = ['CONTENTS', 'The box held more than she had expected, and she set each thing out on the table in the order she found it, slowly.', 'A key.', 'A letter.']
    expect(printedContentsRange(paragraphs, { titles: others })).toBeNull()
  })
})

// Gutenberg Add to Tinct check, 2026-10-09: every chapter was asked about every other chapter's
// title one by one, so a book of many chapters cost chapters² (Shakespeare's Complete Works,
// 862 chapters, spent ~26 s in the Worker's publish; a 1,334-chapter book ~28 s; 1,500 chapters
// below took 22 s). The book's titles are now indexed once, with the same answers.
describe('a book of many chapters', () => {
  const many = (count: number) => Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    title: `Of the ${i}th matter and its many curious consequences`,
    paragraphs: Array.from({ length: 30 }, (_, j) => `A short line ${j} about a thing that happened`),
  }))

  it('is read in time linear in its chapters', () => {
    const chapters = many(1500)
    const started = performance.now()
    expect(dropPrintedContents(chapters)).toBe(chapters)
    expect(performance.now() - started).toBeLessThan(5000)
  }, 30_000)

  it('still finds a list of the other chapters, and counts a chapter’s own title only when another chapter shares it', () => {
    const chapters = many(8)
    const listing = { number: 9, title: 'The Plan', paragraphs: chapters.map(chapter => chapter.title) }
    expect(titles(dropPrintedContents([listing, ...chapters]))).toEqual(titles(chapters))
    const own = { number: 1, title: 'Of the sea and of ships', paragraphs: Array.from({ length: 6 }, () => 'Of the sea and of ships') }
    const rest = ['Of the land and of carts', 'Of the air and of birds', 'Of fire and of smiths'].map((title, i) => ({ number: i + 2, title, paragraphs: ['Text.'] }))
    expect(dropPrintedContents([own, ...rest])).toHaveLength(4)
    // With a second chapter of that title, each names the other: both read as lists of chapters.
    expect(dropPrintedContents([own, ...rest, { ...own, number: 5 }])).toHaveLength(3)
    expect(printedContentsRange(own.paragraphs, { titles: [...titles(rest), own.title] })).toEqual([0, 6])
  })
})
