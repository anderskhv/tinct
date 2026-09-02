// @vitest-environment jsdom

import { createElement } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { chapterPagesCover, chapterPageSegments } from './labHearing'
import { LabNativePaginator, balanceNativeChapterTail, nativePagesFromPlacements, type LabNativeWordPlacement } from './LabNativePaginator'

afterEach(cleanup)

describe('native phone pagination', () => {
  it('turns browser column placements into exact multi-paragraph pages', () => {
    const placements: LabNativeWordPlacement[] = [
      { pageIndex: 0, paragraphIndex: 0, wordIndex: 0 },
      { pageIndex: 0, paragraphIndex: 0, wordIndex: 1 },
      { pageIndex: 1, paragraphIndex: 0, wordIndex: 2 },
      { pageIndex: 1, paragraphIndex: 1, wordIndex: 0 },
      { pageIndex: 1, paragraphIndex: 1, wordIndex: 1 },
      { pageIndex: 2, paragraphIndex: 1, wordIndex: 2 },
    ]

    const pages = nativePagesFromPlacements(placements)

    expect(pages.map(chapterPageSegments)).toEqual([
      [{ paragraphIndex: 0, from: 0, to: 2 }],
      [
        { paragraphIndex: 0, from: 2, to: 3 },
        { paragraphIndex: 1, from: 0, to: 2 },
      ],
      [{ paragraphIndex: 1, from: 2, to: 3 }],
    ])
    expect(chapterPagesCover(['one two three', 'four five six'], pages)).toBe(true)
  })

  it('is deterministic for the same native layout', () => {
    const placements: LabNativeWordPlacement[] = Array.from({ length: 18 }, (_, wordIndex) => ({
      pageIndex: Math.floor(wordIndex / 6),
      paragraphIndex: 0,
      wordIndex,
    }))

    expect(nativePagesFromPlacements(placements)).toEqual(nativePagesFromPlacements(placements))
  })

  it('rebalances a sparse same-paragraph final page after a Safari fullscreen resize', () => {
    expect(balanceNativeChapterTail([
      { paragraphIndex: 0, from: 0, to: 50 },
      { paragraphIndex: 0, from: 50, to: 52 },
    ])).toEqual([
      { paragraphIndex: 0, from: 0, to: 36, segments: undefined },
      { paragraphIndex: 0, from: 36, to: 52, segments: undefined },
    ])
  })

  it('keeps a multi-digit verse marker attached to its first word', () => {
    const view = render(createElement(LabNativePaginator, {
      chapterTitle: 'Genesis 1',
      paragraphs: ['¹⁰ And God said'],
      layoutKey: 'test',
      onPages: vi.fn(),
    }))

    const unit = view.container.querySelector('.lab-verse-unit')
    expect(unit?.textContent).toBe('10\u00a0And God')
    expect(unit?.querySelectorAll('[data-native-word="true"]')).toHaveLength(3)
  })

  it('keeps the break before a verse start outside the no-wrap unit', () => {
    const view = render(createElement(LabNativePaginator, {
      chapterTitle: 'Genesis 1',
      paragraphs: ['it was so. ⁸ And God said'],
      layoutKey: 'test',
      onPages: vi.fn(),
    }))

    const unit = view.container.querySelector('.lab-verse-unit')
    expect(unit?.previousSibling?.textContent).toBe(' ')
    expect(unit?.textContent).toBe('8\u00a0And God')
    expect(unit?.previousSibling?.previousSibling?.textContent).toBe('so.')
  })
})
