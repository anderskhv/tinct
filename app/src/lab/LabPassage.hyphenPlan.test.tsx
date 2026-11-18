// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { LabPassage } from './LabPassage'
import { resetHyphenPlans, setHyphenPlanForTest } from './labHyphenPlan'

afterEach(() => { cleanup(); resetHyphenPlans() })

const text = 'The incandescence of the lamps was accompanied by a quiet hum.'
const page = { paragraphIndex: 0, from: 0, to: 11, segments: [{ paragraphIndex: 0, from: 0, to: 11 }] }
// "ac-" ended the previous page: this page opens on the word's tail.
const continued = { paragraphIndex: 0, from: 6, to: 11, segments: [{ paragraphIndex: 0, from: 6, to: 11, headBreak: 2 }] }

function painted(mode: 'reading' | 'hearing', readingPage: typeof page | typeof continued, playing = false, plannedHyphens = true) {
  const { container } = render(<LabPassage plannedHyphens={plannedHyphens} chapterTitle="One" paragraphs={[text]} compareParagraphs={[]} compare={false} mode={mode} playing={playing}
    follow={playing ? { kind: 'word', paragraphIndex: 0, wordIndex: 6 } : { kind: 'none' }} followParagraphs={[]} markedIndexes={new Set()} readingPage={readingPage} />)
  const line = container.querySelector('.lab-hearing-line')!
  const result = { plan: line.classList.contains('has-hyphen-plan'), syl: [...container.querySelectorAll('.lab-syl')].map(node => node.textContent) }
  cleanup()
  return result
}

describe('a planned hyphen on every paint of the page', () => {
  it('is the same while reading, while narration is prepared and while playing, so Play never moves a word', () => {
    setHyphenPlanForTest(text, new Map([[1, 8], [6, 2]]))
    const reading = painted('reading', page)
    expect(reading).toEqual({ plan: true, syl: ['incandes', 'ac'] })
    expect(painted('hearing', page)).toEqual(reading)
    expect(painted('hearing', page, true)).toEqual(reading)
  })

  it('is never drawn on a page the desktop paginator laid out (the browser hyphenates there)', () => {
    setHyphenPlanForTest(text, new Map([[1, 8], [6, 2]]))
    for (const [mode, playing] of [['reading', false], ['hearing', false], ['hearing', true]] as const) {
      expect(painted(mode, page, playing, false)).toEqual({ plan: false, syl: [] })
    }
  })

  it('never splits the tail of a word continued from the previous page', () => {
    setHyphenPlanForTest(text, new Map([[6, 2]]))
    for (const [mode, playing] of [['reading', false], ['hearing', false], ['hearing', true]] as const) {
      expect(painted(mode, continued, playing).syl).toEqual([])
    }
  })
})
