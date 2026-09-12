// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LabPassage } from './LabPassage'
import { labMeasureParagraphInto } from './labMeasureParagraph'
import { tokenizeHearingWords, type ChapterHearingPage } from './labHearing'
import { registerVerseLines, resetVerseLines } from './labVerseLines'

/** Macbeth I.i as served, and as `macbeth-lines.json` lineates it. */
const WITCHES = 'FIRST WITCH. When shall we three meet again? In thunder, lightning, or in rain?'
const HURLYBURLY = 'SECOND WITCH. When the hurlyburly’s done, When the battle’s lost and won.'
const DIRECTION = '[Thunder and Lightning. Enter three Witches.]'
const PARAGRAPHS = [DIRECTION, WITCHES, HURLYBURLY]
const OFFSETS = { 1: [45], 2: [42] }

afterEach(() => {
  cleanup()
  resetVerseLines()
})

function passageProps(readingPage: ChapterHearingPage) {
  return {
    chapterTitle: 'Act 1, Scene 1 — A Desert Place',
    paragraphs: PARAGRAPHS,
    compareParagraphs: [],
    compare: false,
    mode: 'reading' as const,
    follow: { kind: 'none' as const },
    followParagraphs: PARAGRAPHS.map((text, index) => ({ index, text })),
    markedIndexes: new Set<number>(),
    readingPage,
  }
}

const wholeChapter: ChapterHearingPage = {
  paragraphIndex: 0,
  from: 0,
  to: tokenizeHearingWords(DIRECTION).length,
  segments: PARAGRAPHS.map((text, paragraphIndex) => ({
    paragraphIndex,
    from: 0,
    to: tokenizeHearingWords(text).length,
  })),
}

describe('verse lines on the painted page', () => {
  it('paints one block per verse line, with the speaker label on the first', () => {
    registerVerseLines(PARAGRAPHS, OFFSETS)
    render(<LabPassage {...passageProps(wholeChapter)} />)
    const paragraphs = [...screen.getByTestId('lab-reading-stage').querySelectorAll('.lab-hearing-line')]
    const lines = paragraphs.map(p => [...p.querySelectorAll('.lab-verse-line')].map(line => line.textContent?.trim()))
    expect(lines).toEqual([
      [],
      ['FIRST WITCH. When shall we three meet again?', 'In thunder, lightning, or in rain?'],
      ['SECOND WITCH. When the hurlyburly’s done,', 'When the battle’s lost and won.'],
    ])
  })

  it('changes nothing about which words are painted, or their word indexes', () => {
    const withoutLines = render(<LabPassage {...passageProps(wholeChapter)} />)
    const before = [...screen.getByTestId('lab-reading-stage').querySelectorAll('[data-testid="lab-word"]')]
      .map(word => `${word.getAttribute('data-paragraph-index')}:${word.getAttribute('data-word-index')}:${word.textContent?.trim()}`)
    withoutLines.unmount()

    registerVerseLines(PARAGRAPHS, OFFSETS)
    render(<LabPassage {...passageProps(wholeChapter)} />)
    const after = [...screen.getByTestId('lab-reading-stage').querySelectorAll('[data-testid="lab-word"]')]
      .map(word => `${word.getAttribute('data-paragraph-index')}:${word.getAttribute('data-word-index')}:${word.textContent?.trim()}`)
    // Audio word-following addresses words by these indexes.
    expect(after).toEqual(before)
  })

  it('leaves a stage direction and a prose paragraph as one block', () => {
    registerVerseLines(PARAGRAPHS, OFFSETS)
    render(<LabPassage {...passageProps(wholeChapter)} />)
    const paragraphs = [...screen.getByTestId('lab-reading-stage').querySelectorAll('.lab-hearing-line')]
    expect(paragraphs[0].querySelectorAll('.lab-verse-line')).toHaveLength(0)
    expect(paragraphs[0].textContent?.trim()).toBe(DIRECTION)
  })
})

describe('verse lines in the hidden measurement copy', () => {
  it('reaches the measured paragraph too, so pagination sees the real shape', () => {
    registerVerseLines(PARAGRAPHS, OFFSETS)
    const words = tokenizeHearingWords(WITCHES)
    const measured = labMeasureParagraphInto(document.createElement('p'), words, { text: WITCHES, from: 0 })
    const lines = [...measured.querySelectorAll('.lab-verse-line')].map(line => line.textContent?.trim())
    expect(lines).toEqual([
      'FIRST WITCH. When shall we three meet again?',
      'In thunder, lightning, or in rain?',
    ])
    expect(measured.textContent?.replace(/\s+/g, ' ').trim()).toBe(WITCHES)
  })

  it('measures a page-tail slice from the line it actually starts on', () => {
    registerVerseLines(PARAGRAPHS, OFFSETS)
    const words = tokenizeHearingWords(WITCHES)
    const measured = labMeasureParagraphInto(document.createElement('p'), words.slice(8), { text: WITCHES, from: 8 })
    const lines = [...measured.querySelectorAll('.lab-verse-line')].map(line => line.textContent?.trim())
    expect(lines).toEqual(['In thunder, lightning, or in rain?'])
  })

  it('is untouched for prose', () => {
    const words = tokenizeHearingWords(WITCHES)
    const measured = labMeasureParagraphInto(document.createElement('p'), words, { text: WITCHES, from: 0 })
    expect(measured.querySelectorAll('.lab-verse-line')).toHaveLength(0)
  })
})
