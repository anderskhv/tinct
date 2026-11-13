// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { continuousViewportWords } from './ContinuousReader'
import { chapterWords, type WordGeometry } from './bookScrollWords'

/**
 * A chapter of words laid out in content coordinates: lines of twelve words, a paragraph gap every eight lines, a raised
 * verse number now and then (a line's words do not all share one top), a tall figure and a few words with no height.
 */
function chapter(count: number) {
  const host = document.createElement('div')
  const block = document.createElement('section')
  host.append(block)
  let scrollTop = 0
  Object.defineProperty(host, 'scrollTop', { get: () => scrollTop, set: value => { scrollTop = value } })
  host.getBoundingClientRect = () => ({ top: 0, bottom: 900, left: 0, right: 800, height: 900, width: 800, x: 0, y: 0, toJSON: () => ({}) })
  const layout: { top: number; height: number }[] = []
  let y = 40
  for (let index = 0; index < count; index++) {
    const line = Math.floor(index / 12)
    if (index % 12 === 0 && index > 0) y += 30 + (line % 8 === 0 ? 20 : 0)
    const figure = index === 600
    if (figure) y += 30
    const raised = index % 97 === 0
    layout.push({ top: y - (raised ? 4 : 0), height: index % 251 === 0 ? 0 : figure ? 320 : raised ? 18 : 26 })
    if (figure) y += 320
    const word = document.createElement('span')
    word.setAttribute('data-testid', 'lab-word')
    word.dataset.paragraphIndex = String(Math.floor(index / 96))
    word.dataset.wordIndex = String(index % 96)
    word.getBoundingClientRect = () => {
      const { top, height } = layout[index]
      return { top: top - scrollTop, bottom: top + height - scrollTop, height, left: 0, right: 10, width: 10, x: 0, y: top - scrollTop, toJSON: () => ({}) }
    }
    block.append(word)
  }
  const all = (): WordGeometry[] => layout.map(({ top, height }, index) => ({
    node: block.children[index] as HTMLElement, top, bottom: top + height, height,
    anchor: { paragraphIndex: Math.floor(index / 96), wordIndex: index % 96 },
  }))
  return { host, block, all, end: y + 30, setScroll: (value: number) => { scrollTop = value } }
}

const place = (word: WordGeometry | undefined) => word ? `${word.anchor.paragraphIndex}:${word.anchor.wordIndex}` : null

describe('a chapter\'s words, measured where they are asked about', () => {
  it('finds the same first and last words on screen as measuring every word, anywhere in the chapter', () => {
    const { host, block, all, end, setScroll } = chapter(3000)
    const full = all()
    for (const height of [900, 640]) {
      for (let scrollTop = -200; scrollTop < end + 400; scrollTop += 97) {
        setScroll(scrollTop)
        const words = chapterWords(host, block)
        const expected = continuousViewportWords(full, scrollTop, height)
        const got = words.viewport(scrollTop, height)
        expect([place(got.first), place(got.last), got.hasInk], `at ${scrollTop}`).toEqual([place(expected.first), place(expected.last), expected.hasInk])
      }
    }
  }, 30000)

  it('measures a few hundred words for a screen, not the chapter', () => {
    const { host, block, setScroll } = chapter(3000)
    let measured = 0
    for (const word of block.children) {
      const rect = (word as HTMLElement).getBoundingClientRect
      ;(word as HTMLElement).getBoundingClientRect = () => { measured++; return rect() }
    }
    setScroll(20000)
    chapterWords(host, block).viewport(20000, 900)
    expect(measured).toBeGreaterThan(0)
    expect(measured).toBeLessThan(700)
  })

  it('keeps a measured word as one object, so the last word on screen can be compared with the chapter\'s last', () => {
    const { host, block, end, setScroll } = chapter(400)
    setScroll(end - 600)
    const words = chapterWords(host, block)
    const { last } = words.viewport(end - 600, 900)
    expect(last).toBe(words.at(words.length - 1))
  })

  it('finds a word by its place without measuring it first', () => {
    const { host, block } = chapter(3000)
    const words = chapterWords(host, block)
    expect(place(words.find({ paragraphIndex: 17, wordIndex: 41 }))).toBe('17:41')
    expect(words.find({ paragraphIndex: 17, wordIndex: 96 })).toBeUndefined()
    expect(words.find({ paragraphIndex: 40, wordIndex: 0 })).toBeUndefined()
  })
})
