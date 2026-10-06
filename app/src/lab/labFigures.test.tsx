// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  acquireFigureUrl,
  bookFigures,
  figureElement,
  figureFor,
  figurePlacement,
  figureToken,
  isFigureToken,
  readableParagraph,
  registerFigureAssets,
  registerFigures,
  releaseFigureUrl,
  resetFigures,
  setFigureLayout,
} from './labFigures'
import { measuredDesktopPages } from './LabDesktopPaginator'
import { chapterPageSegments, chapterPagesCover, pageIndexForPlace } from './labHearing'
import { labMeasureParagraphInto } from './labMeasureParagraph'
import { tokenizeHearingWords } from './labHearing'
import { LabPassage } from './LabPassage'
import { registerChapterStructure } from './labParagraphStyle'
import fixture from './__fixtures__/figure-edition.json'
import type { Chapter } from '../types'

afterEach(resetFigures)

const PHONE = { columnWidth: 340, pageHeight: 620 }

describe('a figure in the text', () => {
  it('is one word standing for a registered picture', () => {
    const chapter = fixture.chapters[0] as Chapter
    registerChapterStructure(chapter)
    const token = figureToken('f1')
    expect(isFigureToken(token)).toBe(true)
    expect(isFigureToken('word')).toBe(false)
    expect(tokenizeHearingWords(token)).toHaveLength(1)
    expect(figureFor(token)).toMatchObject({ id: 'f1', number: 1, chapterNumber: 1, paragraphIndex: 1 })
    expect(readableParagraph(token)).toBe('[Figure 1: A lamp of the old kind, drawn for this test.]')
    expect(readableParagraph('Plain text.')).toBe('Plain text.')
    expect(bookFigures(fixture.chapters as Chapter[]).map(figure => [figure.id, figure.chapterNumber, figure.paragraphIndex])).toEqual([['f1', 1, 1], ['f2', 2, 2]])
  })
})

describe('placement, from the page', () => {
  it('draws a small or medium figure the full column wide, caption beneath', () => {
    expect(figurePlacement({ width: 800, height: 500 }, PHONE)).toEqual({ mode: 'inline', width: 340, height: 212 })
  })

  it('never draws more than 45% of the page high; if that would make it too narrow, it is a strip on this layout', () => {
    // 600 x 1000 at full width is 566px high on a 620px page: limited to 279px it is 167px wide, under half the column.
    expect(figurePlacement({ width: 600, height: 1000 }, PHONE)).toEqual({ mode: 'strip' })
    // On a desktop leaf the same picture fits inline.
    expect(figurePlacement({ width: 600, height: 1000 }, { columnWidth: 520, pageHeight: 1400 })).toEqual({ mode: 'inline', width: 378, height: 630 })
  })

  it('makes a large or detailed picture a strip, and never blows a small one up more than twice', () => {
    expect(figurePlacement({ width: 1800, height: 1000, large: true }, PHONE)).toEqual({ mode: 'strip' })
    expect(figurePlacement({ width: 120, height: 100 }, PHONE)).toEqual({ mode: 'inline', width: 240, height: 200 })
  })

  it('measures the boxes the page paints, before any image loads', () => {
    setFigureLayout(PHONE)
    registerChapterStructure(fixture.chapters[0] as Chapter)
    const token = figureToken('f1')
    const p = labMeasureParagraphInto(document.createElement('p'), tokenizeHearingWords(token), { text: token, from: 0 })
    expect(p.classList.contains('is-figure')).toBe(true)
    const frame = p.querySelector<HTMLElement>('.lab-figure.is-inline .lab-figure-frame')!
    expect([frame.style.width, frame.style.height]).toEqual(['340px', '255px'])
    expect(p.querySelector('.lab-figure-caption')?.textContent).toBe('A lamp of the old kind, drawn for this test.')
    expect(p.querySelector('img')).toBeNull()
    expect(figureElement({ id: 'x', number: 7, src: '/x.png', large: true }).textContent).toBe('Figure 7 ↗')
  })
})

describe('a figure among the pages', () => {
  // Pages hold 10 words; a figure costs 6.
  const cost = (paragraphs: string[]) => (segments: Array<{ paragraphIndex: number; from: number; to: number }>) =>
    segments.reduce((sum, s) => sum + (isFigureToken(paragraphs[s.paragraphIndex]) ? 6 : s.to - s.from), 0) <= 10

  it('floats to the top of the next page when it does not fit the rest of this one, while the text keeps flowing', () => {
    const paragraphs = ['a b c d e f', figureToken('f1'), 'g h i', 'j k l m n o p q r s t u']
    const pages = measuredDesktopPages(paragraphs.map(p => tokenizeHearingWords(p).length), cost(paragraphs), undefined, Infinity, paragraphs)
    expect(pages.map(page => chapterPageSegments(page).map(s => [s.paragraphIndex, s.from, s.to]))).toEqual([
      [[0, 0, 6], [2, 0, 3], [3, 0, 1]],
      [[1, 0, 1], [3, 1, 5]],
      [[3, 5, 12]],
    ])
    // Every word once; the figure is one item with its own place.
    expect(chapterPagesCover(paragraphs, pages)).toBe(true)
    expect(pageIndexForPlace(pages, 1, 0)).toBe(1)
  })

  it('stays where it is when it fits', () => {
    const paragraphs = ['a b c', figureToken('f1'), 'd e f g']
    const pages = measuredDesktopPages(paragraphs.map(p => tokenizeHearingWords(p).length), cost(paragraphs), undefined, Infinity, paragraphs)
    expect(chapterPageSegments(pages[0]).map(s => s.paragraphIndex)).toEqual([0, 1, 2])
  })
})

describe('the page', () => {
  it('paints a figure as a button that opens its card, as its own word', () => {
    setFigureLayout(PHONE)
    const chapter = fixture.chapters[0] as Chapter
    registerChapterStructure(chapter)
    const onOpenFigure = vi.fn()
    render(<LabPassage chapterTitle="One" paragraphs={chapter.paragraphs} compareParagraphs={[]} compare={false} mode="reading"
      follow={{ kind: 'none' }} followParagraphs={[]} markedIndexes={new Set()} onOpenFigure={onOpenFigure}
      readingPage={{ paragraphIndex: 0, from: 0, to: 1, segments: [{ paragraphIndex: 0, from: 0, to: 5 }, { paragraphIndex: 1, from: 0, to: 1 }] }} />)
    const figure = screen.getByTestId('lab-figure')
    expect(figure.closest('[data-testid="lab-word"]')?.getAttribute('data-paragraph-index')).toBe('1')
    expect(figure.closest('.lab-hearing-line')?.classList.contains('is-figure')).toBe(true)
    fireEvent.click(figure)
    expect(onOpenFigure).toHaveBeenCalledWith(expect.objectContaining({ id: 'f1' }))
  })
})

describe('a reader’s own pictures', () => {
  it('get an object URL only while drawn, revoked when the last one goes', () => {
    const create = vi.fn(() => 'blob:tinct/1')
    const revoke = vi.fn()
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }))
    const blob = new Blob(['x'], { type: 'image/png' })
    registerFigureAssets(key => (key === 'f1' ? blob : null))
    expect(acquireFigureUrl('asset:f1')).toBe('blob:tinct/1')
    expect(acquireFigureUrl('asset:f1')).toBe('blob:tinct/1')
    expect(create).toHaveBeenCalledTimes(1)
    releaseFigureUrl('asset:f1')
    expect(revoke).not.toHaveBeenCalled()
    releaseFigureUrl('asset:f1')
    expect(revoke).toHaveBeenCalledWith('blob:tinct/1')
    expect(acquireFigureUrl('asset:missing')).toBeNull()
    // A built-in edition names a same-origin path; nothing else is drawn.
    expect(acquireFigureUrl('/data/figures/x.png')).toBe('/data/figures/x.png')
    expect(acquireFigureUrl('https://example.org/x.png')).toBeNull()
    vi.unstubAllGlobals()
  })
})
