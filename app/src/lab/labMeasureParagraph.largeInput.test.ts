// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { labMeasureParagraphInto } from './labMeasureParagraph'
import { labCapacitySample, LAB_CAPACITY_SAMPLE_WORDS } from './LabDesktopPaginator'

// A whole pasted book (Moby-Dick, ~215k words) measured as one paragraph threw
// "Maximum call stack size exceeded" from replaceChildren(...nodes) and opened blank.
describe('measuring a whole pasted book', () => {
  it('paints 150k words into one paragraph without spreading them as arguments', () => {
    const words = Array.from({ length: 150_000 }, (_, i) => ({ text: `w${i}` }))
    const p = document.createElement('p')
    expect(() => labMeasureParagraphInto(p, words)).not.toThrow()
    const painted = p.querySelectorAll('.lab-hearing-word')
    expect(painted.length).toBe(150_000)
    expect(painted[149_999].textContent).toContain('w149999')
  }, 60_000)

  it('samples a chapter for desktop capacity, keeping a short chapter whole', () => {
    const big = Array.from({ length: 3000 }, (_, i) => Array.from({ length: 70 }, (_, j) => `${i}.${j}`))
    const sample = labCapacitySample(big)
    expect(sample.length).toBe(LAB_CAPACITY_SAMPLE_WORDS)
    expect(sample[0]).toBe('0.0')
    expect(sample[70]).toBe('1.0')
    const small = [['a', 'b'], ['c']]
    expect(labCapacitySample(small)).toEqual(['a', 'b', 'c'])
  })
})
