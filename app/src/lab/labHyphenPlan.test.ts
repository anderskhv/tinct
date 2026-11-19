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

  it('moves a verse number up with the head of its word, never alone (Nehemiah 12:6, “⁶ She-”)', () => {
    // A fake column as above, but word 3 is a verse number welded to word 4
    // the way the reader paints it: "⁶", then a no-break space inside the
    // next word's span, then the word. The pair moves as one unless word 4
    // has a planned break whose head fits.
    const words = ['aaaaa', 'bbbbb', 'cc', '⁶', 'dddddddddd', 'ee', 'ff']
    const p = document.createElement('p')
    document.body.append(p)
    const W = 200
    p.getBoundingClientRect = () => ({ left: 0, right: W, top: 0, bottom: 0, width: W, height: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
    const rect = (left: number, w: number, l: number) => ({ left, right: left + w, top: l * 30, bottom: l * 30 + 20, width: w, height: 20 })
    const render = (plan: Map<number, number>) => {
      p.replaceChildren()
      let x = 0, line = 0
      for (let index = 0; index < words.length; index += 1) {
        const start = x === 0 ? 0 : x + 10
        if (index === 3) {
          const mark = document.createElement('span')
          mark.className = 'lab-hearing-word'
          mark.textContent = words[3]
          const word = document.createElement('span')
          word.className = 'lab-hearing-word'
          word.append(document.createTextNode(' '), document.createTextNode(words[4]))
          p.append(mark, word)
          const whole = 20 + words[4].length * 10
          const at = plan.get(4)
          let markRect, wordRects
          if (start + whole <= W) { markRect = rect(start, 10, line); wordRects = [rect(start + 10, whole - 10, line)]; x = start + whole }
          else if (at != null && start + 20 + at * 10 + 10 <= W) {
            markRect = rect(start, 10, line)
            wordRects = [rect(start + 10, 10 + at * 10 + 10, line), rect(0, (words[4].length - at) * 10, line + 1)]
            line += 1; x = (words[4].length - at) * 10
          } else { line += 1; markRect = rect(0, 10, line); wordRects = [rect(10, whole - 10, line)]; x = whole }
          mark.getClientRects = () => [markRect] as unknown as DOMRectList
          word.getClientRects = () => wordRects as unknown as DOMRectList
          index += 1
          continue
        }
        const span = document.createElement('span')
        span.className = 'lab-hearing-word'
        span.textContent = words[index]
        p.append(span)
        const width = words[index].length * 10
        let rects: ReturnType<typeof rect>[]
        if (start + width <= W) { rects = [rect(start, width, line)]; x = start + width }
        else { line += 1; rects = [rect(0, width, line)]; x = width }
        span.getClientRects = () => rects as unknown as DOMRectList
      }
    }
    const range = Document.prototype.createRange
    const box = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) { return { width: (this.textContent || '').length * 10 } as DOMRect }
    // A range from before the verse number covers it (10px) and the no-break space (10px).
    document.createRange = () => {
      const r = range.call(document)
      r.getBoundingClientRect = () => ({ width: r.startContainer === p ? 20 + r.endOffset * 10 : (r.endOffset - r.startOffset) * 10 }) as DOMRect
      return r
    }
    const asked: number[] = []
    try {
      const plan = planParagraph(p, words.map(text => ({ text })), index => { asked.push(index); return index === 4 ? [2, 3, 6] : [] }, render, 0.55, 0.8)
      // Room 60px after "cc": " ⁶ dd-" is 10 + 20 + 20 + 10. " ⁶ ddd-" is not.
      expect([...plan]).toEqual([[4, 2]])
      expect(asked).not.toContain(3)
      // The verse number moved up with the head: it is never left alone at a line end.
      expect(p.querySelectorAll('.lab-hearing-word')[3].getClientRects()[0].top).toBe(0)
      expect(p.querySelectorAll('.lab-hearing-word')[4].getClientRects()[0].top).toBe(0)
    } finally {
      document.createRange = range
      HTMLElement.prototype.getBoundingClientRect = box
      p.remove()
    }
  })
})
