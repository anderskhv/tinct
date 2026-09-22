// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { BOOKS } from '../data/bookRegistry'
import { renderWordGroups } from './LabPassage'
import { tokenizeHearingWords } from './labHearing'
import { labMeasureParagraphInto } from './labMeasureParagraph'
import { presentationLineRanges, registerShakespeareSpeakers, registerVerseLines, resetVerseLines, shakespeareSpeakerWords, verseLineStarts, verseSpeakerWords, isInternalVerseBreak } from './labVerseLines'

afterEach(() => { cleanup(); resetVerseLines() })
const cases: Array<[string, number]> = [
  ['HORATIO. Not when I saw’t.', 1],
  ['HAMLET. His beard was grizzled, no?', 1],
  ['MARCELLUS and BARNARDO.', 3],
  ['MACBETH, LENNOX. What’s the matter?', 2],
  ['FIRST and SECOND SERVINGMAN. Where is he?', 4],
  ['_Mrs Page._ What is the matter?', 2],
  ['_Page, Shal., and Slen._ Good even and twenty.', 4],
  ['_Shal., Page, &c._ Well met.', 3],
  ['_Ford._. I am blest in your acquaintance.', 1],
  ['CLEOMENES The climate’s delicate; the air most sweet.', 1],
  ['ALL PEOPLE Tear him to pieces!', 2],
]
describe('Shakespeare speakers independent of verse metadata', () => {
  it.each(cases)('preserves indexed words and measurement for %s', (text, count) => {
    expect(verseSpeakerWords(text)).toBe(0)
    registerShakespeareSpeakers([text])
    expect(shakespeareSpeakerWords(text)).toBe(count)
    expect(verseLineStarts(text)).toBeUndefined()
    const words = tokenizeHearingWords(text)
    const { container } = render(<p>{renderWordGroups(words, (word, index, spacing) => <span data-word={index}>{spacing}{word.text}</span>, { text, from: 0 })}</p>)
    const measured = labMeasureParagraphInto(document.createElement('p'), words, { text, from: 0 })
    expect(container.querySelectorAll('.lab-verse-speaker [data-word]')).toHaveLength(count)
    expect(container.querySelectorAll('[data-word]')).toHaveLength(words.length)
    expect(container.querySelectorAll('.lab-verse-line, .lab-verse-break')).toHaveLength(0)
    expect(measured.querySelector('.lab-verse-speaker')?.textContent?.trim()).toBe(container.querySelector('.lab-verse-speaker')?.textContent?.trim())
    if (words.length > count) {
      const continuation = labMeasureParagraphInto(document.createElement('p'), words.slice(count), { text, from: count })
      expect(continuation.querySelector('.lab-verse-speaker')).toBeNull()
    }
  })
  it('formats the embedded joint speaker from the reported screenshot without changing text or adding a verse dot', () => {
    const text = 'HORATIO. While one with moderate haste might tell a hundred. MARCELLUS and BARNARDO. Longer, longer.'
    registerShakespeareSpeakers([text])
    registerVerseLines([text], { 0: [text.indexOf('MARCELLUS')] })
    const words = tokenizeHearingWords(text)
    const { container } = render(<p>{renderWordGroups(words, (word, index, spacing) => <span data-word={index}>{spacing}{word.text}</span>, { text, from: 0 })}</p>)
    expect([...container.querySelectorAll('.lab-verse-speaker')].map(n => n.textContent?.trim())).toEqual(['HORATIO.', 'MARCELLUS and BARNARDO.'])
    expect(container.textContent).toBe(text)
    expect([...container.querySelectorAll('[data-word]')].map(n => Number(n.getAttribute('data-word')))).toEqual(words.map((_, i) => i))
    expect(isInternalVerseBreak(text, 10)).toBe(false)
    const measured = labMeasureParagraphInto(document.createElement('p'), words, { text, from: 0 })
    expect([...measured.querySelectorAll('.lab-verse-speaker')].map(n => n.textContent?.trim())).toEqual(['HORATIO.', 'MARCELLUS and BARNARDO.'])
  })
  it.each(['[Enter Hamlet.]', '_Enter JUSTICE SHALLOW, SLENDER, and SIR HUGH EVANS._', 'ACT II. SCENE I.', 'SONG.', 'EPILOGUE.', 'Longer, longer.', '_Do me right, And dub me knight._'])('leaves directions and dialogue alone: %s', text => {
    registerShakespeareSpeakers([text])
    expect(verseSpeakerWords(text)).toBe(0)
    expect(presentationLineRanges(text, 0, 10)).toBeNull()
  })
  for (const book of BOOKS.filter(book => book.author === 'William Shakespeare')) {
    for (const edition of book.editions.filter(edition => edition.language === 'en')) {
      it(`audits all paragraphs in ${book.id}/${edition.key}`, () => {
        const data = JSON.parse(readFileSync(`public/data/editions/${book.id}-${edition.key}.json`, 'utf8'))
        const paragraphs: string[] = data.chapters.flatMap((chapter: { paragraphs: string[] }) => chapter.paragraphs)
        registerShakespeareSpeakers(paragraphs)
        const labels = paragraphs.filter(text => shakespeareSpeakerWords(text))
        expect(labels.length).toBeGreaterThan(100)
        for (const text of labels) {
          const words = tokenizeHearingWords(text)
          expect(verseSpeakerWords(text)).toBeGreaterThan(0)
          expect(verseSpeakerWords(text)).toBeLessThanOrEqual(words.length)
          const ranges = presentationLineRanges(text, 0, words.length)!
          expect(ranges[0][0]).toBe(0)
          expect(ranges.at(-1)?.[1]).toBe(words.length)
          for (let i = 1; i < ranges.length; i++) expect(ranges[i][0]).toBe(ranges[i - 1][1])
          expect(verseLineStarts(text)).toBeUndefined()
        }
      })
    }
  }
})
