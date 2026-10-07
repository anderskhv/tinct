// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { hyphenPlanClass, hyphenPlanFor, plannedBreak, planParagraph, resetHyphenPlans, setHyphenPlanForTest } from './labHyphenPlan'
import { appendPlannedWord, labMeasureParagraphInto } from './labMeasureParagraph'
import { tokenizeHearingWords } from './labHearing'

afterEach(resetHyphenPlans)

describe('a planned hyphen', () => {
  it('splits only the planned word, and never changes its text', () => {
    const text = 'The incandescence of lamps.'
    setHyphenPlanForTest(text, new Map([[1, 8]]))
    expect(plannedBreak(text, 1, 'incandescence')).toBe(8)
    expect(plannedBreak(text, 2, 'of')).toBeUndefined()
    // The tail of the word continued from the previous page is painted whole,
    // never split at the whole word's break (it moved words when Play repainted).
    expect(plannedBreak(text, 1, 'descence')).toBeUndefined()
    expect(hyphenPlanClass(text)).toBe(' has-hyphen-plan')
    // Compare columns paint without plans.
    expect(hyphenPlanClass(text, false)).toBe('')
    expect(hyphenPlanFor('Never planned.')).toBeNull()
    const p = labMeasureParagraphInto(document.createElement('p'), tokenizeHearingWords(text), { text, from: 0 }, { plans: true })
    expect(p.classList.contains('has-hyphen-plan')).toBe(true)
    const words = p.querySelectorAll('.lab-hearing-word')
    expect(words[1].querySelector('.lab-syl')?.textContent).toBe('incandes')
    expect(words[1].textContent).toBe('incandescence')
    expect(p.querySelectorAll('.lab-syl')).toHaveLength(1)
    expect(p.textContent).toBe(text)
  })

  it('never splits a word continued from the previous page in the measuring copy', () => {
    const text = 'The incandescence of lamps.'
    setHyphenPlanForTest(text, new Map([[1, 8]]))
    const words = tokenizeHearingWords(text).slice(1).map((word, index) => index === 0 ? { ...word, text: 'descence' } : word)
    const p = labMeasureParagraphInto(document.createElement('p'), words, { text, from: 1 }, { plans: true })
    expect(p.querySelector('.lab-syl')).toBeNull()
    expect(p.classList.contains('has-hyphen-plan')).toBe(true)
    expect(p.textContent).toBe('descence of lamps.')
  })

  it('is ignored where plans are not painted', () => {
    const text = 'The incandescence of lamps.'
    setHyphenPlanForTest(text, new Map([[1, 8]]))
    const p = labMeasureParagraphInto(document.createElement('p'), tokenizeHearingWords(text), { text, from: 0 })
    expect(p.querySelector('.lab-syl')).toBeNull()
    expect(p.classList.contains('has-hyphen-plan')).toBe(false)
  })

  it('keeps out-of-range breaks whole', () => {
    const host = document.createElement('span')
    appendPlannedWord(host, 'lamp', 0)
    appendPlannedWord(host, 'lamp', 4)
    expect(host.querySelector('.lab-syl')).toBeNull()
    expect(host.textContent).toBe('lamplamp')
  })
})

describe('choosing hyphens line by line', () => {
  /**
   * A fake column: every character 10px wide, a space 10px, a hyphen 10px,
   * lines 200px. `render` lays the words out greedily the way a browser does
   * with discretionary hyphens only at the planned breaks.
   */
  function column(words: string[]) {
    const p = document.createElement('p')
    document.body.append(p)
    const W = 200
    p.getBoundingClientRect = () => ({ left: 0, right: W, top: 0, bottom: 0, width: W, height: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
    const render = (plan: Map<number, number>) => {
      p.replaceChildren()
      let x = 0, line = 0
      words.forEach((word, index) => {
        const span = document.createElement('span')
        span.className = 'lab-hearing-word'
        span.textContent = word
        p.append(span)
        const width = word.length * 10
        const rect = (left: number, w: number, l: number) => ({ left, right: left + w, top: l * 30, bottom: l * 30 + 20, width: w, height: 20 })
        let rects
        const start = x === 0 ? 0 : x + 10
        if (start + width <= W) { rects = [rect(start, width, line)]; x = start + width }
        else {
          const at = plan.get(index)
          if (at != null && start + at * 10 + 10 <= W) {
            rects = [rect(start, at * 10 + 10, line), rect(0, (word.length - at) * 10, line + 1)]
            line += 1; x = (word.length - at) * 10
          } else { line += 1; rects = [rect(0, width, line)]; x = width }
        }
        span.getClientRects = () => rects as unknown as DOMRectList
      })
    }
    return { p, render }
  }

  it('hyphenates a loose line where the next word’s head fits, and only there', () => {
    // "aaaaa bbbbb cccc" fills 160 of 200px: justified, that is a 2em-wide gap.
    const words = ['aaaaa', 'bbbbb', 'cccc', 'dddddddddd', 'ee', 'ff']
    const { p, render } = column(words)
    const range = Document.prototype.createRange
    const box = HTMLElement.prototype.getBoundingClientRect
    // A probe span (a space, a hyphen) is its characters wide.
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) { return { width: (this.textContent || '').length * 10 } as DOMRect }
    // Range widths are the characters selected.
    document.createRange = () => {
      const r = range.call(document)
      r.getBoundingClientRect = () => ({ width: (r.endOffset - r.startOffset) * 10 }) as DOMRect
      return r
    }
    try {
      const plan = planParagraph(p, words.map(text => ({ text })), index => (index === 3 ? [2, 3, 6] : []), render, 0.55, 0.8)
      // Room 40px: "ddd-" (30 + 10 hyphen) after a space fits; "dddddd-" does not.
      expect([...plan]).toEqual([[3, 2]])
    } finally {
      document.createRange = range
      HTMLElement.prototype.getBoundingClientRect = box
      p.remove()
    }
  })

  it('reads on after each break: a second loose line in a row is hyphenated, never a third', () => {
    // Unplanned: "aaaa bbbb cccc" | "dddddddddddd eeee" | "gggggggggggg hhhh" | "iiiiiiiiiiii jj".
    const words = ['aaaa', 'bbbb', 'cccc', 'dddddddddddd', 'eeee', 'gggggggggggg', 'hhhh', 'iiiiiiiiiiii', 'jj']
    const { p, render } = column(words)
    const range = Document.prototype.createRange
    const box = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) { return { width: (this.textContent || '').length * 10 } as DOMRect }
    document.createRange = () => {
      const r = range.call(document)
      r.getBoundingClientRect = () => ({ width: (r.endOffset - r.startOffset) * 10 }) as DOMRect
      return r
    }
    try {
      const plan = planParagraph(p, words.map(text => ({ text })), index => ([3, 5, 7].includes(index) ? [3, 6, 9] : []), render, 0.55, 0.8)
      // "ddd-" closes the first line, "ggg-" the second (its tail line is
      // looser than 0.8em); the third line is as loose but would be a third in a row.
      expect([...plan]).toEqual([[3, 3], [5, 3]])
    } finally {
      document.createRange = range
      HTMLElement.prototype.getBoundingClientRect = box
      p.remove()
    }
  })
})
