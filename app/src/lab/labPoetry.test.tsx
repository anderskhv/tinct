// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { lineatedProseJoins, lineSlice, proseJoins, proseRuns, registerLineatedChapter, sliceJoinsPrevious, sliceRunContinues } from './labPoetry'
import { LabPassage } from './LabPassage'
import { measuredDesktopPages } from './LabDesktopPaginator'
import { labMeasureJoinInto, labMeasureParagraphInto } from './labMeasureParagraph'
import { chapterPageSegments, chapterPagesCover, readingPageLines, tokenizeHearingWords, type ChapterHearingPage } from './labHearing'

afterEach(cleanup)

function chapter(edition: string, number: number): { title: string; paragraphs: string[] } {
  const file = resolve(__dirname, `../../public/data/editions-chapters/bible-${edition}/ch${String(number).padStart(4, '0')}.json`)
  return JSON.parse(readFileSync(file, 'utf8'))
}

/** The visual paragraphs a chapter paints as, source paragraphs joined by a space. */
function visual(paragraphs: string[], joins = lineatedProseJoins(paragraphs)): string[] {
  const out: string[] = []
  paragraphs.forEach((text, index) => {
    if (joins[index]) out[out.length - 1] += ` ${text}`
    else out.push(text)
  })
  return out
}

const opening = (text: string) => text.split(' ')[0]

describe('BSB poetry set as prose', () => {
  it('sets Proverbs 20 as WEB does: one paragraph per five verses', () => {
    const { title, paragraphs } = chapter('bsb-en', 648)
    expect(title).toBe('Proverbs 20')
    expect(paragraphs).toHaveLength(60)
    const out = visual(paragraphs)
    expect(out.map(opening)).toEqual(['¹', '⁶', '¹¹', '¹⁶', '²¹', '²⁶'])
    expect(out[0].startsWith('¹ Wine is a mocker, strong drink is a brawler, and whoever is led astray by them is not wise. ² The terror')).toBe(true)
    // WEB paragraphs this chapter at exactly the same verses.
    expect(chapter('web-en', 648).paragraphs.map(opening)).toEqual(out.map(opening))
  })

  it('joins Psalm 23 and Isaiah 5 into verse-run paragraphs', () => {
    const psalm = chapter('bsb-en', 501)
    expect(psalm.title).toBe('Psalms 23')
    expect(visual(psalm.paragraphs).map(opening)).toEqual(['¹', '⁶'])
    expect(visual(psalm.paragraphs)[0]).toContain('¹ A Psalm of David. The LORD is my shepherd; I shall not want. ² He makes me lie down')
    const isaiah = chapter('bsb-en', 684)
    expect(isaiah.paragraphs).toHaveLength(118)
    expect(visual(isaiah.paragraphs).map(opening)).toEqual(['¹', '⁶', '¹¹', '¹⁶', '²¹', '²⁶'])
  })

  it('leaves Genesis 1 prose paragraphs alone and sets only its poem (1:27) as one paragraph', () => {
    const { paragraphs } = chapter('bsb-en', 1)
    const joins = lineatedProseJoins(paragraphs)
    const joined = paragraphs.filter((_, index) => joins[index])
    expect(joined).toEqual(['in the image of God He created him;', 'male and female He created them.'])
    // The refrain after a prose verse stays its own paragraph.
    expect(visual(paragraphs)).toContain('And there was evening, and there was morning—the sixth day.')
    expect(visual(paragraphs)).toHaveLength(paragraphs.length - 2)
  })

  it('sets the Beatitudes in two paragraphs and keeps the Sermon prose as it is', () => {
    const { paragraphs } = chapter('bsb-en', 934)
    const out = visual(paragraphs)
    expect(out[1]).toBe('³ “Blessed are the poor in spirit, for theirs is the kingdom of heaven. ⁴ Blessed are those who mourn, for they will be comforted. ⁵ Blessed are the meek, for they will inherit the earth.')
    expect(out[2].startsWith('⁶ Blessed are those who hunger')).toBe(true)
    expect(out[2].endsWith('for theirs is the kingdom of heaven.')).toBe(true)
    expect(out.slice(3)).toEqual(paragraphs.slice(17))
  })

  it('keeps a prose paragraph apart from the poem it introduces', () => {
    const { paragraphs } = chapter('bsb-en', 685)
    const out = visual(paragraphs)
    expect(out[0].endsWith('³ And they were calling out to one another:')).toBe(true)
    expect(out[1]).toBe('“Holy, holy, holy is the LORD of Hosts; all the earth is full of His glory.”')
  })

  it('does not treat a prose dialogue turn as a poetic line', () => {
    const { paragraphs } = chapter('bsb-en', 29)
    const index = paragraphs.findIndex(text => text.startsWith('⁶ “Is he well?”'))
    expect(index).toBeGreaterThan(0)
    expect(lineatedProseJoins(paragraphs)[index + 1]).toBe(false)
  })

  it('never joins the paragraphs of an edition that already sets poetry as prose', () => {
    for (const number of [1, 501, 648, 684, 934]) {
      const { paragraphs } = chapter('web-en', number)
      expect(lineatedProseJoins(paragraphs).some(Boolean)).toBe(false)
    }
  })

  it('applies only to chapters registered as line-split', () => {
    const paragraphs = ['¹ Wine is a mocker,', 'and strong drink a brawler.', '² A king sits to judge,', 'sifting evil with his eyes.']
    expect(proseJoins(paragraphs)).toEqual([false, false, false, false])
    const registered = [...paragraphs]
    registerLineatedChapter(registered)
    expect(proseJoins(registered)).toEqual([false, true, true, true])
  })
})

describe('joined source paragraphs keep their indexes', () => {
  const paragraphs = ['¹ Wine is a mocker,', 'and strong drink a brawler.', '² A king sits to judge,', 'sifting evil with his eyes.', '³ Then the king rose early in the morning and went out with all his servants to the gate of the city, where the elders sat together and waited for him.']
  registerLineatedChapter(paragraphs)

  it('groups page slices only across whole source paragraphs', () => {
    const counts = paragraphs.map(text => tokenizeHearingWords(text).length)
    expect(proseRuns(paragraphs, [
      { paragraphIndex: 0, from: 0, to: counts[0] },
      { paragraphIndex: 1, from: 0, to: 2 },
    ])).toEqual([[0, 1]])
    // A page that starts mid-line starts its own block; a line cut short never joins onward.
    expect(sliceJoinsPrevious(paragraphs, { paragraphIndex: 0, from: 0, to: 2 }, { paragraphIndex: 1, from: 0, to: 2 })).toBe(false)
    expect(sliceJoinsPrevious(paragraphs, { paragraphIndex: 0, from: 0, to: counts[0] }, { paragraphIndex: 1, from: 1, to: 2 })).toBe(false)
    expect(sliceRunContinues(paragraphs, { paragraphIndex: 1, from: 0, to: counts[1] })).toBe(true)
    expect(sliceRunContinues(paragraphs, { paragraphIndex: 3, from: 0, to: counts[3] })).toBe(false)
    expect(proseRuns(paragraphs, [{ paragraphIndex: 0, from: 0, to: counts[0] }, { paragraphIndex: 1, from: 0, to: counts[1] }], false)).toEqual([[0], [1]])
  })

  it('paints a verse run as one block whose words keep their source paragraph and word indexes', () => {
    const page: ChapterHearingPage = {
      paragraphIndex: 0, from: 0, to: 4,
      segments: paragraphs.map((text, paragraphIndex) => ({ paragraphIndex, from: 0, to: tokenizeHearingWords(text).length })),
    }
    render(<LabPassage chapterTitle="Proverbs 20" paragraphs={paragraphs} compareParagraphs={[]} compare={false} mode="reading"
      follow={{ kind: 'none' }} followParagraphs={paragraphs.map((text, index) => ({ index, text }))} markedIndexes={new Set([2])} readingPage={page} />)
    const lines = [...screen.getByTestId('lab-reading-stage').querySelectorAll(':scope > .lab-hearing-line')]
    expect(lines).toHaveLength(2)
    expect(lines[0].textContent).toBe('1\u00a0Wine is a mocker, and strong drink a brawler. 2\u00a0A king sits to judge, sifting evil with his eyes.')
    expect(lines[0].className).toContain('is-marked')
    expect(lines[0].querySelectorAll('.lab-prose-join')).toHaveLength(3)
    expect(lines[0].querySelector('#lab-p-2')?.classList.contains('lab-prose-join')).toBe(true)
    const words = [...lines[0].querySelectorAll('[data-testid="lab-word"]')]
      .map(word => `${word.getAttribute('data-paragraph-index')}:${word.getAttribute('data-word-index')}`)
    const expected = paragraphs.slice(0, 4).flatMap((text, paragraphIndex) => tokenizeHearingWords(text).map((_, wordIndex) => `${paragraphIndex}:${wordIndex}`))
    expect(words).toEqual(expected)
    expect(lines[1].textContent?.startsWith('3\u00a0Then the king')).toBe(true)
    expect(lines[1].querySelector('.lab-prose-join')).toBeNull()
  })

  it('justifies a page tail when the verse run goes on to the next page', () => {
    const first = tokenizeHearingWords(paragraphs[0]).length
    const page: ChapterHearingPage = { paragraphIndex: 0, from: 0, to: first, segments: [
      { paragraphIndex: 0, from: 0, to: first }, { paragraphIndex: 1, from: 0, to: 2 },
    ] }
    const lines = readingPageLines(paragraphs, page)
    expect(proseRuns(paragraphs, lines.map(lineSlice))).toEqual([[0, 1]])
    render(<LabPassage chapterTitle="Proverbs 20" paragraphs={paragraphs} compareParagraphs={[]} compare={false} mode="reading"
      follow={{ kind: 'none' }} followParagraphs={[]} markedIndexes={new Set()} readingPage={page} />)
    const painted = screen.getByTestId('lab-reading-stage').querySelectorAll('.lab-hearing-line')
    expect(painted).toHaveLength(1)
    expect(painted[0].classList.contains('is-continued')).toBe(true)
  })

  it('measures a joined line with the markup it paints with', () => {
    const p = document.createElement('p')
    labMeasureParagraphInto(p, tokenizeHearingWords(paragraphs[0]), { text: paragraphs[0], from: 0 })
    labMeasureJoinInto(p, tokenizeHearingWords(paragraphs[1]), { text: paragraphs[1], from: 0 })
    expect(p.textContent).toBe('1\u00a0Wine is a mocker, and strong drink a brawler.')
    expect(p.querySelector(':scope > .lab-prose-join')).not.toBeNull()
  })

  it('lets pages break inside a verse run like any prose paragraph, losing no word', () => {
    const lengths = paragraphs.map(text => tokenizeHearingWords(text).length)
    const pages = measuredDesktopPages(lengths, segments => segments.reduce((n, s) => n + s.to - s.from, 0) <= 7, undefined, Infinity, paragraphs)
    expect(chapterPageSegments(pages[0]).map(s => s.paragraphIndex)).toEqual([0, 1])
    expect(chapterPageSegments(pages[0])[1].to).toBeLessThan(lengths[1])
    expect(chapterPagesCover(paragraphs, pages)).toBe(true)
  })
})
