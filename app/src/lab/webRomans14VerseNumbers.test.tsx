// @vitest-environment jsdom

// WEB Romans 14 ends with the doxology the World English Bible numbers 14:24-26. The import wrote those three
// numbers as text, "(14:24)", "(14:25)", "(14:26)"; they are the edition's own verse numbers now (Anders, 27 Nov
// 2026; books/wip/romans-14-verse-numbers/HANDOFF.md). One word for one word, so no word index moved: a place or a
// highlight saved before the repair names the same words after it, and needs no coordinate map.
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { LabPassage } from './LabPassage'
import { isBareVerseMarker, isLabVerseMarker, labVerseMarkerDisplay, tokenizeHearingWords, type ChapterHearingPage } from './labHearing'
import { labVerseAtOrBefore } from './labCompare'
import { placeNeedsMigration } from './labContentMigration'
import { highlightNeedsMigration, highlightOffCurrentText } from './labHighlightContentMigration'
import { projectHighlight } from './labHighlightProjection'
import type { LabHighlight } from './labHighlights'
import { chunkNarrationText, narrationTokens, spokenText } from '../narration/narrationCore'

afterEach(cleanup)

interface Chapter { number: number; title: string; paragraphs: string[] }
const data = (path: string) => JSON.parse(readFileSync(resolve(process.cwd(), 'public/data', path), 'utf8'))
const edition = (key: string) => (data(`editions/bible-${key}.json`) as { chapters: Chapter[] }).chapters

const ROMANS_14 = 1060
const LAST = 4
/** Word indexes of the three numbers in the chapter's last paragraph, and the text that stood there. */
const NUMBERS = [[70, '24', '(14:24)'], [106, '25', '(14:25)'], [137, '26', '(14:26)']] as const
const AFTER = '²¹ It is good to not eat meat, drink wine, nor do anything by which your brother stumbles, is offended, or is made weak. ²² Do you have faith? Have it to yourself before God. Happy is he who doesn\'t judge himself in that which he approves. ²³ But he who doubts is condemned if he eats, because it isn\'t of faith; and whatever is not of faith is sin. ²⁴ Now to him who is able to establish you according to my Good News and the preaching of Jesus Christ, according to the revelation of the mystery which has been kept secret through long ages, ²⁵ but now is revealed, and by the Scriptures of the prophets, according to the commandment of the eternal God, is made known for obedience of faith to all the nations; ²⁶ to the only wise God, through Jesus Christ, to whom be the glory forever! Amen.'
const BEFORE = AFTER.replace('²⁴ Now', '(14:24) Now').replace('²⁵ but', '(14:25) but').replace('²⁶ to', '(14:26) to')

describe('WEB Romans 14: the doxology\'s verse numbers', () => {
  const web = edition('web-en')
  const chapter = web.find(item => item.number === ROMANS_14)!

  it('are verse numbers in the edition and in its chapter file, and nothing else in the chapter changed', () => {
    expect(chapter.title).toBe('Romans 14')
    expect(chapter.paragraphs).toHaveLength(5)
    expect(chapter.paragraphs[LAST]).toBe(AFTER)
    expect(data('editions-chapters/bible-web-en/ch1060.json')).toEqual({ number: ROMANS_14, title: 'Romans 14', paragraphs: chapter.paragraphs })
    const numbers = chapter.paragraphs.flatMap(text => tokenizeHearingWords(text).filter(word => isLabVerseMarker(word.text)).map(word => labVerseMarkerDisplay(word.text)))
    expect(numbers).toEqual(Array.from({ length: 26 }, (_, index) => String(index + 1)))
  })

  it('keep every word where it was: one word replaced by one word, three times', () => {
    const before = tokenizeHearingWords(BEFORE).map(word => word.text)
    const after = tokenizeHearingWords(AFTER).map(word => word.text)
    expect(after).toHaveLength(153)
    expect(before).toHaveLength(153)
    const changed = after.flatMap((word, index) => (word === before[index] ? [] : [[index, labVerseMarkerDisplay(word), before[index]]]))
    expect(changed).toEqual(NUMBERS.map(row => [...row]))
    // A place saved on a word of the doxology reads the same words; it now sits in verse 24, not 23.
    expect(after.slice(71, 76).join(' ')).toBe('Now to him who is')
    expect(before.slice(71, 76).join(' ')).toBe('Now to him who is')
    expect(labVerseAtOrBefore(tokenizeHearingWords(BEFORE), 71)).toBe('23')
    expect(labVerseAtOrBefore(tokenizeHearingWords(AFTER), 71)).toBe('24')
    // Each number opens text, so the reader draws it (a number with no text after it is not drawn).
    for (const [index] of NUMBERS) expect(isBareVerseMarker(AFTER, index)).toBe(false)
  })

  it('are drawn as verse numbers, 21 to 26, with no bracketed reference left', () => {
    const paragraphs = chapter.paragraphs
    const segments = [{ paragraphIndex: LAST, from: 0, to: tokenizeHearingWords(paragraphs[LAST]).length }]
    const readingPage: ChapterHearingPage = { ...segments[0], segments }
    const { container } = render(<LabPassage
      chapterTitle="Romans 14" paragraphs={paragraphs} compareParagraphs={[]} compare={false} mode="reading"
      follow={{ kind: 'none' }} followParagraphs={paragraphs.map((text, index) => ({ index, text }))}
      markedIndexes={new Set<number>()} readingPage={readingPage}
    />)
    expect([...container.querySelectorAll('.lab-verse-mark')].map(mark => mark.textContent)).toEqual(['21', '22', '23', '24', '25', '26'])
    expect(container.textContent).not.toMatch(/\(14:|\d+:\d+/)
    const words = [...container.querySelectorAll('[data-testid="lab-word"]')]
    expect(words.map(word => Number(word.getAttribute('data-word-index')))).toEqual(Array.from({ length: 153 }, (_, index) => index))
  })

  it('leave a place and a highlight saved before the repair alone: no content release, no map to wait for', () => {
    const written = Date.parse('2026-11-01T00:00:00Z')
    // The Bible keeps one place per biblical book, in the edition's running chapter numbers.
    const place = { bookId: 'romans', headerBook: 'Romans', chapterNumber: 14, sequentialChapter: ROMANS_14, paragraphIndex: LAST, wordIndex: 71, primaryEditionKey: 'web-en', updatedAt: written, deviceId: 'reader', rev: 3 }
    expect(placeNeedsMigration(place)).toBe(false)
    const highlight = { id: `hl-${written}-a`, bookId: 'bible', editionKey: 'web-en', chapterNumber: ROMANS_14, paragraphIndex: LAST, endParagraphIndex: LAST, fromWord: 69, toWord: 76, color: 'gold' as const, text: 'sin. (14:24) Now to him who is' }
    expect(highlightNeedsMigration(highlight)).toBe(false)
    expect(highlightOffCurrentText(highlight)).toBe(false)
    expect(tokenizeHearingWords(AFTER).slice(highlight.fromWord, highlight.toWord).map(word => word.text).join(' ')).toBe('sin. ²⁴ Now to him who is')
  })

  it('make the doxology verses 24-26 to the other editions: a highlight there no longer lands on the King James verse 23', () => {
    const mark = { id: 'hl-1790000000000-a', chapterNumber: ROMANS_14, paragraphIndex: LAST, endParagraphIndex: LAST, fromWord: 71, toWord: 76, color: 'gold' as const }
    const kjv = edition('kjv-en').find(item => item.number === ROMANS_14)!.paragraphs
    const webc = edition('webc-en').find(item => item.number === ROMANS_14)!.paragraphs
    const shown = (target: string[], found: LabHighlight | null) => found && tokenizeHearingWords(target[found.paragraphIndex]).slice(found.fromWord, found.toWord).map(word => word.text).join(' ')
    // As it was, the doxology counted as the rest of verse 23, so the King James showed its own verse 23 marked.
    const old = [...chapter.paragraphs.slice(0, LAST), BEFORE]
    expect(shown(kjv, projectHighlight(mark, old, kjv, true))).toMatch(/^²³ And he that doubteth is damned/)
    // The King James has no 14:24-26 (its doxology is 16:25-27): nothing unrelated is marked.
    expect(projectHighlight(mark, chapter.paragraphs, kjv, true)).toBeNull()
    // The Catholic edition has the same words at 14:24.
    expect(shown(webc, projectHighlight(mark, chapter.paragraphs, webc, true))).toBe('Now to him who is')
  })

  it('are not read aloud: the narrator is sent the doxology without its numbers', () => {
    expect(narrationTokens(AFTER)).toHaveLength(narrationTokens(BEFORE).length)
    expect(spokenText(narrationTokens(BEFORE))).toContain('(14:24) Now to him')
    expect(spokenText(narrationTokens(AFTER))).not.toMatch(/\d/)
    // Verses 21-23 are spoken in the same two pieces as before, so their recordings are reused.
    const pieces = (text: string) => chunkNarrationText(text).map(chunk => [chunk.wordFrom, chunk.wordTo, chunk.text])
    expect(pieces(AFTER).slice(0, 2)).toEqual(pieces(BEFORE).slice(0, 2))
    expect(pieces(AFTER)[1][1]).toBe(70)
  })
})

describe('no Bible edition writes a verse reference as text', () => {
  it.each(['web-en', 'webc-en', 'kjv-en', 'bsb-en'])('%s has no "(chapter:verse)" in its text', (key) => {
    const found = edition(key).flatMap(item => item.paragraphs.flatMap((text, index) => (/[([]\d+:\d+[)\]]/.test(text) ? [`${item.title} ${index}`] : [])))
    expect(found).toEqual([])
  }, 60_000)

  it('the Catholic edition, which had the numbers right, reads the same doxology', () => {
    const webc = edition('webc-en').find(item => item.number === ROMANS_14)!
    expect(webc.title).toBe('Romans 14')
    expect(AFTER.endsWith(webc.paragraphs[webc.paragraphs.length - 1])).toBe(true)
  })
})
