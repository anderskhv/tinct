// @vitest-environment jsdom

// A verse number with no text after it is not drawn (Anders, 27 Nov 2026). The WEB leaves seven verses out on
// purpose and the import kept their numbers, so Romans 16 ended "25 26 27". Display only: the number stays a word
// of its paragraph, so every word index, page map and saved place is what it was.
import { createElement } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { LabPassage, unprintedClass } from './LabPassage'
import { LabNativePaginator } from './LabNativePaginator'
import { labBareWords, labMeasureParagraphInto, labWordSpacing, measuredLineStarts } from './labMeasureParagraph'
import { chapterHearingPages, chapterPagesCover, isBareVerseMarker, isLabVerseMarker, labBareVerseMarkers, LAB_VERSE_SEPARATOR, labVerseMarkerDisplay, tokenizeHearingWords, type ChapterHearingPage } from './labHearing'
import { narrationTokens, isSilentNarrationToken, legacySpokenText } from '../narration/narrationCore'

afterEach(cleanup)

interface Chapter { number: number; title: string; paragraphs: string[] }
const edition = (key: string): Chapter[] =>
  (JSON.parse(readFileSync(resolve(process.cwd(), `public/data/editions/bible-${key}.json`), 'utf8')) as { chapters: Chapter[] }).chapters

/** The seven verses the WEB leaves out: chapter title, paragraph, word, and the number that is not drawn. */
const WEB_OMITTED = [
  ['Luke 17', 7, 0, '36'],
  ['Acts 8', 7, 27, '37'],
  ['Acts 15', 6, 48, '34'],
  ['Acts 24', 1, 12, '7'],
  ['Romans 16', 4, 65, '25'],
  ['Romans 16', 5, 0, '26'],
  ['Romans 16', 5, 1, '27'],
]

function passageProps(paragraphs: string[], readingPage: ChapterHearingPage) {
  return {
    chapterTitle: 'Romans 16', paragraphs, compareParagraphs: [] as string[], compare: false, mode: 'reading' as const,
    follow: { kind: 'none' as const }, followParagraphs: paragraphs.map((text, index) => ({ index, text })),
    markedIndexes: new Set<number>(), readingPage,
  }
}
/** The verse numbers a painted or measured block draws. */
const drawnNumbers = (root: Element) => [...root.querySelectorAll('.lab-verse-mark')].map(mark => mark.textContent)

describe('the rule: a verse number followed by another verse number, or by nothing, has no text', () => {
  it('finds the number before another number, and the number that ends its paragraph', () => {
    expect([...labBareVerseMarkers('left." ³⁶ ³⁷ They, answering, asked him')]).toEqual([1])
    expect([...labBareVerseMarkers('with you all! Amen. ²⁵ ')]).toEqual([4])
    expect([...labBareVerseMarkers('²⁶  ²⁷ ')]).toEqual([0, 1])
    expect([...labBareVerseMarkers('¹⁰ He gathered ¹¹ ¹² ¹³ and went')]).toEqual([3, 4])
    expect(isBareVerseMarker('with you all! Amen. ²⁵', 4)).toBe(true)
    expect(isBareVerseMarker('with you all! Amen. ²⁵', 3)).toBe(false)
  })

  it('leaves every number that has text, and everything that is not a verse number', () => {
    for (const text of [
      '¹ In the beginning God created the heavens and the earth. ² The earth was formless',
      '²⁴ The grace of our Lord Jesus Christ be with you all! Amen.',
      // Romans 14 in the WEB: the doxology's own numbering is book text, repaired separately.
      '²³ But he who doubts is condemned if he eats. (14:24) Now to him who is able to establish you',
      // A footnote number set against its word is part of that word, never a verse number.
      'as the prophet wrote.¹',
      'The year 1914 25 26 27',
      '',
    ]) expect(labBareVerseMarkers(text).size, text).toBe(0)
    expect(labBareVerseMarkers(undefined).size).toBe(0)
    expect(labBareWords({ text: '¹ In the beginning', from: 0 })).toBeUndefined()
    expect(labBareWords()).toBeUndefined()
  })

  it('answers by the word index in the paragraph, whatever slice of it is painted', () => {
    const text = 'left." ³⁶ ³⁷ They, answering'
    const whole = labBareWords({ text, from: 0 })!
    expect([0, 1, 2, 3, 4].map(whole)).toEqual([false, true, false, false, false])
    const tail = labBareWords({ text, from: 1 })!
    expect([0, 1, 2].map(tail)).toEqual([true, false, false])
  })
})

describe('the real Bibles: exactly seven numbers stop being drawn, all in the WEB', () => {
  const counts = (chapters: Chapter[]) => {
    let numbers = 0
    const bare: Array<Array<string | number>> = []
    for (const chapter of chapters) chapter.paragraphs.forEach((text, paragraphIndex) => {
      const words = tokenizeHearingWords(text)
      const found = labBareVerseMarkers(text)
      words.forEach((word, wordIndex) => {
        if (!isLabVerseMarker(word.text)) return
        numbers += 1
        if (found.has(wordIndex)) bare.push([chapter.title, paragraphIndex, wordIndex, labVerseMarkerDisplay(word.text)])
      })
      // Nothing but a verse number is ever left undrawn.
      for (const index of found) expect(isLabVerseMarker(words[index].text)).toBe(true)
    })
    return { numbers, bare }
  }

  it('WEB: Luke 17:36, Acts 8:37, 15:34 and 24:7, Romans 16:25-27, and no other', () => {
    const { numbers, bare } = counts(edition('web-en'))
    expect(bare).toEqual(WEB_OMITTED)
    expect(bare).toHaveLength(7)
    expect(numbers).toBeGreaterThan(31000)
  }, 60_000)

  it.each(['bsb-en', 'kjv-en', 'webc-en'])('%s: every verse number is still drawn', (key) => {
    const { numbers, bare } = counts(edition(key))
    expect(numbers).toBeGreaterThan(31000)
    expect(bare).toEqual([])
  }, 60_000)
})

describe('the page, as painted and as measured', () => {
  const web = edition('web-en')
  const chapter = (title: string) => web.find(item => item.title === title)!
  const romans = chapter('Romans 16').paragraphs
  const wholePage = (paragraphs: string[], from: number): ChapterHearingPage => {
    const segments = paragraphs.map((text, paragraphIndex) => ({ paragraphIndex, from: 0, to: tokenizeHearingWords(text).length })).slice(from)
    return { ...segments[0], segments }
  }

  it('Romans 16 ends on "Amen.": 25, 26 and 27 are not drawn, and every word keeps its span and index', () => {
    const { container } = render(<LabPassage {...passageProps(romans, wholePage(romans, 4))} />)
    const lines = [...container.querySelectorAll('.lab-hearing-line')]
    expect(lines).toHaveLength(2)
    expect(drawnNumbers(lines[0])).toEqual(['21', '22', '23', '24'])
    expect(lines[0].textContent!.endsWith('be with you all! Amen.')).toBe(true)
    expect(lines[1].textContent).toBe('')
    expect(container.textContent).not.toMatch(/2[567]|[²][⁵⁶⁷]/)
    // The paragraph that is only "26 27" draws nothing and is marked, so it takes no room (lab.css, below).
    expect(lines.map(line => line.classList.contains('is-unprinted'))).toEqual([false, true])
    // Display only: one word span per word of the paragraph, at the paragraph's own indexes.
    for (const [paragraphIndex, line] of [[4, lines[0]], [5, lines[1]]] as const) {
      const words = [...line.querySelectorAll('[data-testid="lab-word"]')]
      expect(words.map(word => Number(word.getAttribute('data-word-index'))))
        .toEqual(tokenizeHearingWords(romans[paragraphIndex]).map((_, index) => index))
      expect(words.every(word => Number(word.getAttribute('data-paragraph-index')) === paragraphIndex)).toBe(true)
    }
    expect(lines[0].querySelector('[data-word-index="65"]')!.textContent).toBe('')
    expect(tokenizeHearingWords(romans[4])).toHaveLength(66)
    expect(tokenizeHearingWords(romans[5]).map(word => word.text)).toEqual(['²⁶', '²⁷'])
  })

  it.each(WEB_OMITTED.filter(([title]) => title !== 'Romans 16'))('%s: the number with no verse is not drawn, the next verse is set as any other', (title, paragraphIndex, wordIndex, number) => {
    const paragraphs = chapter(title as string).paragraphs
    const text = paragraphs[paragraphIndex as number]
    const words = tokenizeHearingWords(text)
    const { container } = render(<LabPassage {...passageProps(paragraphs, { paragraphIndex: paragraphIndex as number, from: 0, to: words.length })} />)
    const line = container.querySelector('.lab-hearing-line')!
    const spans = [...line.querySelectorAll('[data-testid="lab-word"]')]
    expect(spans).toHaveLength(words.length)
    const numbers = words.filter(word => isLabVerseMarker(word.text)).map(word => labVerseMarkerDisplay(word.text))
    expect(numbers).toContain(number)
    expect(drawnNumbers(line)).toEqual(numbers.filter(item => item !== number))
    // The empty span is outside every verse unit and takes no space of its own.
    const bare = spans[wordIndex as number]
    expect(bare.textContent).toBe('')
    expect(bare.closest('.lab-verse-unit')).toBeNull()
    // The next verse: its number welded to its first word, after one ordinary space (none at a paragraph's start).
    const unit = spans[(wordIndex as number) + 1].closest('.lab-verse-unit')!
    expect(unit.textContent).toBe(`${labVerseMarkerDisplay(words[(wordIndex as number) + 1].text)}${LAB_VERSE_SEPARATOR}${words[(wordIndex as number) + 2].text}`)
    if (wordIndex === 0) expect(line.textContent!.startsWith(unit.textContent!)).toBe(true)
    else expect(line.textContent).toContain(`${words[(wordIndex as number) - 1].text} ${unit.textContent}`)
    expect(line.textContent).not.toContain(`${LAB_VERSE_SEPARATOR}${labVerseMarkerDisplay(words[(wordIndex as number) + 1].text)}`)
    expect(line.textContent).not.toMatch(/ {2}/)
  })

  it('the measured paragraph is the painted one, word for word, for every paragraph with such a number', () => {
    for (const [title, paragraphIndex] of WEB_OMITTED) {
      const paragraphs = chapter(title as string).paragraphs
      const text = paragraphs[paragraphIndex as number]
      const words = tokenizeHearingWords(text)
      const { container, unmount } = render(<LabPassage {...passageProps(paragraphs, { paragraphIndex: paragraphIndex as number, from: 0, to: words.length })} />)
      const painted = container.querySelector('.lab-hearing-line')!
      const measured = labMeasureParagraphInto(document.createElement('p'), words, { text, from: 0 })
      expect(measured.textContent).toBe(painted.textContent)
      expect([...measured.querySelectorAll('.lab-hearing-word')].map(word => word.textContent))
        .toEqual([...painted.querySelectorAll('.lab-hearing-word')].map(word => word.textContent))
      expect(drawnNumbers(measured)).toEqual(drawnNumbers(painted))
      // One measured span per word, so a line start is still named by its word's index.
      expect(measured.querySelectorAll('.lab-hearing-word')).toHaveLength(words.length)
      expect(measuredLineStarts(measured, 0)).toEqual([])
      unmount()
    }
  })

  it('a page that starts or ends inside the paragraph draws the same: the rule reads the paragraph, not the slice', () => {
    // Romans 16:24-25, cut so the slice ends on the bare number, and so it starts on it.
    const words = tokenizeHearingWords(romans[4])
    const ending = labMeasureParagraphInto(document.createElement('p'), words.slice(60, 66), { text: romans[4], from: 60 })
    expect(ending.textContent).toBe('be with you all! Amen.')
    const alone = labMeasureParagraphInto(document.createElement('p'), words.slice(65, 66), { text: romans[4], from: 65 })
    expect(alone.textContent).toBe('')
    expect(alone.querySelectorAll('.lab-hearing-word')).toHaveLength(1)
    // A number whose verse starts on the next page is a real verse number: it is drawn, as before.
    const genesis = '¹ In the beginning God created ² The earth was formless'
    const cut = labMeasureParagraphInto(document.createElement('p'), tokenizeHearingWords(genesis).slice(0, 7), { text: genesis, from: 0 })
    expect(drawnNumbers(cut)).toEqual(['1', '2'])
    // Spacing: nothing before the bare number, an ordinary space after it, none when nothing drawn precedes it.
    const luke = tokenizeHearingWords('left." ³⁶ ³⁷ They')
    const bare = labBareWords({ text: 'left." ³⁶ ³⁷ They', from: 0 })
    expect(luke.map((word, index) => labWordSpacing(word, index, luke[index - 1], bare))).toEqual(['', '', ' ', LAB_VERSE_SEPARATOR])
    const opening = tokenizeHearingWords('³⁶ ³⁷ They')
    const openingBare = labBareWords({ text: '³⁶ ³⁷ They', from: 0 })
    expect(opening.map((word, index) => labWordSpacing(word, index, opening[index - 1], openingBare))).toEqual(['', '', LAB_VERSE_SEPARATOR])
  })

  it('Compare’s column draws the same: no bare number, no space kept for it, every word still a span', () => {
    const { container } = render(<LabPassage {...passageProps(romans, wholePage(romans, 4))} compare compareParagraphs={romans} />)
    const column = container.querySelector('.lab-book-col-compare')!
    const pieces = [...column.querySelectorAll('[data-compare-paragraph]')]
    expect(pieces.map(piece => Number(piece.getAttribute('data-compare-paragraph')))).toEqual([4, 5])
    for (const piece of pieces) {
      const paragraphIndex = Number(piece.getAttribute('data-compare-paragraph'))
      const words = tokenizeHearingWords(romans[paragraphIndex])
      const spans = [...piece.querySelectorAll('[data-testid="lab-word"]')]
      expect(spans).toHaveLength(words.length)
      spans.forEach((span, index) => expect(span.textContent).toBe(isBareVerseMarker(romans[paragraphIndex], index) ? '' : words[index].text))
    }
    expect(pieces[0].textContent!.endsWith('be with you all! Amen.')).toBe(true)
    expect(pieces[1].textContent).toBe('')
    expect(column.textContent).not.toMatch(/[²][⁵⁶⁷]/)
    // Beside another edition's paragraph, the number with no verse leaves no gap either.
    const beside = render(<LabPassage {...passageProps(['one two three four five'], { paragraphIndex: 0, from: 0, to: 5 })} compare compareParagraphs={['left." ³⁶ ³⁷ They, answering']} />)
    expect(beside.container.querySelector('.lab-book-col-compare')!.textContent).toBe('left." ³⁷ They, answering')
  })

  it('a paragraph in which nothing is drawn takes no room, and the chapter’s last text keeps its usual ending', () => {
    const line = (paragraphIndex: number, from: number, to: number) => ({ paragraphIndex, from, words: tokenizeHearingWords(romans[paragraphIndex]).slice(from, to) })
    expect(unprintedClass(romans, [line(5, 0, 2)], [0])).toBe(' is-unprinted')
    expect(unprintedClass(romans, [line(4, 65, 66)], [0])).toBe(' is-unprinted')
    // Any drawn word, in any line painted in the block, and it is an ordinary paragraph.
    expect(unprintedClass(romans, [line(4, 64, 66)], [0])).toBe('')
    expect(unprintedClass(romans, [line(4, 0, 66)], [0])).toBe('')
    expect(unprintedClass(romans, [line(4, 64, 66), line(5, 0, 2)], [0, 1])).toBe('')
    expect(unprintedClass(['¹ In the beginning'], [{ paragraphIndex: 0, from: 0, words: tokenizeHearingWords('¹ In the beginning') }], [0])).toBe('')
    const css = readFileSync(resolve(process.cwd(), 'src/lab/lab.css'), 'utf8')
    // Its own margins go wherever it is built (painted, measured, the phone's column flow): the empty word spans say so.
    expect(css).toMatch(/\.lab \.lab-hearing-line:not\(:has\(\.lab-hearing-word:not\(:empty\), \.lab-word-fragment\)\):has\(\.lab-hearing-word:empty\) \{\s*margin-top: 0;\s*margin-bottom: 0;\s*\}/)
    // And the text before it ends the chapter as a last paragraph does, by a rule that weighs what that rule weighs.
    const last = css.indexOf('.lab-passage.is-reading .lab-hearing-stage > .lab-hearing-line:last-child {')
    const before = css.indexOf('.lab-passage.is-reading .lab-hearing-stage > .lab-hearing-line:has(+ .is-unprinted:where(:last-child)) {')
    expect(last).toBeGreaterThan(0)
    expect(before).toBeGreaterThan(last)
    expect(css.slice(before, css.indexOf('}', before))).toMatch(/margin-bottom: 0;/)
  })

  it('the phone’s column flow lays the number out empty and marks it, so its page is the page of the word before', () => {
    const view = render(createElement(LabNativePaginator, { chapterTitle: 'Romans 16', paragraphs: romans, layoutKey: 'test', onPages: vi.fn() }))
    const flow = view.container.querySelector('[data-native-page-flow]')!
    const bare = [...flow.querySelectorAll('[data-bare-verse="true"]')]
    expect(bare.map(node => `${node.getAttribute('data-paragraph-index')}:${node.getAttribute('data-word-index')}`)).toEqual(['4:65', '5:0', '5:1'])
    expect(bare.every(node => node.textContent === '' && node.getAttribute('data-native-word') === 'true')).toBe(true)
    // Every word of the chapter still has its node: the map covers the chapter word for word.
    expect(flow.querySelectorAll('[data-native-word="true"]')).toHaveLength(romans.reduce((sum, text) => sum + tokenizeHearingWords(text).length, 0))
    expect(drawnNumbers(flow)).toEqual(Array.from({ length: 24 }, (_, index) => String(index + 1)))
    expect(flow.textContent!.endsWith('be with you all! Amen.')).toBe(true)
  })
})

describe('what is not display stays exactly as it was', () => {
  const romans = edition('web-en').find(item => item.title === 'Romans 16')!.paragraphs

  it('word counts and the word-count page map still hold every number', () => {
    expect(tokenizeHearingWords(romans[4])[65].text).toBe('²⁵')
    const pages = chapterHearingPages(romans)
    expect(chapterPagesCover(romans, pages)).toBe(true)
    expect(pages[pages.length - 1]).toMatchObject({ paragraphIndex: 5, to: 2 })
  })

  it('narration never spoke a verse number, so it speaks none of these either', () => {
    for (const text of [romans[4], romans[5]]) {
      const tokens = narrationTokens(text)
      expect(tokens).toHaveLength(tokenizeHearingWords(text).length)
      const spoken = legacySpokenText(tokens)
      expect(spoken).not.toMatch(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/)
      tokens.filter(token => isLabVerseMarker(token)).forEach(token => expect(isSilentNarrationToken(token)).toBe(true))
    }
    expect(legacySpokenText(narrationTokens(romans[4])).endsWith('be with you all! Amen.')).toBe(true)
    expect(legacySpokenText(narrationTokens(romans[5]))).toBe('')
  })
})
