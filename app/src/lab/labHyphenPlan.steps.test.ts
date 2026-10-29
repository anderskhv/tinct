// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { hyphenPlanFor, planHyphenation, planHyphenationSteps, resetHyphenPlans } from './labHyphenPlan'
import { labMeasureParagraphInto } from './labMeasureParagraph'
vi.mock('./labHyphenate', () => ({ hyphenatorReady: () => true, hyphenationBreaks: () => [] }))
afterEach(() => { vi.restoreAllMocks(); resetHyphenPlans(); document.body.replaceChildren() })
const paragraphs = ['A reader follows the first paragraph.', 'The second paragraph keeps every word.', 'The final paragraph remains present.']
const paint: Parameters<typeof planHyphenation>[3] = (p, words, text, plan) => { labMeasureParagraphInto(p, words, { text, from: 0 }, { plan }) }
function host() {
  const element = document.createElement('div'); document.body.append(element)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 320, left: 0, right: 320, top: 0, bottom: 20, height: 20 } as DOMRect)
  return element
}
it('yields between paragraphs and produces the same plans as uninterrupted planning', () => {
  const stage = host()
  const key = planHyphenation(stage, paragraphs, 'en', paint)
  const expected = paragraphs.map(text => [...hyphenPlanFor(text)!])
  resetHyphenPlans()
  const steps = planHyphenationSteps(stage, paragraphs, 'en', paint)
  expect(steps.next().done).toBe(false)
  expect(hyphenPlanFor(paragraphs[0])).not.toBeNull()
  expect(hyphenPlanFor(paragraphs[1])).toBeNull()
  let step = steps.next(); while (!step.done) step = steps.next()
  expect(step.value).toBe(key)
  expect(paragraphs.map(text => [...hyphenPlanFor(text)!])).toEqual(expected)
  expect(stage.childElementCount).toBe(0)
})
it('cleans up a cancelled measurement without planning the remaining source', () => {
  const stage = host()
  const steps = planHyphenationSteps(stage, paragraphs, 'en', paint)
  steps.next()
  expect(stage.querySelector('.is-hyphen-planning')).not.toBeNull()
  steps.return('')
  expect(stage.childElementCount).toBe(0)
  expect(hyphenPlanFor(paragraphs[1])).toBeNull()
  expect(planHyphenation(stage, paragraphs, 'en', paint)).not.toBe('')
  expect(hyphenPlanFor(paragraphs[2])).not.toBeNull()
})
