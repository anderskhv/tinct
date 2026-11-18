import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  registerNewlineVerseLines,
  registerVerseLines,
  resetVerseLines,
  verseLineRanges,
  verseLineStarts,
  wordIndexAtOffset,
  type VerseLineSidecar,
} from './labVerseLines'
import { tokenizeHearingWords } from './labHearing'

const EDITIONS = resolve(__dirname, '../../public/data/editions')

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(resolve(EDITIONS, name), 'utf8')) as T
}

interface Edition {
  chapters: Array<{ number: number; paragraphs: string[] }>
}

const PLAYS = ['macbeth', 'hamlet'] as const

afterEach(resetVerseLines)

describe('wordIndexAtOffset', () => {
  it('counts the words before an offset', () => {
    const text = 'FIRST WITCH. When shall we three meet again? In thunder, lightning, or in rain?'
    expect(wordIndexAtOffset(text, 0)).toBe(0)
    expect(wordIndexAtOffset(text, 45)).toBe(8)
    expect(text.slice(45).startsWith('In thunder')).toBe(true)
  })
})

describe('registerVerseLines', () => {
  it('lineates a speech and leaves the speaker label on the first line', () => {
    const text = 'FIRST WITCH. When shall we three meet again? In thunder, lightning, or in rain?'
    registerVerseLines([text], { 0: [45] })
    expect([...verseLineStarts(text)!]).toEqual([8])
    expect(verseLineRanges(text, 0, 14)).toEqual([[0, 8], [8, 14]])
  })

  it('leaves prose alone', () => {
    registerVerseLines(['Here is a prose speech.'], {})
    expect(verseLineStarts('Here is a prose speech.')).toBeUndefined()
    expect(verseLineRanges('Here is a prose speech.', 0, 5)).toBeNull()
  })

  it('refuses an offset that does not land on a word boundary', () => {
    const text = 'FIRST WITCH. When shall we three meet again? In thunder.'
    registerVerseLines([text], { 0: [46] })
    expect(verseLineStarts(text)).toBeUndefined()
  })

  it('drops the lineation when one text is registered two different ways', () => {
    const text = 'One two three four'
    registerVerseLines([text], { 0: [8] })
    registerVerseLines([text], { 0: [4] })
    expect(verseLineStarts(text)).toBeUndefined()
  })

  it('splits a range that starts mid-line, as a page boundary does', () => {
    const text = 'FIRST WITCH. When shall we three meet again? In thunder, lightning, or in rain?'
    registerVerseLines([text], { 0: [45] })
    expect(verseLineRanges(text, 4, 14)).toEqual([[4, 8], [8, 14]])
  })
})

describe.each(PLAYS)('%s lineation sidecar', (bookId) => {
  const sidecar = readJson<VerseLineSidecar>(`${bookId}-lines.json`)
  const edition = readJson<Edition>(`${bookId}-original-en.json`)

  it('is built against the edition that is served', () => {
    expect(sidecar.bookId).toBe(bookId)
    expect(sidecar.edition).toBe('original-en')
  })

  it('reproduces every lineated paragraph byte for byte', () => {
    let lineated = 0
    for (const [number, paragraphs] of Object.entries(sidecar.chapters)) {
      const chapter = edition.chapters.find(item => item.number === Number(number))
      expect(chapter, `chapter ${number}`).toBeDefined()
      for (const [index, offsets] of Object.entries(paragraphs)) {
        const text = chapter!.paragraphs[Number(index)]
        expect(text, `${bookId} ch${number} p${index}`).toBeDefined()
        const pieces: string[] = []
        let previous = 0
        for (const offset of offsets) {
          pieces.push(text.slice(previous, offset - 1))
          previous = offset
        }
        pieces.push(text.slice(previous))
        // The whole point of a sidecar: removing the recovered breaks gives
        // back the served bytes, so cards, audio and positions cannot drift.
        expect(pieces.join(' ')).toBe(text)
        for (const piece of pieces) expect(piece.trim()).toBe(piece)
        lineated += 1
      }
    }
    expect(lineated).toBeGreaterThan(300)
  })

  it('breaks only between words, never inside one', () => {
    for (const [number, paragraphs] of Object.entries(sidecar.chapters)) {
      const chapter = edition.chapters.find(item => item.number === Number(number))!
      for (const [index, offsets] of Object.entries(paragraphs)) {
        const text = chapter.paragraphs[Number(index)]
        registerVerseLines(chapter.paragraphs, { [index]: offsets })
        const starts = verseLineStarts(text)
        expect(starts, `${bookId} ch${number} p${index}`).toBeDefined()
        const words = tokenizeHearingWords(text)
        for (const start of starts!) {
          expect(start).toBeGreaterThan(0)
          expect(start).toBeLessThan(words.length)
        }
      }
    }
  })

  it('never breaks a stage direction', () => {
    for (const [number, paragraphs] of Object.entries(sidecar.chapters)) {
      const chapter = edition.chapters.find(item => item.number === Number(number))!
      for (const index of Object.keys(paragraphs)) {
        const text = chapter.paragraphs[Number(index)]
        expect(text.startsWith('[') && text.endsWith(']')).toBe(false)
      }
    }
  })
})

describe('Hamlet prose', () => {
  it('leaves "What a piece of work is a man" unlineated', () => {
    const edition = readJson<Edition>('hamlet-original-en.json')
    const sidecar = readJson<VerseLineSidecar>('hamlet-lines.json')
    const found = edition.chapters.flatMap((chapter, chapterIndex) => chapter.paragraphs
      .map((text, index) => ({ chapter, chapterIndex, text, index }))
      .filter(item => item.text.includes('What a piece of work is man')))
    expect(found).toHaveLength(1)
    const { chapter, text, index } = found[0]
    expect(sidecar.chapters[String(chapter.number)]?.[String(index)]).toBeUndefined()
    registerVerseLines(chapter.paragraphs, sidecar.chapters[String(chapter.number)])
    expect(verseLineStarts(text)).toBeUndefined()
  })
})

describe('verse editions lineated by their own newlines', () => {
  afterEach(() => resetVerseLines())

  it('starts a line at the word after each newline, without touching the text', () => {
    const text = 'The man for wisdom’s various arts renown’d,\nLong exercised in woes, O Muse! resound;\nWho, when his arms'
    registerNewlineVerseLines([text])
    expect([...verseLineStarts(text)!]).toEqual([7, 14])
    expect(verseLineRanges(text, 0, 18)).toEqual([[0, 7], [7, 14], [14, 18]])
    expect(tokenizeHearingWords(text)).toHaveLength(18)
  })

  it('leaves a paragraph without newlines as prose', () => {
    const text = 'Telemachus in the assembly of the lords of Ithaca.'
    registerNewlineVerseLines([text])
    expect(verseLineStarts(text)).toBeUndefined()
  })

  it('keeps a long-lined prose argument flowing', () => {
    const text = `${'Telemachus with Pisistratus arriving at Sparta, is hospitably received by Menelaus. '.repeat(3)}\nIn the meantime the suitors consult to destroy Telemachus.`
    registerNewlineVerseLines([text])
    expect(verseLineStarts(text)).toBeUndefined()
  })

  it('lineates every Pope verse paragraph line for line', () => {
    const chapter = JSON.parse(readFileSync(resolve(__dirname, '../../public/data/editions-chapters/odyssey-verse-en/ch0001.json'), 'utf8')) as { paragraphs: string[] }
    registerNewlineVerseLines(chapter.paragraphs)
    expect(verseLineStarts(chapter.paragraphs[0])).toBeUndefined()
    for (const text of chapter.paragraphs.slice(1).filter(p => p.includes('\n'))) {
      const lines = text.split('\n').filter(line => line.trim()).length
      expect(verseLineStarts(text)!.size + 1).toBe(lines)
    }
  })
})
