// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import fixture from '../__fixtures__/figure-edition.json'
import { registerChapterStructure, resetParagraphStyles } from '../labParagraphStyle'
import { resetFigures } from '../labFigures'
import { registerVerseLines, resetVerseLines } from '../labVerseLines'
import { registerLineatedChapter } from '../labPoetry'
import { continuousReaderWindow } from './continuousReaderWindow'
import { ContinuousReaderPrototype } from './ContinuousReaderPrototype'

afterEach(() => {
  cleanup()
  resetVerseLines()
  resetParagraphStyles()
  resetFigures()
})

const words = () => [...screen.getByTestId('lab-reading-stage').querySelectorAll<HTMLElement>('[data-testid="lab-word"]')]
const anchors = () => words().map(el => `${el.dataset.paragraphIndex}:${el.dataset.wordIndex}`)

describe('one-chapter continuous prototype', () => {
  it('bounds DOM words and preserves the source indices after a shifted window', () => {
    const paragraphs = Array.from({ length: 1189 }, (_, p) => Array.from({ length: 12 }, (_, w) => `p${p}w${w}`).join(' '))
    const passage = { chapterTitle: 'Psalm 119', chapterNumber: 599, paragraphs }
    const { rerender } = render(<ContinuousReaderPrototype passage={passage} anchor={{ paragraphIndex: 700, wordIndex: 5 }} limits={{ maxParagraphs: 8, maxWords: 72 }} />)
    expect(words().length).toBeLessThanOrEqual(72)
    expect(anchors()).toContain('700:5')
    rerender(<ContinuousReaderPrototype passage={passage} anchor={{ paragraphIndex: 702, wordIndex: 5 }} limits={{ maxParagraphs: 8, maxWords: 72 }} />)
    expect(words().length).toBeLessThanOrEqual(72)
    expect(anchors()).toContain('702:5')
    expect(new Set(anchors()).size).toBe(anchors().length)
    expect(anchors()[0]).toBe('702:5')
  })

  it('renders each source word exactly once while traversing a long paragraph', () => {
    const passage = { chapterTitle: 'Long unit', chapterNumber: 1, paragraphs: [Array.from({ length: 1001 }, (_, i) => `word${i}`).join(' ')] }
    let anchor: { paragraphIndex: number; wordIndex: number } | null = { paragraphIndex: 0, wordIndex: 0 }
    const { rerender } = render(<ContinuousReaderPrototype passage={passage} anchor={anchor} limits={{ maxWords: 80 }} />)
    const seen: string[] = []
    while (anchor) {
      rerender(<ContinuousReaderPrototype passage={passage} anchor={anchor} limits={{ maxWords: 80 }} />)
      expect(words().length).toBeLessThanOrEqual(80)
      seen.push(...anchors())
      anchor = continuousReaderWindow(passage.paragraphs, anchor, { maxWords: 80 })!.nextAnchor
    }
    expect(seen).toEqual(Array.from({ length: 1001 }, (_, i) => `0:${i}`))
  })

  it('delegates prose, Macbeth speaker/verse/stage direction, and lineated Bible poetry', () => {
    const play = [
      '[Thunder and Lightning. Enter three Witches.]',
      'FIRST WITCH. When shall we three meet again? In thunder, lightning, or in rain?',
      'SECOND WITCH. When the hurlyburly’s done, When the battle’s lost and won.',
    ]
    registerVerseLines(play, { 1: [45], 2: [42] })
    const { unmount } = render(<ContinuousReaderPrototype passage={{ chapterTitle: 'Act 1, Scene 1', chapterNumber: 1, paragraphs: play }} anchor={{ paragraphIndex: 0, wordIndex: 0 }} />)
    expect(screen.getByTestId('lab-reading-stage').querySelectorAll('.lab-verse-line').length).toBe(4)
    expect([...screen.getByTestId('lab-reading-stage').querySelectorAll('.lab-verse-speaker')].map(el => el.textContent)).toEqual(['FIRST WITCH.', 'SECOND WITCH.'])
    expect(screen.getByTestId('lab-reading-stage').textContent).toContain(play[0])
    expect(anchors()).toContain('1:5')
    unmount()

    const poem = ['¹ Wine is a mocker, strong drink is a brawler,', 'and whoever is led astray by them is not wise.', '² Let another praise you, and not your own mouth,', 'a stranger, and not your own lips.']
    registerLineatedChapter(poem)
    render(<ContinuousReaderPrototype passage={{ chapterTitle: 'Proverbs', chapterNumber: 1, paragraphs: poem }} anchor={{ paragraphIndex: 0, wordIndex: 0 }} />)
    expect(anchors()).toContain('2:3')
    expect(screen.getByTestId('lab-reading-stage').querySelectorAll('.lab-hearing-line').length).toBeLessThan(poem.length)
    expect(screen.getByTestId('lab-reading-stage').textContent).toContain('a stranger, and not your own lips.')
  })

  it('keeps a registered figure as one indexed source word and a footnote outside indexed words', () => {
    const chapter = fixture.chapters[0]
    registerChapterStructure(chapter)
    const onFootnote = vi.fn()
    const onSelectRange = vi.fn()
    render(<ContinuousReaderPrototype passage={{ chapterTitle: chapter.title, chapterNumber: chapter.number, paragraphs: chapter.paragraphs,
      footnotes: [{ id: 'note-1', number: 1, paragraphIndex: 2, wordIndex: 2, text: 'A source note.' }], onFootnote, onSelectRange,
    }} anchor={{ paragraphIndex: 0, wordIndex: 0 }} />)
    expect(screen.getByTestId('lab-reading-stage').querySelectorAll('.lab-figure-word')).toHaveLength(1)
    expect(anchors()).toContain('1:0')
    const prior = anchors()
    const marker = screen.getByTestId('lab-footnote-mark')
    fireEvent.click(marker)
    expect(onFootnote).toHaveBeenCalledTimes(1)
    expect(anchors()).toEqual(prior)
    const word = words().find(el => el.dataset.paragraphIndex === '2' && el.dataset.wordIndex === '2')!
    fireEvent.pointerDown(word, { pointerType: 'mouse', button: 0, clientX: 10, clientY: 20 })
    fireEvent.pointerUp(word, { pointerType: 'mouse', clientX: 10, clientY: 20 })
    expect(onSelectRange.mock.calls[0][0]).toMatchObject({ paragraphIndex: 2, fromWord: 2 })
  })
})
