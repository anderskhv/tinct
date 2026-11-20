// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { PhonePassageBody } from './LabPhoneCards'
import type { LabAskTurn } from '../labAsk'
const question: LabAskTurn = { id: 'q', role: 'user', content: 'Explain this source.', source: 'typed' }
const answer: LabAskTurn = { id: 'a', role: 'assistant', content: 'A long answer beside the source. '.repeat(80), source: 'typed' }
const originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView')
afterEach(() => {
  cleanup()
  if (originalScroll) Object.defineProperty(Element.prototype, 'scrollIntoView', originalScroll)
  else delete (Element.prototype as Partial<Element>).scrollIntoView
})
it('never scrolls the source when a margin question or long answer arrives', () => {
  const scroll = vi.fn()
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scroll })
  const body = (turns: LabAskTurn[], pending: boolean) => <div className="source-margin-rail"><PhonePassageBody turns={turns} pending={pending} /></div>
  const view = render(body([], false))
  view.rerender(body([question], true))
  view.rerender(body([question, answer], false))
  expect(view.container.textContent).toContain('A long answer beside the source.')
  expect(scroll).not.toHaveBeenCalled()
})
it.each(['phone', 'paged companion'])('retains tail following for a %s card outside the source rail', () => {
  const scroll = vi.fn()
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scroll })
  const view = render(<PhonePassageBody turns={[]} pending={false} />)
  expect(scroll).not.toHaveBeenCalled()
  view.rerender(<PhonePassageBody turns={[question]} pending />)
  view.rerender(<PhonePassageBody turns={[question, answer]} pending={false} />)
  expect(scroll).toHaveBeenCalledTimes(2)
  expect(scroll).toHaveBeenLastCalledWith({ block: 'end' })
})
