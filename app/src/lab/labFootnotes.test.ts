import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { tokenizeHearingWords } from './labHearing'
import { hasFootnotes, loadFootnotes, parseFootnotes, placeFootnotes, type Footnote } from './labFootnotes'

const readJson = (path: string) => JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf8'))
const sidecar = () => readJson('public/data/footnotes/fear-and-trembling-modern-en.json')
const edition = () => readJson('public/data/editions/fear-and-trembling-modern-en.json') as { chapters: Array<{ number: number; paragraphs: string[] }> }

const note = (over: Partial<Footnote> = {}): Footnote => ({ id: 'n', chapter: 1, paragraph: 0, offset: 12, after: 'Hello world.', text: 'A note.', ...over })

afterEach(() => vi.unstubAllGlobals())

describe('footnote anchoring', () => {
  it('places a marker after the word the anchor follows', () => {
    const placed = placeFootnotes([note()], 1, ['Hello world. And on.'])
    expect(placed).toEqual([{ id: 'n', number: 1, paragraphIndex: 0, wordIndex: 1, text: 'A note.' }])
  })

  it('follows a closing quote to the word it belongs to', () => {
    const text = 'He said “stop.” Then left.'
    const after = 'He said “stop.”'
    expect(placeFootnotes([note({ offset: after.length, after })], 1, [text])[0].wordIndex).toBe(2)
  })

  it('re-finds the anchor words when the offset has drifted, and drops a note it cannot place', () => {
    const text = 'A new first sentence. Hello world. And on.'
    expect(placeFootnotes([note({ offset: 12 })], 1, [text])[0].wordIndex).toBe(5)
    expect(placeFootnotes([note({ after: 'Gone entirely.' })], 1, [text])).toEqual([])
    expect(placeFootnotes([note({ paragraph: 4 })], 1, [text])).toEqual([])
  })

  it('numbers a chapter notes in reading order and ignores other chapters', () => {
    const paragraphs = ['One two three.', 'Four five six.']
    const placed = placeFootnotes([
      note({ id: 'b', paragraph: 1, offset: 14, after: 'Four five six.' }),
      note({ id: 'other', chapter: 2, paragraph: 0, offset: 14, after: 'One two three.' }),
      note({ id: 'a', paragraph: 0, offset: 14, after: 'One two three.' }),
    ], 1, paragraphs)
    expect(placed.map(item => [item.id, item.number, item.paragraphIndex])).toEqual([['a', 1, 0], ['b', 2, 1]])
  })

  it('rejects malformed sidecar entries', () => {
    expect(parseFootnotes(null)).toEqual([])
    expect(parseFootnotes({ footnotes: [note(), { id: 'x' }, null, { ...note(), offset: 'a' }] })).toEqual([note()])
  })
})

describe('Fear and Trembling sidecar', () => {
  it('places all 18 notes on the served Modern English text, each after its own words', () => {
    const notes = parseFootnotes(sidecar())
    expect(notes).toHaveLength(18)
    let total = 0
    for (const chapter of edition().chapters) {
      const placed = placeFootnotes(notes, chapter.number, chapter.paragraphs)
      total += placed.length
      expect(placed.map(item => item.number)).toEqual(placed.map((_, index) => index + 1))
      for (const item of placed) {
        const source = notes.find(candidate => candidate.id === item.id)!
        const text = chapter.paragraphs[source.paragraph]
        // The offset is honoured as written, not recovered by search.
        expect(text.slice(0, source.offset).endsWith(source.after)).toBe(true)
        // The marker follows the last word of the anchor phrase.
        const last = source.after.split(/\s+/).pop()!
        expect(tokenizeHearingWords(text)[item.wordIndex].text).toContain(last)
        expect(item.text).toBe(source.text)
      }
    }
    expect(total).toBe(18)
  })
})

describe('footnote loading', () => {
  it('requests the sidecar only for an edition that has one', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => sidecar() }))
    vi.stubGlobal('fetch', fetchMock)
    expect(hasFootnotes('fear-and-trembling', 'modern-en')).toBe(true)
    expect(await loadFootnotes('moby-dick', 'modern-en')).toEqual([])
    expect(await loadFootnotes('fear-and-trembling', 'original-en')).toEqual([])
    expect(await loadFootnotes(undefined, 'modern-en')).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
    expect(await loadFootnotes('fear-and-trembling', 'modern-en')).toHaveLength(18)
    expect(fetchMock).toHaveBeenCalledWith('/data/footnotes/fear-and-trembling-modern-en.json')
  })
})
