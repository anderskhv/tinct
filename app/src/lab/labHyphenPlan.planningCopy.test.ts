// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { planHyphenation, resetHyphenPlans } from './labHyphenPlan'
import { labMeasureParagraphInto } from './labMeasureParagraph'
import { registerParagraphKinds } from './labParagraphStyle'
vi.mock('./labHyphenate', () => ({ hyphenatorReady: () => true, hyphenationBreaks: () => [] }))
afterEach(() => { vi.restoreAllMocks(); resetHyphenPlans(); document.body.replaceChildren() })

function host() {
  const element = document.createElement('div'); document.body.append(element)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 320, left: 0, right: 320, top: 0, bottom: 20, height: 20 } as DOMRect)
  return element
}

// The plan is made in one planning paragraph reused for the whole chapter. A
// list item's kind class (its 22px indent) stayed on it, so every paragraph
// after the first list item was planned in a narrower column than the page
// paints, and the planned breaks missed the real line ends (Bold Conjectures
// ch18, Anders, iPhone, 16 Nov 2026).
it('plans each paragraph in a bare planning copy, never in the previous paragraph\'s kind', () => {
  const paragraphs = [
    'Planning copy item: a list item set with its own indent before the prose.',
    'Planning copy prose: the paragraph after the list item is running prose.',
    'Planning copy prose again: a second paragraph of running prose follows.',
  ]
  registerParagraphKinds(paragraphs, ['item', null, null])
  const seen = new Map<string, string>()
  planHyphenation(host(), paragraphs, 'en', (p, words, text, plan) => {
    if (!seen.has(text)) seen.set(text, p.className)
    labMeasureParagraphInto(p, words, { text, from: 0 }, { plan })
  })
  expect(seen.size).toBe(3)
  for (const className of seen.values()) {
    expect(className.split(/\s+/).sort()).toEqual(['has-hyphen-plan', 'is-hyphen-planning', 'lab-hearing-line'])
  }
})

// A transcript turn paints its time and speaker in their own weight; the plan
// must be able to paint them too, so the paint is told which paragraph it is.
it('tells the paint which paragraph of the chapter it lays out', () => {
  const paragraphs = ['Index one: the first paragraph.', 'Index two: the second paragraph.', 'Index three: the third.']
  const indexes: Array<[string, number]> = []
  planHyphenation(host(), paragraphs, 'en', (p, words, text, plan, paragraphIndex) => {
    indexes.push([text, paragraphIndex])
    labMeasureParagraphInto(p, words, { text, from: 0 }, { plan })
  })
  expect(new Map(indexes)).toEqual(new Map(paragraphs.map((text, index) => [text, index])))
})
